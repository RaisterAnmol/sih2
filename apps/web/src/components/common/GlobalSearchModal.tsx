import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FolderKanban, Building2, MapPin, X, ArrowRight, Loader2 } from 'lucide-react';
import api from '../../services/api';
import { RiskBadge } from './RiskBadge';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ projects: any[]; contractors: any[] }>({ projects: [], contractors: [] });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onClose();
      }
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults({ projects: [], contractors: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const [projRes, contRes] = await Promise.all([
          api.get(`/projects?search=${encodeURIComponent(query)}&limit=5`),
          api.get(`/contractors?search=${encodeURIComponent(query)}&limit=3`),
        ]);
        setResults({
          projects: projRes.data.data.projects || [],
          contractors: contRes.data.data.contractors || [],
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        {/* Search Input Box */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Type project ID, title, contractor name, or district..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
          />
          {loading && <Loader2 className="w-4 h-4 text-brand-400 animate-spin shrink-0" />}
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Container */}
        <div className="max-h-96 overflow-y-auto p-4 space-y-4">
          {query.trim().length < 2 && (
            <div className="py-8 text-center text-xs text-slate-500">
              Type at least 2 characters to search live projects, contractors, and regions.
            </div>
          )}

          {/* Projects Results */}
          {results.projects.length > 0 && (
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <FolderKanban className="w-3.5 h-3.5" />
                <span>Projects ({results.projects.length})</span>
              </div>
              <div className="space-y-1.5">
                {results.projects.map((p) => (
                  <div
                    key={p.projectId}
                    onClick={() => {
                      navigate(`/projects/${p.projectId}`);
                      onClose();
                    }}
                    className="p-2.5 rounded-xl bg-slate-950/50 hover:bg-slate-800/80 border border-slate-800/80 flex items-center justify-between cursor-pointer transition-all"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-brand-400 font-semibold">{p.projectId}</span>
                        <RiskBadge level={p.riskLevel} score={p.riskScore} size="sm" />
                      </div>
                      <div className="text-xs text-slate-200 font-medium truncate max-w-md">{p.title}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-3">
                        <span>{p.district}, {p.state}</span>
                        <span>•</span>
                        <span>₹{(p.allocatedAmount / 100000).toFixed(1)} Lakh</span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contractors Results */}
          {results.contractors.length > 0 && (
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                <span>Contractors ({results.contractors.length})</span>
              </div>
              <div className="space-y-1.5">
                {results.contractors.map((c) => (
                  <div
                    key={c.contractorId}
                    onClick={() => {
                      navigate(`/contractors/${c.contractorId}`);
                      onClose();
                    }}
                    className="p-2.5 rounded-xl bg-slate-950/50 hover:bg-slate-800/80 border border-slate-800/80 flex items-center justify-between cursor-pointer transition-all"
                  >
                    <div>
                      <div className="text-xs text-slate-100 font-semibold">{c.name}</div>
                      <div className="text-[11px] text-slate-400">
                        {c.totalProjects} projects • ₹{(c.totalAllocatedValue / 10000000).toFixed(1)} Cr total value
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {query.trim().length >= 2 && results.projects.length === 0 && results.contractors.length === 0 && !loading && (
            <div className="py-8 text-center text-xs text-slate-400">
              No results found for "{query}".
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
