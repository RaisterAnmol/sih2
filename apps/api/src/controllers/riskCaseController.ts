import { Request, Response } from 'express';
import { RiskCase, CaseStatus } from '../models/RiskCase.js';
import { Project } from '../models/Project.js';
import { AuditService } from '../services/auditService.js';

export async function getRiskCases(req: Request, res: Response): Promise<void> {
  const { status, priority, state, district, search = '', page = '1', limit = '15' } = req.query;

  const pageNum = Math.max(1, parseInt(page as string, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10)));
  const skip = (pageNum - 1) * limitNum;

  const filter: any = {};
  if (status && status !== 'ALL') filter.status = status;
  if (priority && priority !== 'ALL') filter.priority = priority;
  if (state && state !== 'ALL') filter.state = state;
  if (district && district !== 'ALL') filter.district = district;

  if (search) {
    const q = (search as string).trim();
    filter.$or = [
      { caseId: { $regex: q, $options: 'i' } },
      { projectId: { $regex: q, $options: 'i' } },
      { projectTitle: { $regex: q, $options: 'i' } },
      { contractorName: { $regex: q, $options: 'i' } },
    ];
  }

  const [cases, total] = await Promise.all([
    RiskCase.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
    RiskCase.countDocuments(filter),
  ]);

  const statusSummary = await RiskCase.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  res.json({
    success: true,
    data: {
      cases,
      statusSummary: Object.fromEntries(statusSummary.map((s) => [s._id, s.count])),
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    },
  });
}

export async function createRiskCase(req: Request, res: Response): Promise<void> {
  const { projectId, priority = 'HIGH', initialNote, assignedToEmail, assignedToName } = req.body;

  const project = await Project.findOne({ projectId });
  if (!project) {
    res.status(404).json({ success: false, error: { code: 'PROJECT_NOT_FOUND', message: 'Project not found' } });
    return;
  }

  // Check if active case already exists
  const existing = await RiskCase.findOne({ projectId, status: { $in: ['OPEN', 'UNDER_REVIEW', 'ESCALATED'] } });
  if (existing) {
    res.status(400).json({
      success: false,
      error: { code: 'CASE_ALREADY_EXISTS', message: `Active case ${existing.caseId} already exists for this project` },
    });
    return;
  }

  const count = await RiskCase.countDocuments();
  const caseId = `CASE-2024-${project.state.substring(0, 2).toUpperCase()}-${String(count + 1).padStart(4, '0')}`;

  const notes = [];
  if (initialNote && req.user) {
    notes.push({
      noteId: `NOTE-${Date.now()}`,
      authorEmail: req.user.email,
      authorName: req.user.name,
      authorRole: req.user.role,
      content: initialNote,
      createdAt: new Date(),
    });
  }

  const newCase = await RiskCase.create({
    caseId,
    projectId: project.projectId,
    projectTitle: project.title,
    category: project.category,
    state: project.state,
    district: project.district,
    contractorName: project.contractorName,
    allocatedAmount: project.allocatedAmount,
    riskScore: project.riskScore,
    priority,
    status: 'OPEN',
    assignedToEmail,
    assignedToName,
    initialFlagReasons: project.signals?.map((s) => s.signal) || ['Manual auditor risk flag'],
    notes,
  });

  if (req.user) {
    await AuditService.logAction(
      req.user,
      'CREATE_RISK_CASE',
      'RiskCase',
      `Opened investigation case ${caseId} for project ${project.projectId}`,
      { resourceId: caseId }
    );
  }

  res.status(201).json({ success: true, data: { case: newCase } });
}

export async function getRiskCaseById(req: Request, res: Response): Promise<void> {
  const id = req.params.id as string;
  const riskCase = await RiskCase.findOne({ $or: [{ caseId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : undefined }] });

  if (!riskCase) {
    res.status(404).json({ success: false, error: { code: 'CASE_NOT_FOUND', message: 'Risk case not found' } });
    return;
  }

  const project = await Project.findOne({ projectId: riskCase.projectId });

  res.json({
    success: true,
    data: {
      case: riskCase,
      project,
    },
  });
}

export async function updateRiskCase(req: Request, res: Response): Promise<void> {
  const id = req.params.id as string;
  const { status, priority, assignedToEmail, assignedToName, findingsSummary, investigationOutcome, newNote } = req.body;

  const riskCase = await RiskCase.findOne({ $or: [{ caseId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : undefined }] });
  if (!riskCase) {
    res.status(404).json({ success: false, error: { code: 'CASE_NOT_FOUND', message: 'Risk case not found' } });
    return;
  }

  const prevStatus = riskCase.status;

  if (status) riskCase.status = status;
  if (priority) riskCase.priority = priority;
  if (assignedToEmail) riskCase.assignedToEmail = assignedToEmail;
  if (assignedToName) riskCase.assignedToName = assignedToName;
  if (findingsSummary) riskCase.findingsSummary = findingsSummary;
  if (investigationOutcome) riskCase.investigationOutcome = investigationOutcome;

  if (newNote && req.user) {
    riskCase.notes.push({
      noteId: `NOTE-${Date.now()}`,
      authorEmail: req.user.email,
      authorName: req.user.name,
      authorRole: req.user.role,
      content: newNote,
      createdAt: new Date(),
    });
  }

  if (status === 'VERIFIED' || status === 'DISMISSED') {
    riskCase.closedAt = new Date();
    riskCase.closedBy = req.user?.email || 'System';
  }

  await riskCase.save();

  if (req.user) {
    await AuditService.logAction(
      req.user,
      'UPDATE_RISK_CASE',
      'RiskCase',
      `Updated case ${riskCase.caseId} (Status: ${prevStatus} -> ${riskCase.status})`,
      {
        resourceId: riskCase.caseId,
        previousValue: { status: prevStatus },
        newValue: { status: riskCase.status },
      }
    );
  }

  res.json({ success: true, data: { case: riskCase } });
}
