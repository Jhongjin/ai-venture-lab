export type BuildDeliveryMode = "venture_lab" | "external_tool";
export type ExternalBuildToolKey = "cursor" | "codex" | "claude_code" | "antigravity" | "generic_mcp";

export type ExternalBuildToolProfile = {
  key: ExternalBuildToolKey;
  label: string;
  description: string;
  packageFocus: string;
  startMethod: string;
  automationLabel: string;
  handoffFileSuffix: string;
  startFileName: string;
  packageFiles: string[];
  handoffSteps: string[];
  handoffNote: string;
};

export type BuildDeliveryPreference = {
  mode: BuildDeliveryMode;
  externalTool: ExternalBuildToolKey;
};

export const buildDeliveryModeLabels: Record<BuildDeliveryMode, string> = {
  venture_lab: "Venture Lab에서 계속 진행",
  external_tool: "외부 제작 도구로 개발",
};

export const externalBuildToolProfiles: Record<ExternalBuildToolKey, ExternalBuildToolProfile> = {
  cursor: {
    key: "cursor",
    label: "Cursor",
    description: "프로젝트 규칙과 작업 순서를 붙여 첫 수직 슬라이스를 구현합니다.",
    packageFocus: "목차 00-06, 제외 범위, 첫 태스크, 품질 명령을 Cursor 규칙 문맥으로 묶습니다.",
    startMethod: "제작 패키지를 프로젝트 규칙/참고 문서로 넣고 첫 태스크 하나만 선택해 구현합니다.",
    automationLabel: "자동 동기화 지원",
    handoffFileSuffix: "cursor-setup",
    startFileName: "AI_VENTURE_CURSOR_START.md",
    packageFiles: [
      ".cursor/rules/ai-venture-lab.mdc",
      ".cursor/mcp.json",
      ".cursor/venture-lab-mcp-server.mjs",
      ".cursor/venture-lab-sync.json",
      ".cursor/venture-lab-progress.json",
      "AI_VENTURE_PACKAGE.md",
      "AI_VENTURE_TASKS.md",
      "AI_VENTURE_CURSOR_START.md",
      "README_VENTURE_LAB_CURSOR.md",
    ],
    handoffSteps: [
      "Cursor 연결 파일을 받습니다.",
      "받은 PowerShell 파일을 실제 개발할 프로젝트 루트에 둡니다.",
      "Cursor에서 그 프로젝트를 열고 화면의 PowerShell 명령을 실행합니다.",
      "Cursor를 다시 열어 ai-venture-lab MCP 서버가 보이는지 확인합니다.",
      "AI_VENTURE_CURSOR_START.md를 Composer에 붙여 넣고 첫 작업을 시작합니다.",
      "작업 완료 후 venture_record_progress로 완료 보고를 남기면 Venture Lab 상태가 갱신됩니다.",
    ],
    handoffNote: "현재 실제 작업 상태 자동 반영은 Cursor 연결 파일에서 먼저 지원합니다.",
  },
  codex: {
    key: "codex",
    label: "Codex",
    description: "작업 범위, 변경 파일, 검증 명령, 배포/롤백 보고 형식까지 한 번에 전달합니다.",
    packageFocus: "AGENTS 지침, 변경 허용 범위, 품질 명령, 완료 보고 형식을 명확히 분리합니다.",
    startMethod: "제작 패키지를 첫 메시지로 넣고 변경 파일, 검증 명령, 배포 URL, 남은 리스크를 보고하게 합니다.",
    automationLabel: "패키지 전달",
    handoffFileSuffix: "codex-package",
    startFileName: "AI_VENTURE_CODEX_START.md",
    packageFiles: ["AGENTS.md", "AI_VENTURE_PACKAGE.md", "AI_VENTURE_TASKS.md", "AI_VENTURE_CODEX_START.md"],
    handoffSteps: [
      "Codex 작업 세션을 열고 실제 개발할 저장소를 선택합니다.",
      "패키지 파일 내용을 첫 메시지 또는 프로젝트 지침으로 전달합니다.",
      "AI_VENTURE_TASKS.md의 T-001부터 한 번에 하나씩 진행하라고 지시합니다.",
      "완료 보고에는 변경 파일, 검증 명령, 배포 URL, 남은 리스크를 포함하게 합니다.",
      "보고 내용을 Venture Lab 최종 실행 화면의 완료 보고 반영 영역에 붙여 상태를 갱신합니다.",
    ],
    handoffNote: "Codex는 현재 패키지 전달 방식입니다. 자동 상태 반영은 Cursor부터 제공하고, Codex는 완료 보고 반영으로 상태를 맞춥니다.",
  },
  claude_code: {
    key: "claude_code",
    label: "Claude Code",
    description: "승인된 제작 자료와 제외 범위를 먼저 고정하고 구현 대화를 시작합니다.",
    packageFocus: "기획/디자인/기술 자료와 제외 범위를 짧은 컨텍스트 순서로 정리합니다.",
    startMethod: "승인된 제작 자료와 작업 순서만 컨텍스트로 넣고 제외 범위를 먼저 확인합니다.",
    automationLabel: "패키지 전달",
    handoffFileSuffix: "claude-code-package",
    startFileName: "AI_VENTURE_CLAUDE_START.md",
    packageFiles: ["CLAUDE.md", "AI_VENTURE_PACKAGE.md", "AI_VENTURE_TASKS.md", "AI_VENTURE_CLAUDE_START.md"],
    handoffSteps: [
      "Claude Code를 실제 개발 저장소 루트에서 엽니다.",
      "패키지 파일 내용을 CLAUDE.md 또는 첫 대화 컨텍스트로 전달합니다.",
      "제외 범위와 첫 제작 범위를 먼저 재확인하게 합니다.",
      "AI_VENTURE_TASKS.md의 첫 작업만 구현하고 검증 결과를 보고하게 합니다.",
      "완료 보고를 Venture Lab에 반영해 작업 상태를 맞춥니다.",
    ],
    handoffNote: "Claude Code는 현재 패키지 전달 방식입니다. 자동 상태 반영은 Cursor부터 제공하고, Claude Code는 완료 보고 반영으로 상태를 맞춥니다.",
  },
  antigravity: {
    key: "antigravity",
    label: "Google Antigravity",
    description: "화면 구조, 기술 방향, 검증/배포 기준을 순서대로 등록해 첫 빌드를 진행합니다.",
    packageFocus: "화면 구조, 기술 경계, 검증 기준, 첫 수직 슬라이스를 단계 자료로 나눕니다.",
    startMethod: "화면 구조, 기술 방향, 검증/배포 기준을 순서대로 등록한 뒤 첫 수직 슬라이스만 실행합니다.",
    automationLabel: "패키지 전달",
    handoffFileSuffix: "antigravity-package",
    startFileName: "AI_VENTURE_ANTIGRAVITY_START.md",
    packageFiles: [
      "AI_VENTURE_ANTIGRAVITY_START.md",
      "AI_VENTURE_PACKAGE.md",
      "AI_VENTURE_TASKS.md",
      "AI_VENTURE_ACCEPTANCE.md",
    ],
    handoffSteps: [
      "Antigravity 프로젝트를 열고 실제 개발 저장소를 연결합니다.",
      "시작 지시문을 프로젝트 지침 또는 첫 작업 컨텍스트로 넣습니다.",
      "화면 구조, 기술 경계, 검증 기준을 순서대로 등록합니다.",
      "T-001부터 첫 수직 슬라이스만 실행하게 합니다.",
      "완료 보고를 Venture Lab에 반영해 작업 상태를 맞춥니다.",
    ],
    handoffNote: "Antigravity는 현재 패키지 전달 방식입니다. 자동 상태 반영은 Cursor부터 제공하고, Antigravity는 완료 보고 반영으로 상태를 맞춥니다.",
  },
  generic_mcp: {
    key: "generic_mcp",
    label: "범용 MCP 전달",
    description: "외부 도구가 읽을 리소스 URI, 권한, 완료 보고 형식을 중심으로 넘깁니다.",
    packageFocus: "읽기 전용 리소스 URI, 실행 명령 분리, 권한 범위, 완료 보고 형식을 고정합니다.",
    startMethod: "제작 패키지를 읽기 전용 기준 자료로 노출하고 실행 명령과 권한 범위를 분리합니다.",
    automationLabel: "리소스 계약",
    handoffFileSuffix: "mcp-handoff-package",
    startFileName: "AI_VENTURE_MCP_MANIFEST.md",
    packageFiles: ["AI_VENTURE_MCP_MANIFEST.md", "AI_VENTURE_PACKAGE.md", "AI_VENTURE_TASKS.md"],
    handoffSteps: [
      "외부 도구가 읽을 수 있는 리소스 위치에 패키지를 둡니다.",
      "읽기 전용 자료와 실행 권한을 분리합니다.",
      "첫 작업 하나와 완료 보고 형식을 외부 도구에 전달합니다.",
      "완료 보고를 Venture Lab에 반영해 작업 상태를 맞춥니다.",
    ],
    handoffNote: "범용 MCP 전달은 현재 계약 문서 기준입니다. 실제 원격 쓰기 연결은 도구별 커넥터가 필요합니다.",
  },
};

export const externalBuildToolOrder: ExternalBuildToolKey[] = [
  "cursor",
  "antigravity",
  "claude_code",
  "codex",
  "generic_mcp",
];

export const defaultBuildDeliveryPreference: BuildDeliveryPreference = {
  mode: "external_tool",
  externalTool: "cursor",
};

function isBuildDeliveryMode(value: string | null | undefined): value is BuildDeliveryMode {
  return value === "venture_lab" || value === "external_tool";
}

function isExternalBuildToolKey(value: string | null | undefined): value is ExternalBuildToolKey {
  return Boolean(value && value in externalBuildToolProfiles);
}

export function normalizeBuildDeliveryPreference(
  preference: Partial<BuildDeliveryPreference> | null | undefined,
): BuildDeliveryPreference {
  const externalTool = isExternalBuildToolKey(preference?.externalTool)
    ? preference.externalTool
    : defaultBuildDeliveryPreference.externalTool;

  return {
    mode: isBuildDeliveryMode(preference?.mode) ? preference.mode : defaultBuildDeliveryPreference.mode,
    externalTool,
  };
}

export function getExternalBuildToolProfile(preference: BuildDeliveryPreference) {
  return externalBuildToolProfiles[preference.externalTool] ?? externalBuildToolProfiles.cursor;
}

export function buildDeliveryPreferenceMarkdown(preference: BuildDeliveryPreference) {
  const normalized = normalizeBuildDeliveryPreference(preference);
  const isExternal = normalized.mode === "external_tool";
  const tool = getExternalBuildToolProfile(normalized);

  return `## 제작 방식

\`\`\`yaml
build_delivery_mode: ${normalized.mode}
build_delivery_label: ${buildDeliveryModeLabels[normalized.mode]}
external_tool: ${isExternal ? tool.key : "none"}
external_tool_label: ${isExternal ? tool.label : "none"}
final_execution_rule: external handoff or internal build opens only after the production package and task sequence are prepared
\`\`\`

- 제작 방식: ${buildDeliveryModeLabels[normalized.mode]}
- 선택 도구: ${isExternal ? tool.label : "Venture Lab 내부 진행"}
- 실행 시점: 제작 패키지와 작업 순서가 준비된 마지막 단계에서 실행합니다.`;
}

export function getBuildDeliveryPreferenceFromText(text: string | null | undefined): BuildDeliveryPreference | null {
  if (!text) {
    return null;
  }

  const modeMatch = text.match(/build_delivery_mode:\s*([a-z_]+)/i);
  const toolMatch = text.match(/external_tool:\s*([a-z_]+)/i);
  const modeValue = modeMatch?.[1]?.toLowerCase();
  const toolValue = toolMatch?.[1]?.toLowerCase();

  if (!isBuildDeliveryMode(modeValue)) {
    return null;
  }

  return normalizeBuildDeliveryPreference({
    mode: modeValue,
    externalTool: isExternalBuildToolKey(toolValue) ? toolValue : defaultBuildDeliveryPreference.externalTool,
  });
}

export function getBuildDeliveryPreferenceFromArtifacts(
  artifacts: Array<{ body?: string | null; created_at?: string | null }>,
) {
  const sortedArtifacts = [...artifacts].sort(
    (a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime(),
  );

  for (const artifact of sortedArtifacts) {
    const preference = getBuildDeliveryPreferenceFromText(artifact.body);

    if (preference) {
      return preference;
    }
  }

  return defaultBuildDeliveryPreference;
}
