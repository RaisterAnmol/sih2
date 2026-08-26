import { Request, Response } from 'express';
import { Project } from '../models/Project.js';
import { ImportJob } from '../models/ImportJob.js';
import { AuditService } from '../services/auditService.js';
import { MLServiceClient } from '../services/mlClient.js';

export async function handleCSVUpload(req: Request, res: Response): Promise<void> {
  const { rows, filename = 'uploaded_data.csv' } = req.body;

  if (!rows || !Array.isArray(rows) || rows.length === 0) {
    res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: 'No rows provided for import' } });
    return;
  }

  const jobId = `IMPORT-${Date.now()}`;
  const validationErrors: any[] = [];
  const validProjects: any[] = [];

  rows.forEach((r, idx) => {
    const rowNum = idx + 1;
    if (!r.title || typeof r.title !== 'string') {
      validationErrors.push({ rowNumber: rowNum, field: 'title', value: r.title, error: 'Title is mandatory' });
      return;
    }
    if (!r.state) {
      validationErrors.push({ rowNumber: rowNum, field: 'state', value: r.state, error: 'State is mandatory' });
      return;
    }
    if (!r.district) {
      validationErrors.push({ rowNumber: rowNum, field: 'district', value: r.district, error: 'District is mandatory' });
      return;
    }
    const cost = parseFloat(r.allocatedAmount || r.cost || 0);
    if (isNaN(cost) || cost <= 0) {
      validationErrors.push({ rowNumber: rowNum, field: 'allocatedAmount', value: r.allocatedAmount, error: 'Must be a positive number' });
      return;
    }

    const pid = r.projectId || `MPLAD-IMP-${Date.now()}-${idx + 1}`;
    validProjects.push({
      projectId: pid,
      title: r.title.trim(),
      description: r.description || '',
      category: r.category || 'General Infrastructure',
      state: r.state.trim(),
      district: r.district.trim(),
      constituency: r.constituency || '',
      allocatedAmount: cost,
      utilizedAmount: parseFloat(r.utilizedAmount || 0) || 0,
      progress: Math.min(100, Math.max(0, parseFloat(r.progress || 0) || 0)),
      status: r.status || 'IN_PROGRESS',
      contractorName: r.contractorName || 'Unknown Vendor',
      startDate: r.startDate ? new Date(r.startDate) : undefined,
      expectedCompletionDate: r.expectedCompletionDate ? new Date(r.expectedCompletionDate) : undefined,
      riskScore: 0,
      riskLevel: 'LOW',
    });
  });

  // Save valid projects in database
  if (validProjects.length > 0) {
    for (const p of validProjects) {
      await Project.updateOne({ projectId: p.projectId }, { $set: p }, { upsert: true });
    }

    // Trigger asynchronous ML analysis on imported projects
    MLServiceClient.analyzeProjects(validProjects).then(async (analysis) => {
      for (const res of analysis.results) {
        await Project.updateOne(
          { projectId: res.projectId },
          {
            $set: {
              riskScore: res.overallRiskScore,
              riskLevel: res.riskLevel,
              confidenceScore: res.confidenceScore,
              signals: res.signals,
              similarProjects: res.similarProjects,
              dimensionScores: res.dimensionScores,
              recommendation: res.recommendation,
              lastAnalyzedAt: new Date(),
            },
          }
        );
      }
    });
  }

  const importJob = await ImportJob.create({
    jobId,
    filename,
    originalName: filename,
    fileSizeBytes: JSON.stringify(rows).length,
    uploadedBy: req.user?.email || 'Admin',
    totalRows: rows.length,
    validRows: validProjects.length,
    errorRows: validationErrors.length,
    warningRows: 0,
    status: validationErrors.length === rows.length ? 'FAILED' : 'IMPORTED',
    validationErrors,
  });

  if (req.user) {
    await AuditService.logAction(
      req.user,
      'DATA_IMPORT',
      'ImportJob',
      `Imported ${validProjects.length} records (${validationErrors.length} validation errors) from ${filename}`,
      { resourceId: jobId }
    );
  }

  res.json({
    success: true,
    data: {
      jobId,
      totalRows: rows.length,
      validRows: validProjects.length,
      errorRows: validationErrors.length,
      errors: validationErrors.slice(0, 50),
    },
  });
}
