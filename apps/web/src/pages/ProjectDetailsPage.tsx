import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  Briefcase,
  AlertTriangle,
  Coins,
  MapPin,
  Calendar,
  Building2,
  CheckCircle2,
  TrendingUp,
  Search,
  ExternalLink,
  ShieldCheck,
  Plus,
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import api from '../services/api';
import { Project, DetectionSignal } from '../types';
import { RiskBadge } from '../components/common/RiskBadge';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';

// Custom Map Marker Icon
const mapIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export const ProjectDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [peerComp, setPeerComp] = useState<any>(null);
  const [contractorSummary, setContractorSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showCaseModal, setShowCaseModal] = useState(false);
  const [caseNote, setCaseNote] = useState('');
  const [casePriority, setCasePriority] = useState('HIGH');
  const [caseSubmitting, setCaseSubmitting] = useState(false);
  const [caseSuccessMsg, setCaseSuccessMsg] = useState('');
  const navigate = useNavigate();

  const fetchProjectDetails = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/projects/${id}`);
      setProject(res.data.data.project);
      setPeerComp(res.data.data.peerComparison);
      setContractorSummary(res.data.data.contractorProfile);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchProjectDetails();
  }, [id]);

  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;
    setCaseSubmitting(true);
    try {
      const res = await api.post('/risk-cases', {
        projectId: project.projectId,
        priority: casePriority,
        initialNote: caseNote || 'Auditor initiated investigation after inspecting flagged AI anomaly evidence.',
      });
      setCaseSuccessMsg(`Investigation Case ${res.data.data.case.caseId} opened successfully!`);
      setTimeout(() => {
        setShowCaseModal(false);
        navigate('/risk-cases');
      }, 1200);
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to open case');
    } finally {
      setCaseSubmitting(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!project) return;
    try {
      const doc = new jsPDF();
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, 210, 35, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('MoSPI — MPLAD STATUTORY AUDIT DOSSIER', 14, 18);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text('Government of India | Ministry of Statistics & Programme Implementation', 14, 25);
      doc.text(`Generated: ${new Date().toLocaleDateString()} | Work ID: ${project.projectId}`, 14, 30);

      doc.setTextColor(30, 41, 59);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Project Audit & Telemetry Breakdown', 14, 46);

      autoTable(doc, {
        startY: 52,
        head: [['Project Detail', 'Value']],
        body: [
          ['Work ID', project.projectId],
          ['Project Title', project.title],
          ['Category', project.category],
          ['State & District', `${project.state} (${project.district})`],
          ['MP Name & Constituency', `${project.mpName || 'N/A'} — ${project.constituency || 'N/A'}`],
          ['Sanctioned Amount', `Rs. ${project.allocatedAmount.toLocaleString('en-IN')}`],
          ['Utilized Amount', `Rs. ${project.utilizedAmount.toLocaleString('en-IN')}`],
          ['Physical Progress', `${project.progress}% Reported`],
          ['Contractor Name', project.contractorName],
          ['Risk Score', `${project.riskScore} / 100 (${project.riskLevel})`],
        ],
        theme: 'striped',
        headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255] },
      });

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Flagged Detection Signals', 14, (doc as any).lastAutoTable.finalY + 12);

      const signalRows = project.signals && project.signals.length > 0
        ? project.signals.map((s: DetectionSignal) => [s.dimension, s.severity, s.signal, s.explanation])
        : [['GENERAL', 'LOW', 'Routine Verification', 'No high risk anomalies detected for this work.']];

      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 18,
        head: [['Dimension', 'Severity', 'Signal', 'Explanation']],
        body: signalRows,
        theme: 'grid',
        headStyles: { fillColor: [185, 28, 28] },
      });

      doc.save(`MoSPI_MPLAD_${project.projectId}_Report.pdf`);
    } catch (e) {
      console.error('PDF export failed:', e);
    }
  };

  if (loading || !project) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton count={3} className="h-28" />
        <LoadingSkeleton count={2} className="h-64" />
      </div>
    );
  }

  const lat = project.latitude || 18.5204;
  const lon = project.longitude || 73.8567;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Back Bar & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Project Explorer</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadPDF}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-semibold text-slate-200 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-brand-400" />
            <span>Download Audit PDF Report</span>
          </button>
          <button
            onClick={() => setShowCaseModal(true)}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-amber-950/40 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Open Investigation Case</span>
          </button>
        </div>
      </div>

      {/* Main Project Overview Card */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm text-brand-400 font-bold">{project.projectId}</span>
              <RiskBadge level={project.riskLevel} score={project.riskScore} size="lg" />
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                {project.status}
              </span>
            </div>
            <h1 className="text-xl font-bold text-white max-w-3xl leading-snug">{project.title}</h1>
            <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">{project.description}</p>
          </div>

          {/* Model Confidence Metric Card */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-right shrink-0">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
              Signal Strength / Confidence
            </div>
            <div className="text-2xl font-bold text-brand-400 font-mono mt-0.5">
              {project.confidenceScore}%
            </div>
            <div className="text-[10px] text-slate-500">Multivariate model corroboration</div>
          </div>
        </div>

        {/* Key Attributes Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 border-t border-slate-800/80 text-xs">
          <div>
            <span className="text-slate-500 block text-[11px]">Location</span>
            <span className="text-slate-200 font-medium">
              {project.district}, {project.state}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px]">Sector Head / Category</span>
            <span className="text-slate-200 font-medium">{project.category}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px]">Contractor Entity</span>
            <span
              onClick={() => navigate(`/contractors/${encodeURIComponent(project.contractorName)}`)}
              className="text-brand-400 font-medium hover:underline cursor-pointer flex items-center gap-1"
            >
              <span>{project.contractorName}</span>
              <ExternalLink className="w-3 h-3" />
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px]">Financial Sanction Year</span>
            <span className="text-slate-200 font-medium font-mono">{project.financialYear}</span>
          </div>
        </div>
      </div>

      {/* 2-Column Intelligence Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Financial Peer Analytics & Milestones */}
        <div className="space-y-6">
          {/* Financial Peer Benchmark Comparison */}
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Coins className="w-4 h-4 text-emerald-400" />
                <span>Financial & Peer Rate Comparison</span>
              </h2>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-slate-400">Sanctioned Allocation</div>
                  <div className="text-lg font-bold text-white font-mono">
                    ₹{(project.allocatedAmount / 100000).toFixed(2)} Lakh
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-slate-400">District Category Peer Median</div>
                  <div className="text-lg font-bold text-slate-300 font-mono">
                    ₹{((peerComp?.peerAvgCost || 0) / 100000).toFixed(2)} Lakh
                  </div>
                </div>
              </div>

              {peerComp?.costRatio && peerComp.costRatio > 1.5 && (
                <div className="p-3 rounded-xl bg-red-950/40 border border-red-900/60 text-xs text-red-300 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                  <span>
                    Cost is <strong className="font-mono">{peerComp.costRatio}x</strong> the district peer median for{' '}
                    {project.category} ({peerComp.peerCount} comparable works).
                  </span>
                </div>
              )}

              {/* Progress & Utilization */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Physical Progress vs Expenditure:</span>
                  <span className="font-mono text-slate-200">
                    {project.progress}% progress • ₹{(project.utilizedAmount / 100000).toFixed(1)} L utilized
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden flex">
                  <div className="h-full bg-brand-500 rounded-full" style={{ width: `${project.progress}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Timeline Milestones */}
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-400" />
              <span>Project Execution Timeline</span>
            </h2>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/40 border border-slate-800">
                <span className="text-slate-400">Sanction Approval Date:</span>
                <span className="text-slate-200 font-mono">
                  {project.approvalDate ? new Date(project.approvalDate).toLocaleDateString() : 'Recorded in Order'}
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/40 border border-slate-800">
                <span className="text-slate-400">Work Commencement Date:</span>
                <span className="text-slate-200 font-mono">
                  {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/40 border border-slate-800">
                <span className="text-slate-400">Expected Completion Date:</span>
                <span className="text-slate-200 font-mono">
                  {project.expectedCompletionDate
                    ? new Date(project.expectedCompletionDate).toLocaleDateString()
                    : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Explainable AI Signals & Similar Works */}
        <div className="lg:col-span-2 space-y-6">
          {/* Explainable AI Evidence Card */}
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-brand-400" />
                  <span>Why was this project flagged? (Explainable AI Signals)</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Detailed rule signals, statistical telemetry, and peer group evidence
                </p>
              </div>
              <span className="text-xs font-mono text-slate-400">
                {project.signals?.length || 0} signal(s)
              </span>
            </div>

            <div className="space-y-3">
              {project.signals && project.signals.length > 0 ? (
                project.signals.map((sig, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-red-400 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        <span>{sig.signal}</span>
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-slate-800 text-slate-300">
                        {sig.dimension} • {sig.severity}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{sig.explanation}</p>
                    {sig.supportingValue && (
                      <div className="pt-1 flex flex-wrap gap-2 text-[11px] font-mono text-slate-400">
                        {Object.entries(sig.supportingValue).map(([k, v]) => (
                          <span key={k} className="px-2 py-0.5 bg-slate-900 rounded border border-slate-800">
                            {k}: <strong className="text-slate-200">{String(v)}</strong>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-xs text-emerald-400 bg-emerald-950/20 border border-emerald-900/40 rounded-xl">
                  No anomalous fraud-risk indicators or compliance deviations detected.
                </div>
              )}
            </div>

            {/* Recommended Action Box */}
            <div className="p-4 rounded-xl bg-brand-950/20 border border-brand-800/40 space-y-1">
              <div className="text-[11px] font-semibold text-brand-400 uppercase tracking-wider">
                Recommended Auditor Action:
              </div>
              <div className="text-xs text-slate-200 leading-relaxed">{project.recommendation}</div>
            </div>
          </div>

          {/* Similar / Duplicate Project Matches */}
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Search className="w-4 h-4 text-purple-400" />
              <span>Similar Work Orders & Scope Clustering (TF-IDF Similarity)</span>
            </h2>

            {project.similarProjects && project.similarProjects.length > 0 ? (
              <div className="space-y-2.5">
                {project.similarProjects.map((sim, idx) => (
                  <div
                    key={idx}
                    onClick={() => navigate(`/projects/${sim.projectId}`)}
                    className="p-3.5 rounded-xl bg-slate-950/60 hover:bg-slate-800/70 border border-slate-800 flex items-center justify-between cursor-pointer transition-all group"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-brand-400 font-semibold">{sim.projectId}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-950 text-purple-300 border border-purple-800">
                          {Math.round(sim.similarityScore * 100)}% Similarity
                        </span>
                      </div>
                      <div className="text-xs text-slate-200 font-medium group-hover:text-brand-300">{sim.title}</div>
                      <div className="text-[11px] text-slate-400 flex flex-wrap gap-2">
                        {sim.reasons.map((r, rIdx) => (
                          <span key={rIdx}>• {r}</span>
                        ))}
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-brand-400 shrink-0" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-slate-500 py-3">No duplicate or near-identical project scopes detected in repository.</div>
            )}
          </div>

          {/* Mini Interactive Geographic Map */}
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-brand-400" />
              <span>Geographic Context ({lat.toFixed(4)}, {lon.toFixed(4)})</span>
            </h2>
            <div className="h-56 w-full rounded-xl overflow-hidden border border-slate-800">
              <MapContainer center={[lat, lon]} zoom={12} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />
                <Marker position={[lat, lon]} icon={mapIcon}>
                  <Popup>
                    <div className="text-slate-900 text-xs">
                      <strong>{project.projectId}</strong>
                      <p>{project.title}</p>
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Case Creation Modal */}
      {showCaseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-amber-400" />
              <span>Initiate Auditor Investigation Case</span>
            </h3>
            <p className="text-xs text-slate-400">
              Open a formal review case for project <strong className="text-white font-mono">{project.projectId}</strong>.
            </p>

            {caseSuccessMsg && (
              <div className="p-3 rounded-xl bg-brand-950 border border-brand-800 text-xs text-brand-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0" />
                <span>{caseSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreateCase} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Priority Level</label>
                <select
                  value={casePriority}
                  onChange={(e) => setCasePriority(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                >
                  <option value="CRITICAL">CRITICAL (Immediate Field Inspection)</option>
                  <option value="HIGH">HIGH (Desk & Tender Audit)</option>
                  <option value="MEDIUM">MEDIUM (Standard Quarterly Sample)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Initial Audit Note</label>
                <textarea
                  rows={3}
                  value={caseNote}
                  onChange={(e) => setCaseNote(e.target.value)}
                  placeholder="Record preliminary concerns (e.g., cost deviation vs schedule of rates, contractor share)..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCaseModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={caseSubmitting}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-amber-950/40 flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Open Official Case</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
