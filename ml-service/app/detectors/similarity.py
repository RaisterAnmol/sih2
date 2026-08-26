import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from typing import List, Dict, Any

class TextSimilarityDetector:
    def __init__(self, threshold: float = 0.68, max_features: int = 5000):
        self.threshold = threshold
        self.vectorizer = TfidfVectorizer(
            ngram_range=(1, 3),
            max_features=max_features,
            stop_words="english"
        )

    def find_similar_projects(self, df: pd.DataFrame) -> Dict[str, List[Dict[str, Any]]]:
        if len(df) < 2:
            return {}

        # Construct comprehensive text representation
        text_corpus = (
            df["title"].fillna("") + " " +
            df["description"].fillna("") + " " +
            df["category"].fillna("") + " " +
            df["district"].fillna("")
        ).tolist()

        try:
            tfidf_matrix = self.vectorizer.fit_transform(text_corpus)
            similarity_matrix = cosine_similarity(tfidf_matrix)
        except Exception:
            return {}

        project_ids = df["projectId"].tolist()
        titles = df["title"].tolist()
        districts = df["district"].tolist()
        costs = df["allocatedAmount"].tolist()
        contractors = df["contractorName"].fillna("").tolist()

        similar_dict: Dict[str, List[Dict[str, Any]]] = {}

        for i, pid in enumerate(project_ids):
            matches = []
            for j in range(len(project_ids)):
                if i == j:
                    continue
                score = float(similarity_matrix[i, j])
                if score >= self.threshold:
                    reasons = [f"Text similarity score of {score * 100:.1f}%"]
                    if districts[i] == districts[j]:
                        reasons.append("Identical district execution area")
                    if contractors[i] and contractors[i] == contractors[j]:
                        reasons.append("Assigned to identical contractor entity")
                    if abs(costs[i] - costs[j]) / (max(costs[i], costs[j]) or 1) < 0.15:
                        reasons.append("Near-identical allocated budget amount")

                    matches.append({
                        "projectId": project_ids[j],
                        "title": titles[j],
                        "similarityScore": round(score, 3),
                        "reasons": reasons
                    })

            # Sort matches descending by score and keep top 5
            matches.sort(key=lambda x: x["similarityScore"], reverse=True)
            similar_dict[pid] = matches[:5]

        return similar_dict
