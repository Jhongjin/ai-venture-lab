# Public Beta Launch Evidence Packet

Status: evidence packet open
Last updated: 2026-05-17
Scope: operator decision packet only; no deployment, env mutation, SQL, Auth/DB mutation, secret readback, or private payload evidence

## Purpose

This packet collects the evidence needed to change `launch_gate_decision: research_more` to `launch_gate_decision: ship`.

It is not a launch approval. It is the current checklist of what is already proven, what is pending, and which items need operator judgment.

Validation keywords: `public_beta_launch_evidence_packet`, `launch_evidence_packet_open`, `operator_decision_packet_only`, `summary_only_launch_evidence`.

## Current Decision

```text
launch_gate_decision: research_more
decision_owner: Operator
decision_date: 2026-05-17
production_target: https://ai-venture-lab.vercel.app
latest_recorded_gate_commit_before_packet: eb3df30
```

Reason: technical smoke paths passed, but cleanup disposition, high-risk acceptance, artifact approval evidence, and rollback evidence are still pending.

Validation keywords: `launch_gate_decision_research_more`, `pending_user_decision`, `technical_smoke_passed_launch_evidence_pending`.

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

Validation keywords: `proven_technical_evidence`, `quality_full_passed`, `production_smoke_passed`, `authenticated_write_smoke_passed`, `rls_allowed_denied_browser_smoke_passed`, `telemetry_smoke_passed_after_rotation`.

## Pending Launch Evidence

| Evidence | Current state | Blocking rule |
| --- | --- | --- |
| Disposable smoke cleanup | `pending_user_decision` | Broader beta is blocked until every smoke surface is `completed_cleanup`, `retained_for_rerun`, or `not_applicable`. |
| High beta-relevant risks | `pending_user_decision` | `ship` requires high risks to be mitigated, accepted for beta scope, or explicitly scoped out. |
| Artifact approval evidence | `pending_user_decision` | `ship` requires PRD, MVP spec, design brief, and tech spec approval evidence, or deliberate beta-slice scoping. |
| Rollback evidence | `pending_user_decision` | `ship` requires last-known-good deployment, rollback owner, rollback trigger, and rollback action. |
| External telemetry runtimes | `pending_user_decision` | If any external runtime used the disclosed telemetry secret, it must be rotated before launch evidence closes. |
| QA signoff | `pending_user_decision` | `ship` requires QA signoff or explicit beta-scope deferral. |
| Security/privacy signoff | `pending_user_decision` | `ship` requires security/privacy signoff or explicit beta-scope deferral. |
| Final launch decision | `pending_user_decision` | Only the operator can change the decision to `ship`, `pivot`, `kill`, or continue `research_more`. |

Validation keywords: `pending_launch_evidence`, `pending_cleanup_blocks_ship`, `pending_risk_acceptance_blocks_ship`, `pending_artifact_approval_blocks_ship`, `pending_rollback_evidence_blocks_ship`, `pending_qa_signoff_blocks_ship`, `pending_security_privacy_signoff_blocks_ship`, `pending_final_operator_decision`.

## Operator Questions

Answer these when ready to move from technical readiness toward a beta launch decision:

1. Should the disposable write-smoke workspace and idea/package be `completed_cleanup`, `retained_for_rerun`, or `not_applicable`?
2. Should the RLS disposable accounts and workspaces remain `retained_for_rerun`?
3. Are there any external MVP/server runtimes that used the disclosed telemetry secret and still need rotation?
4. For the current beta slice, are personal data leakage, regulated advice claims, and secret exposure accepted, mitigated, or scoped out?
5. Are PRD, MVP spec, design brief, and tech spec approvals recorded for this beta slice, or intentionally deferred?
6. Is QA signoff recorded for this beta slice, or intentionally deferred?
7. Is security/privacy signoff recorded for this beta slice, or intentionally deferred?
8. What is the last-known-good deployment, rollback owner, rollback trigger, and rollback action?
9. Final decision: `ship`, `pivot`, `kill`, or keep `research_more`?

Validation keywords: `operator_questions_for_launch`, `cleanup_decision_required`, `risk_acceptance_required_before_ship`, `artifact_approval_evidence_required`, `qa_signoff_required_before_ship`, `security_privacy_signoff_required_before_ship`, `rollback_evidence_required`, `final_operator_decision_required`.

## Evidence Boundary

This packet may record command names, pass/fail states, target domain, commit hashes, cleanup status, risk disposition, approval status, rollback owner, and launch decision.

This packet must not record secret values, `.env.local` contents, passwords, cookies, sessions, bearer tokens, service-role keys, signed URLs, raw private payloads, raw SQL results, screenshots containing private workspace data, or private customer data.

Validation keywords: `launch_packet_summary_only`, `no_secret_values_in_launch_packet`, `no_raw_private_payloads`, `no_env_local_readback`.
