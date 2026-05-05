---
name: prd-writer
description: Use when turning a validated idea into a concise PRD, MVP spec, user stories, or acceptance criteria.
---

# PRD Writer

Start from `templates/PRD.md` and `templates/MVP_SPEC.md`.

Use this skill after idea screening has produced at least one clear evidence gap, buyer/user distinction, and a proposed first experiment.

Planning anchors:

- Discovery means understanding the problem, users, constraints, alternatives, and success measures. Do not specify a full build during discovery.
- Alpha/MVP means testing the riskiest assumptions with prototypes or concierge workflows before broad automation.
- Shape work by appetite: choose how much time the idea deserves, then constrain scope to fit that budget.
- A good PRD is a shared operating contract for product, design, engineering, QA, security, and launch. Keep it concise enough to update.

Keep the MVP narrow:

- One core user
- One painful workflow
- One measurable success metric
- One launchable prototype path

Required PRD sections:

- Problem framing: user, buyer, trigger, current workaround, cost of the problem
- Evidence: what is known, what is assumed, what still needs proof
- Outcome: user outcome, business outcome, first success metric
- Scope: must have, should have, not now, explicit no-gos
- User stories and acceptance criteria that can map to tests
- UX notes: primary journey, empty/loading/error/success states, accessibility risks
- Data and analytics: source tables/events, retention, privacy classification
- Security and operations: permissions, secrets, audit, rollback, support path
- Release gate: QA, security, experiment result, final decision

For AI-enabled features, include:

- User control and override
- Confidence/uncertainty presentation
- Feedback loop
- Data use and retention notice
- Failure mode and human fallback

Always include non-goals, kill criteria, and privacy/security notes.
