import React, { useState, useEffect } from 'react';
import { Settings, Sliders, CheckCircle2, RotateCcw, ShieldCheck, Cpu } from 'lucide-react';
import api from '../services/api';

export const SettingsPage: React.FC = () => {
  const [weights, setWeights] = useState({
    financial: 0.25,
    contractor: 0.20,
    duplicate: 0.15,
    geographic: 0.10,
    temporal: 0.10,
    efficiency: 0.10,
    dataQuality: 0.10,
  });
  const [costMultiplier, setCostMultiplier] = useState(2.2);
  const [monopolyShare, setMonopolyShare] = useState(30);
  const [similarityThreshold, setSimilarityThreshold] = useState(0.68);
  const [savedMsg, setSavedMsg] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await api.get('/settings');
        const cfg = res.data.data.configuration;
        if (cfg) {
          if (cfg.weights) setWeights(cfg.weights);
          if (cfg.peerCostOutlierMultiplier) setCostMultiplier(cfg.peerCostOutlierMultiplier);
          if (cfg.contractorMonopolyPercent) setMonopolyShare(cfg.contractorMonopolyPercent);
          if (cfg.similarityThreshold) setSimilarityThreshold(cfg.similarityThreshold);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadConfig();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedMsg('');
    try {
      await api.put('/settings', {
        weights,
        peerCostOutlierMultiplier: costMultiplier,
        contractorMonopolyPercent: monopolyShare,
        similarityThreshold,
      });
      setSavedMsg('Risk scoring weights and detection thresholds updated successfully!');
      setTimeout(() => setSavedMsg(''), 3000);
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const handleWeightChange = (key: string, val: number) => {
    setWeights((prev) => ({ ...prev, [key]: val }));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-brand-400" />
          <span>Risk Engine Weights & Governance Settings</span>
        </h1>
        <p className="text-xs text-slate-400">
          Configure multi-criteria anomaly detection weights, sensitivity thresholds, and audit parameters
        </p>
      </div>

      {savedMsg && (
        <div className="p-4 rounded-xl bg-brand-950 border border-brand-800 text-xs text-brand-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0" />
          <span>{savedMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Risk Weights Sliders */}
        <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-brand-400" />
                <span>Unified Risk Score Weight Configuration</span>
              </h2>
              <p className="text-xs text-slate-400">
                Adjust contribution percentage of each intelligence dimension toward final 0-100 score
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            {/* Financial Anomaly Weight */}
            <div className="space-y-1.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-200">Financial Cost Anomaly Weight</span>
                <span className="font-mono text-brand-400 font-bold">{Math.round(weights.financial * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="0.5"
                step="0.05"
                value={weights.financial}
                onChange={(e) => handleWeightChange('financial', parseFloat(e.target.value))}
                className="w-full accent-brand-500 cursor-pointer"
              />
            </div>

            {/* Contractor Monopoly Weight */}
            <div className="space-y-1.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-200">Contractor Monopoly Weight</span>
                <span className="font-mono text-brand-400 font-bold">{Math.round(weights.contractor * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="0.5"
                step="0.05"
                value={weights.contractor}
                onChange={(e) => handleWeightChange('contractor', parseFloat(e.target.value))}
                className="w-full accent-brand-500 cursor-pointer"
              />
            </div>

            {/* Duplicate / Similarity Weight */}
            <div className="space-y-1.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-200">Duplicate / Scope Similarity Weight</span>
                <span className="font-mono text-brand-400 font-bold">{Math.round(weights.duplicate * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="0.5"
                step="0.05"
                value={weights.duplicate}
                onChange={(e) => handleWeightChange('duplicate', parseFloat(e.target.value))}
                className="w-full accent-brand-500 cursor-pointer"
              />
            </div>

            {/* Geographic Cluster Weight */}
            <div className="space-y-1.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-200">Geographic Spatial Cluster Weight</span>
                <span className="font-mono text-brand-400 font-bold">{Math.round(weights.geographic * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="0.5"
                step="0.05"
                value={weights.geographic}
                onChange={(e) => handleWeightChange('geographic', parseFloat(e.target.value))}
                className="w-full accent-brand-500 cursor-pointer"
              />
            </div>

            {/* Temporal March Rush Weight */}
            <div className="space-y-1.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-200">Temporal / March Rush Weight</span>
                <span className="font-mono text-brand-400 font-bold">{Math.round(weights.temporal * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="0.5"
                step="0.05"
                value={weights.temporal}
                onChange={(e) => handleWeightChange('temporal', parseFloat(e.target.value))}
                className="w-full accent-brand-500 cursor-pointer"
              />
            </div>

            {/* Efficiency Anomaly Weight */}
            <div className="space-y-1.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-200">Execution Delay & Progress Weight</span>
                <span className="font-mono text-brand-400 font-bold">{Math.round(weights.efficiency * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="0.5"
                step="0.05"
                value={weights.efficiency}
                onChange={(e) => handleWeightChange('efficiency', parseFloat(e.target.value))}
                className="w-full accent-brand-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Sensitivity Bounds */}
        <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Cpu className="w-4 h-4 text-brand-400" />
            <span>Detection Sensitivity Thresholds</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Cost Outlier Multiplier (x Peer Median)</label>
              <input
                type="number"
                step="0.1"
                min="1.5"
                max="5.0"
                value={costMultiplier}
                onChange={(e) => setCostMultiplier(parseFloat(e.target.value))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Contractor Monopoly Threshold (% District Share)</label>
              <input
                type="number"
                min="20"
                max="60"
                value={monopolyShare}
                onChange={(e) => setMonopolyShare(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">TF-IDF Similarity Cosine Threshold</label>
              <input
                type="number"
                step="0.02"
                min="0.5"
                max="0.95"
                value={similarityThreshold}
                onChange={(e) => setSimilarityThreshold(parseFloat(e.target.value))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-brand-900/40 cursor-pointer transition-all"
          >
            {saving ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </form>
    </div>
  );
};
