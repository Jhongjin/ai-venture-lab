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
};

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
        },
        required: ["title", "pain", "solution", "targetUser", "buyer", "firstValidation"],
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

function toGeneratedSampleIdea(value: unknown): GeneratedSampleIdea | null {
  if (!isRecord(value)) {
    return null;
  }

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
먼저 확인할 것: ${idea.firstValidation}`,
    )
    .join("\n\n");
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
      max_output_tokens: 2200,
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
                "You generate practical Korean app, web, or automation ideas for a venture validation workspace. Generate exactly 3 distinct ideas. Make each idea concrete enough to validate in 7 days. Avoid repeating subscription management, caregiving console, or conversation coach examples. Avoid legal, medical, financial advice, hiring decisions, counseling, or other heavily regulated services unless framed as low-risk internal operations. Write natural Korean that a real product user would understand.",
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

서로 겹치지 않는 아이디어 3개를 만들어주세요. 각 아이디어는 문제, 해결 방식, 대상 사용자, 구매자, 첫 검증 방법이 바로 드러나야 합니다.`,
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

    if (rawIdeaItems.length === 0) {
      return NextResponse.json({ error: "OpenAI structured output did not contain ideas." }, { status: 502 });
    }

    const ideas = rawIdeaItems.map(toGeneratedSampleIdea).filter((idea): idea is GeneratedSampleIdea => Boolean(idea)).slice(0, 3);

    if (ideas.length !== 3) {
      return NextResponse.json({ error: "OpenAI structured output did not contain exactly 3 usable ideas." }, { status: 502 });
    }

    return NextResponse.json({
      mode: "openai",
      model,
      seed,
      themes,
      ideas,
      source: buildSampleIdeaSource(ideas),
    });
  } catch {
    return NextResponse.json({ error: "OpenAI structured output could not be processed." }, { status: 502 });
  }
}
