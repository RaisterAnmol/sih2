import pandas as pd
import numpy as np
from typing import List, Dict, Any

class ContractorGeoDetector:
    def __init__(self):
        pass

    def analyze_contractor_and_geography(self, df: pd.DataFrame) -> Dict[str, List[Dict[str, Any]]]:
        results: Dict[str, List[Dict[str, Any]]] = {pid: [] for pid in df["projectId"]}

        # 1. Geographic Clustering: Projects within < 100 meters with different IDs
        has_geo = df.dropna(subset=["latitude", "longitude"])
        if len(has_geo) > 1:
            coords = has_geo[["latitude", "longitude"]].values
            # Fast approximate euclidean distance in degrees (0.001 deg ~ 111m)
            for i in range(len(has_geo)):
                row_i = has_geo.iloc[i]
                pid_i = row_i["projectId"]
                diffs = np.abs(coords - coords[i])
                close_mask = (diffs[:, 0] < 0.002) & (diffs[:, 1] < 0.002)
                close_mask[i] = False
                close_matches = has_geo[close_mask]

                if len(close_matches) >= 2:
                    results[pid_i].append({
                        "ruleId": "RULE_GEO_TIGHT_CLUSTER",
                        "dimension": "GEOGRAPHIC",
                        "signal": f"Geographic spatial clustering: {len(close_matches) + 1} projects within 200m radius",
                        "severity": "MEDIUM",
                        "explanation": f"Multiple independent works registered at virtually identical GPS coordinates ({row_i['latitude']:.4f}, {row_i['longitude']:.4f}). Inspect for overlapping asset boundaries.",
                        "supportingValue": {
                            "nearbyProjectIds": close_matches["projectId"].tolist()[:4],
                            "lat": float(row_i["latitude"]),
                            "lon": float(row_i["longitude"])
                        },
                        "weight": 0.8
                    })

        # 2. Contractor Sudden Spike / Capacity Overload (> 8 concurrent active projects)
        in_prog = df[df["status"] == "IN_PROGRESS"]
        contractor_load = in_prog.groupby("contractorName")["projectId"].count()
        for idx, row in df.iterrows():
            cname = row["contractorName"]
            pid = row["projectId"]
            if cname and cname in contractor_load and contractor_load[cname] >= 8 and cname != "Unknown":
                results[pid].append({
                    "ruleId": "RULE_CONT_CONCURRENT_OVERLOAD",
                    "dimension": "CONTRACTOR",
                    "signal": f"Contractor executing {contractor_load[cname]} concurrent active projects",
                    "severity": "MEDIUM",
                    "explanation": f"Vendor '{cname}' is managing an unusually heavy workload simultaneously. Potential execution capacity bottleneck.",
                    "supportingValue": {"concurrentProjects": int(contractor_load[cname])},
                    "weight": 0.7
                })

        return results
