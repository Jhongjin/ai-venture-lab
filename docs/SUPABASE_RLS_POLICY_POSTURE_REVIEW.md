# Supabase RLS Policy Posture Review

Status: production posture evidence recorded
Last updated: 2026-05-17
Scope: static SQL review plus summary-only production posture and browser denied-smoke evidence; no credentials, private row payloads, screenshots, service-role values, or `.env.local` readback recorded

## Purpose

This review compares the current Supabase bootstrap and migration files against the RLS allowed/denied smoke plan and records the summary-only production evidence collected before beta private-read claims.

Validation keywords: `supabase_rls_policy_posture_review`, `production_posture_summary_only`, `rls_allowed_denied_browser_smoke_passed`, `no_secret_output`.

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

The original static review did not inspect production Supabase migration state, table grants, dashboard settings, Auth users, data rows, service-role access, browser sessions, cookies, or environment values. On 2026-05-17, the operator provided summary-only production posture evidence: required private-read migrations through `20260512010000_repair_workspace_creation_policy.sql` were present, old public-read policy checks returned no rows, and RLS was enabled on the core private tables.

Validation keywords: `production_migration_application_summary_recorded`, `public_read_policy_absence_confirmed`, `rls_enabled_core_tables_confirmed`, `no_service_role_review`, `no_env_local_readback`.

## Posture Summary

| Surface | Static posture | Smoke implication |
| --- | --- | --- |
| `ideas`, `risks`, `decisions`, `experiments` | Initial migration creates `initial_public_read_policy` using `using (true)`. `20260503030000_private_workspace_reads.sql` later drops those policies and replaces them with authenticated `owner_workspace_scoped_reads`: creator, null global seed rows, or organization member. | The disposable denied smoke supports private-read readiness only when production has applied the private workspace read migration and public-read policies are absent. |
| `organizations` | Organization RLS is member-scoped. `20260512010000_repair_workspace_creation_policy.sql` also allows the creator to read the organization before membership repair catches up. | Workspace labels are safe for allowed visibility checks, but cross-workspace org names must remain disposable. |
| `organization_members` | Membership rows are visible to the row user or organization members after the repair migration. Admins manage membership. | Denied smoke should confirm a user cannot see the other disposable workspace label or membership surface. |
| `audit_events` | Authenticated users can read rows where `organization_id is null` or where they are organization members. | `null_global_seed_read_exception` applies. Do not use null-scope audit rows as private denied-case evidence. |
| `orchestration_runs` | Authenticated select is creator, null global seed rows, or organization member. Insert requires creator and org-null/member; update/delete are creator or org admin. | Same denied-case shape as core workspace records. |
| `venture_artifacts` | Authenticated select is creator, null global seed rows, or organization member. Insert requires creator and org-null/member; update/delete are creator or org admin. | Artifact visibility can be included later, but initial RLS smoke should use workspace shell visibility first. |
| `implementation_tasks` | Authenticated select is creator, null global seed rows, or organization member. Insert requires creator and org-null/member; update/delete are creator or org admin. | Task visibility can be included after the workspace pair is confirmed disposable. |
| `telemetry_events` | Insert requires `actor_id = auth.uid()` and org-null/member. Select is actor or organization member, with no null-global read exception for select. | Telemetry smoke remains separate because it needs operator-held telemetry fixtures and should not be folded into RLS browser smoke. |

Validation keywords: `initial_public_read_policy`, `private_workspace_reads_migration`, `owner_workspace_scoped_reads`, `null_global_seed_read_exception`, `telemetry_rls_separate_gate`.

See `docs/RLS_ALLOWED_DENIED_SMOKE_PLAN.md` for the `static_rls_policy_inventory`. The `legacy_seed_visibility_carveout` covers `created_by is null and organization_id is null` rows. The private-read tightening requirement is `public_read_removed_by_private_workspace_reads`; on 2026-05-17 the disposable denied smoke passed with summary-only evidence.

## Production Evidence

2026-05-17 summary-only evidence:

- Production migration posture checked before denied smoke: required private-read migrations through `20260512010000_repair_workspace_creation_policy.sql` were present.
- Old public-read policy checks returned no rows.
- RLS was enabled on the core private tables checked by the posture query.
- `pnpm smoke:browser:rls` passed with anonymous denied, disposable A allowed, disposable B allowed, A-to-B denied, and B-to-A denied checks.
- No credentials, environment values, cookies, session data, service-role keys, screenshots, private row payloads, or raw response bodies were recorded.

Validation keywords: `production_private_read_posture_confirmed`, `old_public_read_policies_absent`, `rls_allowed_denied_browser_smoke_passed`, `summary_only_evidence`.

## What We Can Safely Claim

- Static SQL contains a public-read-to-private-read transition for the original venture tables.
- Static SQL contains owner/member scoped select policies for core records, orchestration runs, venture artifacts, implementation tasks, and telemetry events.
- Static SQL contains ownership or organization-admin checks for update/delete paths on private work records.
- Static SQL contains write-side `with check` constraints that limit inserts to the actor and member/admin organization context in the reviewed migrations.
- WQ-040 runner guard is aligned with the policy shape because it uses anonymous, User A, and User B browser contexts.
- Production disposable browser evidence passed for anonymous denied and cross-workspace denied checks.

Validation keywords: `static_private_read_intent_present`, `owner_admin_write_policy_present`, `browser_anon_key_rls_check_aligned`.

## What We Cannot Claim Yet

- We cannot claim null global seed rows are absent or safe for all product contexts.
- We cannot claim dashboard grants, manual SQL changes, or legacy rows match the checked files.
- We cannot claim future migrations or manual dashboard policy changes preserve this posture without rerunning the posture and denied-smoke checks.
- We cannot claim telemetry browser RLS is covered by the workspace RLS smoke; telemetry ingest remains a separate secret-bearing server smoke.

Validation keywords: `legacy_rows_unverified`, `future_policy_changes_require_rerun`, `telemetry_rls_separate_gate`.

## Rerun Conditions

Rerun posture and denied smoke when:

1. RLS policies, grants, migrations, or table ownership logic change.
2. Workspace membership, organization visibility, or shell access code changes.
3. Disposable smoke fixtures are recreated or renamed.
4. A denied check returns private workspace, idea, artifact, membership, task, or telemetry data.
5. Evidence would require credentials, raw private payloads, screenshots, service-role access, or `.env.local` readback.

Validation keywords: `rls_posture_rerun_conditions`, `summary_only_rls_evidence`, `denied_check_private_data_blocks_beta`.

## Recommendation

Private-read beta readiness can rely on the current summary-only RLS evidence for the checked workspace surfaces. Keep the disposable fixtures available for reruns, and do not extend the claim to new private tables, telemetry select behavior, or future policy changes without fresh allowed/denied evidence.

Recommended next state:

```text
rls_allowed_denied_browser_smoke_passed
```
