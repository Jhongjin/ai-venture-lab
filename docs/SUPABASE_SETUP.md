# Supabase Setup

Use this after the Vercel project has the Supabase environment variables.

## Required Vercel Variables

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## Recommended SQL Editor Setup

For manual setup in Supabase SQL Editor, run the full bootstrap file:

```text
supabase/bootstrap.sql
```

This file is safe to re-run. It creates missing types, tables, triggers, policies, and seed rows without duplicating the seed data.

## Migration Files

If you are applying migrations manually instead of using the bootstrap file, run them in this order:

```text
supabase/migrations/20260503000000_initial_harness.sql
supabase/migrations/20260503010000_add_operator_ownership.sql
supabase/migrations/20260503020000_add_organization_access_model.sql
supabase/migrations/20260503030000_private_workspace_reads.sql
supabase/migrations/20260503040000_member_management_rpc.sql
supabase/migrations/20260503050000_member_lifecycle_rpc.sql
supabase/migrations/20260503060000_add_orchestration_runs.sql
supabase/migrations/20260504000000_add_venture_artifacts.sql
supabase/migrations/20260504010000_add_artifact_lifecycle.sql
supabase/migrations/20260504020000_add_artifact_status_notes.sql
supabase/migrations/20260505000000_expand_venture_artifact_types.sql
supabase/migrations/20260505010000_add_implementation_tasks.sql
```

The ownership migration is safe to re-run. It drops and recreates its policies so a partially applied SQL Editor run can be corrected without manual cleanup.
The organization access migration is also safe to re-run. It adds team boundaries, membership helpers, and audit logging without removing the current public-read console behavior.
The private workspace reads migration removes anonymous reads and requires an authenticated owner, global seed row, or organization membership to read portfolio records.
The member management migration adds a safe RPC for workspace owners/admins to add existing Supabase Auth users by email.
The member lifecycle migration adds owner/admin RPCs for role changes and removals while protecting the last workspace owner.
The orchestration migration adds idea-level specialist runs for strategy, research, product, design, build, QA, debug, security, and launch.
The artifact migration stores generated idea briefs, PRDs, MVP specs, launch checklists, and research notes.
The artifact lifecycle migration adds draft, approved, archived, version, and approval metadata to saved artifacts.
The artifact status notes migration stores approval, revision, and archive rationale.
The expanded artifact type migration adds backend decision, design brief, technical spec, and development runbook artifact types.
The implementation task migration adds a task board for implementation work, completion evidence, and launch readiness gating.

This creates:

- `ideas`
- `risks`
- `decisions`
- `experiments`
- `orchestration_runs`
- `venture_artifacts`
- `implementation_tasks`
- `organizations`
- `organization_members`
- `audit_events`

## RLS Posture

The initial migration enables RLS on every table.

- Public read is allowed until `20260503030000_private_workspace_reads.sql` is applied.
- After the private read migration, authenticated users can read rows they own, global seed rows, and rows in their organizations.
- Inserts are limited to authenticated users.
- Updates and deletes are limited to row owners, with organization admin support once a row is attached to an organization.
- Before storing sensitive care, finance, inheritance, or psychological coaching data, remove public read and require organization membership for every read.

## Auth Setup

The console supports Supabase email magic links and password sign-in for operator access.

In Supabase:

1. Go to `Authentication` -> `URL Configuration`.
2. Set `Site URL` to your production URL.
3. Add redirect URLs for production and local development.

Recommended values:

```text
https://ai-venture-lab.vercel.app/auth/callback
http://localhost:3000/auth/callback
```

In `Authentication` -> `Providers`, keep email enabled. New sign-ins can create ideas because write policies allow the `authenticated` role.

## Fast Operator Login Without Email Delivery

Supabase's built-in email provider is intentionally limited. If magic links do not arrive or the app shows `email rate limit exceeded`, use a dashboard-created operator account:

1. Go to `Authentication` -> `Users`.
2. Click `Add user`.
3. Enter the operator email and a temporary strong password.
4. Enable auto-confirm/confirmed user if the dashboard offers that option.
5. In the app, use `Sign in with password`.

For production or repeated testing with email links, configure custom SMTP in Supabase Auth.

## Next Hardening Pass

- Add user profiles and invitation flow.
- Replace global seed visibility with explicit workspace-owned seed data.
- Add deletion and retention rules before collecting real personal data.
- Add explicit owner transfer flow.

See `docs/ACCESS_MODEL.md` for the organization bootstrap query and the hardening path.
