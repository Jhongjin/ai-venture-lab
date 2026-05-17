# Controlled Beta Session Feedback

Use after `docs/CONTROLLED_BETA_SESSION_PLAYBOOK.md`.

Validation keywords: `controlled_beta_session_feedback_template`, `summary_only_beta_feedback_template`, `synthetic_beta_data_only`.

## Session

- Session id:
- Date:
- Target URL:
- Participant type:
- Account type: disposable / approved_beta
- Workflow observed:
- Data boundary confirmed: yes / no

## What Happened

- Next action understood: yes / partial / no
- Strongest value signal:
- Main friction:
- Moment of hesitation:
- What the participant expected next:
- What the product showed instead:

## Feedback Bucket

Choose one primary bucket.

- `copy_or_flow_fix`:
- `evidence_gap`:
- `workflow_gap`:
- `scope_risk`:

Validation keywords: `beta_feedback_triage`, `copy_or_flow_fix`, `evidence_gap`, `workflow_gap`, `scope_risk`.

## Decision

- Decision: continue / fix_blocker / research_more / pause_beta
- Reason:
- Follow-up owner:
- Next action:
- Due date:

## Safety Check

- Synthetic or approved beta data only: yes / no
- No real PII or customer-confidential data recorded: yes / no
- No regulated advice captured or implied: yes / no
- No credentials, env values, tokens, cookies, sessions, signed URLs, raw logs, raw SQL, or raw private payloads recorded: yes / no
- No private screenshots recorded: yes / no
- Smoke evidence treated separately from user feedback: yes / no

Validation keywords: `no_real_pii_beta_session`, `regulated_advice_scoped_out`, `no_secret_or_env_readback`, `no_raw_logs_or_sql`, `no_private_screenshot_evidence`, `smoke_evidence_not_user_feedback`.

## Evidence Boundary

Do not paste raw transcripts, full chat logs, screenshots with private workspace data, credentials, environment values, database rows, SQL output, browser cookies, session values, bearer tokens, signed URLs, or unredacted customer material.

Validation keywords: `no_raw_transcripts`, `no_credentials_in_feedback`, `no_single_session_launch_claim`, `usable_beta_session_evidence`.
