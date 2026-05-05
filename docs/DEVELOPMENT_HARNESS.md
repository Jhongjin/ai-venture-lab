# Development Harness

This harness turns an approved MVP scope into a production-shaped vertical slice.

## Development Contract

Before implementation, define:

- User-visible workflow and done criteria
- Next.js boundary: Server Components, Client Components, Server Actions, Route Handlers
- Supabase boundary: tables, RLS, `using`, `with check`, grants, indexes, migrations
- Vercel boundary: environment variables, preview, production, rollback
- UI states: empty, loading, success, error, permission denied, read-only, mobile
- Verification ladder and production smoke path

## Build Order

1. Confirm PRD, MVP spec, and design brief.
2. Shape a single vertical slice.
3. Add or update data model and RLS.
4. Implement read/write path with authorization at the boundary.
5. Add UI state coverage and error recovery.
6. Run focused verification, then full quality gates.
7. Deploy preview, smoke test, then deploy production.
8. Record decision, risk, and rollback notes.

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
- No sensitive workflow without consent, retention, deletion, and audit notes.
- No AI action without edit/retry/discard or human review path.

## Production Smoke Template

1. Open production URL in a clean browser session.
2. Sign in or verify the intended signed-out state.
3. Complete the changed workflow.
4. Confirm the database or UI reflects the new state without manual refresh unless refresh is expected.
5. Confirm the denied/read-only path does not mutate data.
6. Confirm rollback target or previous deployment is known.
