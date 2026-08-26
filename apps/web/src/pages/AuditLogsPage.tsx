import React, { useState, useEffect } from 'react';
import { History, ShieldCheck, Search, Filter } from 'lucide-react';
import api from '../services/api';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    async function loadLogs() {
      setLoading(true);
      try {
        const res = await api.get('/audit-log?limit=50');
        setLogs(res.data.data.logs);
        setTotal(res.data.data.pagination.total);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadLogs();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <History className="w-5 h-5 text-brand-400" />
          <span>Security & Auditor Activity Trail</span>
        </h1>
        <p className="text-xs text-slate-400">
          Immutable audit records of logins, case status changes, ML scans, dataset imports, and configuration updates
        </p>
      </div>

      {/* Audit Logs Table */}
      <div className="rounded-2xl bg-slate-900/50 border border-slate-800 overflow-hidden">
        {loading ? (
          <div className="p-6">
            <LoadingSkeleton count={8} className="h-12" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 text-slate-400 uppercase font-semibold text-[10px] bg-slate-950/60">
                <tr>
                  <th className="py-3 px-3">Timestamp</th>
                  <th className="py-3 px-3">User</th>
                  <th className="py-3 px-3">Role</th>
                  <th className="py-3 px-3">Action</th>
                  <th className="py-3 px-3">Resource</th>
                  <th className="py-3 px-3">Audit Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                {logs.map((l) => (
                  <tr key={l._id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-3 text-slate-400 whitespace-nowrap">
                      {new Date(l.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-white font-sans font-semibold">
                      {l.userName}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-brand-400">
                        {l.userRole}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-200">{l.action}</td>
                    <td className="py-3 px-3 text-slate-400">{l.resource}</td>
                    <td className="py-3 px-3 font-sans text-slate-300 max-w-md">{l.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
