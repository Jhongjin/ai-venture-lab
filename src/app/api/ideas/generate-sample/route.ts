import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_EXISTING_IDEAS = 20;

type ExistingIdeaContext = {
  name: string;
  one_liner: string;
  target_user: string;
  buyer: string;
};

type GeneratedSampleIdea = {
  title: string;
  pain: string;
  solution: string;
  targetUser: string;
  buyer: string;
  firstValidation: string;
  productSurface: ProductSurfaceKey;
  firstBuild: string;
};

type ProductSurfaceKey = "web_app" | "mobile_app" | "web_site" | "automation" | "operator_console";

type RequestBody = {
  existingIdeas?: unknown;
};

type OpenAIContentItem = {
  type?: unknown;
  text?: unknown;
};

type OpenAIOutputItem = {
  content?: unknown;
};

type OpenAIResponse = {
  output_text?: unknown;
  output?: unknown;
  error?: unknown;
};

const ideaThemes = [
  "소상공인 운영 자동화",
  "1인 창업자의 고객 응대",
  "회의 기록을 실행 항목으로 바꾸는 업무",
  "B2B 세일즈 리드 정리",
  "교육 운영과 과제 관리",
  "콘텐츠 제작 반복 업무",
  "프리랜서 견적과 계약 전 확인",
  "사내 지식 검색과 온보딩",
  "이커머스 CS와 리뷰 분석",
  "지역 기반 예약 업무",
  "노코드 자동화 설계",
  "프로덕트 피드백 정리",
  "채용이 아닌 내부 업무 배치",
  "법무 자문이 아닌 계약 요청 접수",
  "금융 조언이 아닌 지출 분류 운영",
];

const productSurfaceLabels: Record<ProductSurfaceKey, string> = {
  web_app: "웹 서비스",
  mobile_app: "모바일 앱",
  web_site: "웹사이트",
  automation: "업무 자동화",
  operator_console: "운영 콘솔",
};

const allowedProductSurfaceKeys = Object.keys(productSurfaceLabels) as ProductSurfaceKey[];

const sampleIdeasSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    ideas: {
      type: "array",
      minItems: 3,
      maxItems: 3,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          title: { type: "string" },
          pain: { type: "string" },
          solution: { type: "string" },
          targetUser: { type: "string" },
          buyer: { type: "string" },
          firstValidation: { type: "string" },
          productSurface: {
            type: "string",
            enum: ["web_app", "mobile_app", "web_site", "automation", "operator_console"],
          },
          firstBuild: { type: "string" },
        },
        required: ["title", "pain", "solution", "targetUser", "buyer", "firstValidation", "productSurface", "firstBuild"],
      },
    },
  },
  required: ["ideas"],
} as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toText(value: unknown, maxLength = 280) {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim().slice(0, maxLength) : "";
}

function toExistingIdeaContext(value: unknown): ExistingIdeaContext[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(isRecord)
    .slice(0, MAX_EXISTING_IDEAS)
    .map((idea) => ({
      name: toText(idea.name, 80),
      one_liner: toText(idea.one_liner, 220),
      target_user: toText(idea.target_user, 160),
      buyer: toText(idea.buyer, 160),
    }))
    .filter((idea) => idea.name || idea.one_liner);
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
      // Try the next candidate shape.
    }
  }

  return null;
}

function pickRandomItems<T>(items: T[], count: number) {
  const pool = [...items];
  const picked: T[] = [];

  while (pool.length > 0 && picked.length < count) {
    const index = Math.floor(Math.random() * pool.length);
    const [item] = pool.splice(index, 1);
    picked.push(item);
  }

  return picked;
}

function toProductSurfaceKey(value: unknown): ProductSurfaceKey {
  if (typeof value === "string" && allowedProductSurfaceKeys.includes(value as ProductSurfaceKey)) {
    return value as ProductSurfaceKey;
  }

  const text = toText(value, 80).toLowerCase();

  if (/모바일|앱|푸시|알림|위치|카메라/.test(text)) {
    return "mobile_app";
  }

  if (/랜딩|홈페이지|웹사이트|사이트|신청/.test(text)) {
    return "web_site";
  }

  if (/자동화|워크플로|리포트|메일|분류/.test(text)) {
    return "automation";
  }

  if (/콘솔|관리자|운영|대시보드|배정|승인/.test(text)) {
    return "operator_console";
  }

  return "web_app";
}

function getFallbackFirstBuild(productSurface: ProductSurfaceKey) {
  switch (productSurface) {
    case "mobile_app":
      return "핵심 모바일 화면과 알림/권한 흐름";
    case "web_site":
      return "랜딩 페이지와 신청 폼";
    case "automation":
      return "수동 운영이 가능한 작업 콘솔과 자동화 결과 비교";
    case "operator_console":
      return "목록, 상세, 상태 변경이 있는 운영 콘솔";
    case "web_app":
    default:
      return "로그인, 입력, 결과 확인, 저장까지 이어지는 웹 서비스 흐름";
  }
}

function toGeneratedSampleIdea(value: unknown): GeneratedSampleIdea | null {
  if (!isRecord(value)) {
    return null;
  }

  const productSurface = toProductSurfaceKey(
    value.productSurface || value.product_surface || value["결과물 형태"] || value["예상 결과물"],
  );
  const idea = {
    title: toText(value.title, 80) || toText(value.name, 80) || toText(value["제목"], 80),
    pain:
      toText(value.pain, 220) ||
      toText(value.problem, 220) ||
      toText(value.painPoint, 220) ||
      toText(value["문제"], 220),
    solution:
      toText(value.solution, 240) ||
      toText(value.one_liner, 240) ||
      toText(value.oneLiner, 240) ||
      toText(value["해결"], 240),
    targetUser:
      toText(value.targetUser, 160) ||
      toText(value.target_user, 160) ||
      toText(value["대상"], 160) ||
      toText(value["대상 사용자"], 160),
    buyer: toText(value.buyer, 160) || toText(value["구매자"], 160),
    firstValidation:
      toText(value.firstValidation, 220) ||
      toText(value.first_validation, 220) ||
      toText(value.validation, 220) ||
      toText(value["첫 검증"], 220) ||
      toText(value["먼저 확인할 것"], 220),
    productSurface,
    firstBuild:
      toText(value.firstBuild, 220) ||
      toText(value.first_build, 220) ||
      toText(value["첫 제작 형태"], 220) ||
      toText(value["처음 만들 것"], 220) ||
      getFallbackFirstBuild(productSurface),
  };

  return idea.title && idea.pain && idea.solution ? idea : null;
}

function buildSampleIdeaSource(ideas: GeneratedSampleIdea[]) {
  return ideas
    .map(
      (idea, index) => `아이디어 ${index + 1}: ${idea.title}
문제: ${idea.pain}
해결: ${idea.solution}
대상: ${idea.targetUser}
구매자: ${idea.buyer}
예상 결과물: ${productSurfaceLabels[idea.productSurface]}
첫 제작 형태: ${idea.firstBuild}
먼저 확인할 것: ${idea.firstValidation}`,
    )
    .join("\n\n");
}

function cleanGeneratedLine(value: string) {
  return value
    .replace(/^[-*]\s*/, "")
    .replace(/^\d+[\.\)]\s*/, "")
    .replace(/^#{1,4}\s*/, "")
    .replace(/^아이디어\s*\d*\s*[:：-]?\s*/, "")
    .replace(/\*\*/g, "")
    .trim();
}

function readGeneratedField(chunk: string, labels: string[]) {
  const escapedLabels = labels.map((label) => label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
  const pattern = new RegExp(`(?:^|\\n)\\s*(?:[-*]\\s*)?(?:${escapedLabels})\\s*[:：]\\s*([^\\n]+)`, "i");
  return toText(chunk.match(pattern)?.[1], 240);
}

function getGeneratedIdeasFromText(text: string): GeneratedSampleIdea[] {
  const strippedText = text.replace(/```(?:json)?|```/gi, "").trim();
  const chunks = strippedText
    .split(/(?=^\s*(?:[-*]\s*)?(?:아이디어\s*\d+|\d+[\.\)]|#{1,4}\s*아이디어))/gim)
    .map((chunk) => chunk.trim())
    .filter(Boolean);

  return chunks
    .map((chunk) => {
      const lines = chunk
        .split(/\n+/)
        .map(cleanGeneratedLine)
        .filter(Boolean);
      const title =
        readGeneratedField(chunk, ["제목", "title", "name"]) ||
        toText(lines.find((line) => !/^(문제|해결|대상|구매자|첫 검증|먼저 확인할 것|pain|solution|target|buyer)/i.test(line)), 80);
      const pain = readGeneratedField(chunk, ["문제", "페인 포인트", "pain", "problem"]);
      const solution = readGeneratedField(chunk, ["해결", "솔루션", "solution"]);
      const targetUser = readGeneratedField(chunk, ["대상", "대상 사용자", "targetUser", "target user"]);
      const buyer = readGeneratedField(chunk, ["구매자", "buyer"]);
      const firstValidation = readGeneratedField(chunk, ["첫 검증", "먼저 확인할 것", "firstValidation", "validation"]);
      const productSurface = readGeneratedField(chunk, ["예상 결과물", "결과물 형태", "productSurface", "product surface"]);
      const firstBuild = readGeneratedField(chunk, ["첫 제작 형태", "처음 만들 것", "firstBuild", "first build"]);

      return toGeneratedSampleIdea({
        title,
        pain,
        solution,
        targetUser,
        buyer,
        firstValidation,
        productSurface,
        firstBuild,
      });
    })
    .filter((idea): idea is GeneratedSampleIdea => Boolean(idea))
    .slice(0, 3);
}

function getRawIdeaItems(parsed: unknown) {
  if (Array.isArray(parsed)) {
    return parsed;
  }

  if (!isRecord(parsed)) {
    return [];
  }

  if (Array.isArray(parsed.ideas)) {
    return parsed.ideas;
  }

  if (Array.isArray(parsed.candidates)) {
    return parsed.candidates;
  }

  if (Array.isArray(parsed.items)) {
    return parsed.items;
  }

  const objectValues = Object.values(parsed).filter(isRecord);
  return objectValues.length >= 3 ? objectValues : [];
}

export async function POST(request: Request) {
  let body: RequestBody = {};

  try {
    body = (await request.json()) as RequestBody;
  } catch {
    body = {};
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "OPENAI_API_KEY is not configured." }, { status: 503 });
  }

  const existingIdeas = toExistingIdeaContext(body.existingIdeas);
  const existingIdeaContext =
    existingIdeas.length > 0
      ? existingIdeas
          .map(
            (idea, index) =>
              `${index + 1}. ${idea.name} / ${idea.one_liner} / 대상: ${idea.target_user || "미정"} / 구매자: ${idea.buyer || "미정"}`,
          )
          .join("\n")
      : "저장된 기존 아이디어 없음";
  const seed = randomUUID();
  const themes = pickRandomItems(ideaThemes, 5);
  const model = process.env.OPENAI_IDEA_MODEL || process.env.OPENAI_MODEL || "gpt-5-mini";

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
          name: "random_venture_sample_ideas",
          strict: true,
          schema: sampleIdeasSchema,
        },
      },
      input: [
        {
          role: "developer",
          content: [
            {
              type: "input_text",
              text:
                "You generate practical Korean app, web, automation, or operator-console ideas for a venture validation workspace. Generate exactly 3 distinct ideas. Make each idea concrete enough to validate in 7 days. Classify each idea with productSurface as one of web_app, mobile_app, web_site, automation, or operator_console, and write a firstBuild that describes the smallest useful first build. Cursor, Codex, Claude Code, Antigravity, and MCP are later delivery options, not productSurface values. Avoid repeating subscription management, caregiving console, or conversation coach examples. Avoid legal, medical, financial advice, hiring decisions, counseling, or other heavily regulated services unless framed as low-risk internal operations. Write natural Korean that a real product user would understand.",
            },
          ],
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `랜덤 시드: ${seed}
이번 생성 방향: ${themes.join(", ")}
기존 포트폴리오:
${existingIdeaContext}

서로 겹치지 않는 아이디어 3개를 만들어주세요. 각 아이디어는 문제, 해결 방식, 대상 사용자, 구매자, 결과물 형태, 첫 제작 형태, 첫 검증 방법이 바로 드러나야 합니다.`,
            },
          ],
        },
      ],
    }),
  });

  const payload = (await openaiResponse.json().catch(() => ({}))) as OpenAIResponse;

  if (!openaiResponse.ok) {
    return NextResponse.json(
      { error: getOpenAIErrorMessage(payload) ?? `OpenAI request failed with HTTP ${openaiResponse.status}.` },
      { status: 502 },
    );
  }

  const outputText = extractOutputText(payload);

  if (!outputText) {
    return NextResponse.json({ error: "OpenAI response did not include structured text output." }, { status: 502 });
  }

  try {
    const parsed = parseStructuredJson(outputText);

    const rawIdeaItems = getRawIdeaItems(parsed);

    const ideas = rawIdeaItems.map(toGeneratedSampleIdea).filter((idea): idea is GeneratedSampleIdea => Boolean(idea)).slice(0, 3);
    const freeTextIdeas = ideas.length === 3 ? [] : getGeneratedIdeasFromText(outputText);
    const mergedIdeas = [...ideas, ...freeTextIdeas]
      .filter((idea, index, allIdeas) => allIdeas.findIndex((item) => item.title === idea.title) === index)
      .slice(0, 3);

    if (mergedIdeas.length !== 3) {
      return NextResponse.json({ error: "OpenAI structured output did not contain exactly 3 usable ideas." }, { status: 502 });
    }

    return NextResponse.json({
      mode: "openai",
      model,
      seed,
      themes,
      ideas: mergedIdeas,
      source: buildSampleIdeaSource(mergedIdeas),
    });
  } catch {
    return NextResponse.json({ error: "OpenAI structured output could not be processed." }, { status: 502 });
  }
}
