import React from 'react';
import { FileText, Download, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const reports = [
    {
      title: 'Scheme Overview Audit Report (CSV)',
      desc: 'Complete export of all 5,200+ works with risk levels, confidence scores, and anomaly counts.',
      format: 'CSV Format',
      url: '/api/reports/overview/csv',
    },
    {
      title: 'High-Risk Works Audit Dossier (CSV)',
      desc: 'Targeted dossier filtering projects exceeding risk score 60 for mandatory physical review.',
      format: 'CSV Format',
      url: '/api/projects/export/csv?riskLevel=HIGH',
    },
    {
      title: 'Sample Project Investigation PDF Report',
      desc: 'Official MoSPI formatted PDF report with executive findings, cost comparisons, and audit signatures.',
      format: 'PDF Document',
      url: '/api/reports/project/MPLAD-2023-MH-PUN-00085/pdf',
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-brand-400" />
          <span>Audit & Investigation Report Center</span>
        </h1>
        <p className="text-xs text-slate-400">
          Generate tamper-evident statutory audit reports, project risk summaries, and administrative review dossiers
        </p>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reports.map((r, idx) => (
          <div
            key={idx}
            className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all shadow-sm"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-400">
                  <FileText className="w-4 h-4" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-950 text-slate-300 border border-slate-800">
                  {r.format}
                </span>
              </div>
              <h3 className="text-sm font-bold text-white leading-snug">{r.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{r.desc}</p>
            </div>

            <a
              href={r.url}
              target="_blank"
              rel="noreferrer"
              className="w-full py-2.5 px-4 bg-slate-800 hover:bg-brand-600 text-slate-200 hover:text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Official Report</span>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};
