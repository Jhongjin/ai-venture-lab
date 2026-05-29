import type { Json } from "@/lib/supabase/types";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { UPGRADE_INTEREST_EVENT_CATEGORY, UPGRADE_INTEREST_EVENT_NAME } from "@/lib/upgrade-interest";

export type UpgradeInterestEvent = {
  actorId: string | null;
  id: string;
  intent: string;
  occurredAt: string;
  source: string;
};

export type UpgradeInterestSummary = {
  error: string | null;
  intentCounts: Record<string, number>;
  latestEvents: UpgradeInterestEvent[];
  sourceCounts: Record<string, number>;
  totalCount: number;
  uniqueActorCount: number;
};

type UpgradeInterestRow = {
  actor_id: string | null;
  id: string;
  occurred_at: string;
  properties: Json;
};

const UPGRADE_INTEREST_RECENT_LIMIT = 100;

function isJsonObject(value: Json): value is { [key: string]: Json | undefined } {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function getPropertyText(properties: Json, key: string, fallback: string) {
  if (!isJsonObject(properties)) {
    return fallback;
  }

  const value = properties[key];

  return typeof value === "string" && value.trim() ? value.trim().slice(0, 100) : fallback;
}

function incrementCount(counts: Record<string, number>, key: string) {
  counts[key] = (counts[key] ?? 0) + 1;
}

export async function readUpgradeInterestSummary(): Promise<UpgradeInterestSummary> {
  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return {
      error: "Supabase is not configured.",
      intentCounts: {},
      latestEvents: [],
      sourceCounts: {},
      totalCount: 0,
      uniqueActorCount: 0,
    };
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      error: "Login is required before reading upgrade interest.",
      intentCounts: {},
      latestEvents: [],
      sourceCounts: {},
      totalCount: 0,
      uniqueActorCount: 0,
    };
  }

  const [countResult, recentEventsResult] = await Promise.all([
    supabase
      .from("telemetry_events")
      .select("id", { count: "exact", head: true })
      .eq("event_name", UPGRADE_INTEREST_EVENT_NAME)
      .eq("event_category", UPGRADE_INTEREST_EVENT_CATEGORY),
    supabase
      .from("telemetry_events")
      .select("id, actor_id, properties, occurred_at")
      .eq("event_name", UPGRADE_INTEREST_EVENT_NAME)
      .eq("event_category", UPGRADE_INTEREST_EVENT_CATEGORY)
      .order("occurred_at", { ascending: false })
      .limit(UPGRADE_INTEREST_RECENT_LIMIT),
  ]);

  if (recentEventsResult.error) {
    return {
      error: `Could not read Pro interest signals: ${recentEventsResult.error.message}`,
      intentCounts: {},
      latestEvents: [],
      sourceCounts: {},
      totalCount: 0,
      uniqueActorCount: 0,
    };
  }

  const rows = (recentEventsResult.data ?? []) as UpgradeInterestRow[];
  const sourceCounts: Record<string, number> = {};
  const intentCounts: Record<string, number> = {};
  const actorIds = new Set<string>();

  const latestEvents = rows.map((event) => {
    const source = getPropertyText(event.properties, "source", "unknown");
    const intent = getPropertyText(event.properties, "intent", "unknown");

    incrementCount(sourceCounts, source);
    incrementCount(intentCounts, intent);

    if (event.actor_id) {
      actorIds.add(event.actor_id);
    }

    return {
      actorId: event.actor_id,
      id: event.id,
      intent,
      occurredAt: event.occurred_at,
      source,
    };
  });

  return {
    error: countResult.error ? `Could not count Pro interest signals: ${countResult.error.message}` : null,
    intentCounts,
    latestEvents,
    sourceCounts,
    totalCount: countResult.count ?? latestEvents.length,
    uniqueActorCount: actorIds.size,
  };
}
