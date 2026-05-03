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
```

The ownership migration is safe to re-run. It drops and recreates its policies so a partially applied SQL Editor run can be corrected without manual cleanup.

This creates:

- `ideas`
- `risks`
- `decisions`
- `experiments`

## RLS Posture

The initial migration enables RLS on every table.

- Public read is allowed so the deployed console can render portfolio state.
- Inserts are limited to authenticated users.
- Updates and deletes are limited to rows created by the same authenticated user.
- Before storing sensitive care, finance, inheritance, or psychological coaching data, tighten policies around project membership and user ownership.

## Auth Setup

The console uses Supabase email magic links for operator access.

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

## Next Hardening Pass

- Add user profiles and organizations.
- Replace public read with organization-scoped read.
- Add audit events for idea, risk, and decision changes.
- Add deletion and retention rules before collecting real personal data.
