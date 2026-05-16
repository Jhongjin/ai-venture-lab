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

## User Testing Guide

Use `docs/USER_TEST_GUIDE.md` for the Korean walkthrough of the production console, including login, workspace setup, field-by-field sample inputs, scoring, risks, experiments, orchestration runs, artifact approvals, and launch-readiness testing.

## Quality Gate

```bash
pnpm lint
pnpm typecheck
pnpm build
pnpm harness:check
pnpm release:check
```

`pnpm quality` runs lint, typecheck, and build together. `pnpm quality:full` also runs the harness and release-readiness checks before building.

## Environment

Copy `.env.example` to `.env.local` when Supabase is ready.

Use `docs/BETA_ENV_AND_SMOKE_BOUNDARY.md` for the full beta env and smoke boundary. Store variable names in docs, never values.

Required later:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Server-only values must stay in trusted server environments and out of browser bundles, screenshots, artifacts, chat, and Build Relay packets:

```bash
SUPABASE_SERVICE_ROLE_KEY=
TELEMETRY_INGEST_SECRET=
OPENAI_API_KEY=
OPENAI_IDEA_MODEL=
```

`OPENAI_API_KEY` and `OPENAI_IDEA_MODEL` are optional for AI-assisted idea extraction. Without them, the console falls back to the local extraction path.

## Supabase

Run the bootstrap SQL in your Supabase SQL editor:

```text
supabase/bootstrap.sql
```

The app falls back to seed data when Supabase is not configured or the schema has not been applied yet.

## Auth

The console uses Supabase password sign-in for dashboard-created operator accounts. Supabase email magic links remain a fallback when Auth email delivery is configured. Configure Supabase Auth URL settings:

```text
Site URL: https://ai-venture-lab.vercel.app
Redirect URLs:
- https://ai-venture-lab.vercel.app/auth/callback
- http://localhost:3000/auth/callback
```

Magic links route through `/auth/callback` so Supabase auth codes become app sessions before returning to the console. Password sign-in is only for existing Supabase Auth password users.

Authenticated users can create ideas inside their workspace. Keep RLS enabled before storing sensitive data. Beta smoke uses a disposable Supabase Auth account; authenticated writes require explicit per-run approval and disposable workspace/idea data.

## Operating Model

Use the repo in this order:

1. Capture ideas with `templates/IDEA_BRIEF.md`.
2. Research and log risks in `docs/RISK_REGISTER.md`.
3. Score ideas with `scripts/score_idea.ps1`.
4. Promote strong ideas into `templates/PRD.md` and `templates/MVP_SPEC.md`.
5. Build prototypes in `src/` or future `apps/` workspaces.
6. Run QA, security, and launch checks before pushing.

See `docs/OPERATING_MODEL.md` for the full harness.

## Agent Harness

- `AGENTS.md` keeps short repo-wide operating rules.
- `.agents/skills/` contains repeatable workflow skills.
- `.codex/agents/` mirrors the app runbook roles from strategy through launch.
- `.codex/hooks/` and `scripts/` provide deterministic checks.
