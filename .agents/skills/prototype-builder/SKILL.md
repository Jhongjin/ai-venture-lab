---
name: prototype-builder
description: Use when implementing a scoped MVP, UI prototype, integration stub, or product workflow in this repository.
---

# Prototype Builder

Use this skill when the idea is ready to become a working product slice. A prototype is not a throwaway demo; it is the smallest production-shaped path that can answer the current product question.

Before implementation:

- Confirm the MVP spec or write the smallest one needed.
- Identify the core journey and done criteria.
- Keep data mocked unless real integration is explicitly requested.
- Confirm the first screen users need for the core journey, not a marketing landing page.
- Identify required states: empty, loading, success, error, permission denied, read-only, and mobile.
- Use the repo `DESIGN.md` or the active design brief as the visual contract.
- Keep AI features behind a clear human review, retry, or override path unless the PRD explicitly says otherwise.
- Choose the data boundary first: Server Component, Client Component, Server Action, Route Handler, or Supabase client.
- Keep authentication and authorization checks at the mutation/read boundary, not only in page layout or navigation.
- For Supabase writes, confirm RLS, `using`, and `with check` policies before relying on client-side checks.
- Avoid new dependencies unless they remove meaningful complexity and fit the existing stack.

Implementation shape:

- Build a vertical slice: UI state, data write/read, error path, permission path, and smoke test path.
- Prefer server-side data access for sensitive reads and writes.
- Keep `use client` boundaries small and local to interactivity.
- Make the happy path and at least one failure path visible to the operator.
- Add migrations and rollback notes whenever the data model changes.

After implementation:

- Run relevant checks.
- Report changed files and verification results.
- Include a manual smoke path the operator can test in production.
- Report any skipped checks and why.
- Update durable docs when a product, data, security, or operating decision changed.
