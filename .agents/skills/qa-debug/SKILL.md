---
name: qa-debug
description: Use when reproducing bugs, running tests, debugging failures, or verifying a fixed workflow.
---

# QA Debug

Loop:

1. Reproduce the issue.
2. Isolate the smallest failing path.
3. Patch the cause.
4. Re-run the reproduction and relevant tests.
5. Report remaining risk.

Prefer focused checks before full-suite checks.

Reproduction standard:

- Capture environment, account/session state, selected idea/workspace, URL, input data, expected result, and actual result.
- Reduce to the smallest user-visible workflow, not the smallest internal function unless the failure is already isolated.
- For auth/RLS bugs, verify both allowed and denied cases.
- For UI bugs, check desktop and mobile widths plus empty/loading/error states.
- For data bugs, verify database row ownership, organization boundary, and screen refresh behavior.

Verification ladder:

1. Focused command or local reproduction
2. Relevant lint/type/build check
3. Harness check
4. Browser or Playwright smoke path when the UI changed
5. Production smoke path after deployment when the fix reaches Vercel

Debug report must include:

- Reproduction
- Root cause
- Patch summary
- Commands and results
- Manual smoke path
- Residual risk or follow-up
