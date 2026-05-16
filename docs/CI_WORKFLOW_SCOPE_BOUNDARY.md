# CI Workflow Scope Boundary

Status: WQ-037 CI workflow scope boundary
Last updated: 2026-05-16
Scope: docs-only; no GitHub Actions mutation

## Purpose

This note defines the CI boundary for the current deployed runtime at `D:\Codex\venture-lab`.

There is no active GitHub Actions workflow in this repo right now. The current safe gate is local execution of the deterministic scripts in `package.json`, especially `pnpm quality:full`.

This document does not create, edit, delete, or push `.github/workflows/*`; mutate GitHub Actions settings; change repo secrets; change branch protection; trigger deploys; run production mutations; or grant Build Relay execution permission.

Validation keywords: `ci_workflow_scope_boundary_docs_only`, `workflow_scope_blocked`, `no_workflow_file_mutation`, `no_github_actions_mutation`.

## Current Runtime Boundary

- `D:\Codex\venture-lab` is the current deployed Git runtime for `https://ai-venture-lab.vercel.app`.
- `D:\Codex\admate-venture-os` remains the canonical planning/product target until a deliberate cutover.
- `D:\Projects\AdMate` remains read-only reference material and must not be mutated by local gates, future CI, Build Relay, or GitHub Actions.

Validation keywords: `current_runtime_source_venture_lab`, `canonical_planning_target_admate_venture_os`, `no_admate_projects_mutation`, `D:\Projects\AdMate`.

## Local Gates First

Until GitHub workflow-scope access and a reviewed workflow are available, local gates remain the release evidence.

| Gate | Command | CI status |
| --- | --- | --- |
| Lint | `pnpm lint` | CI-safe future check |
| Typecheck | `pnpm typecheck` | CI-safe future check |
| Production build | `pnpm build` | CI-safe future check |
| Harness check | `pnpm harness:check` | CI-safe future check |
| Release-readiness check | `pnpm release:check` | CI-safe future check |
| Full local gate | `pnpm quality:full` | Required local substitute for CI |
| Public route smoke | `pnpm smoke:routes` | CI-safe only if it remains no-secret and no-write |
| Production shell smoke | `pnpm smoke:prod` | Manual or protected CI only after target URL policy is reviewed |
| Browser smoke | `pnpm smoke:browser` | Manual by default; future CI only if browser dependency/runtime is stable |
| Auth/write/telemetry smoke | `pnpm smoke:browser:auth`, `pnpm smoke:telemetry` | Not default CI; requires secret/disposable-data approval boundaries |

Validation keywords: `local_quality_gates_first`, `local_quality_full_is_required_gate`, `pnpm_quality_full_local`, `pnpm_release_check_local`, `future_ci_mirrors_local_gates`.

## Workflow-Scope Blocker

GitHub Actions workflow files require explicit workflow-scope access and user approval before creation or mutation.

Do not attempt to add or modify workflow files unless all are true:

- user explicitly approves workflow creation or mutation,
- GitHub token or connector has workflow-scope permission,
- target repo and branch are confirmed,
- CI checks are limited to approved non-secret gates,
- branch/PR behavior is understood,
- secret policy is documented,
- rollback or disable path is documented.

Validation keywords: `workflow_scope_required`, `workflow_scope_blocked`.

## Future CI Allowed Shape

Future CI may mirror local non-secret gates:

- install dependencies with the package manager already used by the repo,
- run `pnpm lint`,
- run `pnpm typecheck`,
- run `pnpm harness:check`,
- run `pnpm release:check`,
- run `pnpm build`,
- optionally run `pnpm smoke:routes` when the target is public and no credentials are required.

Recommended default GitHub permissions:

```yaml
permissions:
  contents: read
```

Do not add write permissions by default.

Validation keywords: `pull_request_safe_checks_only`, `contents_read_only`, `no_actions_write`, `no_deployments_write`, `no_id_token`, `no_repo_secrets`.

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

## Enablement Prerequisites

Before enabling GitHub Actions, record:

- approved workflow file path,
- target branch and trigger,
- exact commands,
- required Node/pnpm setup,
- permission block,
- secret policy,
- smoke target policy,
- failure owner,
- disable or rollback path.

Until these are recorded, keep using local gates.
