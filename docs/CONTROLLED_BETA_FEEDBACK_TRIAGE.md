# Controlled Beta Feedback Triage

Status: WQ-060 controlled beta feedback triage ready
Last updated: 2026-05-17
Scope: feedback-to-work-queue guidance only; no participant identity, contact details, raw transcript, screenshots, credentials, env values, Auth/DB mutation, telemetry smoke, authenticated write smoke, production mutation, or broad public launch approval

## Purpose

Use this after a controlled beta session has been summarized with `templates/BETA_SESSION_FEEDBACK.md`.

This document decides how summary-only beta feedback becomes a product, UX, QA, security, evidence, or research queue.

It does not treat one session as proof of product-market fit and does not change the launch decision by itself.

Validation keywords: `controlled_beta_feedback_triage`, `feedback_to_work_queue_guidance`, `summary_only_feedback_input`, `no_single_session_launch_claim`.

## Intake Preconditions

Triage only when the feedback packet confirms:

- synthetic or approved beta data was used,
- no real PII or customer-confidential data was recorded,
- no regulated advice was captured or implied,
- no credentials, env values, tokens, cookies, sessions, signed URLs, raw logs, raw SQL, or raw private payloads were recorded,
- smoke evidence was kept separate from participant feedback,
- the participant's next-action clarity and main friction are summarized.

If any of these are missing, classify the item as `scope_risk` and fix the evidence boundary before acting on the feedback.

Validation keywords: `triage_intake_preconditions`, `synthetic_or_approved_beta_data`, `no_real_pii_beta_session`, `regulated_advice_scoped_out`, `smoke_evidence_not_user_feedback`, `scope_risk_if_boundary_missing`.

## Triage Buckets

| Bucket | Use when | Default next queue |
| --- | --- | --- |
| `copy_or_flow_fix` | The participant understands the promise but wording, step order, labels, or visible next action are confusing | UX/copy queue |
| `evidence_gap` | The participant wants proof, comparison, risk context, or confidence before trusting the recommendation | Evidence/artifact queue |
| `workflow_gap` | The participant cannot complete or mentally connect an expected path | Product/QA queue |
| `scope_risk` | Feedback touches real PII, customer data, regulated advice, private screenshots, secrets, Auth/RLS exposure, or broader launch claims | Security/launch gate queue |

Validation keywords: `beta_feedback_triage`, `copy_or_flow_fix`, `evidence_gap`, `workflow_gap`, `scope_risk`, `security_launch_gate_queue`.

## Severity

Use the lowest severity that still captures the risk.

| Severity | Meaning | Action |
| --- | --- | --- |
| `P0` | Private data, secret, cross-workspace exposure, or production-breaking path | Stop beta expansion; security/QA queue first |
| `P1` | Participant cannot find the next action or cannot complete the core session path | Fix before next similar session |
| `P2` | The path works, but confidence, wording, or evidence is weak | Batch into the next polish/evidence queue |
| `P3` | Preference, nice-to-have, or single weak signal | Record and wait for another signal |

Validation keywords: `beta_feedback_severity`, `p0_private_or_secret_exposure`, `p1_core_path_blocker`, `p2_confidence_or_copy_gap`, `p3_wait_for_more_signal`.

## Action Rules

Use these rules before creating work:

- Do not create a feature from one `P3` preference.
- Do create a copy/flow fix from one clear `P1` next-action failure.
- Do create an evidence/artifact queue when the participant understands the flow but does not trust the recommendation.
- Do create a product/QA queue when the product claims a path exists but the participant cannot complete it.
- Do create a security/launch queue immediately for `scope_risk`, even if it happens once.
- Do not use smoke pass/fail as a substitute for user understanding.

Validation keywords: `feedback_action_rules`, `no_feature_from_single_p3`, `single_p1_next_action_failure_actionable`, `evidence_gap_creates_artifact_queue`, `workflow_gap_creates_product_qa_queue`, `scope_risk_immediate_security_queue`.

## Work Queue Shape

When feedback becomes work, write it in this shape:

```text
source: controlled_beta_session
session_id:
bucket: copy_or_flow_fix | evidence_gap | workflow_gap | scope_risk
severity: P0 | P1 | P2 | P3
summary:
observed_friction:
expected_next:
actual_screen_response:
recommended_queue:
owner:
done_when:
verification:
```

Do not include participant identity, contact details, raw transcript, screenshots with private data, credentials, env values, raw logs, SQL output, or raw private payloads.

Validation keywords: `feedback_work_queue_shape`, `controlled_beta_session_source`, `done_when_required`, `verification_required`, `no_raw_private_feedback_payload`.

## Decision Output

Every triage pass ends with one of these decisions:

- `fix_now`: clear blocker before the next similar session.
- `batch_next`: group into the next polish/evidence queue.
- `watch`: wait for one more similar signal.
- `security_review`: stop and review the safety boundary.
- `ignore_for_now`: record but take no action because it is out of scope or too weak.

Validation keywords: `feedback_triage_decision_output`, `fix_now`, `batch_next`, `watch`, `security_review`, `ignore_for_now`.

## Exit Criteria

A feedback item is triaged when:

- bucket and severity are assigned,
- safety boundary is checked,
- one decision output is selected,
- owner and next action are clear for actionable items,
- no broad launch claim is made from a single session.

Validation keywords: `feedback_triage_exit_criteria`, `bucket_and_severity_required`, `safety_boundary_checked`, `owner_and_next_action_required`, `no_single_session_launch_claim`.
