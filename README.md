# AI Venture Lab

AI Venture Lab is a repeatable workspace for turning app ideas into tested MVPs. The repository combines a deployable Next.js console with durable agent instructions, reusable skills, deterministic scripts, and product templates.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- pnpm
- Supabase client dependency, ready for environment variables
- Vercel-ready build scripts

## Quick Start

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`.

## Quality Gate

```bash
pnpm lint
pnpm typecheck
pnpm build
pnpm harness:check
```

`pnpm quality` runs lint, typecheck, and build together.

## Environment

Copy `.env.example` to `.env.local` when Supabase is ready.

Required later:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## Supabase

Run the initial SQL migration in your Supabase SQL editor:

```text
supabase/migrations/20260503000000_initial_harness.sql
```

The app falls back to seed data when Supabase is not configured or the schema has not been applied yet.

## Auth

The console uses Supabase email magic links. Configure Supabase Auth URL settings:

```text
Site URL: https://ai-venture-lab.vercel.app
Redirect URL: http://localhost:3000
```

Authenticated users can create ideas. The current policy is intentionally broad for the initial private lab; tighten it before storing sensitive data.

## Operating Model

Use the repo in this order:

1. Capture ideas with `templates/IDEA_BRIEF.md`.
2. Research and log risks in `docs/RISK_REGISTER.md`.
3. Score ideas with `scripts/score_idea.ps1`.
4. Promote strong ideas into `templates/PRD.md` and `templates/MVP_SPEC.md`.
5. Build prototypes in `src/` or future `apps/` workspaces.
6. Run QA, security, and launch checks before pushing.

See `docs/OPERATING_MODEL.md` for the full harness.
