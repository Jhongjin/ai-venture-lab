---
name: prototype-builder
description: Use when implementing a scoped MVP, UI prototype, integration stub, or product workflow in this repository.
---

# Prototype Builder

Before implementation:

- Confirm the MVP spec or write the smallest one needed.
- Identify the core journey and done criteria.
- Keep data mocked unless real integration is explicitly requested.
- Confirm the first screen users need for the core journey, not a marketing landing page.
- Identify required states: empty, loading, success, error, permission denied, read-only, and mobile.
- Use the repo `DESIGN.md` or the active design brief as the visual contract.
- Keep AI features behind a clear human review, retry, or override path unless the PRD explicitly says otherwise.

After implementation:

- Run relevant checks.
- Report changed files and verification results.
- Include a manual smoke path the operator can test in production.
