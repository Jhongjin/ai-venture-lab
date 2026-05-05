# Development Runbook

## Goal

## Preconditions

- Approved PRD:
- Approved MVP spec:
- Design brief or DESIGN.md:
- RLS/migration plan:
- Backend rules allowed/denied test plan:
- Vercel environment variables:
- Preview/Production deploy log or inspect link:
- Rollback target and trigger:

## Build Steps

1. Confirm data model and policies.
2. Implement the smallest vertical slice.
3. Add UI states and permission behavior.
4. Add focused verification.
5. Run quality gates.
6. Deploy preview.
7. Smoke test production.

## Commands

```powershell
pnpm lint
pnpm typecheck
pnpm build
pnpm harness:check
```

## Manual Smoke Path

1.
2.
3.

## Deployment

- Preview URL:
- Production URL:
- Vercel inspect URL or deploy log:
- Environment variables changed:
- Backend rules changed:
- Backend rules allowed case:
- Backend rules denied case:
- Rollback:
- DB correction or revert SQL:

## Incident Notes

- Owner:
- Escalation:
- User-facing impact:
- Rollback trigger:
- Last known good deployment:
- Log location:
