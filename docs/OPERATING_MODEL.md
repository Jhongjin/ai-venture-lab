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
- Decision history: `docs/DECISION_LOG.md`
- Risk register: `docs/RISK_REGISTER.md`
- Launch gate: `templates/LAUNCH_CHECKLIST.md`

## Gates

- No PRD without an idea brief.
- No build without an MVP spec.
- No launch without QA and security review.
- No sensitive feature without explicit data handling notes.
- No factual market or regulatory claim without a source.

## Console Loop

The app now supports the first live operating loop:

1. Create an idea through the intake form.
2. Select it in the workbench.
3. Score the core venture criteria.
4. Move the stage and decision status.
5. Attach risks.
6. Record a decision reason.
7. Use the suggested decision and evidence gaps as an advisory gate before PRD.
8. Copy the generated idea brief into downstream PRD or research workflows.
9. Attach the next smallest experiment and success metric.
10. Create an orchestration runbook so strategy, research, product, design, build, QA, debug, security, and launch work have explicit status.
11. Save each orchestration output and copy the generated PRD draft when the evidence is ready.
12. Save generated briefs and PRDs into the artifact library before moving to MVP scope.
13. Generate and save the MVP spec and launch checklist before build or release work starts.
14. Promote artifacts from draft to approved only after the relevant gates are complete.
