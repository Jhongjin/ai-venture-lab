# Operating Model

AI Venture Lab turns raw app ideas into tested MVPs using a fixed operating loop.

## Phases

1. Strategy: define the opportunity, constraints, and desired decision.
2. Research: validate facts, competitors, regulation, and user pain.
3. Product: write the smallest PRD that can be tested.
4. Design: define flows, screens, states, and usability risks.
5. Build: implement the smallest useful prototype.
6. QA: test the core journey and regression risks.
7. Debug: reproduce, isolate, fix, and verify failures.
8. Security: review PII, secrets, permissions, abuse, and retention.
9. Launch: decide ship, pivot, kill, or research more.

## Artifacts

- Idea brief: `templates/IDEA_BRIEF.md`
- Research brief: generated `research_note` artifact in the workbench
- 7-day validation sprint: generated `research_note` artifact with interview recruiting, alternatives, pricing, and decision criteria
- Evidence note: manual `research_note` artifact for interviews, external sources, pricing signals, and competitor observations
- Controlled beta participant screener: `templates/BETA_PARTICIPANT_SCREENER.md`
- Controlled beta session feedback: `templates/BETA_SESSION_FEEDBACK.md`
- Experiment result: manual `research_note` artifact for result, learning, next decision, and next action
- Validation summary: generated `research_note` artifact that rolls up evidence, experiments, risks, and decision history before PRD
- Product requirements: `templates/PRD.md`
- MVP scope: `templates/MVP_SPEC.md`
- Technical spec: `templates/TECH_SPEC.md`
- Development runbook: `templates/DEV_RUNBOOK.md`
- Role prompt pack: generated `dev_runbook` artifact for strategy, research, product, design, build, QA, debug, security, and launch handoffs
- Design brief: `templates/DESIGN_BRIEF.md`
- Backend decision guide: `docs/BACKEND_DECISION_GUIDE.md`
- Decision history: `docs/DECISION_LOG.md`
- Risk register: `docs/RISK_REGISTER.md`
- Development harness: `docs/DEVELOPMENT_HARNESS.md`
- Launch gate: `templates/LAUNCH_CHECKLIST.md`

## Skills

- `app-development-orchestrator`: coordinates PRD-to-build gates, backend choice, task board, QA/security, deployment, and Codex handoff.
- `ux-review`: reviews screens, flows, design prompts, state coverage, mobile, accessibility, and Stitch/Figma-style generation briefs.
- `prototype-builder`: implements a scoped vertical slice after backend, design, technical, task, and risk gates are clear.

## Gates

- No PRD without an idea brief and a research brief.
- No PRD promotion without a validation summary when evidence, experiments, or high-risk items exist.
- No PRD handoff without checking the PRD readiness gate in the product artifact tab.
- No build without an MVP spec.
- No implementation without a technical boundary and verification plan.
- No implementation without a saved backend decision, design brief, technical spec, and development runbook.
- No backend commitment without comparing Supabase, Firebase, Firebase SQL Connect, or hybrid fit.
- No backend decision artifact without checking the app development backend scorecard.
- No design handoff without checking the design readiness gate for journey, MVP scope, backend boundary, and screen states.
- No coding start without checking the build readiness gate for approved PRD, MVP, design, technical spec, runbook, tasks, and high-risk status.
- No coding start without recording Vercel environment-variable boundaries, backend rules allowed/denied checks, deploy-log location, and rollback criteria.
- No repository handoff without `pnpm release:check` passing when build or release guardrails change.
- No launch without QA and security review.
- No sensitive feature without explicit data handling notes.
- No factual market or regulatory claim without a source.

## Agent Work Loop

Use this loop for every implementation or harness phase:

1. Pick one coherent next job that advances the active phase.
2. Skip optional work that is not required for the phase outcome.
3. If a non-skippable item needs SQL, dashboard setup, credentials, or user confirmation, record it as the next user action and continue with independent work.
4. Complete the job, run the right quality gates, and update docs or decision logs.
5. Report the completed job, skipped/deferred work, validation result, and next job.
6. Commit and push the completed job.
7. Deploy and production-smoke user-facing changes.
8. Repeat until the phase gate is complete or the only remaining work is blocked by a named external action.

## Console Loop

The app now supports the first live operating loop:

1. Discover idea candidates from pasted conversations or notes.
2. Save a strong candidate as a validation package with an idea record, initial risk, planned 7-day experiment, idea brief, research brief, and validation sprint artifacts.
3. Check similar existing ideas before saving a candidate so duplicate records do not fragment the evidence trail.
4. Check validation-package readiness and source excerpts on extracted candidates so problem signal, user/buyer separation, measurable metric, risk, first MVP scope, duplicate risk, sensitive-source risk, and origin text are visible before saving. Saved source excerpts are automatically redacted for obvious contact and identifier patterns.
5. Apply the extraction gate before saving: proceed when validation score, readiness, risk, and duplicate checks are strong; research more when evidence is missing; pivot when the segment, buyer, MVP scope, or duplicate boundary needs redefinition; kill when the core problem or MVP signal is too weak.
6. Create an idea through the intake form when manual entry is better.
7. Select it in the workbench.
8. Score the core venture criteria.
9. Move the stage and decision status.
10. Attach risks.
11. Record a decision reason.
12. Use the suggested decision and evidence gaps as an advisory gate before PRD.
13. Save the generated idea brief, research brief, 7-day validation sprint, and at least one manual evidence note so problem evidence, alternatives, price, regulation, privacy checks, and field execution are explicit before PRD.
14. Attach the next smallest experiment and success metric.
15. Record experiment results as research notes so the next decision is based on what was learned, not only the plan.
16. Save a validation summary before PRD so the evidence, experiments, risks, and decision history produce one proceed/research/pivot/kill memo.
17. Check PRD readiness in the product artifact tab before saving PRD so missing validation items are visible at the point of handoff.
18. Create an orchestration runbook so strategy, research, product, design, build, QA, debug, security, and launch work have explicit status.
19. Save each orchestration output and copy the generated PRD draft when the evidence is ready.
20. Save generated briefs, research notes, and PRDs into the artifact library before moving to MVP scope.
21. Generate and save the MVP spec, backend decision, design brief, technical spec, development runbook, and launch checklist before build or release work starts.
22. Promote artifacts from draft to approved only after the relevant gates are complete.
23. Use launch readiness to see which approved artifacts and gates still block build or release.
24. Save revised artifacts as new versions instead of overwriting prior evidence.
25. Record a status note when approving, reopening, or archiving an artifact.
26. Compare revised artifacts against the previous version before promotion.
27. Use artifact sub-tabs to keep validation drafts, product drafts, and the artifact library separate enough for operators to avoid long-scroll confusion.
28. Filter the artifact library by type and lifecycle status during review.
29. Treat dashboard-created password accounts as the default operator sign-in path; magic links are a fallback for environments with reliable SMTP.
30. Route fallback email links through `/auth/callback` so Supabase auth codes become app sessions before returning home.
31. Surface callback exchange failures in the operator card so auth setup issues can be fixed without guessing.
32. Use phase-specific output templates so strategy, research, product, design, build, QA, debug, security, and launch work produces comparable notes.
33. Show the next launch blocker beside readiness percentage so operators can act on the first gate that needs attention.
34. Keep matching `.codex/agents/` role definitions for every orchestration phase so agent delegation mirrors the app runbook.
35. Exchange root-level `?code=` magic link redirects on the client as a fallback when Supabase sends the code to `/` instead of `/auth/callback`.
36. Let operators attach owned personal records to the active workspace after creating an organization boundary.
37. Before development, write the technical boundary: Next.js server/client split, Supabase tables/RLS, Vercel envs, UI states, quality gates, smoke path, and rollback path.
38. For each new app idea, choose the backend deliberately. Supabase remains the default for this lab, while Firebase is a strong option for mobile, realtime, Google Analytics/Crashlytics/Cloud Messaging, App Check, and Firebase SQL Connect/Postgres experiments.
39. Use the backend scorecard to compare Supabase, Firebase, Firebase SQL Connect, and Hybrid before saving the backend decision artifact.
40. Check design readiness before saving or approving design work so screen states, mobile constraints, accessibility, and data boundaries are explicit.
41. Save development-stage artifacts as first-class venture artifacts: `backend_decision`, `design_brief`, `tech_spec`, and `dev_runbook`.
42. Check build readiness before coding starts so approved artifacts, runbook, tasks, and unresolved high risks are visible in one place.
43. Keep app development work split into setup/artifacts, task board, and completion/handoff tabs so operators do not lose context in a long scroll.
44. Treat launch readiness as blocked until backend choice is recorded, design/technical specs are approved, and the development runbook exists.
45. Generate a Codex implementation handoff before actual build work so the coding agent receives scope, constraints, quality gates, forbidden shortcuts, and completion reporting rules.
46. Generate a role prompt pack when multiple specialist passes are needed so strategy, research, product, design, build, QA, debug, security, and launch all work from the same context and return format.
47. Generate implementation tasks from approved or draft development artifacts before coding starts.
48. Add manual implementation tasks when real work appears outside the generated baseline, such as bugs, design polish, deployment fixes, customer validation, or rollback work.
49. Use the next development action and copied ticket/backlog text to hand work to Codex, GitHub Issues, or a human implementer.
50. Move implementation tasks through `todo`, `doing`, `blocked`, and `done`, with completion evidence such as commits, PRs, preview URLs, smoke results, or unresolved risks.
51. Treat launch readiness as blocked until implementation tasks exist and every task has reached `done`.
52. Require completion evidence for every done implementation task before development can be considered complete.
53. Save a development completion report after task, QA, security, and launch readiness gates have been reviewed.
54. Keep the shell metrics and recommended next step in sync with saved records so operators do not need to refresh to trust the cockpit.
55. Use the shell priority candidates to decide which ideas need risk clearing, experiments, validation artifacts, or development handoff first.
56. Use the research brief as the required bridge between raw idea evidence and product requirements, especially for interview scripts, competitor alternatives, willingness-to-pay, and regulated data handling.
57. Use the 7-day validation sprint whenever the operator needs copy-ready recruiting messages, day-by-day validation actions, and a Day 7 proceed/research/pivot/kill decision.
58. Capture interview notes, external URLs, pricing signals, and competitor observations as evidence notes instead of leaving them in chat or browser history.
59. Capture experiment results as research notes so completed tests change the next decision and next action.
60. Use the validation summary to decide whether the next artifact should be PRD, another experiment, a pivot, or an explicit kill decision.
61. Treat environment variables, backend authorization rules, deploy logs, and rollback as build-readiness evidence, not post-launch cleanup.
62. Record Vercel Preview/Production variable scope, public/server secret boundaries, and redeploy status in the technical spec or runbook.
63. Record Supabase RLS or Firebase Security Rules/IAM allowed and denied checks before moving backend or release tasks to done.
64. Save Vercel inspect URLs or deploy logs with release evidence so production issues can be traced and rolled back.
65. Run `pnpm release:check` locally while GitHub Actions is blocked so release-safety drift is caught before push.
66. Use `docs/BETA_ENV_AND_SMOKE_BOUNDARY.md` before beta smoke, telemetry smoke, env changes, or deployment evidence collection so the runtime stays `beta_env_smoke_boundary_docs_only`, names-only, disposable-account only for authenticated smoke, and local-secret only for telemetry.
67. Use `docs/CI_WORKFLOW_SCOPE_BOUNDARY.md` before creating or modifying GitHub Actions so future CI mirrors local non-secret gates and does not run deploy, rollback, authenticated write smoke, telemetry smoke, production mutation, or secret-bearing checks by default.
68. Use `templates/BETA_PARTICIPANT_SCREENER.md`, `docs/CONTROLLED_BETA_SESSION_PLAYBOOK.md`, and `templates/BETA_SESSION_FEEDBACK.md` before/after participant sessions so beta observations stay synthetic, summary-only, and separate from technical smoke evidence.
