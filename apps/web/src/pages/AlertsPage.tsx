import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, AlertTriangle, ArrowRight } from 'lucide-react';
import api from '../services/api';
import { AlertItem } from '../types';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { EmptyState } from '../components/common/EmptyState';

export const AlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/alerts?limit=50');
      setAlerts(res.data.data.alerts);
      setUnreadCount(res.data.data.unreadCount);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const markAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.put(`/alerts/${id}/read`);
      setAlerts((prev) => prev.map((a) => (a.alertId === id ? { ...a, isRead: true } : a)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-brand-400" />
            <span>Real-Time Alert Center</span>
          </h1>
          <p className="text-xs text-slate-400">
            High-priority automated alerts triggered by risk compound models ({unreadCount} unread)
          </p>
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton count={5} className="h-16" />
      ) : alerts.length === 0 ? (
        <EmptyState title="All Caught Up!" description="No active high-priority alerts at this time." />
      ) : (
        <div className="space-y-2.5">
          {alerts.map((a) => (
            <div
              key={a.alertId}
              onClick={() => a.projectId && navigate(`/projects/${a.projectId}`)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                a.isRead
                  ? 'bg-slate-900/40 border-slate-800/80 text-slate-400'
                  : 'bg-slate-900/80 border-slate-700 text-slate-100 shadow-md shadow-brand-950/20'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    a.priority === 'CRITICAL' || a.priority === 'HIGH'
                      ? 'bg-red-950/80 text-red-400 border border-red-800'
                      : 'bg-amber-950/80 text-amber-400 border border-amber-800'
                  }`}
                >
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{a.title}</span>
                    {!a.isRead && (
                      <span className="w-2 h-2 rounded-full bg-brand-400" />
                    )}
                  </div>
                  <p className="text-xs text-slate-300">{a.message}</p>
                  <div className="text-[10px] text-slate-500 font-mono pt-1">
                    {new Date(a.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {!a.isRead && (
                  <button
                    onClick={(e) => markAsRead(a.alertId, e)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                    title="Mark as read"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                  </button>
                )}
                {a.projectId && (
                  <ArrowRight className="w-4 h-4 text-slate-500 hover:text-brand-400" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
