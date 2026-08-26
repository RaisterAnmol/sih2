import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from typing import Dict, Any, List, Tuple

class IsolationForestDetector:
    def __init__(self, contamination: float = 0.08, random_state: int = 42):
        self.contamination = contamination
        self.random_state = random_state
        self.model = IsolationForest(
            contamination=self.contamination,
            random_state=self.random_state,
            n_estimators=120,
            max_samples="auto"
        )
        self.feature_names = [
            "allocated_amount",
            "utilization_ratio",
            "progress",
            "cost_peer_ratio",
            "contractor_load",
            "estimated_duration_days"
        ]

    def _extract_features(self, df: pd.DataFrame) -> np.ndarray:
        # Calculate derived features
        allocated = df["allocatedAmount"].fillna(0).astype(float)
        utilized = df["utilizedAmount"].fillna(0).astype(float)
        utilization_ratio = np.where(allocated > 0, np.clip(utilized / allocated, 0, 3.0), 0)
        progress = df["progress"].fillna(0).astype(float) / 100.0

        # Peer ratio per category & district
        group_means = df.groupby(["state", "category"])["allocatedAmount"].transform("median")
        group_means = group_means.replace(0, 1.0).fillna(allocated.median() or 1.0)
        cost_peer_ratio = (allocated / group_means).clip(0, 10.0)

        # Contractor load (frequency of contractor in dataset)
        contractor_counts = df["contractorName"].fillna("Unknown").map(df["contractorName"].value_counts())
        contractor_load = (contractor_counts / max(len(df), 1)).fillna(0)

        # Duration in days
        start = pd.to_datetime(df["startDate"], errors="coerce")
        end = pd.to_datetime(df["expectedCompletionDate"], errors="coerce")
        duration = (end - start).dt.days.fillna(180).clip(15, 2000)

        features = np.column_stack([
            np.log1p(allocated),
            utilization_ratio,
            progress,
            cost_peer_ratio,
            contractor_load,
            np.log1p(duration)
        ])
        return np.nan_to_num(features, nan=0.0, posinf=1.0, neginf=0.0)

    def fit_predict(self, df: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray]:
        if len(df) < 10:
            return np.zeros(len(df)), np.zeros(len(df))

        X = self._extract_features(df)
        self.model.fit(X)
        raw_scores = self.model.score_samples(X)  # Negative anomaly score
        predictions = self.model.predict(X)       # -1 for anomaly, 1 for inlier

        # Normalize score into [0, 100] risk signal
        # Higher score = higher anomaly likelihood
        min_s, max_s = raw_scores.min(), raw_scores.max()
        if max_s > min_s:
            norm_scores = 100.0 * (1.0 - ((raw_scores - min_s) / (max_s - min_s)))
        else:
            norm_scores = np.zeros(len(df))

        is_anomaly = (predictions == -1)
        return is_anomaly, norm_scores
