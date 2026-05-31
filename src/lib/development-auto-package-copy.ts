import type { BuildDeliveryMode, ExternalBuildToolProfile } from "@/lib/build-delivery";
import type { FirstBuildBridge } from "@/lib/first-build-bridge";
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

type DevelopmentAutoPackageCopyInput = {
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
