import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Database,
  Cpu,
  Layers,
  Sparkles,
  FileCheck2,
  Users,
  Search,
  Activity,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-8 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-emerald-400 flex items-center justify-center text-white font-bold shadow-lg shadow-brand-900/50">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-sm text-white tracking-wide">MPLAD INSIGHT</span>
            <span className="text-[10px] text-slate-400 block">MoSPI Hackathon 2026 — PS26102</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 transition-colors"
          >
            Sign In / Demo Login
          </Link>
          <Link
            to="/dashboard"
            className="px-4 py-2 text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white rounded-xl shadow-lg shadow-brand-900/40 flex items-center gap-1.5 transition-all"
          >
            <span>Explore Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6 max-w-6xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Smart India Hackathon 2026 | PS26102: MoSPI Automated Governance</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight max-w-4xl mx-auto">
          AI-Powered Intelligence for{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-400 via-emerald-300 to-teal-200">
            Transparent MPLAD
          </span>{' '}
          Implementation
        </h1>

        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Autonomous anomaly screening, contractor concentration analytics, duplicate work detection, and explainable
          risk scoring designed for government auditors, planning officers, and parliamentary oversight.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            to="/dashboard"
            className="px-6 py-3.5 text-sm font-semibold bg-brand-600 hover:bg-brand-500 text-white rounded-xl shadow-xl shadow-brand-900/40 flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
          >
            <span>Explore Live Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/projects"
            className="px-6 py-3.5 text-sm font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-xl border border-slate-700/80 transition-colors"
          >
            Inspect 5,000+ Projects
          </Link>
        </div>
      </section>

      {/* 6-Stage Visual AI Workflow */}
      <section className="py-12 px-6 max-w-6xl mx-auto w-full">
        <div className="text-center mb-8">
          <h2 className="text-xs font-bold text-brand-400 uppercase tracking-widest">End-to-End Governance Architecture</h2>
          <p className="text-xl font-bold text-white mt-1">Autonomous Intelligence Workflow</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {[
            { step: '01', title: 'Data Ingestion', desc: 'Normalized ingestion of MPLADS project works & tenders', icon: Database },
            { step: '02', title: 'Schema Validation', desc: '5-pillar quality screening and coordinate verification', icon: FileCheck2 },
            { step: '03', title: 'AI & ML Engine', desc: 'Isolation Forest, LOF & TF-IDF similarity vectors', icon: Cpu },
            { step: '04', title: 'Anomaly Flags', desc: 'Financial, contractor, geographic & delay indicators', icon: AlertTriangle },
            { step: '05', title: 'Risk Scoring', desc: 'Calibrated multi-dimension score (0-100) & confidence', icon: Layers },
            { step: '06', title: 'Auditor Action', desc: 'Explainable evidence & official PDF audit reports', icon: Users },
          ].map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={idx}
                className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-left space-y-2 hover:border-brand-500/40 transition-all"
              >
                <div className="flex items-center justify-between text-slate-500 text-[10px] font-mono">
                  <span>STEP {s.step}</span>
                  <Icon className="w-4 h-4 text-brand-400" />
                </div>
                <h3 className="font-semibold text-xs text-white">{s.title}</h3>
                <p className="text-[11px] text-slate-400 leading-snug">{s.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Capabilities Grid */}
      <section className="py-12 px-6 max-w-6xl mx-auto w-full">
        <div className="text-center mb-10">
          <h2 className="text-xs font-bold text-brand-400 uppercase tracking-widest">Platform Capabilities</h2>
          <p className="text-2xl font-bold text-white mt-1">Comprehensive Audit Intelligence</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: 'Financial Risk Detection',
              desc: 'Flags line-item cost outliers > 2.2x district peer medians, abnormal utilization, and rate deviations against Schedule of Rates (SOR).',
              icon: TrendingUp,
            },
            {
              title: 'Duplicate & Scope Similarity',
              desc: 'Identifies overlapping project assets, duplicate work orders in identical wards, and fuzzy matching descriptions with TF-IDF cosine similarity.',
              icon: Search,
            },
            {
              title: 'Contractor Monopolization',
              desc: 'Monitors vendor award concentration (>30% district share), sudden activity bursts, capacity overloads, and risk incidence rates.',
              icon: Users,
            },
            {
              title: 'Geographic GIS Intelligence',
              desc: 'Interactive Leaflet mapping with GPS cluster anomaly detection for tightly grouped works and coordinate validation.',
              icon: Activity,
            },
            {
              title: 'Temporal Rush & Delay Analytics',
              desc: 'Detects fiscal year-end March sanction rushes, bulk same-day approvals, and projects with execution delays > 2.0x planned milestones.',
              icon: Cpu,
            },
            {
              title: 'Investigation Cases & Reports',
              desc: 'Complete case management lifecycle with investigator notes, evidence logging, and 1-click official PDF/CSV audit reports.',
              icon: FileCheck2,
            },
          ].map((c, idx) => {
            const Icon = c.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-all space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-400">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white">{c.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{c.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Human Verification Ethos Banner */}
      <section className="py-10 px-6 max-w-4xl mx-auto w-full text-center">
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400 space-y-2">
          <div className="font-semibold text-slate-200 uppercase tracking-wider text-[11px] flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-brand-400" />
            <span>Human Verification Principle & Ethical AI Standards</span>
          </div>
          <p>
            MPLAD Insight operates strictly as a decision-support and audit-prioritization platform. The system flags statistical
            anomalies, risk signals, and compliance deviations to guide authorized human auditors. It never asserts conclusive legal
            guilt or confirmed fraud without formal administrative review.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 px-8 text-center text-xs text-slate-500">
        <div>Smart India Hackathon 2026 — Problem Statement PS26102 | Ministry of Statistics and Programme Implementation (MoSPI)</div>
      </footer>
    </div>
  );
};
