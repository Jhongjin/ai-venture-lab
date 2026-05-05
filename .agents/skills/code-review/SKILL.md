---
name: code-review
description: Use when reviewing code changes for correctness, maintainability, architecture, tests, and regressions.
---

# Code Review

Review as a launch gate, not as style commentary. Lead with defects that could change behavior, leak data, block users, or make future changes unsafe.

Prioritize:

- Bugs and regressions
- Security and privacy issues
- Missing tests for risky behavior
- Architecture drift
- Unnecessary dependencies
- Auth, authorization, RLS, and workspace ownership gaps
- Server/client boundary mistakes and accidental secret exposure
- Cache, stale data, refresh, optimistic UI, and loading/error state bugs
- Form validation, accessibility, and mobile layout failures
- Migration safety, rollback path, and destructive data changes

For Next.js/Supabase work, check:

- Server Actions or Route Handlers verify the current user and record ownership.
- Client Components do not import server-only helpers or expose secret keys.
- Public env vars use `NEXT_PUBLIC_`; private secrets stay server-side and out of git.
- New public-schema tables have RLS enabled and policies for select/insert/update/delete.
- Insert/update policies include `with check` when ownership or organization boundaries matter.
- Queries avoid unnecessary waterfalls and stale UI after mutations.
- Generated UI has empty, loading, success, error, permission, read-only, and mobile behavior.

For Firebase work, check:

- Firestore/Storage Security Rules match the user, ownership, organization, and data validation model.
- Emulator or preview checks cover allowed and denied cases.
- Server SDK or Admin SDK code is server-only and uses IAM/secret boundaries.
- App Check is considered for public clients that directly call Firebase resources.
- Cloud Functions validate auth, input, authorization, idempotency, logging, and rollback.
- SQL Connect schema/queries/mutations have auth, generated type safety, and pricing/region notes.

For test coverage, ask for the smallest useful verification:

- Unit or pure function tests for deterministic logic.
- Integration or manual DB checks for auth/RLS boundaries.
- Playwright-style user-visible smoke tests for core workflows.
- Production smoke path after deploy when the user-facing flow changed.

Findings should cite files and lines when possible.
