# Decision Log

Use this file for durable product, architecture, and operating decisions.

| Date | Decision | Reason | Revisit When |
| --- | --- | --- | --- |
| 2026-05-03 | Start with a venture lab harness before building a single app | Multiple ideas need the same screening, PRD, QA, and security loop | First MVP is selected |
| 2026-05-03 | Use Next.js, TypeScript, Tailwind, pnpm, Vercel, and Supabase-ready envs | Fast deploy path, strong TypeScript ergonomics, simple Vercel integration | Backend needs exceed Supabase |
| 2026-05-03 | Use Supabase magic links for the first operator workflow | It works with the anon key, keeps writes behind `authenticated`, and avoids password handling in the first pass | Organization-scoped access is needed |
| 2026-05-03 | Add `created_by` ownership to venture lab tables | Authenticated writes should not imply all authenticated operators can mutate every record | Multi-user organization model is added |
