---
name: app-development-orchestrator
description: Use when moving a validated app idea from PRD into design, backend choice, implementation tasks, QA, security, deployment, or Codex handoff inside AI Venture Lab.
---

# App Development Orchestrator

Use this skill when an idea has enough evidence to become a product slice. Keep the work inside the lab's gates instead of jumping straight to code.

## Workflow

1. Confirm the idea has a saved validation summary and PRD readiness has been reviewed.
2. In `앱 개발 프로세스`, use `준비와 산출물` first:
   - Compare Supabase, Firebase, Firebase SQL Connect, and hybrid with the backend scorecard.
   - Save the backend decision.
   - Review design readiness for core journey, PRD, MVP scope, backend boundary, and screen states.
   - Save design brief, technical spec, and development runbook.
   - Confirm Vercel Preview/Production environment variables, client/server secret boundaries, backend rules, deploy logs, and rollback notes before coding.
3. Use `개발 태스크` before coding:
   - Generate baseline implementation tasks.
   - Add manual tasks for bugs, design polish, deployment fixes, customer validation, rollback, or research follow-up.
   - Track `todo`, `doing`, `blocked`, and `done` with evidence.
4. Use `완료와 핸드오프` for execution:
   - Copy the Codex implementation handoff before giving work to a coding agent.
   - Copy or save the role prompt pack when specialist passes need shared context.
   - Keep scope to one vertical slice and one measurable next evidence item.
   - Save the development completion report only after tasks, evidence, QA, security, and launch readiness are reviewed.

## Non-negotiable Gates

- No coding without backend decision, design brief, technical spec, and development runbook.
- No build start without checking build readiness.
- No build start when environment variables, backend rules allowed/denied checks, deploy-log location, or rollback criteria are missing.
- No launch recommendation without QA, security, high-risk status, implementation evidence, and final decision.
- No AI automation without user control, retry, edit, discard, privacy notice, and human fallback.

## Output Shape

When asked to hand off work, return:

- selected idea and goal
- required artifacts and approvals
- backend decision and auth/data boundary
- environment variable boundary, backend rules tests, deployment log or Vercel inspect link, and rollback path
- UI states to implement
- implementation tasks in priority order
- role prompt pack when strategy, research, product, design, build, QA, debug, security, or launch work is delegated
- quality commands and manual smoke path
- risks, skipped checks, and rollback notes
