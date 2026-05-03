# Risk Register

| Risk | Area | Severity | Mitigation | Status |
| --- | --- | --- | --- | --- |
| Personal data leakage | Privacy | High | Do not store real PII in early prototypes; use `.env.example`; document data retention before launch | Open |
| Regulated advice claims | Legal | High | Avoid medical, legal, financial, or therapy claims unless reviewed by qualified counsel | Open |
| Weak idea validation | Product | Medium | Require idea brief, score gate, and decision log before build | Open |
| Secret exposure | Security | High | Keep `.env*` ignored except `.env.example`; review Vercel/Supabase env handling | Open |
| Agent drift | Operations | Medium | Keep `AGENTS.md` short; store durable docs in `docs/`; run harness checks | Open |
| Broad authenticated write policy | Security | Medium | Keep the project private for now; add organization/user ownership before storing sensitive data | Open |
