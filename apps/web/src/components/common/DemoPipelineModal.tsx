import React, { useState, useEffect } from 'react';
import { Play, CheckCircle2, Loader2, Sparkles, X, ShieldAlert } from 'lucide-react';
import api from '../../services/api';

interface DemoPipelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const PIPELINE_STEPS = [
  'Verifying MongoDB database connection...',
  'Ingesting 5,200 synthetic MPLAD project records...',
  'Validating schema & normalizing state/district entities...',
  'Extracting multidimensional feature vectors...',
  'Running Isolation Forest ensemble anomaly model...',
  'Executing Local Outlier Factor (LOF) peer detection...',
  'Computing TF-IDF cosine similarity matrix for duplicates...',
  'Analyzing contractor portfolio & district monopolization...',
  'Detecting geographic GPS proximity clusters...',
  'Evaluating temporal fiscal year-end sanction spikes...',
  'Calculating unified risk scores (0-100) & confidence...',
  'Synthesizing explainable evidence & audit recommendations...',
  'Creating priority risk cases for auditor review...',
  'Finalizing intelligence platform dashboard.',
];

export const DemoPipelineModal: React.FC<DemoPipelineModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const startDemoPipeline = async () => {
    setIsRunning(true);
    setIsCompleted(false);
    setCurrentStep(0);

    // Progressive step simulation while triggering actual backend seed & ML analysis
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < PIPELINE_STEPS.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          return prev;
        }
      });
    }, 450);

    try {
      await api.post('/demo/launch');
      clearInterval(interval);
      setCurrentStep(PIPELINE_STEPS.length - 1);
      setIsCompleted(true);
      setIsRunning(false);
      setTimeout(() => {
        onSuccess();
      }, 800);
    } catch (err) {
      console.error('Demo launch error:', err);
      clearInterval(interval);
      setIsRunning(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-950/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/20 border border-brand-500/40 flex items-center justify-center text-brand-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Launch Intelligence Demo</h2>
              <p className="text-xs text-slate-400">Deterministic 5,200 MPLAD Project Autonomous AI Pipeline</p>
            </div>
          </div>
          {!isRunning && (
            <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-brand-400 mt-0.5 shrink-0" />
            <span>
              This demo pipeline executes full data ingestion, Isolation Forest, LOF, TF-IDF duplicate scoring,
              contractor graph metrics, and risk cases generation across 5,200 projects in real time.
            </span>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {PIPELINE_STEPS.map((step, idx) => {
              const isDone = isCompleted || (isRunning && idx < currentStep);
              const isCurrent = isRunning && idx === currentStep;

              return (
                <div
                  key={idx}
                  className={`flex items-center gap-3 p-2.5 rounded-lg text-xs font-mono transition-all ${
                    isCurrent
                      ? 'bg-brand-500/10 border border-brand-500/30 text-brand-300'
                      : isDone
                      ? 'text-slate-300 opacity-80'
                      : 'text-slate-600'
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0" />
                  ) : isCurrent ? (
                    <Loader2 className="w-4 h-4 text-brand-400 animate-spin shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-700 shrink-0" />
                  )}
                  <span>{step}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-800 bg-slate-950/40 flex items-center justify-end gap-3">
          {!isRunning && !isCompleted && (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={startDemoPipeline}
                className="px-5 py-2.5 text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white rounded-xl shadow-lg shadow-brand-900/30 flex items-center gap-2 transition-all"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                Run AI Intelligence Pipeline
              </button>
            </>
          )}
          {isRunning && (
            <div className="flex items-center gap-2 text-xs font-mono text-brand-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Executing Autonomous Detection Engine...</span>
            </div>
          )}
          {isCompleted && (
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white rounded-xl shadow-lg shadow-brand-900/30 transition-all"
            >
              View Live Dashboard
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
