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
| 2026-05-03 | Add idea-level orchestration runs | Strategy, research, product, design, build, QA, debug, security, and launch need visible ownership and status before the lab can scale | Run outputs and generated artifacts are stored |
| 2026-05-04 | Generate PRD drafts from orchestration outputs | The workbench should turn saved specialist notes into a usable product artifact without another copy-paste pass | PRD drafts need persistence or export |
| 2026-05-04 | Store generated venture artifacts | Idea briefs and PRDs should be durable workspace records, not only clipboard text | Artifact versioning is needed |
| 2026-05-04 | Generate MVP spec and launch checklist drafts | PRD handoff should continue into build and release gates without leaving the workbench | Artifact versioning and approvals are needed |
| 2026-05-04 | Add artifact lifecycle states | Drafts need a visible promotion path before they drive build or launch decisions | Full approval workflow and comments are needed |
| 2026-05-04 | Add launch readiness dashboard | Operators need one visible answer for what still blocks build or release | Readiness history and trend tracking are needed |
| 2026-05-04 | Version generated artifacts on save | Revised PRDs, MVP specs, and checklists should preserve previous evidence instead of overwriting it | Diffing and comments are needed |
| 2026-05-04 | Require approved product artifacts for launch readiness | Saved drafts are useful evidence, but build and release gates should depend on reviewed PRD and MVP scope artifacts | Approval comments and reviewer assignment are needed |
| 2026-05-04 | Store artifact status notes | Approval and archive actions need lightweight rationale without a separate review table yet | Dedicated review threads can come after artifact diffing |
| 2026-05-04 | Show artifact version change summaries | Operators need fast review context before approving revised PRDs or MVP specs | Full side-by-side diffs can come after review notes stabilize |
| 2026-05-04 | Add artifact library filters | Versioned artifacts can grow quickly, so reviewers need low-friction type and status narrowing | Search and full-text artifact indexing can come later |
| 2026-05-04 | Clarify operator auth paths | Magic link and password sign-in have different account assumptions, and operators need visible session status | A dedicated sign-up flow can be added if password onboarding becomes primary |
| 2026-05-05 | Add Supabase auth callback route | Magic link redirects must exchange the Supabase auth code into an app session before the operator card can show signed in | Add auth error UI if callback exchange fails |
| 2026-05-05 | Surface auth callback failures in the operator card | Magic link failures need to distinguish stale links, missing callback state, and browser-profile session mismatch during setup | Dedicated auth diagnostics or custom SMTP is added |
| 2026-05-05 | Add role-specific orchestration output templates | Empty run outputs make specialist passes inconsistent; templates keep strategy through launch notes comparable | Templates need per-idea automation or saved skill packs |
