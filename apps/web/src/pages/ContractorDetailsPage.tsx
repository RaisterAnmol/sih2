import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Building2, ArrowLeft, Coins, AlertTriangle, FolderKanban, ArrowUpRight } from 'lucide-react';
import api from '../services/api';
import { Contractor, Project } from '../types';
import { RiskBadge } from '../components/common/RiskBadge';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';

export const ContractorDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [contractor, setContractor] = useState<Contractor | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [districtSpread, setDistrictSpread] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/contractors/${id}`);
      setContractor(res.data.data.contractor);
      setProjects(res.data.data.projects);
      setDistrictSpread(res.data.data.districtSpread);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchDetails();
  }, [id]);

  if (loading || !contractor) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton count={3} className="h-28" />
        <LoadingSkeleton count={1} className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Back Button */}
      <button
        onClick={() => navigate('/contractors')}
        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Contractors Directory</span>
      </button>

      {/* Contractor Profile Card */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-xs font-bold text-brand-400">{contractor.contractorId}</span>
              {contractor.isFlaggedConcentration && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-950 text-amber-400 border border-amber-800">
                  Monopoly Risk Flagged
                </span>
              )}
            </div>
            <h1 className="text-xl font-bold text-white">{contractor.name}</h1>
            <p className="text-xs text-slate-400">
              Registration: {contractor.registrationNumber || 'State PWD / Central CPWD'} • Email: {contractor.email}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-right">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">Portfolio Sanction</div>
              <div className="text-lg font-bold text-emerald-400 font-mono">
                ₹{(contractor.totalAllocatedValue / 10000000).toFixed(2)} Cr
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-right">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">Total Works</div>
              <div className="text-lg font-bold text-white font-mono">{contractor.totalProjects}</div>
            </div>
          </div>
        </div>

        {/* District Spread Badges */}
        <div className="pt-3 border-t border-slate-800 text-xs">
          <span className="text-slate-500 text-[11px] block mb-1.5">District Concentration Breakdown:</span>
          <div className="flex flex-wrap gap-2">
            {districtSpread.map((d, idx) => (
              <div key={idx} className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2">
                <span className="font-semibold text-slate-200">{d._id} ({d.state})</span>
                <span className="font-mono text-brand-400 text-[11px]">{d.count} works</span>
                <span className="text-slate-500">•</span>
                <span className="font-mono text-emerald-400 text-[11px]">₹{(d.totalValue / 100000).toFixed(1)}L</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Projects Awarded to this Contractor */}
      <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <FolderKanban className="w-4 h-4 text-brand-400" />
          <span>Works Executed by {contractor.name} ({projects.length})</span>
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 text-slate-400 uppercase font-semibold text-[10px] bg-slate-950/60">
              <tr>
                <th className="py-3 px-3">Project ID</th>
                <th className="py-3 px-3">Title & Category</th>
                <th className="py-3 px-3">District</th>
                <th className="py-3 px-3">Sanctioned (INR)</th>
                <th className="py-3 px-3">Progress</th>
                <th className="py-3 px-3">Risk Assessment</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {projects.map((p) => (
                <tr
                  key={p.projectId}
                  onClick={() => navigate(`/projects/${p.projectId}`)}
                  className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                >
                  <td className="py-3 px-3 font-mono font-bold text-brand-400">{p.projectId}</td>
                  <td className="py-3 px-3 max-w-xs">
                    <div className="font-medium text-slate-200 truncate">{p.title}</div>
                    <div className="text-[11px] text-slate-500">{p.category}</div>
                  </td>
                  <td className="py-3 px-3 text-slate-300">{p.district}</td>
                  <td className="py-3 px-3 font-mono text-slate-200">
                    ₹{(p.allocatedAmount / 100000).toFixed(1)} Lakh
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-400">{p.progress}%</td>
                  <td className="py-3 px-3">
                    <RiskBadge level={p.riskLevel} score={p.riskScore} size="sm" />
                  </td>
                  <td className="py-3 px-3 text-right text-brand-400 font-semibold group-hover:underline">
                    Inspect
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
