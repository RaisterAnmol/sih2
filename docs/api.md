# API Reference — MPLAD Insight
**MoSPI SIH 2026 PS26102 REST API Documentation**

All responses follow the unified JSON structure:
```json
{
  "success": true,
  "data": { ... }
}
```

---

## Authentication Endpoints
- `POST /api/auth/login` — Authenticate user credentials & receive JWT token.
- `POST /api/auth/logout` — Invalidate user session & record audit log.
- `GET /api/auth/me` — Retrieve active session and profile metadata.

## Executive Dashboard
- `GET /api/dashboard/summary` — Aggregate live KPIs, risk distribution, category spending, and high-risk projects. Filters: `state`, `district`, `riskLevel`, `category`, `financialYear`.

## Projects
- `GET /api/projects` — Server-side paginated projects query. Query params: `page`, `limit`, `search`, `state`, `district`, `category`, `riskLevel`, `status`, `sortBy`, `sortOrder`.
- `GET /api/projects/:id` — Deep intelligence, peer median statistics, and contractor profile.
- `GET /api/projects/export/csv` — Stream CSV export of database records.
- `POST /api/projects/analyze` — Trigger live AI anomaly scan on project batch.

## Anomalies & Investigation Cases
- `GET /api/anomalies` — Query categorized anomalies catalog by dimension.
- `GET /api/risk-cases` — List investigation cases across Kanban/Table views.
- `POST /api/risk-cases` — Open new formal auditor investigation case.
- `GET /api/risk-cases/:id` — View case notes, evidence, and project link.
- `PUT /api/risk-cases/:id` — Update case status, assign officer, and append notes.

## Contractors & GIS
- `GET /api/contractors` — Vendor concentration metrics, project volume, and risk rate.
- `GET /api/contractors/:id` — Full vendor profile and executed works history.
- `GET /api/districts` — District GIS coordinates and risk aggregates.

## Analytics & Quality
- `GET /api/analytics/financial` — Cost histograms and peer outliers.
- `GET /api/analytics/temporal` — Monthly approvals and March fiscal rush spikes.
- `GET /api/analytics/efficiency` — Progress vs utilization scatter points.
- `GET /api/data-quality` — 5-pillar data quality scores and defect registry.

## Reports & Provenance
- `GET /api/reports/project/:id/pdf` — Dynamic official PDF audit report generation.
- `GET /api/reports/overview/csv` — Scheme overview CSV audit export.
- `POST /api/import/csv` — Upload CSV file with schema validation and provenance tracking.

## System & Demo Operations
- `GET /api/health` — System, Database, and ML microservice status.
- `POST /api/demo/launch` — 1-Click seed 5,200 projects and execute full AI pipeline.
- `GET /api/audit-log` — Immutable auditor activity and security trail.
- `GET /api/settings` & `PUT /api/settings` — Query and update risk scoring weights and thresholds.
