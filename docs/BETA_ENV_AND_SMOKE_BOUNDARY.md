# Beta Env And Smoke Boundary

Status: WQ-036 beta env/smoke boundary
Last updated: 2026-05-22
Scope: names, boundaries, and smoke rules only; no secret values

## Purpose

This note defines the beta environment and smoke-test boundary for the current deployed runtime at `D:\Codex\venture-lab`.

It is a docs-only boundary. It does not provision accounts, copy `.env.local`, mutate Vercel environment variables, run production SQL, mutate Supabase Auth or DB rows, trigger deployments, roll back deployments, call paid APIs, or grant Build Relay any broader permission.

Validation keywords: `beta_env_smoke_boundary_docs_only`, `names_only_no_values`, `no_env_local_readback`, `no_secret_output`.

## Runtime Source Boundary

- `D:\Codex\venture-lab` is the current deployed runtime source for `https://ai-venture-lab.vercel.app`.
- `D:\Codex\admate-venture-os` remains the canonical planning/product target until a deliberate cutover.
- `D:\Projects\AdMate` remains read-only reference material. No beta smoke, relay handoff, or setup step may mutate it.

Validation keywords: `current_runtime_source_venture_lab`, `canonical_planning_source_admate_venture_os`, `no_admate_projects_mutation`, `D:\Projects\AdMate`.

## Environment Variable Classes

| Class | Variables | Boundary |
| --- | --- | --- |
| Public client config | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser-safe config. The anon key relies on RLS and is not a service-role key. |
| Server-only secrets | `SUPABASE_SERVICE_ROLE_KEY`, `TELEMETRY_INGEST_SECRET`, `OPENAI_API_KEY` | Trusted server environments only. Never expose to browser bundles, screenshots, artifacts, chat, MCP packets, or Build Relay evidence. |
| Server-only config | `OPENAI_IDEA_MODEL`, `OPENAI_MODEL` | Optional model names only. Do not store provider credentials here. |
| Smoke-only local vars | `SMOKE_URL`, `ROUTE_SMOKE_URL`, `MARKET_SCAN_SMOKE_URL`, `MARKET_SCAN_SMOKE_TIMEOUT_MS`, `MARKET_SCAN_SMOKE_ALLOW_ESTIMATE`, `TELEMETRY_SMOKE_URL`, `TELEMETRY_SMOKE_IDEA_ID`, `BROWSER_SMOKE_URL`, `BROWSER_SMOKE_EMAIL`, `BROWSER_SMOKE_PASSWORD`, `BROWSER_SMOKE_ALLOW_WRITE`, `BROWSER_SMOKE_ALLOW_WORKSPACE_CREATE`, `BROWSER_SMOKE_HEADLESS`, `BROWSER_SMOKE_TIMEOUT_MS`, `BROWSER_SMOKE_SCREENSHOT`, `BROWSER_RLS_SMOKE_URL`, `BROWSER_RLS_SMOKE_EMAIL_A`, `BROWSER_RLS_SMOKE_PASSWORD_A`, `BROWSER_RLS_SMOKE_WORKSPACE_A_LABEL`, `BROWSER_RLS_SMOKE_EMAIL_B`, `BROWSER_RLS_SMOKE_PASSWORD_B`, `BROWSER_RLS_SMOKE_WORKSPACE_B_LABEL`, `BROWSER_RLS_SMOKE_HEADLESS`, `BROWSER_RLS_SMOKE_TIMEOUT_MS`, `BROWSER_RLS_SMOKE_EXPECT_BLOCKED`, `BROWSER_RLS_SMOKE_SCREENSHOT` | Operator terminal only. Do not commit values or copy them into docs, screenshots, artifacts, or relay packets. |

Validation keywords: `public_client_boundary`, `server_only_secret_boundary`, `smoke_only_local_vars`, `service_role_server_only`, `NEXT_PUBLIC_only_browser_safe`.

## Smoke Classes

| Smoke class | Command | Default permission | Required boundary |
| --- | --- | --- | --- |
| Production shell smoke | `pnpm smoke:prod` | Read-only HTTP check | No credentials. Records URL/result only. |
| Route smoke | `pnpm smoke:routes` | Read-only and negative-path checks | Confirms telemetry ingest rejects unauthenticated requests. |
| Market scan smoke | `pnpm smoke:market` | Read-only API check | Sends a synthetic non-PII idea and records only structured result counts/mode. Default timeout is 180 seconds because web-search model responses can run longer than ordinary route smoke. Local estimate fallback requires explicit `MARKET_SCAN_SMOKE_ALLOW_ESTIMATE=1`. |
| Anonymous browser smoke | `pnpm smoke:browser` | Read-only UI smoke | May see empty private workspace state because RLS hides authenticated data. |
| Authenticated visibility smoke | `pnpm smoke:browser:auth` | Login and workspace visibility only | Uses a disposable Supabase Auth user. No writes by default. |
| RLS allowed/denied smoke | `pnpm smoke:browser:rls` | Blocked-safe by default when fixtures are missing | Requires two disposable Supabase Auth users and two disposable workspace labels. No writes, no screenshots, no telemetry. |
| Authenticated write smoke | `BROWSER_SMOKE_ALLOW_WRITE=1; pnpm smoke:browser:auth` | Disabled by default | Requires explicit per-run approval and disposable account/workspace/idea data. |
| Workspace-create smoke | `BROWSER_SMOKE_ALLOW_WORKSPACE_CREATE=1; pnpm smoke:browser:auth` | Disabled by default | Disposable account only. Do not use a primary operator account. |
| Telemetry smoke | `pnpm smoke:telemetry` or `pnpm smoke:telemetry:funnel` | Disabled unless local secret and disposable idea ID exist | `TELEMETRY_INGEST_SECRET` stays in the operator terminal only; telemetry idea ID must belong to disposable beta data. |
| Build Relay smoke | Build Relay `npm test` in `D:\Codex\admate-build-relay` | Synthetic/file-backed local data only | Env Manifest must keep `valuesIncluded=false`; Relay Packet never stores values. |

Validation keywords: `authenticated_visibility_smoke`, `rls_allowed_denied_smoke`, `browser_smoke_allow_write_explicit`, `browser_smoke_allow_workspace_create_explicit`, `write_smoke_requires_explicit_approval`, `telemetry_smoke_local_secret_only`, `telemetry_smoke_disposable_idea_only`, `build_relay_env_manifest_valuesIncluded_false`.

Post-cleanup note, 2026-05-22: the operator-approved test account cleanup removed the prior disposable RLS fixture pair and retained only the primary operator account/workspace. Until a fresh disposable pair is created, `pnpm smoke:browser:rls` full execution is intentionally blocked; use read-only production, route, anonymous browser, authenticated visibility, and market scan smoke for the primary operator boundary. Do not run write smoke against the primary operator account.

Validation keywords: `post_cleanup_primary_operator_boundary`, `rls_fixture_reprovision_required`, `primary_operator_write_smoke_forbidden`.

If a telemetry secret is pasted into chat, a document, logs, screenshots, or any surface outside the local terminal/trusted server environment, treat the value as disclosed. Rotate `TELEMETRY_INGEST_SECRET` in Vercel Production and every external runtime that uses it, then rerun telemetry smoke with the rotated value before closing beta readiness evidence.

Validation keywords: `telemetry_secret_disclosure_requires_rotation`, `telemetry_smoke_rerun_after_rotation`.

## Disposable Beta Account Rule

Authenticated smoke must use a beta-only Supabase Auth account.

- Do not use a primary operator account for write smoke.
- Do not run write smoke against a real operator workspace.
- Disposable write smoke may create only disposable workspace/idea records.
- Test records should use a recognizable smoke prefix and have a cleanup owner.
- Smoke data should be removed or archived after the test window when it is no longer needed.

Recommended evidence shape:

```text
Smoke account: beta-only account, value not recorded
Target URL:
Smoke class: authenticated_visibility_smoke | authenticated_write_smoke | telemetry_smoke
Disposable workspace: yes | no | not_applicable
Disposable idea: yes | no | not_applicable
Result:
Cleanup owner:
Skipped checks:
```

Validation keywords: `disposable_beta_account_only`, `beta_only_auth_user`, `no_primary_operator_account`, `disposable_workspace_required`, `disposable_idea_prefix`, `smoke_data_ttl`, `smoke_data_cleanup_required`.

## Disposable Smoke Data Cleanup And Retention

Use `docs/SMOKE_DATA_CLEANUP_RUNBOOK.md` as the cleanup runbook after any smoke that creates or retains disposable data.

- A cleanup owner is required for authenticated write smoke, telemetry smoke, local screenshot artifacts, and intentionally retained RLS fixtures.
- Smoke data needs a TTL or retention decision before broader beta: `pending_cleanup`, `completed_cleanup`, `retained_for_rerun`, or `not_applicable`.
- Cleanup evidence must be summary-only. Event IDs printed by local telemetry smoke are local cleanup handles, not durable public evidence.
- Cleanup is user-owned when it requires SQL, Supabase dashboard mutation, service-role access, Auth user deletion, Vercel mutation, or external runtime mutation.
- Do not automate Auth/DB cleanup from the smoke runner.
- Do not clean up primary operator data, customer data, or records whose disposable status is uncertain.

Validation keywords: `disposable_smoke_cleanup_runbook`, `cleanup_owner_required`, `smoke_data_ttl_required`, `post_smoke_cleanup_status_required`, `user_owned_cleanup_required`, `cleanup_evidence_summary_only`, `no_cleanup_without_user_approval`, `no_auth_db_cleanup_automation`, `no_primary_operator_data_cleanup`.

## RLS And Private Read Posture

RLS is the authorization boundary for Supabase browser access.

- Anonymous smoke can confirm public shell behavior and private empty states.
- Authenticated visibility smoke confirms the signed-in session can reach the workspace surface.
- Current allowed and denied RLS evidence passed with disposable account/workspace fixtures and summary-only evidence before the 2026-05-22 cleanup. Rerun requires a newly provisioned disposable fixture pair.
- Cross-workspace or second-user denied checks must be rerun before treating changed private reads/writes as beta-ready after RLS policy, fixture, migration, or workspace access changes.
- Service-role access is server-only and must not be used to bypass beta smoke from a browser or external handoff.
- Use `docs/RLS_ALLOWED_DENIED_SMOKE_PLAN.md` before any cross-workspace, second-account, or denied-case smoke. The WQ-040 runner `pnpm smoke:browser:rls` must fail closed or report blocked when disposable fixtures are missing; no account provisioning, DB/Auth mutation, write smoke, screenshots, or secret output.
- Use `docs/SMOKE_DATA_CLEANUP_RUNBOOK.md` after any authenticated write, RLS fixture, telemetry, or screenshot smoke that creates or retains disposable data. Cleanup evidence must stay summary-only and cleanup mutation requires explicit user approval.

Validation keywords: `allowed_and_denied_rls_smoke`, `cross_workspace_denied_case`, `private_read_posture`, `service_role_server_only`, `rls_allowed_denied_smoke_plan`.

## Evidence Boundary

Smoke evidence may include:

- command name,
- target URL or Vercel inspect/deploy reference,
- pass/fail/blocked result,
- high-level failure summary,
- whether required credentials were present, without values,
- cleanup owner and skipped checks.

Smoke evidence must not include:

- `.env.local` contents,
- secret values,
- Supabase service-role key,
- telemetry ingest secret,
- browser smoke password,
- cookies, sessions, bearer tokens, signed URLs, or provider payloads,
- raw production logs,
- screenshots containing private workspace data unless intentionally captured and stored locally as sensitive evidence.

Validation keywords: `no_env_values_in_artifacts`, `no_credentials_in_screenshots`, `no_raw_logs`, `deployment_evidence_summary_only`.

## Stop Conditions

Stop and record a blocker instead of continuing when:

- a secret appears in output, chat, docs, screenshots, artifacts, or relay packets,
- a user asks to read back or copy `.env.local`,
- the account is not disposable and the smoke would write data,
- production write smoke lacks explicit per-run approval,
- telemetry smoke would use a non-disposable idea ID,
- RLS allowed/denied evidence is missing or stale for a private-data beta claim,
- the action requires production SQL, real Auth/DB mutation, deploy trigger, rollback, paid API call, credential/session handling, source-root writes, or `D:\Projects\AdMate` mutation.

Validation keywords: `production_write_smoke_requires_user_approval`, `no_production_mutation`, `no_deploy_trigger`, `no_rollback`, `no_real_auth_db_mutation`, `no_paid_api_call`, `no_credential_session_handling`, `no_source_root_writes`.
