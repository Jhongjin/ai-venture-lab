<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes. APIs, conventions, and file structure may differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# AI Venture Lab Agent Map

This repository is an operating system for turning raw app ideas into validated MVPs. Treat it as a venture lab, not a single product backlog.

## Working Agreements

- Start every non-trivial task by identifying the current phase: strategy, research, product, design, build, QA, debug, security, or launch.
- Run work in loops: finish a coherent job, report the result, commit and push, then move to the next job until the current phase is complete.
- Skip optional work when it is not needed for the current phase; carry non-skippable external work as a named next user action and continue with unblocked work.
- Keep `AGENTS.md` short. Put durable knowledge in `docs/`, repeatable workflows in `.agents/skills/`, and deterministic checks in `scripts/`.
- Use `docs/DECISION_LOG.md` for durable product and technical decisions.
- Use `docs/RISK_REGISTER.md` for legal, privacy, security, medical, financial, or operational risks.
- Do not claim market, legal, medical, financial, or regulatory facts without citing current sources.
- Never commit secrets. Use `.env.example` for required environment variables.

## Repository Map

- `src/app/`: Next.js App Router UI for the venture lab console.
- `src/lib/`: shared application helpers.
- `docs/`: durable operating context and review artifacts.
- `templates/`: reusable input/output templates for ideas and MVPs.
- `.agents/skills/`: Codex skills for repeated workflows.
- `.codex/agents/`: custom subagent role definitions for strategy, research, product, design, build, QA, debug, security, and launch.
- `.codex/hooks/`: deterministic local hook scripts.
- `scripts/`: deterministic command-line gates.

## Default Workflow

1. Start in the console flow: auth, workspace, idea extraction or manual intake.
2. Use automatic idea discovery for pasted conversations, then check duplicates, validation readiness, and redacted source excerpts before saving a validation package.
3. Score the selected idea, attach risks, record decisions, and create the smallest experiment.
4. Save durable validation artifacts: idea brief, research brief, 7-day validation sprint, evidence notes, experiment result, and validation summary.
5. Promote to PRD only after checking PRD readiness.
6. Move to app development only after saving or approving MVP spec, backend decision, design brief, technical spec, development runbook, and implementation tasks.
7. Use the role prompt pack and Codex implementation handoff when splitting strategy, research, product, design, build, QA, debug, security, and launch work.
8. Use the shell priority candidates to choose what to clear next: risk, experiment, validation, or development.
9. End with one decision: `ship`, `pivot`, `kill`, or `research_more`.

## Done Means

- The requested artifact exists in the right folder.
- Important decisions and risks are logged.
- Code changes pass `pnpm quality:full` when they touch product behavior, harness logic, or deployment flow.
- Production deployments pass `pnpm smoke:prod`.
- Any skipped task or verification is explicitly reported with the reason and whether it is optional, blocked, or deferred.

## Loop Discipline

- Finish one coherent job before starting the next one.
- Report after each job with changed surface, validation, commit hash, deployment state, and next job.
- Commit and push every completed job that changes repository state.
- Deploy user-facing changes to Vercel and run production smoke.
- If SQL, external dashboard work, credentials, or user confirmation is required, state the exact action and continue with tasks that do not depend on it.
- Do not wait on optional cleanup, polish, or broad refactors when the current phase can advance safely without them.

## UI Standards

- Keep the app as an operator console: left step menu, right task surface, compact forms, visible next action.
- Avoid long-scroll workflows when a tab, sub-panel, or sidebar status can preserve context.
- Show empty, loading, success, error, permission, read-only, desktop, and mobile states for user-facing changes.
- Never persist raw source excerpts that may contain obvious contact or identifier patterns; use the extraction redaction path.
