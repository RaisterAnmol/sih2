import { Request, Response } from 'express';
import { Project } from '../models/Project.js';
import { RiskCase } from '../models/RiskCase.js';
import { ReportGenerator } from '../services/reportGenerator.js';
import { AuditService } from '../services/auditService.js';

export async function getProjectReportPDF(req: Request, res: Response): Promise<void> {
  const id = req.params.id as string;
  const project = await Project.findOne({
    $or: [{ projectId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : undefined }],
  });

  if (!project) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Project not found' } });
    return;
  }

  const riskCase = await RiskCase.findOne({ projectId: project.projectId });
  const pdfBuffer = await ReportGenerator.generateProjectPDF(project, riskCase);

  if (req.user) {
    await AuditService.logAction(
      req.user,
      'REPORT_EXPORT',
      'Report',
      `Exported official PDF audit report for ${project.projectId}`,
      { resourceId: project.projectId }
    );
  }

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="MPLAD_Report_${project.projectId}.pdf"`);
  res.send(pdfBuffer);
}

export async function getSchemeOverviewReport(req: Request, res: Response): Promise<void> {
  const projects = await Project.find().sort({ riskScore: -1 }).limit(500);
  const csvData = ReportGenerator.generateProjectCSV(projects);

  if (req.user) {
    await AuditService.logAction(
      req.user,
      'REPORT_EXPORT',
      'Report',
      'Exported Scheme Overview CSV Audit Report'
    );
  }

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="MPLAD_Scheme_Overview_Audit_Report.csv"');
  res.send(csvData);
}
