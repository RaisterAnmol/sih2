import { Request, Response } from 'express';
import { Project } from '../models/Project.js';
import { Contractor } from '../models/Contractor.js';

export async function getFinancialAnalytics(req: Request, res: Response): Promise<void> {
  const { state, district } = req.query;
  const matchFilter: any = {};
  if (state && state !== 'ALL') matchFilter.state = state;
  if (district && district !== 'ALL') matchFilter.district = district;

  // 1. Cost Distribution Bins (Lakhs: <5L, 5-15L, 15-30L, 30-50L, >50L)
  const costDistribution = await Project.aggregate([
    { $match: matchFilter },
    {
      $bucket: {
        groupBy: '$allocatedAmount',
        boundaries: [0, 500000, 1500000, 3000000, 5000000, 20000000],
        default: 'Above 2 Crore',
        output: {
          count: { $sum: 1 },
          totalAmount: { $sum: '$allocatedAmount' },
          avgRisk: { $avg: '$riskScore' },
        },
      },
    },
  ]);

  // 2. Spending Velocity by Category
  const categoryEfficiency = await Project.aggregate([
    { $match: matchFilter },
    {
      $group: {
        _id: '$category',
        allocated: { $sum: '$allocatedAmount' },
        utilized: { $sum: '$utilizedAmount' },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        category: '$_id',
        allocated: 1,
        utilized: 1,
        utilizationRate: {
          $cond: [{ $gt: ['$allocated', 0] }, { $multiply: [{ $divide: ['$utilized', '$allocated'] }, 100] }, 0],
        },
        count: 1,
      },
    },
    { $sort: { allocated: -1 } },
  ]);

  // 3. Top Cost Anomalies (Highest cost deviation from category average)
  const costAnomalies = await Project.find({
    ...matchFilter,
    'dimensionScores.financial': { $gt: 50 },
  })
    .sort({ 'dimensionScores.financial': -1, allocatedAmount: -1 })
    .limit(10)
    .select('projectId title category district allocatedAmount riskScore signals');

  res.json({
    success: true,
    data: {
      costDistribution,
      categoryEfficiency,
      costAnomalies,
    },
  });
}

export async function getTemporalAnalytics(req: Request, res: Response): Promise<void> {
  const { state, district } = req.query;
  const matchFilter: any = {};
  if (state && state !== 'ALL') matchFilter.state = state;
  if (district && district !== 'ALL') matchFilter.district = district;

  // Monthly Sanction Trends & Fiscal March Spikes
  const monthlyApprovals = await Project.aggregate([
    { $match: { ...matchFilter, approvalDate: { $ne: null } } },
    {
      $group: {
        _id: { $month: '$approvalDate' },
        count: { $sum: 1 },
        totalAllocated: { $sum: '$allocatedAmount' },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const monthNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const formattedMonthly = monthlyApprovals.map((m) => ({
    month: monthNames[m._id] || `M${m._id}`,
    count: m.count,
    totalAllocated: m.totalAllocated,
    isFiscalYearEnd: m._id === 3, // March
  }));

  // Project Delay Distribution
  const delayStats = await Project.aggregate([
    { $match: { ...matchFilter, status: { $in: ['DELAYED', 'IN_PROGRESS', 'COMPLETED'] } } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        avgProgress: { $avg: '$progress' },
      },
    },
  ]);

  res.json({
    success: true,
    data: {
      monthlyApprovals: formattedMonthly,
      delayStats,
    },
  });
}

export async function getEfficiencyAnalytics(req: Request, res: Response): Promise<void> {
  const { state, district } = req.query;
  const matchFilter: any = {};
  if (state && state !== 'ALL') matchFilter.state = state;
  if (district && district !== 'ALL') matchFilter.district = district;

  // Progress vs Utilization Scatter Points
  const progressScatter = await Project.find(matchFilter)
    .sort({ riskScore: -1 })
    .limit(100)
    .select('projectId title allocatedAmount utilizedAmount progress status riskScore');

  // Stalled Work Orders
  const stalledProjects = await Project.find({
    ...matchFilter,
    status: 'IN_PROGRESS',
    progress: { $lt: 25 },
  })
    .sort({ riskScore: -1 })
    .limit(10)
    .select('projectId title district category allocatedAmount utilizedAmount progress riskScore signals');

  res.json({
    success: true,
    data: {
      progressScatter: progressScatter.map((p) => ({
        projectId: p.projectId,
        title: p.title,
        progress: p.progress,
        utilization: p.allocatedAmount > 0 ? Math.round((p.utilizedAmount / p.allocatedAmount) * 100) : 0,
        riskScore: p.riskScore,
        status: p.status,
      })),
      stalledProjects,
    },
  });
}
