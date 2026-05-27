import { NextResponse } from "next/server";

import { enforceAiRouteRateLimit } from "@/lib/ai-route-rate-limit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_TEXT_LENGTH = 1200;
const MAX_LIST_ITEMS = 8;

type DecisionStatus = "pending" | "research_more" | "ship" | "pivot" | "kill";
type ConfidenceLevel = "low" | "medium" | "high";
type SourceType = "primary" | "secondary" | "directory" | "news" | "user_input" | "unknown";

type RequestIdea = {
  name: string;
  one_liner: string;
  target_user: string;
  buyer: string;
  product_surface: string;
};

type RequestState = {
  signal: string;
  risk_summary: string;
  next_evidence: string;
};

type MarketScanSource = {
  title: string;
  url: string;
  reason: string;
  source_type: SourceType;
  strength: ConfidenceLevel;
};

type MarketScanSignal = {
  label: string;
  finding: string;
};

type MarketScanCompetitor = {
  name: string;
  category: string;
  threat: ConfidenceLevel;
  note: string;
};

type MarketScanBarrier = {
  label: string;
  severity: ConfidenceLevel;
  note: string;
};

type MarketScan = {
  summary: string;
  demand_forecast: string;
  competition: string;
  saturation: string;
  entry_barriers: string;
  alternatives: string;
  market_signals: MarketScanSignal[];
  competitor_map: MarketScanCompetitor[];
  entry_barrier_checks: MarketScanBarrier[];
  research_queries: string[];
  recommendation: DecisionStatus;
  confidence: ConfidenceLevel;
  next_action: string;
  caveat: string;
  sources: MarketScanSource[];
};

type RequestBody = {
  idea?: unknown;
  state?: unknown;
  score?: unknown;
  risks?: unknown;
  experiments?: unknown;
};

type OpenAIContentItem = {
  type?: unknown;
  text?: unknown;
};

type OpenAIOutputItem = {
  type?: unknown;
  content?: unknown;
  action?: unknown;
};

type OpenAIResponse = {
  output_text?: unknown;
  output?: unknown;
  error?: unknown;
  status?: unknown;
  incomplete_details?: unknown;
};

const marketScanSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    summary: { type: "string" },
    demand_forecast: { type: "string" },
    competition: { type: "string" },
    saturation: { type: "string" },
    entry_barriers: { type: "string" },
    alternatives: { type: "string" },
    market_signals: {
      type: "array",
      maxItems: 4,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          label: { type: "string" },
          finding: { type: "string" },
        },
        required: ["label", "finding"],
      },
    },
    competitor_map: {
      type: "array",
      maxItems: 5,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          name: { type: "string" },
          category: { type: "string" },
          threat: { type: "string", enum: ["low", "medium", "high"] },
          note: { type: "string" },
        },
        required: ["name", "category", "threat", "note"],
      },
    },
    entry_barrier_checks: {
      type: "array",
      maxItems: 5,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          label: { type: "string" },
          severity: { type: "string", enum: ["low", "medium", "high"] },
          note: { type: "string" },
        },
        required: ["label", "severity", "note"],
      },
    },
    research_queries: {
      type: "array",
      maxItems: 5,
      items: { type: "string" },
    },
    recommendation: { type: "string", enum: ["pending", "research_more", "ship", "pivot", "kill"] },
    confidence: { type: "string", enum: ["low", "medium", "high"] },
    next_action: { type: "string" },
    caveat: { type: "string" },
    sources: {
      type: "array",
      maxItems: 5,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          title: { type: "string" },
          url: { type: "string" },
          reason: { type: "string" },
          source_type: { type: "string", enum: ["primary", "secondary", "directory", "news", "user_input", "unknown"] },
          strength: { type: "string", enum: ["low", "medium", "high"] },
        },
        required: ["title", "url", "reason", "source_type", "strength"],
      },
    },
  },
  required: [
    "summary",
    "demand_forecast",
    "competition",
    "saturation",
    "entry_barriers",
    "alternatives",
    "market_signals",
    "competitor_map",
    "entry_barrier_checks",
    "research_queries",
    "recommendation",
    "confidence",
    "next_action",
    "caveat",
    "sources",
  ],
} as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toText(value: unknown, maxLength = MAX_TEXT_LENGTH) {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim().slice(0, maxLength) : "";
}

function toNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function toStringList(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item) => toText(item, 360)).filter(Boolean).slice(0, MAX_LIST_ITEMS);
}

function toIdea(value: unknown): RequestIdea | null {
  if (!isRecord(value)) {
    return null;
  }

  const idea = {
    name: toText(value.name, 120),
    one_liner: toText(value.one_liner, 360),
    target_user: toText(value.target_user, 240),
    buyer: toText(value.buyer, 240),
    product_surface: toText(value.product_surface, 160),
  };

  return idea.name || idea.one_liner ? idea : null;
}

function toState(value: unknown): RequestState {
  if (!isRecord(value)) {
    return {
      signal: "",
      risk_summary: "",
      next_evidence: "",
    };
  }

  return {
    signal: toText(value.signal, 480),
    risk_summary: toText(value.risk_summary, 480),
    next_evidence: toText(value.next_evidence, 480),
  };
}

function extractOutputText(payload: OpenAIResponse) {
  if (typeof payload.output_text === "string" && payload.output_text.trim()) {
    return payload.output_text;
  }

  if (!Array.isArray(payload.output)) {
    return "";
  }

  return payload.output
    .filter(isRecord)
    .flatMap((item: OpenAIOutputItem) => (Array.isArray(item.content) ? item.content : []))
    .filter(isRecord)
    .map((content: OpenAIContentItem) => (typeof content.text === "string" ? content.text : ""))
    .filter(Boolean)
    .join("\n");
}

function getOpenAIErrorMessage(payload: OpenAIResponse) {
  if (!isRecord(payload.error)) {
    return null;
  }

  return toText(payload.error.message, 500) || "OpenAI request failed.";
}

function getOpenAIParseFailureReason(payload: OpenAIResponse, outputText: string) {
  const details = isRecord(payload.incomplete_details) ? toText(payload.incomplete_details.reason, 160) : "";
  const status = toText(payload.status, 80);
  const statusHint =
    status || details
      ? ` 응답 상태: ${[status, details ? `incomplete=${details}` : ""].filter(Boolean).join(", ")}.`
      : "";
  const outputHint = outputText.trim() ? " 구조화된 JSON으로 해석하지 못했습니다." : " 최종 텍스트가 비어 있습니다.";

  return `OpenAI 응답을 시장성 점검 형식으로 읽지 못했습니다.${statusHint}${outputHint}`;
}

function normalizeDecision(value: unknown): DecisionStatus {
  return value === "pending" || value === "research_more" || value === "ship" || value === "pivot" || value === "kill"
    ? value
    : "research_more";
}

function normalizeConfidence(value: unknown): ConfidenceLevel {
  return value === "low" || value === "medium" || value === "high" ? value : "low";
}

function normalizeSourceType(value: unknown): SourceType {
  return value === "primary" ||
    value === "secondary" ||
    value === "directory" ||
    value === "news" ||
    value === "user_input" ||
    value === "unknown"
    ? value
    : "unknown";
}

function toMarketScanSource(value: unknown): MarketScanSource | null {
  if (!isRecord(value)) {
    return null;
  }

  const source = {
    title: toText(value.title, 160),
    url: toText(value.url, 500),
    reason: toText(value.reason, 240),
    source_type: normalizeSourceType(value.source_type),
    strength: normalizeConfidence(value.strength),
  };

  return source.title || source.url ? source : null;
}

function toMarketScanSignal(value: unknown): MarketScanSignal | null {
  if (!isRecord(value)) {
    return null;
  }

  const signal = {
    label: toText(value.label, 120),
    finding: toText(value.finding, 360),
  };

  return signal.label && signal.finding ? signal : null;
}

function toMarketScanCompetitor(value: unknown): MarketScanCompetitor | null {
  if (!isRecord(value)) {
    return null;
  }

  const competitor = {
    name: toText(value.name, 160),
    category: toText(value.category, 160),
    threat: normalizeConfidence(value.threat),
    note: toText(value.note, 360),
  };

  return competitor.name && competitor.note ? competitor : null;
}

function toMarketScanBarrier(value: unknown): MarketScanBarrier | null {
  if (!isRecord(value)) {
    return null;
  }

  const barrier = {
    label: toText(value.label, 160),
    severity: normalizeConfidence(value.severity),
    note: toText(value.note, 360),
  };

  return barrier.label && barrier.note ? barrier : null;
}

function toMarketScan(value: unknown): MarketScan | null {
  if (!isRecord(value)) {
    return null;
  }

  const sources = Array.isArray(value.sources)
    ? value.sources.map(toMarketScanSource).filter((source): source is MarketScanSource => Boolean(source)).slice(0, 5)
    : [];
  const marketSignals = Array.isArray(value.market_signals)
    ? value.market_signals
        .map(toMarketScanSignal)
        .filter((signal): signal is MarketScanSignal => Boolean(signal))
        .slice(0, 4)
    : [];
  const competitorMap = Array.isArray(value.competitor_map)
    ? value.competitor_map
        .map(toMarketScanCompetitor)
        .filter((competitor): competitor is MarketScanCompetitor => Boolean(competitor))
        .slice(0, 5)
    : [];
  const entryBarrierChecks = Array.isArray(value.entry_barrier_checks)
    ? value.entry_barrier_checks
        .map(toMarketScanBarrier)
        .filter((barrier): barrier is MarketScanBarrier => Boolean(barrier))
        .slice(0, 5)
    : [];

  const scan = {
    summary: toText(value.summary, 700),
    demand_forecast: toText(value.demand_forecast, 900),
    competition: toText(value.competition, 900),
    saturation: toText(value.saturation, 900),
    entry_barriers: toText(value.entry_barriers, 900),
    alternatives: toText(value.alternatives, 900),
    market_signals: marketSignals,
    competitor_map: competitorMap,
    entry_barrier_checks: entryBarrierChecks,
    research_queries: toStringList(value.research_queries),
    recommendation: normalizeDecision(value.recommendation),
    confidence: normalizeConfidence(value.confidence),
    next_action: toText(value.next_action, 700),
    caveat: toText(value.caveat, 700),
    sources,
  };

  return scan.summary && scan.next_action ? scan : null;
}

function parseStructuredJson(text: string) {
  const trimmed = text.trim();
  const candidates = [trimmed];
  const fencedJson = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1]?.trim();
  const objectStart = trimmed.indexOf("{");
  const objectEnd = trimmed.lastIndexOf("}");

  if (fencedJson) {
    candidates.push(fencedJson);
  }

  if (objectStart >= 0 && objectEnd > objectStart) {
    candidates.push(trimmed.slice(objectStart, objectEnd + 1));
  }

  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate) as unknown;
    } catch {
      // Try the next response shape.
    }
  }

  return null;
}

function collectSourcesFromPayload(payload: unknown): MarketScanSource[] {
  const found: MarketScanSource[] = [];
  const seen = new Set<string>();

  function visit(value: unknown) {
    if (!isRecord(value) && !Array.isArray(value)) {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }

    const url = toText(value.url, 500);
    const title = toText(value.title, 160) || toText(value.name, 160);

    if (url && /^https?:\/\//i.test(url) && !seen.has(url)) {
      seen.add(url);
      found.push({
        title: title || url,
        url,
        reason: "웹 검색에서 참고한 공개 자료입니다.",
        source_type: "secondary",
        strength: "medium",
      });
    }

    Object.values(value).forEach(visit);
  }

  visit(payload);
  return found.slice(0, 5);
}

function isPublicSource(source: MarketScanSource) {
  return /^https?:\/\//i.test(source.url.trim()) && source.source_type !== "user_input";
}

function mergePublicSources(...sourceGroups: MarketScanSource[][]) {
  const found: MarketScanSource[] = [];
  const seen = new Set<string>();

  sourceGroups.flat().forEach((source) => {
    if (!isPublicSource(source)) {
      return;
    }

    const key = `${source.url.trim().toLowerCase()}::${source.title.trim().toLowerCase()}`;
    if (seen.has(key)) {
      return;
    }

    seen.add(key);
    found.push(source);
  });

  return found.slice(0, 5);
}

function createFallbackScan({
  idea,
  state,
  score,
  reason,
}: {
  idea: RequestIdea;
  state: RequestState;
  score: number | null;
  reason: string;
}): MarketScan {
  const text = `${idea.name} ${idea.one_liner} ${idea.target_user} ${idea.buyer} ${idea.product_surface} ${state.signal} ${state.risk_summary} ${state.next_evidence}`;
  const isSensitive = /개인정보|비밀번호|유언|상속|의료|건강|금융|보험|법무|계약|결제|신용|상담/.test(text);
  const isB2b = /B2B|기업|팀|사내|업무|운영|CS|리드|파이프라인|회의|자동화/.test(text);
  const isConsumer = /개인|사용자|가족|구독|리뷰|예약|이커머스|지역/.test(text);
  const isMobileSurface = /앱|모바일|mobile|native|ios|android/i.test(idea.product_surface);
  const isAutomationSurface = /자동화|운영|콘솔|업무 흐름|workflow|operator/i.test(idea.product_surface);
  const isDevelopmentHandoffSurface = /mcp|ide|개발 도구|제작 도구|제작 지시|handoff|cursor|codex|claude/i.test(
    idea.product_surface,
  );
  const surfaceHint = idea.product_surface ? `권장 제작 형태는 '${idea.product_surface}'입니다. ` : "";
  const scoreHint = score === null ? "" : `현재 내부 사업성 점수는 ${score}점입니다. `;
  const competitionHint = isDevelopmentHandoffSurface
    ? "외부 제작 도구와 문서 기반 전달 서비스가 비교 대상입니다. 단순 문서보다 바로 제작에 넘길 수 있는 패키지 완성도가 차별점입니다."
    : isAutomationSurface
      ? "Zapier, Make, 스프레드시트, 노션, 사내 운영 도구처럼 이미 익숙한 자동화 대체재와 비교해야 합니다."
      : isMobileSurface
        ? "앱스토어의 알림/기록/관리 앱, 기존 플랫폼 내장 기능, 모바일 메모 앱이 대체재가 될 가능성이 큽니다."
        : isB2b
          ? "업무 자동화, CRM, 노코드 툴, 기존 스프레드시트 운영이 대체재가 될 가능성이 큽니다."
          : isConsumer
            ? "소비자 앱, 메모/알림 앱, 기존 플랫폼 기능이 대체재가 될 가능성이 큽니다."
            : "범용 SaaS, 수동 운영, 기존 업무 도구가 대체재가 될 가능성이 큽니다.";
  const barrierHint = isSensitive
    ? "개인정보, 신뢰, 법적 책임 설명이 진입장벽입니다. 초기 검증은 민감정보 저장 없이 수요와 신뢰 문구를 먼저 확인하는 편이 안전합니다."
    : isDevelopmentHandoffSurface
      ? "제작 도구 연동은 설치 난이도, 문서 신뢰도, 재현성, 권한 범위 설명이 진입장벽이 될 수 있습니다."
      : isAutomationSurface
        ? "자동화형 제품은 계정 연결, 데이터 접근 권한, 업무 흐름 변경에 대한 신뢰가 진입장벽이 될 수 있습니다."
        : isMobileSurface
          ? "모바일 앱은 설치 설득, 알림 권한, 개인정보 동의, 앱스토어 리뷰와 신뢰가 진입장벽이 될 수 있습니다."
          : "기술 장벽보다 첫 사용자 모집, 기존 습관 전환, 명확한 차별화가 더 큰 장벽일 가능성이 큽니다.";
  const recommendation: DecisionStatus = isSensitive ? "research_more" : score !== null && score >= 22 ? "ship" : "research_more";

  return {
    summary: `${surfaceHint}${scoreHint}현재 정보만 보면 시장성 판단은 아직 확정이 아니라 검증 전 초안입니다.`,
    demand_forecast: isB2b
      ? "반복 업무를 줄여 시간이나 비용을 아끼는 문제라면 소규모 팀에서도 수요를 확인할 여지가 있습니다. 다만 실제 구매 의지는 예산권자와 반복 빈도를 먼저 확인해야 합니다."
      : "개인이 자주 겪고 직접 불편을 느끼는 문제라면 초기 관심은 만들 수 있습니다. 다만 앱 설치나 결제까지 이어지는지는 별도 확인이 필요합니다.",
    competition: competitionHint,
    saturation: "비슷한 문제를 넓게 해결하는 도구는 이미 많을 수 있습니다. 좁은 사용자, 좁은 상황, 빠른 실행 결과로 포화된 범용 시장을 피하는 전략이 필요합니다.",
    entry_barriers: barrierHint,
    alternatives: "사용자는 새 앱을 쓰기 전에 스프레드시트, 메모, 이메일, 카카오톡, 기존 SaaS 조합으로 버티고 있을 수 있습니다. 이 대체 흐름보다 확실히 덜 귀찮아야 합니다.",
    market_signals: [
      {
        label: "반복 문제",
        finding: state.signal || "사용자 입력에서 반복 문제나 비용 절감 신호를 더 확인해야 합니다.",
      },
      {
        label: "구매 의향",
        finding: isB2b
          ? "팀 시간 절감이나 담당자 업무 감소가 예산과 연결되는지 확인해야 합니다."
          : "사용자가 실제로 돈을 내거나 행동을 바꿀 만큼 불편한지 확인해야 합니다.",
      },
    ],
    competitor_map: [
      {
        name: isDevelopmentHandoffSurface
          ? "제작 도구의 AI 기능"
          : isAutomationSurface
            ? "스프레드시트/노코드 자동화"
            : isMobileSurface
              ? "모바일 메모/알림 앱"
              : isB2b
                ? "스프레드시트/노코드 운영"
                : "메모/알림 앱",
        category: "기존 대체재",
        threat: "medium",
        note: "새 서비스가 이 대체 흐름보다 덜 번거롭다는 점을 보여줘야 합니다.",
      },
      {
        name: isDevelopmentHandoffSurface
          ? "문서 기반 제작 전달 서비스"
          : isAutomationSurface
            ? "Zapier/Make 같은 범용 자동화 도구"
            : isB2b
              ? "범용 CRM/업무 자동화 도구"
              : "기존 플랫폼 내장 기능",
        category: "범용 경쟁군",
        threat: "medium",
        note: "범용 기능과 직접 경쟁하기보다 좁은 상황에서 빠른 결과를 보여주는 편이 안전합니다.",
      },
    ],
    entry_barrier_checks: [
      {
        label: "사용자 전환",
        severity: "medium",
        note: "이미 쓰는 도구에서 새 흐름으로 옮겨올 만큼 분명한 이점이 필요합니다.",
      },
      {
        label: isSensitive ? "신뢰와 개인정보" : "초기 유통",
        severity: isSensitive || isDevelopmentHandoffSurface ? "high" : "medium",
        note: isSensitive
          ? "민감정보를 다룬다면 저장 범위, 권한, 책임 경계를 먼저 설명해야 합니다."
          : isDevelopmentHandoffSurface
            ? "제작 도구로 넘긴 결과가 실제로 재현되는지 작은 샘플 프로젝트로 확인해야 합니다."
          : "초기 사용자를 어디서 만날지와 첫 전환 경로를 확인해야 합니다.",
      },
    ],
    research_queries: [
      `${idea.name || idea.one_liner} 경쟁 서비스`,
      `${idea.target_user || "타깃 사용자"} 문제 해결 대체재`,
      `${idea.one_liner || idea.name} 가격 지불 의향`,
    ],
    recommendation,
    confidence: "low",
    next_action: isSensitive
      ? "민감정보를 저장하지 않는 설명 페이지나 인터뷰 스크립트로 신뢰와 필요성을 먼저 확인하세요."
      : "가장 비슷한 대체재 5개를 비교하고, 타깃 사용자 5명에게 현재 해결 방식과 지불 의향을 확인하세요.",
    caveat: "웹 검색 또는 외부 데이터가 반영되지 않은 추정 초안입니다. 실제 시장 규모, 점유율, 경쟁사 수치는 출처 확인 후 보정해야 합니다.",
    sources: [
      {
        title: "사용자 입력 기반 추정",
        url: "",
        reason,
        source_type: "user_input",
        strength: "low",
      },
    ],
  };
}

export async function POST(request: Request) {
  const rateLimitResponse = enforceAiRouteRateLimit(request, {
    limit: 20,
    route: "ideas-market-scan",
    windowMs: 10 * 60_000,
  });

  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  let body: RequestBody;

  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: "JSON body is required." }, { status: 400 });
  }

  const idea = toIdea(body.idea);

  if (!idea) {
    return NextResponse.json({ error: "idea is required." }, { status: 400 });
  }

  const state = toState(body.state);
  const score = toNumber(body.score);
  const risks = toStringList(body.risks);
  const experiments = toStringList(body.experiments);
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({
      mode: "local_estimate",
      model: null,
      scan: createFallbackScan({
        idea,
        state,
        score,
        reason: "OPENAI_API_KEY가 없어 웹 검색 없이 로컬 기준으로 작성했습니다.",
      }),
    });
  }

  const model = process.env.OPENAI_MARKET_SCAN_MODEL || process.env.OPENAI_IDEA_MODEL || process.env.OPENAI_MODEL || "gpt-5-mini";
  const userPrompt = `아이디어:
- 이름: ${idea.name}
- 설명: ${idea.one_liner || "미정"}
- 대상 사용자: ${idea.target_user || "미정"}
- 구매자: ${idea.buyer || "미정"}
- 권장 제작 형태: ${idea.product_surface || "미정"}

현재 내부 평가:
- 점수: ${score ?? "미정"}
- 수요 신호: ${state.signal || "미정"}
- 리스크 요약: ${state.risk_summary || "미정"}
- 추가로 확인할 내용: ${state.next_evidence || "미정"}

저장된 리스크:
${risks.length > 0 ? risks.map((risk) => `- ${risk}`).join("\n") : "- 없음"}

저장된 하위 검증 계획:
${experiments.length > 0 ? experiments.map((experiment) => `- ${experiment}`).join("\n") : "- 없음"}`;

  const openaiResponse = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      max_output_tokens: 6000,
      reasoning: {
        effort: "low",
      },
      text: {
        format: {
          type: "json_schema",
          name: "venture_market_scan",
          strict: true,
          schema: marketScanSchema,
        },
      },
      tools: [
        {
          type: "web_search",
          search_context_size: "medium",
          user_location: {
            type: "approximate",
            country: "KR",
            timezone: "Asia/Seoul",
          },
        },
      ],
      tool_choice: "required",
      include: ["web_search_call.action.sources"],
      input: [
        {
          role: "developer",
          content: [
            {
              type: "input_text",
              text:
                "You are a market research assistant for an app venture validation console. Use web search before answering. Write natural Korean. Do not invent precise market share, market size, or saturation numbers. If public sources are weak, say it is an estimate. Compare competitors, substitutes, saturation, and entry barriers according to the requested production surface: web app, mobile app, automation workflow, operator console, or development-tool/MCP handoff. Cover demand forecast, competition, saturation, entry barriers, alternatives, market signals, competitor map, entry-barrier checks, follow-up research queries, recommendation, confidence, next action, caveat, and sources. Return only public HTTP(S) references in sources when web search ran; do not put user input, internal assumptions, or empty URLs in sources. Mention input-derived assumptions in caveat or market signals instead. For each source, classify source_type as primary, secondary, directory, news, or unknown, and strength as low, medium, or high based on how directly it supports the finding. Keep findings specific enough to become a saved research note for a build-ready product package.",
            },
          ],
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: userPrompt,
            },
          ],
        },
      ],
    }),
  });

  const payload = (await openaiResponse.json().catch(() => ({}))) as OpenAIResponse;

  if (!openaiResponse.ok) {
    return NextResponse.json({
      mode: "local_estimate",
      model,
      scan: createFallbackScan({
        idea,
        state,
        score,
        reason: getOpenAIErrorMessage(payload) ?? `OpenAI request failed with HTTP ${openaiResponse.status}.`,
      }),
    });
  }

  const outputText = extractOutputText(payload);
  const parsed = outputText ? parseStructuredJson(outputText) : null;
  const scan = toMarketScan(parsed);

  if (!scan) {
    return NextResponse.json({
      mode: "local_estimate",
      model,
      scan: createFallbackScan({
        idea,
        state,
        score,
        reason: getOpenAIParseFailureReason(payload, outputText),
      }),
    });
  }

  const payloadSources = collectSourcesFromPayload(payload);
  const mergedSources = mergePublicSources(scan.sources, payloadSources);

  return NextResponse.json({
    mode: "openai_web",
    model,
    scan: {
      ...scan,
      sources: mergedSources.length > 0 ? mergedSources : scan.sources,
    },
  });
}
