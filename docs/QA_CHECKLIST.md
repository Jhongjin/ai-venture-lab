# QA Checklist

Use this checklist before merging meaningful changes.

- Core journey works from a clean browser session.
- Empty, loading, error, and success states are present where relevant.
- Mobile and desktop layouts do not overlap.
- `pnpm lint` passes.
- `pnpm typecheck` passes.
- `pnpm build` passes.
- Security and privacy risks are updated.
- Decision log is updated for major changes.
- Authenticated operators can create an idea and then update its stage, score, risks, and decision records.
- Workbench clearly marks which ideas are editable by the current operator and which are read-only.
- Authenticated operators can attach an experiment name and success metric to an idea.
- Experiment owners can move experiments through planned, running, and done states.
- Risk owners can move risks through open, mitigating, and closed states.
- Authenticated operators can create an idea-level orchestration runbook and move runs through planned, running, blocked, done, and skipped states.
- Run owners can save orchestration outputs and see those outputs reflected in the generated PRD draft.
- Authenticated operators can save generated idea briefs and PRDs as artifacts and copy them from the artifact library.
- Authenticated operators can generate and save MVP spec and launch checklist artifacts from the same workbench evidence.
- Artifact owners or workspace admins can move artifacts between draft, approved, and archived.
- Launch readiness shows blocked gates for evidence, artifacts, experiments, QA, security, risks, and decisions.
- Re-saving an artifact creates the next version and launch readiness requires approved PRD and MVP spec artifacts.
- Artifact status changes can include a gate note explaining approval evidence, revision needs, or archive reason.
- Revised artifacts show a previous-version line change summary when a comparable version exists.
- Artifact library filters narrow saved artifacts by type and lifecycle status without changing readiness inputs.
- Operator access clearly distinguishes magic link login from existing password-account login and shows session status.
- Magic link email redirect lands on `/auth/callback`, exchanges the code, and returns to the app as signed in.
- Failed magic link callback attempts show a clear operator-facing reason and clean auth query params from the URL.
- Orchestration runs can be seeded with phase-specific output templates before saving role notes.
- Launch readiness shows both percent complete and the next blocking gate.
- Header metrics include idea, risk, experiment, decision, and data-source state.
