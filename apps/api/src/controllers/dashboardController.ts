import { Request, Response } from 'express';
import { Project } from '../models/Project.js';
import { Contractor } from '../models/Contractor.js';
import { Anomaly } from '../models/Anomaly.js';
import { RiskCase } from '../models/RiskCase.js';

export async function getDashboardSummary(req: Request, res: Response): Promise<void> {
  const { state, district, financialYear, category, riskLevel } = req.query;

  const matchFilter: any = {};
  if (state && state !== 'ALL') matchFilter.state = state;
  if (district && district !== 'ALL') matchFilter.district = district;
  if (financialYear && financialYear !== 'ALL') matchFilter.financialYear = financialYear;
  if (category && category !== 'ALL') matchFilter.category = category;
  if (riskLevel && riskLevel !== 'ALL') matchFilter.riskLevel = riskLevel;

  // Aggregate Key Project KPIs
  const [kpis] = await Project.aggregate([
    { $match: matchFilter },
    {
      $group: {
        _id: null,
        totalProjects: { $sum: 1 },
        totalAllocatedAmount: { $sum: '$allocatedAmount' },
        totalUtilizedAmount: { $sum: '$utilizedAmount' },
        avgRiskScore: { $avg: '$riskScore' },
        criticalRiskCount: { $sum: { $cond: [{ $eq: ['$riskLevel', 'CRITICAL'] }, 1, 0] } },
        highRiskCount: { $sum: { $cond: [{ $eq: ['$riskLevel', 'HIGH'] }, 1, 0] } },
        mediumRiskCount: { $sum: { $cond: [{ $eq: ['$riskLevel', 'MEDIUM'] }, 1, 0] } },
        lowRiskCount: { $sum: { $cond: [{ $eq: ['$riskLevel', 'LOW'] }, 1, 0] } },
      },
    },
  ]);

  const totalContractors = await Contractor.countDocuments();
  const totalAnomalies = await Anomaly.countDocuments(matchFilter.state ? { state: matchFilter.state } : {});
  const openRiskCases = await RiskCase.countDocuments({ status: { $in: ['OPEN', 'UNDER_REVIEW', 'ESCALATED'] } });

  // Risk Distribution Chart Data
  const riskDistribution = [
    { name: 'Critical (80-100)', count: kpis?.criticalRiskCount || 0, color: '#dc2626' },
    { name: 'High (60-79)', count: kpis?.highRiskCount || 0, color: '#ea580c' },
    { name: 'Medium (30-59)', count: kpis?.mediumRiskCount || 0, color: '#d97706' },
    { name: 'Low (0-29)', count: kpis?.lowRiskCount || 0, color: '#16a34a' },
  ];

  // Category Breakdown
  const categoryBreakdown = await Project.aggregate([
    { $match: matchFilter },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        totalAllocated: { $sum: '$allocatedAmount' },
        avgRisk: { $avg: '$riskScore' },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 8 },
  ]);

  // Top High-Risk Projects for immediate auditor attention
  const topHighRiskProjects = await Project.find(matchFilter)
    .sort({ riskScore: -1, allocatedAmount: -1 })
    .limit(6)
    .select('projectId title category state district allocatedAmount riskScore riskLevel signals contractorName status');

  // District Risk Aggregates
  const districtRisk = await Project.aggregate([
    { $match: matchFilter },
    {
      $group: {
        _id: { state: '$state', district: '$district' },
        projectCount: { $sum: 1 },
        totalAllocated: { $sum: '$allocatedAmount' },
        avgRisk: { $avg: '$riskScore' },
        highRiskCount: { $sum: { $cond: [{ $in: ['$riskLevel', ['HIGH', 'CRITICAL']] }, 1, 0] } },
      },
    },
    { $sort: { avgRisk: -1 } },
    { $limit: 10 },
  ]);

  // Spending Timeline
  const spendingByYear = await Project.aggregate([
    { $match: matchFilter },
    {
      $group: {
        _id: '$financialYear',
        allocated: { $sum: '$allocatedAmount' },
        utilized: { $sum: '$utilizedAmount' },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.json({
    success: true,
    data: {
      kpis: {
        totalProjects: kpis?.totalProjects || 0,
        totalAllocatedAmount: kpis?.totalAllocatedAmount || 0,
        totalUtilizedAmount: kpis?.totalUtilizedAmount || 0,
        avgRiskScore: Math.round((kpis?.avgRiskScore || 0) * 10) / 10,
        criticalRiskCount: kpis?.criticalRiskCount || 0,
        highRiskCount: kpis?.highRiskCount || 0,
        mediumRiskCount: kpis?.mediumRiskCount || 0,
        lowRiskCount: kpis?.lowRiskCount || 0,
        totalContractors,
        totalAnomalies,
        openRiskCases,
      },
      charts: {
        riskDistribution,
        categoryBreakdown: categoryBreakdown.map((c) => ({
          category: c._id,
          count: c.count,
          totalAllocated: c.totalAllocated,
          avgRisk: Math.round(c.avgRisk * 10) / 10,
        })),
        districtRisk: districtRisk.map((d) => ({
          state: d._id.state,
          district: d._id.district,
          projectCount: d.projectCount,
          totalAllocated: d.totalAllocated,
          avgRisk: Math.round(d.avgRisk * 10) / 10,
          highRiskCount: d.highRiskCount,
        })),
        spendingByYear: spendingByYear.map((s) => ({
          year: s._id || '2023-24',
          allocated: s.allocated,
          utilized: s.utilized,
          count: s.count,
        })),
      },
      topHighRiskProjects,
    },
  });
}
