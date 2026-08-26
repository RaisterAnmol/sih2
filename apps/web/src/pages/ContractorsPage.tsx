import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Search, AlertTriangle, ArrowUpRight, ShieldAlert, Coins } from 'lucide-react';
import api from '../services/api';
import { Contractor } from '../types';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { EmptyState } from '../components/common/EmptyState';

export const ContractorsPage: React.FC = () => {
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [flaggedOnly, setFlaggedOnly] = useState(false);
  const navigate = useNavigate();

  const fetchContractors = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (flaggedOnly) params.append('flaggedOnly', 'true');
      params.append('limit', '50');

      const res = await api.get(`/contractors?${params.toString()}`);
      setContractors(res.data.data.contractors);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContractors();
  }, [search, flaggedOnly]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-brand-400" />
            <span>Contractor & Vendor Intelligence</span>
          </h1>
          <p className="text-xs text-slate-400">
            Portfolio concentration, win-rate analysis, and risk-incidence rate across all registered executing vendors
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
            <input
              type="checkbox"
              checked={flaggedOnly}
              onChange={(e) => setFlaggedOnly(e.target.checked)}
              className="rounded border-slate-700 text-brand-600 focus:ring-0"
            />
            <span>High Risk Monopolies Only</span>
          </label>
        </div>
      </div>

      {/* Search Input */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search vendor name, registration ID, or operating district..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
          />
        </div>
      </div>

      {/* Contractor Cards Grid */}
      {loading ? (
        <LoadingSkeleton count={6} className="h-32" />
      ) : contractors.length === 0 ? (
        <EmptyState
          title="No Contractors Found"
          description="No executing entities match the current search filters."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contractors.map((c) => (
            <div
              key={c.contractorId}
              onClick={() => navigate(`/contractors/${c.contractorId}`)}
              className="p-5 rounded-2xl bg-slate-900/50 hover:bg-slate-800/70 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer space-y-3 group shadow-sm flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-brand-400 font-semibold">{c.contractorId}</span>
                  {c.isFlaggedConcentration && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-950 text-amber-400 border border-amber-800 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      <span>Monopoly Concentration</span>
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-white group-hover:text-brand-300 leading-snug line-clamp-2">
                  {c.name}
                </h3>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-800/80 text-xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Total Works Awarded:</span>
                  <span className="font-mono text-white font-bold">{c.totalProjects}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Portfolio Value:</span>
                  <span className="font-mono text-emerald-400 font-bold">
                    ₹{(c.totalAllocatedValue / 10000000).toFixed(2)} Cr
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>High Risk Rate:</span>
                  <span className={`font-mono font-bold ${c.riskRate > 20 ? 'text-red-400' : 'text-slate-300'}`}>
                    {c.riskRate}% ({c.highRiskProjectCount} works)
                  </span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-[11px] text-brand-400 font-semibold group-hover:underline">
                <span>View Full Vendor Profile</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
