# System Architecture — MPLAD Insight
**AI-Powered Anomaly & Efficiency Intelligence Platform (SIH 2026 - PS26102)**
*Ministry of Statistics and Programme Implementation (MoSPI)*

---

## 1. High-Level Architecture

```mermaid
graph TD
    User([Auditor / Official / Analyst]) -->|HTTPS / UI| Frontend[React 18 + Vite + Tailwind Web Application]
    Frontend -->|REST API + JWT Bearer| APIGateway[Node.js + Express + TypeScript Gateway]
    
    subgraph "Data Storage & Caching"
        APIGateway -->|Mongoose ODM| MongoDB[(MongoDB 7.0 / In-Memory DB)]
    end

    subgraph "AI / ML Intelligence Microservice (FastAPI)"
        APIGateway -->|HTTP POST /analyze/batch| MLEngine[Python 3.11 FastAPI Service]
        MLEngine --> F1[Multidimensional Feature Engineering]
        F1 --> M1[Isolation Forest Ensemble Anomaly Detector]
        F1 --> M2[Local Outlier Factor LOF Peer Deviation]
        F1 --> M3[TF-IDF N-gram Cosine Similarity Matcher]
        F1 --> M4[Deterministic Schedule of Rates Rule Engine]
        F1 --> M5[Contractor Monopolization & GIS Clusters]
        F1 --> M6[Temporal Fiscal Year-End Rush Spikes]
        
        M1 & M2 & M3 & M4 & M5 & M6 --> R1[Unified Multi-Criteria Risk Aggregator]
        R1 --> R2[Explainable AI Evidence & Action Synthesizer]
        R1 --> R3[Calibrated Confidence Evaluator]
    end

    subgraph "Auditor Governance Workflows"
        APIGateway --> W1[Server-Side Paginated Project Explorer]
        APIGateway --> W2[Deep Intelligence & Peer Rate Visualizer]
        APIGateway --> W3[Investigation Case Lifecycle Management]
        APIGateway --> W4[Automated PDF & CSV Report Generator]
        APIGateway --> W5[Immutable Audit Log Activity Trail]
    end
```

---

## 2. Intelligence Pipeline Sequence Flow

```mermaid
sequenceDiagram
    autonumber
    participant UI as Web Frontend (React)
    participant API as Node.js Express API
    participant DB as MongoDB
    participant ML as Python FastAPI ML Engine

    UI->>API: POST /api/demo/launch (or CSV Import)
    API->>DB: Ingest 5,200+ Normalized Project Records
    API->>ML: POST /analyze/batch (Project Features)
    ML->>ML: Run Isolation Forest + LOF + TF-IDF + Rules
    ML->>ML: Aggregate Unified Risk Score (0-100) & Confidence
    ML->>ML: Synthesize Explainable Bullet Points & Recommendations
    ML-->>API: Structured Analysis Output & Benchmark Metrics
    API->>DB: Bulk Upsert Risk Scores, Anomalies & Open Sample Cases
    API-->>UI: Complete Pipeline Success Signal
    UI->>API: GET /api/dashboard/summary
    API-->>UI: Live KPIs, Risk Distribution, GIS Coordinates & Anomaly Feeds
```

---

## 3. Core Component Layers

1. **Presentation Layer (`apps/web`):**
   - React 18 with TypeScript, Vite bundler, Tailwind CSS, Lucide icons, Recharts, and React Leaflet.
   - Executive dark-slate government workstation theme designed for dense analytic readability.
   - 1-Click Demo role switchers (`ADMIN`, `AUDITOR`, `ANALYST`, `VIEWER`).

2. **API Gateway Layer (`apps/api`):**
   - Express.js with TypeScript and Mongoose.
   - Automatic fallback to embedded `mongodb-memory-server` if external MongoDB is unavailable.
   - Robust JWT RBAC authorization, Zod schema validation, Helmet security headers, rate limiting, and Winston logging.
   - Native PDFKit generation of official audit reports.

3. **Machine Learning Microservice (`ml-service`):**
   - FastAPI with Python 3.11, scikit-learn, pandas, and numpy.
   - Hybrid ensemble combining unsupervised anomaly detection with transparent statutory domain heuristics.

4. **Synthetic Data Engine (`apps/api/src/seed`):**
   - Deterministic generation of 5,200+ projects across 12 Indian states and 40+ districts with calibrated ground truth anomaly clusters for repeatable 30-second demonstrations.
