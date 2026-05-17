# Controlled Beta Session 001 Prep

Status: WQ-059 first controlled beta session prep ready
Last updated: 2026-05-17
Scope: pre-session preparation only; no participant identity, contact details, transcript, screenshots, credentials, env values, Auth/DB mutation, telemetry smoke, authenticated write smoke, or production mutation

## Purpose

This packet prepares the first controlled beta participant session using the screener summary already provided by the operator.

It is not feedback evidence yet. It is a session plan and synthetic input packet.

Validation keywords: `controlled_beta_session_001_prep`, `first_beta_session_prep`, `pre_session_plan_only`, `not_feedback_evidence`.

## Screener Summary

```text
participant_type: 아이디어를 자주 검토하지만 실행 시작점에서 막히는 초기 기획자/운영자
relevant_workflow: 아이디어를 실행 가능한 MVP 흐름으로 구체화하고, 기술스택/첫 실행 순서를 정하는 과정
main_expected_friction: 기술스택 선택, 무엇부터 시작해야 하는지 모름
solo_or_team_decision: 초반은 solo, 구체화 이후 team
synthetic_data_agreement: yes
sensitive_domain_risk: review_needed
invite_decision: invite
```

Session boundary:

- Avoid legal, medical, financial, hiring, therapy, counseling, or other regulated ideas.
- Use only the synthetic idea below.
- Do not record participant name, email, phone, company, calendar link, or private screenshots.

Validation keywords: `participant_type_not_identity`, `synthetic_data_agreement_yes`, `sensitive_domain_risk_review_needed`, `no_contact_details_in_repo`, `regulated_advice_scoped_out`.

## Session Objective

The main thing to learn:

```text
Can the participant look at the board and understand how a loose app idea becomes:
1. one selected candidate,
2. validation questions,
3. an MVP scope,
4. a first execution package,
without already knowing the technical stack?
```

Validation keywords: `next_action_clarity_check`, `mvp_scope_clarity_check`, `technical_starting_point_check`.

## Synthetic Idea

Use this idea instead of a real participant idea:

```text
크리에이터나 1인 마케터가 매주 올릴 숏폼 콘텐츠 아이디어를 정리하고,
각 아이디어를 촬영 난이도, 예상 반응, 필요한 자료, 게시 채널별 문구로 나눠주는 웹앱.

사용자는 여기저기 적어둔 메모, 레퍼런스 링크, 지난 게시물 반응을 한 화면에 넣고,
이번 주에 바로 만들 콘텐츠 후보 3개를 고른다.

첫 MVP는 복잡한 자동 게시가 아니라,
아이디어 수집, 후보 정리, 우선순위 선택, 7일 콘텐츠 실험 계획까지만 다룬다.
```

Why this sample:

- It is easy to understand without domain expertise.
- It avoids regulated advice.
- It can test the participant's main friction: where to start, what to build first, and what stack might fit.
- It allows the platform to produce validation and MVP artifacts without using real private data.

Validation keywords: `synthetic_idea_walkthrough`, `no_real_customer_data`, `non_regulated_sample_idea`, `technical_stack_friction_probe`.

## Copy Into The Product

Use this as the paste source for `아이디어 찾기`:

```text
나는 크리에이터나 1인 마케터가 매주 올릴 숏폼 콘텐츠 아이디어를 정리하는 웹앱을 만들고 싶다.

지금은 아이디어가 메모 앱, 북마크, 지난 게시물 댓글, 레퍼런스 영상에 흩어져 있어서
이번 주에 뭘 먼저 만들어야 할지 정하기 어렵다.

이 웹앱은 흩어진 메모와 레퍼런스를 넣으면
콘텐츠 후보를 정리하고, 촬영 난이도와 예상 반응, 필요한 자료, 게시 채널별 문구를 함께 보여준다.

처음부터 자동 게시나 복잡한 분석까지 만들 필요는 없다.
첫 버전은 아이디어 수집, 후보 정리, 우선순위 선택, 7일 콘텐츠 실험 계획까지만 있으면 된다.

가장 어려운 점은 어떤 기능부터 만들지, 기술스택을 뭘로 잡을지, 혼자 어디서부터 시작해야 할지 모른다는 점이다.
```

Validation keywords: `copy_ready_synthetic_input`, `no_private_payload`, `no_secret_or_env_readback`.

## Observation Prompts

Ask these while the participant watches the product:

1. 지금 화면에서 다음에 해야 할 행동이 무엇처럼 보이나요?
2. 후보 중 하나를 고르라면 어떤 기준으로 고르겠나요?
3. 이 결과가 기술스택과 첫 실행 순서를 정하는 데 도움이 되나요?
4. 어디부터는 설명을 듣지 않으면 이해가 어려웠나요?
5. 이게 문서처럼 느껴지나요, 아니면 바로 실행할 패키지처럼 느껴지나요?

Validation keywords: `operator_observation_prompts`, `execution_package_value_check`, `documentation_feel_check`.

## Expected Feedback Buckets

Likely buckets to watch:

- `copy_or_flow_fix`: wording does not clearly explain the next action.
- `evidence_gap`: participant wants proof that the selected candidate is worth pursuing.
- `workflow_gap`: participant cannot see how validation output becomes MVP/start-work steps.
- `scope_risk`: participant tries to switch into regulated or real private data.

Validation keywords: `beta_feedback_triage`, `copy_or_flow_fix`, `evidence_gap`, `workflow_gap`, `scope_risk`.

## Stop Rules

Stop or redirect if:

- the participant introduces a real customer, company, or private project name,
- the idea shifts into legal, medical, financial, hiring, therapy, or counseling advice,
- the participant wants to paste private analytics, credentials, or customer records,
- the product exposes another workspace or private data,
- the session becomes a technical smoke rerun instead of participant observation.

Validation keywords: `beta_session_stop_conditions`, `private_data_stop_condition`, `workspace_exposure_stop_condition`, `smoke_evidence_not_user_feedback`.

## After The Session

Use `templates/BETA_SESSION_FEEDBACK.md`.

Record only:

- participant type,
- workflow observed,
- next-action clarity,
- strongest value signal,
- main friction,
- feedback bucket,
- decision,
- next action.

Do not record raw transcript, participant identity, contact details, screenshots with private data, credentials, env values, raw logs, SQL output, or raw private payloads.

Validation keywords: `controlled_beta_session_feedback_template`, `summary_only_beta_feedback`, `no_raw_transcripts`, `no_credentials_in_feedback`, `usable_beta_session_evidence`.
