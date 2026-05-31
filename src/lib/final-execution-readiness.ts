import type { BuildDeliveryMode } from "@/lib/build-delivery";

export type FinalExecutionReadinessCheck = {
  label: string;
  passed: boolean;
  detail: string;
};

export type FinalExecutionReadiness = {
  checks: FinalExecutionReadinessCheck[];
  passedCount: number;
  score: number;
  nextBlocker: FinalExecutionReadinessCheck | null;
  canEnterLaunch: boolean;
};

export function buildFinalExecutionReadiness({
  activeBuildDeliveryLabel,
  buildDeliveryMode,
  externalToolLabel,
  hasFinalExecutionPackage,
  hasFinalExecutionWorkOrder,
  hasIdeaContext,
  implementationTaskCount,
  runCount,
}: {
  activeBuildDeliveryLabel: string;
  buildDeliveryMode: BuildDeliveryMode;
  externalToolLabel: string;
  hasFinalExecutionPackage: boolean;
  hasFinalExecutionWorkOrder: boolean;
  hasIdeaContext: boolean;
  implementationTaskCount: number;
  runCount: number;
}): FinalExecutionReadiness {
  const checks: FinalExecutionReadinessCheck[] = hasIdeaContext
    ? [
        {
          label: "제작 패키지 저장",
          passed: hasFinalExecutionPackage,
          detail: hasFinalExecutionPackage
            ? "최종 실행에서 쓸 제작 패키지가 저장되어 있습니다."
            : "STEP 5에서 제작 패키지를 저장하세요.",
        },
        {
          label: "작업 순서 준비",
          passed: hasFinalExecutionWorkOrder,
          detail: hasFinalExecutionWorkOrder
            ? `작업 순서 ${runCount}개, 제작 할 일 ${implementationTaskCount}개가 준비되어 있습니다.`
            : "작업 순서 자동 만들기를 눌러 제작자가 볼 순서를 준비하세요.",
        },
        {
          label: "개발 방식 확정",
          passed: Boolean(buildDeliveryMode && activeBuildDeliveryLabel),
          detail:
            buildDeliveryMode === "external_tool"
              ? `${externalToolLabel}로 넘길 준비 자료를 보여줍니다.`
              : "Venture Lab 내부 개발로 이어질 준비 자료를 보여줍니다.",
        },
      ]
    : [];
  const passedCount = checks.filter((check) => check.passed).length;
  const score = checks.length === 0 ? 0 : Math.round((passedCount / checks.length) * 100);
  const nextBlocker = checks.find((check) => !check.passed) ?? null;
  const canEnterLaunch = checks.length > 0 && !nextBlocker;

  return {
    checks,
    passedCount,
    score,
    nextBlocker,
    canEnterLaunch,
  };
}
