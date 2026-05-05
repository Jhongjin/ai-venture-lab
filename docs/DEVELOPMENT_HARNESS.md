# Development Harness

This harness turns an approved MVP scope into a production-shaped vertical slice.

## Development Contract

Before implementation, define:

- User-visible workflow and done criteria
- Backend choice: Supabase, Firebase, Firebase SQL Connect, or hybrid
- Next.js boundary: Server Components, Client Components, Server Actions, Route Handlers
- Supabase boundary: tables, RLS, `using`, `with check`, grants, indexes, migrations
- Firebase boundary when selected: Auth, Firestore/SQL Connect, Security Rules/IAM, Cloud Functions, App Check, Storage, Hosting
- Vercel boundary: Preview/Production environment variables, public/server secret split, deploy logs or inspect URL, production alias, rollback
- Backend rules evidence: at least one allowed case and one denied case for Supabase RLS or Firebase Security Rules/IAM
- UI states: empty, loading, success, error, permission denied, read-only, mobile
- Verification ladder and production smoke path

## Build Order

1. Confirm PRD, MVP spec, and design brief.
2. Choose the backend using `docs/BACKEND_DECISION_GUIDE.md`.
3. Generate implementation tasks from the app development process panel.
4. Add manual tasks for work not covered by the generated baseline: bugs, design polish, deployment fixes, customer validation, and rollback tasks.
5. Copy the next recommended task ticket or open backlog when handing work to Codex, GitHub Issues, or a human implementer.
6. Shape a single vertical slice.
7. Add or update data model and authorization rules.
8. Record allowed and denied backend-rule checks before marking backend work done.
9. Implement read/write path with authorization at the boundary.
10. Add UI state coverage and error recovery.
11. Move each implementation task through todo, doing, blocked, and done with completion evidence.
12. Save a development completion report once implementation, QA, and security gates are reviewed.
13. Run focused verification, then full quality gates.
14. Deploy preview, save deploy logs or Vercel inspect URL, smoke test, then deploy production.
15. Record decision, risk, environment-variable changes, and rollback notes.

## Quality Gates

```powershell
pnpm lint
pnpm typecheck
pnpm build
pnpm harness:check
pnpm smoke:prod
```

Use `pnpm quality:full` before commits that touch product behavior; it runs lint, typecheck, harness check, and production build in one command.

Use `pnpm smoke:prod` after production deploy to confirm the public app shell returns HTTP 200 and includes the expected operator workflow text. Add browser or Playwright smoke checks when a user-facing workflow needs interaction-level verification.

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
- No release handoff without a Preview/Production deploy log or Vercel inspect URL.
- No environment-variable change without recording Preview/Production scope and whether redeploy happened.

## Production Smoke Template

1. Open production URL in a clean browser session.
2. Sign in or verify the intended signed-out state.
3. Complete the changed workflow.
4. Confirm the database or UI reflects the new state without manual refresh unless refresh is expected.
5. Confirm the denied/read-only path does not mutate data.
6. Confirm rollback target or previous deployment is known.
7. Save the Vercel inspect URL or deploy log location with the completion evidence.

CLI baseline:

```powershell
pnpm smoke:prod
```
