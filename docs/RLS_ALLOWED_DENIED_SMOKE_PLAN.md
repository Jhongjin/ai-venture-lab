# RLS Allowed/Denied Smoke Plan

Status: WQ-041 RLS policy posture review-ready
Last updated: 2026-05-16
Scope: plan and evidence boundary only; no account provisioning or DB/Auth mutation

## Purpose

This plan defines how to verify private Supabase browser access before broader beta work and names the blocked-safe runner scaffold.

WQ-038 confirmed `authenticated_visibility_smoke_passed`: one disposable Supabase Auth user can log in and reach the workspace surface. WQ-039 does not run a second-user or cross-workspace check. It defines the conditions required before that check is safe.

WQ-041 adds `docs/SUPABASE_RLS_POLICY_POSTURE_REVIEW.md`. The static review found that early migrations included public-read policies for the original venture tables, while later migrations drop those policies and replace them with authenticated owner/workspace reads. Real denied-case claims still require production migration confirmation and disposable two-account smoke evidence.

WQ-042 adds `docs/RLS_DISPOSABLE_FIXTURE_HANDOFF.md` as the exact user action packet for the two disposable accounts and two private workspace labels required before real execution.

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

## Static Policy Inventory

WQ-041 static review is recorded in `docs/SUPABASE_RLS_POLICY_POSTURE_REVIEW.md`.

| Surface | Early policy | Tightening migration | Expected current scope | Execution evidence |
| --- | --- | --- | --- | --- |
| `ideas`, `risks`, `decisions`, `experiments` | `initial_public_read_policy` | `20260503030000_private_workspace_reads.sql` | authenticated owner, organization member, or legacy/global seed row | `denied_cases_not_claimed_until_executed` |
| `organizations`, `organization_members` | none in initial harness | `20260503020000_add_organization_access_model.sql`, repaired by `20260512010000_repair_workspace_creation_policy.sql` | creator/member/admin scope | `denied_cases_not_claimed_until_executed` |
| `orchestration_runs`, `venture_artifacts`, `implementation_tasks` | added after workspace model | respective table migrations | authenticated owner, organization member, or legacy/global seed row | `denied_cases_not_claimed_until_executed` |
| `telemetry_events` | added after workspace model | `20260506010000_add_learning_telemetry.sql` | actor or organization member | separate telemetry gate |

`created_by is null and organization_id is null` is a `legacy_seed_visibility_carveout`, not proof of private workspace access. Production private-read claims require `public_read_removed_by_private_workspace_reads`, production migration confirmation, and a real disposable denied-case pass.

Validation keywords: `static_rls_policy_inventory`, `public_read_removed_by_private_workspace_reads`, `legacy_seed_visibility_carveout`, `denied_cases_not_claimed_until_executed`.

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

## Runner Scaffold

WQ-040 adds a blocked-safe runner:

```powershell
pnpm smoke:browser:rls:preflight
```

This command validates the missing-fixture guard without secret values. A real run requires an explicit target URL and all of these local-only values:

```text
BROWSER_RLS_SMOKE_URL
BROWSER_RLS_SMOKE_EMAIL_A
BROWSER_RLS_SMOKE_PASSWORD_A
BROWSER_RLS_SMOKE_WORKSPACE_A_LABEL
BROWSER_RLS_SMOKE_EMAIL_B
BROWSER_RLS_SMOKE_PASSWORD_B
BROWSER_RLS_SMOKE_WORKSPACE_B_LABEL
```

The runner uses fresh browser contexts for anonymous, account A, and account B checks. It refuses write/create/screenshot flags and reports summary-only evidence.

Validation keywords: `rls_smoke_runner_scaffold`, `blocked_safe_runner`, `fresh_browser_contexts`, `write_flags_disabled`, `explicit_rls_smoke_url_required`.

## Next Implementation Gate

Before running the automated denied-case smoke for real, the operator must confirm the disposable account/workspace pair and keep credentials in the local terminal only.

Static SQL posture is now documented, but production migration state is not verified. Confirm that all required migrations through `20260512010000_repair_workspace_creation_policy.sql` are applied and that old public-read policies are absent before treating a passed smoke as private-read beta evidence.

Use `docs/RLS_DISPOSABLE_FIXTURE_HANDOFF.md` to prepare `two_disposable_auth_users_required`, `two_private_workspace_labels_required`, `local_env_names_only`, and `disposable_pair_confirmed_before_real_run`.

Recommended next state after this plan:

```text
rls_fixture_handoff_ready
```
