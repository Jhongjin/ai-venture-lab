# Public Beta Launch Evidence Packet

Status: controlled beta ship approved
Last updated: 2026-05-17
Scope: operator decision packet only; no deployment, env mutation, SQL, Auth/DB mutation, secret readback, or private payload evidence

## Purpose

This packet records the evidence and operator decision for a controlled beta launch.

It is not a full public launch approval. It approves a restricted beta scope with disposable smoke fixtures retained for reruns, sensitive domains scoped out, and rollback evidence recorded.

Validation keywords: `public_beta_launch_evidence_packet`, `controlled_beta_ship_approved`, `operator_decision_packet_only`, `summary_only_launch_evidence`.

## Current Decision

```text
launch_gate_decision: ship
decision_scope: controlled_beta
decision_owner: Operator
decision_date: 2026-05-17
production_target: https://ai-venture-lab.vercel.app
latest_recorded_gate_commit_before_ship: 7d77030
last_known_good_deployment_id: dpl_72EhMSpuaz8r4PcjvPZ7uHipa8Sa
last_known_good_deployment_url: https://ai-venture-kdedtm2ga-jeonhongjins-projects.vercel.app
```

Reason: technical smoke paths passed, disposable fixtures are intentionally retained, high beta-relevant risks are accepted or scoped for controlled beta, artifact approvals are approved for controlled beta scope, and rollback evidence is recorded.

Validation keywords: `launch_gate_decision_ship`, `controlled_beta_ship_scope`, `technical_smoke_passed_launch_evidence_closed`, `last_known_good_deployment_recorded`.

## Proven Technical Evidence

| Evidence | Status | Notes |
| --- | --- | --- |
| Local quality gate | Passed | `pnpm quality:full` passed on 2026-05-17 after launch gate updates. |
| Production shell smoke | Passed | `pnpm smoke:prod` passed for `https://ai-venture-lab.vercel.app`. |
| Production route smoke | Passed | `pnpm smoke:routes` passed for `https://ai-venture-lab.vercel.app`. |
| Production browser smoke | Passed | `pnpm smoke:browser` passed for `https://ai-venture-lab.vercel.app`. |
| Authenticated write smoke | Passed | Explicitly approved disposable write smoke passed with summary-only evidence. |
| RLS allowed/denied smoke | Passed | Anonymous denied, disposable A/B allowed, and A-to-B/B-to-A denied checks passed with summary-only evidence. |
| Telemetry smoke | Passed | Telemetry ingest and funnel smoke passed after secret rotation and redeploy; no secret value recorded. |
| Vercel production inspect | Ready | `dpl_72EhMSpuaz8r4PcjvPZ7uHipa8Sa` was Ready and aliased to production before this packet was closed. |

Validation keywords: `proven_technical_evidence`, `quality_full_passed`, `production_smoke_passed`, `authenticated_write_smoke_passed`, `rls_allowed_denied_browser_smoke_passed`, `telemetry_smoke_passed_after_rotation`, `vercel_production_ready_evidence`.

## Closed Launch Evidence

| Evidence | Current state | Decision |
| --- | --- | --- |
| Authenticated write smoke workspace/idea | `retained_for_rerun` | Keep as disposable beta fixture until no longer useful. |
| RLS disposable accounts/workspaces | `retained_for_rerun` | Keep as reusable RLS fixture pair. |
| Telemetry smoke events | `not_applicable` | No private payload evidence recorded; cleanup is not required for controlled beta. |
| Screenshot artifacts | `not_applicable` | No sensitive screenshots recorded in git. |
| External telemetry runtimes | `none_or_completed` | No additional external runtime rotation is known or required for this decision. |
| High beta-relevant risks | `accepted_or_scoped_for_controlled_beta` | PII and regulated advice are restricted; secret exposure is mitigated and monitored. |
| Artifact approvals | `approved_for_controlled_beta_scope` | PRD, MVP spec, design brief, and tech spec are approved for the current beta slice. |
| QA signoff | `approved_for_controlled_beta_scope` | Quality gates and production smokes passed for the checked surfaces. |
| Security/privacy signoff | `approved_for_controlled_beta_scope` | Approved only with beta constraints: no real PII, no regulated advice, summary-only evidence, and retained disposable fixtures. |
| Rollback evidence | `recorded` | Last-known-good deployment, rollback owner, rollback trigger, and rollback action are recorded below. |
| Final launch decision | `ship` | Controlled beta only. |

Validation keywords: `cleanup_disposition_closed`, `external_runtime_rotation_scope_none_or_completed`, `risk_acceptance_recorded_for_controlled_beta`, `artifact_approval_approved_for_controlled_beta`, `qa_signoff_approved_for_controlled_beta`, `security_privacy_signoff_approved_for_controlled_beta`, `rollback_evidence_recorded`, `final_operator_decision_ship`.

## Rollback Evidence

| Field | Value |
| --- | --- |
| Last-known-good deployment id | `dpl_72EhMSpuaz8r4PcjvPZ7uHipa8Sa` |
| Last-known-good deployment URL | `https://ai-venture-kdedtm2ga-jeonhongjins-projects.vercel.app` |
| Production alias | `https://ai-venture-lab.vercel.app` |
| Vercel status at inspect | Ready |
| Rollback owner | Operator |
| Rollback trigger | Auth/RLS private-data exposure, workspace load failure, repeated production smoke failure, telemetry secret exposure, or severe data mutation. |
| Rollback action | Use Vercel dashboard rollback/promote to the last-known-good deployment, or run `vercel rollback dpl_72EhMSpuaz8r4PcjvPZ7uHipa8Sa`, then rerun `pnpm smoke:prod`, `pnpm smoke:routes`, and `pnpm smoke:browser`. |

Validation keywords: `rollback_owner_operator`, `rollback_trigger_recorded`, `rollback_action_recorded`, `last_known_good_deployment_recorded`.

## Beta Constraints

- Do not invite broad public users yet.
- Do not ask beta users to enter real personal, customer, legal, medical, financial, employment, therapy, or regulated advice data.
- Treat AI outputs as drafts and decision support only.
- Keep disposable smoke fixtures synthetic and summary-only.
- Rerun RLS allowed/denied smoke when RLS policies, workspace access code, production migrations, or disposable fixture membership changes.
- Rotate any secret immediately if it appears in chat, docs, screenshots, logs, or artifacts.

Validation keywords: `controlled_beta_constraints`, `no_real_pii_beta_scope`, `regulated_advice_scoped_out`, `ai_outputs_advisory_only`.

## Evidence Boundary

This packet may record command names, pass/fail states, target domain, commit hashes, cleanup status, risk disposition, approval status, rollback owner, and launch decision.

This packet must not record secret values, `.env.local` contents, passwords, cookies, sessions, bearer tokens, service-role keys, signed URLs, raw private payloads, raw SQL results, screenshots containing private workspace data, or private customer data.

Validation keywords: `launch_packet_summary_only`, `no_secret_values_in_launch_packet`, `no_raw_private_payloads`, `no_env_local_readback`.
