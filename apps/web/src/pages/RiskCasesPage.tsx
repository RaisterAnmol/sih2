import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertOctagon,
  ArrowRight,
  UserCheck,
  Send,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import api from '../services/api';
import { RiskCase } from '../types';
import { RiskBadge } from '../components/common/RiskBadge';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { EmptyState } from '../components/common/EmptyState';

const STATUS_COLUMNS: Array<{ id: 'OPEN' | 'UNDER_REVIEW' | 'VERIFIED' | 'DISMISSED' | 'ESCALATED'; label: string; color: string }> = [
  { id: 'OPEN', label: 'Open Cases', color: 'border-blue-500/40 text-blue-400' },
  { id: 'UNDER_REVIEW', label: 'Under Review', color: 'border-amber-500/40 text-amber-400' },
  { id: 'ESCALATED', label: 'Escalated to MoSPI', color: 'border-red-500/40 text-red-400' },
  { id: 'VERIFIED', label: 'Verified & Actioned', color: 'border-emerald-500/40 text-emerald-400' },
  { id: 'DISMISSED', label: 'Dismissed / Inlier', color: 'border-slate-600/40 text-slate-400' },
];

export const RiskCasesPage: React.FC = () => {
  const [cases, setCases] = useState<RiskCase[]>([]);
  const [statusSummary, setStatusSummary] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'KANBAN' | 'LIST'>('KANBAN');
  const [selectedCase, setSelectedCase] = useState<RiskCase | null>(null);
  const [newNoteInput, setNewNoteInput] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [updating, setUpdating] = useState(false);
  const navigate = useNavigate();

  const fetchCases = async () => {
    setLoading(true);
    try {
      const res = await api.get('/risk-cases?limit=100');
      setCases(res.data.data.cases);
      setStatusSummary(res.data.data.statusSummary || {});
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const handleUpdateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase) return;
    setUpdating(true);
    try {
      const res = await api.put(`/risk-cases/${selectedCase.caseId}`, {
        status: selectedStatus || selectedCase.status,
        newNote: newNoteInput.trim() ? newNoteInput.trim() : undefined,
      });
      setSelectedCase(res.data.data.case);
      setNewNoteInput('');
      fetchCases();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to update case');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-brand-400" />
            <span>Investigation Case Management</span>
          </h1>
          <p className="text-xs text-slate-400">
            Formal audit verification workflows, investigator notes, and multi-tier escalation lifecycle
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
            <button
              onClick={() => setViewMode('KANBAN')}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                viewMode === 'KANBAN' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Kanban
            </button>
            <button
              onClick={() => setViewMode('LIST')}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                viewMode === 'LIST' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Table List
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton count={4} className="h-40" />
      ) : cases.length === 0 ? (
        <EmptyState
          title="No Investigation Cases Open"
          description="Open an investigation case from any project details page to start an inquiry."
          actionText="Go to Projects"
          onAction={() => navigate('/projects')}
        />
      ) : viewMode === 'KANBAN' ? (
        /* Kanban Board View */
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start overflow-x-auto pb-4">
          {STATUS_COLUMNS.map((col) => {
            const colCases = cases.filter((c) => c.status === col.id);
            return (
              <div key={col.id} className="p-3 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-3 min-w-[240px]">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold ${col.color}`}>{col.label}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-800 text-slate-300 font-bold">
                    {colCases.length}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {colCases.map((c) => (
                    <div
                      key={c.caseId}
                      onClick={() => {
                        setSelectedCase(c);
                        setSelectedStatus(c.status);
                      }}
                      className="p-3 rounded-xl bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer space-y-2 group shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-brand-400">{c.caseId}</span>
                        <RiskBadge level={c.priority} size="sm" showScore={false} />
                      </div>
                      <div className="text-xs font-medium text-slate-200 line-clamp-2 leading-snug">
                        {c.projectTitle}
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-900">
                        <span>{c.district}, {c.state}</span>
                        <span className="font-mono text-slate-300">₹{(c.allocatedAmount / 100000).toFixed(1)}L</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table List View */
        <div className="rounded-2xl bg-slate-900/50 border border-slate-800 overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 text-slate-400 uppercase font-semibold text-[10px] bg-slate-950/60">
              <tr>
                <th className="py-3 px-3">Case ID</th>
                <th className="py-3 px-3">Project</th>
                <th className="py-3 px-3">Location</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Priority</th>
                <th className="py-3 px-3">Assigned Officer</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {cases.map((c) => (
                <tr
                  key={c.caseId}
                  onClick={() => {
                    setSelectedCase(c);
                    setSelectedStatus(c.status);
                  }}
                  className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                >
                  <td className="py-3 px-3 font-mono font-bold text-brand-400">{c.caseId}</td>
                  <td className="py-3 px-3 max-w-xs">
                    <div className="font-medium text-slate-200 truncate">{c.projectTitle}</div>
                    <div className="text-[11px] font-mono text-slate-500">{c.projectId}</div>
                  </td>
                  <td className="py-3 px-3 text-slate-300">
                    {c.district}, {c.state}
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold bg-slate-800 text-slate-200 border border-slate-700">
                      {c.status}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <RiskBadge level={c.priority} size="sm" showScore={false} />
                  </td>
                  <td className="py-3 px-3 text-slate-300">{c.assignedToName || 'Unassigned'}</td>
                  <td className="py-3 px-3 text-right text-brand-400 font-semibold group-hover:underline">
                    View Case
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Case Details & Investigation Modal */}
      {selectedCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-sm font-bold text-brand-400">{selectedCase.caseId}</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-800 text-slate-300">
                  {selectedCase.status}
                </span>
              </div>
              <button onClick={() => setSelectedCase(null)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-bold text-white">{selectedCase.projectTitle}</h3>
                <div className="text-xs text-slate-400 flex items-center gap-2 mt-1">
                  <span>Project: {selectedCase.projectId}</span>
                  <span>•</span>
                  <span>{selectedCase.district}, {selectedCase.state}</span>
                </div>
              </div>

              {/* Initial Flag Reasons */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Initial Flag Reasons:
                </div>
                <ul className="text-xs text-red-300 space-y-1">
                  {selectedCase.initialFlagReasons.map((r, idx) => (
                    <li key={idx} className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Case Notes History */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Investigator Notes & Audit Log ({selectedCase.notes?.length || 0})
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {selectedCase.notes && selectedCase.notes.length > 0 ? (
                    selectedCase.notes.map((n, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 text-xs space-y-1">
                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span className="font-semibold text-brand-400">{n.authorName} ({n.authorRole})</span>
                          <span className="font-mono text-slate-500">{new Date(n.createdAt).toLocaleString()}</span>
                        </div>
                        <p className="text-slate-200">{n.content}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-slate-500 py-2">No notes added yet.</div>
                  )}
                </div>
              </div>

              {/* Form to Update Status and Add Note */}
              <form onSubmit={handleUpdateCase} className="space-y-3 pt-3 border-t border-slate-800">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Update Status</label>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                    >
                      <option value="OPEN">OPEN</option>
                      <option value="UNDER_REVIEW">UNDER_REVIEW</option>
                      <option value="ESCALATED">ESCALATED (MoSPI Review)</option>
                      <option value="VERIFIED">VERIFIED (Actioned)</option>
                      <option value="DISMISSED">DISMISSED (Inlier)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Deep Intelligence</label>
                    <button
                      type="button"
                      onClick={() => navigate(`/projects/${selectedCase.projectId}`)}
                      className="w-full px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <span>Open Project View</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Add Note / Finding</label>
                  <textarea
                    rows={2}
                    value={newNoteInput}
                    onChange={(e) => setNewNoteInput(e.target.value)}
                    placeholder="Enter audit finding, voucher inspection summary, or verification remarks..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedCase(null)}
                    className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={updating}
                    className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-brand-900/40 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Save Update</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
