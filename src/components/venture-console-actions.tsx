"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import {
  Building2,
  Clock3,
  LogIn,
  LogOut,
  PlusCircle,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Trash2,
  Users,
} from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Database, OrganizationRole } from "@/lib/supabase/types";

type Organization = Database["public"]["Tables"]["organizations"]["Row"];
type OrganizationMember = Database["public"]["Tables"]["organization_members"]["Row"];
type AuditEvent = Database["public"]["Tables"]["audit_events"]["Row"];
type Idea = Database["public"]["Tables"]["ideas"]["Row"];
type VentureArtifact = Database["public"]["Tables"]["venture_artifacts"]["Row"];
type VentureArtifactInsert = Database["public"]["Tables"]["venture_artifacts"]["Insert"];
type AddableOrganizationRole = Extract<OrganizationRole, "admin" | "member" | "viewer">;

type FormState = {
  name: string;
  one_liner: string;
  target_user: string;
  buyer: string;
  signal: string;
  risk_summary: string;
  next_evidence: string;
};

export type ConsoleActionTask = "auth" | "workspace" | "extract" | "idea";

type InitialIdeaScores = Pick<
  Idea,
  | "problem_intensity"
  | "frequency"
  | "reachability"
  | "willingness_to_pay"
  | "mvp_speed"
  | "differentiation"
  | "regulatory_risk"
>;

type ExtractedIdea = FormState & {
  id: string;
  sourceBlock: string;
  confidence: number;
  evidence: string[];
  validationScore: number;
  initialScores: InitialIdeaScores;
  riskLevel: "낮음" | "보통" | "높음";
  recommendation: "우선 검증" | "리스크 선검증" | "추가 조사" | "보류";
  assumptions: string[];
  validationQuestions: string[];
  sevenDayExperiment: string;
  successMetric: string;
  killCriteria: string;
  firstPrototypeScope: string;
  pricingHypothesis: string;
  validationRationale: string;
};

type SimilarIdeaMatch = {
  idea: Idea;
  score: number;
  reason: string;
};

type CandidateReadinessCheck = {
  label: string;
  passed: boolean;
  detail: string;
};

const emptyForm: FormState = {
  name: "",
  one_liner: "",
  target_user: "",
  buyer: "",
  signal: "",
  risk_summary: "",
  next_evidence: "",
};

const memberRoles: AddableOrganizationRole[] = ["member", "viewer", "admin"];
const organizationRoleLabels: Record<OrganizationRole, string> = {
  owner: "소유자",
  admin: "관리자",
  member: "멤버",
  viewer: "뷰어",
};
const workspaceRecordTables = [
  "ideas",
  "risks",
  "decisions",
  "experiments",
  "orchestration_runs",
  "venture_artifacts",
  "implementation_tasks",
] as const;

const sampleIdeaSource = `아이디어: 구독 관리 에이전트
페인 포인트: 사람들은 OTT, 소프트웨어, 유료 서비스 해지 시점을 놓치고 돈을 낭비합니다.
솔루션: 카드 내역이나 이메일에서 반복 결제를 찾아내고 해지 절차를 안내하는 개인 지출 에이전트.
타겟층: 디지털 구독이 많은 바쁜 소비자.

아이디어: 돌봄 운영 콘솔
페인 포인트: 가족, 요양보호사, 센터 사이의 일정과 돌봄 기록이 흩어져 신뢰 문제가 생깁니다.
솔루션: 가족, 요양보호사, 센터 간 돌봄 일정과 기록을 관리하는 운영 콘솔.
타겟층: 돌봄을 조율하는 가족과 소규모 방문요양센터.

아이디어: 상황별 대화 코치
페인 포인트: 연봉 협상, 가족 갈등, 고객 응대처럼 중요한 대화를 어떻게 시작할지 막막합니다.
솔루션: 상대 성향과 목적을 입력하면 스크립트와 역할극을 제공하는 대화 코칭 도구.
타겟층: 어려운 대화를 앞둔 직장인과 개인 사용자.`;

function compactText(value: string, maxLength = 180) {
  return value.replace(/\s+/g, " ").trim().slice(0, maxLength);
}

function stripLabel(value: string) {
  return value
    .replace(/^#{1,4}\s*/, "")
    .replace(/^\d+[\.\)]\s*/, "")
    .replace(/^아이디어\s*[:：]\s*/, "")
    .replace(/^["“”']|["“”']$/g, "")
    .trim();
}

function findLabeledValue(block: string, labels: string[]) {
  const pattern = new RegExp(`(?:^|\\n)\\s*(?:${labels.join("|")})\\s*[:：]\\s*([^\\n]+)`, "i");
  const match = block.match(pattern);

  return match ? compactText(match[1]) : "";
}

function inferText(block: string, type: "target" | "buyer" | "risk" | "next") {
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
    return "사용자 5명의 실제 구독 내역 정리 과정을 관찰하고 수동 해지 안내 MVP를 테스트합니다.";
  }
  if (/대화|협상|갈등/.test(block)) {
    return "반복 빈도가 높은 대화 상황 하나를 정하고 스크립트 사용 전후 자신감 변화를 측정합니다.";
  }

  return "가장 고통이 큰 사용자 5명에게 문제 빈도, 현재 대안, 지불 의향을 확인합니다.";
}

function countKeywordHits(block: string, keywords: string[]) {
  return keywords.reduce((count, keyword) => count + (block.includes(keyword) ? 1 : 0), 0);
}

function inferRiskLevel(block: string): ExtractedIdea["riskLevel"] {
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

function inferAssumptions(block: string, name: string, targetUser: string, buyer: string) {
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

function inferValidationQuestions(block: string, targetUser: string, buyer: string) {
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

function inferSevenDayExperiment(block: string, name: string) {
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

function inferKillCriteria(block: string) {
  if (/요양|간병|돌봄|의료|금융|투자|법률|상담|보험/.test(block)) {
    return "사용자 5명 중 3명 이상이 반복 고통을 인정하지 않거나, 필수 데이터/권한/규제 리스크를 합법적이고 설명 가능한 방식으로 처리할 수 없으면 중단합니다.";
  }

  return "사용자 5명 중 3명 이상이 현재 대안보다 낫다고 느끼지 않거나, 수동 MVP 결과물에 비용 또는 재사용 의향을 보이지 않으면 중단합니다.";
}

function inferFirstPrototypeScope(block: string) {
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
    return "사진 20장과 짧은 메모를 업로드하면 운영자가 1분 스토리보드와 결과물을 반환하는 반자동 MVP.";
  }

  return "가입, 문제 입력, 수동 결과물 전달, 피드백 수집만 포함한 가장 작은 검증 화면.";
}

function inferPricingHypothesis(block: string, buyer: string) {
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

function inferSuccessMetric(block: string) {
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

function inferInitialScores(block: string, riskLevel: ExtractedIdea["riskLevel"], buyer: string): InitialIdeaScores {
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

function inferRiskSeverity(riskLevel: ExtractedIdea["riskLevel"]) {
  if (riskLevel === "높음") {
    return "high";
  }

  if (riskLevel === "보통") {
    return "medium";
  }

  return "low";
}

function inferRiskArea(block: string) {
  if (/요양|간병|의료|돌봄|건강/.test(block)) {
    return "규제/개인정보";
  }

  if (/금융|결제|계좌|카드|투자|보험/.test(block)) {
    return "금융/결제";
  }

  if (/대화|상담|심리|갈등|관계/.test(block)) {
    return "민감 대화/조언";
  }

  if (/로컬|공유|대여|심부름/.test(block)) {
    return "신뢰/운영";
  }

  return "제품/보안";
}

function scoreExtractedIdea({
  block,
  evidenceCount,
  riskLevel,
  buyer,
}: {
  block: string;
  evidenceCount: number;
  riskLevel: ExtractedIdea["riskLevel"];
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

function inferRecommendation(
  validationScore: number,
  riskLevel: ExtractedIdea["riskLevel"],
): ExtractedIdea["recommendation"] {
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

function normalizeMatchText(value: string) {
  return value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getMatchTokens(value: string) {
  return new Set(
    normalizeMatchText(value)
      .split(" ")
      .map((token) => token.trim())
      .filter((token) => token.length >= 2),
  );
}

function tokenOverlapScore(left: string, right: string) {
  const leftTokens = getMatchTokens(left);
  const rightTokens = getMatchTokens(right);

  if (leftTokens.size === 0 || rightTokens.size === 0) {
    return 0;
  }

  let overlap = 0;

  for (const token of leftTokens) {
    if (rightTokens.has(token)) {
      overlap += 1;
    }
  }

  return Math.round((overlap / Math.max(leftTokens.size, rightTokens.size)) * 100);
}

function findSimilarIdea(candidate: ExtractedIdea, existingIdeas: Idea[]): SimilarIdeaMatch | null {
  const candidateName = normalizeMatchText(candidate.name);
  const candidateText = `${candidate.name} ${candidate.one_liner} ${candidate.target_user} ${candidate.buyer} ${candidate.signal}`;

  const matches = existingIdeas
    .map((idea) => {
      const ideaName = normalizeMatchText(idea.name);
      const ideaText = `${idea.name} ${idea.one_liner} ${idea.target_user} ${idea.buyer} ${idea.signal}`;
      const nameScore =
        candidateName && ideaName && candidateName === ideaName
          ? 100
          : candidateName && ideaName && (candidateName.includes(ideaName) || ideaName.includes(candidateName))
            ? 86
            : tokenOverlapScore(candidate.name, idea.name);
      const textScore = tokenOverlapScore(candidateText, ideaText);
      const targetScore = tokenOverlapScore(candidate.target_user, idea.target_user);
      const score = Math.max(nameScore, Math.round(textScore * 0.7 + targetScore * 0.3));

      return {
        idea,
        score,
        reason:
          nameScore >= 86
            ? "이름이 거의 같습니다."
            : targetScore >= 55
              ? "대상 사용자와 문제 단서가 겹칩니다."
              : "문제 설명의 핵심 단어가 겹칩니다.",
      };
    })
    .filter((match) => match.score >= 52)
    .sort((a, b) => b.score - a.score);

  return matches[0] ?? null;
}

function hasNumericSignal(value: string) {
  return /\d|명|일|%|퍼센트|건|회|만원|원/.test(value);
}

function buildCandidateReadiness(
  candidate: ExtractedIdea,
  similarIdea: SimilarIdeaMatch | null,
): CandidateReadinessCheck[] {
  const target = normalizeMatchText(candidate.target_user);
  const buyer = normalizeMatchText(candidate.buyer);

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
      detail: candidate.risk_summary.trim().length >= 20 ? "초기 리스크를 함께 저장할 수 있습니다." : "개인정보, 규제, 운영 리스크를 보강하세요.",
    },
    {
      label: "첫 MVP",
      passed: candidate.firstPrototypeScope.trim().length >= 20,
      detail: candidate.firstPrototypeScope.trim().length >= 20 ? "첫 프로토타입 범위가 있습니다." : "7일 안에 만들 최소 범위를 정하세요.",
    },
    {
      label: "중복 위험",
      passed: !similarIdea || similarIdea.score < 70,
      detail: similarIdea
        ? `${similarIdea.idea.name}와 유사도 ${similarIdea.score}%입니다. 기존 기록 확장 여부를 확인하세요.`
        : "기존 포트폴리오와 강하게 겹치는 후보가 없습니다.",
    },
  ];
}

function buildExtractedIdeaArtifacts(
  candidate: ExtractedIdea,
  idea: Idea,
  organizationId: string | null,
): VentureArtifactInsert[] {
  const base = {
    idea_id: idea.id,
    organization_id: organizationId,
    status: "draft" as const,
    version: 1,
    status_note: "자동 아이디어 발굴에서 검증 패키지로 생성됨",
  };

  return [
    {
      ...base,
      artifact_type: "idea_brief",
      title: `${candidate.name} 아이디어 브리프`,
      source: "extracted_idea_package",
      body: `# 아이디어 브리프: ${candidate.name}

## 한 줄 설명

${candidate.one_liner}

## 대상과 구매자

- 대상 사용자: ${candidate.target_user}
- 구매자: ${candidate.buyer}

## 문제 신호

${candidate.signal}

## 원문 근거

${candidate.sourceBlock}

## 핵심 가설

${candidate.assumptions.map((item) => `- ${item}`).join("\n")}

## 초기 점수

- 검증 점수: ${candidate.validationScore}/100
- 신뢰도: ${candidate.confidence}%
- 추천: ${candidate.recommendation}
- 리스크: ${candidate.riskLevel}

## 리스크 요약

${candidate.risk_summary}

## 다음 증거

${candidate.next_evidence}
`,
    },
    {
      ...base,
      artifact_type: "research_note",
      title: `${candidate.name} 리서치 브리프`,
      source: "extracted_research_brief",
      body: `# 리서치 브리프: ${candidate.name}

## 확인된 단서

${candidate.evidence.map((item) => `- ${item}`).join("\n")}

## 원문 근거

${candidate.sourceBlock}

## 검증 질문

${candidate.validationQuestions.map((item) => `- ${item}`).join("\n")}

## 가격/구매 가설

${candidate.pricingHypothesis}

## 첫 프로토타입 범위

${candidate.firstPrototypeScope}

## 중단 기준

${candidate.killCriteria}

## 판단 메모

${candidate.validationRationale}
`,
    },
    {
      ...base,
      artifact_type: "research_note",
      title: `${candidate.name} 7일 검증 스프린트`,
      source: "validation_sprint",
      body: `# 7일 검증 스프린트: ${candidate.name}

## 실험

${candidate.sevenDayExperiment}

## 원문 근거

${candidate.sourceBlock}

## 성공 지표

${candidate.successMetric}

## Day 1-2 모집

- 대상 사용자: ${candidate.target_user}
- 질문: 최근 이 문제가 실제로 발생한 사례를 확인합니다.

## Day 3-4 대안 조사

- 현재 우회 방법, 경쟁 서비스, 수동 해결책을 확인합니다.

## Day 5 가격/구매 검증

${candidate.pricingHypothesis}

## Day 6 프로토타입 반응

${candidate.firstPrototypeScope}

## Day 7 판단

- 진행: 성공 지표를 충족하고 높은 리스크가 완화됩니다.
- 추가 조사: 문제는 있으나 구매/도달/운영 근거가 부족합니다.
- 전환: 사용자는 있으나 다른 구매자, 채널, 수동 서비스가 더 적합합니다.
- 중단: ${candidate.killCriteria}
`,
    },
  ];
}

function splitIdeaBlocks(source: string) {
  const lines = source
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const blocks: string[] = [];
  let current: string[] = [];

  for (const line of lines) {
    const startsIdea =
      /^(#{1,4}\s*)?\d+[\.\)]\s+/.test(line) ||
      /^#{1,4}\s+/.test(line) ||
      /^아이디어\s*[:：]/.test(line);

    if (startsIdea && current.length > 0) {
      blocks.push(current.join("\n"));
      current = [line];
      continue;
    }

    current.push(line);
  }

  if (current.length > 0) {
    blocks.push(current.join("\n"));
  }

  return blocks
    .filter((block) => /(아이디어|페인|솔루션|타겟|사용자|앱|서비스|플랫폼|에이전트|콘솔|코치|매니저|대시보드)/i.test(block))
    .slice(0, 8);
}

function extractIdeasFromText(source: string): ExtractedIdea[] {
  return splitIdeaBlocks(source)
    .map((block, index) => {
      const lines = block.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
      const rawName = findLabeledValue(block, ["아이디어", "서비스명", "앱"]) || stripLabel(lines[0] ?? `아이디어 ${index + 1}`);
      const name = compactText(rawName.replace(/\(.+\)/, ""), 42) || `아이디어 ${index + 1}`;
      const oneLiner =
        findLabeledValue(block, ["솔루션", "기능", "핵심", "차별점"]) ||
        compactText(lines.find((line) => /앱|서비스|플랫폼|에이전트|콘솔|도구|코치|매니저/.test(line)) ?? block, 150);
      const target_user = findLabeledValue(block, ["타겟층", "타겟", "대상 사용자", "사용자"]) || inferText(block, "target");
      const buyer = findLabeledValue(block, ["구매자", "BM", "비즈니스 모델", "타겟 고객"]) || inferText(block, "buyer");
      const signal = findLabeledValue(block, ["페인 포인트", "문제", "수요", "핵심"]) || compactText(block, 180);
      const risk_summary = findLabeledValue(block, ["리스크", "주의점", "제약"]) || inferText(block, "risk");
      const next_evidence = findLabeledValue(block, ["다음 증거", "검증", "다음 단계"]) || inferText(block, "next");
      const evidence = [
        signal ? "문제 신호" : "",
        oneLiner ? "솔루션 단서" : "",
        target_user ? "타겟 단서" : "",
        buyer ? "구매자 단서" : "",
        risk_summary ? "리스크 추론" : "",
      ].filter(Boolean);
      const riskLevel = inferRiskLevel(block);
      const validationScore = scoreExtractedIdea({
        block,
        evidenceCount: evidence.length,
        riskLevel,
        buyer,
      });
      const initialScores = inferInitialScores(block, riskLevel, buyer);
      const recommendation = inferRecommendation(validationScore, riskLevel);
      const assumptions = inferAssumptions(block, name, target_user, buyer);
      const validationQuestions = inferValidationQuestions(block, target_user, buyer);

      return {
        id: `${index}-${name}`,
        sourceBlock: block,
        name,
        one_liner: oneLiner,
        target_user,
        buyer,
        signal,
        risk_summary,
        next_evidence,
        confidence: Math.min(95, 45 + evidence.length * 10 + Math.min(lines.length, 8)),
        evidence,
        validationScore,
        initialScores,
        riskLevel,
        recommendation,
        assumptions,
        validationQuestions,
        sevenDayExperiment: inferSevenDayExperiment(block, name),
        successMetric: inferSuccessMetric(block),
        killCriteria: inferKillCriteria(block),
        firstPrototypeScope: inferFirstPrototypeScope(block),
        pricingHypothesis: inferPricingHypothesis(block, buyer),
        validationRationale:
          riskLevel === "높음"
            ? "수요가 보여도 규제, 권한, 책임 구조를 먼저 통과해야 합니다."
            : "문제, 대상, 구매자, 첫 실험 단서가 있어 초기 검증 대상으로 볼 수 있습니다.",
      };
    })
    .sort((a, b) => b.validationScore - a.validationScore || b.confidence - a.confidence);
}

export function VentureConsoleActions({
  activeTask: controlledActiveTask,
  onActiveTaskChange,
  showSidebar = true,
  existingIdeas = [],
}: {
  activeTask?: ConsoleActionTask;
  onActiveTaskChange?: (task: ConsoleActionTask) => void;
  showSidebar?: boolean;
  existingIdeas?: Idea[];
} = {}) {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoaded, setIsAuthLoaded] = useState(() => !supabase);
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [activeOrganizationId, setActiveOrganizationId] = useState("");
  const [memberEmail, setMemberEmail] = useState("");
  const [memberRole, setMemberRole] = useState<AddableOrganizationRole>("member");
  const [isAuthBusy, setIsAuthBusy] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isWorkspaceBusy, setIsWorkspaceBusy] = useState(false);
  const [isMemberBusy, setIsMemberBusy] = useState(false);
  const [memberActionKey, setMemberActionKey] = useState<string | null>(null);
  const [extractSaveKey, setExtractSaveKey] = useState<string | null>(null);
  const [personalRecordCount, setPersonalRecordCount] = useState(0);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [workspaceMessage, setWorkspaceMessage] = useState<string | null>(null);
  const [rawIdeaSource, setRawIdeaSource] = useState("");
  const [extractedIdeas, setExtractedIdeas] = useState<ExtractedIdea[]>([]);
  const [extractMessage, setExtractMessage] = useState<string | null>(null);
  const [localActiveTask, setLocalActiveTask] = useState<ConsoleActionTask>("auth");
  const activeTask = controlledActiveTask ?? localActiveTask;
  const updateActiveTask = useCallback(
    (task: ConsoleActionTask) => {
      setLocalActiveTask(task);
      onActiveTaskChange?.(task);
    },
    [onActiveTaskChange],
  );

  const activeOrganization = useMemo(
    () => organizations.find((organization) => organization.id === activeOrganizationId) ?? organizations[0] ?? null,
    [activeOrganizationId, organizations],
  );
  const activeMembership = useMemo(
    () => members.find((member) => member.organization_id === activeOrganization?.id && member.user_id === user?.id) ?? null,
    [activeOrganization?.id, members, user?.id],
  );
  const activeMemberCount = useMemo(
    () => members.filter((member) => member.organization_id === activeOrganization?.id).length,
    [activeOrganization?.id, members],
  );
  const activeMembers = useMemo(
    () => members.filter((member) => member.organization_id === activeOrganization?.id),
    [activeOrganization?.id, members],
  );
  const canManageMembers = activeMembership?.role === "owner" || activeMembership?.role === "admin";
  const ownerCount = useMemo(
    () => activeMembers.filter((member) => member.role === "owner").length,
    [activeMembers],
  );
  const recommendedExtractedIdea = useMemo(
    () => extractedIdeas.reduce<ExtractedIdea | null>((best, idea) => {
      if (!best) {
        return idea;
      }

      return idea.validationScore > best.validationScore ? idea : best;
    }, null),
    [extractedIdeas],
  );
  const similarIdeaMatches = useMemo(() => {
    const matches = new Map<string, SimilarIdeaMatch>();

    for (const candidate of extractedIdeas) {
      const match = findSimilarIdea(candidate, existingIdeas);

      if (match) {
        matches.set(candidate.id, match);
      }
    }

    return matches;
  }, [existingIdeas, extractedIdeas]);
  const duplicateCandidateCount = similarIdeaMatches.size;
  const consoleTasks: Array<{
    id: ConsoleActionTask;
    label: string;
    description: string;
    status: string;
  }> = [
    {
      id: "auth",
      label: "운영자 로그인",
      description: "매직 링크 또는 기존 비밀번호로 접근합니다.",
      status: user ? "완료" : "필수",
    },
    {
      id: "workspace",
      label: "워크스페이스",
      description: "기록을 팀 경계와 멤버십에 연결합니다.",
      status: activeOrganization ? "연결됨" : "선택",
    },
    {
      id: "extract",
      label: "아이디어 발굴",
      description: "후보와 검증 계획을 만듭니다.",
      status: extractedIdeas.length > 0 ? `${extractedIdeas.length}개` : "붙여넣기",
    },
    {
      id: "idea",
      label: "새 아이디어",
      description: "원시 아이디어를 먼저 접수합니다.",
      status: user ? "입력" : "로그인 필요",
    },
  ];

  const loadPersonalRecordCount = useCallback(
    async (operator: User | null) => {
      if (!supabase || !operator) {
        setPersonalRecordCount(0);
        return;
      }

      const results = await Promise.all(
        workspaceRecordTables.map((table) =>
          supabase
            .from(table)
            .select("id", { count: "exact", head: true })
            .eq("created_by", operator.id)
            .is("organization_id", null),
        ),
      );

      setPersonalRecordCount(results.reduce((sum, result) => sum + (result.count ?? 0), 0));
    },
    [supabase],
  );

  const loadAuditEvents = useCallback(
    async (organizationId: string) => {
      if (!supabase || !organizationId) {
        setAuditEvents([]);
        return;
      }

      const { data, error } = await supabase
        .from("audit_events")
        .select("*")
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: false })
        .limit(6);

      if (error) {
        setWorkspaceMessage(error.message);
        return;
      }

      setAuditEvents(data ?? []);
    },
    [supabase],
  );

  const loadWorkspaceData = useCallback(async (operator: User | null, preferredOrganizationId = "") => {
    if (!supabase || !operator) {
      setOrganizations([]);
      setMembers([]);
      setAuditEvents([]);
      setActiveOrganizationId("");
      setPersonalRecordCount(0);
      return;
    }

    const [organizationsResult, membersResult] = await Promise.all([
      supabase.from("organizations").select("*").order("created_at", { ascending: true }),
      supabase.from("organization_members").select("*").order("created_at", { ascending: true }),
    ]);

    if (organizationsResult.error || membersResult.error) {
      setWorkspaceMessage(
        organizationsResult.error?.message ?? membersResult.error?.message ?? "워크스페이스 데이터를 불러오지 못했습니다.",
      );
      return;
    }

    const nextOrganizations = organizationsResult.data ?? [];
    const nextMembers = membersResult.data ?? [];
    const nextActiveId = preferredOrganizationId || nextOrganizations[0]?.id || "";

    setOrganizations(nextOrganizations);
    setMembers(nextMembers);
    setActiveOrganizationId(nextActiveId);

    if (!nextActiveId) {
      setAuditEvents([]);
      await loadPersonalRecordCount(operator);
      return;
    }

    await loadAuditEvents(nextActiveId);
    await loadPersonalRecordCount(operator);
  }, [loadAuditEvents, loadPersonalRecordCount, supabase]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authError = params.get("auth_error");

    if (!authError) {
      return;
    }

    const callbackMessage = formatAuthCallbackMessage(authError, params.get("auth_error_description"));
    params.delete("auth_error");
    params.delete("auth_error_description");

    const nextQuery = params.toString();
    const nextUrl = `${window.location.pathname}${nextQuery ? `?${nextQuery}` : ""}${window.location.hash}`;
    window.history.replaceState(null, "", nextUrl);

    const messageTimer = window.setTimeout(() => {
      setAuthMessage(callbackMessage);
    }, 0);

    return () => {
      window.clearTimeout(messageTimer);
    };
  }, []);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (!code) {
      return;
    }

    const supabaseClient = supabase;
    const authCode = code;

    params.delete("code");
    const nextQuery = params.toString();
    const nextUrl = `${window.location.pathname}${nextQuery ? `?${nextQuery}` : ""}${window.location.hash}`;
    window.history.replaceState(null, "", nextUrl);

    const exchangeTimer = window.setTimeout(() => {
      async function completeRootMagicLink() {
        setIsAuthBusy(true);
        setAuthMessage("매직 링크 로그인을 완료하는 중입니다...");

        const { data, error } = await supabaseClient.auth.exchangeCodeForSession(authCode);

        setIsAuthBusy(false);

        if (error) {
          setAuthMessage(formatAuthCallbackMessage("callback_exchange_failed", error.message));
          return;
        }

        const nextUser = data.user ?? null;

        setUser(nextUser);
        if (nextUser) {
          updateActiveTask("idea");
        }
        setAuthMessage("로그인되었습니다.");
        await loadWorkspaceData(nextUser);
        router.refresh();
      }

      void completeRootMagicLink();
    }, 0);

    return () => {
      window.clearTimeout(exchangeTimer);
    };
  }, [loadWorkspaceData, router, supabase, updateActiveTask]);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setIsAuthLoaded(true);
      updateActiveTask(data.user ? "idea" : "auth");
      void loadWorkspaceData(data.user);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextUser = session?.user ?? null;
      setIsAuthLoaded(true);
      setUser(nextUser);
      updateActiveTask(nextUser ? "idea" : "auth");
      void loadWorkspaceData(nextUser);
      router.refresh();
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, [loadWorkspaceData, router, supabase, updateActiveTask]);

  async function handleSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAuthMessage(null);

    if (!supabase) {
      setAuthMessage("이 배포 환경에서 Supabase 환경변수를 찾을 수 없습니다.");
      return;
    }

    if (!email.trim()) {
      setAuthMessage("이메일 주소를 먼저 입력하세요.");
      return;
    }

    setIsAuthBusy(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/`,
      },
    });
    setIsAuthBusy(false);

    if (error) {
      setAuthMessage(formatAuthError(error.message));
      return;
    }

    setAuthMessage("매직 링크를 보냈습니다. 이메일의 링크를 열고 돌아오면 이 카드에 로그인 상태가 표시됩니다.");
  }

  async function handlePasswordSignIn() {
    setAuthMessage(null);

    if (!supabase) {
      setAuthMessage("이 배포 환경에서 Supabase 환경변수를 찾을 수 없습니다.");
      return;
    }

    if (!email.trim() || !password) {
      setAuthMessage("비밀번호 로그인은 Supabase Auth에 비밀번호가 있는 기존 사용자만 사용할 수 있습니다. 이메일과 비밀번호를 모두 입력하세요.");
      return;
    }

    setIsAuthBusy(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setIsAuthBusy(false);

    if (error) {
      setAuthMessage(formatAuthError(error.message));
      return;
    }

    setPassword("");
    updateActiveTask("idea");
    setAuthMessage("로그인되었습니다.");
    router.refresh();
  }

  async function handleSignOut() {
    if (!supabase) {
      return;
    }

    setIsAuthBusy(true);
    await supabase.auth.signOut();
    setIsAuthBusy(false);
    updateActiveTask("auth");
    setAuthMessage("로그아웃되었습니다.");
  }

  async function handleCreateWorkspace() {
    setWorkspaceMessage(null);

    if (!supabase || !user) {
      setWorkspaceMessage("워크스페이스를 만들려면 먼저 로그인하세요.");
      return;
    }

    setIsWorkspaceBusy(true);
    const { data, error } = await supabase
      .from("organizations")
      .insert({
        name: "AI Venture Lab",
        slug: `ai-venture-lab-${user.id.slice(0, 8)}`,
      })
      .select()
      .single();
    setIsWorkspaceBusy(false);

    if (error) {
      setWorkspaceMessage(error.message);
      return;
    }

    setActiveOrganizationId(data.id);
    setWorkspaceMessage("워크스페이스를 만들었습니다.");
    await loadWorkspaceData(user, data.id);
  }

  async function handleAttachPersonalRecords() {
    setWorkspaceMessage(null);

    if (!supabase || !user || !activeOrganization) {
      setWorkspaceMessage("워크스페이스를 먼저 만들거나 선택하세요.");
      return;
    }

    setIsWorkspaceBusy(true);
    const results = await Promise.all(
      workspaceRecordTables.map((table) =>
        supabase
          .from(table)
          .update({ organization_id: activeOrganization.id })
          .eq("created_by", user.id)
          .is("organization_id", null),
      ),
    );
    setIsWorkspaceBusy(false);

    const error = results.find((result) => result.error)?.error;

    if (error) {
      setWorkspaceMessage(error.message);
      return;
    }

    setWorkspaceMessage(`${personalRecordCount}개의 개인 기록을 ${activeOrganization.name}에 연결했습니다.`);
    await loadWorkspaceData(user, activeOrganization.id);
    router.refresh();
  }

  async function handleSelectWorkspace(organizationId: string) {
    setActiveOrganizationId(organizationId);
    await loadAuditEvents(organizationId);
  }

  async function handleAddMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setWorkspaceMessage(null);

    if (!supabase || !user || !activeOrganization) {
      setWorkspaceMessage("워크스페이스를 먼저 선택하세요.");
      return;
    }

    if (!canManageMembers) {
      setWorkspaceMessage("워크스페이스 소유자와 관리자만 멤버를 추가할 수 있습니다.");
      return;
    }

    if (!memberEmail.trim()) {
      setWorkspaceMessage("멤버 이메일을 입력하세요.");
      return;
    }

    setIsMemberBusy(true);
    const { error } = await supabase.rpc("add_organization_member_by_email", {
      target_organization_id: activeOrganization.id,
      target_email: memberEmail.trim(),
      target_role: memberRole,
    });
    setIsMemberBusy(false);

    if (error) {
      setWorkspaceMessage(error.message);
      return;
    }

    setMemberEmail("");
    setWorkspaceMessage("워크스페이스 멤버를 추가했습니다.");
    await loadWorkspaceData(user, activeOrganization.id);
  }

  async function handleUpdateMemberRole(member: OrganizationMember, role: AddableOrganizationRole) {
    setWorkspaceMessage(null);

    if (!supabase || !user || !activeOrganization) {
      setWorkspaceMessage("워크스페이스를 먼저 선택하세요.");
      return;
    }

    setMemberActionKey(`${member.user_id}:role:${role}`);
    const { error } = await supabase.rpc("update_organization_member_role", {
      target_organization_id: activeOrganization.id,
      target_user_id: member.user_id,
      target_role: role,
    });
    setMemberActionKey(null);

    if (error) {
      setWorkspaceMessage(error.message);
      return;
    }

    setWorkspaceMessage("멤버 역할을 변경했습니다.");
    await loadWorkspaceData(user, activeOrganization.id);
  }

  async function handleRemoveMember(member: OrganizationMember) {
    setWorkspaceMessage(null);

    if (!supabase || !user || !activeOrganization) {
      setWorkspaceMessage("워크스페이스를 먼저 선택하세요.");
      return;
    }

    setMemberActionKey(`${member.user_id}:remove`);
    const { error } = await supabase.rpc("remove_organization_member", {
      target_organization_id: activeOrganization.id,
      target_user_id: member.user_id,
    });
    setMemberActionKey(null);

    if (error) {
      setWorkspaceMessage(error.message);
      return;
    }

    setWorkspaceMessage("멤버를 제거했습니다.");
    await loadWorkspaceData(user, activeOrganization.id);
  }

  async function handleCreateIdea(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaveMessage(null);

    if (!supabase) {
      setSaveMessage("Supabase가 설정되어 있지 않습니다.");
      return;
    }

    if (!user) {
      setSaveMessage("아이디어를 저장하려면 먼저 로그인하세요.");
      return;
    }

    if (!form.name.trim() || !form.one_liner.trim()) {
      setSaveMessage("아이디어 이름과 한 줄 설명은 필수입니다.");
      return;
    }

    setIsSaving(true);
    const { data, error } = await supabase
      .from("ideas")
      .insert({
        name: form.name.trim(),
        one_liner: form.one_liner.trim(),
        target_user: form.target_user.trim(),
        buyer: form.buyer.trim(),
        signal: form.signal.trim(),
        risk_summary: form.risk_summary.trim(),
        next_evidence: form.next_evidence.trim(),
        stage: "intake",
        decision: "pending",
        problem_intensity: 0,
        frequency: 0,
        reachability: 0,
        willingness_to_pay: 0,
        mvp_speed: 0,
        differentiation: 0,
        regulatory_risk: 0,
        organization_id: activeOrganization?.id ?? null,
      })
      .select()
      .single();
    setIsSaving(false);

    if (error) {
      setSaveMessage(error.message);
      return;
    }

    setForm(emptyForm);
    if (data) {
      window.dispatchEvent(new CustomEvent<Idea>("venture:idea-created", { detail: data }));
    }
    setSaveMessage(
      activeOrganization
        ? `${activeOrganization.name}에 아이디어를 저장했습니다. 워크벤치에 바로 반영했습니다.`
        : "개인 기록으로 아이디어를 저장했습니다. 워크스페이스를 만들면 이후 기록을 연결할 수 있습니다.",
    );
    await loadPersonalRecordCount(user);
    await loadWorkspaceData(user, activeOrganization?.id ?? "");
    router.refresh();
  }

  function handleExtractIdeas() {
    const source = rawIdeaSource.trim();

    if (!source) {
      setExtractMessage("대화 내용이나 메모를 먼저 붙여넣으세요.");
      setExtractedIdeas([]);
      return;
    }

    const nextIdeas = extractIdeasFromText(source);
    setExtractedIdeas(nextIdeas);
    setExtractMessage(
      nextIdeas.length > 0
        ? `${nextIdeas.length}개의 앱 아이디어 후보를 추출했습니다. 마음에 드는 후보를 입력 폼으로 보내세요.`
        : "아이디어 후보를 찾지 못했습니다. '아이디어:', '페인 포인트:', '솔루션:' 같은 단서를 포함해 다시 시도하세요.",
    );
  }

  function loadExtractedIdea(candidate: ExtractedIdea) {
    setForm({
      name: candidate.name,
      one_liner: candidate.one_liner,
      target_user: candidate.target_user,
      buyer: candidate.buyer,
      signal: `${candidate.signal}\n\n핵심 가설\n- ${candidate.assumptions.join("\n- ")}`,
      risk_summary: `${candidate.risk_summary}\n\n리스크 등급: ${candidate.riskLevel}\n중단 기준\n${candidate.killCriteria}`,
      next_evidence: `7일 검증 실험\n${candidate.sevenDayExperiment}\n\n검증 질문\n- ${candidate.validationQuestions.join(
        "\n- ",
      )}\n\n첫 프로토타입 범위\n${candidate.firstPrototypeScope}\n\n가격/구매 가설\n${candidate.pricingHypothesis}`,
    });
    setSaveMessage(`'${candidate.name}' 후보를 검증 메모까지 포함해 입력 폼에 채웠습니다. 검토 후 저장하세요.`);
    updateActiveTask("idea");
  }

  async function saveExtractedIdeaPackage(candidate: ExtractedIdea) {
    setExtractMessage(null);

    if (!supabase) {
      setExtractMessage("Supabase가 설정되어 있지 않습니다.");
      return;
    }

    if (!user) {
      setExtractMessage("후보를 저장하려면 먼저 로그인하세요.");
      return;
    }

    setExtractSaveKey(candidate.id);
    const { data: idea, error: ideaError } = await supabase
      .from("ideas")
      .insert({
        name: candidate.name.trim(),
        one_liner: candidate.one_liner.trim(),
        target_user: candidate.target_user.trim(),
        buyer: candidate.buyer.trim(),
        signal: `${candidate.signal}\n\n핵심 가설\n- ${candidate.assumptions.join("\n- ")}`,
        risk_summary: `${candidate.risk_summary}\n\n리스크 등급: ${candidate.riskLevel}\n중단 기준\n${candidate.killCriteria}`,
        next_evidence: `7일 검증 실험\n${candidate.sevenDayExperiment}\n\n성공 지표\n${candidate.successMetric}\n\n검증 질문\n- ${candidate.validationQuestions.join(
          "\n- ",
        )}\n\n첫 프로토타입 범위\n${candidate.firstPrototypeScope}\n\n가격/구매 가설\n${candidate.pricingHypothesis}`,
        stage: "research",
        decision: "research_more",
        ...candidate.initialScores,
        organization_id: activeOrganization?.id ?? null,
      })
      .select()
      .single();

    if (ideaError || !idea) {
      setExtractSaveKey(null);
      setExtractMessage(ideaError?.message ?? "아이디어를 저장하지 못했습니다.");
      return;
    }

    const [riskResult, experimentResult, artifactResult] = await Promise.all([
      supabase
        .from("risks")
        .insert({
          idea_id: idea.id,
          title: `${candidate.name} 핵심 리스크`,
          area: inferRiskArea(`${candidate.name} ${candidate.one_liner} ${candidate.risk_summary}`),
          severity: inferRiskSeverity(candidate.riskLevel),
          mitigation: candidate.risk_summary,
          status: "open",
          organization_id: activeOrganization?.id ?? null,
        })
        .select()
        .single(),
      supabase
        .from("experiments")
        .insert({
          idea_id: idea.id,
          name: `${candidate.name} 7일 검증`,
          success_metric: candidate.successMetric,
          status: "planned",
          organization_id: activeOrganization?.id ?? null,
        })
        .select()
        .single(),
      supabase
        .from("venture_artifacts")
        .insert(buildExtractedIdeaArtifacts(candidate, idea, activeOrganization?.id ?? null))
        .select(),
    ]);

    setExtractSaveKey(null);

    if (riskResult.error || experimentResult.error || artifactResult.error) {
      setExtractMessage(
        `아이디어는 저장했지만 연결 기록 일부가 실패했습니다: ${
          riskResult.error?.message ?? experimentResult.error?.message ?? artifactResult.error?.message
        }`,
      );
    } else {
      setExtractMessage(
        `'${candidate.name}' 후보를 아이디어, 리스크, 7일 실험, 검증 산출물 ${artifactResult.data?.length ?? 0}개까지 패키지로 저장했습니다.`,
      );
    }

    window.dispatchEvent(new CustomEvent<Idea>("venture:idea-created", { detail: idea }));
    if (riskResult.data) {
      window.dispatchEvent(new CustomEvent("venture:risk-created", { detail: riskResult.data }));
    }
    if (experimentResult.data) {
      window.dispatchEvent(new CustomEvent("venture:experiment-created", { detail: experimentResult.data }));
    }
    if (artifactResult.data) {
      for (const artifact of artifactResult.data as VentureArtifact[]) {
        window.dispatchEvent(new CustomEvent("venture:artifact-created", { detail: artifact }));
      }
    }
    await loadPersonalRecordCount(user);
    await loadWorkspaceData(user, activeOrganization?.id ?? "");
    router.refresh();
  }

  return (
    <section className={showSidebar ? "grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]" : "grid gap-6"}>
      {showSidebar ? (
      <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-6 lg:self-start">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-950">운영 준비</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">로그인부터 아이디어 접수까지 한 단계씩 처리합니다.</p>
        </div>
        <div className="grid gap-2">
          {consoleTasks.map((task, index) => (
            <button
              key={task.id}
              type="button"
              onClick={() => updateActiveTask(task.id)}
              aria-current={activeTask === task.id ? "step" : undefined}
              className={`grid grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-3 rounded-lg border p-3 text-left transition ${
                activeTask === task.id
                  ? "border-blue-300 bg-blue-50 text-blue-950"
                  : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-white"
              }`}
            >
              <span
                className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                  activeTask === task.id ? "bg-blue-600 text-white" : "bg-white text-slate-700 shadow-sm"
                }`}
              >
                {index + 1}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold">{task.label}</span>
                <span className="mt-0.5 block text-xs leading-5 text-slate-500">{task.description}</span>
              </span>
              <span
                className={`rounded-md px-2 py-1 text-xs font-semibold ${
                  activeTask === task.id ? "bg-white text-blue-700" : "bg-white text-slate-600"
                }`}
              >
                {task.status}
              </span>
            </button>
          ))}
        </div>
      </aside>
      ) : null}

      <div className="grid min-w-0 gap-6">
        <div
          className={`rounded-lg border border-slate-200 bg-white p-6 shadow-sm ${activeTask === "auth" ? "" : "hidden"}`}
        >
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">운영자 로그인</h2>
            <p className="mt-1 text-sm text-slate-500">
              매직 링크는 이메일 인증을 사용합니다. 비밀번호 로그인은 Supabase Auth에 등록된 기존 사용자용입니다.
            </p>
          </div>
          <ShieldCheck className={user ? "text-emerald-600" : "text-slate-500"} size={24} />
        </div>

        {!isAuthLoaded ? (
          <div className="rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-600">현재 세션을 확인하는 중입니다...</div>
        ) : user ? (
          <div className="grid gap-4">
            <div className="rounded-lg bg-emerald-50 p-4">
              <div className="text-sm font-semibold text-emerald-900">로그인됨</div>
              <div className="mt-1 break-all text-sm text-emerald-800">{user.email}</div>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              disabled={isAuthBusy}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <LogOut size={18} />
              로그아웃
            </button>
          </div>
        ) : (
          <form onSubmit={handleSignIn} className="grid gap-3">
            <div className="rounded-lg bg-blue-50 p-4 text-sm leading-6 text-blue-900">
              새 이메일 세션은 매직 링크를 사용하세요. 비밀번호는 Supabase Auth에서 비밀번호 기반 사용자를 만든 뒤에만 사용합니다.
            </div>
            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              이메일
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                placeholder="you@example.com"
                className="h-11 rounded-md border border-slate-300 bg-white px-3 text-sm font-normal text-slate-950 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              기존 계정 비밀번호
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                placeholder="Supabase Auth 기존 비밀번호"
                className="h-11 rounded-md border border-slate-300 bg-white px-3 text-sm font-normal text-slate-950 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>
            <button
              type="button"
              onClick={handlePasswordSignIn}
              disabled={isAuthBusy}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isAuthBusy ? <RefreshCw className="animate-spin" size={18} /> : <LogIn size={18} />}
              기존 비밀번호로 로그인
            </button>
            <button
              type="submit"
              disabled={isAuthBusy}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-blue-200 bg-blue-50 px-4 text-sm font-semibold text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isAuthBusy ? <RefreshCw className="animate-spin" size={18} /> : <LogIn size={18} />}
              매직 링크 보내기
            </button>
          </form>
        )}

        {authMessage ? <p className="mt-4 text-sm leading-6 text-slate-600">{authMessage}</p> : null}
        </div>

        <div
          className={`rounded-lg border border-slate-200 bg-white p-6 shadow-sm ${
            activeTask === "workspace" ? "" : "hidden"
          }`}
        >
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">워크스페이스 상태</h2>
              <p className="mt-1 text-sm text-slate-500">기록을 조직 단위 경계에 연결할 수 있습니다.</p>
            </div>
            <Building2 className={activeOrganization ? "text-blue-600" : "text-slate-500"} size={24} />
          </div>

          {!user ? (
            <div className="rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-600">
              워크스페이스 멤버십을 불러오려면 로그인하세요.
            </div>
          ) : activeOrganization ? (
            <div className="grid gap-4">
              <label className="grid gap-2 text-sm font-semibold text-slate-700">
                활성 워크스페이스
                <select
                  value={activeOrganization.id}
                  onChange={(event) => {
                    void handleSelectWorkspace(event.target.value);
                  }}
                  className="h-11 rounded-md border border-slate-300 bg-white px-3 text-sm font-normal text-slate-950 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  {organizations.map((organization) => (
                    <option key={organization.id} value={organization.id}>
                      {organization.name}
                    </option>
                  ))}
                </select>
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg bg-blue-50 p-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">역할</div>
                  <div className="mt-2 text-lg font-semibold capitalize text-blue-950">
                    {activeMembership ? organizationRoleLabels[activeMembership.role] : organizationRoleLabels.member}
                  </div>
                </div>
                <div className="rounded-lg bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                    <Users size={14} />
                    멤버
                  </div>
                  <div className="mt-2 text-lg font-semibold text-slate-950">{activeMemberCount}</div>
                </div>
              </div>
              {personalRecordCount > 0 ? (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                  <div className="text-sm font-semibold text-amber-950">
                    {personalRecordCount}개의 개인 기록이 아직 워크스페이스 밖에 있습니다.
                  </div>
                  <p className="mt-1 text-sm leading-6 text-amber-900">
                    포트폴리오, 리스크, 판단, 실험, 실행, 산출물을 같은 워크스페이스 경계로 묶고 싶을 때 연결하세요.
                  </p>
                  <button
                    type="button"
                    onClick={handleAttachPersonalRecords}
                    disabled={isWorkspaceBusy}
                    className="mt-3 inline-flex h-10 items-center justify-center gap-2 rounded-md bg-amber-900 px-4 text-sm font-semibold text-white transition hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isWorkspaceBusy ? <RefreshCw className="animate-spin" size={18} /> : <Building2 size={18} />}
                    개인 기록 연결
                  </button>
                </div>
              ) : null}
              <div>
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-950">
                  <Users size={16} />
                  멤버
                </div>
                <div className="grid gap-2">
                  {activeMembers.map((member) => (
                    <div key={`${member.organization_id}-${member.user_id}`} className="rounded-md bg-slate-50 p-3">
                      <div className="flex flex-col gap-3">
                        <div>
                          <div className="break-all text-sm font-semibold text-slate-950">
                            {member.email || member.user_id}
                          </div>
                          <div className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                            {organizationRoleLabels[member.role]}
                            {member.user_id === user.id ? " / 나" : ""}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {memberRoles.map((role) => {
                            const actionKey = `${member.user_id}:role:${role}`;
                            const isLastOwner = member.role === "owner" && ownerCount <= 1;

                            return (
                              <button
                                key={role}
                                type="button"
                                onClick={() => {
                                  void handleUpdateMemberRole(member, role);
                                }}
                                disabled={
                                  !canManageMembers ||
                                  member.role === role ||
                                  isLastOwner ||
                                  memberActionKey === actionKey
                                }
                                className="inline-flex h-8 items-center justify-center rounded-md bg-white px-2.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-45"
                              >
                                {memberActionKey === actionKey ? "..." : organizationRoleLabels[role]}
                              </button>
                            );
                          })}
                          <button
                            type="button"
                            onClick={() => {
                              void handleRemoveMember(member);
                            }}
                            disabled={
                              !canManageMembers ||
                              (member.role === "owner" && ownerCount <= 1) ||
                              memberActionKey === `${member.user_id}:remove`
                            }
                            className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md bg-white px-2.5 text-xs font-semibold text-rose-700 shadow-sm transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-45"
                          >
                            <Trash2 size={13} />
                            {memberActionKey === `${member.user_id}:remove` ? "..." : "제거"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <form onSubmit={handleAddMember} className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm font-semibold text-slate-950">기존 Auth 사용자 추가</div>
                <div className="grid gap-3 sm:grid-cols-[1fr_132px]">
                  <input
                    value={memberEmail}
                    onChange={(event) => setMemberEmail(event.target.value)}
                    type="email"
                    placeholder="member@example.com"
                    disabled={!canManageMembers}
                    className="h-11 rounded-md border border-slate-300 bg-white px-3 text-sm font-normal text-slate-950 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100 disabled:text-slate-500"
                  />
                  <select
                    value={memberRole}
                    onChange={(event) => setMemberRole(event.target.value as AddableOrganizationRole)}
                    disabled={!canManageMembers}
                    className="h-11 rounded-md border border-slate-300 bg-white px-3 text-sm font-normal text-slate-950 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100 disabled:text-slate-500"
                  >
                    {memberRoles.map((role) => (
                      <option key={role} value={role}>
                        {organizationRoleLabels[role]}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={isMemberBusy || !canManageMembers}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isMemberBusy ? <RefreshCw className="animate-spin" size={18} /> : <Users size={18} />}
                  멤버 추가
                </button>
              </form>
              <div>
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-950">
                  <Clock3 size={16} />
                  최근 감사 로그
                </div>
                <div className="grid gap-2">
                  {auditEvents.length > 0 ? (
                    auditEvents.map((event) => (
                      <div key={event.id} className="rounded-md bg-slate-50 p-3 text-sm leading-6 text-slate-600">
                        <span className="font-semibold text-slate-950">{event.action}</span> {event.summary}
                      </div>
                    ))
                  ) : (
                    <div className="rounded-md bg-slate-50 p-3 text-sm text-slate-500">
                      아직 조직 감사 로그가 없습니다.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid gap-3">
              <div className="rounded-lg bg-amber-50 p-4 text-sm leading-6 text-amber-900">
                이 운영자에게 연결된 워크스페이스가 없습니다.
                {personalRecordCount > 0
                  ? ` 워크스페이스를 만든 뒤 ${personalRecordCount}개의 개인 기록을 연결할 수 있습니다.`
                  : ""}
              </div>
              <button
                type="button"
                onClick={handleCreateWorkspace}
                disabled={isWorkspaceBusy}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isWorkspaceBusy ? <RefreshCw className="animate-spin" size={18} /> : <Building2 size={18} />}
                워크스페이스 만들기
              </button>
            </div>
          )}

          {workspaceMessage ? <p className="mt-4 text-sm leading-6 text-slate-600">{workspaceMessage}</p> : null}
        </div>

        <div
          className={`rounded-lg border border-slate-200 bg-white p-6 shadow-sm ${
            activeTask === "extract" ? "" : "hidden"
          }`}
        >
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">자동 아이디어 발굴</h2>
              <p className="mt-1 text-sm text-slate-500">
                대화, 회의록, 메모를 붙여넣으면 후보와 검증 계획을 함께 구조화합니다.
              </p>
            </div>
            <button
              type="button"
              onClick={handleExtractIdeas}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <Sparkles size={18} />
              후보 발굴
            </button>
          </div>

          <div className="grid gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(360px,1.1fr)]">
            <div className="grid gap-3">
              <textarea
                value={rawIdeaSource}
                onChange={(event) => setRawIdeaSource(event.target.value)}
                rows={18}
                placeholder="Gemini/ChatGPT 대화, 회의록, 메모를 여기에 붙여넣으세요. 아이디어:, 페인 포인트:, 솔루션:, 타겟층: 같은 단서가 있으면 더 잘 추출됩니다."
                className="min-h-[360px] resize-y rounded-md border border-slate-300 bg-white px-3 py-3 text-sm leading-6 text-slate-950 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setRawIdeaSource(sampleIdeaSource)}
                  className="inline-flex h-10 items-center justify-center rounded-md border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  샘플 넣기
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRawIdeaSource("");
                    setExtractedIdeas([]);
                    setExtractMessage(null);
                  }}
                  className="inline-flex h-10 items-center justify-center rounded-md border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  비우기
                </button>
              </div>
              {extractMessage ? <p className="text-sm leading-6 text-slate-600">{extractMessage}</p> : null}
              {duplicateCandidateCount > 0 ? (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-900">
                  {duplicateCandidateCount}개 후보가 기존 포트폴리오와 유사합니다. 저장 전 기존 기록을 확장할지, 새
                  아이디어로 분리할지 확인하세요.
                </div>
              ) : null}
            </div>

            <div className="grid content-start gap-3">
              {extractedIdeas.length > 0 ? (
                <>
                  {recommendedExtractedIdea ? (
                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                      <div className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">추천 후보</div>
                      <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="text-base font-semibold text-blue-950">{recommendedExtractedIdea.name}</div>
                          <p className="mt-1 text-sm leading-6 text-blue-900">
                            검증 점수 {recommendedExtractedIdea.validationScore}/100 ·{" "}
                            {recommendedExtractedIdea.recommendation}. {recommendedExtractedIdea.validationRationale}
                          </p>
                        </div>
                        <div className="flex shrink-0 flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => loadExtractedIdea(recommendedExtractedIdea)}
                            className="inline-flex h-10 items-center justify-center rounded-md border border-blue-200 bg-white px-4 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
                          >
                            입력 폼으로 보내기
                          </button>
                          <button
                            type="button"
                            onClick={() => saveExtractedIdeaPackage(recommendedExtractedIdea)}
                            disabled={extractSaveKey === recommendedExtractedIdea.id || !user}
                            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {extractSaveKey === recommendedExtractedIdea.id ? (
                              <RefreshCw className="animate-spin" size={16} />
                            ) : (
                              <PlusCircle size={16} />
                            )}
                            검증 패키지 저장
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {extractedIdeas.map((candidate) => {
                    const similarIdea = similarIdeaMatches.get(candidate.id);
                    const readinessChecks = buildCandidateReadiness(candidate, similarIdea ?? null);
                    const passedReadinessCount = readinessChecks.filter((check) => check.passed).length;
                    const readinessScore = Math.round((passedReadinessCount / readinessChecks.length) * 100);
                    const nextReadinessGap = readinessChecks.find((check) => !check.passed);

                    return (
                    <article key={candidate.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base font-semibold text-slate-950">{candidate.name}</h3>
                            <span className="rounded-md bg-white px-2 py-1 text-xs font-semibold text-blue-700 shadow-sm">
                              검증 {candidate.validationScore}/100
                            </span>
                            <span
                              className={`rounded-md px-2 py-1 text-xs font-semibold shadow-sm ${
                                candidate.riskLevel === "높음"
                                  ? "bg-rose-50 text-rose-700"
                                  : candidate.riskLevel === "보통"
                                    ? "bg-amber-50 text-amber-800"
                                    : "bg-emerald-50 text-emerald-800"
                              }`}
                            >
                              리스크 {candidate.riskLevel}
                            </span>
                            <span className="rounded-md bg-white px-2 py-1 text-xs font-semibold text-slate-600 shadow-sm">
                              신뢰 {candidate.confidence}%
                            </span>
                            <span className="rounded-md bg-white px-2 py-1 text-xs font-semibold text-emerald-700 shadow-sm">
                              패키지 {passedReadinessCount}/{readinessChecks.length}
                            </span>
                          </div>
                          <p className="mt-2 text-sm leading-6 text-slate-600">{candidate.one_liner}</p>
                        </div>
                        <div className="flex shrink-0 flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => loadExtractedIdea(candidate)}
                            className="inline-flex h-10 items-center justify-center rounded-md border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
                          >
                            입력 폼으로 보내기
                          </button>
                          <button
                            type="button"
                            onClick={() => saveExtractedIdeaPackage(candidate)}
                            disabled={extractSaveKey === candidate.id || !user}
                            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {extractSaveKey === candidate.id ? <RefreshCw className="animate-spin" size={16} /> : <PlusCircle size={16} />}
                            패키지 저장
                          </button>
                        </div>
                      </div>
                      {similarIdea ? (
                        <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-900">
                          <span className="font-semibold text-amber-950">기존 유사 기록:</span>{" "}
                          {similarIdea.idea.name} · 유사도 {similarIdea.score}% · {similarIdea.reason}
                        </div>
                      ) : null}
                      <div className="mt-3 rounded-md border border-emerald-100 bg-emerald-50 p-3">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <div className="text-sm font-semibold text-emerald-950">검증 패키지 준비도</div>
                            <p className="mt-1 text-sm leading-6 text-emerald-900">
                              {nextReadinessGap
                                ? `다음 보강: ${nextReadinessGap.label} - ${nextReadinessGap.detail}`
                                : "아이디어, 리스크, 7일 실험으로 저장할 준비가 좋습니다."}
                            </p>
                          </div>
                          <div className="shrink-0 rounded-md bg-emerald-950 px-3 py-2 text-right text-white">
                            <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-200">
                              준비
                            </div>
                            <div className="text-2xl font-semibold">{readinessScore}%</div>
                          </div>
                        </div>
                        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                          {readinessChecks.map((check) => (
                            <div key={check.label} className="rounded-md bg-white px-3 py-2">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`h-2 w-2 rounded-full ${check.passed ? "bg-emerald-500" : "bg-slate-300"}`}
                                />
                                <span className="text-xs font-semibold text-slate-950">{check.label}</span>
                              </div>
                              <p className="mt-1 text-xs leading-5 text-slate-600">{check.detail}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="mt-3 grid gap-3 md:grid-cols-2">
                        <div className="rounded-md bg-white p-3">
                          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">대상</div>
                          <p className="mt-1 text-sm leading-6 text-slate-700">{candidate.target_user}</p>
                        </div>
                        <div className="rounded-md bg-white p-3">
                          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">구매자</div>
                          <p className="mt-1 text-sm leading-6 text-slate-700">{candidate.buyer}</p>
                        </div>
                        <div className="rounded-md bg-white p-3">
                          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">핵심 가설</div>
                          <ul className="mt-1 grid gap-1 text-sm leading-6 text-slate-700">
                            {candidate.assumptions.map((item) => (
                              <li key={item}>- {item}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="rounded-md bg-white p-3">
                          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">검증 질문</div>
                          <ul className="mt-1 grid gap-1 text-sm leading-6 text-slate-700">
                            {candidate.validationQuestions.slice(0, 3).map((item) => (
                              <li key={item}>- {item}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="rounded-md bg-white p-3 md:col-span-2">
                          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">7일 실험</div>
                          <p className="mt-1 text-sm leading-6 text-slate-700">{candidate.sevenDayExperiment}</p>
                          <p className="mt-2 text-sm leading-6 text-slate-700">
                            <span className="font-semibold text-slate-950">성공 지표:</span> {candidate.successMetric}
                          </p>
                        </div>
                        <div className="rounded-md bg-white p-3 md:col-span-2">
                          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">원문 근거</div>
                          <p className="mt-1 text-sm leading-6 text-slate-700">{compactText(candidate.sourceBlock, 360)}</p>
                        </div>
                        <div className="rounded-md bg-white p-3">
                          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">첫 프로토타입</div>
                          <p className="mt-1 text-sm leading-6 text-slate-700">{candidate.firstPrototypeScope}</p>
                        </div>
                        <div className="rounded-md bg-white p-3">
                          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">중단 기준</div>
                          <p className="mt-1 text-sm leading-6 text-slate-700">{candidate.killCriteria}</p>
                        </div>
                        <div className="rounded-md bg-white p-3 md:col-span-2">
                          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">가격/구매 가설</div>
                          <p className="mt-1 text-sm leading-6 text-slate-700">{candidate.pricingHypothesis}</p>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="rounded-md bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 shadow-sm">
                          {candidate.recommendation}
                        </span>
                        {candidate.evidence.map((item) => (
                          <span
                            key={item}
                            className="rounded-md bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 shadow-sm"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </article>
                    );
                  })}
                </>
              ) : (
                <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5 text-sm leading-6 text-slate-600">
                  추출된 후보가 여기에 표시됩니다. 샘플을 넣어 흐름을 먼저 확인해도 좋습니다.
                </div>
              )}
            </div>
          </div>
        </div>

      <form
        onSubmit={handleCreateIdea}
        className={`rounded-lg border border-slate-200 bg-white p-6 shadow-sm ${activeTask === "idea" ? "" : "hidden"}`}
      >
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">새 아이디어 입력</h2>
            <p className="mt-1 text-sm text-slate-500">
              {activeOrganization
                ? `${activeOrganization.name} 안에 원시 아이디어를 기록합니다.`
                : "바로 개발로 들어가지 않고 원시 아이디어를 먼저 기록합니다."}
            </p>
          </div>
          <button
            type="submit"
            disabled={isSaving || !user}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? <RefreshCw className="animate-spin" size={18} /> : <PlusCircle size={18} />}
            아이디어 저장
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="이름" value={form.name} onChange={(value) => setForm({ ...form, name: value })} required />
          <Field label="구매자" value={form.buyer} onChange={(value) => setForm({ ...form, buyer: value })} />
          <Field
            label="한 줄 설명"
            value={form.one_liner}
            onChange={(value) => setForm({ ...form, one_liner: value })}
            required
          />
          <Field
            label="대상 사용자"
            value={form.target_user}
            onChange={(value) => setForm({ ...form, target_user: value })}
          />
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <TextArea label="수요 신호" value={form.signal} onChange={(value) => setForm({ ...form, signal: value })} />
          <TextArea
            label="리스크 요약"
            value={form.risk_summary}
            onChange={(value) => setForm({ ...form, risk_summary: value })}
          />
          <TextArea
            label="다음 증거"
            value={form.next_evidence}
            onChange={(value) => setForm({ ...form, next_evidence: value })}
          />
        </div>

        {saveMessage ? <p className="mt-4 text-sm leading-6 text-slate-600">{saveMessage}</p> : null}
      </form>
      </div>
    </section>
  );
}

function formatAuthError(message: string) {
  if (message.toLowerCase().includes("rate limit")) {
    return "Supabase 이메일 전송 제한에 걸렸습니다. 할당량이 초기화될 때까지 기다리거나, 커스텀 SMTP를 설정하거나, 대시보드에서 만든 운영자 계정으로 비밀번호 로그인을 사용하세요.";
  }

  if (message.toLowerCase().includes("invalid login credentials")) {
    return "이메일 또는 비밀번호가 올바르지 않습니다. Supabase Auth에서 확인된 사용자를 만들었는지, 비밀번호가 맞는지 확인하세요.";
  }

  return message;
}

function formatAuthCallbackMessage(error: string, description: string | null) {
  if (error === "missing_callback_state") {
    return "매직 링크 콜백에 로그인 코드가 없습니다. 새 링크를 요청한 뒤 가장 최근 이메일을 여세요.";
  }

  if (error === "callback_exchange_failed") {
    const normalizedDescription = description?.toLowerCase() ?? "";

    if (normalizedDescription.includes("verifier")) {
      return "매직 링크는 열렸지만 원래 브라우저 세션을 찾지 못했습니다. 링크를 다시 요청한 뒤 매직 링크를 보낸 같은 브라우저 프로필에서 여세요.";
    }

    return description
      ? `매직 링크 콜백 실패: ${description}`
      : "매직 링크 콜백에 실패했습니다. 새 링크를 요청한 뒤 다시 시도하세요.";
  }

  return description ? `${error}: ${description}` : error;
}

function Field({
  label,
  value,
  onChange,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-slate-700">
      {label}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        className="h-11 rounded-md border border-slate-300 bg-white px-3 text-sm font-normal text-slate-950 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-slate-700">
      {label}
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={4}
        className="min-h-28 resize-y rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-normal leading-6 text-slate-950 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </label>
  );
}
