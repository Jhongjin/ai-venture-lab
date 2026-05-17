# Controlled Beta Participant Screener

Use before `docs/CONTROLLED_BETA_SESSION_PLAYBOOK.md`.

Validation keywords: `controlled_beta_participant_screener`, `pre_session_screener_template`, `controlled_beta_invite_only`.

## Invite Copy

```text
안녕하세요.

지금 작은 범위로 새 실행 보드의 베타 사용성을 확인하고 있습니다.
이번 세션은 실제 고객 정보나 민감한 자료를 넣는 테스트가 아니라,
샘플 아이디어로 화면을 보며 다음 판단이 잘 보이는지 확인하는 자리입니다.

가능하시다면 20-30분 정도 함께 보면서,
어디서 이해가 잘 되는지와 어디서 막히는지를 알려주세요.
```

## Screener Questions

Ask only what is needed to decide whether the participant fits this controlled beta.

1. 최근에 새 제품, 서비스, 자동화, 웹/앱 아이디어를 검토한 적이 있나요?
2. 아이디어를 실행으로 옮기기 전에 가장 자주 막히는 지점은 무엇인가요?
3. 혼자서 판단해야 하는 편인가요, 아니면 팀과 함께 결정하나요?
4. 샘플 아이디어와 가짜 데이터만 사용해도 괜찮나요?
5. 법무, 의료, 금융, 채용, 상담처럼 전문 규제가 필요한 주제를 다루지 않아도 괜찮나요?

Validation keywords: `minimal_screener_questions`, `synthetic_data_consent`, `regulated_topic_opt_out`.

## Fit Summary

- Participant type:
- Relevant workflow:
- Main expected friction:
- Solo or team decision:
- Synthetic-data agreement: yes / no
- Sensitive-domain risk: low / review_needed
- Invite decision: invite / wait / do_not_invite
- Reason:

Validation keywords: `participant_fit_summary`, `invite_wait_do_not_invite`, `sensitive_domain_screening`.

## Data Boundary

Do not store phone numbers, email addresses, calendar links, private names, company names, customer names, contract details, or screenshots in this repo.

Scheduling and contact logistics belong outside durable repo artifacts. If a session needs follow-up, record only the participant type and follow-up owner, not contact details.

Validation keywords: `no_contact_details_in_repo`, `scheduling_outside_repo_artifacts`, `participant_type_not_identity`, `no_company_or_customer_names`.

## Exclusion Rules

Do not invite a participant into the current controlled beta session if:

- they need to use real customer-confidential data,
- they want advice in a regulated domain,
- they cannot use synthetic examples,
- they require screenshots or transcripts containing private workspace data,
- their workflow requires multi-user permissions, billing, production integrations, or external account access that is not part of the current beta.

Validation keywords: `beta_screener_exclusion_rules`, `no_real_customer_data`, `no_regulated_advice_session`, `no_private_transcript_requirement`, `no_unapproved_integration_dependency`.

## Handoff To Session

If the participant is invited, copy only this summary into the session notes:

```text
participant_type:
relevant_workflow:
main_expected_friction:
solo_or_team_decision:
synthetic_data_agreement: yes
sensitive_domain_risk: low
```

Then use `docs/CONTROLLED_BETA_SESSION_PLAYBOOK.md` for the live session and `templates/BETA_SESSION_FEEDBACK.md` after the session.

The screener is fit and risk routing only. It is not post-session feedback evidence and should not be used to claim that the product is understood, trusted, or valuable.

Validation keywords: `screener_to_session_summary_only`, `no_screener_raw_notes`, `screener_not_feedback_evidence`, `controlled_beta_session_playbook`, `controlled_beta_session_feedback_template`.
