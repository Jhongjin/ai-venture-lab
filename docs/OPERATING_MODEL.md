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

## Gates

- No PRD without an idea brief.
- No build without an MVP spec.
- No implementation without a technical boundary and verification plan.
- No implementation without a saved backend decision, design brief, technical spec, and development runbook.
- No backend commitment without comparing Supabase, Firebase, Firebase SQL Connect, or hybrid fit.
- No launch without QA and security review.
- No sensitive feature without explicit data handling notes.
- No factual market or regulatory claim without a source.

## Console Loop

The app now supports the first live operating loop:

1. Discover idea candidates from pasted conversations or notes.
2. Save a strong candidate as a validation package with an idea record, initial risk, and planned 7-day experiment.
3. Create an idea through the intake form when manual entry is better.
4. Select it in the workbench.
5. Score the core venture criteria.
6. Move the stage and decision status.
7. Attach risks.
8. Record a decision reason.
9. Use the suggested decision and evidence gaps as an advisory gate before PRD.
10. Copy the generated idea brief into downstream PRD or research workflows.
11. Attach the next smallest experiment and success metric.
12. Create an orchestration runbook so strategy, research, product, design, build, QA, debug, security, and launch work have explicit status.
13. Save each orchestration output and copy the generated PRD draft when the evidence is ready.
14. Save generated briefs and PRDs into the artifact library before moving to MVP scope.
15. Generate and save the MVP spec, backend decision, design brief, technical spec, development runbook, and launch checklist before build or release work starts.
16. Promote artifacts from draft to approved only after the relevant gates are complete.
17. Use launch readiness to see which approved artifacts and gates still block build or release.
18. Save revised artifacts as new versions instead of overwriting prior evidence.
19. Record a status note when approving, reopening, or archiving an artifact.
20. Compare revised artifacts against the previous version before promotion.
21. Filter the artifact library by type and lifecycle status during review.
22. Treat magic link as the default operator sign-in path; password sign-in is only for existing Supabase Auth password users.
23. Route magic links through `/auth/callback` so Supabase auth codes become app sessions before returning home.
24. Surface callback exchange failures in the operator card so auth setup issues can be fixed without guessing.
25. Use phase-specific output templates so strategy, research, product, design, build, QA, debug, security, and launch work produces comparable notes.
26. Show the next launch blocker beside readiness percentage so operators can act on the first gate that needs attention.
27. Keep matching `.codex/agents/` role definitions for every orchestration phase so agent delegation mirrors the app runbook.
28. Exchange root-level `?code=` magic link redirects on the client as a fallback when Supabase sends the code to `/` instead of `/auth/callback`.
29. Let operators attach owned personal records to the active workspace after creating an organization boundary.
30. Before development, write the technical boundary: Next.js server/client split, Supabase tables/RLS, Vercel envs, UI states, quality gates, smoke path, and rollback path.
31. For each new app idea, choose the backend deliberately. Supabase remains the default for this lab, while Firebase is a strong option for mobile, realtime, Google Analytics/Crashlytics/Cloud Messaging, App Check, and Firebase SQL Connect/Postgres experiments.
32. Save development-stage artifacts as first-class venture artifacts: `backend_decision`, `design_brief`, `tech_spec`, and `dev_runbook`.
33. Treat launch readiness as blocked until backend choice is recorded, design/technical specs are approved, and the development runbook exists.
34. Generate a Codex implementation handoff before actual build work so the coding agent receives scope, constraints, quality gates, forbidden shortcuts, and completion reporting rules.
35. Generate implementation tasks from approved or draft development artifacts before coding starts.
36. Move implementation tasks through `todo`, `doing`, `blocked`, and `done`, with completion evidence such as commits, PRs, preview URLs, smoke results, or unresolved risks.
37. Treat launch readiness as blocked until implementation tasks exist and every task has reached `done`.
38. Require completion evidence for every done implementation task before development can be considered complete.
39. Save a development completion report after task, QA, security, and launch readiness gates have been reviewed.
