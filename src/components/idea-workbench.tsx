"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import {
  Activity,
  Beaker,
  CheckCircle2,
  Clipboard,
  ClipboardList,
  Code2,
  Flag,
  Layers3,
  RefreshCw,
  Save,
  ShieldAlert,
  Trash2,
} from "lucide-react";
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
  TelemetryEvent,
  VentureArtifact,
} from "@/lib/venture-data";
import type {
  Database,
  DecisionStatus,
  IdeaStage,
  ImplementationTaskPriority,
  ImplementationTaskStatus,
  ImplementationTaskType,
  Json,
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
const implementationStatusFilterOptions: ImplementationStatusFilter[] = ["all", ...implementationTaskStatuses];
const implementationStatusFilterLabels: Record<ImplementationStatusFilter, string> = {
  all: "전체 상태",
  ...implementationTaskStatusLabels,
};
const implementationEvidenceFilterOptions: ImplementationEvidenceFilter[] = ["all", "missing", "complete"];
const implementationEvidenceFilterLabels: Record<ImplementationEvidenceFilter, string> = {
  all: "전체 증거",
  missing: "증거 공백 있음",
  complete: "증거 힌트 충족",
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
const implementationTaskExecutionOrder: ImplementationTaskType[] = [
  "planning",
  "design",
  "data",
  "backend",
  "frontend",
  "qa",
  "security",
  "deploy",
];
const implementationTaskExecutionRank = new Map(
  implementationTaskExecutionOrder.map((taskType, index) => [taskType, index]),
);
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
type EvidenceRequirement = {
  label: string;
  terms: string[];
};
type ImplementationStatusFilter = ImplementationTaskStatus | "all";
type ImplementationEvidenceFilter = "all" | "missing" | "complete";
const sharedImplementationEvidenceRequirements: EvidenceRequirement[] = [
  { label: "커밋/PR", terms: ["commit", "커밋", "PR", "pull request"] },
  { label: "검증 결과", terms: ["pnpm", "lint", "typecheck", "build", "quality", "검증"] },
];
const implementationEvidenceRequirements: Record<ImplementationTaskType, EvidenceRequirement[]> = {
  planning: [
    { label: "PRD/MVP 범위", terms: ["PRD", "MVP", "범위", "scope"] },
    { label: "중단 기준", terms: ["중단", "kill", "no-go", "No-go"] },
  ],
  design: [
    { label: "핵심 화면", terms: ["화면", "screen", "flow", "여정"] },
    { label: "상태/모바일", terms: ["빈 상태", "오류", "모바일", "accessibility", "접근성"] },
  ],
  frontend: [
    { label: "사용자 여정", terms: ["스모크", "smoke", "저장", "조회", "journey"] },
    { label: "상태 UX", terms: ["로딩", "오류", "성공", "권한", "read-only"] },
  ],
  backend: [
    { label: "허용/차단", terms: ["허용", "차단", "allowed", "denied"] },
    { label: "RLS/Rules", terms: ["RLS", "Security Rules", "IAM", "with check"] },
  ],
  data: [
    { label: "마이그레이션", terms: ["migration", "마이그레이션", "SQL", "schema"] },
    { label: "되돌림/보정", terms: ["rollback", "롤백", "보정", "revert"] },
  ],
  qa: [
    { label: "스모크 경로", terms: ["smoke", "스모크", "수동", "browser"] },
    { label: "실패/회귀", terms: ["실패", "회귀", "regression", "재현"] },
  ],
  security: [
    { label: "비밀값/PII", terms: ["secret", "비밀값", "PII", "개인정보", "NEXT_PUBLIC"] },
    { label: "권한 차단", terms: ["권한", "차단", "RLS", "Security Rules", "abuse"] },
  ],
  deploy: [
    { label: "Preview/Production", terms: ["Preview", "Production", "프로덕션"] },
    { label: "Vercel 로그", terms: ["Vercel inspect", "deploy log", "배포 로그", "빌드 로그"] },
    { label: "롤백 기준", terms: ["rollback", "롤백", "last known good", "직전"] },
  ],
};
type BlockerPlaybook = {
  fallbackOwner: string;
  nextAction: string;
  unblockEvidence: string;
  escalation: string;
};
const implementationBlockerPlaybooks: Record<ImplementationTaskType, BlockerPlaybook> = {
  planning: {
    fallbackOwner: "prd-writer",
    nextAction: "PRD 범위, 중단 기준, 의사결정권자를 먼저 확정하세요.",
    unblockEvidence: "승인된 PRD/MVP 범위와 no-go 기준을 증거에 남기면 해소로 봅니다.",
    escalation: "범위 충돌이 남으면 founder/operator 판단으로 올립니다.",
  },
  design: {
    fallbackOwner: "design-reviewer",
    nextAction: "핵심 화면, 빈 상태, 오류 상태, 모바일 흐름 중 빠진 화면을 지정하세요.",
    unblockEvidence: "화면 목록, 주요 여정, 접근성/모바일 확인 결과를 증거에 남깁니다.",
    escalation: "사용자 흐름이 갈리면 PRD 작성자와 스코프를 다시 잠급니다.",
  },
  frontend: {
    fallbackOwner: "prototype-builder",
    nextAction: "막힌 사용자 여정과 재현 경로를 하나로 좁히고 상태 UX를 확인하세요.",
    unblockEvidence: "수정 커밋, 스모크 경로, 성공/오류/권한 상태 확인 결과를 남깁니다.",
    escalation: "API나 권한 문제라면 백엔드 담당자에게 넘깁니다.",
  },
  backend: {
    fallbackOwner: "backend-builder",
    nextAction: "RLS 또는 Security Rules의 허용/차단 조건을 먼저 재현하세요.",
    unblockEvidence: "허용 케이스와 차단 케이스, SQL/Rules 변경, 검증 명령을 남깁니다.",
    escalation: "운영 데이터 접근 범위가 불명확하면 보안/데이터 담당자와 함께 봅니다.",
  },
  data: {
    fallbackOwner: "data-modeler",
    nextAction: "스키마, 마이그레이션, 롤백/보정 계획 중 막힌 지점을 분리하세요.",
    unblockEvidence: "SQL 또는 migration, 샘플 데이터 확인, 되돌림 계획을 남깁니다.",
    escalation: "기존 데이터 손상 가능성이 있으면 수동 백업 확인 후 진행합니다.",
  },
  qa: {
    fallbackOwner: "qa-runner",
    nextAction: "실패한 경로를 재현 가능한 한 줄 시나리오로 줄이세요.",
    unblockEvidence: "실패 재현, 수정 커밋, 재실행 결과, 남은 회귀 리스크를 남깁니다.",
    escalation: "반복 실패면 해당 구현 담당자에게 재배정합니다.",
  },
  security: {
    fallbackOwner: "security-reviewer",
    nextAction: "비밀값, PII, 권한 우회, abuse case 중 차단 원인을 분류하세요.",
    unblockEvidence: "노출 범위, 차단 규칙, allowed/denied 검증, 남은 리스크를 남깁니다.",
    escalation: "개인정보나 비밀값 노출 가능성이 있으면 출시 판단을 중지합니다.",
  },
  deploy: {
    fallbackOwner: "release-manager",
    nextAction: "Preview/Production 배포 상태, 환경변수, Vercel 로그를 먼저 확인하세요.",
    unblockEvidence: "배포 URL, Vercel inspect 또는 로그, production smoke, 롤백 기준을 남깁니다.",
    escalation: "운영 장애 가능성이 있으면 직전 정상 배포로 되돌리는 기준을 우선 기록합니다.",
  },
};
const implementationRunFocus: Record<ImplementationTaskType, string> = {
  planning: "PRD/MVP 범위, 제외 범위, 중단 기준, 승인 증거를 잠급니다.",
  design: "핵심 화면, 상태 UX, 모바일/접근성, 첫 가치 도달 흐름을 구체화합니다.",
  frontend: "입력, 저장, 조회, 상태 메시지, 모바일 레이아웃을 실제 사용자 여정 기준으로 구현합니다.",
  backend: "데이터 모델, API/Server Action 경계, RLS 또는 Security Rules 허용/차단을 검증합니다.",
  data: "스키마, 마이그레이션, 샘플 데이터, 롤백/보정 계획을 안전하게 다룹니다.",
  qa: "핵심 경로, 인증 전/후, 읽기 전용, 빈/오류/로딩 상태와 회귀를 검증합니다.",
  security: "PII, 비밀값, 권한 우회, abuse, 보관/삭제 경로를 출시 차단 관점으로 봅니다.",
  deploy: "Preview/Production, Vercel 로그, 환경변수, production smoke, 롤백 기준을 확인합니다.",
};
const implementationDependencyRules: Record<
  ImplementationTaskType,
  {
    prerequisites: ImplementationTaskType[];
    gate: string;
    nextAction: string;
  }
> = {
  planning: {
    prerequisites: [],
    gate: "제품 범위 잠금",
    nextAction: "PRD, MVP 범위, 제외 범위, 성공 지표, 중단 기준을 먼저 고정합니다.",
  },
  design: {
    prerequisites: ["planning"],
    gate: "기획 범위 승인",
    nextAction: "Slice 1 사용자 여정, 빈 상태, 오류, 모바일, 접근성 상태를 확정합니다.",
  },
  data: {
    prerequisites: ["planning"],
    gate: "데이터 경계 확정",
    nextAction: "엔티티, 소유권, 조직 경계, 마이그레이션, 샘플 데이터를 먼저 정의합니다.",
  },
  backend: {
    prerequisites: ["data"],
    gate: "데이터 모델 준비",
    nextAction: "API/Server Action, RLS 또는 Security Rules 허용/차단 조건을 구현합니다.",
  },
  frontend: {
    prerequisites: ["design", "backend"],
    gate: "화면 흐름과 저장 경계 준비",
    nextAction: "핵심 입력, 저장, 조회, 상태 메시지를 첫 수직 슬라이스로 구현합니다.",
  },
  qa: {
    prerequisites: ["frontend", "backend"],
    gate: "핵심 여정 구현",
    nextAction: "핵심 여정, 오류 상태, 모바일, 회귀 스모크를 검증합니다.",
  },
  security: {
    prerequisites: ["backend", "data"],
    gate: "권한/데이터 경계 구현",
    nextAction: "개인정보, 비밀값, 권한 우회, 로그 민감정보, 고위험 리스크를 검토합니다.",
  },
  deploy: {
    prerequisites: ["qa", "security"],
    gate: "QA/보안 완료",
    nextAction: "Preview/Production 배포, smoke, inspect URL, 롤백 기준을 기록합니다.",
  },
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
  score: "평가",
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
  evidence_capture: "근거 캡처",
  experiment_result: "실험 결과",
  validation_summary: "검증 완료 요약",
  validation_sprint: "7일 검증 스프린트",
  extracted_idea_package: "발굴 아이디어 패키지",
  extracted_research_brief: "발굴 리서치 브리프",
  extraction_portfolio: "발굴 비교 리포트",
  prd_readiness_handoff: "PRD 전환 핸드오프",
  mvp_slice_plan: "MVP 슬라이스 플랜",
  development_kickoff: "개발 킥오프 브리프",
  agent_run_package: "구현 실행 패키지",
  development_process: "제작 준비 프로세스",
  development_report: "개발 완료 보고서",
  filtered_implementation_run: "필터 실행 프롬프트",
  mvp_build_command: "MVP 빌드 명령",
  qa_acceptance_matrix: "QA 검수 매트릭스",
  post_launch_learning: "출시 후 성과 확인",
  telemetry_adapter: "제품 이벤트 어댑터",
  product_telemetry_funnel: "제품 사용 퍼널",
};
const evidenceConfidenceOptions = ["low", "medium", "high"] as const;
type EvidenceConfidence = (typeof evidenceConfidenceOptions)[number];
const evidenceConfidenceLabels: Record<EvidenceConfidence, string> = {
  low: "낮음",
  medium: "보통",
  high: "높음",
};
const telemetryEventLabels: Record<string, string> = {
  idea_created: "아이디어 생성",
  idea_package_created: "검증 패키지 저장",
  idea_updated: "점수/상태 저장",
  product_page_view: "제품 화면 조회",
  product_signup_started: "가입 시작",
  product_signup_completed: "가입 완료",
  product_core_action: "핵심 행동",
  product_activation: "활성화",
  product_retention_ping: "재방문",
  product_payment_signal: "결제 신호",
  product_feedback: "사용자 피드백",
  product_error: "제품 오류",
  product_churn_signal: "이탈 신호",
  product_event: "제품 이벤트",
  risk_created: "리스크 추가",
  risk_status_updated: "리스크 상태 변경",
  decision_recorded: "판단 기록",
  experiment_created: "실험 생성",
  experiment_status_updated: "실험 상태 변경",
  experiment_result_saved: "실험 결과 저장",
  runbook_created: "런북 생성",
  run_created: "단계 추가",
  run_status_updated: "단계 상태 변경",
  run_output_saved: "단계 산출물 저장",
  artifact_saved: "산출물 저장",
  artifact_package_saved: "산출물 패키지 저장",
  artifact_status_updated: "산출물 상태 변경",
  implementation_tasks_created: "개발 태스크 생성",
  implementation_task_created: "개발 태스크 추가",
  implementation_task_status_updated: "개발 태스크 상태 변경",
  implementation_task_evidence_saved: "개발 태스크 증거 저장",
};
const telemetryCategoryLabels: Record<string, string> = {
  intake: "접수",
  extraction: "발굴",
  scoring: "사업성 평가",
  product: "제품 사용",
  risk: "위험",
  decision: "판단",
  experiment: "검증 실험",
  orchestration: "실행 관리",
  artifact: "기획 자료",
  development: "제작",
  launch: "출시",
  learning: "성과 확인",
};
const telemetryCategoryTone: Record<string, string> = {
  intake: "bg-blue-50 text-blue-700",
  extraction: "bg-violet-50 text-violet-800",
  scoring: "bg-sky-50 text-sky-800",
  product: "bg-fuchsia-50 text-fuchsia-800",
  risk: "bg-rose-50 text-rose-700",
  decision: "bg-emerald-50 text-emerald-800",
  experiment: "bg-amber-50 text-amber-800",
  orchestration: "bg-indigo-50 text-indigo-800",
  artifact: "bg-slate-100 text-slate-700",
  development: "bg-cyan-50 text-cyan-800",
  launch: "bg-teal-50 text-teal-800",
  learning: "bg-lime-50 text-lime-800",
};
const productTelemetryFunnelSteps = [
  {
    eventName: "product_page_view",
    label: "방문",
    question: "타겟 사용자가 실제 화면까지 도착하는가",
    nextAction: "유입 채널과 첫 화면 문구를 확인합니다.",
  },
  {
    eventName: "product_signup_started",
    label: "가입 시작",
    question: "가치를 기대하고 가입 흐름을 시작하는가",
    nextAction: "CTA, 인증 마찰, 권한 요청을 줄입니다.",
  },
  {
    eventName: "product_signup_completed",
    label: "가입 완료",
    question: "가입/온보딩을 끝까지 통과하는가",
    nextAction: "이탈 구간과 이메일/매직링크 상태를 점검합니다.",
  },
  {
    eventName: "product_core_action",
    label: "핵심 행동",
    question: "MVP가 약속한 첫 가치를 실제로 수행하는가",
    nextAction: "첫 기록 생성, 첫 분석 완료 같은 핵심 행동을 더 앞으로 당깁니다.",
  },
  {
    eventName: "product_activation",
    label: "활성화",
    question: "한 번의 사용을 넘어 쓸 이유를 발견하는가",
    nextAction: "반복 사용을 만드는 알림, 저장, 공유, 협업 루프를 검증합니다.",
  },
  {
    eventName: "product_payment_signal",
    label: "결제 신호",
    question: "가격, 업그레이드, 구매 문의 같은 지불 의향이 있는가",
    nextAction: "가격 질문, 결제 대기 목록, 수동 청구 실험으로 이어갑니다.",
  },
] as const;
const productTelemetryTaxonomy = [
  {
    eventName: "product_page_view",
    label: "방문",
    when: "MVP의 주요 페이지나 첫 화면이 열릴 때",
  },
  {
    eventName: "product_core_action",
    label: "핵심 행동",
    when: "사용자가 제품의 핵심 가치를 만드는 행동을 완료할 때",
  },
  {
    eventName: "product_activation",
    label: "활성화",
    when: "첫 가치 도달, 초대, 저장, 반복 예약 등 활성화 기준을 충족할 때",
  },
  {
    eventName: "product_retention_ping",
    label: "재방문",
    when: "24시간 이후 재방문, 두 번째 세션, 반복 작업이 발생할 때",
  },
  {
    eventName: "product_payment_signal",
    label: "결제 신호",
    when: "가격 클릭, 결제 시작, 견적 문의, 유료 기능 접근 시도 때",
  },
  {
    eventName: "product_feedback",
    label: "피드백",
    when: "사용자가 평가, 의견, 요청, 불만을 남길 때",
  },
  {
    eventName: "product_error",
    label: "오류",
    when: "핵심 흐름에서 에러, 권한 실패, 저장 실패가 발생할 때",
  },
  {
    eventName: "product_churn_signal",
    label: "이탈 신호",
    when: "탈퇴, 알림 해제, 반복 실패, 장기 미사용이 감지될 때",
  },
] as const;

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

type EvidenceDraft = {
  title: string;
  source: string;
  evidence: string;
  implication: string;
  confidence: EvidenceConfidence;
};

type ExperimentResultDraft = {
  experiment_id: string;
  result: string;
  learning: string;
  next_decision: DecisionStatus;
  next_action: string;
};

type ValidationEvidenceCheck = {
  label: string;
  passed: boolean;
  detail: string;
  action: string;
};

type ValidationEvidenceCoach = {
  score: number;
  label: string;
  checks: ValidationEvidenceCheck[];
  nextFocus: ValidationEvidenceCheck | null;
  prompt: string;
};

type ImplementationTaskDraft = {
  title: string;
  task_type: ImplementationTaskType;
  priority: ImplementationTaskPriority;
  owner_role: string;
  acceptance_criteria: string;
};

type ImplementationDependencyStatus = {
  task: ImplementationTask;
  ready: boolean;
  blockers: string[];
  completedPrerequisites: ImplementationTaskType[];
  missingPrerequisites: ImplementationTaskType[];
  gate: string;
  nextAction: string;
};

type GateCheck = {
  label: string;
  passed: boolean;
  detail: string;
};

type ReleaseDecisionConfidence = "high" | "medium" | "low";

type ReleaseDecisionPacket = {
  recommendation: DecisionStatus;
  confidence: ReleaseDecisionConfidence;
  confidenceLabel: string;
  headline: string;
  blockers: string[];
  greenSignals: string[];
  requiredActions: string[];
  markdown: string;
};

type BackendCandidateKey = "supabase" | "firebase" | "firebase_sql_connect" | "hybrid";

type BackendCandidateScore = {
  key: BackendCandidateKey;
  label: string;
  score: number;
  summary: string;
  strengths: string[];
  cautions: string[];
};

type BackendExecutionCheck = {
  label: string;
  detail: string;
  evidence: string;
  tone: "required" | "recommended";
};

type BackendExecutionPlan = {
  backend: BackendCandidateScore;
  envVars: string[];
  checks: BackendExecutionCheck[];
  localCommand: string;
  productionGate: string;
  rollback: string;
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
  | "launch"
  | "learning";

type ArtifactPanel = "validation" | "product" | "library";
type DevelopmentPanel = "setup" | "tasks" | "handoff";
type GuidedExecutionStep = "package" | "execute" | "report";
type ArtifactReviewStatus = "approved" | "draft" | "missing";

type ArtifactReviewItem = {
  id: string;
  label: string;
  artifactType: VentureArtifactType;
  requiredStatus: VentureArtifactStatus;
  status: ArtifactReviewStatus;
  artifact: VentureArtifact | null;
  detail: string;
  action: string;
  task: WorkbenchTask;
  panel?: ArtifactPanel;
  developmentPanel?: DevelopmentPanel;
};

type ArtifactReviewIntensity = "new" | "minor" | "moderate" | "major";

type ArtifactReviewSummary = {
  previous: VentureArtifact | null;
  added: number;
  removed: number;
  addedSections: string[];
  removedSections: string[];
  intensity: ArtifactReviewIntensity;
  intensityLabel: string;
  recommendation: string;
  checks: string[];
};

const artifactPanelLabels: Record<ArtifactPanel, string> = {
  validation: "검증 자료",
  product: "기획서",
  library: "자료 보관함",
};

const artifactPanelDescriptions: Record<ArtifactPanel, string> = {
  validation: "아이디어 브리프, 리서치, 7일 스프린트, 근거, 검증 완료 요약을 정리합니다.",
  product: "PRD, MVP 명세, 출시 체크리스트를 생성합니다.",
  library: "저장된 자료를 필터링하고 승인 상태를 관리합니다.",
};
const releaseDecisionTone: Record<DecisionStatus, string> = {
  pending: "bg-slate-100 text-slate-700",
  research_more: "bg-amber-100 text-amber-800",
  ship: "bg-emerald-100 text-emerald-800",
  pivot: "bg-violet-100 text-violet-800",
  kill: "bg-rose-100 text-rose-800",
};
const releaseDecisionConfidenceTone: Record<ReleaseDecisionConfidence, string> = {
  high: "bg-emerald-50 text-emerald-800",
  medium: "bg-amber-50 text-amber-800",
  low: "bg-rose-50 text-rose-800",
};
const artifactReviewIntensityTone: Record<ArtifactReviewIntensity, string> = {
  new: "bg-blue-50 text-blue-800",
  minor: "bg-emerald-50 text-emerald-800",
  moderate: "bg-amber-50 text-amber-800",
  major: "bg-rose-50 text-rose-800",
};
const artifactApprovalReviewChecks: Record<VentureArtifactType, string[]> = {
  idea_brief: ["문제와 대상 사용자가 현재 점수/리스크와 일치하는지 확인", "다음 증거가 실제 실행 가능한지 확인"],
  research_note: ["출처와 관찰 사실이 추정과 분리되어 있는지 확인", "개인정보나 원문 민감정보가 남아 있지 않은지 확인"],
  prd: ["사용자, 문제, 범위, 제외 범위, 수용 기준이 서로 모순되지 않는지 확인", "성공 지표와 중단 기준이 측정 가능한지 확인"],
  mvp_spec: ["Slice 1 범위가 얇은 제품으로 제한되어 있는지 확인", "AI/자동화, 결제, 외부 계정 조작 등 제외 범위가 명확한지 확인"],
  backend_decision: ["환경변수 공개/서버 경계와 권한 규칙이 선택 백엔드에 맞는지 확인", "허용/차단 검증과 롤백 기준이 포함되어 있는지 확인"],
  design_brief: ["핵심 여정, 빈 상태, 오류, 모바일, 접근성 상태가 빠지지 않았는지 확인", "화면 흐름이 MVP 범위 밖으로 커지지 않았는지 확인"],
  tech_spec: ["데이터 모델, API/Server Action, 권한 경계, 검증 명령이 연결되어 있는지 확인", "마이그레이션과 롤백 경로가 운영 가능한지 확인"],
  dev_runbook: ["작업 순서, 담당 역할, 품질 게이트, 완료 보고 형식이 실행 가능하게 적혀 있는지 확인", "사용자 액션과 자동 처리 가능한 작업이 분리되어 있는지 확인"],
  launch_checklist: ["QA, 보안, 높은 리스크, 최종 판단 기록이 출시 전에 닫히는지 확인", "Production smoke와 롤백 기준이 남아 있는지 확인"],
};

const developmentPanelLabels: Record<DevelopmentPanel, string> = {
  setup: "제작 준비",
  tasks: "실행 할 일",
  handoff: "완료 보고",
};

const developmentPanelDescriptions: Record<DevelopmentPanel, string> = {
  setup: "실제 제작을 시작하기 전 필요한 결정, 디자인, 데이터, 보안 조건을 정리합니다.",
  tasks: "실행할 일을 상태별로 쪼개고 완료 근거를 기록합니다.",
  handoff: "제작 완료 조건, 실행 계획, 다음 담당자에게 넘길 내용을 확인합니다.",
};

const guidedExecutionStepLabels: Record<GuidedExecutionStep, string> = {
  package: "AI 실행 패키지",
  execute: "AI 실행 할 일",
  report: "AI 완료 보고",
};

const guidedExecutionStepDescriptions: Record<GuidedExecutionStep, string> = {
  package: "AI가 기획, 디자인, 기술, 실행 문서와 기본 태스크를 한 번에 준비합니다.",
  execute: "AI가 쪼갠 다음 실행 할 일만 보고 진행 상태와 완료 증거를 남깁니다.",
  report: "AI가 개발 완료 보고와 출시 직전 전달 문서를 정리합니다.",
};

const artifactReviewBlueprint: Array<
  Omit<ArtifactReviewItem, "status" | "artifact" | "detail"> & {
    missingDetail: string;
    draftDetail: string;
    approvedDetail: string;
  }
> = [
  {
    id: "idea-brief",
    label: "아이디어 브리프",
    artifactType: "idea_brief",
    requiredStatus: "approved",
    action: "문제, 대상, 구매자, 리스크 요약을 승인 가능한 브리프로 잠급니다.",
    task: "artifacts",
    panel: "validation",
    missingDetail: "아이디어 브리프가 없습니다.",
    draftDetail: "아이디어 브리프 초안은 있으나 승인 전입니다.",
    approvedDetail: "아이디어 브리프가 승인되었습니다.",
  },
  {
    id: "research-note",
    label: "리서치 노트",
    artifactType: "research_note",
    requiredStatus: "approved",
    action: "인터뷰, 대체재, 가격 신호, 리플레이 리포트를 승인 근거로 정리합니다.",
    task: "artifacts",
    panel: "validation",
    missingDetail: "리서치 노트나 발굴 리포트가 없습니다.",
    draftDetail: "리서치 초안은 있으나 승인 전입니다.",
    approvedDetail: "리서치 노트가 승인되었습니다.",
  },
  {
    id: "prd",
    label: "PRD",
    artifactType: "prd",
    requiredStatus: "approved",
    action: "목표, 제외 범위, 수용 기준, no-go 조건을 승인합니다.",
    task: "artifacts",
    panel: "product",
    missingDetail: "PRD 산출물이 없습니다.",
    draftDetail: "PRD 초안은 있으나 승인 전입니다.",
    approvedDetail: "PRD가 승인되었습니다.",
  },
  {
    id: "mvp-spec",
    label: "MVP 명세",
    artifactType: "mvp_spec",
    requiredStatus: "approved",
    action: "MVP 슬라이스, 첫 화면, 제외 범위, 성공 기준을 승인합니다.",
    task: "artifacts",
    panel: "product",
    missingDetail: "MVP 명세가 없습니다.",
    draftDetail: "MVP 명세 초안은 있으나 승인 전입니다.",
    approvedDetail: "MVP 명세가 승인되었습니다.",
  },
  {
    id: "backend-decision",
    label: "백엔드 결정",
    artifactType: "backend_decision",
    requiredStatus: "approved",
    action: "Supabase, Firebase, SQL Connect, Hybrid 중 하나를 선택하고 권한 검증 조건을 승인합니다.",
    task: "development",
    developmentPanel: "setup",
    missingDetail: "백엔드 결정 산출물이 없습니다.",
    draftDetail: "백엔드 결정 초안은 있으나 승인 전입니다.",
    approvedDetail: "백엔드 결정이 승인되었습니다.",
  },
  {
    id: "design-brief",
    label: "디자인 브리프",
    artifactType: "design_brief",
    requiredStatus: "approved",
    action: "핵심 화면, 빈/오류/권한 상태, 모바일 흐름을 승인합니다.",
    task: "development",
    developmentPanel: "setup",
    missingDetail: "디자인 브리프가 없습니다.",
    draftDetail: "디자인 브리프 초안은 있으나 승인 전입니다.",
    approvedDetail: "디자인 브리프가 승인되었습니다.",
  },
  {
    id: "tech-spec",
    label: "기술 명세",
    artifactType: "tech_spec",
    requiredStatus: "approved",
    action: "데이터 모델, 권한, 환경변수, 검증 명령을 승인합니다.",
    task: "development",
    developmentPanel: "setup",
    missingDetail: "기술 명세가 없습니다.",
    draftDetail: "기술 명세 초안은 있으나 승인 전입니다.",
    approvedDetail: "기술 명세가 승인되었습니다.",
  },
  {
    id: "dev-runbook",
    label: "개발 런북",
    artifactType: "dev_runbook",
    requiredStatus: "approved",
    action: "구현 순서, 담당 역할, 검증/배포 루프를 승인합니다.",
    task: "development",
    developmentPanel: "handoff",
    missingDetail: "개발 런북이 없습니다.",
    draftDetail: "개발 런북 초안은 있으나 승인 전입니다.",
    approvedDetail: "개발 런북이 승인되었습니다.",
  },
  {
    id: "launch-checklist",
    label: "출시 체크리스트",
    artifactType: "launch_checklist",
    requiredStatus: "approved",
    action: "QA, 보안, 배포, 롤백 기준을 승인하고 출시 판단으로 넘깁니다.",
    task: "artifacts",
    panel: "product",
    missingDetail: "출시 체크리스트가 없습니다.",
    draftDetail: "출시 체크리스트 초안은 있으나 승인 전입니다.",
    approvedDetail: "출시 체크리스트가 승인되었습니다.",
  },
];

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

function getLatestArtifactByType(artifacts: VentureArtifact[], artifactType: VentureArtifactType) {
  return (
    [...artifacts]
      .filter((artifact) => artifact.artifact_type === artifactType)
      .sort(
        (a, b) =>
          new Date(b.updated_at ?? b.created_at).getTime() - new Date(a.updated_at ?? a.created_at).getTime() ||
          (b.version ?? 1) - (a.version ?? 1),
      )[0] ?? null
  );
}

function buildArtifactReviewQueue(artifacts: VentureArtifact[]): ArtifactReviewItem[] {
  return artifactReviewBlueprint.map((item) => {
    const artifact = getLatestArtifactByType(artifacts, item.artifactType);
    const status: ArtifactReviewStatus = artifact ? (artifact.status === item.requiredStatus ? "approved" : "draft") : "missing";
    const detail = status === "approved" ? item.approvedDetail : status === "draft" ? item.draftDetail : item.missingDetail;

    return {
      id: item.id,
      label: item.label,
      artifactType: item.artifactType,
      requiredStatus: item.requiredStatus,
      status,
      artifact,
      detail,
      action: item.action,
      task: item.task,
      panel: item.panel,
      developmentPanel: item.developmentPanel,
    };
  });
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

function includesAnyNormalized(text: string, terms: string[]) {
  const normalized = text.toLowerCase();

  return terms.some((term) => normalized.includes(term.toLowerCase()));
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

function buildValidationEvidenceCoach({
  idea,
  state,
  risks,
  experiments,
  artifacts,
}: {
  idea: Idea;
  state: EditState;
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
    ["evidence_capture", "experiment_result", "validation_summary"].includes(artifact.source || ""),
  );
  const openHighRisks = risks.filter((risk) => ["high", "critical"].includes(risk.severity) && risk.status !== "closed");
  const domainQuestions: Record<string, string[]> = {
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
        artifacts.some((artifact) => artifact.source === "extracted_research_brief"),
      detail: "현재 대체재를 알아야 차별성과 가격을 판단할 수 있습니다.",
      action: "사용자가 지금 쓰는 대안 3개와 각 대안의 불만을 표로 정리하세요.",
    },
    {
      label: "행동 증거",
      passed: doneExperiments.length > 0 || runningExperiments.length > 0 || evidenceArtifacts.length >= 2,
      detail: "말이 아니라 클릭, 신청, 저장, 공유, 결제 의향 같은 행동 신호가 필요합니다.",
      action: "가장 작은 수동 MVP나 랜딩 테스트를 실행하고 결과를 실험 기록으로 남기세요.",
    },
    {
      label: "리스크 수용",
      passed: openHighRisks.length === 0 && Boolean(state.risk_summary.trim()),
      detail: "고위험 리스크가 남아 있으면 PRD보다 완화 조건을 먼저 정합니다.",
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
        ? "스프린트 실행 가능"
        : evidenceScore >= 45
          ? "핵심 증거 보강"
          : "인터뷰부터 재정렬";
  const prompt = `# 검증 증거 수집 프롬프트: ${idea.name}

## 이번에 보강할 증거

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

function buildEvidenceNoteMarkdown({
  idea,
  state,
  draft,
}: {
  idea: Idea;
  state: EditState;
  draft: EvidenceDraft;
}) {
  return `# 근거 기록: ${draft.title || "제목 미정"}

## 아이디어 맥락

- 아이디어: ${idea.name}
- 한 줄 설명: ${idea.one_liner || "미정"}
- 대상 사용자: ${idea.target_user || "미정"}
- 구매자: ${idea.buyer || "미정"}
- 현재 단계: ${stageLabels[state.stage]}
- 현재 판단: ${decisionLabels[state.decision]}

## 출처

${draft.source || "미정"}

## 관찰한 근거

${draft.evidence || "미정"}

## 해석과 영향

${draft.implication || "미정"}

## 확신도

- ${evidenceConfidenceLabels[draft.confidence]}

## 다음 행동

${state.next_evidence || "이 근거가 진행, 추가 조사, 전환, 중단 중 어떤 판단을 강화하는지 결정하세요."}
`;
}

function buildExperimentResultMarkdown({
  idea,
  state,
  experiment,
  draft,
}: {
  idea: Idea;
  state: EditState;
  experiment: Experiment;
  draft: ExperimentResultDraft;
}) {
  return `# 실험 결과: ${experiment.name}

## 아이디어 맥락

- 아이디어: ${idea.name}
- 한 줄 설명: ${idea.one_liner || "미정"}
- 대상 사용자: ${idea.target_user || "미정"}
- 구매자: ${idea.buyer || "미정"}
- 현재 단계: ${stageLabels[state.stage]}
- 현재 판단: ${decisionLabels[state.decision]}

## 실험

- 이름: ${experiment.name}
- 상태: ${experimentStatusLabels[experiment.status] ?? experiment.status}
- 성공 지표: ${experiment.success_metric || "미정"}
- 시작: ${experiment.started_at || "미정"}
- 종료: ${experiment.ended_at || "미정"}

## 결과

${draft.result || "미정"}

## 배운 점

${draft.learning || "미정"}

## 다음 판단

- ${decisionLabels[draft.next_decision]}

## 다음 행동

${draft.next_action || state.next_evidence || "다음 실험, PRD 수정, 리스크 완화, 중단/전환 중 하나를 기록하세요."}
`;
}

function buildValidationSummaryMarkdown({
  idea,
  state,
  score,
  recommendation,
  risks,
  experiments,
  artifacts,
  decisions,
}: {
  idea: Idea;
  state: EditState;
  score: number;
  recommendation: DecisionStatus;
  risks: Risk[];
  experiments: Experiment[];
  artifacts: VentureArtifact[];
  decisions: Decision[];
}) {
  const researchArtifacts = artifacts.filter((artifact) => artifact.artifact_type === "research_note");
  const riskLines =
    risks.length > 0
      ? risks
          .map((risk) => `- ${risk.title}: ${riskSeverityLabels[risk.severity]} / ${riskStatusLabels[risk.status] ?? risk.status}`)
          .join("\n")
      : "- 연결된 리스크가 없습니다.";
  const experimentLines =
    experiments.length > 0
      ? experiments
          .map(
            (experiment) =>
              `- ${experiment.name}: ${experimentStatusLabels[experiment.status] ?? experiment.status} / ${
                experiment.success_metric || "성공 지표 미정"
              }`,
          )
          .join("\n")
      : "- 연결된 실험이 없습니다.";
  const researchLines =
    researchArtifacts.length > 0
      ? researchArtifacts
          .slice(0, 8)
          .map((artifact) => `- ${artifact.title || "제목 없음"} (${artifactSourceLabels[artifact.source] ?? artifact.source})`)
          .join("\n")
      : "- 저장된 리서치 노트가 없습니다.";
  const decisionLines =
    decisions.length > 0
      ? decisions
          .slice(0, 5)
          .map((decision) => `- ${decisionLabels[decision.decision]}: ${decision.reason || "근거 미기록"}`)
          .join("\n")
      : "- 판단 기록이 없습니다.";
  const openHighRisks = risks.filter((risk) => ["high", "critical"].includes(risk.severity) && risk.status !== "closed");
  const doneExperiments = experiments.filter((experiment) => experiment.status === "done");
  const suggestedGate =
    openHighRisks.length > 0
      ? "추가 조사"
      : doneExperiments.length > 0 && score >= 18
        ? "진행"
        : score >= 14
          ? "추가 조사"
          : "중단 또는 전환";

  return `# 검증 완료 요약: ${idea.name}

## 결론 초안

- 추천 게이트: ${suggestedGate}
- 점수 기반 추천: ${decisionLabels[recommendation]}
- 현재 판단: ${decisionLabels[state.decision]}
- 현재 단계: ${stageLabels[state.stage]}
- 벤처 점수: ${score}
- 다음 증거: ${state.next_evidence || "미정"}

## 아이디어

- 한 줄 설명: ${idea.one_liner || "미정"}
- 대상 사용자: ${idea.target_user || "미정"}
- 구매자: ${idea.buyer || "미정"}

## 핵심 수요 신호

${state.signal || "미정"}

## 리서치/근거 산출물

${researchLines}

## 실험 상태

${experimentLines}

## 리스크 상태

${riskLines}

## 판단 기록

${decisionLines}

## 진행 조건

- 리서치 노트가 1개 이상 저장되어 있다.
- 실험이 완료되었거나, 완료 전이라면 다음 실험이 명확하다.
- 높음/치명 리스크가 닫혔거나 수용 조건이 문서화되었다.
- 구매자 또는 승인자가 명확하다.
- PRD로 옮겨도 되는 문제 범위가 하나로 좁혀졌다.

## 보류 조건

- 최근 실제 사례가 부족하다.
- 구매자, 가격, 승인 경로가 모호하다.
- 실험은 계획만 있고 결과 학습이 없다.
- 리스크가 열려 있는데 완화 조건이 없다.
- MVP 범위가 아직 2주 이상 걸릴 만큼 넓다.

## 최종 운영자 메모

- 최종 판단:
- 판단 근거:
- 다음 행동:
`;
}

function buildPrdHandoffMarkdown({
  idea,
  state,
  score,
  recommendation,
  prdReadinessScore,
  prdReadinessChecks,
  validationEvidenceCoach,
  risks,
  experiments,
  decisions,
  nextPrdBlocker,
}: {
  idea: Idea;
  state: EditState;
  score: number;
  recommendation: DecisionStatus;
  prdReadinessScore: number;
  prdReadinessChecks: GateCheck[];
  validationEvidenceCoach: ValidationEvidenceCoach | null;
  risks: Risk[];
  experiments: Experiment[];
  decisions: Decision[];
  nextPrdBlocker: GateCheck | null;
}) {
  const readinessLines = prdReadinessChecks
    .map((check) => `- [${check.passed ? "x" : " "}] ${check.label}: ${check.detail}`)
    .join("\n");
  const highRiskLines = risks
    .filter((risk) => ["high", "critical"].includes(risk.severity))
    .map((risk) => `- ${risk.title}: ${riskSeverityLabels[risk.severity]} / ${riskStatusLabels[risk.status] ?? risk.status}`);
  const experimentLines =
    experiments.length > 0
      ? experiments
          .map(
            (experiment) =>
              `- ${experiment.name}: ${experimentStatusLabels[experiment.status] ?? experiment.status} / ${
                experiment.success_metric || "성공 지표 미정"
              }`,
          )
          .join("\n")
      : "- 연결된 실험이 없습니다.";
  const decisionLines =
    decisions.length > 0
      ? decisions.map((decision) => `- ${decisionLabels[decision.decision]}: ${decision.reason || "근거 미기록"}`).join("\n")
      : "- 판단 기록이 없습니다.";
  const handoffDecision =
    prdReadinessScore >= 100
      ? "PRD 작성 가능"
      : prdReadinessScore >= 70
        ? "조건부 PRD 작성"
        : "검증 보강 후 PRD";

  return `# PRD 전환 핸드오프: ${idea.name}

## 전환 판단

- 핸드오프 판단: ${handoffDecision}
- PRD 준비도: ${prdReadinessScore}%
- 검증 증거 점수: ${validationEvidenceCoach ? `${validationEvidenceCoach.score}% / ${validationEvidenceCoach.label}` : "미계산"}
- 점수 기반 추천: ${decisionLabels[recommendation]}
- 현재 운영 판단: ${decisionLabels[state.decision]}
- 벤처 점수: ${score}
- 다음 차단 항목: ${nextPrdBlocker ? `${nextPrdBlocker.label} - ${nextPrdBlocker.detail}` : "없음"}

## PRD에 고정할 문제 범위

- 아이디어: ${idea.name}
- 한 줄 설명: ${idea.one_liner || "미정"}
- 대상 사용자: ${idea.target_user || "미정"}
- 구매자/승인자: ${idea.buyer || "미정"}
- 핵심 수요 신호: ${state.signal || "미정"}
- 다음 증거/검증 초점: ${state.next_evidence || validationEvidenceCoach?.nextFocus?.action || "미정"}

## 준비도 체크

${readinessLines || "- 준비도 체크가 없습니다."}

## 실험과 판단 근거

${experimentLines}

${decisionLines}

## 높은 리스크

${highRiskLines.length > 0 ? highRiskLines.join("\n") : "- 높음/치명 리스크가 없습니다."}

## PRD 작성자 지시

1. 검증된 문제, 사용자, 구매자만 PRD 범위에 포함합니다.
2. MVP는 1개 핵심 여정과 1개 성공 지표로 제한합니다.
3. 제외 범위와 중단 기준을 PRD에 명시합니다.
4. 열려 있는 높은 리스크는 수용 조건 또는 차단 조건으로 분리합니다.
5. 디자인/개발 단계로 넘기기 전에 PRD와 MVP 명세를 각각 승인 상태로 바꿉니다.

## 제품 산출물로 넘길 결정

- 포함 범위:
- 제외 범위:
- 1차 성공 지표:
- No-go 기준:
- 승인자:
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

function buildMvpSlicePlanMarkdown({
  idea,
  state,
  experiments,
  risks,
  artifacts,
}: {
  idea: Idea;
  state: EditState;
  experiments: Experiment[];
  risks: Risk[];
  artifacts: VentureArtifact[];
}) {
  const experimentLines =
    experiments.length > 0
      ? experiments
          .slice(0, 5)
          .map(
            (experiment) =>
              `- ${experiment.name} (${experimentStatusLabels[experiment.status] ?? experiment.status}): ${
                experiment.success_metric || "성공 지표 미정"
              }`,
          )
          .join("\n")
      : "- 아직 연결된 실험이 없습니다. Slice 0에서 인터뷰, 랜딩, 컨시어지 테스트 중 하나를 먼저 만듭니다.";
  const highRiskLines = risks
    .filter((risk) => ["high", "critical"].includes(risk.severity))
    .map(
      (risk) =>
        `- ${risk.title} (${riskSeverityLabels[risk.severity]}, ${riskStatusLabels[risk.status] ?? risk.status}): ${
          risk.mitigation || "완화 조건 미정"
        }`,
    );
  const approvedArtifactLines = artifacts
    .filter((artifact) => artifact.status === "approved")
    .slice(0, 6)
    .map((artifact) => `- ${artifactLabels[artifact.artifact_type]}: ${artifact.title}`);
  const firstExperiment = experiments.find((experiment) => experiment.success_metric.trim()) ?? experiments[0] ?? null;
  const primaryMetric = firstExperiment?.success_metric || state.next_evidence || "사용자가 핵심 여정을 완료하고 다음 테스트 또는 구매 의향을 남깁니다.";

  return `# MVP 슬라이스 플랜: ${idea.name}

## 제품 전환 원칙

- 목표: ${idea.one_liner || "미정"}
- 대상 사용자: ${idea.target_user || "미정"}
- 구매자/승인자: ${idea.buyer || "미정"}
- 첫 성공 지표: ${primaryMetric}
- 범위 원칙: 일정은 고정하고 기능을 줄입니다. 자동화보다 검증 속도를 우선합니다.
- 개발 진입 조건: 문제, 구매자, 수요 신호, 다음 증거가 한 문장으로 연결되어야 합니다.

## 현재 검증 재료

- 수요 신호: ${state.signal || "미정"}
- 리스크 요약: ${state.risk_summary || "미정"}
- 다음 증거: ${state.next_evidence || "미정"}

### 연결된 실험

${experimentLines}

### 승인된 산출물

${approvedArtifactLines.length > 0 ? approvedArtifactLines.join("\n") : "- 승인된 제품 산출물이 없습니다. PRD, 디자인 브리프, 기술 명세 중 최소 하나를 승인하세요."}

### 높은 리스크

${highRiskLines.length > 0 ? highRiskLines.join("\n") : "- 높음/치명 리스크가 없습니다."}

## Slice 0. 수동/컨시어지 검증

목적: 앱을 만들기 전에 사람이 같은 결과를 직접 제공해 사용자의 실제 행동을 확인합니다.

포함:

- 인터뷰, 수동 리포트, 스프레드시트, 노션/폼, 카카오톡/이메일 운영
- 사용자가 원하는 입력과 결과물 샘플 수집
- 구매자에게 가격, 예산, 승인 경로 질문

수용 기준:

- ${idea.target_user || "대상 사용자"} 5명 이상에게 최근 실제 사례를 확인합니다.
- 3명 이상이 현재 대안보다 낫다고 평가합니다.
- 2명 이상이 지불, 재사용, 도입, 소개 중 하나의 행동 의향을 보입니다.

No-go:

- 실제 사례 없이 "있으면 좋겠다"만 반복됩니다.
- 구매자 또는 승인자가 불명확합니다.
- 민감정보 처리 없이는 결과를 줄 수 없습니다.

## Slice 1. 얇은 제품 슬라이스

목적: 수동 검증에서 반복된 한 가지 여정만 제품화합니다.

포함:

- 인증된 사용자와 워크스페이스 경계
- 핵심 입력 1개, 저장, 조회, 편집, 상태 메시지
- 결과물 복사 또는 저장
- 최소 감사 흔적과 권한 차단

제외:

- 다중 페르소나별 복잡한 권한
- 결제, 추천 알고리즘, 외부 계정 직접 조작
- 전체 운영 자동화와 관리자 백오피스

수용 기준:

- 사용자가 3분 안에 핵심 입력을 저장하고 결과를 확인합니다.
- 저장 직후 새로고침 없이 목록과 상세가 갱신됩니다.
- 빈 상태, 로딩, 성공, 오류, 읽기 전용 상태가 있습니다.

## Slice 2. AI/자동화 슬라이스

목적: 반복된 수동 단계를 AI 보조 기능으로 바꿉니다.

포함:

- 입력 내용을 요약, 분류, 초안 생성, 다음 질문 추천
- 생성 결과의 신뢰도, 근거, 수정/폐기 버튼
- 사람 승인 후 저장되는 human-in-the-loop 흐름

제외:

- 사용자의 돈, 계정, 개인정보를 자동으로 조작하는 실행
- 법률, 의료, 금융 판단을 최종 결론처럼 제시하는 기능
- 근거 없는 자동 승인

수용 기준:

- AI 결과가 사용자 시간을 줄인다는 정성 피드백을 받습니다.
- 결과가 DB에 저장되기 전 사용자가 검토하거나 수정할 수 있습니다.
- 민감정보는 최소 수집하고 프롬프트/로그 보관 범위를 명시합니다.

## Slice 3. 출시 하드닝

목적: 작은 제품을 안전하게 배포하고 되돌릴 수 있게 만듭니다.

포함:

- QA 스모크: 로그인, 저장, 조회, 편집, 산출물 저장
- 보안 스모크: RLS 또는 Security Rules 허용/차단 검증
- Vercel Production 배포 로그, 환경변수 경계, 롤백 기준
- 높은 리스크의 종료 또는 명시적 수용 기록

수용 기준:

- pnpm quality:full과 프로덕션 스모크가 통과합니다.
- 배포 URL, 커밋, 검증 명령, 남은 리스크가 개발 완료 보고서에 남습니다.
- 장애 시 직전 정상 배포로 되돌릴 기준이 있습니다.

## 우선순위 결정

1. Slice 0이 실패하면 개발하지 않습니다.
2. Slice 1은 사용자가 반복 요구한 한 가지 여정만 만듭니다.
3. Slice 2는 Slice 1에서 반복 사용이 확인된 뒤 붙입니다.
4. Slice 3은 베타 사용자에게 열기 전 반드시 완료합니다.

## 다음 개발 태스크 후보

- PRD/MVP 범위 잠금: 포함, 제외, No-go, 성공 지표 승인
- 핵심 화면 설계: 첫 입력, 결과, 빈 상태, 오류, 읽기 전용
- 데이터와 권한: 사용자/워크스페이스 경계, 저장/조회/차단 검증
- 첫 수직 슬라이스 구현: ${idea.one_liner || "핵심 사용자 여정"}
- QA/보안/배포 증거 기록
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

## 0.1 준비도 게이트

- 디자인 준비도: 핵심 여정, PRD, MVP 범위, 백엔드 결정, 빈 상태/로딩/오류/권한/모바일/접근성 커버리지를 확인합니다.
- 개발 착수 준비도: 승인된 PRD, 승인된 MVP 명세, 백엔드 결정, 승인된 디자인 브리프, 승인된 기술 명세, 개발 런북, 구현 태스크, 높은 리스크 상태를 확인합니다.
- 운영 안전장치: Vercel 환경변수, Supabase RLS 또는 Firebase Security Rules, Preview/Production 배포 로그, 롤백 기준을 코드 작업 전에 기록합니다.
- 준비도 게이트는 출시 준비도보다 앞선 작업 게이트입니다. 부족한 항목이 있으면 코드 작업보다 산출물 또는 리스크 정리를 우선합니다.

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
- 환경변수와 비밀값 경계:
- 배포 로그와 롤백:

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
- 정책 변경 후 SQL Editor, migration, 또는 로컬 검증 로그 중 하나를 산출물에 남깁니다.

### Firebase 체크

- Firestore/Storage를 쓰면 Security Rules를 먼저 작성합니다.
- Rules는 request.auth, 소유권, 조직 멤버십, 입력 데이터 형태를 검증합니다.
- 서버 SDK/Admin SDK를 쓰면 IAM과 서버 전용 경계를 검토합니다.
- 공개 클라이언트에서 Firebase 리소스를 직접 호출하면 App Check를 검토합니다.
- SQL Connect를 쓰면 schema/query/mutation, auth, region, 가격, realtime/offline 동작을 확인합니다.
- Security Rules 또는 IAM 변경 후 허용/차단 케이스와 Emulator/Preview 결과를 기록합니다.

### 환경변수 체크

- Vercel Preview와 Production에 필요한 변수명을 분리해 적습니다.
- 브라우저에 노출 가능한 공개 키와 서버 전용 비밀값을 분리합니다.
- 서비스 역할 키, Admin SDK, 결제/AI API 키는 서버 경계 안에서만 사용합니다.
- 환경변수 변경 뒤에는 재배포 여부와 배포 로그를 확인합니다.

### 품질 게이트

- pnpm lint
- pnpm typecheck
- pnpm build
- pnpm harness:check
- 핵심 여정 브라우저 스모크
- 배포 후 Production 스모크
- Vercel 배포 로그 또는 inspect 링크 확인

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
- Vercel inspect URL, 배포 로그, Production alias 반영 여부를 완료 증거로 남깁니다.
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

function includesAny(text: string, terms: string[]) {
  return terms.some((term) => text.includes(term));
}

function clampBackendScore(score: number) {
  return Math.max(0, Math.min(100, score));
}

function buildBackendCandidateScores({
  idea,
  state,
  experiments,
  risks,
}: {
  idea: Idea;
  state: EditState;
  experiments: Experiment[];
  risks: Risk[];
}): BackendCandidateScore[] {
  const text = [
    idea.name,
    idea.one_liner,
    idea.target_user,
    idea.buyer,
    state.signal,
    state.risk_summary,
    state.next_evidence,
    ...experiments.flatMap((experiment) => [experiment.name, experiment.success_metric]),
    ...risks.flatMap((risk) => [risk.title, risk.area, risk.mitigation]),
  ]
    .join(" ")
    .toLowerCase();
  const relational = includesAny(text, ["운영", "콘솔", "센터", "관리", "승인", "권한", "워크플로", "리포트", "감사", "b2b", "sql", "관계형"]);
  const mobile = includesAny(text, ["모바일", "ios", "android", "네이티브", "앱스토어", "푸시", "알림", "카메라", "위치"]);
  const realtime = includesAny(text, ["실시간", "채팅", "동기화", "협업", "라이브", "presence", "offline", "오프라인"]);
  const analytics = includesAny(text, ["analytics", "분석", "crash", "crashlytics", "remote config", "a/b", "ab test", "test lab", "app check"]);
  const googleStack = includesAny(text, ["google", "firebase", "gcp", "cloud functions", "cloud messaging", "genkit", "data connect", "sql connect"]);
  const sensitive = includesAny(text, ["개인정보", "민감", "건강", "의료", "금융", "상담", "요양", "법률", "위치", "사진", "가족"]);
  const regulated = sensitive || risks.some((risk) => ["high", "critical"].includes(risk.severity));
  const fastMvp = state.mvp_speed >= 4 || includesAny(text, ["mvp", "프로토타입", "빠르게", "2주"]);

  const supabaseScore = clampBackendScore(
    54 +
      (relational ? 18 : 0) +
      (regulated ? 10 : 0) +
      (fastMvp ? 6 : 0) -
      (mobile ? 6 : 0) -
      (realtime ? 4 : 0),
  );
  const firebaseScore = clampBackendScore(
    42 +
      (mobile ? 20 : 0) +
      (realtime ? 14 : 0) +
      (analytics ? 12 : 0) +
      (googleStack ? 8 : 0) -
      (relational ? 8 : 0) -
      (regulated ? 3 : 0),
  );
  const sqlConnectScore = clampBackendScore(
    38 +
      (relational ? 12 : 0) +
      (mobile || realtime ? 10 : 0) +
      (googleStack ? 12 : 0) +
      (analytics ? 6 : 0) -
      (!relational ? 6 : 0),
  );
  const hybridScore = clampBackendScore(
    36 +
      (relational && (mobile || realtime) ? 18 : 0) +
      (regulated && analytics ? 10 : 0) +
      (googleStack ? 8 : 0) -
      (fastMvp ? 8 : 0),
  );

  const candidates: BackendCandidateScore[] = [
    {
      key: "supabase",
      label: "Supabase",
      score: supabaseScore,
      summary: "관계형 데이터, SQL, RLS, 운영 콘솔, 조직 권한이 중심인 MVP에 적합합니다.",
      strengths: ["Postgres/RLS 기반 권한", "SQL 질의와 운영자 테이블 점검", "Vercel/Next.js 운영 콘솔과 빠른 궁합"],
      cautions: ["모바일 네이티브 진단/푸시/오프라인은 별도 설계 필요", "실시간 앱 품질 도구는 직접 조합해야 함"],
    },
    {
      key: "firebase",
      label: "Firebase",
      score: firebaseScore,
      summary: "모바일, 실시간, 오프라인, 푸시, Analytics/Crashlytics/App Check가 핵심인 MVP에 적합합니다.",
      strengths: ["모바일/웹 SDK와 Google Analytics", "Crashlytics, Cloud Messaging, Remote Config, Test Lab", "App Check와 Emulator Suite"],
      cautions: ["복잡한 조인/운영 리포트는 Firestore 모델링 비용이 큼", "Security Rules와 IAM 경계를 별도로 검증해야 함"],
    },
    {
      key: "firebase_sql_connect",
      label: "Firebase SQL Connect",
      score: sqlConnectScore,
      summary: "PostgreSQL이 필요하지만 Firebase SDK, Google Cloud, 앱 품질 도구도 중요한 경우 검토합니다.",
      strengths: ["Firebase 생태계와 Postgres 모델 절충", "Generated SDK와 Google Cloud 운영 연결", "모바일 앱과 SQL 모델을 함께 검토 가능"],
      cautions: ["Supabase와 운영 모델이 다름", "Cloud SQL, region, 가격, 로컬 에뮬레이터 범위 확인 필요"],
    },
    {
      key: "hybrid",
      label: "Hybrid",
      score: hybridScore,
      summary: "관계형 운영 데이터와 모바일/실시간 앱 경험을 분리해야 할 때만 선택합니다.",
      strengths: ["운영 콘솔은 SQL/RLS, 앱 경험은 Firebase로 분리", "민감 데이터와 이벤트 데이터를 다른 경계로 통제", "점진적 전환 가능"],
      cautions: ["MVP 초반에는 복잡도가 빠르게 커짐", "동기화, 권한, 장애 대응 책임이 두 배가 될 수 있음"],
    },
  ];

  return candidates.sort((left, right) => right.score - left.score);
}

function buildBackendDecisionMarkdown({
  idea,
  state,
  candidates,
}: {
  idea: Idea;
  state: EditState;
  candidates: BackendCandidateScore[];
}) {
  const recommended = candidates[0];
  const candidateRows = candidates
    .map(
      (candidate) =>
        `| ${candidate.label} | ${candidate.score} | ${candidate.strengths[0]} | ${candidate.cautions[0]} |`,
    )
    .join("\n");

  return `# 백엔드 결정: ${idea.name}

## 결정 요약

- 현재 권장: ${recommended?.label ?? "Supabase 우선 유지"}
- 추천 근거: ${recommended?.summary ?? "관계형 운영 콘솔과 RLS가 현재 기본 요구에 맞습니다."}
- 재검토 조건: 모바일 네이티브, 실시간/오프라인, 푸시, Crashlytics, Remote Config, Firebase Test Lab, App Check가 MVP 검증의 핵심이면 Firebase 또는 Firebase SQL Connect를 비교합니다.
- 판단 기준: ${state.next_evidence || "다음 증거를 가장 빨리 검증하는 백엔드를 선택합니다."}

## 후보 스코어카드

| 후보 | 점수 | 강점 | 주의 |
| --- | ---: | --- | --- |
${candidateRows}

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
- 백엔드 규칙 검증: RLS 또는 Security Rules 허용/차단 테스트
- 배포 로그: Vercel inspect URL 또는 Preview/Production 빌드 로그
- 배포/롤백:
- 남은 리스크: ${state.risk_summary || "미정"}
`;
}

function buildBackendExecutionPlan(backend: BackendCandidateScore): BackendExecutionPlan {
  const sharedChecks: BackendExecutionCheck[] = [
    {
      label: "클라이언트/서버 키 경계",
      detail: "브라우저에 노출되는 공개 설정과 서버 전용 비밀값을 분리합니다.",
      evidence: "Vercel Production env 목록에서 NEXT_PUBLIC 또는 공개 Firebase config와 서버 전용 키 경계를 기록",
      tone: "required",
    },
    {
      label: "허용/차단 테스트",
      detail: "로그인 사용자 본인/조직 데이터 접근은 허용하고 타인 데이터 접근은 차단합니다.",
      evidence: "허용 케이스 1개와 차단 케이스 1개의 실행 결과 또는 스크린샷/로그",
      tone: "required",
    },
    {
      label: "Preview/Production 재검증",
      detail: "Preview와 Production에서 같은 권한 경계와 환경변수가 적용되는지 확인합니다.",
      evidence: "Vercel inspect URL, smoke 명령, 배포 URL",
      tone: "required",
    },
  ];

  if (backend.key === "firebase") {
    return {
      backend,
      envVars: [
        "NEXT_PUBLIC_FIREBASE_API_KEY",
        "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
        "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
        "FIREBASE_SERVICE_ACCOUNT 또는 Google Cloud IAM 서버 자격 증명",
      ],
      checks: [
        {
          label: "Security Rules",
          detail: "Firestore/Storage Rules에서 request.auth, uid, 조직 멤버십, 입력 데이터 형태를 검증합니다.",
          evidence: "Emulator 또는 Preview에서 본인 문서 write 허용, 다른 uid write 거부 결과",
          tone: "required",
        },
        {
          label: "App Check",
          detail: "공개 클라이언트에서 Firebase 리소스를 직접 호출한다면 App Check 적용 여부를 결정합니다.",
          evidence: "App Check 설정 또는 MVP 기간 미적용 사유",
          tone: "recommended",
        },
        ...sharedChecks,
      ],
      localCommand: "firebase emulators:start && pnpm lint && pnpm typecheck && pnpm build",
      productionGate: "Security Rules 배포 후 Preview/Production에서 본인 write와 타인 write 차단을 재확인합니다.",
      rollback: "직전 Rules 배포본과 Vercel 직전 Ready 배포로 되돌립니다.",
    };
  }

  if (backend.key === "firebase_sql_connect") {
    return {
      backend,
      envVars: [
        "NEXT_PUBLIC_FIREBASE_API_KEY",
        "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
        "FIREBASE_SERVICE_ACCOUNT 또는 Google Cloud IAM 서버 자격 증명",
        "SQL_CONNECT_INSTANCE / generated SDK 설정",
      ],
      checks: [
        {
          label: "Schema/Connector 권한",
          detail: "SQL Connect schema, query, mutation이 인증 사용자와 조직 경계를 반영하는지 확인합니다.",
          evidence: "허용 query/mutation과 차단 query/mutation 결과",
          tone: "required",
        },
        {
          label: "Region/가격",
          detail: "Cloud SQL region, Firebase region, 예상 쿼리 비용과 cold path를 MVP 범위에 맞춥니다.",
          evidence: "선택 region, 가격 메모, 데이터 보관/삭제 기준",
          tone: "recommended",
        },
        ...sharedChecks,
      ],
      localCommand: "firebase emulators:start && pnpm lint && pnpm typecheck && pnpm build",
      productionGate: "generated SDK와 connector 배포 후 Preview에서 권한/쿼리 shape를 재확인합니다.",
      rollback: "직전 connector/schema 배포본과 Vercel 직전 Ready 배포로 되돌립니다.",
    };
  }

  if (backend.key === "hybrid") {
    return {
      backend,
      envVars: [
        "NEXT_PUBLIC_SUPABASE_URL",
        "NEXT_PUBLIC_SUPABASE_ANON_KEY",
        "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
        "SUPABASE_SERVICE_ROLE_KEY 서버 전용",
        "FIREBASE_SERVICE_ACCOUNT 서버 전용",
      ],
      checks: [
        {
          label: "데이터 소유권 분리",
          detail: "어떤 데이터가 Supabase에 남고 어떤 이벤트/실시간 데이터가 Firebase로 가는지 경계를 고정합니다.",
          evidence: "데이터 분리 표와 동기화 실패 시 우선 소스",
          tone: "required",
        },
        {
          label: "이중 권한 검증",
          detail: "Supabase RLS와 Firebase Rules/IAM을 각각 허용/차단 케이스로 검증합니다.",
          evidence: "Supabase allowed/denied, Firebase allowed/denied 결과",
          tone: "required",
        },
        ...sharedChecks,
      ],
      localCommand: "pnpm lint && pnpm typecheck && pnpm build && pnpm smoke:routes",
      productionGate: "두 백엔드가 모두 Preview/Production에서 같은 사용자 경계를 적용하는지 확인합니다.",
      rollback: "Vercel 직전 Ready 배포와 각 백엔드의 직전 정책/Rules 배포본으로 되돌립니다.",
    };
  }

  return {
    backend,
    envVars: ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY 서버 전용"],
    checks: [
      {
        label: "RLS 활성화",
        detail: "모든 사용자 기록 테이블에서 RLS를 켜고 owner/workspace 정책을 적용합니다.",
        evidence: "SQL Editor 또는 migration에서 RLS/policy 적용 로그",
        tone: "required",
      },
      {
        label: "Service role 차단 경계",
        detail: "service role key는 서버 전용 작업에만 쓰고 클라이언트 번들에 노출하지 않습니다.",
        evidence: "Vercel env 공개/서버 키 경계 메모와 NEXT_PUBLIC 사용 목록",
        tone: "required",
      },
      ...sharedChecks,
    ],
    localCommand: "pnpm lint && pnpm typecheck && pnpm build && pnpm smoke:routes",
    productionGate: "RLS 정책 적용 후 Production에서 로그인 사용자 insert/update와 타인 데이터 차단을 재확인합니다.",
    rollback: "직전 migration/policy 백업과 Vercel 직전 Ready 배포로 되돌립니다.",
  };
}

function buildBackendExecutionPlanMarkdown({
  idea,
  plan,
}: {
  idea: Idea;
  plan: BackendExecutionPlan;
}) {
  return `# 백엔드 실행 체크리스트: ${idea.name}

## 선택

- 권장 백엔드: ${plan.backend.label}
- 점수: ${plan.backend.score}
- 요약: ${plan.backend.summary}

## 환경변수

${plan.envVars.map((envVar) => `- ${envVar}`).join("\n")}

## 권한/보안 체크

${plan.checks
  .map(
    (check) => `### ${check.label}

- 구분: ${check.tone === "required" ? "필수" : "권장"}
- 확인: ${check.detail}
- 증거: ${check.evidence}
`,
  )
  .join("\n")}

## 로컬 검증 명령

\`\`\`bash
${plan.localCommand}
\`\`\`

## Production 게이트

${plan.productionGate}

## 롤백

${plan.rollback}
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

function buildDesignGenerationPromptMarkdown({
  idea,
  state,
  risks,
  experiments,
  backendCandidateScores,
}: {
  idea: Idea;
  state: EditState;
  risks: Risk[];
  experiments: Experiment[];
  backendCandidateScores: BackendCandidateScore[];
}) {
  const topBackend = backendCandidateScores[0]?.label ?? "Supabase";
  const riskLines =
    risks.length > 0
      ? risks
          .slice(0, 5)
          .map((risk) => `- ${risk.title}: ${riskSeverityLabels[risk.severity]} / ${risk.mitigation || "완화 방안 미정"}`)
          .join("\n")
      : "- 아직 연결된 리스크가 없습니다. 개인정보, 권한, 결제, 규제 리스크를 기본 상태로 고려하세요.";
  const experimentLines =
    experiments.length > 0
      ? experiments
          .slice(0, 4)
          .map((experiment) => `- ${experiment.name}: ${experiment.success_metric || "성공 지표 미정"}`)
          .join("\n")
      : "- 아직 실험이 없습니다. 첫 화면에서 사용자가 핵심 행동을 완료했는지 측정할 수 있게 설계하세요.";

  return `# 디자인 생성 프롬프트: ${idea.name}

아래 내용을 기반으로 실제 앱 첫 화면과 핵심 업무 흐름을 생성하세요. 마케팅 랜딩 페이지가 아니라, 사용자가 바로 입력하고 저장하고 다음 행동으로 넘어가는 제품 화면이어야 합니다.

## 제품 맥락

- 앱 이름: ${idea.name}
- 한 줄 설명: ${idea.one_liner || "미정"}
- 대상 사용자: ${idea.target_user || "미정"}
- 구매자/승인자: ${idea.buyer || "미정"}
- 현재 단계: ${stageLabels[state.stage]}
- 현재 판단: ${decisionLabels[state.decision]}
- 추천 백엔드: ${topBackend}
- 다음 검증 증거: ${state.next_evidence || "미정"}

## 사용자가 해결하려는 문제

${state.signal || "사용자의 반복 문제, 현재 대안, 비용/시간 손실을 화면 구조에서 드러내세요."}

## 생성할 화면

1. 대시보드/작업 시작 화면
   - 핵심 지표 3-5개
   - 오늘 해야 할 다음 행동
   - 최근 저장 기록 또는 진행 중 작업
2. 핵심 입력 화면
   - 필수 입력과 선택 입력을 분리
   - 저장/생성/검증 중 하나의 primary action
   - 입력 전/입력 중/저장 완료/오류 상태
3. 결과 또는 산출물 검토 화면
   - 사용자가 결과를 비교, 승인, 수정, 저장할 수 있는 구조
   - 다음 실험 또는 다음 증거로 이어지는 CTA
4. 상세/기록 화면
   - 상태, 근거, 리스크, 담당자, 수정 이력을 확인
5. 설정/권한 또는 데이터 경계 화면
   - 민감 데이터, 삭제, 권한, 워크스페이스 경계를 명확히 표시

## UX 구조

- 왼쪽에는 순서 기반 메뉴 또는 단계형 사이드바를 둡니다.
- 오른쪽에는 현재 단계의 입력 폼, 결과, 저장 상태만 보여줍니다.
- 긴 스크롤보다 탭, 세그먼트, 단계 전환을 우선합니다.
- 사용자는 위아래로 왕복하지 않고 다음 행동을 찾을 수 있어야 합니다.
- 빈 상태에는 기능 설명 대신 사용자가 바로 할 수 있는 첫 행동을 배치합니다.

## 컴포넌트 요구사항

- 버튼에는 가능한 경우 아이콘과 짧은 동사를 함께 사용합니다.
- 상태는 배지, 체크, 경고, 진행률로 구분합니다.
- 표/리스트는 반복 업무를 빠르게 스캔할 수 있게 촘촘하지만 답답하지 않게 설계합니다.
- 카드 반경은 8px 이하로 절제합니다.
- 모바일에서는 단일 컬럼, 하단 고정 primary action, 접을 수 있는 메뉴를 사용합니다.
- 텍스트가 버튼이나 카드 밖으로 넘치지 않게 줄바꿈과 min/max width를 안정적으로 잡습니다.

## 시각 스타일

- 운영 도구처럼 조용하고 명확한 UI를 만듭니다.
- 과한 히어로, 장식용 그라디언트, 추상 배경 오브젝트, 의미 없는 일러스트를 피합니다.
- 색상은 상태와 우선순위를 구분하는 데 사용하고, 한 가지 색조만 반복하지 않습니다.
- 접근성 대비, 포커스 상태, 키보드 이동이 가능한 구조로 만듭니다.

## 데이터와 권한

- 백엔드 후보: ${topBackend}
- 사용자는 자기 기록 또는 워크스페이스 기록만 볼 수 있다고 가정합니다.
- 저장 성공, 저장 실패, 권한 없음, 읽기 전용, 로딩, 빈 상태를 모두 설계합니다.
- 민감 데이터가 있다면 수집 목적, 보관, 삭제 경로를 화면에 포함합니다.

## 리스크

${riskLines}

## 검증 실험

${experimentLines}

## 생성 도구별 출력 지시

### v0 또는 React 코드 생성 도구

- Next.js App Router, React, TypeScript, Tailwind CSS 기준으로 생성합니다.
- lucide-react 아이콘을 사용합니다.
- shadcn/ui 계열 컴포넌트를 쓰되, 불필요한 랜딩 페이지 섹션은 만들지 않습니다.
- 실제 데이터 연결 전에는 명확한 mock data와 loading/error/empty state를 포함합니다.

### Stitch/Figma/시각 디자인 생성 도구

- 데스크톱 1440px와 모바일 390px 시안을 함께 만듭니다.
- 첫 화면에서 제품의 실제 업무 화면이 보여야 합니다.
- 입력 폼, 결과 패널, 상태 메시지, 리스트/테이블, 권한/빈 상태를 포함합니다.

## 산출물 검수 기준

- 첫 화면에서 ${idea.target_user || "사용자"}가 무엇을 해야 하는지 5초 안에 이해됩니다.
- 핵심 입력부터 저장 완료까지 한 흐름이 보입니다.
- 저장/오류/권한/빈 상태가 누락되지 않았습니다.
- 모바일에서 버튼과 텍스트가 겹치지 않습니다.
- 이 화면만 보고 개발자가 첫 MVP 슬라이스를 구현할 수 있습니다.
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

## 운영 안전장치

- Vercel 환경변수: Preview/Production 변수명, 공개 가능 여부, 서버 전용 여부를 표로 정리합니다.
- 백엔드 규칙: Supabase RLS 또는 Firebase Security Rules/IAM의 허용/차단 테스트를 적습니다.
- 배포 로그: Preview URL, Production URL, Vercel inspect URL 또는 빌드 로그 위치를 남깁니다.
- 롤백 기준: 어떤 실패에서 직전 배포로 되돌릴지, DB 보정 SQL이 필요한지 적습니다.

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
- 환경변수 변경은 새 배포 여부, Vercel 로그, Production alias 반영을 확인합니다.
`;
}

function buildAppBlueprintMarkdown({
  idea,
  state,
  risks,
  experiments,
  implementationTasks,
  backendCandidateScores,
}: {
  idea: Idea;
  state: EditState;
  risks: Risk[];
  experiments: Experiment[];
  implementationTasks: ImplementationTask[];
  backendCandidateScores: BackendCandidateScore[];
}) {
  const topBackend = backendCandidateScores[0]?.label || "Supabase";
  const highRisks = risks.filter((risk) => risk.severity === "high" || risk.severity === "critical");
  const riskLines =
    risks.length > 0
      ? risks
          .slice(0, 8)
          .map((risk) => `- ${risk.title}: ${riskSeverityLabels[risk.severity]} / ${riskStatusLabels[risk.status] || risk.status} / ${risk.mitigation || "완화책 미정"}`)
          .join("\n")
      : "- 아직 등록된 리스크가 없습니다. 인증, 개인정보, 결제, 규제, 운영 장애 리스크를 먼저 적습니다.";
  const experimentLines =
    experiments.length > 0
      ? experiments
          .slice(0, 6)
          .map(
            (experiment) =>
              `- ${experiment.name}: ${experiment.status} / ${experiment.success_metric || "성공 지표 미정"} / 결과는 근거 산출물에 기록`,
          )
          .join("\n")
      : "- 첫 빌드 전에 5명 이상 대상 사용자에게 핵심 행동을 시켜 보는 검증 실험을 정의합니다.";
  const taskLines =
    implementationTasks.length > 0
      ? sortImplementationTasksForAction(implementationTasks)
          .slice(0, 10)
          .map(
            (task, index) =>
              `${index + 1}. ${task.title} / ${implementationTaskTypeLabels[task.task_type]} / ${implementationTaskStatusLabels[task.status]} / ${implementationTaskPriorityLabels[task.priority]}`,
          )
          .join("\n")
      : "1. 범위 잠금: 포함/제외 범위, No-go 조건, 성공 지표를 먼저 확정합니다.\n2. 데이터 경계: 사용자/워크스페이스/레코드 소유권을 정의합니다.\n3. 핵심 입력-저장-조회 흐름: 첫 수직 슬라이스를 구현합니다.\n4. 권한 차단과 오류 상태: 허용/차단/빈 상태/로딩을 모두 검증합니다.\n5. 배포와 스모크: Preview, Production, 롤백 기준을 남깁니다.";

  return `# 앱 블루프린트: ${idea.name}

이 문서는 PRD, MVP, 디자인 브리프, 기술 명세를 실제 앱 구조로 번역하는 구현 청사진입니다. 개발자는 이 문서를 기준으로 라우트, 컴포넌트, 데이터 모델, API/액션, 테스트를 만들고 과한 확장을 피합니다.

## 1. 제품 경계

- 한 줄 가치: ${idea.one_liner || "미정"}
- 대상 사용자: ${idea.target_user || "미정"}
- 구매자: ${idea.buyer || "미정"}
- 현재 단계: ${stageLabels[state.stage]}
- 현재 판단: ${decisionLabels[state.decision]}
- 다음 증거: ${state.next_evidence || "미정"}
- 추천 백엔드: ${topBackend}
- 빌드 원칙: 가장 작은 수직 슬라이스로 ${state.next_evidence || "다음 증거"}를 검증합니다.

## 2. 첫 버전 정보 구조

### 좌측 메뉴

1. 시작
2. 새 기록
3. 검토/점수
4. 산출물
5. 설정/권한

### 주요 라우트

| Route | 목적 | 포함 상태 |
| --- | --- | --- |
| / | 사용자가 오늘 해야 할 핵심 행동을 보여주는 대시보드 | 로딩, 빈 상태, 읽기 전용, 저장 성공 |
| /new | 핵심 입력 폼과 검증 전 저장 흐름 | 입력 전, 입력 중, 저장 실패, 권한 없음 |
| /records/[id] | 저장된 기록의 상세, 점수, 리스크, 다음 행동 | 수정 중, 승인됨, 보관됨 |
| /artifacts | PRD, 디자인, 기술 명세, 런북 등 산출물 라이브러리 | 초안, 승인, 보관, 버전 |
| /settings | 사용자/워크스페이스/데이터 삭제와 권한 경계 | 초대 전, 멤버 없음, 권한 부족 |

## 3. 컴포넌트 맵

- AppShell: 상단 제품명, 좌측 단계 메뉴, 우측 현재 작업 영역
- StepNavigation: 단계별 완료/차단/다음 행동 표시
- IntakeForm: 이름, 대상 사용자, 문제, 수요 신호, 다음 증거 입력
- WorkbenchPanel: 점수, 판단, 리스크 감점, 저장 상태
- EvidencePanel: 실험, 인터뷰, 수동 근거, 신뢰도 표시
- ArtifactLibrary: 산출물 유형, 버전, 승인 상태, 복사/저장
- RiskPanel: 높은 리스크, 완화책, 종료 조건
- BuildReadinessPanel: 개발 착수 게이트, 누락 항목, 다음 작업
- PermissionNotice: 로그인 필요, 읽기 전용, 워크스페이스 없음, 권한 없음

## 4. 데이터 모델 초안

| Entity | 핵심 필드 | 권한 경계 |
| --- | --- | --- |
| workspace | id, name, owner_id, created_at | owner/admin만 설정 변경 |
| membership | workspace_id, user_id, role | 본인 또는 관리자만 조회 |
| record | id, workspace_id, owner_id, name, one_liner, stage, decision | owner 또는 workspace member |
| evidence | id, record_id, type, source, body, confidence, created_by | record 접근권 상속 |
| risk | id, record_id, severity, status, mitigation | record 접근권 상속 |
| artifact | id, record_id, type, version, status, body, source | record 접근권 상속, 승인 변경은 editor 이상 |
| event_log | id, actor_id, action, target_type, target_id, metadata | 관리자/감사용 읽기 |

## 5. API와 서버 액션 계약

- listRecords: 현재 사용자 또는 워크스페이스의 기록을 최신순으로 조회합니다.
- createRecord: 핵심 입력을 저장하고 event_log에 created 이벤트를 남깁니다.
- updateRecordScore: 점수/단계/판단/다음 증거를 갱신합니다.
- createEvidence: 실험 결과나 인터뷰 근거를 저장합니다.
- createArtifact: 산출물 초안을 버전 증가 방식으로 저장합니다.
- approveArtifact: 승인 권한을 확인한 뒤 status를 approved로 바꿉니다.
- generateDraft: AI 생성이 들어가면 서버 Route Handler에서만 호출하고 원문 입력, 모델, 비용, 결과 id를 저장합니다.

## 6. 백엔드 규칙

- 선택 후보: ${topBackend}
- Supabase라면 모든 테이블에 RLS를 켜고 workspace_id 또는 owner_id 기준 정책을 둡니다.
- Firebase라면 Firestore Security Rules, App Check, Emulator 테스트를 첫 스프린트에 포함합니다.
- Firebase SQL Connect라면 SQL schema, Connector, IAM/Rules 경계를 문서화하고 로컬 검증 명령을 둡니다.
- 서비스 키, OpenAI 키, 결제 키는 클라이언트 번들에 노출하지 않습니다.

## 7. 화면 상태 체크리스트

- [ ] 로그인 전
- [ ] 로그인 후 워크스페이스 없음
- [ ] 읽기 전용 기록
- [ ] 새 기록 저장 중
- [ ] 저장 성공 후 목록 즉시 반영
- [ ] 저장 실패와 재시도
- [ ] 권한 없음
- [ ] 빈 산출물
- [ ] 모바일 390px에서 메뉴 접힘
- [ ] 데스크톱 1440px에서 좌측 메뉴와 우측 폼 동시 표시

## 8. 리스크 입력

${riskLines}

높음/치명 리스크 수: ${highRisks.length}

## 9. 검증 실험 입력

${experimentLines}

## 10. 첫 개발 태스크

${taskLines}

## 11. 수용 테스트

1. 새 사용자가 로그인 상태를 명확히 인지합니다.
2. 핵심 입력 폼을 채우고 저장하면 목록이 새로고침 없이 갱신됩니다.
3. 저장된 기록을 선택하면 점수, 리스크, 산출물 영역이 같은 문맥으로 바뀝니다.
4. 권한 없는 사용자는 쓰기 버튼이 비활성화되고 사유를 봅니다.
5. 산출물 저장 시 버전이 증가하고 최신본이 라이브러리 상단에 나타납니다.
6. 모바일에서 좌측 메뉴가 작업을 가리지 않습니다.
7. 배포 후 Production URL에서 로그인, 저장, 조회, 산출물 저장 스모크가 통과합니다.

## 12. 구현 에이전트 시작 프롬프트

너는 ${idea.name}의 첫 MVP 앱을 구현하는 선임 개발 에이전트다. 위 앱 블루프린트만 기준으로 Next.js App Router, TypeScript, Tailwind, ${topBackend} 경계를 잡아라. 첫 작업은 라우트 맵, 컴포넌트 맵, 데이터 모델, 권한 규칙, 스모크 테스트를 작은 수직 슬라이스로 연결하는 것이다. 랜딩 페이지나 장식 UI보다 실제 입력, 저장, 조회, 권한, 오류 상태를 우선한다. 완료 보고에는 변경 파일, 검증 명령, 배포 URL, 남은 리스크, 롤백 기준을 포함한다.
`;
}

function buildMvpScaffoldManifestMarkdown({
  idea,
  state,
  experiments,
  backendCandidateScores,
}: {
  idea: Idea;
  state: EditState;
  experiments: Experiment[];
  backendCandidateScores: BackendCandidateScore[];
}) {
  const topBackend = backendCandidateScores[0]?.label || "Supabase";
  const usesFirebase = /Firebase/i.test(topBackend);
  const envLines = usesFirebase
    ? [
        "| NEXT_PUBLIC_FIREBASE_API_KEY | 클라이언트 공개 | Firebase Web SDK 공개 키 |",
        "| NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN | 클라이언트 공개 | Firebase Auth domain |",
        "| NEXT_PUBLIC_FIREBASE_PROJECT_ID | 클라이언트 공개 | Firebase project id |",
        "| FIREBASE_SERVICE_ACCOUNT_JSON | 서버 전용 | Admin SDK 또는 서버 작업이 필요할 때만 사용 |",
        "| OPENAI_API_KEY | 서버 전용 | AI 생성 기능이 Slice 2로 승인된 뒤 사용 |",
      ].join("\n")
    : [
        "| NEXT_PUBLIC_SUPABASE_URL | 클라이언트 공개 | Supabase project URL |",
        "| NEXT_PUBLIC_SUPABASE_ANON_KEY | 클라이언트 공개 | RLS 전제 익명 공개 키 |",
        "| SUPABASE_SERVICE_ROLE_KEY | 서버 전용 | 마이그레이션/관리 작업에서만 사용, 브라우저 금지 |",
        "| OPENAI_API_KEY | 서버 전용 | AI 생성 기능이 Slice 2로 승인된 뒤 사용 |",
      ].join("\n");
  const backendRules = usesFirebase
    ? `## Firebase 규칙 초안

- Firestore/Realtime Database/SQL Connect 중 하나만 첫 버전에 선택합니다.
- Security Rules는 owner_id 또는 workspace_members 기준으로 읽기/쓰기 권한을 제한합니다.
- App Check는 외부 공개 전 활성화합니다.
- Emulator Suite에서 허용/차단 케이스를 테스트합니다.
- Cloud Functions는 서버 비밀값이 필요한 작업에만 사용합니다.`
    : `## Supabase 스키마/RLS 초안

\`\`\`sql
create table if not exists public.records (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  workspace_id uuid,
  name text not null,
  status text not null default 'draft',
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.records enable row level security;

create policy "records_select_own"
on public.records for select
to authenticated
using (owner_id = auth.uid());

create policy "records_insert_own"
on public.records for insert
to authenticated
with check (owner_id = auth.uid());

create policy "records_update_own"
on public.records for update
to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());
\`\`\`

- 워크스페이스 협업이 필요하면 membership 테이블을 먼저 만들고 정책에 exists 조건을 추가합니다.
- 삭제는 첫 버전에서 hard delete보다 archived 상태를 우선 검토합니다.`;
  const experimentLines =
    experiments.length > 0
      ? experiments
          .slice(0, 5)
          .map((experiment) => `- ${experiment.name}: ${experiment.success_metric || "성공 지표 미정"}`)
          .join("\n")
      : "- 첫 구현 전 성공 지표를 가진 실험을 1개 이상 정의합니다.";

  return `# MVP 스캐폴드 매니페스트: ${idea.name}

이 문서는 빈 저장소 또는 새 서비스 디렉터리에서 첫 MVP를 만들 때 쓰는 실행 지시입니다. 구현 범위는 ${state.next_evidence || "다음 증거"}를 검증하는 데 필요한 최소 수직 슬라이스로 제한합니다.

## 제품 입력

- 한 줄 가치: ${idea.one_liner || "미정"}
- 대상 사용자: ${idea.target_user || "미정"}
- 구매자: ${idea.buyer || "미정"}
- 현재 단계: ${stageLabels[state.stage]}
- 현재 판단: ${decisionLabels[state.decision]}
- 추천 백엔드: ${topBackend}

## 권장 스택

- Next.js App Router
- React + TypeScript
- Tailwind CSS
- lucide-react icons
- Vercel Preview/Production
- ${topBackend}

## 파일 트리

\`\`\`txt
app/
  layout.tsx
  page.tsx
  records/
    [id]/
      page.tsx
  settings/
    page.tsx
  api/
    records/
      route.ts
components/
  app-shell.tsx
  step-navigation.tsx
  record-intake-form.tsx
  record-workbench.tsx
  evidence-panel.tsx
  artifact-panel.tsx
  permission-notice.tsx
lib/
  auth/
    session.ts
  backend/
    client.ts
    server.ts
  validation/
    record-schema.ts
  analytics/
    events.ts
scripts/
  smoke-production.ps1
  smoke-browser.mjs
docs/
  ENVIRONMENT.md
  RELEASE_CHECKLIST.md
\`\`\`

## 라우트 책임

- \`/\`: 오늘의 다음 행동, 최근 기록, 새 기록 CTA
- \`/records/[id]\`: 기록 상세, 점수/상태, 근거, 산출물, 다음 증거
- \`/settings\`: 계정, 워크스페이스, 데이터 삭제, 권한 경계
- \`/api/records\`: 서버에서 입력 검증 후 저장. 서버 비밀값이 필요한 외부 호출은 여기서만 실행

## 환경변수

| 이름 | 노출 | 용도 |
| --- | --- | --- |
${envLines}

${backendRules}

## 첫 구현 순서

1. AppShell과 단계형 좌측 메뉴를 만듭니다.
2. 새 기록 입력 폼을 만들고 필수 필드 검증을 붙입니다.
3. ${topBackend} 읽기/쓰기 클라이언트 경계를 나눕니다.
4. 기록 저장 후 목록과 상세가 새로고침 없이 갱신되게 합니다.
5. 빈 상태, 로딩, 저장 실패, 권한 없음, 읽기 전용 상태를 만듭니다.
6. 산출물/근거 패널은 mock data로 시작하고 저장 계약이 정해지면 연결합니다.
7. 모바일 390px에서 메뉴가 작업을 가리지 않게 합니다.
8. Preview 배포 후 핵심 저장/조회 스모크를 통과시킵니다.

## 검증 실험

${experimentLines}

## 완료 기준

- 사용자가 새 기록을 만들고 저장 성공을 확인합니다.
- 저장된 기록을 다시 열 수 있습니다.
- 권한 없는 쓰기 시도가 차단됩니다.
- 환경변수 공개/서버 전용 경계가 문서화됩니다.
- \`pnpm lint\`, \`pnpm typecheck\`, \`pnpm build\`가 통과합니다.
- Preview URL과 Production URL, Vercel inspect 링크, 롤백 기준이 완료 보고에 남습니다.

## Codex 실행 지시

위 파일 트리와 완료 기준만 구현합니다. 마케팅 랜딩 페이지, 결제, 고급 AI 자동화, 관리자 대시보드, 복잡한 알림은 첫 슬라이스에서 제외합니다. 변경 후에는 파일 목록, 검증 명령, 남은 리스크, 배포 URL, 롤백 조건을 보고합니다.
`;
}

function buildMvpBuildCommandPacketMarkdown({
  idea,
  state,
  appBlueprint,
  scaffoldManifest,
  implementationHandoff,
  releaseDecisionPacket,
  implementationTasks,
  dependencyStatuses,
  backendCandidateScores,
  artifactReviewQueue,
}: {
  idea: Idea;
  state: EditState;
  appBlueprint: string;
  scaffoldManifest: string;
  implementationHandoff: string;
  releaseDecisionPacket: ReleaseDecisionPacket | null;
  implementationTasks: ImplementationTask[];
  dependencyStatuses: ImplementationDependencyStatus[];
  backendCandidateScores: BackendCandidateScore[];
  artifactReviewQueue: ArtifactReviewItem[];
}) {
  const recommendedBackend = backendCandidateScores[0]?.label ?? "Supabase";
  const openDependencyStatuses = dependencyStatuses.filter((status) => status.task.status !== "done");
  const readyTasks = openDependencyStatuses.filter((status) => status.ready).slice(0, 5);
  const waitingTasks = openDependencyStatuses.filter((status) => !status.ready).slice(0, 5);
  const approvedArtifacts = artifactReviewQueue.filter((item) => item.status === "approved");
  const nextReleaseBlocker = releaseDecisionPacket?.blockers[0] ?? "출시 판단 패킷이 아직 없습니다.";
  const launchInstruction =
    releaseDecisionPacket?.recommendation === "ship"
      ? "출시 하드닝까지 진행 가능하지만 Production 반영 전 smoke, inspect URL, 롤백 기준을 완료 보고에 남깁니다."
      : "공개 출시 작업은 보류하고, 아래 차단 항목을 해소하는 MVP/검증 범위만 구현합니다.";
  const readyTaskLines =
    readyTasks.length > 0
      ? readyTasks
          .map(
            (status, index) =>
              `${index + 1}. ${status.task.title} / ${implementationTaskTypeLabels[status.task.task_type]} / ${implementationTaskPriorityLabels[status.task.priority]}\n   - 수용 기준: ${status.task.acceptance_criteria.trim() || "미정"}\n   - 다음 행동: ${status.nextAction}`,
          )
          .join("\n")
      : "1. 바로 시작 가능한 태스크가 없습니다. 선행 조건 또는 산출물 승인을 먼저 닫습니다.";
  const waitingTaskLines =
    waitingTasks.length > 0
      ? waitingTasks
          .map(
            (status) =>
              `- ${status.task.title}: ${status.blockers.join(", ") || status.gate}\n  - 대기 해소: ${status.nextAction}`,
          )
          .join("\n")
      : "- 선행 조건 때문에 대기 중인 태스크가 없습니다.";
  const taskSnapshotLines =
    implementationTasks.length > 0
      ? implementationTasks
          .map(
            (task) =>
              `- ${task.title}: ${implementationTaskTypeLabels[task.task_type]} / ${implementationTaskStatusLabels[task.status]} / ${implementationTaskPriorityLabels[task.priority]}`,
          )
          .join("\n")
      : "- 구현 태스크가 없습니다. 먼저 기본 태스크를 생성하세요.";
  const artifactQueueLines =
    artifactReviewQueue
      .map((item) => `- [${item.status === "approved" ? "x" : " "}] ${item.label}: ${item.detail}`)
      .join("\n");

  return `# MVP 빌드 명령 패킷: ${idea.name}

이 패킷은 실제 구현 세션의 첫 메시지로 사용합니다. 구현자는 이 문서의 순서, 제외 범위, 검증 명령을 우선하고, 승인되지 않은 확장은 만들지 않습니다.

## 0. 현재 명령

- 제품 가치: ${idea.one_liner || "미정"}
- 대상 사용자: ${idea.target_user || "미정"}
- 구매자: ${idea.buyer || "미정"}
- 현재 단계/판단: ${stageLabels[state.stage]} / ${decisionLabels[state.decision]}
- 추천 백엔드: ${recommendedBackend}
- 출시 권고: ${releaseDecisionPacket ? decisionLabels[releaseDecisionPacket.recommendation] : "미계산"}
- 출시 지침: ${launchInstruction}
- 첫 차단 항목: ${nextReleaseBlocker}

## 1. 구현자 시작 프롬프트

너는 ${idea.name}의 첫 MVP를 구현하는 선임 개발 에이전트다. 목표는 "${state.next_evidence || idea.one_liner || "다음 증거"}"를 검증하는 하나의 수직 슬라이스를 완성하는 것이다.

반드시 다음 순서를 지킨다.

1. 승인된 산출물과 태스크만 읽고 범위를 잠근다.
2. 데이터 모델, 권한 경계, 환경변수를 먼저 확인한다.
3. 핵심 입력, 저장, 조회, 오류/빈 상태, 권한 상태를 한 흐름으로 구현한다.
4. 모바일 390px와 데스크톱 1440px에서 겹침 없는지 확인한다.
5. 완료 전 lint, typecheck, build, 핵심 스모크를 실행한다.
6. 배포가 필요한 변경은 Preview/Production URL, Vercel inspect URL, 롤백 기준을 보고한다.

하지 않는다.

- 마케팅 랜딩 페이지 중심으로 만들지 않는다.
- 결제, 대규모 관리자, 외부 계정 자동 조작, 고급 AI 자동화는 승인 산출물에 없으면 만들지 않는다.
- RLS 또는 Security Rules 없이 쓰기 기능을 만들지 않는다.
- 사용자의 기존 변경을 되돌리지 않는다.

## 2. 바로 시작 가능한 태스크

${readyTaskLines}

## 3. 선행 조건 대기 태스크

${waitingTaskLines}

## 4. 전체 태스크 스냅샷

${taskSnapshotLines}

## 5. 산출물 승인 상태

- 승인된 핵심 산출물: ${approvedArtifacts.length}/${artifactReviewQueue.length}

${artifactQueueLines}

## 6. 필수 검증 명령

\`\`\`bash
pnpm lint
pnpm typecheck
pnpm build
pnpm harness:check
pnpm release:check
\`\`\`

브라우저/배포 변경이 있으면 추가로 실행합니다.

\`\`\`bash
pnpm smoke:routes
pnpm smoke:browser
pnpm smoke:prod
\`\`\`

## 7. 완료 보고 형식

- 변경 요약
- 수정 파일
- 실행한 검증 명령과 결과
- 권한/RLS 또는 Security Rules 허용/차단 증거
- Preview/Production URL과 Vercel inspect URL
- 남은 차단 항목
- 롤백 기준
- 다음 작업

## 8. 앱 블루프린트 요약 원문

${appBlueprint}

## 9. 스캐폴드 매니페스트 원문

${scaffoldManifest}

## 10. 구현 핸드오프 원문

${implementationHandoff}
`;
}

function buildQaAcceptanceMatrixMarkdown({
  idea,
  state,
  risks,
  experiments,
  implementationTasks,
  launchReadiness,
  implementationGateChecks,
  releaseDecisionPacket,
  backendCandidateScores,
}: {
  idea: Idea;
  state: EditState;
  risks: Risk[];
  experiments: Experiment[];
  implementationTasks: ImplementationTask[];
  launchReadiness: GateCheck[];
  implementationGateChecks: GateCheck[];
  releaseDecisionPacket: ReleaseDecisionPacket | null;
  backendCandidateScores: BackendCandidateScore[];
}) {
  const recommendedBackend = backendCandidateScores[0]?.label ?? "Supabase";
  const usesFirebase = /Firebase/i.test(recommendedBackend);
  const highRisks = risks.filter((risk) => ["high", "critical"].includes(risk.severity));
  const incompleteLaunchChecks = launchReadiness.filter((check) => !check.passed);
  const incompleteImplementationChecks = implementationGateChecks.filter((check) => !check.passed);
  const completedTasks = implementationTasks.filter((task) => task.status === "done");
  const openTasks = implementationTasks.filter((task) => task.status !== "done");
  const experimentLines =
    experiments.length > 0
      ? experiments
          .map((experiment) => `- ${experiment.name}: ${experimentStatusLabels[experiment.status] ?? experiment.status} / ${experiment.success_metric || "성공 지표 미정"}`)
          .join("\n")
      : "- 연결된 실험이 없습니다. QA 전에 성공 지표가 있는 실험을 최소 1개 정의합니다.";
  const riskLines =
    highRisks.length > 0
      ? highRisks
          .map((risk) => `- ${risk.title}: ${riskSeverityLabels[risk.severity]} / ${riskStatusLabels[risk.status] ?? risk.status} / ${risk.mitigation || "완화책 미정"}`)
          .join("\n")
      : "- 높음/치명 리스크가 없습니다.";
  const taskCoverageLines =
    implementationTasks.length > 0
      ? implementationTasks
          .map((task) => `- [${task.status === "done" ? "x" : " "}] ${task.title}: ${implementationTaskTypeLabels[task.task_type]} / ${implementationTaskStatusLabels[task.status]}`)
          .join("\n")
      : "- 구현 태스크가 없습니다.";
  const launchBlockerLines =
    incompleteLaunchChecks.length > 0
      ? incompleteLaunchChecks.map((check) => `- ${check.label}: ${check.detail}`).join("\n")
      : "- 출시 준비도 차단 항목이 없습니다.";
  const implementationBlockerLines =
    incompleteImplementationChecks.length > 0
      ? incompleteImplementationChecks.map((check) => `- ${check.label}: ${check.detail}`).join("\n")
      : "- 개발 완료 게이트 차단 항목이 없습니다.";
  const releaseSummary =
    releaseDecisionPacket
      ? `${decisionLabels[releaseDecisionPacket.recommendation]} / 신뢰도 ${releaseDecisionPacket.confidenceLabel} / 차단 ${releaseDecisionPacket.blockers.length}개`
      : "출시 판단 패킷 미생성";
  const backendRuleRows = usesFirebase
    ? [
        "| Firebase Rules 허용 | 로그인한 owner가 본인 문서 생성/수정 | 성공, audit/event 기록 |",
        "| Firebase Rules 차단 | 다른 uid 또는 workspace 문서 쓰기 | permission-denied 표시, 데이터 변경 없음 |",
        "| App Check/Emulator | Preview 또는 Emulator에서 rules 시나리오 실행 | 허용/차단 로그 보관 |",
      ].join("\n")
    : [
        "| Supabase RLS 허용 | 로그인한 owner가 본인 record insert/update | 성공, owner_id/workspace_id 보존 |",
        "| Supabase RLS 차단 | 다른 owner/workspace record update/delete | 거부, 데이터 변경 없음 |",
        "| 서비스 키 경계 | 브라우저 번들에서 service role 키 검색 | 노출 없음 |",
      ].join("\n");

  return `# QA 검수 매트릭스: ${idea.name}

이 문서는 구현 완료 직후 실행할 검수, 디버깅, 보안 확인 순서를 정의합니다. 테스트는 기능이 많아 보이는지보다 첫 사용자가 핵심 가치를 안전하게 통과하는지를 기준으로 합니다.

## 0. 현재 QA 상태

- 제품 가치: ${idea.one_liner || "미정"}
- 대상 사용자: ${idea.target_user || "미정"}
- 구매자: ${idea.buyer || "미정"}
- 현재 단계/판단: ${stageLabels[state.stage]} / ${decisionLabels[state.decision]}
- 추천 백엔드: ${recommendedBackend}
- 출시 판단: ${releaseSummary}
- 구현 태스크 완료: ${completedTasks.length}/${implementationTasks.length}
- 열린 구현 태스크: ${openTasks.length}

## 1. 핵심 여정 검수

| 우선순위 | 시나리오 | 입력/상태 | 기대 결과 |
| --- | --- | --- | --- |
| P0 | 첫 진입 | 로그아웃 또는 새 사용자 | 로그인 필요, 워크스페이스 필요, 첫 행동이 명확히 보임 |
| P0 | 핵심 입력 저장 | 이름, 대상 사용자, 수요 신호, 다음 증거 입력 | 저장 성공, 목록/상세 즉시 갱신, 성공 메시지 표시 |
| P0 | 저장 실패 | 필수값 누락 또는 네트워크 실패 | 필드 아래 오류와 재시도 경로 표시 |
| P0 | 기록 상세 | 방금 저장한 기록 선택 | 점수, 리스크, 산출물, 다음 행동이 같은 문맥으로 표시 |
| P0 | 권한 차단 | 읽기 전용 또는 다른 workspace 기록 | 쓰기 버튼 비활성화 또는 서버 차단, 사유 표시 |
| P1 | 산출물 저장 | PRD/MVP/런북 초안 저장 | 버전 증가, 라이브러리 최신본 표시 |
| P1 | 완료 증거 저장 | 구현 태스크에 커밋/스모크/URL 입력 | 게이트 점수 갱신, 보고서에 반영 |
| P1 | 모바일 검수 | 390px 폭, 긴 한글 텍스트 | 메뉴와 입력폼 겹침 없음, 버튼 텍스트 잘림 없음 |
| P1 | 빈 상태 | 데이터 없는 사용자 | 다음 행동 CTA와 설명이 보이고 빈 카드만 나열되지 않음 |
| P1 | 오류 상태 | API 오류, 권한 오류 | 사용자가 무엇을 다시 해야 하는지 한 문장으로 보임 |

## 2. 권한/보안 검수

| 항목 | 테스트 | 기대 결과 |
| --- | --- | --- |
${backendRuleRows}
| 환경변수 경계 | NEXT_PUBLIC_ 접두사와 서버 전용 키 분리 확인 | 공개 키만 브라우저 노출, 비밀값은 서버 전용 |
| 민감정보 | 입력/로그/산출물에 이메일, 전화, 건강/금융 정보가 남는지 확인 | 필요 최소 수집, 마스킹 또는 저장 금지 |
| 감사/추적 | 승인, 삭제, 권한 변경이 있다면 이벤트 기록 확인 | actor, action, target, timestamp 보관 |

## 3. 디버깅 프로토콜

1. 실패 시 화면 상태, 재현 입력, 사용자 권한, 브라우저 콘솔, 네트워크 응답을 먼저 기록합니다.
2. 서버 오류는 Vercel logs 또는 inspect URL에서 같은 시간대 요청을 확인합니다.
3. 데이터 불일치는 DB/RLS 또는 Firebase Rules 허용/차단 테스트로 좁힙니다.
4. 수정 후 동일 재현 절차를 다시 실행하고 회귀 스모크를 남깁니다.
5. 원인과 수정 범위가 불명확하면 새 기능 추가보다 실패를 재현하는 테스트를 먼저 만듭니다.

## 4. 브라우저/배포 검증 명령

\`\`\`bash
pnpm lint
pnpm typecheck
pnpm build
pnpm smoke:routes
pnpm smoke:browser
pnpm smoke:prod
\`\`\`

## 5. 실험/성공 지표 연결

${experimentLines}

QA 통과만으로 진행 판단을 내리지 않습니다. 위 실험의 성공 지표가 실제 사용자 행동으로 확인되어야 합니다.

## 6. 높은 리스크 확인

${riskLines}

높음/치명 리스크는 종료 또는 수용 판단 없이 출시 판단을 \`진행\`으로 기록하지 않습니다.

## 7. 구현 태스크 커버리지

${taskCoverageLines}

## 8. 남은 게이트 차단 항목

### 출시 준비도

${launchBlockerLines}

### 개발 완료 게이트

${implementationBlockerLines}

## 9. 완료 보고 템플릿

- QA 실행자:
- 테스트 일시:
- 브라우저/기기:
- 통과:
- 실패:
- 재현 절차:
- 수정 커밋:
- 재검증 명령:
- Production URL:
- Vercel inspect URL:
- 남은 리스크:
- 롤백 기준:
`;
}

function buildPostLaunchLearningLoopMarkdown({
  idea,
  state,
  experiments,
  risks,
  releaseDecisionPacket,
  launchReadiness,
  implementationTasks,
}: {
  idea: Idea;
  state: EditState;
  experiments: Experiment[];
  risks: Risk[];
  releaseDecisionPacket: ReleaseDecisionPacket | null;
  launchReadiness: GateCheck[];
  implementationTasks: ImplementationTask[];
}) {
  const releaseRecommendation = releaseDecisionPacket ? decisionLabels[releaseDecisionPacket.recommendation] : "미계산";
  const openHighRisks = risks.filter((risk) => ["high", "critical"].includes(risk.severity) && risk.status !== "closed");
  const doneTaskCount = implementationTasks.filter((task) => task.status === "done").length;
  const unresolvedLaunchChecks = launchReadiness.filter((check) => !check.passed);
  const experimentLines =
    experiments.length > 0
      ? experiments
          .map((experiment) => `- ${experiment.name}: ${experimentStatusLabels[experiment.status] ?? experiment.status} / 성공 지표: ${experiment.success_metric || "미정"}`)
          .join("\n")
      : "- 출시 후 학습에 연결할 실험이 없습니다. 첫 사용자 5명 관찰 실험을 추가하세요.";
  const riskLines =
    openHighRisks.length > 0
      ? openHighRisks
          .map((risk) => `- ${risk.title}: ${riskSeverityLabels[risk.severity]} / ${riskStatusLabels[risk.status] ?? risk.status} / ${risk.mitigation || "완화책 미정"}`)
          .join("\n")
      : "- 열린 높음/치명 리스크가 없습니다.";
  const blockerLines =
    releaseDecisionPacket?.blockers.length
      ? releaseDecisionPacket.blockers.map((blocker) => `- ${blocker}`).join("\n")
      : unresolvedLaunchChecks.length > 0
        ? unresolvedLaunchChecks.map((check) => `- ${check.label}: ${check.detail}`).join("\n")
        : "- 출시 후 관찰 가능한 상태입니다.";

  return `# 출시 후 학습 루프: ${idea.name}

출시의 목적은 끝내는 것이 아니라 더 정확한 다음 판단을 얻는 것입니다. 이 문서는 첫 공개 후 7일, 14일, 30일에 어떤 신호를 보고 진행, 보강, 전환, 중단을 결정할지 정의합니다.

## 0. 현재 출시 기준

- 제품 가치: ${idea.one_liner || "미정"}
- 대상 사용자: ${idea.target_user || "미정"}
- 구매자: ${idea.buyer || "미정"}
- 현재 단계/판단: ${stageLabels[state.stage]} / ${decisionLabels[state.decision]}
- 출시 판단 권고: ${releaseRecommendation}
- 구현 태스크 완료: ${doneTaskCount}/${implementationTasks.length}
- 다음 증거: ${state.next_evidence || "미정"}

## 1. 출시 후 핵심 질문

1. 대상 사용자가 첫 세션에서 핵심 행동을 완료하는가?
2. 이 문제가 실제로 반복되는가, 아니면 일회성 관심인가?
3. 구매자와 사용자가 같은 성공 기준을 말하는가?
4. 수동 운영보다 앱이 시간을 줄이거나 실수를 줄이는가?
5. 높은 리스크를 낮추면서도 가치 전달이 유지되는가?

## 2. 7일 학습 지표

| 지표 | 수집 방법 | 진행 신호 | 보류/전환 신호 |
| --- | --- | --- | --- |
| 활성 사용자 | 가입 또는 초대 후 핵심 화면 방문 | 타겟 5명 이상 방문 | 방문은 있으나 핵심 행동 없음 |
| 핵심 행동 완료 | 첫 기록 저장, 산출물 저장, 예약/요청 등 앱별 핵심 행동 | 방문자의 40% 이상 완료 | 입력 중 이탈 또는 저장 실패 반복 |
| 반복 사용 | 7일 내 2회 이상 재방문 | 2명 이상 반복 사용 | 첫 방문 후 재방문 없음 |
| 구매 신호 | 가격 질문, 결제 의향, 조직 도입 문의 | 1명 이상 명확한 예산 또는 도입 일정 | 좋다는 반응만 있고 예산 없음 |
| 운영 리스크 | 권한 오류, 개인정보 불안, 수동 지원 요청 | 차단 없이 처리 가능 | 같은 리스크가 2회 이상 반복 |

## 3. 이벤트/로그 초안

| 이벤트 | 속성 | 개인정보 주의 |
| --- | --- | --- |
| app_opened | user_id_hash, workspace_id, source | 원본 이메일 저장 금지 |
| record_created | record_type, stage, has_required_fields | 본문 원문 저장 금지 |
| evidence_added | evidence_type, confidence | 민감 원문 마스킹 |
| artifact_saved | artifact_type, version, source | 산출물 본문 로그 제외 |
| gate_blocked | gate_name, blocker_type | 사용자 식별 최소화 |
| decision_recorded | decision, reason_length | reason 원문 로그 제외 |

## 4. 사용자 인터뷰 질문

- 이 앱을 열기 직전 어떤 상황이었나요?
- 지금까지 이 문제를 어떻게 해결했나요?
- 첫 화면에서 무엇을 먼저 해야 하는지 바로 보였나요?
- 저장 또는 결과 확인 과정에서 멈춘 지점은 어디였나요?
- 월 얼마라면 직접 결제하거나 조직에 요청할 수 있나요?
- 이 기능이 없어도 계속 쓸 이유가 있나요?

## 5. 현재 실험 연결

${experimentLines}

## 6. 출시 전/후 차단 항목

${blockerLines}

## 7. 높은 리스크 모니터링

${riskLines}

## 8. 7/14/30일 판단 기준

### Day 7

- 진행: 핵심 행동 40% 이상, 반복 사용자 2명 이상, 치명적 리스크 없음
- 보강: 관심은 있으나 핵심 행동 완료율이 낮음
- 전환: 타겟은 반응하지만 구매자/문제/화면 흐름이 다름
- 중단: 핵심 행동, 반복 사용, 구매 신호가 모두 없음

### Day 14

- 진행: 유료 의향 또는 조직 도입 논의 1건 이상
- 보강: 기능 누락보다 온보딩/설명/권한 문제로 막힘
- 전환: 다른 세그먼트에서 더 강한 수요가 확인됨
- 중단: 수동 운영 대비 개선이 입증되지 않음

### Day 30

- 진행: 반복 사용과 지불 의향이 함께 확인됨
- 보강: 데이터 품질, 권한, UX 마찰이 주요 병목
- 전환: 더 좁은 업무/고객군으로 제품 경계를 다시 정의
- 중단: 운영 비용이 학습 가치보다 커짐

## 9. 다음 루프 운영 방식

1. 매주 같은 요일에 지표, 인터뷰, 리스크, 지원 요청을 한 화면에 모읍니다.
2. 새 기능 요구는 바로 만들지 않고, 같은 요구가 3회 이상 반복될 때 태스크로 전환합니다.
3. 개인정보/권한/결제/의료/법률 리스크는 기능 요구보다 먼저 처리합니다.
4. 판단 기록에는 숫자, 관찰, 사용자의 실제 문장을 분리해서 남깁니다.
5. 다음 빌드 명령 패킷은 Day 7 또는 Day 14 판단 뒤 다시 생성합니다.
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
3. 데이터 모델, 권한 정책, 환경변수, 배포 로그 확인, 롤백 조건을 먼저 작성한다.
4. 핵심 입력 폼과 결과 화면을 구현한다.
5. 저장 성공 후 화면이 즉시 갱신되게 한다.
6. 빈 상태, 로딩, 성공, 오류, 권한 없음, 읽기 전용 상태를 구현한다.
7. 테스트와 수동 스모크 경로를 문서화한다.
8. Vercel Preview에서 확인한 뒤 Production 배포한다.

## 운영 안전장치

- 환경변수: Vercel Preview/Production 변수명, 공개 키, 서버 전용 비밀값, 재배포 필요 여부를 보고한다.
- 백엔드 규칙: Supabase RLS 또는 Firebase Security Rules/IAM의 허용/차단 테스트 결과를 보고한다.
- 배포 로그: Preview URL, Production URL, Vercel inspect URL 또는 빌드 로그 확인 결과를 남긴다.
- 롤백: 직전 배포로 되돌리는 조건, DB 보정 SQL 또는 되돌림 SQL 필요 여부를 남긴다.

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
- DB/환경변수/백엔드 규칙/배포 변경
- Preview/Production URL과 배포 로그 또는 inspect 링크
- 검증 명령 결과
- 롤백 경로, 남은 리스크와 다음 작업
`;
}

function buildRolePromptPackMarkdown({
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
  const riskLines =
    risks.length > 0
      ? risks.map((risk) => `- ${risk.title}: ${riskSeverityLabels[risk.severity]} / ${riskStatusLabels[risk.status] ?? risk.status}`).join("\n")
      : "- 연결된 리스크가 없습니다.";
  const experimentLines =
    experiments.length > 0
      ? experiments
          .map(
            (experiment) =>
              `- ${experiment.name}: ${experimentStatusLabels[experiment.status]} / ${experiment.success_metric || "성공 지표 미정"}`,
          )
          .join("\n")
      : "- 연결된 실험이 없습니다.";
  const taskLines =
    implementationTasks.length > 0
      ? implementationTasks
          .slice(0, 12)
          .map(
            (task) =>
              `- ${task.title}: ${implementationTaskTypeLabels[task.task_type]} / ${implementationTaskPriorityLabels[task.priority]} / ${implementationTaskStatusLabels[task.status]}`,
          )
          .join("\n")
      : "- 아직 구현 태스크가 없습니다.";

  const runByPhase = new Map(runs.map((run) => [run.phase, run]));
  const promptInstructions: Record<OrchestrationPhase, string[]> = {
    strategy: [
      "기회 크기, 사용자 고통, 구매자, 차별화, 타이밍, 중단 기준을 한 장으로 정리한다.",
      "점수보다 증거를 우선하고, 강한 주장에는 필요한 추가 근거를 붙인다.",
      "반환은 proceed, research_more, pivot, kill 중 하나와 그 이유로 끝낸다.",
    ],
    research: [
      "시장, 경쟁 대안, 규제, 가격/지불 의향, 실제 사용 맥락을 검증한다.",
      "출처 없는 사실 주장은 사용하지 말고 확인 필요 항목으로 분리한다.",
      "인터뷰 질문, 검색 쿼리, 관찰해야 할 커뮤니티/리뷰 신호를 제안한다.",
    ],
    product: [
      "검증된 증거만 사용해 PRD, 범위 제외 항목, 수용 기준, 성공 지표를 좁힌다.",
      "첫 릴리스는 하나의 핵심 여정과 하나의 측정 지표로 제한한다.",
      "불확실한 기능은 백로그가 아니라 검증 질문으로 되돌린다.",
    ],
    design: [
      "첫 화면이 바로 작업 화면이 되도록 핵심 여정, 입력, 결과, 빈/오류/권한 상태를 설계한다.",
      "데스크톱과 모바일에서 긴 스크롤 왕복이 생기지 않도록 왼쪽 단계, 오른쪽 작업 패널 구조를 우선한다.",
      "민감 데이터 고지, 되돌리기, 재시도, 저장 후 즉시 반영 상태를 포함한다.",
    ],
    build: [
      "PRD와 MVP 명세 범위를 넘지 않는 수직 슬라이스를 구현한다.",
      "데이터 모델, 권한, 환경변수, UI 상태, 품질 명령, 롤백 경로를 먼저 고정한다.",
      "저장 성공 후 화면 즉시 반영, 오류 메시지, 모바일 레이아웃을 구현 완료 기준에 포함한다.",
    ],
    qa: [
      "핵심 여정, 인증 전/후, 읽기 전용, 빈/로딩/성공/오류, 모바일, 회귀 위험을 검증한다.",
      "수동 스모크 경로와 자동 명령 결과를 분리해서 기록한다.",
      "실패 항목은 재현 절차, 기대/실제 결과, 차단 여부로 남긴다.",
    ],
    debug: [
      "가장 작은 재현 경로를 먼저 만들고 원인을 UI, 데이터, 권한, 네트워크, 배포 중 하나로 좁힌다.",
      "수정 전후 검증 명령과 스모크 결과를 남긴다.",
      "임시 우회와 근본 수정이 다르면 둘을 분리해 보고한다.",
    ],
    security: [
      "PII, 비밀값, 권한, RLS/Security Rules, prompt injection, abuse, retention을 검토한다.",
      "출시 차단 보안 이슈와 개선 권고를 분리한다.",
      "민감 데이터는 최소 수집, 보관 기간, 삭제 경로, 감사 로그 필요성을 확인한다.",
    ],
    launch: [
      "증거, 승인 산출물, 실험 결과, QA/보안, 고위험 리스크, 최종 판단 기록을 확인한다.",
      "ship, research_more, pivot, kill 중 하나를 추천하고 남은 조건을 명시한다.",
      "배포 후 스모크, 롤백 기준, 운영 모니터링 항목을 포함한다.",
    ],
  };

  const rolePrompts = orchestrationPhaseConfigs
    .map((config) => {
      const run = runByPhase.get(config.phase);
      const instructionLines = promptInstructions[config.phase].map((instruction) => `- ${instruction}`).join("\n");

      return `## ${config.label} / ${config.ownerRole}

역할 목표: ${run?.objective || config.objective}
현재 상태: ${run ? runStatusLabels[run.status] : "아직 런북에 생성되지 않음"}

작업 지시:
${instructionLines}

반환 형식:
- 결론
- 근거
- 차단 항목
- 다음 액션
- 저장 또는 승인해야 할 산출물`;
    })
    .join("\n\n");

  return `# 역할별 프롬프트 팩: ${idea.name}

이 문서는 하나의 아이디어를 전략, 리서치, 제품, 디자인, 개발, QA, 디버깅, 보안, 출시 역할에 나눠 맡길 때 쓰는 공통 컨텍스트와 역할별 지시입니다.

## 공통 컨텍스트

- 제품 가치: ${idea.one_liner || "미정"}
- 대상 사용자: ${idea.target_user || "미정"}
- 구매자: ${idea.buyer || "미정"}
- 현재 단계: ${stageLabels[state.stage]}
- 현재 판단: ${decisionLabels[state.decision]}
- 다음 증거: ${state.next_evidence || "미정"}
- 수요 신호: ${state.signal || "미정"}
- 리스크 요약: ${state.risk_summary || "미정"}

## 산출물 상태

${artifactLines}

## 리스크

${riskLines}

## 실험

${experimentLines}

## 구현 태스크

${taskLines}

## 공통 작업 규칙

- 답변은 한국어로 작성한다.
- 모르는 사실은 추정하지 말고 확인 필요로 분리한다.
- 새 기능보다 현재 게이트를 통과시키는 데 필요한 가장 작은 산출물을 우선한다.
- 개인정보, 결제, 의료/요양, 법률, 금융, 가족/직장 대화 데이터는 민감 데이터로 다룬다.
- 결과는 산출물 라이브러리에 저장할 수 있도록 복사 가능한 Markdown으로 작성한다.

${rolePrompts}
`;
}

function buildDevelopmentKickoffMarkdown({
  idea,
  state,
  readinessChecks,
  taskDrafts,
  risks,
  experiments,
  artifacts,
}: {
  idea: Idea;
  state: EditState;
  readinessChecks: GateCheck[];
  taskDrafts: ImplementationTaskDraft[];
  risks: Risk[];
  experiments: Experiment[];
  artifacts: VentureArtifact[];
}) {
  const passedCount = readinessChecks.filter((check) => check.passed).length;
  const failedChecks = readinessChecks.filter((check) => !check.passed);
  const mvpSliceArtifact = artifacts.find((artifact) => artifact.source === "mvp_slice_plan");
  const approvedProductArtifacts = artifacts.filter(
    (artifact) =>
      artifact.status === "approved" &&
      ["prd", "mvp_spec", "design_brief", "tech_spec", "backend_decision"].includes(artifact.artifact_type),
  );
  const highRiskLines = risks
    .filter((risk) => ["high", "critical"].includes(risk.severity) && risk.status !== "closed")
    .map(
      (risk) =>
        `- ${risk.title}: ${riskSeverityLabels[risk.severity]} / ${risk.mitigation || "완화 조건 미정"}`,
    );
  const experimentLines =
    experiments.length > 0
      ? experiments
          .slice(0, 4)
          .map(
            (experiment) =>
              `- ${experiment.name}: ${experimentStatusLabels[experiment.status] ?? experiment.status} / ${
                experiment.success_metric || "성공 지표 미정"
              }`,
          )
          .join("\n")
      : "- 연결된 실험이 없습니다. 개발 전 성공 지표를 먼저 고정하세요.";
  const taskLines =
    taskDrafts.length > 0
      ? taskDrafts
          .map(
            (task, index) =>
              `${index + 1}. ${task.title} / ${implementationTaskTypeLabels[task.task_type]} / ${
                implementationTaskPriorityLabels[task.priority]
              } / ${task.owner_role}`,
          )
          .join("\n")
      : "생성 가능한 기본 태스크가 없습니다.";
  const blockedLines =
    failedChecks.length > 0
      ? failedChecks.map((check) => `- ${check.label}: ${check.detail}`).join("\n")
      : "- 개발 착수 전 필수 게이트가 통과 상태입니다.";

  return `# 개발 킥오프 브리프: ${idea.name}

## 킥오프 판정

- 개발 착수 준비도: ${passedCount}/${readinessChecks.length}
- 현재 단계: ${stageLabels[state.stage]}
- 현재 판단: ${decisionLabels[state.decision]}
- 제품 가치: ${idea.one_liner || "미정"}
- 대상 사용자: ${idea.target_user || "미정"}
- 구매자: ${idea.buyer || "미정"}
- 다음 증거: ${state.next_evidence || "미정"}

## 시작 전 차단 항목

${blockedLines}

## 범위 잠금

- 기준 산출물: ${mvpSliceArtifact ? `${mvpSliceArtifact.title} v${mvpSliceArtifact.version ?? 1}` : "MVP 슬라이스 플랜 미저장"}
- 이번 개발은 Slice 1 얇은 제품 슬라이스만 구현합니다.
- Slice 2 AI/자동화는 Slice 1 사용 증거가 생기기 전까지 보류합니다.
- 인증, 저장, 조회, 권한 차단, 상태 UX, 배포 스모크가 없는 기능 추가는 하지 않습니다.
- 결제, 외부 계정 직접 조작, 민감 데이터 자동 처리, 복잡한 관리자 백오피스는 제외합니다.

## 승인된 입력

${
  approvedProductArtifacts.length > 0
    ? approvedProductArtifacts
        .map((artifact) => `- ${artifactLabels[artifact.artifact_type]}: ${artifact.title}`)
        .join("\n")
    : "- 승인된 제품/기술 산출물이 없습니다."
}

## 검증과 실험 기준

${experimentLines}

## 높은 리스크

${highRiskLines.length > 0 ? highRiskLines.join("\n") : "- 열린 높음/치명 리스크가 없습니다."}

## 기본 구현 태스크 후보

${taskLines}

## 구현자 지시

1. 가장 먼저 범위 잠금 태스크를 완료하고 포함/제외/No-go/성공 지표를 증거로 남깁니다.
2. 기존 코드 패턴을 따르고 사용자 또는 다른 작업자의 변경을 되돌리지 않습니다.
3. 데이터 모델과 권한 경계는 UI보다 먼저 검증 가능한 형태로 정리합니다.
4. 완료 증거에는 커밋, 검증 명령, Preview 또는 Production URL, Vercel inspect 또는 배포 로그, RLS/Rules 허용/차단 결과, 롤백 기준을 남깁니다.
5. 막히는 작업은 차단 상태로 옮기고 차단 사유, 필요한 SQL/환경변수/외부 작업, 해소 조건을 적습니다.

## 완료 보고 형식

- 변경 요약:
- 구현 범위:
- 제외한 범위:
- 검증 결과:
- 배포/롤백:
- 남은 리스크:
- 다음 작업:
`;
}

function buildAgentRunPackageMarkdown({
  idea,
  state,
  artifacts,
  tasks,
  nextTask,
  risks,
  experiments,
  readinessChecks,
  filterSummary,
}: {
  idea: Idea;
  state: EditState;
  artifacts: VentureArtifact[];
  tasks: ImplementationTask[];
  nextTask: ImplementationTask | null;
  risks: Risk[];
  experiments: Experiment[];
  readinessChecks: GateCheck[];
  filterSummary: string;
}) {
  const approvedArtifacts = artifacts
    .filter((artifact) => artifact.status === "approved")
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  const sourceLines =
    approvedArtifacts.length > 0
      ? approvedArtifacts
          .slice(0, 10)
          .map(
            (artifact) =>
              `- ${artifactLabels[artifact.artifact_type]} / ${artifactSourceLabels[artifact.source] ?? artifact.source}: ${
                artifact.title || "제목 없음"
              } / v${artifact.version ?? 1}`,
          )
          .join("\n")
      : "- 승인된 산출물이 없습니다. 실행 전 PRD, MVP 명세, 디자인 브리프, 기술 명세 중 필요한 항목을 승인하세요.";
  const taskLines =
    tasks.length > 0
      ? sortImplementationTasksForAction(tasks)
          .slice(0, 8)
          .map((task, index) => {
            const checklist = getImplementationEvidenceChecklist(task, task.evidence ?? "");
            const missingLabels = checklist.filter((item) => !item.passed).map((item) => item.label);

            return [
              `${index + 1}. ${task.title}`,
              `   - 유형/상태/우선순위: ${implementationTaskTypeLabels[task.task_type]} / ${implementationTaskStatusLabels[task.status]} / ${implementationTaskPriorityLabels[task.priority]}`,
              `   - 담당 역할: ${task.owner_role || "owner 미정"}`,
              `   - 수용 기준: ${task.acceptance_criteria.replace(/\n/g, "\n     ") || "미정"}`,
              `   - 증거 공백: ${missingLabels.length > 0 ? missingLabels.join(", ") : "없음"}`,
            ].join("\n");
          })
          .join("\n")
      : "- 현재 실행할 개발 태스크가 없습니다. 기본 태스크를 생성하거나 필터를 초기화하세요.";
  const blockerLines = readinessChecks
    .filter((check) => !check.passed)
    .map((check) => `- ${check.label}: ${check.detail}`);
  const riskLines = risks
    .filter((risk) => ["high", "critical"].includes(risk.severity) && risk.status !== "closed")
    .map((risk) => `- ${risk.title}: ${riskSeverityLabels[risk.severity]} / ${risk.mitigation || "완화 조건 미정"}`);
  const experimentLines =
    experiments.length > 0
      ? experiments
          .slice(0, 5)
          .map(
            (experiment) =>
              `- ${experiment.name}: ${experimentStatusLabels[experiment.status] ?? experiment.status} / ${
                experiment.success_metric || "성공 지표 미정"
              }`,
          )
          .join("\n")
      : "- 연결된 실험이 없습니다.";

  return `# 구현 실행 패키지: ${idea.name}

너는 이 제품의 구현 에이전트입니다. 아래 패키지에 포함된 승인 산출물과 태스크만 기준으로 작업합니다.

## 실행 모드

- 현재 필터: ${filterSummary}
- 다음 1순위 태스크: ${nextTask ? nextTask.title : "없음"}
- 제품 가치: ${idea.one_liner || "미정"}
- 대상 사용자: ${idea.target_user || "미정"}
- 구매자: ${idea.buyer || "미정"}
- 현재 단계/판단: ${stageLabels[state.stage]} / ${decisionLabels[state.decision]}
- 다음 증거: ${state.next_evidence || "미정"}

## 승인된 원천 산출물

${sourceLines}

## 시작 전 미해결 게이트

${blockerLines.length > 0 ? blockerLines.join("\n") : "- 개발 착수 게이트가 통과 상태입니다."}

## 실행 태스크

${taskLines}

## 실험 기준

${experimentLines}

## 열린 높은 리스크

${riskLines.length > 0 ? riskLines.join("\n") : "- 열린 높음/치명 리스크가 없습니다."}

## 범위 규칙

- MVP 슬라이스 플랜이 있으면 Slice 1 얇은 제품 구현만 처리합니다.
- Slice 2 AI/자동화, 결제, 외부 계정 직접 조작, 복잡한 관리자 기능은 별도 승인 전까지 만들지 않습니다.
- 사용자가 직접 해야 하는 SQL, 환경변수, Vercel 설정, GitHub workflow scope 작업은 코드 블록과 실행 위치를 분리해 보고합니다.
- 다른 작업자의 변경을 되돌리지 않고 현재 코드베이스 패턴을 따릅니다.

## 검증 명령

- pnpm lint
- pnpm typecheck
- pnpm harness:check
- 필요 시 pnpm quality:full
- 배포 후 pnpm smoke:prod, pnpm smoke:routes

## 완료 보고

- 변경 요약:
- 수정 파일:
- 검증 결과:
- 배포/스모크:
- SQL/환경변수/외부 작업:
- 남은 리스크:
- 다음 작업:
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
  const hasMvpSlicePlan = artifacts.some((artifact) => artifact.source === "mvp_slice_plan");
  const hasBackendDecision = artifacts.some((artifact) => artifact.artifact_type === "backend_decision");
  const primaryExperiment = experiments[0];

  return [
    {
      title: "PRD와 MVP 슬라이스 범위 잠금",
      task_type: "planning",
      priority: hasApprovedPrd && hasApprovedMvp && hasMvpSlicePlan ? "medium" : "high",
      owner_role: "product-builder",
      acceptance_criteria: [
        `현재 판단은 ${decisionLabels[state.decision]}이고, 첫 릴리스 범위가 한 문장으로 고정되어야 합니다.`,
        hasMvpSlicePlan
          ? "MVP 슬라이스 플랜의 Slice 0, Slice 1, Slice 2, Slice 3 순서가 개발 범위에 반영되어야 합니다."
          : "MVP 슬라이스 플랜을 먼저 저장하고, 수동 검증과 얇은 제품 슬라이스를 분리해야 합니다.",
        "포함 범위, 제외 범위, 성공 지표, 중단 기준이 PRD 또는 MVP 명세에 남아 있어야 합니다.",
        "이번 개발은 Slice 1 얇은 제품까지만 구현하고, Slice 2 AI/자동화는 별도 승인 전까지 제외합니다.",
      ].join("\n"),
    },
    {
      title: "핵심 사용자 여정 와이어프레임 정리",
      task_type: "design",
      priority: "medium",
      owner_role: "design-reviewer",
      acceptance_criteria: [
        `${idea.target_user || "대상 사용자"}가 Slice 1에서 첫 가치를 얻는 화면 흐름을 3-5단계로 고정합니다.`,
        "빈 상태, 오류, 저장 성공, 읽기 전용, 모바일 화면 조건을 적습니다.",
      ].join("\n"),
    },
    {
      title: "데이터 모델과 마이그레이션 작성",
      task_type: "data",
      priority: "high",
      owner_role: "data-modeler",
      acceptance_criteria: [
        "Slice 1 핵심 엔티티, 소유권, 조직 경계, 감사 로그 또는 변경 이력이 정의됩니다.",
        "마이그레이션은 재실행 가능하고, 필요한 인덱스와 제약 조건을 포함합니다.",
      ].join("\n"),
    },
    {
      title: "백엔드 권한 경계 구현",
      task_type: "backend",
      priority: hasBackendDecision ? "medium" : "high",
      owner_role: "backend-architect",
      acceptance_criteria: [
        "Slice 1에 필요한 테이블, 문서, 함수, 정책만 구현합니다.",
        "Supabase RLS 또는 Firebase Security Rules의 허용/차단 조건이 문서와 코드에 반영됩니다.",
        "클라이언트에서 서비스 역할 키나 서버 전용 비밀값을 사용하지 않습니다.",
      ].join("\n"),
    },
    {
      title: "핵심 입력/저장/조회 화면 구현",
      task_type: "frontend",
      priority: "high",
      owner_role: "frontend-builder",
      acceptance_criteria: [
        `${idea.one_liner || "핵심 가치"}를 검증하는 Slice 1 최소 입력 폼과 결과 화면이 동작합니다.`,
        "저장 후 새로고침 없이 목록과 선택 상태가 즉시 갱신됩니다.",
        "AI 자동화, 결제, 외부 계정 조작, 복잡한 관리자 화면은 구현하지 않습니다.",
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
        "환경변수 경계, 백엔드 규칙 허용/차단 검증, Vercel inspect URL 또는 배포 로그, 롤백 방법이 완료 보고에 기록됩니다.",
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

function sortImplementationTasksForExecution(tasks: ImplementationTask[]) {
  return [...tasks].sort(
    (a, b) =>
      (implementationTaskExecutionRank.get(a.task_type) ?? 99) -
        (implementationTaskExecutionRank.get(b.task_type) ?? 99) ||
      implementationTaskActionRank[a.status] - implementationTaskActionRank[b.status] ||
      implementationTaskPriorityRank[a.priority] - implementationTaskPriorityRank[b.priority] ||
      a.sort_order - b.sort_order ||
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime() ||
      a.title.localeCompare(b.title),
  );
}

function buildImplementationDependencyStatuses(tasks: ImplementationTask[]): ImplementationDependencyStatus[] {
  const taskTypes = new Set(tasks.map((task) => task.task_type));
  const completedTypes = new Set(tasks.filter((task) => task.status === "done").map((task) => task.task_type));

  return sortImplementationTasksForExecution(tasks).map((task) => {
    const rule = implementationDependencyRules[task.task_type];
    const completedPrerequisites: ImplementationTaskType[] = [];
    const missingPrerequisites: ImplementationTaskType[] = [];
    const blockers = rule.prerequisites.flatMap((prerequisite) => {
      if (completedTypes.has(prerequisite)) {
        completedPrerequisites.push(prerequisite);
        return [];
      }

      missingPrerequisites.push(prerequisite);

      return [
        taskTypes.has(prerequisite)
          ? `${implementationTaskTypeLabels[prerequisite]} 태스크 완료 필요`
          : `${implementationTaskTypeLabels[prerequisite]} 태스크 생성 필요`,
      ];
    });

    if (task.status === "blocked") {
      blockers.unshift("현재 차단 상태입니다. 차단 해소 큐의 다음 액션과 해소 증거를 먼저 남기세요.");
    }

    return {
      task,
      ready: task.status !== "done" && blockers.length === 0,
      blockers,
      completedPrerequisites,
      missingPrerequisites,
      gate: rule.gate,
      nextAction: rule.nextAction,
    };
  });
}

function buildImplementationDependencyPlanMarkdown({
  idea,
  state,
  statuses,
}: {
  idea: Idea;
  state: EditState;
  statuses: ImplementationDependencyStatus[];
}) {
  const readyStatuses = statuses.filter((status) => status.ready);
  const waitingStatuses = statuses.filter((status) => status.task.status !== "done" && !status.ready);
  const completedStatuses = statuses.filter((status) => status.task.status === "done");
  const nextStatus = readyStatuses[0] ?? null;
  const lineForStatus = (status: ImplementationDependencyStatus, index: number) =>
    `${index + 1}. ${status.task.title}
   - 유형/상태/우선순위: ${implementationTaskTypeLabels[status.task.task_type]} / ${
     implementationTaskStatusLabels[status.task.status]
   } / ${implementationTaskPriorityLabels[status.task.priority]}
   - 게이트: ${status.gate}
   - 다음 액션: ${status.nextAction}
   - 선행 조건: ${
     implementationDependencyRules[status.task.task_type].prerequisites
       .map((prerequisite) => implementationTaskTypeLabels[prerequisite])
       .join(", ") || "없음"
   }
   - 막힘: ${status.blockers.join(", ") || "없음"}`;

  return `# 개발 실행 순서 게이트: ${idea.name}

## 현재 문맥

- 단계: ${stageLabels[state.stage]}
- 판단: ${decisionLabels[state.decision]}
- 한 줄 설명: ${idea.one_liner || "미정"}

## 권장 다음 태스크

${nextStatus ? lineForStatus(nextStatus, 0) : "열린 태스크 중 선행 조건을 모두 통과한 항목이 없습니다."}

## 바로 시작 가능

${readyStatuses.length > 0 ? readyStatuses.map(lineForStatus).join("\n\n") : "- 바로 시작 가능한 태스크가 없습니다."}

## 선행 조건 대기

${waitingStatuses.length > 0 ? waitingStatuses.map(lineForStatus).join("\n\n") : "- 선행 조건에 막힌 태스크가 없습니다."}

## 완료된 게이트

${
  completedStatuses.length > 0
    ? completedStatuses
        .map(
          (status) =>
            `- ${status.task.title}: ${implementationTaskTypeLabels[status.task.task_type]} / ${
              implementationTaskStatusLabels[status.task.status]
            }`,
        )
        .join("\n")
    : "- 완료된 태스크가 없습니다."
}

## 실행 원칙

- 기획 범위가 잠기기 전에는 디자인, 데이터, 백엔드, 프론트 구현을 확장하지 않습니다.
- 데이터 모델이 준비되기 전에는 백엔드 권한과 API 구현을 완료 처리하지 않습니다.
- 디자인과 백엔드 경계가 준비되기 전에는 프론트 수직 슬라이스를 완료 처리하지 않습니다.
- QA와 보안이 완료되기 전에는 Production 배포 태스크를 완료 처리하지 않습니다.
`;
}

function getImplementationEvidenceChecklist(task: ImplementationTask, evidence: string) {
  const normalizedEvidence = evidence.toLowerCase();
  const requirements = [...sharedImplementationEvidenceRequirements, ...implementationEvidenceRequirements[task.task_type]];

  return requirements.map((requirement) => ({
    ...requirement,
    passed: requirement.terms.some((term) => normalizedEvidence.includes(term.toLowerCase())),
  }));
}

function getImplementationTaskOwnerRole(task: ImplementationTask) {
  return task.owner_role.trim() || "owner 미정";
}

function getBlockedImplementationTaskHint(task: ImplementationTask) {
  const playbook = implementationBlockerPlaybooks[task.task_type];

  return {
    ownerRole: task.owner_role.trim() || playbook.fallbackOwner,
    nextAction: playbook.nextAction,
    unblockEvidence: playbook.unblockEvidence,
    escalation: playbook.escalation,
  };
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

${task.status === "blocked" ? `## 차단 해소 힌트

- 담당: ${getBlockedImplementationTaskHint(task).ownerRole}
- 다음 액션: ${getBlockedImplementationTaskHint(task).nextAction}
- 해소 증거: ${getBlockedImplementationTaskHint(task).unblockEvidence}
- 에스컬레이션: ${getBlockedImplementationTaskHint(task).escalation}` : ""}

## 수용 기준

${task.acceptance_criteria.trim() || "- 수용 기준이 아직 없습니다."}

## 완료 증거로 남길 것

- 커밋 또는 PR
- Preview 또는 Production URL
- Vercel inspect URL 또는 배포 로그
- 검증 명령 결과
- 핵심 여정 스모크 결과
- Supabase RLS 또는 Firebase Security Rules/IAM 허용/차단 검증
- 환경변수 공개 키와 서버 전용 비밀값 경계
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
  viewName = "열린 태스크",
  filterSummary = "상태: 완료 제외 / 담당: 전체 / 증거: 전체",
  evidenceByTaskId = {},
  emptyMessage = "대상 개발 태스크가 없습니다.",
}: {
  idea: Idea;
  state: EditState;
  tasks: ImplementationTask[];
  viewName?: string;
  filterSummary?: string;
  evidenceByTaskId?: Record<string, string>;
  emptyMessage?: string;
}) {
  const lines =
    tasks.length > 0
      ? sortImplementationTasksForAction(tasks)
          .map(
            (task, index) => {
              const evidence = evidenceByTaskId[task.id] ?? task.evidence ?? "";
              const checklist = getImplementationEvidenceChecklist(task, evidence);
              const passedCount = checklist.filter((item) => item.passed).length;
              const missingLabels = checklist.filter((item) => !item.passed).map((item) => item.label);

              return [
                `${index + 1}. ${task.title} / ${implementationTaskTypeLabels[task.task_type]} / ${implementationTaskPriorityLabels[task.priority]} / ${implementationTaskStatusLabels[task.status]} / ${task.owner_role || "owner 미정"} / 증거 ${passedCount}/${checklist.length}`,
                `   - 수용 기준: ${task.acceptance_criteria.replace(/\n/g, "\n     ") || "미정"}`,
                `   - 증거 공백: ${missingLabels.length > 0 ? missingLabels.join(", ") : "없음"}`,
              ].join("\n");
            },
          )
          .join("\n")
      : emptyMessage;

  return `# 개발 백로그: ${idea.name} - ${viewName}

## 제품 상태

- 한 줄 설명: ${idea.one_liner || "미정"}
- 현재 단계: ${stageLabels[state.stage]}
- 현재 판단: ${decisionLabels[state.decision]}
- 보기: ${filterSummary}

## 열린 태스크 우선순위

${lines}

## 실행 규칙

- 차단 태스크를 먼저 해소합니다.
- 진행 중 태스크는 완료 증거를 붙여 완료로 옮깁니다.
- 할 일 태스크는 우선순위가 높은 것부터 진행합니다.
- 완료 처리 전 커밋, PR, 배포 URL, Vercel inspect URL 또는 배포 로그, 스모크 결과, 남은 리스크 중 최소 하나를 증거로 남깁니다.
`;
}

function buildFilteredImplementationRunPromptMarkdown({
  idea,
  state,
  tasks,
  filterSummary,
  evidenceByTaskId = {},
}: {
  idea: Idea;
  state: EditState;
  tasks: ImplementationTask[];
  filterSummary: string;
  evidenceByTaskId?: Record<string, string>;
}) {
  const sortedTasks = sortImplementationTasksForAction(tasks);
  const roleLines =
    sortedTasks.length > 0
      ? Array.from(new Set(sortedTasks.map((task) => `${getImplementationTaskOwnerRole(task)}|${task.task_type}`)))
          .map((entry) => {
            const [ownerRole, taskType] = entry.split("|") as [string, ImplementationTaskType];

            return `- ${ownerRole}: ${implementationTaskTypeLabels[taskType]} - ${implementationRunFocus[taskType]}`;
          })
          .join("\n")
      : "- 현재 필터 조건에 맞는 실행 태스크가 없습니다.";
  const taskLines =
    sortedTasks.length > 0
      ? sortedTasks
          .map((task, index) => {
            const evidence = evidenceByTaskId[task.id] ?? task.evidence ?? "";
            const checklist = getImplementationEvidenceChecklist(task, evidence);
            const missingLabels = checklist.filter((item) => !item.passed).map((item) => item.label);
            const blockerHint = task.status === "blocked" ? getBlockedImplementationTaskHint(task) : null;

            return [
              `## ${index + 1}. ${task.title}`,
              `- 담당 역할: ${getImplementationTaskOwnerRole(task)}`,
              `- 유형/우선순위/상태: ${implementationTaskTypeLabels[task.task_type]} / ${implementationTaskPriorityLabels[task.priority]} / ${implementationTaskStatusLabels[task.status]}`,
              `- 수용 기준:\n${task.acceptance_criteria.trim() || "  - 미정"}`,
              `- 증거 공백: ${missingLabels.length > 0 ? missingLabels.join(", ") : "없음"}`,
              blockerHint
                ? `- 차단 해소: ${blockerHint.nextAction}\n- 해소 증거: ${blockerHint.unblockEvidence}\n- 에스컬레이션: ${blockerHint.escalation}`
                : "- 차단 해소: 해당 없음",
            ].join("\n");
          })
          .join("\n\n")
      : "현재 필터 조건에 맞는 실행 태스크가 없습니다.";

  return `# Codex 구현 실행 프롬프트: ${idea.name}

너는 이 프로젝트의 구현 에이전트입니다. 아래 필터 조건에 해당하는 태스크만 처리하고, 범위를 벗어나는 리팩터링이나 기능 확장은 하지 않습니다.

## 공통 컨텍스트

- 제품 가치: ${idea.one_liner || "미정"}
- 대상 사용자: ${idea.target_user || "미정"}
- 구매자: ${idea.buyer || "미정"}
- 현재 단계: ${stageLabels[state.stage]}
- 현재 판단: ${decisionLabels[state.decision]}
- 다음 증거: ${state.next_evidence || "미정"}
- 필터 조건: ${filterSummary}

## 역할별 초점

${roleLines}

## 작업 목록

${taskLines}

## 실행 규칙

- 기존 코드베이스 패턴, 파일 구조, 디자인 시스템을 우선합니다.
- 서로 다른 작업자가 있을 수 있으므로 사용자 또는 다른 작업자의 변경을 되돌리지 않습니다.
- SQL, RLS, Firebase Rules, Vercel 환경변수처럼 사용자가 직접 처리해야 하는 작업은 명확한 코드 블록과 실행 위치를 분리해 보고합니다.
- GitHub Actions workflow 변경은 현재 token scope가 풀릴 때까지 보류합니다.
- 완료 전 pnpm lint, pnpm typecheck, 필요한 경우 pnpm quality:full 또는 production smoke 결과를 남깁니다.

## 완료 보고 형식

- 변경 요약
- 수정 파일
- 검증 결과
- 남은 차단/SQL/외부 작업
- 커밋/PR 또는 배포 증거
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
  const releaseEvidenceTasks = implementationTasks.filter((task) =>
    ["backend", "data", "security", "deploy"].includes(task.task_type),
  );
  const releaseEvidenceLines =
    releaseEvidenceTasks.length > 0
      ? releaseEvidenceTasks
          .map((task) => {
            const checklist = getImplementationEvidenceChecklist(task, task.evidence ?? "");
            const passed = checklist.filter((item) => item.passed).length;
            const missing = checklist.filter((item) => !item.passed).map((item) => item.label);

            return `- ${task.title} / ${implementationTaskTypeLabels[task.task_type]} / ${implementationTaskStatusLabels[task.status]} / 증거 품질 ${passed}/${checklist.length}
  - 보강 필요: ${missing.length > 0 ? missing.join(", ") : "없음"}
  - 완료 증거: ${task.evidence.trim() || "미기록"}`;
          })
          .join("\n")
      : "- 릴리스 안전장치와 직접 연결된 백엔드, 데이터, 보안, 배포 태스크가 아직 없습니다.";

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

## 릴리스 증거 요약

${releaseEvidenceLines}

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
- 릴리스 태스크에는 Vercel inspect URL 또는 배포 로그, Production alias 확인, 롤백 기준이 필요합니다.
- 백엔드 변경 태스크에는 Supabase RLS 또는 Firebase Security Rules/IAM의 허용/차단 검증이 필요합니다.
- 환경변수 변경 태스크에는 Preview/Production 변수명, 공개 키/서버 전용 비밀값 경계, 재배포 여부가 필요합니다.
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
- [ ] Firebase 선택 시 Security Rules, IAM, App Check 검증
- [ ] Vercel 환경변수 검증
- [ ] Preview/Production 배포 로그 또는 Vercel inspect URL 보관
- [ ] 롤백 경로 지정
- [ ] 최종 판단 기록
`;
}

function buildReleaseDecisionPacket({
  idea,
  state,
  score,
  scoreRecommendation,
  launchReadinessScore,
  launchReadiness,
  implementationGateScore,
  implementationGateChecks,
  artifactReviewProgress,
  artifactReviewQueue,
  nextLaunchBlocker,
  risks,
  experiments,
  runs,
  artifacts,
  implementationTasks,
  decisions,
}: {
  idea: Idea;
  state: EditState;
  score: number;
  scoreRecommendation: DecisionStatus;
  launchReadinessScore: number;
  launchReadiness: GateCheck[];
  implementationGateScore: number;
  implementationGateChecks: GateCheck[];
  artifactReviewProgress: number;
  artifactReviewQueue: ArtifactReviewItem[];
  nextLaunchBlocker: GateCheck | null;
  risks: Risk[];
  experiments: Experiment[];
  runs: OrchestrationRun[];
  artifacts: VentureArtifact[];
  implementationTasks: ImplementationTask[];
  decisions: Decision[];
}): ReleaseDecisionPacket {
  const openHighRisks = risks.filter((risk) => ["high", "critical"].includes(risk.severity) && risk.status !== "closed");
  const blockedTasks = implementationTasks.filter((task) => task.status === "blocked");
  const failedImplementationChecks = implementationGateChecks.filter((check) => !check.passed);
  const unapprovedArtifacts = artifactReviewQueue.filter((item) => item.status !== "approved");
  const completedTaskCount = implementationTasks.filter((task) => task.status === "done").length;
  const completedRuns = runs.filter((run) => run.status === "done");
  const latestDecision = decisions[0] ?? null;
  const releaseReady =
    launchReadinessScore === 100 &&
    implementationGateScore === 100 &&
    artifactReviewProgress === 100 &&
    openHighRisks.length === 0 &&
    blockedTasks.length === 0 &&
    implementationTasks.length > 0;

  let recommendation: DecisionStatus = "research_more";

  if (state.decision === "kill" || (score <= 8 && launchReadinessScore < 40)) {
    recommendation = "kill";
  } else if (state.decision === "pivot" || (score < 15 && launchReadinessScore < 60)) {
    recommendation = "pivot";
  } else if (releaseReady) {
    recommendation = "ship";
  } else if (scoreRecommendation === "ship" && launchReadinessScore >= 80 && openHighRisks.length === 0) {
    recommendation = "research_more";
  } else {
    recommendation = scoreRecommendation === "pending" ? "research_more" : scoreRecommendation;
  }

  const blockers = [
    ...(nextLaunchBlocker ? [`출시 준비도: ${nextLaunchBlocker.label} - ${nextLaunchBlocker.detail}`] : []),
    ...openHighRisks.map(
      (risk) => `높은 리스크: ${risk.title} (${riskSeverityLabels[risk.severity]} / ${riskStatusLabels[risk.status] ?? risk.status})`,
    ),
    ...blockedTasks.map((task) => `차단 태스크: ${task.title} (${implementationTaskTypeLabels[task.task_type]})`),
    ...failedImplementationChecks.map((check) => `개발 완료 게이트: ${check.label} - ${check.detail}`),
    ...unapprovedArtifacts.slice(0, 4).map((item) => `산출물 승인: ${item.label} - ${item.detail}`),
  ].slice(0, 8);

  const greenSignals = [
    `출시 준비도 ${launchReadinessScore}% (${launchReadiness.filter((check) => check.passed).length}/${launchReadiness.length})`,
    `개발 완료 게이트 ${implementationGateScore}% (${implementationGateChecks.filter((check) => check.passed).length}/${implementationGateChecks.length})`,
    `산출물 승인 ${artifactReviewProgress}% (${artifactReviewQueue.filter((item) => item.status === "approved").length}/${artifactReviewQueue.length})`,
    `구현 태스크 ${completedTaskCount}/${implementationTasks.length} 완료`,
    `오케스트레이션 ${completedRuns.length}/${runs.length} 완료`,
    latestDecision ? `최근 판단 기록: ${decisionLabels[latestDecision.decision]} - ${latestDecision.reason || "근거 미기록"}` : "최근 판단 기록 없음",
  ].filter(Boolean);

  const requiredActions = releaseReady
    ? [
        "`판단 기록`에서 최종 판단을 `진행`으로 기록합니다.",
        "`출시 판단 패킷`을 산출물로 저장하고 승인합니다.",
        "Production smoke, Vercel inspect URL, 롤백 기준을 릴리스 노트에 남깁니다.",
      ]
    : [
        ...(unapprovedArtifacts.length > 0
          ? [`산출물 라이브러리에서 ${unapprovedArtifacts[0].label}부터 승인 또는 보강합니다.`]
          : []),
        ...(failedImplementationChecks.length > 0
          ? [`앱 개발 > 완료와 핸드오프에서 ${failedImplementationChecks[0].label} 항목을 먼저 해소합니다.`]
          : []),
        ...(openHighRisks.length > 0 ? [`리스크 탭에서 ${openHighRisks[0].title}의 종료 또는 수용 판단을 기록합니다.`] : []),
        ...(nextLaunchBlocker ? [`출시 준비도에서 ${nextLaunchBlocker.label} 항목을 해소합니다.`] : []),
        "`판단 기록`에 보류 사유와 다음 확인 행동을 남깁니다.",
      ];

  const confidence: ReleaseDecisionConfidence =
    releaseReady || (launchReadinessScore >= 90 && blockers.length <= 1)
      ? "high"
      : launchReadinessScore >= 65 || implementationGateScore >= 70
        ? "medium"
        : "low";
  const confidenceLabel = confidence === "high" ? "높음" : confidence === "medium" ? "보통" : "낮음";
  const headline =
    recommendation === "ship"
      ? "핵심 출시 게이트가 닫혀 진행 판단을 기록할 수 있습니다."
      : recommendation === "pivot"
        ? "현재 범위로는 출시보다 세그먼트, 문제, MVP 범위 전환이 우선입니다."
        : recommendation === "kill"
          ? "추가 자원을 투입하기 전에 중단 판단을 검토해야 합니다."
          : "출시 전 보강해야 할 증거 또는 실행 게이트가 남아 있습니다.";
  const launchLines =
    launchReadiness.length > 0
      ? launchReadiness.map((check) => `- [${check.passed ? "x" : " "}] ${check.label}: ${check.detail}`).join("\n")
      : "- 출시 준비도 항목이 없습니다.";
  const implementationLines =
    implementationGateChecks.length > 0
      ? implementationGateChecks.map((check) => `- [${check.passed ? "x" : " "}] ${check.label}: ${check.detail}`).join("\n")
      : "- 개발 완료 게이트 항목이 없습니다.";
  const artifactLines =
    artifactReviewQueue.length > 0
      ? artifactReviewQueue
          .map((item) => `- [${item.status === "approved" ? "x" : " "}] ${item.label}: ${item.detail}`)
          .join("\n")
      : "- 승인 큐가 없습니다.";
  const riskLines =
    risks.length > 0
      ? risks.map((risk) => `- ${risk.title}: ${riskSeverityLabels[risk.severity]} / ${riskStatusLabels[risk.status] ?? risk.status}`).join("\n")
      : "- 연결된 리스크가 없습니다.";
  const experimentLines =
    experiments.length > 0
      ? experiments.map((experiment) => `- ${experiment.name}: ${experimentStatusLabels[experiment.status] ?? experiment.status} / ${experiment.success_metric || "성공 지표 미정"}`).join("\n")
      : "- 연결된 실험이 없습니다.";
  const taskLines =
    implementationTasks.length > 0
      ? implementationTasks
          .map(
            (task) =>
              `- [${task.status === "done" ? "x" : " "}] ${task.title} / ${implementationTaskTypeLabels[task.task_type]} / ${implementationTaskStatusLabels[task.status]}\n  - 증거: ${task.evidence.trim() || "미기록"}`,
          )
          .join("\n")
      : "- 구현 태스크가 없습니다.";
  const runLines =
    runs.length > 0
      ? runs.map((run) => `- ${phaseLabels[run.phase]}: ${runStatusLabels[run.status]} / ${run.owner_role || "담당 미정"}`).join("\n")
      : "- 오케스트레이션 런이 없습니다.";
  const decisionLines =
    decisions.length > 0
      ? decisions.map((decision) => `- ${decisionLabels[decision.decision]}: ${decision.reason || "근거 미기록"}`).join("\n")
      : "- 판단 기록이 없습니다.";
  const artifactSnapshotLines =
    artifacts.length > 0
      ? artifacts
          .slice(0, 12)
          .map((artifact) => `- ${artifactLabels[artifact.artifact_type]} v${artifact.version ?? 1}: ${artifactStatusLabels[artifact.status]}`)
          .join("\n")
      : "- 저장된 산출물이 없습니다.";
  const blockersMarkdown = blockers.length > 0 ? blockers.map((item) => `- ${item}`).join("\n") : "- 차단 항목 없음";
  const greenSignalsMarkdown = greenSignals.map((item) => `- ${item}`).join("\n");
  const actionsMarkdown = requiredActions.map((item) => `- ${item}`).join("\n");

  return {
    recommendation,
    confidence,
    confidenceLabel,
    headline,
    blockers,
    greenSignals,
    requiredActions,
    markdown: `# 출시 판단 패킷: ${idea.name}

## 최종 권고

- 권고 판단: ${decisionLabels[recommendation]}
- 판단 신뢰도: ${confidenceLabel}
- 한 줄 결론: ${headline}
- 현재 운영 판단: ${decisionLabels[state.decision]}
- 점수 기반 추천: ${decisionLabels[scoreRecommendation]} (${score}점)
- 출시 준비도: ${launchReadinessScore}%
- 개발 완료 게이트: ${implementationGateScore}%
- 산출물 승인: ${artifactReviewProgress}%

## 차단 항목

${blockersMarkdown}

## 진행 신호

${greenSignalsMarkdown}

## 다음 액션

${actionsMarkdown}

## 출시 준비도 상세

${launchLines}

## 개발 완료 게이트 상세

${implementationLines}

## 산출물 승인 큐

${artifactLines}

## 구현 태스크와 증거

${taskLines}

## 리스크

${riskLines}

## 실험

${experimentLines}

## 오케스트레이션

${runLines}

## 최근 산출물 스냅샷

${artifactSnapshotLines}

## 판단 기록

${decisionLines}

## 운영 메모

- 진행 판단은 QA, 보안, 높은 리스크, Production smoke, 롤백 기준이 닫힌 뒤 기록합니다.
- 추가 조사 판단은 첫 번째 차단 항목을 다음 실험 또는 구현 태스크로 전환합니다.
- 전환 판단은 대상 사용자, 구매자, MVP 범위 중 어느 축을 바꿀지 명시합니다.
- 중단 판단은 보존할 학습과 재검토 조건을 남깁니다.
`,
  };
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
- 백엔드 규칙 허용/차단 검증:
- Preview/Production 배포 로그 또는 Vercel inspect:
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

function extractMarkdownSectionTitles(body: string) {
  return body
    .split(/\r?\n/)
    .map((line) => line.trim().match(/^#{1,3}\s+(.+)$/)?.[1]?.trim())
    .filter((section): section is string => Boolean(section));
}

function summarizeArtifactReview(artifact: VentureArtifact, previous: VentureArtifact | null): ArtifactReviewSummary {
  const lineChanges = previous ? summarizeArtifactLineChanges(artifact.body, previous.body) : { added: 0, removed: 0 };
  const currentSections = new Set(extractMarkdownSectionTitles(artifact.body));
  const previousSections = new Set(previous ? extractMarkdownSectionTitles(previous.body) : []);
  const addedSections = [...currentSections].filter((section) => !previousSections.has(section));
  const removedSections = [...previousSections].filter((section) => !currentSections.has(section));
  const totalChanged = lineChanges.added + lineChanges.removed;
  const intensity: ArtifactReviewIntensity = !previous
    ? "new"
    : lineChanges.removed > 8 || removedSections.length > 0 || totalChanged >= 24
      ? "major"
      : totalChanged >= 8 || addedSections.length >= 3
        ? "moderate"
        : "minor";
  const intensityLabel: Record<ArtifactReviewIntensity, string> = {
    new: "신규",
    minor: "낮음",
    moderate: "중간",
    major: "높음",
  };
  const recommendation: Record<ArtifactReviewIntensity, string> = {
    new: "최초 버전입니다. 승인 전 필수 항목이 모두 들어 있는지 한 번에 확인하세요.",
    minor: "변경 폭이 작습니다. 상태 메모에 승인 근거를 짧게 남기면 충분합니다.",
    moderate: "변경 폭이 있습니다. 추가/변경된 섹션과 수용 기준을 확인한 뒤 승인하세요.",
    major: "큰 변경 또는 삭제가 있습니다. 이전 승인 내용과 충돌하지 않는지 리뷰 후 승인하세요.",
  };

  return {
    previous,
    added: lineChanges.added,
    removed: lineChanges.removed,
    addedSections,
    removedSections,
    intensity,
    intensityLabel: intensityLabel[intensity],
    recommendation: recommendation[intensity],
    checks: artifactApprovalReviewChecks[artifact.artifact_type],
  };
}

function buildArtifactReviewMemo(artifact: VentureArtifact, summary: ArtifactReviewSummary) {
  return `# 산출물 리뷰 메모: ${artifact.title || artifactLabels[artifact.artifact_type]}

## 기본 정보

- 유형: ${artifactLabels[artifact.artifact_type]}
- 상태: ${artifactStatusLabels[artifact.status ?? "draft"]}
- 현재 버전: v${artifact.version ?? 1}
- 이전 비교: ${summary.previous ? `v${summary.previous.version ?? 1}` : "최초 버전"}
- 리뷰 강도: ${summary.intensityLabel}

## 변경 요약

- 추가 라인: ${summary.added}
- 삭제 라인: ${summary.removed}
- 추가 섹션: ${summary.addedSections.join(", ") || "없음"}
- 삭제 섹션: ${summary.removedSections.join(", ") || "없음"}

## 승인 전 체크

${summary.checks.map((check) => `- ${check}`).join("\n")}

## 권장 판단

${summary.recommendation}
`;
}

function formatTelemetryTime(value: string) {
  return new Date(value).toLocaleString("ko-KR", {
    timeZone: "Asia/Seoul",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatTelemetryProperties(properties: Json) {
  if (!properties || typeof properties !== "object" || Array.isArray(properties)) {
    return "";
  }

  return Object.entries(properties)
    .filter(([, value]) => value !== undefined && value !== null && typeof value !== "object")
    .slice(0, 4)
    .map(([key, value]) => `${key}: ${String(value)}`)
    .join(" · ");
}

function eventCountForWindow(events: TelemetryEvent[], days: number) {
  const threshold = Date.now() - days * 24 * 60 * 60 * 1000;

  return events.filter((event) => new Date(event.occurred_at).getTime() >= threshold).length;
}

function buildLearningTelemetryReportMarkdown({
  idea,
  events,
  openRisks,
  experiments,
  implementationTasks,
}: {
  idea: Idea;
  events: TelemetryEvent[];
  openRisks: Risk[];
  experiments: Experiment[];
  implementationTasks: ImplementationTask[];
}) {
  const recentEvents = events.slice(0, 12);
  const eventRows = recentEvents
    .map(
      (event, index) =>
        `| ${index + 1} | ${formatTelemetryTime(event.occurred_at)} | ${
          telemetryEventLabels[event.event_name] ?? event.event_name
        } | ${telemetryCategoryLabels[event.event_category] ?? event.event_category} | ${formatTelemetryProperties(event.properties) || "-"} |`,
    )
    .join("\n");
  const doneTasks = implementationTasks.filter((task) => task.status === "done").length;

  return `# 출시 후 학습 리포트: ${idea.name}

## 현재 상태

- 최근 7일 이벤트: ${eventCountForWindow(events, 7)}개
- 최근 14일 이벤트: ${eventCountForWindow(events, 14)}개
- 최근 30일 이벤트: ${eventCountForWindow(events, 30)}개
- 열린 리스크: ${openRisks.length}개
- 실험: ${experiments.length}개
- 개발 태스크 완료: ${doneTasks}/${implementationTasks.length}

## Day 7 판단

- 확인 신호: 핵심 행동 이벤트, 첫 사용 완료, 반복 방문, 오류/차단 기록
- 권장 행동: 이벤트가 적으면 온보딩/첫 가치 도달을 줄이고, 실험 결과를 하나 더 기록합니다.

## Day 14 판단

- 확인 신호: 반복 사용, 지불 의향, 리스크 종료, 지원 요청 패턴
- 권장 행동: 반복 사용이 약하면 사용자 세그먼트나 첫 화면을 좁힙니다.

## Day 30 판단

- 확인 신호: 유지율, 유료 전환, 추천/공유, 운영 비용, 보안/개인정보 사고 없음
- 권장 행동: 충분한 신호가 있으면 다음 빌드 범위를 승인하고, 약하면 전환 또는 중단 판단을 기록합니다.

## 최근 이벤트

| 순서 | 시각 | 이벤트 | 범주 | 속성 |
| --- | --- | --- | --- | --- |
${eventRows || "| - | 이벤트 없음 | - | - | - |"}
`;
}

function buildTelemetryAdapterGuideMarkdown(idea: Idea) {
  return `# MVP 제품 이벤트 연결 가이드: ${idea.name}

## 서버 라우트

\`\`\`http
POST https://ai-venture-lab.vercel.app/api/telemetry/ingest
Content-Type: application/json
Authorization: Bearer <TELEMETRY_INGEST_SECRET>
\`\`\`

## 기본 payload

\`\`\`json
{
  "ideaId": "${idea.id}",
  "eventName": "product_core_action",
  "eventCategory": "product",
  "source": "mvp-production",
  "anonymousId": "stable-user-or-device-id",
  "sessionId": "current-session-id",
  "properties": {
    "action": "created_first_record",
    "path": "/dashboard",
    "plan": "free"
  }
}
\`\`\`

## curl 예시

\`\`\`bash
curl -X POST "https://ai-venture-lab.vercel.app/api/telemetry/ingest" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer $TELEMETRY_INGEST_SECRET" \\
  -d '{
    "ideaId": "${idea.id}",
    "eventName": "product_core_action",
    "eventCategory": "product",
    "source": "mvp-production",
    "anonymousId": "user-123",
    "sessionId": "session-abc",
    "properties": {
      "action": "created_first_record",
      "path": "/dashboard"
    }
  }'
\`\`\`

## 서버 환경변수

\`\`\`env
${buildTelemetryEnvSnippet()}
\`\`\`

## Next.js 서버 라우트 예시

\`\`\`ts
${buildTelemetryNextRouteSnippet(idea)}
\`\`\`

## 브라우저 호출 helper 예시

\`\`\`ts
${buildTelemetryClientHelperSnippet()}
\`\`\`

## 스모크 명령

\`\`\`powershell
${buildTelemetrySmokeCommandSnippet(idea)}
\`\`\`

## 권장 이벤트 이름

- product_page_view
- product_signup_started
- product_signup_completed
- product_core_action
- product_activation
- product_retention_ping
- product_payment_signal
- product_feedback
- product_error
- product_churn_signal

## 보안 원칙

- \`TELEMETRY_INGEST_SECRET\`은 서버 전용입니다. 브라우저 번들, 모바일 앱, 공개 저장소에 넣지 마세요.
- \`anonymousId\`와 \`sessionId\`는 API에서 해시되어 저장됩니다.
- \`properties\`에는 이메일, 전화번호, 이름, 카드, 계좌, 원문 대화 같은 직접 식별 정보를 넣지 마세요.
`;
}

function buildTelemetryEnvSnippet() {
  return `# Server-only. Do not prefix with NEXT_PUBLIC.
TELEMETRY_INGEST_SECRET=replace-with-shared-server-secret`;
}

function buildTelemetryEventNameUnion() {
  return productTelemetryTaxonomy.map((event) => `  | "${event.eventName}"`).join("\n");
}

function buildTelemetryNextRouteSnippet(idea: Idea) {
  return `// app/api/product-events/route.ts
import { NextResponse } from "next/server";

type ProductEventName =
${buildTelemetryEventNameUnion()};

const ventureTelemetryEndpoint = "https://ai-venture-lab.vercel.app/api/telemetry/ingest";
const ventureIdeaId = "${idea.id}";

export async function POST(request: Request) {
  const secret = process.env.TELEMETRY_INGEST_SECRET;

  if (!secret) {
    return NextResponse.json({ ok: false, error: "missing telemetry secret" }, { status: 503 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    eventName?: ProductEventName;
    anonymousId?: string;
    sessionId?: string;
    properties?: Record<string, unknown>;
  };

  if (!body.eventName) {
    return NextResponse.json({ ok: false, error: "eventName is required" }, { status: 400 });
  }

  const response = await fetch(ventureTelemetryEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: \`Bearer \${secret}\`,
    },
    body: JSON.stringify({
      ideaId: ventureIdeaId,
      eventName: body.eventName,
      eventCategory: "product",
      source: "mvp-production",
      anonymousId: body.anonymousId,
      sessionId: body.sessionId,
      properties: body.properties ?? {},
    }),
  });

  if (!response.ok) {
    return NextResponse.json({ ok: false, accepted: false }, { status: 202 });
  }

  return NextResponse.json({ ok: true });
}`;
}

function buildTelemetryClientHelperSnippet() {
  return `// lib/product-telemetry.ts
type ProductEventName =
${buildTelemetryEventNameUnion()};

function getOrCreateStorageId(storage: Storage, key: string) {
  const existing = storage.getItem(key);
  if (existing) return existing;

  const next = crypto.randomUUID();
  storage.setItem(key, next);
  return next;
}

export async function trackProductEvent(
  eventName: ProductEventName,
  properties: Record<string, unknown> = {},
) {
  await fetch("/api/product-events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      eventName,
      anonymousId: getOrCreateStorageId(localStorage, "anonymous_id"),
      sessionId: getOrCreateStorageId(sessionStorage, "session_id"),
      properties,
    }),
    keepalive: true,
  }).catch(() => {
    // Analytics must never block the product flow.
  });
}`;
}

function buildTelemetrySmokeCommandSnippet(idea: Idea) {
  return `$env:TELEMETRY_INGEST_SECRET="Vercel에 등록한 TELEMETRY_INGEST_SECRET"
$env:TELEMETRY_SMOKE_IDEA_ID="${idea.id}"
pnpm smoke:telemetry

# 방문부터 결제 신호까지 전체 제품 퍼널을 한 번에 검증할 때
pnpm smoke:telemetry:funnel`;
}

function buildProductTelemetryFunnelMarkdown({
  idea,
  events,
}: {
  idea: Idea;
  events: TelemetryEvent[];
}) {
  const counts = productTelemetryFunnelSteps.map((step, index) => {
    const count = events.filter((event) => event.event_name === step.eventName).length;
    const previousCount =
      index === 0 ? count : events.filter((event) => event.event_name === productTelemetryFunnelSteps[index - 1].eventName).length;
    const fromPrevious = index === 0 || previousCount === 0 ? null : Math.round((count / previousCount) * 100);

    return {
      ...step,
      count,
      fromPrevious,
    };
  });
  const taxonomyRows = productTelemetryTaxonomy
    .map((item) => {
      const count = events.filter((event) => event.event_name === item.eventName).length;

      return `| ${item.label} | ${item.eventName} | ${count > 0 ? `${count}개 수집` : "대기"} | ${item.when} |`;
    })
    .join("\n");
  const funnelRows = counts
    .map(
      (item, index) =>
        `| ${index + 1} | ${item.label} | ${item.eventName} | ${item.count} | ${
          item.fromPrevious === null ? "-" : `${item.fromPrevious}%`
        } | ${item.nextAction} |`,
    )
    .join("\n");

  return `# 제품 이벤트 퍼널 리포트: ${idea.name}

## 퍼널

| 순서 | 단계 | 이벤트 | 건수 | 전 단계 전환율 | 다음 액션 |
| --- | --- | --- | --- | --- | --- |
${funnelRows}

## 이벤트 택소노미

| 신호 | 이벤트 이름 | 상태 | 기록 시점 |
| --- | --- | --- | --- |
${taxonomyRows}

## 운영 원칙

- 직접 식별 정보는 이벤트 속성에 넣지 않습니다.
- 전환율이 낮은 단계는 새 기능 개발보다 마찰 제거를 먼저 검증합니다.
- 핵심 행동과 활성화 이벤트가 없으면 Day 7/14/30 판단을 보류합니다.
`;
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
  initialTelemetryEvents,
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
  initialTelemetryEvents: TelemetryEvent[];
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
  const [telemetryEvents, setTelemetryEvents] = useState(initialTelemetryEvents);
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
  const [evidenceDraft, setEvidenceDraft] = useState<EvidenceDraft>({
    title: "",
    source: "",
    evidence: "",
    implication: "",
    confidence: "medium",
  });
  const [experimentResultDraft, setExperimentResultDraft] = useState<ExperimentResultDraft>({
    experiment_id: "",
    result: "",
    learning: "",
    next_decision: "research_more",
    next_action: "",
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
  const [artifactSourceFilter, setArtifactSourceFilter] = useState("all");
  const [localActiveTask, setLocalActiveTask] = useState<WorkbenchTask>(() =>
    sortWorkbenchIdeas(initialIdeas)[0] ? "score" : "select",
  );
  const [artifactPanel, setArtifactPanel] = useState<ArtifactPanel>("validation");
  const [developmentPanel, setDevelopmentPanel] = useState<DevelopmentPanel>("setup");
  const [experienceMode, setExperienceMode] = useState<"guided" | "full">("guided");
  const [implementationStatusFilter, setImplementationStatusFilter] = useState<ImplementationStatusFilter>("all");
  const [implementationOwnerFilter, setImplementationOwnerFilter] = useState("all");
  const [implementationEvidenceFilter, setImplementationEvidenceFilter] = useState<ImplementationEvidenceFilter>("all");
  const activeTask = controlledActiveTask ?? localActiveTask;
  const updateActiveTask = useCallback((task: WorkbenchTask) => {
    setLocalActiveTask(task);
    onActiveTaskChange?.(task);
  }, [onActiveTaskChange]);

  async function recordTelemetryEvent({
    eventName,
    eventCategory,
    properties = {},
    idea = selectedIdea,
  }: {
    eventName: string;
    eventCategory: string;
    properties?: Record<string, Json>;
    idea?: Idea | null;
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
        organization_id: idea?.organization_id ?? null,
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
      setTelemetryEvents((current) => upsertRecordById(current, data));
      emitVentureEvent<TelemetryEvent>("venture:telemetry-created", data);
    }
  }

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
    const handleTelemetryCreated = (event: Event) => handleRecordEvent<TelemetryEvent>(event, setTelemetryEvents);

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
    window.addEventListener("venture:telemetry-created", handleTelemetryCreated);

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
      window.removeEventListener("venture:telemetry-created", handleTelemetryCreated);
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
  const artifactReviewQueue = useMemo(() => buildArtifactReviewQueue(selectedArtifactRecords), [selectedArtifactRecords]);
  const approvedArtifactReviewCount = artifactReviewQueue.filter((item) => item.status === "approved").length;
  const nextArtifactReviewItem = artifactReviewQueue.find((item) => item.status !== "approved") ?? null;
  const artifactReviewProgress = Math.round((approvedArtifactReviewCount / artifactReviewQueue.length) * 100);
  const artifactSourceOptions = useMemo(
    () =>
      ["all", ...Array.from(new Set(selectedArtifactRecords.map((artifact) => artifact.source || "manual"))).sort((a, b) =>
        a.localeCompare(b),
      )],
    [selectedArtifactRecords],
  );
  const artifactSourceFilterLabels = useMemo(
    () =>
      Object.fromEntries(
        artifactSourceOptions.map((source) => [
          source,
          source === "all" ? "전체 출처" : (artifactSourceLabels[source] ?? source),
        ]),
      ) as Record<string, string>,
    [artifactSourceOptions],
  );
  const activeArtifactSourceFilter = artifactSourceOptions.includes(artifactSourceFilter) ? artifactSourceFilter : "all";
  const selectedArtifacts = useMemo(
    () =>
      selectedArtifactRecords
        .filter((artifact) => artifactTypeFilter === "all" || artifact.artifact_type === artifactTypeFilter)
        .filter((artifact) => artifactStatusFilter === "all" || (artifact.status ?? "draft") === artifactStatusFilter)
        .filter((artifact) => activeArtifactSourceFilter === "all" || (artifact.source || "manual") === activeArtifactSourceFilter)
        .slice(0, 8),
    [activeArtifactSourceFilter, artifactStatusFilter, artifactTypeFilter, selectedArtifactRecords],
  );
  const recentDevelopmentHandoffArtifacts = useMemo(
    () =>
      selectedArtifactRecords
        .filter(
          (artifact) =>
            artifact.artifact_type === "dev_runbook" &&
            ["filtered_implementation_run", "development_process"].includes(artifact.source || ""),
        )
        .slice(0, 3),
    [selectedArtifactRecords],
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
  const selectedTelemetryEvents = useMemo(
    () =>
      telemetryEvents
        .filter((event) => event.idea_id === selectedIdea?.id)
        .sort((a, b) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime()),
    [selectedIdea?.id, telemetryEvents],
  );
  const openSelectedIdeaRisks = selectedIdeaRisks.filter((risk) => risk.status !== "closed");
  const learningTelemetryReportDraft = selectedIdea
    ? buildLearningTelemetryReportMarkdown({
        idea: selectedIdea,
        events: selectedTelemetryEvents,
        openRisks: openSelectedIdeaRisks,
        experiments: selectedExperiments,
        implementationTasks: selectedImplementationTasks,
      })
    : "";
  const telemetryAdapterGuideDraft = selectedIdea ? buildTelemetryAdapterGuideMarkdown(selectedIdea) : "";
  const telemetryEnvSnippet = selectedIdea ? buildTelemetryEnvSnippet() : "";
  const telemetryNextRouteSnippet = selectedIdea ? buildTelemetryNextRouteSnippet(selectedIdea) : "";
  const telemetryClientHelperSnippet = selectedIdea ? buildTelemetryClientHelperSnippet() : "";
  const telemetrySmokeCommandSnippet = selectedIdea ? buildTelemetrySmokeCommandSnippet(selectedIdea) : "";
  const selectedProductTelemetryEvents = selectedTelemetryEvents.filter(
    (event) => event.event_category === "product" || event.event_name.startsWith("product_"),
  );
  const productTelemetryFunnelDraft = selectedIdea
    ? buildProductTelemetryFunnelMarkdown({
        idea: selectedIdea,
        events: selectedProductTelemetryEvents,
      })
    : "";
  const productTelemetryFunnelRows = productTelemetryFunnelSteps.map((step, index) => {
    const count = selectedProductTelemetryEvents.filter((event) => event.event_name === step.eventName).length;
    const previousStep = productTelemetryFunnelSteps[index - 1];
    const previousCount = previousStep
      ? selectedProductTelemetryEvents.filter((event) => event.event_name === previousStep.eventName).length
      : count;
    const conversion = index === 0 || previousCount === 0 ? null : Math.round((count / previousCount) * 100);

    return {
      ...step,
      count,
      conversion,
    };
  });
  const productTelemetryMaxCount = Math.max(1, ...productTelemetryFunnelRows.map((row) => row.count));
  const productTelemetryTaxonomyRows = productTelemetryTaxonomy.map((item) => ({
    ...item,
    count: selectedProductTelemetryEvents.filter((event) => event.event_name === item.eventName).length,
  }));
  const learningSignalCards = [
    {
      label: "제품 이벤트",
      value: `${selectedProductTelemetryEvents.length}개`,
      detail: "실제 MVP/외부 앱에서 수집된 사용자 행동 신호",
    },
    {
      label: "최근 7일",
      value: `${eventCountForWindow(selectedTelemetryEvents, 7)}개`,
      detail: "첫 가치 도달, 저장, 상태 변경 같은 초기 행동 신호",
    },
    {
      label: "최근 14일",
      value: `${eventCountForWindow(selectedTelemetryEvents, 14)}개`,
      detail: "반복 사용, 실험 결과, 리스크 해소 신호",
    },
    {
      label: "최근 30일",
      value: `${eventCountForWindow(selectedTelemetryEvents, 30)}개`,
      detail: "유지, 전환, 다음 빌드 판단에 필요한 누적 신호",
    },
    {
      label: "열린 리스크",
      value: `${openSelectedIdeaRisks.length}개`,
      detail: "성과 확인에서 계속 감시해야 하는 차단 요인",
    },
  ];
  const selectedOpenImplementationTasks = useMemo(
    () => sortImplementationTasksForAction(selectedImplementationTasks.filter((task) => task.status !== "done")),
    [selectedImplementationTasks],
  );
  const implementationDependencyStatuses = useMemo(
    () => buildImplementationDependencyStatuses(selectedImplementationTasks),
    [selectedImplementationTasks],
  );
  const readyImplementationDependencyStatuses = implementationDependencyStatuses.filter((status) => status.ready);
  const waitingImplementationDependencyStatuses = implementationDependencyStatuses.filter(
    (status) => status.task.status !== "done" && !status.ready,
  );
  const nextImplementationTask = readyImplementationDependencyStatuses[0]?.task ?? selectedOpenImplementationTasks[0] ?? null;
  const nextImplementationDependencyStatus =
    implementationDependencyStatuses.find((status) => status.task.id === nextImplementationTask?.id) ?? null;
  const implementationDependencyPlanDraft = selectedIdea && editState
    ? buildImplementationDependencyPlanMarkdown({
        idea: selectedIdea,
        state: editState,
        statuses: implementationDependencyStatuses,
      })
    : "";
  const implementationEvidenceSummaries = useMemo(
    () =>
      selectedImplementationTasks
        .map((task) => {
          const evidence = implementationTaskEvidence[task.id] ?? task.evidence ?? "";
          const checklist = getImplementationEvidenceChecklist(task, evidence);
          const missing = checklist.filter((item) => !item.passed).map((item) => item.label);

          return {
            task,
            missing,
            passedCount: checklist.length - missing.length,
            totalCount: checklist.length,
          };
        })
        .sort(
          (a, b) =>
            b.missing.length - a.missing.length ||
            implementationTaskPriorityRank[a.task.priority] - implementationTaskPriorityRank[b.task.priority] ||
            implementationTaskActionRank[a.task.status] - implementationTaskActionRank[b.task.status] ||
            a.task.sort_order - b.task.sort_order,
        ),
    [implementationTaskEvidence, selectedImplementationTasks],
  );
  const implementationEvidenceIssues = implementationEvidenceSummaries.filter((summary) => summary.missing.length > 0);
  const blockedImplementationSummaries = useMemo(
    () =>
      selectedImplementationTasks
        .filter((task) => task.status === "blocked")
        .map((task) => {
          const evidence = implementationTaskEvidence[task.id] ?? task.evidence ?? "";
          const checklist = getImplementationEvidenceChecklist(task, evidence);
          const missing = checklist.filter((item) => !item.passed).map((item) => item.label);

          return {
            task,
            hint: getBlockedImplementationTaskHint(task),
            missing,
          };
        })
        .sort(
          (a, b) =>
            implementationTaskPriorityRank[a.task.priority] - implementationTaskPriorityRank[b.task.priority] ||
            b.missing.length - a.missing.length ||
            a.task.sort_order - b.task.sort_order,
        ),
    [implementationTaskEvidence, selectedImplementationTasks],
  );
  const implementationOwnerOptions = useMemo(
    () =>
      ["all", ...Array.from(new Set(selectedImplementationTasks.map((task) => getImplementationTaskOwnerRole(task)))).sort((a, b) =>
        a.localeCompare(b),
      )],
    [selectedImplementationTasks],
  );
  const implementationOwnerFilterLabels = useMemo(
    () =>
      Object.fromEntries(
        implementationOwnerOptions.map((option) => [option, option === "all" ? "전체 담당" : option]),
      ) as Record<string, string>,
    [implementationOwnerOptions],
  );
  const activeImplementationOwnerFilter = implementationOwnerOptions.includes(implementationOwnerFilter)
    ? implementationOwnerFilter
    : "all";
  const filteredImplementationTasks = useMemo(
    () =>
      selectedImplementationTasks.filter((task) => {
        const currentEvidence = implementationTaskEvidence[task.id] ?? task.evidence ?? "";
        const hasEvidenceGap = getImplementationEvidenceChecklist(task, currentEvidence).some((item) => !item.passed);
        const matchesStatus = implementationStatusFilter === "all" || task.status === implementationStatusFilter;
        const matchesOwner =
          activeImplementationOwnerFilter === "all" || getImplementationTaskOwnerRole(task) === activeImplementationOwnerFilter;
        const matchesEvidence =
          implementationEvidenceFilter === "all" ||
          (implementationEvidenceFilter === "missing" && hasEvidenceGap) ||
          (implementationEvidenceFilter === "complete" && !hasEvidenceGap);

        return matchesStatus && matchesOwner && matchesEvidence;
      }),
    [
      activeImplementationOwnerFilter,
      implementationEvidenceFilter,
      implementationTaskEvidence,
      implementationStatusFilter,
      selectedImplementationTasks,
    ],
  );
  const visibleImplementationStatuses =
    implementationStatusFilter === "all" ? implementationTaskStatuses : [implementationStatusFilter];

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
  const artifactReviewSummaries = useMemo(() => {
    const summaries = new Map<string, ArtifactReviewSummary>();

    for (const artifact of selectedArtifactRecords) {
      const previous =
        selectedArtifactRecords
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
          )[0] ?? null;

      summaries.set(artifact.id, summarizeArtifactReview(artifact, previous));
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

  async function deleteIdeaRecord(idea: Idea) {
    if (!supabase) {
      setMessage("Supabase 연결을 먼저 확인해 주세요.");
      return;
    }

    if (!user) {
      setMessage("아이디어를 삭제하려면 먼저 로그인해 주세요.");
      return;
    }

    if (!canManageRecord(idea)) {
      setMessage("이 아이디어를 삭제할 권한이 없습니다.");
      return;
    }

    if (ideas.length <= 1) {
      setMessage("마지막 아이디어는 아직 삭제할 수 없어요. 새 후보를 하나 더 만든 뒤 정리해 주세요.");
      return;
    }

    const confirmed = window.confirm(
      `"${idea.name}" 아이디어와 연결된 리스크, 판단, 실험, 산출물, 실행 기록까지 함께 삭제할까요?\n이 작업은 되돌릴 수 없습니다.`,
    );

    if (!confirmed) {
      return;
    }

    setIsBusy(true);
    setMessage(null);

    const relatedTables = [
      "telemetry_events",
      "implementation_tasks",
      "venture_artifacts",
      "orchestration_runs",
      "experiments",
      "decisions",
      "risks",
    ] as const;

    for (const table of relatedTables) {
      const { error } = await supabase.from(table).delete().eq("idea_id", idea.id);

      if (error) {
        setIsBusy(false);
        setMessage(`${idea.name} 삭제 중 ${table} 정리에서 막혔습니다: ${error.message}`);
        return;
      }
    }

    const { error } = await supabase.from("ideas").delete().eq("id", idea.id);

    if (error) {
      setIsBusy(false);
      setMessage(`${idea.name} 아이디어를 삭제하지 못했습니다: ${error.message}`);
      return;
    }

    const remainingIdeas = sortWorkbenchIdeas(ideas.filter((currentIdea) => currentIdea.id !== idea.id));
    const deletingSelectedIdea = selectedIdeaId === idea.id || selectedIdea?.id === idea.id;
    const nextSelectedIdea = deletingSelectedIdea
      ? (remainingIdeas[0] ?? null)
      : (remainingIdeas.find((currentIdea) => currentIdea.id === selectedIdeaId) ?? remainingIdeas[0] ?? null);

    setIdeas(remainingIdeas);
    setRisks((current) => current.filter((risk) => risk.idea_id !== idea.id));
    setDecisionLog((current) => current.filter((entry) => entry.idea_id !== idea.id));
    setExperiments((current) => current.filter((experiment) => experiment.idea_id !== idea.id));
    setOrchestrationRuns((current) => current.filter((run) => run.idea_id !== idea.id));
    setArtifacts((current) => current.filter((artifact) => artifact.idea_id !== idea.id));
    setImplementationTasks((current) => current.filter((task) => task.idea_id !== idea.id));
    setTelemetryEvents((current) => current.filter((event) => event.idea_id !== idea.id));
    setSelectedIdeaId(nextSelectedIdea?.id ?? "");
    setEditState(nextSelectedIdea ? toEditState(nextSelectedIdea) : null);
    setIsBusy(false);

    if (nextSelectedIdea) {
      if (deletingSelectedIdea) {
        updateActiveTask("score");
      }
      setMessage(`"${idea.name}" 아이디어를 삭제했고, 다음 아이디어로 이동했습니다.`);
    } else {
      updateActiveTask("select");
      setMessage(`"${idea.name}" 아이디어를 삭제했습니다.`);
    }

    router.refresh();
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
  const validationEvidenceCoach = selectedIdea && editState
    ? buildValidationEvidenceCoach({
        idea: selectedIdea,
        state: editState,
        score: currentScore,
        risks: selectedIdeaRisks,
        experiments: selectedExperiments,
        artifacts: selectedArtifactRecords,
        decisions: selectedDecisions,
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
  const evidenceNoteDraft = selectedIdea && editState
    ? buildEvidenceNoteMarkdown({
        idea: selectedIdea,
        state: editState,
        draft: evidenceDraft,
      })
    : "";
  const selectedExperimentForResult =
    selectedExperiments.find((experiment) => experiment.id === experimentResultDraft.experiment_id) ??
    selectedExperiments[0] ??
    null;
  const experimentResultNoteDraft = selectedIdea && editState && selectedExperimentForResult
    ? buildExperimentResultMarkdown({
        idea: selectedIdea,
        state: editState,
        experiment: selectedExperimentForResult,
        draft: {
          ...experimentResultDraft,
          experiment_id: selectedExperimentForResult.id,
        },
      })
    : "";
  const validationSummaryDraft = selectedIdea && editState
    ? buildValidationSummaryMarkdown({
        idea: selectedIdea,
        state: editState,
        score: currentScore,
        recommendation: scoreRecommendation,
        risks: selectedIdeaRisks,
        experiments: selectedExperiments,
        artifacts: selectedArtifactRecords,
        decisions: selectedDecisions,
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
  const mvpSlicePlanDraft = selectedIdea && editState
    ? buildMvpSlicePlanMarkdown({
        idea: selectedIdea,
        state: editState,
        experiments: selectedExperiments,
        risks: selectedIdeaRisks,
        artifacts: selectedArtifactRecords,
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
  const backendCandidateScores = selectedIdea && editState
    ? buildBackendCandidateScores({
        idea: selectedIdea,
        state: editState,
        experiments: selectedExperiments,
        risks: selectedIdeaRisks,
      })
    : [];
  const backendDecisionDraft = selectedIdea && editState
    ? buildBackendDecisionMarkdown({
        idea: selectedIdea,
        state: editState,
        candidates: backendCandidateScores,
      })
    : "";
  const backendExecutionPlan = backendCandidateScores[0] ? buildBackendExecutionPlan(backendCandidateScores[0]) : null;
  const backendExecutionPlanDraft = selectedIdea && backendExecutionPlan
    ? buildBackendExecutionPlanMarkdown({
        idea: selectedIdea,
        plan: backendExecutionPlan,
      })
    : "";
  const designBriefDraft = selectedIdea && editState
    ? buildDesignBriefMarkdown({
        idea: selectedIdea,
        state: editState,
        runs: selectedRuns,
      })
    : "";
  const designGenerationPromptDraft = selectedIdea && editState
    ? buildDesignGenerationPromptMarkdown({
        idea: selectedIdea,
        state: editState,
        risks: selectedIdeaRisks,
        experiments: selectedExperiments,
        backendCandidateScores,
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
  const appBlueprintDraft = selectedIdea && editState
    ? buildAppBlueprintMarkdown({
        idea: selectedIdea,
        state: editState,
        risks: selectedIdeaRisks,
        experiments: selectedExperiments,
        implementationTasks: selectedImplementationTasks,
        backendCandidateScores,
      })
    : "";
  const scaffoldManifestDraft = selectedIdea && editState
    ? buildMvpScaffoldManifestMarkdown({
        idea: selectedIdea,
        state: editState,
        experiments: selectedExperiments,
        backendCandidateScores,
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
  const rolePromptPackDraft = selectedIdea && editState
    ? buildRolePromptPackMarkdown({
        idea: selectedIdea,
        state: editState,
        risks: selectedIdeaRisks,
        experiments: selectedExperiments,
        runs: selectedRuns,
        artifacts: selectedArtifactRecords,
        implementationTasks: selectedImplementationTasks,
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
        viewName: "열린 태스크",
        filterSummary: "상태: 완료 제외 / 담당: 전체 / 증거: 전체",
        evidenceByTaskId: implementationTaskEvidence,
        emptyMessage: "열린 개발 태스크가 없습니다.",
      })
    : "";
  const implementationFilterSummary = `상태: ${implementationStatusFilterLabels[implementationStatusFilter]} / 담당: ${
    implementationOwnerFilterLabels[activeImplementationOwnerFilter]
  } / 증거: ${implementationEvidenceFilterLabels[implementationEvidenceFilter]}`;
  const filteredImplementationBacklogDraft = selectedIdea && editState
    ? buildImplementationBacklogMarkdown({
        idea: selectedIdea,
        state: editState,
        tasks: filteredImplementationTasks,
        viewName: "필터된 태스크",
        filterSummary: implementationFilterSummary,
        evidenceByTaskId: implementationTaskEvidence,
        emptyMessage: "현재 필터 조건에 맞는 개발 태스크가 없습니다.",
      })
    : "";
  const filteredImplementationRunPromptDraft = selectedIdea && editState
    ? buildFilteredImplementationRunPromptMarkdown({
        idea: selectedIdea,
        state: editState,
        tasks: filteredImplementationTasks,
        filterSummary: implementationFilterSummary,
        evidenceByTaskId: implementationTaskEvidence,
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
  const hasIdeaBriefArtifact = selectedArtifactRecords.some((artifact) => artifact.artifact_type === "idea_brief");
  const hasResearchNoteArtifact = selectedArtifactRecords.some((artifact) => artifact.artifact_type === "research_note");
  const hasValidationSprintArtifact = selectedArtifactRecords.some((artifact) => artifact.source === "validation_sprint");
  const hasEvidenceCaptureArtifact = selectedArtifactRecords.some((artifact) => artifact.source === "evidence_capture");
  const hasExperimentResultArtifact = selectedArtifactRecords.some((artifact) => artifact.source === "experiment_result");
  const hasValidationSummaryArtifact = selectedArtifactRecords.some((artifact) => artifact.source === "validation_summary");
  const hasPrdArtifact = selectedArtifactRecords.some((artifact) => artifact.artifact_type === "prd");
  const hasApprovedPrdArtifact = selectedArtifactRecords.some(
    (artifact) => artifact.artifact_type === "prd" && artifact.status === "approved",
  );
  const hasMvpSpecArtifact = selectedArtifactRecords.some((artifact) => artifact.artifact_type === "mvp_spec");
  const hasApprovedMvpSpecArtifact = selectedArtifactRecords.some(
    (artifact) => artifact.artifact_type === "mvp_spec" && artifact.status === "approved",
  );
  const hasMvpSlicePlanArtifact = selectedArtifactRecords.some((artifact) => artifact.source === "mvp_slice_plan");
  const hasBackendDecisionArtifact = selectedArtifactRecords.some(
    (artifact) => artifact.artifact_type === "backend_decision",
  );
  const hasDesignBriefArtifact = selectedArtifactRecords.some((artifact) => artifact.artifact_type === "design_brief");
  const hasApprovedDesignBriefArtifact = selectedArtifactRecords.some(
    (artifact) => artifact.artifact_type === "design_brief" && artifact.status === "approved",
  );
  const hasTechSpecArtifact = selectedArtifactRecords.some((artifact) => artifact.artifact_type === "tech_spec");
  const hasApprovedTechSpecArtifact = selectedArtifactRecords.some(
    (artifact) => artifact.artifact_type === "tech_spec" && artifact.status === "approved",
  );
  const hasDevRunbookArtifact = selectedArtifactRecords.some((artifact) => artifact.artifact_type === "dev_runbook");
  const developmentOpsArtifacts = selectedArtifactRecords.filter((artifact) =>
    ["backend_decision", "tech_spec", "dev_runbook"].includes(artifact.artifact_type),
  );
  const hasEnvironmentChecklist = developmentOpsArtifacts.some(
    (artifact) =>
      ["환경변수", "Vercel"].every((term) => artifact.body.includes(term)) &&
      ["서버 전용", "클라이언트", "비밀값"].some((term) => artifact.body.includes(term)),
  );
  const hasBackendRulesChecklist = developmentOpsArtifacts.some(
    (artifact) =>
      (artifact.body.includes("RLS") || artifact.body.includes("Security Rules")) &&
      ["허용", "차단"].every((term) => artifact.body.includes(term)),
  );
  const hasReleaseOpsChecklist = developmentOpsArtifacts.some(
    (artifact) =>
      ["롤백", "Production"].every((term) => artifact.body.includes(term)) &&
      (artifact.body.includes("배포 로그") || artifact.body.includes("빌드 로그") || artifact.body.includes("Vercel 로그")),
  );
  const hasDesignStateCoverage = selectedArtifactRecords.some(
    (artifact) =>
      artifact.artifact_type === "design_brief" &&
      ["빈 상태", "로딩", "오류", "권한", "모바일", "접근성"].every((term) => artifact.body.includes(term)),
  );
  const completedImplementationTasks = selectedImplementationTasks.filter((task) => task.status === "done");
  const implementationTasksWithEvidence = completedImplementationTasks.filter((task) => task.evidence.trim());
  const hasBlockedImplementationTasks = selectedImplementationTasks.some((task) => task.status === "blocked");
  const hasCompletedExperiment = selectedExperiments.some((experiment) => experiment.status === "done");
  const highRiskCount = selectedIdeaRisks.filter((risk) => ["high", "critical"].includes(risk.severity)).length;
  const unresolvedHighRiskCount = selectedIdeaRisks.filter(
    (risk) => ["high", "critical"].includes(risk.severity) && risk.status !== "closed",
  ).length;
  const prdReadinessChecks: GateCheck[] = selectedIdea && editState
    ? [
        {
          label: "기본 입력",
          passed: missing.length === 0,
          detail: missing.length === 0 ? "한 줄 설명, 대상 사용자, 구매자, 수요 신호가 채워져 있습니다." : missing.join(", "),
        },
        {
          label: "아이디어 브리프",
          passed: hasIdeaBriefArtifact,
          detail: hasIdeaBriefArtifact ? "짧은 요약 산출물이 저장되어 있습니다." : "검증 산출물에서 아이디어 브리프를 저장하세요.",
        },
        {
          label: "리서치 근거",
          passed: hasResearchNoteArtifact,
          detail: hasResearchNoteArtifact ? "리서치 노트가 1개 이상 저장되어 있습니다." : "리서치 브리프 또는 근거 노트를 저장하세요.",
        },
        {
          label: "검증 스프린트",
          passed: hasValidationSprintArtifact,
          detail: hasValidationSprintArtifact ? "7일 검증 실행 계획이 저장되어 있습니다." : "7일 검증 스프린트를 저장하세요.",
        },
        {
          label: "현장 근거",
          passed: hasEvidenceCaptureArtifact || hasExperimentResultArtifact,
          detail:
            hasEvidenceCaptureArtifact || hasExperimentResultArtifact
              ? "수동 근거 또는 실험 결과가 기록되어 있습니다."
              : "인터뷰, 외부 자료, 가격 신호, 실험 결과 중 하나를 저장하세요.",
        },
        {
          label: "실험 학습",
          passed: hasCompletedExperiment || hasExperimentResultArtifact,
          detail:
            hasCompletedExperiment || hasExperimentResultArtifact
              ? "완료된 실험 또는 실험 결과 노트가 있습니다."
              : "실험을 완료하거나 실험 결과 기록을 저장하세요.",
        },
        {
          label: "높은 리스크 통제",
          passed: unresolvedHighRiskCount === 0,
          detail:
            highRiskCount === 0
              ? "높음/치명 리스크가 없습니다."
              : `${highRiskCount - unresolvedHighRiskCount}/${highRiskCount}개 높은 리스크가 종료되었습니다.`,
        },
        {
          label: "판단 기록",
          passed: editState.decision !== "pending" && selectedDecisions.length > 0,
          detail:
            editState.decision !== "pending" && selectedDecisions.length > 0
              ? `${decisionLabels[editState.decision]} 판단과 기록 ${selectedDecisions.length}개가 있습니다.`
              : "진행, 추가 조사, 전환, 중단 중 하나로 판단 근거를 남기세요.",
        },
        {
          label: "검증 완료 요약",
          passed: hasValidationSummaryArtifact,
          detail: hasValidationSummaryArtifact ? "PRD 진입 전 요약 메모가 저장되어 있습니다." : "검증 완료 요약을 저장하세요.",
        },
      ]
    : [];
  const passedPrdReadinessCount = prdReadinessChecks.filter((check) => check.passed).length;
  const prdReadinessScore =
    prdReadinessChecks.length === 0 ? 0 : Math.round((passedPrdReadinessCount / prdReadinessChecks.length) * 100);
  const nextPrdBlocker = prdReadinessChecks.find((check) => !check.passed) ?? null;
  const prdHandoffDraft = selectedIdea && editState
    ? buildPrdHandoffMarkdown({
        idea: selectedIdea,
        state: editState,
        score: currentScore,
        recommendation: scoreRecommendation,
        prdReadinessScore,
        prdReadinessChecks,
        validationEvidenceCoach,
        risks: selectedIdeaRisks,
        experiments: selectedExperiments,
        decisions: selectedDecisions,
        nextPrdBlocker,
      })
    : "";
  const designReadinessChecks: GateCheck[] = selectedIdea && editState
    ? [
        {
          label: "핵심 여정 고정",
          passed: Boolean(selectedIdea.one_liner.trim() && selectedIdea.target_user.trim() && editState.next_evidence.trim()),
          detail:
            selectedIdea.one_liner.trim() && selectedIdea.target_user.trim() && editState.next_evidence.trim()
              ? "사용자, 가치 제안, 다음 증거가 한 흐름으로 연결되어 있습니다."
              : "한 줄 설명, 대상 사용자, 다음 증거를 먼저 고정하세요.",
        },
        {
          label: "PRD 산출물",
          passed: hasPrdArtifact,
          detail: hasPrdArtifact ? "제품 요구사항 초안이 저장되어 있습니다." : "검증 산출물에서 PRD를 저장하세요.",
        },
        {
          label: "MVP 범위",
          passed: hasMvpSpecArtifact,
          detail: hasMvpSpecArtifact ? "MVP 포함/제외 범위가 저장되어 있습니다." : "MVP 명세를 저장하세요.",
        },
        {
          label: "백엔드 선택",
          passed: hasBackendDecisionArtifact,
          detail: hasBackendDecisionArtifact
            ? "데이터/인증/운영 경계가 백엔드 결정에 기록되어 있습니다."
            : "백엔드 선택 스코어카드를 보고 결정을 저장하세요.",
        },
        {
          label: "디자인 상태 커버리지",
          passed: hasDesignStateCoverage,
          detail: hasDesignStateCoverage
            ? "빈 상태, 로딩, 오류, 권한, 모바일, 접근성 상태가 디자인 브리프에 포함되어 있습니다."
            : "디자인 브리프에 빈 상태, 로딩, 오류, 권한, 모바일, 접근성을 명시하세요.",
        },
        {
          label: "디자인 실행",
          passed: selectedRuns.some((run) => run.phase === "design" && run.status === "done") || hasDesignBriefArtifact,
          detail:
            selectedRuns.some((run) => run.phase === "design" && run.status === "done") || hasDesignBriefArtifact
              ? "디자인 오케스트레이션 또는 브리프가 준비되어 있습니다."
              : "오케스트레이션에서 디자인 단계를 완료하거나 디자인 브리프를 저장하세요.",
        },
      ]
    : [];
  const passedDesignReadinessCount = designReadinessChecks.filter((check) => check.passed).length;
  const designReadinessScore =
    designReadinessChecks.length === 0
      ? 0
      : Math.round((passedDesignReadinessCount / designReadinessChecks.length) * 100);
  const buildReadinessChecks: GateCheck[] = selectedIdea
    ? [
        {
          label: "PRD 승인",
          passed: hasApprovedPrdArtifact,
          detail: hasApprovedPrdArtifact
            ? "제품 요구사항이 승인되어 개발 입력으로 쓸 수 있습니다."
            : hasPrdArtifact
              ? "PRD 초안은 있고 승인이 필요합니다."
              : "PRD 산출물을 먼저 저장하세요.",
        },
        {
          label: "MVP 명세 승인",
          passed: hasApprovedMvpSpecArtifact,
          detail: hasApprovedMvpSpecArtifact
            ? "첫 수직 슬라이스 범위가 승인되었습니다."
            : hasMvpSpecArtifact
              ? "MVP 명세 초안은 있고 승인이 필요합니다."
              : "MVP 명세를 먼저 저장하세요.",
        },
        {
          label: "MVP 슬라이스 플랜",
          passed: hasMvpSlicePlanArtifact,
          detail: hasMvpSlicePlanArtifact
            ? "수동 검증, 얇은 제품, AI/자동화, 출시 하드닝 순서가 저장되어 있습니다."
            : "제품 산출물에서 MVP 슬라이스 플랜을 저장하세요.",
        },
        {
          label: "백엔드 결정",
          passed: hasBackendDecisionArtifact,
          detail: hasBackendDecisionArtifact
            ? "Supabase/Firebase 선택 근거가 기록되어 있습니다."
            : "백엔드 선택 스코어카드에서 결정을 저장하세요.",
        },
        {
          label: "디자인 승인",
          passed: hasApprovedDesignBriefArtifact,
          detail: hasApprovedDesignBriefArtifact
            ? "구현 전 화면 흐름과 상태가 승인되었습니다."
            : hasDesignBriefArtifact
              ? "디자인 브리프 초안은 있고 승인이 필요합니다."
              : "디자인 브리프를 저장하세요.",
        },
        {
          label: "기술 명세 승인",
          passed: hasApprovedTechSpecArtifact,
          detail: hasApprovedTechSpecArtifact
            ? "데이터 모델, 권한, 검증 명령이 승인되었습니다."
            : hasTechSpecArtifact
              ? "기술 명세 초안은 있고 승인이 필요합니다."
              : "기술 명세를 저장하세요.",
        },
        {
          label: "개발 런북",
          passed: hasDevRunbookArtifact,
          detail: hasDevRunbookArtifact
            ? "구현 순서와 로컬/배포 검증 경로가 있습니다."
            : "개발 런북을 저장하세요.",
        },
        {
          label: "환경변수 경계",
          passed: hasEnvironmentChecklist,
          detail: hasEnvironmentChecklist
            ? "Vercel 환경변수와 서버/클라이언트 비밀값 경계가 산출물에 있습니다."
            : "기술 명세나 개발 런북에 Vercel 환경변수, 서버 전용 키, 클라이언트 공개 키 경계를 적으세요.",
        },
        {
          label: "백엔드 규칙 검증",
          passed: hasBackendRulesChecklist,
          detail: hasBackendRulesChecklist
            ? "RLS 또는 Security Rules의 허용/차단 검증이 기록되어 있습니다."
            : "Supabase RLS 또는 Firebase Security Rules의 허용/차단 테스트 계획을 저장하세요.",
        },
        {
          label: "롤백/배포 로그",
          passed: hasReleaseOpsChecklist,
          detail: hasReleaseOpsChecklist
            ? "Production 배포 로그와 롤백 경로가 산출물에 있습니다."
            : "Preview/Production 배포 로그, Vercel inspect 링크, 롤백 기준을 개발 런북에 기록하세요.",
        },
        {
          label: "태스크 분해",
          passed: selectedImplementationTasks.length > 0,
          detail:
            selectedImplementationTasks.length > 0
              ? `${selectedImplementationTasks.length}개 구현 태스크로 쪼개져 있습니다.`
              : "기본 태스크를 생성하세요.",
        },
        {
          label: "높은 리스크",
          passed: unresolvedHighRiskCount === 0,
          detail:
            unresolvedHighRiskCount === 0
              ? "열린 높음/치명 리스크가 없습니다."
              : `${unresolvedHighRiskCount}개 높음/치명 리스크가 남아 있습니다.`,
        },
      ]
    : [];
  const passedBuildReadinessCount = buildReadinessChecks.filter((check) => check.passed).length;
  const buildReadinessScore =
    buildReadinessChecks.length === 0 ? 0 : Math.round((passedBuildReadinessCount / buildReadinessChecks.length) * 100);
  const nextBuildBlocker = buildReadinessChecks.find((check) => !check.passed) ?? null;
  const developmentKickoffDraft = selectedIdea && editState
    ? buildDevelopmentKickoffMarkdown({
        idea: selectedIdea,
        state: editState,
        readinessChecks: buildReadinessChecks,
        taskDrafts: implementationTaskDrafts,
        risks: selectedIdeaRisks,
        experiments: selectedExperiments,
        artifacts: selectedArtifactRecords,
      })
    : "";
  const agentRunPackageTasks = filteredImplementationTasks.some((task) => task.status !== "done")
    ? filteredImplementationTasks.filter((task) => task.status !== "done")
    : selectedOpenImplementationTasks;
  const agentRunPackageDraft = selectedIdea && editState
    ? buildAgentRunPackageMarkdown({
        idea: selectedIdea,
        state: editState,
        artifacts: selectedArtifactRecords,
        tasks: agentRunPackageTasks,
        nextTask: nextImplementationTask,
        risks: selectedIdeaRisks,
        experiments: selectedExperiments,
        readinessChecks: buildReadinessChecks,
        filterSummary: implementationFilterSummary,
      })
    : "";
  const implementationGateChecks: GateCheck[] = selectedIdea
    ? [
        {
          label: "개발 태스크 생성",
          passed: selectedImplementationTasks.length > 0,
          detail:
            selectedImplementationTasks.length > 0
              ? `${selectedImplementationTasks.length}개의 실행 할 일이 있습니다.`
              : "제작 준비 프로세스에서 기본 실행 할 일을 생성하세요.",
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
          artifactType: "backend_decision",
          title: `${selectedIdea.name} 백엔드 실행 체크리스트`,
          body: backendExecutionPlanDraft,
          description: "선택한 백엔드의 환경변수, 권한 규칙, 검증 명령, 롤백 기준을 실행 문서로 고정합니다.",
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
  const developmentPackageDrafts: Array<{
    artifactType: VentureArtifactType;
    title: string;
    body: string;
    source: string;
  }> = selectedIdea
    ? [
        ...developmentArtifactDrafts.map((draft) => ({
          artifactType: draft.artifactType,
          title: draft.title,
          body: draft.body,
          source: "development_process",
        })),
        {
          artifactType: "dev_runbook",
          title: `${selectedIdea.name} 개발 런북`,
          body: developmentPlanDraft,
          source: "development_process",
        },
        {
          artifactType: "tech_spec",
          title: `${selectedIdea.name} 앱 블루프린트`,
          body: appBlueprintDraft,
          source: "app_blueprint",
        },
        {
          artifactType: "dev_runbook",
          title: `${selectedIdea.name} MVP 스캐폴드 매니페스트`,
          body: scaffoldManifestDraft,
          source: "scaffold_manifest",
        },
      ]
    : [];
  const hasFullExecutionRunbook = orchestrationPhaseConfigs.every((config) =>
    selectedRuns.some((run) => run.phase === config.phase),
  );
  const hasCoreExecutionPackage =
    hasBackendDecisionArtifact && hasDesignBriefArtifact && hasTechSpecArtifact && hasDevRunbookArtifact;
  const guidedExecutionStep: GuidedExecutionStep =
    !hasFullExecutionRunbook || !hasCoreExecutionPackage || selectedImplementationTasks.length === 0
      ? "package"
      : implementationGateScore < 100
        ? "execute"
        : "report";
  const visibleDevelopmentPanel: DevelopmentPanel =
    experienceMode === "guided"
      ? guidedExecutionStep === "package"
        ? "setup"
        : guidedExecutionStep === "execute"
          ? "tasks"
          : "handoff"
      : developmentPanel;
  const guidedExecutionProgress = [
    {
      id: "package" as const,
      label: guidedExecutionStepLabels.package,
      detail: `런북 ${hasFullExecutionRunbook ? "완료" : "필요"} · 핵심 산출물 ${
        hasCoreExecutionPackage ? "완료" : "필요"
      } · 태스크 ${selectedImplementationTasks.length > 0 ? `${selectedImplementationTasks.length}개` : "미생성"}`,
      done: hasFullExecutionRunbook && hasCoreExecutionPackage && selectedImplementationTasks.length > 0,
      active: guidedExecutionStep === "package",
    },
    {
      id: "execute" as const,
      label: guidedExecutionStepLabels.execute,
      detail:
        selectedImplementationTasks.length > 0
          ? `완료 ${completedImplementationTasks.length}/${selectedImplementationTasks.length} · 차단 ${selectedImplementationTasks.filter((task) => task.status === "blocked").length}`
          : "실행 할 일 준비 전",
      done: selectedImplementationTasks.length > 0 && implementationGateScore >= 100,
      active: guidedExecutionStep === "execute",
    },
    {
      id: "report" as const,
      label: guidedExecutionStepLabels.report,
      detail: `완료 게이트 ${passedImplementationGateCount}/${implementationGateChecks.length}`,
      done: implementationGateScore >= 100,
      active: guidedExecutionStep === "report",
    },
  ];
  const launchReadiness = selectedIdea && editState
    ? [
        {
          label: "기본 증거 완료",
          passed: missing.length === 0,
          detail: missing.length === 0 ? "필수 증거 공백이 없습니다." : missing.join(", "),
        },
        {
          label: "리서치 브리프 저장",
          passed: hasResearchNoteArtifact,
          detail: hasResearchNoteArtifact
            ? "인터뷰, 경쟁/대안, 가격, 규제 체크가 문서화되어 있습니다."
            : "산출물 단계에서 리서치 브리프를 저장하세요.",
        },
        {
          label: "검증 완료 요약 저장",
          passed: hasValidationSummaryArtifact,
          detail: hasValidationSummaryArtifact
            ? "PRD 진입 전 검증 메모가 저장되어 있습니다."
            : "검증 산출물에서 완료 요약을 저장하세요.",
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
            ? "제작 실행 순서와 게이트가 기록되어 있습니다."
            : "제작 준비 프로세스에서 개발 런북을 저장하세요.",
        },
        {
          label: "개발 태스크 완료",
          passed: implementationGateChecks.every((check) => check.passed),
          detail:
            selectedImplementationTasks.length > 0
              ? `개발 완료 게이트 ${passedImplementationGateCount}/${implementationGateChecks.length}개 통과`
              : "제작 준비 프로세스에서 기본 실행 할 일을 생성하세요.",
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
  const releaseDecisionPacket = selectedIdea && editState
    ? buildReleaseDecisionPacket({
        idea: selectedIdea,
        state: editState,
        score: currentScore,
        scoreRecommendation,
        launchReadinessScore,
        launchReadiness,
        implementationGateScore,
        implementationGateChecks,
        artifactReviewProgress,
        artifactReviewQueue,
        nextLaunchBlocker,
        risks: selectedIdeaRisks,
        experiments: selectedExperiments,
        runs: selectedRuns,
        artifacts: selectedArtifactRecords,
        implementationTasks: selectedImplementationTasks,
        decisions: selectedDecisions,
      })
    : null;
  const releaseDecisionPacketDraft = releaseDecisionPacket?.markdown ?? "";
  const mvpBuildCommandPacketDraft = selectedIdea && editState
    ? buildMvpBuildCommandPacketMarkdown({
        idea: selectedIdea,
        state: editState,
        appBlueprint: appBlueprintDraft,
        scaffoldManifest: scaffoldManifestDraft,
        implementationHandoff: implementationHandoffDraft,
        releaseDecisionPacket,
        implementationTasks: selectedImplementationTasks,
        dependencyStatuses: implementationDependencyStatuses,
        backendCandidateScores,
        artifactReviewQueue,
      })
    : "";
  const qaAcceptanceMatrixDraft = selectedIdea && editState
    ? buildQaAcceptanceMatrixMarkdown({
        idea: selectedIdea,
        state: editState,
        risks: selectedIdeaRisks,
        experiments: selectedExperiments,
        implementationTasks: selectedImplementationTasks,
        launchReadiness,
        implementationGateChecks,
        releaseDecisionPacket,
        backendCandidateScores,
      })
    : "";
  const postLaunchLearningLoopDraft = selectedIdea && editState
    ? buildPostLaunchLearningLoopMarkdown({
        idea: selectedIdea,
        state: editState,
        experiments: selectedExperiments,
        risks: selectedIdeaRisks,
        releaseDecisionPacket,
        launchReadiness,
        implementationTasks: selectedImplementationTasks,
      })
    : "";
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
      label: "후보 선택",
      description: "오늘 검토할 아이디어를 고릅니다.",
      status: selectedIdea ? "선택됨" : "필수",
    },
    {
      id: "score",
      label: "사업성 평가",
      description: "단계, 판단, 점수, 근거를 정리합니다.",
      status: currentScore > 0 ? `${currentScore}점` : "대기",
    },
    {
      id: "risk",
      label: "위험 확인",
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
      label: "검증 실험",
      description: "가장 작은 검증 계획을 정의합니다.",
      status: selectedExperiments.length > 0 ? `${selectedExperiments.length}개` : "대기",
    },
    {
      id: "orchestration",
      label: "실행 관리",
      description: "전략부터 출시까지 역할 실행을 추적합니다.",
      status: selectedRuns.length > 0 ? `${doneRunCount}/${selectedRuns.length}` : "대기",
    },
    {
      id: "artifacts",
      label: "기획서 만들기",
      description: "브리프, 리서치 노트, PRD, MVP 명세를 저장합니다.",
      status: selectedArtifactRecords.length > 0 ? `${selectedArtifactRecords.length}개` : "대기",
    },
    {
      id: "development",
      label: "제작 준비",
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
      label: "출시 판단",
      description: "출시 게이트 통과 상태를 확인합니다.",
      status: `${launchReadinessScore}%`,
    },
    {
      id: "learning",
      label: "성과 확인",
      description: "출시 후 행동 신호를 읽습니다.",
      status: selectedTelemetryEvents.length > 0 ? `${selectedTelemetryEvents.length}개` : "대기",
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
        <h2 className="text-xl font-semibold text-slate-950">후보 선택</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          아직 검토할 아이디어가 없습니다. 왼쪽 의사결정 흐름에서 아이디어를 먼저 접수하세요.
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
    void recordTelemetryEvent({
      eventName: "idea_updated",
      eventCategory: "scoring",
      idea: data,
      properties: {
        stage: data.stage,
        decision: data.decision,
        score: scoreState(toEditState(data)),
        regulatory_risk: data.regulatory_risk,
      },
    });
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
    void recordTelemetryEvent({
      eventName: "risk_created",
      eventCategory: "risk",
      properties: {
        severity: data.severity,
        status: data.status,
        area: data.area || "미정",
      },
    });
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
    void recordTelemetryEvent({
      eventName: "decision_recorded",
      eventCategory: "decision",
      idea: ideaResult.data,
      properties: {
        decision: decisionResult.data.decision,
        reason_length: decisionResult.data.reason.length,
      },
    });
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
    void recordTelemetryEvent({
      eventName: "experiment_created",
      eventCategory: "experiment",
      properties: {
        status: data.status,
        name_length: data.name.length,
        success_metric_length: data.success_metric.length,
      },
    });
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
    void recordTelemetryEvent({
      eventName: "run_created",
      eventCategory: "orchestration",
      properties: {
        phase: data.phase,
        status: data.status,
        owner_role: data.owner_role || "미정",
      },
    });
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
    void recordTelemetryEvent({
      eventName: "runbook_created",
      eventCategory: "orchestration",
      properties: {
        run_count: data?.length ?? 0,
        missing_phase_count: missingRuns.length,
      },
    });
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
    void recordTelemetryEvent({
      eventName: "experiment_status_updated",
      eventCategory: "experiment",
      properties: {
        status: data.status,
        previous_status: experiment.status,
      },
    });
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
    void recordTelemetryEvent({
      eventName: "run_status_updated",
      eventCategory: "orchestration",
      properties: {
        phase: data.phase,
        status: data.status,
        previous_status: run.status,
      },
    });
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
    void recordTelemetryEvent({
      eventName: "run_output_saved",
      eventCategory: "orchestration",
      properties: {
        phase: data.phase,
        output_length: data.output.length,
      },
    });
    setMessage(`${phaseLabels[run.phase]} 산출물을 저장했습니다.`);
    router.refresh();
  }

  async function saveArtifactDraft(artifactType: VentureArtifactType, title: string, body: string, source: string) {
    if (!supabase || !selectedIdea) {
      setMessage("먼저 아이디어를 선택하세요.");
      return false;
    }

    if (!user) {
      setMessage("산출물을 저장하려면 먼저 로그인하세요.");
      return false;
    }

    if (!body.trim()) {
      setMessage("저장할 산출물 본문이 비어 있습니다.");
      return false;
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
      return false;
    }

    setArtifacts((current) => [data, ...current]);
    emitVentureEvent("venture:artifact-created", data);
    void recordTelemetryEvent({
      eventName: "artifact_saved",
      eventCategory: source === "post_launch_learning" ? "learning" : source.includes("launch") ? "launch" : "artifact",
      properties: {
        artifact_type: data.artifact_type,
        source: data.source || "manual",
        version: data.version ?? 1,
        title_length: data.title.length,
        body_length: data.body.length,
      },
    });
    setMessage(`${artifactLabels[artifactType]} v${nextVersion}을 저장했습니다.`);
    router.refresh();
    return true;
  }

  async function saveDevelopmentPackageDrafts() {
    if (!supabase || !selectedIdea) {
      setMessage("먼저 아이디어를 선택하세요.");
      return;
    }

    if (!user) {
      setMessage("개발 패키지를 저장하려면 먼저 로그인하세요.");
      return;
    }

    const packageDrafts = developmentPackageDrafts.filter((draft) => draft.body.trim());

    if (packageDrafts.length === 0) {
      setMessage("저장할 개발 패키지 산출물이 없습니다.");
      return;
    }

    const versionOffsets = new Map<VentureArtifactType, number>();
    const rows = packageDrafts.map((draft) => {
      const previousVersion =
        Math.max(
          0,
          ...selectedArtifactRecords
            .filter((artifact) => artifact.artifact_type === draft.artifactType)
            .map((artifact) => artifact.version ?? 1),
        ) + (versionOffsets.get(draft.artifactType) ?? 0);

      versionOffsets.set(draft.artifactType, (versionOffsets.get(draft.artifactType) ?? 0) + 1);

      return {
        idea_id: selectedIdea.id,
        organization_id: selectedIdea.organization_id,
        artifact_type: draft.artifactType,
        status: "draft" as VentureArtifactStatus,
        version: previousVersion + 1,
        title: draft.title,
        body: draft.body,
        source: draft.source,
        status_note: "앱 개발 패키지로 일괄 생성한 초안입니다.",
      };
    });

    setIsBusy(true);
    setMessage(null);
    const { data, error } = await supabase.from("venture_artifacts").insert(rows).select();
    setIsBusy(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    const savedArtifacts = data ?? [];

    if (savedArtifacts.length === 0) {
      setMessage("개발 패키지를 저장하지 못했습니다.");
      return;
    }

    setArtifacts((current) => [...savedArtifacts, ...current]);
    savedArtifacts.forEach((artifact) => emitVentureEvent("venture:artifact-created", artifact));
    void recordTelemetryEvent({
      eventName: "artifact_package_saved",
      eventCategory: "development",
      properties: {
        artifact_count: savedArtifacts.length,
        source: "development_package",
      },
    });
    setMessage(`개발 패키지 산출물 ${savedArtifacts.length}개를 저장했습니다.`);
    router.refresh();
  }

  async function runAiExecutionAutopilot() {
    if (!supabase || !selectedIdea) {
      setMessage("먼저 아이디어를 선택하세요.");
      return;
    }

    if (!user) {
      setMessage("AI 실행 패키지를 만들려면 먼저 로그인하세요.");
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

    const existingArtifactTitles = new Set(
      selectedArtifactRecords.map((artifact) => artifact.title.trim().toLowerCase()),
    );
    const packageDrafts = developmentPackageDrafts.filter(
      (draft) => draft.body.trim() && !existingArtifactTitles.has(draft.title.trim().toLowerCase()),
    );
    const versionOffsets = new Map<VentureArtifactType, number>();
    const artifactRows = packageDrafts.map((draft) => {
      const previousVersion =
        Math.max(
          0,
          ...selectedArtifactRecords
            .filter((artifact) => artifact.artifact_type === draft.artifactType)
            .map((artifact) => artifact.version ?? 1),
        ) + (versionOffsets.get(draft.artifactType) ?? 0);

      versionOffsets.set(draft.artifactType, (versionOffsets.get(draft.artifactType) ?? 0) + 1);

      return {
        idea_id: selectedIdea.id,
        organization_id: selectedIdea.organization_id,
        artifact_type: draft.artifactType,
        status: "draft" as VentureArtifactStatus,
        version: previousVersion + 1,
        title: draft.title,
        body: draft.body,
        source: draft.source,
        status_note: "AI 실행 패키지에서 자동 생성한 초안입니다.",
      };
    });

    const existingTaskTitles = new Set(selectedImplementationTasks.map((task) => task.title.trim().toLowerCase()));
    const taskRows = implementationTaskDrafts
      .filter((task) => !existingTaskTitles.has(task.title.trim().toLowerCase()))
      .map((task, index) => ({
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
      }));

    if (missingRuns.length === 0 && artifactRows.length === 0 && taskRows.length === 0) {
      setMessage("이미 AI 실행 패키지에 필요한 문서와 태스크가 준비되어 있습니다.");
      return;
    }

    setIsBusy(true);
    setMessage(null);

    try {
      let insertedRuns: OrchestrationRun[] = [];
      let insertedArtifacts: VentureArtifact[] = [];
      let insertedTasks: ImplementationTask[] = [];

      if (missingRuns.length > 0) {
        const { data, error } = await supabase.from("orchestration_runs").insert(missingRuns).select();

        if (error) {
          throw new Error(error.message);
        }

        insertedRuns = data ?? [];
      }

      if (artifactRows.length > 0) {
        const { data, error } = await supabase.from("venture_artifacts").insert(artifactRows).select();

        if (error) {
          throw new Error(error.message);
        }

        insertedArtifacts = (data ?? []) as VentureArtifact[];
      }

      if (taskRows.length > 0) {
        const { data, error } = await supabase.from("implementation_tasks").insert(taskRows).select();

        if (error) {
          throw new Error(
            error.code === "42P01"
              ? "implementation_tasks 테이블이 아직 없습니다. 이번 배포의 Supabase SQL을 먼저 실행하세요."
              : error.message,
          );
        }

        insertedTasks = (data ?? []) as ImplementationTask[];
      }

      if (insertedRuns.length > 0) {
        setOrchestrationRuns((current) => [...insertedRuns, ...current]);
        setRunOutputs((current) => ({
          ...current,
          ...Object.fromEntries(insertedRuns.map((run) => [run.id, run.output])),
        }));
        emitVentureEvent("venture:runs-created", insertedRuns);
        void recordTelemetryEvent({
          eventName: "runbook_created",
          eventCategory: "orchestration",
          properties: {
            run_count: insertedRuns.length,
            missing_phase_count: insertedRuns.length,
          },
        });
      }

      if (insertedArtifacts.length > 0) {
        setArtifacts((current) => [...insertedArtifacts, ...current]);
        insertedArtifacts.forEach((artifact) => emitVentureEvent("venture:artifact-created", artifact));
        void recordTelemetryEvent({
          eventName: "artifact_package_saved",
          eventCategory: "development",
          properties: {
            artifact_count: insertedArtifacts.length,
            source: "ai_execution_package",
          },
        });
      }

      if (insertedTasks.length > 0) {
        setImplementationTasks((current) => [...current, ...insertedTasks]);
        emitVentureEvent("venture:tasks-created", insertedTasks);
        void recordTelemetryEvent({
          eventName: "implementation_tasks_created",
          eventCategory: "development",
          properties: {
            task_count: insertedTasks.length,
            source_artifact: implementationTaskSourceArtifact ? "yes" : "no",
          },
        });
      }

      setDevelopmentPanel(insertedTasks.length > 0 || selectedImplementationTasks.length > 0 ? "tasks" : "setup");
      setMessage(
        `AI 실행 패키지를 준비했습니다. 런북 ${insertedRuns.length}개 단계, 산출물 ${insertedArtifacts.length}개, 실행 할 일 ${insertedTasks.length}개를 만들었습니다.`,
      );
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "AI 실행 패키지를 만들지 못했습니다.");
    } finally {
      setIsBusy(false);
    }
  }

  async function saveEvidenceNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedIdea) {
      setMessage("먼저 아이디어를 선택하세요.");
      return;
    }

    if (!evidenceDraft.title.trim()) {
      setMessage("근거 제목은 필수입니다.");
      return;
    }

    if (!evidenceDraft.evidence.trim()) {
      setMessage("관찰한 근거를 입력하세요.");
      return;
    }

    const saved = await saveArtifactDraft(
      "research_note",
      `${selectedIdea.name} 근거 - ${evidenceDraft.title.trim()}`,
      evidenceNoteDraft,
      "evidence_capture",
    );

    if (saved) {
      setEvidenceDraft({
        title: "",
        source: "",
        evidence: "",
        implication: "",
        confidence: "medium",
      });
    }
  }

  async function saveExperimentResultNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedExperimentForResult) {
      setMessage("결과를 기록할 실험을 먼저 추가하세요.");
      return;
    }

    if (!experimentResultDraft.result.trim()) {
      setMessage("실험 결과를 입력하세요.");
      return;
    }

    if (!experimentResultDraft.learning.trim()) {
      setMessage("실험에서 배운 점을 입력하세요.");
      return;
    }

    const saved = await saveArtifactDraft(
      "research_note",
      `${selectedExperimentForResult.name} 실험 결과`,
      experimentResultNoteDraft,
      "experiment_result",
    );

    if (saved) {
      void recordTelemetryEvent({
        eventName: "experiment_result_saved",
        eventCategory: "experiment",
        properties: {
          experiment_id: selectedExperimentForResult.id,
          result_length: experimentResultDraft.result.length,
          learning_length: experimentResultDraft.learning.length,
          next_decision: experimentResultDraft.next_decision,
        },
      });
      setExperimentResultDraft({
        experiment_id: selectedExperimentForResult.id,
        result: "",
        learning: "",
        next_decision: "research_more",
        next_action: "",
      });
    }
  }

  function focusArtifactReviewItem(item: ArtifactReviewItem) {
    if (item.artifact) {
      setArtifactTypeFilter(item.artifactType);
      setArtifactStatusFilter("all");
      setArtifactSourceFilter("all");
      setArtifactPanel("library");
      updateActiveTask("artifacts");
      setMessage(`${item.label} 산출물을 라이브러리에서 확인하세요.`);
      return;
    }

    if (item.task === "development") {
      setDevelopmentPanel(item.developmentPanel ?? "setup");
      updateActiveTask("development");
      setMessage(`${item.label} 생성을 위해 개발 프로세스 화면으로 이동했습니다.`);
      return;
    }

    setArtifactPanel(item.panel ?? "product");
    updateActiveTask("artifacts");
    setMessage(`${item.label} 생성을 위해 ${artifactPanelLabels[item.panel ?? "product"]} 화면으로 이동했습니다.`);
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
    void recordTelemetryEvent({
      eventName: "artifact_status_updated",
      eventCategory: "artifact",
      properties: {
        artifact_type: data.artifact_type,
        status: data.status,
        version: data.version ?? 1,
      },
    });
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
    void recordTelemetryEvent({
      eventName: "implementation_tasks_created",
      eventCategory: "development",
      properties: {
        task_count: data?.length ?? 0,
        source_artifact: implementationTaskSourceArtifact ? "yes" : "no",
      },
    });
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
    void recordTelemetryEvent({
      eventName: "implementation_task_created",
      eventCategory: "development",
      properties: {
        task_type: data.task_type,
        priority: data.priority,
        owner_role: data.owner_role || "미정",
      },
    });
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
    void recordTelemetryEvent({
      eventName: "implementation_task_status_updated",
      eventCategory: "development",
      properties: {
        task_type: data.task_type,
        status: data.status,
        previous_status: task.status,
      },
    });
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
    void recordTelemetryEvent({
      eventName: "implementation_task_evidence_saved",
      eventCategory: "development",
      properties: {
        task_type: data.task_type,
        evidence_length: data.evidence.length,
        status: data.status,
      },
    });
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
    void recordTelemetryEvent({
      eventName: "risk_status_updated",
      eventCategory: "risk",
      properties: {
        severity: data.severity,
        status: data.status,
        previous_status: risk.status,
      },
    });
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

  function loadReleaseDecisionReason() {
    if (!releaseDecisionPacket || !editState) {
      return;
    }

    setEditState({ ...editState, decision: releaseDecisionPacket.recommendation });
    setDecisionReason(
      `${decisionLabels[releaseDecisionPacket.recommendation]}: ${releaseDecisionPacket.headline}

출시 판단 근거
${releaseDecisionPacket.greenSignals.map((item) => `- ${item}`).join("\n")}

남은 차단 항목
${releaseDecisionPacket.blockers.length > 0 ? releaseDecisionPacket.blockers.map((item) => `- ${item}`).join("\n") : "- 차단 항목 없음"}

다음 행동
${releaseDecisionPacket.requiredActions.map((item) => `- ${item}`).join("\n")}`,
    );
    updateActiveTask("decision");
    setMessage("출시 판단 패킷을 판단 근거 입력란에 채웠습니다. 최종 내용을 검토한 뒤 기록하세요.");
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

  function loadEvidenceCoachPrompt() {
    if (!validationEvidenceCoach) {
      return;
    }

    setEvidenceDraft({
      title: validationEvidenceCoach.nextFocus
        ? `${validationEvidenceCoach.nextFocus.label} 보강`
        : "검증 증거 보강",
      source: "인터뷰/관찰/외부 자료",
      evidence: validationEvidenceCoach.prompt,
      implication:
        validationEvidenceCoach.nextFocus?.action ??
        "현재 증거를 최종 진행, 추가 조사, 전환, 중단 판단에 연결합니다.",
      confidence: "medium",
    });
    setArtifactPanel("validation");
    updateActiveTask("artifacts");
    setMessage("검증 증거 코치 프롬프트를 근거 직접 기록 폼에 채웠습니다.");
  }

  return (
    <section className={showSidebar ? "grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)]" : "grid gap-6"}>
      {showSidebar ? (
      <aside className="grid gap-4 lg:sticky lg:top-6 lg:self-start">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">후보 선택</h2>
            <p className="mt-1 text-sm text-slate-500">오늘 검토할 아이디어를 고르고 평가, 위험, 실험, 판단 순서로 이동시킵니다.</p>
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
        {!showSidebar ? (
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-sm font-semibold text-slate-950">AI 자동 실행 보기</div>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  기본은 간단 보기입니다. AI가 만든 초안과 다음 액션만 먼저 보고, 필요할 때만 상세 실행 패널을 펼치세요.
                </p>
              </div>
              <div className="inline-flex rounded-lg bg-slate-100 p-1">
                {[
                  ["guided", "간단 보기"],
                  ["full", "전체 보기"],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setExperienceMode(value as "guided" | "full")}
                    className={`rounded-md px-3 py-2 text-sm font-semibold transition ${
                      experienceMode === value ? "bg-white text-slate-950 shadow-sm" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : null}
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
                  : "직접 만든 아이디어가 아니면 읽기 전용입니다. 새 아이디어를 만들면 바로 평가할 수 있습니다."}
              </p>
            </div>
            {canEdit ? (
              <button
                type="button"
                onClick={() => void deleteIdeaRecord(selectedIdea)}
                disabled={isBusy}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-rose-200 bg-white px-4 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Trash2 size={18} />
                아이디어 삭제
              </button>
            ) : null}
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

              {validationEvidenceCoach ? (
                <div className="mt-4 rounded-md border border-blue-200 bg-white p-3">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">
                        검증 증거 코치
                      </div>
                      <h4 className="mt-1 text-base font-semibold text-slate-950">{validationEvidenceCoach.label}</h4>
                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        {validationEvidenceCoach.nextFocus
                          ? `다음 보강: ${validationEvidenceCoach.nextFocus.label} - ${validationEvidenceCoach.nextFocus.action}`
                          : "핵심 증거가 충분합니다. 실험 결과와 최종 판단을 정리하세요."}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <div className="rounded-md bg-blue-950 px-3 py-2 text-right text-white">
                        <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-blue-200">증거</div>
                        <div className="text-2xl font-semibold">{validationEvidenceCoach.score}%</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
                    {validationEvidenceCoach.checks.map((check) => (
                      <div
                        key={check.label}
                        className={`rounded-md border px-3 py-2 ${
                          check.passed ? "border-emerald-100 bg-emerald-50" : "border-amber-100 bg-amber-50"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`h-2 w-2 rounded-full ${check.passed ? "bg-emerald-500" : "bg-amber-500"}`} />
                          <span className="text-xs font-semibold text-slate-950">{check.label}</span>
                        </div>
                        <p className="mt-1 text-xs leading-5 text-slate-600">{check.detail}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => copyDraft(validationEvidenceCoach.prompt, "검증 증거 수집 프롬프트")}
                      className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-blue-200 bg-white px-3 text-xs font-semibold text-blue-800 transition hover:bg-blue-50"
                    >
                      <Clipboard size={15} />
                      프롬프트 복사
                    </button>
                    <button
                      type="button"
                      onClick={loadEvidenceCoachPrompt}
                      className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-blue-600 px-3 text-xs font-semibold text-white transition hover:bg-blue-700"
                    >
                      <Save size={15} />
                      근거 폼 채우기
                    </button>
                  </div>
                </div>
              ) : null}

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
              <h2 className="text-lg font-semibold text-slate-950">제작 준비 프로세스</h2>
              <p className="mt-1 text-sm text-slate-500">
                검증된 아이디어를 실제 앱 제작으로 넘기기 전에 기획, 디자인, 개발, QA, 보안, 배포 조건을 정리합니다.
              </p>
            </div>
            <Code2 className="text-blue-600" size={22} />
          </div>

          {experienceMode === "full" ? (
            <div className="mb-5 rounded-lg bg-slate-100 p-1">
              <div className="grid gap-1 sm:grid-cols-3">
                {(Object.keys(developmentPanelLabels) as DevelopmentPanel[]).map((panel) => (
                  <button
                    key={panel}
                    type="button"
                    onClick={() => setDevelopmentPanel(panel)}
                    className={`rounded-md px-3 py-2 text-sm font-semibold transition ${
                      visibleDevelopmentPanel === panel
                        ? "bg-white text-slate-950 shadow-sm"
                        : "text-slate-600 hover:bg-white/70 hover:text-slate-900"
                    }`}
                  >
                    {developmentPanelLabels[panel]}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mb-5 rounded-lg border border-emerald-100 bg-emerald-50 p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
                    AI execution autopilot
                  </div>
                  <h3 className="mt-1 text-base font-semibold text-emerald-950">
                    {guidedExecutionStepLabels[guidedExecutionStep]}
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-emerald-900">
                    {guidedExecutionStepDescriptions[guidedExecutionStep]}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {guidedExecutionStep === "package" ? (
                    <button
                      type="button"
                      onClick={runAiExecutionAutopilot}
                      disabled={isBusy || !user}
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-emerald-700 px-4 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Layers3 size={18} />
                      AI 실행 패키지 만들기
                    </button>
                  ) : guidedExecutionStep === "execute" ? (
                    <button
                      type="button"
                      onClick={() =>
                        nextImplementationTask
                          ? copyDraft(implementationTaskTicketDraft, "다음 실행 티켓")
                          : copyDraft(implementationBacklogDraft, "열린 개발 백로그")
                      }
                      disabled={Boolean(nextImplementationTask) ? !implementationTaskTicketDraft : !implementationBacklogDraft}
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-emerald-700 px-4 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <ClipboardList size={18} />
                      {nextImplementationTask ? "다음 실행 티켓 복사" : "열린 실행 요약 복사"}
                    </button>
                  ) : (
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
                      disabled={isBusy || !user || !developmentCompletionReportDraft}
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-emerald-700 px-4 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Save size={18} />
                      개발 완료 보고서 저장
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-4 grid gap-3 lg:grid-cols-3">
                {guidedExecutionProgress.map((step, index) => (
                  <div
                    key={step.id}
                    className={`rounded-lg border p-3 ${
                      step.active
                        ? "border-emerald-300 bg-white"
                        : step.done
                          ? "border-emerald-100 bg-white/90"
                          : "border-white/60 bg-white/60"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                          step.active || step.done ? "bg-emerald-700 text-white" : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {index + 1}
                      </span>
                      <div className="text-sm font-semibold text-slate-950">{step.label}</div>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{step.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          <p className="mb-5 text-sm leading-6 text-slate-600">{developmentPanelDescriptions[visibleDevelopmentPanel]}</p>

          {experienceMode === "guided" ? (
            <div className="mb-5 rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-blue-900">
              이 단계에서는 AI가 기획, 디자인, 개발 초안과 실행 패키지를 자동으로 만듭니다. 우선은 준비도, 디자인 프롬프트,
              개발 런북만 확인하고 저장하세요. 백엔드 비교, 앱 블루프린트, 스캐폴드 문서는 필요할 때만 전체 보기에서 확인하면 됩니다.
            </div>
          ) : null}

          <div className={visibleDevelopmentPanel === "setup" ? "" : "hidden"}>
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

          <div className="mt-5 grid gap-4 xl:grid-cols-2">
            <GateChecklistPanel
              eyebrow="design gate"
              title="디자인 준비도"
              description="화면을 그리기 전에 사용자 여정, MVP 범위, 데이터 경계, 상태 설계가 준비됐는지 확인합니다."
              score={designReadinessScore}
              checks={designReadinessChecks}
            />
            <GateChecklistPanel
              eyebrow="build gate"
              title="개발 착수 준비도"
              description="코드 작업을 시작하기 전에 승인된 기획/디자인/기술 입력과 리스크 상태를 확인합니다."
              score={buildReadinessScore}
              checks={buildReadinessChecks}
            />
          </div>

          <div className="mt-5 rounded-lg border border-blue-100 bg-blue-50 p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">design generation</div>
                <h3 className="mt-1 text-base font-semibold text-blue-950">디자인 생성 프롬프트</h3>
                <p className="mt-1 text-sm leading-6 text-blue-900">
                  Stitch, v0, Figma용 AI 디자인 도구에 바로 넣을 수 있도록 화면, 상태, 모바일, 권한, 데이터 경계를
                  하나의 프롬프트로 묶습니다.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => copyDraft(designGenerationPromptDraft, "디자인 생성 프롬프트")}
                  disabled={!designGenerationPromptDraft}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-blue-950 px-3 text-sm font-semibold text-white transition hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Clipboard size={16} />
                  프롬프트 복사
                </button>
                <button
                  type="button"
                  onClick={() =>
                    saveArtifactDraft(
                      "design_brief",
                      `${selectedIdea.name} 디자인 생성 프롬프트`,
                      designGenerationPromptDraft,
                      "design_generation_prompt",
                    )
                  }
                  disabled={isBusy || !user || !designGenerationPromptDraft}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-blue-200 bg-white px-3 text-sm font-semibold text-blue-900 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Save size={16} />
                  프롬프트 저장
                </button>
              </div>
            </div>
            <textarea
              value={designGenerationPromptDraft}
              readOnly
              rows={8}
              className="mt-4 w-full resize-y rounded-md border border-blue-200 bg-white px-3 py-2 font-mono text-sm leading-6 text-slate-700 outline-none"
            />
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
            <button
              type="button"
              onClick={saveDevelopmentPackageDrafts}
              disabled={isBusy || !user}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ClipboardList size={18} />
              개발 패키지 저장
            </button>
          </div>

          {experienceMode === "full" ? (
          <>
          <div className="mt-5 rounded-lg border border-indigo-100 bg-indigo-50 p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.14em] text-indigo-700">backend choice</div>
                <h3 className="mt-1 text-base font-semibold text-indigo-950">백엔드 선택 스코어카드</h3>
                <p className="mt-1 text-sm leading-6 text-indigo-900">
                  아이디어 문맥, 실험, 리스크를 바탕으로 Supabase, Firebase, SQL Connect, Hybrid 적합도를 비교합니다.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => copyDraft(backendDecisionDraft, "백엔드 결정")}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-indigo-200 bg-white px-3 text-sm font-semibold text-indigo-800 transition hover:bg-indigo-100"
                >
                  <Clipboard size={16} />
                  결정 복사
                </button>
                <button
                  type="button"
                  onClick={() =>
                    saveArtifactDraft("backend_decision", `${selectedIdea.name} 백엔드 결정`, backendDecisionDraft, "development_process")
                  }
                  disabled={isBusy || !user}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-indigo-700 px-3 text-sm font-semibold text-white transition hover:bg-indigo-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Save size={16} />
                  결정 저장
                </button>
              </div>
            </div>

            <div className="mt-4 grid gap-3 xl:grid-cols-4">
              {backendCandidateScores.map((candidate, index) => (
                <div key={candidate.key} className="rounded-lg border border-indigo-100 bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-slate-950">{candidate.label}</div>
                      <div className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-indigo-600">
                        {index === 0 ? "현재 1순위" : "비교 후보"}
                      </div>
                    </div>
                    <div className="text-2xl font-semibold text-indigo-950">{candidate.score}</div>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-slate-100">
                    <div className="h-2 rounded-full bg-indigo-600" style={{ width: `${candidate.score}%` }} />
                  </div>
                  <p className="mt-3 min-h-16 text-sm leading-6 text-slate-600">{candidate.summary}</p>
                  <div className="mt-3 grid gap-2 text-xs leading-5">
                    <div className="rounded-md bg-emerald-50 px-2.5 py-2 text-emerald-900">{candidate.strengths[0]}</div>
                    <div className="rounded-md bg-amber-50 px-2.5 py-2 text-amber-900">{candidate.cautions[0]}</div>
                  </div>
                </div>
              ))}
            </div>

            {backendExecutionPlan ? (
              <div className="mt-4 rounded-lg border border-indigo-200 bg-white p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.14em] text-indigo-600">
                      execution checklist
                    </div>
                    <h4 className="mt-1 text-base font-semibold text-slate-950">백엔드 실행 체크리스트</h4>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      현재 권장안은 {backendExecutionPlan.backend.label}입니다. 개발 착수 전에 환경변수, 권한 규칙,
                      허용/차단 검증, 운영 롤백 기준을 같은 산출물로 남깁니다.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => copyDraft(backendExecutionPlanDraft, "백엔드 실행 체크리스트")}
                      disabled={!backendExecutionPlanDraft}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-indigo-200 bg-white px-3 text-sm font-semibold text-indigo-800 transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Clipboard size={16} />
                      체크리스트 복사
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        saveArtifactDraft(
                          "backend_decision",
                          `${selectedIdea.name} 백엔드 실행 체크리스트`,
                          backendExecutionPlanDraft,
                          "backend_execution_checklist",
                        )
                      }
                      disabled={isBusy || !user || !backendExecutionPlanDraft}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-slate-950 px-3 text-sm font-semibold text-white transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Save size={16} />
                      체크리스트 저장
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_1.4fr]">
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <div className="text-sm font-semibold text-slate-950">필수 환경변수</div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {backendExecutionPlan.envVars.map((envVar) => (
                        <span
                          key={envVar}
                          className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 font-mono text-xs font-semibold text-slate-700"
                        >
                          {envVar}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <div className="text-sm font-semibold text-slate-950">검증 체크</div>
                    <div className="mt-3 grid gap-2">
                      {backendExecutionPlan.checks.map((check) => (
                        <div key={check.label} className="rounded-md border border-slate-200 bg-white p-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded-full px-2 py-1 text-xs font-semibold ${
                                check.tone === "required"
                                  ? "bg-rose-50 text-rose-700"
                                  : "bg-blue-50 text-blue-700"
                              }`}
                            >
                              {check.tone === "required" ? "필수" : "권장"}
                            </span>
                            <span className="text-sm font-semibold text-slate-950">{check.label}</span>
                          </div>
                          <p className="mt-2 text-sm leading-6 text-slate-600">{check.detail}</p>
                          <p className="mt-1 text-xs leading-5 text-slate-500">증거: {check.evidence}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-3 grid gap-3 lg:grid-cols-3">
                  {[
                    ["로컬 검증", backendExecutionPlan.localCommand],
                    ["프로덕션 게이트", backendExecutionPlan.productionGate],
                    ["롤백 기준", backendExecutionPlan.rollback],
                  ].map(([label, detail]) => (
                    <div key={label} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                      <div className="text-sm font-semibold text-slate-950">{label}</div>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div className="mt-5 rounded-lg border border-emerald-100 bg-emerald-50 p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">app blueprint</div>
                <h3 className="mt-1 text-base font-semibold text-emerald-950">앱 블루프린트</h3>
                <p className="mt-1 text-sm leading-6 text-emerald-900">
                  PRD, MVP, 디자인, 백엔드 선택을 실제 라우트, 컴포넌트, 데이터 모델, API, 권한, 수용 테스트로
                  번역합니다.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => copyDraft(appBlueprintDraft, "앱 블루프린트")}
                  disabled={!appBlueprintDraft}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-emerald-950 px-3 text-sm font-semibold text-white transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Clipboard size={16} />
                  블루프린트 복사
                </button>
                <button
                  type="button"
                  onClick={() =>
                    saveArtifactDraft("tech_spec", `${selectedIdea.name} 앱 블루프린트`, appBlueprintDraft, "app_blueprint")
                  }
                  disabled={isBusy || !user || !appBlueprintDraft}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-emerald-200 bg-white px-3 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Save size={16} />
                  블루프린트 저장
                </button>
              </div>
            </div>
            <div className="mt-4 grid gap-3 lg:grid-cols-3">
              {[
                ["라우트/화면", "대시보드, 새 기록, 상세, 산출물, 설정 화면을 구현 단위로 나눕니다."],
                ["데이터/API", "워크스페이스, 기록, 근거, 리스크, 산출물, 이벤트 로그 계약을 정의합니다."],
                ["테스트/배포", "권한, 빈 상태, 저장 실패, 모바일, Production 스모크 기준을 포함합니다."],
              ].map(([label, detail]) => (
                <div key={label} className="rounded-lg border border-emerald-100 bg-white p-3">
                  <div className="text-sm font-semibold text-emerald-950">{label}</div>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{detail}</p>
                </div>
              ))}
            </div>
            <textarea
              value={appBlueprintDraft}
              readOnly
              rows={9}
              className="mt-4 w-full resize-y rounded-md border border-emerald-200 bg-white px-3 py-2 font-mono text-sm leading-6 text-slate-700 outline-none"
            />
          </div>

          <div className="mt-5 rounded-lg border border-cyan-100 bg-cyan-50 p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-700">scaffold manifest</div>
                <h3 className="mt-1 text-base font-semibold text-cyan-950">MVP 스캐폴드 매니페스트</h3>
                <p className="mt-1 text-sm leading-6 text-cyan-900">
                  개발자가 바로 저장소를 만들 수 있도록 파일 트리, 라우트 책임, 환경변수, 백엔드 규칙, 검증 명령을
                  한 문서로 정리합니다.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => copyDraft(scaffoldManifestDraft, "MVP 스캐폴드 매니페스트")}
                  disabled={!scaffoldManifestDraft}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-cyan-950 px-3 text-sm font-semibold text-white transition hover:bg-cyan-900 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Clipboard size={16} />
                  매니페스트 복사
                </button>
                <button
                  type="button"
                  onClick={() =>
                    saveArtifactDraft(
                      "dev_runbook",
                      `${selectedIdea.name} MVP 스캐폴드 매니페스트`,
                      scaffoldManifestDraft,
                      "scaffold_manifest",
                    )
                  }
                  disabled={isBusy || !user || !scaffoldManifestDraft}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-cyan-200 bg-white px-3 text-sm font-semibold text-cyan-900 transition hover:bg-cyan-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Save size={16} />
                  매니페스트 저장
                </button>
              </div>
            </div>
            <div className="mt-4 grid gap-3 lg:grid-cols-4">
              {[
                ["파일 트리", "app, components, lib, scripts, docs 기준 시작 구조"],
                ["환경변수", "클라이언트 공개 키와 서버 전용 비밀값 경계"],
                ["백엔드 규칙", "Supabase RLS 또는 Firebase Rules 시작점"],
                ["검증 명령", "lint, typecheck, build, Preview/Production smoke"],
              ].map(([label, detail]) => (
                <div key={label} className="rounded-lg border border-cyan-100 bg-white p-3">
                  <div className="text-sm font-semibold text-cyan-950">{label}</div>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{detail}</p>
                </div>
              ))}
            </div>
            <textarea
              value={scaffoldManifestDraft}
              readOnly
              rows={9}
              className="mt-4 w-full resize-y rounded-md border border-cyan-200 bg-white px-3 py-2 font-mono text-sm leading-6 text-slate-700 outline-none"
            />
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
          </>
          ) : null}
          </div>

          <div
            className={`mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4 ${
              visibleDevelopmentPanel === "tasks" ? "" : "hidden"
            }`}
          >
            <div className="mb-4 rounded-lg border border-indigo-100 bg-indigo-50 p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.14em] text-indigo-700">
                    kickoff guardrail
                  </div>
                  <h3 className="mt-1 text-base font-semibold text-indigo-950">개발 킥오프 브리프</h3>
                  <p className="mt-1 text-sm leading-6 text-indigo-900">
                    구현 태스크를 만들기 전에 범위, 금지 범위, 차단 항목, 완료 증거를 한 문서로 잠급니다.
                  </p>
                  <div
                    className={`mt-3 rounded-md border px-3 py-2 text-sm leading-6 ${
                      nextBuildBlocker
                        ? "border-amber-200 bg-amber-50 text-amber-950"
                        : "border-emerald-200 bg-emerald-50 text-emerald-950"
                    }`}
                  >
                    {nextBuildBlocker ? (
                      <>
                        <span className="font-semibold">다음 차단 항목: {nextBuildBlocker.label}</span>
                        <span className="block">{nextBuildBlocker.detail}</span>
                      </>
                    ) : (
                      <>
                        <span className="font-semibold">개발 착수 입력이 잠겼습니다.</span>
                        <span className="block">기본 태스크를 생성하고 가장 작은 Slice 1 구현부터 진행하세요.</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
                  <div className="rounded-lg bg-indigo-950 px-4 py-3 text-right text-white">
                    <div className="text-xs font-semibold uppercase tracking-[0.14em] text-indigo-200">
                      준비 {passedBuildReadinessCount}/{buildReadinessChecks.length}
                    </div>
                    <div className="mt-1 text-3xl font-semibold">{buildReadinessScore}%</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyDraft(developmentKickoffDraft, "개발 킥오프 브리프")}
                    disabled={!developmentKickoffDraft}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-indigo-950 px-3 text-sm font-semibold text-white transition hover:bg-indigo-900 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Clipboard size={16} />
                    브리프 복사
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      saveArtifactDraft(
                        "dev_runbook",
                        `${selectedIdea.name} 개발 킥오프 브리프`,
                        developmentKickoffDraft,
                        "development_kickoff",
                      )
                    }
                    disabled={isBusy || !user || !developmentKickoffDraft}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-indigo-200 bg-white px-3 text-sm font-semibold text-indigo-900 transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Save size={16} />
                    브리프 저장
                  </button>
                </div>
              </div>
            </div>

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

            {experienceMode === "full" ? (
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
            ) : null}

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
                              : nextImplementationDependencyStatus && !nextImplementationDependencyStatus.ready
                                ? "선행 조건에 막혀 있습니다. 아래 실행 순서 게이트에서 먼저 완료할 태스크를 확인하세요."
                                : "바로 시작하기 좋은 다음 태스크입니다. 진행 시작 후 증거를 남기세요."}
                        </p>
                        {nextImplementationDependencyStatus?.blockers.length ? (
                          <div className="mt-2 rounded-md bg-white px-3 py-2 text-xs font-semibold leading-5 text-blue-900">
                            선행 조건: {nextImplementationDependencyStatus.blockers.join(", ")}
                          </div>
                        ) : null}
                        <div className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">
                          {nextImplementationTask.owner_role || "owner 미정"}
                        </div>
                      </>
                    ) : (
                      <p className="mt-2 text-sm leading-6 text-blue-900">
                        열린 실행 할 일이 없습니다. 개발 완료 게이트와 출시 판단을 확인하세요.
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
                      열린 백로그
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            {experienceMode === "guided" && selectedImplementationTasks.length > 0 ? (
              <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-950">AI가 정리한 실행 순서</h4>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      아래 열린 할 일만 위에서부터 처리하면 됩니다. 자세한 보드와 수동 태스크 관리는 전체 보기에서만 엽니다.
                    </p>
                  </div>
                  <span className="rounded-md bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700">
                    열린 할 일 {selectedOpenImplementationTasks.length}개
                  </span>
                </div>
                <div className="mt-3 grid gap-2">
                  {selectedOpenImplementationTasks.slice(0, 5).map((task, index) => (
                    <div key={task.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-semibold text-slate-700 shadow-sm">
                          {index + 1}
                        </span>
                        <span className="text-sm font-semibold text-slate-950">{task.title}</span>
                        <span className={`rounded-md px-2 py-1 text-xs font-semibold ${implementationTaskStatusTone[task.status]}`}>
                          {implementationTaskStatusLabels[task.status]}
                        </span>
                        <span className={`rounded-md px-2 py-1 text-xs font-semibold ${implementationTaskPriorityTone[task.priority]}`}>
                          {implementationTaskPriorityLabels[task.priority]}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{task.acceptance_criteria}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {experienceMode === "full" && implementationDependencyStatuses.length > 0 ? (
              <div className="mt-4 rounded-lg border border-violet-100 bg-violet-50 p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.14em] text-violet-700">
                      execution order
                    </div>
                    <h4 className="mt-1 text-sm font-semibold text-violet-950">개발 실행 순서 게이트</h4>
                    <p className="mt-1 text-sm leading-6 text-violet-900">
                      태스크를 기획, 디자인, 데이터, 백엔드, 프론트, QA, 보안, 배포 순서로 정렬하고 선행 조건을 통과한
                      작업만 다음 실행 후보로 올립니다.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-md bg-white px-3 py-2 text-xs font-semibold text-violet-900 shadow-sm">
                      시작 가능 {readyImplementationDependencyStatuses.length}개
                    </span>
                    <span className="rounded-md bg-white px-3 py-2 text-xs font-semibold text-violet-900 shadow-sm">
                      대기 {waitingImplementationDependencyStatuses.length}개
                    </span>
                    <button
                      type="button"
                      onClick={() => copyDraft(implementationDependencyPlanDraft, "개발 실행 순서 게이트")}
                      disabled={!implementationDependencyPlanDraft}
                      className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-violet-200 bg-white px-3 text-xs font-semibold text-violet-800 transition hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Clipboard size={15} />
                      순서 복사
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        saveArtifactDraft(
                          "dev_runbook",
                          `${selectedIdea.name} 개발 실행 순서 게이트`,
                          implementationDependencyPlanDraft,
                          "implementation_dependency_plan",
                        )
                      }
                      disabled={isBusy || !user || !implementationDependencyPlanDraft}
                      className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-violet-950 px-3 text-xs font-semibold text-white transition hover:bg-violet-900 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Save size={15} />
                      순서 저장
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 lg:grid-cols-8">
                  {implementationTaskExecutionOrder.map((taskType, index) => {
                    const doneCount = selectedImplementationTasks.filter(
                      (task) => task.task_type === taskType && task.status === "done",
                    ).length;
                    const totalCount = selectedImplementationTasks.filter((task) => task.task_type === taskType).length;

                    return (
                      <div key={taskType} className="rounded-lg border border-violet-100 bg-white p-3">
                        <div className="text-xs font-semibold uppercase tracking-[0.12em] text-violet-600">
                          {String(index + 1).padStart(2, "0")}
                        </div>
                        <div className="mt-1 text-sm font-semibold text-slate-950">
                          {implementationTaskTypeLabels[taskType]}
                        </div>
                        <div className="mt-2 text-xs font-semibold text-slate-500">
                          {doneCount}/{totalCount} 완료
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 grid gap-3 lg:grid-cols-2">
                  <div className="rounded-lg border border-violet-100 bg-white p-3">
                    <div className="text-sm font-semibold text-violet-950">바로 시작 가능</div>
                    <div className="mt-3 grid gap-2">
                      {readyImplementationDependencyStatuses.slice(0, 4).map((status) => (
                        <div key={status.task.id} className="rounded-md bg-violet-50 px-3 py-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-semibold text-slate-950">{status.task.title}</span>
                            <span className="rounded-md bg-white px-2 py-1 text-xs font-semibold text-violet-800">
                              {implementationTaskTypeLabels[status.task.task_type]}
                            </span>
                          </div>
                          <p className="mt-1 text-xs leading-5 text-slate-600">{status.nextAction}</p>
                        </div>
                      ))}
                      {readyImplementationDependencyStatuses.length === 0 ? (
                        <div className="rounded-md border border-dashed border-violet-200 bg-violet-50 px-3 py-2 text-sm leading-6 text-violet-900">
                          먼저 선행 조건을 완료해야 시작 가능한 태스크가 생깁니다.
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div className="rounded-lg border border-violet-100 bg-white p-3">
                    <div className="text-sm font-semibold text-violet-950">선행 조건 대기</div>
                    <div className="mt-3 grid gap-2">
                      {waitingImplementationDependencyStatuses.slice(0, 4).map((status) => (
                        <div key={status.task.id} className="rounded-md bg-slate-50 px-3 py-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-semibold text-slate-950">{status.task.title}</span>
                            <span className="rounded-md bg-white px-2 py-1 text-xs font-semibold text-slate-700">
                              {implementationTaskTypeLabels[status.task.task_type]}
                            </span>
                          </div>
                          <p className="mt-1 text-xs leading-5 text-slate-600">{status.blockers.join(", ")}</p>
                        </div>
                      ))}
                      {waitingImplementationDependencyStatuses.length === 0 ? (
                        <div className="rounded-md border border-dashed border-violet-200 bg-violet-50 px-3 py-2 text-sm leading-6 text-violet-900">
                          선행 조건에 막힌 열린 태스크가 없습니다.
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-slate-950">구현 실행 패키지</h4>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    승인된 산출물, 현재 필터의 개발 태스크, 남은 게이트, 검증 명령을 한 번에 묶어 구현 에이전트에게 넘깁니다.
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                      태스크 {agentRunPackageTasks.length}개
                    </span>
                    <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                      승인 산출물 {selectedArtifactRecords.filter((artifact) => artifact.status === "approved").length}개
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => copyDraft(agentRunPackageDraft, "구현 실행 패키지")}
                    disabled={!agentRunPackageDraft}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-slate-950 px-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Clipboard size={16} />
                    패키지 복사
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      saveArtifactDraft(
                        "dev_runbook",
                        `${selectedIdea.name} 구현 실행 패키지`,
                        agentRunPackageDraft,
                        "agent_run_package",
                      )
                    }
                    disabled={isBusy || !user || !agentRunPackageDraft}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Save size={16} />
                    패키지 저장
                  </button>
                </div>
              </div>
            </div>

            {experienceMode === "full" && blockedImplementationSummaries.length > 0 ? (
              <div className="mt-4 rounded-lg border border-rose-100 bg-rose-50 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-rose-950">차단 해소 큐</h4>
                    <p className="mt-1 text-sm leading-6 text-rose-900">
                      막힌 태스크는 담당 역할, 다음 액션, 해소 증거를 먼저 정리한 뒤 진행 상태로 되돌립니다.
                    </p>
                  </div>
                  <div className="rounded-md bg-white px-3 py-2 text-xs font-semibold text-rose-900 shadow-sm">
                    차단 {blockedImplementationSummaries.length}개
                  </div>
                </div>

                <div className="mt-3 grid gap-2 lg:grid-cols-2">
                  {blockedImplementationSummaries.slice(0, 4).map((summary) => (
                    <div key={summary.task.id} className="rounded-md border border-rose-100 bg-white px-3 py-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-slate-950">{summary.task.title}</span>
                        <span className="rounded-md bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-800">
                          {implementationTaskPriorityLabels[summary.task.priority]}
                        </span>
                        <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                          담당 {summary.hint.ownerRole}
                        </span>
                      </div>
                      <div className="mt-2 grid gap-2 text-xs leading-5 text-slate-700">
                        <p>
                          <span className="font-semibold text-slate-950">다음 액션:</span> {summary.hint.nextAction}
                        </p>
                        <p>
                          <span className="font-semibold text-slate-950">해소 증거:</span> {summary.hint.unblockEvidence}
                        </p>
                        <p>
                          <span className="font-semibold text-slate-950">에스컬레이션:</span> {summary.hint.escalation}
                        </p>
                      </div>
                      {summary.missing.length > 0 ? (
                        <div className="mt-2 rounded-md bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-800">
                          추가 증거 필요: {summary.missing.join(", ")}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {experienceMode === "full" && implementationEvidenceSummaries.length > 0 ? (
              <div className="mt-4 rounded-lg border border-amber-100 bg-amber-50 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-amber-950">증거 보강 우선순위</h4>
                    <p className="mt-1 text-sm leading-6 text-amber-900">
                      완료 전에 커밋, 검증, 권한, 배포, 롤백 증거가 약한 태스크부터 보강합니다.
                    </p>
                  </div>
                  <div className="rounded-md bg-white px-3 py-2 text-xs font-semibold text-amber-900 shadow-sm">
                    보강 필요 {implementationEvidenceIssues.length}/{implementationEvidenceSummaries.length}
                  </div>
                </div>

                <div className="mt-3 grid gap-2 lg:grid-cols-2">
                  {implementationEvidenceIssues.length > 0 ? (
                    implementationEvidenceIssues.slice(0, 4).map((summary) => (
                      <div key={summary.task.id} className="rounded-md border border-amber-100 bg-white px-3 py-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold text-slate-950">{summary.task.title}</span>
                          <span className="rounded-md bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-800">
                            {summary.passedCount}/{summary.totalCount}
                          </span>
                          <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                            {implementationTaskTypeLabels[summary.task.task_type]}
                          </span>
                        </div>
                        <p className="mt-1 text-xs leading-5 text-slate-600">보강 필요: {summary.missing.join(", ")}</p>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-md border border-emerald-100 bg-white px-3 py-2 text-sm text-emerald-800">
                      현재 모든 태스크의 증거 힌트가 충족되어 있습니다.
                    </div>
                  )}
                </div>
              </div>
            ) : null}

            {experienceMode === "full" && selectedImplementationTasks.length > 0 ? (
              <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-950">태스크 필터</h4>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      상태, 담당 역할, 증거 품질을 좁혀서 현재 처리할 카드만 봅니다.
                    </p>
                  </div>
                  <div className="rounded-md bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700">
                    표시 {filteredImplementationTasks.length}/{selectedImplementationTasks.length}
                  </div>
                </div>
                <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_1fr_1fr_auto_auto_auto_auto]">
                  <SelectField
                    label="상태"
                    value={implementationStatusFilter}
                    options={implementationStatusFilterOptions}
                    labels={implementationStatusFilterLabels}
                    onChange={setImplementationStatusFilter}
                  />
                  <SelectField
                    label="담당"
                    value={activeImplementationOwnerFilter}
                    options={implementationOwnerOptions}
                    labels={implementationOwnerFilterLabels}
                    onChange={setImplementationOwnerFilter}
                  />
                  <SelectField
                    label="증거"
                    value={implementationEvidenceFilter}
                    options={implementationEvidenceFilterOptions}
                    labels={implementationEvidenceFilterLabels}
                    onChange={setImplementationEvidenceFilter}
                  />
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => {
                        setImplementationStatusFilter("all");
                        setImplementationOwnerFilter("all");
                        setImplementationEvidenceFilter("all");
                      }}
                      className="inline-flex h-11 w-full items-center justify-center rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 lg:w-auto"
                    >
                      초기화
                    </button>
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => copyDraft(filteredImplementationBacklogDraft, "필터된 개발 백로그")}
                      className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-slate-950 px-3 text-sm font-semibold text-white transition hover:bg-slate-800 lg:w-auto"
                    >
                      <ClipboardList size={15} />
                      필터 복사
                    </button>
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => copyDraft(filteredImplementationRunPromptDraft, "필터된 구현 실행 프롬프트")}
                      className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md border border-blue-200 bg-white px-3 text-sm font-semibold text-blue-800 transition hover:bg-blue-50 lg:w-auto"
                    >
                      <Code2 size={15} />
                      실행 프롬프트
                    </button>
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => {
                        if (!selectedIdea) {
                          return;
                        }

                        saveArtifactDraft(
                          "dev_runbook",
                          `${selectedIdea.name} 필터된 구현 실행 프롬프트`,
                          filteredImplementationRunPromptDraft,
                          "filtered_implementation_run",
                        );
                      }}
                      disabled={isBusy || !user || !selectedIdea}
                      className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 lg:w-auto"
                    >
                      <Save size={15} />
                      저장
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            {experienceMode === "full" && selectedImplementationTasks.length > 0 && filteredImplementationTasks.length === 0 ? (
              <div className="mt-4 rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                현재 필터 조건에 맞는 태스크가 없습니다. 필터를 초기화하거나 다른 조건으로 좁혀 보세요.
              </div>
            ) : null}

            {experienceMode === "full" && filteredImplementationTasks.length > 0 ? (
              <div className="mt-4 grid gap-3 xl:grid-cols-4">
                {visibleImplementationStatuses.map((status) => {
                  const tasksInStatus = filteredImplementationTasks.filter((task) => task.status === status);

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
                        tasksInStatus.map((task) => {
                          const currentTaskEvidence = implementationTaskEvidence[task.id] ?? task.evidence ?? "";
                          const evidenceChecklist = getImplementationEvidenceChecklist(task, currentTaskEvidence);
                          const passedEvidenceCount = evidenceChecklist.filter((item) => item.passed).length;
                          const missingEvidenceLabels = evidenceChecklist
                            .filter((item) => !item.passed)
                            .map((item) => item.label);
                          const blockedHint = task.status === "blocked" ? getBlockedImplementationTaskHint(task) : null;

                          return (
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
                            {blockedHint ? (
                              <div className="mt-2 rounded-md border border-rose-100 bg-white px-3 py-2 text-xs leading-5 text-rose-900">
                                <div className="font-semibold">차단 해소 다음 액션</div>
                                <div className="mt-1">{blockedHint.nextAction}</div>
                              </div>
                            ) : null}
                            <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">{task.acceptance_criteria}</p>
                            <textarea
                              value={currentTaskEvidence}
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
                            <div
                              className={`mt-2 rounded-md border px-3 py-2 text-xs leading-5 ${
                                missingEvidenceLabels.length === 0
                                  ? "border-emerald-100 bg-emerald-50 text-emerald-900"
                                  : "border-amber-100 bg-amber-50 text-amber-900"
                              }`}
                            >
                              <div className="font-semibold">
                                증거 품질 {passedEvidenceCount}/{evidenceChecklist.length}
                              </div>
                              <div className="mt-1">
                                {missingEvidenceLabels.length === 0
                                  ? "필수 증거 힌트가 모두 포함되어 있습니다."
                                  : `보강 필요: ${missingEvidenceLabels.join(", ")}`}
                              </div>
                            </div>
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
                          );
                        })
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
            ) : null}

            {selectedImplementationTasks.length === 0 ? (
              <p className="mt-3 text-sm leading-6 text-slate-600">
                먼저 PRD, MVP 명세, 기술 명세, 개발 런북을 저장한 뒤 기본 태스크를 생성하면 구현 작업이 자동으로 분해됩니다.
              </p>
            ) : null}
          </div>

          <div className={visibleDevelopmentPanel === "handoff" ? "" : "hidden"}>
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

          {experienceMode === "guided" ? (
            <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50 p-4">
              <div className="text-sm font-semibold text-blue-950">개발 전달 패키지는 AI가 이미 준비했습니다.</div>
              <p className="mt-2 text-sm leading-6 text-blue-900">
                지금은 개발 완료 보고서만 저장하고 출시 판단으로 넘어가면 됩니다. Codex 핸드오프, 빌드 명령, QA 매트릭스,
                역할별 프롬프트는 전체 보기에서만 확인하세요.
              </p>
            </div>
          ) : (
            <>
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

              <div className="mt-5 rounded-lg border border-cyan-100 bg-cyan-50 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-cyan-950">MVP 빌드 명령 패킷</h3>
                    <p className="mt-1 text-sm leading-6 text-cyan-900">
                      승인 산출물, 개발 실행 순서, 출시 판단을 합쳐 실제 구현 세션의 첫 메시지로 넘기는 명령서입니다.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => copyDraft(mvpBuildCommandPacketDraft, "MVP 빌드 명령 패킷")}
                      disabled={!mvpBuildCommandPacketDraft}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-cyan-200 bg-white px-3 text-sm font-semibold text-cyan-900 transition hover:bg-cyan-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Clipboard size={16} />
                      명령 복사
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        saveArtifactDraft(
                          "dev_runbook",
                          `${selectedIdea.name} MVP 빌드 명령 패킷`,
                          mvpBuildCommandPacketDraft,
                          "mvp_build_command",
                        )
                      }
                      disabled={isBusy || !user || !mvpBuildCommandPacketDraft}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-cyan-700 px-3 text-sm font-semibold text-white transition hover:bg-cyan-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Save size={16} />
                      명령 저장
                    </button>
                  </div>
                </div>
                <textarea
                  value={mvpBuildCommandPacketDraft}
                  readOnly
                  rows={16}
                  className="mt-4 w-full resize-y rounded-md border border-cyan-200 bg-white px-3 py-2 font-mono text-sm leading-6 text-slate-700 outline-none"
                />
              </div>

              <div className="mt-5 rounded-lg border border-amber-100 bg-amber-50 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-amber-950">QA 검수 매트릭스</h3>
                    <p className="mt-1 text-sm leading-6 text-amber-900">
                      구현 완료 직후 확인할 핵심 여정, 권한, 보안, 디버깅, 배포 스모크를 한 번에 정리합니다.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => copyDraft(qaAcceptanceMatrixDraft, "QA 검수 매트릭스")}
                      disabled={!qaAcceptanceMatrixDraft}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-amber-200 bg-white px-3 text-sm font-semibold text-amber-900 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Clipboard size={16} />
                      매트릭스 복사
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        saveArtifactDraft(
                          "dev_runbook",
                          `${selectedIdea.name} QA 검수 매트릭스`,
                          qaAcceptanceMatrixDraft,
                          "qa_acceptance_matrix",
                        )
                      }
                      disabled={isBusy || !user || !qaAcceptanceMatrixDraft}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-amber-700 px-3 text-sm font-semibold text-white transition hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Save size={16} />
                      매트릭스 저장
                    </button>
                  </div>
                </div>
                <textarea
                  value={qaAcceptanceMatrixDraft}
                  readOnly
                  rows={14}
                  className="mt-4 w-full resize-y rounded-md border border-amber-200 bg-white px-3 py-2 font-mono text-sm leading-6 text-slate-700 outline-none"
                />
              </div>

              <div className="mt-5 rounded-lg border border-violet-100 bg-violet-50 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-violet-950">역할별 프롬프트 팩</h3>
                    <p className="mt-1 text-sm leading-6 text-violet-900">
                      전략, 리서치, 제품, 디자인, 개발, QA, 디버깅, 보안, 출시 역할에 같은 문맥을 나눠주는 실행 지시서입니다.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => copyDraft(rolePromptPackDraft, "역할별 프롬프트 팩")}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-violet-200 bg-white px-3 text-sm font-semibold text-violet-800 transition hover:bg-violet-50"
                    >
                      <Clipboard size={16} />
                      복사
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        saveArtifactDraft(
                          "dev_runbook",
                          `${selectedIdea.name} 역할별 프롬프트 팩`,
                          rolePromptPackDraft,
                          "development_process",
                        )
                      }
                      disabled={isBusy || !user}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-violet-700 px-3 text-sm font-semibold text-white transition hover:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Save size={16} />
                      저장
                    </button>
                  </div>
                </div>
                <textarea
                  value={rolePromptPackDraft}
                  readOnly
                  rows={16}
                  className="mt-4 w-full resize-y rounded-md border border-violet-200 bg-white px-3 py-2 font-mono text-sm leading-6 text-slate-700 outline-none"
                />
              </div>
            </>
          )}
          </div>
        </div>

        <div className={`rounded-lg border border-slate-200 bg-white p-6 shadow-sm ${activeTask === "launch" ? "" : "hidden"}`}>
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">출시 판단</h2>
              <p className="mt-1 text-sm text-slate-500">증거, 기획 자료, 위험, 실행 단계를 기준으로 출시 전 남은 조건을 요약합니다.</p>
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
          {releaseDecisionPacket ? (
            <div className="mb-5 rounded-lg border border-indigo-100 bg-indigo-50 p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.14em] text-indigo-700">
                    Go/No-go packet
                  </div>
                  <h3 className="mt-1 text-base font-semibold text-indigo-950">출시 판단 패킷</h3>
                  <p className="mt-1 text-sm leading-6 text-indigo-900">{releaseDecisionPacket.headline}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => copyDraft(releaseDecisionPacketDraft, "출시 판단 패킷")}
                    disabled={!releaseDecisionPacketDraft}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-indigo-200 bg-white px-3 text-sm font-semibold text-indigo-900 transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Clipboard size={16} />
                    패킷 복사
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      saveArtifactDraft(
                        "launch_checklist",
                        `${selectedIdea.name} 출시 판단 패킷`,
                        releaseDecisionPacketDraft,
                        "release_decision_packet",
                      )
                    }
                    disabled={isBusy || !user || !releaseDecisionPacketDraft}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-indigo-200 bg-white px-3 text-sm font-semibold text-indigo-900 transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Save size={16} />
                    패킷 저장
                  </button>
                  <button
                    type="button"
                    onClick={loadReleaseDecisionReason}
                    disabled={!canEdit}
                    className="inline-flex h-10 items-center justify-center rounded-md bg-indigo-700 px-3 text-sm font-semibold text-white transition hover:bg-indigo-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    판단 근거 채우기
                  </button>
                </div>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <div className="rounded-lg bg-white p-3">
                  <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">추천 판단</div>
                  <span
                    className={`mt-2 inline-flex rounded-md px-2.5 py-1 text-sm font-semibold ${
                      releaseDecisionTone[releaseDecisionPacket.recommendation]
                    }`}
                  >
                    {decisionLabels[releaseDecisionPacket.recommendation]}
                  </span>
                </div>
                <div className="rounded-lg bg-white p-3">
                  <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">판단 신뢰도</div>
                  <span
                    className={`mt-2 inline-flex rounded-md px-2.5 py-1 text-sm font-semibold ${
                      releaseDecisionConfidenceTone[releaseDecisionPacket.confidence]
                    }`}
                  >
                    {releaseDecisionPacket.confidenceLabel}
                  </span>
                </div>
                <div className="rounded-lg bg-white p-3">
                  <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">차단 항목</div>
                  <div className="mt-2 text-2xl font-semibold text-slate-950">{releaseDecisionPacket.blockers.length}</div>
                </div>
              </div>

              <div className="mt-4 grid gap-3 lg:grid-cols-2">
                <div className="rounded-lg bg-white/80 p-3">
                  <div className="text-sm font-semibold text-slate-950">다음 액션</div>
                  <ul className="mt-2 grid gap-1 text-sm leading-6 text-slate-700">
                    {releaseDecisionPacket.requiredActions.slice(0, 4).map((action) => (
                      <li key={action}>- {action}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-lg bg-white/80 p-3">
                  <div className="text-sm font-semibold text-slate-950">핵심 차단</div>
                  <ul className="mt-2 grid gap-1 text-sm leading-6 text-slate-700">
                    {releaseDecisionPacket.blockers.length > 0 ? (
                      releaseDecisionPacket.blockers.slice(0, 4).map((blocker) => <li key={blocker}>- {blocker}</li>)
                    ) : (
                      <li>- 차단 항목이 없습니다. 최종 판단과 배포 증거만 남기세요.</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          ) : null}
          <div className="mb-5 rounded-lg border border-emerald-100 bg-emerald-50 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
                  Performance review
                </div>
                <h3 className="mt-1 text-base font-semibold text-emerald-950">출시 후 성과 확인</h3>
                <p className="mt-1 text-sm leading-6 text-emerald-900">
                  첫 공개 후 7일, 14일, 30일에 어떤 신호로 진행/보강/전환/중단을 판단할지 정리합니다.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => copyDraft(postLaunchLearningLoopDraft, "출시 후 성과 확인")}
                  disabled={!postLaunchLearningLoopDraft}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-emerald-200 bg-white px-3 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Clipboard size={16} />
                  기준 복사
                </button>
                <button
                  type="button"
                  onClick={() =>
                    saveArtifactDraft(
                      "launch_checklist",
                      `${selectedIdea.name} 출시 후 성과 확인`,
                      postLaunchLearningLoopDraft,
                      "post_launch_learning",
                    )
                  }
                  disabled={isBusy || !user || !postLaunchLearningLoopDraft}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-emerald-700 px-3 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Save size={16} />
                  기준 저장
                </button>
              </div>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <div className="rounded-lg bg-white p-3">
                <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Day 7</div>
                <p className="mt-2 text-sm leading-6 text-slate-700">핵심 행동 완료율과 반복 사용을 확인합니다.</p>
              </div>
              <div className="rounded-lg bg-white p-3">
                <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Day 14</div>
                <p className="mt-2 text-sm leading-6 text-slate-700">구매 신호와 온보딩 병목을 분리합니다.</p>
              </div>
              <div className="rounded-lg bg-white p-3">
                <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Day 30</div>
                <p className="mt-2 text-sm leading-6 text-slate-700">반복 사용과 지불 의향으로 다음 빌드를 결정합니다.</p>
              </div>
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

        <div className={`rounded-lg border border-slate-200 bg-white p-6 shadow-sm ${activeTask === "learning" ? "" : "hidden"}`}>
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
                <Activity size={16} />
                Usage signals
              </div>
              <h2 className="text-lg font-semibold text-slate-950">성과 확인</h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                워크벤치와 실제 MVP에서 발생한 행동 신호를 모아 출시 후 Day 7, 14, 30 판단 리포트로 연결합니다.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => copyDraft(learningTelemetryReportDraft, "학습 리포트")}
                disabled={!learningTelemetryReportDraft}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-emerald-200 bg-white px-3 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Clipboard size={16} />
                리포트 복사
              </button>
              <button
                type="button"
                onClick={() =>
                  saveArtifactDraft(
                    "research_note",
                    `${selectedIdea.name} 학습 리포트`,
                    learningTelemetryReportDraft,
                    "post_launch_learning",
                  )
                }
                disabled={isBusy || !user || !learningTelemetryReportDraft}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-emerald-700 px-3 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Save size={16} />
                리포트 저장
              </button>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-5">
            {learningSignalCards.map((card) => (
              <div key={card.label} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{card.label}</div>
                <div className="mt-2 text-2xl font-semibold text-slate-950">{card.value}</div>
                <p className="mt-2 text-sm leading-6 text-slate-600">{card.detail}</p>
              </div>
            ))}
          </div>

          {experienceMode === "guided" ? (
            <div className="mt-4 rounded-lg border border-fuchsia-100 bg-fuchsia-50 p-4">
              <div className="text-sm font-semibold text-fuchsia-950">개발 전달 정보는 필요할 때만 확인하세요.</div>
              <p className="mt-2 text-sm leading-6 text-fuchsia-900">
                지금은 퍼널과 최근 이벤트 숫자만 보면 됩니다. 실제 제품 서버 연결, 비밀키, 라우트 코드는 전체 보기에서만 확인하세요.
              </p>
            </div>
          ) : (
          <div className="mt-4 rounded-lg border border-fuchsia-100 bg-fuchsia-50 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.14em] text-fuchsia-700">
                  Developer handoff
                </div>
                <h3 className="mt-1 text-base font-semibold text-fuchsia-950">MVP 사용 신호 연결</h3>
                <p className="mt-1 text-sm leading-6 text-fuchsia-900">
                  출시된 앱의 사용자 행동을 받아오는 개발팀 전달용 정보입니다. 경영진은 아래 퍼널과 최근 이벤트 숫자만 확인하면 됩니다.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => copyDraft(telemetryAdapterGuideDraft, "제품 이벤트 어댑터 가이드")}
                  disabled={!telemetryAdapterGuideDraft}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-fuchsia-200 bg-white px-3 text-sm font-semibold text-fuchsia-900 transition hover:bg-fuchsia-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Clipboard size={16} />
                  전달 가이드 복사
                </button>
                <button
                  type="button"
                  onClick={() =>
                    saveArtifactDraft(
                      "tech_spec",
                      `${selectedIdea.name} 제품 이벤트 어댑터 가이드`,
                      telemetryAdapterGuideDraft,
                      "telemetry_adapter",
                    )
                  }
                  disabled={isBusy || !user || !telemetryAdapterGuideDraft}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-fuchsia-700 px-3 text-sm font-semibold text-white transition hover:bg-fuchsia-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Save size={16} />
                  전달 가이드 저장
                </button>
              </div>
            </div>
            <details className="mt-4 rounded-lg border border-fuchsia-200 bg-white/70 p-3">
              <summary className="cursor-pointer text-sm font-semibold text-fuchsia-950">
                개발팀 전달 정보 열기
              </summary>
              <p className="mt-2 text-sm leading-6 text-fuchsia-900">
                아래 값은 개발자나 Codex 작업 세션에 전달할 때만 열어 확인합니다. 비밀값은 브라우저나 문서에 저장하지 않습니다.
              </p>
              <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,0.9fr)_minmax(320px,0.7fr)]">
                <div className="rounded-lg bg-white p-3">
                  <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Endpoint</div>
                  <code className="mt-2 block break-all rounded-md bg-slate-950 px-3 py-2 text-xs leading-5 text-white">
                    POST https://ai-venture-lab.vercel.app/api/telemetry/ingest
                  </code>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    헤더에는 서버 전용 `TELEMETRY_INGEST_SECRET`을 Bearer 토큰으로 넣습니다.
                  </p>
                </div>
                <div className="rounded-lg bg-white p-3">
                  <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Idea ID</div>
                  <code className="mt-2 block break-all rounded-md bg-slate-100 px-3 py-2 text-xs leading-5 text-slate-700">
                    {selectedIdea.id}
                  </code>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    외부 앱 이벤트는 이 ID로 현재 아이디어의 성과 확인 화면에 연결됩니다.
                  </p>
                </div>
              </div>
              <div className="mt-3 grid gap-3 xl:grid-cols-2">
                {[
                  {
                    label: "1. 서버 환경변수",
                    detail: "외부 MVP 서버에만 넣고 브라우저 번들에는 절대 노출하지 않습니다.",
                    action: "환경변수 복사",
                    body: telemetryEnvSnippet,
                  },
                  {
                    label: "2. Next.js 서버 라우트",
                    detail: "브라우저 요청을 서버에서 받아 AI Venture Lab 수집 API로 중계합니다.",
                    action: "라우트 복사",
                    body: telemetryNextRouteSnippet,
                  },
                  {
                    label: "3. 브라우저 helper",
                    detail: "제품 화면에서는 비밀값 없이 내부 서버 라우트만 호출합니다.",
                    action: "helper 복사",
                    body: telemetryClientHelperSnippet,
                  },
                  {
                    label: "4. 운영 스모크",
                    detail: "수집 API, 서비스 롤 키, RLS 저장 경로를 한 번에 검증합니다.",
                    action: "스모크 복사",
                    body: telemetrySmokeCommandSnippet,
                  },
                ].map((snippet) => (
                  <div key={snippet.label} className="rounded-lg bg-white p-3">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="text-xs font-semibold uppercase tracking-[0.14em] text-fuchsia-700">
                          {snippet.label}
                        </div>
                        <p className="mt-1 text-sm leading-6 text-slate-600">{snippet.detail}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyDraft(snippet.body, snippet.label)}
                        disabled={!snippet.body}
                        className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-md border border-fuchsia-200 bg-fuchsia-50 px-3 text-xs font-semibold text-fuchsia-900 transition hover:bg-fuchsia-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Code2 size={14} />
                        {snippet.action}
                      </button>
                    </div>
                    <pre className="mt-3 max-h-36 overflow-auto rounded-md bg-slate-950 p-3 text-xs leading-5 text-slate-100">
                      <code>{snippet.body}</code>
                    </pre>
                  </div>
                ))}
              </div>
            </details>
          </div>
          )}

          <div className="mt-4 grid gap-3 lg:grid-cols-3">
            {[
              ["Day 7", "첫 행동 완료율", "이벤트가 적으면 온보딩, 첫 화면, 핵심 액션을 더 짧게 만듭니다."],
              ["Day 14", "반복 사용과 지불 신호", "반복 이벤트와 실험 결과를 보고 세그먼트 축소 또는 가격 검증으로 이동합니다."],
              ["Day 30", "유지와 다음 빌드", "충분한 사용/지불/추천 신호가 있으면 다음 MVP 슬라이스를 승인합니다."],
            ].map(([label, signal, action]) => (
              <div key={label} className="rounded-lg border border-emerald-100 bg-emerald-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">{label}</div>
                <h3 className="mt-2 text-sm font-semibold text-emerald-950">{signal}</h3>
                <p className="mt-2 text-sm leading-6 text-emerald-900">{action}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(360px,0.65fr)]">
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="text-base font-semibold text-slate-950">제품 사용 퍼널</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    방문부터 결제 신호까지 실제 MVP 행동이 어디서 끊기는지 봅니다.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => copyDraft(productTelemetryFunnelDraft, "제품 사용 퍼널 리포트")}
                    disabled={!productTelemetryFunnelDraft}
                    className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Clipboard size={14} />
                    퍼널 복사
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      saveArtifactDraft(
                        "research_note",
                        `${selectedIdea.name} 제품 사용 퍼널`,
                        productTelemetryFunnelDraft,
                        "product_telemetry_funnel",
                      )
                    }
                    disabled={isBusy || !user || !productTelemetryFunnelDraft}
                    className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-slate-950 px-3 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Save size={14} />
                    퍼널 저장
                  </button>
                </div>
              </div>
              <div className="grid gap-3">
                {productTelemetryFunnelRows.map((row, index) => {
                  const width = Math.max(4, Math.round((row.count / productTelemetryMaxCount) * 100));

                  return (
                    <div key={row.eventName} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white text-xs font-semibold text-slate-700 shadow-sm">
                            {index + 1}
                          </span>
                          <div>
                            <div className="text-sm font-semibold text-slate-950">{row.label}</div>
                            <div className="text-xs text-slate-500">{row.eventName}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-slate-950">{row.count}건</div>
                          <div className="text-xs text-slate-500">
                            {row.conversion === null ? "기준 단계" : `전 단계 대비 ${row.conversion}%`}
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
                        <div className="h-full rounded-full bg-fuchsia-600" style={{ width: `${width}%` }} />
                      </div>
                      <p className="mt-2 text-xs leading-5 text-slate-500">{row.question}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3">
                <h3 className="text-base font-semibold text-slate-950">수집해야 할 행동 신호</h3>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  MVP 서버에서 어떤 이벤트를 보내야 Day 7/14/30 판단이 가능한지 점검합니다.
                </p>
              </div>
              <div className="grid gap-2">
                {productTelemetryTaxonomyRows.map((item) => (
                  <div key={item.eventName} className="rounded-md bg-white p-3 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <div className="text-sm font-semibold text-slate-950">{item.label}</div>
                        <div className="mt-0.5 text-xs text-slate-500">{item.eventName}</div>
                      </div>
                      <span
                        className={`rounded-md px-2 py-1 text-xs font-semibold ${
                          item.count > 0 ? "bg-emerald-50 text-emerald-800" : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {item.count > 0 ? `${item.count}개` : "대기"}
                      </span>
                    </div>
                    <p className="mt-2 text-xs leading-5 text-slate-500">{item.when}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,0.85fr)_minmax(360px,0.65fr)]">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="text-base font-semibold text-slate-950">최근 이벤트</h3>
                <span className="rounded-md bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 shadow-sm">
                  {selectedTelemetryEvents.length}개
                </span>
              </div>
              <div className="grid gap-2">
                {selectedTelemetryEvents.slice(0, 12).map((event) => (
                  <div key={event.id} className="rounded-md bg-white p-3 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-slate-950">
                          {telemetryEventLabels[event.event_name] ?? event.event_name}
                        </span>
                        <span
                          className={`rounded-md px-2 py-1 text-xs font-semibold ${
                            telemetryCategoryTone[event.event_category] ?? "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {telemetryCategoryLabels[event.event_category] ?? event.event_category}
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-slate-500">{formatTelemetryTime(event.occurred_at)}</span>
                    </div>
                    {formatTelemetryProperties(event.properties) ? (
                      <p className="mt-2 text-xs leading-5 text-slate-500">{formatTelemetryProperties(event.properties)}</p>
                    ) : null}
                  </div>
                ))}
                {selectedTelemetryEvents.length === 0 ? (
                  <div className="rounded-md bg-white p-4 text-sm leading-6 text-slate-600 shadow-sm">
                    아직 이 아이디어에 연결된 이벤트가 없습니다. 점수 저장, 리스크 추가, 실험/산출물 저장 같은 행동을 하면 자동으로 쌓입니다.
                  </div>
                ) : null}
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="mb-3">
                <h3 className="text-base font-semibold text-slate-950">학습 리포트 초안</h3>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  운영 이벤트를 제품 판단 언어로 바꿔 다음 빌드 범위에 넘깁니다.
                </p>
              </div>
              <textarea
                value={learningTelemetryReportDraft}
                readOnly
                rows={22}
                className="w-full resize-y rounded-md border border-slate-300 bg-slate-50 px-3 py-2 font-mono text-sm leading-6 text-slate-700 outline-none"
              />
            </div>
          </div>
        </div>

        <div
          className={`rounded-lg border border-slate-200 bg-white p-6 shadow-sm ${
            activeTask === "orchestration" ? "" : "hidden"
          }`}
        >
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">실행 관리 보드</h2>
              <p className="mt-1 text-sm text-slate-500">전략부터 출시까지 담당 역할과 진행 상태를 추적합니다.</p>
            </div>
            <button
              type="button"
              onClick={createRunbook}
              disabled={isBusy || !user}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Layers3 size={18} />
              실행 계획 만들기
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
          <form onSubmit={saveExperimentResultNote} className="mt-6 rounded-lg border border-violet-100 bg-violet-50 p-4">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="text-base font-semibold text-slate-950">실험 결과 기록</h3>
                <p className="mt-1 text-sm text-slate-600">
                  완료한 실험의 결과와 배운 점을 리서치 노트로 남겨 다음 판단에 연결합니다.
                </p>
              </div>
              <button
                type="button"
                onClick={() => copyDraft(experimentResultNoteDraft, "실험 결과")}
                disabled={!experimentResultNoteDraft}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-violet-200 bg-white px-3 text-sm font-semibold text-violet-800 transition hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Clipboard size={16} />
                결과 복사
              </button>
            </div>
            <div className="grid gap-4">
              <div className="grid gap-4 lg:grid-cols-2">
                <label className="grid gap-2 text-sm font-semibold text-slate-700">
                  대상 실험
                  <select
                    value={selectedExperimentForResult?.id ?? ""}
                    disabled={selectedExperiments.length === 0}
                    onChange={(event) =>
                      setExperimentResultDraft((current) => ({ ...current, experiment_id: event.target.value }))
                    }
                    className="h-11 rounded-md border border-slate-300 bg-white px-3 text-sm font-normal text-slate-950 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100 disabled:text-slate-500"
                  >
                    {selectedExperiments.length > 0 ? (
                      selectedExperiments.map((experiment) => (
                        <option key={experiment.id} value={experiment.id}>
                          {experiment.name}
                        </option>
                      ))
                    ) : (
                      <option value="">실험을 먼저 추가하세요</option>
                    )}
                  </select>
                </label>
                <SelectField
                  label="다음 판단"
                  value={experimentResultDraft.next_decision}
                  options={decisions}
                  labels={decisionLabels}
                  disabled={selectedExperiments.length === 0}
                  onChange={(value) =>
                    setExperimentResultDraft((current) => ({ ...current, next_decision: value }))
                  }
                />
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                <TextArea
                  label="결과"
                  value={experimentResultDraft.result}
                  disabled={selectedExperiments.length === 0}
                  onChange={(value) => setExperimentResultDraft((current) => ({ ...current, result: value }))}
                />
                <TextArea
                  label="배운 점"
                  value={experimentResultDraft.learning}
                  disabled={selectedExperiments.length === 0}
                  onChange={(value) => setExperimentResultDraft((current) => ({ ...current, learning: value }))}
                />
              </div>
              <TextArea
                label="다음 행동"
                value={experimentResultDraft.next_action}
                disabled={selectedExperiments.length === 0}
                onChange={(value) => setExperimentResultDraft((current) => ({ ...current, next_action: value }))}
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isBusy || !user || selectedExperiments.length === 0}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-violet-700 px-4 text-sm font-semibold text-white transition hover:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Save size={18} />
                  결과 저장
                </button>
              </div>
            </div>
          </form>
        </div>

        <div
          className={`rounded-lg border border-slate-200 bg-white p-6 shadow-sm ${activeTask === "risk" ? "" : "hidden"}`}
        >
          <h2 className="text-lg font-semibold text-slate-950">위험 목록</h2>
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

        <div className={activeTask === "artifacts" ? "rounded-lg border border-slate-200 bg-white p-4 shadow-sm" : "hidden"}>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">기획서 만들기</h2>
              <p className="mt-1 text-sm text-slate-500">{artifactPanelDescriptions[artifactPanel]}</p>
            </div>
            <div className="grid grid-cols-3 gap-2 rounded-md bg-slate-100 p-1">
              {(Object.keys(artifactPanelLabels) as ArtifactPanel[]).map((panel) => (
                <button
                  key={panel}
                  type="button"
                  onClick={() => setArtifactPanel(panel)}
                  className={`h-10 rounded-md px-3 text-sm font-semibold transition ${
                    artifactPanel === panel
                      ? "bg-white text-slate-950 shadow-sm"
                      : "text-slate-600 hover:bg-white/70 hover:text-slate-950"
                  }`}
                >
                  {artifactPanelLabels[panel]}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div
          className={`rounded-lg border border-slate-200 bg-white p-6 shadow-sm ${
            activeTask === "artifacts" && artifactPanel === "validation" ? "" : "hidden"
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
            activeTask === "artifacts" && artifactPanel === "validation" ? "" : "hidden"
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
            activeTask === "artifacts" && artifactPanel === "validation" ? "" : "hidden"
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
            activeTask === "artifacts" && artifactPanel === "validation" ? "" : "hidden"
          }`}
        >
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">근거 직접 기록</h2>
              <p className="mt-1 text-sm text-slate-500">
                인터뷰 메모, 외부 자료, 가격 신호, 경쟁 대안 관찰을 리서치 노트로 저장합니다.
              </p>
            </div>
            <button
              type="button"
              onClick={() => copyDraft(evidenceNoteDraft, "근거 기록")}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
            >
              <Clipboard size={18} />
              미리보기 복사
            </button>
          </div>
          <form onSubmit={saveEvidenceNote} className="grid gap-4">
            <div className="grid gap-4 lg:grid-cols-[1fr_1fr_180px]">
              <InputField
                label="근거 제목"
                value={evidenceDraft.title}
                onChange={(value) => setEvidenceDraft((current) => ({ ...current, title: value }))}
              />
              <InputField
                label="출처/URL/인터뷰 대상"
                value={evidenceDraft.source}
                onChange={(value) => setEvidenceDraft((current) => ({ ...current, source: value }))}
              />
              <SelectField
                label="확신도"
                value={evidenceDraft.confidence}
                options={[...evidenceConfidenceOptions]}
                labels={evidenceConfidenceLabels}
                onChange={(value) => setEvidenceDraft((current) => ({ ...current, confidence: value }))}
              />
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <TextArea
                label="관찰한 근거"
                value={evidenceDraft.evidence}
                onChange={(value) => setEvidenceDraft((current) => ({ ...current, evidence: value }))}
              />
              <TextArea
                label="해석과 영향"
                value={evidenceDraft.implication}
                onChange={(value) => setEvidenceDraft((current) => ({ ...current, implication: value }))}
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-slate-500">
                저장하면 산출물 라이브러리에 `리서치 노트`로 남고 출시 준비도 리서치 게이트에 반영됩니다.
              </p>
              <button
                type="submit"
                disabled={isBusy || !user}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Save size={18} />
                근거 저장
              </button>
            </div>
          </form>
        </div>

        <div
          className={`rounded-lg border border-slate-200 bg-white p-6 shadow-sm ${
            activeTask === "artifacts" && artifactPanel === "validation" ? "" : "hidden"
          }`}
        >
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">검증 완료 요약</h2>
              <p className="mt-1 text-sm text-slate-500">
                저장된 근거, 실험, 리스크, 판단 기록을 묶어 PRD 진입 여부를 정리합니다.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => copyDraft(validationSummaryDraft, "검증 완료 요약")}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                <Clipboard size={18} />
                요약 복사
              </button>
              <button
                type="button"
                onClick={() =>
                  saveArtifactDraft(
                    "research_note",
                    `${selectedIdea.name} 검증 완료 요약`,
                    validationSummaryDraft,
                    "validation_summary",
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
            value={validationSummaryDraft}
            readOnly
            rows={16}
            className="w-full resize-y rounded-md border border-slate-300 bg-slate-50 px-3 py-2 font-mono text-sm leading-6 text-slate-700 outline-none"
          />
        </div>

        <div
          className={`rounded-lg border border-blue-100 bg-blue-50 p-6 shadow-sm ${
            activeTask === "artifacts" && artifactPanel === "product" ? "" : "hidden"
          }`}
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-blue-950">PRD 진입 준비도</h2>
              <p className="mt-1 text-sm leading-6 text-blue-900">
                검증 근거가 제품 요구사항으로 넘어갈 만큼 정리되었는지 먼저 확인합니다.
              </p>
              <div
                className={`mt-4 rounded-md border px-4 py-3 text-sm leading-6 ${
                  nextPrdBlocker ? "border-amber-200 bg-amber-50 text-amber-950" : "border-emerald-200 bg-emerald-50 text-emerald-950"
                }`}
              >
                {nextPrdBlocker ? (
                  <>
                    <span className="font-semibold">다음 보강 항목: {nextPrdBlocker.label}</span>
                    <span className="block">{nextPrdBlocker.detail}</span>
                  </>
                ) : (
                  <>
                    <span className="font-semibold">PRD로 넘어갈 준비가 되었습니다.</span>
                    <span className="block">검증 완료 요약을 기준으로 제품 범위를 좁혀 저장하세요.</span>
                  </>
                )}
              </div>
            </div>
            <div className="rounded-lg bg-blue-950 px-5 py-4 text-right text-white">
              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-200">
                통과 {passedPrdReadinessCount}/{prdReadinessChecks.length}
              </div>
              <div className="mt-1 text-3xl font-semibold">{prdReadinessScore}%</div>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {prdReadinessChecks.map((check) => (
              <div key={check.label} className="rounded-lg border border-blue-100 bg-white p-3">
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

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => copyDraft(prdHandoffDraft, "PRD 전환 핸드오프")}
              disabled={!prdHandoffDraft}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-blue-950 px-3 text-sm font-semibold text-white transition hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Clipboard size={16} />
              핸드오프 복사
            </button>
            <button
              type="button"
              onClick={() =>
                saveArtifactDraft(
                  "research_note",
                  `${selectedIdea.name} PRD 전환 핸드오프`,
                  prdHandoffDraft,
                  "prd_readiness_handoff",
                )
              }
              disabled={isBusy || !user || !prdHandoffDraft}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-white px-3 text-sm font-semibold text-blue-900 shadow-sm transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save size={16} />
              핸드오프 저장
            </button>
            <button
              type="button"
              onClick={() => setArtifactPanel("validation")}
              className="inline-flex h-10 items-center justify-center rounded-md bg-blue-700 px-3 text-sm font-semibold text-white transition hover:bg-blue-800"
            >
              검증 산출물 보강
            </button>
            <button
              type="button"
              onClick={() => updateActiveTask("experiment")}
              className="inline-flex h-10 items-center justify-center rounded-md border border-blue-200 bg-white px-3 text-sm font-semibold text-blue-800 transition hover:bg-blue-50"
            >
              실험 확인
            </button>
            <button
              type="button"
              onClick={() => updateActiveTask("risk")}
              className="inline-flex h-10 items-center justify-center rounded-md border border-blue-200 bg-white px-3 text-sm font-semibold text-blue-800 transition hover:bg-blue-50"
            >
              리스크 확인
            </button>
            <button
              type="button"
              onClick={() => updateActiveTask("decision")}
              className="inline-flex h-10 items-center justify-center rounded-md border border-blue-200 bg-white px-3 text-sm font-semibold text-blue-800 transition hover:bg-blue-50"
            >
              판단 기록
            </button>
          </div>
        </div>

        <div
          className={`rounded-lg border border-slate-200 bg-white p-6 shadow-sm ${
            activeTask === "artifacts" && artifactPanel === "product" ? "" : "hidden"
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

        <div className={activeTask === "artifacts" && artifactPanel === "product" ? "grid gap-6 xl:grid-cols-2" : "hidden"}>
          <div className="rounded-lg border border-indigo-100 bg-indigo-50 p-6 shadow-sm xl:col-span-2">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-indigo-950">MVP 슬라이스 플랜</h2>
                <p className="mt-1 text-sm leading-6 text-indigo-900">
                  개발 범위를 수동 검증, 얇은 제품, AI/자동화, 출시 하드닝으로 나눠 첫 구현이 커지지 않게 합니다.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => copyDraft(mvpSlicePlanDraft, "MVP 슬라이스 플랜")}
                  disabled={!mvpSlicePlanDraft}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-indigo-950 px-4 text-sm font-semibold text-white transition hover:bg-indigo-900 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Clipboard size={18} />
                  플랜 복사
                </button>
                <button
                  type="button"
                  onClick={() =>
                    saveArtifactDraft(
                      "mvp_spec",
                      `${selectedIdea.name} MVP 슬라이스 플랜`,
                      mvpSlicePlanDraft,
                      "mvp_slice_plan",
                    )
                  }
                  disabled={isBusy || !user || !mvpSlicePlanDraft}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-indigo-200 bg-white px-4 text-sm font-semibold text-indigo-900 transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Save size={18} />
                  플랜 저장
                </button>
              </div>
            </div>
            <textarea
              value={mvpSlicePlanDraft}
              readOnly
              rows={18}
              className="w-full resize-y rounded-md border border-indigo-200 bg-white px-3 py-2 font-mono text-sm leading-6 text-slate-700 outline-none"
            />
          </div>

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
            activeTask === "artifacts" && artifactPanel === "library" ? "" : "hidden"
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
              <label className="grid gap-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                출처
                <select
                  value={activeArtifactSourceFilter}
                  onChange={(event) => setArtifactSourceFilter(event.target.value)}
                  className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm normal-case tracking-normal text-slate-800 outline-none transition focus:border-slate-500"
                >
                  {artifactSourceOptions.map((source) => (
                    <option key={source} value={source}>
                      {artifactSourceFilterLabels[source]}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
          {selectedIdea ? (
            <div className="mb-4 rounded-lg border border-indigo-100 bg-indigo-50 p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.14em] text-indigo-700">Review queue</div>
                  <h3 className="mt-1 text-base font-semibold text-indigo-950">앱 제작 산출물 승인 큐</h3>
                  <p className="mt-1 text-sm leading-6 text-indigo-900">
                    아이디어 검증에서 개발/출시까지 필요한 산출물을 순서대로 확인합니다.
                  </p>
                  {nextArtifactReviewItem ? (
                    <div className="mt-3 rounded-md bg-white p-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-slate-950">
                          다음 처리: {nextArtifactReviewItem.label}
                        </span>
                        <span
                          className={`rounded-md px-2 py-1 text-xs font-semibold ${
                            nextArtifactReviewItem.status === "draft"
                              ? "bg-amber-50 text-amber-800"
                              : "bg-rose-50 text-rose-700"
                          }`}
                        >
                          {nextArtifactReviewItem.status === "draft" ? "승인 대기" : "생성 필요"}
                        </span>
                      </div>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{nextArtifactReviewItem.detail}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{nextArtifactReviewItem.action}</p>
                    </div>
                  ) : (
                    <div className="mt-3 rounded-md bg-emerald-50 p-3 text-sm leading-6 text-emerald-900">
                      모든 핵심 산출물이 승인되었습니다. 출시 판단과 배포 검증으로 넘어갈 수 있습니다.
                    </div>
                  )}
                </div>
                <div className="shrink-0 rounded-lg bg-indigo-950 px-4 py-3 text-right text-white">
                  <div className="text-xs font-semibold uppercase tracking-[0.14em] text-indigo-200">
                    승인 {approvedArtifactReviewCount}/{artifactReviewQueue.length}
                  </div>
                  <div className="mt-1 text-3xl font-semibold">{artifactReviewProgress}%</div>
                  {nextArtifactReviewItem ? (
                    <button
                      type="button"
                      onClick={() => focusArtifactReviewItem(nextArtifactReviewItem)}
                      className="mt-3 inline-flex h-9 items-center justify-center rounded-md bg-white px-3 text-xs font-semibold text-indigo-900 transition hover:bg-indigo-100"
                    >
                      다음 항목 열기
                    </button>
                  ) : null}
                </div>
              </div>
              <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
                {artifactReviewQueue.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => focusArtifactReviewItem(item)}
                    className="rounded-md bg-white px-3 py-2 text-left transition hover:bg-indigo-100"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-slate-950">{item.label}</span>
                      <span
                        className={`rounded-md px-2 py-1 text-[11px] font-semibold ${
                          item.status === "approved"
                            ? "bg-emerald-50 text-emerald-800"
                            : item.status === "draft"
                              ? "bg-amber-50 text-amber-800"
                              : "bg-rose-50 text-rose-700"
                        }`}
                      >
                        {item.status === "approved" ? "승인" : item.status === "draft" ? "초안" : "없음"}
                      </span>
                    </div>
                    <p className="mt-1 text-xs leading-5 text-slate-600">{item.detail}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : null}
          {recentDevelopmentHandoffArtifacts.length > 0 ? (
            <div className="mb-4 rounded-lg border border-blue-100 bg-blue-50 p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-blue-950">최근 개발 핸드오프</h3>
                  <p className="mt-1 text-sm leading-6 text-blue-900">
                    필터 실행 프롬프트와 개발 런북 저장본을 먼저 보여줍니다. 최신본을 복사해 다음 구현 루프에 넘기세요.
                  </p>
                </div>
                <span className="rounded-md bg-white px-3 py-2 text-xs font-semibold text-blue-800 shadow-sm">
                  {recentDevelopmentHandoffArtifacts.length}개
                </span>
              </div>
              <div className="mt-3 grid gap-2 lg:grid-cols-3">
                {recentDevelopmentHandoffArtifacts.map((artifact) => (
                  <div key={artifact.id} className="rounded-md border border-blue-100 bg-white p-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-slate-950">{artifact.title || "제목 없음"}</span>
                      <span className="rounded-md bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-800">
                        v{artifact.version ?? 1}
                      </span>
                    </div>
                    <div className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                      {artifactSourceLabels[artifact.source || "manual"] ?? artifact.source ?? "수동"} /{" "}
                      {new Date(artifact.created_at).toLocaleDateString()}
                    </div>
                    <button
                      type="button"
                      onClick={() => navigator.clipboard.writeText(artifact.body)}
                      className="mt-3 inline-flex h-8 items-center justify-center gap-2 rounded-md bg-slate-950 px-2.5 text-xs font-semibold text-white transition hover:bg-slate-800"
                    >
                      <Clipboard size={14} />
                      핸드오프 복사
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
          <div className="grid gap-3">
            {selectedArtifacts.length > 0 ? (
              selectedArtifacts.map((artifact) => {
                const status = artifact.status ?? "draft";
                const versionSummary = artifactVersionSummaries.get(artifact.id);
                const reviewSummary = artifactReviewSummaries.get(artifact.id);

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
                          {artifact.source === "filtered_implementation_run" ? (
                            <span className="rounded-md bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">
                              필터 저장본
                            </span>
                          ) : null}
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
                        {reviewSummary ? (
                          <div className="mt-3 rounded-lg border border-slate-200 bg-white p-3">
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className={`rounded-md px-2 py-1 text-xs font-semibold ${
                                  artifactReviewIntensityTone[reviewSummary.intensity]
                                }`}
                              >
                                리뷰 강도 {reviewSummary.intensityLabel}
                              </span>
                              <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                                비교 {reviewSummary.previous ? `v${reviewSummary.previous.version ?? 1}` : "최초 버전"}
                              </span>
                            </div>
                            <p className="mt-2 text-sm leading-6 text-slate-600">{reviewSummary.recommendation}</p>
                            <div className="mt-3 grid gap-3 lg:grid-cols-2">
                              <div className="rounded-md bg-slate-50 px-3 py-2">
                                <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                                  섹션 변화
                                </div>
                                <p className="mt-1 text-xs leading-5 text-slate-600">
                                  추가: {reviewSummary.addedSections.slice(0, 4).join(", ") || "없음"}
                                </p>
                                <p className="mt-1 text-xs leading-5 text-slate-600">
                                  삭제: {reviewSummary.removedSections.slice(0, 4).join(", ") || "없음"}
                                </p>
                              </div>
                              <div className="rounded-md bg-slate-50 px-3 py-2">
                                <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                                  승인 전 확인
                                </div>
                                <ul className="mt-1 grid gap-1 text-xs leading-5 text-slate-600">
                                  {reviewSummary.checks.slice(0, 3).map((check) => (
                                    <li key={check}>- {check}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
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
                        {reviewSummary ? (
                          <button
                            type="button"
                            onClick={() => copyDraft(buildArtifactReviewMemo(artifact, reviewSummary), "산출물 리뷰 메모")}
                            className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-white px-3 text-xs font-semibold text-slate-800 shadow-sm transition hover:bg-slate-100"
                          >
                            <ClipboardList size={14} />
                            리뷰 메모
                          </button>
                        ) : null}
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

function GateChecklistPanel({
  eyebrow,
  title,
  description,
  score,
  checks,
}: {
  eyebrow: string;
  title: string;
  description: string;
  score: number;
  checks: GateCheck[];
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">{eyebrow}</div>
          <h3 className="mt-1 text-base font-semibold text-slate-950">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
        </div>
        <div className="shrink-0 rounded-md bg-slate-950 px-3 py-2 text-center text-white">
          <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-300">준비</div>
          <div className="text-2xl font-semibold">{score}%</div>
        </div>
      </div>
      <div className="mt-4 h-2 rounded-full bg-white">
        <div className="h-2 rounded-full bg-blue-600" style={{ width: `${score}%` }} />
      </div>
      <div className="mt-4 grid gap-3">
        {checks.map((check) => (
          <div key={check.label} className="rounded-md border border-slate-200 bg-white p-3">
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
    </div>
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
