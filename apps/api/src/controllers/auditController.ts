import { Request, Response } from 'express';
import { AuditLog } from '../models/AuditLog.js';
import { SystemConfiguration } from '../models/SystemConfiguration.js';
import { AuditService } from '../services/auditService.js';

export async function getAuditLogs(req: Request, res: Response): Promise<void> {
  const { action, resource, userEmail, page = '1', limit = '25' } = req.query;

  const pageNum = Math.max(1, parseInt(page as string, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10)));
  const skip = (pageNum - 1) * limitNum;

  const filter: any = {};
  if (action && action !== 'ALL') filter.action = action;
  if (resource && resource !== 'ALL') filter.resource = resource;
  if (userEmail) filter.userEmail = { $regex: userEmail as string, $options: 'i' };

  const [logs, total] = await Promise.all([
    AuditLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
    AuditLog.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: {
      logs,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    },
  });
}

export async function getSystemSettings(req: Request, res: Response): Promise<void> {
  let config = await SystemConfiguration.findOne({ configKey: 'DEFAULT' });
  if (!config) {
    config = await SystemConfiguration.create({ configKey: 'DEFAULT' });
  }

  res.json({ success: true, data: { configuration: config } });
}

export async function updateSystemSettings(req: Request, res: Response): Promise<void> {
  const { weights, thresholds, peerCostOutlierMultiplier, contractorMonopolyPercent, similarityThreshold } = req.body;

  let config = await SystemConfiguration.findOne({ configKey: 'DEFAULT' });
  if (!config) {
    config = new SystemConfiguration({ configKey: 'DEFAULT' });
  }

  const previousWeights = config.weights;

  if (weights) config.weights = { ...config.weights, ...weights };
  if (thresholds) config.thresholds = { ...config.thresholds, ...thresholds };
  if (peerCostOutlierMultiplier !== undefined) config.peerCostOutlierMultiplier = peerCostOutlierMultiplier;
  if (contractorMonopolyPercent !== undefined) config.contractorMonopolyPercent = contractorMonopolyPercent;
  if (similarityThreshold !== undefined) config.similarityThreshold = similarityThreshold;

  config.updatedBy = req.user?.email || 'Admin';
  await config.save();

  if (req.user) {
    await AuditService.logAction(
      req.user,
      'CONFIG_UPDATE',
      'SystemConfiguration',
      'Updated risk scoring weights and detection thresholds',
      {
        previousValue: { weights: previousWeights },
        newValue: { weights: config.weights },
      }
    );
  }

  res.json({ success: true, data: { configuration: config } });
}
