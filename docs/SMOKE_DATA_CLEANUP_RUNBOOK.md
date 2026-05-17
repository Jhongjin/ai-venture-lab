# Smoke Data Cleanup Runbook

Status: cleanup boundary ready
Last updated: 2026-05-17
Scope: cleanup decision rules only; no SQL execution, no Auth/DB mutation, no `.env.local` readback, no secret values

## Purpose

This runbook defines what to keep, archive, or delete after beta smoke tests that use disposable accounts, disposable workspaces, disposable ideas, and telemetry smoke events.

The agent may update documentation and deterministic checks. The agent must not delete Supabase Auth users, workspaces, ideas, telemetry events, artifacts, screenshots, or external runtime data unless the user explicitly approves that exact cleanup run and provides a disposable target boundary.

Validation keywords: `smoke_data_cleanup_runbook`, `cleanup_boundary_ready`, `no_secret_output`, `no_env_local_readback`.

## Data Classes

| Data class | Default cleanup status | Owner | Notes |
| --- | --- | --- | --- |
| Authenticated write smoke workspace | `pending_cleanup` until archived/deleted or explicitly `retained_for_rerun` | Operator | Keep only if it is intentionally reused as a disposable beta fixture. |
| Authenticated write smoke idea/package | `pending_cleanup` until archived/deleted or explicitly `retained_for_rerun` | Operator | The record should have a recognizable smoke prefix and no real customer data. |
| RLS disposable workspaces | `retained_for_rerun` while the fixture pair is useful | Operator | Delete only after deciding that future RLS reruns will use a new fixture pair. |
| RLS disposable Auth users | `retained_for_rerun` while the matching workspace pair exists | Operator | Do not reuse primary operator, customer, or personal accounts. |
| Telemetry smoke events | `pending_cleanup` until retained or cleaned with explicit DB cleanup approval | Operator | Event payloads must remain disposable and secret-free. |
| Smoke screenshots | `completed_cleanup` after local sensitive screenshots are deleted | Operator | Do not store screenshots containing private workspace data in git. |
| Docs and phase evidence | `not_applicable` for cleanup mutation | Agent | Never include credentials, raw payloads, cookies, sessions, signed URLs, or secret values. |

Validation keywords: `disposable_fixture_retention`, `summary_only_cleanup_evidence`, `telemetry_event_cleanup_requires_user_approval`, `no_primary_data_cleanup`.

## Cleanup Evidence Table

Every smoke surface needs a row before broader beta. A missing row is unresolved.

| Smoke surface | Cleanup status | Cleanup owner | Notes |
| --- | --- | --- | --- |
| Authenticated write smoke workspace/idea | `retained_for_rerun` | Operator | Keep as disposable beta fixture until no longer useful. |
| RLS fixture pair | `retained_for_rerun` | Operator | Keep only while synthetic and reserved for RLS reruns. |
| Telemetry smoke events | `not_applicable` | Operator | Disposable smoke payloads were used; keep summary evidence only. |
| Screenshot artifacts | `not_applicable` | Operator | Use `completed_cleanup` if any local sensitive screenshots were created and deleted. |

Validation keywords: `smoke_cleanup_evidence_recorded`, `missing_cleanup_row_blocks_beta`, `cleanup_status_closed_for_controlled_beta`, `cleanup_disposition_closed`.

## Cleanup Decision

Use this order:

1. If a record belongs to a primary operator, customer, real company, or real project, stop. Do not treat it as smoke data.
2. If the record is needed as a stable RLS fixture pair, mark it `retained_for_rerun`.
3. If the record was created by authenticated write smoke and is no longer needed, keep it `pending_cleanup` until it is deleted or archived, then mark it `completed_cleanup`.
4. If the record is a telemetry smoke event, keep only summary evidence in docs and leave it `pending_cleanup` unless explicit user-approved DB cleanup marks it `completed_cleanup`.
5. If cleanup would require SQL, service-role access, Supabase dashboard mutation, Vercel env mutation, deploy, rollback, or external runtime mutation, keep it `pending_cleanup` and record it as user-owned.

Validation keywords: `primary_data_cleanup_stop_condition`, `reusable_rls_fixture_pair`, `write_smoke_cleanup_after_test_window`, `user_owned_cleanup_action`.

## Evidence Template

Record cleanup evidence only in this shape:

```text
Cleanup class: smoke_data_cleanup
Target surface: auth_write_smoke | rls_fixture_pair | telemetry_smoke | screenshot_artifact
Cleanup status: pending_cleanup | completed_cleanup | retained_for_rerun | not_applicable
Cleanup owner:
Secrets printed: no
Raw private payloads recorded: no
Screenshots stored in git: no
Skipped cleanup:
Reason:
```

Do not record Auth emails, passwords, database row payloads, telemetry secrets, service-role keys, cookies, sessions, bearer tokens, signed URLs, screenshots with private data, or raw SQL results that expose private rows.

Validation keywords: `smoke_data_cleanup_evidence_template`, `no_raw_private_payloads`, `screenshots_not_committed`, `credentials_not_recorded`.

For broader beta, any new `pending_cleanup` row blocks expansion until the operator either completes cleanup, marks the fixture `retained_for_rerun`, or marks cleanup `not_applicable`. The current controlled beta disposition is closed.

Validation keywords: `cleanup_status_enum_harmonized`, `new_pending_cleanup_blocks_broader_expansion`, `retained_for_rerun_allowed`, `cleanup_disposition_closed`.

## Stop Conditions

Stop and ask for explicit user approval when cleanup would:

- delete or archive any data whose disposable status is uncertain,
- touch a primary operator account or workspace,
- require `SUPABASE_SERVICE_ROLE_KEY`,
- require SQL execution or Supabase dashboard mutation,
- mutate Vercel env vars, deployments, or external MVP runtimes,
- remove reusable RLS fixtures before a replacement pair exists,
- expose secrets, raw payloads, cookies, sessions, screenshots, or `.env.local`.

Validation keywords: `cleanup_requires_explicit_approval`, `service_role_cleanup_blocked`, `unknown_disposable_status_blocks_cleanup`, `no_external_runtime_mutation`.
