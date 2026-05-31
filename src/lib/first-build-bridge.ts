import type { Experiment, Idea, Risk } from "@/lib/venture-data";

type FirstBuildBridgeState = Pick<Idea, "next_evidence">;

type FirstBuildBackendCandidate = {
  label: string;
  summary: string;
};

export type FirstBuildBridge = {
  stackTitle: string;
  stackReason: string;
  firstTasks: string[];
  excludeNow: string[];
  decisionAnchor: string;
};

export function buildFirstBuildBridge({
  idea,
  state,
  backend,
  experiments,
  risks,
}: {
  idea: Idea;
  state: FirstBuildBridgeState;
  backend: FirstBuildBackendCandidate | null;
  experiments: Experiment[];
  risks: Risk[];
}): FirstBuildBridge {
  const backendLabel = backend?.label ?? "Supabase";
  const decisionAnchor =
    state.next_evidence ||
    experiments.find((experiment) => experiment.success_metric.trim())?.success_metric ||
    idea.one_liner ||
    "사용자가 첫 가치를 실제로 느끼는지 확인";
  const highRisk = risks.find((risk) => ["high", "critical"].includes(risk.severity));
  const firstTasks = [
    "첫 화면에서 사용자가 입력할 한 가지 행동을 만든다",
    `${backendLabel}에 후보, 검증 계획, 판단 기록 저장을 연결한다`,
    "로그인, 빈 상태, 저장 성공/실패, 권한 차단을 한 번에 확인한다",
  ];
  const excludeNow = [
    "결제, 관리자 고급 기능, 자동화 전체 흐름",
    "여러 사용자군과 여러 가격 모델을 동시에 검증하는 일",
    highRisk ? `${highRisk.title} 리스크가 정리되기 전의 공개 출시` : "검증 목표와 관계없는 부가 기능",
  ];

  return {
    stackTitle: `Next.js + ${backendLabel}`,
    stackReason: backend?.summary ?? "로그인, 저장, 권한 확인이 필요한 첫 버전을 가장 빠르게 만들 수 있는 조합입니다.",
    firstTasks,
    excludeNow,
    decisionAnchor,
  };
}
