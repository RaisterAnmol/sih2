import { Request, Response } from 'express';
import { Contractor } from '../models/Contractor.js';
import { Project } from '../models/Project.js';

export async function getContractors(req: Request, res: Response): Promise<void> {
  const { search = '', state, district, flaggedOnly, sortBy = 'totalAllocatedValue', sortOrder = 'desc', page = '1', limit = '15' } = req.query;

  const pageNum = Math.max(1, parseInt(page as string, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10)));
  const skip = (pageNum - 1) * limitNum;

  const filter: any = {};
  if (search) {
    const q = (search as string).trim();
    filter.$or = [
      { name: { $regex: q, $options: 'i' } },
      { contractorId: { $regex: q, $options: 'i' } },
    ];
  }
  if (state && state !== 'ALL') filter.statesOperating = state;
  if (district && district !== 'ALL') filter.districtsOperating = district;
  if (flaggedOnly === 'true') filter.isFlaggedConcentration = true;

  const sortDirection = sortOrder === 'asc' ? 1 : -1;
  const sortOptions: any = {};
  sortOptions[sortBy as string] = sortDirection;

  const [contractors, total] = await Promise.all([
    Contractor.find(filter).sort(sortOptions).skip(skip).limit(limitNum),
    Contractor.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: {
      contractors,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    },
  });
}

export async function getContractorById(req: Request, res: Response): Promise<void> {
  const id = req.params.id as string;

  const contractor = await Contractor.findOne({
    $or: [{ contractorId: id }, { name: decodeURIComponent(id) }],
  });

  if (!contractor) {
    res.status(404).json({ success: false, error: { code: 'CONTRACTOR_NOT_FOUND', message: 'Contractor not found' } });
    return;
  }

  // Fetch recent projects executed by this contractor
  const projects = await Project.find({ contractorName: contractor.name })
    .sort({ riskScore: -1, allocatedAmount: -1 })
    .limit(25);

  // District concentration breakdown
  const districtSpread = await Project.aggregate([
    { $match: { contractorName: contractor.name } },
    {
      $group: {
        _id: '$district',
        state: { $first: '$state' },
        count: { $sum: 1 },
        totalValue: { $sum: '$allocatedAmount' },
        highRiskCount: { $sum: { $cond: [{ $in: ['$riskLevel', ['HIGH', 'CRITICAL']] }, 1, 0] } },
      },
    },
    { $sort: { count: -1 } },
  ]);

  res.json({
    success: true,
    data: {
      contractor,
      projects,
      districtSpread,
    },
  });
}
