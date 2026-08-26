# MPLAD Insight — AI-Powered Anomaly & Efficiency Intelligence Platform
**Smart India Hackathon 2026 — Problem Statement PS26102**
*Ministry / Organization: Ministry of Statistics and Programme Implementation (MoSPI)*
*Theme: Smart Automation | Category: Software*

---

## 🌟 Executive Overview
**MPLAD Insight** is an enterprise-grade AI-powered anomaly, fraud-risk indicator, and efficiency intelligence platform built for MoSPI and government audit authorities. The platform autonomously ingests, normalizes, and screens thousands of MPLAD developmental works using a hybrid ensemble (Isolation Forest, Local Outlier Factor, TF-IDF Cosine Similarity, Contractor Graph metrics, and Schedule of Rates rule heuristics) to prioritize high-risk projects for human investigation, complete with transparent explainability and instant PDF audit reports.

> **Ethical AI Principle:** The system operates strictly as an audit-prioritization decision-support tool. It flags *anomalies, risk signals, and compliance deviations requiring verification* and never asserts conclusive legal guilt without formal human administrative audit.

---

## 🚀 Key Features

1. **Deterministic 5,200+ Project Synthetic Dataset:** Multi-state, multi-district Indian dataset with calibrated ground truth anomaly clusters (cost outliers, duplicate scopes, contractor monopolies, March sanction rushes, stalled works).
2. **Hybrid ML & Explainable AI Engine:**
   - **Isolation Forest:** Multivariate cost, timeline duration, and progress divergence.
   - **Local Outlier Factor (LOF):** Local density peer-group deviation.
   - **TF-IDF + Cosine Similarity:** Fuzzy title and scope duplicate clustering.
   - **Deterministic Rule Engine:** Transparent Schedule of Rates (SOR) comparisons.
3. **Auditor Investigation Workflow:**
   - Full case lifecycle (`OPEN` -> `UNDER_REVIEW` -> `VERIFIED` / `DISMISSED` / `ESCALATED`).
   - Investigator note logs, evidence tracking, and case assignment.
4. **Dynamic Official PDF & CSV Report Generator:** Native 1-click generation of official MoSPI formatted audit dossiers and project reports.
5. **Interactive GIS Spatial Intelligence:** Full-screen Leaflet map displaying district risk bubbles, coordinates, and spatial density.
6. **5-Pillar Data Quality Center:** Evaluates Completeness, Validity, Uniqueness, Consistency, and Timeliness.
7. **Zero-Friction Resilient Architecture:** Auto-fallback to embedded In-Memory MongoDB if external database is unavailable.

---

## 🛠️ Technology Stack

- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, Recharts, Leaflet, React Leaflet, Lucide Icons.
- **Backend API:** Node.js, Express, TypeScript, Mongoose, JWT, bcryptjs, PDFKit, Zod, Winston, Helmet.
- **AI / ML Service:** Python 3.11, FastAPI, scikit-learn, pandas, numpy, Uvicorn.
- **Database:** MongoDB 7.0 (with automatic In-Memory MongoDB fallback).

---

## ⚡ Quickstart & Local Setup

### 1. Prerequisites
- Node.js `v18+` or `v20+`
- Python `3.10+` or `3.11+`

### 2. Installation
```bash
# Clone repository and enter directory
cd sih

# Install Node monorepo packages
npm install

# Setup Python 3.11 virtual environment
py -3.11 -m venv ml-service/.venv
ml-service/.venv/Scripts/pip install -r ml-service/requirements.txt
```

### 3. Run All Services
```bash
# Concurrently starts API (5000), ML Engine (8000), and Web UI (3000)
npm run dev
```

- **Frontend Portal:** [http://localhost:3000](http://localhost:3000)
- **API Gateway:** [http://localhost:5000/api/health](http://localhost:5000/api/health)
- **FastAPI ML Service:** [http://localhost:8000/health](http://localhost:8000/health)

---

## 🔑 Demo Accounts (Evaluation)
| Role | Email | Password | Access Scope |
| :--- | :--- | :--- | :--- |
| **AUDITOR** | `auditor@mplad-insight.demo` | `Demo@12345` | Cases, Projects, Reports & Deep Dives |
| **ADMIN** | `admin@mplad-insight.demo` | `Demo@12345` | Full System & Risk Weights Config |
| **ANALYST** | `analyst@mplad-insight.demo` | `Demo@12345` | Datasets, Quality & ML Scans |
| **VIEWER** | `viewer@mplad-insight.demo` | `Demo@12345` | Read-only Oversight |

---

## 🧪 Testing & Verification

```bash
# Run API unit & statistical tests
npm run test:api

# Run ML Service pytest tests
npm run test:ml

# Run Frontend & API production builds
npm run build
```

---

## 🐳 Docker Deployment
```bash
docker compose up --build -d
```
All four services (`mongodb`, `ml-service`, `api`, `web`) will launch automatically with built-in health checks.
