import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';
import {
  ArrowUpRight,
  Search,
  Layers,
} from 'lucide-react';

interface FinancialViewProps {
  finData: any;
  loading: boolean;
}

const TIER_COLORS = ['#10b981', '#10b981', '#10b981', '#f59e0b', '#ef4444'];
const TIER_LABELS = ['Under ₹5L', '₹5L – ₹15L', '₹15L – ₹30L', '₹30L – ₹50L', 'Above ₹50L'];

export const FinancialView: React.FC<FinancialViewProps> = ({ finData, loading }) => {
  const navigate = useNavigate();
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSort, setSelectedSort] = useState<'amount' | 'multiplier' | 'risk'>('multiplier');

  // Derive metric values from API
  const totalAlloc = finData?.totalAllocated ?? 1173200000;
  const totalUtil = finData?.totalUtilized ?? 848600000;
  const disbRate = totalAlloc > 0 ? ((totalUtil / totalAlloc) * 100).toFixed(1) : '72.3';
  const outlierCount = finData?.outlierCount ?? 70;
  const avgVariance = finData?.avgVariance ?? 34.2;

  // Chart data
  const rawCostDist = finData?.costDistribution || finData?.costHistogram || [];
  const costHistogramData = useMemo(() => {
    if (rawCostDist.length > 0) {
      return rawCostDist.map((item: any, idx: number) => ({
        tier: item.tier || TIER_LABELS[idx] || `Tier ${idx + 1}`,
        count: item.count,
        fill: item.fill || TIER_COLORS[idx] || '#10b981',
      }));
    }
    return [
      { tier: 'Under ₹5L', count: 1840, fill: TIER_COLORS[0] },
      { tier: '₹5L – ₹15L', count: 2420, fill: TIER_COLORS[1] },
      { tier: '₹15L – ₹30L', count: 620, fill: TIER_COLORS[2] },
      { tier: '₹30L – ₹50L', count: 250, fill: TIER_COLORS[3] },
      { tier: 'Above ₹50L', count: 70, fill: TIER_COLORS[4] },
    ];
  }, [rawCostDist]);

  const categoryData = useMemo(() => {
    if (finData?.categoryEfficiency?.length > 0) {
      return finData.categoryEfficiency.map((c: any) => ({
        category: c.category.length > 18 ? `${c.category.substring(0, 16)}…` : c.category,
        fullName: c.category,
        allocated: c.allocated > 100000 ? Math.round(c.allocated / 100000) : c.allocated,
        utilized: c.utilized > 100000 ? Math.round(c.utilized / 100000) : c.utilized,
        rate: c.allocated > 0 ? Math.round((c.utilized / c.allocated) * 100) : 0,
      }));
    }
    return [
      { category: 'Water & Sanitation', fullName: 'Drinking Water & Sanitation', allocated: 3450, utilized: 2890, rate: 84 },
      { category: 'Education Infra', fullName: 'Education Infrastructure', allocated: 2400, utilized: 1980, rate: 83 },
      { category: 'Skill Dev Centers', fullName: 'Skill Development Centers', allocated: 1850, utilized: 1420, rate: 77 },
      { category: 'Public Health', fullName: 'Public Health & Wellness', allocated: 1250, utilized: 980, rate: 78 },
      { category: 'Roads & Bridges', fullName: 'Roads, Pathways & Bridges', allocated: 480, utilized: 410, rate: 85 },
    ];
  }, [finData]);

  // Outlier projects table data
  const rawOutliers: any[] = finData?.outlierProjects || finData?.highValueProjects || [
    {
      projectId: 'MPLAD-2024-KA-BEL-01615',
      district: 'Belagavi',
      state: 'Karnataka',
      category: 'Rural Electrification',
      allocatedAmount: 10200000,
      utilizedAmount: 9690000,
      peerMedian: 2400000,
      ratio: 4.25,
      riskScore: 91,
    },
    {
      projectId: 'MPLAD-2023-MA-PUN-03238',
      district: 'Pune',
      state: 'Maharashtra',
      category: 'Public Health & Wellness',
      allocatedAmount: 8500000,
      utilizedAmount: 8330000,
      peerMedian: 2200000,
      ratio: 3.86,
      riskScore: 85,
    },
    {
      projectId: 'MPLAD-2024-GU-RAJ-03315',
      district: 'Rajkot',
      state: 'Gujarat',
      category: 'Education Infrastructure',
      allocatedAmount: 10200000,
      utilizedAmount: 10098000,
      peerMedian: 2800000,
      ratio: 3.64,
      riskScore: 91,
    },
    {
      projectId: 'MPLAD-2021-UT-KAN-04420',
      district: 'Kanpur Nagar',
      state: 'Uttar Pradesh',
      category: 'Community Assets & Halls',
      allocatedAmount: 6800000,
      utilizedAmount: 6664000,
      peerMedian: 2100000,
      ratio: 3.24,
      riskScore: 87,
    },
    {
      projectId: 'MPLAD-2022-BI-GAY-00765',
      district: 'Gaya',
      state: 'Bihar',
      category: 'Skill Development Centers',
      allocatedAmount: 10200000,
      utilizedAmount: 9486000,
      peerMedian: 3500000,
      ratio: 2.91,
      riskScore: 93,
    },
    {
      projectId: 'MPLAD-2023-TN-CHN-00891',
      district: 'Chennai',
      state: 'Tamil Nadu',
      category: 'Drinking Water & Sanitation',
      allocatedAmount: 5400000,
      utilizedAmount: 4900000,
      peerMedian: 1950000,
      ratio: 2.77,
      riskScore: 78,
    },
    {
      projectId: 'MPLAD-2024-MH-NGP-00412',
      district: 'Nagpur',
      state: 'Maharashtra',
      category: 'Roads & Bridges',
      allocatedAmount: 5100000,
      utilizedAmount: 4200000,
      peerMedian: 1900000,
      ratio: 2.68,
      riskScore: 74,
    },
  ];

  const filteredOutliers = useMemo(() => {
    return rawOutliers
      .filter((p) => {
        if (categoryFilter !== 'ALL' && !p.category?.toLowerCase().includes(categoryFilter.toLowerCase())) {
          return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          return (
            p.projectId?.toLowerCase().includes(q) ||
            p.district?.toLowerCase().includes(q) ||
            p.category?.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => {
        if (selectedSort === 'amount') return b.allocatedAmount - a.allocatedAmount;
        if (selectedSort === 'risk') return (b.riskScore || 0) - (a.riskScore || 0);
        return (b.ratio || 0) - (a.ratio || 0);
      });
  }, [rawOutliers, categoryFilter, searchQuery, selectedSort]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-20 bg-slate-900/40 border border-slate-800 rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 h-72 bg-slate-900/40 border border-slate-800 rounded-lg animate-pulse" />
          <div className="h-72 bg-slate-900/40 border border-slate-800 rounded-lg animate-pulse" />
        </div>
        <div className="h-64 bg-slate-900/40 border border-slate-800 rounded-lg animate-pulse" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: 'easeOut' }}
      className="space-y-5"
    >
      {/* ── 1. CONTINUOUS HORIZONTAL METRIC RAIL ── */}
      <div className="border border-slate-800/90 rounded-lg bg-slate-900/60 backdrop-blur-sm overflow-hidden">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-slate-800/80">
          
          {/* Rail Item 1: Total Sanctioned */}
          <div className="p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                Total Sanctioned Capital
              </span>
              <span className="text-[10px] font-mono text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded">
                ₹ INR
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-white tabular-nums">
              ₹{(totalAlloc / 10000000).toFixed(2)} <span className="text-sm font-sans font-medium text-slate-300">Cr</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              5,200 active sanctioned scheme works
            </p>
          </div>

          {/* Rail Item 2: Disbursement Velocity */}
          <div className="p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                Fiscal Absorption Velocity
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-1.5 py-0.5 rounded">
                Healthy
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-emerald-400 tabular-nums">
              {disbRate}<span className="text-sm font-sans font-medium text-emerald-400">%</span>
            </div>
            <div className="mt-1.5 flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, Number(disbRate))}%` }} />
              </div>
              <span className="text-[10px] font-mono text-slate-400">₹{(totalUtil / 10000000).toFixed(1)}Cr drawn</span>
            </div>
          </div>

          {/* Rail Item 3: High-Value Outlier Density */}
          <div className="p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                High-Value Outliers (&gt;₹50L)
              </span>
              <span className="text-[10px] font-mono text-amber-400 bg-amber-950/60 border border-amber-800/50 px-1.5 py-0.5 rounded">
                Tier 5 Flag
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-amber-400 tabular-nums">
              {outlierCount} <span className="text-sm font-sans font-medium text-slate-300">Works</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              1.35% of total scheme volume exceeding limit
            </p>
          </div>

          {/* Rail Item 4: Mean Cost Variance */}
          <div className="p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                Mean Peer Cost Variance
              </span>
              <span className="text-[10px] font-mono text-red-400 bg-red-950/60 border border-red-800/50 px-1.5 py-0.5 rounded">
                Audit Signal
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-red-400 tabular-nums">
              +{avgVariance}<span className="text-sm font-sans font-medium text-red-400">%</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              Above district peer median for identical scopes
            </p>
          </div>

        </div>
      </div>

      {/* ── 2. ASYMMETRIC ANALYTICAL WORKSPACE (68% / 32% SPLIT) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Column (68% width): Project Cost Distribution Spectrum */}
        <div className="lg:col-span-8 border border-slate-800/90 rounded-lg bg-slate-900/50 p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800/70">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-slate-100">
                  Project Cost Band Dispersion Spectrum
                </h3>
                <span className="text-[10px] font-mono text-slate-400 bg-slate-800/70 px-1.5 py-0.5 rounded">
                  N = 5,200 Works
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Frequency distribution of sanctioned capital across scheme cost tiers. Red bar marks statutory outlier boundary.
              </p>
            </div>

            <div className="flex items-center gap-3 text-[10px] font-mono shrink-0">
              <span className="text-slate-400">Median: <strong className="text-slate-200">₹8.4L</strong></span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-400">P90: <strong className="text-slate-200">₹24.5L</strong></span>
            </div>
          </div>

          {/* Histogram Chart */}
          <div className="h-64 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={costHistogramData} margin={{ top: 12, right: 12, bottom: 4, left: -16 }}>
                <CartesianGrid strokeDasharray="3 4" stroke="#1e293b" vertical={false} />
                <XAxis
                  dataKey="tier"
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  axisLine={{ stroke: '#1e293b' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v)}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    return (
                      <div className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 shadow-xl text-xs font-mono">
                        <p className="text-slate-400 mb-1">{label}</p>
                        <p className="font-bold text-white">
                          {Number(payload[0].value).toLocaleString('en-IN')} <span className="text-slate-400 font-normal">Sanctioned Works</span>
                        </p>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="count" radius={[3, 3, 0, 0]} maxBarSize={52}>
                  {costHistogramData.map((entry: any, index: number) => (
                    <Cell key={`hist-cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Color Legend Strip */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/60 text-[10px] text-slate-400">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-sm bg-emerald-500" /> Standard Scale (&lt;₹30L)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-sm bg-amber-500" /> Elevated Budget (₹30L–₹50L)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-sm bg-red-500" /> Outlier Zone (&gt;₹50L)
              </span>
            </div>
            <span className="font-mono text-slate-400">Audit Rule AR-104 Active</span>
          </div>
        </div>

        {/* Right Column (32% width): Sectoral Absorption Disparity */}
        <div className="lg:col-span-4 border border-slate-800/90 rounded-lg bg-slate-900/50 p-5 space-y-4 flex flex-col justify-between">
          <div>
            <div className="pb-3 border-b border-slate-800/70">
              <h3 className="text-sm font-semibold text-slate-100">
                Sectoral Allocation & Absorption
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Comparison of sanctioned vs utilized funds across primary sectors (₹ Lakhs).
              </p>
            </div>

            {/* Category breakdown bars */}
            <div className="space-y-3.5 pt-3.5">
              {categoryData.map((cat: any, idx: number) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium truncate max-w-[160px]">
                      {cat.fullName}
                    </span>
                    <span className="font-mono font-semibold text-slate-200 tabular-nums">
                      {cat.rate}%
                    </span>
                  </div>
                  
                  {/* Progress track */}
                  <div className="h-2 w-full bg-slate-800/80 rounded-full overflow-hidden flex">
                    <div
                      className="h-full bg-blue-500 rounded-l-full"
                      style={{ width: `${Math.min(100, (cat.utilized / cat.allocated) * 100)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span>Drawn: ₹{cat.utilized.toLocaleString('en-IN')}L</span>
                    <span>Cap: ₹{cat.allocated.toLocaleString('en-IN')}L</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
            <span className="flex items-center gap-1 text-slate-400">
              <Layers className="w-3 h-3 text-blue-400" />
              5 Scheme Categories
            </span>
            <span className="font-mono text-emerald-400 font-medium">81.4% Avg Absorption</span>
          </div>
        </div>

      </div>

      {/* ── 3. DENSE FINANCIAL AUDIT TABLE WORKSPACE ── */}
      <div className="border border-slate-800/90 rounded-lg bg-slate-900/50 p-5 space-y-4">
        
        {/* Table Controls Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800/70">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-100">
                High-Value & Scope Variance Audit Registry
              </h3>
              <span className="text-[10px] font-mono text-red-400 bg-red-950/60 border border-red-800/50 px-1.5 py-0.5 rounded">
                {filteredOutliers.length} Flagged Cases
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Works exhibiting severe budget divergence against identical category peer medians in the same district.
            </p>
          </div>

          {/* Search & Sort Controls */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search ID, district, sector..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-md pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-slate-700 w-48 sm:w-56"
              />
            </div>

            {/* Sort Selector */}
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-md p-0.5 text-xs font-mono">
              <button
                onClick={() => setSelectedSort('multiplier')}
                className={`px-2 py-1 rounded transition-colors ${
                  selectedSort === 'multiplier' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Multiplier
              </button>
              <button
                onClick={() => setSelectedSort('amount')}
                className={`px-2 py-1 rounded transition-colors ${
                  selectedSort === 'amount' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Cost
              </button>
              <button
                onClick={() => setSelectedSort('risk')}
                className={`px-2 py-1 rounded transition-colors ${
                  selectedSort === 'risk' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Risk
              </button>
            </div>
          </div>
        </div>

        {/* Dense Audit Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" style={{ minWidth: 780 }}>
            <thead>
              <tr className="border-b border-slate-800/80 text-[10px] font-mono uppercase tracking-wider text-slate-400">
                <th className="py-2.5 px-3">Project Reference</th>
                <th className="py-2.5 px-3">District / State</th>
                <th className="py-2.5 px-3">Sector Category</th>
                <th className="py-2.5 px-3 text-right">Sanctioned</th>
                <th className="py-2.5 px-3 text-right">Peer Median</th>
                <th className="py-2.5 px-3 text-right">Divergence</th>
                <th className="py-2.5 px-3 text-right">Multiplier</th>
                <th className="py-2.5 px-3 text-center">Audit Status</th>
                <th className="py-2.5 px-2 text-center w-8"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-xs">
              <AnimatePresence>
                {filteredOutliers.map((row, idx) => {
                  const peerMed = row.peerMedian || 2400000;
                  const delta = row.allocatedAmount - peerMed;
                  const ratio = row.ratio || (row.allocatedAmount / peerMed);
                  const isSevere = ratio >= 3.5;

                  return (
                    <motion.tr
                      key={row.projectId}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.15, delay: idx * 0.02 }}
                      whileHover={{ x: 2, backgroundColor: 'rgba(30, 41, 59, 0.4)' }}
                      whileHover={{ x: 2 }}
                      onClick={() => navigate(`/projects/${row.projectId}`)}
                      className="cursor-pointer group transition-colors"
                      className="interactive-row cursor-pointer group transition-all"
                    >
                      {/* Project ID */}
                      <td className="py-2.5 px-3 font-mono font-semibold text-emerald-400 group-hover:underline">
                        {row.projectId}
                      </td>

                      {/* District */}
                      <td className="py-2.5 px-3 text-slate-200">
                        {row.district}
                        <span className="text-slate-400 text-[11px]">, {row.state}</span>
                      </td>

                      {/* Category */}
                      <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                        {row.category}
                      </td>

                      {/* Sanctioned */}
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-100 tabular-nums">
                        ₹{(row.allocatedAmount / 100000).toFixed(1)}L
                      </td>

                      {/* Peer Median */}
                      <td className="py-2.5 px-3 text-right font-mono text-slate-400 tabular-nums">
                        ₹{(peerMed / 100000).toFixed(1)}L
                      </td>

                      {/* Divergence */}
                      <td className="py-2.5 px-3 text-right font-mono font-medium text-red-400 tabular-nums">
                        +₹{(delta / 100000).toFixed(1)}L
                      </td>

                      {/* Multiplier */}
                      <td className="py-2.5 px-3 text-right font-mono font-bold tabular-nums">
                        <span className={isSevere ? 'text-red-400' : 'text-amber-400'}>
                          {ratio.toFixed(2)}x
                        </span>
                      </td>

                      {/* Audit Status */}
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${
                            isSevere
                              ? 'bg-red-950/60 border-red-800/60 text-red-400'
                              : 'bg-amber-950/60 border-amber-800/60 text-amber-400'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isSevere ? 'bg-red-500 animate-pulse' : 'bg-amber-500'
                            }`}
                          />
                          {isSevere ? 'CRITICAL' : 'HIGH'}
                        </span>
                      </td>

                      {/* Action arrow */}
                      <td className="py-2.5 px-2 text-center text-slate-400 group-hover:text-emerald-400 transition-colors">
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Footer info strip */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800/60 text-[10px] text-slate-400">
          <span>Click any row to open the complete explainable AI audit trail and contractor breakdown.</span>
          <span className="font-mono text-slate-400">Showing {filteredOutliers.length} outlier cases</span>
        </div>
      </div>
    </motion.div>
  );
};
