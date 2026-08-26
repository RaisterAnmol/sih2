import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  RotateCcw,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import api from '../services/api';
import { Project, RiskLevel } from '../types';
import { RiskBadge } from '../components/common/RiskBadge';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { EmptyState } from '../components/common/EmptyState';

export const ProjectsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  // Filters state
  const page = parseInt(searchParams.get('page') || '1', 10);
  const search = searchParams.get('search') || '';
  const state = searchParams.get('state') || 'ALL';
  const district = searchParams.get('district') || 'ALL';
  const category = searchParams.get('category') || 'ALL';
  const riskLevel = searchParams.get('riskLevel') || 'ALL';
  const sortBy = searchParams.get('sortBy') || 'riskScore';
  const sortOrder = searchParams.get('sortOrder') || 'desc';

  const [searchInput, setSearchInput] = useState(search);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', String(page));
      params.append('limit', '15');
      if (search) params.append('search', search);
      if (state !== 'ALL') params.append('state', state);
      if (district !== 'ALL') params.append('district', district);
      if (category !== 'ALL') params.append('category', category);
      if (riskLevel !== 'ALL') params.append('riskLevel', riskLevel);
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);

      const res = await api.get(`/projects?${params.toString()}`);
      setProjects(res.data.data.projects);
      setTotal(res.data.data.pagination.total);
      setTotalPages(res.data.data.pagination.totalPages);
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [page, search, state, district, category, riskLevel, sortBy, sortOrder]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    if (searchInput.trim()) {
      newParams.set('search', searchInput.trim());
    } else {
      newParams.delete('search');
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handleFilterChange = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === 'ALL') {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handleSort = (field: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (sortBy === field) {
      newParams.set('sortOrder', sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      newParams.set('sortBy', field);
      newParams.set('sortOrder', 'desc');
    }
    setSearchParams(newParams);
  };

  const handleExportCSV = () => {
    const params = new URLSearchParams();
    if (state !== 'ALL') params.append('state', state);
    if (riskLevel !== 'ALL') params.append('riskLevel', riskLevel);
    window.open(`/api/projects/export/csv?${params.toString()}`, '_blank');
  };

  const resetFilters = () => {
    setSearchInput('');
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">MPLAD Projects Explorer</h1>
          <p className="text-xs text-slate-400">
            Server-side paginated repository with live AI anomaly filtering ({total.toLocaleString()} total works)
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-brand-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by project ID, title, contractor name, or district..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold shadow-md transition-colors"
          >
            Search
          </button>
          {(search || state !== 'ALL' || riskLevel !== 'ALL' || category !== 'ALL') && (
            <button
              type="button"
              onClick={resetFilters}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs flex items-center gap-1 transition-colors"
              title="Reset all filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </form>

        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          {/* State Filter */}
          <select
            value={state}
            onChange={(e) => handleFilterChange('state', e.target.value)}
            className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All States</option>
            <option value="Maharashtra">Maharashtra</option>
            <option value="Uttar Pradesh">Uttar Pradesh</option>
            <option value="Tamil Nadu">Tamil Nadu</option>
            <option value="Karnataka">Karnataka</option>
            <option value="Gujarat">Gujarat</option>
            <option value="Rajasthan">Rajasthan</option>
            <option value="West Bengal">West Bengal</option>
            <option value="Bihar">Bihar</option>
          </select>

          {/* Risk Level Filter */}
          <select
            value={riskLevel}
            onChange={(e) => handleFilterChange('riskLevel', e.target.value)}
            className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Risk Tiers</option>
            <option value="CRITICAL">Critical (80-100)</option>
            <option value="HIGH">High (60-79)</option>
            <option value="MEDIUM">Medium (30-59)</option>
            <option value="LOW">Low (0-29)</option>
          </select>

          {/* Category Filter */}
          <select
            value={category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Categories</option>
            <option value="Drinking Water & Sanitation">Drinking Water & Sanitation</option>
            <option value="Education Infrastructure">Education Infrastructure</option>
            <option value="Public Health & Wellness">Public Health & Wellness</option>
            <option value="Roads, Pathways & Bridges">Roads, Pathways & Bridges</option>
            <option value="Community Asset & Halls">Community Asset & Halls</option>
            <option value="Irrigation & Rural Electrification">Irrigation & Rural Electrification</option>
          </select>
        </div>
      </div>

      {/* Projects Table */}
      <div className="rounded-2xl bg-slate-900/50 border border-slate-800 overflow-hidden">
        {loading ? (
          <div className="p-6">
            <LoadingSkeleton count={8} className="h-12" />
          </div>
        ) : projects.length === 0 ? (
          <EmptyState
            title="No projects match criteria"
            description="Try modifying search keywords or clearing state/risk filters."
            actionText="Reset Filters"
            onAction={resetFilters}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 text-slate-400 uppercase font-semibold text-[10px] bg-slate-950/60">
                <tr>
                  <th
                    onClick={() => handleSort('projectId')}
                    className="py-3 px-3 cursor-pointer hover:text-white"
                  >
                    <div className="flex items-center gap-1">
                      <span>Project ID</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3 px-3">Title & Category</th>
                  <th className="py-3 px-3">District & State</th>
                  <th className="py-3 px-3">Contractor</th>
                  <th
                    onClick={() => handleSort('allocatedAmount')}
                    className="py-3 px-3 cursor-pointer hover:text-white"
                  >
                    <div className="flex items-center gap-1">
                      <span>Sanctioned (INR)</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('progress')}
                    className="py-3 px-3 cursor-pointer hover:text-white"
                  >
                    <div className="flex items-center gap-1">
                      <span>Progress</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('riskScore')}
                    className="py-3 px-3 cursor-pointer hover:text-white"
                  >
                    <div className="flex items-center gap-1">
                      <span>Risk Assessment</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {projects.map((p) => (
                  <tr
                    key={p.projectId}
                    onClick={() => navigate(`/projects/${p.projectId}`)}
                    className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                  >
                    <td className="py-3 px-3 font-mono font-semibold text-brand-400 whitespace-nowrap">
                      {p.projectId}
                    </td>
                    <td className="py-3 px-3 max-w-xs">
                      <div className="font-medium text-slate-200 truncate">{p.title}</div>
                      <div className="text-[11px] text-slate-400">{p.category}</div>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap text-slate-300">
                      {p.district}, {p.state}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap text-slate-300">
                      {p.contractorName}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-200 whitespace-nowrap">
                      ₹{(p.allocatedAmount / 100000).toFixed(1)} L
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-brand-500 rounded-full"
                            style={{ width: `${p.progress}%` }}
                          />
                        </div>
                        <span className="font-mono text-[11px] text-slate-400">{p.progress}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <RiskBadge level={p.riskLevel} score={p.riskScore} />
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <span className="text-brand-400 font-semibold text-[11px] group-hover:underline flex items-center justify-end gap-1">
                        <span>Details</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between text-xs text-slate-400">
          <div>
            Showing <span className="text-white font-mono">{projects.length}</span> of{' '}
            <span className="text-white font-mono">{total.toLocaleString()}</span> works
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const newParams = new URLSearchParams(searchParams);
                newParams.set('page', String(Math.max(1, page - 1)));
                setSearchParams(newParams);
              }}
              disabled={page <= 1}
              className="p-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-30 border border-slate-800 rounded-lg text-slate-300"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono text-slate-300">
              Page {page} of {totalPages || 1}
            </span>
            <button
              onClick={() => {
                const newParams = new URLSearchParams(searchParams);
                newParams.set('page', String(Math.min(totalPages, page + 1)));
                setSearchParams(newParams);
              }}
              disabled={page >= totalPages}
              className="p-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-30 border border-slate-800 rounded-lg text-slate-300"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
