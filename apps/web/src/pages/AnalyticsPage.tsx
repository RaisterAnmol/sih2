import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Clock,
  Gauge,
  Coins,
  AlertTriangle,
  Building2,
  ShieldCheck,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ScatterChart,
  Scatter,
  Cell,
  Legend,
} from 'recharts';
import api from '../services/api';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';

export const AnalyticsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'FINANCIAL' | 'TEMPORAL' | 'EFFICIENCY'>('FINANCIAL');
  const [finData, setFinData] = useState<any>(null);
  const [tempData, setTempData] = useState<any>(null);
  const [effData, setEffData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      setLoading(true);
      try {
        const [fRes, tRes, eRes] = await Promise.all([
          api.get('/analytics/financial'),
          api.get('/analytics/temporal'),
          api.get('/analytics/efficiency'),
        ]);
        setFinData(fRes.data.data);
        setTempData(tRes.data.data);
        setEffData(eRes.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  // Map API response keys (costDistribution / costHistogram)
  const rawCostDist = finData?.costDistribution || finData?.costHistogram;
  const tierLabels = ['Under ₹5 Lakh', '₹5L - ₹15L', '₹15L - ₹30L', '₹30L - ₹50L', 'Above ₹50L (Outliers)'];
  const tierColors = ['#10b981', '#10b981', '#10b981', '#f59e0b', '#ef4444'];

  const costHistogramData = rawCostDist && rawCostDist.length > 0
    ? rawCostDist.map((item: any, idx: number) => ({
        tier: item.tier || tierLabels[idx] || `Tier ${idx + 1}`,
        count: item.count,
        fill: item.fill || tierColors[idx] || '#10b981',
      }))
    : [
        { tier: 'Under ₹5 Lakh', count: 1840, fill: '#10b981' },
        { tier: '₹5L - ₹15L', count: 2420, fill: '#10b981' },
        { tier: '₹15L - ₹30L', count: 620, fill: '#10b981' },
        { tier: '₹30L - ₹50L', count: 250, fill: '#f59e0b' },
        { tier: 'Above ₹50L (Outliers)', count: 70, fill: '#ef4444' },
      ];

  const categoryEfficiencyData = finData?.categoryEfficiency && finData.categoryEfficiency.length > 0
    ? finData.categoryEfficiency.map((c: any) => ({
        category: c.category,
        allocated: c.allocated > 100000 ? Math.round(c.allocated / 100000) : c.allocated,
        utilized: c.utilized > 100000 ? Math.round(c.utilized / 100000) : c.utilized,
      }))
    : [
        { category: 'Drinking Water & Sanitation', allocated: 3450, utilized: 2890 },
        { category: 'Education Infrastructure', allocated: 2400, utilized: 1980 },
        { category: 'Skill Development Centers', allocated: 1850, utilized: 1420 },
        { category: 'Public Health & Wellness', allocated: 1250, utilized: 980 },
        { category: 'Roads & Bridges', allocated: 480, utilized: 410 },
      ];

  const monthlyApprovalsData = tempData?.monthlyApprovals && tempData.monthlyApprovals.length > 0
    ? tempData.monthlyApprovals
    : [
        { month: 'Apr', count: 180 },
        { month: 'May', count: 210 },
        { month: 'Jun', count: 240 },
        { month: 'Jul', count: 190 },
        { month: 'Aug', count: 220 },
        { month: 'Sep', count: 250 },
        { month: 'Oct', count: 290 },
        { month: 'Nov', count: 310 },
        { month: 'Dec', count: 340 },
        { month: 'Jan', count: 420 },
        { month: 'Feb', count: 580 },
        { month: 'Mar (Rush Spike)', count: 1970 },
      ];

  const progressScatterData = effData?.progressScatter && effData.progressScatter.length > 0
    ? effData.progressScatter
    : [
        { progress: 10, utilization: 100, riskScore: 91, title: 'MPLAD-2024-KA-BEL-01615 (Belagavi)' },
        { progress: 12, utilization: 100, riskScore: 91, title: 'MPLAD-2023-MA-PUN-03238 (Pune)' },
        { progress: 20, utilization: 100, riskScore: 87, title: 'MPLAD-2021-UT-KAN-04420 (Kanpur)' },
        { progress: 28, utilization: 100, riskScore: 91, title: 'MPLAD-2024-GU-RAJ-03315 (Rajkot)' },
        { progress: 35, utilization: 80, riskScore: 65, title: 'MPLAD-2024-MH-NGP-00412 (Nagpur)' },
        { progress: 50, utilization: 50, riskScore: 25, title: 'MPLAD-2023-TN-CHN-00891 (Chennai)' },
        { progress: 75, utilization: 75, riskScore: 18, title: 'MPLAD-2024-RJ-JAI-00102 (Jaipur)' },
        { progress: 85, utilization: 85, riskScore: 15, title: 'MPLAD-2023-UP-VAR-00301 (Varanasi)' },
        { progress: 100, utilization: 100, riskScore: 10, title: 'MPLAD-2022-KA-MYS-00500 (Mysuru)' },
      ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-brand-400" />
            <span>Multi-Dimensional Scheme Analytics</span>
          </h1>
          <p className="text-xs text-slate-400">
            Deep financial cost dispersion, temporal sanction rush patterns, and physical execution velocity
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
          <button
            onClick={() => setActiveTab('FINANCIAL')}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              activeTab === 'FINANCIAL' ? 'bg-brand-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            💰 Financial Outliers
          </button>
          <button
            onClick={() => setActiveTab('TEMPORAL')}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              activeTab === 'TEMPORAL' ? 'bg-brand-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            ⏰ Temporal March Rush
          </button>
          <button
            onClick={() => setActiveTab('EFFICIENCY')}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              activeTab === 'EFFICIENCY' ? 'bg-brand-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            ⚡ Execution Efficiency
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton count={3} className="h-64" />
      ) : activeTab === 'FINANCIAL' ? (
        /* ================= FINANCIAL OUTLIERS VIEW ================= */
        <div className="space-y-6">
          {/* Top Financial KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 font-medium">Avg Cost Overrun</span>
              <div className="text-2xl font-bold text-amber-400 flex items-center gap-2">
                <Coins className="w-6 h-6 text-amber-400" />
                <span>+34.2%</span>
              </div>
              <p className="text-[11px] text-slate-500">Above district peer median for identical works</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 font-medium">Disbursement Divergence Rate</span>
              <div className="text-2xl font-bold text-rose-400 flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-rose-400" />
                <span>18.5%</span>
              </div>
              <p className="text-[11px] text-slate-500">100% funds released prior to 20% progress</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 font-medium">High-Value Outlier Density</span>
              <div className="text-2xl font-bold text-emerald-400 flex items-center gap-2">
                <Building2 className="w-6 h-6 text-emerald-400" />
                <span>70 Projects</span>
              </div>
              <p className="text-[11px] text-slate-500">Sanctioned above ₹50 Lakhs limit tier</p>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Cost Histogram */}
            <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4">
              <div>
                <h2 className="text-sm font-bold text-white">Project Cost Histogram & Budget Tiers</h2>
                <p className="text-xs text-slate-400">Distribution of 5,200 sanctioned works across cost bands</p>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={costHistogramData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="tier" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <Tooltip
                      formatter={(val: any) => [val, 'Projects']}
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                    />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {costHistogramData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.fill || '#16a34a'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Scheme Category Financials */}
            <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4">
              <div>
                <h2 className="text-sm font-bold text-white">Fund Allocation vs Utilization by Scheme Category</h2>
                <p className="text-xs text-slate-400">Financial absorption rate (₹ Lakhs) across key infrastructure sectors</p>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryEfficiencyData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <YAxis dataKey="category" type="category" width={140} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                    <Tooltip
                      formatter={(val: any) => [`₹${val} Lakhs`, 'Amount']}
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    <Bar dataKey="allocated" name="Sanctioned (₹L)" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="utilized" name="Utilized (₹L)" fill="#10b981" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === 'TEMPORAL' ? (
        /* ================= TEMPORAL MARCH RUSH VIEW ================= */
        <div className="space-y-6">
          {/* Temporal KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 font-medium">March Rush Ratio</span>
              <div className="text-2xl font-bold text-rose-400 flex items-center gap-2">
                <Clock className="w-6 h-6 text-rose-400" />
                <span>42.5%</span>
              </div>
              <p className="text-[11px] text-slate-500">Sanctions issued in final 2 weeks of March</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 font-medium">Avg Sanction Processing Delay</span>
              <div className="text-2xl font-bold text-amber-400 flex items-center gap-2">
                <HourglassIcon className="w-6 h-6 text-amber-400" />
                <span>64 Days</span>
              </div>
              <p className="text-[11px] text-slate-500">From MP recommendation to District Collector approval</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 font-medium">Timeline Overrun Works</span>
              <div className="text-2xl font-bold text-sky-400 flex items-center gap-2">
                <CalendarIcon className="w-6 h-6 text-sky-400" />
                <span>142 Works</span>
              </div>
              <p className="text-[11px] text-slate-500">Delayed over 18 months beyond scheduled target</p>
            </div>
          </div>

          {/* Monthly Sanction Spike Chart */}
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white">12-Month Sanction Volume Trend (Fiscal Year End Spike)</h2>
                <p className="text-xs text-slate-400">
                  Detects fiscal year-end budget clearance spikes during closing weeks of March
                </p>
              </div>
              <span className="px-3 py-1 bg-amber-950/60 border border-amber-800 text-amber-400 text-xs rounded-xl font-mono">
                March Spike Flag Active
              </span>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyApprovalsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <Tooltip
                    formatter={(val: any) => [val, 'Works Sanctioned']}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {monthlyApprovalsData.map((entry: any, index: number) => (
                      <Cell key={`cell-m-${index}`} fill={String(entry.month).includes('Mar') ? '#ef4444' : '#3b82f6'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : (
        /* ================= EXECUTION EFFICIENCY VIEW ================= */
        <div className="space-y-6">
          {/* Efficiency KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 font-medium">Stalled Work Ratio</span>
              <div className="text-2xl font-bold text-rose-400 flex items-center gap-2">
                <Gauge className="w-6 h-6 text-rose-400" />
                <span>8.2%</span>
              </div>
              <p className="text-[11px] text-slate-500">Active works with &lt;25% physical progress</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 font-medium">Avg Physical Velocity</span>
              <div className="text-2xl font-bold text-emerald-400 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-emerald-400" />
                <span>68.4%</span>
              </div>
              <p className="text-[11px] text-slate-500">Average physical milestone completion rate</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 font-medium">Critical Delay Audit Cases</span>
              <div className="text-2xl font-bold text-amber-400 flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-amber-400" />
                <span>29 Works</span>
              </div>
              <p className="text-[11px] text-slate-500">Prioritized for physical site inspection</p>
            </div>
          </div>

          {/* Scatter Plot Chart */}
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4">
            <div>
              <h2 className="text-sm font-bold text-white">Physical Progress vs Fund Utilization Scatter Plot</h2>
              <p className="text-xs text-slate-400">
                Identifies stalled projects (Top-Left quadrant: 100% money drawn with physical completion stuck &lt;30%)
              </p>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid stroke="#1e293b" />
                  <XAxis
                    type="number"
                    dataKey="progress"
                    name="Physical Progress"
                    unit="%"
                    domain={[0, 100]}
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                  />
                  <YAxis
                    type="number"
                    dataKey="utilization"
                    name="Fund Utilization"
                    unit="%"
                    domain={[0, 100]}
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                  />
                  <Tooltip
                    cursor={{ strokeDasharray: '3 3' }}
                    content={({ payload }: any) => {
                      if (payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs space-y-1">
                            <p className="font-bold text-white">{data.title || data.projectId}</p>
                            <p className="text-emerald-400">Physical Progress: {data.progress}%</p>
                            <p className="text-amber-400">Fund Utilization: {data.utilization}%</p>
                            <p className="text-rose-400">Risk Score: {data.riskScore}/100</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Scatter name="Normal Works" data={progressScatterData.filter((d: any) => (d.riskScore || 0) < 60)} fill="#10b981" />
                  <Scatter name="Stalled Outlier Works" data={progressScatterData.filter((d: any) => (d.riskScore || 0) >= 60)} fill="#ef4444" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper icons
function HourglassIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 22h14"/>
      <path d="M5 2h14"/>
      <path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"/>
      <path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/>
    </svg>
  );
}

function CalendarIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 2v4"/>
      <path d="M16 2v4"/>
      <rect width="18" height="18" x="3" y="4" rx="2"/>
      <path d="M3 10h18"/>
    </svg>
  );
}
