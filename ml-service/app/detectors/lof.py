import numpy as np
import pandas as pd
from sklearn.neighbors import LocalOutlierFactor
from typing import Tuple

class LOFDetector:
    def __init__(self, n_neighbors: int = 20, contamination: float = 0.06):
        self.n_neighbors = n_neighbors
        self.contamination = contamination

    def fit_predict(self, df: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray]:
        if len(df) < max(self.n_neighbors + 2, 25):
            return np.zeros(len(df), dtype=bool), np.zeros(len(df))

        # Local density features based on cost peer variance & progress timeline
        allocated = np.log1p(df["allocatedAmount"].fillna(0).astype(float))
        utilized = np.log1p(df["utilizedAmount"].fillna(0).astype(float))
        progress = df["progress"].fillna(0).astype(float) / 100.0

        X = np.column_stack([allocated, utilized, progress])
        X = np.nan_to_num(X, nan=0.0)

        n_neighbors = min(self.n_neighbors, len(df) - 1)
        lof = LocalOutlierFactor(n_neighbors=n_neighbors, contamination=self.contamination, novelty=False)
        predictions = lof.fit_predict(X)
        raw_factors = -lof.negative_outlier_factor_  # Higher factor (> 1.5) indicates strong outlier

        # Scale LOF factor into [0, 100] signal
        # factor around 1.0 is normal, > 2.0 is outlier
        scaled_scores = np.clip((raw_factors - 1.0) * 50.0, 0, 100)
        is_anomaly = (predictions == -1)
        return is_anomaly, scaled_scores
