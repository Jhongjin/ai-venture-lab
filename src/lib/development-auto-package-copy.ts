import type { BuildDeliveryMode, ExternalBuildToolProfile } from "@/lib/build-delivery";
import type { ImplementationTaskDraft } from "@/lib/external-progress-import";
import { buildExternalProductionPackageGuide } from "@/lib/external-production-package-guide";
import type { FirstBuildBridge } from "@/lib/first-build-bridge";
import { implementationTaskPriorityLabels, implementationTaskTypeLabels } from "@/lib/implementation-task-metadata";
import type { ProductSurfaceProfile } from "@/lib/product-surface";

export type DevelopmentAutoProgressStep = {
  label: string;
  detail: string;
};

export type DevelopmentAutoSummaryCard = {
  label: string;
  value: string;
  detail: string;
};

export type DevelopmentAutoBridgeCard = {
  label: string;
  items: string[];
};

export type DevelopmentAutoOutputItem = {
  label: string;
  detail: string;
};

export type DevelopmentAutoFlowState = "idle" | "running" | "review" | "summary";

export type DevelopmentAutoEffectiveFlowState = DevelopmentAutoFlowState | "saved";

export type DevelopmentAutoPanel = "setup" | "tasks" | "handoff";

export type DevelopmentExperienceMode = "guided" | "full";

export type DevelopmentAutoPackageCopyInput = {
  activeBuildDeliveryDetail: string;
  activeBuildDeliveryLabel: string;
  backendCandidateLabel: string | null;
  buildDeliveryMode: BuildDeliveryMode;
  externalBuildTool: ExternalBuildToolProfile;
  firstBuildBridge: FirstBuildBridge | null;
  hasValidationSummaryArtifact: boolean;
  productSurface: ProductSurfaceProfile;
};

export function buildDevelopmentAutoProgressSteps({
  buildDeliveryMode,
  externalBuildTool,
  firstBuildBridge,
  hasValidationSummaryArtifact,
  productSurface,
}: DevelopmentAutoPackageCopyInput): DevelopmentAutoProgressStep[] {
  return [
    {
      label: "검증 결과 읽는 중",
      detail: hasValidationSummaryArtifact
        ? "저장된 검증 완료 요약과 조사 자료를 기준으로 봅니다."
        : "아이디어 요약, 조사 요약, 7일 검증 계획을 기준으로 부족한 부분을 표시합니다.",
    },
    {
      label: "결과물 형태 확인 중",
      detail: `${productSurface.label} 기준으로 기획서, 화면 구조, 기술 방향, 제작 자료를 맞춥니다.`,
    },
    {
      label: "제작 범위 정리 중",
      detail: firstBuildBridge?.firstTasks.slice(0, 2).join(" · ") || "처음 만들 핵심 화면과 기능을 한 묶음으로 정리합니다.",
    },
    {
      label: "디자인/기술 방향 정리 중",
      detail: `${productSurface.iaHint} ${firstBuildBridge?.stackReason || productSurface.stackHint}`,
    },
    {
      label:
        buildDeliveryMode === "external_tool"
          ? `${externalBuildTool.label} 전달 자료 정리 중`
          : "Venture Lab 실행 자료 정리 중",
      detail:
        buildDeliveryMode === "external_tool"
          ? `${externalBuildTool.packageFocus} ${productSurface.handoffHint}`
          : "작업 순서 보드, 실행 할 일, 최종 실행, 성과 확인 화면에서 이어서 처리할 자료를 묶습니다.",
    },
  ];
}

export function buildDevelopmentAutoSummaryCards({
  activeBuildDeliveryDetail,
  activeBuildDeliveryLabel,
  backendCandidateLabel,
  firstBuildBridge,
  hasValidationSummaryArtifact,
  productSurface,
}: DevelopmentAutoPackageCopyInput): DevelopmentAutoSummaryCard[] {
  return [
    {
      label: "검증 결과",
      value: hasValidationSummaryArtifact ? "검증 완료 요약 기준" : "저장된 검증 자료 기준",
      detail: "아이디어 요약, 조사 요약, 7일 검증 계획, 검증 완료 요약을 제작 입력으로 묶습니다.",
    },
    {
      label: "결과물 형태",
      value: productSurface.label,
      detail: `${productSurface.firstBuild} 기준으로 ${productSurface.harnessFocus}`,
    },
    {
      label: "화면 구조",
      value: productSurface.shortLabel,
      detail: productSurface.iaHint,
    },
    {
      label: "기술 방향",
      value: firstBuildBridge?.stackTitle || backendCandidateLabel || "Next.js + Supabase",
      detail:
        firstBuildBridge?.stackReason ||
        "인증, 저장, 권한 경계를 빠르게 붙이고 첫 제작 범위를 작게 시작하는 방향입니다.",
    },
    {
      label: "개발 방식",
      value: activeBuildDeliveryLabel,
      detail: activeBuildDeliveryDetail,
    },
    {
      label: "제작 범위",
      value: firstBuildBridge?.firstTasks[0] || "핵심 입력과 저장 흐름",
      detail: [
        firstBuildBridge?.firstTasks.slice(1).join(" · ") ||
          "첫 화면에서 사용자가 입력하고 결과를 저장하는 최소 흐름을 우선 만듭니다.",
        firstBuildBridge?.excludeNow[0]
          ? `이번엔 제외: ${firstBuildBridge.excludeNow.join(" · ")}`
          : "부가 기능과 복잡한 자동화는 뒤로 미룹니다.",
      ].join(" "),
    },
  ];
}

export function buildDevelopmentAutoBridgeCards({
  backendCandidateLabel,
  firstBuildBridge,
  productSurface,
}: DevelopmentAutoPackageCopyInput): DevelopmentAutoBridgeCard[] {
  return [
    {
      label: "첫 제작 순서",
      items:
        firstBuildBridge?.firstTasks.slice(0, 3) ?? [
          "첫 화면에서 사용자가 입력할 한 가지 행동을 만든다",
          "저장과 조회를 연결한다",
          "성공/실패 상태를 확인한다",
        ],
    },
    {
      label: "기술 스택 후보",
      items: [
        firstBuildBridge?.stackTitle || backendCandidateLabel || "Next.js + Supabase",
        firstBuildBridge?.stackReason ||
          productSurface.stackHint ||
          "인증, 저장, 권한 경계를 빠르게 붙이고 첫 제작 범위를 작게 시작합니다.",
      ],
    },
    {
      label: "이번엔 뺄 것",
      items:
        firstBuildBridge?.excludeNow.slice(0, 3) ?? [
          "결제, 관리자 고급 기능, 자동화 전체 흐름",
          "여러 사용자군과 여러 가격 모델 동시 검증",
          "검증 목표와 관계없는 부가 기능",
        ],
    },
  ];
}

export function buildDevelopmentAutoOutputItems({
  buildDeliveryMode,
  externalBuildTool,
  productSurface,
}: DevelopmentAutoPackageCopyInput): DevelopmentAutoOutputItem[] {
  return [
    {
      label: "디자인 기준",
      detail: `${productSurface.label}에 맞는 화면 구조, 상태, 모바일/접근성 기준을 저장합니다.`,
    },
    {
      label: "제작 실행 계획",
      detail: "기술 방향, 백엔드 후보, 작업 순서, 품질 점검, 배포/롤백 기준을 저장합니다.",
    },
    {
      label: buildDeliveryMode === "external_tool" ? "개발 도구 전달 자료" : "내부 실행 자료",
      detail:
        buildDeliveryMode === "external_tool"
          ? `${externalBuildTool.label} 기준의 시작 방법, 검증/보고 형식, 읽을 자료 순서를 저장합니다.`
          : "Venture Lab 안에서 이어서 볼 작업 순서, 검증 기준, 최종 실행 기준을 저장합니다.",
    },
  ];
}

export function buildDevelopmentAutoTaskDraftLines(implementationTaskDrafts: ReadonlyArray<ImplementationTaskDraft>) {
  if (implementationTaskDrafts.length === 0) {
    return "1. 핵심 제작 범위, 디자인, 데이터/권한, QA, 배포 점검 순서로 작업을 나눕니다.";
  }

  return implementationTaskDrafts
    .map(
      (task, index) =>
        `${index + 1}. ${task.title} / ${implementationTaskTypeLabels[task.task_type]} / ${implementationTaskPriorityLabels[task.priority]} / ${task.owner_role}
   - 수용 기준: ${task.acceptance_criteria.replace(/\n/g, "\n     ") || "미정"}`,
    )
    .join("\n");
}

export function buildDevelopmentAutoSummaryDraft({
  activeBuildDeliveryDetail,
  activeBuildDeliveryLabel,
  buildDeliveryMode,
  developmentAutoNote,
  externalBuildTool,
  ideaName,
  productSurface,
  summaryCards,
  taskDraftLines,
}: {
  activeBuildDeliveryDetail: string;
  activeBuildDeliveryLabel: string;
  buildDeliveryMode: BuildDeliveryMode;
  developmentAutoNote: string;
  externalBuildTool: ExternalBuildToolProfile;
  ideaName: string | null;
  productSurface: ProductSurfaceProfile;
  summaryCards: ReadonlyArray<DevelopmentAutoSummaryCard>;
  taskDraftLines: string;
}) {
  if (!ideaName) {
    return "";
  }

  const summaryLines = summaryCards.flatMap((card) => [
    `## ${card.label}`,
    card.value,
    card.detail,
    "",
  ]);

  return [
    `# 제작 실행 요약: ${ideaName}`,
    "",
    ...summaryLines,
    "## 제작 기준",
    productSurface.promptFocus,
    productSurface.stackHint,
    productSurface.handoffHint,
    "",
    "## 개발 방식",
    `- 개발 방식: ${activeBuildDeliveryLabel}`,
    `- 선택 도구: ${buildDeliveryMode === "external_tool" ? externalBuildTool.label : "Venture Lab 내부 진행"}`,
    `- 반영 기준: ${activeBuildDeliveryDetail}`,
    "",
    buildExternalProductionPackageGuide(productSurface, buildDeliveryMode, externalBuildTool),
    "",
    "## 작업 순서 초안",
    taskDraftLines,
    "",
    "## 제작 도구 전달 기준",
    buildDeliveryMode === "external_tool"
      ? `저장 후 생성되는 제작 패키지는 ${externalBuildTool.label}에 넘길 자료로 사용합니다.`
      : "저장 후 생성되는 제작 패키지는 Venture Lab 안에서 작업 순서와 최종 실행을 이어가는 기준 자료로 사용합니다.",
    "제품 기획서, 디자인 방향, 기술 스택, 첫 제작 범위, 제외 범위, 검증 기준을 같은 맥락으로 묶어 다음 제작 단계가 흔들리지 않게 합니다.",
    "",
    "## 사용자 보완 메모",
    developmentAutoNote.trim() || "- 추가 메모 없음",
  ].join("\n");
}

export function buildDevelopmentAutoPackageCopyState({
  developmentAutoNote,
  ideaName,
  implementationTaskDrafts,
  input,
}: {
  developmentAutoNote: string;
  ideaName: string | null;
  implementationTaskDrafts: ReadonlyArray<ImplementationTaskDraft>;
  input: DevelopmentAutoPackageCopyInput;
}) {
  const developmentAutoProgressSteps = buildDevelopmentAutoProgressSteps(input);
  const developmentAutoSummaryCards = buildDevelopmentAutoSummaryCards(input);
  const developmentAutoBuildBridgeCards = buildDevelopmentAutoBridgeCards(input);
  const developmentAutoOutputItems = buildDevelopmentAutoOutputItems(input);
  const developmentAutoTaskDraftLines = buildDevelopmentAutoTaskDraftLines(implementationTaskDrafts);
  const developmentAutoSummaryDraft = buildDevelopmentAutoSummaryDraft({
    ...input,
    developmentAutoNote,
    ideaName,
    summaryCards: developmentAutoSummaryCards,
    taskDraftLines: developmentAutoTaskDraftLines,
  });

  return {
    developmentAutoBuildBridgeCards,
    developmentAutoOutputItems,
    developmentAutoProgressSteps,
    developmentAutoSummaryCards,
    developmentAutoSummaryDraft,
    developmentAutoTaskDraftLines,
  };
}

export function buildDevelopmentAutoWorkbenchState({
  activeBuildDeliveryDetail,
  activeBuildDeliveryLabel,
  backendCandidateLabel,
  buildDeliveryMode,
  canEnterOrchestrationFromDevelopmentDocs,
  developmentAutoFlowState,
  developmentAutoNote,
  developmentPanel,
  experienceMode,
  externalBuildTool,
  firstBuildBridge,
  hasValidationSummaryArtifact,
  ideaName,
  implementationTaskDrafts,
  productSurface,
}: DevelopmentAutoPackageCopyInput & {
  canEnterOrchestrationFromDevelopmentDocs: boolean;
  developmentAutoFlowState: DevelopmentAutoFlowState;
  developmentAutoNote: string;
  developmentPanel: DevelopmentAutoPanel;
  experienceMode: DevelopmentExperienceMode;
  ideaName: string | null;
  implementationTaskDrafts: ReadonlyArray<ImplementationTaskDraft>;
}) {
  const hasSavedDevelopmentAutoPackage = canEnterOrchestrationFromDevelopmentDocs;
  const effectiveDevelopmentAutoFlowState: DevelopmentAutoEffectiveFlowState = hasSavedDevelopmentAutoPackage
    ? "saved"
    : developmentAutoFlowState;
  const visibleDevelopmentPanel: DevelopmentAutoPanel = experienceMode === "guided" ? "setup" : developmentPanel;
  const copyState = buildDevelopmentAutoPackageCopyState({
    developmentAutoNote,
    ideaName,
    implementationTaskDrafts,
    input: {
      activeBuildDeliveryDetail,
      activeBuildDeliveryLabel,
      backendCandidateLabel,
      buildDeliveryMode,
      externalBuildTool,
      firstBuildBridge,
      hasValidationSummaryArtifact,
      productSurface,
    },
  });

  return {
    ...copyState,
    effectiveDevelopmentAutoFlowState,
    hasSavedDevelopmentAutoPackage,
    visibleDevelopmentPanel,
  };
}

export function buildFinalDevelopmentPlanDraft({
  developmentAutoSummaryDraft,
  developmentPlanDraft,
  ideaName,
}: {
  developmentAutoSummaryDraft: string;
  developmentPlanDraft: string;
  ideaName: string | null;
}) {
  if (!ideaName) {
    return "";
  }

  return [
    developmentAutoSummaryDraft,
    "",
    "---",
    "",
    "## 상세 실행 계획",
    developmentPlanDraft,
  ].join("\n");
}

export function buildFinalAgentRunPackageDraft({
  agentRunPackageDraft,
  buildDeliveryMode,
  developmentAutoSummaryDraft,
  externalBuildTool,
  ideaName,
  productSurface,
  taskDraftLines,
}: {
  agentRunPackageDraft: string;
  buildDeliveryMode: BuildDeliveryMode;
  developmentAutoSummaryDraft: string;
  externalBuildTool: ExternalBuildToolProfile;
  ideaName: string | null;
  productSurface: ProductSurfaceProfile;
  taskDraftLines: string;
}) {
  if (!ideaName) {
    return "";
  }

  return [
    `# 제작 패키지: ${ideaName}`,
    "",
    "이 문서는 검증된 아이디어를 실제 제작 도구나 외부 제작 환경에 넘기기 위한 최종 자료입니다.",
    "사용자는 별도 문서를 조합하지 않고, 아래 내용을 그대로 다음 제작 환경의 기준 자료로 사용할 수 있습니다.",
    "",
    buildExternalProductionPackageGuide(productSurface, buildDeliveryMode, externalBuildTool),
    "",
    "## 실행 요약",
    developmentAutoSummaryDraft,
    "",
    "## 작업 순서 초안",
    taskDraftLines,
    "",
    "---",
    "",
    "## 제작 도구 전달 자료",
    agentRunPackageDraft,
  ].join("\n");
}

export function buildExternalToolRunPackageDraft({
  buildDeliveryMode,
  externalBuildTool,
  finalAgentRunPackageDraft,
  ideaName,
}: {
  buildDeliveryMode: BuildDeliveryMode;
  externalBuildTool: ExternalBuildToolProfile;
  finalAgentRunPackageDraft: string;
  ideaName: string | null;
}) {
  if (!ideaName || buildDeliveryMode !== "external_tool") {
    return finalAgentRunPackageDraft;
  }

  return [
    `# ${externalBuildTool.label} 시작 패키지: ${ideaName}`,
    "",
    `${externalBuildTool.label}에서 바로 첫 작업을 시작할 수 있도록 시작 순서, 전달 파일, 완료 보고 형식을 앞에 붙인 패키지입니다.`,
    externalBuildTool.key === "cursor"
      ? "Cursor는 연결 파일을 받아 프로젝트 루트에서 실행하면 실제 규칙, MCP 설정, 제작 패키지, 작업 목록이 파일로 설치됩니다."
      : externalBuildTool.key === "codex"
        ? "Codex는 연결 파일을 받아 프로젝트 루트에서 실행하면 제작 패키지, 작업 목록, 시작 지시문, 진행 기록 CLI가 파일로 설치됩니다."
        : `${externalBuildTool.label}는 연결 파일을 받아 프로젝트 루트에서 실행하면 도구별 지침, 제작 패키지, 작업 목록, 진행 기록 CLI가 파일로 설치됩니다.`,
    "",
    "## 먼저 할 일",
    "",
    externalBuildTool.handoffSteps.map((step, index) => `${index + 1}. ${step}`).join("\n"),
    "",
    "## 이 패키지에 맞춘 파일",
    "",
    externalBuildTool.packageFiles.map((file) => `- ${file}`).join("\n"),
    "",
    "## 완료 보고 형식",
    "",
    "- 완료한 작업 코드와 제목",
    "- 변경 파일",
    "- 실행한 검증 명령과 결과",
    "- 배포 또는 미리보기 URL",
    "- 남은 리스크와 다음 작업",
    "",
    "## 도구별 주의",
    "",
    externalBuildTool.handoffNote,
    "",
    "---",
    "",
    finalAgentRunPackageDraft,
  ].join("\n");
}

export function buildDevelopmentFinalPackageDrafts({
  agentRunPackageDraft,
  buildDeliveryMode,
  developmentAutoSummaryDraft,
  developmentPlanDraft,
  externalBuildTool,
  ideaName,
  productSurface,
  taskDraftLines,
}: {
  agentRunPackageDraft: string;
  buildDeliveryMode: BuildDeliveryMode;
  developmentAutoSummaryDraft: string;
  developmentPlanDraft: string;
  externalBuildTool: ExternalBuildToolProfile;
  ideaName: string | null;
  productSurface: ProductSurfaceProfile;
  taskDraftLines: string;
}) {
  const finalDevelopmentPlanDraft = buildFinalDevelopmentPlanDraft({
    developmentAutoSummaryDraft,
    developmentPlanDraft,
    ideaName,
  });
  const finalAgentRunPackageDraft = buildFinalAgentRunPackageDraft({
    agentRunPackageDraft,
    buildDeliveryMode,
    developmentAutoSummaryDraft,
    externalBuildTool,
    ideaName,
    productSurface,
    taskDraftLines,
  });
  const externalToolRunPackageDraft = buildExternalToolRunPackageDraft({
    buildDeliveryMode,
    externalBuildTool,
    finalAgentRunPackageDraft,
    ideaName,
  });

  return {
    externalToolRunPackageDraft,
    finalAgentRunPackageDraft,
    finalDevelopmentPlanDraft,
  };
}
