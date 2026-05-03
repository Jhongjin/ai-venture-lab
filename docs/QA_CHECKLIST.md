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
- Header metrics include idea, risk, experiment, decision, and data-source state.
