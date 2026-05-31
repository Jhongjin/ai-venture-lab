import { hasSensitiveSourceSignal } from "@/lib/source-redaction";
import { normalizeMatchText } from "@/lib/text-match-utils";
import type { SimilarIdeaMatch } from "@/lib/extraction-candidate-match";

type GateCandidate = {
  signal: string;
  target_user: string;
  buyer: string;
  successMetric: string;
  risk_summary: string;
  firstPrototypeScope: string;
  sourceBlock: string;
  validationScore: number;
  riskLevel: "낮음" | "보통" | "높음";
};

export type CandidateReadinessCheck = {
  label: string;
  passed: boolean;
  detail: string;
};

export type ExtractionGateId = "proceed" | "research" | "pivot" | "kill";

export type ExtractionGate = {
  id: ExtractionGateId;
  label: string;
  summary: string;
  nextAction: string;
  threshold: string;
  blockers: string[];
  readinessScore: number;
  rank: number;
};

const extractionGateRanks: Record<ExtractionGateId, number> = {
  proceed: 4,
  research: 3,
  pivot: 2,
  kill: 1,
};

export function hasNumericSignal(value: string) {
  return /\d|명|일|%|퍼센트|건|회|만원|원/.test(value);
}

export function buildCandidateReadiness(
  candidate: GateCandidate,
  similarIdea: SimilarIdeaMatch | null,
): CandidateReadinessCheck[] {
  const target = normalizeMatchText(candidate.target_user);
  const buyer = normalizeMatchText(candidate.buyer);
  const hasSensitiveSource = hasSensitiveSourceSignal(candidate.sourceBlock);

  return [
    {
      label: "문제 신호",
      passed: candidate.signal.trim().length >= 20,
      detail: candidate.signal.trim().length >= 20 ? "반복 문제 단서가 있습니다." : "페인 포인트나 현재 우회 방법을 더 적으세요.",
    },
    {
      label: "사용자/구매자",
      passed: Boolean(target && buyer && target !== buyer),
      detail:
        target && buyer && target !== buyer
          ? "사용자와 구매자가 분리되어 있습니다."
          : "사용자, 구매자, 승인자를 더 분리하세요.",
    },
    {
      label: "검증 지표",
      passed: hasNumericSignal(candidate.successMetric),
      detail: hasNumericSignal(candidate.successMetric)
        ? "성공 기준에 수량, 기간, 비율, 비용 단서가 있습니다."
        : "성공 지표에 명수, 기간, 전환율, 비용 같은 숫자를 넣으세요.",
    },
    {
      label: "리스크",
      passed: candidate.risk_summary.trim().length >= 20,
      detail: candidate.risk_summary.trim().length >= 20 ? "초기 리스크를 함께 저장할 수 있습니다." : "개인정보, 규제, 운영 리스크를 보완하세요.",
    },
    {
      label: "첫 제작 범위",
      passed: candidate.firstPrototypeScope.trim().length >= 20,
      detail: candidate.firstPrototypeScope.trim().length >= 20 ? "첫 제작 범위가 있습니다." : "7일 안에 만들 최소 범위를 정하세요.",
    },
    {
      label: "중복 위험",
      passed: !similarIdea || similarIdea.score < 70,
      detail: similarIdea
        ? `${similarIdea.idea.name}와 유사도 ${similarIdea.score}%입니다. 기존 기록 확장 여부를 확인하세요.`
        : "기존 기록과 강하게 겹치는 아이디어가 없습니다.",
    },
    {
      label: "민감정보",
      passed: !hasSensitiveSource,
      detail: hasSensitiveSource
        ? "메모 근거에 이메일, 전화번호, 계좌, 카드, 신분 정보 단서가 있을 수 있어 저장되는 문서에는 자동 가림 처리가 적용됩니다."
        : "메모 근거에서 명백한 연락처/식별번호 패턴은 보이지 않습니다.",
    },
  ];
}

function hasReadiness(checks: CandidateReadinessCheck[], label: string) {
  return checks.find((check) => check.label === label)?.passed ?? false;
}

export function buildExtractionGate(
  candidate: GateCandidate,
  readinessChecks: CandidateReadinessCheck[],
  similarIdea: SimilarIdeaMatch | null,
): ExtractionGate {
  const passedCount = readinessChecks.filter((check) => check.passed).length;
  const readinessScore = Math.round((passedCount / readinessChecks.length) * 100);
  const blockers = readinessChecks.filter((check) => !check.passed).map((check) => check.label);
  const hasCoreProblem = hasReadiness(readinessChecks, "문제 신호");
  const hasUserBuyer = hasReadiness(readinessChecks, "사용자/구매자");
  const hasMetric = hasReadiness(readinessChecks, "검증 지표");
  const hasMvp = hasReadiness(readinessChecks, "첫 제작 범위");
  const hasDuplicateBlocker = Boolean(similarIdea && similarIdea.score >= 70);
  const hasSensitiveBlocker = !hasReadiness(readinessChecks, "민감정보");
  const corePassCount = [hasCoreProblem, hasUserBuyer, hasMetric, hasMvp].filter(Boolean).length;

  let id: ExtractionGateId = "research";
  let summary = "증거를 더 모은 뒤 저장할지 판단할 아이디어입니다.";
  let nextAction = blockers[0] ? `${blockers[0]} 보완 후 검증 자료로 저장` : "인터뷰와 대체재 조사를 먼저 붙인 뒤 저장";

  if (candidate.validationScore <= 44 || corePassCount <= 1) {
    id = "kill";
    summary = "핵심 문제, 구매자, 실험 단서가 약해 지금은 중단하는 편이 낫습니다.";
    nextAction = "문제 신호가 새로 확인될 때까지 저장하지 말고 보류";
  } else if (hasDuplicateBlocker) {
    id = "pivot";
    summary = "기존 기록과 강하게 겹쳐 새 아이디어보다 병합 또는 포지션 전환을 먼저 봐야 합니다.";
    nextAction = `${similarIdea?.idea.name ?? "기존 아이디어"} 기록을 확장할지, 대상/구매자/범위를 바꿀지 결정`;
  } else if (candidate.validationScore < 58 || (corePassCount <= 2 && readinessScore < 72)) {
    id = "pivot";
    summary = "문제는 보이지만 사용자, 구매자, 실험 범위 중 하나가 흔들려 재정의가 필요합니다.";
    nextAction = blockers[0] ? `${blockers[0]}를 다시 정의하고 한 줄 설명을 좁히기` : "대상 세그먼트와 첫 제작 범위를 다시 좁히기";
  } else if (
    candidate.validationScore >= 72 &&
    readinessScore >= 80 &&
    candidate.riskLevel !== "높음" &&
    !hasSensitiveBlocker
  ) {
    id = "proceed";
    summary = "문제, 구매자, 확인 방법, 첫 제작 범위가 충분해 검증 자료로 저장할 만한 아이디어입니다.";
    nextAction = "아이디어 패키지 저장 후 실행 보드에서 사업성 평가와 첫 검증 계획을 확정";
  } else {
    id = "research";
    summary =
      candidate.riskLevel === "높음"
        ? "수요가 보여도 규제, 개인정보, 운영 책임을 먼저 검증해야 합니다."
        : "근거가 아직 부족해 추가 증거를 붙인 뒤 진행 여부를 봐야 합니다.";
    nextAction = blockers[0] ? `${blockers[0]} 보완 후 저장` : "인터뷰, 가격 신호, 대체재 증거를 추가";
  }

  const thresholdByGate: Record<ExtractionGateId, string> = {
    proceed: "72점 이상, 준비도 80% 이상, 고위험/중복 없음",
    research: "58-71점 또는 준비도 미달, 증거 보완 필요",
    pivot: "45-57점, 강한 중복, 대상/구매자/범위 재정의",
    kill: "44점 이하 또는 핵심 문제/첫 제작 신호 부족",
  };

  return {
    id,
    label: id === "proceed" ? "진행 가능" : id === "research" ? "추가 조사" : id === "pivot" ? "전환 검토" : "보류",
    summary,
    nextAction,
    threshold: thresholdByGate[id],
    blockers,
    readinessScore,
    rank: extractionGateRanks[id] * 1000 + readinessScore * 2 + candidate.validationScore,
  };
}
