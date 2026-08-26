import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Clock,
  Gauge,
  Coins,
  AlertTriangle,
  ArrowUpRight,
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
  ZAxis,
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
            Financial Outliers
          </button>
          <button
            onClick={() => setActiveTab('TEMPORAL')}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              activeTab === 'TEMPORAL' ? 'bg-brand-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Temporal Spikes (March Rush)
          </button>
          <button
            onClick={() => setActiveTab('EFFICIENCY')}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              activeTab === 'EFFICIENCY' ? 'bg-brand-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Execution Efficiency
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton count={3} className="h-64" />
      ) : activeTab === 'FINANCIAL' ? (
        /* Financial Analytics View */
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4">
            <div>
              <h2 className="text-sm font-bold text-white">Project Cost Histogram & Outlier Distribution</h2>
              <p className="text-xs text-slate-400">Distribution of sanctioned works across budgetary tier bands</p>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { tier: 'Under ₹5 Lakh', count: 1800, fill: '#16a34a' },
                    { tier: '₹5L - ₹15L', count: 2400, fill: '#16a34a' },
                    { tier: '₹15L - ₹30L', count: 750, fill: '#16a34a' },
                    { tier: '₹30L - ₹50L', count: 180, fill: '#eab308' },
                    { tier: 'Above ₹50L (Outliers)', count: 70, fill: '#ef4444' },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="tier" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : activeTab === 'TEMPORAL' ? (
        /* Temporal March Rush View */
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white">Monthly Sanction Rush Analysis (Fiscal Year End)</h2>
                <p className="text-xs text-slate-400">
                  Detects anomalous spikes in sanction volume during closing weeks of March
                </p>
              </div>
              <span className="px-3 py-1 bg-amber-950/60 border border-amber-800 text-amber-400 text-xs rounded-xl font-mono">
                March Rush Flag Active
              </span>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tempData?.monthlyApprovals || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <Tooltip
                    formatter={(val: any) => [val, 'Works Sanctioned']}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : (
        /* Efficiency Analytics View */
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4">
            <div>
              <h2 className="text-sm font-bold text-white">Physical Progress vs Fund Utilization Scatter</h2>
              <p className="text-xs text-slate-400">
                Identifies stalled projects (bottom-left quadrant with drawn funds but low progress)
              </p>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid stroke="#1e293b" />
                  <XAxis
                    type="number"
                    dataKey="progress"
                    name="Progress"
                    unit="%"
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                  />
                  <YAxis
                    type="number"
                    dataKey="utilization"
                    name="Utilization"
                    unit="%"
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                  />
                  <Tooltip
                    cursor={{ strokeDasharray: '3 3' }}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                  />
                  <Scatter name="Works" data={effData?.progressScatter || []} fill="#16a34a" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
