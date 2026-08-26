import pandas as pd
import numpy as np
from typing import List, Dict, Any

class TemporalDetector:
    def __init__(self):
        pass

    def analyze_temporal_patterns(self, df: pd.DataFrame) -> Dict[str, List[Dict[str, Any]]]:
        results: Dict[str, List[Dict[str, Any]]] = {pid: [] for pid in df["projectId"]}

        df["approval_dt"] = pd.to_datetime(df["approvalDate"], errors="coerce")
        
        # Detect Fiscal Year-End Rush (Projects approved in last 15 days of March)
        march_rush_mask = (df["approval_dt"].dt.month == 3) & (df["approval_dt"].dt.day >= 15)

        # Detect Same-Day District Approval Bunches (> 10 projects approved on exact same date in district)
        same_day_counts = df.groupby(["district", df["approval_dt"].dt.date])["projectId"].transform("count")

        for idx, row in df.iterrows():
            pid = row["projectId"]

            if march_rush_mask.iloc[idx]:
                results[pid].append({
                    "ruleId": "RULE_TIME_MARCH_RUSH",
                    "dimension": "TEMPORAL",
                    "signal": "Fiscal Year-End Sanction Rush (Late March Approval)",
                    "severity": "LOW",
                    "explanation": "Work order sanctioned in the closing days of the fiscal financial year. Recommended procedural verification of technical clearance.",
                    "supportingValue": {"approvalDate": str(row["approvalDate"])},
                    "weight": 0.5
                })

            if same_day_counts.iloc[idx] >= 12:
                results[pid].append({
                    "ruleId": "RULE_TIME_BATCH_APPROVAL_SPIKE",
                    "dimension": "TEMPORAL",
                    "signal": f"Bulk Approval Spike: {int(same_day_counts.iloc[idx])} works sanctioned on single day in district",
                    "severity": "MEDIUM",
                    "explanation": "High volume of project sanctions issued simultaneously on the same date for this district administrative unit.",
                    "supportingValue": {
                        "date": str(row["approval_dt"].date()) if pd.notna(row["approval_dt"]) else "",
                        "batchSize": int(same_day_counts.iloc[idx])
                    },
                    "weight": 0.65
                })

        return results
