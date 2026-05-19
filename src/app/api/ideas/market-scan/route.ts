import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_TEXT_LENGTH = 1200;
const MAX_LIST_ITEMS = 8;

type DecisionStatus = "pending" | "research_more" | "ship" | "pivot" | "kill";
type ConfidenceLevel = "low" | "medium" | "high";

type RequestIdea = {
  name: string;
  one_liner: string;
  target_user: string;
  buyer: string;
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
};

type MarketScan = {
  summary: string;
  demand_forecast: string;
  competition: string;
  saturation: string;
  entry_barriers: string;
  alternatives: string;
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
        },
        required: ["title", "url", "reason"],
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

function normalizeDecision(value: unknown): DecisionStatus {
  return value === "pending" || value === "research_more" || value === "ship" || value === "pivot" || value === "kill"
    ? value
    : "research_more";
}

function normalizeConfidence(value: unknown): ConfidenceLevel {
  return value === "low" || value === "medium" || value === "high" ? value : "low";
}

function toMarketScanSource(value: unknown): MarketScanSource | null {
  if (!isRecord(value)) {
    return null;
  }

  const source = {
    title: toText(value.title, 160),
    url: toText(value.url, 500),
    reason: toText(value.reason, 240),
  };

  return source.title || source.url ? source : null;
}

function toMarketScan(value: unknown): MarketScan | null {
  if (!isRecord(value)) {
    return null;
  }

  const sources = Array.isArray(value.sources)
    ? value.sources.map(toMarketScanSource).filter((source): source is MarketScanSource => Boolean(source)).slice(0, 5)
    : [];

  const scan = {
    summary: toText(value.summary, 700),
    demand_forecast: toText(value.demand_forecast, 900),
    competition: toText(value.competition, 900),
    saturation: toText(value.saturation, 900),
    entry_barriers: toText(value.entry_barriers, 900),
    alternatives: toText(value.alternatives, 900),
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
      });
    }

    Object.values(value).forEach(visit);
  }

  visit(payload);
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
  const text = `${idea.name} ${idea.one_liner} ${idea.target_user} ${idea.buyer} ${state.signal} ${state.risk_summary} ${state.next_evidence}`;
  const isSensitive = /개인정보|비밀번호|유언|상속|의료|건강|금융|보험|법무|계약|결제|신용|상담/.test(text);
  const isB2b = /B2B|기업|팀|사내|업무|운영|CS|리드|파이프라인|회의|자동화/.test(text);
  const isConsumer = /개인|사용자|가족|구독|리뷰|예약|이커머스|지역/.test(text);
  const scoreHint = score === null ? "" : `현재 내부 사업성 점수는 ${score}점입니다. `;
  const competitionHint = isB2b
    ? "업무 자동화, CRM, 노코드 툴, 기존 스프레드시트 운영이 대체재가 될 가능성이 큽니다."
    : isConsumer
      ? "소비자 앱, 메모/알림 앱, 기존 플랫폼 기능이 대체재가 될 가능성이 큽니다."
      : "범용 SaaS, 수동 운영, 기존 업무 도구가 대체재가 될 가능성이 큽니다.";
  const barrierHint = isSensitive
    ? "개인정보, 신뢰, 법적 책임 설명이 진입장벽입니다. 초기 검증은 민감정보 저장 없이 수요와 신뢰 문구를 먼저 확인하는 편이 안전합니다."
    : "기술 장벽보다 첫 사용자 모집, 기존 습관 전환, 명확한 차별화가 더 큰 장벽일 가능성이 큽니다.";
  const recommendation: DecisionStatus = isSensitive ? "research_more" : score !== null && score >= 22 ? "ship" : "research_more";

  return {
    summary: `${scoreHint}현재 정보만 보면 시장성 판단은 아직 확정이 아니라 검증 전 초안입니다.`,
    demand_forecast: isB2b
      ? "반복 업무를 줄여 시간이나 비용을 아끼는 문제라면 소규모 팀에서도 수요를 확인할 여지가 있습니다. 다만 실제 구매 의지는 예산권자와 반복 빈도를 먼저 확인해야 합니다."
      : "개인이 자주 겪고 직접 불편을 느끼는 문제라면 초기 관심은 만들 수 있습니다. 다만 앱 설치나 결제까지 이어지는지는 별도 확인이 필요합니다.",
    competition: competitionHint,
    saturation: "비슷한 문제를 넓게 해결하는 도구는 이미 많을 수 있습니다. 좁은 사용자, 좁은 상황, 빠른 실행 결과로 포화된 범용 시장을 피하는 전략이 필요합니다.",
    entry_barriers: barrierHint,
    alternatives: "사용자는 새 앱을 쓰기 전에 스프레드시트, 메모, 이메일, 카카오톡, 기존 SaaS 조합으로 버티고 있을 수 있습니다. 이 대체 흐름보다 확실히 덜 귀찮아야 합니다.",
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
      },
    ],
  };
}

export async function POST(request: Request) {
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
          type: "web_search_preview",
          search_context_size: "medium",
          user_location: {
            type: "approximate",
            country: "KR",
            timezone: "Asia/Seoul",
          },
        },
      ],
      tool_choice: "auto",
      include: ["web_search_call.action.sources"],
      input: [
        {
          role: "developer",
          content: [
            {
              type: "input_text",
              text:
                "You are a market research assistant for an app venture validation console. Use web search when useful. Write natural Korean. Do not invent precise market share or market size. If public sources are weak, say it is an estimate. Cover demand forecast, competition, saturation, entry barriers, alternatives, recommendation, confidence, next action, caveat, and sources.",
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
        reason: "OpenAI 응답을 시장성 점검 형식으로 읽지 못해 로컬 기준으로 작성했습니다.",
      }),
    });
  }

  const payloadSources = collectSourcesFromPayload(payload);
  const mergedSources = [...scan.sources, ...payloadSources]
    .filter((source, index, allSources) => allSources.findIndex((item) => item.url === source.url && item.title === source.title) === index)
    .slice(0, 5);

  return NextResponse.json({
    mode: "openai_web",
    model,
    scan: {
      ...scan,
      sources: mergedSources.length > 0 ? mergedSources : scan.sources,
    },
  });
}
