import React, { useState } from 'react';
import { Search, Bell, Sparkles, LogOut, ShieldCheck, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

interface NavbarProps {
  onOpenDemoModal: () => void;
  onOpenSearch: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenDemoModal, onOpenSearch }) => {
  const { user, logout, switchDemoRole } = useAuth();
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Search Trigger */}
      <div className="flex items-center gap-4 flex-1 max-w-lg">
        <button
          onClick={onOpenSearch}
          className="w-full flex items-center justify-between px-3.5 py-2 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-slate-400 hover:border-slate-700 transition-all shadow-inner"
        >
          <div className="flex items-center gap-2.5">
            <Search className="w-4 h-4 text-slate-500" />
            <span>Search project ID, title, contractor, district...</span>
          </div>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-slate-800 text-slate-400 rounded border border-slate-700">
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3.5">
        {/* Environment Banner */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-amber-950/40 border border-amber-800/60 rounded-lg text-[11px] font-medium text-amber-400 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <span>DEMO ENVIRONMENT — SYNTHETIC DATA</span>
        </div>

        {/* 1-Click Run Demo Pipeline Button */}
        <button
          onClick={onOpenDemoModal}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-brand-900/40 transition-all cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Launch Demo</span>
        </button>

        {/* Alerts Link */}
        <Link
          to="/alerts"
          className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-all relative"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-ping" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </Link>

        {/* Role & User Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-2.5 p-1.5 pr-3 bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-xl text-xs text-slate-200 transition-all cursor-pointer"
          >
            <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-brand-400 font-semibold text-xs">
              {user?.name ? user.name.charAt(0) : 'U'}
            </div>
            <div className="text-left hidden sm:block">
              <div className="font-semibold text-slate-100 text-xs truncate max-w-[130px]">
                {user?.name || 'Authorized Auditor'}
              </div>
              <div className="text-[10px] text-brand-400 font-mono font-medium">
                {user?.role || 'AUDITOR'}
              </div>
            </div>
          </button>

          {/* Dropdown for 1-Click Role Switcher */}
          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-3 py-2 border-b border-slate-800 mb-1">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Switch Demo Role
                </div>
              </div>
              <button
                onClick={() => {
                  switchDemoRole('ADMIN');
                  setShowRoleMenu(false);
                }}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs flex items-center justify-between ${
                  user?.role === 'ADMIN' ? 'bg-brand-500/10 text-brand-400 font-bold' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span>ADMIN (Full Control)</span>
                {user?.role === 'ADMIN' && <ShieldCheck className="w-3.5 h-3.5 text-brand-400" />}
              </button>
              <button
                onClick={() => {
                  switchDemoRole('AUDITOR');
                  setShowRoleMenu(false);
                }}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs flex items-center justify-between ${
                  user?.role === 'AUDITOR' ? 'bg-brand-500/10 text-brand-400 font-bold' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span>AUDITOR (Cases & Reports)</span>
                {user?.role === 'AUDITOR' && <UserCheck className="w-3.5 h-3.5 text-brand-400" />}
              </button>
              <button
                onClick={() => {
                  switchDemoRole('ANALYST');
                  setShowRoleMenu(false);
                }}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs flex items-center justify-between ${
                  user?.role === 'ANALYST' ? 'bg-brand-500/10 text-brand-400 font-bold' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span>ANALYST (ML & Analytics)</span>
                {user?.role === 'ANALYST' && <UserCheck className="w-3.5 h-3.5 text-brand-400" />}
              </button>
              <button
                onClick={() => {
                  switchDemoRole('VIEWER');
                  setShowRoleMenu(false);
                }}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs flex items-center justify-between ${
                  user?.role === 'VIEWER' ? 'bg-brand-500/10 text-brand-400 font-bold' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span>VIEWER (Read-Only)</span>
                {user?.role === 'VIEWER' && <UserCheck className="w-3.5 h-3.5 text-brand-400" />}
              </button>

              <div className="border-t border-slate-800 mt-2 pt-1">
                <button
                  onClick={() => {
                    logout();
                    setShowRoleMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-red-400 hover:bg-red-950/40 flex items-center gap-2"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
