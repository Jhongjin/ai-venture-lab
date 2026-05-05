"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { Beaker, CheckCircle2, Clipboard, ClipboardList, Code2, Flag, Layers3, RefreshCw, Save, ShieldAlert } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type {
  Decision,
  Experiment,
  Idea,
  ImplementationTask,
  OrchestrationRun,
  Risk,
  VentureArtifact,
} from "@/lib/venture-data";
import type {
  Database,
  DecisionStatus,
  IdeaStage,
  ImplementationTaskPriority,
  ImplementationTaskStatus,
  ImplementationTaskType,
  OrchestrationPhase,
  OrchestrationStatus,
  RiskSeverity,
  VentureArtifactStatus,
  VentureArtifactType,
} from "@/lib/supabase/types";

type OrganizationMember = Database["public"]["Tables"]["organization_members"]["Row"];

const stages: IdeaStage[] = ["intake", "research", "score", "prd", "prototype", "qa", "launch", "paused"];
const stageRank = new Map(stages.map((stage, index) => [stage, index]));
const decisions: DecisionStatus[] = ["pending", "research_more", "ship", "pivot", "kill"];
const riskSeverities: RiskSeverity[] = ["low", "medium", "high", "critical"];
const orchestrationStatuses: OrchestrationStatus[] = ["planned", "running", "blocked", "done", "skipped"];
const implementationTaskStatuses: ImplementationTaskStatus[] = ["todo", "doing", "blocked", "done"];
const implementationTaskTypes: ImplementationTaskType[] = [
  "planning",
  "design",
  "frontend",
  "backend",
  "data",
  "qa",
  "security",
  "deploy",
];
const implementationTaskPriorities: ImplementationTaskPriority[] = ["low", "medium", "high"];
const artifactLabels: Record<VentureArtifactType, string> = {
  idea_brief: "아이디어 브리프",
  research_note: "리서치 노트",
  prd: "PRD",
  mvp_spec: "MVP 명세",
  backend_decision: "백엔드 결정",
  design_brief: "디자인 브리프",
  tech_spec: "기술 명세",
  dev_runbook: "개발 런북",
  launch_checklist: "출시 체크리스트",
};
const artifactStatusLabels: Record<VentureArtifactStatus, string> = {
  draft: "초안",
  approved: "승인됨",
  archived: "보관됨",
};
const artifactStatusTone: Record<VentureArtifactStatus, string> = {
  draft: "bg-slate-100 text-slate-700",
  approved: "bg-emerald-100 text-emerald-800",
  archived: "bg-amber-100 text-amber-800",
};
const artifactStatusDefaultNotes: Record<VentureArtifactStatus, string> = {
  draft: "수정을 위해 초안 상태로 되돌렸습니다.",
  approved: "다음 게이트 진행을 위해 승인했습니다.",
  archived: "현재 판단 경로에서 보관 처리했습니다.",
};
const adminRoles = new Set(["owner", "admin"]);
const riskSeverityLabels: Record<RiskSeverity, string> = {
  low: "낮음",
  medium: "보통",
  high: "높음",
  critical: "치명적",
};
const riskStatusLabels: Record<string, string> = {
  open: "열림",
  mitigating: "완화 중",
  closed: "종료",
};
const filterModeLabels: Record<"all" | "mine" | "read_only", string> = {
  all: "전체",
  mine: "내 기록",
  read_only: "읽기 전용",
};
const editabilityLabels = {
  editable: "편집 가능",
  orgAdmin: "조직 관리자",
  readOnly: "읽기 전용",
};
const experimentStatusLabels: Record<string, string> = {
  planned: "계획",
  running: "진행 중",
  done: "완료",
};
const runStatusLabels: Record<OrchestrationStatus, string> = {
  planned: "계획",
  running: "진행 중",
  blocked: "차단",
  done: "완료",
  skipped: "건너뜀",
};
const implementationTaskStatusLabels: Record<ImplementationTaskStatus, string> = {
  todo: "할 일",
  doing: "진행 중",
  blocked: "차단",
  done: "완료",
};
const implementationTaskStatusTone: Record<ImplementationTaskStatus, string> = {
  todo: "bg-slate-100 text-slate-700",
  doing: "bg-blue-100 text-blue-800",
  blocked: "bg-rose-100 text-rose-800",
  done: "bg-emerald-100 text-emerald-800",
};
const implementationTaskPriorityLabels: Record<ImplementationTaskPriority, string> = {
  low: "낮음",
  medium: "보통",
  high: "높음",
};
const implementationTaskPriorityTone: Record<ImplementationTaskPriority, string> = {
  low: "bg-slate-100 text-slate-700",
  medium: "bg-amber-100 text-amber-800",
  high: "bg-rose-100 text-rose-800",
};
const implementationTaskActionRank: Record<ImplementationTaskStatus, number> = {
  blocked: 0,
  doing: 1,
  todo: 2,
  done: 3,
};
const implementationTaskPriorityRank: Record<ImplementationTaskPriority, number> = {
  high: 0,
  medium: 1,
  low: 2,
};
const implementationTaskTypeLabels: Record<ImplementationTaskType, string> = {
  planning: "기획",
  design: "디자인",
  frontend: "프론트",
  backend: "백엔드",
  data: "데이터",
  qa: "QA",
  security: "보안",
  deploy: "배포",
};

const orchestrationPhaseConfigs: Array<{
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
    objective: "검증된 증거를 가장 작은 PRD와 수용 기준으로 전환합니다.",
  },
  {
    phase: "design",
    label: "디자인",
    ownerRole: "design-reviewer",
    objective: "구현 전에 흐름, 화면, 빈 상태, 사용성 리스크를 정리합니다.",
  },
  {
    phase: "build",
    label: "개발",
    ownerRole: "prototype-builder",
    objective: "현재 가설을 검증할 수 있는 가장 작은 유용한 프로토타입을 만듭니다.",
  },
  {
    phase: "qa",
    label: "QA",
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
const phaseOrder = new Map(orchestrationPhaseConfigs.map((config, index) => [config.phase, index]));
const phaseLabels = Object.fromEntries(
  orchestrationPhaseConfigs.map((config) => [config.phase, config.label]),
) as Record<OrchestrationPhase, string>;
const runStatusTone: Record<OrchestrationStatus, string> = {
  planned: "bg-slate-100 text-slate-700",
  running: "bg-blue-100 text-blue-800",
  blocked: "bg-rose-100 text-rose-800",
  done: "bg-emerald-100 text-emerald-800",
  skipped: "bg-amber-100 text-amber-800",
};

const stageLabels: Record<IdeaStage, string> = {
  intake: "접수",
  research: "리서치",
  score: "점수화",
  prd: "PRD",
  prototype: "프로토타입",
  qa: "QA",
  launch: "출시",
  paused: "보류",
};

const decisionLabels: Record<DecisionStatus, string> = {
  pending: "대기",
  research_more: "추가 조사",
  ship: "진행",
  pivot: "전환",
  kill: "중단",
};
const artifactSourceLabels: Record<string, string> = {
  workbench: "워크벤치",
  manual: "수동",
  development_process: "앱 개발 프로세스",
  development_report: "개발 완료 보고서",
};

type EditState = Pick<
  Idea,
  | "stage"
  | "decision"
  | "problem_intensity"
  | "frequency"
  | "reachability"
  | "willingness_to_pay"
  | "mvp_speed"
  | "differentiation"
  | "regulatory_risk"
  | "signal"
  | "risk_summary"
  | "next_evidence"
>;

type RiskDraft = {
  title: string;
  area: string;
  severity: RiskSeverity;
  mitigation: string;
};

type ExperimentDraft = {
  name: string;
  success_metric: string;
};

type RunDraft = {
  phase: OrchestrationPhase;
  owner_role: string;
  objective: string;
};

type ImplementationTaskDraft = {
  title: string;
  task_type: ImplementationTaskType;
  priority: ImplementationTaskPriority;
  owner_role: string;
  acceptance_criteria: string;
};

type GateCheck = {
  label: string;
  passed: boolean;
  detail: string;
};

export type WorkbenchTask =
  | "select"
  | "score"
  | "risk"
  | "decision"
  | "experiment"
  | "orchestration"
  | "artifacts"
  | "development"
  | "launch";

function sortWorkbenchIdeas(nextIdeas: Idea[]) {
  return [...nextIdeas].sort(
    (a, b) =>
      (stageRank.get(a.stage) ?? 99) - (stageRank.get(b.stage) ?? 99) ||
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime() ||
      a.name.localeCompare(b.name),
  );
}

function upsertWorkbenchIdea(current: Idea[], nextIdea: Idea) {
  const exists = current.some((idea) => idea.id === nextIdea.id);
  const nextIdeas = exists
    ? current.map((idea) => (idea.id === nextIdea.id ? nextIdea : idea))
    : [nextIdea, ...current];

  return sortWorkbenchIdeas(nextIdeas);
}

function emitVentureEvent<T>(eventName: string, detail: T) {
  window.dispatchEvent(new CustomEvent<T>(eventName, { detail }));
}

function upsertRecordById<T extends { id: string }>(records: T[], nextRecord: T) {
  return records.some((record) => record.id === nextRecord.id)
    ? records.map((record) => (record.id === nextRecord.id ? nextRecord : record))
    : [nextRecord, ...records];
}

function upsertRecordsById<T extends { id: string }>(records: T[], nextRecords: T[]) {
  return nextRecords.reduce((current, record) => upsertRecordById(current, record), records);
}

function toEditState(idea: Idea): EditState {
  return {
    stage: idea.stage,
    decision: idea.decision,
    problem_intensity: idea.problem_intensity,
    frequency: idea.frequency,
    reachability: idea.reachability,
    willingness_to_pay: idea.willingness_to_pay,
    mvp_speed: idea.mvp_speed,
    differentiation: idea.differentiation,
    regulatory_risk: idea.regulatory_risk,
    signal: idea.signal,
    risk_summary: idea.risk_summary,
    next_evidence: idea.next_evidence,
  };
}

function scoreState(state: EditState) {
  return (
    state.problem_intensity +
    state.frequency +
    state.reachability +
    state.willingness_to_pay +
    state.mvp_speed +
    state.differentiation -
    state.regulatory_risk
  );
}

function recommendationForScore(score: number): DecisionStatus {
  if (score >= 22) {
    return "ship";
  }

  if (score >= 15) {
    return "research_more";
  }

  if (score >= 9) {
    return "pivot";
  }

  return "kill";
}

function missingEvidence(idea: Idea, state: EditState, riskCount: number) {
  const missing = [];

  if (!idea.one_liner.trim()) {
    missing.push("한 줄 설명");
  }

  if (!idea.target_user.trim()) {
    missing.push("대상 사용자");
  }

  if (!idea.buyer.trim()) {
    missing.push("구매자");
  }

  if (!state.signal.trim()) {
    missing.push("수요 신호");
  }

  if (!state.next_evidence.trim()) {
    missing.push("다음 증거");
  }

  if (riskCount === 0) {
    missing.push("연결된 리스크");
  }

  return missing;
}

function inferIdeaDomain(idea: Idea, state: EditState) {
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

function buildValidationPlan({
  idea,
  state,
  score,
  risks,
  missing,
}: {
  idea: Idea;
  state: EditState;
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
          ? "MVP 후보"
          : score >= 15
            ? "추가 조사"
            : "중단 또는 전환 검토";
  const statusDetail =
    missing.length > 0
      ? `${missing[0]}부터 채워야 다음 단계 판단이 안정적입니다.`
      : openHighRiskCount > 0
        ? "높음/치명적 리스크가 남아 있어 제품 범위보다 안전장치를 먼저 확정해야 합니다."
        : "기본 증거가 정리되어 실험 결과를 기준으로 다음 판단을 내릴 수 있습니다.";

  const experimentsByDomain: Record<string, ExperimentDraft[]> = {
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
        name: "구독 감사 리포트 수동 MVP",
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

  const risksByDomain: Record<string, RiskDraft[]> = {
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
        mitigation: "초기 MVP는 직접 계정 접속을 하지 않고 사용자가 제공한 캡처/CSV만 처리하며, 해지는 안내로 제한합니다.",
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
        mitigation: "첫 MVP는 하나의 반복 문제와 하나의 성공 지표만 지원하고, 추가 기능은 실험 통과 후 반영합니다.",
      },
    ],
  };

  return {
    status,
    statusDetail,
    hypotheses: [
      `${idea.target_user || "대상 사용자"}가 ${state.signal || idea.one_liner || "이 문제"}를 반복적으로 겪는다.`,
      `${idea.buyer || "구매자"}가 현재 대안보다 빠르거나 믿을 수 있는 결과에 지불 의향을 보인다.`,
      `첫 MVP는 ${state.next_evidence || "다음 증거"}를 확인하는 데 필요한 범위만 포함한다.`,
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

function buildIdeaBriefMarkdown({
  idea,
  state,
  score,
  recommendation,
  risks,
}: {
  idea: Idea;
  state: EditState;
  score: number;
  recommendation: DecisionStatus;
  risks: Risk[];
}) {
  const riskLines =
    risks.length > 0
      ? risks
          .map((risk) => `- ${risk.title} (${riskSeverityLabels[risk.severity]}): ${risk.mitigation || "완화 방안 미정"}`)
          .join("\n")
      : "- 아직 연결된 리스크가 없습니다.";

  return `# 아이디어 브리프: ${idea.name}

## 요약

- 한 줄 설명: ${idea.one_liner || "미정"}
- 대상 사용자: ${idea.target_user || "미정"}
- 구매자: ${idea.buyer || "미정"}
- 단계: ${stageLabels[state.stage]}
- 현재 판단: ${decisionLabels[state.decision]}
- 점수: ${score}
- 추천 판단: ${decisionLabels[recommendation]}

## 수요 신호

${state.signal || "미정"}

## 리스크 요약

${state.risk_summary || "미정"}

## 다음에 확인할 증거

${state.next_evidence || "미정"}

## 연결된 리스크

${riskLines}
`;
}

function buildResearchBriefMarkdown({
  idea,
  state,
  score,
  recommendation,
  risks,
  experiments,
  runs,
}: {
  idea: Idea;
  state: EditState;
  score: number;
  recommendation: DecisionStatus;
  risks: Risk[];
  experiments: Experiment[];
  runs: OrchestrationRun[];
}) {
  const riskLines =
    risks.length > 0
      ? risks
          .map(
            (risk) =>
              `- ${risk.title} (${riskSeverityLabels[risk.severity]}, ${riskStatusLabels[risk.status] ?? risk.status}): ${
                risk.mitigation || "완화 방안 미정"
              }`,
          )
          .join("\n")
      : "- 아직 연결된 리스크가 없습니다. 보안, 개인정보, 규제, 운영 책임 리스크를 먼저 적어보세요.";
  const experimentLines =
    experiments.length > 0
      ? experiments
          .map(
            (experiment) =>
              `- ${experiment.name} (${experimentStatusLabels[experiment.status] ?? experiment.status}): ${
                experiment.success_metric || "성공 지표 미정"
              }`,
          )
          .join("\n")
      : "- 아직 실험이 없습니다. 5명 인터뷰, 랜딩/대기자, 수동 컨시어지, 가격 민감도 테스트 중 하나를 선택하세요.";
  const researchRunLines =
    runs.filter((run) => ["strategy", "research"].includes(run.phase)).length > 0
      ? runs
          .filter((run) => ["strategy", "research"].includes(run.phase))
          .map(
            (run) =>
              `### ${phaseLabels[run.phase]} (${runStatusLabels[run.status]})\n\n목표: ${
                run.objective || "미정"
              }\n\n산출물:\n\n${run.output || "미정"}`,
          )
          .join("\n\n")
      : "전략/리서치 오케스트레이션 기록이 아직 없습니다.";

  return `# 리서치 브리프: ${idea.name}

## 1. 검증 목표

- 한 줄 설명: ${idea.one_liner || "미정"}
- 대상 사용자: ${idea.target_user || "미정"}
- 구매자: ${idea.buyer || "미정"}
- 현재 단계: ${stageLabels[state.stage]}
- 현재 판단: ${decisionLabels[state.decision]}
- 점수: ${score}
- 추천 판단: ${decisionLabels[recommendation]}
- 이번 리서치의 핵심 질문: ${state.next_evidence || "사용자가 실제로 반복 문제를 겪고 돈이나 시간을 낼 만큼 중요한가?"}

## 2. 가장 위험한 가정

1. ${idea.target_user || "대상 사용자"}가 최근 30일 안에 이 문제를 실제로 겪었다.
2. 현재 대안은 느리거나 비싸거나 불안하거나 책임 추적이 어렵다.
3. ${idea.buyer || "구매자"}가 이 문제를 해결하기 위해 예산, 시간, 내부 승인을 쓸 수 있다.
4. 첫 MVP는 완전 자동화 없이도 핵심 가치를 전달할 수 있다.
5. 개인정보, 규제, 보안 리스크를 낮은 비용으로 통제할 수 있다.

## 3. 데스크 리서치 체크리스트

### 시장과 사용자

- 검색 키워드:
  - "${idea.name}"
  - "${idea.one_liner || "핵심 문제"}"
  - "${idea.target_user || "대상 사용자"} workflow"
  - "${idea.buyer || "구매자"} budget"
- 확인할 것:
  - 이 문제가 이미 커뮤니티, 리뷰, Q&A, 채용 공고, 정부/협회 자료에서 반복적으로 드러나는가?
  - 사용자가 현재 어떤 도구, 사람, 엑셀, 카카오톡, 이메일, 전화로 우회하고 있는가?
  - 구매자가 누구인지 사용자와 구매자가 분리되는지 확인한다.

### 경쟁과 대안

| 유형 | 후보 | 사용자가 얻는 가치 | 약점 | 우리 MVP 차별점 |
| --- | --- | --- | --- | --- |
| 직접 경쟁 | 조사 필요 | 조사 필요 | 조사 필요 | 조사 필요 |
| 간접 대안 | 스프레드시트/메신저/수동 운영 | 낮은 도입 비용 | 반복, 추적, 책임 공백 | 단일 기록과 다음 행동 |
| 전문 서비스 | 대행사/컨설턴트/센터 | 신뢰와 책임 | 비용, 대기, 표준화 한계 | 작은 반복 문제 자동화 |
| 아무것도 안 함 | 현재 방식 유지 | 전환 비용 없음 | 손실이 계속 누적 | 손실을 수치화 |

### 가격과 구매 의향

- 현재 문제의 월간 비용: 시간, 인건비, 오류 비용, 기회비용으로 환산한다.
- 가격 앵커:
  - 개인/소규모: 월 9,900원, 29,000원, 49,000원 중 거부감 확인
  - 업무/조직: 좌석당 월 과금, 작업당 과금, 절감액 기반 과금 비교
- 반드시 물어볼 질문:
  - "이 문제가 해결되면 누가 결제할까요?"
  - "오늘 당장 해결된다면 얼마까지 현실적인가요?"
  - "도입하려면 누구의 허가가 필요한가요?"

### 규제, 보안, 개인정보

- 수집 데이터: 이름, 연락처, 일정, 건강, 금융, 위치, 대화, 사진, 민감한 문서 중 무엇이 포함되는가?
- 보관 기간과 삭제 요청 경로를 먼저 정한다.
- 법률/의료/금융/심리/노무 판단처럼 자격이나 면책이 필요한 영역인지 확인한다.
- 자동화가 사용자를 대신해 외부 계정을 조작하면 약관, 동의, 로그, 취소 경로를 검토한다.

## 4. 인터뷰 스크립트

1. 최근에 이 문제가 발생한 실제 사례를 시간순으로 설명해주세요.
2. 그때 어떤 도구나 사람에게 의존했나요?
3. 가장 오래 걸린 단계와 가장 불안했던 단계는 무엇이었나요?
4. 해결하지 못했을 때 비용이나 손실은 무엇이었나요?
5. 이미 비용을 낸 적이 있다면 얼마였고, 왜 냈나요?
6. 첫 버전에서 없어도 되는 기능은 무엇인가요?
7. 이 결과물을 누가 최종 승인하거나 결제하나요?
8. 이 서비스를 써보지 않을 이유가 있다면 무엇인가요?

## 5. 증거 수집 표

| 증거 | 목표 수량 | 통과 기준 | 현재 상태 | 다음 행동 |
| --- | ---: | --- | --- | --- |
| 문제 인터뷰 | 5명 | 3명 이상이 최근 실제 사례를 말함 | 미수집 | 대상자 리스트 작성 |
| 현재 대안 캡처 | 5건 | 3개 이상 반복 우회 방식 확인 | 미수집 | 스크린샷/메모 수집 |
| 가격 신호 | 5명 | 2명 이상 구체 금액 또는 승인자 언급 | 미수집 | 가격 질문 추가 |
| 경쟁/대안 조사 | 5개 | 직접/간접 대안의 약점 확인 | 미수집 | 대안 표 작성 |
| 리스크 확인 | 3개 | 높음/치명 리스크 완화 조건 작성 | 진행 중 | 리스크 상태 갱신 |

## 6. 연결된 리스크

${riskLines}

## 7. 연결된 실험

${experimentLines}

## 8. 오케스트레이션 메모

${researchRunLines}

## 9. Go / No-Go 기준

### Go

- 인터뷰 5명 중 3명 이상이 최근 실제 문제를 말한다.
- 구매자 또는 승인자가 명확하다.
- 사용자가 현재 대안의 비용, 불편, 불안을 구체적으로 말한다.
- 높음/치명 리스크에 대한 완화 조건이 문서화된다.
- 7일 안에 수동 또는 반자동 MVP로 검증할 수 있다.

### No-Go 또는 Pivot

- 사용자가 문제를 일반론으로만 말하고 최근 사례를 말하지 못한다.
- 구매자가 없거나 결제/승인 경로가 모호하다.
- 규제/보안 리스크가 MVP 범위에서 통제되지 않는다.
- 이미 충분히 싼 대안이 있고 사용자가 전환 이유를 말하지 못한다.
- MVP가 2주 이상 걸려야만 검증 가능하다.

## 10. 다음 리서치 액션

${state.next_evidence || "인터뷰 대상자 5명, 경쟁/대안 5개, 가격 질문 3개를 먼저 채우세요."}
`;
}

function buildValidationSprintMarkdown({
  idea,
  state,
  score,
  recommendation,
  risks,
  experiments,
}: {
  idea: Idea;
  state: EditState;
  score: number;
  recommendation: DecisionStatus;
  risks: Risk[];
  experiments: Experiment[];
}) {
  const highRiskLines = risks
    .filter((risk) => ["high", "critical"].includes(risk.severity))
    .map((risk) => `- ${risk.title}: ${risk.mitigation || "완화 방안 미정"}`);
  const primaryExperiment = experiments[0];

  return `# 7일 검증 스프린트: ${idea.name}

## 목적

- 한 줄 설명: ${idea.one_liner || "미정"}
- 대상 사용자: ${idea.target_user || "미정"}
- 구매자: ${idea.buyer || "미정"}
- 현재 점수: ${score}
- 추천 판단: ${decisionLabels[recommendation]}
- 이번 주에 확인할 핵심 증거: ${state.next_evidence || "문제 빈도, 현재 대안, 지불 의향, 구매/승인 경로"}

## 스프린트 원칙

- 개발 전에 사용자 증거를 먼저 모읍니다.
- 5명 인터뷰, 5개 대안 조사, 3개 가격 질문을 최소 단위로 둡니다.
- 긍정 답변이 아니라 최근 실제 사례와 비용 신호를 증거로 봅니다.
- 민감 데이터는 받지 않고, 예시나 익명화된 흐름만 확인합니다.
- 7일 안에 결론을 못 내면 범위를 줄이거나 아이디어를 전환합니다.

## Day 1: 대상자와 가설 고정

- 인터뷰 대상자 10명을 적습니다.
- 실제 사용자와 구매자/승인자를 분리합니다.
- 다음 가설을 한 문장으로 확정합니다.

\`\`\`text
${idea.target_user || "대상 사용자"}는 ${idea.one_liner || "핵심 문제"} 때문에 최근 30일 안에 반복 비용을 겪었고, ${idea.buyer || "구매자"}는 현재 대안보다 나은 결과에 비용을 낼 수 있다.
\`\`\`

## Day 2-3: 인터뷰 모집 메시지

### 짧은 DM

\`\`\`text
안녕하세요. ${idea.target_user || "대상 사용자"}가 ${idea.one_liner || "겪는 문제"}를 실제로 어떻게 해결하는지 15분 정도 여쭤보고 싶습니다. 제품 판매 목적이 아니라 문제 검증 인터뷰이고, 민감한 정보는 받지 않습니다. 최근 경험이 있으시면 편한 시간 하나만 알려주실 수 있을까요?
\`\`\`

### 업무/조직용 이메일

\`\`\`text
제목: ${idea.name} 문제 검증 인터뷰 요청

안녕하세요.
${idea.target_user || "대상 사용자"}의 ${idea.one_liner || "반복 업무 문제"}를 검증 중입니다.
현재 어떤 방식으로 해결하고 있는지, 비용이나 병목이 있는지 15분 정도 듣고 싶습니다.

질문은 최근 사례, 현재 대안, 비용/승인 경로 중심이며 민감한 개인정보는 수집하지 않습니다.
가능하시면 이번 주 가능한 시간 2개만 회신 부탁드립니다.
\`\`\`

## Day 3-4: 인터뷰 질문

1. 최근 30일 안에 이 문제가 발생한 사례가 있나요?
2. 그때 어떤 도구, 사람, 문서, 메신저를 사용했나요?
3. 가장 오래 걸리거나 실수하기 쉬운 단계는 무엇인가요?
4. 해결 실패 시 비용, 불안, 책임, 시간 손실은 무엇인가요?
5. 지금 해결 방식에 이미 돈을 쓰고 있나요?
6. 오늘 바로 더 나은 방식이 있다면 누가 결제하거나 승인하나요?
7. 첫 버전에서 없어도 되는 기능은 무엇인가요?
8. 이 서비스를 절대 쓰지 않을 이유는 무엇인가요?

## Day 4: 경쟁/대안 캡처

| 대안 | 사용자가 하는 일 | 비용 | 불편/리스크 | 우리 MVP가 이길 수 있는 작은 지점 |
| --- | --- | --- | --- | --- |
| 현재 수동 방식 | 조사 필요 | 조사 필요 | 조사 필요 | 조사 필요 |
| 스프레드시트/메신저 | 조사 필요 | 조사 필요 | 조사 필요 | 조사 필요 |
| 기존 앱/서비스 1 | 조사 필요 | 조사 필요 | 조사 필요 | 조사 필요 |
| 기존 앱/서비스 2 | 조사 필요 | 조사 필요 | 조사 필요 | 조사 필요 |
| 전문 대행/센터 | 조사 필요 | 조사 필요 | 조사 필요 | 조사 필요 |

## Day 5: 가격과 도입 검증

- "이 문제가 한 달에 몇 시간 또는 얼마의 비용을 만드나요?"
- "현재 이 문제 해결에 이미 쓰는 돈이 있나요?"
- "월 9,900원 / 29,000원 / 49,000원 중 어디부터 비싸다고 느끼나요?"
- "조직에서 쓰려면 누가 승인하나요?"
- "무료 파일럿 후 계속 쓰려면 어떤 결과가 필요하나요?"

## Day 6: 리스크 게이트

높음/치명 리스크:

${highRiskLines.length > 0 ? highRiskLines.join("\n") : "- 현재 높음/치명 리스크가 없습니다. 개인정보, 규제, 운영 책임 리스크를 다시 확인하세요."}

필수 확인:

- 개인정보/민감정보를 수집하지 않고도 MVP가 가능한가?
- 자동화가 외부 계정, 결제, 법률/의료/금융 판단을 대신하지 않는가?
- 문제가 생겼을 때 취소, 삭제, 기록 확인 경로가 있는가?

## Day 7: 판정

### 진행

- 인터뷰 5명 중 3명 이상이 최근 실제 사례를 말함
- 2명 이상이 지불/승인 경로를 구체적으로 설명함
- 현재 대안의 불편이 반복적이고 수치화 가능함
- 리스크 완화 조건이 MVP 범위 안에 있음

### 추가 조사

- 문제는 있으나 구매자, 가격, 승인 경로가 흐림
- 리스크는 있으나 완화 가능성이 있음
- MVP 범위를 더 줄이면 7일 안에 검증 가능함

### 중단 또는 전환

- 최근 사례가 부족함
- 이미 충분히 좋은 대안이 있음
- 구매자가 없거나 비용 신호가 없음
- 높음/치명 리스크가 MVP에서 통제되지 않음

## 연결된 실험

- 현재 1순위 실험: ${primaryExperiment ? `${primaryExperiment.name} / ${primaryExperiment.success_metric || "성공 지표 미정"}` : "아직 실험이 없습니다."}

## 최종 기록 템플릿

\`\`\`text
인터뷰 수:
최근 실제 사례를 말한 사람:
구매/승인 경로를 말한 사람:
가격 신호:
가장 강한 현재 대안:
가장 큰 리스크:
판정:
다음 행동:
\`\`\`
`;
}

function buildPrdMarkdown({
  idea,
  state,
  score,
  recommendation,
  risks,
  experiments,
  runs,
}: {
  idea: Idea;
  state: EditState;
  score: number;
  recommendation: DecisionStatus;
  risks: Risk[];
  experiments: Experiment[];
  runs: OrchestrationRun[];
}) {
  const riskLines =
    risks.length > 0
      ? risks
          .map(
            (risk) =>
              `- ${risk.title} (${riskSeverityLabels[risk.severity]}, ${riskStatusLabels[risk.status] ?? risk.status}): ${
                risk.mitigation || "미정"
              }`,
          )
          .join("\n")
      : "- 아직 연결된 리스크가 없습니다.";
  const experimentLines =
    experiments.length > 0
      ? experiments
          .map(
            (experiment) =>
              `- ${experiment.name} (${experimentStatusLabels[experiment.status] ?? experiment.status}): ${
                experiment.success_metric || "성공 지표 미정"
              }`,
          )
          .join("\n")
      : "- 아직 계획된 실험이 없습니다.";
  const runLines =
    runs.length > 0
      ? runs
          .map(
            (run) =>
              `### ${phaseLabels[run.phase]} (${runStatusLabels[run.status]})\n\n담당 역할: ${
                run.owner_role || "미정"
              }\n\n목표: ${run.objective || "미정"}\n\n산출물:\n\n${run.output || "미정"}`,
          )
          .join("\n\n")
      : "아직 오케스트레이션 실행 기록이 없습니다.";

  return `# PRD: ${idea.name}

## 목표

${idea.one_liner || "미정"}

## 사용자, 구매자, 상황

- 대상 사용자: ${idea.target_user || "미정"}
- 구매자: ${idea.buyer || "미정"}
- 발생 계기: 사용자가 이 문제를 겪는 순간과 장소를 인터뷰로 확인합니다.
- 현재 대안/우회 방법: ${state.signal || "미정"}
- 문제 비용: 시간, 돈, 실수, 불안, 책임, 기회비용 중 무엇이 큰지 확인합니다.

## 문제 정의

${state.signal || "미정"}

## 증거와 가정

### 알고 있는 것

- 수요 신호: ${state.signal || "미정"}
- 리스크 요약: ${state.risk_summary || "미정"}

### 아직 가정인 것

- ${idea.target_user || "대상 사용자"}가 이 문제를 반복적으로 겪습니다.
- ${idea.buyer || "구매자"}가 현재 대안보다 나은 결과에 지불 의향을 보입니다.
- 수동 또는 반자동 MVP로도 핵심 가치를 검증할 수 있습니다.

### 다음에 증명할 것

${state.next_evidence || "미정"}

## 현재 판단 상태

- 단계: ${stageLabels[state.stage]}
- 현재 판단: ${decisionLabels[state.decision]}
- 벤처 점수: ${score}
- 추천 판단: ${decisionLabels[recommendation]}

## 목표와 성공 지표

- 사용자 결과: 사용자가 핵심 문제를 더 빠르고 안전하게 해결합니다.
- 사업 결과: 구매자가 반복적으로 비용을 낼 이유를 확인합니다.
- 첫 성공 지표: ${experiments[0]?.success_metric || "측정 가능한 실험 성공 지표를 먼저 정의합니다."}

## 범위와 No-gos

- 증거 공백이 해결되기 전에는 검증 가능한 최소 MVP 범위를 넘기지 않습니다.
- 데이터 처리 방침 없이 민감한 개인정보를 수집하지 않습니다.
- 여러 사용자군, 여러 결제 모델, 전체 플랫폼 자동화는 첫 MVP에서 제외합니다.
- 앱이 아니라 콘텐츠, 수동 운영, 스프레드시트, API, 파트너십으로 더 빠르게 검증할 수 있으면 먼저 비교합니다.

## 중단 기준

- ${idea.target_user || "대상 사용자"} 5명 중 3명 이상이 최근 실제 사례를 말하지 못하면 중단 또는 전환합니다.
- 실험 참여자 5명 중 2명 이상이 비용, 재사용, 도입 의향을 보이지 않으면 범위를 재검토합니다.
- 높음/치명적 리스크가 완화되지 않으면 개발 진입을 보류합니다.

## 요구사항

### 기능 요구사항

- 핵심 사용자 문제와 예상 워크플로우를 기록합니다.
- 다음 증거를 검증하는 데 필요한 최소 프로토타입을 지원합니다.
- 리스크, 실험, 판단 기록을 아이디어에 연결합니다.
- 사용자가 작업 결과를 저장하거나 다음 행동으로 옮길 수 있어야 합니다.

### 비기능 요구사항

- 첫 버전은 14일 안에 테스트할 수 있을 만큼 작게 유지합니다.
- 인증, 워크스페이스, RLS, 감사 로그, 롤백 경로를 유지합니다.
- 빈 상태, 로딩, 성공, 오류, 권한 없음, 읽기 전용 상태를 구현합니다.

## 사용자 이야기와 수용 기준

1. ${idea.target_user || "사용자"}로서, 나는 ${idea.one_liner || "핵심 문제 해결"}을 하고 싶다. 그래야 ${state.next_evidence || "검증할 결과"}를 얻을 수 있다.
   - Given 인증된 사용자가 아이디어를 선택했을 때
   - When 핵심 입력을 저장하면
   - Then 화면이 즉시 갱신되고 저장 결과가 DB에 남는다.

2. 운영자로서, 나는 리스크와 실험을 같은 아이디어에 연결하고 싶다. 그래야 출시 판단을 근거 있게 기록할 수 있다.
   - Given 아이디어에 연결된 리스크 또는 실험이 있을 때
   - When 점수와 판단을 저장하면
   - Then 출시 준비도와 산출물 게이트가 최신 상태를 반영한다.

### 데이터

- 아이디어 기록
- 리스크
- 실험
- 판단 기록
- 오케스트레이션 실행
- 산출물과 승인 상태
- 핵심 이벤트: 생성, 점수 저장, 리스크 추가, 실험 상태 변경, 산출물 승인

### 보안과 개인정보

${state.risk_summary || "미정"}

## UX 메모

개발 전에 디자인 오케스트레이션 산출물을 기준으로 화면과 상태를 확정합니다.

- 첫 화면: 사용자가 다음에 할 작업을 바로 이해해야 합니다.
- 기본 흐름: 선택 → 점수화 → 리스크 → 실험 → 산출물 → 앱 개발 → 출시 판단
- 상태: 빈 상태, 로딩, 성공, 오류, 권한 없음, 읽기 전용, 모바일 단일 컬럼
- 접근성: 충분한 대비, 명확한 라벨, 키보드 이동, 오류 메시지와 해결 행동
- 신뢰: 민감 데이터 입력 전에 목적, 보관, 삭제 경로를 보여줍니다.

## AI/자동화 주의사항

- AI가 추천한 판단은 최종 결정이 아니라 근거 초안입니다.
- 불확실한 추천에는 신뢰도, 필요한 추가 증거, 사람의 승인 경로를 함께 보여줍니다.
- 사용자가 생성 결과를 수정, 재시도, 폐기할 수 있어야 합니다.

## 지표

- 활성화: 사용자가 핵심 워크플로우 결과에 도달합니다.
- 검증: 실험 성공 지표를 충족합니다.
- 리스크: 해결되지 않은 높음/치명적 리스크가 계속 보입니다.
- 품질: 저장 후 새로고침 없이 화면에 반영됩니다.

## 검증 계획

${experimentLines}

## 오케스트레이션 메모

${runLines}

## 출시 리스크

${riskLines}

## 릴리스 기준

- 증거 공백이 해결되었거나 명시적으로 수용되었습니다.
- 높음/치명적 리스크가 완화되었거나 차단 상태입니다.
- QA와 보안 실행이 완료되었습니다.
- 최종 판단이 기록되었습니다.
- Preview와 Production에서 로그인, 저장, 조회, 산출물 저장이 스모크 테스트되었습니다.
- 장애 시 직전 배포와 DB 롤백 또는 보정 경로가 있습니다.

## 열린 질문

${state.next_evidence || "미정"}
`;
}

function buildMvpSpecMarkdown({
  idea,
  state,
  experiments,
  runs,
}: {
  idea: Idea;
  state: EditState;
  experiments: Experiment[];
  runs: OrchestrationRun[];
}) {
  const buildRun = runs.find((run) => run.phase === "build");
  const designRun = runs.find((run) => run.phase === "design");
  const qaRun = runs.find((run) => run.phase === "qa");
  const securityRun = runs.find((run) => run.phase === "security");
  const experimentLines =
    experiments.length > 0
      ? experiments
          .map((experiment) => `- ${experiment.name}: ${experiment.success_metric || "성공 지표 미정"}`)
          .join("\n")
      : "- 개발 전에 측정 가능한 실험을 하나 정의합니다.";

  return `# MVP 명세: ${idea.name}

## 가설

${idea.target_user || "대상 사용자"}를 위한 가장 작은 워크플로우를 만들면 ${
    state.next_evidence || "다음 증거"
  }를 검증할 수 있습니다.

## Appetite

- 기본 개발 예산: 1명 기준 3~7일 안에 사용 가능한 수직 슬라이스
- 범위 조정 원칙: 일정은 고정하고 기능 범위를 줄입니다.

## 사용자와 구매자

- 사용자: ${idea.target_user || "미정"}
- 구매자: ${idea.buyer || "미정"}

## 가장 위험한 가정

- 사용자가 실제로 이 문제를 반복 경험합니다.
- 구매자가 기존 대안보다 나은 결과에 비용을 냅니다.
- 핵심 가치가 완전 자동화 없이도 전달됩니다.

## 반드시 포함

- ${idea.one_liner || "미정"}에 연결된 하나의 집중된 사용자 여정
- 가설 검증에 필요한 필드만 수집
- 선택한 아이디어의 리스크와 실험 추적
- 인증된 워크스페이스 접근
- 저장 직후 화면 즉시 갱신
- 측정 가능한 성공/실패 기록

## 있으면 좋은 것

- 명확한 빈 상태와 오류 상태
- 복사 또는 저장 가능한 산출물
- Supabase 기록 기반의 기본 감사 추적

## 아직 하지 않을 것

- 여러 제품을 아우르는 넓은 탐색 구조
- 외부 계정을 직접 조작하는 고급 자동화
- 보안 검토 없는 민감한 운영 데이터 수집
- 여러 페르소나와 복잡한 권한 체계
- 실험 전 결제/구독 자동화

## 화면

${designRun?.output || "디자인 오케스트레이션 산출물을 기준으로 화면을 정의합니다."}

## 필수 화면 상태

- 빈 상태: 아직 기록이 없을 때 다음 입력을 유도합니다.
- 로딩: 저장/조회 중 현재 상태를 보여줍니다.
- 성공: 저장 결과와 다음 행동을 보여줍니다.
- 오류: 실패 이유와 재시도 또는 수정 행동을 보여줍니다.
- 권한 없음/읽기 전용: 왜 편집할 수 없는지 알려줍니다.

## 데이터 모델

- ideas
- risks
- decisions
- experiments
- orchestration_runs
- venture_artifacts

## 연동

- Supabase Auth and Postgres
- Vercel 배포
- 수동 하네스가 안정화된 뒤 AI/model 호출 추가

## 수동 또는 컨시어지 경로

- 앱이 완성되기 전에는 운영자가 같은 결과물을 수동으로 만들어 사용자 반응을 확인합니다.
- 자동화는 사용자가 반복적으로 요구한 단계부터 붙입니다.

## 프로토타입 메모

${buildRun?.output || "개발 오케스트레이션 산출물을 기준으로 구현 범위를 정의합니다."}

## 검증 계획

${experimentLines}

QA 메모:

${qaRun?.output || "QA 실행 산출물 미정"}

보안 메모:

${securityRun?.output || state.risk_summary || "보안 실행 산출물 미정"}

## 중단 기준

- 실험 성공 지표가 충족되지 않고 사용자가 다음 테스트를 요청하지 않습니다.
- 리스크 완화 없이 민감 데이터 처리가 필요합니다.
- 첫 수직 슬라이스가 appetite를 초과합니다.

## 출시 게이트

- PRD 산출물이 저장됨
- MVP 명세 산출물이 저장됨
- 최소 하나의 실험이 계획됨
- QA와 보안 실행이 완료되었거나 열린 리스크로 명시 수용됨
`;
}

function buildAppDevelopmentPlanMarkdown({
  idea,
  state,
  experiments,
  runs,
  artifacts,
}: {
  idea: Idea;
  state: EditState;
  experiments: Experiment[];
  runs: OrchestrationRun[];
  artifacts: VentureArtifact[];
}) {
  const hasPrd = artifacts.some((artifact) => artifact.artifact_type === "prd");
  const hasResearchNote = artifacts.some((artifact) => artifact.artifact_type === "research_note");
  const hasMvpSpec = artifacts.some((artifact) => artifact.artifact_type === "mvp_spec");
  const hasBackendDecision = artifacts.some((artifact) => artifact.artifact_type === "backend_decision");
  const hasDesignBrief = artifacts.some((artifact) => artifact.artifact_type === "design_brief");
  const hasTechSpec = artifacts.some((artifact) => artifact.artifact_type === "tech_spec");
  const donePhases = new Set(runs.filter((run) => run.status === "done").map((run) => run.phase));
  const primaryExperiment = experiments[0];

  return `# 앱 개발 실행 계획: ${idea.name}

## 0. 개발 진입 조건

- 현재 단계: ${stageLabels[state.stage]}
- 현재 판단: ${decisionLabels[state.decision]}
- 리서치 브리프 저장: ${hasResearchNote ? "완료" : "권장"}
- PRD 저장: ${hasPrd ? "완료" : "필요"}
- MVP 명세 저장: ${hasMvpSpec ? "완료" : "필요"}
- 백엔드 결정 저장: ${hasBackendDecision ? "완료" : "필요"}
- 디자인 브리프 저장: ${hasDesignBrief ? "완료" : "필요"}
- 기술 명세 저장: ${hasTechSpec ? "완료" : "필요"}
- 검증 실험: ${primaryExperiment ? `${primaryExperiment.name} / ${primaryExperiment.success_metric || "성공 지표 미정"}` : "측정 가능한 실험 필요"}
- 다음 증거: ${state.next_evidence || "미정"}

## 0.5 백엔드 선택

현재 AI Venture Lab 운영 콘솔은 Supabase를 유지합니다. 새 앱 아이디어를 실제 제품으로 만들 때는 docs/BACKEND_DECISION_GUIDE.md를 기준으로 Supabase, Firebase, Firebase SQL Connect, 또는 하이브리드를 다시 선택합니다.

### 기본 선택지

- Supabase: 관계형 데이터, SQL, RLS, 운영 콘솔, B2B 워크플로우에 적합합니다.
- Firebase: 모바일/웹 동시 개발, 실시간/오프라인, Google Analytics, Crashlytics, Cloud Messaging, Remote Config, Test Lab, App Check가 중요할 때 적합합니다.
- Firebase SQL Connect: PostgreSQL이 필요하지만 Firebase SDK, realtime sync, Google Cloud/Firebase 운영 경험도 필요한 경우 검토합니다.

### 선택 기록

- 선택한 백엔드:
- 선택 이유:
- 제외한 백엔드와 이유:
- 인증 경계:
- 데이터 권한 경계:
- 로컬 개발/에뮬레이터:
- 배포/롤백:

## 1. 기획

### 목표

${idea.one_liner || "아이디어의 핵심 사용자 가치가 아직 비어 있습니다."}

### 해야 할 일

- 대상 사용자와 구매자를 분리해 PRD에 고정합니다.
- 핵심 사용자 여정 1개와 성공 지표 1개만 선택합니다.
- 하지 않을 기능과 중단 기준을 명시합니다.
- 발생 계기, 현재 우회 방법, 문제 비용을 인터뷰나 실제 기록으로 확인합니다.
- 앱이 아닌 수동 운영/콘텐츠/스프레드시트로 더 빠르게 검증 가능한지 비교합니다.

### 산출물

- PRD
- MVP 명세
- 실험 성공 기준
- kill criteria
- acceptance criteria

## 2. 디자인

### DESIGN.md 컨텍스트

- 제품 성격: 반복 업무용 운영 콘솔
- 화면 구조: 왼쪽 순서 메뉴, 오른쪽 입력/산출물 패널
- 시각 기준: 높은 대비, 조밀하지만 읽기 쉬운 정보, 4~8px radius, blue는 active/next action에만 사용
- 금지: 마케팅형 히어로, 긴 스크롤 의존, 불명확한 상태, 민감 데이터 선입력

### 디자인 프롬프트

${idea.name}의 MVP 화면을 설계한다. 대상 사용자는 ${idea.target_user || "미정"}이고 구매자는 ${
    idea.buyer || "미정"
  }이다. 사용자는 "${idea.one_liner || "핵심 문제"}"를 해결하려고 들어온다. 첫 화면은 설명 페이지가 아니라 바로 실행 가능한 작업 화면이어야 한다. 화면은 핵심 여정, 입력 폼, 결과 상태, 오류/빈 상태, 권한 없음, 모바일 단일 컬럼을 포함한다. UI는 AI Venture Lab DESIGN.md 기준을 따르고, 각 화면마다 primary action은 하나만 둔다.

### 화면

- 진입 화면
- 핵심 입력 화면
- 결과/산출물 화면
- 빈 상태, 오류 상태, 권한 없음 상태
- 모바일 단일 컬럼 화면

### 체크

- 사용자가 첫 가치까지 도달하는 클릭 수를 줄입니다.
- 모바일에서 입력 필드와 버튼이 겹치지 않게 검증합니다.
- 민감 데이터 입력 전 고지와 동의를 분리합니다.
- 진행 상태와 다음 추천 행동을 항상 보이게 합니다.
- 되돌리기, 취소, 재시도 경로를 둡니다.

## 3. 개발

### 기술 명세 프롬프트

${idea.name}의 첫 개발 범위를 기술 명세로 작성한다. 반드시 Supabase, Firebase, Firebase SQL Connect, 하이브리드 중 하나를 선택하고 선택 이유를 기록한다. Next.js App Router 기준으로 Server Component, Client Component, Server Action 또는 Route Handler의 경계를 나누고, 선택한 백엔드의 권한 모델, 환경변수, UI 상태, 검증 명령, 수동 스모크 경로, 롤백 경로를 포함한다. 범위는 ${state.next_evidence || "다음 증거"}를 검증하는 데 필요한 수직 슬라이스로 제한한다.

### 기본 아키텍처

- Next.js 앱 라우터
- Supabase Auth, Postgres, RLS
- Vercel 배포
- 서버 액션 또는 API는 권한 확인 후 쓰기 수행
- use client 경계는 브라우저 상태와 이벤트가 필요한 컴포넌트로만 제한
- 민감한 읽기/쓰기는 서버 또는 RLS 정책에서 재검증

### 구현 순서

1. 데이터 모델과 RLS를 먼저 확정합니다.
2. 핵심 여정의 입력, 저장, 조회를 구현합니다.
3. 빈 상태, 오류 상태, 로딩 상태를 추가합니다.
4. 실험 지표를 남길 이벤트 또는 기록 구조를 붙입니다.
5. QA와 보안 체크를 통과한 뒤 프로덕션 배포합니다.
6. AI/자동화 기능은 사람의 검토, 재시도, 폐기 경로를 붙인 뒤 활성화합니다.

### 데이터/RLS 체크

- 새 테이블이 public schema에 있으면 RLS를 활성화합니다.
- select/insert/update/delete별 정책을 나눠 작성합니다.
- insert/update에는 사용자 또는 조직 소유권 with check 조건을 둡니다.
- 허용 케이스와 차단 케이스를 모두 테스트합니다.

### Firebase 체크

- Firestore/Storage를 쓰면 Security Rules를 먼저 작성합니다.
- Rules는 request.auth, 소유권, 조직 멤버십, 입력 데이터 형태를 검증합니다.
- 서버 SDK/Admin SDK를 쓰면 IAM과 서버 전용 경계를 검토합니다.
- 공개 클라이언트에서 Firebase 리소스를 직접 호출하면 App Check를 검토합니다.
- SQL Connect를 쓰면 schema/query/mutation, auth, region, 가격, realtime/offline 동작을 확인합니다.

### 품질 게이트

- pnpm lint
- pnpm typecheck
- pnpm build
- pnpm harness:check
- 핵심 여정 브라우저 스모크
- 배포 후 Production 스모크

## 4. QA와 디버깅

- 인증 전/후 주요 버튼 상태 확인
- 새 기록 생성 후 화면 즉시 반영 확인
- 읽기 전용, 내 기록, 워크스페이스 권한 확인
- 실패한 저장 요청의 오류 메시지 확인
- 모바일 폭에서 레이아웃 확인
- 빈 상태, 로딩, 성공, 오류, 권한 없음 상태 확인
- 데이터 생성/수정/삭제의 허용/거부 경계 확인
- 회귀가 발생한 경우 재현 절차, 원인, 수정, 검증 명령을 기록

## 5. 보안과 개인정보

${state.risk_summary || "보안/개인정보 리스크가 아직 정리되지 않았습니다."}

- Vercel 환경변수만 사용하고 클라이언트에 비밀값을 노출하지 않습니다.
- Supabase RLS와 정책을 출시 전 SQL로 재확인합니다.
- 민감 데이터는 최소 수집, 보관 기간, 삭제 경로를 정합니다.
- 서비스 역할 키는 서버 전용으로만 사용하고 일반 사용자 플로우에 쓰지 않습니다.
- 감사 로그가 필요한 관리자/조직 변경은 이벤트를 남깁니다.

## 6. 배포와 롤백

- Vercel Preview에서 핵심 여정을 먼저 확인합니다.
- Production 배포 후 로그인, 저장, 조회, 산출물 저장을 스모크 테스트합니다.
- 장애 시 직전 배포로 롤백하고 DB 변경은 되돌릴 스크립트를 준비합니다.
- 환경변수 변경 후에는 새 배포가 되었는지 확인합니다.
- 사용자 영향, 롤백 조건, 연락 채널을 릴리스 노트에 남깁니다.

## 7. 현재 오케스트레이션 상태

- 전략: ${donePhases.has("strategy") ? "완료" : "필요"}
- 리서치: ${donePhases.has("research") ? "완료" : "필요"}
- 제품: ${donePhases.has("product") ? "완료" : "필요"}
- 디자인: ${donePhases.has("design") ? "완료" : "필요"}
- 개발: ${donePhases.has("build") ? "완료" : "필요"}
- QA: ${donePhases.has("qa") ? "완료" : "필요"}
- 보안: ${donePhases.has("security") ? "완료" : "필요"}
- 출시: ${donePhases.has("launch") ? "완료" : "필요"}
`;
}

function buildBackendDecisionMarkdown({
  idea,
  state,
}: {
  idea: Idea;
  state: EditState;
}) {
  return `# 백엔드 결정: ${idea.name}

## 결정 요약

- 현재 권장: Supabase 우선 유지
- 재검토 조건: 모바일 네이티브, 실시간/오프라인, 푸시, Crashlytics, Remote Config, Firebase Test Lab, App Check가 MVP 검증의 핵심이면 Firebase 또는 Firebase SQL Connect를 비교합니다.
- 판단 기준: ${state.next_evidence || "다음 증거를 가장 빨리 검증하는 백엔드를 선택합니다."}

## Supabase를 선택하는 경우

- 관계형 데이터, SQL 질의, RLS, 조직 권한, 감사 로그가 핵심입니다.
- B2B 운영 콘솔, 관리자 워크플로우, 승인/게이트 기록에 적합합니다.
- Vercel, Next.js App Router, Server Action/Route Handler 경계와 잘 맞습니다.

## Firebase를 선택하는 경우

- 모바일/웹 동시 개발, 실시간 동기화, 오프라인 경험이 핵심입니다.
- Analytics, Crashlytics, Cloud Messaging, Remote Config, Test Lab, App Check를 빠르게 묶어야 합니다.
- Firestore/Storage Security Rules, App Check, IAM, Admin SDK 경계를 먼저 설계합니다.

## Firebase SQL Connect를 검토하는 경우

- PostgreSQL 데이터 모델이 필요하지만 Firebase SDK와 Google Cloud 운영 경험도 중요합니다.
- region, 가격, realtime/offline 요구, schema/query/mutation 권한 모델을 비교합니다.

## 최종 선택 기록

- 선택한 백엔드:
- 선택 이유:
- 제외한 선택지와 이유:
- 인증 경계:
- 데이터 권한 경계:
- 로컬 개발/에뮬레이터:
- 환경변수:
- 배포/롤백:
- 남은 리스크: ${state.risk_summary || "미정"}
`;
}

function buildDesignBriefMarkdown({
  idea,
  state,
  runs,
}: {
  idea: Idea;
  state: EditState;
  runs: OrchestrationRun[];
}) {
  const designRun = runs.find((run) => run.phase === "design");

  return `# 디자인 브리프: ${idea.name}

## 제품 맥락

- 대상 사용자: ${idea.target_user || "미정"}
- 구매자: ${idea.buyer || "미정"}
- 핵심 가치: ${idea.one_liner || "미정"}
- 다음 증거: ${state.next_evidence || "미정"}

## UX 원칙

- 첫 화면은 설명 페이지가 아니라 사용자가 바로 실행할 수 있는 작업 화면입니다.
- 흐름은 왼쪽 순서 메뉴와 오른쪽 입력/산출물 패널처럼 현재 단계와 다음 행동을 분리합니다.
- 긴 스크롤에 의존하지 않고, 사용자가 위아래로 왕복하지 않아도 되게 합니다.
- primary action은 각 화면에서 하나만 두고, 보조 행동은 낮은 위계로 둡니다.
- 민감 데이터 입력 전 목적, 보관, 삭제 경로를 먼저 보여줍니다.

## 핵심 여정

1. 사용자가 ${idea.one_liner || "핵심 문제"}를 시작합니다.
2. 필수 입력만 채우고 결과 또는 산출물을 생성합니다.
3. 오류, 빈 상태, 권한 없음, 저장 완료 상태가 명확하게 보입니다.
4. 다음 증거를 확인하거나 다음 단계로 이동합니다.

## 화면 목록

- 진입/대시보드
- 핵심 입력 폼
- 결과/산출물 검토
- 저장 완료 및 다음 행동
- 빈 상태, 로딩, 오류, 권한 없음, 읽기 전용
- 모바일 단일 컬럼

## 디자인 산출물

${designRun?.output || "디자인 오케스트레이션 결과가 아직 없습니다. 화면 흐름, 상태, 모바일 제약을 먼저 작성하세요."}

## 검수 체크

- 사용자가 첫 가치까지 도달하는 클릭 수가 최소화되었습니다.
- 모바일에서 입력 필드, 버튼, 긴 텍스트가 겹치지 않습니다.
- 색상은 상태와 다음 행동을 구분하는 데 쓰입니다.
- 라벨, 오류 메시지, 저장 결과가 화면 안에서 바로 이해됩니다.
- 접근성 대비와 키보드 이동을 확인합니다.
`;
}

function buildTechSpecMarkdown({
  idea,
  state,
  experiments,
  runs,
}: {
  idea: Idea;
  state: EditState;
  experiments: Experiment[];
  runs: OrchestrationRun[];
}) {
  const buildRun = runs.find((run) => run.phase === "build");
  const securityRun = runs.find((run) => run.phase === "security");
  const experimentLines =
    experiments.length > 0
      ? experiments.map((experiment) => `- ${experiment.name}: ${experiment.success_metric || "성공 지표 미정"}`).join("\n")
      : "- 측정 가능한 실험을 하나 정의합니다.";

  return `# 기술 명세: ${idea.name}

## 개발 범위

${idea.one_liner || "핵심 문제"}를 검증하는 최소 수직 슬라이스만 구현합니다.

- 대상 사용자: ${idea.target_user || "미정"}
- 구매자: ${idea.buyer || "미정"}
- 단계: ${stageLabels[state.stage]}
- 판단: ${decisionLabels[state.decision]}
- 다음 증거: ${state.next_evidence || "미정"}

## 백엔드 결정

- 기본 후보: Supabase
- Firebase/Firebase SQL Connect 전환 조건: 모바일 네이티브, 실시간/오프라인, 푸시, Crashlytics, Remote Config, Test Lab, App Check가 검증 핵심일 때
- 최종 선택은 백엔드 결정 산출물에 기록합니다.

## 애플리케이션 경계

- Server Component: 인증된 데이터 조회, 정적 설명, 서버에서 안전한 집계
- Client Component: 폼 입력, 필터, 탭, 저장 후 즉시 반영되는 로컬 상태
- Server Action/Route Handler: 민감한 쓰기, 외부 API 호출, 서비스 키가 필요한 처리
- Database/RLS or Security Rules: 소유권, 조직 권한, 입력 데이터 조건 검증

## 데이터 모델

- 핵심 엔티티:
- 필수 필드:
- 소유권/조직 경계:
- 감사 이벤트:
- 삭제/보관 정책:

## 실험과 이벤트

${experimentLines}

## 보안과 개인정보

${securityRun?.output || state.risk_summary || "보안 산출물이 아직 없습니다."}

- 비밀값은 서버 환경변수에만 둡니다.
- 클라이언트 공개 키와 서버 전용 키를 분리합니다.
- RLS 또는 Security Rules의 허용/차단 케이스를 모두 테스트합니다.
- 개인정보 최소 수집, 보관 기간, 삭제 경로를 명시합니다.

## 구현 메모

${buildRun?.output || "개발 오케스트레이션 결과가 아직 없습니다. 데이터 모델, API 경계, UI 상태를 먼저 작성하세요."}

## 검증 명령

- pnpm lint
- pnpm typecheck
- pnpm build
- pnpm harness:check
- 핵심 여정 브라우저 스모크
- 프로덕션 스모크

## 롤백

- Vercel 직전 배포로 롤백합니다.
- DB 변경은 보정 SQL 또는 되돌림 SQL을 준비합니다.
- 환경변수 변경은 새 배포 여부와 로그를 확인합니다.
`;
}

function buildImplementationHandoffMarkdown({
  idea,
  state,
  risks,
  experiments,
  runs,
  artifacts,
}: {
  idea: Idea;
  state: EditState;
  risks: Risk[];
  experiments: Experiment[];
  runs: OrchestrationRun[];
  artifacts: VentureArtifact[];
}) {
  const approvedArtifacts = artifacts.filter((artifact) => artifact.status === "approved");
  const artifactLines =
    artifacts.length > 0
      ? artifacts
          .slice(0, 8)
          .map(
            (artifact) =>
              `- ${artifactLabels[artifact.artifact_type]} v${artifact.version ?? 1}: ${artifact.title || "제목 없음"} (${artifactStatusLabels[artifact.status]})`,
          )
          .join("\n")
      : "- 아직 저장된 산출물이 없습니다.";
  const riskLines =
    risks.length > 0
      ? risks.map((risk) => `- ${risk.title}: ${risk.severity} / ${risk.status} / ${risk.mitigation}`).join("\n")
      : "- 연결된 리스크가 없습니다.";
  const experimentLines =
    experiments.length > 0
      ? experiments.map((experiment) => `- ${experiment.name}: ${experiment.status} / ${experiment.success_metric || "성공 지표 미정"}`).join("\n")
      : "- 연결된 실험이 없습니다.";
  const donePhases = runs.filter((run) => run.status === "done").map((run) => phaseLabels[run.phase]);

  return `# Codex 구현 핸드오프: ${idea.name}

너는 이 아이디어의 MVP를 구현하는 선임 개발 에이전트다. 아래 범위만 구현하고, 불확실한 것은 작게 검증 가능한 형태로 남겨라.

## 목표

- 제품 가치: ${idea.one_liner || "미정"}
- 대상 사용자: ${idea.target_user || "미정"}
- 구매자: ${idea.buyer || "미정"}
- 현재 단계: ${stageLabels[state.stage]}
- 현재 판단: ${decisionLabels[state.decision]}
- 다음 증거: ${state.next_evidence || "미정"}

## 구현 원칙

- 첫 릴리스는 하나의 핵심 사용자 여정만 구현한다.
- 저장, 조회, 권한, 오류, 빈 상태, 모바일 레이아웃을 함께 끝낸다.
- 비밀값은 서버 전용 환경변수로만 사용한다.
- Supabase를 쓰면 RLS와 insert/update with check를 먼저 설계한다.
- Firebase를 쓰면 Security Rules, App Check, Auth 경계를 먼저 설계한다.
- AI 기능은 사람의 검토, 재시도, 폐기 경로가 있을 때만 켠다.

## 산출물 상태

- 승인된 산출물 수: ${approvedArtifacts.length}
${artifactLines}

## 리스크

${riskLines}

## 검증 실험

${experimentLines}

## 오케스트레이션 완료 단계

${donePhases.length > 0 ? donePhases.map((phase) => `- ${phase}`).join("\n") : "- 아직 완료된 역할 단계가 없습니다."}

## 구현 작업 목록

1. PRD와 MVP 명세를 읽고 핵심 사용자 여정 1개를 고정한다.
2. 백엔드 결정 산출물을 읽고 Supabase/Firebase/Firebase SQL Connect/하이브리드 중 하나를 확정한다.
3. 데이터 모델, 권한 정책, 환경변수, 롤백 조건을 먼저 작성한다.
4. 핵심 입력 폼과 결과 화면을 구현한다.
5. 저장 성공 후 화면이 즉시 갱신되게 한다.
6. 빈 상태, 로딩, 성공, 오류, 권한 없음, 읽기 전용 상태를 구현한다.
7. 테스트와 수동 스모크 경로를 문서화한다.
8. Vercel Preview에서 확인한 뒤 Production 배포한다.

## 품질 게이트

- pnpm lint
- pnpm typecheck
- pnpm build
- pnpm harness:check
- 핵심 여정 브라우저 스모크
- 인증 전/후 저장 버튼 상태 확인
- 허용/차단 권한 케이스 확인
- 모바일 폭 레이아웃 확인
- Production 배포 후 로그인, 저장, 조회 확인

## 금지

- PRD/MVP 범위를 넘는 넓은 플랫폼화
- 리스크 수용 기록 없는 민감 데이터 수집
- 서비스 역할 키를 클라이언트에서 사용하는 구현
- 새로고침해야만 반영되는 저장 UX
- 오류 메시지가 없는 실패 상태

## 완료 보고 형식

- 변경 파일
- 구현한 사용자 여정
- DB/환경변수/배포 변경
- 검증 명령 결과
- 남은 리스크와 다음 작업
`;
}

function buildImplementationTaskDrafts({
  idea,
  state,
  risks,
  experiments,
  artifacts,
}: {
  idea: Idea;
  state: EditState;
  risks: Risk[];
  experiments: Experiment[];
  artifacts: VentureArtifact[];
}): ImplementationTaskDraft[] {
  const hasHighRisk = risks.some((risk) => ["high", "critical"].includes(risk.severity) && risk.status !== "closed");
  const hasApprovedPrd = artifacts.some((artifact) => artifact.artifact_type === "prd" && artifact.status === "approved");
  const hasApprovedMvp = artifacts.some((artifact) => artifact.artifact_type === "mvp_spec" && artifact.status === "approved");
  const hasBackendDecision = artifacts.some((artifact) => artifact.artifact_type === "backend_decision");
  const primaryExperiment = experiments[0];

  return [
    {
      title: "PRD와 MVP 범위 잠금",
      task_type: "planning",
      priority: hasApprovedPrd && hasApprovedMvp ? "medium" : "high",
      owner_role: "product-builder",
      acceptance_criteria: [
        `현재 판단은 ${decisionLabels[state.decision]}이고, 첫 릴리스 범위가 한 문장으로 고정되어야 합니다.`,
        "포함 범위, 제외 범위, 성공 지표, 중단 기준이 PRD 또는 MVP 명세에 남아 있어야 합니다.",
      ].join("\n"),
    },
    {
      title: "핵심 사용자 여정 와이어프레임 정리",
      task_type: "design",
      priority: "medium",
      owner_role: "design-reviewer",
      acceptance_criteria: [
        `${idea.target_user || "대상 사용자"}가 첫 가치를 얻는 화면 흐름을 3-5단계로 고정합니다.`,
        "빈 상태, 오류, 저장 성공, 읽기 전용, 모바일 화면 조건을 적습니다.",
      ].join("\n"),
    },
    {
      title: "백엔드 권한 경계 구현",
      task_type: "backend",
      priority: hasBackendDecision ? "medium" : "high",
      owner_role: "backend-architect",
      acceptance_criteria: [
        "Supabase RLS 또는 Firebase Security Rules의 허용/차단 조건이 문서와 코드에 반영됩니다.",
        "클라이언트에서 서비스 역할 키나 서버 전용 비밀값을 사용하지 않습니다.",
      ].join("\n"),
    },
    {
      title: "데이터 모델과 마이그레이션 작성",
      task_type: "data",
      priority: "high",
      owner_role: "data-modeler",
      acceptance_criteria: [
        "핵심 엔티티, 소유권, 조직 경계, 감사 로그 또는 변경 이력이 정의됩니다.",
        "마이그레이션은 재실행 가능하고, 필요한 인덱스와 제약 조건을 포함합니다.",
      ].join("\n"),
    },
    {
      title: "핵심 입력/저장/조회 화면 구현",
      task_type: "frontend",
      priority: "high",
      owner_role: "frontend-builder",
      acceptance_criteria: [
        `${idea.one_liner || "핵심 가치"}를 검증하는 최소 입력 폼과 결과 화면이 동작합니다.`,
        "저장 후 새로고침 없이 목록과 선택 상태가 즉시 갱신됩니다.",
      ].join("\n"),
    },
    {
      title: "상태 UX와 폼 검증 추가",
      task_type: "frontend",
      priority: "medium",
      owner_role: "ux-polisher",
      acceptance_criteria: [
        "필수 입력 오류, 저장 중, 성공, 실패, 권한 없음, 읽기 전용 상태가 같은 화면 안에서 이해됩니다.",
        "모바일 폭에서 버튼, 긴 텍스트, 입력 필드가 겹치지 않습니다.",
      ].join("\n"),
    },
    {
      title: primaryExperiment ? "실험 성공 지표 계측" : "첫 실험 성공 지표 정의",
      task_type: "qa",
      priority: primaryExperiment ? "medium" : "high",
      owner_role: "qa-runner",
      acceptance_criteria: primaryExperiment
        ? `실험 "${primaryExperiment.name}"의 성공 지표를 수동 또는 이벤트 로그로 확인할 수 있어야 합니다.\n성공 지표: ${primaryExperiment.success_metric || "미정"}`
        : "첫 실험 이름과 성공 지표가 저장되고, QA 스모크에서 확인할 수 있어야 합니다.",
    },
    {
      title: hasHighRisk ? "높은 리스크 완화 검증" : "보안/개인정보 기본 점검",
      task_type: "security",
      priority: hasHighRisk ? "high" : "medium",
      owner_role: "security-reviewer",
      acceptance_criteria: hasHighRisk
        ? risks
            .filter((risk) => ["high", "critical"].includes(risk.severity) && risk.status !== "closed")
            .map((risk) => `- ${risk.title}: ${risk.mitigation || "완화 방안 필요"}`)
            .join("\n")
        : "개인정보 최소 수집, 비밀값 노출, 권한 우회, 로그 민감정보 여부를 확인합니다.",
    },
    {
      title: "Vercel Preview/Production 스모크와 롤백 기록",
      task_type: "deploy",
      priority: "medium",
      owner_role: "release-manager",
      acceptance_criteria: [
        "Preview URL에서 핵심 여정이 통과하고, Production 배포 후 동일 스모크가 통과합니다.",
        "환경변수, DB 변경, 롤백 방법, 남은 리스크가 완료 보고에 기록됩니다.",
      ].join("\n"),
    },
  ];
}

function sortImplementationTasksForAction(tasks: ImplementationTask[]) {
  return [...tasks].sort(
    (a, b) =>
      implementationTaskActionRank[a.status] - implementationTaskActionRank[b.status] ||
      implementationTaskPriorityRank[a.priority] - implementationTaskPriorityRank[b.priority] ||
      a.sort_order - b.sort_order ||
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime() ||
      a.title.localeCompare(b.title),
  );
}

function buildImplementationTaskTicketMarkdown({
  idea,
  state,
  task,
}: {
  idea: Idea;
  state: EditState;
  task: ImplementationTask;
}) {
  return `# ${task.title}

## 컨텍스트

- 아이디어: ${idea.name}
- 한 줄 설명: ${idea.one_liner || "미정"}
- 대상 사용자: ${idea.target_user || "미정"}
- 현재 단계: ${stageLabels[state.stage]}
- 현재 판단: ${decisionLabels[state.decision]}

## 태스크

- 유형: ${implementationTaskTypeLabels[task.task_type]}
- 우선순위: ${implementationTaskPriorityLabels[task.priority]}
- 상태: ${implementationTaskStatusLabels[task.status]}
- 담당 역할: ${task.owner_role || "owner 미정"}

## 수용 기준

${task.acceptance_criteria.trim() || "- 수용 기준이 아직 없습니다."}

## 완료 증거로 남길 것

- 커밋 또는 PR
- Preview 또는 Production URL
- 검증 명령 결과
- 핵심 여정 스모크 결과
- 남은 리스크와 롤백 메모

## 기본 검증

\`\`\`powershell
pnpm lint
pnpm typecheck
pnpm harness:check
pnpm build
\`\`\`
`;
}

function buildImplementationBacklogMarkdown({
  idea,
  state,
  tasks,
}: {
  idea: Idea;
  state: EditState;
  tasks: ImplementationTask[];
}) {
  const lines =
    tasks.length > 0
      ? sortImplementationTasksForAction(tasks)
          .map(
            (task, index) =>
              `${index + 1}. ${task.title} / ${implementationTaskTypeLabels[task.task_type]} / ${implementationTaskPriorityLabels[task.priority]} / ${implementationTaskStatusLabels[task.status]} / ${task.owner_role || "owner 미정"}`,
          )
          .join("\n")
      : "열린 개발 태스크가 없습니다.";

  return `# 개발 백로그: ${idea.name}

## 제품 상태

- 한 줄 설명: ${idea.one_liner || "미정"}
- 현재 단계: ${stageLabels[state.stage]}
- 현재 판단: ${decisionLabels[state.decision]}

## 열린 태스크 우선순위

${lines}

## 실행 규칙

- 차단 태스크를 먼저 해소합니다.
- 진행 중 태스크는 완료 증거를 붙여 완료로 옮깁니다.
- 할 일 태스크는 우선순위가 높은 것부터 진행합니다.
- 완료 처리 전 커밋, PR, 배포 URL, 스모크 결과, 남은 리스크 중 최소 하나를 증거로 남깁니다.
`;
}

function buildDevelopmentCompletionReportMarkdown({
  idea,
  state,
  risks,
  experiments,
  runs,
  artifacts,
  implementationTasks,
  implementationGateChecks,
  launchReadiness,
  nextLaunchBlocker,
}: {
  idea: Idea;
  state: EditState;
  risks: Risk[];
  experiments: Experiment[];
  runs: OrchestrationRun[];
  artifacts: VentureArtifact[];
  implementationTasks: ImplementationTask[];
  implementationGateChecks: GateCheck[];
  launchReadiness: GateCheck[];
  nextLaunchBlocker: GateCheck | null;
}) {
  const taskLines =
    implementationTasks.length > 0
      ? implementationTasks
          .map(
            (task) =>
              `- [${task.status === "done" ? "x" : " "}] ${task.title} / ${implementationTaskTypeLabels[task.task_type]} / ${implementationTaskStatusLabels[task.status]} / ${implementationTaskPriorityLabels[task.priority]}\n  - 수용 기준: ${task.acceptance_criteria.replace(/\n/g, "\n    ")}\n  - 완료 증거: ${task.evidence.trim() || "미기록"}`,
          )
          .join("\n")
      : "- 아직 생성된 개발 태스크가 없습니다.";
  const riskLines =
    risks.length > 0
      ? risks.map((risk) => `- ${risk.title}: ${riskSeverityLabels[risk.severity]} / ${riskStatusLabels[risk.status] ?? risk.status}`).join("\n")
      : "- 연결된 리스크가 없습니다.";
  const experimentLines =
    experiments.length > 0
      ? experiments.map((experiment) => `- ${experiment.name}: ${experimentStatusLabels[experiment.status] ?? experiment.status} / ${experiment.success_metric || "성공 지표 미정"}`).join("\n")
      : "- 연결된 실험이 없습니다.";
  const artifactLines =
    artifacts.length > 0
      ? artifacts
          .slice(0, 12)
          .map(
            (artifact) =>
              `- ${artifactLabels[artifact.artifact_type]} v${artifact.version ?? 1}: ${artifact.title || "제목 없음"} (${artifactStatusLabels[artifact.status]})`,
          )
          .join("\n")
      : "- 저장된 산출물이 없습니다.";
  const doneRunLines =
    runs.filter((run) => run.status === "done").length > 0
      ? runs
          .filter((run) => run.status === "done")
          .map((run) => `- ${phaseLabels[run.phase]}: ${run.owner_role || "owner 미정"}`)
          .join("\n")
      : "- 완료된 오케스트레이션 단계가 없습니다.";
  const gateLines = implementationGateChecks
    .map((check) => `- [${check.passed ? "x" : " "}] ${check.label}: ${check.detail}`)
    .join("\n");
  const launchLines = launchReadiness
    .map((check) => `- [${check.passed ? "x" : " "}] ${check.label}: ${check.detail}`)
    .join("\n");
  const completedTaskCount = implementationTasks.filter((task) => task.status === "done").length;
  const taskEvidenceCount = implementationTasks.filter((task) => task.status === "done" && task.evidence.trim()).length;

  return `# 개발 완료 보고서: ${idea.name}

## 요약

- 제품 가치: ${idea.one_liner || "미정"}
- 대상 사용자: ${idea.target_user || "미정"}
- 구매자: ${idea.buyer || "미정"}
- 현재 단계: ${stageLabels[state.stage]}
- 현재 판단: ${decisionLabels[state.decision]}
- 개발 태스크: ${completedTaskCount}/${implementationTasks.length} 완료
- 완료 증거: ${taskEvidenceCount}/${completedTaskCount} 기록
- 다음 출시 차단 항목: ${nextLaunchBlocker ? `${nextLaunchBlocker.label} - ${nextLaunchBlocker.detail}` : "없음"}

## 개발 완료 게이트

${gateLines || "- 게이트가 아직 계산되지 않았습니다."}

## 구현 태스크와 증거

${taskLines}

## 산출물 상태

${artifactLines}

## 리스크 상태

${riskLines}

## 실험 상태

${experimentLines}

## 완료된 오케스트레이션 단계

${doneRunLines}

## 출시 준비도

${launchLines || "- 출시 준비도 항목이 아직 없습니다."}

## 완료 판단 메모

- 모든 완료 태스크에는 커밋, PR, Preview URL, 검증 명령, 스모크 결과, 남은 리스크 중 최소 하나의 증거가 필요합니다.
- 차단 태스크가 있으면 출시 판단은 보류합니다.
- 프로덕션 배포 후 로그인, 저장, 조회, 권한 차단, 모바일 화면을 다시 확인합니다.
`;
}

function buildLaunchChecklistMarkdown({
  idea,
  state,
  risks,
  experiments,
  runs,
  artifacts,
  implementationTasks,
}: {
  idea: Idea;
  state: EditState;
  risks: Risk[];
  experiments: Experiment[];
  runs: OrchestrationRun[];
  artifacts: VentureArtifact[];
  implementationTasks: ImplementationTask[];
}) {
  const hasPrd = artifacts.some((artifact) => artifact.artifact_type === "prd");
  const hasApprovedPrd = artifacts.some((artifact) => artifact.artifact_type === "prd" && artifact.status === "approved");
  const hasMvpSpec = artifacts.some((artifact) => artifact.artifact_type === "mvp_spec");
  const hasApprovedMvpSpec = artifacts.some(
    (artifact) => artifact.artifact_type === "mvp_spec" && artifact.status === "approved",
  );
  const hasBackendDecision = artifacts.some((artifact) => artifact.artifact_type === "backend_decision");
  const hasDesignBrief = artifacts.some((artifact) => artifact.artifact_type === "design_brief");
  const hasApprovedDesignBrief = artifacts.some(
    (artifact) => artifact.artifact_type === "design_brief" && artifact.status === "approved",
  );
  const hasTechSpec = artifacts.some((artifact) => artifact.artifact_type === "tech_spec");
  const hasApprovedTechSpec = artifacts.some(
    (artifact) => artifact.artifact_type === "tech_spec" && artifact.status === "approved",
  );
  const hasDevRunbook = artifacts.some((artifact) => artifact.artifact_type === "dev_runbook");
  const hasResearchNote = artifacts.some((artifact) => artifact.artifact_type === "research_note");
  const doneImplementationTaskCount = implementationTasks.filter((task) => task.status === "done").length;
  const highRiskLines = risks
    .filter((risk) => ["high", "critical"].includes(risk.severity))
    .map((risk) => `- [ ] ${risk.title} (${risk.severity}, ${risk.status})`);
  const donePhases = new Set(runs.filter((run) => run.status === "done").map((run) => run.phase));
  const plannedExperimentLines =
    experiments.length > 0
      ? experiments.map((experiment) => `- [ ] ${experiment.name}: ${experiment.success_metric || "성공 지표 미정"}`).join("\n")
      : "- [ ] 측정 가능한 실험을 하나 추가합니다.";

  return `# 출시 체크리스트: ${idea.name}

## 판단

- 현재 판단: ${decisionLabels[state.decision]}
- 현재 단계: ${stageLabels[state.stage]}
- 다음 증거: ${state.next_evidence || "미정"}

## 제품 산출물

- [${hasPrd ? "x" : " "}] PRD 산출물 저장
- [${hasApprovedPrd ? "x" : " "}] PRD 산출물 승인
- [${hasMvpSpec ? "x" : " "}] MVP 명세 산출물 저장
- [${hasApprovedMvpSpec ? "x" : " "}] MVP 명세 산출물 승인
- [${hasBackendDecision ? "x" : " "}] 백엔드 결정 산출물 저장
- [${hasDesignBrief ? "x" : " "}] 디자인 브리프 산출물 저장
- [${hasApprovedDesignBrief ? "x" : " "}] 디자인 브리프 산출물 승인
- [${hasTechSpec ? "x" : " "}] 기술 명세 산출물 저장
- [${hasApprovedTechSpec ? "x" : " "}] 기술 명세 산출물 승인
- [${hasDevRunbook ? "x" : " "}] 개발 런북 산출물 저장
- [${artifacts.some((artifact) => artifact.artifact_type === "idea_brief") ? "x" : " "}] 아이디어 브리프 산출물 저장
- [${hasResearchNote ? "x" : " "}] 리서치 브리프 산출물 저장
- [${implementationTasks.length > 0 ? "x" : " "}] 구현 태스크 생성
- [${implementationTasks.length > 0 && doneImplementationTaskCount === implementationTasks.length ? "x" : " "}] 구현 태스크 완료 (${doneImplementationTaskCount}/${implementationTasks.length})

## 오케스트레이션 게이트

- [${donePhases.has("strategy") ? "x" : " "}] 전략 실행 완료
- [${donePhases.has("research") ? "x" : " "}] 리서치 실행 완료
- [${donePhases.has("product") ? "x" : " "}] 제품 실행 완료
- [${donePhases.has("design") ? "x" : " "}] 디자인 실행 완료
- [${donePhases.has("build") ? "x" : " "}] 개발 실행 완료
- [${donePhases.has("qa") ? "x" : " "}] QA 실행 완료
- [${donePhases.has("security") ? "x" : " "}] 보안 실행 완료
- [${donePhases.has("launch") ? "x" : " "}] 출시 실행 완료

## 실험 게이트

${plannedExperimentLines}

## 리스크 게이트

${highRiskLines.length > 0 ? highRiskLines.join("\n") : "- [x] 현재 높음/치명적 연결 리스크가 없습니다."}

## 운영 게이트

- [ ] 운영 환경과 유사한 환경에서 핵심 여정 테스트
- [ ] 오류 상태와 빈 상태 검토
- [ ] 워크스페이스 기록의 Supabase RLS 검증
- [ ] Vercel 환경변수 검증
- [ ] 롤백 경로 지정
- [ ] 최종 판단 기록
`;
}

function buildRunOutputTemplate(run: OrchestrationRun, idea: Idea, state: EditState) {
  const context = [
    `아이디어: ${idea.name}`,
    `단계: ${stageLabels[state.stage]}`,
    `판단: ${decisionLabels[state.decision]}`,
    `다음 증거: ${state.next_evidence || "미정"}`,
  ].join("\n");

  const templates: Record<OrchestrationPhase, string> = {
    strategy: `# 전략 산출물

${context}

## 기회
- 사용자 고통:
- 구매자:
- 발생 계기:

## 판단 기준
- 반드시 증명할 것:
- 중단 조건:
- 승격 조건:

## 제약 조건
- 시간:
- 예산:
- 법무/보안:

## 다음 실행 약속
- 담당자:
- 실행:
- 기한:
`,
    research: `# 리서치 산출물

${context}

## 확인한 출처
- 출처:
- 출처:
- 출처:

## 시장 증거
- 사용자 고통:
- 기존 대안:
- 지불 의사 신호:

## 리스크 증거
- 규제:
- 개인정보:
- 경쟁:

## 확신도
- 알게 된 것:
- 아직 모르는 것:
- 다음 증거:
`,
    product: `# 제품 산출물

${context}

## 문제 프레이밍
- 대상 사용자:
- 구매자:
- 발생 계기:
- 현재 우회 방법:
- 문제 비용:

## 사용자 이야기
사용자로서:
나는:
그 이유는:

## MVP 요구사항
- 반드시 포함:
- 있으면 좋음:
- 아직 제외:

## 수용 기준
- 조건/행동/결과:
- 조건/행동/결과:

## No-gos와 중단 기준
- 이번 MVP에서 하지 않을 것:
- 실험 실패 시 중단/전환 기준:

## 지표
- 활성화:
- 성공 지표:
- 실패 신호:
`,
    design: `# 디자인 산출물

${context}

## 디자인 브리프
- 제품 맥락:
- 대상 사용자:
- primary action:
- 화면 목록:
- 컴포넌트 목록:
- 데이터 표시/수집:

## DESIGN.md 적용
- 색상 역할:
- 타이포그래피:
- 간격/밀도:
- radius/elevation:
- 피해야 할 표현:

## 주요 흐름
1. 진입:
2. 핵심 행동:
3. 성공 상태:

## 화면과 상태
- 빈 상태:
- 로딩:
- 오류:
- 성공:
- 권한 없음:
- 읽기 전용:

## 사용성 리스크
- 모바일:
- 접근성:
- 혼동되는 문구:
- 오류 예방/복구:
- AI 신뢰/불확실성:

## 디자인 판단
- 그대로 진행:
- 개발 전 수정:
`,
    build: `# 개발 산출물

${context}

## 백엔드 선택
- 선택한 백엔드:
- 선택 이유:
- 제외한 백엔드와 이유:
- Supabase 적합성:
- Firebase 적합성:
- Firebase SQL Connect 적합성:
- 하이브리드 리스크:

## 기술 경계
- Server Component:
- Client Component:
- Server Action 또는 Route Handler:
- Supabase client/server 사용 위치:

## 데이터와 RLS
- 테이블:
- 마이그레이션:
- select 정책:
- insert/update/delete 정책:
- with check 조건:
- 허용/거부 테스트:

## Firebase 경계
- Firebase 제품:
- Firestore/SQL Connect/Realtime Database 모델:
- Security Rules 또는 IAM:
- App Check:
- Cloud Functions:
- Storage:
- Emulator/Preview 검증:

## 구현 범위
- 파일/모듈:
- 데이터 변경:
- 외부 서비스:

## 계획
1. 구현:
2. 검증:
3. 배포:

## 안전장치
- 기능 플래그 또는 롤백:
- 비밀값/환경변수:
- 마이그레이션 리스크:
- 중복 제출 방지:
- stale UI/refresh 처리:

## 완료 기준
- 사용자에게 보이는 결과:
- 테스트:
- 배포:
- 수동 스모크 경로:
`,
    qa: `# QA 산출물

${context}

## 핵심 여정
- 테스트한 단계:
- 결과:

## 회귀 확인 범위
- 인증:
- 데이터 쓰기:
- 산출물/실행 워크플로우:
- 모바일 레이아웃:
- 빈/로딩/성공/오류:
- 권한 없음/읽기 전용:
- 새로고침 없는 화면 반영:

## 실패
- 이슈:
- 재현:
- 심각도:

## 검증 명령
- lint:
- typecheck:
- build:
- harness:
- 브라우저 스모크:

## 판정
- 통과/차단:
- 증거:
`,
    debug: `# 디버깅 산출물

${context}

## 재현
- 환경:
- 단계:
- 기대 결과:
- 실제 결과:

## 진단
- 추정 원인:
- 증거:
- 영향 범위:

## 수정
- 변경:
- 검증:
- 남은 리스크:
- 재발 방지:
`,
    security: `# 보안 산출물

${context}

## 데이터 분류
- 개인정보:
- 비밀값:
- 민감한 비즈니스 데이터:
- 규제 가능 데이터:

## 접근 제어
- 인증 요구:
- RLS/권한:
- 관리자 행동:
- with check/소유권:

## 악용과 개인정보
- 악용 경로:
- 보관:
- 동의/고지:
- 로그/감사:
- rate limit/대량 요청:
- AI 출력 검토/폐기:

## 판정
- 통과/차단:
- 필요한 완화:
`,
    launch: `# 출시 산출물

${context}

## 준비 상태
- 승인된 PRD:
- 승인된 MVP 명세:
- QA 게이트:
- 보안 게이트:

## 판단
- 진행/전환/중단/추가 조사:
- 이유:

## 릴리스 계획
- 담당자:
- 롤백:
- 먼저 볼 지표:
`,
  };

  return templates[run.phase].trim();
}

function summarizeArtifactLineChanges(currentBody: string, previousBody: string) {
  const currentLines = splitComparableLines(currentBody);
  const previousLines = splitComparableLines(previousBody);
  const currentCounts = countLines(currentLines);
  const previousCounts = countLines(previousLines);
  let added = 0;
  let removed = 0;

  for (const [line, count] of currentCounts) {
    added += Math.max(0, count - (previousCounts.get(line) ?? 0));
  }

  for (const [line, count] of previousCounts) {
    removed += Math.max(0, count - (currentCounts.get(line) ?? 0));
  }

  return { added, removed };
}

function splitComparableLines(body: string) {
  return body
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function countLines(lines: string[]) {
  const counts = new Map<string, number>();

  for (const line of lines) {
    counts.set(line, (counts.get(line) ?? 0) + 1);
  }

  return counts;
}

export function IdeaWorkbench({
  initialIdeas,
  initialRisks,
  initialDecisions,
  initialExperiments,
  initialOrchestrationRuns,
  initialArtifacts,
  initialImplementationTasks,
  activeTask: controlledActiveTask,
  onActiveTaskChange,
  showSidebar = true,
}: {
  initialIdeas: Idea[];
  initialRisks: Risk[];
  initialDecisions: Decision[];
  initialExperiments: Experiment[];
  initialOrchestrationRuns: OrchestrationRun[];
  initialArtifacts: VentureArtifact[];
  initialImplementationTasks: ImplementationTask[];
  activeTask?: WorkbenchTask;
  onActiveTaskChange?: (task: WorkbenchTask) => void;
  showSidebar?: boolean;
}) {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();
  const [ideas, setIdeas] = useState(() => sortWorkbenchIdeas(initialIdeas));
  const [risks, setRisks] = useState(initialRisks);
  const [decisionLog, setDecisionLog] = useState(initialDecisions);
  const [experiments, setExperiments] = useState(initialExperiments);
  const [orchestrationRuns, setOrchestrationRuns] = useState(initialOrchestrationRuns);
  const [artifacts, setArtifacts] = useState(initialArtifacts);
  const [implementationTasks, setImplementationTasks] = useState(initialImplementationTasks);
  const [selectedIdeaId, setSelectedIdeaId] = useState(() => sortWorkbenchIdeas(initialIdeas)[0]?.id ?? "");
  const selectedIdea = ideas.find((idea) => idea.id === selectedIdeaId) ?? ideas[0] ?? null;
  const [editState, setEditState] = useState<EditState | null>(selectedIdea ? toEditState(selectedIdea) : null);
  const [riskDraft, setRiskDraft] = useState<RiskDraft>({
    title: "",
    area: "",
    severity: "medium",
    mitigation: "",
  });
  const [decisionReason, setDecisionReason] = useState("");
  const [experimentDraft, setExperimentDraft] = useState<ExperimentDraft>({ name: "", success_metric: "" });
  const [runDraft, setRunDraft] = useState<RunDraft>({
    phase: "strategy",
    owner_role: "strategy-reviewer",
    objective: orchestrationPhaseConfigs[0].objective,
  });
  const [runOutputs, setRunOutputs] = useState<Record<string, string>>(
    Object.fromEntries(initialOrchestrationRuns.map((run) => [run.id, run.output])),
  );
  const [artifactStatusNotes, setArtifactStatusNotes] = useState<Record<string, string>>({});
  const [implementationTaskEvidence, setImplementationTaskEvidence] = useState<Record<string, string>>({});
  const [implementationTaskDraft, setImplementationTaskDraft] = useState<ImplementationTaskDraft>({
    title: "",
    task_type: "frontend",
    priority: "medium",
    owner_role: "prototype-builder",
    acceptance_criteria: "",
  });
  const [user, setUser] = useState<User | null>(null);
  const [memberships, setMemberships] = useState<OrganizationMember[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [filterMode, setFilterMode] = useState<"all" | "mine" | "read_only">("all");
  const [artifactTypeFilter, setArtifactTypeFilter] = useState<VentureArtifactType | "all">("all");
  const [artifactStatusFilter, setArtifactStatusFilter] = useState<VentureArtifactStatus | "all">("all");
  const [localActiveTask, setLocalActiveTask] = useState<WorkbenchTask>("score");
  const activeTask = controlledActiveTask ?? localActiveTask;
  const updateActiveTask = useCallback((task: WorkbenchTask) => {
    setLocalActiveTask(task);
    onActiveTaskChange?.(task);
  }, [onActiveTaskChange]);

  useEffect(() => {
    function handleRecordEvent<T extends { id: string }>(
      event: Event,
      setter: (updater: (current: T[]) => T[]) => void,
    ) {
      const record = (event as CustomEvent<T>).detail;

      if (!record?.id) {
        return;
      }

      setter((current) => upsertRecordById(current, record));
    }

    function handleRecordListEvent<T extends { id: string }>(
      event: Event,
      setter: (updater: (current: T[]) => T[]) => void,
    ) {
      const records = (event as CustomEvent<T[]>).detail;

      if (!Array.isArray(records) || records.length === 0) {
        return;
      }

      setter((current) => upsertRecordsById(current, records));
    }

    function handleIdeaCreated(event: Event) {
      const createdIdea = (event as CustomEvent<Idea>).detail;

      if (!createdIdea?.id) {
        return;
      }

      setIdeas((current) => upsertWorkbenchIdea(current, createdIdea));
      setSelectedIdeaId(createdIdea.id);
      setEditState(toEditState(createdIdea));
      updateActiveTask("score");
      setFilterMode("all");
      setMessage("새 아이디어를 워크벤치에 바로 추가하고 선택했습니다.");
    }
    const handleIdeaUpdated = (event: Event) => handleRecordEvent<Idea>(event, setIdeas);
    const handleRiskCreated = (event: Event) => handleRecordEvent<Risk>(event, setRisks);
    const handleRiskUpdated = (event: Event) => handleRecordEvent<Risk>(event, setRisks);
    const handleExperimentCreated = (event: Event) => handleRecordEvent<Experiment>(event, setExperiments);
    const handleExperimentUpdated = (event: Event) => handleRecordEvent<Experiment>(event, setExperiments);
    const handleRunCreated = (event: Event) => handleRecordEvent<OrchestrationRun>(event, setOrchestrationRuns);
    const handleRunsCreated = (event: Event) => handleRecordListEvent<OrchestrationRun>(event, setOrchestrationRuns);
    const handleRunUpdated = (event: Event) => handleRecordEvent<OrchestrationRun>(event, setOrchestrationRuns);
    const handleArtifactCreated = (event: Event) => handleRecordEvent<VentureArtifact>(event, setArtifacts);
    const handleArtifactUpdated = (event: Event) => handleRecordEvent<VentureArtifact>(event, setArtifacts);
    const handleTaskCreated = (event: Event) => handleRecordEvent<ImplementationTask>(event, setImplementationTasks);
    const handleTasksCreated = (event: Event) => handleRecordListEvent<ImplementationTask>(event, setImplementationTasks);
    const handleTaskUpdated = (event: Event) => handleRecordEvent<ImplementationTask>(event, setImplementationTasks);

    window.addEventListener("venture:idea-created", handleIdeaCreated);
    window.addEventListener("venture:idea-updated", handleIdeaUpdated);
    window.addEventListener("venture:risk-created", handleRiskCreated);
    window.addEventListener("venture:risk-updated", handleRiskUpdated);
    window.addEventListener("venture:experiment-created", handleExperimentCreated);
    window.addEventListener("venture:experiment-updated", handleExperimentUpdated);
    window.addEventListener("venture:run-created", handleRunCreated);
    window.addEventListener("venture:runs-created", handleRunsCreated);
    window.addEventListener("venture:run-updated", handleRunUpdated);
    window.addEventListener("venture:artifact-created", handleArtifactCreated);
    window.addEventListener("venture:artifact-updated", handleArtifactUpdated);
    window.addEventListener("venture:task-created", handleTaskCreated);
    window.addEventListener("venture:tasks-created", handleTasksCreated);
    window.addEventListener("venture:task-updated", handleTaskUpdated);

    return () => {
      window.removeEventListener("venture:idea-created", handleIdeaCreated);
      window.removeEventListener("venture:idea-updated", handleIdeaUpdated);
      window.removeEventListener("venture:risk-created", handleRiskCreated);
      window.removeEventListener("venture:risk-updated", handleRiskUpdated);
      window.removeEventListener("venture:experiment-created", handleExperimentCreated);
      window.removeEventListener("venture:experiment-updated", handleExperimentUpdated);
      window.removeEventListener("venture:run-created", handleRunCreated);
      window.removeEventListener("venture:runs-created", handleRunsCreated);
      window.removeEventListener("venture:run-updated", handleRunUpdated);
      window.removeEventListener("venture:artifact-created", handleArtifactCreated);
      window.removeEventListener("venture:artifact-updated", handleArtifactUpdated);
      window.removeEventListener("venture:task-created", handleTaskCreated);
      window.removeEventListener("venture:tasks-created", handleTasksCreated);
      window.removeEventListener("venture:task-updated", handleTaskUpdated);
    };
  }, [updateActiveTask]);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    async function loadMemberships(nextUser: User | null) {
      if (!supabase || !nextUser) {
        setMemberships([]);
        return;
      }

      const { data } = await supabase.from("organization_members").select("*");
      setMemberships(data ?? []);
    }

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      void loadMemberships(data.user);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextUser = session?.user ?? null;
      setUser(nextUser);
      void loadMemberships(nextUser);
    });

    return () => data.subscription.unsubscribe();
  }, [supabase]);

  const selectedRisks = useMemo(
    () => risks.filter((risk) => risk.idea_id === selectedIdea?.id || risk.idea_id === null),
    [risks, selectedIdea?.id],
  );
  const selectedIdeaRisks = useMemo(
    () => risks.filter((risk) => risk.idea_id === selectedIdea?.id),
    [risks, selectedIdea?.id],
  );

  const selectedDecisions = useMemo(
    () => decisionLog.filter((entry) => entry.idea_id === selectedIdea?.id).slice(0, 4),
    [decisionLog, selectedIdea?.id],
  );

  const selectedExperiments = useMemo(
    () => experiments.filter((experiment) => experiment.idea_id === selectedIdea?.id).slice(0, 5),
    [experiments, selectedIdea?.id],
  );

  const selectedRuns = useMemo(
    () =>
      orchestrationRuns
        .filter((run) => run.idea_id === selectedIdea?.id)
        .sort((a, b) => (phaseOrder.get(a.phase) ?? 99) - (phaseOrder.get(b.phase) ?? 99)),
    [orchestrationRuns, selectedIdea?.id],
  );

  const selectedArtifactRecords = useMemo(
    () =>
      artifacts
        .filter((artifact) => artifact.idea_id === selectedIdea?.id)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
    [artifacts, selectedIdea?.id],
  );
  const selectedArtifacts = useMemo(
    () =>
      selectedArtifactRecords
        .filter((artifact) => artifactTypeFilter === "all" || artifact.artifact_type === artifactTypeFilter)
        .filter((artifact) => artifactStatusFilter === "all" || (artifact.status ?? "draft") === artifactStatusFilter)
        .slice(0, 8),
    [artifactStatusFilter, artifactTypeFilter, selectedArtifactRecords],
  );
  const selectedImplementationTasks = useMemo(
    () =>
      implementationTasks
        .filter((task) => task.idea_id === selectedIdea?.id)
        .sort(
          (a, b) =>
            a.sort_order - b.sort_order ||
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime() ||
            a.title.localeCompare(b.title),
        ),
    [implementationTasks, selectedIdea?.id],
  );
  const selectedOpenImplementationTasks = useMemo(
    () => sortImplementationTasksForAction(selectedImplementationTasks.filter((task) => task.status !== "done")),
    [selectedImplementationTasks],
  );
  const nextImplementationTask = selectedOpenImplementationTasks[0] ?? null;
  const artifactVersionSummaries = useMemo(() => {
    const summaries = new Map<string, { previous: VentureArtifact; added: number; removed: number }>();

    for (const artifact of selectedArtifactRecords) {
      const previous = selectedArtifactRecords
        .filter(
          (candidate) =>
            candidate.id !== artifact.id &&
            candidate.artifact_type === artifact.artifact_type &&
            (candidate.version ?? 1) < (artifact.version ?? 1),
        )
        .sort(
          (a, b) =>
            (b.version ?? 1) - (a.version ?? 1) ||
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        )[0];

      if (previous) {
        summaries.set(artifact.id, {
          previous,
          ...summarizeArtifactLineChanges(artifact.body, previous.body),
        });
      }
    }

    return summaries;
  }, [selectedArtifactRecords]);

  const canAdminSelectedOrganization = Boolean(
    user &&
      selectedIdea?.organization_id &&
      memberships.some(
        (membership) =>
          membership.user_id === user.id &&
          membership.organization_id === selectedIdea.organization_id &&
          adminRoles.has(membership.role),
      ),
  );
  const canEdit = Boolean(user && (selectedIdea?.created_by === user.id || canAdminSelectedOrganization));
  function canManageRecord(record: { created_by: string | null; organization_id: string | null }) {
    return Boolean(
      user &&
        (record.created_by === user.id ||
          (record.organization_id &&
            memberships.some(
              (membership) =>
                membership.user_id === user.id &&
                membership.organization_id === record.organization_id &&
                adminRoles.has(membership.role),
            ))),
    );
  }
  const currentScore = editState ? scoreState(editState) : 0;
  const scoreRecommendation = recommendationForScore(currentScore);
  const missing =
    selectedIdea && editState ? missingEvidence(selectedIdea, editState, selectedIdeaRisks.length) : [];
  const validationPlan = selectedIdea && editState
    ? buildValidationPlan({
        idea: selectedIdea,
        state: editState,
        score: currentScore,
        risks: selectedIdeaRisks,
        missing,
      })
    : null;
  const ideaBrief = selectedIdea && editState
    ? buildIdeaBriefMarkdown({
        idea: selectedIdea,
        state: editState,
        score: currentScore,
        recommendation: scoreRecommendation,
        risks: selectedIdeaRisks,
      })
    : "";
  const researchBriefDraft = selectedIdea && editState
    ? buildResearchBriefMarkdown({
        idea: selectedIdea,
        state: editState,
        score: currentScore,
        recommendation: scoreRecommendation,
        risks: selectedIdeaRisks,
        experiments: selectedExperiments,
        runs: selectedRuns,
      })
    : "";
  const validationSprintDraft = selectedIdea && editState
    ? buildValidationSprintMarkdown({
        idea: selectedIdea,
        state: editState,
        score: currentScore,
        recommendation: scoreRecommendation,
        risks: selectedIdeaRisks,
        experiments: selectedExperiments,
      })
    : "";
  const prdDraft = selectedIdea && editState
    ? buildPrdMarkdown({
        idea: selectedIdea,
        state: editState,
        score: currentScore,
        recommendation: scoreRecommendation,
        risks: selectedIdeaRisks,
        experiments: selectedExperiments,
        runs: selectedRuns,
      })
    : "";
  const mvpSpecDraft = selectedIdea && editState
    ? buildMvpSpecMarkdown({
        idea: selectedIdea,
        state: editState,
        experiments: selectedExperiments,
        runs: selectedRuns,
      })
    : "";
  const developmentPlanDraft = selectedIdea && editState
    ? buildAppDevelopmentPlanMarkdown({
        idea: selectedIdea,
        state: editState,
        experiments: selectedExperiments,
        runs: selectedRuns,
        artifacts: selectedArtifactRecords,
      })
    : "";
  const backendDecisionDraft = selectedIdea && editState
    ? buildBackendDecisionMarkdown({
        idea: selectedIdea,
        state: editState,
      })
    : "";
  const designBriefDraft = selectedIdea && editState
    ? buildDesignBriefMarkdown({
        idea: selectedIdea,
        state: editState,
        runs: selectedRuns,
      })
    : "";
  const techSpecDraft = selectedIdea && editState
    ? buildTechSpecMarkdown({
        idea: selectedIdea,
        state: editState,
        experiments: selectedExperiments,
        runs: selectedRuns,
      })
    : "";
  const implementationHandoffDraft = selectedIdea && editState
    ? buildImplementationHandoffMarkdown({
        idea: selectedIdea,
        state: editState,
        risks: selectedIdeaRisks,
        experiments: selectedExperiments,
        runs: selectedRuns,
        artifacts: selectedArtifactRecords,
      })
    : "";
  const implementationTaskTicketDraft = selectedIdea && editState && nextImplementationTask
    ? buildImplementationTaskTicketMarkdown({
        idea: selectedIdea,
        state: editState,
        task: nextImplementationTask,
      })
    : "";
  const implementationBacklogDraft = selectedIdea && editState
    ? buildImplementationBacklogMarkdown({
        idea: selectedIdea,
        state: editState,
        tasks: selectedOpenImplementationTasks,
      })
    : "";
  const implementationTaskDrafts = selectedIdea && editState
    ? buildImplementationTaskDrafts({
        idea: selectedIdea,
        state: editState,
        risks: selectedIdeaRisks,
        experiments: selectedExperiments,
        artifacts: selectedArtifactRecords,
      })
    : [];
  const implementationTaskSourceArtifact = selectedArtifactRecords.find(
    (artifact) =>
      artifact.status === "approved" &&
      ["tech_spec", "dev_runbook", "mvp_spec", "prd"].includes(artifact.artifact_type),
  ) ?? selectedArtifactRecords.find((artifact) =>
    ["tech_spec", "dev_runbook", "mvp_spec", "prd"].includes(artifact.artifact_type),
  );
  const completedImplementationTasks = selectedImplementationTasks.filter((task) => task.status === "done");
  const implementationTasksWithEvidence = completedImplementationTasks.filter((task) => task.evidence.trim());
  const hasBlockedImplementationTasks = selectedImplementationTasks.some((task) => task.status === "blocked");
  const implementationGateChecks: GateCheck[] = selectedIdea
    ? [
        {
          label: "개발 태스크 생성",
          passed: selectedImplementationTasks.length > 0,
          detail:
            selectedImplementationTasks.length > 0
              ? `${selectedImplementationTasks.length}개의 구현 태스크가 있습니다.`
              : "앱 개발 프로세스에서 기본 개발 태스크를 생성하세요.",
        },
        {
          label: "차단 태스크 없음",
          passed: !hasBlockedImplementationTasks,
          detail: hasBlockedImplementationTasks
            ? `${selectedImplementationTasks.filter((task) => task.status === "blocked").length}개 태스크가 차단 상태입니다.`
            : "현재 차단 상태의 태스크가 없습니다.",
        },
        {
          label: "모든 태스크 완료",
          passed:
            selectedImplementationTasks.length > 0 &&
            completedImplementationTasks.length === selectedImplementationTasks.length,
          detail:
            selectedImplementationTasks.length > 0
              ? `${completedImplementationTasks.length}/${selectedImplementationTasks.length}개 완료`
              : "완료할 태스크가 아직 없습니다.",
        },
        {
          label: "완료 증거 기록",
          passed:
            completedImplementationTasks.length > 0 &&
            implementationTasksWithEvidence.length === completedImplementationTasks.length,
          detail:
            completedImplementationTasks.length > 0
              ? `${implementationTasksWithEvidence.length}/${completedImplementationTasks.length}개 완료 태스크에 증거가 있습니다.`
              : "완료된 태스크가 생기면 커밋, PR, 스모크 결과, 배포 URL 같은 증거를 기록하세요.",
        },
        {
          label: "QA와 보안 단계 완료",
          passed:
            selectedRuns.some((run) => run.phase === "qa" && run.status === "done") &&
            selectedRuns.some((run) => run.phase === "security" && run.status === "done"),
          detail: "QA와 보안 오케스트레이션이 모두 완료되어야 합니다.",
        },
      ]
    : [];
  const passedImplementationGateCount = implementationGateChecks.filter((check) => check.passed).length;
  const implementationGateScore =
    implementationGateChecks.length === 0
      ? 0
      : Math.round((passedImplementationGateCount / implementationGateChecks.length) * 100);
  const launchChecklistDraft = selectedIdea && editState
    ? buildLaunchChecklistMarkdown({
        idea: selectedIdea,
        state: editState,
        risks: selectedIdeaRisks,
        experiments: selectedExperiments,
        runs: selectedRuns,
        artifacts: selectedArtifactRecords,
        implementationTasks: selectedImplementationTasks,
      })
    : "";
  const developmentArtifactDrafts: Array<{
    artifactType: VentureArtifactType;
    title: string;
    body: string;
    description: string;
  }> = selectedIdea
    ? [
        {
          artifactType: "backend_decision",
          title: `${selectedIdea.name} 백엔드 결정`,
          body: backendDecisionDraft,
          description: "Supabase, Firebase, SQL Connect, 하이브리드 중 어떤 백엔드를 쓸지 기록합니다.",
        },
        {
          artifactType: "design_brief",
          title: `${selectedIdea.name} 디자인 브리프`,
          body: designBriefDraft,
          description: "핵심 여정, 화면 상태, 모바일/접근성 체크를 개발 전에 고정합니다.",
        },
        {
          artifactType: "tech_spec",
          title: `${selectedIdea.name} 기술 명세`,
          body: techSpecDraft,
          description: "데이터 모델, 권한 경계, 구현 순서, 검증 명령, 롤백 경로를 정리합니다.",
        },
      ]
    : [];
  const launchReadiness = selectedIdea && editState
    ? [
        {
          label: "기본 증거 완료",
          passed: missing.length === 0,
          detail: missing.length === 0 ? "필수 증거 공백이 없습니다." : missing.join(", "),
        },
        {
          label: "리서치 브리프 저장",
          passed: selectedArtifactRecords.some((artifact) => artifact.artifact_type === "research_note"),
          detail: selectedArtifactRecords.some((artifact) => artifact.artifact_type === "research_note")
            ? "인터뷰, 경쟁/대안, 가격, 규제 체크가 문서화되어 있습니다."
            : "산출물 단계에서 리서치 브리프를 저장하세요.",
        },
        {
          label: "PRD 승인",
          passed: selectedArtifactRecords.some(
            (artifact) => artifact.artifact_type === "prd" && artifact.status === "approved",
          ),
          detail: selectedArtifactRecords.some((artifact) => artifact.artifact_type === "prd")
            ? "초안은 저장되어 있고 승인이 필요합니다."
            : "PRD 산출물이 필요합니다.",
        },
        {
          label: "MVP 명세 승인",
          passed: selectedArtifactRecords.some(
            (artifact) => artifact.artifact_type === "mvp_spec" && artifact.status === "approved",
          ),
          detail: selectedArtifactRecords.some((artifact) => artifact.artifact_type === "mvp_spec")
            ? "초안은 저장되어 있고 승인이 필요합니다."
            : "MVP 범위 정의가 필요합니다.",
        },
        {
          label: "백엔드 결정 저장",
          passed: selectedArtifactRecords.some((artifact) => artifact.artifact_type === "backend_decision"),
          detail: selectedArtifactRecords.some((artifact) => artifact.artifact_type === "backend_decision")
            ? "백엔드 선택 근거가 기록되어 있습니다."
            : "Supabase/Firebase 선택 근거가 필요합니다.",
        },
        {
          label: "디자인 브리프 승인",
          passed: selectedArtifactRecords.some(
            (artifact) => artifact.artifact_type === "design_brief" && artifact.status === "approved",
          ),
          detail: selectedArtifactRecords.some((artifact) => artifact.artifact_type === "design_brief")
            ? "초안은 저장되어 있고 승인이 필요합니다."
            : "핵심 여정과 화면 상태를 디자인 브리프로 고정하세요.",
        },
        {
          label: "기술 명세 승인",
          passed: selectedArtifactRecords.some(
            (artifact) => artifact.artifact_type === "tech_spec" && artifact.status === "approved",
          ),
          detail: selectedArtifactRecords.some((artifact) => artifact.artifact_type === "tech_spec")
            ? "초안은 저장되어 있고 승인이 필요합니다."
            : "데이터 모델, 권한, 검증 명령이 담긴 기술 명세가 필요합니다.",
        },
        {
          label: "개발 런북 저장",
          passed: selectedArtifactRecords.some((artifact) => artifact.artifact_type === "dev_runbook"),
          detail: selectedArtifactRecords.some((artifact) => artifact.artifact_type === "dev_runbook")
            ? "개발 실행 순서와 게이트가 기록되어 있습니다."
            : "앱 개발 프로세스에서 개발 런북을 저장하세요.",
        },
        {
          label: "개발 태스크 완료",
          passed: implementationGateChecks.every((check) => check.passed),
          detail:
            selectedImplementationTasks.length > 0
              ? `개발 완료 게이트 ${passedImplementationGateCount}/${implementationGateChecks.length}개 통과`
              : "앱 개발 프로세스에서 기본 개발 태스크를 생성하세요.",
        },
        {
          label: "실험 계획",
          passed: selectedExperiments.length > 0,
          detail: selectedExperiments[0]?.success_metric || "성공 지표가 필요합니다.",
        },
        {
          label: "QA 게이트",
          passed: selectedRuns.some((run) => run.phase === "qa" && run.status === "done"),
          detail: "QA 단계가 완료 상태여야 합니다.",
        },
        {
          label: "보안 게이트",
          passed: selectedRuns.some((run) => run.phase === "security" && run.status === "done"),
          detail: "보안 단계가 완료 상태여야 합니다.",
        },
        {
          label: "높은 리스크 정리",
          passed: selectedIdeaRisks.every((risk) => !["high", "critical"].includes(risk.severity) || risk.status === "closed"),
          detail: "높음/치명적 리스크는 종료 또는 수용 판단이 필요합니다.",
        },
        {
          label: "최종 판단 기록",
          passed: editState.decision !== "pending" && selectedDecisions.length > 0,
          detail: `${decisionLabels[editState.decision]} / 기록 ${selectedDecisions.length}개`,
        },
      ]
    : [];
  const passedLaunchReadinessCount = launchReadiness.filter((check) => check.passed).length;
  const launchReadinessScore =
    launchReadiness.length === 0
      ? 0
      : Math.round((passedLaunchReadinessCount / launchReadiness.length) * 100);
  const nextLaunchBlocker = launchReadiness.find((check) => !check.passed) ?? null;
  const developmentCompletionReportDraft = selectedIdea && editState
    ? buildDevelopmentCompletionReportMarkdown({
        idea: selectedIdea,
        state: editState,
        risks: selectedIdeaRisks,
        experiments: selectedExperiments,
        runs: selectedRuns,
        artifacts: selectedArtifactRecords,
        implementationTasks: selectedImplementationTasks,
        implementationGateChecks,
        launchReadiness,
        nextLaunchBlocker,
      })
    : "";
  const doneRunCount = selectedRuns.filter((run) => run.status === "done").length;
  const workbenchTasks: Array<{
    id: WorkbenchTask;
    label: string;
    description: string;
    status: string;
  }> = [
    {
      id: "select",
      label: "아이디어 선택",
      description: "평가할 아이디어를 고릅니다.",
      status: selectedIdea ? "선택됨" : "필수",
    },
    {
      id: "score",
      label: "점수화",
      description: "단계, 판단, 점수, 증거를 정리합니다.",
      status: currentScore > 0 ? `${currentScore}점` : "대기",
    },
    {
      id: "risk",
      label: "리스크",
      description: "차단 요인과 완화 상태를 관리합니다.",
      status: selectedIdeaRisks.length > 0 ? `${selectedIdeaRisks.length}개` : "대기",
    },
    {
      id: "decision",
      label: "판단 기록",
      description: "진행, 전환, 중단 근거를 남깁니다.",
      status: selectedDecisions.length > 0 ? `${selectedDecisions.length}개` : "대기",
    },
    {
      id: "experiment",
      label: "실험",
      description: "가장 작은 검증 계획을 정의합니다.",
      status: selectedExperiments.length > 0 ? `${selectedExperiments.length}개` : "대기",
    },
    {
      id: "orchestration",
      label: "오케스트레이션",
      description: "전략부터 출시까지 역할 실행을 추적합니다.",
      status: selectedRuns.length > 0 ? `${doneRunCount}/${selectedRuns.length}` : "대기",
    },
    {
      id: "artifacts",
      label: "산출물",
      description: "브리프, 리서치 노트, PRD, MVP 명세를 저장합니다.",
      status: selectedArtifactRecords.length > 0 ? `${selectedArtifactRecords.length}개` : "대기",
    },
    {
      id: "development",
      label: "앱 개발",
      description: "기획, 디자인, 개발, 배포 실행 계획입니다.",
      status:
        selectedImplementationTasks.length > 0
          ? `${selectedImplementationTasks.filter((task) => task.status === "done").length}/${selectedImplementationTasks.length}`
          : selectedArtifactRecords.some((artifact) => artifact.source === "development_process")
            ? "계획됨"
            : "대기",
    },
    {
      id: "launch",
      label: "출시 준비도",
      description: "출시 게이트 통과 상태를 확인합니다.",
      status: `${launchReadinessScore}%`,
    },
  ];
  const visibleIdeas = useMemo(() => {
    if (filterMode === "mine") {
      return sortWorkbenchIdeas(ideas.filter((idea) => user && idea.created_by === user.id));
    }

    if (filterMode === "read_only") {
      return sortWorkbenchIdeas(ideas.filter((idea) => !user || idea.created_by !== user.id));
    }

    return sortWorkbenchIdeas(ideas);
  }, [filterMode, ideas, user]);

  if (!selectedIdea || !editState) {
    return (
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-950">아이디어 워크벤치</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          아직 평가할 아이디어가 없습니다. 왼쪽 메뉴에서 새 아이디어를 먼저 접수하세요.
        </p>
      </section>
    );
  }

  async function saveIdea(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabase || !selectedIdea || !editState) {
      setMessage("먼저 아이디어를 선택하세요.");
      return;
    }

    if (!canEdit) {
      setMessage("현재 운영자에게는 이 아이디어가 읽기 전용입니다.");
      return;
    }

    setIsBusy(true);
    setMessage(null);
    const { data, error } = await supabase
      .from("ideas")
      .update(editState)
      .eq("id", selectedIdea.id)
      .select()
      .single();
    setIsBusy(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setIdeas((current) => current.map((idea) => (idea.id === data.id ? data : idea)));
    emitVentureEvent("venture:idea-updated", data);
    setMessage("아이디어 점수와 상태를 저장했습니다.");
    router.refresh();
  }

  async function addRisk(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabase || !selectedIdea) {
      setMessage("먼저 아이디어를 선택하세요.");
      return;
    }

    if (!user) {
      setMessage("리스크를 추가하려면 먼저 로그인하세요.");
      return;
    }

    if (!riskDraft.title.trim()) {
      setMessage("리스크 제목은 필수입니다.");
      return;
    }

    setIsBusy(true);
    setMessage(null);
    const { data, error } = await supabase
      .from("risks")
      .insert({
        idea_id: selectedIdea.id,
        title: riskDraft.title.trim(),
        area: riskDraft.area.trim(),
        severity: riskDraft.severity,
        mitigation: riskDraft.mitigation.trim(),
        status: "open",
        organization_id: selectedIdea.organization_id,
      })
      .select()
      .single();
    setIsBusy(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setRisks((current) => [data, ...current]);
    emitVentureEvent("venture:risk-created", data);
    setRiskDraft({ title: "", area: "", severity: "medium", mitigation: "" });
    setMessage("리스크를 추가했습니다.");
    router.refresh();
  }

  async function recordDecision() {
    if (!supabase || !selectedIdea || !editState) {
      setMessage("먼저 아이디어를 선택하세요.");
      return;
    }

    if (!canEdit) {
      setMessage("아이디어 작성자 또는 워크스페이스 관리자만 판단을 기록할 수 있습니다.");
      return;
    }

    setIsBusy(true);
    setMessage(null);
    const [ideaResult, decisionResult] = await Promise.all([
      supabase.from("ideas").update({ decision: editState.decision }).eq("id", selectedIdea.id).select().single(),
      supabase
        .from("decisions")
        .insert({
          idea_id: selectedIdea.id,
          decision: editState.decision,
          reason: decisionReason.trim(),
          organization_id: selectedIdea.organization_id,
        })
        .select()
        .single(),
    ]);
    setIsBusy(false);

    if (ideaResult.error || decisionResult.error) {
      setMessage(ideaResult.error?.message ?? decisionResult.error?.message ?? "판단을 기록하지 못했습니다.");
      return;
    }

    setIdeas((current) => current.map((idea) => (idea.id === ideaResult.data.id ? ideaResult.data : idea)));
    setDecisionLog((current) => [decisionResult.data, ...current]);
    emitVentureEvent("venture:idea-updated", ideaResult.data);
    emitVentureEvent("venture:decision-created", decisionResult.data);
    setDecisionReason("");
    setMessage("판단을 기록했습니다.");
    router.refresh();
  }

  async function addExperiment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabase || !selectedIdea) {
      setMessage("먼저 아이디어를 선택하세요.");
      return;
    }

    if (!user) {
      setMessage("실험을 추가하려면 먼저 로그인하세요.");
      return;
    }

    if (!experimentDraft.name.trim()) {
      setMessage("실험 이름은 필수입니다.");
      return;
    }

    setIsBusy(true);
    setMessage(null);
    const { data, error } = await supabase
      .from("experiments")
      .insert({
        idea_id: selectedIdea.id,
        name: experimentDraft.name.trim(),
        success_metric: experimentDraft.success_metric.trim(),
        status: "planned",
        organization_id: selectedIdea.organization_id,
      })
      .select()
      .single();
    setIsBusy(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setExperiments((current) => [data, ...current]);
    emitVentureEvent("venture:experiment-created", data);
    setExperimentDraft({ name: "", success_metric: "" });
    setMessage("실험을 추가했습니다.");
    router.refresh();
  }

  async function addOrchestrationRun(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabase || !selectedIdea) {
      setMessage("먼저 아이디어를 선택하세요.");
      return;
    }

    if (!user) {
      setMessage("오케스트레이션 단계를 추가하려면 먼저 로그인하세요.");
      return;
    }

    setIsBusy(true);
    setMessage(null);
    const { data, error } = await supabase
      .from("orchestration_runs")
      .insert({
        idea_id: selectedIdea.id,
        phase: runDraft.phase,
        owner_role: runDraft.owner_role.trim(),
        objective: runDraft.objective.trim(),
        status: "planned",
        organization_id: selectedIdea.organization_id,
      })
      .select()
      .single();
    setIsBusy(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setOrchestrationRuns((current) => [data, ...current]);
    setRunOutputs((current) => ({ ...current, [data.id]: data.output }));
    emitVentureEvent("venture:run-created", data);
    setMessage("오케스트레이션 단계를 추가했습니다.");
    router.refresh();
  }

  async function createRunbook() {
    if (!supabase || !selectedIdea) {
      setMessage("먼저 아이디어를 선택하세요.");
      return;
    }

    if (!user) {
      setMessage("오케스트레이션 런북을 만들려면 먼저 로그인하세요.");
      return;
    }

    const existingPhases = new Set(selectedRuns.map((run) => run.phase));
    const missingRuns = orchestrationPhaseConfigs
      .filter((config) => !existingPhases.has(config.phase))
      .map((config) => ({
        idea_id: selectedIdea.id,
        organization_id: selectedIdea.organization_id,
        phase: config.phase,
        owner_role: config.ownerRole,
        objective: config.objective,
        status: "planned" as OrchestrationStatus,
      }));

    if (missingRuns.length === 0) {
      setMessage("이 아이디어에는 이미 전체 오케스트레이션 런북이 있습니다.");
      return;
    }

    setIsBusy(true);
    setMessage(null);
    const { data, error } = await supabase.from("orchestration_runs").insert(missingRuns).select();
    setIsBusy(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setOrchestrationRuns((current) => [...(data ?? []), ...current]);
    setRunOutputs((current) => ({
      ...current,
      ...Object.fromEntries((data ?? []).map((run) => [run.id, run.output])),
    }));
    emitVentureEvent("venture:runs-created", data ?? []);
    setMessage("전체 오케스트레이션 런북을 만들었습니다.");
    router.refresh();
  }

  async function updateExperimentStatus(experiment: Experiment, status: string) {
    if (!supabase) {
      setMessage("Supabase가 설정되어 있지 않습니다.");
      return;
    }

    if (!canManageRecord(experiment)) {
      setMessage("실험 작성자 또는 워크스페이스 관리자만 이 실험을 수정할 수 있습니다.");
      return;
    }

    setIsBusy(true);
    setMessage(null);
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from("experiments")
      .update({
        status,
        started_at: status === "running" ? now : experiment.started_at,
        ended_at: status === "done" ? now : experiment.ended_at,
      })
      .eq("id", experiment.id)
      .select()
      .single();
    setIsBusy(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setExperiments((current) => current.map((item) => (item.id === data.id ? data : item)));
    emitVentureEvent("venture:experiment-updated", data);
    setMessage(`실험 상태를 ${experimentStatusLabels[status] ?? status}(으)로 변경했습니다.`);
    router.refresh();
  }

  async function updateRunStatus(run: OrchestrationRun, status: OrchestrationStatus) {
    if (!supabase) {
      setMessage("Supabase가 설정되어 있지 않습니다.");
      return;
    }

    if (!canManageRecord(run)) {
      setMessage("단계 작성자 또는 워크스페이스 관리자만 이 오케스트레이션 단계를 수정할 수 있습니다.");
      return;
    }

    setIsBusy(true);
    setMessage(null);
    const { data, error } = await supabase
      .from("orchestration_runs")
      .update({ status })
      .eq("id", run.id)
      .select()
      .single();
    setIsBusy(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setOrchestrationRuns((current) => current.map((item) => (item.id === data.id ? data : item)));
    emitVentureEvent("venture:run-updated", data);
    setMessage(`${phaseLabels[run.phase]} 상태를 ${runStatusLabels[status]}(으)로 변경했습니다.`);
    router.refresh();
  }

  async function saveRunOutput(run: OrchestrationRun) {
    if (!supabase) {
      setMessage("Supabase가 설정되어 있지 않습니다.");
      return;
    }

    if (!canManageRecord(run)) {
      setMessage("단계 작성자 또는 워크스페이스 관리자만 이 산출물을 저장할 수 있습니다.");
      return;
    }

    setIsBusy(true);
    setMessage(null);
    const { data, error } = await supabase
      .from("orchestration_runs")
      .update({ output: runOutputs[run.id] ?? "" })
      .eq("id", run.id)
      .select()
      .single();
    setIsBusy(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setOrchestrationRuns((current) => current.map((item) => (item.id === data.id ? data : item)));
    setRunOutputs((current) => ({ ...current, [data.id]: data.output }));
    emitVentureEvent("venture:run-updated", data);
    setMessage(`${phaseLabels[run.phase]} 산출물을 저장했습니다.`);
    router.refresh();
  }

  async function saveArtifactDraft(artifactType: VentureArtifactType, title: string, body: string, source: string) {
    if (!supabase || !selectedIdea) {
      setMessage("먼저 아이디어를 선택하세요.");
      return;
    }

    if (!user) {
      setMessage("산출물을 저장하려면 먼저 로그인하세요.");
      return;
    }

    if (!body.trim()) {
      setMessage("저장할 산출물 본문이 비어 있습니다.");
      return;
    }

    const nextVersion =
      Math.max(
        0,
        ...selectedArtifactRecords
          .filter((artifact) => artifact.artifact_type === artifactType)
          .map((artifact) => artifact.version ?? 1),
      ) + 1;

    setIsBusy(true);
    setMessage(null);
    const { data, error } = await supabase
      .from("venture_artifacts")
      .insert({
        idea_id: selectedIdea.id,
        organization_id: selectedIdea.organization_id,
        artifact_type: artifactType,
        status: "draft",
        version: nextVersion,
        title,
        body,
        source,
        status_note: "워크벤치에서 생성한 초기 초안입니다.",
      })
      .select()
      .single();
    setIsBusy(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setArtifacts((current) => [data, ...current]);
    emitVentureEvent("venture:artifact-created", data);
    setMessage(`${artifactLabels[artifactType]} v${nextVersion}을 저장했습니다.`);
    router.refresh();
  }

  async function updateArtifactStatus(artifact: VentureArtifact, status: VentureArtifactStatus) {
    if (!supabase) {
      setMessage("Supabase가 설정되어 있지 않습니다.");
      return;
    }

    if (!canManageRecord(artifact)) {
      setMessage("산출물 작성자 또는 워크스페이스 관리자만 이 산출물을 수정할 수 있습니다.");
      return;
    }

    setIsBusy(true);
    setMessage(null);
    const statusNote = artifactStatusNotes[artifact.id] ?? artifact.status_note ?? "";
    const { data, error } = await supabase
      .from("venture_artifacts")
      .update({
        status,
        status_note: statusNote.trim() || artifactStatusDefaultNotes[status],
        approved_by: status === "approved" ? user?.id ?? null : null,
        approved_at: status === "approved" ? new Date().toISOString() : null,
      })
      .eq("id", artifact.id)
      .select()
      .single();
    setIsBusy(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setArtifacts((current) => current.map((item) => (item.id === data.id ? data : item)));
    emitVentureEvent("venture:artifact-updated", data);
    setArtifactStatusNotes((current) => {
      const next = { ...current };
      delete next[data.id];
      return next;
    });
    setMessage(`${artifact.title || artifactLabels[artifact.artifact_type]} 상태를 ${artifactStatusLabels[status]}(으)로 변경했습니다.`);
    router.refresh();
  }

  async function createImplementationTasks() {
    if (!supabase || !selectedIdea) {
      setMessage("먼저 아이디어를 선택하세요.");
      return;
    }

    if (!user) {
      setMessage("개발 태스크를 만들려면 먼저 로그인하세요.");
      return;
    }

    const existingTitles = new Set(selectedImplementationTasks.map((task) => task.title.trim().toLowerCase()));
    const missingDrafts = implementationTaskDrafts.filter((task) => !existingTitles.has(task.title.trim().toLowerCase()));

    if (missingDrafts.length === 0) {
      setMessage("이 아이디어에는 이미 기본 개발 태스크가 있습니다.");
      return;
    }

    setIsBusy(true);
    setMessage(null);
    const { data, error } = await supabase
      .from("implementation_tasks")
      .insert(
        missingDrafts.map((task, index) => ({
          idea_id: selectedIdea.id,
          organization_id: selectedIdea.organization_id,
          source_artifact_id: implementationTaskSourceArtifact?.id ?? null,
          title: task.title,
          task_type: task.task_type,
          priority: task.priority,
          status: "todo" as ImplementationTaskStatus,
          owner_role: task.owner_role,
          acceptance_criteria: task.acceptance_criteria,
          evidence: "",
          sort_order: selectedImplementationTasks.length + index,
        })),
      )
      .select();
    setIsBusy(false);

    if (error) {
      setMessage(
        error.code === "42P01"
          ? "implementation_tasks 테이블이 아직 없습니다. 이번 배포의 Supabase SQL을 먼저 실행하세요."
          : error.message,
      );
      return;
    }

    setImplementationTasks((current) => [...current, ...(data ?? [])]);
    emitVentureEvent("venture:tasks-created", data ?? []);
    setMessage(`${missingDrafts.length}개의 개발 태스크를 만들었습니다.`);
    router.refresh();
  }

  async function addImplementationTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabase || !selectedIdea) {
      setMessage("먼저 아이디어를 선택하세요.");
      return;
    }

    if (!user) {
      setMessage("개발 태스크를 추가하려면 먼저 로그인하세요.");
      return;
    }

    if (!implementationTaskDraft.title.trim()) {
      setMessage("태스크 제목은 필수입니다.");
      return;
    }

    setIsBusy(true);
    setMessage(null);
    const { data, error } = await supabase
      .from("implementation_tasks")
      .insert({
        idea_id: selectedIdea.id,
        organization_id: selectedIdea.organization_id,
        source_artifact_id: implementationTaskSourceArtifact?.id ?? null,
        title: implementationTaskDraft.title.trim(),
        task_type: implementationTaskDraft.task_type,
        priority: implementationTaskDraft.priority,
        status: "todo",
        owner_role: implementationTaskDraft.owner_role.trim(),
        acceptance_criteria: implementationTaskDraft.acceptance_criteria.trim(),
        evidence: "",
        sort_order: selectedImplementationTasks.length,
      })
      .select()
      .single();
    setIsBusy(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setImplementationTasks((current) => [...current, data]);
    emitVentureEvent("venture:task-created", data);
    setImplementationTaskDraft({
      title: "",
      task_type: "frontend",
      priority: "medium",
      owner_role: "prototype-builder",
      acceptance_criteria: "",
    });
    setMessage("개발 태스크를 추가했습니다.");
    router.refresh();
  }

  async function updateImplementationTaskStatus(task: ImplementationTask, status: ImplementationTaskStatus) {
    if (!supabase) {
      setMessage("Supabase가 설정되어 있지 않습니다.");
      return;
    }

    if (!canManageRecord(task)) {
      setMessage("태스크 작성자 또는 워크스페이스 관리자만 이 태스크를 수정할 수 있습니다.");
      return;
    }

    setIsBusy(true);
    setMessage(null);
    const { data, error } = await supabase
      .from("implementation_tasks")
      .update({ status })
      .eq("id", task.id)
      .select()
      .single();
    setIsBusy(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setImplementationTasks((current) => current.map((item) => (item.id === data.id ? data : item)));
    emitVentureEvent("venture:task-updated", data);
    setMessage(`${task.title} 상태를 ${implementationTaskStatusLabels[status]}(으)로 변경했습니다.`);
    router.refresh();
  }

  async function saveImplementationTaskEvidence(task: ImplementationTask) {
    if (!supabase) {
      setMessage("Supabase가 설정되어 있지 않습니다.");
      return;
    }

    if (!canManageRecord(task)) {
      setMessage("태스크 작성자 또는 워크스페이스 관리자만 이 증거를 저장할 수 있습니다.");
      return;
    }

    setIsBusy(true);
    setMessage(null);
    const { data, error } = await supabase
      .from("implementation_tasks")
      .update({ evidence: implementationTaskEvidence[task.id] ?? task.evidence ?? "" })
      .eq("id", task.id)
      .select()
      .single();
    setIsBusy(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setImplementationTasks((current) => current.map((item) => (item.id === data.id ? data : item)));
    emitVentureEvent("venture:task-updated", data);
    setImplementationTaskEvidence((current) => {
      const next = { ...current };
      delete next[data.id];
      return next;
    });
    setMessage("개발 태스크 증거를 저장했습니다.");
    router.refresh();
  }

  async function updateRiskStatus(risk: Risk, status: string) {
    if (!supabase) {
      setMessage("Supabase가 설정되어 있지 않습니다.");
      return;
    }

    if (!canManageRecord(risk)) {
      setMessage("리스크 작성자 또는 워크스페이스 관리자만 이 리스크를 수정할 수 있습니다.");
      return;
    }

    setIsBusy(true);
    setMessage(null);
    const { data, error } = await supabase
      .from("risks")
      .update({ status })
      .eq("id", risk.id)
      .select()
      .single();
    setIsBusy(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setRisks((current) => current.map((item) => (item.id === data.id ? data : item)));
    emitVentureEvent("venture:risk-updated", data);
    setMessage(`리스크 상태를 ${riskStatusLabels[status] ?? status}(으)로 변경했습니다.`);
    router.refresh();
  }

  async function copyIdeaBrief() {
    if (!ideaBrief) {
      return;
    }

    await navigator.clipboard.writeText(ideaBrief);
    setCopyMessage("아이디어 브리프를 클립보드에 복사했습니다.");
  }

  async function copyPrdDraft() {
    if (!prdDraft) {
      return;
    }

    await navigator.clipboard.writeText(prdDraft);
    setCopyMessage("PRD 초안을 클립보드에 복사했습니다.");
  }

  async function copyMvpSpecDraft() {
    if (!mvpSpecDraft) {
      return;
    }

    await navigator.clipboard.writeText(mvpSpecDraft);
    setCopyMessage("MVP 명세를 클립보드에 복사했습니다.");
  }

  async function copyDevelopmentPlanDraft() {
    if (!developmentPlanDraft) {
      return;
    }

    await navigator.clipboard.writeText(developmentPlanDraft);
    setCopyMessage("앱 개발 실행 계획을 클립보드에 복사했습니다.");
  }

  async function copyDraft(body: string, label: string) {
    if (!body) {
      return;
    }

    await navigator.clipboard.writeText(body);
    setCopyMessage(`${label}을 클립보드에 복사했습니다.`);
  }

  async function copyLaunchChecklistDraft() {
    if (!launchChecklistDraft) {
      return;
    }

    await navigator.clipboard.writeText(launchChecklistDraft);
    setCopyMessage("출시 체크리스트를 클립보드에 복사했습니다.");
  }

  function loadExperimentSuggestion(suggestion: ExperimentDraft) {
    setExperimentDraft(suggestion);
    updateActiveTask("experiment");
    setMessage("추천 실험을 실험 입력란에 채웠습니다. 성공 지표를 검토한 뒤 저장하세요.");
  }

  function loadRiskSuggestion(suggestion: RiskDraft) {
    setRiskDraft(suggestion);
    updateActiveTask("risk");
    setMessage("추천 리스크를 리스크 입력란에 채웠습니다. 완화 방안을 검토한 뒤 저장하세요.");
  }

  function loadDecisionTemplate() {
    if (!validationPlan) {
      return;
    }

    setDecisionReason(
      `${validationPlan.status}: ${validationPlan.statusDetail}\n\n다음 행동: ${validationPlan.nextAction}\n\n확인할 핵심 가설\n- ${validationPlan.hypotheses.join(
        "\n- ",
      )}`,
    );
    updateActiveTask("decision");
    setMessage("검증 상태 기반 판단 근거 초안을 채웠습니다. 최종 판단을 확인한 뒤 기록하세요.");
  }

  return (
    <section className={showSidebar ? "grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)]" : "grid gap-6"}>
      {showSidebar ? (
      <aside className="grid gap-4 lg:sticky lg:top-6 lg:self-start">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">아이디어 워크벤치</h2>
            <p className="mt-1 text-sm text-slate-500">아이디어를 선택하고 점수화한 뒤 실험실 단계를 이동시킵니다.</p>
          </div>
          <ClipboardList className="text-blue-600" size={24} />
        </div>

        <div className="mb-4 grid grid-cols-3 gap-2 rounded-lg bg-slate-100 p-1">
          {[
            ["all", filterModeLabels.all],
            ["mine", filterModeLabels.mine],
            ["read_only", filterModeLabels.read_only],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilterMode(value as "all" | "mine" | "read_only")}
              className={`h-9 rounded-md text-sm font-semibold transition ${
                filterMode === value ? "bg-white text-slate-950 shadow-sm" : "text-slate-600 hover:text-slate-950"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="grid gap-3">
          {visibleIdeas.length > 0 ? (
            visibleIdeas.map((idea) => {
              const isOwned = Boolean(user && idea.created_by === user.id);
              const isOrgAdmin = Boolean(
                user &&
                  idea.organization_id &&
                  memberships.some(
                    (membership) =>
                      membership.user_id === user.id &&
                      membership.organization_id === idea.organization_id &&
                      adminRoles.has(membership.role),
                  ),
              );

              return (
                <button
                  key={idea.id}
                  type="button"
                  onClick={() => {
                    setSelectedIdeaId(idea.id);
                    setEditState(toEditState(idea));
                    updateActiveTask("score");
                  }}
                  className={`rounded-lg border p-4 text-left transition ${
                    idea.id === selectedIdea.id
                      ? "border-blue-300 bg-blue-50"
                      : "border-slate-200 bg-slate-50 hover:border-slate-300"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-semibold text-slate-950">{idea.name}</span>
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-md bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 shadow-sm">
                        {stageLabels[idea.stage]}
                      </span>
                      <span
                        className={`rounded-md px-2.5 py-1 text-xs font-semibold ${
                          isOwned || isOrgAdmin ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {isOwned
                          ? editabilityLabels.editable
                          : isOrgAdmin
                            ? editabilityLabels.orgAdmin
                            : editabilityLabels.readOnly}
                      </span>
                    </div>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{idea.one_liner || idea.signal}</p>
                </button>
              );
            })
          ) : (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              이 필터에 맞는 아이디어가 아직 없습니다.
            </div>
          )}
        </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-slate-950">작업 순서</h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">단계를 고르면 오른쪽 작업 화면만 바뀝니다.</p>
          </div>
          <div className="grid gap-2">
            {workbenchTasks.map((task, index) => (
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
        </div>
      </aside>
      ) : null}

      <div className="grid min-w-0 gap-6">
        <div
          className={`rounded-lg border border-slate-200 bg-white p-6 shadow-sm ${
            activeTask === "select" ? "" : "hidden"
          }`}
        >
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">아이디어 선택</h2>
              <p className="mt-1 text-sm text-slate-500">평가하거나 실행할 아이디어를 먼저 고릅니다.</p>
            </div>
            <ClipboardList className="text-blue-600" size={24} />
          </div>

          <div className="mb-4 grid grid-cols-3 gap-2 rounded-lg bg-slate-100 p-1">
            {[
              ["all", filterModeLabels.all],
              ["mine", filterModeLabels.mine],
              ["read_only", filterModeLabels.read_only],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilterMode(value as "all" | "mine" | "read_only")}
                className={`h-9 rounded-md text-sm font-semibold transition ${
                  filterMode === value ? "bg-white text-slate-950 shadow-sm" : "text-slate-600 hover:text-slate-950"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {visibleIdeas.map((idea) => {
              const isOwned = Boolean(user && idea.created_by === user.id);
              const isOrgAdmin = Boolean(
                user &&
                  idea.organization_id &&
                  memberships.some(
                    (membership) =>
                      membership.user_id === user.id &&
                      membership.organization_id === idea.organization_id &&
                      adminRoles.has(membership.role),
                  ),
              );

              return (
                <button
                  key={idea.id}
                  type="button"
                  onClick={() => {
                    setSelectedIdeaId(idea.id);
                    setEditState(toEditState(idea));
                    updateActiveTask("score");
                  }}
                  className={`rounded-lg border p-4 text-left transition ${
                    idea.id === selectedIdea.id
                      ? "border-blue-300 bg-blue-50"
                      : "border-slate-200 bg-slate-50 hover:border-slate-300"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-semibold text-slate-950">{idea.name}</span>
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-md bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 shadow-sm">
                        {stageLabels[idea.stage]}
                      </span>
                      <span
                        className={`rounded-md px-2.5 py-1 text-xs font-semibold ${
                          isOwned || isOrgAdmin ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {isOwned
                          ? editabilityLabels.editable
                          : isOrgAdmin
                            ? editabilityLabels.orgAdmin
                            : editabilityLabels.readOnly}
                      </span>
                    </div>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{idea.one_liner || idea.signal}</p>
                </button>
              );
            })}
          </div>
        </div>

        <form
          onSubmit={saveIdea}
          className={`rounded-lg border border-slate-200 bg-white p-6 shadow-sm ${activeTask === "score" ? "" : "hidden"}`}
        >
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">{selectedIdea.name}</h2>
              <p className="mt-1 text-sm text-slate-500">
                {canEdit
                  ? "현재 운영자가 편집할 수 있습니다."
                  : "직접 만든 아이디어가 아니면 읽기 전용입니다. 새 아이디어를 만들면 바로 점수화할 수 있습니다."}
              </p>
            </div>
            <button
              type="submit"
              disabled={isBusy || !canEdit}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isBusy ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
              점수 저장
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <SelectField
              label="단계"
              value={editState.stage}
              options={stages}
              labels={stageLabels}
              disabled={!canEdit}
              onChange={(value) => setEditState({ ...editState, stage: value as IdeaStage })}
            />
            <SelectField
              label="판단"
              value={editState.decision}
              options={decisions}
              labels={decisionLabels}
              disabled={!canEdit}
              onChange={(value) => setEditState({ ...editState, decision: value as DecisionStatus })}
            />
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <ScoreInput
              label="문제 강도"
              value={editState.problem_intensity}
              disabled={!canEdit}
              onChange={(value) => setEditState({ ...editState, problem_intensity: value })}
            />
            <ScoreInput
              label="발생 빈도"
              value={editState.frequency}
              disabled={!canEdit}
              onChange={(value) => setEditState({ ...editState, frequency: value })}
            />
            <ScoreInput
              label="도달 가능성"
              value={editState.reachability}
              disabled={!canEdit}
              onChange={(value) => setEditState({ ...editState, reachability: value })}
            />
            <ScoreInput
              label="지불 의향"
              value={editState.willingness_to_pay}
              disabled={!canEdit}
              onChange={(value) => setEditState({ ...editState, willingness_to_pay: value })}
            />
            <ScoreInput
              label="MVP 속도"
              value={editState.mvp_speed}
              disabled={!canEdit}
              onChange={(value) => setEditState({ ...editState, mvp_speed: value })}
            />
            <ScoreInput
              label="차별성"
              value={editState.differentiation}
              disabled={!canEdit}
              onChange={(value) => setEditState({ ...editState, differentiation: value })}
            />
            <ScoreInput
              label="리스크 감점"
              value={editState.regulatory_risk}
              disabled={!canEdit}
              onChange={(value) => setEditState({ ...editState, regulatory_risk: value })}
            />
            <div className="rounded-lg bg-blue-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">점수</div>
              <div className="mt-2 text-3xl font-semibold text-blue-950">{currentScore}</div>
            </div>
          </div>

          <div className="mt-5 grid gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4 md:grid-cols-[0.65fr_1.35fr]">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                추천 판단
              </div>
              <div className="mt-2 text-2xl font-semibold text-slate-950">
                {decisionLabels[scoreRecommendation]}
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                점수 게이트는 참고용입니다. 증거와 리스크를 검토한 뒤 최종 판단을 기록하세요.
              </p>
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-950">증거 공백</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {missing.length > 0 ? (
                  missing.map((item) => (
                    <span key={item} className="rounded-md bg-white px-2.5 py-1 text-xs font-semibold text-amber-800">
                      {item}
                    </span>
                  ))
                ) : (
                  <span className="rounded-md bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                    PRD 검토 준비 완료
                  </span>
                )}
              </div>
            </div>
          </div>

          {validationPlan ? (
            <div className="mt-5 rounded-lg border border-blue-100 bg-blue-50 p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">검증 설계</div>
                  <h3 className="mt-1 text-lg font-semibold text-blue-950">{validationPlan.status}</h3>
                  <p className="mt-1 text-sm leading-6 text-blue-900">{validationPlan.statusDetail}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => loadExperimentSuggestion(validationPlan.experiments[0])}
                    className="inline-flex h-10 items-center justify-center rounded-md bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    첫 실험 채우기
                  </button>
                  <button
                    type="button"
                    onClick={() => loadRiskSuggestion(validationPlan.risks[0])}
                    className="inline-flex h-10 items-center justify-center rounded-md bg-white px-4 text-sm font-semibold text-blue-800 shadow-sm transition hover:bg-blue-100"
                  >
                    핵심 리스크 채우기
                  </button>
                  <button
                    type="button"
                    onClick={loadDecisionTemplate}
                    className="inline-flex h-10 items-center justify-center rounded-md bg-white px-4 text-sm font-semibold text-blue-800 shadow-sm transition hover:bg-blue-100"
                  >
                    판단 근거 채우기
                  </button>
                </div>
              </div>

              <div className="mt-4 grid gap-3 xl:grid-cols-3">
                <div className="rounded-md bg-white p-3">
                  <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">핵심 가설</div>
                  <ul className="mt-2 grid gap-1 text-sm leading-6 text-slate-700">
                    {validationPlan.hypotheses.map((item) => (
                      <li key={item}>- {item}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-md bg-white p-3">
                  <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">추천 실험</div>
                  <div className="mt-2 grid gap-2">
                    {validationPlan.experiments.map((experiment) => (
                      <button
                        key={experiment.name}
                        type="button"
                        onClick={() => loadExperimentSuggestion(experiment)}
                        className="rounded-md border border-slate-200 bg-slate-50 p-3 text-left transition hover:border-blue-200 hover:bg-blue-50"
                      >
                        <div className="text-sm font-semibold text-slate-950">{experiment.name}</div>
                        <div className="mt-1 text-xs leading-5 text-slate-600">{experiment.success_metric}</div>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="rounded-md bg-white p-3">
                  <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">인터뷰 질문</div>
                  <ul className="mt-2 grid gap-1 text-sm leading-6 text-slate-700">
                    {validationPlan.interviewQuestions.map((item) => (
                      <li key={item}>- {item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <p className="mt-3 text-sm leading-6 text-blue-900">{validationPlan.nextAction}</p>
            </div>
          ) : null}

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <TextArea
              label="수요 신호"
              value={editState.signal}
              disabled={!canEdit}
              onChange={(value) => setEditState({ ...editState, signal: value })}
            />
            <TextArea
              label="리스크 요약"
              value={editState.risk_summary}
              disabled={!canEdit}
              onChange={(value) => setEditState({ ...editState, risk_summary: value })}
            />
            <TextArea
              label="다음 증거"
              value={editState.next_evidence}
              disabled={!canEdit}
              onChange={(value) => setEditState({ ...editState, next_evidence: value })}
            />
          </div>
        </form>

        <div
          className={`rounded-lg border border-slate-200 bg-white p-6 shadow-sm ${
            activeTask === "development" ? "" : "hidden"
          }`}
        >
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">앱 개발 프로세스</h2>
              <p className="mt-1 text-sm text-slate-500">
                검증된 아이디어를 기획, 디자인, 개발, QA, 보안, 배포로 옮기는 실행 계획입니다.
              </p>
            </div>
            <Code2 className="text-blue-600" size={22} />
          </div>

          <div className="grid gap-3 lg:grid-cols-4">
            {[
              ["기획", "PRD, MVP 범위, 성공 지표, 제외 범위를 확정합니다."],
              ["디자인", "핵심 여정, 화면 상태, 모바일/접근성 리스크를 정리합니다."],
              ["개발", "데이터 모델, RLS, 입력/저장/조회, 이벤트 기록을 구현합니다."],
              ["배포", "Preview, 스모크 테스트, 프로덕션 배포, 롤백 경로를 확인합니다."],
            ].map(([label, detail], index) => (
              <div key={label} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
                    {index + 1}
                  </span>
                  <div className="text-sm font-semibold text-slate-950">{label}</div>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">{detail}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={createRunbook}
              disabled={isBusy || !user}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Layers3 size={18} />
              개발 런북 만들기
            </button>
            <button
              type="button"
              onClick={copyDevelopmentPlanDraft}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
            >
              <Clipboard size={18} />
              계획 복사
            </button>
            <button
              type="button"
              onClick={() =>
                saveArtifactDraft(
                  "dev_runbook",
                  `${selectedIdea.name} 개발 런북`,
                  developmentPlanDraft,
                  "development_process",
                )
              }
              disabled={isBusy || !user}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save size={18} />
              개발 런북 저장
            </button>
          </div>

          <div className="mt-5 grid gap-3 lg:grid-cols-3">
            {developmentArtifactDrafts.map((draft) => (
              <div key={draft.artifactType} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm font-semibold text-slate-950">{artifactLabels[draft.artifactType]}</div>
                <p className="mt-2 min-h-12 text-sm leading-6 text-slate-600">{draft.description}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => copyDraft(draft.body, artifactLabels[draft.artifactType])}
                    className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-800 transition hover:bg-slate-50"
                  >
                    <Clipboard size={15} />
                    복사
                  </button>
                  <button
                    type="button"
                    onClick={() => saveArtifactDraft(draft.artifactType, draft.title, draft.body, "development_process")}
                    disabled={isBusy || !user}
                    className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-slate-950 px-3 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Save size={15} />
                    저장
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="text-base font-semibold text-slate-950">개발 태스크 보드</h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  저장된 PRD, 명세, 런북을 바탕으로 실제 구현 작업을 쪼개고 완료 증거를 남깁니다.
                </p>
              </div>
              <button
                type="button"
                onClick={createImplementationTasks}
                disabled={isBusy || !user}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-slate-950 px-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ClipboardList size={16} />
                기본 태스크 생성
              </button>
            </div>

            <form onSubmit={addImplementationTask} className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
              <div className="mb-3">
                <h4 className="text-sm font-semibold text-slate-950">직접 태스크 추가</h4>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  자동 생성 태스크 밖의 버그, 디자인 수정, 배포 작업, 고객 검증 작업을 바로 추가합니다.
                </p>
              </div>
              <div className="grid gap-3 lg:grid-cols-[minmax(0,1.2fr)_0.8fr_0.7fr_0.9fr]">
                <InputField
                  label="태스크 제목"
                  value={implementationTaskDraft.title}
                  onChange={(value) => setImplementationTaskDraft((current) => ({ ...current, title: value }))}
                />
                <SelectField
                  label="유형"
                  value={implementationTaskDraft.task_type}
                  options={implementationTaskTypes}
                  labels={implementationTaskTypeLabels}
                  onChange={(value) => setImplementationTaskDraft((current) => ({ ...current, task_type: value }))}
                />
                <SelectField
                  label="우선순위"
                  value={implementationTaskDraft.priority}
                  options={implementationTaskPriorities}
                  labels={implementationTaskPriorityLabels}
                  onChange={(value) => setImplementationTaskDraft((current) => ({ ...current, priority: value }))}
                />
                <InputField
                  label="담당 역할"
                  value={implementationTaskDraft.owner_role}
                  onChange={(value) => setImplementationTaskDraft((current) => ({ ...current, owner_role: value }))}
                />
              </div>
              <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
                <TextArea
                  label="수용 기준"
                  value={implementationTaskDraft.acceptance_criteria}
                  onChange={(value) =>
                    setImplementationTaskDraft((current) => ({ ...current, acceptance_criteria: value }))
                  }
                />
                <button
                  type="submit"
                  disabled={isBusy || !user}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Save size={16} />
                  태스크 추가
                </button>
              </div>
            </form>

            {selectedImplementationTasks.length > 0 ? (
              <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50 p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-blue-950">다음 개발 액션</h4>
                    {nextImplementationTask ? (
                      <>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span className="text-base font-semibold text-slate-950">{nextImplementationTask.title}</span>
                          <span
                            className={`rounded-md px-2 py-1 text-xs font-semibold ${
                              implementationTaskStatusTone[nextImplementationTask.status]
                            }`}
                          >
                            {implementationTaskStatusLabels[nextImplementationTask.status]}
                          </span>
                          <span
                            className={`rounded-md px-2 py-1 text-xs font-semibold ${
                              implementationTaskPriorityTone[nextImplementationTask.priority]
                            }`}
                          >
                            {implementationTaskPriorityLabels[nextImplementationTask.priority]}
                          </span>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-blue-900">
                          {nextImplementationTask.status === "blocked"
                            ? "차단 상태입니다. 먼저 차단 사유와 해소 증거를 기록하세요."
                            : nextImplementationTask.status === "doing"
                              ? "이미 진행 중입니다. 완료 증거를 붙이고 완료로 이동하세요."
                              : "바로 시작하기 좋은 다음 태스크입니다. 진행 시작 후 증거를 남기세요."}
                        </p>
                        <div className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">
                          {nextImplementationTask.owner_role || "owner 미정"}
                        </div>
                      </>
                    ) : (
                      <p className="mt-2 text-sm leading-6 text-blue-900">
                        열린 개발 태스크가 없습니다. 개발 완료 게이트와 출시 준비도를 확인하세요.
                      </p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {nextImplementationTask ? (
                      <>
                        {nextImplementationTask.status === "todo" ? (
                          <button
                            type="button"
                            onClick={() => updateImplementationTaskStatus(nextImplementationTask, "doing")}
                            disabled={isBusy || !canManageRecord(nextImplementationTask)}
                            className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-blue-600 px-3 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            진행 시작
                          </button>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => copyDraft(implementationTaskTicketDraft, "다음 개발 티켓")}
                          className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-blue-200 bg-white px-3 text-xs font-semibold text-blue-800 transition hover:bg-blue-50"
                        >
                          <Clipboard size={15} />
                          티켓 복사
                        </button>
                      </>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => copyDraft(implementationBacklogDraft, "열린 개발 백로그")}
                      className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-blue-200 bg-white px-3 text-xs font-semibold text-blue-800 transition hover:bg-blue-50"
                    >
                      <ClipboardList size={15} />
                      백로그 복사
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="mt-4 grid gap-3 xl:grid-cols-4">
              {implementationTaskStatuses.map((status) => {
                const tasksInStatus = selectedImplementationTasks.filter((task) => task.status === status);

                return (
                  <section key={status} className="min-h-44 rounded-lg border border-slate-200 bg-white p-3">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <span className={`rounded-md px-2 py-1 text-xs font-semibold ${implementationTaskStatusTone[status]}`}>
                        {implementationTaskStatusLabels[status]}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">{tasksInStatus.length}개</span>
                    </div>

                    <div className="grid gap-3">
                      {tasksInStatus.length > 0 ? (
                        tasksInStatus.map((task) => (
                          <div key={task.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-semibold text-slate-950">{task.title}</span>
                              <span className="rounded-md bg-white px-2 py-1 text-xs font-semibold text-slate-600">
                                {implementationTaskTypeLabels[task.task_type]}
                              </span>
                              <span className={`rounded-md px-2 py-1 text-xs font-semibold ${implementationTaskPriorityTone[task.priority]}`}>
                                {implementationTaskPriorityLabels[task.priority]}
                              </span>
                            </div>
                            <div className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                              {task.owner_role || "owner 미정"}
                            </div>
                            <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">{task.acceptance_criteria}</p>
                            <textarea
                              value={implementationTaskEvidence[task.id] ?? task.evidence ?? ""}
                              onChange={(event) =>
                                setImplementationTaskEvidence((current) => ({
                                  ...current,
                                  [task.id]: event.target.value,
                                }))
                              }
                              disabled={isBusy || !canManageRecord(task)}
                              rows={3}
                              placeholder="완료 증거, PR/커밋, 스모크 결과, 남은 리스크"
                              className="mt-3 w-full resize-y rounded-md border border-slate-300 bg-white px-3 py-2 text-sm leading-6 text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
                            />
                            <div className="mt-3 flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => saveImplementationTaskEvidence(task)}
                                disabled={
                                  isBusy ||
                                  !canManageRecord(task) ||
                                  (implementationTaskEvidence[task.id] ?? task.evidence ?? "") === (task.evidence ?? "")
                                }
                                className="inline-flex h-8 items-center justify-center rounded-md bg-white px-2.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-45"
                              >
                                증거 저장
                              </button>
                              {implementationTaskStatuses.map((nextStatus) => (
                                <button
                                  key={nextStatus}
                                  type="button"
                                  onClick={() => updateImplementationTaskStatus(task, nextStatus)}
                                  disabled={isBusy || !canManageRecord(task) || task.status === nextStatus}
                                  className="inline-flex h-8 items-center justify-center rounded-md bg-white px-2.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-45"
                                >
                                  {implementationTaskStatusLabels[nextStatus]}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="rounded-md border border-dashed border-slate-200 bg-slate-50 p-3 text-sm leading-6 text-slate-500">
                          아직 {implementationTaskStatusLabels[status]} 상태의 태스크가 없습니다.
                        </div>
                      )}
                    </div>
                  </section>
                );
              })}
            </div>

            {selectedImplementationTasks.length === 0 ? (
              <p className="mt-3 text-sm leading-6 text-slate-600">
                먼저 PRD, MVP 명세, 기술 명세, 개발 런북을 저장한 뒤 기본 태스크를 생성하면 구현 작업이 자동으로 분해됩니다.
              </p>
            ) : null}
          </div>

          <div className="mt-5 rounded-lg border border-emerald-100 bg-emerald-50 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="text-base font-semibold text-emerald-950">개발 완료 게이트</h3>
                <p className="mt-1 text-sm leading-6 text-emerald-900">
                  구현 태스크, 완료 증거, QA/보안 단계를 기준으로 개발 완료 보고서를 만듭니다.
                </p>
              </div>
              <div className="rounded-lg bg-emerald-950 px-4 py-3 text-right text-white">
                <div className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-200">
                  통과 {passedImplementationGateCount}/{implementationGateChecks.length}
                </div>
                <div className="mt-1 text-2xl font-semibold">{implementationGateScore}%</div>
              </div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              {implementationGateChecks.map((check) => (
                <div key={check.label} className="rounded-lg border border-emerald-100 bg-white p-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle2
                      size={18}
                      className={check.passed ? "mt-0.5 shrink-0 text-emerald-600" : "mt-0.5 shrink-0 text-slate-400"}
                    />
                    <div>
                      <div className="text-sm font-semibold text-slate-950">{check.label}</div>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{check.detail}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => copyDraft(developmentCompletionReportDraft, "개발 완료 보고서")}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-emerald-200 bg-white px-3 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-50"
              >
                <Clipboard size={16} />
                보고서 복사
              </button>
              <button
                type="button"
                onClick={() =>
                  saveArtifactDraft(
                    "dev_runbook",
                    `${selectedIdea.name} 개발 완료 보고서`,
                    developmentCompletionReportDraft,
                    "development_report",
                  )
                }
                disabled={isBusy || !user}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-emerald-700 px-3 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Save size={16} />
                보고서 저장
              </button>
            </div>
          </div>

          <textarea
            value={developmentPlanDraft}
            readOnly
            rows={24}
            className="mt-4 w-full resize-y rounded-md border border-slate-300 bg-slate-50 px-3 py-2 font-mono text-sm leading-6 text-slate-700 outline-none"
          />
          {copyMessage ? <p className="mt-3 text-sm text-slate-600">{copyMessage}</p> : null}

          <div className="mt-5 rounded-lg border border-blue-100 bg-blue-50 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="text-base font-semibold text-blue-950">Codex 구현 핸드오프</h3>
                <p className="mt-1 text-sm leading-6 text-blue-900">
                  검증된 아이디어를 실제 앱 개발 작업으로 넘길 때 쓰는 구현 프롬프트입니다.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => copyDraft(implementationHandoffDraft, "Codex 구현 핸드오프")}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-blue-200 bg-white px-3 text-sm font-semibold text-blue-800 transition hover:bg-blue-50"
                >
                  <Clipboard size={16} />
                  복사
                </button>
                <button
                  type="button"
                  onClick={() =>
                    saveArtifactDraft(
                      "dev_runbook",
                      `${selectedIdea.name} Codex 구현 핸드오프`,
                      implementationHandoffDraft,
                      "development_process",
                    )
                  }
                  disabled={isBusy || !user}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-blue-600 px-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Save size={16} />
                  저장
                </button>
              </div>
            </div>
            <textarea
              value={implementationHandoffDraft}
              readOnly
              rows={14}
              className="mt-4 w-full resize-y rounded-md border border-blue-200 bg-white px-3 py-2 font-mono text-sm leading-6 text-slate-700 outline-none"
            />
          </div>
        </div>

        <div className={`rounded-lg border border-slate-200 bg-white p-6 shadow-sm ${activeTask === "launch" ? "" : "hidden"}`}>
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">출시 준비도</h2>
              <p className="mt-1 text-sm text-slate-500">증거, 산출물, 리스크, 실행 단계를 기준으로 게이트 상태를 요약합니다.</p>
            </div>
            <div className="rounded-lg bg-slate-950 px-4 py-3 text-right text-white">
              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-300">
                준비 {passedLaunchReadinessCount}/{launchReadiness.length}
              </div>
              <div className="mt-1 text-2xl font-semibold">{launchReadinessScore}%</div>
            </div>
          </div>
          <div
            className={`mb-4 border-l-4 pl-4 ${
              nextLaunchBlocker ? "border-amber-300" : "border-emerald-300"
            }`}
          >
            <div className="text-sm font-semibold text-slate-950">
              {nextLaunchBlocker ? `다음 해소 항목: ${nextLaunchBlocker.label}` : "현재 출시 게이트가 모두 통과 상태입니다."}
            </div>
            <div className="mt-1 text-sm leading-6 text-slate-600">
              {nextLaunchBlocker ? nextLaunchBlocker.detail : "출시 전 최종 판단을 기록하세요."}
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {launchReadiness.map((check) => (
              <div key={check.label} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2
                    className={check.passed ? "mt-0.5 shrink-0 text-emerald-600" : "mt-0.5 shrink-0 text-slate-400"}
                    size={18}
                  />
                  <div>
                    <div className="text-sm font-semibold text-slate-950">{check.label}</div>
                    <div className="mt-1 text-sm leading-6 text-slate-600">{check.detail}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          className={`rounded-lg border border-slate-200 bg-white p-6 shadow-sm ${
            activeTask === "orchestration" ? "" : "hidden"
          }`}
        >
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">오케스트레이션 보드</h2>
              <p className="mt-1 text-sm text-slate-500">전략부터 출시까지 각 전문 역할의 실행 단계를 추적합니다.</p>
            </div>
            <button
              type="button"
              onClick={createRunbook}
              disabled={isBusy || !user}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Layers3 size={18} />
              런북 만들기
            </button>
          </div>

          <form onSubmit={addOrchestrationRun} className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="grid gap-3 md:grid-cols-[0.75fr_1fr]">
              <SelectField
                label="단계"
                value={runDraft.phase}
                options={orchestrationPhaseConfigs.map((config) => config.phase)}
                labels={phaseLabels}
                disabled={!user}
                onChange={(value) => {
                  const nextPhase = value as OrchestrationPhase;
                  const config = orchestrationPhaseConfigs.find((item) => item.phase === nextPhase);
                  setRunDraft({
                    phase: nextPhase,
                    owner_role: config?.ownerRole ?? runDraft.owner_role,
                    objective: config?.objective ?? runDraft.objective,
                  });
                }}
              />
              <InputField
                label="담당 역할"
                value={runDraft.owner_role}
                onChange={(value) => setRunDraft({ ...runDraft, owner_role: value })}
              />
            </div>
            <TextArea
              label="목표"
              value={runDraft.objective}
              disabled={!user}
              onChange={(value) => setRunDraft({ ...runDraft, objective: value })}
            />
            <button
              type="submit"
              disabled={isBusy || !user}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Layers3 size={18} />
              단계 추가
            </button>
          </form>

          <div className="mt-4 grid gap-3">
            {selectedRuns.length > 0 ? (
              selectedRuns.map((run) => (
                <div key={run.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-slate-950">{phaseLabels[run.phase]}</span>
                        <span className={`rounded-md px-2 py-1 text-xs font-semibold ${runStatusTone[run.status]}`}>
                          {runStatusLabels[run.status]}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{run.objective || "목표 미정"}</p>
                      <div className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                        {run.owner_role || "담당 미정"}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {orchestrationStatuses.map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => updateRunStatus(run, status)}
                          disabled={isBusy || !canManageRecord(run) || run.status === status}
                          className="h-8 rounded-md bg-white px-2.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-45"
                        >
                          {runStatusLabels[status]}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mt-4 grid gap-3">
                    <TextArea
                      label="산출물"
                      value={runOutputs[run.id] ?? run.output}
                      disabled={!canManageRecord(run)}
                      onChange={(value) => setRunOutputs((current) => ({ ...current, [run.id]: value }))}
                    />
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setRunOutputs((current) => ({
                            ...current,
                            [run.id]: buildRunOutputTemplate(run, selectedIdea, editState),
                          }))
                        }
                        disabled={isBusy || !canManageRecord(run)}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-white px-4 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-45"
                      >
                        <ClipboardList size={16} />
                        템플릿 사용
                      </button>
                      <button
                        type="button"
                        onClick={() => saveRunOutput(run)}
                        disabled={isBusy || !canManageRecord(run) || (runOutputs[run.id] ?? run.output) === run.output}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-white px-4 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-45"
                      >
                        <Save size={16} />
                        산출물 저장
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                아직 연결된 오케스트레이션 단계가 없습니다.
              </div>
            )}
          </div>
        </div>

        <div className={activeTask === "risk" || activeTask === "decision" ? "grid gap-6" : "hidden"}>
          <form
            onSubmit={addRisk}
            className={`rounded-lg border border-slate-200 bg-white p-6 shadow-sm ${activeTask === "risk" ? "" : "hidden"}`}
          >
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">리스크 추가</h2>
                <p className="mt-1 text-sm text-slate-500">선택한 아이디어의 출시 차단 요인을 기록합니다.</p>
              </div>
              <ShieldAlert className="text-rose-600" size={22} />
            </div>
            <div className="grid gap-3">
              <InputField
                label="제목"
                value={riskDraft.title}
                onChange={(value) => setRiskDraft({ ...riskDraft, title: value })}
              />
              <InputField
                label="영역"
                value={riskDraft.area}
                onChange={(value) => setRiskDraft({ ...riskDraft, area: value })}
              />
              <SelectField
                label="심각도"
                value={riskDraft.severity}
                options={riskSeverities}
                labels={riskSeverityLabels}
                disabled={!user}
                onChange={(value) => setRiskDraft({ ...riskDraft, severity: value as RiskSeverity })}
              />
              <TextArea
                label="완화 방안"
                value={riskDraft.mitigation}
                disabled={!user}
                onChange={(value) => setRiskDraft({ ...riskDraft, mitigation: value })}
              />
              <button
                type="submit"
                disabled={isBusy || !user}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-rose-600 px-4 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Flag size={18} />
                리스크 추가
              </button>
            </div>
          </form>

          <div
            className={`rounded-lg border border-slate-200 bg-white p-6 shadow-sm ${
              activeTask === "decision" ? "" : "hidden"
            }`}
          >
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">판단 기록</h2>
                <p className="mt-1 text-sm text-slate-500">이 아이디어를 진행하거나 멈추는 이유를 남깁니다.</p>
              </div>
              <CheckCircle2 className="text-emerald-600" size={22} />
            </div>
            <div className="grid gap-3">
              <TextArea
                label="판단 근거"
                value={decisionReason}
                disabled={!canEdit}
                onChange={(value) => setDecisionReason(value)}
              />
              <button
                type="button"
                onClick={recordDecision}
                disabled={isBusy || !canEdit}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <CheckCircle2 size={18} />
                {decisionLabels[editState.decision]} 기록
              </button>
              <div className="mt-2 grid gap-2">
                {selectedDecisions.length > 0 ? (
                  selectedDecisions.map((entry) => (
                    <div key={entry.id} className="rounded-md bg-slate-50 p-3 text-sm text-slate-600">
                      <span className="font-semibold text-slate-950">{decisionLabels[entry.decision]}</span>
                      {entry.reason ? ` - ${entry.reason}` : ""}
                    </div>
                  ))
                ) : (
                  <div className="rounded-md bg-slate-50 p-3 text-sm text-slate-500">아직 기록된 판단이 없습니다.</div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div
          className={`rounded-lg border border-slate-200 bg-white p-6 shadow-sm ${
            activeTask === "experiment" ? "" : "hidden"
          }`}
        >
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">실험 계획</h2>
              <p className="mt-1 text-sm text-slate-500">선택한 아이디어에서 다음에 수행할 가장 작은 검증 실험을 정의합니다.</p>
            </div>
            <Beaker className="text-violet-600" size={22} />
          </div>
          <form onSubmit={addExperiment} className="grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end">
            <InputField
              label="실험"
              value={experimentDraft.name}
              onChange={(value) => setExperimentDraft({ ...experimentDraft, name: value })}
            />
            <InputField
              label="성공 지표"
              value={experimentDraft.success_metric}
              onChange={(value) => setExperimentDraft({ ...experimentDraft, success_metric: value })}
            />
            <button
              type="submit"
              disabled={isBusy || !user}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-violet-600 px-4 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Beaker size={18} />
              실험 추가
            </button>
          </form>
          <div className="mt-4 grid gap-3">
            {selectedExperiments.length > 0 ? (
              selectedExperiments.map((experiment) => (
                <div key={experiment.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-slate-950">{experiment.name}</span>
                    <span className="rounded-md bg-white px-2 py-1 text-xs font-semibold text-slate-600">
                      {experimentStatusLabels[experiment.status] ?? experiment.status}
                    </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {["planned", "running", "done"].map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => updateExperimentStatus(experiment, status)}
                          disabled={isBusy || !canManageRecord(experiment) || experiment.status === status}
                          className="h-8 rounded-md bg-white px-2.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-45"
                        >
                          {experimentStatusLabels[status] ?? status}
                        </button>
                      ))}
                    </div>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {experiment.success_metric || "성공 지표 미정"}
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                아직 연결된 실험이 없습니다.
              </div>
            )}
          </div>
        </div>

        <div
          className={`rounded-lg border border-slate-200 bg-white p-6 shadow-sm ${activeTask === "risk" ? "" : "hidden"}`}
        >
          <h2 className="text-lg font-semibold text-slate-950">관련 리스크</h2>
          <div className="mt-4 grid gap-3">
            {selectedRisks.map((risk) => (
              <div key={risk.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-slate-950">{risk.title}</span>
                    <span className="rounded-md bg-white px-2 py-1 text-xs font-semibold text-slate-600">
                      {riskSeverityLabels[risk.severity]}
                    </span>
                    <span className="rounded-md bg-white px-2 py-1 text-xs font-semibold text-slate-600">
                      {riskStatusLabels[risk.status] ?? risk.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {["open", "mitigating", "closed"].map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => updateRiskStatus(risk, status)}
                        disabled={isBusy || !canManageRecord(risk) || risk.status === status}
                        className="h-8 rounded-md bg-white px-2.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-45"
                      >
                        {riskStatusLabels[status] ?? status}
                      </button>
                    ))}
                  </div>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">{risk.mitigation}</p>
              </div>
            ))}
          </div>
        </div>

        <div
          className={`rounded-lg border border-slate-200 bg-white p-6 shadow-sm ${
            activeTask === "artifacts" ? "" : "hidden"
          }`}
        >
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">아이디어 브리프 초안</h2>
              <p className="mt-1 text-sm text-slate-500">PRD 또는 리서치 워크플로우에 넣을 수 있는 요약 초안입니다.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={copyIdeaBrief}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                <Clipboard size={18} />
                브리프 복사
              </button>
              <button
                type="button"
                onClick={() =>
                  saveArtifactDraft("idea_brief", `${selectedIdea.name} 아이디어 브리프`, ideaBrief, "workbench")
                }
                disabled={isBusy || !user}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Save size={18} />
                산출물 저장
              </button>
            </div>
          </div>
          <textarea
            value={ideaBrief}
            readOnly
            rows={12}
            className="w-full resize-y rounded-md border border-slate-300 bg-slate-50 px-3 py-2 font-mono text-sm leading-6 text-slate-700 outline-none"
          />
          {copyMessage ? <p className="mt-3 text-sm text-slate-600">{copyMessage}</p> : null}
        </div>

        <div
          className={`rounded-lg border border-slate-200 bg-white p-6 shadow-sm ${
            activeTask === "artifacts" ? "" : "hidden"
          }`}
        >
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">리서치 브리프 초안</h2>
              <p className="mt-1 text-sm text-slate-500">
                인터뷰, 경쟁/대안, 가격, 규제, 개인정보 검증을 한 문서로 정리합니다.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => copyDraft(researchBriefDraft, "리서치 브리프")}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                <Clipboard size={18} />
                리서치 복사
              </button>
              <button
                type="button"
                onClick={() =>
                  saveArtifactDraft("research_note", `${selectedIdea.name} 리서치 브리프`, researchBriefDraft, "workbench")
                }
                disabled={isBusy || !user}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Save size={18} />
                산출물 저장
              </button>
            </div>
          </div>
          <textarea
            value={researchBriefDraft}
            readOnly
            rows={18}
            className="w-full resize-y rounded-md border border-slate-300 bg-slate-50 px-3 py-2 font-mono text-sm leading-6 text-slate-700 outline-none"
          />
        </div>

        <div
          className={`rounded-lg border border-slate-200 bg-white p-6 shadow-sm ${
            activeTask === "artifacts" ? "" : "hidden"
          }`}
        >
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">7일 검증 스프린트</h2>
              <p className="mt-1 text-sm text-slate-500">
                인터뷰 모집, 대안 조사, 가격 질문, Day 7 판정 기준을 바로 실행할 수 있게 묶습니다.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => copyDraft(validationSprintDraft, "7일 검증 스프린트")}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                <Clipboard size={18} />
                스프린트 복사
              </button>
              <button
                type="button"
                onClick={() =>
                  saveArtifactDraft(
                    "research_note",
                    `${selectedIdea.name} 7일 검증 스프린트`,
                    validationSprintDraft,
                    "validation_sprint",
                  )
                }
                disabled={isBusy || !user}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Save size={18} />
                산출물 저장
              </button>
            </div>
          </div>
          <textarea
            value={validationSprintDraft}
            readOnly
            rows={18}
            className="w-full resize-y rounded-md border border-slate-300 bg-slate-50 px-3 py-2 font-mono text-sm leading-6 text-slate-700 outline-none"
          />
        </div>

        <div
          className={`rounded-lg border border-slate-200 bg-white p-6 shadow-sm ${
            activeTask === "artifacts" ? "" : "hidden"
          }`}
        >
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">PRD 초안</h2>
              <p className="mt-1 text-sm text-slate-500">
                점수, 증거, 리스크, 실험, 오케스트레이션 산출물을 바탕으로 생성됩니다.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={copyPrdDraft}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                <Clipboard size={18} />
                PRD 복사
              </button>
              <button
                type="button"
                onClick={() => saveArtifactDraft("prd", `${selectedIdea.name} PRD`, prdDraft, "workbench")}
                disabled={isBusy || !user}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Save size={18} />
                산출물 저장
              </button>
            </div>
          </div>
          <textarea
            value={prdDraft}
            readOnly
            rows={18}
            className="w-full resize-y rounded-md border border-slate-300 bg-slate-50 px-3 py-2 font-mono text-sm leading-6 text-slate-700 outline-none"
          />
        </div>

        <div className={activeTask === "artifacts" ? "grid gap-6 xl:grid-cols-2" : "hidden"}>
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">MVP 명세 초안</h2>
                <p className="mt-1 text-sm text-slate-500">PRD 증거, 실험, 개발 게이트를 바탕으로 생성됩니다.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyMvpSpecDraft}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  <Clipboard size={18} />
                  복사
                </button>
                <button
                  type="button"
                  onClick={() =>
                    saveArtifactDraft("mvp_spec", `${selectedIdea.name} MVP 명세`, mvpSpecDraft, "workbench")
                  }
                  disabled={isBusy || !user}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Save size={18} />
                  저장
                </button>
              </div>
            </div>
            <textarea
              value={mvpSpecDraft}
              readOnly
              rows={16}
              className="w-full resize-y rounded-md border border-slate-300 bg-slate-50 px-3 py-2 font-mono text-sm leading-6 text-slate-700 outline-none"
            />
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">출시 체크리스트 초안</h2>
                <p className="mt-1 text-sm text-slate-500">산출물, 오케스트레이션 게이트, 리스크, 실험을 바탕으로 생성됩니다.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyLaunchChecklistDraft}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  <Clipboard size={18} />
                  복사
                </button>
                <button
                  type="button"
                  onClick={() =>
                    saveArtifactDraft(
                      "launch_checklist",
                      `${selectedIdea.name} 출시 체크리스트`,
                      launchChecklistDraft,
                      "workbench",
                    )
                  }
                  disabled={isBusy || !user}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Save size={18} />
                  저장
                </button>
              </div>
            </div>
            <textarea
              value={launchChecklistDraft}
              readOnly
              rows={16}
              className="w-full resize-y rounded-md border border-slate-300 bg-slate-50 px-3 py-2 font-mono text-sm leading-6 text-slate-700 outline-none"
            />
          </div>
        </div>

        <div
          className={`rounded-lg border border-slate-200 bg-white p-6 shadow-sm ${
            activeTask === "artifacts" ? "" : "hidden"
          }`}
        >
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">산출물 라이브러리</h2>
              <p className="mt-1 text-sm text-slate-500">선택한 워크스페이스 기록에 저장된 아이디어 산출물입니다.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <label className="grid gap-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                유형
                <select
                  value={artifactTypeFilter}
                  onChange={(event) => setArtifactTypeFilter(event.target.value as VentureArtifactType | "all")}
                  className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm normal-case tracking-normal text-slate-800 outline-none transition focus:border-slate-500"
                >
                  <option value="all">전체 유형</option>
                  {Object.entries(artifactLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                상태
                <select
                  value={artifactStatusFilter}
                  onChange={(event) => setArtifactStatusFilter(event.target.value as VentureArtifactStatus | "all")}
                  className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm normal-case tracking-normal text-slate-800 outline-none transition focus:border-slate-500"
                >
                  <option value="all">전체 상태</option>
                  {(["draft", "approved", "archived"] as VentureArtifactStatus[]).map((status) => (
                    <option key={status} value={status}>
                      {artifactStatusLabels[status]}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
          <div className="grid gap-3">
            {selectedArtifacts.length > 0 ? (
              selectedArtifacts.map((artifact) => {
                const status = artifact.status ?? "draft";
                const versionSummary = artifactVersionSummaries.get(artifact.id);

                return (
                  <div key={artifact.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold text-slate-950">{artifact.title || "제목 없음"}</span>
                          <span className="rounded-md bg-white px-2 py-1 text-xs font-semibold text-slate-600">
                            {artifactLabels[artifact.artifact_type]}
                          </span>
                          <span className={`rounded-md px-2 py-1 text-xs font-semibold ${artifactStatusTone[status]}`}>
                            {artifactStatusLabels[status]}
                          </span>
                          <span className="rounded-md bg-white px-2 py-1 text-xs font-semibold text-slate-600">
                            v{artifact.version ?? 1}
                          </span>
                        </div>
                        <div className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                          {artifactSourceLabels[artifact.source || "manual"] ?? artifact.source ?? "수동"} /{" "}
                          {new Date(artifact.created_at).toLocaleDateString()}
                          {artifact.approved_at ? ` / 승인 ${new Date(artifact.approved_at).toLocaleDateString()}` : ""}
                        </div>
                        {artifact.status_note ? (
                          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">게이트 메모: {artifact.status_note}</p>
                        ) : null}
                        {versionSummary ? (
                          <p className="mt-2 text-sm leading-6 text-slate-600">
                            {`v${versionSummary.previous.version ?? 1} 대비 변경: +${versionSummary.added} / -${versionSummary.removed}줄`}
                          </p>
                        ) : null}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => navigator.clipboard.writeText(artifact.body)}
                          className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-white px-3 text-xs font-semibold text-slate-800 shadow-sm transition hover:bg-slate-100"
                        >
                          <Clipboard size={14} />
                          복사
                        </button>
                        {(["draft", "approved", "archived"] as VentureArtifactStatus[]).map((nextStatus) => (
                          <button
                            key={nextStatus}
                            type="button"
                            onClick={() => updateArtifactStatus(artifact, nextStatus)}
                            disabled={isBusy || !canManageRecord(artifact) || status === nextStatus}
                            className="inline-flex h-9 items-center justify-center rounded-md bg-white px-3 text-xs font-semibold text-slate-800 shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-45"
                          >
                            {artifactStatusLabels[nextStatus]}
                          </button>
                        ))}
                      </div>
                    </div>
                    <label className="mt-4 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                      상태 메모
                      <textarea
                        value={artifactStatusNotes[artifact.id] ?? artifact.status_note ?? ""}
                        onChange={(event) =>
                          setArtifactStatusNotes((current) => ({
                            ...current,
                            [artifact.id]: event.target.value,
                          }))
                        }
                        rows={2}
                        disabled={isBusy || !canManageRecord(artifact)}
                        placeholder="승인 근거, 리뷰어 코멘트, 보관 사유"
                        className="mt-2 w-full resize-y rounded-md border border-slate-300 bg-white px-3 py-2 text-sm normal-case leading-6 tracking-normal text-slate-800 outline-none transition focus:border-slate-500 disabled:cursor-not-allowed disabled:bg-slate-100"
                      />
                    </label>
                  </div>
                );
              })
            ) : (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                {selectedArtifactRecords.length > 0 ? "현재 필터에 맞는 산출물이 없습니다." : "아직 저장된 산출물이 없습니다."}
              </div>
            )}
          </div>
        </div>

        {message ? <p className="text-sm leading-6 text-slate-600">{message}</p> : null}
      </div>
    </section>
  );
}

function clampScore(value: number) {
  if (Number.isNaN(value)) {
    return 0;
  }

  return Math.min(5, Math.max(0, value));
}

function ScoreInput({
  label,
  value,
  disabled,
  onChange,
}: {
  label: string;
  value: number;
  disabled: boolean;
  onChange: (value: number) => void;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-slate-700">
      <span className="flex items-center justify-between gap-3">
        {label}
        <span className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-600">{value}/5</span>
      </span>
      <input
        type="range"
        min={0}
        max={5}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(clampScore(Number(event.target.value)))}
      />
    </label>
  );
}

function InputField({
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
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 rounded-md border border-slate-300 bg-white px-3 text-sm font-normal text-slate-950 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  disabled,
  onChange,
}: {
  label: string;
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-slate-700">
      {label}
      <textarea
        value={value}
        disabled={disabled}
        rows={4}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-28 resize-y rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-normal leading-6 text-slate-950 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100 disabled:text-slate-500"
      />
    </label>
  );
}

function SelectField<T extends string>({
  label,
  value,
  options,
  labels,
  disabled,
  onChange,
}: {
  label: string;
  value: T;
  options: T[];
  labels?: Record<T, string>;
  disabled?: boolean;
  onChange: (value: T) => void;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-slate-700">
      {label}
      <select
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value as T)}
        className="h-11 rounded-md border border-slate-300 bg-white px-3 text-sm font-normal text-slate-950 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100 disabled:text-slate-500"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {labels?.[option] ?? option}
          </option>
        ))}
      </select>
    </label>
  );
}
