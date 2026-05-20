# AI-first Product Flow

This document keeps the console aligned with the intended product philosophy: AI Venture Lab should feel like an automated venture operator, not a manual checklist.

## Product Promise

The user can start with a rough idea, meeting note, chat transcript, or vague automation need. The platform should turn it into a validated production package that can be used inside the platform or handed to an external development tool.

The final package should be strong enough to guide a real build: product requirements, result type, design direction, stack direction, first build scope, validation context, risks, and implementation prompts.

## Role Split

AI owns the first draft:

- idea extraction and product-surface classification
- business potential, market signals, competition, saturation, and entry-barrier checks
- risk framing and validation plan
- execution documents and production package assembly
- handoff material for native build, external IDEs, or MCP-style integrations

The user owns judgment:

- confirm or correct the selected idea
- adjust result type when AI misclassifies it
- approve the final direction or stop the idea
- add manual evidence only when they have better context than the platform

Manual fields are correction paths. They are not the default workflow.

## Product Surface Rule

Every saved idea needs a visible result type before downstream artifacts are generated. Supported types:

- web app
- mobile app
- website
- automation workflow
- operator console
- development-tool handoff

The result type shapes the PRD, design direction, stack choice, first build scope, and final production package. AI should classify it during idea discovery, then expose one correction point during business evaluation.

## Console Rules

- One screen should have one primary action.
- The next step should be enabled only after the required save or confirmation is complete.
- Step advancement should happen from the bottom next-step button, not from helper buttons.
- Helper actions can copy, prefill, or save local content, but should not move the user to another step.
- Advanced panels should stay optional unless the user deliberately opens them.
- Saved buttons should become disabled or clearly show saved state.
- Empty states should tell the user what to do next in plain language.

## Copy Rules

Use user-facing language in primary UI:

- Use `제작 패키지`, not `하네스 패키지`.
- Use `개발 도구`, not `IDE/MCP`, unless the user is in an export or integration setting.
- Use `실행 문서`, not approval-library language.
- Use `결과물 형태`, not implementation surface.
- Use `AI가 먼저 정리`, then `필요할 때만 수정`.

Technical terms can remain inside generated artifacts when they are useful for developers, but the main operating console should not make the user decode them.

## Output Contract

Before the user moves into actual build work, the platform should have one saved production package containing:

- the selected idea and result type
- business evaluation and decision
- market and competition scan
- core risks and mitigation notes
- 7-day validation plan or validation summary
- product requirements
- design direction
- stack direction
- first build scope and excluded scope
- implementation prompt or handoff package

If an external IDE or MCP integration is available later, it should consume this same package instead of asking the user to reassemble documents.
