---
name: prototype-builder
description: Use when implementing a scoped MVP, UI prototype, integration stub, or product workflow in this repository.
---

# Prototype Builder

Use this skill when the idea is ready to become a working product slice. A prototype is not a throwaway demo; it is the smallest production-shaped path that can answer the current product question.

Before implementation:

- Check the app development `개발 착수 준비도` gate when available. Do not start coding while approved PRD, approved MVP spec, backend decision, approved design brief, technical spec, development runbook, generated tasks, or unresolved high-risk status are unclear.
- Confirm the MVP spec or write the smallest one needed.
- Identify the core journey and done criteria.
- Keep data mocked unless real integration is explicitly requested.
- Confirm the first screen users need for the core journey, not a marketing landing page.
- Identify required states: empty, loading, success, error, permission denied, read-only, and mobile.
- Use the repo `DESIGN.md` or the active design brief as the visual contract.
- Keep AI features behind a clear human review, retry, or override path unless the PRD explicitly says otherwise.
- Choose the data boundary first: Server Component, Client Component, Server Action, Route Handler, or Supabase client.
- Choose the backend deliberately: Supabase, Firebase, Firebase SQL Connect, or hybrid. Use `docs/BACKEND_DECISION_GUIDE.md`.
- If the backend is not yet fixed, compare Supabase, Firebase, Firebase SQL Connect, and hybrid against the current app shape before writing implementation code.
- Keep authentication and authorization checks at the mutation/read boundary, not only in page layout or navigation.
- For Supabase writes, confirm RLS, `using`, and `with check` policies before relying on client-side checks.
- For Firebase writes, confirm Security Rules, IAM/server SDK trust boundaries, App Check needs, and emulator or preview checks.
- Confirm Vercel Preview/Production environment variables, public/client versus server-only secret boundaries, deploy-log location, and rollback target before marking build work ready.
- Avoid new dependencies unless they remove meaningful complexity and fit the existing stack.

Implementation shape:

- Build a vertical slice: UI state, data write/read, error path, permission path, and smoke test path.
- Keep the slice traceable to implementation tasks. If the task board exists, update task status and completion evidence instead of leaving progress only in chat.
- Prefer server-side data access for sensitive reads and writes.
- Keep `use client` boundaries small and local to interactivity.
- Make the happy path and at least one failure path visible to the operator.
- Add migrations and rollback notes whenever the data model changes.
- Record allowed and denied backend-rule evidence before moving backend tasks to done.

After implementation:

- Run relevant checks.
- Save or update completion evidence: commit/PR, preview URL, Vercel inspect URL or deploy log, smoke result, skipped check, unresolved risk, backend-rule evidence, or rollback note.
- Report changed files and verification results.
- Include a manual smoke path the operator can test in production.
- Report any skipped checks and why.
- Update durable docs when a product, data, security, or operating decision changed.
