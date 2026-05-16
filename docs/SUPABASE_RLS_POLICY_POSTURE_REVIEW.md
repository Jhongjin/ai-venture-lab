# Supabase RLS Policy Posture Review

Status: WQ-041 static posture review complete
Last updated: 2026-05-16
Scope: static SQL and documentation review only; no Supabase execution, no Auth/DB mutation, no `.env.local` readback, no smoke execution

## Purpose

This review compares the current Supabase bootstrap and migration files against the RLS allowed/denied smoke plan before real cross-workspace checks run.

Validation keywords: `supabase_rls_policy_posture_review`, `static_sql_review_only`, `real_denied_smoke_not_run`, `no_secret_output`.

## Reviewed Sources

- `supabase/bootstrap.sql`
- `supabase/migrations/20260503000000_initial_harness.sql`
- `supabase/migrations/20260503010000_add_operator_ownership.sql`
- `supabase/migrations/20260503020000_add_organization_access_model.sql`
- `supabase/migrations/20260503030000_private_workspace_reads.sql`
- `supabase/migrations/20260503060000_add_orchestration_runs.sql`
- `supabase/migrations/20260504000000_add_venture_artifacts.sql`
- `supabase/migrations/20260505010000_add_implementation_tasks.sql`
- `supabase/migrations/20260506010000_add_learning_telemetry.sql`
- `supabase/migrations/20260512010000_repair_workspace_creation_policy.sql`
- `docs/RLS_ALLOWED_DENIED_SMOKE_PLAN.md`

This review did not inspect production Supabase migration state, table grants, dashboard settings, Auth users, data rows, service-role access, browser sessions, cookies, or environment values.

Validation keywords: `production_migration_application_unverified`, `no_service_role_review`, `no_env_local_readback`.

## Posture Summary

| Surface | Static posture | Smoke implication |
| --- | --- | --- |
| `ideas`, `risks`, `decisions`, `experiments` | Initial migration creates `initial_public_read_policy` using `using (true)`. `20260503030000_private_workspace_reads.sql` later drops those policies and replaces them with authenticated `owner_workspace_scoped_reads`: creator, null global seed rows, or organization member. | A real denied smoke can claim private-read readiness only if production has applied the private workspace read migration and public-read policies are absent. |
| `organizations` | Organization RLS is member-scoped. `20260512010000_repair_workspace_creation_policy.sql` also allows the creator to read the organization before membership repair catches up. | Workspace labels are safe for allowed visibility checks, but cross-workspace org names must remain disposable. |
| `organization_members` | Membership rows are visible to the row user or organization members after the repair migration. Admins manage membership. | Denied smoke should confirm a user cannot see the other disposable workspace label or membership surface. |
| `audit_events` | Authenticated users can read rows where `organization_id is null` or where they are organization members. | `null_global_seed_read_exception` applies. Do not use null-scope audit rows as private denied-case evidence. |
| `orchestration_runs` | Authenticated select is creator, null global seed rows, or organization member. Insert requires creator and org-null/member; update/delete are creator or org admin. | Same denied-case shape as core workspace records. |
| `venture_artifacts` | Authenticated select is creator, null global seed rows, or organization member. Insert requires creator and org-null/member; update/delete are creator or org admin. | Artifact visibility can be included later, but initial RLS smoke should use workspace shell visibility first. |
| `implementation_tasks` | Authenticated select is creator, null global seed rows, or organization member. Insert requires creator and org-null/member; update/delete are creator or org admin. | Task visibility can be included after the workspace pair is confirmed disposable. |
| `telemetry_events` | Insert requires `actor_id = auth.uid()` and org-null/member. Select is actor or organization member, with no null-global read exception for select. | Telemetry smoke remains separate because it needs operator-held telemetry fixtures and should not be folded into RLS browser smoke. |

Validation keywords: `initial_public_read_policy`, `private_workspace_reads_migration`, `owner_workspace_scoped_reads`, `null_global_seed_read_exception`, `telemetry_rls_separate_gate`.

See `docs/RLS_ALLOWED_DENIED_SMOKE_PLAN.md` for the `static_rls_policy_inventory`. The `legacy_seed_visibility_carveout` covers `created_by is null and organization_id is null` rows. The private-read tightening requirement is `public_read_removed_by_private_workspace_reads`; until the disposable denied smoke runs, `denied_cases_not_claimed_until_executed` remains true.

## What We Can Safely Claim

- Static SQL contains a public-read-to-private-read transition for the original venture tables.
- Static SQL contains owner/member scoped select policies for core records, orchestration runs, venture artifacts, implementation tasks, and telemetry events.
- Static SQL contains ownership or organization-admin checks for update/delete paths on private work records.
- Static SQL contains write-side `with check` constraints that limit inserts to the actor and member/admin organization context in the reviewed migrations.
- WQ-040 runner guard is aligned with the policy shape because it uses anonymous, User A, and User B browser contexts.

Validation keywords: `static_private_read_intent_present`, `owner_admin_write_policy_present`, `browser_anon_key_rls_check_aligned`.

## What We Cannot Claim Yet

- We cannot claim production has applied every reviewed migration.
- We cannot claim the old public-read policies are absent in production.
- We cannot claim real anonymous denied, cross-workspace denied, or second-user denied checks have passed.
- We cannot claim null global seed rows are absent or safe for all product contexts.
- We cannot claim dashboard grants, manual SQL changes, or legacy rows match the checked files.
- We cannot claim telemetry production RLS is verified.

Validation keywords: `production_public_read_absence_unverified`, `cross_workspace_denied_not_run`, `telemetry_production_rls_unverified`, `legacy_rows_unverified`.

## Blockers Before Real RLS Smoke

1. Confirm the production Supabase project has applied all required migrations through `20260512010000_repair_workspace_creation_policy.sql`, plus the artifact/task/telemetry migrations if those tables are part of the check.
2. Confirm the old public read policies from `20260503000000_initial_harness.sql` are not active in production.
3. Provide two disposable Supabase Auth users and two disposable workspaces, as defined in `docs/RLS_ALLOWED_DENIED_SMOKE_PLAN.md`.
4. Keep all credentials in the local terminal only; do not copy them into docs, chat, screenshots, artifacts, or Build Relay packets.
5. Run the blocked-safe runner only with explicit disposable labels and summary-only evidence.
6. Stop immediately if a denied check returns private workspace, idea, artifact, membership, task, or telemetry data.

Validation keywords: `migration_state_confirmation_required`, `second_disposable_account_required`, `disposable_workspace_pair_required`, `summary_only_rls_evidence`, `denied_check_private_data_blocks_beta`.

## Recommendation

Proceed with fixture preparation next, not real execution. The next queue should create a user-facing fixture handoff that names the exact two-account/two-workspace setup and the safe local env variable names, then wait for the user to confirm those disposable fixtures exist.

Recommended next state:

```text
rls_policy_posture_review_ready
```
