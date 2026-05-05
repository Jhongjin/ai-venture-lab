# App Design Prompting

Use this when creating a design brief, Stitch-style prompt, or DESIGN.md context for an app.

## Design Brief Shape

1. Product purpose and audience
2. User journey and primary action
3. Screen inventory
4. Component inventory
5. Data shown and data collected
6. Empty, loading, success, error, permission, and read-only states
7. Visual system: colors, typography, spacing, radius, elevation, density
8. Accessibility and platform conventions
9. Trust, consent, and privacy moments
10. Things to avoid

## DESIGN.md Shape

- YAML front matter holds exact design tokens.
- Markdown explains the rationale and how to apply the tokens.
- Use ordered sections: Overview, Colors, Typography, Layout, Elevation & Depth, Shapes, Components, Do's and Don'ts.
- Include component states for buttons, inputs, lists, tabs, chips, cards, alerts, and forms.
- Lint or manually check contrast, token references, section order, and missing typography.

## UX Review Heuristics

- Show system status and progress.
- Use the user's language, not internal labels.
- Provide back, cancel, undo, and recovery paths.
- Keep navigation, controls, and terminology consistent.
- Prevent high-cost errors before they happen.
- Make options visible instead of relying on memory.
- Support both first-time and frequent operators.
- Keep each screen focused on the current task.
- Explain errors in plain language with a next action.
- Put help near the task, not in a distant manual.
