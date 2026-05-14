"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import {
  Building2,
  ClipboardList,
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
import type { Database, Json, OrganizationRole } from "@/lib/supabase/types";

type Organization = Database["public"]["Tables"]["organizations"]["Row"];
type OrganizationMember = Database["public"]["Tables"]["organization_members"]["Row"];
type AuditEvent = Database["public"]["Tables"]["audit_events"]["Row"];
type Idea = Database["public"]["Tables"]["ideas"]["Row"];
type VentureArtifact = Database["public"]["Tables"]["venture_artifacts"]["Row"];
type VentureArtifactInsert = Database["public"]["Tables"]["venture_artifacts"]["Insert"];
type TelemetryEvent = Database["public"]["Tables"]["telemetry_events"]["Row"];
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
export type ConsoleWorkflowStatus = {
  isAuthLoaded: boolean;
  isAuthenticated: boolean;
  hasWorkspace: boolean;
  hasExtractedIdeas: boolean;
  hasIdeaSource: boolean;
};

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

type AiExtractedIdeaCandidate = {
  name?: string;
  one_liner?: string;
  target_user?: string;
  buyer?: string;
  signal?: string;
  risk_summary?: string;
  next_evidence?: string;
  assumptions?: string[];
  validation_questions?: string[];
  seven_day_experiment?: string;
  success_metric?: string;
  kill_criteria?: string;
  first_prototype_scope?: string;
  pricing_hypothesis?: string;
};

type AiExtractIdeasResponse = {
  mode?: string;
  model?: string;
  error?: string;
  candidates?: AiExtractedIdeaCandidate[];
};

type ExtractionRunMeta = {
  engine: "openai" | "rules" | "fallback";
  model: string | null;
  sourceLength: number;
  candidateCount: number;
  generatedAt: string;
  note: string;
};

type ExtractionReplayMode = "openai" | "fallback" | "unavailable";

type ExtractionReplayItem = {
  id: string;
  source: "both" | "rules" | "ai";
  primaryCandidate: ExtractedIdea;
  matchedName: string | null;
  overlapScore: number;
  verdict: string;
  nextAction: string;
};

type ExtractionReplaySummary = {
  generatedAt: string;
  sourceLength: number;
  rulesCount: number;
  aiCount: number;
  consensusCount: number;
  rulesOnlyCount: number;
  aiOnlyCount: number;
  aiMode: ExtractionReplayMode;
  model: string | null;
  note: string;
  items: ExtractionReplayItem[];
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

type CandidateStrategyLens = {
  label: string;
  score: number;
  detail: string;
  tone: "good" | "watch" | "risk";
};

type ExtractionGateId = "proceed" | "research" | "pivot" | "kill";

type ExtractionGate = {
  id: ExtractionGateId;
  label: string;
  summary: string;
  nextAction: string;
  threshold: string;
  blockers: string[];
  readinessScore: number;
  rank: number;
};

type ExtractionPortfolioItem = {
  candidate: ExtractedIdea;
  gate: ExtractionGate;
  similarIdea: SimilarIdeaMatch | null;
  readinessScore: number;
  nextGap: string;
};

const extractionGateRanks: Record<ExtractionGateId, number> = {
  proceed: 4,
  research: 3,
  pivot: 2,
  kill: 1,
};

const extractionGateStyles: Record<
  ExtractionGateId,
  {
    badge: string;
    panel: string;
    title: string;
    score: string;
  }
> = {
  proceed: {
    badge: "avl-pill avl-pill-success",
    panel: "avl-surface-muted border-emerald-200 bg-emerald-50",
    title: "text-emerald-950",
    score: "bg-slate-950 text-white",
  },
  research: {
    badge: "avl-pill avl-pill-info",
    panel: "avl-surface-muted border-blue-200 bg-blue-50",
    title: "text-blue-950",
    score: "bg-slate-950 text-white",
  },
  pivot: {
    badge: "avl-pill avl-pill-warning",
    panel: "avl-surface-muted border-amber-200 bg-amber-50",
    title: "text-amber-950",
    score: "bg-slate-950 text-white",
  },
  kill: {
    badge: "avl-pill avl-pill-danger",
    panel: "avl-surface-muted border-rose-200 bg-rose-50",
    title: "text-rose-950",
    score: "bg-slate-950 text-white",
  },
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

function createExtractionRunMeta({
  engine,
  model,
  sourceLength,
  candidateCount,
  note,
}: Omit<ExtractionRunMeta, "generatedAt">): ExtractionRunMeta {
  return {
    engine,
    model,
    sourceLength,
    candidateCount,
    generatedAt: new Date().toISOString(),
    note,
  };
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

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function lensTone(score: number): CandidateStrategyLens["tone"] {
  if (score >= 74) {
    return "good";
  }

  if (score >= 55) {
    return "watch";
  }

  return "risk";
}

function buildCandidateStrategyLens(candidate: ExtractedIdea): CandidateStrategyLens[] {
  const combinedText = `${candidate.name} ${candidate.one_liner} ${candidate.target_user} ${candidate.buyer} ${candidate.signal} ${candidate.risk_summary} ${candidate.next_evidence} ${candidate.firstPrototypeScope} ${candidate.pricingHypothesis}`;
  const paidHits = countKeywordHits(combinedText, ["구독", "월", "수수료", "절감", "유료", "결제", "비용", "좌석", "기업", "센터"]);
  const distributionHits = countKeywordHits(combinedText, ["센터", "팀", "조직", "커뮤니티", "전문직", "가족", "보호자", "크리에이터", "대행사"]);
  const automationHits = countKeywordHits(combinedText, ["AI", "자동", "대행", "추천", "매칭", "생성", "에이전트", "코칭", "분석"]);
  const privacyHits = countKeywordHits(combinedText, ["개인정보", "금융", "의료", "건강", "계좌", "카드", "상담", "심리", "미성년", "위치"]);
  const riskPenalty = candidate.riskLevel === "높음" ? 28 : candidate.riskLevel === "보통" ? 14 : 4;
  const feasibilityBase = candidate.initialScores.mvp_speed * 14 + candidate.initialScores.differentiation * 6;
  const hasNumericMetric = hasNumericSignal(candidate.successMetric);

  return [
    {
      label: "시장 신호",
      score: clampPercent(candidate.validationScore + (hasNumericMetric ? 6 : -8)),
      detail: hasNumericMetric ? "검증 지표에 숫자가 있어 첫 실험으로 옮기기 좋습니다." : "성공 기준을 숫자로 더 좁혀야 합니다.",
      tone: lensTone(candidate.validationScore + (hasNumericMetric ? 6 : -8)),
    },
    {
      label: "수익화",
      score: clampPercent(45 + paidHits * 10 + (candidate.buyer.trim().length > 8 ? 10 : 0)),
      detail: paidHits > 0 ? "가격/구매 단서가 있어 결제 의향 실험을 붙일 수 있습니다." : "누가 어떤 예산으로 지불하는지 보강하세요.",
      tone: lensTone(45 + paidHits * 10 + (candidate.buyer.trim().length > 8 ? 10 : 0)),
    },
    {
      label: "MVP 난이도",
      score: clampPercent(feasibilityBase - riskPenalty),
      detail:
        candidate.initialScores.mvp_speed >= 4
          ? "수동/템플릿/콘솔 형태로 얇게 시작할 수 있습니다."
          : "첫 버전 범위를 더 줄여야 개발 리스크가 낮아집니다.",
      tone: lensTone(feasibilityBase - riskPenalty),
    },
    {
      label: "도달 채널",
      score: clampPercent(42 + distributionHits * 11 + (candidate.target_user.trim().length > 8 ? 8 : 0)),
      detail: distributionHits > 0 ? "초기 인터뷰와 파일럿을 찾을 세그먼트 단서가 있습니다." : "첫 10명을 어디서 만날지 채널을 정하세요.",
      tone: lensTone(42 + distributionHits * 11 + (candidate.target_user.trim().length > 8 ? 8 : 0)),
    },
    {
      label: "자동화 레버리지",
      score: clampPercent(42 + automationHits * 9),
      detail: automationHits > 0 ? "AI/자동화가 반복 비용을 줄이는 핵심 가치로 보입니다." : "자동화 전에 수동 서비스로도 가치가 생기는지 확인하세요.",
      tone: lensTone(42 + automationHits * 9),
    },
    {
      label: "보안 부담",
      score: clampPercent(90 - privacyHits * 11 - riskPenalty),
      detail: privacyHits > 0 ? "민감 데이터 경계, 보관, 삭제, 권한 검증이 먼저 필요합니다." : "초기 버전은 비교적 낮은 데이터 부담으로 시작할 수 있습니다.",
      tone: lensTone(90 - privacyHits * 11 - riskPenalty),
    },
  ];
}

function getCandidateStrategyScore(candidate: ExtractedIdea) {
  const lenses = buildCandidateStrategyLens(candidate);

  return clampPercent(lenses.reduce((total, lens) => total + lens.score, 0) / lenses.length);
}

function buildCandidateStrategyLensMarkdown(candidate: ExtractedIdea) {
  const lenses = buildCandidateStrategyLens(candidate);

  return `## 사업/개발 렌즈

- 종합 점수: ${getCandidateStrategyScore(candidate)}%

| 렌즈 | 점수 | 판단 |
| --- | --- | --- |
${lenses.map((lens) => `| ${lens.label} | ${lens.score}% | ${lens.detail} |`).join("\n")}
`;
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

function hasSensitiveSourceSignal(value: string) {
  return /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}|\d{2,3}[-\s]?\d{3,4}[-\s]?\d{4}|주민등록|계좌|카드번호|비밀번호|여권/iu.test(
    value,
  );
}

function redactSensitiveSource(value: string) {
  return value
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/giu, "[redacted-email]")
    .replace(/\b\d{6}[-\s]?\d{7}\b/g, "[redacted-id]")
    .replace(/\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g, "[redacted-card]")
    .replace(/\b\d{2,3}[-\s]?\d{3,4}[-\s]?\d{4}\b/g, "[redacted-phone]")
    .replace(/(계좌|카드번호|비밀번호|여권)\s*[:：]?\s*[A-Z0-9\-_\t ]{4,}/giu, "$1 [redacted-sensitive]");
}

function buildCandidateReadiness(
  candidate: ExtractedIdea,
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
    {
      label: "민감정보",
      passed: !hasSensitiveSource,
      detail: hasSensitiveSource
        ? "원문 근거에 이메일, 전화번호, 계좌, 카드, 신분 정보 단서가 있을 수 있어 저장 산출물에는 자동 익명화가 적용됩니다."
        : "원문 근거에서 명백한 연락처/식별번호 패턴은 보이지 않습니다.",
    },
  ];
}

function hasReadiness(checks: CandidateReadinessCheck[], label: string) {
  return checks.find((check) => check.label === label)?.passed ?? false;
}

function buildExtractionGate(
  candidate: ExtractedIdea,
  readinessChecks: CandidateReadinessCheck[],
  similarIdea: SimilarIdeaMatch | null,
): ExtractionGate {
  const passedCount = readinessChecks.filter((check) => check.passed).length;
  const readinessScore = Math.round((passedCount / readinessChecks.length) * 100);
  const blockers = readinessChecks.filter((check) => !check.passed).map((check) => check.label);
  const hasCoreProblem = hasReadiness(readinessChecks, "문제 신호");
  const hasUserBuyer = hasReadiness(readinessChecks, "사용자/구매자");
  const hasMetric = hasReadiness(readinessChecks, "검증 지표");
  const hasMvp = hasReadiness(readinessChecks, "첫 MVP");
  const hasDuplicateBlocker = Boolean(similarIdea && similarIdea.score >= 70);
  const hasSensitiveBlocker = !hasReadiness(readinessChecks, "민감정보");
  const corePassCount = [hasCoreProblem, hasUserBuyer, hasMetric, hasMvp].filter(Boolean).length;

  let id: ExtractionGateId = "research";
  let summary = "증거를 더 모은 뒤 저장 또는 점수화할 후보입니다.";
  let nextAction = blockers[0] ? `${blockers[0]} 보강 후 7일 검증 패키지로 저장` : "인터뷰와 대체재 조사를 먼저 붙인 뒤 저장";

  if (candidate.validationScore <= 44 || corePassCount <= 1) {
    id = "kill";
    summary = "핵심 문제, 구매자, 실험 단서가 약해 지금은 중단 후보입니다.";
    nextAction = "문제 신호가 새로 확인될 때까지 저장하지 말고 후보 목록에서 보류";
  } else if (hasDuplicateBlocker) {
    id = "pivot";
    summary = "기존 기록과 강하게 겹쳐 새 아이디어보다 병합 또는 포지션 전환을 먼저 봐야 합니다.";
    nextAction = `${similarIdea?.idea.name ?? "기존 아이디어"} 기록을 확장할지, 대상/구매자/범위를 바꿀지 결정`;
  } else if (candidate.validationScore < 58 || (corePassCount <= 2 && readinessScore < 72)) {
    id = "pivot";
    summary = "문제는 보이지만 사용자, 구매자, 실험 범위 중 하나가 흔들려 재정의가 필요합니다.";
    nextAction = blockers[0] ? `${blockers[0]}를 다시 정의하고 한 줄 설명을 좁히기` : "대상 세그먼트와 첫 MVP 범위를 다시 좁히기";
  } else if (
    candidate.validationScore >= 72 &&
    readinessScore >= 80 &&
    candidate.riskLevel !== "높음" &&
    !hasSensitiveBlocker
  ) {
    id = "proceed";
    summary = "문제, 구매자, 실험, MVP 범위가 충분해 검증 패키지로 저장할 후보입니다.";
    nextAction = "검증 패키지 저장 후 워크벤치에서 점수와 첫 실험을 확정";
  } else {
    id = "research";
    summary =
      candidate.riskLevel === "높음"
        ? "수요가 보여도 규제, 개인정보, 운영 책임을 먼저 검증해야 합니다."
        : "점수나 준비도 일부가 부족해 추가 증거를 붙인 뒤 진행 여부를 봐야 합니다.";
    nextAction = blockers[0] ? `${blockers[0]} 보강 후 저장` : "인터뷰, 가격 신호, 대체재 증거를 추가";
  }

  const thresholdByGate: Record<ExtractionGateId, string> = {
    proceed: "72점 이상, 준비도 80% 이상, 고위험/중복 없음",
    research: "58-71점 또는 준비도 미달, 증거 보강 필요",
    pivot: "45-57점, 강한 중복, 대상/구매자/범위 재정의",
    kill: "44점 이하 또는 핵심 문제/MVP 신호 부족",
  };

  return {
    id,
    label: id === "proceed" ? "진행 후보" : id === "research" ? "추가 조사" : id === "pivot" ? "전환 검토" : "중단 후보",
    summary,
    nextAction,
    threshold: thresholdByGate[id],
    blockers,
    readinessScore,
    rank: extractionGateRanks[id] * 1000 + readinessScore * 2 + candidate.validationScore,
  };
}

function buildExtractedIdeaArtifacts(
  candidate: ExtractedIdea,
  idea: Idea,
  organizationId: string | null,
  extractionGate?: ExtractionGate,
): VentureArtifactInsert[] {
  const gate = extractionGate ?? buildExtractionGate(candidate, buildCandidateReadiness(candidate, null), null);
  const redactedSourceBlock = redactSensitiveSource(candidate.sourceBlock);
  const sourceBlock =
    redactedSourceBlock === candidate.sourceBlock
      ? redactedSourceBlock
      : `${redactedSourceBlock}

> 자동 익명화: 원문 근거에서 연락처, 카드, 계좌, 신분 정보로 보이는 패턴을 치환했습니다.`;
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

${sourceBlock}

## 핵심 가설

${candidate.assumptions.map((item) => `- ${item}`).join("\n")}

## 초기 점수

- 검증 점수: ${candidate.validationScore}/100
- 신뢰도: ${candidate.confidence}%
- 추천: ${candidate.recommendation}
- 게이트 판정: ${gate.label}
- 다음 작업: ${gate.nextAction}
- 리스크: ${candidate.riskLevel}

${buildCandidateStrategyLensMarkdown(candidate)}

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

${sourceBlock}

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

${sourceBlock}

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

function firstText(values: Array<string | undefined>, fallback: string, maxLength = 180) {
  return compactText(values.find((value) => value && value.trim()) ?? fallback, maxLength);
}

function hydrateAiExtractedIdeas(source: string, candidates: AiExtractedIdeaCandidate[]): ExtractedIdea[] {
  return candidates
    .slice(0, 8)
    .map((candidate, index) => {
      const name = firstText([candidate.name], `AI 후보 ${index + 1}`, 42);
      const sourceBlock = [
        `AI 후보: ${name}`,
        candidate.signal ? `문제 신호: ${candidate.signal}` : "",
        candidate.one_liner ? `솔루션: ${candidate.one_liner}` : "",
        candidate.target_user ? `대상 사용자: ${candidate.target_user}` : "",
        candidate.buyer ? `구매자: ${candidate.buyer}` : "",
        candidate.risk_summary ? `리스크: ${candidate.risk_summary}` : "",
        `원문 요약 근거: ${compactText(source, 900)}`,
      ]
        .filter(Boolean)
        .join("\n");
      const blockForInference = `${sourceBlock}\n${source}`;
      const oneLiner = firstText([candidate.one_liner], compactText(source, 150), 150);
      const target_user = firstText([candidate.target_user], inferText(blockForInference, "target"), 160);
      const buyer = firstText([candidate.buyer], inferText(blockForInference, "buyer"), 160);
      const signal = firstText([candidate.signal], inferText(blockForInference, "next"), 220);
      const risk_summary = firstText([candidate.risk_summary], inferText(blockForInference, "risk"), 240);
      const next_evidence = firstText([candidate.next_evidence], inferText(blockForInference, "next"), 240);
      const riskLevel = inferRiskLevel(blockForInference);
      const evidence = [
        signal ? "AI 문제 신호" : "",
        oneLiner ? "AI 솔루션 구조화" : "",
        target_user ? "AI 타겟 추론" : "",
        buyer ? "AI 구매자 추론" : "",
        risk_summary ? "AI 리스크 추론" : "",
      ].filter(Boolean);
      const validationScore = scoreExtractedIdea({
        block: blockForInference,
        evidenceCount: evidence.length + 1,
        riskLevel,
        buyer,
      });
      const assumptions =
        candidate.assumptions && candidate.assumptions.length >= 3
          ? candidate.assumptions.slice(0, 4).map((item) => compactText(item, 220))
          : inferAssumptions(blockForInference, name, target_user, buyer);
      const validationQuestions =
        candidate.validation_questions && candidate.validation_questions.length >= 3
          ? candidate.validation_questions.slice(0, 5).map((item) => compactText(item, 240))
          : inferValidationQuestions(blockForInference, target_user, buyer);

      return {
        id: `ai-${index}-${name}`,
        sourceBlock,
        name,
        one_liner: oneLiner,
        target_user,
        buyer,
        signal,
        risk_summary,
        next_evidence,
        confidence: Math.min(96, 76 + Math.min(evidence.length, 5) * 3),
        evidence,
        validationScore,
        initialScores: inferInitialScores(blockForInference, riskLevel, buyer),
        riskLevel,
        recommendation: inferRecommendation(validationScore, riskLevel),
        assumptions,
        validationQuestions,
        sevenDayExperiment: firstText([candidate.seven_day_experiment], inferSevenDayExperiment(blockForInference, name), 520),
        successMetric: firstText([candidate.success_metric], inferSuccessMetric(blockForInference), 320),
        killCriteria: firstText([candidate.kill_criteria], inferKillCriteria(blockForInference), 360),
        firstPrototypeScope: firstText([candidate.first_prototype_scope], inferFirstPrototypeScope(blockForInference), 360),
        pricingHypothesis: firstText([candidate.pricing_hypothesis], inferPricingHypothesis(blockForInference, buyer), 260),
        validationRationale:
          riskLevel === "높음"
            ? "AI가 수요는 구조화했지만 규제, 개인정보, 운영 책임 검증을 먼저 요구합니다."
            : "AI가 문제, 대상, 구매자, 첫 실험을 구조화해 검증 후보로 볼 수 있습니다.",
      };
    })
    .sort((a, b) => b.validationScore - a.validationScore || b.confidence - a.confidence);
}

function candidateComparisonText(candidate: ExtractedIdea) {
  return [
    candidate.name,
    candidate.one_liner,
    candidate.target_user,
    candidate.buyer,
    candidate.signal,
    candidate.firstPrototypeScope,
  ].join(" ");
}

function candidateSimilarityScore(left: ExtractedIdea, right: ExtractedIdea) {
  const nameScore = tokenOverlapScore(left.name, right.name);
  const problemScore = tokenOverlapScore(candidateComparisonText(left), candidateComparisonText(right));
  const userScore = tokenOverlapScore(`${left.target_user} ${left.buyer}`, `${right.target_user} ${right.buyer}`);

  return Math.max(nameScore, Math.round(problemScore * 0.65 + userScore * 0.35));
}

function findBestCandidateMatch(candidate: ExtractedIdea, pool: ExtractedIdea[], usedIds = new Set<string>()) {
  return pool
    .filter((item) => !usedIds.has(item.id))
    .map((item) => ({ item, score: candidateSimilarityScore(candidate, item) }))
    .sort((a, b) => b.score - a.score)[0];
}

function buildExtractionReplaySummary({
  sourceLength,
  rulesIdeas,
  aiIdeas,
  aiMode,
  model,
  note,
}: {
  sourceLength: number;
  rulesIdeas: ExtractedIdea[];
  aiIdeas: ExtractedIdea[];
  aiMode: ExtractionReplayMode;
  model: string | null;
  note: string;
}): ExtractionReplaySummary {
  const usedAiIds = new Set<string>();
  const items: ExtractionReplayItem[] = [];

  for (const rulesCandidate of rulesIdeas) {
    const match = findBestCandidateMatch(rulesCandidate, aiIdeas, usedAiIds);

    if (match && match.score >= 52) {
      usedAiIds.add(match.item.id);
      const primaryCandidate =
        match.item.validationScore >= rulesCandidate.validationScore || match.item.confidence >= rulesCandidate.confidence
          ? match.item
          : rulesCandidate;

      items.push({
        id: `both-${rulesCandidate.id}-${match.item.id}`,
        source: "both",
        primaryCandidate,
        matchedName: primaryCandidate.id === match.item.id ? rulesCandidate.name : match.item.name,
        overlapScore: match.score,
        verdict: "공통 후보",
        nextAction: "두 엔진이 모두 포착했습니다. 검증 패키지 저장 또는 워크벤치 점수화 우선순위로 봅니다.",
      });
      continue;
    }

    items.push({
      id: `rules-${rulesCandidate.id}`,
      source: "rules",
      primaryCandidate: rulesCandidate,
      matchedName: null,
      overlapScore: 0,
      verdict: "규칙 단독",
      nextAction: "원문 라벨이나 키워드가 강한 후보입니다. AI 누락 가능성이 있으니 문제/구매자 증거를 보강합니다.",
    });
  }

  for (const aiCandidate of aiIdeas) {
    if (usedAiIds.has(aiCandidate.id)) {
      continue;
    }

    items.push({
      id: `ai-${aiCandidate.id}`,
      source: "ai",
      primaryCandidate: aiCandidate,
      matchedName: null,
      overlapScore: 0,
      verdict: "AI 단독",
      nextAction: "AI가 문맥에서 추론한 후보입니다. 원문 근거와 과잉 해석 여부를 먼저 확인합니다.",
    });
  }

  const sortedItems = items.sort((a, b) => {
    const sourceRank = { both: 3, ai: 2, rules: 1 };

    return (
      sourceRank[b.source] - sourceRank[a.source] ||
      b.primaryCandidate.validationScore - a.primaryCandidate.validationScore ||
      b.primaryCandidate.confidence - a.primaryCandidate.confidence
    );
  });
  const consensusCount = sortedItems.filter((item) => item.source === "both").length;
  const rulesOnlyCount = sortedItems.filter((item) => item.source === "rules").length;
  const aiOnlyCount = sortedItems.filter((item) => item.source === "ai").length;

  return {
    generatedAt: new Date().toISOString(),
    sourceLength,
    rulesCount: rulesIdeas.length,
    aiCount: aiIdeas.length,
    consensusCount,
    rulesOnlyCount,
    aiOnlyCount,
    aiMode,
    model,
    note,
    items: sortedItems,
  };
}

function buildExtractionReplayMarkdown(summary: ExtractionReplaySummary) {
  const generatedAt = new Date(summary.generatedAt).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" });
  const rows = summary.items
    .map(
      (item, index) =>
        `| ${index + 1} | ${item.primaryCandidate.name} | ${item.verdict} | ${
          item.matchedName ?? "-"
        } | ${item.overlapScore || "-"} | ${item.primaryCandidate.validationScore}/100 | ${item.nextAction} |`,
    )
    .join("\n");

  return `# 추출 결과 점검

## 실행 메타

- 실행 시각: ${generatedAt}
- 입력 길이: ${summary.sourceLength}자
- 기준 추출 후보: ${summary.rulesCount}개
- AI 후보: ${summary.aiCount}개
- 공통 후보: ${summary.consensusCount}개
- 기준 추출 단독: ${summary.rulesOnlyCount}개
- AI 단독: ${summary.aiOnlyCount}개
- AI 모드: ${summary.aiMode}
- 모델: ${summary.model ?? "해당 없음"}
- 실행 메모: ${summary.note}

## 비교 결과

| 순서 | 후보 | 판정 | 매칭 후보 | 유사도 | 검증 점수 | 다음 행동 |
| --- | --- | --- | --- | --- | --- | --- |
${rows || "| - | 후보 없음 | - | - | - | - | - |"}
`;
}

function buildExtractionPortfolioMarkdown(items: ExtractionPortfolioItem[]) {
  const rows = items
    .map(
      (item, index) =>
        `| ${index + 1} | ${item.candidate.name} | ${item.gate.label} | ${item.candidate.validationScore}/100 | ${getCandidateStrategyScore(
          item.candidate,
        )}% | ${item.readinessScore}% | ${
          item.similarIdea ? `${item.similarIdea.idea.name} ${item.similarIdea.score}%` : "없음"
        } | ${item.gate.nextAction} |`,
    )
    .join("\n");
  const gateSummary = (["proceed", "research", "pivot", "kill"] as ExtractionGateId[])
    .map((gateId) => {
      const count = items.filter((item) => item.gate.id === gateId).length;
      const label = gateId === "proceed" ? "진행 후보" : gateId === "research" ? "추가 조사" : gateId === "pivot" ? "전환 검토" : "중단 후보";

      return `- ${label}: ${count}개`;
    })
    .join("\n");

  return `# 아이디어 발굴 실행 요약

## 게이트 분포

${gateSummary}

## 실행 순서

| 순서 | 후보 | 게이트 | 검증 점수 | 사업/개발 | 준비도 | 중복 신호 | 다음 행동 |
| --- | --- | --- | --- | --- | --- | --- | --- |
${rows || "| - | 후보 없음 | - | - | - | - | - | - |"}

## 운영 원칙

- 진행 후보는 검증 패키지로 저장한 뒤 워크벤치에서 점수와 첫 실험을 확정합니다.
- 추가 조사 후보는 부족한 문제 신호, 구매자, 지표, 리스크, MVP 범위를 보강합니다.
- 전환 검토 후보는 기존 기록 병합, 세그먼트 축소, 구매자 변경 중 하나를 먼저 결정합니다.
- 중단 후보는 새 증거가 생길 때까지 저장하지 않습니다.
`;
}

function buildExtractionReportBody(
  items: ExtractionPortfolioItem[],
  source: string,
  organizationName: string | null,
  runMeta: ExtractionRunMeta | null,
  replaySummary: ExtractionReplaySummary | null,
) {
  const sourceExcerpt = redactSensitiveSource(source).trim().slice(0, 4000);
  const generatedAt = new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" });
  const metaGeneratedAt = runMeta
    ? new Date(runMeta.generatedAt).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })
    : generatedAt;

  return `${buildExtractionPortfolioMarkdown(items)}

## 발굴 조건

- 생성 시각: ${generatedAt}
- 워크스페이스: ${organizationName ?? "개인 기록"}
- 후보 수: ${items.length}개
- 추출 엔진: ${runMeta?.engine ?? "미기록"}
- 모델: ${runMeta?.model ?? "해당 없음"}
- 입력 길이: ${runMeta?.sourceLength ?? source.length}자
- 추출 시각: ${metaGeneratedAt}
- 실행 메모: ${runMeta?.note ?? "수동 또는 이전 방식으로 생성된 후보입니다."}

${replaySummary ? buildExtractionReplayMarkdown(replaySummary) : "## 추출 결과 점검\n\n- 이번 리포트에는 결과 점검이 포함되지 않았습니다."}

## 원문 근거 요약

${sourceExcerpt || "원문 근거가 비어 있습니다."}

## 다음 처리

1. 진행 후보는 검증 패키지로 저장합니다.
2. 추가 조사 후보는 부족한 증거를 보강한 뒤 다시 발굴합니다.
3. 전환 검토 후보는 기존 아이디어 병합 또는 세그먼트 축소를 먼저 판단합니다.
4. 중단 후보는 새 증거가 생길 때까지 실행 목록에서 제외합니다.
`;
}

export function VentureConsoleActions({
  activeTask: controlledActiveTask,
  onActiveTaskChange,
  onWorkflowStatusChange,
  showSidebar = true,
  embedded = false,
  existingIdeas = [],
}: {
  activeTask?: ConsoleActionTask;
  onActiveTaskChange?: (task: ConsoleActionTask) => void;
  onWorkflowStatusChange?: (status: ConsoleWorkflowStatus) => void;
  showSidebar?: boolean;
  embedded?: boolean;
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
  const [extractionRunMeta, setExtractionRunMeta] = useState<ExtractionRunMeta | null>(null);
  const [extractionReplay, setExtractionReplay] = useState<ExtractionReplaySummary | null>(null);
  const [extractMessage, setExtractMessage] = useState<string | null>(null);
  const [isAiExtracting, setIsAiExtracting] = useState(false);
  const [isReplayingExtraction, setIsReplayingExtraction] = useState(false);
  const [isSavingExtractionReport, setIsSavingExtractionReport] = useState(false);
  const [localActiveTask, setLocalActiveTask] = useState<ConsoleActionTask>("auth");
  const activeTask = controlledActiveTask ?? localActiveTask;
  const hasWorkspace = organizations.length > 0 && Boolean(activeOrganizationId || organizations[0]?.id);
  const updateActiveTask = useCallback(
    (task: ConsoleActionTask) => {
      setLocalActiveTask(task);
      onActiveTaskChange?.(task);
    },
    [onActiveTaskChange],
  );

  useEffect(() => {
    onWorkflowStatusChange?.({
      isAuthLoaded,
      isAuthenticated: Boolean(user),
      hasWorkspace,
      hasExtractedIdeas: extractedIdeas.length > 0,
      hasIdeaSource: rawIdeaSource.trim().length > 0,
    });
  }, [extractedIdeas.length, hasWorkspace, isAuthLoaded, onWorkflowStatusChange, rawIdeaSource, user]);

  async function recordTelemetryEvent({
    eventName,
    eventCategory,
    idea,
    organizationId,
    properties = {},
  }: {
    eventName: string;
    eventCategory: string;
    idea?: Idea | null;
    organizationId?: string | null;
    properties?: Record<string, Json>;
  }) {
    if (!supabase || !user) {
      return;
    }

    const sanitizedProperties = Object.fromEntries(
      Object.entries(properties).filter(([, value]) => value !== undefined),
    ) as Record<string, Json>;
    const { data, error } = await supabase
      .from("telemetry_events")
      .insert({
        organization_id: organizationId ?? idea?.organization_id ?? null,
        idea_id: idea?.id ?? null,
        actor_id: user.id,
        event_name: eventName,
        event_category: eventCategory,
        properties: sanitizedProperties,
      })
      .select()
      .single();

    if (error) {
      console.warn("Failed to record telemetry event", error.message);
      return;
    }

    if (data) {
      window.dispatchEvent(new CustomEvent<TelemetryEvent>("venture:telemetry-created", { detail: data }));
    }
  }

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
  const extractedIdeaGates = useMemo(() => {
    const gates = new Map<string, ExtractionGate>();

    for (const candidate of extractedIdeas) {
      const similarIdea = similarIdeaMatches.get(candidate.id) ?? null;
      gates.set(candidate.id, buildExtractionGate(candidate, buildCandidateReadiness(candidate, similarIdea), similarIdea));
    }

    return gates;
  }, [extractedIdeas, similarIdeaMatches]);
  const recommendedExtractedIdea = useMemo(
    () =>
      extractedIdeas.reduce<ExtractedIdea | null>((best, idea) => {
        if (!best) {
          return idea;
        }

        const ideaGate = extractedIdeaGates.get(idea.id);
        const bestGate = extractedIdeaGates.get(best.id);
        const ideaRank = ideaGate?.rank ?? idea.validationScore;
        const bestRank = bestGate?.rank ?? best.validationScore;

        if (ideaRank !== bestRank) {
          return ideaRank > bestRank ? idea : best;
        }

        return idea.confidence > best.confidence ? idea : best;
      }, null),
    [extractedIdeaGates, extractedIdeas],
  );
  const recommendedExtractionGate = recommendedExtractedIdea
    ? extractedIdeaGates.get(recommendedExtractedIdea.id) ?? null
    : null;
  const recommendedGateStyle = recommendedExtractionGate ? extractionGateStyles[recommendedExtractionGate.id] : null;
  const extractionPortfolioItems = useMemo<ExtractionPortfolioItem[]>(
    () =>
      extractedIdeas
        .map((candidate) => {
          const similarIdea = similarIdeaMatches.get(candidate.id) ?? null;
          const readinessChecks = buildCandidateReadiness(candidate, similarIdea);
          const gate = extractedIdeaGates.get(candidate.id) ?? buildExtractionGate(candidate, readinessChecks, similarIdea);
          const passedReadinessCount = readinessChecks.filter((check) => check.passed).length;
          const nextReadinessGap = readinessChecks.find((check) => !check.passed);

          return {
            candidate,
            gate,
            similarIdea,
            readinessScore: Math.round((passedReadinessCount / readinessChecks.length) * 100),
            nextGap: nextReadinessGap ? nextReadinessGap.label : "저장 가능",
          };
        })
        .sort(
          (left, right) =>
            right.gate.rank - left.gate.rank ||
            right.candidate.validationScore - left.candidate.validationScore ||
            right.candidate.confidence - left.candidate.confidence,
        ),
    [extractedIdeaGates, extractedIdeas, similarIdeaMatches],
  );
  const recommendedPortfolioItem = useMemo(
    () =>
      recommendedExtractedIdea
        ? extractionPortfolioItems.find((item) => item.candidate.id === recommendedExtractedIdea.id) ?? null
        : null,
    [extractionPortfolioItems, recommendedExtractedIdea],
  );
  const secondaryPortfolioItems = useMemo(
    () =>
      extractionPortfolioItems
        .filter((item) => item.candidate.id !== recommendedExtractedIdea?.id)
        .slice(0, 3),
    [extractionPortfolioItems, recommendedExtractedIdea],
  );
  const bulkSavableExtractionItems = useMemo(
    () =>
      extractionPortfolioItems
        .filter((item) => ["proceed", "research"].includes(item.gate.id) && !item.similarIdea && item.readinessScore >= 70)
        .slice(0, 3),
    [extractionPortfolioItems],
  );
  const extractionGateCounts = useMemo(
    () =>
      extractionPortfolioItems.reduce<Record<ExtractionGateId, number>>(
        (counts, item) => ({ ...counts, [item.gate.id]: counts[item.gate.id] + 1 }),
        { proceed: 0, research: 0, pivot: 0, kill: 0 },
      ),
    [extractionPortfolioItems],
  );
  const extractionPortfolioMarkdown = useMemo(
    () =>
      [extractionReplay ? buildExtractionReplayMarkdown(extractionReplay) : "", buildExtractionPortfolioMarkdown(extractionPortfolioItems)]
        .filter(Boolean)
        .join("\n\n"),
    [extractionPortfolioItems, extractionReplay],
  );
  const consoleTasks: Array<{
    id: ConsoleActionTask;
    label: string;
    description: string;
    status: string;
  }> = [
    {
      id: "auth",
      label: "로그인",
      description: "관리자 계정으로 접속합니다.",
      status: user ? "완료" : "필수",
    },
    {
      id: "workspace",
      label: "팀 공간",
      description: "함께 볼 기록 범위를 정합니다.",
      status: activeOrganization ? "연결됨" : "선택",
    },
    {
      id: "extract",
      label: "아이디어 찾기",
      description: "대화와 메모에서 후보를 뽑습니다.",
      status: extractedIdeas.length > 0 ? `${extractedIdeas.length}개` : "붙여넣기",
    },
    {
      id: "idea",
      label: "아이디어 접수",
      description: "짧은 기록부터 남깁니다.",
      status: user ? "접수" : "로그인 필요",
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
        setAuthMessage("이메일 로그인 링크를 확인하는 중입니다...");

        const { data, error } = await supabaseClient.auth.exchangeCodeForSession(authCode);

        setIsAuthBusy(false);

        if (error) {
          setAuthMessage(formatAuthCallbackMessage("callback_exchange_failed", error.message));
          return;
        }

        const nextUser = data.user ?? null;

        setUser(nextUser);
        if (nextUser) {
          updateActiveTask("extract");
        }
        setAuthMessage("로그인되었습니다. 바로 아이디어 찾기부터 시작하세요. 협업이 필요하면 나중에 팀 공간을 열 수 있습니다.");
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
      updateActiveTask(data.user ? "extract" : "auth");
      void loadWorkspaceData(data.user);
    });

    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      const nextUser = session?.user ?? null;
      setIsAuthLoaded(true);
      setUser(nextUser);

      if (!nextUser) {
        updateActiveTask("auth");
      } else if (event === "SIGNED_IN" || event === "INITIAL_SESSION") {
        updateActiveTask("extract");
      }

      void loadWorkspaceData(nextUser);
      router.refresh();
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, [loadWorkspaceData, router, supabase, updateActiveTask]);

  async function handleEmailLinkSignIn() {
    setAuthMessage(null);

    if (!supabase) {
      setAuthMessage("로그인 환경 설정을 찾을 수 없습니다. 관리자에게 배포 설정 확인을 요청하세요.");
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

    setAuthMessage("로그인 링크를 보냈습니다. 이메일의 링크를 열고 돌아오면 이 카드에 로그인 상태가 표시됩니다.");
  }

  async function handlePasswordSignIn(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    setAuthMessage(null);

    if (!supabase) {
      setAuthMessage("로그인 환경 설정을 찾을 수 없습니다. 관리자에게 배포 설정 확인을 요청하세요.");
      return;
    }

    if (!email.trim() || !password) {
      setAuthMessage("관리자가 만든 계정의 이메일과 비밀번호를 모두 입력하세요.");
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
    updateActiveTask("extract");
    setAuthMessage("로그인되었습니다. 바로 아이디어 찾기부터 시작하세요. 협업이 필요하면 팀 공간을 나중에 연결하면 됩니다.");
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
        created_by: user.id,
      })
      .select()
      .single();
    setIsWorkspaceBusy(false);

    if (error) {
      setWorkspaceMessage(formatWorkspaceError(error.message));
      return;
    }

    setActiveOrganizationId(data.id);
    setWorkspaceMessage("협업 공간을 만들었습니다. 필요할 때만 팀으로 같이 보면 됩니다. 이제 아이디어 찾기로 돌아갑니다.");
    await loadWorkspaceData(user, data.id);
    updateActiveTask("extract");
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

    setWorkspaceMessage(`${personalRecordCount}개의 개인 기록을 ${activeOrganization.name} 협업 공간에 연결했습니다.`);
    await loadWorkspaceData(user, activeOrganization.id);
    router.refresh();
  }

  async function handleSelectWorkspace(organizationId: string) {
    setActiveOrganizationId(organizationId);
    await loadAuditEvents(organizationId);
    setWorkspaceMessage("협업 공간을 선택했습니다. 이제 AI 후보 발굴을 계속 진행하면 됩니다.");
    updateActiveTask("extract");
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
      setSaveMessage("저장소가 설정되어 있지 않습니다.");
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
      void recordTelemetryEvent({
        eventName: "idea_created",
        eventCategory: "intake",
        idea: data,
        properties: {
          source: "manual",
          has_workspace: Boolean(data.organization_id),
          filled_field_count: Object.values(form).filter((value) => value.trim()).length,
        },
      });
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

  async function handleAiExtractIdeas() {
    const source = rawIdeaSource.trim();

    if (!source) {
      setExtractMessage("대화 내용이나 메모를 먼저 붙여넣으세요.");
      setExtractedIdeas([]);
      setExtractionRunMeta(null);
      setExtractionReplay(null);
      return;
    }

    setExtractionReplay(null);
    setIsAiExtracting(true);
    setExtractMessage("AI가 원문을 읽고 후보를 정리하는 중입니다. 문제가 생기면 내부 안전장치로 계속 진행합니다.");

    try {
      const response = await fetch("/api/ideas/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source,
          existingIdeas: existingIdeas.slice(0, 20).map((idea) => ({
            name: idea.name,
            one_liner: idea.one_liner,
            target_user: idea.target_user,
            buyer: idea.buyer,
          })),
        }),
      });
      const payload = (await response.json().catch(() => ({}))) as AiExtractIdeasResponse;

      if (!response.ok || !payload.candidates?.length) {
        const fallbackIdeas = extractIdeasFromText(source);
        setExtractedIdeas(fallbackIdeas);
        setExtractionRunMeta(
          createExtractionRunMeta({
            engine: "fallback",
            model: payload.model ?? null,
            sourceLength: source.length,
            candidateCount: fallbackIdeas.length,
            note: payload.error ?? `OpenAI HTTP ${response.status} 이후 내부 안전장치로 계속 진행했습니다.`,
          }),
        );
        setExtractMessage(
          fallbackIdeas.length > 0
            ? `AI 추출을 끝까지 사용할 수 없어 내부 안전장치로 ${fallbackIdeas.length}개 후보를 정리했습니다. 사유: ${
                payload.error ?? `HTTP ${response.status}`
              }`
            : `AI 추출을 끝까지 사용할 수 없었고 내부 안전장치로도 후보를 찾지 못했습니다. 사유: ${
                payload.error ?? `HTTP ${response.status}`
              }`,
        );
        return;
      }

      const aiIdeas = hydrateAiExtractedIdeas(source, payload.candidates);
      setExtractedIdeas(aiIdeas);
      setExtractionRunMeta(
        createExtractionRunMeta({
          engine: "openai",
          model: payload.model ?? "OpenAI",
          sourceLength: source.length,
          candidateCount: aiIdeas.length,
          note: "OpenAI Responses API 구조화 출력으로 후보를 생성했습니다.",
        }),
      );
      setExtractMessage(
        `${payload.model ?? "OpenAI"} AI 엔진으로 ${aiIdeas.length}개 후보를 구조화했습니다. 추천 후보의 게이트와 중복 위험을 확인하세요.`,
      );
    } catch (error) {
      const fallbackIdeas = extractIdeasFromText(source);
      setExtractedIdeas(fallbackIdeas);
      setExtractionRunMeta(
        createExtractionRunMeta({
          engine: "fallback",
          model: null,
          sourceLength: source.length,
          candidateCount: fallbackIdeas.length,
          note: `AI 추출 요청 중 오류가 발생해 내부 안전장치로 계속 진행했습니다. ${
            error instanceof Error ? error.message : ""
          }`,
        }),
      );
      setExtractMessage(
        fallbackIdeas.length > 0
          ? `AI 추출 요청 중 오류가 발생해 내부 안전장치로 ${fallbackIdeas.length}개 후보를 정리했습니다. ${
              error instanceof Error ? error.message : ""
            }`
          : `AI 추출 요청 중 오류가 발생했고 내부 안전장치로도 후보를 찾지 못했습니다. ${
              error instanceof Error ? error.message : ""
            }`,
      );
    } finally {
      setIsAiExtracting(false);
    }
  }

  async function handleReplayExtractionComparison() {
    const source = rawIdeaSource.trim();

    if (!source) {
      setExtractMessage("점검할 대화 내용이나 메모를 먼저 붙여넣으세요.");
      setExtractedIdeas([]);
      setExtractionRunMeta(null);
      setExtractionReplay(null);
      return;
    }

    setIsReplayingExtraction(true);
    setExtractMessage("같은 원문을 내부 기준과 AI 결과로 다시 비교해 누락되거나 과한 후보가 없는지 점검하는 중입니다.");

    try {
      const rulesIdeas = extractIdeasFromText(source);
      let aiIdeas: ExtractedIdea[] = [];
      let aiMode: ExtractionReplayMode = "unavailable";
      let model: string | null = null;
      let replayNote = "AI 추출을 사용할 수 없어 내부 기준 결과만 점검했습니다.";

      try {
        const response = await fetch("/api/ideas/extract", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            source,
            existingIdeas: existingIdeas.slice(0, 20).map((idea) => ({
              name: idea.name,
              one_liner: idea.one_liner,
              target_user: idea.target_user,
              buyer: idea.buyer,
            })),
          }),
        });
        const payload = (await response.json().catch(() => ({}))) as AiExtractIdeasResponse;

        model = payload.model ?? null;

        if (response.ok && payload.candidates?.length) {
          aiIdeas = hydrateAiExtractedIdeas(source, payload.candidates);
          aiMode = payload.mode === "openai" ? "openai" : "fallback";
          replayNote = `${payload.model ?? "OpenAI"} 결과와 내부 기준 추출을 비교했습니다.`;
        } else {
          replayNote = payload.error ?? `AI 추출 HTTP ${response.status}로 내부 기준 결과만 비교했습니다.`;
        }
      } catch (error) {
        replayNote = `AI 추출 요청 중 오류가 발생해 내부 기준 결과만 비교했습니다. ${
          error instanceof Error ? error.message : ""
        }`;
      }

      const replaySummary = buildExtractionReplaySummary({
        sourceLength: source.length,
        rulesIdeas,
        aiIdeas,
        aiMode,
        model,
        note: replayNote,
      });
      const replayCandidates = replaySummary.items.map((item) => item.primaryCandidate).slice(0, 8);
      const nextIdeas = replayCandidates.length > 0 ? replayCandidates : rulesIdeas;

      setExtractedIdeas(nextIdeas);
      setExtractionReplay(replaySummary);
      setExtractionRunMeta(
        createExtractionRunMeta({
          engine: aiIdeas.length > 0 ? "openai" : "fallback",
          model,
          sourceLength: source.length,
          candidateCount: nextIdeas.length,
          note: `결과 점검 완료: 공통 ${replaySummary.consensusCount}개, AI 단독 ${replaySummary.aiOnlyCount}개, 기준 추출 단독 ${replaySummary.rulesOnlyCount}개.`,
        }),
      );
      setExtractMessage(
        nextIdeas.length > 0
          ? `결과 점검 완료. 공통 ${replaySummary.consensusCount}개, AI 단독 ${replaySummary.aiOnlyCount}개, 기준 추출 단독 ${replaySummary.rulesOnlyCount}개 후보를 비교했습니다.`
          : "결과 점검을 실행했지만 후보를 찾지 못했습니다. 원문에 아이디어, 문제, 솔루션 단서를 더 넣어보세요.",
      );
    } finally {
      setIsReplayingExtraction(false);
    }
  }

  async function copyExtractionPortfolio() {
    if (extractionPortfolioItems.length === 0) {
      setExtractMessage("복사할 후보 비교 요약이 없습니다. 먼저 후보를 발굴하세요.");
      return;
    }

    await navigator.clipboard.writeText(extractionPortfolioMarkdown);
    setExtractMessage("후보 비교 실행 요약을 클립보드에 복사했습니다.");
  }

  async function saveExtractionPortfolioReport() {
    if (extractionPortfolioItems.length === 0) {
      setExtractMessage("저장할 후보 비교 리포트가 없습니다. 먼저 후보를 발굴하세요.");
      return;
    }

    if (!supabase) {
      setExtractMessage("저장소가 설정되어 있지 않습니다.");
      return;
    }

    if (!user) {
      setExtractMessage("발굴 리포트를 저장하려면 먼저 로그인하세요.");
      return;
    }

    setIsSavingExtractionReport(true);
    setExtractMessage(null);

    const titleDate = new Date().toLocaleString("ko-KR", {
      timeZone: "Asia/Seoul",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
    const { data, error } = await supabase
      .from("venture_artifacts")
      .insert({
        idea_id: null,
        organization_id: activeOrganization?.id ?? null,
        artifact_type: "research_note",
        status: "draft",
        version: 1,
        title: `아이디어 발굴 리포트 ${titleDate}`,
        body: buildExtractionReportBody(
          extractionPortfolioItems,
          rawIdeaSource,
          activeOrganization?.name ?? null,
          extractionRunMeta,
          extractionReplay,
        ),
        source: "extraction_portfolio",
        status_note: "자동 아이디어 발굴 후보 비교와 원문 근거를 저장한 리포트입니다.",
      })
      .select()
      .single();

    setIsSavingExtractionReport(false);

    if (error) {
      setExtractMessage(error.message);
      return;
    }

    window.dispatchEvent(new CustomEvent("venture:artifact-created", { detail: data }));
    setExtractMessage("발굴 리포트를 산출물 기록으로 저장했습니다. 최근 리포트에서 다시 복사할 수 있습니다.");
    await loadPersonalRecordCount(user);
    await loadWorkspaceData(user, activeOrganization?.id ?? "");
    router.refresh();
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

  async function createExtractedIdeaPackage(candidate: ExtractedIdea, extractionGate: ExtractionGate) {
    if (!supabase) {
      throw new Error("저장소가 설정되어 있지 않습니다.");
    }

    const organizationId = activeOrganization?.id ?? null;
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
        )}\n\n첫 프로토타입 범위\n${candidate.firstPrototypeScope}\n\n가격/구매 가설\n${candidate.pricingHypothesis}\n\n게이트 판정\n${extractionGate.label}: ${extractionGate.nextAction}`,
        stage: "research",
        decision: "research_more",
        ...candidate.initialScores,
        organization_id: organizationId,
      })
      .select()
      .single();

    if (ideaError || !idea) {
      throw new Error(ideaError?.message ?? "아이디어를 저장하지 못했습니다.");
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
          organization_id: organizationId,
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
          organization_id: organizationId,
        })
        .select()
        .single(),
      supabase
        .from("venture_artifacts")
        .insert(buildExtractedIdeaArtifacts(candidate, idea, organizationId, extractionGate))
        .select(),
    ]);

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
    void recordTelemetryEvent({
      eventName: "idea_package_created",
      eventCategory: "extraction",
      idea,
      organizationId,
      properties: {
        gate: extractionGate.id,
        validation_score: candidate.validationScore,
        risk_created: Boolean(riskResult.data),
        experiment_created: Boolean(experimentResult.data),
        artifact_count: artifactResult.data?.length ?? 0,
      },
    });

    return {
      idea,
      artifactCount: artifactResult.data?.length ?? 0,
      partialError: riskResult.error?.message ?? experimentResult.error?.message ?? artifactResult.error?.message ?? null,
    };
  }

  async function saveExtractedIdeaPackage(candidate: ExtractedIdea) {
    setExtractMessage(null);

    if (!supabase) {
      setExtractMessage("저장소가 설정되어 있지 않습니다.");
      return;
    }

    if (!user) {
      setExtractMessage("후보를 저장하려면 먼저 로그인하세요.");
      return;
    }

    setExtractSaveKey(candidate.id);
    const similarIdea = similarIdeaMatches.get(candidate.id) ?? null;
    const readinessChecks = buildCandidateReadiness(candidate, similarIdea);
    const extractionGate = buildExtractionGate(candidate, readinessChecks, similarIdea);

    try {
      const result = await createExtractedIdeaPackage(candidate, extractionGate);

      if (result.partialError) {
        setExtractMessage(`아이디어는 저장했지만 연결 기록 일부가 실패했습니다: ${result.partialError}`);
      } else {
        setExtractMessage(
          `'${candidate.name}' 후보를 아이디어, 리스크, 7일 실험, 검증 산출물 ${result.artifactCount}개까지 패키지로 저장했습니다.`,
        );
      }
    } catch (error) {
      setExtractMessage(error instanceof Error ? error.message : "후보 패키지를 저장하지 못했습니다.");
    }

    setExtractSaveKey(null);
    await loadPersonalRecordCount(user);
    await loadWorkspaceData(user, activeOrganization?.id ?? "");
    router.refresh();
  }

  async function saveBulkExtractedIdeaPackages() {
    setExtractMessage(null);

    if (!supabase) {
      setExtractMessage("저장소가 설정되어 있지 않습니다.");
      return;
    }

    if (!user) {
      setExtractMessage("후보를 저장하려면 먼저 로그인하세요.");
      return;
    }

    if (bulkSavableExtractionItems.length === 0) {
      setExtractMessage("일괄 저장할 진행/추가 조사 후보가 없습니다. 중복 후보나 준비도 70% 미만 후보는 제외됩니다.");
      return;
    }

    setExtractSaveKey("bulk");
    const savedNames: string[] = [];
    const partialErrors: string[] = [];

    for (const item of bulkSavableExtractionItems) {
      try {
        const result = await createExtractedIdeaPackage(item.candidate, item.gate);
        savedNames.push(item.candidate.name);

        if (result.partialError) {
          partialErrors.push(`${item.candidate.name}: ${result.partialError}`);
        }
      } catch (error) {
        partialErrors.push(`${item.candidate.name}: ${error instanceof Error ? error.message : "저장 실패"}`);
      }
    }

    setExtractSaveKey(null);
    setExtractMessage(
      savedNames.length > 0
        ? `상위 후보 ${savedNames.length}개를 검증 패키지로 저장했습니다: ${savedNames.join(", ")}${
            partialErrors.length > 0 ? ` / 일부 보강 필요: ${partialErrors.join(" | ")}` : ""
          }`
        : `일괄 저장에 실패했습니다: ${partialErrors.join(" | ")}`,
    );
    await loadPersonalRecordCount(user);
    await loadWorkspaceData(user, activeOrganization?.id ?? "");
    router.refresh();
  }

  return (
    <section className={showSidebar ? "grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]" : embedded ? "grid gap-5" : "grid gap-6"}>
      {showSidebar ? (
      <aside className="avl-card-soft p-5 lg:sticky lg:top-6 lg:self-start">
        <div className="mb-4">
          <div className="avl-kicker mb-3">Quick setup</div>
          <h2 className="text-lg font-semibold text-slate-950">시작 준비</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">AI가 초안을 만들고, 필요한 순간에만 사용자가 보완합니다.</p>
        </div>
        <div className="grid gap-2">
          {consoleTasks.map((task, index) => (
            <button
              key={task.id}
              type="button"
              onClick={() => updateActiveTask(task.id)}
              aria-current={activeTask === task.id ? "step" : undefined}
                className={`grid grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-3 rounded-[18px] border p-3 text-left transition ${
                  activeTask === task.id
                    ? "border-slate-950 bg-slate-950 text-white shadow-none"
                    : "border-slate-200/80 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <span
                  className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                    activeTask === task.id ? "bg-white text-slate-950" : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {index + 1}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold">{task.label}</span>
                  <span className="mt-0.5 block text-xs leading-5 text-slate-500">
                    {task.description}
                  </span>
                </span>
                <span
                  className={`avl-pill ${
                    activeTask === task.id ? "bg-white/10 text-white" : "avl-pill-neutral"
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
          className={`avl-card p-6 ${activeTask === "auth" ? "" : "hidden"}`}
        >
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">로그인</h2>
            <p className="mt-1 text-sm text-slate-500">
              관리자가 만든 계정의 이메일과 비밀번호로 접속합니다. 별도 인증키나 메일 링크는 필요 없습니다.
            </p>
          </div>
          <ShieldCheck className={user ? "text-emerald-600" : "text-slate-500"} size={24} />
        </div>

        {!isAuthLoaded ? (
          <div className="avl-surface-muted p-4 text-sm leading-6 text-slate-600">현재 세션을 확인하는 중입니다...</div>
        ) : user ? (
          <div className="grid gap-4">
            <div className="avl-surface-muted border-emerald-200 bg-emerald-50 p-4">
              <div className="text-sm font-semibold text-emerald-900">로그인됨</div>
              <div className="mt-1 break-all text-sm text-emerald-800">{user.email}</div>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              disabled={isAuthBusy}
              className="avl-btn avl-btn-primary h-11 rounded-md px-4 disabled:opacity-60"
            >
              <LogOut size={18} />
              로그아웃
            </button>
          </div>
        ) : (
          <form onSubmit={handlePasswordSignIn} className="grid gap-3">
            <div className="avl-band p-4 text-sm leading-6 text-blue-900">
              <div className="font-semibold text-blue-950">비밀번호 로그인으로 진행합니다.</div>
              <ol className="mt-2 grid gap-1">
                <li>1. 관리자가 Supabase에서 만든 계정을 준비합니다.</li>
                <li>2. 이메일과 비밀번호를 입력합니다.</li>
                <li>3. 로그인 후 바로 AI 후보 발굴부터 시작합니다.</li>
              </ol>
              <p className="mt-2">
                계정이 없다면 Supabase의 Authentication &gt; Users에서 사용자를 추가하고 이메일 확인 완료 상태로 만들어 주세요.
              </p>
            </div>
            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              이메일
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                placeholder="you@example.com"
                className="avl-input"
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              비밀번호
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                placeholder="관리자가 발급한 계정 비밀번호"
                className="avl-input"
              />
            </label>
            <button
              type="submit"
              disabled={isAuthBusy}
              className="avl-btn avl-btn-primary h-11 rounded-md px-4 disabled:opacity-60"
            >
              {isAuthBusy ? <RefreshCw className="animate-spin" size={18} /> : <LogIn size={18} />}
              비밀번호로 로그인
            </button>
            <details className="avl-surface-muted p-3">
              <summary className="cursor-pointer text-sm font-semibold text-slate-700">
                이메일 링크가 꼭 필요할 때만 사용
              </summary>
              <div className="mt-3 grid gap-3 text-sm leading-6 text-slate-600">
                <p>
                  이메일 링크는 SMTP 설정과 발송 제한의 영향을 받습니다. 운영 테스트는 위의 비밀번호 로그인을 기본으로 사용하세요.
                </p>
                <button
                  type="button"
                  onClick={handleEmailLinkSignIn}
                  disabled={isAuthBusy}
                  className="avl-btn avl-btn-secondary h-11 rounded-md px-4 disabled:opacity-60"
                >
                  {isAuthBusy ? <RefreshCw className="animate-spin" size={18} /> : <LogIn size={18} />}
                  이메일 로그인 링크 받기
                </button>
              </div>
            </details>
          </form>
        )}

        {authMessage ? <p className="mt-4 text-sm leading-6 text-slate-600">{authMessage}</p> : null}
        </div>

        <div
          className={`avl-card p-6 ${
            activeTask === "workspace" ? "" : "hidden"
          }`}
        >
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">협업 공간 상태</h2>
              <p className="mt-1 text-sm text-slate-500">기본은 혼자 진행합니다. 팀으로 함께 볼 때만 협업 공간을 연결하세요.</p>
            </div>
            <Building2 className={activeOrganization ? "text-blue-600" : "text-slate-500"} size={24} />
          </div>

          {!user ? (
                <div className="avl-surface-muted p-4 text-sm leading-6 text-slate-600">
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
                  className="avl-select"
                >
                  {organizations.map((organization) => (
                    <option key={organization.id} value={organization.id}>
                      {organization.name}
                    </option>
                  ))}
                </select>
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="avl-surface-subtle p-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">역할</div>
                  <div className="mt-2 text-lg font-semibold capitalize text-slate-950">
                    {activeMembership ? organizationRoleLabels[activeMembership.role] : organizationRoleLabels.member}
                  </div>
                </div>
                <div className="avl-surface-muted p-4">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                    <Users size={14} />
                    멤버
                  </div>
                  <div className="mt-2 text-lg font-semibold text-slate-950">{activeMemberCount}</div>
                </div>
              </div>
              {personalRecordCount > 0 ? (
                <div className="avl-surface-muted border-amber-200 bg-amber-50 p-4">
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
                    className="avl-btn avl-btn-primary mt-3 h-10 rounded-md px-4 disabled:opacity-60"
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
                    <div key={`${member.organization_id}-${member.user_id}`} className="avl-surface-muted p-3">
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
                                 className="avl-btn avl-btn-secondary h-8 rounded-md px-2.5 text-xs shadow-none disabled:opacity-45"
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
                            className="avl-btn avl-btn-danger h-8 rounded-md px-2.5 text-xs shadow-none disabled:opacity-45"
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
              <form onSubmit={handleAddMember} className="grid gap-3 avl-surface-muted p-4">
                <div className="text-sm font-semibold text-slate-950">기존 Auth 사용자 추가</div>
                <div className="grid gap-3 sm:grid-cols-[1fr_132px]">
                  <input
                    value={memberEmail}
                    onChange={(event) => setMemberEmail(event.target.value)}
                    type="email"
                    placeholder="member@example.com"
                    disabled={!canManageMembers}
                    className="avl-input"
                  />
                  <select
                    value={memberRole}
                    onChange={(event) => setMemberRole(event.target.value as AddableOrganizationRole)}
                    disabled={!canManageMembers}
                    className="avl-select"
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
                  className="avl-btn avl-btn-primary h-10 rounded-md px-4 disabled:opacity-60"
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
                      <div key={event.id} className="avl-surface-muted p-3 text-sm leading-6 text-slate-600">
                        <span className="font-semibold text-slate-950">{event.action}</span> {event.summary}
                      </div>
                    ))
                  ) : (
                    <div className="avl-surface-muted p-3 text-sm text-slate-500">
                      아직 조직 감사 로그가 없습니다.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid gap-3">
              <div className="avl-surface-muted border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
                이 운영자에게 연결된 워크스페이스가 없습니다.
                {personalRecordCount > 0
                  ? ` 워크스페이스를 만든 뒤 ${personalRecordCount}개의 개인 기록을 연결할 수 있습니다.`
                  : ""}
              </div>
              <button
                type="button"
                onClick={handleCreateWorkspace}
                disabled={isWorkspaceBusy}
                className="avl-btn avl-btn-primary h-11 rounded-md px-4 disabled:opacity-60"
              >
                {isWorkspaceBusy ? <RefreshCw className="animate-spin" size={18} /> : <Building2 size={18} />}
                워크스페이스 만들기
              </button>
            </div>
          )}

          {workspaceMessage ? <p className="mt-4 text-sm leading-6 text-slate-600">{workspaceMessage}</p> : null}
        </div>

        <div className={`${activeTask === "extract" ? "" : "hidden"} ${embedded ? "space-y-5" : "space-y-5"}`}>
          {!embedded ? (
            <div className="avl-card-soft flex flex-col gap-3 p-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">source ingest</div>
                <h2 className="mt-2 text-xl font-semibold text-slate-950">아이디어 찾기</h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                  원문 하나를 넣고, 지금 바로 검토할 추천 후보 1개를 먼저 받습니다.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    void handleAiExtractIdeas();
                  }}
                  disabled={isAiExtracting || isReplayingExtraction}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isAiExtracting ? <RefreshCw className="animate-spin" size={18} /> : <Sparkles size={18} />}
                  AI 후보 발굴
                </button>
              </div>
            </div>
          ) : null}

          <div className="space-y-4">
            <section className="rounded-[12px] border border-slate-200 bg-white p-4 text-slate-900">
              <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
                <div className="grid gap-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">원문 입력</div>
                      <h3 className="mt-2 text-base font-semibold text-slate-950">대화나 메모 붙여넣기</h3>
                      <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">
                        문제, 대상, 해결 방식이 드러나는 문장 위주로 넣으면 후보가 더 안정적으로 정리됩니다.
                      </p>
                    </div>
                    <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                      {rawIdeaSource.trim().length > 0 ? `${rawIdeaSource.trim().length.toLocaleString()}자 입력됨` : "원문 대기"}
                    </div>
                  </div>
                  <textarea
                    value={rawIdeaSource}
                    onChange={(event) => setRawIdeaSource(event.target.value)}
                    rows={14}
                    placeholder="예) 아이디어:, 페인 포인트:, 솔루션:, 타깃, 수익화, 다음 검증 질문..."
                    className="avl-textarea min-h-[320px] leading-7"
                  />
                  <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setRawIdeaSource(sampleIdeaSource)}
                  className="avl-btn avl-btn-secondary rounded-md px-4"
                >
                  샘플 넣기
                </button>
                <button
                  type="button"
                      onClick={() => {
                        setRawIdeaSource("");
                        setExtractedIdeas([]);
                        setExtractionRunMeta(null);
                        setExtractionReplay(null);
                        setExtractMessage(null);
                      }}
                      className="avl-btn avl-btn-subtle rounded-md px-4 text-slate-600 hover:text-slate-900"
                    >
                      비우기
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        void handleAiExtractIdeas();
                      }}
                      disabled={isAiExtracting || isReplayingExtraction}
                      className="avl-btn avl-btn-primary rounded-md px-4 disabled:opacity-60"
                    >
                      {isAiExtracting ? <RefreshCw className="animate-spin" size={16} /> : <Sparkles size={16} />}
                      AI 후보 발굴
                    </button>
                  </div>
                  {extractMessage ? (
                    <div className="avl-surface-muted px-4 py-3 text-sm leading-6 text-slate-700">
                      {extractMessage}
                    </div>
                  ) : null}
                  {duplicateCandidateCount > 0 ? (
                    <div className="avl-surface-muted border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
                      {duplicateCandidateCount}개 후보가 기존 포트폴리오와 유사합니다. 새로 만들기보다 기존 기록 확장을 먼저
                      확인하세요.
                    </div>
                  ) : null}
                </div>

                <div className="grid gap-3">
                  {extractedIdeas.length > 0 && recommendedExtractedIdea ? (
                    <section className="avl-surface-muted p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">추천 후보</div>
                          <h3 className="mt-2 text-lg font-semibold text-slate-950">{recommendedExtractedIdea.name}</h3>
                          <p className="mt-1 text-sm leading-6 text-slate-600">지금 바로 접수 후보로 넘길 1개를 먼저 보여줍니다.</p>
                        </div>
                        {recommendedExtractionGate && recommendedGateStyle ? (
                          <span className={`${recommendedGateStyle.badge}`}>
                            {recommendedExtractionGate.label}
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-3 text-sm leading-7 text-slate-700">{recommendedExtractedIdea.one_liner}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <span className="avl-pill avl-pill-soft px-3 py-1 text-xs">
                          검증 {recommendedExtractedIdea.validationScore}/100
                        </span>
                        <span className="avl-pill avl-pill-soft px-3 py-1 text-xs">
                          사업/개발 {recommendedPortfolioItem ? getCandidateStrategyScore(recommendedPortfolioItem.candidate) : getCandidateStrategyScore(recommendedExtractedIdea)}%
                        </span>
                        <span className="avl-pill avl-pill-soft px-3 py-1 text-xs">
                          준비 {recommendedPortfolioItem?.readinessScore ?? 0}%
                        </span>
                      </div>
                      <div className="avl-surface-subtle mt-4 px-4 py-4">
                        <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">왜 이 후보인가</div>
                        <p className="mt-2 text-sm leading-6 text-slate-700">
                          {recommendedExtractionGate?.summary ?? recommendedExtractedIdea.validationRationale}
                        </p>
                        {recommendedExtractionGate ? (
                          <p className="mt-2 text-sm leading-6 text-slate-600">
                            <span className="font-semibold text-slate-900">다음:</span> {recommendedExtractionGate.nextAction}
                          </p>
                        ) : null}
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => loadExtractedIdea(recommendedExtractedIdea)}
                          className="avl-btn avl-btn-secondary rounded-md px-4"
                        >
                          AI 초안 반영
                        </button>
                        <button
                          type="button"
                          onClick={() => saveExtractedIdeaPackage(recommendedExtractedIdea)}
                          disabled={Boolean(extractSaveKey) || !user}
                          className="avl-btn avl-btn-primary rounded-md px-4"
                        >
                          {extractSaveKey === recommendedExtractedIdea.id ? <RefreshCw className="animate-spin" size={16} /> : <PlusCircle size={16} />}
                          검증 패키지 저장
                        </button>
                      </div>
                    </section>
                  ) : (
                    <section className="avl-surface-muted border-dashed p-4">
                      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">다음 출력</div>
                      <h3 className="mt-2 text-base font-semibold text-slate-950">추천 후보가 이 영역에 나타납니다</h3>
                      <ul className="mt-3 grid gap-2 text-sm leading-6 text-slate-700">
                        <li>1. 원문을 붙여넣고 후보 발굴을 실행합니다.</li>
                        <li>2. 추천 후보 1개를 먼저 보고 바로 접수로 넘길지 판단합니다.</li>
                        <li>3. 필요할 때만 비교 후보와 점검 결과를 펼쳐봅니다.</li>
                      </ul>
                    </section>
                  )}

                  <div className="grid gap-3 border-t border-slate-200 pt-3 sm:grid-cols-3">
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">실행 상태</div>
                      <div className="mt-1 text-sm font-semibold text-slate-950">
                        {extractionRunMeta
                          ? extractionRunMeta.engine === "openai"
                            ? "OpenAI 추출"
                            : extractionRunMeta.engine === "fallback"
                              ? "AI 실패 후 안전장치"
                              : "내부 안전장치"
                          : "실행 전"}
                      </div>
                      <p className="mt-1 text-xs leading-5 text-slate-600">
                        {extractionRunMeta?.note ?? "아직 실행하지 않았습니다."}
                      </p>
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">개인정보 보호</div>
                      <p className="mt-1 text-xs leading-5 text-slate-600">
                        연락처, 계좌, 카드번호처럼 보이는 패턴은 저장 전에 자동으로 익명화됩니다.
                      </p>
                    </div>
                    <div className="flex flex-col items-start">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">결과 점검</div>
                      <p className="mt-1 text-xs leading-5 text-slate-600">
                        추천이 과하게 넓거나 빠졌다고 느껴질 때만 다시 비교합니다.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          void handleReplayExtractionComparison();
                        }}
                        disabled={isAiExtracting || isReplayingExtraction}
                        className="avl-btn avl-btn-secondary mt-2 h-9 rounded-md px-3 disabled:opacity-60"
                      >
                        {isReplayingExtraction ? <RefreshCw className="animate-spin" size={15} /> : <RefreshCw size={15} />}
                        결과 점검
                      </button>
                    </div>
                  </div>
                  <details className="avl-surface-muted p-4">
                    <summary className="cursor-pointer list-none text-sm font-semibold text-slate-950">비교 결과 보기</summary>
                    {extractionReplay ? (
                      <div className="avl-surface-subtle mt-3 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">비교 결과</div>
                            <p className="mt-1 text-sm leading-6 text-slate-700">추천이 너무 넓거나 빠졌다고 느껴질 때만 이 결과를 보면 됩니다.</p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <span className="avl-pill avl-pill-soft px-3 py-1 text-xs">
                              공통 {extractionReplay.consensusCount}
                            </span>
                            <span className="avl-pill avl-pill-soft px-3 py-1 text-xs">
                              AI만 {extractionReplay.aiOnlyCount}
                            </span>
                          </div>
                        </div>
                        <p className="mt-3 text-xs leading-6 text-slate-600">{extractionReplay.note}</p>
                      </div>
                    ) : (
                      <p className="mt-3 text-sm leading-6 text-slate-600">아직 비교 점검을 실행하지 않았습니다.</p>
                    )}
                  </details>
                </div>
              </div>
            </section>

            {extractedIdeas.length > 0 ? (
              <>
                <details className="rounded-[12px] border border-slate-200 bg-white p-4 text-slate-900">
                  <summary className="flex cursor-pointer list-none flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                        <ClipboardList size={15} />
                        비교 후보
                      </div>
                      <h3 className="mt-2 text-lg font-semibold text-slate-950">비교 후보</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        추천 1개 외의 후보는 필요할 때만 펼쳐서 확인합니다.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {([
                        ["proceed", "진행 후보"],
                        ["research", "추가 조사"],
                        ["pivot", "전환 검토"],
                        ["kill", "중단 후보"],
                      ] as Array<[ExtractionGateId, string]>).map(([gateId, label]) => (
                        <span key={gateId} className="avl-pill avl-pill-neutral">
                          {label} {extractionGateCounts[gateId]}
                        </span>
                      ))}
                    </div>
                  </summary>

                    <div className="mt-4 grid gap-3">
                    {secondaryPortfolioItems.length > 0 ? (
                      secondaryPortfolioItems.map((item, index) => (
                        <div
                          key={`${item.candidate.id}-queue`}
                          className="grid gap-3 rounded-[12px] border border-slate-200 bg-white p-4 xl:grid-cols-[44px_minmax(0,1fr)_auto]"
                        >
                          <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-sm font-semibold text-white">
                            {index + 2}
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <div className="text-sm font-semibold text-slate-950">{item.candidate.name}</div>
                              <span className={`rounded-md px-2.5 py-1 text-xs font-semibold ${extractionGateStyles[item.gate.id].badge}`}>
                                {item.gate.label}
                              </span>
                            </div>
                            <p className="mt-1 text-sm leading-6 text-slate-600">
                              검증 {item.candidate.validationScore}/100 · 준비 {item.readinessScore}% · {item.nextGap}
                            </p>
                            <p className="mt-1 text-sm leading-6 text-slate-600">
                              {item.gate.nextAction}
                              {item.similarIdea ? ` / 중복: ${item.similarIdea.idea.name} ${item.similarIdea.score}%` : ""}
                            </p>
                          </div>
                          <div className="flex flex-wrap items-start gap-2 xl:justify-end">
                            <button
                              type="button"
                              onClick={() => loadExtractedIdea(item.candidate)}
                              className="avl-btn avl-btn-secondary h-9 rounded-md px-3 text-sm"
                            >
                              초안 반영
                            </button>
                            <button
                              type="button"
                              onClick={() => saveExtractedIdeaPackage(item.candidate)}
                              disabled={Boolean(extractSaveKey) || !user}
                              className="avl-btn avl-btn-primary h-9 rounded-md px-3 text-sm disabled:opacity-50"
                            >
                              {extractSaveKey === item.candidate.id ? <RefreshCw className="animate-spin" size={14} /> : <PlusCircle size={14} />}
                              저장
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="avl-surface-muted border-dashed p-4 text-sm leading-6 text-slate-600">
                        추천 후보 외에 지금 바로 비교할 후보가 많지 않습니다. 현재 추천 1개를 먼저 접수하는 쪽이 더 자연스럽습니다.
                      </div>
                    )}
                  </div>

                  <details className="avl-surface-muted mt-4 p-4">
                    <summary className="cursor-pointer list-none text-sm font-semibold text-slate-950">운영자 작업</summary>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          void copyExtractionPortfolio();
                        }}
                        className="avl-btn avl-btn-secondary h-10 rounded-xl px-4"
                      >
                        실행 요약 복사
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          void saveExtractionPortfolioReport();
                        }}
                        disabled={isSavingExtractionReport || !user}
                        className="avl-btn avl-btn-primary h-10 rounded-xl px-4 disabled:opacity-50"
                      >
                        {isSavingExtractionReport ? <RefreshCw className="animate-spin" size={16} /> : <ClipboardList size={16} />}
                        리포트 저장
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          void saveBulkExtractedIdeaPackages();
                        }}
                        disabled={Boolean(extractSaveKey) || !user || bulkSavableExtractionItems.length === 0}
                        className="avl-btn avl-btn-primary h-10 rounded-xl px-4 disabled:opacity-50"
                      >
                        {extractSaveKey === "bulk" ? <RefreshCw className="animate-spin" size={16} /> : <PlusCircle size={16} />}
                        추천 {bulkSavableExtractionItems.length}개 저장
                      </button>
                    </div>
                  </details>
                </details>

                <details className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                  <summary className="cursor-pointer list-none text-sm font-semibold text-slate-950">후보별 상세 보기</summary>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    추천 후보만으로 판단이 어렵다면 여기서 각 후보의 가설, 실험안, 원문 근거를 펼쳐서 확인하세요.
                  </p>
                  <div className="mt-4 grid gap-4">
                  {extractedIdeas.map((candidate) => {
                    const similarIdea = similarIdeaMatches.get(candidate.id);
                    const readinessChecks = buildCandidateReadiness(candidate, similarIdea ?? null);
                    const passedReadinessCount = readinessChecks.filter((check) => check.passed).length;
                    const readinessScore = Math.round((passedReadinessCount / readinessChecks.length) * 100);
                    const nextReadinessGap = readinessChecks.find((check) => !check.passed);
                    const extractionGate =
                      extractedIdeaGates.get(candidate.id) ?? buildExtractionGate(candidate, readinessChecks, similarIdea ?? null);
                    const gateStyle = extractionGateStyles[extractionGate.id];
                    const strategyLenses = buildCandidateStrategyLens(candidate);
                    const strategyScore = getCandidateStrategyScore(candidate);

                    return (
                    <article key={candidate.id} className="avl-card-soft p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base font-semibold text-slate-950">{candidate.name}</h3>
                            <span className="avl-pill avl-pill-info">
                              검증 {candidate.validationScore}/100
                            </span>
                            <span
                              className={`avl-pill ${
                                candidate.riskLevel === "높음"
                                  ? "avl-pill-danger"
                                  : candidate.riskLevel === "보통"
                                    ? "avl-pill-warning"
                                    : "avl-pill-success"
                              }`}
                            >
                              리스크 {candidate.riskLevel}
                            </span>
                            <span className="avl-pill avl-pill-neutral">
                              신뢰 {candidate.confidence}%
                            </span>
                            <span className="avl-pill avl-pill-success">
                              패키지 {passedReadinessCount}/{readinessChecks.length}
                            </span>
                            <span className="avl-pill avl-pill-brand">
                              사업/개발 {strategyScore}%
                            </span>
                            <span className={`${gateStyle.badge}`}>
                              {extractionGate.label}
                            </span>
                          </div>
                          <p className="mt-2 text-sm leading-6 text-slate-600">{candidate.one_liner}</p>
                        </div>
                        <div className="flex shrink-0 flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => loadExtractedIdea(candidate)}
                  className="avl-btn avl-btn-secondary h-10 rounded-md px-4"
                          >
                            AI 초안 반영
                          </button>
                          <button
                            type="button"
                            onClick={() => saveExtractedIdeaPackage(candidate)}
                            disabled={Boolean(extractSaveKey) || !user}
                  className="avl-btn avl-btn-accent h-10 rounded-md px-4 disabled:opacity-50"
                          >
                            {extractSaveKey === candidate.id ? <RefreshCw className="animate-spin" size={16} /> : <PlusCircle size={16} />}
                            패키지 저장
                          </button>
                        </div>
                      </div>
                      {similarIdea ? (
                        <div className="avl-surface-muted mt-3 border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-900">
                          <span className="font-semibold text-amber-950">기존 유사 기록:</span>{" "}
                          {similarIdea.idea.name} · 유사도 {similarIdea.score}% · {similarIdea.reason}
                        </div>
                      ) : null}
                      <div className={`mt-3 rounded-md border p-3 ${gateStyle.panel}`}>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <div className={`text-sm font-semibold ${gateStyle.title}`}>
                              게이트 판정: {extractionGate.label}
                            </div>
                            <p className="mt-1 text-sm leading-6 text-slate-700">{extractionGate.summary}</p>
                            <p className="mt-1 text-sm leading-6 text-slate-700">
                              <span className="font-semibold text-slate-950">다음 작업:</span>{" "}
                              {extractionGate.nextAction}
                            </p>
                          </div>
                          <div className={`shrink-0 rounded-md px-3 py-2 text-right ${gateStyle.score}`}>
                            <div className="text-[10px] font-semibold">기준</div>
                            <div className="mt-1 max-w-[160px] text-xs leading-5">{extractionGate.threshold}</div>
                          </div>
                        </div>
                        {extractionGate.blockers.length > 0 ? (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {extractionGate.blockers.map((blocker) => (
                              <span
                                key={blocker}
                                className="avl-pill avl-pill-neutral"
                              >
                                보강 필요: {blocker}
                              </span>
                            ))}
                          </div>
                        ) : null}
                      </div>
                      <div className="avl-surface-muted mt-3 border-slate-200 p-3">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <div className="text-sm font-semibold text-slate-950">사업/개발 스코어카드</div>
                            <p className="mt-1 text-sm leading-6 text-slate-600">
                              수요, 수익화, MVP 난이도, 도달 채널, 자동화 가치, 보안 부담을 함께 봅니다.
                            </p>
                          </div>
                          <div className="rounded-lg bg-slate-950 px-3 py-2 text-right text-white">
                            <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-300">종합</div>
                            <div className="text-2xl font-semibold">{strategyScore}%</div>
                          </div>
                        </div>
                        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                          {strategyLenses.map((lens) => (
                            <div key={lens.label} className="avl-surface-subtle px-3 py-2">
                              <div className="flex items-center justify-between gap-3">
                                <span className="text-xs font-semibold text-slate-950">{lens.label}</span>
                                <span
                                  className={`avl-pill ${
                                    lens.tone === "good"
                                      ? "avl-pill-success"
                                      : lens.tone === "watch"
                                        ? "avl-pill-warning"
                                        : "avl-pill-danger"
                                  }`}
                                >
                                  {lens.score}%
                                </span>
                              </div>
                              <p className="mt-1 text-xs leading-5 text-slate-600">{lens.detail}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="avl-surface-muted mt-3 border-emerald-200 bg-emerald-50 p-3">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <div className="text-sm font-semibold text-emerald-950">검증 패키지 준비도</div>
                            <p className="mt-1 text-sm leading-6 text-emerald-900">
                              {nextReadinessGap
                                ? `다음 보강: ${nextReadinessGap.label} - ${nextReadinessGap.detail}`
                                : "아이디어, 리스크, 7일 실험으로 저장할 준비가 좋습니다."}
                            </p>
                          </div>
                          <div className="rounded-lg bg-slate-950 px-3 py-2 text-right text-white">
                            <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-200">
                              준비
                            </div>
                            <div className="text-2xl font-semibold">{readinessScore}%</div>
                          </div>
                        </div>
                        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                          {readinessChecks.map((check) => (
                            <div key={check.label} className="avl-surface-subtle px-3 py-2">
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
                          <p className="mt-1 text-sm leading-6 text-slate-700">
                            {compactText(redactSensitiveSource(candidate.sourceBlock), 360)}
                          </p>
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
                    </div>
                  </details>
                </>
              ) : null}
          </div>
        </div>

      <form
        onSubmit={handleCreateIdea}
        className={`grid gap-5 ${activeTask === "idea" ? "" : "hidden"}`}
      >
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_340px]">
          <section className="avl-card-soft p-6 text-slate-900">
            {embedded ? (
              <div className="mb-5 flex flex-col gap-3 rounded-[22px] border border-slate-200 bg-slate-50 p-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">intake canvas</div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {activeOrganization
                      ? `${activeOrganization.name} 안에 저장할 초안을 정리합니다. 이름과 한 줄 설명만 확정하면 바로 다음 검증 단계로 넘길 수 있습니다.`
                      : "AI가 만든 초안을 검토하고, 꼭 필요한 의견만 보완한 뒤 저장합니다. 여기서는 필수 두 줄만 먼저 확정하면 충분합니다."}
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={isSaving || !user}
                className="avl-btn avl-btn-primary h-11 rounded-xl px-4 disabled:opacity-50"
                >
                  {isSaving ? <RefreshCw className="animate-spin" size={18} /> : <PlusCircle size={18} />}
                  아이디어 저장
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="mb-2 inline-flex rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">intake canvas</div>
                  <h2 className="mt-3 text-3xl font-semibold text-slate-950">아이디어 접수</h2>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                    {activeOrganization
                      ? `${activeOrganization.name} 안에 저장할 초안을 정리합니다. 이름과 한 줄 설명만 확정하면 바로 다음 검증 단계로 넘길 수 있습니다.`
                      : "AI가 먼저 만든 초안을 검토하고, 꼭 필요한 의견만 보태서 저장합니다. 여기서는 필수 두 줄만 먼저 확정하면 됩니다."}
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={isSaving || !user}
                className="avl-btn avl-btn-primary h-11 rounded-xl px-4 disabled:opacity-50"
                >
                  {isSaving ? <RefreshCw className="animate-spin" size={18} /> : <PlusCircle size={18} />}
                  아이디어 저장
                </button>
              </div>
            )}

            <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
              <div className="grid gap-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Field
                    label="이름"
                    value={form.name}
                    onChange={(value) => setForm({ ...form, name: value })}
                    required
                    hint="AI가 추천한 후보명을 그대로 두거나, 네가 이해하기 쉬운 이름으로 다듬어도 됩니다."
                  />
                  <Field
                    label="한 줄 설명"
                    value={form.one_liner}
                    onChange={(value) => setForm({ ...form, one_liner: value })}
                    required
                    hint="사용자 문제와 해결 방식이 한 문장에 같이 보이도록만 정리하면 충분합니다."
                  />
                </div>

                <details className="rounded-[20px] border border-slate-200 bg-slate-50 p-4">
                  <summary className="cursor-pointer list-none text-sm font-semibold text-slate-950">
                    추가 입력 열기
                  </summary>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    아래는 AI가 채운 초안을 사람이 다듬는 공간입니다. 필요가 없으면 그냥 두고 저장해도 됩니다.
                  </p>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <Field
                      label="구매자"
                      value={form.buyer}
                      onChange={(value) => setForm({ ...form, buyer: value })}
                    />
                    <Field
                      label="대상 사용자"
                      value={form.target_user}
                      onChange={(value) => setForm({ ...form, target_user: value })}
                    />
                  </div>

                  <div className="mt-4 grid gap-4 md:grid-cols-3">
                    <TextArea
                      label="수요 신호"
                      value={form.signal}
                      onChange={(value) => setForm({ ...form, signal: value })}
                    />
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
                </details>
              </div>

              <div className="grid gap-4">
                <div className="rounded-[20px] border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">AI가 먼저 정리한 것</div>
                  <div className="mt-3 grid gap-3">
                    <div className="rounded-2xl border border-slate-200 bg-white p-3">
                      <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">저장 기준</div>
                      <p className="mt-2 text-sm leading-6 text-slate-700">
                        이름과 한 줄 설명만 비어 있지 않으면 이 단계는 통과입니다.
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-3">
                      <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">구매자/대상</div>
                      <p className="mt-2 text-sm leading-6 text-slate-700">
                        {form.buyer || form.target_user
                          ? `${form.buyer || "구매자 미정"} / ${form.target_user || "대상 사용자 미정"}`
                          : "AI 초안이 아직 비어 있으면, 저장 뒤 다음 단계에서 다시 구체화해도 됩니다."}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-3">
                      <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">다음 액션</div>
                      <p className="mt-2 text-sm leading-6 text-slate-700">
                        저장 후에는 워크벤치가 이 초안을 바로 선택하고, 다음으로 사업성 평가와 첫 검증 실험 설계가 열립니다.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="avl-band p-4 text-slate-900">
                  <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">사람이 확인할 포인트</div>
                  <ul className="mt-3 grid gap-2 text-sm leading-6 text-slate-700">
                    <li>- 이름이 회의 메모 제목처럼 길지 않은지</li>
                    <li>- 한 줄 설명에 문제와 해결이 같이 들어있는지</li>
                    <li>- 추가 입력은 정말 의견을 보태고 싶을 때만 수정할 것</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <div className="grid gap-4">
            <section className="avl-band p-5 text-slate-900">
              <div className="avl-kicker">next step</div>
              <h3 className="mt-4 text-lg font-semibold text-slate-950">저장하면 바로 워크벤치로 이동합니다</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                새 아이디어는 저장되는 순간 워크벤치에 추가되고, 바로 선택된 상태로 `사업성 평가` 단계에서 이어서 검토할 수 있습니다.
              </p>
            </section>

            <section className="avl-card-soft p-5 text-slate-900">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">operator status</div>
              <div className="mt-3 grid gap-3">
                {([
                  ["필수 입력", Boolean(form.name && form.one_liner)],
                  ["구매자/대상 보강", Boolean(form.buyer && form.target_user)],
                  ["검증 메모 보강", Boolean(form.signal || form.risk_summary || form.next_evidence)],
                ] as Array<[string, boolean]>).map(([label, passed]) => (
                  <div key={label} className="avl-surface-muted p-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-semibold text-slate-900">{label}</span>
                      <span
                        className={`avl-pill ${
                          passed ? "avl-pill-success" : "avl-pill-neutral"
                        }`}
                      >
                        {passed ? "준비됨" : "선택"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        {saveMessage ? <p className="text-sm leading-6 text-slate-600">{saveMessage}</p> : null}
      </form>
      </div>
    </section>
  );
}

function formatAuthError(message: string) {
  if (message.toLowerCase().includes("rate limit")) {
    return "이메일 로그인 발송 제한에 걸렸습니다. 잠시 기다렸다 다시 시도하거나, 관리자가 미리 만든 비밀번호 계정으로 접속하세요.";
  }

  if (message.toLowerCase().includes("invalid login credentials")) {
    return "이메일 또는 비밀번호가 올바르지 않습니다. 관리자가 만든 기존 계정인지, 비밀번호가 맞는지 확인하세요.";
  }

  return message;
}

function formatWorkspaceError(message: string) {
  const normalizedMessage = message.toLowerCase();

  if (normalizedMessage.includes("row-level security") && normalizedMessage.includes("organizations")) {
    return "팀 공간 생성 권한 정책이 아직 맞지 않습니다. Supabase SQL Editor에서 최신 워크스페이스 정책 SQL을 실행한 뒤 다시 시도하세요.";
  }

  if (normalizedMessage.includes("duplicate key") && normalizedMessage.includes("organizations_slug")) {
    return "이미 이 계정용 팀 공간이 만들어져 있습니다. 새로고침 후 팀 공간 목록을 다시 확인하세요.";
  }

  return message;
}

function formatAuthCallbackMessage(error: string, description: string | null) {
  if (error === "missing_callback_state") {
    return "로그인 링크에 필요한 코드가 없습니다. 새 링크를 요청한 뒤 가장 최근 이메일을 여세요.";
  }

  if (error === "callback_exchange_failed") {
    const normalizedDescription = description?.toLowerCase() ?? "";

    if (normalizedDescription.includes("verifier")) {
      return "로그인 링크는 열렸지만 원래 브라우저 세션을 찾지 못했습니다. 링크를 다시 요청한 뒤 로그인 링크를 보낸 같은 브라우저 프로필에서 여세요.";
    }

    return description
      ? `로그인 링크 확인 실패: ${description}`
      : "로그인 링크 확인에 실패했습니다. 새 링크를 요청한 뒤 다시 시도하세요.";
  }

  return description ? `${error}: ${description}` : error;
}

function Field({
  label,
  value,
  onChange,
  required = false,
  tone = "light",
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  tone?: "light" | "dark";
  hint?: string;
}) {
  return (
    <label className={`grid gap-2 text-sm font-semibold ${tone === "dark" ? "text-slate-200" : "text-slate-700"}`}>
      {label}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        className={`avl-input ${tone === "dark" ? "border-white/10 bg-white/[0.06] text-white placeholder:text-slate-400" : ""}`}
      />
      {hint ? (
        <span className={`text-xs leading-5 ${tone === "dark" ? "text-slate-400" : "text-slate-500"}`}>{hint}</span>
      ) : null}
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  tone = "light",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  tone?: "light" | "dark";
}) {
  return (
    <label className={`grid gap-2 text-sm font-semibold ${tone === "dark" ? "text-slate-200" : "text-slate-700"}`}>
      {label}
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={4}
        className={`avl-textarea min-h-28 ${tone === "dark" ? "border-white/10 bg-white/[0.06] text-white placeholder:text-slate-400" : ""}`}
      />
    </label>
  );
}
