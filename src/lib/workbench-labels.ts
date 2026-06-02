import type {
  DecisionStatus,
  IdeaStage,
  OrchestrationPhase,
  OrchestrationStatus,
  RiskSeverity,
} from "@/lib/supabase/types";

export const riskSeverityLabels: Record<RiskSeverity, string> = {
  low: "낮음",
  medium: "보통",
  high: "높음",
  critical: "매우 높음",
};

export const riskStatusLabels: Record<string, string> = {
  open: "열려 있음",
  mitigating: "완화 중",
  closed: "종료",
};

export const riskStatusOptions = ["open", "mitigating", "closed"] as const;

export const filterModeLabels: Record<"all" | "mine" | "read_only", string> = {
  all: "전체",
  mine: "내 기록",
  read_only: "팀 기록",
};

export const editabilityLabels = {
  editable: "내 기록",
  orgAdmin: "팀 관리자",
  readOnly: "팀 기록",
};

export const experimentStatusLabels: Record<string, string> = {
  planned: "계획",
  running: "진행 중",
  done: "완료",
};

export const experimentStatusOptions = ["planned", "running", "done"] as const;

export const experimentStatusGuides: Record<string, string> = {
  planned: "아직 실행 전입니다. 방법과 성공/중단 기준만 정해둔 상태입니다.",
  running: "인터뷰, 랜딩, 직접 테스트처럼 실제 확인을 시작했을 때 바꿉니다.",
  done: "결과와 배운 점을 기록할 수 있을 만큼 확인이 끝났을 때 바꿉니다.",
};

export const runStatusLabels: Record<OrchestrationStatus, string> = {
  planned: "계획",
  running: "진행 중",
  blocked: "막힘",
  done: "완료",
  skipped: "건너뜀",
};

export const orchestrationPhaseConfigs: Array<{
  phase: OrchestrationPhase;
  label: string;
  ownerRole: string;
  objective: string;
}> = [
  {
    phase: "strategy",
    label: "전략",
    ownerRole: "strategy-reviewer",
    objective: "기회, 판단 기준, 제약 조건, 다음 실행 약속을 정의합니다.",
  },
  {
    phase: "research",
    label: "리서치",
    ownerRole: "market-research",
    objective: "사용자 고통, 시장 수요, 경쟁 서비스, 규제 사실을 출처와 함께 검증합니다.",
  },
  {
    phase: "product",
    label: "제품",
    ownerRole: "prd-writer",
    objective: "검증된 근거를 가장 작은 제품 기획서와 수용 기준으로 전환합니다.",
  },
  {
    phase: "design",
    label: "디자인",
    ownerRole: "design-reviewer",
    objective: "구현 전에 흐름, 화면, 빈 상태, 사용성 리스크를 정리합니다.",
  },
  {
    phase: "build",
    label: "구현",
    ownerRole: "prototype-builder",
    objective: "현재 가설을 검증할 수 있는 가장 작은 유용한 프로토타입을 만듭니다.",
  },
  {
    phase: "qa",
    label: "품질 점검",
    ownerRole: "qa-runner",
    objective: "핵심 여정, 회귀 위험, 출시 체크리스트를 검증합니다.",
  },
  {
    phase: "debug",
    label: "디버깅",
    ownerRole: "qa-debug",
    objective: "실패를 재현하고 원인을 분리한 뒤 수정 및 검증 경로를 기록합니다.",
  },
  {
    phase: "security",
    label: "보안",
    ownerRole: "security-reviewer",
    objective: "개인정보, 비밀값, 권한, 악용 경로, 보관, 컴플라이언스 주장을 검토합니다.",
  },
  {
    phase: "launch",
    label: "출시",
    ownerRole: "launch-gate",
    objective: "증거를 바탕으로 진행, 전환, 중단, 추가 조사 판단을 내립니다.",
  },
];

export const phaseOrder = new Map(orchestrationPhaseConfigs.map((config, index) => [config.phase, index]));

export const phaseLabels = Object.fromEntries(
  orchestrationPhaseConfigs.map((config) => [config.phase, config.label]),
) as Record<OrchestrationPhase, string>;

export const runStatusTone: Record<OrchestrationStatus, string> = {
  planned: "bg-slate-100 text-slate-700",
  running: "bg-blue-100 text-blue-800",
  blocked: "bg-rose-100 text-rose-800",
  done: "bg-emerald-100 text-emerald-800",
  skipped: "bg-amber-100 text-amber-800",
};

export const stageLabels: Record<IdeaStage, string> = {
  intake: "아이디어 입력",
  research: "추가 조사",
  score: "사업성 평가",
  prd: "기획 정리",
  prototype: "첫 제작",
  qa: "점검",
  launch: "출시",
  paused: "보류",
};

export const decisionLabels: Record<DecisionStatus, string> = {
  pending: "아직 정하지 않음",
  research_more: "근거 더 확인",
  ship: "진행",
  pivot: "방향 수정",
  kill: "중단",
};

export const scoreFieldDescriptions = {
  problem_intensity: "사용자가 이 문제를 얼마나 크게 불편하거나 비용으로 느끼는지입니다.",
  frequency: "이 문제가 얼마나 자주 반복되는지입니다.",
  reachability: "검증할 사용자나 구매자를 얼마나 쉽게 만날 수 있는지입니다.",
  willingness_to_pay: "돈, 예산, 시간을 써서 해결하려는 의지가 있는지입니다.",
  mvp_speed: "작게 만들어 1차 확인까지 얼마나 빨리 갈 수 있는지입니다.",
  differentiation: "기존 대안보다 분명히 나은 이유가 있는지입니다.",
  regulatory_risk: "법무, 개인정보, 운영, 신뢰 문제가 클수록 높게 잡습니다. 이 값은 현재 평가에서 제외됩니다.",
};

export const evidenceConfidenceOptions = ["low", "medium", "high"] as const;
export type EvidenceConfidence = (typeof evidenceConfidenceOptions)[number];

export const evidenceConfidenceLabels: Record<EvidenceConfidence, string> = {
  low: "낮음",
  medium: "보통",
  high: "높음",
};
