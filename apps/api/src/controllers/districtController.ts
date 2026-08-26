import { Request, Response } from 'express';
import { District } from '../models/District.js';
import { Project } from '../models/Project.js';

export async function getDistricts(req: Request, res: Response): Promise<void> {
  const { state } = req.query;
  const filter: any = {};
  if (state && state !== 'ALL') filter.state = state;

  const districts = await District.find(filter).sort({ state: 1, district: 1 });
  res.json({ success: true, data: { districts } });
}

export async function getDistrictDetails(req: Request, res: Response): Promise<void> {
  const name = req.params.name as string;
  const districtName = decodeURIComponent(name);
  const districtDoc = await District.findOne({ district: districtName });

  const projects = await Project.find({ district: districtName })
    .sort({ riskScore: -1 })
    .limit(20);

  const categoryStats = await Project.aggregate([
    { $match: { district: districtName } },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        totalAllocated: { $sum: '$allocatedAmount' },
        avgRisk: { $avg: '$riskScore' },
      },
    },
    { $sort: { count: -1 } },
  ]);

  res.json({
    success: true,
    data: {
      district: districtDoc,
      projects,
      categoryStats,
    },
  });
}
