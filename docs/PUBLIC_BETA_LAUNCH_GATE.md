# Public Beta Launch Gate

Status: launch evidence pending
Last updated: 2026-05-17
Scope: launch decision summary only; no deployment, env mutation, SQL, Auth/DB mutation, or secret readback

## Purpose

This gate separates technical smoke evidence from the actual launch decision after authenticated write smoke, RLS allowed/denied smoke, and telemetry smoke have passed with disposable fixtures.

Use `docs/PUBLIC_BETA_LAUNCH_EVIDENCE_PACKET.md` as the operator-facing decision packet before changing the decision from `research_more` to `ship`.

Validation keywords: `public_beta_launch_gate`, `launch_gate_evidence_pending`, `launch_gate_decision_research_more`, `summary_only_launch_evidence`, `no_secret_output`.

## Current Gate Status

Current decision:

```text
launch_gate_decision: research_more
```

Technical state for the checked surfaces:

- `pnpm quality:full` passed after beta evidence and cleanup gate updates.
- `pnpm smoke:prod`, `pnpm smoke:routes`, and `pnpm smoke:browser` passed against `https://ai-venture-lab.vercel.app`.
- Authenticated write smoke passed with explicit approval and disposable data.
- RLS allowed/denied browser smoke passed with anonymous denied, disposable A/B allowed, and cross-workspace denied checks.
- Telemetry ingest and funnel smoke passed after `TELEMETRY_INGEST_SECRET` rotation and redeploy.
- Release readiness and harness checks now require beta evidence, RLS posture, and smoke cleanup boundaries.

Validation keywords: `quality_full_passed`, `production_smoke_passed`, `authenticated_write_smoke_passed`, `rls_allowed_denied_browser_smoke_passed`, `telemetry_smoke_passed_after_rotation`.

## Blocking Items

No code/runtime blocker is recorded for the checked smoke paths, but broader beta launch is blocked until the launch evidence below is closed:

1. A secret appears in chat, docs, screenshots, logs, artifacts, browser output, or relay packets.
2. Disposable smoke data cannot be classified as `completed_cleanup`, `retained_for_rerun`, or `not_applicable`.
3. External MVP or server runtimes still use a disclosed telemetry ingest secret.
4. RLS policies, production migrations, workspace access code, or disposable fixtures change without rerunning posture and allowed/denied smoke.
5. New sensitive product claims are added without updating `docs/RISK_REGISTER.md` and `docs/SECURITY_PRIVACY.md`.
6. High beta-relevant risks are not accepted, mitigated, or explicitly scoped out.
7. PRD, MVP spec, design brief, and tech spec approvals are not recorded as launch evidence.
8. Last-known-good deployment, rollback owner, and rollback trigger are not recorded for the launch decision.

Validation keywords: `technical_smoke_paths_passed`, `broader_beta_blocked_until_evidence_closed`, `secret_disclosure_blocks_beta`, `cleanup_status_required_before_broader_beta`, `risk_acceptance_required_before_ship`, `artifact_approval_evidence_required`, `rollback_evidence_required`, `external_runtime_secret_rotation_required`, `rls_change_requires_rerun`.

## Unresolved Evidence Ledger

| Evidence | Current state | Blocks `ship` |
| --- | --- | --- |
| Cleanup disposition | `cleanup_disposition_unresolved` | Yes |
| High-risk acceptance | `risk_acceptance_unresolved` | Yes |
| Artifact approvals | `artifact_approval_unresolved` | Yes |
| Rollback evidence | `rollback_evidence_unresolved` | Yes |
| External telemetry runtime rotation scope | `external_runtime_secret_rotation_unverified` | Yes if any external runtime used the disclosed secret |
| QA signoff | `qa_signoff_unresolved` | Yes |
| Security/privacy signoff | `security_privacy_signoff_unresolved` | Yes |

Validation keywords: `launch_gate_unresolved_evidence_ledger`, `cleanup_disposition_unresolved`, `risk_acceptance_unresolved`, `artifact_approval_unresolved`, `rollback_evidence_unresolved`, `external_runtime_secret_rotation_unverified`, `qa_signoff_unresolved`, `security_privacy_signoff_unresolved`.

## Required To Move To Ship

Record these before changing the decision from `research_more` to `ship`:

| Evidence | Required state |
| --- | --- |
| Cleanup disposition | Every disposable smoke surface is `completed_cleanup`, `retained_for_rerun`, or `not_applicable`; `pending_cleanup` blocks broader beta. |
| Risk register | High beta-relevant risks are `Mitigated`, `Accepted for beta scope`, or explicitly marked non-blocking with an owner. |
| Artifact approvals | PRD, MVP spec, design brief, and tech spec approvals are recorded or deliberately scoped out for the beta slice. |
| Rollback | Last-known-good deployment, rollback owner, rollback trigger, and rollback command or Vercel action are recorded. |
| QA signoff | QA signoff is recorded or explicitly deferred for the beta slice. |
| Security/privacy signoff | Security/privacy signoff is recorded or explicitly deferred for the beta slice. |
| Final decision | `launch_gate_decision: ship` is recorded with date, owner, commit, production target, and smoke results. |

Validation keywords: `ship_requires_cleanup_disposition`, `ship_requires_risk_acceptance`, `ship_requires_artifact_approval_evidence`, `ship_requires_rollback_evidence`, `ship_requires_final_decision_owner`.

The evidence packet must keep `pending_user_decision` markers until the operator answers the open launch questions. Those markers block `ship` but do not invalidate the technical smoke evidence.

Validation keywords: `public_beta_launch_evidence_packet`, `pending_user_decision_blocks_ship`, `technical_smoke_evidence_still_valid`.

## Non-Blocking Follow-Up

These do not block the current controlled beta gate:

- GitHub Actions workflow creation remains blocked by workflow-scope access; local `pnpm quality:full` remains the gate.
- `OPENAI_API_KEY` and `OPENAI_IDEA_MODEL` remain optional because server-side extraction falls back to local rules.
- Cleanup automation is intentionally not implemented; cleanup is user-owned when it requires SQL, dashboard mutation, Auth deletion, service-role access, or external runtime mutation.
- RLS fixtures may be retained for reruns as long as they stay synthetic and are not used for primary operator work.

Validation keywords: `github_actions_non_blocking_for_controlled_beta`, `openai_key_optional_with_local_fallback`, `cleanup_automation_not_required`, `rls_fixture_retention_allowed`.

## Evidence Boundary

Launch evidence can include command names, target URL, pass/fail state, high-level skipped checks, cleanup owner/status, deploy references, and commit hashes.

Launch evidence must not include secret values, `.env.local` contents, browser passwords, cookies, sessions, bearer tokens, service-role keys, signed URLs, raw private payloads, raw SQL results, or screenshots containing private workspace data.

Validation keywords: `launch_evidence_summary_only`, `no_raw_private_payloads`, `no_env_values_in_launch_evidence`.
