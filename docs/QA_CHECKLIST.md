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
