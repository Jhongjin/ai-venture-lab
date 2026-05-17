# Risk Register

| Risk | Area | Severity | Owner | Mitigation | Status | Beta Gate Disposition |
| --- | --- | --- | --- | --- | --- | --- |
| Personal data leakage | Privacy | High | Operator | Do not store real PII in early prototypes; use `.env.example`; document data retention before launch | Open | Requires acceptance or mitigation before `ship` |
| Regulated advice claims | Legal | High | Operator | Avoid medical, legal, financial, or therapy claims unless reviewed by qualified counsel | Open | Requires explicit scope exclusion or review before `ship` |
| Weak idea validation | Product | Medium | Operator | Require idea brief, score gate, and decision log before build | Open | Non-blocking for technical beta; blocks product launch claims |
| Secret exposure | Security | High | Operator | Keep `.env*` ignored except `.env.example`; review Vercel/Supabase env handling | Open | Requires acceptance or mitigation before `ship` |
| Telemetry ingest secret disclosed during smoke run | Security/Operations | High | Operator | Rotated `TELEMETRY_INGEST_SECRET` in Vercel Production, redeployed, and reran `pnpm smoke:telemetry` plus `pnpm smoke:telemetry:funnel` with the rotated value; keep future telemetry secrets out of chat, docs, logs, and screenshots | Mitigated | Non-blocking if every external runtime has also rotated |
| Beta smoke data leakage | Security/Operations | High | Operator | Use `docs/BETA_ENV_AND_SMOKE_BOUNDARY.md` and `docs/SMOKE_DATA_CLEANUP_RUNBOOK.md`; keep beta smoke names-only, use disposable Supabase Auth accounts and disposable workspaces/ideas, keep telemetry secrets in the local terminal only, avoid screenshots with private data, require explicit approval for production write smoke, and clean up or intentionally retain fixtures after the test window | Mitigating | Blocks broader beta until cleanup disposition is recorded |
| CI permission overreach | Security/Operations | Medium | Operator | Use `docs/CI_WORKFLOW_SCOPE_BOUNDARY.md`; keep GitHub Actions disabled until workflow scope and user approval exist, mirror non-secret local gates only, and avoid deploy/write/auth/telemetry secrets in CI by default | Open | Non-blocking while local `pnpm quality:full` remains the gate |
| Missing denied-case RLS evidence | Security/Operations | High | Operator | RLS allowed/denied browser smoke passed with anonymous, disposable A, disposable B, and cross-workspace denied checks; keep evidence summary-only and rerun if RLS policies, fixtures, or workspace access code change | Mitigated | Non-blocking unless RLS or fixtures change |
| Unverified production RLS migration state | Security/Operations | High | Operator | Production posture was checked before denied smoke: required private-read migrations were present, old public-read policies were absent, and RLS was enabled on core tables; rerun posture checks when migrations or policies change | Mitigated | Non-blocking unless migrations or policies change |
| Agent drift | Operations | Medium | Operator | Keep `AGENTS.md` short; store durable docs in `docs/`; run harness checks | Open | Monitor during beta |
| Broad authenticated write policy | Security | Medium | Operator | Operator ownership policies now restrict updates and deletes to the row creator; add organization ownership before sensitive data | Mitigating | Non-blocking for current disposable beta; revisit before sensitive data |
| Built-in auth email delivery limit | Operations | Medium | Operator | Add password sign-in for dashboard-created operators; configure custom SMTP before broader testing | Mitigating | Non-blocking for dashboard-created beta accounts; SMTP before wider invite flow |

Validation keywords: `risk_owner_recorded`, `beta_gate_disposition_recorded`, `high_risk_requires_acceptance_before_ship`.

Launch closure notes:

- A `Mitigated` status records current evidence; it is not full launch closure when the beta gate disposition is conditional.
- External runtime rotation scope remains unverified unless every trusted runtime that used a disclosed telemetry secret is recorded as rotated.
- High `Open` or unresolved `Mitigating` risks block `ship` unless the operator accepts them for the beta scope or explicitly scopes them out.

Validation keywords: `conditional_mitigation_not_launch_closure`, `external_runtime_rotation_scope_unverified`, `high_risk_open_blocks_ship`.
