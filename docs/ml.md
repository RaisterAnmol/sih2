# Machine Learning Pipeline & Explainability — MPLAD Insight
**MoSPI SIH 2026 PS26102**

---

## 1. Multi-Model Architecture

MPLAD Insight employs a hybrid ensemble approach combining unsupervised anomaly detection with transparent domain heuristics:

| Model / Technique | Purpose | Feature Inputs |
| :--- | :--- | :--- |
| **Isolation Forest** | Multivariate cost, duration, and telemetry divergence | `log1p(cost)`, `utilization_ratio`, `progress`, `cost_peer_ratio`, `contractor_load`, `log1p(duration)` |
| **Local Outlier Factor (LOF)** | Local category and district density outlier detection | `log1p(allocated)`, `log1p(utilized)`, `progress` |
| **TF-IDF + Cosine Similarity** | Fuzzy project description and duplicate scope clustering | Project title, scope description, category, and district text corpus (1-3 ngrams) |
| **Deterministic Rule Engine** | Schedule of Rates (SOR) and statutory governance rules | Peer median cost ratios, contractor district shares, project age, elapsed duration |
| **Spatial / Temporal Detectors**| Geographic GPS clustering & March fiscal sanction rush | Lat/Lon coordinate jitter, approval month & day clustering |

---

## 2. Risk Score Formulation

The Unified Risk Score ($R \in [0, 100]$) is computed using a blended formulation that balances peak dimension severity with multi-criteria breadth:

$$R_{\text{base}} = 0.50 \cdot \max_{d}(S_d) + 0.50 \cdot \sum_{d} w_d \cdot S_d$$

Where:
- $w_d$ represents the configurable dimension weights (Financial: 25%, Contractor: 20%, Duplicate: 15%, Geographic: 10%, Temporal: 10%, Efficiency: 10%, Data Quality: 10%).
- $S_d \in [0, 100]$ represents the severity score of dimension $d$.

### Signal Corroboration Bonuses
$$R_{\text{final}} = \min\left(100, R_{\text{base}} + \min(20, 5 \cdot N_{\text{signals}}) + B_{\text{severity}}\right)$$
Where $B_{\text{severity}} = 15$ if any signal is `CRITICAL`, and $8$ if `HIGH`.

### Risk Tiers
- **0 – 29:** `LOW RISK` (Normal standard audit sample)
- **30 – 59:** `MEDIUM RISK` (Desk review recommended)
- **60 – 79:** `HIGH RISK` (Tender & milestone voucher verification required)
- **80 – 100:** `CRITICAL RISK` (Immediate on-site physical measurement book audit)

---

## 3. Explainability Engine
Every flagged anomaly outputs human-readable rationales with concrete statistical evidence:
```json
{
  "ruleId": "RULE_FIN_COST_OUTLIER",
  "dimension": "FINANCIAL",
  "signal": "Project cost is 3.4x district category peer median",
  "severity": "CRITICAL",
  "explanation": "Allocated amount (₹98,00,000) significantly deviates from peer median (₹22,00,000) for Community Assets in Pune.",
  "supportingValue": {
    "allocated": 9800000,
    "peerMedian": 2200000,
    "ratio": 3.4
  }
}
```
