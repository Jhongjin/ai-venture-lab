---
name: ux-review
description: Use when reviewing screens, flows, wireframes, prototypes, dashboards, or usability risks.
---

# UX Review

Use this skill for app screens, design prompts, DESIGN.md files, prototypes, and production UI changes.

Start from the user's task:

- Who is trying to do what?
- What triggered this visit?
- What is the one primary action on this screen?
- What should the user know after the action succeeds or fails?

For AI-generated design prompts, provide a structured brief:

- Product context and target user
- Primary journey and screen list
- Information architecture
- Component inventory
- Empty, loading, error, success, permission, and read-only states
- Visual system: color roles, type scale, spacing, radius, elevation, density
- Platform and responsive constraints
- Accessibility and contrast requirements
- Things to avoid

When a durable visual system is needed, create or update a `DESIGN.md`-style source of truth with machine-readable tokens and human-readable rationale.

Review for:

- Primary workflow clarity
- State coverage: empty, loading, success, error
- Mobile and desktop fit
- Information hierarchy
- Accessibility and text fit
- Trust and consent moments
- Platform consistency and expected navigation
- Error prevention, undo/cancel, and recovery
- Recognition over recall: visible choices, labels, and next steps
- Focused UI: remove anything that does not support the current task
- AI trust: uncertainty, feedback, user control, and privacy notice when AI is involved

Return prioritized findings and concrete UI changes.
