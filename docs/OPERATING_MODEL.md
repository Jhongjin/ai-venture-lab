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
- Experiment result: manual `research_note` artifact for result, learning, next decision, and next action
- Validation summary: generated `research_note` artifact that rolls up evidence, experiments, risks, and decision history before PRD
- Product requirements: `templates/PRD.md`
- MVP scope: `templates/MVP_SPEC.md`
- Technical spec: `templates/TECH_SPEC.md`
- Development runbook: `templates/DEV_RUNBOOK.md`
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
- No launch without QA and security review.
- No sensitive feature without explicit data handling notes.
- No factual market or regulatory claim without a source.

## Console Loop

The app now supports the first live operating loop:

1. Discover idea candidates from pasted conversations or notes.
2. Save a strong candidate as a validation package with an idea record, initial risk, and planned 7-day experiment.
3. Check similar existing ideas before saving a candidate so duplicate records do not fragment the evidence trail.
4. Create an idea through the intake form when manual entry is better.
5. Select it in the workbench.
6. Score the core venture criteria.
7. Move the stage and decision status.
8. Attach risks.
9. Record a decision reason.
10. Use the suggested decision and evidence gaps as an advisory gate before PRD.
11. Save the generated idea brief, research brief, 7-day validation sprint, and at least one manual evidence note so problem evidence, alternatives, price, regulation, privacy checks, and field execution are explicit before PRD.
12. Attach the next smallest experiment and success metric.
13. Record experiment results as research notes so the next decision is based on what was learned, not only the plan.
14. Save a validation summary before PRD so the evidence, experiments, risks, and decision history produce one proceed/research/pivot/kill memo.
15. Check PRD readiness in the product artifact tab before saving PRD so missing validation items are visible at the point of handoff.
16. Create an orchestration runbook so strategy, research, product, design, build, QA, debug, security, and launch work have explicit status.
17. Save each orchestration output and copy the generated PRD draft when the evidence is ready.
18. Save generated briefs, research notes, and PRDs into the artifact library before moving to MVP scope.
19. Generate and save the MVP spec, backend decision, design brief, technical spec, development runbook, and launch checklist before build or release work starts.
20. Promote artifacts from draft to approved only after the relevant gates are complete.
21. Use launch readiness to see which approved artifacts and gates still block build or release.
22. Save revised artifacts as new versions instead of overwriting prior evidence.
23. Record a status note when approving, reopening, or archiving an artifact.
24. Compare revised artifacts against the previous version before promotion.
25. Use artifact sub-tabs to keep validation drafts, product drafts, and the artifact library separate enough for operators to avoid long-scroll confusion.
26. Filter the artifact library by type and lifecycle status during review.
27. Treat magic link as the default operator sign-in path; password sign-in is only for existing Supabase Auth password users.
28. Route magic links through `/auth/callback` so Supabase auth codes become app sessions before returning home.
29. Surface callback exchange failures in the operator card so auth setup issues can be fixed without guessing.
30. Use phase-specific output templates so strategy, research, product, design, build, QA, debug, security, and launch work produces comparable notes.
31. Show the next launch blocker beside readiness percentage so operators can act on the first gate that needs attention.
32. Keep matching `.codex/agents/` role definitions for every orchestration phase so agent delegation mirrors the app runbook.
33. Exchange root-level `?code=` magic link redirects on the client as a fallback when Supabase sends the code to `/` instead of `/auth/callback`.
34. Let operators attach owned personal records to the active workspace after creating an organization boundary.
35. Before development, write the technical boundary: Next.js server/client split, Supabase tables/RLS, Vercel envs, UI states, quality gates, smoke path, and rollback path.
36. For each new app idea, choose the backend deliberately. Supabase remains the default for this lab, while Firebase is a strong option for mobile, realtime, Google Analytics/Crashlytics/Cloud Messaging, App Check, and Firebase SQL Connect/Postgres experiments.
37. Use the backend scorecard to compare Supabase, Firebase, Firebase SQL Connect, and Hybrid before saving the backend decision artifact.
38. Check design readiness before saving or approving design work so screen states, mobile constraints, accessibility, and data boundaries are explicit.
39. Save development-stage artifacts as first-class venture artifacts: `backend_decision`, `design_brief`, `tech_spec`, and `dev_runbook`.
40. Check build readiness before coding starts so approved artifacts, runbook, tasks, and unresolved high risks are visible in one place.
41. Keep app development work split into setup/artifacts, task board, and completion/handoff tabs so operators do not lose context in a long scroll.
42. Treat launch readiness as blocked until backend choice is recorded, design/technical specs are approved, and the development runbook exists.
43. Generate a Codex implementation handoff before actual build work so the coding agent receives scope, constraints, quality gates, forbidden shortcuts, and completion reporting rules.
44. Generate implementation tasks from approved or draft development artifacts before coding starts.
45. Add manual implementation tasks when real work appears outside the generated baseline, such as bugs, design polish, deployment fixes, customer validation, or rollback work.
46. Use the next development action and copied ticket/backlog text to hand work to Codex, GitHub Issues, or a human implementer.
47. Move implementation tasks through `todo`, `doing`, `blocked`, and `done`, with completion evidence such as commits, PRs, preview URLs, smoke results, or unresolved risks.
48. Treat launch readiness as blocked until implementation tasks exist and every task has reached `done`.
49. Require completion evidence for every done implementation task before development can be considered complete.
50. Save a development completion report after task, QA, security, and launch readiness gates have been reviewed.
51. Keep the shell metrics and recommended next step in sync with saved records so operators do not need to refresh to trust the cockpit.
52. Use the research brief as the required bridge between raw idea evidence and product requirements, especially for interview scripts, competitor alternatives, willingness-to-pay, and regulated data handling.
53. Use the 7-day validation sprint whenever the operator needs copy-ready recruiting messages, day-by-day validation actions, and a Day 7 proceed/research/pivot/kill decision.
54. Capture interview notes, external URLs, pricing signals, and competitor observations as evidence notes instead of leaving them in chat or browser history.
55. Capture experiment results as research notes so completed tests change the next decision and next action.
56. Use the validation summary to decide whether the next artifact should be PRD, another experiment, a pivot, or an explicit kill decision.
