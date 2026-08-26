import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderKanban,
  Coins,
  AlertTriangle,
  Building2,
  Briefcase,
  Layers,
  ArrowUpRight,
  TrendingUp,
  Filter,
  RefreshCw,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import api from '../services/api';
import { DashboardSummary, Project } from '../types';
import { RiskBadge } from '../components/common/RiskBadge';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';

export const DashboardPage: React.FC = () => {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [stateFilter, setStateFilter] = useState('ALL');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (stateFilter !== 'ALL') params.append('state', stateFilter);
      if (riskFilter !== 'ALL') params.append('riskLevel', riskFilter);

      const res = await api.get(`/dashboard/summary?${params.toString()}`);
      setData(res.data.data);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [stateFilter, riskFilter]);

  if (loading && !data) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton count={4} className="h-28" />
        <LoadingSkeleton count={2} className="h-72" />
      </div>
    );
  }

  const kpis = data?.kpis;
  const charts = data?.charts;
  const topProjects = data?.topHighRiskProjects || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header & Global Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <span>Executive Intelligence Dashboard</span>
          </h1>
          <p className="text-xs text-slate-400">
            Real-time MPLAD scheme anomaly detection, fund telemetry, and high-risk case prioritization.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900">All States</option>
              <option value="Maharashtra" className="bg-slate-900">Maharashtra</option>
              <option value="Uttar Pradesh" className="bg-slate-900">Uttar Pradesh</option>
              <option value="Tamil Nadu" className="bg-slate-900">Tamil Nadu</option>
              <option value="Karnataka" className="bg-slate-900">Karnataka</option>
              <option value="Gujarat" className="bg-slate-900">Gujarat</option>
              <option value="Rajasthan" className="bg-slate-900">Rajasthan</option>
              <option value="West Bengal" className="bg-slate-900">West Bengal</option>
              <option value="Bihar" className="bg-slate-900">Bihar</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs">
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900">All Risk Levels</option>
              <option value="CRITICAL" className="bg-slate-900">Critical (80-100)</option>
              <option value="HIGH" className="bg-slate-900">High (60-79)</option>
              <option value="MEDIUM" className="bg-slate-900">Medium (30-59)</option>
              <option value="LOW" className="bg-slate-900">Low (0-29)</option>
            </select>
          </div>

          <button
            onClick={fetchDashboardData}
            className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors"
            title="Refresh Live Data"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Projects */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Total Ingested Works</span>
            <FolderKanban className="w-4 h-4 text-brand-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {kpis?.totalProjects.toLocaleString() || 0}
          </div>
          <div className="text-[11px] text-slate-400">
            Across 12 States & 40+ Districts
          </div>
        </div>

        {/* Sanctioned vs Utilized */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Total Sanctioned Fund</span>
            <Coins className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            ₹{((kpis?.totalAllocatedAmount || 0) / 10000000).toFixed(1)} Cr
          </div>
          <div className="text-[11px] text-emerald-400 flex items-center gap-1 font-mono">
            <span>Utilized: ₹{((kpis?.totalUtilizedAmount || 0) / 10000000).toFixed(1)} Cr</span>
            <span>({kpis?.totalAllocatedAmount ? Math.round((kpis.totalUtilizedAmount / kpis.totalAllocatedAmount) * 100) : 0}%)</span>
          </div>
        </div>

        {/* High Risk Flags */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">High & Critical Risk Works</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400 font-mono">
            {(kpis?.highRiskCount || 0) + (kpis?.criticalRiskCount || 0)}
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-2">
            <span className="text-red-400">{kpis?.criticalRiskCount || 0} Critical</span>
            <span>•</span>
            <span className="text-amber-400">{kpis?.highRiskCount || 0} High Risk</span>
          </div>
        </div>

        {/* Monitored Vendors & Cases */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Active Investigation Cases</span>
            <Briefcase className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {kpis?.openRiskCases || 0}
          </div>
          <div className="text-[11px] text-slate-400">
            {kpis?.totalContractors || 0} Vendors Tracked in Graph
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Distribution Breakdown */}
        <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4">
          <div>
            <h2 className="text-sm font-bold text-white">Risk Tier Distribution</h2>
            <p className="text-xs text-slate-400">Classification across full project repository</p>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts?.riskDistribution || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="count"
                >
                  {(charts?.riskDistribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {(charts?.riskDistribution || []).map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-slate-300 font-medium truncate">{item.name}:</span>
                <span className="font-mono text-white font-bold">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Spending by Category */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white">Expenditure by Scheme Category</h2>
              <p className="text-xs text-slate-400">Total fund allocation across developmental heads (₹ Crore)</p>
            </div>
            <div className="text-xs text-brand-400 font-mono font-semibold">Live Telemetry</div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={(charts?.categoryBreakdown || []).map((c) => ({
                  category: c.category.length > 18 ? `${c.category.substring(0, 16)}...` : c.category,
                  amount: Number((c.totalAllocated / 10000000).toFixed(2)),
                  avgRisk: c.avgRisk,
                }))}
                margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="category" tick={{ fill: '#94a3b8', fontSize: 10 }} angle={-20} textAnchor="end" />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Tooltip
                  formatter={(val: any) => [`₹${val} Crore`, 'Allocated']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                />
                <Bar dataKey="amount" fill="#16a34a" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top High-Risk Projects Requiring Immediate Verification */}
      <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span>Priority High-Risk Projects for Audit Review</span>
            </h2>
            <p className="text-xs text-slate-400">Flagged by Isolation Forest, LOF, and Rule Engine with compound anomaly signals</p>
          </div>
          <button
            onClick={() => navigate('/projects?riskLevel=HIGH')}
            className="text-xs text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-1"
          >
            <span>View All Anomalous Works</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 text-slate-400 uppercase font-semibold text-[10px] bg-slate-950/40">
              <tr>
                <th className="py-3 px-3">Project ID</th>
                <th className="py-3 px-3">Title & Category</th>
                <th className="py-3 px-3">District & State</th>
                <th className="py-3 px-3">Contractor</th>
                <th className="py-3 px-3">Sanctioned (INR)</th>
                <th className="py-3 px-3">Risk Assessment</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {topProjects.map((p) => (
                <tr
                  key={p.projectId}
                  className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                  onClick={() => navigate(`/projects/${p.projectId}`)}
                >
                  <td className="py-3 px-3 font-mono font-semibold text-brand-400 whitespace-nowrap">
                    {p.projectId}
                  </td>
                  <td className="py-3 px-3 max-w-xs">
                    <div className="font-medium text-slate-200 truncate">{p.title}</div>
                    <div className="text-[11px] text-slate-400">{p.category}</div>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap text-slate-300">
                    {p.district}, {p.state}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap text-slate-300">
                    {p.contractorName}
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-200 whitespace-nowrap">
                    ₹{(p.allocatedAmount / 100000).toFixed(1)} Lakh
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <RiskBadge level={p.riskLevel} score={p.riskScore} />
                  </td>
                  <td className="py-3 px-3 text-right whitespace-nowrap">
                    <span className="text-brand-400 font-semibold text-[11px] group-hover:underline flex items-center justify-end gap-1">
                      <span>Investigate</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
