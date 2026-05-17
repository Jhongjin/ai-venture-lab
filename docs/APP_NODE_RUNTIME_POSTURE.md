# App Node Runtime Posture

Status: WQ-054 app Node runtime matrix configured
Last updated: 2026-05-17
Scope: application build runtime evidence only; no `package.json` engine pin, no Vercel Project Setting mutation, no deployment trigger, no production env mutation, no secrets, no authenticated write smoke, and no telemetry smoke

## Purpose

This note separates three things that are easy to mix up:

- JavaScript action runtime: the Node version GitHub Actions uses to run actions such as checkout, pnpm setup, and setup-node.
- Application build runtime: the Node version used by `pnpm quality:full`, `pnpm build`, and Next.js tooling.
- Vercel production runtime: the Node version selected by Vercel project settings or by `package.json` `engines.node`.

Validation keywords: `app_node_runtime_posture`, `javascript_action_runtime_separate_from_app_runtime`, `vercel_runtime_separate_from_ci_runtime`, `no_engine_pin_added`, `no_vercel_setting_mutation`.

## Current Evidence

| Surface | Current posture |
| --- | --- |
| Next.js package | `next@16.2.4` |
| Next.js minimum Node | `20.9` from the local installed Next.js docs at `node_modules/next/dist/docs/01-app/01-getting-started/01-installation.md` |
| Local shell runtime | `node -v` returned `v24.14.0` on 2026-05-17 |
| Repo runtime pin | No `.nvmrc`, `.node-version`, `vercel.json`, or `package.json` `engines.node` pin was found |
| CI action runtime | `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: "true"` |
| CI runner image | `windows-2025-vs2026` |
| CI app build runtime | Node 20 and Node 24 matrix configured to run the same `pnpm quality:full` command |

Validation keywords: `next_16_min_node_20_9`, `local_node_24_evidence_recorded`, `no_repo_node_runtime_pin_found`, `ci_app_node_matrix_20_24_configured`, `same_quality_full_command_for_each_node`.

## Decision

Use a read-only CI matrix for application build compatibility:

```yaml
matrix:
  node-version:
    - "20"
    - "24"
```

This keeps Node 20 as the conservative floor while also testing Node 24, which matches the local shell runtime and is one of the Node majors available on Vercel.

This decision does not set `package.json` `engines.node` and does not change the Vercel project Node.js setting. Those are runtime selection decisions and should be made only after a separate deployment-impact review.

Validation keywords: `app_node_matrix_decision`, `node_20_floor_node_24_forward_check_configured`, `no_runtime_selection_change`, `package_engines_node_not_added`, `vercel_project_node_setting_not_changed`.

## Evidence Promotion Rule

Do not mark this posture as passed until a GitHub Actions `Quality Gate` run shows both Node 20 and Node 24 matrix jobs passing for a pushed commit.

After that run passes, record summary-only evidence with the run id, commit hash, pass state, and skipped checks. Do not paste raw logs.

Validation keywords: `ci_app_node_matrix_pass_requires_github_run`, `matrix_evidence_summary_only`, `ci_app_node_matrix_pass_not_yet_recorded`.

## When To Revisit

Revisit this posture before any of these changes:

- adding `engines.node` to `package.json`,
- changing the Vercel Project Settings Node.js version,
- upgrading Next.js, React, Supabase, Playwright, or the package manager major version,
- adding native dependencies that may behave differently across Node majors,
- moving browser, auth/write, RLS, or telemetry smoke into CI.

Validation keywords: `node_runtime_revisit_triggers`, `engines_node_requires_review`, `vercel_node_setting_requires_review`, `dependency_major_upgrade_requires_runtime_review`.

## Safety Boundary

Default CI may test Node compatibility but must not:

- read or print secrets,
- mutate Vercel, Supabase, GitHub, or production data,
- run authenticated write smoke,
- run telemetry smoke,
- create workspaces, ideas, or fixtures,
- deploy, promote, or roll back production,
- mutate `D:\Projects\AdMate`.

Validation keywords: `node_matrix_no_secret_policy`, `node_matrix_no_production_mutation`, `node_matrix_no_authenticated_write_smoke`, `node_matrix_no_telemetry_smoke`, `node_matrix_no_admate_projects_mutation`.
