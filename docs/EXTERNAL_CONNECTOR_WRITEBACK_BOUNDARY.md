# External Connector Write-Back Boundary

This boundary defines what must exist before AI Venture Lab enables live write-back for additional external development tools beyond the currently supported live connectors.

## Current State

Cursor, Codex, Claude Code, and Google Antigravity are the current named live write-back connectors.

- The final execution screen creates a project setup file for the selected named tool.
- Cursor and Claude Code receive project MCP configuration plus a local CLI/MCP bridge.
- Codex receives a local CLI progress bridge.
- Google Antigravity receives project instructions, an MCP config candidate, and a local CLI progress bridge.
- `/api/build-sync/progress` accepts only scoped task progress for the selected idea.
- `public.build_sync_tokens` stores token hashes, status, expiry, and recent use metadata.
- Operators can revoke individual named-tool connections.
- `pnpm smoke:build-sync` verifies token issuance, allowed progress write, STEP 7 guidance for all four named tools, STEP 8 task rendering, token revoke, and revoked-token rejection.

Generic MCP is deferred. It remains a compatibility profile for older artifacts and internal contract design, but it is not part of the supported final execution selector until a concrete tool, permission model, and smoke matrix are defined.

## Non-Negotiable Rules

Do not enable live write-back for another tool until all items below are true.

1. The tool has a distinct connector profile, token issuance path, and operator-facing setup guide.
2. Tokens are scoped to one idea, one actor, one tool, one organization boundary, and a short expiry window.
3. Token records are stored hashed server-side and can be individually revoked.
4. The server write path allows only expected implementation task fields and rejects secrets, arbitrary artifacts, raw source code, and cross-idea writes.
5. Completion payloads are idempotent by task code, source tool, and selected idea.
6. The UI clearly shows connection status, expiry, revoke action, automatic path, and fallback manual import path.
7. The package never prints token values after download and never stores secrets in docs, logs, screenshots, or generated Markdown.
8. The production smoke covers allowed write, wrong idea denied, revoked token denied, UI rendering, and cleanup.
9. Rollback is documented: revoke connection, rotate signing secret if needed, hide connector entry point, and keep package-only handoff available.

## Minimum Server Contract

Each live connector must send a constrained completion payload:

```json
{
  "projectKey": "short-public-project-key",
  "tool": "tool-key",
  "task": "T-001 task title",
  "status": "todo | doing | blocked | done",
  "summary": "short completion summary",
  "files": ["changed/path.ts"],
  "verification": "commands and result summary",
  "next": "optional next task or blocker"
}
```

The server may store or update:

- `implementation_tasks.title`
- `implementation_tasks.status`
- `implementation_tasks.owner_role`
- `implementation_tasks.acceptance_criteria`
- `implementation_tasks.evidence`

The server must not accept:

- arbitrary SQL
- environment variable values
- credentials or access tokens
- raw customer data
- writes to another idea or organization
- launch, release, or billing status changes

## Smoke Matrix

Every connector promotion needs a production smoke with disposable data.

| Check | Required Result |
| --- | --- |
| Issue token | Active token is created for the selected idea and tool |
| Allowed write | One progress update creates or updates the expected task |
| Cross-idea write | Token cannot update a different idea |
| Revoked write | Revoked token returns unauthorized |
| Expired write | Expired token returns unauthorized |
| UI rendering | STEP 7 shows the correct tool setup and STEP 8 shows the synced task |
| Fallback import | Manual completion-report import still works |
| Cleanup | Disposable idea and linked records are removed or explicitly retained |

## UI Contract

For a live connector:

- Primary action names the actual setup artifact, for example `Cursor 연결 파일 받기`, `Codex 연결 파일 받기`, `Claude Code 연결 파일 받기`, or `Google Antigravity 연결 파일 받기`.
- The screen shows exactly where the file should be placed and which command to run.
- The screen explains how the external tool reports progress back to Venture Lab.
- Manual import is collapsed as a backup path.

For a package-only handoff:

- Primary action is `시작 패키지 받기`.
- The screen says the tool uses completion-report import, not live automatic write-back.
- The screen may offer `Cursor로 바꾸기` only as an explicit alternative.
- The screen must not show the Cursor setup button or imply automatic remote writes.

## Promotion Checklist

Before moving any future tool from package-only to live sync, record:

- connector owner
- supported operating systems or runtime assumptions
- exact files generated
- token scope and expiry
- revoke UI behavior
- allowed write fields
- denied-case evidence
- smoke command and result
- rollback steps
- decision-log entry
- risk-register update

Validation keywords: `external_connector_writeback_boundary`, `package_only_until_scoped_writeback`, `tool_specific_token_required`, `revoked_token_denied_required`, `cross_idea_write_denied_required`.
