export type BuildDeliveryMode = "venture_lab" | "external_tool";
export type ExternalBuildToolKey = "cursor" | "codex" | "claude_code" | "antigravity" | "generic_mcp";

export type ExternalBuildToolProfile = {
  key: ExternalBuildToolKey;
  label: string;
  description: string;
  packageFocus: string;
  startMethod: string;
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
  },
  codex: {
    key: "codex",
    label: "Codex",
    description: "작업 범위, 변경 파일, 검증 명령, 배포/롤백 보고 형식까지 한 번에 전달합니다.",
    packageFocus: "AGENTS 지침, 변경 허용 범위, 품질 명령, 완료 보고 형식을 명확히 분리합니다.",
    startMethod: "제작 패키지를 첫 메시지로 넣고 변경 파일, 검증 명령, 배포 URL, 남은 리스크를 보고하게 합니다.",
  },
  claude_code: {
    key: "claude_code",
    label: "Claude Code",
    description: "승인된 제작 자료와 제외 범위를 먼저 고정하고 구현 대화를 시작합니다.",
    packageFocus: "기획/디자인/기술 자료와 제외 범위를 짧은 컨텍스트 순서로 정리합니다.",
    startMethod: "승인된 제작 자료와 작업 순서만 컨텍스트로 넣고 제외 범위를 먼저 확인합니다.",
  },
  antigravity: {
    key: "antigravity",
    label: "Google Antigravity",
    description: "화면 구조, 기술 방향, 검증/배포 기준을 순서대로 등록해 첫 빌드를 진행합니다.",
    packageFocus: "화면 구조, 기술 경계, 검증 기준, 첫 수직 슬라이스를 단계 자료로 나눕니다.",
    startMethod: "화면 구조, 기술 방향, 검증/배포 기준을 순서대로 등록한 뒤 첫 수직 슬라이스만 실행합니다.",
  },
  generic_mcp: {
    key: "generic_mcp",
    label: "범용 MCP 전달",
    description: "외부 도구가 읽을 리소스 URI, 권한, 완료 보고 형식을 중심으로 넘깁니다.",
    packageFocus: "읽기 전용 리소스 URI, 실행 명령 분리, 권한 범위, 완료 보고 형식을 고정합니다.",
    startMethod: "제작 패키지를 읽기 전용 기준 자료로 노출하고 실행 명령과 권한 범위를 분리합니다.",
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
final_execution_rule: actual package download or MCP/CLI connection opens only after validation, production documents, task sequence, QA, security, and launch readiness pass
\`\`\`

- 제작 방식: ${buildDeliveryModeLabels[normalized.mode]}
- 선택 도구: ${isExternal ? tool.label : "Venture Lab 내부 진행"}
- 실행 시점: 모든 검증과 제작 준비가 끝난 마지막 단계에서 실행합니다.`;
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
