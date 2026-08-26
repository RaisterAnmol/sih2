# Database Schema & Indexing — MPLAD Insight
**MoSPI SIH 2026 PS26102 MongoDB Architecture**

---

## 1. Core Collections

1. **`users`**
   - Stores authenticated credentials, roles (`ADMIN`, `AUDITOR`, `ANALYST`, `VIEWER`), department, and designation.
   - Index: `email` (unique).

2. **`projects`**
   - Primary repository containing project telemetry, financial allocations, expenditures, progress, coordinates, risk scores, explainable signals, and similar works.
   - Indexes: `projectId` (unique), `title` (text), `state`, `district`, `category`, `riskScore`, `riskLevel`, `contractorName`, compound index `{ state: 1, district: 1, riskLevel: 1 }`.

3. **`contractors`**
   - Vendor profiles tracking total projects, aggregate allocated funds, high-risk work counts, monopolization flags, and operating districts.
   - Indexes: `contractorId` (unique), `name` (unique).

4. **`districts`**
   - Geographic master table storing coordinates (lat/lon), total works, aggregate funds, and average risk metrics.
   - Index: `{ state: 1, district: 1 }` (unique).

5. **`anomalies`**
   - Anomaly catalog storing discrete rule triggers with dimension, severity, score, and supporting values.
   - Indexes: `anomalyId` (unique), `projectId`, `dimension`, `severity`.

6. **`riskcases`**
   - Formal auditor investigation cases with status transitions (`OPEN`, `UNDER_REVIEW`, `VERIFIED`, `DISMISSED`, `ESCALATED`), assigned officers, and timestamped note histories.
   - Indexes: `caseId` (unique), `projectId`, `status`, `assignedToEmail`.

7. **`alerts`**
   - Proactive notification stream for high-risk flags and critical spikes.
   - Indexes: `alertId` (unique), `isRead`, `priority`.

8. **`auditlogs`**
   - Immutable security and action trail for governance compliance.
   - Indexes: `userEmail`, `action`, `resource`, `createdAt`.

9. **`importjobs`**
   - Ingestion provenance tracking uploaded CSV/XLSX filenames, valid rows, and field validation errors.

10. **`systemconfigurations`**
    - Dynamic risk engine weights and detection thresholds.
