# Phase Status

Use this file as the lightweight phase ledger for the agent work loop.

## Current Phase

- Phase: Manager-facing beta usability
- Goal: Turn the developer-oriented command center into a business decision workflow for executives and non-technical managers.
- Status: In progress

## Loop Rules

1. Complete one coherent job.
2. Report what changed, what was skipped, validation results, commit, deployment state, and next job.
3. Commit and push repository changes.
4. Deploy user-facing changes and run production smoke.
5. Skip optional work when the current phase can advance without it.
6. Carry non-skippable external work as a named user action, then continue unblocked work.

## Phase Completion

- Completed on: 2026-05-06
- Covered scope: idea extraction and validation gates, saved extraction portfolio reports, validation evidence coaching, PRD handoff, MVP slicing, Korean UX, app planning/design/development orchestration, development kickoff guardrails, implementation run packages, implementation task board, evidence quality gates, filtered task handoffs, artifact approval reviews, release decision packets, MVP build command packets, QA acceptance matrices, post-launch learning loops, versioned runbook artifacts, local release checks, Vercel production smoke.
- Remaining items are not blocking this phase because they require external access, optional AI tuning, or later beta-level browser automation.

## Completed Jobs

| Date | Job | Commit | Deploy | Validation |
| --- | --- | --- | --- | --- |
| 2026-05-16 | WQ-038 ran authenticated browser visibility smoke | Current commit | Skipped, smoke-only/no deploy | Safe env preflight, `pnpm smoke:browser:auth`; write/create/screenshot flags disabled |
| 2026-05-16 | WQ-037 documented CI workflow scope boundary | Current commit | Skipped, docs/script-only | Keyword readback, `pnpm quality:full` |
| 2026-05-16 | WQ-036 documented beta env and smoke boundary | Current commit | Skipped, docs/env-example only | Keyword readback, `pnpm release:check` |
| 2026-05-12 | Repaired workspace creation ownership and RLS handoff | Current commit | Production alias after deploy | `pnpm lint`, `pnpm typecheck`, harness check, release check, `pnpm build` |
| 2026-05-12 | Routed signed-in operators to team-space check before idea intake | Current commit | Production alias after deploy | `pnpm lint`, direct `tsc`, harness check, release check, `pnpm build` |
| 2026-05-12 | Switched operator access to password-first login | Current commit | Production alias after deploy | `pnpm lint`, direct `tsc`, harness check, release check, `pnpm build` |
| 2026-05-12 | Clarified email-link login copy for non-technical operators | Current commit | Production alias after deploy | `pnpm lint`, direct `tsc`, harness check, release check, `pnpm build` |
| 2026-05-12 | Made login the default first step for non-technical operators | Current commit | Production alias after deploy | `pnpm lint`, direct `tsc`, harness check, release check, `pnpm build` |
| 2026-05-12 | Hid developer-only telemetry details behind a manager-facing handoff panel | Current commit | Production alias after deploy | `pnpm lint`, direct `tsc`, harness check, release check, `pnpm build` |
| 2026-05-12 | Refined workbench panels for manager-facing decision language | Current commit | Production alias after deploy | `pnpm lint`, direct `tsc`, harness check, release check, `pnpm build` |
| 2026-05-12 | Refined manager-oriented login, navigation, and guide copy | Current commit | Production `FDPRsS6LESA9LWaZe7XG3BdkWa52` | `pnpm lint`, direct `tsc`, harness check, release check, `pnpm build`, `pnpm smoke:prod`, `pnpm smoke:routes`, `pnpm smoke:browser` |
| 2026-05-12 | Added full product funnel telemetry smoke | Current commit | Production alias after deploy | Missing-secret guard, `pnpm lint`, direct `tsc`, harness check, release check, `pnpm build` |
| 2026-05-06 | Added external MVP telemetry integration kit | Current commit | Production alias after deploy | `pnpm lint`, direct `tsc`, harness check, release check, `pnpm build` |
| 2026-05-06 | Re-deployed product telemetry ingest with Production secrets | `5414835` | Production `2AM2imxYxi3oh7gMs6KDG756pn1d` | `pnpm smoke:prod`, `pnpm smoke:routes`, `node .\scripts\smoke_browser.mjs` |
| 2026-05-06 | Added authenticated telemetry ingest smoke harness | Current commit | Skipped, script/docs-only | `pnpm quality:full`, direct `smoke_routes.ps1`, direct `smoke_production.ps1`, missing-secret guard |
| 2026-05-06 | Added product telemetry funnel and taxonomy | `5414835` | Production `2AM2imxYxi3oh7gMs6KDG756pn1d` | `pnpm quality:full`, `pnpm smoke:prod`, `pnpm smoke:routes`, `node .\scripts\smoke_browser.mjs` |
| 2026-05-06 | Added product telemetry ingest adapter | `1efc76e` | Production `2AM2imxYxi3oh7gMs6KDG756pn1d` | `pnpm quality:full`, route smoke |
| 2026-05-06 | Added learning telemetry dashboard and event capture | `809929d` | Production `2mG3B8h47DPs9oURaRDnEVRN5Mv4` | `pnpm quality:full`, `pnpm smoke:prod`, `pnpm smoke:routes`, `pnpm smoke:browser` |
| 2026-05-06 | Closed core public beta readiness phase | Current commit | Skipped, docs-only | `pnpm quality:full` |
| 2026-05-06 | Added post-launch learning loop | `f3f39d9` | Production `3hEuawDqF1GatK6UkD7jS4mTSN76` | `pnpm quality:full`, `pnpm smoke:prod`, `pnpm smoke:routes`, `pnpm smoke:browser` |
| 2026-05-06 | Added QA acceptance matrix | `75be6c9` | Production `2igHVoFtCvHJV6YTCWQNmMNQcm9k` | `pnpm quality:full`, `pnpm smoke:prod`, `pnpm smoke:routes`, `pnpm smoke:browser` |
| 2026-05-06 | Added MVP build command packet | `f55ab6e` | Production `DGYx1NBtDdxoxcbbWcN2pyWBptqA` | `pnpm quality:full`, `pnpm smoke:prod`, `pnpm smoke:routes`, `pnpm smoke:browser` |
| 2026-05-06 | Added release decision packet | `2864983` | Production `4Xn1xGLyYHKSJP3L4dwNLbjjBF5C` | `pnpm quality:full`, `pnpm smoke:prod`, `pnpm smoke:routes`, `pnpm smoke:browser` |
| 2026-05-06 | Added artifact approval review summaries | `78728c1` | Production `AZozcZkst16gxofeYYL7AQGMUhs4` | `pnpm quality:full`, `pnpm smoke:prod`, `pnpm smoke:routes`, `pnpm smoke:browser` |
| 2026-05-06 | Added implementation dependency gate | `3058361` | Production `BStiaT3PxRdAzjGz1sEaZjM9g5wG` | `pnpm quality:full`, `pnpm smoke:prod`, `pnpm smoke:routes`, `pnpm smoke:browser` |
| 2026-05-06 | Added backend execution checklist | `9987128` | Production `HNHi9Jwhydvg23fLTpmYtCC9SYrM` | `pnpm quality:full`, `pnpm smoke:prod`, `pnpm smoke:routes`, `pnpm smoke:browser` |
| 2026-05-06 | Added artifact review queue | `8d9caf8` | Production `8zavhTmBB2MXRBRyQn5vikmJMMtY` | `pnpm quality:full`, `pnpm smoke:prod`, `pnpm smoke:routes`, `pnpm smoke:browser` |
| 2026-05-06 | Added extraction replay comparison | `f67171b` | Production `6arqYg8F2xiWVzW76fATpwdbXdQv` | `pnpm quality:full`, `pnpm smoke:prod`, `pnpm smoke:routes`, `pnpm smoke:browser` |
| 2026-05-06 | Added extraction run metadata | `9f68904` | Production `BUaguUzx47Rr2qppBveCjPHY4GFL` | `pnpm quality:full`, `pnpm smoke:prod`, `pnpm smoke:routes`, `pnpm smoke:browser` |
| 2026-05-06 | Added MVP scaffold manifest | `caef916` | Production `k6M2buEpQfam66eoy4MJBUiQSuoV` | `pnpm quality:full`, `pnpm smoke:prod`, `pnpm smoke:routes`, `pnpm smoke:browser` |
| 2026-05-06 | Added extraction business/development scorecard | `b2d694d` | Production `3ghP4ELrQJjz9mh42nEuof4i41XB` | `pnpm quality:full`, `pnpm smoke:prod`, `pnpm smoke:routes`, `pnpm smoke:browser` |
| 2026-05-06 | Added bulk extraction package save | `b789935` | Production `F1XxGBXBL42ZwYuk7Tt1CtzMKY3K` | `pnpm quality:full`, `pnpm smoke:prod`, `pnpm smoke:routes`, `pnpm smoke:browser` |
| 2026-05-06 | Added app blueprint implementation handoff | `76bb857` | Production `89BE2gPhGMuJikTE1b2NrvfDbXJ3` | `pnpm quality:full`, `pnpm smoke:prod`, `pnpm smoke:routes`, `pnpm smoke:browser` |
| 2026-05-06 | Added design generation prompt for app builders | `814d8cc` | Production `3tkMUk24xjekGq41ah7gc85LKMmP` | `pnpm quality:full`, `pnpm smoke:prod`, `pnpm smoke:routes`, `pnpm smoke:browser` |
| 2026-05-06 | Added one-click development artifact package save | `3b1c5e8` | Production `2Sc3JTq2Co6U5VhAcvXvjq7raB3X` | `pnpm quality:full`, `pnpm smoke:prod`, `pnpm smoke:routes`, `pnpm smoke:browser` |
| 2026-05-06 | Added optional authenticated browser smoke scaffold | `5a0ffed` | Skipped, script/docs-only | `pnpm quality:full`, `pnpm smoke:browser` |
| 2026-05-06 | Added browser smoke screenshot artifact handling | `98108bd` | Skipped, script/docs-only | `pnpm smoke:browser` |
| 2026-05-06 | Added browser-level beta smoke harness | `dc71fe2` | Skipped, script/docs-only | `pnpm quality:full`, `pnpm smoke:browser` |
| 2026-05-06 | Added implementation agent run packages | `48de7c3` | Production `dpl_xsbb9d7SMFtSyUheymiwdof55Bkm` | `pnpm quality:full`, `pnpm smoke:prod`, `pnpm smoke:routes` |
| 2026-05-06 | Added development kickoff guardrails | `602f5c4` | Production `dpl_F9yQJGcVFNfWQcBqw81nKmXSyMB7` | `pnpm quality:full`, `pnpm smoke:prod`, `pnpm smoke:routes` |
| 2026-05-06 | Added MVP slice planner | `dea14ed` | Production `dpl_FDaMV9rPosmHp4BeRuGN2LYzK7pJ` | `pnpm quality:full`, `pnpm smoke:prod`, `pnpm smoke:routes` |
| 2026-05-06 | Added PRD readiness handoff artifacts | `2ff32f2` | Production `dpl_3DGFMeUpdmHpV5fxy7UPW1EKj8iP` | `pnpm quality:full`, `pnpm smoke:prod`, `pnpm smoke:routes` |
| 2026-05-06 | Added validation evidence coach | `e5c08f0` | Production `dpl_EFhJyFX5xXo6B6F53MUYjYvaAud7` | `pnpm quality:full`, `pnpm smoke:prod`, `pnpm smoke:routes` |
| 2026-05-06 | Added saved extraction portfolio reports | `b22baac` | Production `dpl_BagnfW2URR5KisnQGMrzZDkSazrV` | `pnpm quality:full`, `pnpm smoke:prod`, `pnpm smoke:routes` |
| 2026-05-06 | Added extraction candidate comparison matrix | Current commit | Pending production deploy | `pnpm lint`, `pnpm typecheck` |
| 2026-05-06 | Added optional OpenAI-backed idea extraction with local fallback | Current commit | Pending production deploy | `pnpm quality:full`, local `pnpm smoke:routes` |
| 2026-05-05 | Added artifact source filtering | Current commit | Production | `pnpm quality:full`, `pnpm smoke:prod` |
| 2026-05-05 | Added development handoff history hints | Current commit | Production | `pnpm quality:full`, `pnpm smoke:prod` |
| 2026-05-05 | Added saved filtered implementation handoff artifacts | Current commit | Production | `pnpm quality:full`, `pnpm smoke:prod` |
| 2026-05-05 | Added filtered implementation run prompts | Current commit | Production | `pnpm quality:full`, `pnpm smoke:prod` |
| 2026-05-05 | Added filtered development backlog export | Current commit | Production | `pnpm quality:full`, `pnpm smoke:prod` |
| 2026-05-05 | Added implementation task board filters | Current commit | Production | `pnpm quality:full`, `pnpm smoke:prod` |
| 2026-05-05 | Added blocked-task owner and next-action hints | Current commit | Production | `pnpm quality:full`, `pnpm smoke:prod` |
| 2026-05-05 | Added evidence-priority summary for implementation tasks | Current commit | Production | `pnpm quality:full`, `pnpm smoke:prod` |
| 2026-05-05 | Added release evidence summary to completion reports | Current commit | Production | `pnpm quality:full`, `pnpm smoke:prod` |
| 2026-05-05 | Added implementation-task evidence quality hints | Current commit | Production | `pnpm quality:full`, `pnpm smoke:prod` |
| 2026-05-05 | Added operator release evidence examples | Current commit | Skipped, docs-only | `pnpm quality:full` |
| 2026-05-05 | Added local release-readiness command | Current commit | Skipped, script/docs-only | `pnpm quality:full`, `pnpm release:check` |
| 2026-05-05 | Added app development release safeguards | Current commit | Production | `pnpm quality:full`, `pnpm smoke:prod` |
| 2026-05-05 | Added extraction proceed/research/pivot/kill gates | Current commit | Production | `pnpm quality:full`, `pnpm smoke:prod` |
| 2026-05-05 | Added route smoke checks | Current commit | Skipped, script/docs-only | `pnpm quality:full`, `pnpm smoke:routes` |
| 2026-05-05 | Added phase status ledger | `4745c1b` | Skipped, docs/script-only | `pnpm quality:full` |
| 2026-05-05 | Formalized the agent work loop in repo guidance | `c420fde` | Skipped, docs-only | `pnpm quality:full` |
| 2026-05-05 | Expanded harness file checks | `a3a0c41` | Skipped, script/docs-only | `pnpm quality:full` |
| 2026-05-05 | Added shell priority candidates | `a77de32` | Production | `pnpm quality:full`, `pnpm smoke:prod` |
| 2026-05-05 | Redacted extracted source excerpts before persistence | `7a6a297` | Production | `pnpm quality:full`, `pnpm smoke:prod` |
| 2026-05-05 | Added role prompt pack handoff | `029eeac` | Production | `pnpm quality:full`, `pnpm smoke:prod` |

## Skipped Or Deferred

| Item | Type | Reason | Next Handling |
| --- | --- | --- | --- |
| GitHub Actions workflow push | External blocker | Current GitHub token lacks `workflow` scope | User can grant workflow scope later; local `pnpm quality:full` remains the required gate |
| Browser-level authenticated write smoke execution | Deferred | Authenticated visibility smoke passed; write mode still requires explicit per-run approval and disposable workspace/idea data | Run only after approving write flags, cleanup owner, and disposable test data |
| Telemetry production RLS confirmation | External DB check | The app can deploy without it, but event writes require the `telemetry_events` insert/select policies | Run or confirm `supabase/migrations/20260506010000_add_learning_telemetry.sql` in Supabase |
| Authenticated telemetry smoke execution | Deferred | Requires the operator-held telemetry secret and a disposable idea id; secrets are not pulled into the repo | Run `pnpm smoke:telemetry` from a terminal that has `TELEMETRY_INGEST_SECRET` and `TELEMETRY_SMOKE_IDEA_ID` set |

## Next User Actions

Use `docs/BETA_ENV_AND_SMOKE_BOUNDARY.md` before beta smoke, telemetry smoke, env changes, or deployment evidence collection. The boundary is names-only and forbids `.env.local` readback, secret output, production mutation, deploy trigger, rollback, paid API calls, credential/session handling, and `D:\Projects\AdMate` mutation.

Use `docs/CI_WORKFLOW_SCOPE_BOUNDARY.md` before creating or modifying GitHub Actions. The current posture is `ci_workflow_scope_boundary_docs_only`: no workflow file mutation, no GitHub Actions mutation, local `pnpm quality:full` remains the required gate, and future CI may mirror non-secret checks only.

Authenticated visibility smoke has passed against `https://ai-venture-lab.vercel.app` with disposable Supabase Auth credentials loaded locally and not printed. The run cleared write/create/screenshot flags, performed no workspace/idea creation, and did not run telemetry smoke or production mutations.

Optional: add `OPENAI_API_KEY` and, if desired, `OPENAI_IDEA_MODEL` to Vercel Production to enable server-side AI extraction. Without it, the app automatically falls back to the local rules engine.

Required for learning telemetry writes: confirm `telemetry_events` table and RLS policies from `supabase/migrations/20260506010000_add_learning_telemetry.sql` are applied in Supabase Production.

Completed for external MVP event ingest: `SUPABASE_SERVICE_ROLE_KEY` and `TELEMETRY_INGEST_SECRET` are present in Vercel Production. Keep `TELEMETRY_INGEST_SECRET` only in trusted server environments, never in browser bundles.

## Next Jobs

1. Redesign detailed workbench panels so `사업성 평가`, `기획서 만들기`, `제작 준비`, `성과 확인` read like manager workflows, not developer consoles.
2. Add an executive summary/home state that answers “오늘 무엇을 결정해야 하나?” before any detailed form.
3. Define the RLS allowed/denied smoke plan before cross-workspace or second-account checks.
4. Run authenticated browser write smoke only after explicit per-run approval, using disposable workspace/idea data and a cleanup owner.
5. Run `pnpm smoke:telemetry:funnel` with a disposable idea id and the operator-held telemetry secret when a full product-funnel demo is needed.
6. Prepare GitHub Actions only after workflow-scope access, target branch, permission block, secret policy, and rollback/disable path are approved.
