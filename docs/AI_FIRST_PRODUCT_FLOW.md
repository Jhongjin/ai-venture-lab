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

## Korean Operating Principle

이 제품은 사용자가 긴 체크리스트를 직접 채우는 도구가 아니다. 사용자는 거친 메모, 회의 내용, LLM 대화, 자동화하고 싶은 업무, 또는 막연한 사업 아이디어를 넣고 시작한다. 플랫폼은 그 내용을 바탕으로 먼저 아이디어를 정리하고, 결과물 형태를 고르고, 사업성/시장성/리스크/검증 계획/제작 패키지를 준비한다.

사용자는 기본적으로 다음 세 가지 판단만 하면 된다.

- AI가 고른 아이디어가 맞는지 확인한다.
- 결과물 형태가 맞는지 확인한다. 예: 웹 서비스, 모바일 앱, 랜딩/웹사이트, 업무 자동화, 운영 콘솔, 개발 도구 연동.
- 최종 제작 패키지를 저장하거나 중단한다.

수동 입력, 복사, 세부 문서 편집, 증거 직접 기록은 보조 경로다. 처음 쓰는 사용자가 이 보조 경로를 필수 절차로 오해하면 안 된다.

## Step Contract

- STEP 1: 아이디어를 도출하고 결과물 형태를 함께 정한다. 앱인지, 웹 서비스인지, 자동화인지가 이 단계에서 먼저 보여야 한다.
- STEP 2: 사업성 평가와 결과물 형태를 한 번 더 확인한다. 이 값은 이후 기획서, 디자인 기준, 기술 스택, 제작 패키지의 기준이 된다.
- STEP 3: AI가 7일 검증 계획과 부족한 근거를 먼저 채운다. 사용자는 필요한 부분만 고친다.
- STEP 4: 검증 자료와 실행 문서를 저장한다. 저장 상태가 맞아야 다음 단계가 열린다.
- STEP 5: AI가 디자인 기준, 제작 실행 계획, 개발 도구 전달 자료를 묶어 최종 제작 패키지를 만든다.

Any new UI should make this flow feel like "AI prepares, user confirms" rather than "user fills every form."

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
