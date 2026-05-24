# External Production Package

AI Venture Lab의 최종 제작 패키지는 사람이 읽는 문서이면서 외부 개발 도구가 순서대로 읽을 수 있는 실행 자료다. 사용자가 별도 문서를 조합하지 않도록, STEP 5 저장물은 아래 구조를 같은 패키지 안에 포함한다.

## Surface and Evidence Contract

Each package is valid for one selected result type: web service, mobile app, website, workflow automation, operator console, or development-tool handoff. PRD, IA, design direction, stack guidance, implementation tasks, and external handoff notes must all use that same result type.

The market and competition scan must also match the current result type. If the result type changes after a scan was saved, STEP 3 should regenerate and save a current scan before STEP 4 or STEP 5 can continue.

## Read Order

| Order | Resource | Purpose |
| --- | --- | --- |
| 00 | Execution summary | 가치, 사용자, 제작 형태, 현재 판단을 먼저 고정한다. |
| 01 | Validation evidence | 조사 요약, 시장·경쟁 점검, 검증 결과에서 추정과 확정 근거를 분리한다. |
| 02 | Product scope | PRD, 첫 제작 범위, 제외 범위를 Slice 1 기준으로 잠근다. |
| 03 | Design direction | IA, 핵심 화면, 상태, 모바일/접근성 기준을 제공한다. |
| 04 | Technical boundary | 스택, 데이터 모델, 권한, 환경변수, 서버/클라이언트 경계를 제공한다. |
| 05 | Implementation sequence | 태스크 순서, 수용 기준, 담당 역할, 증거 저장 방식을 제공한다. |
| 06 | Quality and deploy | 품질 명령, smoke, 배포 URL, 롤백 기준을 제공한다. |

## MCP Resource Shape

Canonical package resources:

- `venture://production-package/00-execution-summary`
- `venture://production-package/01-validation-evidence`
- `venture://production-package/02-product-scope`
- `venture://production-package/03-design-direction`
- `venture://production-package/04-technical-boundary`
- `venture://production-package/05-implementation-sequence`
- `venture://production-package/06-quality-deploy`

The package must never expose secret values. Environment variables should be represented as names, visibility boundaries, and verification expectations only.

## Current Cursor Connector

The first live connector is Cursor. Final execution generates an install script that creates these project files in the external Cursor project:

- `AI_VENTURE_PACKAGE.md`
- `AI_VENTURE_TASKS.md`
- `AI_VENTURE_CURSOR_START.md`
- `README_VENTURE_LAB_CURSOR.md`
- `.cursor/rules/ai-venture-lab.mdc`
- `.cursor/mcp.json`
- `.cursor/venture-lab-cli.mjs`
- `.cursor/venture-lab-mcp-server.mjs`
- `.cursor/venture-lab-sync.json`
- `.cursor/venture-lab-progress.json`

Cursor's local CLI/MCP bridge exposes the package, task list, guide, and start prompt as local resources. It also exposes:

- `venture_next_task`: reads the next unfinished implementation task
- `venture_record_progress`: records task progress locally and writes the same progress back to Venture Lab through `/api/build-sync/progress`

The generated `.cursor/venture-lab-cli.mjs` can also be run directly from the Cursor project root:

- `node .cursor/venture-lab-cli.mjs status`
- `node .cursor/venture-lab-cli.mjs next-task`
- `node .cursor/venture-lab-cli.mjs read start`
- `node .cursor/venture-lab-cli.mjs record-progress --task T-001 --status done --summary "..." --verification "..."`

The write-back token is scoped to the selected idea, signed by a server-only secret, and can only create or update implementation tasks. The sync token and progress file are added to the external project's `.gitignore` by the setup script.

## Other External Tool Packages

Codex, Claude Code, Google Antigravity, and generic MCP handoffs use tool-specific start packages until their write-back connectors exist. The final execution screen must not imply automatic task sync for these tools.

| Tool | Start package | Current automation boundary |
| --- | --- | --- |
| Codex | `AI_VENTURE_CODEX_START.md`, `AGENTS.md`, `AI_VENTURE_PACKAGE.md`, `AI_VENTURE_TASKS.md` | Package handoff and completion report import |
| Claude Code | `AI_VENTURE_CLAUDE_START.md`, `CLAUDE.md`, `AI_VENTURE_PACKAGE.md`, `AI_VENTURE_TASKS.md` | Package handoff and completion report import |
| Google Antigravity | `AI_VENTURE_ANTIGRAVITY_START.md`, `AI_VENTURE_PACKAGE.md`, `AI_VENTURE_TASKS.md`, `AI_VENTURE_ACCEPTANCE.md` | Package handoff and completion report import |
| Generic MCP | `AI_VENTURE_MCP_MANIFEST.md`, `AI_VENTURE_PACKAGE.md`, `AI_VENTURE_TASKS.md` | Read-only resource contract and completion report import |

For non-Cursor tools, the user receives a single downloadable start package that includes the tool-specific first action, the package file list, the completion report format, and the full production package. Automatic Venture Lab status write-back is a Cursor-first capability.

The production build-sync smoke verifies both sides of this boundary: Cursor final execution must expose the local CLI/MCP start check, while Codex, Claude Code, Google Antigravity, and generic MCP must stay on start-package guidance and must not show the Cursor setup button.

## Completion Report

External tools should report:

- changed files
- quality commands and results
- deployment or preview URL when applicable
- remaining risks or skipped checks
- rollback notes

This structure remains embedded in the STEP 5 production package. Cursor can now consume the same package through local project files and MCP resources, while Codex, Claude Code, and Antigravity still use the package as a copyable or downloadable handoff until their connectors get matching write-back behavior.
