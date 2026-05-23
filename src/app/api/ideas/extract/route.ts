import { NextResponse } from "next/server";

const MAX_SOURCE_LENGTH = 24000;
const MAX_EXISTING_IDEAS = 20;

type ExistingIdeaContext = {
  name: string;
  one_liner: string;
  target_user: string;
  buyer: string;
};

type RequestBody = {
  source?: unknown;
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

function createFallbackResponse(error: string, fallbackStatus?: number) {
  return NextResponse.json({
    error,
    mode: "local_fallback",
    fallbackStatus: fallbackStatus ?? null,
  });
}

const ideaExtractionSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    candidates: {
      type: "array",
      minItems: 1,
      maxItems: 8,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          name: { type: "string" },
          one_liner: { type: "string" },
          target_user: { type: "string" },
          buyer: { type: "string" },
          signal: { type: "string" },
          risk_summary: { type: "string" },
          next_evidence: { type: "string" },
          assumptions: { type: "array", minItems: 3, maxItems: 4, items: { type: "string" } },
          validation_questions: { type: "array", minItems: 3, maxItems: 5, items: { type: "string" } },
          seven_day_experiment: { type: "string" },
          success_metric: { type: "string" },
          kill_criteria: { type: "string" },
          first_prototype_scope: { type: "string" },
          pricing_hypothesis: { type: "string" },
          product_surface: {
            type: "string",
            enum: ["web_app", "mobile_app", "web_site", "automation", "operator_console"],
          },
          product_surface_reason: { type: "string" },
        },
        required: [
          "name",
          "one_liner",
          "target_user",
          "buyer",
          "signal",
          "risk_summary",
          "next_evidence",
          "assumptions",
          "validation_questions",
          "seven_day_experiment",
          "success_metric",
          "kill_criteria",
          "first_prototype_scope",
          "pricing_hypothesis",
          "product_surface",
          "product_surface_reason",
        ],
      },
    },
  },
  required: ["candidates"],
} as const;

export async function POST(request: Request) {
  let body: RequestBody;

  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: "JSON body is required." }, { status: 400 });
  }

  const source = typeof body.source === "string" ? body.source.trim().slice(0, MAX_SOURCE_LENGTH) : "";

  if (!source) {
    return NextResponse.json({ error: "source is required." }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return createFallbackResponse(
      "OPENAI_API_KEY is not configured. Falling back to the local extraction engine is recommended.",
      503,
    );
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
          name: "venture_idea_candidates",
          strict: true,
          schema: ideaExtractionSchema,
        },
      },
      input: [
        {
          role: "developer",
          content: [
            {
              type: "input_text",
              text:
                "You extract app startup ideas from Korean or English notes. Return only grounded candidates. Prefer practical app/MVP ideas with target users, buyers, validation plans, risks, kill criteria, and a product_surface classification. product_surface must be one of web_app, mobile_app, web_site, automation, or operator_console. Choose the result type that should guide PRD, design, tech stack, implementation prompt, and handoff materials. Development tools such as Cursor, Codex, Claude Code, Antigravity, or MCP are delivery options, not product_surface values. Avoid inventing evidence not implied by the source. Keep every field concise but specific. Write Korean text except product_surface.",
            },
          ],
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `기존 포트폴리오:\n${existingIdeaContext}\n\n분석할 원문:\n${source}`,
            },
          ],
        },
      ],
    }),
  });

  const payload = (await openaiResponse.json().catch(() => ({}))) as OpenAIResponse;

  if (!openaiResponse.ok) {
    return createFallbackResponse(
      getOpenAIErrorMessage(payload) ?? `OpenAI request failed with HTTP ${openaiResponse.status}.`,
      openaiResponse.status,
    );
  }

  const outputText = extractOutputText(payload);

  if (!outputText) {
    return createFallbackResponse("OpenAI response did not include structured text output.", 502);
  }

  try {
    const parsed = JSON.parse(outputText) as unknown;

    if (!isRecord(parsed) || !Array.isArray(parsed.candidates)) {
      return createFallbackResponse("OpenAI structured output did not contain candidates.", 502);
    }

    return NextResponse.json({
      mode: "openai",
      model,
      candidates: parsed.candidates,
    });
  } catch {
    return createFallbackResponse("OpenAI structured output was not parseable JSON.", 502);
  }
}
