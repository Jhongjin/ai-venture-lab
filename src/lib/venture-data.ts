import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { Database, IdeaStage } from "@/lib/supabase/types";

export type Idea = Database["public"]["Tables"]["ideas"]["Row"];
export type Risk = Database["public"]["Tables"]["risks"]["Row"];
export type Decision = Database["public"]["Tables"]["decisions"]["Row"];
export type Experiment = Database["public"]["Tables"]["experiments"]["Row"];
export type OrchestrationRun = Database["public"]["Tables"]["orchestration_runs"]["Row"];
export type VentureArtifact = Database["public"]["Tables"]["venture_artifacts"]["Row"];
export type ImplementationTask = Database["public"]["Tables"]["implementation_tasks"]["Row"];
export type TelemetryEvent = Database["public"]["Tables"]["telemetry_events"]["Row"];
type OrganizationMember = Database["public"]["Tables"]["organization_members"]["Row"];

type ConsoleData = {
  ideas: Idea[];
  risks: Risk[];
  decisions: Decision[];
  experiments: Experiment[];
  orchestrationRuns: OrchestrationRun[];
  artifacts: VentureArtifact[];
  implementationTasks: ImplementationTask[];
  telemetryEvents: TelemetryEvent[];
  viewerUserId: string | null;
  viewerMemberships: OrganizationMember[];
  source: "supabase" | "seed";
  error: string | null;
};

function emptyConsoleData(error: string | null = null): ConsoleData {
  return {
    ideas: [],
    risks: [],
    decisions: [],
    experiments: [],
    orchestrationRuns: [],
    artifacts: [],
    implementationTasks: [],
    telemetryEvents: [],
    viewerUserId: null,
    viewerMemberships: [],
    source: "seed",
    error,
  };
}

function isUserScopedRecordVisible(
  record: { created_by: string | null; organization_id: string | null },
  userId: string,
  organizationIds: Set<string>,
) {
  return record.created_by === userId || (record.organization_id ? organizationIds.has(record.organization_id) : false);
}

function filterChildRecordsForVisibleIdeas<T extends { idea_id: string | null; organization_id: string | null }>(
  records: T[],
  visibleIdeaIds: Set<string>,
  organizationIds: Set<string>,
) {
  return records.filter((record) =>
    record.idea_id ? visibleIdeaIds.has(record.idea_id) : record.organization_id ? organizationIds.has(record.organization_id) : false,
  );
}

const now = new Date("2026-05-03T00:00:00.000Z").toISOString();
export const workflowStageOrder: IdeaStage[] = ["intake", "research", "score", "prd", "prototype", "qa", "launch", "paused"];

const workflowStageRank = new Map(workflowStageOrder.map((stage, index) => [stage, index]));

const localizedIdeaSeeds: Record<
  string,
  Pick<Idea, "name" | "one_liner" | "target_user" | "buyer" | "signal" | "risk_summary" | "next_evidence">
> = {
  "Care ops console": {
    name: "돌봄 운영 콘솔",
    one_liner: "가족, 요양보호사, 센터 간 돌봄 일정과 기록을 관리하는 신뢰 기반 운영 콘솔입니다.",
    target_user: "돌봄을 조율하는 가족과 소규모 방문요양센터",
    buyer: "방문요양센터 또는 가족 돌봄 관리자",
    signal: "규제 업무와 가족 커뮤니케이션이 겹치는 구조적 수요가 큽니다.",
    risk_summary: "장기요양 규정, 개인정보 처리, 운영 책임 소재가 핵심 리스크입니다.",
    next_evidence: "방문요양센터와 가족 커뮤니케이션의 실제 제약을 확인합니다.",
  },
  "Conversation coach": {
    name: "대화 코칭",
    one_liner: "중요한 일상 대화를 미리 연습하고 스크립트를 준비하는 역할극 코치입니다.",
    target_user: "어려운 대화를 준비하는 직장인과 개인 사용자",
    buyer: "개인 전문가 또는 소규모 팀",
    signal: "MVP 구현이 빠르고 일상 효용이 명확합니다.",
    risk_summary: "상담, 법률, 의료, HR 조언처럼 보이는 주장을 피해야 합니다.",
    next_evidence: "반복 빈도가 높은 세부 상황 하나를 고르고 측정 가능한 결과를 정의합니다.",
  },
  "Subscription agent": {
    name: "구독 정리 도우미",
    one_liner: "반복 결제를 찾아내고 낮은 마찰로 해지 절차를 안내하는 개인 지출 정리 도구입니다.",
    target_user: "디지털 구독이 많은 바쁜 소비자",
    buyer: "개인 소비자",
    signal: "절약 금액이 바로 보이는 명확한 후킹 포인트가 있습니다.",
    risk_summary: "계정 접근, 결제 데이터, 동의, 해지 안정성이 핵심 리스크입니다.",
    next_evidence: "동의, 계정 접근, 결제 데이터 처리 제약을 맵핑합니다.",
  },
};

const localizedRiskSeeds: Record<string, Pick<Risk, "title" | "area" | "mitigation">> = {
  "Personal data leakage": {
    title: "개인정보 유출",
    area: "개인정보",
    mitigation: "초기 프로토타입에서는 실제 개인정보를 쓰지 않고 출시 전 보관 정책을 문서화합니다.",
  },
  "Regulated advice claims": {
    title: "규제 대상 조언 주장",
    area: "법무",
    mitigation: "자격 검토 없이 의료, 법률, 금융, 심리상담 조언으로 보이는 표현을 피합니다.",
  },
  "Secret exposure": {
    title: "비밀값 노출",
    area: "보안",
    mitigation: "Vercel 환경변수를 사용하고 .env 파일은 git에 넣지 않습니다.",
  },
};

export const seedIdeas: Idea[] = [
  {
    id: "seed-care-ops",
    name: "돌봄 운영 콘솔",
    one_liner: "가족, 요양보호사, 센터 간 돌봄 일정과 기록을 관리하는 신뢰 기반 운영 콘솔입니다.",
    target_user: "돌봄을 조율하는 가족과 소규모 방문요양센터",
    buyer: "방문요양센터 또는 가족 돌봄 관리자",
    stage: "research",
    decision: "research_more",
    problem_intensity: 5,
    frequency: 4,
    reachability: 3,
    willingness_to_pay: 4,
    mvp_speed: 3,
    differentiation: 4,
    regulatory_risk: 4,
    signal: "규제 업무와 가족 커뮤니케이션이 겹치는 구조적 수요가 큽니다.",
    risk_summary: "장기요양 규정, 개인정보 처리, 운영 책임 소재가 핵심 리스크입니다.",
    next_evidence: "방문요양센터와 가족 커뮤니케이션의 실제 제약을 확인합니다.",
    product_surface: "operator_console",
    organization_id: null,
    created_by: null,
    created_at: now,
    updated_at: now,
  },
  {
    id: "seed-conversation-coach",
    name: "대화 코칭",
    one_liner: "중요한 일상 대화를 미리 연습하고 스크립트를 준비하는 역할극 코치입니다.",
    target_user: "어려운 대화를 준비하는 직장인과 개인 사용자",
    buyer: "개인 전문가 또는 소규모 팀",
    stage: "score",
    decision: "research_more",
    problem_intensity: 4,
    frequency: 4,
    reachability: 4,
    willingness_to_pay: 3,
    mvp_speed: 5,
    differentiation: 3,
    regulatory_risk: 2,
    signal: "MVP 구현이 빠르고 일상 효용이 명확합니다.",
    risk_summary: "상담, 법률, 의료, HR 조언처럼 보이는 주장을 피해야 합니다.",
    next_evidence: "반복 빈도가 높은 세부 상황 하나를 고르고 측정 가능한 결과를 정의합니다.",
    product_surface: "web_app",
    organization_id: null,
    created_by: null,
    created_at: now,
    updated_at: now,
  },
  {
    id: "seed-subscription-agent",
    name: "구독 정리 도우미",
    one_liner: "반복 결제를 찾아내고 낮은 마찰로 해지 절차를 안내하는 개인 지출 정리 도구입니다.",
    target_user: "디지털 구독이 많은 바쁜 소비자",
    buyer: "개인 소비자",
    stage: "intake",
    decision: "research_more",
    problem_intensity: 4,
    frequency: 3,
    reachability: 4,
    willingness_to_pay: 4,
    mvp_speed: 4,
    differentiation: 3,
    regulatory_risk: 4,
    signal: "절약 금액이 바로 보이는 명확한 후킹 포인트가 있습니다.",
    risk_summary: "계정 접근, 결제 데이터, 동의, 해지 안정성이 핵심 리스크입니다.",
    next_evidence: "동의, 계정 접근, 결제 데이터 처리 제약을 맵핑합니다.",
    product_surface: "automation",
    organization_id: null,
    created_by: null,
    created_at: now,
    updated_at: now,
  },
];

export const seedRisks: Risk[] = [
  {
    id: "seed-risk-pii",
    idea_id: null,
    title: "개인정보 유출",
    area: "개인정보",
    severity: "high",
    mitigation: "초기 프로토타입에서는 실제 개인정보를 쓰지 않고 출시 전 보관 정책을 문서화합니다.",
    status: "open",
    organization_id: null,
    created_by: null,
    created_at: now,
    updated_at: now,
  },
  {
    id: "seed-risk-advice",
    idea_id: null,
    title: "규제 대상 조언 주장",
    area: "법무",
    severity: "high",
    mitigation: "자격 검토 없이 의료, 법률, 금융, 심리상담 조언으로 보이는 표현을 피합니다.",
    status: "open",
    organization_id: null,
    created_by: null,
    created_at: now,
    updated_at: now,
  },
  {
    id: "seed-risk-secrets",
    idea_id: null,
    title: "비밀값 노출",
    area: "보안",
    severity: "high",
    mitigation: "Vercel 환경변수를 사용하고 .env 파일은 git에 넣지 않습니다.",
    status: "open",
    organization_id: null,
    created_by: null,
    created_at: now,
    updated_at: now,
  },
];

export const seedDecisions: Decision[] = [];
export const seedExperiments: Experiment[] = [];
export const seedOrchestrationRuns: OrchestrationRun[] = [];
export const seedArtifacts: VentureArtifact[] = [];
export const seedImplementationTasks: ImplementationTask[] = [];
export const seedTelemetryEvents: TelemetryEvent[] = [];

export function localizeIdeaRecord(idea: Idea): Idea {
  return { ...idea, ...(localizedIdeaSeeds[idea.name] ?? {}) };
}

export function localizeRiskRecord(risk: Risk): Risk {
  return { ...risk, ...(localizedRiskSeeds[risk.title] ?? {}) };
}

export function sortIdeasByWorkflow(ideas: Idea[]) {
  return [...ideas].sort(compareIdeasByWorkflow);
}

export function getIdeaCreatedAtTime(idea: Pick<Idea, "created_at">) {
  return new Date(idea.created_at).getTime();
}

export function compareIdeasByCreatedAtDesc(a: Idea, b: Idea) {
  return getIdeaCreatedAtTime(b) - getIdeaCreatedAtTime(a);
}

export function compareIdeasByWorkflow(a: Idea, b: Idea) {
  return (
    (workflowStageRank.get(a.stage) ?? 99) - (workflowStageRank.get(b.stage) ?? 99) ||
    compareIdeasByCreatedAtDesc(a, b) ||
    a.name.localeCompare(b.name, "ko-KR")
  );
}

export function scoreIdea(idea: Idea) {
  return (
    idea.problem_intensity +
    idea.frequency +
    idea.reachability +
    idea.willingness_to_pay +
    idea.mvp_speed +
    idea.differentiation -
    idea.regulatory_risk
  );
}

export async function getConsoleData(): Promise<ConsoleData> {
  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return emptyConsoleData("Supabase is not connected.");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return emptyConsoleData(null);
  }

  const { data: membershipRows, error: membershipError } = await supabase
    .from("organization_members")
    .select("*")
    .eq("user_id", user.id);

  const memberships: OrganizationMember[] = membershipRows ?? [];
  const organizationIds = new Set(memberships.map((membership) => membership.organization_id));

  const [
    ideasResult,
    risksResult,
    decisionsResult,
    experimentsResult,
    orchestrationRunsResult,
    artifactsResult,
    implementationTasksResult,
    telemetryEventsResult,
  ] = await Promise.all([
      supabase.from("ideas").select("*").order("created_at", { ascending: true }),
      supabase.from("risks").select("*").order("created_at", { ascending: true }),
      supabase.from("decisions").select("*").order("decided_at", { ascending: false }),
      supabase.from("experiments").select("*").order("created_at", { ascending: false }),
      supabase.from("orchestration_runs").select("*").order("created_at", { ascending: false }),
      supabase.from("venture_artifacts").select("*").order("created_at", { ascending: false }),
      supabase.from("implementation_tasks").select("*").order("sort_order", { ascending: true }),
      supabase.from("telemetry_events").select("*").order("occurred_at", { ascending: false }).limit(250),
  ]);

  if (ideasResult.error || risksResult.error || decisionsResult.error || experimentsResult.error) {
    return emptyConsoleData(
      membershipError?.message ??
        ideasResult.error?.message ??
        risksResult.error?.message ??
        decisionsResult.error?.message ??
        experimentsResult.error?.message ??
        "Unknown Supabase error",
    );
  }

  const visibleIdeas = sortIdeasByWorkflow(
    (ideasResult.data ?? [])
      .filter((idea) => isUserScopedRecordVisible(idea, user.id, organizationIds))
      .map(localizeIdeaRecord),
  );
  const visibleIdeaIds = new Set(visibleIdeas.map((idea) => idea.id));

  return {
    ideas: visibleIdeas,
    risks: filterChildRecordsForVisibleIdeas(risksResult.data ?? [], visibleIdeaIds, organizationIds).map(localizeRiskRecord),
    decisions: filterChildRecordsForVisibleIdeas(decisionsResult.data ?? [], visibleIdeaIds, organizationIds),
    experiments: filterChildRecordsForVisibleIdeas(experimentsResult.data ?? [], visibleIdeaIds, organizationIds),
    orchestrationRuns: orchestrationRunsResult.error
      ? []
      : filterChildRecordsForVisibleIdeas(orchestrationRunsResult.data ?? [], visibleIdeaIds, organizationIds),
    artifacts: artifactsResult.error
      ? []
      : filterChildRecordsForVisibleIdeas(artifactsResult.data ?? [], visibleIdeaIds, organizationIds),
    implementationTasks: implementationTasksResult.error
      ? []
      : filterChildRecordsForVisibleIdeas(implementationTasksResult.data ?? [], visibleIdeaIds, organizationIds),
    telemetryEvents: telemetryEventsResult.error
      ? []
      : filterChildRecordsForVisibleIdeas(telemetryEventsResult.data ?? [], visibleIdeaIds, organizationIds),
    viewerUserId: user.id,
    viewerMemberships: memberships,
    source: "supabase",
    error:
      membershipError?.message ??
      (orchestrationRunsResult.error
        ? `Orchestration read failed: ${orchestrationRunsResult.error.message}`
        : artifactsResult.error
          ? `Artifact read failed: ${artifactsResult.error.message}`
          : implementationTasksResult.error && implementationTasksResult.error.code !== "42P01"
            ? `Implementation task read failed: ${implementationTasksResult.error.message}`
          : telemetryEventsResult.error && telemetryEventsResult.error.code !== "42P01"
            ? `Telemetry read failed: ${telemetryEventsResult.error.message}`
          : null),
  };
}
