import { Request, Response } from 'express';
import { Anomaly } from '../models/Anomaly.js';

export async function getAnomalies(req: Request, res: Response): Promise<void> {
  const {
    page = '1',
    limit = '20',
    dimension,
    severity,
    state,
    district,
    search = '',
  } = req.query;

  const pageNum = Math.max(1, parseInt(page as string, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10)));
  const skip = (pageNum - 1) * limitNum;

  const filter: any = {};
  if (dimension && dimension !== 'ALL') filter.dimension = dimension;
  if (severity && severity !== 'ALL') filter.severity = severity;
  if (state && state !== 'ALL') filter.state = state;
  if (district && district !== 'ALL') filter.district = district;

  if (search) {
    const q = (search as string).trim();
    filter.$or = [
      { projectId: { $regex: q, $options: 'i' } },
      { projectTitle: { $regex: q, $options: 'i' } },
      { signal: { $regex: q, $options: 'i' } },
      { contractorName: { $regex: q, $options: 'i' } },
    ];
  }

  const [anomalies, total] = await Promise.all([
    Anomaly.find(filter)
      .sort({ score: -1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Anomaly.countDocuments(filter),
  ]);

  // Dimensional count breakdown
  const dimensionCounts = await Anomaly.aggregate([
    { $group: { _id: '$dimension', count: { $sum: 1 } } },
  ]);

  res.json({
    success: true,
    data: {
      anomalies,
      dimensionCounts: Object.fromEntries(dimensionCounts.map((d) => [d._id, d.count])),
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    },
  });
}
