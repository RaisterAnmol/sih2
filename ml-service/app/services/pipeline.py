import pandas as pd
import numpy as np
from typing import List, Dict, Any, Tuple
from app.schemas.project import (
    ProjectData, ProjectAnalysisResponse, DetectionSignal,
    SimilarProjectMatch, BatchAnalysisResponse
)
from app.detectors.isolation_forest import IsolationForestDetector
from app.detectors.lof import LOFDetector
from app.detectors.similarity import TextSimilarityDetector
from app.detectors.rules import RuleEngine
from app.detectors.contractor_geo import ContractorGeoDetector
from app.detectors.temporal import TemporalDetector

DEFAULT_WEIGHTS = {
    "FINANCIAL": 0.25,
    "CONTRACTOR": 0.20,
    "DUPLICATE": 0.15,
    "GEOGRAPHIC": 0.10,
    "TEMPORAL": 0.10,
    "EFFICIENCY": 0.10,
    "DATA_QUALITY": 0.10
}

class IntelligencePipeline:
    def __init__(self):
        self.iso_forest = IsolationForestDetector()
        self.lof = LOFDetector()
        self.similarity = TextSimilarityDetector()
        self.rule_engine = RuleEngine()
        self.contractor_geo = ContractorGeoDetector()
        self.temporal = TemporalDetector()

    def generate_recommendation(self, signals: List[Dict[str, Any]], risk_score: float) -> str:
        if risk_score >= 80:
            recs = [
                "URGENT: Prioritize for comprehensive physical on-site verification and procurement audit.",
                "Impound tender documents, measurement books (MB), and contractor ledger.",
                "Cross-check geo-tagged photographic evidence against physical site coordinates."
            ]
        elif risk_score >= 60:
            recs = [
                "HIGH PRIORITY: Initiate desk review of financial expenditure and contractor allocation records.",
                "Review bill certification and milestone completion reports before further fund disbursement."
            ]
        elif risk_score >= 30:
            recs = [
                "MODERATE RISK: Routine sample verification recommended during next quarterly audit cycle.",
                "Verify periodic physical progress reports against expenditure records."
            ]
        else:
            recs = [
                "LOW RISK: Compliant with standard MPLAD peer metrics. Normal processing approved."
            ]

        # Context-specific addenda
        dimensions = {s.get("dimension") for s in signals}
        if "DUPLICATE" in dimensions:
            recs.append("Verify project asset registry to ensure no duplicate funding across MP/MLA/Local schemes.")
        if "FINANCIAL" in dimensions:
            recs.append("Conduct line-item comparative rate analysis against State Schedule of Rates (SOR).")
        if "CONTRACTOR" in dimensions:
            recs.append("Inspect vendor work order distribution and conflict-of-interest disclosures.")

        return " ".join(recs[:2])

    def run_pipeline(self, projects: List[ProjectData], custom_weights: Dict[str, float] = None) -> BatchAnalysisResponse:
        weights = DEFAULT_WEIGHTS.copy()
        if custom_weights:
            weights.update(custom_weights)

        # Normalize weights to sum to 1.0
        total_w = sum(weights.values()) or 1.0
        weights = {k: v / total_w for k, v in weights.items()}

        df = pd.DataFrame([p.model_dump() for p in projects])
        if len(df) == 0:
            return BatchAnalysisResponse(totalProjects=0, anomaliesDetected=0, results=[])

        # 1. Run Machine Learning Models
        iso_anomalies, iso_scores = self.iso_forest.fit_predict(df)
        lof_anomalies, lof_scores = self.lof.fit_predict(df)
        similarity_matches = self.similarity.find_similar_projects(df)

        # 2. Run Domain Detectors & Rules
        rule_signals = self.rule_engine.evaluate_rules(df)
        contractor_geo_signals = self.contractor_geo.analyze_contractor_and_geography(df)
        temporal_signals = self.temporal.analyze_temporal_patterns(df)

        results: List[ProjectAnalysisResponse] = []
        anomalies_count = 0

        for i, row in df.iterrows():
            pid = row["projectId"]
            signals_list: List[DetectionSignal] = []

            dim_scores = {
                "FINANCIAL": 0.0,
                "CONTRACTOR": 0.0,
                "DUPLICATE": 0.0,
                "GEOGRAPHIC": 0.0,
                "TEMPORAL": 0.0,
                "EFFICIENCY": 0.0,
                "DATA_QUALITY": 0.0
            }

            # Add ML Anomaly Signals if detected
            if iso_anomalies[i] or iso_scores[i] >= 60:
                signals_list.append(DetectionSignal(
                    ruleId="ML_ISOLATION_FOREST_ANOMALY",
                    dimension="FINANCIAL",
                    signal=f"Multivariate AI Anomaly Signal (Score: {iso_scores[i]:.0f}/100)",
                    severity="HIGH" if iso_scores[i] >= 75 else "MEDIUM",
                    explanation="Isolation Forest model flagged anomalous multi-feature divergence across project budget, timeline duration, and contractor allocation telemetry.",
                    supportingValue={"isolationForestScore": round(float(iso_scores[i]), 1)},
                    weight=0.9
                ))
                dim_scores["FINANCIAL"] = max(dim_scores["FINANCIAL"], float(iso_scores[i]))

            if lof_anomalies[i] or lof_scores[i] >= 55:
                signals_list.append(DetectionSignal(
                    ruleId="ML_LOF_PEER_OUTLIER",
                    dimension="FINANCIAL",
                    signal=f"Local Outlier Factor (LOF) Deviation Signal ({lof_scores[i]:.0f}/100)",
                    severity="MEDIUM",
                    explanation="Local Outlier Factor algorithm identified abnormal local density divergence compared to nearest category and regional peer works.",
                    supportingValue={"lofScore": round(float(lof_scores[i]), 1)},
                    weight=0.8
                ))
                dim_scores["FINANCIAL"] = max(dim_scores["FINANCIAL"], float(lof_scores[i]))

            # Duplicate / Similarity Signals
            sim_items = similarity_matches.get(pid, [])
            if sim_items:
                top_sim = sim_items[0]
                if top_sim["similarityScore"] >= 0.70:
                    severity = "CRITICAL" if top_sim["similarityScore"] >= 0.88 else "HIGH"
                    signals_list.append(DetectionSignal(
                        ruleId="RULE_DUP_TEXT_SIMILARITY",
                        dimension="DUPLICATE",
                        signal=f"High Text & Scope Similarity ({top_sim['similarityScore'] * 100:.1f}%) with Project {top_sim['projectId']}",
                        severity=severity,
                        explanation=f"Work scope and title closely matches '{top_sim['title']}'. Potential duplicate sanction or overlapping asset scope.",
                        supportingValue={"matchedProjectId": top_sim["projectId"], "similarity": top_sim["similarityScore"]},
                        weight=1.0
                    ))
                    dim_scores["DUPLICATE"] = top_sim["similarityScore"] * 100.0

            # Attach Rule Signals
            for s in rule_signals.get(pid, []):
                signals_list.append(DetectionSignal(**s))
                dim = s["dimension"]
                sev_val = 90.0 if s["severity"] == "CRITICAL" else (70.0 if s["severity"] == "HIGH" else 45.0)
                dim_scores[dim] = max(dim_scores.get(dim, 0.0), sev_val)

            for s in contractor_geo_signals.get(pid, []):
                signals_list.append(DetectionSignal(**s))
                dim = s["dimension"]
                sev_val = 80.0 if s["severity"] == "HIGH" else 50.0
                dim_scores[dim] = max(dim_scores.get(dim, 0.0), sev_val)

            for s in temporal_signals.get(pid, []):
                signals_list.append(DetectionSignal(**s))
                dim = s["dimension"]
                sev_val = 70.0 if s["severity"] == "HIGH" else 40.0
                dim_scores[dim] = max(dim_scores.get(dim, 0.0), sev_val)

            # Compute Unified Risk Score blending weighted sum, peak severity and signal boosts
            weighted_sum = sum(dim_scores[k] * weights[k] for k in weights if k in dim_scores)
            peak_dim_score = max(dim_scores.values()) if dim_scores else 0.0
            
            # Base blend: peak dimension (50%) with weighted breadth (50%)
            base_risk = (0.50 * peak_dim_score) + (0.50 * weighted_sum)
            
            # Incremental signal bonus for multi-signal corroboration
            signal_bonus = min(20.0, len(signals_list) * 5.0)
            if any(s.severity == "CRITICAL" for s in signals_list):
                signal_bonus += 15.0
            elif any(s.severity == "HIGH" for s in signals_list):
                signal_bonus += 8.0

            raw_risk = base_risk + signal_bonus
            overall_score = round(float(np.clip(raw_risk, 0.0, 100.0)), 1)

            if overall_score >= 80:
                risk_level = "CRITICAL"
            elif overall_score >= 60:
                risk_level = "HIGH"
            elif overall_score >= 30:
                risk_level = "MEDIUM"
            else:
                risk_level = "LOW"

            if risk_level in ["HIGH", "CRITICAL"]:
                anomalies_count += 1

            # Model Confidence / Signal Strength (based on feature completeness & signal corroboration)
            base_conf = 70.0
            if len(signals_list) >= 2:
                base_conf += 15.0
            if iso_scores[i] > 50 and lof_scores[i] > 50:
                base_conf += 10.0
            confidence = round(float(np.clip(base_conf, 50.0, 95.0)), 1)

            rec_text = self.generate_recommendation([s.model_dump() for s in signals_list], overall_score)

            # Format Similar Project Pydantic matches
            similar_models = [SimilarProjectMatch(**m) for m in sim_items]

            results.append(ProjectAnalysisResponse(
                projectId=pid,
                overallRiskScore=overall_score,
                riskLevel=risk_level,
                confidenceScore=confidence,
                signals=signals_list,
                similarProjects=similar_models,
                dimensionScores={k: round(v, 1) for k, v in dim_scores.items()},
                recommendation=rec_text,
                modelMetadata={
                    "isolationForestScore": round(float(iso_scores[i]), 1),
                    "lofScore": round(float(lof_scores[i]), 1),
                    "signalsCount": len(signals_list),
                    "modelVersion": "1.0.0-SIH2026",
                    "engine": "Hybrid Ensemble (iForest + LOF + TF-IDF + Deterministic Rules)"
                }
            ))

        return BatchAnalysisResponse(
            totalProjects=len(projects),
            anomaliesDetected=anomalies_count,
            results=results
        )
