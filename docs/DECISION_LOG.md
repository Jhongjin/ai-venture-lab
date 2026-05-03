# Decision Log

Use this file for durable product, architecture, and operating decisions.

| Date | Decision | Reason | Revisit When |
| --- | --- | --- | --- |
| 2026-05-03 | Start with a venture lab harness before building a single app | Multiple ideas need the same screening, PRD, QA, and security loop | First MVP is selected |
| 2026-05-03 | Use Next.js, TypeScript, Tailwind, pnpm, Vercel, and Supabase-ready envs | Fast deploy path, strong TypeScript ergonomics, simple Vercel integration | Backend needs exceed Supabase |
| 2026-05-03 | Use Supabase magic links for the first operator workflow | It works with the anon key, keeps writes behind `authenticated`, and avoids password handling in the first pass | Organization-scoped access is needed |
| 2026-05-03 | Add `created_by` ownership to venture lab tables | Authenticated writes should not imply all authenticated operators can mutate every record | Multi-user organization model is added |
| 2026-05-03 | Add password sign-in fallback for operators | Supabase built-in email delivery is rate-limited and can block early testing | Custom SMTP or OAuth is configured |
| 2026-05-03 | Add an idea workbench before separate detail pages | Operators need one focused surface for scoring, staging, risks, and decisions before navigation complexity grows | Portfolio has enough records to need routing |
| 2026-05-03 | Show advisory score decisions and evidence gaps in the workbench | The lab should make the next action visible without pretending the score replaces judgment | Automated research or PRD generation is added |
| 2026-05-03 | Add copyable idea brief drafts | Operators need a fast handoff from scoring to PRD/research without retyping portfolio data | Full PRD generation is implemented |
| 2026-05-03 | Add experiment planning to the workbench | Validated learning needs a concrete next test, not only a static idea score | Experiment results and status transitions are added |
| 2026-05-03 | Add experiment status transitions | Operators need to see whether a test is planned, running, or done | Experiment outcomes are captured |
| 2026-05-03 | Add risk status transitions | Risks need an operational lifecycle, not just a static note | Risk severity and ownership filters are expanded |
