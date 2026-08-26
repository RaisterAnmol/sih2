import numpy as np
from typing import List, Dict, Any
from app.schemas.project import ProjectData, ProjectAnalysisResponse

class GroundTruthValidator:
    def __init__(self):
        pass

    def evaluate_performance(self, projects: List[ProjectData], analysis_results: List[ProjectAnalysisResponse]) -> Dict[str, Any]:
        results_map = {r.projectId: r for r in analysis_results}
        
        y_true = []
        y_pred = []

        for p in projects:
            is_true_anomaly = bool(p.isGroundTruthAnomaly)
            y_true.append(1 if is_true_anomaly else 0)

            res = results_map.get(p.projectId)
            is_pred_anomaly = bool(res and res.riskLevel in ["HIGH", "CRITICAL"])
            y_pred.append(1 if is_pred_anomaly else 0)

        y_true = np.array(y_true)
        y_pred = np.array(y_pred)

        tp = int(np.sum((y_true == 1) & (y_pred == 1)))
        fp = int(np.sum((y_true == 0) & (y_pred == 1)))
        fn = int(np.sum((y_true == 1) & (y_pred == 0)))
        tn = int(np.sum((y_true == 0) & (y_pred == 0)))

        precision = round(tp / (tp + fp), 4) if (tp + fp) > 0 else 0.0
        recall = round(tp / (tp + fn), 4) if (tp + fn) > 0 else 0.0
        f1 = round(2 * (precision * recall) / (precision + recall), 4) if (precision + recall) > 0 else 0.0
        fpr = round(fp / (fp + tn), 4) if (fp + tn) > 0 else 0.0

        return {
            "evaluationType": "Prototype validation against calibrated synthetic ground truth benchmark",
            "totalSamples": len(projects),
            "groundTruthAnomalies": int(np.sum(y_true)),
            "predictedAnomalies": int(np.sum(y_pred)),
            "confusionMatrix": {
                "truePositives": tp,
                "falsePositives": fp,
                "trueNegatives": tn,
                "falseNegatives": fn
            },
            "metrics": {
                "precision": precision,
                "recall": recall,
                "f1Score": f1,
                "falsePositiveRate": fpr,
                "accuracy": round((tp + tn) / max(len(projects), 1), 4)
            },
            "disclaimer": "Metrics calculated on deterministic synthetic evaluation benchmark. Not claimed as real-world government audit performance."
        }
