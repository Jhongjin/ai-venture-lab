# Public Beta Launch Gate

Status: controlled beta ship approved
Last updated: 2026-05-17
Scope: launch decision summary only; no deployment, env mutation, SQL, Auth/DB mutation, or secret readback

## Purpose

This gate separates technical smoke evidence from the actual launch decision after authenticated write smoke, RLS allowed/denied smoke, and telemetry smoke have passed with disposable fixtures.

Use `docs/PUBLIC_BETA_LAUNCH_EVIDENCE_PACKET.md` as the operator-facing source of truth for the controlled beta decision.

Validation keywords: `public_beta_launch_gate`, `controlled_beta_ship_approved`, `launch_gate_decision_ship`, `summary_only_launch_evidence`, `no_secret_output`.

## Current Gate Status

Current decision:

```text
launch_gate_decision: ship
decision_scope: controlled_beta
```

Technical state for the checked surfaces:

- `pnpm quality:full` passed after beta evidence and cleanup gate updates.
- `pnpm smoke:prod`, `pnpm smoke:routes`, and `pnpm smoke:browser` passed against `https://ai-venture-lab.vercel.app`.
- Authenticated write smoke passed with explicit approval and disposable data.
- RLS allowed/denied browser smoke passed with anonymous denied, disposable A/B allowed, and cross-workspace denied checks.
- Telemetry ingest and funnel smoke passed after `TELEMETRY_INGEST_SECRET` rotation and redeploy.
- Vercel production inspect recorded Ready deployment `dpl_72EhMSpuaz8r4PcjvPZ7uHipa8Sa` as the last-known-good rollback target.

Validation keywords: `quality_full_passed`, `production_smoke_passed`, `authenticated_write_smoke_passed`, `rls_allowed_denied_browser_smoke_passed`, `telemetry_smoke_passed_after_rotation`, `last_known_good_deployment_recorded`.

## Ship Evidence

| Evidence | Current state |
| --- | --- |
| Cleanup disposition | `cleanup_disposition_closed` |
| High-risk acceptance | `risk_acceptance_recorded_for_controlled_beta` |
| Artifact approvals | `artifact_approval_approved_for_controlled_beta` |
| Rollback evidence | `rollback_evidence_recorded` |
| External telemetry runtime rotation scope | `external_runtime_rotation_scope_none_or_completed` |
| QA signoff | `qa_signoff_approved_for_controlled_beta` |
| Security/privacy signoff | `security_privacy_signoff_approved_for_controlled_beta` |

Validation keywords: `ship_evidence_ledger`, `cleanup_disposition_closed`, `risk_acceptance_recorded_for_controlled_beta`, `artifact_approval_approved_for_controlled_beta`, `rollback_evidence_recorded`, `external_runtime_rotation_scope_none_or_completed`, `qa_signoff_approved_for_controlled_beta`, `security_privacy_signoff_approved_for_controlled_beta`.

## Beta Constraints

This is a controlled beta, not a broad public launch:

- Use beta-only accounts and controlled invites.
- Do not collect real PII or customer-confidential data intentionally.
- Do not present AI output as medical, legal, financial, employment, therapy, or other regulated advice.
- Keep retained smoke fixtures synthetic and reusable only for testing.
- Keep launch evidence summary-only.
- Rerun RLS/telemetry/write smoke if the relevant policy, env, endpoint, or fixture boundary changes.

Validation keywords: `controlled_beta_ship_scope`, `no_real_pii_beta_scope`, `regulated_advice_scoped_out`, `summary_only_launch_evidence`.

## Non-Blocking Follow-Up

These do not block the current controlled beta ship decision:

- GitHub Actions now runs a read-only `pnpm quality:full` workflow as a drift detector. Local `pnpm quality:full` and production smoke remain the release evidence for user-facing changes.
- App build compatibility is configured for Node 20 and Node 24 in CI, but this is not a production runtime migration. `engines.node` and Vercel Project Settings remain unchanged by this gate.
- `OPENAI_API_KEY` and `OPENAI_IDEA_MODEL` remain optional because server-side extraction falls back to local rules.
- Cleanup automation is intentionally not implemented; cleanup is user-owned when it requires SQL, dashboard mutation, Auth deletion, service-role access, or external runtime mutation.
- RLS fixtures may be retained for reruns as long as they stay synthetic and are not used for primary operator work.

Validation keywords: `github_actions_non_blocking_for_controlled_beta`, `ci_app_node_matrix_20_24_configured`, `no_runtime_selection_change`, `openai_key_optional_with_local_fallback`, `cleanup_automation_not_required`, `rls_fixture_retention_allowed`.

## Evidence Boundary

Launch evidence can include command names, target URL, pass/fail state, high-level skipped checks, cleanup owner/status, deploy references, and commit hashes.

Launch evidence must not include secret values, `.env.local` contents, browser passwords, cookies, sessions, bearer tokens, service-role keys, signed URLs, raw private payloads, raw SQL results, or screenshots containing private workspace data.

Validation keywords: `launch_evidence_summary_only`, `no_raw_private_payloads`, `no_env_values_in_launch_evidence`.
