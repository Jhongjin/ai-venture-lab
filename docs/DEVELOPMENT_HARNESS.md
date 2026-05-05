# Development Harness

This harness turns an approved MVP scope into a production-shaped vertical slice.

## Development Contract

Before implementation, define:

- User-visible workflow and done criteria
- Backend choice: Supabase, Firebase, Firebase SQL Connect, or hybrid
- Next.js boundary: Server Components, Client Components, Server Actions, Route Handlers
- Supabase boundary: tables, RLS, `using`, `with check`, grants, indexes, migrations
- Firebase boundary when selected: Auth, Firestore/SQL Connect, Security Rules/IAM, Cloud Functions, App Check, Storage, Hosting
- Vercel boundary: environment variables, preview, production, rollback
- UI states: empty, loading, success, error, permission denied, read-only, mobile
- Verification ladder and production smoke path

## Build Order

1. Confirm PRD, MVP spec, and design brief.
2. Choose the backend using `docs/BACKEND_DECISION_GUIDE.md`.
3. Generate implementation tasks from the app development process panel.
4. Add manual tasks for work not covered by the generated baseline: bugs, design polish, deployment fixes, customer validation, and rollback tasks.
5. Shape a single vertical slice.
6. Add or update data model and authorization rules.
7. Implement read/write path with authorization at the boundary.
8. Add UI state coverage and error recovery.
9. Move each implementation task through todo, doing, blocked, and done with completion evidence.
10. Save a development completion report once implementation, QA, and security gates are reviewed.
11. Run focused verification, then full quality gates.
12. Deploy preview, smoke test, then deploy production.
13. Record decision, risk, and rollback notes.

## Quality Gates

```powershell
pnpm lint
pnpm typecheck
pnpm build
pnpm harness:check
```

Add browser or Playwright smoke checks when the user-facing workflow changes.

## Security Gates

- No secret in source control.
- No private env var in client code.
- No new exposed table without RLS.
- No ownership-changing insert/update without `with check`.
- No Firestore collection write without Security Rules and allowed/denied tests.
- No Firebase server SDK path without IAM and server-side trust review.
- No sensitive workflow without consent, retention, deletion, and audit notes.
- No AI action without edit/retry/discard or human review path.
- No done implementation task without evidence.
- No production launch while any implementation task is blocked.

## Production Smoke Template

1. Open production URL in a clean browser session.
2. Sign in or verify the intended signed-out state.
3. Complete the changed workflow.
4. Confirm the database or UI reflects the new state without manual refresh unless refresh is expected.
5. Confirm the denied/read-only path does not mutate data.
6. Confirm rollback target or previous deployment is known.
