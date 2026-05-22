import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Json } from "@/lib/supabase/types";

export const runtime = "nodejs";

const MAX_PROPERTY_KEYS = 24;
const MAX_PROPERTY_VALUE_LENGTH = 360;
const MAX_EVENT_NAME_LENGTH = 80;
const MAX_EVENT_CATEGORY_LENGTH = 40;
const EVENT_NAME_PATTERN = /^[a-z][a-z0-9_.:-]*$/;

type IngestBody = {
  ideaId?: unknown;
  eventName?: unknown;
  eventCategory?: unknown;
  source?: unknown;
  anonymousId?: unknown;
  sessionId?: unknown;
  occurredAt?: unknown;
  properties?: unknown;
};

function toText(value: unknown, maxLength = MAX_PROPERTY_VALUE_LENGTH) {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim().slice(0, maxLength) : "";
}

function toEventToken(value: unknown, fallback: string, maxLength: number) {
  const token = toText(value, maxLength).toLowerCase();

  return token && EVENT_NAME_PATTERN.test(token) ? token : fallback;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function sanitizeProperties(value: unknown): Record<string, Json> {
  if (!isRecord(value)) {
    return {};
  }

  const entries: Array<[string, Json]> = [];

  for (const [rawKey, rawValue] of Object.entries(value).slice(0, MAX_PROPERTY_KEYS)) {
    const key = rawKey.replace(/[^a-zA-Z0-9_.:-]/g, "_").slice(0, 80);

    if (!key) {
      continue;
    }

    if (typeof rawValue === "string") {
      entries.push([key, toText(rawValue)]);
      continue;
    }

    if (typeof rawValue === "number" && Number.isFinite(rawValue)) {
      entries.push([key, rawValue]);
      continue;
    }

    if (typeof rawValue === "boolean" || rawValue === null) {
      entries.push([key, rawValue]);
    }
  }

  return Object.fromEntries(entries);
}

function getProvidedSecret(request: Request) {
  const authorization = request.headers.get("authorization") ?? "";

  if (authorization.toLowerCase().startsWith("bearer ")) {
    return authorization.slice("bearer ".length).trim();
  }

  return request.headers.get("x-venture-telemetry-secret")?.trim() ?? "";
}

function hasValidSecret(providedSecret: string, configuredSecret: string) {
  if (!configuredSecret || !providedSecret) {
    return false;
  }

  const expectedDigest = createHmac("sha256", configuredSecret).update(configuredSecret).digest();
  const providedDigest = createHmac("sha256", configuredSecret).update(providedSecret).digest();

  return timingSafeEqual(expectedDigest, providedDigest);
}

function hashIdentifier(value: unknown, secret: string) {
  const text = toText(value, 260);

  if (!text) {
    return null;
  }

  return createHmac("sha256", secret).update(text).digest("hex").slice(0, 32);
}

function safeIsoDate(value: unknown) {
  const text = toText(value, 80);

  if (!text) {
    return new Date().toISOString();
  }

  const date = new Date(text);

  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

export async function POST(request: Request) {
  const configuredSecret = process.env.TELEMETRY_INGEST_SECRET ?? "";
  const providedSecret = getProvidedSecret(request);

  if (!hasValidSecret(providedSecret, configuredSecret)) {
    return NextResponse.json({ error: "Valid telemetry secret is required." }, { status: 401 });
  }

  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    return NextResponse.json({ error: "Supabase service role is not configured." }, { status: 503 });
  }

  let body: IngestBody;

  try {
    body = (await request.json()) as IngestBody;
  } catch {
    return NextResponse.json({ error: "JSON body is required." }, { status: 400 });
  }

  const ideaId = toText(body.ideaId, 80);

  if (!ideaId) {
    return NextResponse.json({ error: "ideaId is required." }, { status: 400 });
  }

  const eventName = toEventToken(body.eventName, "product_event", MAX_EVENT_NAME_LENGTH);
  const eventCategory = toEventToken(body.eventCategory, "product", MAX_EVENT_CATEGORY_LENGTH);
  const source = toText(body.source, 120) || "external_mvp";
  const occurredAt = safeIsoDate(body.occurredAt);
  const properties = sanitizeProperties(body.properties);
  const anonymousHash = hashIdentifier(body.anonymousId, configuredSecret);
  const sessionHash = hashIdentifier(body.sessionId, configuredSecret);
  const userAgentHash = hashIdentifier(request.headers.get("user-agent"), configuredSecret);
  const { data: idea, error: ideaError } = await supabase
    .from("ideas")
    .select("id, organization_id, created_by")
    .eq("id", ideaId)
    .single();

  if (ideaError || !idea) {
    return NextResponse.json({ error: "Linked idea was not found." }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("telemetry_events")
    .insert({
      organization_id: idea.organization_id,
      idea_id: idea.id,
      actor_id: idea.created_by,
      event_name: eventName,
      event_category: eventCategory,
      occurred_at: occurredAt,
      properties: {
        ...properties,
        source,
        adapter: "api.telemetry.ingest",
        anonymous_hash: anonymousHash,
        session_hash: sessionHash,
        user_agent_hash: userAgentHash,
      },
    })
    .select("id, occurred_at")
    .single();

  if (error) {
    return NextResponse.json({ error: "Telemetry event could not be saved." }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    eventId: data.id,
    occurredAt: data.occurred_at,
  });
}
