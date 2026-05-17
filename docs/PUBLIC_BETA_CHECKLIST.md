# Public Beta Checklist

Use this checklist before opening AI Venture Lab to a broader beta audience.

## Automated Gates

Run these from the repository root.

Current manager-facing beta shell status:

- Anonymous production shell and workspace smoke pass.
- `/workspace` shows the manager decision panel (`오늘의 판단`) before the step rail on mobile.
- Top-level manager copy no longer exposes `AI 실행 패키지`, `개발 태스크`, `사업/개발`, raw Supabase connection errors, or English `Step` labels in the anonymous workspace path.
- Authenticated write smoke, RLS allowed/denied smoke, and post-rotation telemetry smoke have passed with disposable fixtures and summary-only evidence.

Before running smoke commands, check `docs/BETA_ENV_AND_SMOKE_BOUNDARY.md`. The WQ-036 boundary is `beta_env_smoke_boundary_docs_only`: names only, no values, no `.env.local` readback, no secret output.

The current controlled beta launch gate is approved as `launch_gate_decision: ship`. Before expanding the beta scope, re-check `docs/PUBLIC_BETA_LAUNCH_GATE.md` for the latest blocker/non-blocker split and summary-only evidence boundary.

Use `docs/PUBLIC_BETA_LAUNCH_EVIDENCE_PACKET.md` as the operator decision source of truth. It records the controlled beta approval, retained disposable fixtures, risk disposition, artifact approvals, QA/security signoff, and rollback evidence.

Validation keywords: `controlled_beta_ship_approved`, `launch_gate_decision_ship`, `operator_decision_source_of_truth`, `rollback_evidence_recorded`.

Use `docs/CONTROLLED_BETA_SESSION_PLAYBOOK.md` before sitting with a beta participant. It keeps the session synthetic, summary-only, and focused on whether the operator understands the next decision.

Validation keywords: `controlled_beta_session_playbook`, `summary_only_beta_feedback`, `synthetic_beta_data_only`.

GitHub Actions now runs the read-only `Quality Gate` workflow for `pnpm quality:full`. Before modifying CI again, check `docs/CI_WORKFLOW_SCOPE_BOUNDARY.md`; CI does not replace explicit approval for authenticated write smoke, telemetry smoke, deploys, rollback, production DB/Auth mutation, or release decisions.

Before claiming private-read beta readiness, check `docs/RLS_ALLOWED_DENIED_SMOKE_PLAN.md`, `docs/SUPABASE_RLS_POLICY_POSTURE_REVIEW.md`, and `docs/RLS_DISPOSABLE_FIXTURE_HANDOFF.md`. The current posture is `rls_allowed_denied_browser_smoke_passed`: production private-read posture was confirmed with disposable account/workspace fixtures and summary-only evidence. Rerun when fixtures, RLS policies, workspace access code, or production migrations change.

After any smoke that creates or retains disposable data, use `docs/SMOKE_DATA_CLEANUP_RUNBOOK.md` to decide whether to keep reusable RLS fixtures, archive or delete authenticated write smoke data, and keep telemetry cleanup evidence summary-only.

```powershell
pnpm quality:full
pnpm smoke:prod
pnpm smoke:routes
pnpm smoke:browser
```

`pnpm smoke:browser` opens the production app in Chromium and checks the critical unauthenticated UI path:

1. Homepage shell loads.
2. Workspace CTA and guide navigation are visible.
3. Homepage middle content renders.
4. `/workspace` loads the execution board.
5. Stage guidance, workflow rail, and login or extraction entry are visible.
6. The anonymous path shows the expected login-required or empty-workbench state without console/page errors.

Anonymous production sessions may see an empty workbench or login-required state because authenticated RLS policies hide private workspace data. In that case the browser smoke still passes if the public shell, manager decision panel, and empty/limited states are shown correctly. Authenticated write smoke has passed with explicit approval and disposable test data; rerun it only under the same approval and cleanup boundary.

By default the browser smoke targets `https://ai-venture-lab.vercel.app`.

Override target:

```powershell
$env:BROWSER_SMOKE_URL="https://your-preview-url.vercel.app"; pnpm smoke:browser
```

Run visibly while debugging:

```powershell
$env:BROWSER_SMOKE_HEADLESS="0"; pnpm smoke:browser
```

Capture a screenshot:

```powershell
$env:BROWSER_SMOKE_SCREENSHOT="artifacts/browser-smoke.png"; pnpm smoke:browser
```

The script creates the screenshot directory automatically. Local screenshot artifacts are ignored by git.

If Chromium is not installed on a fresh machine:

```powershell
pnpm exec playwright install chromium
```

## Authenticated Browser Smoke

Run this with a disposable Supabase Auth user before external beta or when auth/workspace behavior changes. The script logs in with password auth and verifies the workspace panel. It only writes data when the write flag is explicitly enabled.

Login/workspace visibility only:

```powershell
$env:BROWSER_SMOKE_EMAIL="beta-operator@example.com"
$env:BROWSER_SMOKE_PASSWORD="..."
pnpm smoke:browser:auth
```

RLS allowed/denied runner guard, no credentials required:

```powershell
pnpm smoke:browser:rls:preflight
```

A full RLS allowed/denied smoke requires an explicit `BROWSER_RLS_SMOKE_URL`, two disposable accounts, and two disposable workspace labels in local-only `BROWSER_RLS_SMOKE_*` variables. Do not run it against primary operator data.

Create one timestamped disposable idea:

```powershell
$env:BROWSER_SMOKE_EMAIL="beta-operator@example.com"
$env:BROWSER_SMOKE_PASSWORD="..."
$env:BROWSER_SMOKE_ALLOW_WRITE="1"
pnpm smoke:browser:auth
```

If the disposable account has no workspace and you want the smoke test to create one:

```powershell
$env:BROWSER_SMOKE_ALLOW_WORKSPACE_CREATE="1"
```

Do not commit these environment variables. Use a beta-only account so generated records can be deleted safely after a test pass.

Write smoke rules:

- Use `disposable_beta_account_only`; never a primary operator account.
- Use a disposable workspace and a disposable idea prefix.
- `BROWSER_SMOKE_ALLOW_WRITE=1` and `BROWSER_SMOKE_ALLOW_WORKSPACE_CREATE=1` both require explicit per-run approval.
- Production write smoke should be skipped unless the user explicitly approves that run and the target data is disposable.
- Telemetry smoke must use `TELEMETRY_INGEST_SECRET` from the local terminal only and a disposable idea ID.
- If `TELEMETRY_INGEST_SECRET` is exposed outside the local terminal or trusted server env, rotate it before using telemetry smoke evidence for beta readiness.
- Record command/result/target URL/cleanup owner only; do not record credentials, env values, cookies, sessions, signed URLs, screenshots with private data, or raw logs.
- Cleanup mutation is not automatic. Keep RLS fixture pairs only when they are intentionally reusable, and delete or archive disposable write-smoke records after the test window with an operator cleanup owner.

Validation keywords: `public_beta_cleanup_gate`, `disposable_smoke_records_reviewed`, `cleanup_owner_recorded_before_beta`.

## Manual Beta Pass

1. Sign in with a dashboard-created Supabase password account.
2. Create or select a workspace.
3. Confirm `오늘의 판단` gives the next decision before the detailed rail.
4. Use `아이디어 찾기` with the sample source and save a validation package.
5. Create a manual idea and confirm it appears without a page refresh.
6. Score the idea, add one risk, add one experiment, and record a decision.
7. Save validation artifacts: idea brief, research brief, sprint, evidence note, validation summary.
8. Save product artifacts: PRD handoff, PRD, MVP slice plan, MVP spec.
9. Save app production artifacts: backend decision, design brief, tech spec, and 제작 실행 계획.
10. Create 제작 할 일, save the 제작 시작 브리프, and copy/save the implementation run package only from full mode when needed.
11. Mark at least one task through todo -> doing -> done with completion evidence.
12. Save the 제작 완료 보고서 and launch checklist.
13. Approve PRD, MVP spec, design brief, and tech spec in the artifact library.

## Pass Criteria

- No browser smoke console errors or page errors.
- No text overlap in the main desktop viewport.
- Mobile shows decision context before the step rail.
- Manager-facing copy stays decision-oriented in the default guided path.
- Save actions refresh the visible state without manual reload.
- Read-only/editable labels match ownership.
- RLS or backend rule assumptions are written into completion evidence before public beta, including allowed and denied private-read cases before broader beta.
- Cross-workspace denied evidence follows `summary_only_rls_evidence` and does not include credentials, raw private payloads, screenshots with private data, or service-role access.
- Disposable smoke records are reviewed before broader beta, with cleanup status marked as `completed_cleanup`, `retained_for_rerun`, or `not_applicable`.
- Vercel deployment is Ready and production smoke passes after the final deploy.
- Smoke evidence follows `deployment_evidence_summary_only` and `no_env_values_in_artifacts`.
