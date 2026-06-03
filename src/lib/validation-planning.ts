import type { Decision, Experiment, Idea, Risk, VentureArtifact } from "@/lib/venture-data";

export type ValidationPlanningState = Pick<
  Idea,
  "frequency" | "next_evidence" | "problem_intensity" | "reachability" | "risk_summary" | "signal" | "willingness_to_pay"
>;

type IdeaDomain = "care" | "conversation" | "generic" | "local" | "media" | "subscription";

export type ValidationPlanExperimentDraft = Pick<Experiment, "name" | "success_metric">;
export type ValidationPlanRiskDraft = Pick<Risk, "area" | "mitigation" | "severity" | "title">;

export type ValidationEvidenceCheck = {
  label: string;
  passed: boolean;
  detail: string;
  action: string;
};

export type ValidationEvidenceCoach = {
  score: number;
  label: string;
  checks: ValidationEvidenceCheck[];
  nextFocus: ValidationEvidenceCheck | null;
  prompt: string;
};

export type ValidationPlanningReviewState = {
  validationEvidenceCoach: ValidationEvidenceCoach | null;
  validationPlan: ReturnType<typeof buildValidationPlan> | null;
  recommendedValidationExperiment: ValidationPlanExperimentDraft | null;
};

export function getValidationPlanExperimentPreview(experiments: ValidationPlanExperimentDraft[], limit = 2) {
  return experiments.slice(0, limit);
}

export function inferIdeaDomain(idea: Idea, state: Pick<ValidationPlanningState, "next_evidence" | "risk_summary" | "signal">): IdeaDomain {
  const text = `${idea.name} ${idea.one_liner} ${idea.target_user} ${idea.buyer} ${state.signal} ${state.risk_summary} ${state.next_evidence}`;

  if (/요양|간병|돌봄|시니어/.test(text)) {
    return "care";
  }

  if (/구독|결제|해지|카드|반복/.test(text)) {
    return "subscription";
  }

  if (/대화|협상|갈등|관계|코칭|역할극/.test(text)) {
    return "conversation";
  }

  if (/영상|사진|콘텐츠|숏폼|브이로그/.test(text)) {
    return "media";
  }

  if (/로컬|이웃|공유|대여|심부름/.test(text)) {
    return "local";
  }

  return "generic";
}

function includesAnyNormalized(text: string, terms: string[]) {
  const normalized = text.toLowerCase();

  return terms.some((term) => normalized.includes(term.toLowerCase()));
}

export function buildValidationPlan({
  idea,
  state,
  score,
  risks,
  missing,
}: {
  idea: Idea;
  state: ValidationPlanningState;
  score: number;
  risks: Risk[];
  missing: string[];
}) {
  const domain = inferIdeaDomain(idea, state);
  const openHighRiskCount = risks.filter((risk) => ["high", "critical"].includes(risk.severity) && risk.status !== "closed").length;
  const status =
    missing.length > 0
      ? "증거 공백 해소"
      : openHighRiskCount > 0
        ? "리스크 선검증"
        : score >= 22
          ? "첫 제작 후보"
          : score >= 15
            ? "추가 조사"
            : "중단 또는 전환 검토";
  const statusDetail =
    missing.length > 0
      ? `${missing[0]}부터 채워야 다음 단계 판단이 안정적입니다.`
      : openHighRiskCount > 0
        ? "높음/매우 높은 리스크가 남아 있어 제품 범위보다 안전장치를 먼저 확정해야 합니다."
        : "기본 증거가 정리되어 실험 결과를 기준으로 다음 판단을 내릴 수 있습니다.";

  const experimentsByDomain: Record<IdeaDomain, ValidationPlanExperimentDraft[]> = {
    care: [
      {
        name: "보호자-센터 조율 수동 파일럿",
        success_metric: "보호자/센터 5명 중 3명 이상이 현재 방식보다 확인 시간이 줄었다고 응답하고, 2명 이상이 월 3만원 이상 지불 의향을 밝힘.",
      },
      {
        name: "돌봄 기록 템플릿 반복 사용 테스트",
        success_metric: "3일 연속 기록 완료율 70% 이상, 누락/문의 감소 사례 2건 이상 확인.",
      },
    ],
    subscription: [
      {
        name: "구독 감사 리포트 수동 검증",
        success_metric: "사용자 5명 중 3명 이상이 실제 절감 후보를 발견하고, 2명 이상이 절감액 기반 수수료 또는 월 구독에 동의.",
      },
      {
        name: "해지 체크리스트 완료 테스트",
        success_metric: "해지 후보 10건 중 6건 이상이 사용자의 직접 행동으로 완료되고, 실패 사유가 분류됨.",
      },
    ],
    conversation: [
      {
        name: "실제 대화 전 리허설 테스트",
        success_metric: "사용자 5명 중 3명 이상이 대화 전 자신감이 2점 이상 상승하고, 2명 이상이 다음 상황에서도 재사용 의향을 밝힘.",
      },
      {
        name: "스크립트 선택률 테스트",
        success_metric: "상황별 스크립트 3안 중 하나를 실제로 사용한 비율 60% 이상.",
      },
    ],
    media: [
      {
        name: "수동 하이라이트 영상 파일럿",
        success_metric: "샘플 사용자 5명 중 3명 이상이 결과물을 저장 또는 공유하고, 2명 이상이 반복 제작 의향을 밝힘.",
      },
      {
        name: "스토리보드 만족도 테스트",
        success_metric: "편집 전 스토리보드 승인률 70% 이상, 수정 요청이 2회 이하.",
      },
    ],
    local: [
      {
        name: "폐쇄형 단지 거래 파일럿",
        success_metric: "등록 요청 10건 중 4건 이상 매칭, 완료 후 신뢰/안전 불안 점수 2점 이하.",
      },
      {
        name: "보증금/인증 조건 테스트",
        success_metric: "사용자 5명 중 3명 이상이 거래 전 필요한 인증 조건을 명확히 선택.",
      },
    ],
    generic: [
      {
        name: "5명 문제 인터뷰와 수동 결과물 테스트",
        success_metric: "5명 중 3명 이상이 주 1회 이상 문제를 겪고, 2명 이상이 수동 결과물에 비용 또는 재사용 의향을 밝힘.",
      },
      {
        name: "랜딩 페이지 구매 의향 테스트",
        success_metric: "타겟 방문자 30명 중 5명 이상이 대기자 등록 또는 상담 신청.",
      },
    ],
  };

  const risksByDomain: Record<IdeaDomain, ValidationPlanRiskDraft[]> = {
    care: [
      {
        title: "돌봄 개인정보와 책임 소재",
        area: "개인정보/운영",
        severity: "high",
        mitigation: "초기 파일럿은 가명 데이터와 동의받은 샘플만 사용하고, 가족/센터/요양보호사별 책임 범위를 문서화합니다.",
      },
    ],
    subscription: [
      {
        title: "결제 데이터와 계정 접근",
        area: "보안/동의",
        severity: "high",
        mitigation: "초기 검증 버전은 직접 계정 로그인을 하지 않고 사용자가 제공한 캡처/CSV만 처리하며, 해지는 안내로 제한합니다.",
      },
    ],
    conversation: [
      {
        title: "전문 상담 또는 법률 조언 오인",
        area: "법무/콘텐츠",
        severity: "medium",
        mitigation: "앱 문구를 연습/커뮤니케이션 보조로 제한하고, 의료·법률·심리상담 판단으로 보이는 표현을 금지합니다.",
      },
    ],
    media: [
      {
        title: "초상권과 민감 미디어 처리",
        area: "개인정보/저작권",
        severity: "medium",
        mitigation: "업로드 전 동의 안내, 아동/타인 얼굴 포함 여부 체크, 원본 보관 기간 제한을 적용합니다.",
      },
    ],
    local: [
      {
        title: "오프라인 거래 안전과 분쟁",
        area: "운영/신뢰",
        severity: "high",
        mitigation: "초기 베타는 초대된 사용자로 제한하고, 보증금·완료 확인·분쟁 기록을 필수로 둡니다.",
      },
    ],
    generic: [
      {
        title: "검증 없는 범위 확장",
        area: "제품",
        severity: "medium",
        mitigation: "첫 제작 범위는 하나의 반복 문제와 하나의 성공 지표만 지원하고, 추가 기능은 실험 통과 후 반영합니다.",
      },
    ],
  };

  return {
    status,
    statusDetail,
    hypotheses: [
      `${idea.target_user || "대상 사용자"}가 ${state.signal || idea.one_liner || "이 문제"}를 반복적으로 겪는다.`,
      `${idea.buyer || "구매자"}가 현재 대안보다 빠르거나 믿을 수 있는 결과에 지불 의향을 보인다.`,
      `첫 제작 범위는 ${state.next_evidence || "추가로 확인할 내용"}을 확인하는 데 필요한 것만 포함한다.`,
    ],
    interviewQuestions: [
      "최근 이 문제가 발생한 실제 사례를 시간순으로 설명해줄 수 있나요?",
      "지금은 어떤 방식으로 해결하고 있고, 그 방식에서 가장 싫은 부분은 무엇인가요?",
      "이 문제가 해결되면 누가 비용을 내고, 얼마까지 현실적인가요?",
      "첫 버전에서 반드시 없어도 되는 기능은 무엇인가요?",
    ],
    experiments: experimentsByDomain[domain],
    risks: risksByDomain[domain],
    nextAction:
      status === "리스크 선검증"
        ? "리스크 초안을 먼저 저장한 뒤 완화 조건을 정하세요."
        : "첫 실험을 저장하고 진행 중으로 바꾼 뒤 실제 사용자 증거를 모으세요.",
  };
}

export function buildValidationEvidenceCoach({
  idea,
  state,
  risks,
  experiments,
  artifacts,
}: {
  idea: Idea;
  state: ValidationPlanningState;
  score: number;
  risks: Risk[];
  experiments: Experiment[];
  artifacts: VentureArtifact[];
  decisions: Decision[];
}): ValidationEvidenceCoach {
  const domain = inferIdeaDomain(idea, state);
  const combinedText = [
    idea.name,
    idea.one_liner,
    idea.target_user,
    idea.buyer,
    state.signal,
    state.risk_summary,
    state.next_evidence,
    ...artifacts.map((artifact) => `${artifact.title} ${artifact.body}`),
  ].join(" ");
  const doneExperiments = experiments.filter((experiment) => experiment.status === "done");
  const runningExperiments = experiments.filter((experiment) => experiment.status === "running");
  const evidenceArtifacts = artifacts.filter((artifact) =>
    ["evidence_capture", "experiment_result", "validation_summary", "market_scan"].includes(artifact.source || ""),
  );
  const openHighRisks = risks.filter((risk) => ["high", "critical"].includes(risk.severity) && risk.status !== "closed");
  const domainQuestions: Record<IdeaDomain, string[]> = {
    care: [
      "가족, 센터, 요양보호사 중 누가 오늘 가장 답답해하는지 실제 사례를 시간순으로 묻기",
      "현재 카카오톡, 전화, 수기 기록으로 처리하는 시간과 누락 사례를 숫자로 받기",
      "민감 돌봄 기록을 앱에 남길 때 필요한 동의와 책임 경계를 확인하기",
    ],
    subscription: [
      "최근 3개월 반복 결제 목록을 보고 실제 낭비 또는 해지 실패 사례를 확인하기",
      "해지를 대신해주는 것과 안내만 해주는 것 중 어떤 수준에 비용을 낼지 묻기",
      "결제/이메일 데이터 접근에 대한 허용 범위와 불안 요인을 확인하기",
    ],
    conversation: [
      "다가오는 실제 대화 1건을 고르고 전후 자신감 점수 변화를 기록하기",
      "제안 스크립트를 실제로 사용했는지와 결과가 나아졌는지 확인하기",
      "상담/법률 조언으로 오해하지 않는 안전 문구를 검증하기",
    ],
    media: [
      "최근 사진/영상이 갤러리에만 쌓인 실제 상황과 다시 보는 빈도를 확인하기",
      "수동 제작 샘플을 보여주고 저장, 공유, 반복 제작 의향을 측정하기",
      "얼굴, 아동, 위치 정보가 포함된 미디어 처리 불안을 확인하기",
    ],
    local: [
      "최근 빌리거나 도움받고 싶었던 물건/일을 3건 이상 수집하기",
      "이웃 인증, 보증금, 분쟁 처리 조건 중 거래 전 꼭 필요한 장치를 고르게 하기",
      "500m 단위 공급/수요가 같은 시간대에 맞는지 소규모 단지에서 확인하기",
    ],
    generic: [
      "최근 이 문제가 발생한 실제 사례를 시간순으로 묻기",
      "현재 대안, 비용, 실패 지점을 숫자와 함께 받기",
      "수동 결과물 또는 랜딩 페이지로 지불/신청 의향을 확인하기",
    ],
  };
  const checks: ValidationEvidenceCheck[] = [
    {
      label: "문제 빈도",
      passed:
        (state.problem_intensity >= 4 && state.frequency >= 3) ||
        includesAnyNormalized(combinedText, ["매일", "매주", "반복", "주 1회", "월 1회", "자주"]),
      detail: "문제가 반복되고 강도가 높은지 확인합니다.",
      action: "최근 30일 기준 발생 횟수와 마지막 사례를 물어보세요.",
    },
    {
      label: "실제 사례",
      passed:
        state.signal.trim().length >= 60 ||
        evidenceArtifacts.length > 0 ||
        includesAnyNormalized(combinedText, ["사례", "인터뷰", "관찰", "고객", "사용자 5명"]),
      detail: "추상 의견이 아니라 실제 행동/사건 근거가 필요합니다.",
      action: "사용자가 마지막으로 이 문제를 겪은 상황을 시간순으로 기록하세요.",
    },
    {
      label: "구매자와 지불",
      passed:
        Boolean(idea.buyer.trim()) &&
        state.willingness_to_pay >= 3 &&
        includesAnyNormalized(combinedText, ["가격", "지불", "구매", "예산", "만원", "원", "구독"]),
      detail: "누가 돈을 내고 어떤 예산에서 결제하는지 확인합니다.",
      action: "월 비용, 건당 비용, 절감액 기반 수수료 중 어떤 모델이 가능한지 묻습니다.",
    },
    {
      label: "도달 채널",
      passed: Boolean(idea.target_user.trim()) && state.reachability >= 3,
      detail: "초기 인터뷰와 파일럿 대상을 실제로 만날 수 있어야 합니다.",
      action: "이번 주 연락 가능한 타겟 5명과 접근 채널을 적으세요.",
    },
    {
      label: "대안/경쟁",
      passed:
        includesAnyNormalized(combinedText, ["대안", "경쟁", "엑셀", "카카오", "전화", "수동", "현재 방식", "우회"]) ||
        artifacts.some((artifact) => ["extracted_research_brief", "market_scan"].includes(artifact.source || "")),
      detail: "현재 대체재를 알아야 차별성과 가격을 판단할 수 있습니다.",
      action: "사용자가 지금 쓰는 대안 3개와 각 대안의 불만을 표로 정리하세요.",
    },
    {
      label: "행동 증거",
      passed: doneExperiments.length > 0 || runningExperiments.length > 0 || evidenceArtifacts.length >= 2,
      detail: "말이 아니라 클릭, 신청, 저장, 공유, 결제 의향 같은 행동 신호가 필요합니다.",
      action: "가장 작은 수동 검증이나 랜딩 테스트를 실행하고 결과를 실험 기록으로 남기세요.",
    },
    {
      label: "리스크 수용",
      passed: openHighRisks.length === 0 && Boolean(state.risk_summary.trim()),
      detail: "고위험 리스크가 남아 있으면 제품 기획서보다 완화 조건을 먼저 정합니다.",
      action: "높음/치명 리스크를 종료하거나 수용 조건과 차단 범위를 기록하세요.",
    },
  ];
  const passedCount = checks.filter((check) => check.passed).length;
  const evidenceScore = Math.round((passedCount / checks.length) * 100);
  const nextFocus = checks.find((check) => !check.passed) ?? null;
  const label =
    evidenceScore >= 86
      ? "개발 전환 근거 양호"
      : evidenceScore >= 65
        ? "7일 검증 가능"
        : evidenceScore >= 45
          ? "핵심 증거 보완"
          : "인터뷰부터 재정렬";
  const prompt = `# 검증 질문 묶음: ${idea.name}

## 이번에 보완할 증거

${nextFocus ? `- ${nextFocus.label}: ${nextFocus.action}` : "- 현재 핵심 증거가 대부분 충족되었습니다. 완료된 실험 결과와 최종 판단 근거를 정리하세요."}

## 질문 세트

${(domainQuestions[domain] ?? domainQuestions.generic).map((question) => `- ${question}`).join("\n")}

## 기록 형식

- 대상/출처:
- 최근 실제 사례:
- 현재 대안:
- 비용/시간 손실:
- 지불 또는 승인 조건:
- 새로 발견한 리스크:
- 진행/전환/중단에 주는 영향:
`;

  return {
    score: evidenceScore,
    label,
    checks,
    nextFocus,
    prompt,
  };
}

export function buildValidationPlanningReviewState({
  artifacts,
  decisions,
  experiments,
  idea,
  missing,
  risks,
  score,
  state,
}: {
  artifacts: VentureArtifact[];
  decisions: Decision[];
  experiments: Experiment[];
  idea: Idea | null;
  missing: string[];
  risks: Risk[];
  score: number;
  state: ValidationPlanningState | null;
}): ValidationPlanningReviewState {
  if (!idea || !state) {
    return {
      validationEvidenceCoach: null,
      validationPlan: null,
      recommendedValidationExperiment: null,
    };
  }

  const validationPlan = buildValidationPlan({
    idea,
    state,
    score,
    risks,
    missing,
  });

  return {
    validationEvidenceCoach: buildValidationEvidenceCoach({
      artifacts,
      decisions,
      experiments,
      idea,
      risks,
      score,
      state,
    }),
    validationPlan,
    recommendedValidationExperiment: validationPlan.experiments[0] ?? null,
  };
}
