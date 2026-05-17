# CI Workflow Scope Boundary

Status: WQ-055 app Node runtime matrix passed
Last updated: 2026-05-17
Scope: approved read-only GitHub Actions quality gate; Node24 JavaScript action runtime and Windows 2025 VS2026 image tested early; application build compatibility matrix passed for Node 20 and Node 24; no secrets, deploys, production mutation, authenticated write smoke, telemetry smoke, or Build Relay execution

## Purpose

This note defines the CI boundary for the current deployed runtime at `D:\Codex\venture-lab`.

The repo now has one active GitHub Actions workflow: `.github/workflows/quality.yml`.

The workflow mirrors the local non-secret gate by running `pnpm quality:full` on `windows-2025-vs2026` with `permissions: contents: read`.

The workflow also sets `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: "true"` so JavaScript actions are tested against the upcoming Node24 action runtime before GitHub flips the default.

The application build itself now runs as a two-version matrix:

```yaml
node-version:
  - "20"
  - "24"
```

This distinguishes the GitHub JavaScript action runtime from the Node version used by Next.js, TypeScript, and the app build.

Checkout uses `persist-credentials: false` so the GitHub token is not left in local git config for later steps.

This document and workflow do not change repo secrets, branch protection, GitHub environments, Vercel settings, Supabase settings, production data, or Build Relay permissions.

Validation keywords: `ci_workflow_scope_active`, `workflow_scope_approved`, `quality_workflow_enabled`, `node24_action_runtime_test_enabled`, `windows_2025_vs2026_runner_enabled`, `ci_app_node_matrix_20_24_configured`, `ci_app_node_matrix_passed`, `javascript_action_runtime_separate_from_app_runtime`, `checkout_persist_credentials_false`, `no_secret_output`, `no_production_mutation`.

## Current Runtime Boundary

- `D:\Codex\venture-lab` is the current deployed Git runtime for `https://ai-venture-lab.vercel.app`.
- `D:\Codex\admate-venture-os` remains the canonical planning/product target until a deliberate cutover.
- `D:\Projects\AdMate` remains read-only reference material and must not be mutated by local gates, future CI, Build Relay, or GitHub Actions.

Validation keywords: `current_runtime_source_venture_lab`, `canonical_planning_target_admate_venture_os`, `no_admate_projects_mutation`, `D:\Projects\AdMate`.

## Local Gates First

Local gates remain the release evidence for user-facing changes. CI is an additional drift detector, not a release decision by itself.

| Gate | Command | CI status |
| --- | --- | --- |
| Lint | `pnpm lint` | CI-safe future check |
| Typecheck | `pnpm typecheck` | CI-safe future check |
| Production build | `pnpm build` | CI-safe future check |
| Harness check | `pnpm harness:check` | CI-safe future check |
| Release-readiness check | `pnpm release:check` | CI-safe future check |
| Full local gate | `pnpm quality:full` | Configured in `.github/workflows/quality.yml` on Node 20 and Node 24 |
| Public route smoke | `pnpm smoke:routes` | CI-safe only if it remains no-secret and no-write |
| Production shell smoke | `pnpm smoke:prod` | Manual or protected CI only after target URL policy is reviewed |
| Browser smoke | `pnpm smoke:browser` | Manual by default; future CI only if browser dependency/runtime is stable |
| Auth/write/telemetry smoke | `pnpm smoke:browser:auth`, `pnpm smoke:telemetry` | Not default CI; requires secret/disposable-data approval boundaries |

Validation keywords: `local_quality_gates_first`, `local_quality_full_still_required`, `local_quality_full_is_required_gate`, `pnpm_quality_full_local`, `pnpm_release_check_local`, `ci_mirrors_local_quality_full`.

## Enabled Workflow

Approved workflow file:

```text
.github/workflows/quality.yml
```

Triggers:

- `pull_request`
- `push` to `main`

Exact command for each matrix entry:

```powershell
pnpm quality:full
```

Permission block:

```yaml
permissions:
  contents: read
```

Checkout credential policy:

```yaml
persist-credentials: false
```

Disable path:

- Revert or delete `.github/workflows/quality.yml`.
- Keep local `pnpm quality:full` as the release gate while CI is disabled or failing.
- Do not disable release checker terms unless the workflow is intentionally removed in the same reviewed change.

Validation keywords: `approved_workflow_file_quality_yml`, `single_workflow_file_only`, `pull_request_safe_checks_only`, `push_main_quality_gate`, `contents_read_only`, `permissions_block_contents_read_only`, `checkout_persist_credentials_false`, `no_actions_write`, `no_deployments_write`, `no_id_token`, `no_repo_secrets`, `ci_disable_path_recorded`.

## Current Runner Notices

The first `Quality Gate` run for commit `9b963dd` passed, but GitHub emitted two non-blocking notices:

- Node.js 20 JavaScript actions are deprecated and GitHub plans to force JavaScript actions to Node.js 24 by default starting June 2, 2026.
- `windows-latest` is scheduled to redirect to a newer Windows image by June 15, 2026.

These notices are not launch blockers because the workflow passed and mirrors local `pnpm quality:full`. Treat them as CI maintenance items only.

Do not react to these notices by adding secrets, write permissions, deploy commands, authenticated smoke, telemetry smoke, production mutation, or Build Relay execution to CI.

Validation keywords: `ci_runner_notice_recorded`, `node20_action_notice_nonblocking`, `windows_latest_redirect_notice_nonblocking`, `ci_notice_not_launch_blocker`, `ci_notice_no_scope_expansion`.

## Maintenance Response

The workflow now opts into the upcoming runner conditions without expanding CI scope:

- JavaScript actions: `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: "true"`.
- Windows image: `runs-on: windows-2025-vs2026`.
- Application build runtime: `node-version` matrix with Node 20 and Node 24.

Keep this as a compatibility check only. Do not add `package.json` `engines.node`, change the Vercel Project Settings Node.js version, or treat CI matrix success as a production runtime migration without a separate deployment-impact review.

Validation keywords: `ci_runtime_maintenance_applied`, `force_javascript_actions_to_node24`, `windows_2025_vs2026_image_test`, `ci_app_node_matrix_20_24_configured`, `app_node_20_floor_node_24_forward_check_configured`, `no_runtime_selection_change`, `no_ci_scope_expansion`.

The matrix was promoted to `ci_app_node_matrix_passed` after pushed GitHub Actions run `25985698631` passed both Node 20 and Node 24 jobs for commit `9f0a163`.

Validation keywords: `ci_app_node_matrix_pass_requires_github_run`, `matrix_evidence_summary_only`, `ci_app_node_matrix_passed`, `ci_app_node_matrix_run_25985698631`, `node_20_matrix_job_passed`, `node_24_matrix_job_passed`.

## Future CI Expansion

Any future CI expansion beyond `pnpm quality:full` needs a new reviewed change.

Allowed future candidates:

- public route smoke only if it remains no-secret and no-write,
- browser smoke only if browser runtime stability and screenshot privacy are reviewed,
- package-level `engines.node` only after Vercel deployment impact is reviewed,
- status reporting or branch protection only after explicit user approval.

Validation keywords: `future_ci_expansion_requires_review`, `node_runtime_revisit_triggers`, `no_default_ci_expansion`.

## CI-Forbidden Checks

Do not run these in default CI:

- authenticated write smoke,
- workspace creation smoke,
- telemetry smoke with `TELEMETRY_INGEST_SECRET`,
- deploy trigger,
- rollback,
- production SQL,
- real Supabase Auth or DB mutation,
- paid API calls,
- credential, cookie, session, token, signed URL, or `.env.local` handling,
- Build Relay source-root writes, commits, pushes, PRs, or deploys,
- `D:\Projects\AdMate` mutation.

Validation keywords: `no_authenticated_write_smoke_in_ci`, `no_telemetry_secret_in_ci`, `no_env_local_readback`, `no_secret_output`, `no_deploy_trigger`, `no_rollback`, `no_production_mutation`.

`pnpm release:check` also fails if `.github/workflows` contains any workflow file other than `quality.yml`, if `quality.yml` contains obvious forbidden patterns such as `secrets.`, write permissions, `id-token: write`, telemetry smoke, authenticated browser smoke, deploy/rollback commands, Supabase CLI commands, or service-role/OpenAI/telemetry secret names, or if the workflow permissions block contains anything other than `contents: read`.

Validation keywords: `workflow_forbidden_pattern_guard`, `single_workflow_file_guard`, `no_workflow_secrets_reference`.

## Evidence Rule

CI evidence may include:

- workflow or local command name,
- branch/commit,
- run URL if available,
- pass/fail status,
- short failure summary,
- skipped checks and why.

CI evidence must not include:

- raw logs with secrets,
- `.env.local` contents,
- repository secrets,
- Vercel, Supabase, OpenAI, telemetry, browser-smoke, cookie, session, bearer, or signed URL values,
- private screenshots or private workspace data.

Validation keywords: `ci_evidence_summary_only`, `no_raw_ci_logs`, `no_secret_output`.

## Failure Handling

A failed local gate or future CI run creates a blocker or implementation evidence item. It does not automatically:

- merge code,
- mark release ready,
- approve source-truth changes,
- trigger Build Relay execution,
- trigger deploy or rollback,
- edit PRD/MVP/risk/decision artifacts.

Validation keywords: `no_auto_merge`, `no_source_truth_writeback`, `no_build_relay_execution_permission`.

## Change Prerequisites

Before changing GitHub Actions again, record:

- approved workflow file path,
- target branch and trigger,
- exact commands,
- required Node/pnpm setup,
- permission block,
- secret policy,
- smoke target policy,
- failure owner,
- disable or rollback path.

Validation keywords: `workflow_change_requires_review`, `failure_owner_operator`, `disable_path_required`.
