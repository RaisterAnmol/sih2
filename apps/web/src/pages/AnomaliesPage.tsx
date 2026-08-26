import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Coins,
  Building2,
  Copy,
  MapPin,
  Clock,
  Gauge,
  CheckCircle,
  ArrowUpRight,
  Filter,
} from 'lucide-react';
import api from '../services/api';
import { AnomalyItem } from '../types';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { EmptyState } from '../components/common/EmptyState';

const DIMENSION_TABS = [
  { id: 'ALL', label: 'All Dimensions', icon: AlertTriangle },
  { id: 'FINANCIAL', label: 'Financial Cost Outliers', icon: Coins },
  { id: 'CONTRACTOR', label: 'Contractor Monopolies', icon: Building2 },
  { id: 'DUPLICATE', label: 'Duplicate / Similar', icon: Copy },
  { id: 'GEOGRAPHIC', label: 'Geographic Clusters', icon: MapPin },
  { id: 'TEMPORAL', label: 'March Rush / Spikes', icon: Clock },
  { id: 'EFFICIENCY', label: 'Stalled / Lagging Works', icon: Gauge },
  { id: 'DATA_QUALITY', label: 'Quality Defects', icon: CheckCircle },
];

export const AnomaliesPage: React.FC = () => {
  const [anomalies, setAnomalies] = useState<AnomalyItem[]>([]);
  const [dimensionCounts, setDimensionCounts] = useState<Record<string, number>>({});
  const [selectedDimension, setSelectedDimension] = useState('ALL');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();

  const fetchAnomalies = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedDimension !== 'ALL') params.append('dimension', selectedDimension);
      if (severityFilter !== 'ALL') params.append('severity', severityFilter);
      params.append('limit', '50');

      const res = await api.get(`/anomalies?${params.toString()}`);
      setAnomalies(res.data.data.anomalies);
      setDimensionCounts(res.data.data.dimensionCounts || {});
      setTotal(res.data.data.pagination.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnomalies();
  }, [selectedDimension, severityFilter]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <span>AI Anomaly Catalog</span>
          </h1>
          <p className="text-xs text-slate-400">
            Categorized risk signals flagged by Isolation Forest, LOF, and Domain Rules ({total} catalogued signals)
          </p>
        </div>

        {/* Severity Filter */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Dimensional Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {DIMENSION_TABS.map((tab) => {
          const Icon = tab.icon;
          const count = tab.id === 'ALL' ? total : (dimensionCounts[tab.id] || 0);
          const isSelected = selectedDimension === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setSelectedDimension(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isSelected
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-900/40'
                  : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-brand-700 text-white' : 'bg-slate-800 text-slate-400'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Anomalies List */}
      {loading ? (
        <LoadingSkeleton count={6} className="h-20" />
      ) : anomalies.length === 0 ? (
        <EmptyState
          title="No anomalies detected in this category"
          description="Try switching tabs or resetting severity filters."
        />
      ) : (
        <div className="space-y-3">
          {anomalies.map((a) => (
            <div
              key={a.anomalyId}
              onClick={() => navigate(`/projects/${a.projectId}`)}
              className="p-4 rounded-2xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-slate-700 transition-all cursor-pointer group flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 max-w-3xl">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="font-mono text-xs font-bold text-brand-400">{a.projectId}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                      a.severity === 'CRITICAL'
                        ? 'bg-red-950 text-red-400 border border-red-800'
                        : a.severity === 'HIGH'
                        ? 'bg-amber-950 text-amber-400 border border-amber-800'
                        : a.severity === 'MEDIUM'
                        ? 'bg-yellow-950 text-yellow-400 border border-yellow-800'
                        : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    }`}
                  >
                    {a.severity} • {a.dimension}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {a.district}, {a.state} ({a.category})
                  </span>
                </div>

                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>{a.signal}</span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{a.explanation}</p>

                {a.supportingValue && (
                  <div className="flex flex-wrap gap-2 text-[11px] font-mono text-slate-400 pt-0.5">
                    {Object.entries(a.supportingValue).map(([k, v]) => (
                      <span key={k} className="px-2 py-0.5 bg-slate-950 rounded border border-slate-800">
                        {k}: <strong className="text-slate-200">{String(v)}</strong>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider">Project Risk</div>
                  <div className="text-lg font-bold text-white font-mono">{a.score}/100</div>
                </div>
                <div className="p-2 rounded-xl bg-slate-800 group-hover:bg-brand-600 text-slate-400 group-hover:text-white transition-colors">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
