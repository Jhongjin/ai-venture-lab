# Risk Register

| Risk | Area | Severity | Mitigation | Status |
| --- | --- | --- | --- | --- |
| Personal data leakage | Privacy | High | Do not store real PII in early prototypes; use `.env.example`; document data retention before launch | Open |
| Regulated advice claims | Legal | High | Avoid medical, legal, financial, or therapy claims unless reviewed by qualified counsel | Open |
| Weak idea validation | Product | Medium | Require idea brief, score gate, and decision log before build | Open |
| Secret exposure | Security | High | Keep `.env*` ignored except `.env.example`; review Vercel/Supabase env handling | Open |
| Beta smoke data leakage | Security/Operations | High | Use `docs/BETA_ENV_AND_SMOKE_BOUNDARY.md`; keep beta smoke names-only, use disposable Supabase Auth accounts and disposable workspaces/ideas, keep telemetry secrets in the local terminal only, avoid screenshots with private data, and require explicit approval for production write smoke | Open |
| Agent drift | Operations | Medium | Keep `AGENTS.md` short; store durable docs in `docs/`; run harness checks | Open |
| Broad authenticated write policy | Security | Medium | Operator ownership policies now restrict updates and deletes to the row creator; add organization ownership before sensitive data | Mitigating |
| Built-in auth email delivery limit | Operations | Medium | Add password sign-in for dashboard-created operators; configure custom SMTP before broader testing | Mitigating |
