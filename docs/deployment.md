# Deployment & Operations Guide — MPLAD Insight
**MoSPI SIH 2026 PS26102**

---

## 1. Quick Local Development Startup

### Prerequisites
- Node.js `v18+` or `v20+`
- Python `3.10+` or `3.11+`
- MongoDB (optional; the API automatically starts embedded In-Memory MongoDB if no external DB is active)

### Step 1: Install Dependencies
```bash
# In the root repository directory
npm install
py -3.11 -m venv ml-service/.venv
ml-service/.venv/Scripts/pip install -r ml-service/requirements.txt
```

### Step 2: Start All Services in Concurrent Dev Mode
```bash
npm run dev
```
- **Web Frontend:** `http://localhost:3000`
- **Backend API Gateway:** `http://localhost:5000`
- **FastAPI ML Microservice:** `http://localhost:8000`

---

## 2. One-Command Docker Deployment

```bash
docker compose up --build -d
```
All four containers (`mongodb`, `ml-service`, `api`, `web`) will initialize with automated health checks.

---

## 3. Demo Credentials (For Evaluation)
| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@mplad-insight.demo` | `Demo@12345` | Full System & Configuration |
| **AUDITOR** | `auditor@mplad-insight.demo` | `Demo@12345` | Cases, Projects, Reports & Review |
| **ANALYST** | `analyst@mplad-insight.demo` | `Demo@12345` | ML Analytics, Ingestion & Metrics |
| **VIEWER** | `viewer@mplad-insight.demo` | `Demo@12345` | Read-only Oversight |
