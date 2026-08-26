import { Request, Response } from 'express';
import { Alert } from '../models/Alert.js';

export async function getAlerts(req: Request, res: Response): Promise<void> {
  const { isRead, priority, limit = '20' } = req.query;
  const filter: any = {};
  if (isRead !== undefined) filter.isRead = isRead === 'true';
  if (priority && priority !== 'ALL') filter.priority = priority;

  const alerts = await Alert.find(filter)
    .sort({ createdAt: -1 })
    .limit(parseInt(limit as string, 10));

  const unreadCount = await Alert.countDocuments({ isRead: false });

  res.json({
    success: true,
    data: {
      alerts,
      unreadCount,
    },
  });
}

export async function markAlertAsRead(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const alert = await Alert.findOneAndUpdate(
    { alertId: id },
    { $set: { isRead: true, readAt: new Date(), readBy: req.user?.email || 'User' } },
    { new: true }
  );

  if (!alert) {
    res.status(404).json({ success: false, error: { code: 'ALERT_NOT_FOUND', message: 'Alert not found' } });
    return;
  }

  res.json({ success: true, data: { alert } });
}
