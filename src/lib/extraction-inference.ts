import { countKeywordHits } from "@/lib/extraction-text-utils";
import type { ExtractedIdeaRiskLevel } from "@/lib/extraction-risk-utils";

export type InitialIdeaScores = {
  problem_intensity: number;
  frequency: number;
  reachability: number;
  willingness_to_pay: number;
  mvp_speed: number;
  differentiation: number;
  regulatory_risk: number;
};

export type ExtractedIdeaRecommendation = "우선 검증" | "리스크 선검증" | "추가 조사" | "보류";

export function inferText(block: string, type: "target" | "buyer" | "risk" | "next") {
  if (type === "target") {
    if (/요양|간병|돌봄|시니어/.test(block)) {
      return "돌봄을 조율하는 가족과 소규모 케어 운영자";
    }
    if (/구독|ott|결제|해지/.test(block)) {
      return "디지털 구독과 반복 결제가 많은 소비자";
    }
    if (/대화|협상|갈등|관계|심리/.test(block)) {
      return "중요한 대화를 앞둔 직장인과 개인 사용자";
    }
    if (/로컬|이웃|공유|대여|심부름/.test(block)) {
      return "동네 기반으로 도구나 짧은 도움을 필요로 하는 생활 사용자";
    }
    if (/영상|사진|콘텐츠|숏폼|브이로그/.test(block)) {
      return "사진과 영상을 많이 남기지만 편집 시간이 부족한 사용자";
    }

    return "반복 문제를 겪는 초기 타겟 사용자";
  }

  if (type === "buyer") {
    if (/센터|b2b|팀|기업|업무/.test(block)) {
      return "소규모 팀 또는 운영 조직";
    }
    if (/가족|부모|시니어|요양/.test(block)) {
      return "가족 돌봄 관리자 또는 케어센터";
    }

    return "문제 해결에 직접 비용을 지불할 개인 사용자";
  }

  if (type === "risk") {
    if (/금융|자산|투자|계좌|카드|결제/.test(block)) {
      return "금융 조언 오인, 결제 데이터 처리, 계정 접근 동의가 핵심 리스크입니다.";
    }
    if (/요양|간병|돌봄|시니어|의료/.test(block)) {
      return "개인정보, 의료·요양 규정, 돌봄 책임 소재가 핵심 리스크입니다.";
    }
    if (/대화|심리|상담|관계|갈등/.test(block)) {
      return "상담·의료·법률 조언처럼 보이는 표현과 민감 대화 데이터 처리가 핵심 리스크입니다.";
    }
    if (/로컬|공유|대여|이웃|심부름/.test(block)) {
      return "신원 확인, 분쟁 처리, 안전 사고, 물품 파손 책임이 핵심 리스크입니다.";
    }
    if (/영상|사진|콘텐츠|브이로그|숏폼/.test(block)) {
      return "초상권, 저작권, 아동 사진, 민감 미디어 처리 정책이 핵심 리스크입니다.";
    }

    return "개인정보, 권한, 책임 소재, 규제 표현을 먼저 검토해야 합니다.";
  }

  if (/요양|간병|돌봄|센터/.test(block)) {
    return "실제 보호자와 케어센터 5명에게 현재 조율 방식과 비용 지불 의향을 확인합니다.";
  }
  if (/구독|결제|해지/.test(block)) {
    return "사용자 5명의 실제 구독 내역 정리 과정을 관찰하고 수동 해지 안내 검증 버전을 테스트합니다.";
  }
  if (/대화|협상|갈등/.test(block)) {
    return "반복 빈도가 높은 대화 상황 하나를 정하고 스크립트 사용 전후 자신감 변화를 측정합니다.";
  }

  return "가장 고통이 큰 사용자 5명에게 문제 빈도, 현재 대안, 지불 의향을 확인합니다.";
}

export function inferRiskLevel(block: string): ExtractedIdeaRiskLevel {
  const highRiskHits = countKeywordHits(block, [
    "금융",
    "투자",
    "계좌",
    "카드",
    "결제",
    "해지",
    "의료",
    "요양",
    "간병",
    "법률",
    "상담",
    "보험",
    "개인정보",
    "계정",
    "아동",
    "상속",
  ]);

  if (highRiskHits >= 3) {
    return "높음";
  }

  if (highRiskHits >= 1 || /규제|권한|보안|민감|책임/.test(block)) {
    return "보통";
  }

  return "낮음";
}

export function inferAssumptions(block: string, name: string, targetUser: string, buyer: string) {
  const outcome = /요양|간병|돌봄/.test(block)
    ? "조율 시간과 책임 불안을 줄인다"
    : /구독|결제|해지/.test(block)
      ? "새는 지출을 발견하고 해지 행동까지 이어진다"
      : /대화|협상|갈등|관계/.test(block)
        ? "중요한 대화 전 준비 시간이 줄고 자신감이 오른다"
        : /영상|사진|콘텐츠|숏폼/.test(block)
          ? "편집 없이도 다시 볼 만한 결과물이 만들어진다"
          : "현재 대안보다 빠르고 믿을 수 있는 결과를 만든다";

  return [
    `${targetUser}가 이 문제를 반복적으로 겪고 있고 현재 대안에 불만이 있다.`,
    `${buyer}가 ${outcome}는 결과에 비용 또는 시간을 지불할 의향이 있다.`,
    `${name}은 완전 자동화 전에 수동 운영 MVP로도 핵심 가치를 검증할 수 있다.`,
  ];
}

export function inferValidationQuestions(block: string, targetUser: string, buyer: string) {
  const domainQuestion = /요양|간병|돌봄/.test(block)
    ? "돌봄 기록, 일정, 가족 커뮤니케이션 중 가장 자주 깨지는 지점은 어디인가?"
    : /구독|결제|해지/.test(block)
      ? "최근 3개월 안에 해지하지 못해 손해 본 구독이 있었고, 해지 대행에 얼마까지 맡길 수 있는가?"
      : /대화|협상|갈등|관계/.test(block)
        ? "실제 대화 직전 어떤 자료나 문장이 있으면 행동으로 옮길 가능성이 가장 높은가?"
        : /로컬|이웃|공유|대여|심부름/.test(block)
          ? "낯선 이웃과 거래할 때 신뢰를 만들 최소 조건은 무엇인가?"
          : "현재 문제를 해결하기 위해 이미 돈, 시간, 사람을 쓰고 있는가?";

  return [
    `${targetUser}는 이 문제를 얼마나 자주 겪고, 한 번 발생할 때 비용이나 시간이 얼마나 드는가?`,
    `${buyer}는 구매 결정을 혼자 하는가, 아니면 승인자나 예산 제약이 있는가?`,
    domainQuestion,
    "첫 사용 이후 다시 돌아오게 만드는 반복 트리거는 무엇인가?",
  ];
}

export function inferSevenDayExperiment(block: string, name: string) {
  if (/요양|간병|돌봄/.test(block)) {
    return "1일차 보호자/센터 5명 인터뷰, 2일차 카카오톡/시트 기반 돌봄 기록 템플릿 제작, 3~5일차 실제 기록 3건을 수동 운영, 6일차 비용 지불 의향 확인, 7일차 진행/전환/중단 판단.";
  }

  if (/구독|결제|해지/.test(block)) {
    return "1일차 사용자 5명의 구독 목록 수집, 2일차 수동 감사 리포트 제작, 3~5일차 해지 안내를 수동으로 제공, 6일차 절감액과 유료 전환 의향 측정, 7일차 자동화 범위 결정.";
  }

  if (/대화|협상|갈등|관계/.test(block)) {
    return "1일차 고빈도 대화 상황 1개 선택, 2일차 스크립트 템플릿 제작, 3~5일차 사용자 5명이 실제 대화 전 리허설, 6일차 자신감/결과 변화 측정, 7일차 반복 사용 의향 판단.";
  }

  if (/영상|사진|콘텐츠|숏폼/.test(block)) {
    return "1일차 샘플 앨범 5개 수집, 2일차 수동 편집 기준 정의, 3~5일차 1분 결과물 3개 제작, 6일차 공유/저장 의향 측정, 7일차 자동 편집 범위 결정.";
  }

  return `1일차 ${name}의 핵심 사용자 5명 인터뷰, 2일차 수동 결과물 템플릿 제작, 3~5일차 실제 요청 3건 처리, 6일차 지불 의향과 재사용 의향 확인, 7일차 진행/전환/중단 판단.`;
}

export function inferKillCriteria(block: string) {
  if (/요양|간병|돌봄|의료|금융|투자|법률|상담|보험/.test(block)) {
    return "사용자 5명 중 3명 이상이 반복 고통을 인정하지 않거나, 필수 데이터/권한/규제 리스크를 합법적이고 설명 가능한 방식으로 처리할 수 없으면 중단합니다.";
  }

  return "사용자 5명 중 3명 이상이 현재 대안보다 낫다고 느끼지 않거나, 수동 검증 결과물에 비용 또는 재사용 의향을 보이지 않으면 중단합니다.";
}

export function inferFirstPrototypeScope(block: string) {
  if (/요양|간병|돌봄/.test(block)) {
    return "가족 초대, 돌봄 일정, 일일 기록, 이슈 알림만 있는 웹 콘솔. 초기에는 운영자가 기록 정리와 알림을 수동 보조합니다.";
  }

  if (/구독|결제|해지/.test(block)) {
    return "사용자가 구독 목록을 직접 붙여넣으면 절감 리포트와 해지 체크리스트를 생성하는 감사 도구. 실제 해지는 수동 안내로 제한합니다.";
  }

  if (/대화|협상|갈등|관계/.test(block)) {
    return "상황, 상대 성향, 목표를 입력하면 3개 스크립트와 역할극 질문을 제공하는 단일 플로우.";
  }

  if (/로컬|이웃|공유|대여|심부름/.test(block)) {
    return "동네 인증, 요청 등록, 수락, 완료 확인, 분쟁 메모만 있는 폐쇄형 베타 보드.";
  }

  if (/영상|사진|콘텐츠|숏폼/.test(block)) {
    return "사진 20장과 짧은 메모를 업로드하면 운영자가 1분 스토리보드와 결과물을 반환하는 반자동 검증 버전.";
  }

  return "가입, 문제 입력, 수동 결과물 전달, 피드백 수집만 포함한 가장 작은 검증 화면.";
}

export function inferPricingHypothesis(block: string, buyer: string) {
  if (/센터|기업|팀|B2B|업무/.test(`${block} ${buyer}`)) {
    return "초기에는 조직당 월 5만~20만원 또는 운영 건당 과금으로 검증합니다.";
  }

  if (/구독|결제|해지/.test(block)) {
    return "절감액의 10~20% 또는 월 4,900~9,900원 구독으로 지불 의향을 확인합니다.";
  }

  if (/로컬|공유|대여|심부름/.test(block)) {
    return "거래 수수료 5~15% 또는 신뢰 인증/보험 옵션 유료화를 검증합니다.";
  }

  return "개인 사용자는 월 4,900~14,900원, 전문가/팀 사용자는 좌석당 월 1만~3만원으로 테스트합니다.";
}

export function inferSuccessMetric(block: string) {
  if (/요양|간병|돌봄/.test(block)) {
    return "보호자/센터 5명 중 3명 이상이 현재 방식보다 조율 시간이 줄었다고 평가하고, 2명 이상이 월 비용 지불 의향을 밝힘";
  }

  if (/구독|결제|해지/.test(block)) {
    return "사용자 5명 중 3명 이상이 최소 1개 이상의 불필요한 구독을 발견하고, 2명 이상이 절감액 기반 과금에 동의함";
  }

  if (/대화|협상|갈등|관계/.test(block)) {
    return "사용자 5명 중 3명 이상이 실제 대화 전 자신감이 상승했다고 답하고, 2명 이상이 다음 대화에도 재사용 의향을 밝힘";
  }

  if (/영상|사진|콘텐츠|숏폼/.test(block)) {
    return "사용자 5명 중 3명 이상이 결과물을 저장 또는 공유하고, 2명 이상이 반복 생성 의향을 밝힘";
  }

  return "핵심 사용자 5명 중 3명 이상이 현재 대안보다 낫다고 평가하고, 2명 이상이 비용 또는 재사용 의향을 밝힘";
}

export function inferInitialScores(
  block: string,
  riskLevel: ExtractedIdeaRiskLevel,
  buyer: string,
): InitialIdeaScores {
  const painHits = countKeywordHits(block, ["불편", "막막", "낭비", "놓치", "불안", "고통", "실수", "책임", "비용"]);
  const frequencyHits = countKeywordHits(block, ["매일", "매주", "반복", "수많은", "자주", "항상", "계속"]);
  const reachableHits = countKeywordHits(block, ["센터", "가족", "직장인", "소비자", "전문직", "팀", "사용자", "보호자"]);
  const paidHits = countKeywordHits(block, ["비용", "절감", "구매", "BM", "지불", "유료", "센터", "기업", "팀"]);
  const fastMvpHits = countKeywordHits(block, ["수동", "템플릿", "리포트", "스크립트", "콘솔", "체크리스트", "프로토타입"]);
  const differentiationHits = countKeywordHits(block, ["대행", "자동", "AI", "개인화", "매칭", "코칭", "운영", "추천"]);

  return {
    problem_intensity: Math.min(5, 2 + Math.min(painHits, 3)),
    frequency: Math.min(5, 2 + Math.min(frequencyHits, 3)),
    reachability: Math.min(5, 2 + Math.min(reachableHits, 3)),
    willingness_to_pay: Math.min(5, 2 + Math.min(paidHits + (/센터|기업|팀|B2B/.test(buyer) ? 1 : 0), 3)),
    mvp_speed: Math.max(1, Math.min(5, 3 + Math.min(fastMvpHits, 2) - (riskLevel === "높음" ? 1 : 0))),
    differentiation: Math.min(5, 2 + Math.min(differentiationHits, 3)),
    regulatory_risk: riskLevel === "높음" ? 4 : riskLevel === "보통" ? 3 : 1,
  };
}

export function scoreExtractedIdea({
  block,
  evidenceCount,
  riskLevel,
  buyer,
}: {
  block: string;
  evidenceCount: number;
  riskLevel: ExtractedIdeaRiskLevel;
  buyer: string;
}) {
  const painHits = countKeywordHits(block, [
    "불편",
    "막막",
    "낭비",
    "놓치",
    "반복",
    "시간",
    "비용",
    "고통",
    "흩어",
    "불안",
    "실수",
    "조율",
    "귀찮",
  ]);
  const actionHits = countKeywordHits(block, ["대행", "자동", "안내", "관리", "코칭", "콘솔", "대시보드", "매칭", "추천"]);
  const explicitBuyer = /센터|기업|팀|가족|소비자|전문직|사용자|구매|BM|비즈니스/.test(buyer);
  const riskPenalty = riskLevel === "높음" ? 12 : riskLevel === "보통" ? 6 : 0;
  const rawScore =
    42 +
    evidenceCount * 4 +
    Math.min(painHits, 6) * 4 +
    Math.min(actionHits, 5) * 3 +
    (explicitBuyer ? 9 : 0) -
    riskPenalty;

  return Math.max(30, Math.min(92, rawScore));
}

export function inferRecommendation(
  validationScore: number,
  riskLevel: ExtractedIdeaRiskLevel,
): ExtractedIdeaRecommendation {
  if (validationScore >= 74 && riskLevel === "높음") {
    return "리스크 선검증";
  }

  if (validationScore >= 72) {
    return "우선 검증";
  }

  if (validationScore >= 58) {
    return "추가 조사";
  }

  return "보류";
}
