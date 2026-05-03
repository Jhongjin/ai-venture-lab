# Supabase Setup

Use this after the Vercel project has the Supabase environment variables.

## Required Vercel Variables

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## Initial Schema

Run the SQL in:

```text
supabase/migrations/20260503000000_initial_harness.sql
```

This creates:

- `ideas`
- `risks`
- `decisions`
- `experiments`

## RLS Posture

The initial migration enables RLS on every table.

- Public read is allowed so the deployed console can render portfolio state.
- Writes are limited to authenticated users.
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
