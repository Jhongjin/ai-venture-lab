# RLS Disposable Fixture Handoff

Status: disposable fixture handoff and rerun packet
Last updated: 2026-05-17
Scope: user action packet only; no account provisioning, no workspace creation by automation, no `.env.local` readback, no secret output

## Purpose

This handoff tells the operator exactly what disposable Supabase fixtures must exist before the RLS allowed/denied smoke can run or be safely rerun.

The first disposable production run passed on 2026-05-17. Keep this packet for future reruns when fixtures, RLS policies, production migrations, or workspace access code change.

Validation keywords: `rls_disposable_fixture_handoff`, `fixture_handoff_only`, `rls_allowed_denied_browser_smoke_passed`, `no_secret_output`.

## Required Operator Setup

Create or confirm these fixtures manually in the beta Supabase/project environment:

| Fixture | Required property | Do not use |
| --- | --- | --- |
| Disposable User A | Password login works and User A belongs to Workspace A only | Primary operator account, personal email, customer account |
| Disposable User B | Password login works and User B belongs to Workspace B only | Primary operator account, shared admin account, customer account |
| Workspace A | Private workspace with a unique disposable label visible only to User A | Real client/company workspace |
| Workspace B | Private workspace with a unique disposable label visible only to User B | Real client/company workspace |

Recommended label shape:

```text
rls-smoke-a-YYYYMMDD
rls-smoke-b-YYYYMMDD
```

The two labels must be clearly synthetic and safe to mention in summary evidence. Do not use real names, client names, contact details, production identifiers, paid project names, or private record content.

Validation keywords: `two_disposable_auth_users_required`, `two_private_workspace_labels_required`, `synthetic_workspace_labels_only`, `no_primary_operator_account`.

## Local Env Names

Keep values only in the local terminal or local `.env.local`. Do not paste values into docs, chat, screenshots, Build Relay packets, or artifacts.

```text
BROWSER_RLS_SMOKE_URL
BROWSER_RLS_SMOKE_EMAIL_A
BROWSER_RLS_SMOKE_PASSWORD_A
BROWSER_RLS_SMOKE_WORKSPACE_A_LABEL
BROWSER_RLS_SMOKE_EMAIL_B
BROWSER_RLS_SMOKE_PASSWORD_B
BROWSER_RLS_SMOKE_WORKSPACE_B_LABEL
BROWSER_RLS_SMOKE_HEADLESS
BROWSER_RLS_SMOKE_TIMEOUT_MS
```

Accepted aliases for automation compatibility:

```text
RLS_SMOKE_URL
RLS_SMOKE_USER_A_EMAIL
RLS_SMOKE_USER_A_PASSWORD
RLS_SMOKE_WORKSPACE_A_LABEL
RLS_SMOKE_USER_B_EMAIL
RLS_SMOKE_USER_B_PASSWORD
RLS_SMOKE_WORKSPACE_B_LABEL
RLS_SMOKE_HEADLESS
RLS_SMOKE_TIMEOUT_MS
```

Do not set screenshot, write, create, service-role, telemetry, deploy, or production mutation flags for this smoke.

Validation keywords: `local_env_names_only`, `no_env_values_in_artifacts`, `no_credentials_in_evidence`, `write_flags_disabled`, `screenshot_disabled`, `service_role_server_only`.

## Preflight Command

Run the guard without credentials when you only want to verify the blocked-safe path:

```powershell
pnpm smoke:browser:rls:preflight
```

Before any preflight or smoke run, clear forbidden flags in the current terminal:

```powershell
Remove-Item Env:BROWSER_SMOKE_ALLOW_WRITE,Env:BROWSER_SMOKE_ALLOW_WORKSPACE_CREATE,Env:BROWSER_SMOKE_SCREENSHOT,Env:BROWSER_RLS_SMOKE_SCREENSHOT,Env:RLS_SMOKE_SCREENSHOT,Env:SUPABASE_SERVICE_ROLE_KEY -ErrorAction SilentlyContinue
```

The run is allowed only after the operator confirms the fixture pair and production migration posture. The command is:

```powershell
pnpm smoke:browser:rls
```

Before a run, confirm:

- production migrations through `20260512010000_repair_workspace_creation_policy.sql` are applied,
- the old public read policies from the initial harness are absent,
- User A cannot intentionally belong to Workspace B,
- User B cannot intentionally belong to Workspace A,
- fixture labels are disposable and safe to report,
- no forbidden flags are set.

Validation keywords: `production_migration_confirmation_required`, `public_read_policies_absent_required`, `disposable_pair_confirmed_before_rerun`.

## Evidence Template

Record only summary evidence:

```text
Smoke class: rls_allowed_denied_smoke
Target URL: <domain only>
Accounts: disposable_pair_confirmed | missing | blocked
Workspace pair: disposable_pair_confirmed | missing | blocked
Allowed check A: pass | fail | blocked | not_run
Allowed check B: pass | fail | blocked | not_run
Anonymous denied check: pass | fail | blocked | not_run
Cross-workspace denied check A->B: pass | fail | blocked | not_run
Cross-workspace denied check B->A: pass | fail | blocked | not_run
Direct private-record probe: not_run
Writes performed: no
Secrets printed: no
Screenshots stored: no
Telemetry smoke: not_run
Production mutation: no
Cleanup required: none | user-owned cleanup | not_applicable
Skipped checks:
Failure summary:
```

Never record emails, passwords, cookies, sessions, bearer tokens, service-role keys, raw logs, private record contents, signed URLs, raw production responses, or screenshots containing private data.

Validation keywords: `summary_only_rls_evidence`, `no_raw_private_payloads`, `no_screenshot_artifacts`, `no_raw_production_response`.

Protective wording: this is a browser anon-key RLS read smoke using disposable fixtures only. It must not create, update, delete, deploy, run SQL, use service-role access, print secrets, store screenshots, or refresh beta private-read readiness if denied checks have not passed in the current fixture/policy posture.

## Stop Conditions

Stop before browser execution when:

- either disposable account is missing,
- either disposable workspace label is missing,
- the setup would require the agent to create Auth users or workspaces,
- a label or record reference is not clearly disposable,
- `BROWSER_SMOKE_ALLOW_WRITE`, `BROWSER_SMOKE_ALLOW_WORKSPACE_CREATE`, `BROWSER_SMOKE_SCREENSHOT`, `BROWSER_RLS_SMOKE_SCREENSHOT`, `RLS_SMOKE_SCREENSHOT`, or `SUPABASE_SERVICE_ROLE_KEY` is set,
- production migration state is unknown,
- old public-read policy absence is unknown,
- a denied check returns private data,
- the task would require SQL, Auth/DB mutation, deploy, rollback, Vercel env mutation, GitHub workflow mutation, paid API calls, credential/session handling, source-root writes, or `D:\Projects\AdMate` mutation.

Validation keywords: `missing_fixtures_block_smoke_run`, `forbidden_flags_block_smoke_run`, `unknown_migration_state_blocks_smoke_run`, `denied_check_private_data_blocks_beta`.

## Current State

After the 2026-05-17 production browser run, the current state is:

```text
rls_allowed_denied_browser_smoke_passed
```
