# AUDITMIND — AI-Powered Governance, Risk, Compliance & Audit Agent

> **AuditMind** is an enterprise AI-powered GRC (Governance, Risk, and Compliance) platform with **persistent organizational audit memory**, deterministic compliance gap calculations, append-only control test histories, evidence-backed AI assistant tools, and proactive monitoring.

---

## 🌟 Key Differentiators & Product Features

Unlike generic compliance chatbots or static dashboard mockups, AuditMind is built on **verifiable historical evidence**:

1. **Persistent Organizational Audit Memory**:
   - Maintains an append-only historical record of all control tests, auditor conclusions, and exceptions across independent engagements.
   - Detects recurring findings and control failures spanning multiple historical audits (e.g., SOC 2 Type II and ISO 27001).
   - Accurately distinguishes between confirmed facts, calculated conditions, and unverified employee assertions.

2. **Deterministic Compliance Gap Detection Engine**:
   - Calculates testing deadlines deterministically in application code based on testing frequencies (`MONTHLY`, `QUARTERLY`, `SEMI_ANNUALLY`, `ANNUALLY`).
   - Identifies **Unverified Remediations**: flags findings marked "Resolved" by owners that lack subsequent verification tests or auditor signoffs (e.g. `AC-001` / `FND-001`).
   - Flags overdue testing, missing baseline test history, missing required evidence artifacts, overdue remediation deadlines, and unreviewed external policy changes.
   - **Idempotent Execution**: rerun-safe monitoring engine prevents duplicate alerts.

3. **Grounded AI Compliance Assistant**:
   - Operates exclusively with **12 narrowly scoped authorized server-side tools** (`get_overdue_controls`, `get_control_test_history`, `get_open_findings`, `get_findings_pending_verification`, `get_missing_evidence`, etc.).
   - Zero hallucination: cites concrete record IDs (`AC-001`, `FND-001`), extracts verifiable excerpts, and links directly to operational UI pages.
   - Requires explicit human confirmation before executing proposed actions.
   - Dual-engine architecture: supports live **OpenAI GPT-4o** tool-calling when configured, and gracefully falls back to the **Local Grounded Compliance Engine** when unconfigured.

4. **Document Intelligence & Extraction Pipeline**:
   - Server-side PDF and text extraction pipeline with SHA-256 cryptographic checksums.
   - Automatically parses entity references (controls, findings, dates, classifications) with confidence levels for human review.

5. **Formal Verification & Risk Acceptance Workflows**:
   - Explicit two-stage remediation verification: owner submits resolution evidence -> authorized reviewer records approval or returns with rejection feedback.
   - Documented business justifications and executive sign-off required for accepted exceptions.

6. **Interactive 5x5 Risk Register**:
   - Inherent risk calculation (`Likelihood (1-5) × Impact (1-5) = 1-25`), control mitigations, residual risk scores, and treatment plans.

7. **Audit-Ready Reports & RFC-4180 CSV Exports**:
   - One-click CSV exports for Controls, Findings, Audits, and Active Compliance Gaps.

---

## 🏗️ Architecture & Technology Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript (Strict Mode), Tailwind CSS v4, Lucide Icons, Recharts data visualizations.
- **Backend**: Server Components, Next.js Server Actions, dedicated compliance engine and repository service layers.
- **Database**:
  - **Local Standalone Engine**: Built-in persistent relational SQLite (`.data/auditmind.sqlite`), requiring zero external dependencies.
  - **Cloud PostgreSQL / Supabase**: Complete SQL migration with Row Level Security (RLS) policies, foreign keys, and indexes in `supabase/migrations/20261026_init_schema.sql`.
- **Testing**: Automated test suite with **Vitest**.

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js `v22.5+` or `v25.x` (uses built-in `node:sqlite`)
- npm `v10+`

### 2. Installation
```bash
# Clone or navigate to the repository
cd Avinya

# Install dependencies
npm install
```

### 3. Environment Configuration (Optional)
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
*Note: AuditMind operates fully out of the box in local standalone mode without any API keys!*

- If `OPENAI_API_KEY` is provided, live GPT-4o structured tool calling is enabled. If omitted, the local rule-grounded tool engine runs automatically.
- If `HINDSIGHT_API_KEY` is provided, assistant conversations are retained in an organization-scoped Hindsight memory bank and relevant memories are recalled before live OpenAI responses. Hindsight is optional; the local grounded engine continues to work without it. Set `HINDSIGHT_API_URL` for a self-hosted Hindsight deployment.
- If `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are provided, Supabase PostgreSQL is connected.

### 4. Running the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Automated Testing

Run the Vitest test suite to verify deterministic calculations, persistent database history, and AI tool authorization:
```bash
npm test
```

Build production bundle and verify typechecks:
```bash
npm run build
```

---

## 🏢 Demonstration Data Scenario: Northstar Technologies

AuditMind automatically seeds a rich demonstration dataset (`Northstar Technologies — DEMO DATA`) demonstrating the core audit scenarios:

| Record Code | Scenario | Expected Agent Behavior |
| :--- | :--- | :--- |
| **`AC-001`** | **Unverified Remediation** | Control failed in 2025 SOC 2 audit (`FND-001`). Employee marked finding resolved via Lambda webhook, but **no verification re-test was recorded**. The agent flags: *"Remediation marked complete but verification is missing"*. |
| **`CM-001`** | **Recurring Deficiencies** | Change management control failed in both SOC 2 Type II and ISO 27001 audits due to emergency hotfix bypasses. The agent clusters this as a **recurring issue across audits**. |
| **`IA-001`** | **Overdue Testing** | Quarterly MFA control was last tested >110 days ago. The engine flags it as **overdue for testing**. |
| **`DS-001`** | **Missing Evidence** | Active encryption control requires annual KMS rotation evidence, which is missing from the Evidence Library. |
| **`CHG-2026-01`** | **Regulatory Policy Change** | External NIST SP 800-63B update requiring passkey transition is flagged with proposed control impact assessments. |
| **`RSK-001`** | **Risk Mitigation** | Account Takeover risk scored at 20 Inherent, mitigated down to 8 Residual via `IA-001` and `AC-002`. |

To reset demonstration data to pristine fixtures at any time:
- Navigate to **Settings** (`/settings`) and click **"Reset & Re-seed Demo Data"**, or
- Send a POST request to `/api/demo/seed?force=true`.

---

## ⏰ Scheduled Compliance Monitoring (Cron)

AuditMind provides an authenticated, idempotent background monitoring endpoint:
```bash
POST /api/cron/monitor
Authorization: Bearer auditmind-internal-cron-key-2026
```
- Re-evaluates all active controls, finding deadlines, and missing evidence.
- Idempotent: creates no duplicate active gap records or duplicate notifications on consecutive executions.
- Logs each execution to `scheduled_job_runs` table with timestamps and metrics.

---

## 📄 Repository Structure

```
Avinya/
├── .data/                               # Local persistent database and uploaded evidence files
│   ├── auditmind.sqlite
│   └── uploads/
├── src/
│   ├── app/
│   │   ├── page.tsx                     # Overview Operational Dashboard
│   │   ├── assistant/page.tsx           # AI Compliance Assistant
│   │   ├── controls/                    # Controls Catalog & Detail Timeline
│   │   ├── audits/                      # Audit Engagements & Completion Workflow
│   │   ├── findings/                    # Findings & Formal Verification
│   │   ├── evidence/                    # Evidence Library & Document Ingestion
│   │   ├── policies/                    # Policies & External Change Tracker
│   │   ├── risks/                       # Risk Register (5x5 Matrix)
│   │   ├── reports/                     # Reports & CSV Exports
│   │   ├── notifications/               # In-App Notification Center
│   │   ├── settings/                    # Settings & RBAC Matrix
│   │   └── api/                         # Backend APIs (chat, cron, upload, export, seed)
│   ├── components/
│   │   ├── layout/AppShell.tsx          # Persistent application shell & navigation
│   │   ├── dashboard/                   # Recharts & quick action modals
│   │   └── search/GlobalSearchModal.tsx # Cmd+K keyboard search dialog
│   ├── lib/
│   │   ├── db/sqlite-store.ts           # Persistent database engine & repositories
│   │   ├── services/
│   │   │   ├── compliance-engine.ts     # Deterministic calculations & gap detection
│   │   │   ├── audit-memory.ts          # Organizational historical memory service
│   │   │   ├── ai-service.ts            # Server-side AI assistant with 12 tools
│   │   │   └── document-service.ts      # PDF & text extraction pipeline
│   │   ├── demo-data.ts                 # Fictional Northstar Technologies fixtures
│   │   └── actions.ts                   # Server actions & mutations
│   └── types/index.ts                   # Domain models and TypeScript interfaces
├── supabase/
│   └── migrations/
│       └── 20261026_init_schema.sql     # PostgreSQL / Supabase migration with RLS
├── tests/                               # Automated Vitest test suite
│   ├── compliance-engine.test.ts
│   ├── db-store.test.ts
│   └── ai-assistant.test.ts
├── vitest.config.ts
├── .env.example
└── README.md
```

---

## 🔒 Security & Data Integrity

- **Server-Side Authorization**: Secret keys, database engines, and AI calls are strictly confined to server-side code and API routes.
- **Evidence Storage**: Uploaded documents are sanitized, hashed with SHA-256, and validated against path-traversal attacks.
- **Append-Only History**: Testing records and activity logs are immutable; corrections preserve historical audit trails.
