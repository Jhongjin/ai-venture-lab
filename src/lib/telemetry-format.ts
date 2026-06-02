import type { Json } from "@/lib/supabase/types";
import type { TelemetryEvent } from "@/lib/venture-data";

export type TelemetryWindowCounts = {
  sevenDays: number;
  fourteenDays: number;
  thirtyDays: number;
};

export type TelemetryIdeaSummary = {
  id: string;
  organization_id: string | null;
};

export function sanitizeTelemetryProperties(properties: Record<string, Json>) {
  return Object.fromEntries(Object.entries(properties).filter(([, value]) => value !== undefined)) as Record<string, Json>;
}

export function buildTelemetryEventInsertRow({
  eventCategory,
  eventName,
  idea,
  organizationId,
  properties = {},
  userId,
}: {
  eventCategory: string;
  eventName: string;
  idea?: TelemetryIdeaSummary | null;
  organizationId?: string | null;
  properties?: Record<string, Json>;
  userId: string;
}) {
  return {
    actor_id: userId,
    event_category: eventCategory,
    event_name: eventName,
    idea_id: idea?.id ?? null,
    organization_id: organizationId ?? idea?.organization_id ?? null,
    properties: sanitizeTelemetryProperties(properties),
  };
}

export const telemetryEventLabels: Record<string, string> = {
  idea_extraction_started: "아이디어 정리 시작",
  idea_extraction_completed: "아이디어 정리 완료",
  idea_created: "아이디어 생성",
  idea_package_created: "검증 자료 저장",
  idea_updated: "사업성 평가 저장",
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
  experiment_created: "검증 계획 생성",
  experiment_status_updated: "검증 계획 상태 변경",
  experiment_result_saved: "검증 결과 저장",
  runbook_created: "제작 계획 생성",
  run_created: "단계 추가",
  run_status_updated: "단계 상태 변경",
  run_output_saved: "단계 결과 저장",
  artifact_saved: "제작 자료 저장",
  artifact_package_saved: "제작 자료 묶음 저장",
  artifact_status_updated: "제작 자료 상태 변경",
  implementation_tasks_created: "제작 할 일 생성",
  implementation_task_created: "제작 할 일 추가",
  implementation_task_status_updated: "제작 할 일 상태 변경",
  implementation_task_evidence_saved: "제작 할 일 근거 저장",
};

export const telemetryCategoryLabels: Record<string, string> = {
  intake: "입력",
  extraction: "아이디어 도출",
  scoring: "사업성 평가",
  product: "제품 사용",
  risk: "위험",
  decision: "판단",
  experiment: "검증 계획",
  orchestration: "작업 순서",
  artifact: "제작 자료",
  development: "제작",
  launch: "출시",
  learning: "성과 확인",
};

export const telemetryCategoryTone: Record<string, string> = {
  intake: "avl-pill avl-pill-info",
  extraction: "avl-pill avl-pill-neutral",
  scoring: "avl-pill avl-pill-info",
  product: "avl-pill avl-pill-brand",
  risk: "avl-pill avl-pill-danger",
  decision: "avl-pill avl-pill-success",
  experiment: "avl-pill avl-pill-warning",
  orchestration: "avl-pill avl-pill-brand",
  artifact: "avl-pill avl-pill-neutral",
  development: "avl-pill avl-pill-info",
  launch: "avl-pill avl-pill-success",
  learning: "avl-pill avl-pill-brand",
};

export const productTelemetryFunnelSteps = [
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
    question: "첫 버전이 약속한 가치를 실제로 수행하는가",
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

export const productTelemetryTaxonomy = [
  {
    eventName: "product_page_view",
    label: "방문",
    when: "첫 버전의 주요 페이지나 첫 화면이 열릴 때",
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

export function formatTelemetryTime(value: string) {
  return new Date(value).toLocaleString("ko-KR", {
    timeZone: "Asia/Seoul",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatStableKoreanDate(value: string) {
  return new Date(value).toLocaleDateString("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export function formatTelemetryProperties(properties: Json) {
  if (!properties || typeof properties !== "object" || Array.isArray(properties)) {
    return "";
  }

  return Object.entries(properties)
    .filter(([, value]) => value !== undefined && value !== null && typeof value !== "object")
    .slice(0, 4)
    .map(([key, value]) => `${key}: ${String(value)}`)
    .join(" · ");
}

export function eventCountForWindow(events: TelemetryEvent[], days: number) {
  const referenceTime = Math.max(...events.map((event) => new Date(event.occurred_at).getTime()).filter(Number.isFinite));

  if (!Number.isFinite(referenceTime)) {
    return 0;
  }

  const threshold = referenceTime - days * 24 * 60 * 60 * 1000;

  return events.filter((event) => new Date(event.occurred_at).getTime() >= threshold).length;
}

export function filterProductTelemetryEvents(events: TelemetryEvent[]) {
  return events.filter((event) => event.event_category === "product" || event.event_name.startsWith("product_"));
}

export function countTelemetryEventsByName(events: TelemetryEvent[]) {
  const counts = new Map<string, number>();

  for (const event of events) {
    counts.set(event.event_name, (counts.get(event.event_name) ?? 0) + 1);
  }

  return counts;
}

export function buildProductTelemetryFunnelRows(eventCounts: Map<string, number>) {
  return productTelemetryFunnelSteps.map((step, index) => {
    const count = eventCounts.get(step.eventName) ?? 0;
    const previousStep = productTelemetryFunnelSteps[index - 1];
    const previousCount = previousStep ? eventCounts.get(previousStep.eventName) ?? 0 : count;
    const conversion = index === 0 || previousCount === 0 ? null : Math.round((count / previousCount) * 100);

    return {
      ...step,
      count,
      conversion,
    };
  });
}

export function getProductTelemetryMaxCount(rows: Array<{ count: number }>) {
  return Math.max(1, ...rows.map((row) => row.count));
}

export function buildProductTelemetryTaxonomyRows(eventCounts: Map<string, number>) {
  return productTelemetryTaxonomy.map((item) => ({
    ...item,
    count: eventCounts.get(item.eventName) ?? 0,
  }));
}

export function buildTelemetryWindowCounts(events: TelemetryEvent[]): TelemetryWindowCounts {
  return {
    sevenDays: eventCountForWindow(events, 7),
    fourteenDays: eventCountForWindow(events, 14),
    thirtyDays: eventCountForWindow(events, 30),
  };
}

export function buildLearningSignalCards({
  openRiskCount,
  productEventCount,
  telemetryWindowCounts,
}: {
  openRiskCount: number;
  productEventCount: number;
  telemetryWindowCounts: TelemetryWindowCounts;
}) {
  return [
    {
      label: "제품 이벤트",
      value: `${productEventCount}개`,
      detail: "실제 제품/외부 앱에서 수집된 사용자 행동 신호",
    },
    {
      label: "최근 7일",
      value: `${telemetryWindowCounts.sevenDays}개`,
      detail: "첫 가치 도달, 저장, 상태 변경 같은 초기 행동 신호",
    },
    {
      label: "최근 14일",
      value: `${telemetryWindowCounts.fourteenDays}개`,
      detail: "반복 사용, 실험 결과, 리스크 해소 신호",
    },
    {
      label: "최근 30일",
      value: `${telemetryWindowCounts.thirtyDays}개`,
      detail: "유지, 전환, 다음 빌드 판단에 필요한 누적 신호",
    },
    {
      label: "열린 리스크",
      value: `${openRiskCount}개`,
      detail: "성과 확인에서 계속 감시해야 하는 차단 요인",
    },
  ];
}

export function buildProductTelemetryDerivedState({
  events,
  openRiskCount,
}: {
  events: TelemetryEvent[];
  openRiskCount: number;
}) {
  const selectedProductTelemetryEvents = filterProductTelemetryEvents(events);
  const productTelemetryEventCounts = countTelemetryEventsByName(selectedProductTelemetryEvents);
  const productTelemetryFunnelRows = buildProductTelemetryFunnelRows(productTelemetryEventCounts);
  const productTelemetryTaxonomyRows = buildProductTelemetryTaxonomyRows(productTelemetryEventCounts);
  const telemetryWindowCounts = buildTelemetryWindowCounts(events);

  return {
    selectedProductTelemetryEvents,
    productTelemetryEventCounts,
    productTelemetryFunnelRows,
    productTelemetryMaxCount: getProductTelemetryMaxCount(productTelemetryFunnelRows),
    productTelemetryTaxonomyRows,
    telemetryWindowCounts,
    learningSignalCards: buildLearningSignalCards({
      openRiskCount,
      productEventCount: selectedProductTelemetryEvents.length,
      telemetryWindowCounts,
    }),
  };
}
