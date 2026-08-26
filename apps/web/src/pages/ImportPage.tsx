import React, { useState } from 'react';
import { UploadCloud, CheckCircle2, AlertTriangle, FileText, ArrowRight, Loader2 } from 'lucide-react';
import Papa from 'papaparse';
import api from '../services/api';

export const ImportPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setImportResult(null);

      Papa.parse(selectedFile, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results: any) => {
          setParsedRows(results.data);
        },
      });
    }
  };

  const handleImport = async () => {
    if (!file || parsedRows.length === 0) return;
    setImporting(true);
    try {
      const res = await api.post('/import/csv', {
        rows: parsedRows,
        filename: file.name,
      });
      setImportResult(res.data.data);
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to import CSV dataset');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <UploadCloud className="w-5 h-5 text-brand-400" />
          <span>MPLAD Dataset Ingestion & Validation Gateway</span>
        </h1>
        <p className="text-xs text-slate-400">
          Upload custom CSV/XLSX work registries with client-side schema verification, automated entity normalization, and AI anomaly triggering
        </p>
      </div>

      {/* Upload Zone Card */}
      <div className="p-8 rounded-2xl bg-slate-900/50 border-2 border-dashed border-slate-800 hover:border-brand-500/50 transition-all text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-400 mx-auto">
          <UploadCloud className="w-6 h-6" />
        </div>

        <div className="space-y-1">
          <div className="text-sm font-semibold text-white">Select or drop MPLAD CSV file</div>
          <div className="text-xs text-slate-400">Supports standard UTF-8 encoded CSV files up to 50MB</div>
        </div>

        <div>
          <label className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 cursor-pointer transition-colors inline-block">
            <span>Browse Files</span>
            <input type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
          </label>
        </div>

        {file && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-brand-400">
            <FileText className="w-3.5 h-3.5" />
            <span>{file.name} ({parsedRows.length} rows detected)</span>
          </div>
        )}
      </div>

      {/* Import Results Banner */}
      {importResult && (
        <div className="p-6 rounded-2xl bg-brand-950/40 border border-brand-800 space-y-3">
          <div className="flex items-center gap-2 text-brand-400 font-bold text-sm">
            <CheckCircle2 className="w-5 h-5" />
            <span>Dataset Ingested & Asynchronous ML Analysis Triggered!</span>
          </div>
          <div className="grid grid-cols-3 gap-4 text-xs font-mono">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-slate-400 block">Total Rows:</span>
              <span className="text-lg font-bold text-white">{importResult.totalRows}</span>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-slate-400 block">Valid Ingested:</span>
              <span className="text-lg font-bold text-emerald-400">{importResult.validRows}</span>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-slate-400 block">Validation Errors:</span>
              <span className="text-lg font-bold text-amber-400">{importResult.errorRows}</span>
            </div>
          </div>
        </div>
      )}

      {/* CSV Preview Table */}
      {parsedRows.length > 0 && !importResult && (
        <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white">Previewing First 5 Records</h2>
            <button
              onClick={handleImport}
              disabled={importing}
              className="px-5 py-2 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-lg shadow-brand-900/40 flex items-center gap-2 transition-all cursor-pointer"
            >
              {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              <span>{importing ? 'Ingesting & Analyzing...' : `Import ${parsedRows.length} Works`}</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 text-slate-400 uppercase font-semibold text-[10px] bg-slate-950/60">
                <tr>
                  <th className="py-2.5 px-3">Title</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">State</th>
                  <th className="py-2.5 px-3">District</th>
                  <th className="py-2.5 px-3">Allocated Amount</th>
                  <th className="py-2.5 px-3">Contractor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {parsedRows.slice(0, 5).map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-medium text-slate-200 truncate max-w-xs">{row.title || 'N/A'}</td>
                    <td className="py-2.5 px-3 text-slate-300">{row.category || 'General'}</td>
                    <td className="py-2.5 px-3 text-slate-300">{row.state || 'N/A'}</td>
                    <td className="py-2.5 px-3 text-slate-300">{row.district || 'N/A'}</td>
                    <td className="py-2.5 px-3 font-mono text-emerald-400">
                      ₹{Number(row.allocatedAmount || row.cost || 0).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">{row.contractorName || 'Unknown'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
