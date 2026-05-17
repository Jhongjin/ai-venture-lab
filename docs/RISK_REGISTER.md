# Risk Register

| Risk | Area | Severity | Mitigation | Status |
| --- | --- | --- | --- | --- |
| Personal data leakage | Privacy | High | Do not store real PII in early prototypes; use `.env.example`; document data retention before launch | Open |
| Regulated advice claims | Legal | High | Avoid medical, legal, financial, or therapy claims unless reviewed by qualified counsel | Open |
| Weak idea validation | Product | Medium | Require idea brief, score gate, and decision log before build | Open |
| Secret exposure | Security | High | Keep `.env*` ignored except `.env.example`; review Vercel/Supabase env handling | Open |
| Telemetry ingest secret disclosed during smoke run | Security/Operations | High | Rotated `TELEMETRY_INGEST_SECRET` in Vercel Production, redeployed, and reran `pnpm smoke:telemetry` plus `pnpm smoke:telemetry:funnel` with the rotated value; keep future telemetry secrets out of chat, docs, logs, and screenshots | Mitigated |
| Beta smoke data leakage | Security/Operations | High | Use `docs/BETA_ENV_AND_SMOKE_BOUNDARY.md` and `docs/SMOKE_DATA_CLEANUP_RUNBOOK.md`; keep beta smoke names-only, use disposable Supabase Auth accounts and disposable workspaces/ideas, keep telemetry secrets in the local terminal only, avoid screenshots with private data, require explicit approval for production write smoke, and clean up or intentionally retain fixtures after the test window | Mitigating |
| CI permission overreach | Security/Operations | Medium | Use `docs/CI_WORKFLOW_SCOPE_BOUNDARY.md`; keep GitHub Actions disabled until workflow scope and user approval exist, mirror non-secret local gates only, and avoid deploy/write/auth/telemetry secrets in CI by default | Open |
| Missing denied-case RLS evidence | Security/Operations | High | RLS allowed/denied browser smoke passed with anonymous, disposable A, disposable B, and cross-workspace denied checks; keep evidence summary-only and rerun if RLS policies, fixtures, or workspace access code change | Mitigated |
| Unverified production RLS migration state | Security/Operations | High | Production posture was checked before denied smoke: required private-read migrations were present, old public-read policies were absent, and RLS was enabled on core tables; rerun posture checks when migrations or policies change | Mitigated |
| Agent drift | Operations | Medium | Keep `AGENTS.md` short; store durable docs in `docs/`; run harness checks | Open |
| Broad authenticated write policy | Security | Medium | Operator ownership policies now restrict updates and deletes to the row creator; add organization ownership before sensitive data | Mitigating |
| Built-in auth email delivery limit | Operations | Medium | Add password sign-in for dashboard-created operators; configure custom SMTP before broader testing | Mitigating |
