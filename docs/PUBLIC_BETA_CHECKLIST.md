# Public Beta Checklist

Use this checklist before opening AI Venture Lab to a broader beta audience.

## Automated Gates

Run these from the repository root.

Before running smoke commands, check `docs/BETA_ENV_AND_SMOKE_BOUNDARY.md`. The WQ-036 boundary is `beta_env_smoke_boundary_docs_only`: names only, no values, no `.env.local` readback, no secret output.

```powershell
pnpm quality:full
pnpm smoke:prod
pnpm smoke:routes
pnpm smoke:browser
```

`pnpm smoke:browser` opens the production app in Chromium and checks the critical unauthenticated UI path:

1. App shell loads.
2. Data source and navigation are visible.
3. Idea extraction opens.
4. Sample source can be inserted.
5. Rule-based extraction produces candidate comparison and validation package UI.
6. New idea intake opens.
7. App development navigation opens either the selected idea development panel or the expected empty-workbench state.

Anonymous production sessions may see an empty workbench because authenticated RLS policies hide private workspace data. In that case the browser smoke still passes if the empty state is shown correctly. Authenticated write flows remain part of the manual beta pass until a safe test account is available.

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

Run this with a disposable Supabase Auth user before external beta. The script logs in with password auth and verifies the workspace panel. It only writes data when the write flag is explicitly enabled.

Login/workspace visibility only:

```powershell
$env:BROWSER_SMOKE_EMAIL="beta-operator@example.com"
$env:BROWSER_SMOKE_PASSWORD="..."
pnpm smoke:browser:auth
```

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
- Record command/result/target URL/cleanup owner only; do not record credentials, env values, cookies, sessions, signed URLs, screenshots with private data, or raw logs.

## Manual Beta Pass

1. Sign in with a dashboard-created Supabase password account.
2. Create or select a workspace.
3. Use `아이디어 발굴` with the sample source and save a validation package.
4. Create a manual idea and confirm it appears without a page refresh.
5. Score the idea, add one risk, add one experiment, and record a decision.
6. Save validation artifacts: idea brief, research brief, sprint, evidence note, validation summary.
7. Save product artifacts: PRD handoff, PRD, MVP slice plan, MVP spec.
8. Save app development artifacts: backend decision, design brief, tech spec, dev runbook, implementation handoff.
9. Create implementation tasks, save the development kickoff brief, and copy/save the implementation run package.
10. Mark at least one task through todo -> doing -> done with completion evidence.
11. Save the development completion report and launch checklist.
12. Approve PRD, MVP spec, design brief, and tech spec in the artifact library.

## Pass Criteria

- No browser smoke console errors or page errors.
- No text overlap in the main desktop viewport.
- Save actions refresh the visible state without manual reload.
- Read-only/editable labels match ownership.
- RLS or backend rule assumptions are written into completion evidence before public beta, including allowed and denied private-read cases before broader beta.
- Vercel deployment is Ready and production smoke passes after the final deploy.
- Smoke evidence follows `deployment_evidence_summary_only` and `no_env_values_in_artifacts`.
