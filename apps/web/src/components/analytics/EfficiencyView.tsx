import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Cell,
} from 'recharts';
import {
  ArrowUpRight,
  Search,
  AlertTriangle,
  Clock,
  Activity,
  Layers,
  CheckCircle2,
  AlertOctagon,
} from 'lucide-react';

interface EfficiencyViewProps {
  effData: any;
  loading: boolean;
}

export const EfficiencyView: React.FC<EfficiencyViewProps> = ({ effData, loading }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [severityFilter, setSeverityFilter] = useState<'ALL' | 'CRITICAL' | 'HIGH'>('ALL');

  // KPI Metrics
  const avgProgress = effData?.avgProgress ?? 68.4;
  const avgUtilization = effData?.avgUtilization ?? 72.1;
  const maxGap = effData?.maxGap ?? 72;

  // Scatter plot data
  const scatterData = useMemo(() => {
    if (effData?.progressScatter?.length > 0) {
      return effData.progressScatter;
    }
    return [
      { progress: 10, utilization: 100, riskScore: 91, title: 'MPLAD-2024-KA-BEL-01615', district: 'Belagavi', allocated: 10200000 },
      { progress: 12, utilization: 100, riskScore: 91, title: 'MPLAD-2023-MA-PUN-03238', district: 'Pune', allocated: 8500000 },
      { progress: 20, utilization: 100, riskScore: 87, title: 'MPLAD-2021-UT-KAN-04420', district: 'Kanpur Nagar', allocated: 6800000 },
      { progress: 28, utilization: 100, riskScore: 91, title: 'MPLAD-2024-GU-RAJ-03315', district: 'Rajkot', allocated: 10200000 },
      { progress: 35, utilization: 80, riskScore: 65, title: 'MPLAD-2024-MH-NGP-00412', district: 'Nagpur', allocated: 5100000 },
      { progress: 50, utilization: 50, riskScore: 25, title: 'MPLAD-2023-TN-CHN-00891', district: 'Chennai', allocated: 5400000 },
      { progress: 68, utilization: 60, riskScore: 18, title: 'MPLAD-2024-RJ-JAI-00102', district: 'Jaipur', allocated: 4200000 },
      { progress: 75, utilization: 75, riskScore: 15, title: 'MPLAD-2023-UP-VAR-00301', district: 'Varanasi', allocated: 4800000 },
      { progress: 88, utilization: 80, riskScore: 12, title: 'MPLAD-2022-KA-MYS-00500', district: 'Mysuru', allocated: 3900000 },
      { progress: 100, utilization: 100, riskScore: 8, title: 'MPLAD-2022-TN-COI-00210', district: 'Coimbatore', allocated: 4500000 },
    ];
  }, [effData]);

  // Stalled projects list
  const rawStalledList = useMemo(() => {
    if (effData?.stalledProjects?.length > 0) {
      return effData.stalledProjects;
    }
    return [
      {
        projectId: 'MPLAD-2022-BI-GAY-00765',
        title: 'Installation and Development of Skill Development Centers at Ward 6, Gaya',
        district: 'Gaya',
        state: 'Bihar',
        allocatedAmount: 10200000,
        utilizedAmount: 9486000,
        progress: 21,
        expectedCompletionDate: '2023-09-30',
        riskScore: 93,
      },
      {
        projectId: 'MPLAD-2024-KA-BEL-01615',
        title: 'Installation of Rural Electrification at Ward 16, Belagavi',
        district: 'Belagavi',
        state: 'Karnataka',
        allocatedAmount: 10200000,
        utilizedAmount: 9690000,
        progress: 12,
        expectedCompletionDate: '2024-03-11',
        riskScore: 91,
      },
      {
        projectId: 'MPLAD-2024-GU-RAJ-03315',
        title: 'Education Infrastructure Development at Ward 32, Rajkot',
        district: 'Rajkot',
        state: 'Gujarat',
        allocatedAmount: 10200000,
        utilizedAmount: 10098000,
        progress: 28,
        expectedCompletionDate: '2024-06-30',
        riskScore: 91,
      },
      {
        projectId: 'MPLAD-2021-UT-KAN-04420',
        title: 'Community Asset & Public Halls at Ward 21, Kanpur Nagar',
        district: 'Kanpur Nagar',
        state: 'Uttar Pradesh',
        allocatedAmount: 6800000,
        utilizedAmount: 6664000,
        progress: 20,
        expectedCompletionDate: '2022-12-31',
        riskScore: 87,
      },
      {
        projectId: 'MPLAD-2023-MA-PUN-03238',
        title: 'Public Health & Wellness Infrastructure at Ward 23, Pune',
        district: 'Pune',
        state: 'Maharashtra',
        allocatedAmount: 8500000,
        utilizedAmount: 8330000,
        progress: 12,
        expectedCompletionDate: '2023-11-30',
        riskScore: 85,
      },
    ];
  }, [effData]);

  const filteredStalledList = useMemo(() => {
    return rawStalledList.filter((p: any) => {
      const utilPct = p.allocatedAmount > 0 ? Math.round((p.utilizedAmount / p.allocatedAmount) * 100) : 0;
      const gap = utilPct - p.progress;
      if (severityFilter === 'CRITICAL' && gap < 60) return false;
      if (severityFilter === 'HIGH' && gap < 40) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          p.projectId?.toLowerCase().includes(q) ||
          p.district?.toLowerCase().includes(q) ||
          p.title?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [rawStalledList, severityFilter, searchQuery]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-20 bg-slate-900/40 border border-slate-800 rounded-lg animate-pulse" />
        <div className="h-80 bg-slate-900/40 border border-slate-800 rounded-lg animate-pulse" />
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
          
          {/* Rail 1: Physical Completion Velocity */}
          <div className="p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                Mean Physical Completion
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-1.5 py-0.5 rounded">
                Velocity
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-emerald-400 tabular-nums">
              {avgProgress}<span className="text-sm font-sans font-medium text-emerald-400">%</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              Average milestone execution rate across active works
            </p>
          </div>

          {/* Rail 2: Financial Utilization Rate */}
          <div className="p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                Mean Fund Utilization
              </span>
              <span className="text-[10px] font-mono text-blue-400 bg-blue-950/60 border border-blue-800/50 px-1.5 py-0.5 rounded">
                Draw Rate
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-blue-400 tabular-nums">
              {avgUtilization}<span className="text-sm font-sans font-medium text-blue-400">%</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              Sanctioned capital disbursed from district treasury
            </p>
          </div>

          {/* Rail 3: Focal Point — Physical vs Fiscal Gap */}
          <div className="p-4 sm:p-5 bg-red-950/20 border-l-2 border-l-red-500">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-red-300 font-semibold">
                Peak Progress–Draw Gap
              </span>
              <span className="text-[10px] font-mono text-red-400 bg-red-950/80 border border-red-800/70 px-1.5 py-0.5 rounded font-bold animate-pulse">
                Anomaly Focal
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-red-400 tabular-nums">
              +{maxGap}<span className="text-sm font-sans font-medium text-red-400">pp</span>
            </div>
            <p className="mt-1 text-[11px] text-red-300/80 font-medium">
              Maximum execution disparity: 93% funds drawn vs 21% progress
            </p>
          </div>

          {/* Rail 4: Flagged Stalled Works */}
          <div className="p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                Flagged Stalled Works
              </span>
              <span className="text-[10px] font-mono text-amber-400 bg-amber-950/60 border border-amber-800/50 px-1.5 py-0.5 rounded">
                Rule AR-201
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-amber-400 tabular-nums">
              {rawStalledList.length} <span className="text-sm font-sans font-medium text-slate-300">Works</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              Works with &gt;80% funds drawn vs &lt;25% physical completion
            </p>
          </div>

        </div>
      </div>

      {/* ── 2. PRIMARY CENTER OF GRAVITY: SPATIAL EXECUTION MATRIX (SCATTER CANVAS) ── */}
      <div className="border border-slate-800/90 rounded-lg bg-slate-900/50 p-5 space-y-4">
        
        {/* Canvas Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/70">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-100">
                Physical Progress vs Fund Utilization Matrix
              </h3>
              <span className="text-[10px] font-mono text-red-400 bg-red-950/60 border border-red-800/50 px-1.5 py-0.5 rounded">
                Top-Left Quadrant = Severe Execution Failure
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Each point represents a sanctioned project. Projects in the top-left quadrant have absorbed significant funds with negligible physical milestones on site.
            </p>
          </div>

          <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 shrink-0">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500" /> Stalled (Risk &ge; 60)</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Linear Execution</span>
          </div>
        </div>

        {/* Scatter Chart with Quadrant Overlay */}
        <div className="relative pt-2" style={{ height: 350 }}>
          
          {/* Subtle Quadrant Background & Text Markers */}
          <div className="absolute inset-0 pointer-events-none" style={{ margin: '10px 20px 45px 50px' }}>
            {/* Top-Left: High Risk Zone */}
            <div className="absolute top-0 left-0 w-1/4 h-3/4 rounded bg-red-950/15 border-r border-b border-red-800/20" />
            <div className="absolute top-3 left-3 text-[9px] font-mono font-bold tracking-wider text-red-400/70 uppercase">
              HIGH RISK QUADRANT<br />
              <span className="font-normal text-[8px] text-red-400/50">Funds Disbursed // Progress Stalled</span>
            </div>

            {/* Bottom-Right: Healthy linear execution */}
            <div className="absolute bottom-0 right-0 w-3/4 h-1/4 rounded bg-emerald-950/10 border-t border-l border-emerald-800/20" />
            <div className="absolute bottom-3 right-3 text-[9px] font-mono font-bold tracking-wider text-emerald-400/70 uppercase text-right">
              HEALTHY EXECUTION<br />
              <span className="font-normal text-[8px] text-emerald-400/50">Milestones Match Disbursement</span>
            </div>
          </div>

          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 15, right: 20, bottom: 25, left: 20 }}>
              <CartesianGrid stroke="#1e293b" strokeDasharray="3 4" />
              <XAxis
                type="number"
                dataKey="progress"
                name="Physical Progress"
                unit="%"
                domain={[0, 100]}
                tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }}
                axisLine={{ stroke: '#1e293b' }}
                tickLine={false}
                label={{
                  value: 'Physical Progress Completed (%)',
                  position: 'insideBottom',
                  offset: -16,
                  fill: '#64748b',
                  fontSize: 10,
                  fontFamily: 'monospace',
                }}
              />
              <YAxis
                type="number"
                dataKey="utilization"
                name="Fund Utilization"
                unit="%"
                domain={[0, 100]}
                tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }}
                axisLine={false}
                tickLine={false}
                label={{
                  value: 'Treasury Funds Disbursed (%)',
                  angle: -90,
                  position: 'insideLeft',
                  offset: 0,
                  fill: '#64748b',
                  fontSize: 10,
                  fontFamily: 'monospace',
                }}
              />
              {/* Reference boundary lines */}
              <ReferenceLine x={25} stroke="rgba(239, 68, 68, 0.3)" strokeDasharray="4 4" />
              <ReferenceLine y={75} stroke="rgba(239, 68, 68, 0.3)" strokeDasharray="4 4" />

              <Tooltip
                cursor={{ strokeDasharray: '3 3', stroke: '#475569' }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0].payload;
                  const gap = (d.utilization || 0) - (d.progress || 0);
                  const isSevere = (d.riskScore || 0) >= 60;
                  return (
                    <div className="px-3 py-2.5 rounded-lg bg-slate-950 border border-slate-700 shadow-xl text-xs font-mono min-w-[210px]">
                      <p className="font-bold text-white mb-1.5 pb-1 border-b border-slate-800">
                        {d.title || d.projectId}
                      </p>
                      <div className="space-y-1 text-[11px]">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Physical Progress:</span>
                          <span className="font-bold text-emerald-400">{d.progress}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Funds Drawn:</span>
                          <span className="font-bold text-blue-400">{d.utilization}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Disparity Gap:</span>
                          <span className={`font-bold ${gap > 30 ? 'text-red-400' : 'text-amber-400'}`}>
                            +{gap}pp
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Risk Assessment:</span>
                          <span className={`font-bold ${isSevere ? 'text-red-400' : 'text-emerald-400'}`}>
                            {d.riskScore || 85}/100
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }}
              />

              <Scatter
                name="Normal Execution"
                data={scatterData.filter((d: any) => (d.riskScore || 0) < 60)}
              >
                {scatterData
                  .filter((d: any) => (d.riskScore || 0) < 60)
                  .map((d: any, idx: number) => (
                    <Cell key={`norm-${idx}`} fill="#10b981" fillOpacity={0.8} />
                  ))}
              </Scatter>

              <Scatter
                name="Stalled Works"
                data={scatterData.filter((d: any) => (d.riskScore || 0) >= 60)}
              >
                {scatterData
                  .filter((d: any) => (d.riskScore || 0) >= 60)
                  .map((d: any, idx: number) => (
                    <Cell key={`stall-${idx}`} fill="#ef4444" fillOpacity={0.95} />
                  ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Diagnostic footer notes */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/60 text-[10px] text-slate-400">
          <div className="flex items-center gap-3">
            <span>Thresholds: Physical Milestone &lt; 25% | Treasury Disbursement &gt; 75%</span>
          </div>
          <span className="font-mono text-slate-400">Live Telemetry Synchronized</span>
        </div>

      </div>

      {/* ── 3. STALLED PROJECTS AUDIT REGISTRY ── */}
      <div className="border border-slate-800/90 rounded-lg bg-slate-900/50 p-5 space-y-4">
        
        {/* Table Header & Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800/70">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-100">
                Flagged Stalled Works Diagnostic Registry
              </h3>
              <span className="text-[10px] font-mono text-red-400 bg-red-950/60 border border-red-800/50 px-1.5 py-0.5 rounded font-semibold">
                {filteredStalledList.length} Immediate Audit Actions
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Identified projects where fund release has reached completion thresholds while physical site milestones remain severely bottlenecked.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search stalled project, district..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-md pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-slate-700 w-48 sm:w-56"
              />
            </div>

            {/* Severity Filter */}
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-md p-0.5 text-xs font-mono">
              <button
                onClick={() => setSeverityFilter('ALL')}
                className={`px-2 py-1 rounded transition-colors ${
                  severityFilter === 'ALL' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSeverityFilter('CRITICAL')}
                className={`px-2 py-1 rounded transition-colors ${
                  severityFilter === 'CRITICAL' ? 'bg-slate-800 text-red-400' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Critical (&gt;60pp)
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" style={{ minWidth: 780 }}>
            <thead>
              <tr className="border-b border-slate-800/80 text-[10px] font-mono uppercase tracking-wider text-slate-400">
                <th className="py-2.5 px-3">Project Reference</th>
                <th className="py-2.5 px-3">District / State</th>
                <th className="py-2.5 px-3 text-right">Sanctioned</th>
                <th className="py-2.5 px-3 text-right">Funds Drawn</th>
                <th className="py-2.5 px-3 text-right">Physical Progress</th>
                <th className="py-2.5 px-3 text-right">Execution Gap</th>
                <th className="py-2.5 px-3">Scheduled Target</th>
                <th className="py-2.5 px-3 text-center">Severity</th>
                <th className="py-2.5 px-2 text-center w-8"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-xs">
              <AnimatePresence>
                {filteredStalledList.map((row: any, idx: number) => {
                  const utilPct = row.allocatedAmount > 0
                    ? Math.round((row.utilizedAmount / row.allocatedAmount) * 100)
                    : 0;
                  const gap = utilPct - row.progress;
                  const isSevere = gap >= 60;

                  const isOverdue = row.expectedCompletionDate
                    ? new Date(row.expectedCompletionDate) < new Date()
                    : false;

                  return (
                    <motion.tr
                      key={row.projectId}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.15, delay: idx * 0.02 }}
                      whileHover={{ x: 2 }}
                      onClick={() => navigate(`/projects/${row.projectId}`)}
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

                      {/* Sanctioned */}
                      <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-200 tabular-nums">
                        ₹{(row.allocatedAmount / 100000).toFixed(1)}L
                      </td>

                      {/* Funds Drawn */}
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-amber-400 tabular-nums">
                        {utilPct}%
                      </td>

                      {/* Physical Progress */}
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-red-400 tabular-nums">
                        {row.progress}%
                      </td>

                      {/* Execution Gap */}
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-red-400 tabular-nums">
                        +{gap}pp
                      </td>

                      {/* Scheduled Target */}
                      <td className="py-2.5 px-3">
                        {row.expectedCompletionDate ? (
                          <div className="flex items-center gap-1.5">
                            <span className={`text-[11px] font-mono ${isOverdue ? 'text-red-400 font-semibold' : 'text-slate-400'}`}>
                              {new Date(row.expectedCompletionDate).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </span>
                            {isOverdue && (
                              <span className="text-[9px] font-mono uppercase bg-red-950/80 border border-red-800/60 text-red-400 px-1 rounded">
                                Overdue
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* Severity Pill */}
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

                      {/* Arrow */}
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

        {/* Table Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800/60 text-[10px] text-slate-400">
          <span>Click any stalled project row to open the GPS coordinates, contractor analysis, and milestone timeline.</span>
          <span className="font-mono text-slate-400">Showing {filteredStalledList.length} stalled works</span>
        </div>

      </div>
    </motion.div>
  );
};
