# Controlled Beta Session Playbook

Status: WQ-056 controlled beta session playbook ready
Last updated: 2026-05-17
Scope: operator session guidance only; no deployment, env mutation, SQL, Auth/DB mutation, production data mutation, secret readback, telemetry smoke, authenticated write smoke, or broad public launch approval

## Purpose

Use this playbook when running a small controlled beta session after the launch gate is already approved.

This is not a marketing launch plan. It is a session script for watching whether a real operator understands the idea-to-execution board, where they hesitate, and what evidence should be recorded without collecting sensitive data.

Validation keywords: `controlled_beta_session_playbook`, `controlled_beta_operator_session`, `session_guidance_only`, `no_broad_public_launch_approval`.

## Preconditions

Run the session only when all of these are true:

- The participant has passed the summary-only screener in `templates/BETA_PARTICIPANT_SCREENER.md`.
- `docs/PUBLIC_BETA_LAUNCH_GATE.md` still says `launch_gate_decision: ship`.
- `docs/PUBLIC_BETA_LAUNCH_EVIDENCE_PACKET.md` still matches the current controlled beta scope.
- Public production smoke passes, or the session uses a clearly named preview target.
- RLS, telemetry, and authenticated write smoke are not being rerun inside the beta interview unless the separate smoke boundary has explicit approval.
- The participant understands that the session must use synthetic or low-sensitivity sample material.

Validation keywords: `beta_session_preconditions`, `controlled_beta_participant_screener`, `launch_gate_decision_ship_required`, `production_smoke_before_beta_session`, `no_smoke_rerun_inside_interview`.

## Data Boundary

Allowed during the session:

- synthetic idea notes,
- public product examples,
- fake customer names,
- invented budgets,
- anonymized operational scenarios,
- observer notes about confusion, intent, and next-action clarity.

Do not collect or paste:

- real personal data,
- customer-confidential records,
- legal, medical, financial, employment, therapy, or regulated advice facts,
- passwords, API keys, tokens, cookies, service-role keys, signed URLs, or `.env.local` contents,
- raw private database rows,
- screenshots containing private workspace data.

Validation keywords: `synthetic_beta_data_only`, `no_real_pii_beta_session`, `regulated_advice_scoped_out`, `no_secret_or_env_readback`, `no_private_screenshot_evidence`.

## Session Script

Use plain Korean with the participant. Keep the opening short:

```text
오늘은 실제 고객 정보나 민감한 자료를 넣지 않고, 샘플 아이디어로 흐름만 확인할게요.
목표는 기능을 많이 쓰는 게 아니라, 다음에 무엇을 판단해야 하는지 화면만 보고 알 수 있는지 확인하는 겁니다.
막히는 지점은 바로 말해 주세요. 설명을 듣고 해결되는지도 같이 보겠습니다.
```

Recommended flow:

1. Open the production target and ask what the participant thinks the product helps them do.
2. Enter `/workspace` and ask what their next action appears to be.
3. Run one synthetic idea through `아이디어 찾기` or manual intake.
4. Ask which candidate they would pursue, pause, or reject, and why.
5. Save a validation package only if the account/workspace is disposable or approved for beta use.
6. Ask whether the output feels like a practical execution package or just documentation.
7. Close with one decision: `continue`, `fix_blocker`, `research_more`, or `pause_beta`.

Validation keywords: `beta_session_script_korean`, `next_action_clarity_check`, `synthetic_idea_walkthrough`, `operator_decision_capture`.

## Observer Notes

Record only summary notes. Use this shape:

```text
session_id:
date:
target_url:
participant_type:
account_type: disposable | approved_beta
workflow_observed:
next_action_understood: yes | partial | no
main_friction:
strongest_value_signal:
blocked_by:
decision: continue | fix_blocker | research_more | pause_beta
follow_up_owner:
```

Do not paste raw transcripts, private screenshots, credentials, raw logs, SQL output, or environment values.

Validation keywords: `beta_observer_notes_template`, `summary_only_beta_feedback`, `no_raw_transcripts`, `no_raw_logs_or_sql`, `no_credentials_in_feedback`.

For a reusable artifact shape, use `templates/BETA_SESSION_FEEDBACK.md` after the session.

Validation keywords: `controlled_beta_session_feedback_template`, `summary_only_beta_feedback_template`.

## Stop Conditions

Stop the session and do not continue collecting input if any of these happen:

- the participant tries to enter real personal or customer-confidential data,
- the participant asks for regulated advice,
- auth or RLS behavior exposes another workspace,
- a secret appears in chat, screenshots, terminal output, or notes,
- the production app repeatedly fails the public shell or workspace smoke path,
- the participant cannot understand the next action even after one short explanation.

Validation keywords: `beta_session_stop_conditions`, `private_data_stop_condition`, `secret_exposure_stop_condition`, `workspace_exposure_stop_condition`, `next_action_failure_stop_condition`.

## Feedback Triage

After the session, classify feedback into one of four buckets:

| Bucket | Meaning | Next handling |
| --- | --- | --- |
| `copy_or_flow_fix` | The product works, but wording or step order confuses the operator | Small UI/copy queue |
| `evidence_gap` | The operator wants proof, context, or risk notes before trusting the output | Artifact or evidence queue |
| `workflow_gap` | The operator cannot complete an expected path | Product/QA queue |
| `scope_risk` | The session pushes into sensitive data, regulated advice, or broader launch claims | Security/launch gate queue |

Smoke evidence and participant feedback are separate. Smoke evidence proves a technical path passed or failed; it does not prove that an operator understood, trusted, or valued the workflow.

Validation keywords: `beta_feedback_triage`, `copy_or_flow_fix`, `evidence_gap`, `workflow_gap`, `scope_risk`, `smoke_evidence_not_user_feedback`.

## Exit Criteria

A controlled beta session can be counted as usable evidence only when:

- the session used synthetic or approved beta data,
- notes are summary-only,
- no secret or private payload was recorded,
- the participant's decision and main friction are captured,
- any blocker has an owner and next action,
- no broad public launch claim is made from a single session.

Validation keywords: `usable_beta_session_evidence`, `summary_only_exit_criteria`, `blocker_owner_required`, `no_single_session_launch_claim`.
