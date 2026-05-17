# Phase Status

Use this file as the lightweight phase ledger for the agent work loop.

## Current Phase

- Phase: Controlled beta launch evidence
- Goal: Keep controlled beta launch evidence, constraints, rollback, and rerun gates current.
- Status: `ship` for controlled beta

## Loop Rules

1. Complete one coherent job.
2. Report what changed, what was skipped, validation results, commit, deployment state, and next job.
3. Commit and push repository changes.
4. Deploy user-facing changes and run production smoke.
5. Skip optional work when the current phase can advance without it.
6. Carry non-skippable external work as a named user action, then continue unblocked work.

## Previously Completed Core Scope

- Completed on: 2026-05-06
- Covered scope: idea extraction and validation gates, saved extraction portfolio reports, validation evidence coaching, PRD handoff, MVP slicing, Korean UX, app planning/design/development orchestration, development kickoff guardrails, implementation run packages, implementation task board, evidence quality gates, filtered task handoffs, artifact approval reviews, release decision packets, MVP build command packets, QA acceptance matrices, post-launch learning loops, versioned runbook artifacts, local release checks, Vercel production smoke.
- Remaining items are not blocking this phase because they require external access, optional AI tuning, or rerun-gated beta automation.

## Launch Gate Snapshot

| Field | Current value |
| --- | --- |
| Owner | Operator |
| Date | 2026-05-17 |
| Production target | `https://ai-venture-lab.vercel.app` |
| Technical smoke | Passed for `quality:full`, production shell/routes/browser, authenticated write smoke, RLS allowed/denied smoke, and telemetry smoke |
| Decision | `launch_gate_decision: ship` |
| Cleanup evidence | `cleanup_disposition_closed`; write-smoke and RLS fixtures are `retained_for_rerun`, telemetry/screenshot cleanup is `not_applicable` |
| Risk evidence | High beta-relevant risks are accepted, mitigated, or scoped out for controlled beta |
| Artifact approval evidence | PRD, MVP spec, design brief, and tech spec are approved for controlled beta scope |
| QA/security evidence | QA and security/privacy signoff are approved for controlled beta scope |
| Rollback evidence | Last-known-good deployment `dpl_72EhMSpuaz8r4PcjvPZ7uHipa8Sa`; owner Operator; rollback trigger/action recorded |
| Next decision | Controlled beta can proceed under the recorded constraints |

Validation keywords: `launch_gate_decision_ship`, `launch_gate_snapshot_recorded`, `cleanup_disposition_closed`, `risk_acceptance_recorded_for_controlled_beta`, `rollback_evidence_recorded_before_ship`, `last_known_good_deployment_recorded`.

## Completed Jobs

| Date | Job | Commit | Deploy | Validation |
| --- | --- | --- | --- | --- |
| 2026-05-17 | Tested upcoming CI runtime/image path | Current commit | GitHub Actions only; no runtime deploy intended | `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24`, `windows-2025-vs2026`, no CI scope expansion |
| 2026-05-17 | Recorded CI runner/action notices | Current commit | Docs/check-script only; no runtime deploy intended | `Quality Gate` run `25984007955` passed; Node.js 20 action runtime and `windows-latest` redirect notices recorded as non-blocking maintenance risk |
| 2026-05-17 | Enabled read-only GitHub Actions quality gate | Current commit | Git push may still trigger Vercel auto-deploy through the connected production project; workflow itself does not deploy | `.github/workflows/quality.yml`, `pnpm release:check`, `pnpm quality:full`, CI boundary readback, forbidden workflow pattern guard |
| 2026-05-17 | Approved controlled beta ship evidence | Current commit | Production LKG `dpl_72EhMSpuaz8r4PcjvPZ7uHipa8Sa`; docs/check-script only in repo | Vercel inspect, `pnpm quality:full`, launch evidence packet, rollback evidence |
| 2026-05-17 | Added launch evidence packet and ship guard | Current commit | Skipped, docs/check-script only; no runtime deploy | launch/security subagent review, `pnpm harness:check`, `pnpm release:check`, ship-state consistency check, docs/templates obvious-secret pattern scan |
| 2026-05-17 | Added public beta launch evidence packet | Current commit | Skipped, docs/check-script only; no runtime deploy | launch evidence packet readback, `pnpm harness:check`, `pnpm release:check` |
| 2026-05-17 | Added controlled beta launch gate summary | Current commit | Skipped, docs/check-script only; no runtime deploy | launch gate review, `pnpm harness:check`, `pnpm release:check` |
| 2026-05-17 | Added disposable smoke cleanup runbook | Current commit | Skipped, docs/check-script only; no runtime deploy | subagent cleanup review, `pnpm harness:check`, `pnpm release:check`, `pnpm quality:full` |
| 2026-05-17 | Aligned beta evidence docs with passed auth/RLS/telemetry gates | Current commit | Skipped, docs/check-script only; no runtime deploy | stale keyword grep, `pnpm quality:full`, `pnpm smoke:prod`, `pnpm smoke:routes`, `pnpm smoke:browser` |
| 2026-05-17 | Closed telemetry secret rotation blocker | `8ba6b0b` | Vercel Production redeployed after env rotation | `pnpm smoke:telemetry`, `pnpm smoke:telemetry:funnel`, no secret value recorded |
| 2026-05-17 | Recorded RLS allowed/denied browser evidence | `4bba176` | Smoke-only/no app redeploy | `pnpm smoke:browser:rls`, anonymous denied, A/B allowed, A->B/B->A denied |
| 2026-05-17 | Stabilized authenticated write smoke | `f05e1d8` | Production alias after deploy | `pnpm lint`, `pnpm typecheck`, `pnpm build`, `pnpm smoke:prod`, `pnpm smoke:routes`, `pnpm smoke:browser`, `pnpm smoke:browser:auth` |
| 2026-05-16 | WQ-047 refreshed public beta manager checklist | Current commit | Skipped, docs-only/no runtime change | checklist readback, `pnpm release:check`, subagent beta closeout review |
| 2026-05-16 | WQ-046 ran manager workspace regression and copy cleanup | Current commit | Production auto-deploy after push | `pnpm lint`, `pnpm typecheck`, `pnpm build`, `pnpm release:check`, local `pnpm smoke:routes`, local `pnpm smoke:browser`, subagent QA/copy review, Playwright desktop/mobile visual check, production `pnpm smoke:prod`, `pnpm smoke:routes`, `pnpm smoke:browser`, production Playwright copy check |
| 2026-05-16 | WQ-045 refined detailed workbench manager language | Current commit | Production auto-deploy after push | `pnpm lint`, `pnpm typecheck`, `pnpm build`, local `pnpm smoke:routes`, local `pnpm smoke:browser`, subagent copy review, production `pnpm smoke:prod`, `pnpm smoke:routes`, `pnpm smoke:browser` |
| 2026-05-16 | WQ-044 added manager-facing executive decision panel | Current commit | Production auto-deploy after push | `pnpm lint`, `pnpm typecheck`, `pnpm build`, local `pnpm smoke:routes`, local `pnpm smoke:browser`, Playwright desktop/mobile visual check, production `pnpm smoke:prod`, `pnpm smoke:routes`, `pnpm smoke:browser` |
| 2026-05-16 | WQ-042 added disposable RLS fixture handoff | Current commit | Skipped, docs-only/no execution | Fixture handoff keyword checks, `pnpm release:check` |
| 2026-05-16 | WQ-041 reviewed Supabase RLS policy posture | Current commit | Skipped, static SQL/docs-only | SQL policy readback, posture keyword checks, `pnpm release:check` |
| 2026-05-16 | WQ-040 added blocked-safe RLS smoke runner scaffold | Current commit | Skipped, script/docs-only | `node --check`, `pnpm smoke:browser:rls:preflight`, `pnpm release:check`, `pnpm lint`, `pnpm typecheck` |
| 2026-05-16 | WQ-039 documented RLS allowed/denied smoke plan | Current commit | Skipped, docs-only/no deploy | Docs readback for plan, evidence fields, stop conditions, no mutation |
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
| GitHub Actions runner/action notices | Monitoring | First `Quality Gate` run passed, but GitHub warned about Node.js 20 JavaScript action deprecation and `windows-latest` image redirection | Review in a future CI maintenance queue; do not expand CI scope or add secrets/deploys while addressing |
| GitHub Actions workflow push | Completed | User approved workflow creation; `.github/workflows/quality.yml` mirrors `pnpm quality:full` with `permissions: contents: read` | Keep CI no-secret/no-deploy; local `pnpm quality:full` and production smoke remain required release evidence |
| Browser-level authenticated write smoke execution | Completed | Explicit per-run approval was granted and disposable workspace/idea data was used | Rerun only with explicit approval, disposable data, and cleanup ownership |
| RLS allowed/denied smoke execution | Completed | Two disposable accounts and two private workspace labels passed anonymous/allowed/denied checks | Rerun when fixtures, RLS policy, migration, or workspace access code changes |
| Production RLS migration confirmation | Completed | Production posture was checked before denied smoke: required private-read migrations were present, old public-read policies were absent, and RLS was enabled on core tables | Rerun posture checks when migrations or policies change |
| Telemetry production smoke execution | Completed | Post-rotation telemetry ingest and funnel smoke passed with a disposable idea id | Rerun when telemetry env, endpoint behavior, or telemetry RLS policies change |
| Authenticated telemetry smoke execution | Completed | Production telemetry smoke and funnel smoke passed after `TELEMETRY_INGEST_SECRET` rotation and redeploy, using a disposable idea id and summary-only evidence | Rerun only when telemetry env, endpoint behavior, or telemetry RLS policies change |

## Next User Actions

Use `docs/BETA_ENV_AND_SMOKE_BOUNDARY.md` before beta smoke, telemetry smoke, env changes, or deployment evidence collection. The boundary is names-only and forbids `.env.local` readback, secret output, production mutation, deploy trigger, rollback, paid API calls, credential/session handling, and `D:\Projects\AdMate` mutation.

Use `docs/CI_WORKFLOW_SCOPE_BOUNDARY.md` before modifying GitHub Actions. The current posture is `ci_workflow_scope_active`: `.github/workflows/quality.yml` mirrors `pnpm quality:full` with `permissions: contents: read`, no secrets, no deploys, no authenticated write smoke, no telemetry smoke, and no production mutation.

Authenticated visibility and explicit write smoke have passed against `https://ai-venture-lab.vercel.app` with disposable Supabase Auth credentials loaded locally and not printed. The write run used disposable data and summary-only evidence.

Use `docs/RLS_ALLOWED_DENIED_SMOKE_PLAN.md`, `docs/SUPABASE_RLS_POLICY_POSTURE_REVIEW.md`, `docs/RLS_DISPOSABLE_FIXTURE_HANDOFF.md`, and `pnpm smoke:browser:rls:preflight` before rerunning any cross-workspace, second-account, or denied-case smoke. Current RLS allowed/denied evidence has passed with disposable account/workspace fixtures and summary-only evidence.

Optional: add `OPENAI_API_KEY` and, if desired, `OPENAI_IDEA_MODEL` to Vercel Production to enable server-side AI extraction. Without it, the app automatically falls back to the local rules engine.

Learning telemetry writes have passed post-rotation smoke with a disposable idea id. Reconfirm `telemetry_events` table posture and RLS policies only when telemetry migrations, endpoint behavior, or production environment settings change.

Completed for external MVP event ingest: `SUPABASE_SERVICE_ROLE_KEY` and rotated `TELEMETRY_INGEST_SECRET` are present in Vercel Production. Keep `TELEMETRY_INGEST_SECRET` only in trusted server environments, never in browser bundles. Post-rotation `pnpm smoke:telemetry` and `pnpm smoke:telemetry:funnel` passed with disposable idea data and no secret value recorded.

Use `docs/SMOKE_DATA_CLEANUP_RUNBOOK.md` to record whether disposable write-smoke data, reusable RLS fixture pairs, telemetry smoke events, and any local screenshots are `completed_cleanup`, `retained_for_rerun`, or `not_applicable`. Current cleanup posture: `smoke_cleanup_user_action_recorded`, `cleanup_status_not_applicable_or_owner_confirmed`, `cleanup_disposition_closed`.

Use `docs/PUBLIC_BETA_LAUNCH_GATE.md` before changing the controlled beta decision. Current launch gate keywords: `public_beta_launch_gate`, `launch_gate_decision_ship`, `cleanup_disposition_closed`.

Use `docs/PUBLIC_BETA_LAUNCH_EVIDENCE_PACKET.md` as the controlled beta decision packet. Current evidence-packet keywords: `public_beta_launch_evidence_packet`, `final_operator_decision_ship`, `last_known_good_deployment_recorded`.

## Next Jobs

1. Continue manager-facing polish for deeper generated markdown previews only if beta testers still see developer-heavy language in full mode.
2. Keep RLS allowed/denied evidence summary-only and rerun only when disposable fixtures or RLS policies change.
3. Rerun telemetry smoke only when telemetry env, endpoint behavior, or telemetry RLS policies change.
4. Run authenticated browser write smoke only after explicit per-run approval, using disposable workspace/idea data and a cleanup owner.
5. Modify GitHub Actions only after a new approval records target branch, permission block, secret policy, failure owner, and rollback/disable path.
