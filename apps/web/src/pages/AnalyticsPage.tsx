import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Clock,
  Calendar,
} from 'lucide-react';
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
import api from '../services/api';

import { FinancialView } from '../components/analytics/FinancialView';
import { EfficiencyView } from '../components/analytics/EfficiencyView';

type AnalyticsTab = 'FINANCIAL' | 'TEMPORAL' | 'EFFICIENCY';

// ── Tab configuration ──────────────────────────────────────
const TABS: { key: AnalyticsTab; label: string; code: string; path: string }[] = [
  { key: 'FINANCIAL',  label: 'Financial Intelligence', code: 'FIN-01', path: '/analytics/financial' },
  { key: 'EFFICIENCY', label: 'Execution Efficiency',   code: 'EFF-02', path: '/analytics/efficiency' },
  { key: 'TEMPORAL',   label: 'Temporal Sanction Rush', code: 'TMP-03', path: '/analytics/temporal' },
];

// ── Temporal tooltip (unchanged from original) ────────────
function TemporalTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 shadow-xl text-xs">
      <p className="text-slate-400 mb-1">{label}</p>
      <p className="font-mono font-semibold text-slate-100">
        {payload[0].value.toLocaleString('en-IN')} works sanctioned
      </p>
    </div>
  );
}

// ── Hourglass icon (unchanged from original) ──────────────
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

export const AnalyticsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const getTabFromPath = (path: string): AnalyticsTab => {
    if (path.includes('/efficiency')) return 'EFFICIENCY';
    if (path.includes('/temporal'))   return 'TEMPORAL';
    return 'FINANCIAL';
  };

  const [activeTab, setActiveTab] = useState<AnalyticsTab>(() => getTabFromPath(location.pathname));
  const [finData, setFinData] = useState<any>(null);
  const [tempData, setTempData] = useState<any>(null);
  const [effData, setEffData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Sync tab state with URL
  useEffect(() => {
    setActiveTab(getTabFromPath(location.pathname));
  }, [location.pathname]);

  const handleTabChange = (tab: AnalyticsTab) => {
    setActiveTab(tab);
    navigate(`/analytics/${tab.toLowerCase()}`);
  };

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
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  // ── Temporal chart data (original logic, unchanged) ──
  const monthlyApprovalsData =
    tempData?.monthlyApprovals?.length > 0
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      className="space-y-6"
    >
      {/* ── Page Header Strip ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest text-slate-400 uppercase">
            <span>GOVERNMENT INTELLIGENCE PLATFORM</span>
            <span>//</span>
            <span className="text-emerald-400">AUDIT TELEMETRY</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white mt-1">
            {activeTab === 'FINANCIAL'
              ? 'Financial Intelligence & Cost Outlier Analytics'
              : activeTab === 'EFFICIENCY'
              ? 'Execution Velocity & Physical Progress Monitoring'
              : 'Temporal Sanction Rush Patterns (March Spike)'}
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl">
            {activeTab === 'FINANCIAL'
              ? 'Multi-tiered expenditure dispersion, category absorption variance, and automated peer median divergence analysis across 5,200 scheme works.'
              : activeTab === 'EFFICIENCY'
              ? 'Spatial correlation between treasury fund draw and verified physical site progress to isolate stalled works and execution anomalies.'
              : 'Detection of fiscal year-end budget clearance spikes and sanction rush patterns across parliamentary constituencies.'}
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-1 text-xs shrink-0 self-start md:self-auto">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`
                  relative px-3.5 py-1.5 rounded-md font-medium text-xs transition-all duration-150 flex items-center gap-1.5
                  ${isActive
                    ? 'text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200'}
                `}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-tab-indicator"
                    className="absolute inset-0 bg-slate-800 rounded-md shadow-sm border border-slate-700/60"
                    transition={{ type: 'spring', bounce: 0.15, duration: 0.3 }}
                  />
                )}
                <span className="relative z-10 font-mono text-[9px] text-slate-400">
                  {tab.code}
                </span>
                <span className="relative z-10">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Active Workspace ── */}
      {activeTab === 'FINANCIAL' ? (
        <FinancialView finData={finData} loading={loading} />
      ) : activeTab === 'EFFICIENCY' ? (
        <EfficiencyView effData={effData} loading={loading} />
      ) : (
        /* ═══════════════════════════════════════════════════════
           TEMPORAL VIEW — ORIGINAL CODE, COMPLETELY UNTOUCHED
           ═══════════════════════════════════════════════════════ */
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
                <Calendar className="w-6 h-6 text-sky-400" />
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
                    content={<TemporalTooltip />}
                    cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {monthlyApprovalsData.map((entry: any, index: number) => (
                      <Cell
                        key={`cell-m-${index}`}
                        fill={String(entry.month).includes('Mar') ? '#ef4444' : '#3b82f6'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};
