# Risk Register

| Risk | Area | Severity | Mitigation | Status |
| --- | --- | --- | --- | --- |
| Personal data leakage | Privacy | High | Do not store real PII in early prototypes; use `.env.example`; document data retention before launch | Open |
| Regulated advice claims | Legal | High | Avoid medical, legal, financial, or therapy claims unless reviewed by qualified counsel | Open |
| Weak idea validation | Product | Medium | Require idea brief, score gate, and decision log before build | Open |
| Secret exposure | Security | High | Keep `.env*` ignored except `.env.example`; review Vercel/Supabase env handling | Open |
| Telemetry ingest secret disclosed during smoke run | Security/Operations | High | Rotate `TELEMETRY_INGEST_SECRET` in Vercel Production and any external MVP/runtime that uses it; clear local terminal history if needed; rerun `pnpm smoke:telemetry` and `pnpm smoke:telemetry:funnel` with the rotated value before treating telemetry beta evidence as complete | Rotation required |
| Beta smoke data leakage | Security/Operations | High | Use `docs/BETA_ENV_AND_SMOKE_BOUNDARY.md`; keep beta smoke names-only, use disposable Supabase Auth accounts and disposable workspaces/ideas, keep telemetry secrets in the local terminal only, avoid screenshots with private data, and require explicit approval for production write smoke | Open |
| CI permission overreach | Security/Operations | Medium | Use `docs/CI_WORKFLOW_SCOPE_BOUNDARY.md`; keep GitHub Actions disabled until workflow scope and user approval exist, mirror non-secret local gates only, and avoid deploy/write/auth/telemetry secrets in CI by default | Open |
| Missing denied-case RLS evidence | Security/Operations | High | Use `docs/RLS_ALLOWED_DENIED_SMOKE_PLAN.md` and `pnpm smoke:browser:rls:preflight`; require a second disposable account and disposable workspace pair, record summary-only allowed/denied evidence, and block private-read beta claims if cross-workspace denied checks are missing | Open |
| Unverified production RLS migration state | Security/Operations | High | Use `docs/SUPABASE_RLS_POLICY_POSTURE_REVIEW.md`; confirm production migrations applied, old public-read policies removed, and disposable two-account denied smoke passed before private-read beta claims | Open |
| Agent drift | Operations | Medium | Keep `AGENTS.md` short; store durable docs in `docs/`; run harness checks | Open |
| Broad authenticated write policy | Security | Medium | Operator ownership policies now restrict updates and deletes to the row creator; add organization ownership before sensitive data | Mitigating |
| Built-in auth email delivery limit | Operations | Medium | Add password sign-in for dashboard-created operators; configure custom SMTP before broader testing | Mitigating |
