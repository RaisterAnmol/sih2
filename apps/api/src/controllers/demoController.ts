import { Request, Response } from 'express';
import { seedFullDatabase, seedDemoAccounts } from '../seed/seedData.js';
import { AuditService } from '../services/auditService.js';
import { MLServiceClient } from '../services/mlClient.js';
import { Project } from '../models/Project.js';

export async function launchIntelligenceDemo(req: Request, res: Response): Promise<void> {
  try {
    console.log('[Demo] Executing 1-Click Launch Intelligence Demo pipeline...');
    const result = await seedFullDatabase(5200);

    if (req.user) {
      await AuditService.logAction(
        req.user,
        'DEMO_PIPELINE_LAUNCH',
        'Demo',
        `Launched Intelligence Demo. Ingested & analyzed ${result.projectsCount} projects.`
      );
    }

    res.json({
      success: true,
      data: {
        message: 'Intelligence Demo Pipeline completed successfully.',
        projectsSeeded: result.projectsCount,
        anomaliesDetected: result.anomaliesCount,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'DEMO_LAUNCH_FAILED', message: err.message } });
  }
}

export async function resetDemoData(req: Request, res: Response): Promise<void> {
  try {
    const result = await seedFullDatabase(5200);
    res.json({ success: true, data: { message: 'Demo dataset reset to initial state', ...result } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'RESET_FAILED', message: err.message } });
  }
}
