# External Production Package

AI Venture Lab의 최종 제작 패키지는 사람이 읽는 문서이면서 외부 개발 도구가 순서대로 읽을 수 있는 실행 자료다. 사용자가 별도 문서를 조합하지 않도록, STEP 5 저장물은 아래 구조를 같은 패키지 안에 포함한다.

## Surface and Evidence Contract

Each package is valid for one selected result type: web service, mobile app, website, workflow automation, or operator console. External development tool choice is a delivery option layered on top of that result type, not a separate product surface. PRD, IA, design direction, stack guidance, implementation tasks, and external handoff notes must all use the same result type.

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

## Current Live Connectors

Cursor, Codex, Claude Code, and Google Antigravity are live connectors. Final execution generates an install script for the selected tool and creates the project files that tool needs in the external development project.

### Cursor

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

### Codex

The Codex setup file creates these project files:

- `AI_VENTURE_PACKAGE.md`
- `AI_VENTURE_TASKS.md`
- `AI_VENTURE_CODEX_START.md`
- `AGENTS.ai-venture-lab.md`
- `README_VENTURE_LAB_CODEX.md`
- `.codex/venture-lab-cli.mjs`
- `.codex/venture-lab-sync.json`
- `.codex/venture-lab-progress.json`

Codex starts from `AI_VENTURE_CODEX_START.md` and uses the local CLI directly:

- `node .codex/venture-lab-cli.mjs status`
- `node .codex/venture-lab-cli.mjs next-task`
- `node .codex/venture-lab-cli.mjs read start`
- `node .codex/venture-lab-cli.mjs record-progress --task T-001 --status done --summary "..." --verification "..."`

The Codex write-back token follows the same scope and storage rules as Cursor: one idea, one actor, one organization boundary, one tool, hashed server-side storage, short expiry, and individual revoke.

### Claude Code

The Claude Code setup file creates these project files:

- `AI_VENTURE_PACKAGE.md`
- `AI_VENTURE_TASKS.md`
- `AI_VENTURE_CLAUDE_START.md`
- `CLAUDE.md`
- `README_VENTURE_LAB_CLAUDE.md`
- `.mcp.json`
- `.claude/venture-lab-cli.mjs`
- `.claude/venture-lab-sync.json`
- `.claude/venture-lab-progress.json`

Claude Code starts from `AI_VENTURE_CLAUDE_START.md`, can read the local MCP server from `.mcp.json`, and can also use the local CLI directly:

- `node .claude/venture-lab-cli.mjs status`
- `node .claude/venture-lab-cli.mjs next-task`
- `node .claude/venture-lab-cli.mjs read start`
- `node .claude/venture-lab-cli.mjs record-progress --task T-001 --status done --summary "..." --verification "..."`

The Claude Code write-back token follows the same scope and storage rules as Cursor and Codex.

### Google Antigravity

The Google Antigravity setup file creates these project files:

- `AI_VENTURE_PACKAGE.md`
- `AI_VENTURE_TASKS.md`
- `AI_VENTURE_ANTIGRAVITY_START.md`
- `AI_VENTURE_ACCEPTANCE.md`
- `AGENTS.ai-venture-lab.md`
- `README_VENTURE_LAB_ANTIGRAVITY.md`
- `.antigravity/mcp_config.json`
- `.antigravity/venture-lab-cli.mjs`
- `.antigravity/venture-lab-sync.json`
- `.antigravity/venture-lab-progress.json`

Google Antigravity starts from `AI_VENTURE_ANTIGRAVITY_START.md` and uses the local CLI directly:

- `node .antigravity/venture-lab-cli.mjs status`
- `node .antigravity/venture-lab-cli.mjs next-task`
- `node .antigravity/venture-lab-cli.mjs read start`
- `node .antigravity/venture-lab-cli.mjs record-progress --task T-001 --status done --summary "..." --verification "..."`

The Google Antigravity write-back token follows the same scope and storage rules as the other named live connectors.

Generic MCP is deferred for now. It can remain as an internal compatibility profile or future resource contract, but it should not appear as a supported user-facing final execution choice until a concrete connector, permission model, and denied-case smoke exist.

The production build-sync smoke verifies the named live connector boundary: Cursor, Codex, Claude Code, and Google Antigravity final execution must expose the correct setup guidance and token lifecycle; deferred generic MCP must not appear in the supported tool selector.

Live write-back for another tool must satisfy `docs/EXTERNAL_CONNECTOR_WRITEBACK_BOUNDARY.md` before the UI can present it as automatic.

## Completion Report

External tools should report:

- changed files
- quality commands and results
- deployment or preview URL when applicable
- remaining risks or skipped checks
- rollback notes

This structure remains embedded in the STEP 5 production package. Cursor consumes the same package through local project files and MCP resources. Codex consumes it through local project files and the `.codex/venture-lab-cli.mjs` progress command. Claude Code consumes it through `.mcp.json`, `CLAUDE.md`, and `.claude/venture-lab-cli.mjs`. Google Antigravity consumes it through project instructions, `.antigravity/mcp_config.json`, and `.antigravity/venture-lab-cli.mjs`.
