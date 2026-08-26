import { Request, Response } from 'express';
import { Project, IProject } from '../models/Project.js';
import { MLServiceClient } from '../services/mlClient.js';
import { Anomaly } from '../models/Anomaly.js';
import { AuditService } from '../services/auditService.js';
import { ReportGenerator } from '../services/reportGenerator.js';

export async function getProjects(req: Request, res: Response): Promise<void> {
  const {
    page = '1',
    limit = '15',
    search = '',
    state,
    district,
    category,
    contractor,
    riskLevel,
    status,
    financialYear,
    minCost,
    maxCost,
    minRisk,
    maxRisk,
    sortBy = 'riskScore',
    sortOrder = 'desc',
  } = req.query;

  const pageNum = Math.max(1, parseInt(page as string, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10)));
  const skip = (pageNum - 1) * limitNum;

  const filter: any = {};

  if (search) {
    const q = (search as string).trim();
    filter.$or = [
      { projectId: { $regex: q, $options: 'i' } },
      { title: { $regex: q, $options: 'i' } },
      { contractorName: { $regex: q, $options: 'i' } },
      { district: { $regex: q, $options: 'i' } },
      { state: { $regex: q, $options: 'i' } },
    ];
  }

  if (state && state !== 'ALL') filter.state = state;
  if (district && district !== 'ALL') filter.district = district;
  if (category && category !== 'ALL') filter.category = category;
  if (contractor && contractor !== 'ALL') filter.contractorName = contractor;
  if (riskLevel && riskLevel !== 'ALL') filter.riskLevel = riskLevel;
  if (status && status !== 'ALL') filter.status = status;
  if (financialYear && financialYear !== 'ALL') filter.financialYear = financialYear;

  if (minCost || maxCost) {
    filter.allocatedAmount = {};
    if (minCost) filter.allocatedAmount.$gte = parseFloat(minCost as string);
    if (maxCost) filter.allocatedAmount.$lte = parseFloat(maxCost as string);
  }

  if (minRisk || maxRisk) {
    filter.riskScore = {};
    if (minRisk) filter.riskScore.$gte = parseFloat(minRisk as string);
    if (maxRisk) filter.riskScore.$lte = parseFloat(maxRisk as string);
  }

  const sortDirection = sortOrder === 'asc' ? 1 : -1;
  const sortOptions: any = {};
  sortOptions[sortBy as string] = sortDirection;

  const [projects, total] = await Promise.all([
    Project.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .select('-__v'),
    Project.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: {
      projects,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    },
  });
}

export async function getProjectById(req: Request, res: Response): Promise<void> {
  const id = req.params.id as string;

  const project = await Project.findOne({
    $or: [{ projectId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : undefined }],
  });

  if (!project) {
    res.status(404).json({
      success: false,
      error: { code: 'PROJECT_NOT_FOUND', message: `Project '${id}' not found` },
    });
    return;
  }

  // Calculate peer statistics in same category & district
  const peerStats = await Project.aggregate([
    { $match: { district: project.district, category: project.category } },
    {
      $group: {
        _id: null,
        peerCount: { $sum: 1 },
        avgCost: { $avg: '$allocatedAmount' },
        minCost: { $min: '$allocatedAmount' },
        maxCost: { $max: '$allocatedAmount' },
        avgProgress: { $avg: '$progress' },
      },
    },
  ]);

  // Contractor profile summary
  const contractorHistory = await Project.aggregate([
    { $match: { contractorName: project.contractorName } },
    {
      $group: {
        _id: null,
        totalWorks: { $sum: 1 },
        totalValue: { $sum: '$allocatedAmount' },
        highRiskWorks: { $sum: { $cond: [{ $in: ['$riskLevel', ['HIGH', 'CRITICAL']] }, 1, 0] } },
      },
    },
  ]);

  res.json({
    success: true,
    data: {
      project,
      peerComparison: {
        peerCount: peerStats[0]?.peerCount || 1,
        peerAvgCost: Math.round(peerStats[0]?.avgCost || project.allocatedAmount),
        costRatio: peerStats[0]?.avgCost ? Number(((project.allocatedAmount / peerStats[0].avgCost)).toFixed(2)) : 1.0,
        peerMinCost: peerStats[0]?.minCost || project.allocatedAmount,
        peerMaxCost: peerStats[0]?.maxCost || project.allocatedAmount,
      },
      contractorProfile: {
        name: project.contractorName,
        totalWorks: contractorHistory[0]?.totalWorks || 1,
        totalValue: contractorHistory[0]?.totalValue || project.allocatedAmount,
        highRiskWorks: contractorHistory[0]?.highRiskWorks || (project.riskLevel === 'HIGH' ? 1 : 0),
      },
    },
  });
}

export async function exportProjectsCSV(req: Request, res: Response): Promise<void> {
  const { state, district, riskLevel, category } = req.query;
  const filter: any = {};
  if (state && state !== 'ALL') filter.state = state;
  if (district && district !== 'ALL') filter.district = district;
  if (riskLevel && riskLevel !== 'ALL') filter.riskLevel = riskLevel;
  if (category && category !== 'ALL') filter.category = category;

  const projects = await Project.find(filter).sort({ riskScore: -1 }).limit(1000);
  const csvContent = ReportGenerator.generateProjectCSV(projects);

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="mplad_projects_export.csv"');
  res.send(csvContent);
}

export async function runAnalysis(req: Request, res: Response): Promise<void> {
  const { projectIds } = req.body;
  const filter = projectIds && projectIds.length > 0 ? { projectId: { $in: projectIds } } : {};

  const projects = await Project.find(filter).limit(1000);
  if (projects.length === 0) {
    res.status(400).json({ success: false, error: { code: 'NO_PROJECTS', message: 'No projects match query for analysis' } });
    return;
  }

  const analysis = await MLServiceClient.analyzeProjects(projects);

  // Bulk update MongoDB projects and update anomaly catalog
  const anomalyDocs: any[] = [];

  for (const r of analysis.results) {
    await Project.updateOne(
      { projectId: r.projectId },
      {
        $set: {
          riskScore: r.overallRiskScore,
          riskLevel: r.riskLevel,
          confidenceScore: r.confidenceScore,
          signals: r.signals,
          similarProjects: r.similarProjects,
          dimensionScores: r.dimensionScores,
          recommendation: r.recommendation,
          lastAnalyzedAt: new Date(),
        },
      }
    );

    // Save flagged anomalies
    for (const s of r.signals) {
      anomalyDocs.push({
        anomalyId: `ANOM-${r.projectId}-${s.ruleId}`,
        projectId: r.projectId,
        projectTitle: projects.find((p) => p.projectId === r.projectId)?.title || '',
        state: projects.find((p) => p.projectId === r.projectId)?.state || '',
        district: projects.find((p) => p.projectId === r.projectId)?.district || '',
        category: projects.find((p) => p.projectId === r.projectId)?.category || '',
        contractorName: projects.find((p) => p.projectId === r.projectId)?.contractorName || '',
        dimension: s.dimension,
        ruleId: s.ruleId,
        signal: s.signal,
        severity: s.severity,
        score: r.overallRiskScore,
        explanation: s.explanation,
        supportingValue: s.supportingValue,
      });
    }
  }

  if (anomalyDocs.length > 0) {
    // Upsert anomalies
    for (const a of anomalyDocs) {
      await Anomaly.updateOne({ anomalyId: a.anomalyId }, { $set: a }, { upsert: true });
    }
  }

  if (req.user) {
    await AuditService.logAction(
      req.user,
      'RUN_AI_ANALYSIS',
      'Project',
      `Triggered AI anomaly scan on ${projects.length} projects. Flagged ${analysis.results.filter((x) => x.riskLevel === 'HIGH' || x.riskLevel === 'CRITICAL').length} high-risk projects.`
    );
  }

  res.json({
    success: true,
    data: {
      totalAnalyzed: projects.length,
      highRiskDetected: analysis.results.filter((x) => x.riskLevel === 'HIGH' || x.riskLevel === 'CRITICAL').length,
      metrics: analysis.metrics,
    },
  });
}
