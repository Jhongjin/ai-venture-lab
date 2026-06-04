import { toDownloadFileName } from "@/lib/download-file-name";
import { getCursorTaskCode, type ImplementationTaskDraft } from "@/lib/external-progress-import";
import {
  implementationTaskPriorityLabels,
  implementationTaskStatusLabels,
  implementationTaskTypeLabels,
  sortImplementationTasksForExecution,
} from "@/lib/implementation-task-metadata";
import type { ProductSurfaceProfile } from "@/lib/product-surface";
import type { Idea, ImplementationTask } from "@/lib/venture-data";

const implementationTaskCompletionReportTemplate = `### 완료 보고 형식

- 변경 파일:
- 실행한 검증:
- 남은 리스크:
- 다음 작업:`;

const externalStartPromptIntentSentence =
  'Venture Lab의 의도는 "문서를 많이 읽는 것"이 아니라 검증된 범위를 기준으로 실제 제작을 안전하게 시작하는 것입니다.';

type ExternalToolProjectContext = {
  idea: Pick<Idea, "name">;
  productSurface: Pick<ProductSurfaceProfile, "label" | "firstBuild">;
  projectKey?: string;
  syncExpiresAt?: string;
};

export function formatExternalToolSyncExpiryText(syncExpiresAt?: string) {
  return syncExpiresAt ? `\n- 자동 반영 토큰 만료: ${syncExpiresAt}` : "";
}

export function buildExternalToolProjectContextLines({
  idea,
  productSurface,
  projectKey,
}: ExternalToolProjectContext) {
  const projectKeyLine = projectKey ? `- 프로젝트 키: ${projectKey}\n` : "";

  return `${projectKeyLine}- 아이디어: ${idea.name}
- 결과물 형태: ${productSurface.label}
- 첫 제작 기준: ${productSurface.firstBuild}`;
}

export function buildExternalToolProjectInfoSection({
  idea,
  productSurface,
  projectKey,
  syncExpiresAt,
}: ExternalToolProjectContext) {
  return `## 프로젝트 정보

${buildExternalToolProjectContextLines({ idea, productSurface, projectKey })}
${formatExternalToolSyncExpiryText(syncExpiresAt)}`;
}

export function buildExternalToolSyncSecuritySection(syncFilePath: string) {
  return `## 보안 주의

- \`${syncFilePath}\`에는 프로젝트 전용 토큰이 들어 있습니다.
- 설치 스크립트가 이 파일과 진행 기록 파일을 \`.gitignore\`에 추가합니다.
- 이 파일을 Git, Slack, 문서, 스크린샷에 공유하지 마세요.`;
}

export function buildExternalToolRecordProgressExampleCommand(toolFolder: string) {
  return `node ${toolFolder}/venture-lab-cli.mjs record-progress --task T-001 --status done --summary "완료한 내용" --file src/app/page.tsx --verification "pnpm build passed"`;
}

export function buildExternalToolNextTaskCommand(toolFolder: string) {
  return `node ${toolFolder}/venture-lab-cli.mjs next-task`;
}

export function buildExternalToolProgressFilePath(toolFolder: string) {
  return `${toolFolder}/venture-lab-progress.json`;
}

export function buildExternalToolBackupProgressImportInstruction({
  includeFinalExecutionTarget = false,
  toolFolder,
}: {
  includeFinalExecutionTarget?: boolean;
  toolFolder: string;
}) {
  const target = includeFinalExecutionTarget ? "최종 실행 화면의 백업 가져오기에" : "백업 가져오기에";

  return `자동 반영이 실패한 경우에만 \`${buildExternalToolProgressFilePath(toolFolder)}\` 내용을 ${target} 붙여넣습니다.`;
}

export function buildExternalToolRecordProgressCommandBlock(toolFolder: string) {
  return `\`\`\`powershell
${buildExternalToolRecordProgressExampleCommand(toolFolder)}
\`\`\``;
}

export function buildExternalToolSetupCommandBlock(ideaName: string, fileKind: string) {
  return `\`\`\`powershell
powershell -ExecutionPolicy Bypass -File .\\${toDownloadFileName(ideaName, fileKind, "ps1")}
\`\`\``;
}

export function buildSavedExternalToolTaskSection(task: ImplementationTask, index: number) {
  const taskCode = getCursorTaskCode(index);

  return `## ${taskCode} ${task.title}

- 상태: ${implementationTaskStatusLabels[task.status]}
- 유형: ${implementationTaskTypeLabels[task.task_type]}
- 우선순위: ${implementationTaskPriorityLabels[task.priority]}
- 담당 역할: ${task.owner_role || "미정"}

### 수용 기준

${task.acceptance_criteria || "제작 패키지의 범위와 품질 기준을 따릅니다."}

${implementationTaskCompletionReportTemplate}`;
}

export function buildFallbackExternalToolTaskSection(task: ImplementationTaskDraft, index: number) {
  const taskCode = getCursorTaskCode(index);

  return `## ${taskCode} ${task.title}

- 상태: 할 일
- 유형: ${implementationTaskTypeLabels[task.task_type]}
- 우선순위: ${implementationTaskPriorityLabels[task.priority]}
- 담당 역할: ${task.owner_role || "미정"}
- Venture Lab 저장 상태: 아직 작업 보드에는 저장 전입니다. Cursor의 \`venture_record_progress\` 도구로 완료 보고를 남기면 서버에 자동 반영됩니다.

### 수용 기준

${task.acceptance_criteria || "제작 패키지의 범위와 품질 기준을 따릅니다."}

${implementationTaskCompletionReportTemplate}`;
}

export function buildExternalToolTaskBody({
  fallbackTasks = [],
  tasks,
}: {
  fallbackTasks?: ImplementationTaskDraft[];
  tasks: ImplementationTask[];
}) {
  const savedTaskSections = buildSavedExternalToolTaskSections(tasks);

  if (savedTaskSections) {
    return savedTaskSections;
  }

  const fallbackTaskSections = buildFallbackExternalToolTaskSections(fallbackTasks);

  if (fallbackTaskSections) {
    return fallbackTaskSections;
  }

  return "아직 저장된 제작 작업이 없습니다. Venture Lab STEP 6에서 작업 순서를 먼저 생성하세요.";
}

export function buildSavedExternalToolTaskSections(tasks: ImplementationTask[]) {
  return sortImplementationTasksForExecution(tasks).map(buildSavedExternalToolTaskSection).join("\n\n");
}

export function buildFallbackExternalToolTaskSections(fallbackTasks: ImplementationTaskDraft[]) {
  return fallbackTasks.map(buildFallbackExternalToolTaskSection).join("\n\n");
}

export function buildCursorTaskMarkdown({
  idea,
  productSurface,
  tasks,
  fallbackTasks = [],
}: {
  idea: Idea;
  productSurface: ProductSurfaceProfile;
  tasks: ImplementationTask[];
  fallbackTasks?: ImplementationTaskDraft[];
}) {
  const taskBody = buildExternalToolTaskBody({ fallbackTasks, tasks });

  return `# Cursor 작업 목록

## 프로젝트

${buildExternalToolProjectContextLines({ idea, productSurface })}

## 작업 원칙

- 한 번에 하나의 작업만 진행합니다.
- 작업 전 \`AI_VENTURE_PACKAGE.md\`와 이 파일을 먼저 읽습니다.
- 완료 보고에는 변경 파일, 검증 명령, 남은 리스크를 남깁니다.
- 작업이 끝나면 Cursor MCP의 \`venture_record_progress\` 도구로 상태, 요약, 변경 파일, 검증 결과를 남깁니다.
- 범위 밖 기능은 바로 구현하지 말고 보류 메모로 남깁니다.

${taskBody}
`;
}

export function buildCursorStartPromptMarkdown({
  idea,
  productSurface,
  projectKey,
}: {
  idea: Idea;
  productSurface: ProductSurfaceProfile;
  projectKey: string;
}) {
  return `# Cursor 시작 지시문

당신은 AI Venture Lab에서 검증과 제작 준비가 끝난 프로젝트를 이어받는 Cursor 개발 에이전트입니다.

먼저 아래 파일을 읽고, 첫 번째 작업부터 순서대로 진행하세요.

1. \`AI_VENTURE_PACKAGE.md\`
2. \`AI_VENTURE_TASKS.md\`
3. \`.cursor/rules/ai-venture-lab.mdc\`

## 프로젝트 맥락

${buildExternalToolProjectContextLines({ idea, productSurface, projectKey })}

## 진행 방식

1. 제작 패키지에서 포함 범위와 제외 범위를 확인합니다.
2. \`AI_VENTURE_TASKS.md\`의 첫 번째 미완료 작업을 선택합니다.
3. 구현 전 변경할 파일과 검증 명령을 짧게 계획합니다.
4. 작업 완료 후 테스트 또는 품질 명령을 실행합니다.
5. 연결 도구가 보이면 \`venture_record_progress\`에 작업 결과를 기록합니다.
6. 기록이 끝나면 Venture Lab 최종 실행 화면을 새로고침해 서버에 반영된 작업 상태를 확인합니다. ${buildExternalToolBackupProgressImportInstruction({ toolFolder: ".cursor" })}

${externalStartPromptIntentSentence}
`;
}

export function buildCursorRulesMarkdown({
  idea,
  productSurface,
}: {
  idea: Idea;
  productSurface: ProductSurfaceProfile;
}) {
  return `---
description: AI Venture Lab 제작 패키지와 작업 순서를 따르는 Cursor 규칙
alwaysApply: true
---

# AI Venture Lab 규칙

이 프로젝트는 AI Venture Lab에서 검증된 제작 패키지를 기준으로 구현합니다.

## 반드시 먼저 읽을 파일

- \`AI_VENTURE_PACKAGE.md\`
- \`AI_VENTURE_TASKS.md\`
- \`AI_VENTURE_CURSOR_START.md\`

## 프로젝트 기준

${buildExternalToolProjectContextLines({ idea, productSurface })}

## 실행 원칙

- 한 번에 하나의 작업만 구현합니다.
- 패키지에 없는 큰 기능은 임의로 추가하지 않습니다.
- 변경 전 포함 범위, 제외 범위, 수용 기준을 확인합니다.
- 작업이 끝나면 변경 파일, 검증 명령, 남은 리스크를 보고합니다.
- 연결 도구가 보이면 \`venture_next_task\`로 다음 작업을 확인하고 \`venture_record_progress\`로 진행 결과를 남깁니다.
- \`venture_record_progress\`는 로컬 기록과 Venture Lab 서버 반영을 함께 처리합니다. 실패하면 \`${buildExternalToolProgressFilePath(".cursor")}\`을 백업으로 사용합니다.
`;
}

export function buildCursorGuideMarkdown({
  idea,
  productSurface,
  projectKey,
  syncExpiresAt,
}: {
  idea: Idea;
  productSurface: ProductSurfaceProfile;
  projectKey: string;
  syncExpiresAt?: string;
}) {
  return `# Cursor 연결 가이드

이 폴더는 AI Venture Lab에서 만든 제작 패키지를 Cursor 프로젝트에 연결하기 위한 자료입니다.

## 이 패키지가 만드는 것

- \`AI_VENTURE_PACKAGE.md\`: 최종 제작 패키지
- \`AI_VENTURE_TASKS.md\`: Cursor가 순서대로 처리할 제작 작업
- \`AI_VENTURE_CURSOR_START.md\`: Cursor Composer에 붙여 넣을 시작 지시문
- \`.cursor/rules/ai-venture-lab.mdc\`: Cursor가 항상 참고할 프로젝트 규칙
- \`.cursor/mcp.json\`: 프로젝트 전용 MCP 서버 설정
- \`.cursor/venture-lab-cli.mjs\`: 로컬 CLI 겸 MCP 브리지
- \`.cursor/venture-lab-mcp-server.mjs\`: 기존 설정 호환용 MCP 실행 파일
- \`.cursor/venture-lab-sync.json\`: Venture Lab 자동 반영 토큰과 서버 주소
- \`.cursor/venture-lab-progress.json\`: Cursor 작업 진행 기록

## 실행 순서

1. Cursor에서 실제 개발할 프로젝트 폴더를 엽니다.
2. Venture Lab에서 받은 \`*-cursor-setup.ps1\` 파일을 프로젝트 루트에 둡니다.
3. PowerShell에서 먼저 아래 설치 명령을 실행합니다.

${buildExternalToolSetupCommandBlock(idea.name, "cursor-setup")}

4. 설치가 끝난 뒤 같은 터미널에서 아래 확인 명령을 실행해 T-001 첫 작업이 읽히는지 확인합니다.

\`\`\`bash
${buildExternalToolNextTaskCommand(".cursor")}
\`\`\`

5. 확인 명령 결과에 T-001이 보이면 Cursor를 새로고침하거나 다시 열고, Settings > MCP의 \`Workspace MCP Servers\`에서 \`ai-venture-lab\`을 켭니다. 처음 1회는 Cursor 보안 확인 때문에 수동 활성화가 필요할 수 있습니다.
6. \`ai-venture-lab\`이 Enabled 상태이고 도구가 활성화됐는지 확인합니다.
7. \`AI_VENTURE_CURSOR_START.md\` 내용을 Cursor Composer 첫 메시지로 붙여 넣고 첫 작업을 시작합니다.
8. 작업을 마치면 Cursor에게 \`venture_record_progress\` 도구로 완료 보고를 남기라고 지시합니다.
9. Venture Lab 최종 실행 화면을 새로고침하면 서버에 반영된 작업 상태를 확인할 수 있습니다.
10. ${buildExternalToolBackupProgressImportInstruction({ includeFinalExecutionTarget: true, toolFolder: ".cursor" })}

${buildExternalToolProjectInfoSection({ idea, productSurface, projectKey, syncExpiresAt })}

## 현재 동기화 범위

이번 연결은 Cursor 프로젝트 안에 파일, 로컬 MCP 브리지, 프로젝트 전용 자동 반영 토큰을 설치합니다. Cursor는 제작 패키지, 작업 목록, 시작 지시문을 바로 읽을 수 있고, 진행 기록은 \`${buildExternalToolProgressFilePath(".cursor")}\`에 남깁니다.

\`venture_record_progress\` 도구는 같은 내용을 Venture Lab 서버에도 보냅니다. 서버는 연결 파일에 포함된 토큰으로 해당 아이디어의 제작 작업 상태만 저장하거나 갱신합니다.

${buildExternalToolSyncSecuritySection(".cursor/venture-lab-sync.json")}
`;
}

export function buildCodexTaskMarkdown({
  idea,
  productSurface,
  tasks,
  fallbackTasks = [],
}: {
  idea: Idea;
  productSurface: ProductSurfaceProfile;
  tasks: ImplementationTask[];
  fallbackTasks?: ImplementationTaskDraft[];
}) {
  return buildCursorTaskMarkdown({ idea, productSurface, tasks, fallbackTasks })
    .replace(/^# Cursor 작업 목록/, "# Codex 작업 목록")
    .replaceAll("Cursor의 `venture_record_progress` 도구", "Codex의 `.codex/venture-lab-cli.mjs record-progress` 명령")
    .replaceAll("Cursor MCP의 `venture_record_progress` 도구", "Codex CLI의 `record-progress` 명령")
    .replaceAll("Cursor 진행 결과", "Codex 진행 결과")
    .replaceAll("Cursor", "Codex");
}

export function buildCodexStartPromptMarkdown({
  idea,
  productSurface,
  projectKey,
}: {
  idea: Idea;
  productSurface: ProductSurfaceProfile;
  projectKey: string;
}) {
  return `# Codex 시작 지시문

당신은 AI Venture Lab에서 검증과 제작 준비가 끝난 프로젝트를 이어받는 Codex 개발 에이전트입니다.

먼저 아래 파일을 읽고, 첫 번째 미완료 작업부터 순서대로 진행하세요.

1. \`AI_VENTURE_PACKAGE.md\`
2. \`AI_VENTURE_TASKS.md\`
3. \`AGENTS.ai-venture-lab.md\`

## 프로젝트 맥락

${buildExternalToolProjectContextLines({ idea, productSurface, projectKey })}

## 진행 방식

1. 제작 패키지에서 포함 범위와 제외 범위를 확인합니다.
2. \`${buildExternalToolNextTaskCommand(".codex")}\`로 첫 번째 미완료 작업을 확인합니다.
3. 구현 전 변경할 파일과 검증 명령을 짧게 계획합니다.
4. 한 번에 하나의 작업만 구현하고 테스트 또는 품질 명령을 실행합니다.
5. 작업 완료 후 아래 형식으로 Venture Lab에 진행 결과를 기록합니다.

${buildExternalToolRecordProgressCommandBlock(".codex")}

6. 기록이 끝나면 Venture Lab 최종 실행 화면을 새로고침해 서버에 반영된 작업 상태를 확인합니다.
7. ${buildExternalToolBackupProgressImportInstruction({ toolFolder: ".codex" })}

${externalStartPromptIntentSentence}
`;
}

export function buildCodexAgentInstructionsMarkdown({
  idea,
  productSurface,
}: {
  idea: Idea;
  productSurface: ProductSurfaceProfile;
}) {
  return `# AI Venture Lab Codex Instructions

이 프로젝트는 AI Venture Lab에서 검증된 제작 패키지를 기준으로 구현합니다.

## 반드시 먼저 읽을 파일

- \`AI_VENTURE_PACKAGE.md\`
- \`AI_VENTURE_TASKS.md\`
- \`AI_VENTURE_CODEX_START.md\`

## 프로젝트 기준

${buildExternalToolProjectContextLines({ idea, productSurface })}

## 실행 원칙

- 한 번에 하나의 작업만 구현합니다.
- 패키지에 없는 큰 기능은 임의로 추가하지 않습니다.
- 변경 전 포함 범위, 제외 범위, 수용 기준을 확인합니다.
- 작업이 끝나면 변경 파일, 검증 명령, 남은 리스크를 보고합니다.
- 다음 작업은 \`${buildExternalToolNextTaskCommand(".codex")}\`로 확인합니다.
- 완료 보고는 \`node .codex/venture-lab-cli.mjs record-progress --task T-001 --status done --summary "..." --verification "..."\` 형식으로 남깁니다.
- \`record-progress\`는 로컬 기록과 Venture Lab 서버 반영을 함께 처리합니다. 실패하면 \`${buildExternalToolProgressFilePath(".codex")}\`을 백업으로 사용합니다.
`;
}

export function buildCodexGuideMarkdown({
  idea,
  productSurface,
  projectKey,
  syncExpiresAt,
}: {
  idea: Idea;
  productSurface: ProductSurfaceProfile;
  projectKey: string;
  syncExpiresAt?: string;
}) {
  return `# Codex 연결 가이드

이 폴더는 AI Venture Lab에서 만든 제작 패키지를 Codex 작업 세션에 연결하기 위한 자료입니다.

## 이 패키지가 만드는 것

- \`AI_VENTURE_PACKAGE.md\`: 최종 제작 패키지
- \`AI_VENTURE_TASKS.md\`: Codex가 순서대로 처리할 제작 작업
- \`AI_VENTURE_CODEX_START.md\`: Codex 첫 메시지로 넣을 시작 지시문
- \`AGENTS.ai-venture-lab.md\`: Codex가 참고할 프로젝트 작업 규칙
- \`README_VENTURE_LAB_CODEX.md\`: 이 연결 가이드
- \`.codex/venture-lab-cli.mjs\`: 로컬 CLI 연결 파일
- \`.codex/venture-lab-sync.json\`: Venture Lab 자동 반영 토큰과 서버 주소
- \`.codex/venture-lab-progress.json\`: Codex 작업 진행 기록

## 실행 순서

1. 실제 개발할 프로젝트 폴더에 Venture Lab에서 받은 \`*-codex-setup.ps1\` 파일을 둡니다.
2. 프로젝트 루트에서 아래 명령을 실행합니다.

${buildExternalToolSetupCommandBlock(idea.name, "codex-setup")}

3. 터미널에서 \`${buildExternalToolNextTaskCommand(".codex")}\`를 실행해 결과에 T-001이 보이는지 확인합니다.
4. T-001이 보이면 Codex에서 같은 프로젝트 폴더를 열고 \`AI_VENTURE_CODEX_START.md\` 내용을 첫 메시지로 넣습니다.
5. Codex에게 T-001부터 한 번에 하나씩 구현하라고 지시합니다.
6. 작업을 마치면 Codex가 \`.codex/venture-lab-cli.mjs record-progress\` 명령으로 완료 보고를 남기게 합니다.
7. Venture Lab 최종 실행 화면을 새로고침하면 서버에 반영된 작업 상태를 확인할 수 있습니다.
8. ${buildExternalToolBackupProgressImportInstruction({ includeFinalExecutionTarget: true, toolFolder: ".codex" })}

${buildExternalToolProjectInfoSection({ idea, productSurface, projectKey, syncExpiresAt })}

${buildExternalToolSyncSecuritySection(".codex/venture-lab-sync.json")}
`;
}

export function buildClaudeTaskMarkdown({
  idea,
  productSurface,
  tasks,
  fallbackTasks = [],
}: {
  idea: Idea;
  productSurface: ProductSurfaceProfile;
  tasks: ImplementationTask[];
  fallbackTasks?: ImplementationTaskDraft[];
}) {
  return buildCursorTaskMarkdown({ idea, productSurface, tasks, fallbackTasks })
    .replaceAll("# Cursor 작업 목록", "# Claude Code 작업 목록")
    .replaceAll("Cursor", "Claude Code")
    .replaceAll(".cursor", ".claude")
    .replaceAll("AI_VENTURE_CURSOR_START.md", "AI_VENTURE_CLAUDE_START.md")
    .replaceAll("README_VENTURE_LAB_CURSOR.md", "README_VENTURE_LAB_CLAUDE.md");
}

export function buildClaudeStartPromptMarkdown({
  idea,
  productSurface,
  projectKey,
}: {
  idea: Idea;
  productSurface: ProductSurfaceProfile;
  projectKey: string;
}) {
  return `# Claude Code 시작 지시문

당신은 AI Venture Lab에서 검증과 제작 준비가 끝난 프로젝트를 이어받는 Claude Code 개발 에이전트입니다.

먼저 아래 파일을 읽고, 첫 번째 작업부터 순서대로 진행하세요.

1. \`AI_VENTURE_PACKAGE.md\`
2. \`AI_VENTURE_TASKS.md\`
3. \`CLAUDE.md\`

## 프로젝트 맥락

${buildExternalToolProjectContextLines({ idea, productSurface, projectKey })}

## 진행 방식

1. 제작 패키지에서 포함 범위와 제외 범위를 확인합니다.
2. Claude Code에서 \`/mcp\`를 열어 \`ai-venture-lab\` 연결을 확인합니다.
3. \`${buildExternalToolNextTaskCommand(".claude")}\`로 첫 번째 미완료 작업을 확인합니다.
4. 구현 전 변경할 파일과 검증 명령을 짧게 계획합니다.
5. 한 번에 하나의 작업만 구현하고 테스트 또는 품질 명령을 실행합니다.
6. 작업 완료 후 \`venture_record_progress\` 도구 또는 아래 명령으로 Venture Lab에 진행 결과를 기록합니다.

${buildExternalToolRecordProgressCommandBlock(".claude")}

7. 기록이 끝나면 Venture Lab 최종 실행 화면을 새로고침해 서버에 반영된 작업 상태를 확인합니다.
8. ${buildExternalToolBackupProgressImportInstruction({ toolFolder: ".claude" })}

${externalStartPromptIntentSentence}
`;
}

export function buildClaudeInstructionsMarkdown({
  idea,
  productSurface,
}: {
  idea: Idea;
  productSurface: ProductSurfaceProfile;
}) {
  return `# AI Venture Lab Claude Code Instructions

이 프로젝트는 AI Venture Lab에서 검증된 제작 패키지를 기준으로 구현합니다.

## 반드시 먼저 읽을 파일

- \`AI_VENTURE_PACKAGE.md\`
- \`AI_VENTURE_TASKS.md\`
- \`AI_VENTURE_CLAUDE_START.md\`

## 프로젝트 기준

${buildExternalToolProjectContextLines({ idea, productSurface })}

## 실행 원칙

- 한 번에 하나의 작업만 구현합니다.
- 패키지에 없는 큰 기능은 임의로 추가하지 않습니다.
- 변경 전 포함 범위, 제외 범위, 수용 기준을 확인합니다.
- 작업이 끝나면 변경 파일, 검증 명령, 남은 리스크를 보고합니다.
- Claude Code의 \`/mcp\`에서 \`ai-venture-lab\` 서버가 보이면 \`venture_next_task\`와 \`venture_record_progress\`를 사용합니다.
- CLI로 진행할 때는 \`${buildExternalToolNextTaskCommand(".claude")}\`와 \`node .claude/venture-lab-cli.mjs record-progress --task T-001 --status done --summary "..."\`를 사용합니다.
- \`record-progress\`는 로컬 기록과 Venture Lab 서버 반영을 함께 처리합니다. 실패하면 \`${buildExternalToolProgressFilePath(".claude")}\`을 백업으로 사용합니다.
`;
}

export function buildClaudeGuideMarkdown({
  idea,
  productSurface,
  projectKey,
  syncExpiresAt,
}: {
  idea: Idea;
  productSurface: ProductSurfaceProfile;
  projectKey: string;
  syncExpiresAt?: string;
}) {
  return `# Claude Code 연결 가이드

이 폴더는 AI Venture Lab에서 만든 제작 패키지를 Claude Code 프로젝트에 연결하기 위한 자료입니다.

## 이 패키지가 만드는 것

- \`AI_VENTURE_PACKAGE.md\`: 최종 제작 패키지
- \`AI_VENTURE_TASKS.md\`: Claude Code가 순서대로 처리할 제작 작업
- \`AI_VENTURE_CLAUDE_START.md\`: Claude Code 첫 메시지로 넣을 시작 지시문
- \`CLAUDE.md\`: Claude Code가 참고할 프로젝트 작업 규칙
- \`README_VENTURE_LAB_CLAUDE.md\`: 이 연결 가이드
- \`.mcp.json\`: 프로젝트 전용 MCP 서버 설정
- \`.claude/venture-lab-cli.mjs\`: 로컬 CLI 겸 MCP 브리지
- \`.claude/venture-lab-sync.json\`: Venture Lab 자동 반영 토큰과 서버 주소
- \`.claude/venture-lab-progress.json\`: Claude Code 작업 진행 기록

## 실행 순서

1. 실제 개발할 프로젝트 폴더에 Venture Lab에서 받은 \`*-claude-code-setup.ps1\` 파일을 둡니다.
2. 프로젝트 루트에서 아래 명령을 실행합니다.

${buildExternalToolSetupCommandBlock(idea.name, "claude-code-setup")}

3. 터미널에서 \`${buildExternalToolNextTaskCommand(".claude")}\`를 실행해 결과에 T-001이 보이는지 확인합니다.
4. T-001이 보이면 Claude Code를 같은 프로젝트 루트에서 열고 \`/mcp\`에서 \`ai-venture-lab\` 연결을 확인합니다.
5. \`AI_VENTURE_CLAUDE_START.md\` 내용을 첫 메시지로 넣습니다.
6. 작업을 마치면 \`venture_record_progress\` 도구 또는 \`.claude/venture-lab-cli.mjs record-progress\` 명령으로 완료 보고를 남깁니다.
7. Venture Lab 최종 실행 화면을 새로고침하면 서버에 반영된 작업 상태를 확인할 수 있습니다.
8. ${buildExternalToolBackupProgressImportInstruction({ includeFinalExecutionTarget: true, toolFolder: ".claude" })}

${buildExternalToolProjectInfoSection({ idea, productSurface, projectKey, syncExpiresAt })}

${buildExternalToolSyncSecuritySection(".claude/venture-lab-sync.json")}
`;
}

export function buildAntigravityTaskMarkdown({
  idea,
  productSurface,
  tasks,
  fallbackTasks = [],
}: {
  idea: Idea;
  productSurface: ProductSurfaceProfile;
  tasks: ImplementationTask[];
  fallbackTasks?: ImplementationTaskDraft[];
}) {
  return buildCursorTaskMarkdown({ idea, productSurface, tasks, fallbackTasks })
    .replaceAll("# Cursor 작업 목록", "# Google Antigravity 작업 목록")
    .replaceAll("Cursor", "Google Antigravity")
    .replaceAll(".cursor", ".antigravity")
    .replaceAll("AI_VENTURE_CURSOR_START.md", "AI_VENTURE_ANTIGRAVITY_START.md")
    .replaceAll("README_VENTURE_LAB_CURSOR.md", "README_VENTURE_LAB_ANTIGRAVITY.md");
}

export function buildAntigravityStartPromptMarkdown({
  idea,
  productSurface,
  projectKey,
}: {
  idea: Idea;
  productSurface: ProductSurfaceProfile;
  projectKey: string;
}) {
  return `# Google Antigravity 시작 지시문

당신은 AI Venture Lab에서 검증과 제작 준비가 끝난 프로젝트를 이어받는 Antigravity 개발 에이전트입니다.

먼저 아래 파일을 읽고, 첫 번째 작업부터 순서대로 진행하세요.

1. \`AI_VENTURE_PACKAGE.md\`
2. \`AI_VENTURE_TASKS.md\`
3. \`AGENTS.ai-venture-lab.md\`
4. \`AI_VENTURE_ACCEPTANCE.md\`

## 프로젝트 맥락

${buildExternalToolProjectContextLines({ idea, productSurface, projectKey })}

## 진행 방식

1. 제작 패키지에서 포함 범위와 제외 범위를 확인합니다.
2. \`${buildExternalToolNextTaskCommand(".antigravity")}\`로 첫 번째 미완료 작업을 확인합니다.
3. 구현 전 변경할 파일과 검증 명령을 짧게 계획합니다.
4. 한 번에 하나의 작업만 구현하고 테스트 또는 품질 명령을 실행합니다.
5. 작업 완료 후 아래 명령으로 Venture Lab에 진행 결과를 기록합니다.

${buildExternalToolRecordProgressCommandBlock(".antigravity")}

6. 기록이 끝나면 Venture Lab 최종 실행 화면을 새로고침해 서버에 반영된 작업 상태를 확인합니다.
7. ${buildExternalToolBackupProgressImportInstruction({ toolFolder: ".antigravity" })}

${externalStartPromptIntentSentence}
`;
}

export function buildAntigravityGuideMarkdown({
  idea,
  productSurface,
  projectKey,
  syncExpiresAt,
}: {
  idea: Idea;
  productSurface: ProductSurfaceProfile;
  projectKey: string;
  syncExpiresAt?: string;
}) {
  return `# Google Antigravity 연결 가이드

이 폴더는 AI Venture Lab에서 만든 제작 패키지를 Google Antigravity 프로젝트에 연결하기 위한 자료입니다.

## 이 패키지가 만드는 것

- \`AI_VENTURE_PACKAGE.md\`: 최종 제작 패키지
- \`AI_VENTURE_TASKS.md\`: Antigravity가 순서대로 처리할 제작 작업
- \`AI_VENTURE_ANTIGRAVITY_START.md\`: Antigravity Agent 첫 메시지로 넣을 시작 지시문
- \`AI_VENTURE_ACCEPTANCE.md\`: 검증과 완료 기준
- \`AGENTS.ai-venture-lab.md\`: 프로젝트 작업 규칙
- \`README_VENTURE_LAB_ANTIGRAVITY.md\`: 이 연결 가이드
- \`.antigravity/mcp_config.json\`: Antigravity MCP 설정 후보
- \`.antigravity/venture-lab-cli.mjs\`: 로컬 CLI 겸 MCP 브리지
- \`.antigravity/venture-lab-sync.json\`: Venture Lab 자동 반영 토큰과 서버 주소
- \`.antigravity/venture-lab-progress.json\`: Antigravity 작업 진행 기록

## 실행 순서

1. 실제 개발할 프로젝트 폴더에 Venture Lab에서 받은 \`*-antigravity-setup.ps1\` 파일을 둡니다.
2. 프로젝트 루트에서 아래 명령을 실행합니다.

${buildExternalToolSetupCommandBlock(idea.name, "antigravity-setup")}

3. 터미널에서 \`${buildExternalToolNextTaskCommand(".antigravity")}\`를 실행해 결과에 T-001이 보이는지 확인합니다.
4. T-001이 보이면 Antigravity에서 같은 프로젝트 폴더를 열고 \`.antigravity/mcp_config.json\`과 \`AGENTS.ai-venture-lab.md\`를 프로젝트 지침으로 확인합니다.
5. \`AI_VENTURE_ANTIGRAVITY_START.md\` 내용을 Agent 첫 메시지로 넣습니다.
6. 작업을 마치면 \`.antigravity/venture-lab-cli.mjs record-progress\` 명령으로 완료 보고를 남깁니다.
7. Venture Lab 최종 실행 화면을 새로고침하면 서버에 반영된 작업 상태를 확인할 수 있습니다.
8. ${buildExternalToolBackupProgressImportInstruction({ includeFinalExecutionTarget: true, toolFolder: ".antigravity" })}

${buildExternalToolProjectInfoSection({ idea, productSurface, projectKey, syncExpiresAt })}

${buildExternalToolSyncSecuritySection(".antigravity/venture-lab-sync.json")}
`;
}

export function buildAntigravityAgentInstructionsMarkdown({
  idea,
  productSurface,
}: {
  idea: Idea;
  productSurface: ProductSurfaceProfile;
}) {
  return buildCodexAgentInstructionsMarkdown({ idea, productSurface })
    .replaceAll("Codex", "Google Antigravity")
    .replaceAll(".codex", ".antigravity")
    .replaceAll("AI_VENTURE_CODEX_START.md", "AI_VENTURE_ANTIGRAVITY_START.md");
}

export function buildAntigravityAcceptanceMarkdown({
  idea,
  productSurface,
}: {
  idea: Idea;
  productSurface: ProductSurfaceProfile;
}) {
  return `# AI Venture Lab Acceptance Criteria

## 프로젝트

${buildExternalToolProjectContextLines({ idea, productSurface })}

## 완료 기준

- 핵심 사용자 여정이 첫 화면부터 저장/완료까지 끊기지 않아야 합니다.
- 빈 상태, 로딩, 성공, 실패, 권한 없음, 모바일 상태가 확인되어야 합니다.
- 패키지의 제외 범위는 구현하지 않고 보류 메모로 남겨야 합니다.
- 변경 파일, 검증 명령, 남은 리스크를 작업마다 기록해야 합니다.
- 완료 후 \`.antigravity/venture-lab-cli.mjs record-progress\`로 Venture Lab에 결과를 반영해야 합니다.
`;
}

