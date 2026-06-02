import {
  eventCountForWindow,
  formatTelemetryProperties,
  formatTelemetryTime,
  productTelemetryFunnelSteps,
  productTelemetryTaxonomy,
  telemetryCategoryLabels,
  telemetryEventLabels,
} from "@/lib/telemetry-format";
import type { Experiment, Idea, ImplementationTask, Risk, TelemetryEvent } from "@/lib/venture-data";

export function buildLearningTelemetryReportMarkdown({
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
        } | ${telemetryCategoryLabels[event.event_category] ?? event.event_category} | ${
          formatTelemetryProperties(event.properties) || "-"
        } |`,
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

export function buildTelemetryAdapterGuideMarkdown(idea: Idea) {
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

export function buildTelemetryEnvSnippet() {
  return `# Server-only. Do not prefix with NEXT_PUBLIC.
TELEMETRY_INGEST_SECRET=replace-with-shared-server-secret`;
}

export function buildTelemetryEventNameUnion() {
  return productTelemetryTaxonomy.map((event) => `  | "${event.eventName}"`).join("\n");
}

export function buildTelemetryNextRouteSnippet(idea: Idea) {
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

export function buildTelemetryClientHelperSnippet() {
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

export function buildTelemetrySmokeCommandSnippet(idea: Idea) {
  return `$env:TELEMETRY_INGEST_SECRET="Vercel에 등록한 TELEMETRY_INGEST_SECRET"
$env:TELEMETRY_SMOKE_IDEA_ID="${idea.id}"
pnpm smoke:telemetry

# 방문부터 결제 신호까지 전체 제품 퍼널을 한 번에 검증할 때
pnpm smoke:telemetry:funnel`;
}

export function buildTelemetrySetupDrafts(idea: Idea | null | undefined) {
  if (!idea) {
    return {
      telemetryAdapterGuideDraft: "",
      telemetryEnvSnippet: "",
      telemetryNextRouteSnippet: "",
      telemetryClientHelperSnippet: "",
      telemetrySmokeCommandSnippet: "",
    };
  }

  return {
    telemetryAdapterGuideDraft: buildTelemetryAdapterGuideMarkdown(idea),
    telemetryEnvSnippet: buildTelemetryEnvSnippet(),
    telemetryNextRouteSnippet: buildTelemetryNextRouteSnippet(idea),
    telemetryClientHelperSnippet: buildTelemetryClientHelperSnippet(),
    telemetrySmokeCommandSnippet: buildTelemetrySmokeCommandSnippet(idea),
  };
}

export function buildProductTelemetryFunnelMarkdown({
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
