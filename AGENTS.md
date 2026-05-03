<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes. APIs, conventions, and file structure may differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# AI Venture Lab Agent Map

This repository is an operating system for turning raw app ideas into validated MVPs. Treat it as a venture lab, not a single product backlog.

## Working Agreements

- Start every non-trivial task by identifying the current phase: strategy, research, product, design, build, QA, debug, security, or launch.
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
- `.codex/agents/`: custom subagent role definitions.
- `.codex/hooks/`: deterministic local hook scripts.
- `scripts/`: deterministic command-line gates.

## Default Workflow

1. Intake the idea with `templates/IDEA_BRIEF.md`.
2. Research market, user pain, competitors, and regulation.
3. Score with `scripts/score_idea.ps1`.
4. Write an MVP PRD only after the idea passes the score gate.
5. Build the smallest testable prototype.
6. Run `pnpm quality` and update docs before completion.
7. End with one decision: `ship`, `pivot`, `kill`, or `research_more`.

## Done Means

- The requested artifact exists in the right folder.
- Important decisions and risks are logged.
- Code changes pass `pnpm lint`, `pnpm typecheck`, and, when feasible, `pnpm build`.
- Any skipped verification is explicitly reported with the reason.
