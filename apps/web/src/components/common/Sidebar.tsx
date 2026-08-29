import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  AlertTriangle,
  Briefcase,
  Building2,
  MapPin,
  TrendingUp,
  Gauge,
  CheckCircle,
  UploadCloud,
  FileText,
  Bell,
  History,
  Settings,
  ShieldCheck,
  Home,
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Overview', to: '/', icon: Home, exact: true },
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Projects Explorer', to: '/projects', icon: FolderKanban },
  { label: 'Anomalies Catalog', to: '/anomalies', icon: AlertTriangle },
  { label: 'Risk Cases', to: '/risk-cases', icon: Briefcase },
  { label: 'Contractors', to: '/contractors', icon: Building2 },
  { label: 'Geographic GIS', to: '/geographic', icon: MapPin },
  { label: 'Financial Analytics', to: '/analytics/financial', icon: TrendingUp },
  { label: 'Efficiency Analytics', to: '/analytics/efficiency', icon: Gauge },
  { label: 'Data Quality', to: '/data-quality', icon: CheckCircle },
  { label: 'Data Import', to: '/import', icon: UploadCloud },
  { label: 'Audit Reports', to: '/reports', icon: FileText },
  { label: 'Alerts', to: '/alerts', icon: Bell },
  { label: 'Audit Logs', to: '/audit-logs', icon: History },
  { label: 'System Settings', to: '/settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-950 flex flex-col h-screen sticky top-0 shrink-0 z-40 select-none">
      {/* Brand Header */}
      <div className="h-16 px-5 border-b border-slate-800 flex items-center gap-3 bg-slate-950/80">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-emerald-400 flex items-center justify-center text-white shadow-lg shadow-brand-900/40 font-bold">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <div className="font-bold text-sm text-white tracking-wide flex items-center gap-1.5">
            <span>MPLAD INSIGHT</span>
            <span className="px-1.5 py-0.2 bg-brand-950 text-brand-400 text-[10px] rounded border border-brand-800/80 font-mono">
              v1.0
            </span>
          </div>
          <div className="text-[10px] text-slate-400 font-medium">
            MoSPI Scheme Intelligence (PS26102)
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
        <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
          Intelligence Platform
        </div>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              className={({ isActive }) =>
                `sidebar-link flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-brand-600/20 text-brand-400 font-semibold border border-brand-500/40 shadow-sm shadow-brand-950/50'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/80'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Footer System Status */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/60">
        <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5 text-[11px]">
          <div className="flex items-center justify-between text-slate-400">
            <span>API Gateway</span>
            <span className="flex items-center gap-1 text-emerald-400 font-mono font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Operational
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span>Database</span>
            <span className="flex items-center gap-1 text-emerald-400 font-mono font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Active
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span>AI Engine</span>
            <span className="flex items-center gap-1 text-emerald-400 font-mono font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Ensemble Ready
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
