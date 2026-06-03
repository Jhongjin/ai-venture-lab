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

export type BuildDeliveryPreferenceArtifact = {
  body?: string | null;
  created_at?: string | null;
};

export type BuildDeliveryPreferenceTextField = "build_delivery_mode" | "external_tool";

export type FinalExternalToolOverride = {
  ideaId: string | null;
  key: ExternalBuildToolKey;
} | null;

export type BuildDeliveryContext = {
  buildDeliveryMode: BuildDeliveryMode;
  persistedExternalBuildTool: ExternalBuildToolProfile;
  finalExternalToolOverrideKey: ExternalBuildToolKey | null;
  activeExternalBuildTool: ExternalBuildToolProfile;
  hasFinalExternalToolOverride: boolean;
  activeBuildDeliveryPhrase: string;
  activeBuildDeliveryLabel: string;
  activeBuildDeliveryDetail: string;
};

export const buildDeliveryModeLabels: Record<BuildDeliveryMode, string> = {
  venture_lab: "Venture Lab에서 계속 진행",
  external_tool: "외부 제작 도구로 개발",
};

export function getBuildDeliveryActionPhrase({
  buildDeliveryMode,
  externalToolLabel,
}: {
  buildDeliveryMode: BuildDeliveryMode;
  externalToolLabel: string;
}) {
  return buildDeliveryMode === "external_tool"
    ? `${externalToolLabel}로 개발합니다`
    : "Venture Lab에서 계속 진행합니다";
}

export function getBuildDeliveryDetail({
  buildDeliveryMode,
  externalToolLabel,
}: {
  buildDeliveryMode: BuildDeliveryMode;
  externalToolLabel: string;
}) {
  return buildDeliveryMode === "external_tool"
    ? `${externalToolLabel}에 맞춰 전달 자료와 시작 방법을 정리합니다. 실제 파일 받기와 연동은 마지막 단계에서 열립니다.`
    : "Venture Lab 안에서 작업 순서, 실행 할 일, 최종 실행, 성과 확인 화면으로 이어갑니다.";
}

export const externalBuildToolProfiles: Record<ExternalBuildToolKey, ExternalBuildToolProfile> = {
  cursor: {
    key: "cursor",
    label: "Cursor",
    description: "프로젝트 규칙과 작업 순서를 붙여 첫 수직 슬라이스를 구현합니다.",
    packageFocus: "목차 00-06, 제외 범위, 첫 태스크, 품질 명령을 Cursor 규칙 문맥으로 묶습니다.",
    startMethod: "설치 후 확인 명령에서 T-001을 본 뒤 START 파일을 첫 메시지로 넣고 첫 태스크 하나만 구현합니다.",
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
      "확인 명령에서 T-001이 보이면 Cursor를 다시 열어 ai-venture-lab MCP 서버를 확인합니다.",
      "AI_VENTURE_CURSOR_START.md를 Composer 첫 메시지로 넣고 첫 작업을 시작합니다.",
      "작업 완료 후 venture_record_progress로 완료 보고를 남기면 Venture Lab 상태가 갱신됩니다.",
    ],
    handoffNote: "Cursor는 프로젝트 규칙, MCP 설정, 로컬 진행 기록을 함께 설치해 작업 상태를 Venture Lab에 자동 반영합니다.",
  },
  codex: {
    key: "codex",
    label: "Codex",
    description: "작업 범위, 변경 파일, 검증 명령, 배포/롤백 보고 형식까지 한 번에 전달합니다.",
    packageFocus: "Codex 작업 지침, 변경 허용 범위, 품질 명령, 자동 진행 기록 형식을 명확히 분리합니다.",
    startMethod: "연결 파일을 프로젝트 루트에서 실행하고 확인 명령에서 T-001을 본 뒤 Codex 세션에 시작 지시문을 넣습니다.",
    automationLabel: "자동 동기화 지원",
    handoffFileSuffix: "codex-setup",
    startFileName: "AI_VENTURE_CODEX_START.md",
    packageFiles: [
      "AI_VENTURE_PACKAGE.md",
      "AI_VENTURE_TASKS.md",
      "AI_VENTURE_CODEX_START.md",
      "AGENTS.ai-venture-lab.md",
      "README_VENTURE_LAB_CODEX.md",
      ".codex/venture-lab-cli.mjs",
      ".codex/venture-lab-sync.json",
      ".codex/venture-lab-progress.json",
    ],
    handoffSteps: [
      "Codex 연결 파일을 받습니다.",
      "받은 PowerShell 파일을 실제 개발할 프로젝트 루트에 둡니다.",
      "프로젝트 루트에서 화면의 PowerShell 명령을 실행합니다.",
      "확인 명령에서 T-001이 보이면 Codex 작업 세션에서 같은 프로젝트를 엽니다.",
      "AI_VENTURE_CODEX_START.md를 첫 메시지로 넣고 T-001부터 한 번에 하나씩 진행합니다.",
      "완료 후 .codex/venture-lab-cli.mjs record-progress 명령으로 결과를 남깁니다.",
      "Codex가 진행 결과를 기록하면 Venture Lab 작업 상태가 자동으로 갱신됩니다.",
    ],
    handoffNote: "Codex는 연결 파일과 로컬 CLI를 통해 작업 완료 보고를 Venture Lab에 자동 반영합니다.",
  },
  claude_code: {
    key: "claude_code",
    label: "Claude Code",
    description: "승인된 제작 자료와 제외 범위를 먼저 고정하고 구현 대화를 시작합니다.",
    packageFocus: "프로젝트 MCP 설정, Claude 지침, 작업 순서, 완료 보고 명령을 한 번에 정리합니다.",
    startMethod: "연결 파일을 프로젝트 루트에서 실행하고 확인 명령에서 T-001을 본 뒤 Claude Code에 시작 지시문을 넣습니다.",
    automationLabel: "자동 동기화 지원",
    handoffFileSuffix: "claude-code-setup",
    startFileName: "AI_VENTURE_CLAUDE_START.md",
    packageFiles: [
      "AI_VENTURE_PACKAGE.md",
      "AI_VENTURE_TASKS.md",
      "AI_VENTURE_CLAUDE_START.md",
      "CLAUDE.md",
      "README_VENTURE_LAB_CLAUDE.md",
      ".mcp.json",
      ".claude/venture-lab-cli.mjs",
      ".claude/venture-lab-sync.json",
      ".claude/venture-lab-progress.json",
    ],
    handoffSteps: [
      "Claude Code 연결 파일을 받습니다.",
      "받은 PowerShell 파일을 실제 개발할 프로젝트 루트에 둡니다.",
      "프로젝트 루트에서 화면의 PowerShell 명령을 실행합니다.",
      "확인 명령에서 T-001이 보이면 Claude Code를 같은 프로젝트 루트에서 엽니다.",
      "/mcp에서 ai-venture-lab 연결을 확인한 뒤 AI_VENTURE_CLAUDE_START.md를 첫 메시지로 넣습니다.",
      "작업 완료 후 venture_record_progress 또는 .claude/venture-lab-cli.mjs record-progress로 결과를 남깁니다.",
      "진행 결과가 저장되면 Venture Lab 작업 상태가 자동으로 갱신됩니다.",
    ],
    handoffNote: "Claude Code는 프로젝트 .mcp.json과 로컬 CLI를 통해 작업 완료 보고를 Venture Lab에 자동 반영합니다.",
  },
  antigravity: {
    key: "antigravity",
    label: "Google Antigravity",
    description: "화면 구조, 기술 방향, 검증/배포 기준을 순서대로 등록해 첫 빌드를 진행합니다.",
    packageFocus: "Antigravity 프로젝트 지침, MCP 설정 후보, 작업 순서, 완료 보고 명령을 단계 자료로 나눕니다.",
    startMethod: "연결 파일을 프로젝트 루트에서 실행하고 확인 명령에서 T-001을 본 뒤 Antigravity Agent에 시작 지시문을 넣습니다.",
    automationLabel: "자동 동기화 지원",
    handoffFileSuffix: "antigravity-setup",
    startFileName: "AI_VENTURE_ANTIGRAVITY_START.md",
    packageFiles: [
      "AI_VENTURE_PACKAGE.md",
      "AI_VENTURE_TASKS.md",
      "AI_VENTURE_ANTIGRAVITY_START.md",
      "AI_VENTURE_ACCEPTANCE.md",
      "AGENTS.ai-venture-lab.md",
      "README_VENTURE_LAB_ANTIGRAVITY.md",
      ".antigravity/mcp_config.json",
      ".antigravity/venture-lab-cli.mjs",
      ".antigravity/venture-lab-sync.json",
      ".antigravity/venture-lab-progress.json",
    ],
    handoffSteps: [
      "Google Antigravity 연결 파일을 받습니다.",
      "받은 PowerShell 파일을 실제 개발할 프로젝트 루트에 둡니다.",
      "프로젝트 루트에서 화면의 PowerShell 명령을 실행합니다.",
      "확인 명령에서 T-001이 보이면 Antigravity에서 같은 프로젝트를 엽니다.",
      "프로젝트 지침과 MCP 설정 파일을 확인한 뒤 AI_VENTURE_ANTIGRAVITY_START.md를 Agent 첫 메시지로 넣습니다.",
      "작업 완료 후 .antigravity/venture-lab-cli.mjs record-progress로 결과를 남깁니다.",
      "진행 결과가 저장되면 Venture Lab 작업 상태가 자동으로 갱신됩니다.",
    ],
    handoffNote: "Antigravity는 프로젝트 지침 파일과 로컬 CLI를 통해 작업 완료 보고를 Venture Lab에 자동 반영합니다.",
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
  "codex",
  "claude_code",
  "antigravity",
];

export const defaultBuildDeliveryPreference: BuildDeliveryPreference = {
  mode: "external_tool",
  externalTool: "cursor",
};

export function isBuildDeliveryMode(value: string | null | undefined): value is BuildDeliveryMode {
  return value === "venture_lab" || value === "external_tool";
}

export function isExternalBuildToolKey(value: string | null | undefined): value is ExternalBuildToolKey {
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

export function getFinalExternalToolOverrideKey({
  finalExternalToolOverride,
  selectedIdeaId,
}: {
  finalExternalToolOverride: FinalExternalToolOverride;
  selectedIdeaId: string | null;
}) {
  return finalExternalToolOverride?.ideaId === selectedIdeaId ? finalExternalToolOverride.key : null;
}

export function hasActiveFinalExternalToolOverride({
  buildDeliveryMode,
  finalExternalToolOverrideKey,
  persistedExternalBuildToolKey,
}: {
  buildDeliveryMode: BuildDeliveryMode;
  finalExternalToolOverrideKey: ExternalBuildToolKey | null;
  persistedExternalBuildToolKey: ExternalBuildToolKey;
}) {
  return (
    buildDeliveryMode === "external_tool" &&
    Boolean(finalExternalToolOverrideKey) &&
    finalExternalToolOverrideKey !== persistedExternalBuildToolKey
  );
}

export function getActiveExternalBuildToolProfile({
  buildDeliveryMode,
  finalExternalToolOverrideKey,
  persistedExternalBuildTool,
}: {
  buildDeliveryMode: BuildDeliveryMode;
  finalExternalToolOverrideKey: ExternalBuildToolKey | null;
  persistedExternalBuildTool: ExternalBuildToolProfile;
}) {
  return buildDeliveryMode === "external_tool" && finalExternalToolOverrideKey
    ? externalBuildToolProfiles[finalExternalToolOverrideKey]
    : persistedExternalBuildTool;
}

export function resolveBuildDeliveryContext({
  finalExternalToolOverride,
  preference,
  selectedIdeaId,
}: {
  finalExternalToolOverride: FinalExternalToolOverride;
  preference: BuildDeliveryPreference;
  selectedIdeaId: string | null;
}): BuildDeliveryContext {
  const buildDeliveryMode = preference.mode;
  const persistedExternalBuildTool = getExternalBuildToolProfile(preference);
  const finalExternalToolOverrideKey = getFinalExternalToolOverrideKey({
    finalExternalToolOverride,
    selectedIdeaId,
  });
  const activeExternalBuildTool = getActiveExternalBuildToolProfile({
    buildDeliveryMode,
    finalExternalToolOverrideKey,
    persistedExternalBuildTool,
  });
  const hasFinalExternalToolOverride = hasActiveFinalExternalToolOverride({
    buildDeliveryMode,
    finalExternalToolOverrideKey,
    persistedExternalBuildToolKey: persistedExternalBuildTool.key,
  });
  const activeBuildDeliveryPhrase = getBuildDeliveryActionPhrase({
    buildDeliveryMode,
    externalToolLabel: activeExternalBuildTool.label,
  });
  const activeBuildDeliveryLabel = buildDeliveryModeLabels[buildDeliveryMode];
  const activeBuildDeliveryDetail = getBuildDeliveryDetail({
    buildDeliveryMode,
    externalToolLabel: activeExternalBuildTool.label,
  });

  return {
    buildDeliveryMode,
    persistedExternalBuildTool,
    finalExternalToolOverrideKey,
    activeExternalBuildTool,
    hasFinalExternalToolOverride,
    activeBuildDeliveryPhrase,
    activeBuildDeliveryLabel,
    activeBuildDeliveryDetail,
  };
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

export function getBuildDeliveryPreferenceFieldFromText({
  fieldName,
  text,
}: {
  fieldName: BuildDeliveryPreferenceTextField;
  text: string | null | undefined;
}) {
  if (!text) {
    return null;
  }

  const match = text.match(new RegExp(`${fieldName}:\\s*([a-z_]+)`, "i"));

  return match?.[1]?.toLowerCase() ?? null;
}

export function getBuildDeliveryPreferenceFromText(text: string | null | undefined): BuildDeliveryPreference | null {
  const modeValue = getBuildDeliveryPreferenceFieldFromText({
    fieldName: "build_delivery_mode",
    text,
  });
  const toolValue = getBuildDeliveryPreferenceFieldFromText({
    fieldName: "external_tool",
    text,
  });

  if (!isBuildDeliveryMode(modeValue)) {
    return null;
  }

  return normalizeBuildDeliveryPreference({
    mode: modeValue,
    externalTool: isExternalBuildToolKey(toolValue) ? toolValue : defaultBuildDeliveryPreference.externalTool,
  });
}

export function getBuildDeliveryPreferenceArtifactTime(artifact: BuildDeliveryPreferenceArtifact) {
  const timestamp = new Date(artifact.created_at ?? 0).getTime();

  return Number.isFinite(timestamp) ? timestamp : 0;
}

export function compareBuildDeliveryPreferenceArtifactsByCreatedAt(
  a: BuildDeliveryPreferenceArtifact,
  b: BuildDeliveryPreferenceArtifact,
) {
  return getBuildDeliveryPreferenceArtifactTime(b) - getBuildDeliveryPreferenceArtifactTime(a);
}

export function sortBuildDeliveryPreferenceArtifacts(artifacts: BuildDeliveryPreferenceArtifact[]) {
  return [...artifacts].sort(compareBuildDeliveryPreferenceArtifactsByCreatedAt);
}

export function getBuildDeliveryPreferenceFromArtifacts(artifacts: BuildDeliveryPreferenceArtifact[]) {
  for (const artifact of sortBuildDeliveryPreferenceArtifacts(artifacts)) {
    const preference = getBuildDeliveryPreferenceFromText(artifact.body);

    if (preference) {
      return preference;
    }
  }

  return defaultBuildDeliveryPreference;
}
