# RLS Allowed/Denied Smoke Plan

Status: WQ-039 RLS allowed/denied smoke plan
Last updated: 2026-05-16
Scope: plan and evidence boundary only; no account provisioning or DB/Auth mutation

## Purpose

This plan defines how to verify private Supabase browser access before broader beta work.

WQ-038 confirmed `authenticated_visibility_smoke_passed`: one disposable Supabase Auth user can log in and reach the workspace surface. WQ-039 does not run a second-user or cross-workspace check. It defines the conditions required before that check is safe.

Validation keywords: `rls_allowed_denied_smoke_plan`, `authenticated_visibility_smoke_passed`, `no_env_local_readback`, `no_secret_output`.

## Runtime Boundary

- Current deployed runtime source: `D:\Codex\venture-lab`.
- Canonical planning/product target: `D:\Codex\admate-venture-os`.
- Existing `D:\Projects\AdMate` materials are read-only reference only and must not be mutated.

This plan does not create Supabase Auth users, create workspaces, insert ideas, run SQL, change RLS policies, trigger deploys, run telemetry smoke, or grant Build Relay broader permissions.

Validation keywords: `current_runtime_source_venture_lab`, `canonical_planning_source_admate_venture_os`, `no_admate_projects_mutation`, `D:\Projects\AdMate`.

## Required Test Shape

Use two disposable beta identities and two disposable private workspaces.

| Actor | Owns or belongs to | Allowed expectation | Denied expectation |
| --- | --- | --- | --- |
| Anonymous browser | None | Can load public shell and public routes | Cannot see private workspace, idea, evidence, or membership data |
| Disposable User A | Workspace A | Can see Workspace A private surface | Cannot see Workspace B private surface or records |
| Disposable User B | Workspace B | Can see Workspace B private surface | Cannot see Workspace A private surface or records |

Required fixture labels:

- `second_disposable_account_required`
- `disposable_workspace_pair_required`
- `allowed_workspace_visibility`
- `cross_workspace_denied_case`
- `anonymous_private_read_denied`

## Allowed Checks

These checks are allowed after the user confirms disposable accounts/workspaces exist.

- Log in as Disposable User A and confirm Workspace A is visible.
- Log in as Disposable User B and confirm Workspace B is visible.
- Confirm anonymous browser state cannot show private workspace or idea data.
- Attempt to navigate to or request a known private path or record reference from the wrong disposable user only if the identifier is disposable and recorded as a safe test reference.
- Record result as summary-only evidence.

Allowed checks must use browser anon-key behavior. Do not use `SUPABASE_SERVICE_ROLE_KEY` to bypass RLS.

Validation keywords: `allowed_workspace_visibility`, `browser_anon_key_rls_check`, `service_role_server_only`.

## Forbidden Actions

Do not perform these actions inside WQ-039:

- Do not read, print, copy, or summarize `.env.local`.
- Do not print smoke account email/password values.
- Do not use primary operator accounts.
- Do not create Supabase Auth users.
- Do not create, modify, or delete workspaces or ideas.
- Do not run write smoke or set `BROWSER_SMOKE_ALLOW_WRITE=1`.
- Do not set `BROWSER_SMOKE_ALLOW_WORKSPACE_CREATE=1`.
- Do not store screenshots containing private workspace data.
- Do not run telemetry smoke.
- Do not run SQL or change RLS policies.
- Do not mutate Vercel env, deployments, GitHub workflows, or `D:\Projects\AdMate`.

Validation keywords: `no_real_auth_db_mutation`, `no_write_smoke`, `workspace_create_disabled`, `screenshot_disabled`, `no_telemetry_smoke`, `no_production_mutation`.

## Evidence Fields

Record only summary evidence.

```text
Smoke class: rls_allowed_denied_smoke
Target URL:
Accounts: disposable_pair_confirmed | missing | blocked
Workspace pair: disposable_pair_confirmed | missing | blocked
Allowed check A: pass | fail | blocked | not_run
Allowed check B: pass | fail | blocked | not_run
Anonymous denied check: pass | fail | blocked | not_run
Cross-workspace denied check A->B: pass | fail | blocked | not_run
Cross-workspace denied check B->A: pass | fail | blocked | not_run
Writes performed: no
Secrets printed: no
Screenshots stored: no
Cleanup required: none | user-owned cleanup | not_applicable
Skipped checks:
Failure summary:
```

Do not record emails, passwords, cookies, sessions, bearer tokens, service-role keys, raw logs, private record contents, signed URLs, or raw production responses.

Validation keywords: `summary_only_rls_evidence`, `no_credentials_in_evidence`, `no_raw_private_payloads`.

## Stop Conditions

Stop and record a blocker when:

- a second disposable account is missing,
- a disposable workspace pair is missing,
- a test would require creating or modifying production Auth/DB records,
- a private identifier is not clearly disposable,
- any secret appears in output, screenshot, docs, chat, or artifacts,
- the check requires service-role access from the browser path,
- the check would become write smoke without explicit per-run approval,
- a denied check returns private data,
- the action requires deploy, rollback, production SQL, Vercel env mutation, GitHub workflow mutation, paid API calls, credential/session handling, source-root writes, or `D:\Projects\AdMate` mutation.

Validation keywords: `second_account_missing_blocks_denied_smoke`, `disposable_workspace_pair_missing_blocks_denied_smoke`, `denied_check_private_data_blocks_beta`, `production_write_smoke_requires_user_approval`.

## Next Implementation Gate

Before running an automated RLS denied-case smoke, add or approve a dedicated runner that accepts disposable account/workspace references without printing values. The current `pnpm smoke:browser:auth` runner is sufficient for one-account authenticated visibility, not for full cross-workspace denied evidence.

Recommended next state after this plan:

```text
rls_allowed_denied_smoke_plan_ready
```
