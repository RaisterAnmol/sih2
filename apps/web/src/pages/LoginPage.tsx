import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, LogIn, Sparkles, UserCheck, ShieldAlert, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, switchDemoRole } = useAuth();
  const navigate = useNavigate();

  const handleCustomLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to authenticate');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role: 'ADMIN' | 'AUDITOR' | 'ANALYST' | 'VIEWER') => {
    setError('');
    setLoading(true);
    try {
      await switchDemoRole(role);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to authenticate with demo user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-100">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-emerald-400 flex items-center justify-center text-white font-bold shadow-xl shadow-brand-900/50 mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">MPLAD Insight</h1>
          <p className="text-xs text-slate-400">AI-Powered Anomaly & Efficiency Intelligence Platform</p>
        </div>

        {/* 1-Click Quick Demo Sign-in Box */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-brand-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>1-Click Demo Logins</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">Password: Demo@12345</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleDemoLogin('AUDITOR')}
              disabled={loading}
              className="p-3 rounded-xl bg-slate-950/70 hover:bg-slate-800 border border-slate-800 hover:border-brand-500/50 text-left transition-all group"
            >
              <div className="text-xs font-semibold text-white group-hover:text-brand-400 flex items-center justify-between">
                <span>Auditor</span>
                <UserCheck className="w-3.5 h-3.5 text-slate-500 group-hover:text-brand-400" />
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5 truncate">auditor@mplad-insight.demo</div>
            </button>

            <button
              onClick={() => handleDemoLogin('ADMIN')}
              disabled={loading}
              className="p-3 rounded-xl bg-slate-950/70 hover:bg-slate-800 border border-slate-800 hover:border-brand-500/50 text-left transition-all group"
            >
              <div className="text-xs font-semibold text-white group-hover:text-brand-400 flex items-center justify-between">
                <span>Admin</span>
                <ShieldCheck className="w-3.5 h-3.5 text-slate-500 group-hover:text-brand-400" />
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5 truncate">admin@mplad-insight.demo</div>
            </button>

            <button
              onClick={() => handleDemoLogin('ANALYST')}
              disabled={loading}
              className="p-3 rounded-xl bg-slate-950/70 hover:bg-slate-800 border border-slate-800 hover:border-brand-500/50 text-left transition-all group"
            >
              <div className="text-xs font-semibold text-white group-hover:text-brand-400 flex items-center justify-between">
                <span>Analyst</span>
                <UserCheck className="w-3.5 h-3.5 text-slate-500 group-hover:text-brand-400" />
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5 truncate">analyst@mplad-insight.demo</div>
            </button>

            <button
              onClick={() => handleDemoLogin('VIEWER')}
              disabled={loading}
              className="p-3 rounded-xl bg-slate-950/70 hover:bg-slate-800 border border-slate-800 hover:border-brand-500/50 text-left transition-all group"
            >
              <div className="text-xs font-semibold text-white group-hover:text-brand-400 flex items-center justify-between">
                <span>Viewer</span>
                <UserCheck className="w-3.5 h-3.5 text-slate-500 group-hover:text-brand-400" />
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5 truncate">viewer@mplad-insight.demo</div>
            </button>
          </div>
        </div>

        {/* Custom Login Form */}
        <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4">
          <div className="text-xs font-semibold text-slate-400">Or enter credentials manually</div>

          {error && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-800 text-xs text-red-300 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleCustomLogin} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="officer@nic.in"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-brand-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-lg shadow-brand-900/40 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In to Station</span>
            </button>
          </form>
        </div>

        <div className="text-center">
          <button
            onClick={() => navigate('/')}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors inline-flex items-center gap-1"
          >
            <span>Back to Public Overview</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
