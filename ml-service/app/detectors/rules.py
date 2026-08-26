import pandas as pd
import numpy as np
from typing import List, Dict, Any

class RuleEngine:
    def __init__(self):
        pass

    def evaluate_rules(self, df: pd.DataFrame) -> Dict[str, List[Dict[str, Any]]]:
        results: Dict[str, List[Dict[str, Any]]] = {pid: [] for pid in df["projectId"]}

        # 1. Compute Category & District Peer Medians
        df["allocated"] = df["allocatedAmount"].fillna(0).astype(float)
        df["utilized"] = df["utilizedAmount"].fillna(0).astype(float)
        
        peer_medians = df.groupby(["district", "category"])["allocated"].transform("median")
        peer_medians = peer_medians.replace(0, 1.0).fillna(df["allocated"].median() or 1.0)
        df["peer_ratio"] = df["allocated"] / peer_medians

        # 2. Contractor Share per District
        contractor_dist_counts = df.groupby(["district", "contractorName"])["projectId"].transform("count")
        dist_total_counts = df.groupby("district")["projectId"].transform("count")
        df["contractor_district_share"] = contractor_dist_counts / dist_total_counts.replace(0, 1)

        # 3. Time Calculations
        now = pd.Timestamp.now()
        df["start_dt"] = pd.to_datetime(df["startDate"], errors="coerce")
        df["expected_end_dt"] = pd.to_datetime(df["expectedCompletionDate"], errors="coerce")
        df["actual_end_dt"] = pd.to_datetime(df["actualCompletionDate"], errors="coerce")
        df["approval_dt"] = pd.to_datetime(df["approvalDate"], errors="coerce")

        df["expected_duration"] = (df["expected_end_dt"] - df["start_dt"]).dt.days.fillna(180)
        df["project_age_days"] = (now - df["start_dt"]).dt.days.fillna(0)
        df["actual_duration"] = (df["actual_end_dt"] - df["start_dt"]).dt.days

        for idx, row in df.iterrows():
            pid = row["projectId"]
            signals = []

            # Rule FIN_01: Cost Outlier (> 2.2x District Peer Median)
            if row["peer_ratio"] >= 2.2 and row["allocated"] > 200000:
                severity = "CRITICAL" if row["peer_ratio"] >= 3.0 else "HIGH"
                signals.append({
                    "ruleId": "RULE_FIN_COST_OUTLIER",
                    "dimension": "FINANCIAL",
                    "signal": f"Project cost is {row['peer_ratio']:.1f}x the district category peer median",
                    "severity": severity,
                    "explanation": f"Allocated amount (₹{row['allocated']:,.0f}) significantly deviates from peer median (₹{peer_medians.iloc[idx]:,.0f}) for {row['category']} in {row['district']}.",
                    "supportingValue": {
                        "allocated": row["allocated"],
                        "peerMedian": float(peer_medians.iloc[idx]),
                        "ratio": round(float(row["peer_ratio"]), 2)
                    },
                    "weight": 1.0
                })

            # Rule FIN_02: Excessive Utilization (> 100% of allocation without sanction)
            if row["allocated"] > 0 and (row["utilized"] / row["allocated"]) > 1.05:
                ratio = (row["utilized"] / row["allocated"]) * 100
                signals.append({
                    "ruleId": "RULE_FIN_EXCESS_UTILIZATION",
                    "dimension": "FINANCIAL",
                    "signal": f"Expenditure exceeds sanctioned allocation by {ratio - 100:.1f}%",
                    "severity": "HIGH",
                    "explanation": f"Utilized amount (₹{row['utilized']:,.0f}) exceeds allocated budget (₹{row['allocated']:,.0f}). Requires supplementary sanction audit.",
                    "supportingValue": {"utilized": row["utilized"], "allocated": row["allocated"]},
                    "weight": 0.8
                })

            # Rule CONT_01: High Contractor District Monopolization (> 30% of district projects)
            if row["contractorName"] and row["contractorName"] != "Unknown" and row["contractor_district_share"] >= 0.30 and dist_total_counts.iloc[idx] >= 10:
                share_pct = row["contractor_district_share"] * 100
                signals.append({
                    "ruleId": "RULE_CONT_MONOPOLY_SHARE",
                    "dimension": "CONTRACTOR",
                    "signal": f"Contractor holds {share_pct:.1f}% concentration in district",
                    "severity": "HIGH" if share_pct >= 40 else "MEDIUM",
                    "explanation": f"Contractor '{row['contractorName']}' has been awarded {int(contractor_dist_counts.iloc[idx])} of {int(dist_total_counts.iloc[idx])} total projects in {row['district']}.",
                    "supportingValue": {
                        "contractor": row["contractorName"],
                        "districtProjects": int(contractor_dist_counts.iloc[idx]),
                        "sharePercent": round(float(share_pct), 1)
                    },
                    "weight": 0.9
                })

            # Rule EFF_01: Stalled Project (Age > 365 days, progress < 25%, utilization < 30%)
            if row["status"] == "IN_PROGRESS" and row["project_age_days"] > 365 and row["progress"] < 25:
                signals.append({
                    "ruleId": "RULE_EFF_STALLED_PROJECT",
                    "dimension": "EFFICIENCY",
                    "signal": f"Project stalled: {int(row['project_age_days'])} days elapsed with only {row['progress']}% physical progress",
                    "severity": "HIGH",
                    "explanation": "Implementation progress is critically lagging relative to project inception date. High risk of capital lockup.",
                    "supportingValue": {
                        "elapsedDays": int(row["project_age_days"]),
                        "progress": row["progress"],
                        "utilized": row["utilized"]
                    },
                    "weight": 0.85
                })

            # Rule EFF_02: Low Utilization on In-Progress aged project
            if row["status"] == "IN_PROGRESS" and row["project_age_days"] > 270 and row["allocated"] > 0 and (row["utilized"] / row["allocated"]) < 0.15:
                signals.append({
                    "ruleId": "RULE_EFF_FUNDS_UNUTILIZED",
                    "dimension": "EFFICIENCY",
                    "signal": "Abnormally low fund disbursement on active work order",
                    "severity": "MEDIUM",
                    "explanation": f"Only {((row['utilized'] / row['allocated']) * 100):.1f}% of sanctioned budget drawn after 9+ months.",
                    "supportingValue": {"utilizationRate": round((row["utilized"] / row["allocated"]) * 100, 1)},
                    "weight": 0.7
                })

            # Rule TIME_01: Abnormal Completion Delay (> 2.0x Expected Duration)
            if pd.notna(row["actual_duration"]) and row["expected_duration"] > 0:
                delay_ratio = row["actual_duration"] / row["expected_duration"]
                if delay_ratio >= 2.0 and row["actual_duration"] > 180:
                    signals.append({
                        "ruleId": "RULE_TIME_EXTREME_DELAY",
                        "dimension": "TEMPORAL",
                        "signal": f"Execution timeline delayed by {delay_ratio:.1f}x planned milestone",
                        "severity": "MEDIUM",
                        "explanation": f"Actual completion required {int(row['actual_duration'])} days versus estimated {int(row['expected_duration'])} days.",
                        "supportingValue": {
                            "actualDays": int(row["actual_duration"]),
                            "expectedDays": int(row["expected_duration"]),
                            "delayRatio": round(float(delay_ratio), 2)
                        },
                        "weight": 0.75
                    })

            # Rule QUAL_01: Incomplete or Missing Critical Metadata
            missing_fields = []
            if not row.get("startDate") or pd.isna(row["startDate"]):
                missing_fields.append("Start Date")
            if not row.get("contractorName") or pd.isna(row["contractorName"]) or row["contractorName"] == "Unknown":
                missing_fields.append("Contractor Entity")
            if row["allocated"] <= 0:
                missing_fields.append("Sanctioned Amount")

            if missing_fields:
                signals.append({
                    "ruleId": "RULE_QUAL_MISSING_METADATA",
                    "dimension": "DATA_QUALITY",
                    "signal": f"Data Quality Defect: Missing {', '.join(missing_fields)}",
                    "severity": "LOW" if len(missing_fields) == 1 else "MEDIUM",
                    "explanation": "Critical governance attributes are absent or unpopulated in source records.",
                    "supportingValue": {"missingFields": missing_fields},
                    "weight": 0.6
                })

            results[pid] = signals

        return results
