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
```

The ownership migration is safe to re-run. It drops and recreates its policies so a partially applied SQL Editor run can be corrected without manual cleanup.
The organization access migration is also safe to re-run. It adds team boundaries, membership helpers, and audit logging without removing the current public-read console behavior.
The private workspace reads migration removes anonymous reads and requires an authenticated owner, global seed row, or organization membership to read portfolio records.

This creates:

- `ideas`
- `risks`
- `decisions`
- `experiments`
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
https://ai-venture-lab.vercel.app
http://localhost:3000
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

See `docs/ACCESS_MODEL.md` for the organization bootstrap query and the hardening path.
