"use server";

import { getSupabaseServerClient } from "@/lib/supabase/server";
import { FREE_MONTHLY_CREDITS, IDEA_BUILD_PASS_CREDITS } from "@/lib/billing";
import {
  UPGRADE_INTEREST_EVENT_CATEGORY,
  UPGRADE_INTEREST_EVENT_NAME,
  buildUpgradeInterestDedupeProperties,
  buildUpgradeInterestTelemetryProperties,
  getUpgradeInterestDedupeSinceIso,
  normalizeUpgradeInterestIntent,
  normalizeUpgradeInterestSource,
} from "@/lib/upgrade-interest";

type UpgradeInterestResult = {
  ok: boolean;
  message: string;
};

type UpgradeInterestInput = {
  intent?: string;
  source?: string;
};

function normalizeUpgradeInterestInput(input: UpgradeInterestInput | undefined) {
  const source = normalizeUpgradeInterestSource(input?.source);
  const intent = normalizeUpgradeInterestIntent(input?.intent);

  return { intent, source };
}

export async function recordProfileUpgradeInterest(input?: UpgradeInterestInput): Promise<UpgradeInterestResult> {
  const supabase = await getSupabaseServerClient();
  const { intent, source } = normalizeUpgradeInterestInput(input);

  if (!supabase) {
    return {
      ok: false,
      message: "관심 등록을 저장할 수 없습니다. 잠시 후 다시 시도해 주세요.",
    };
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      ok: false,
      message: "로그인 후 다시 시도해 주세요.",
    };
  }

  const dedupeSince = getUpgradeInterestDedupeSinceIso();
  const { data: recentEvents, error: recentEventError } = await supabase
    .from("telemetry_events")
    .select("id")
    .eq("actor_id", user.id)
    .eq("event_name", UPGRADE_INTEREST_EVENT_NAME)
    .eq("event_category", UPGRADE_INTEREST_EVENT_CATEGORY)
    .gte("occurred_at", dedupeSince)
    .contains("properties", buildUpgradeInterestDedupeProperties({ intent, source }))
    .limit(1);

  if (!recentEventError && recentEvents && recentEvents.length > 0) {
    return {
      ok: true,
      message: "이미 Pro 관심이 기록됐습니다. 중복 저장 없이 유지합니다.",
    };
  }

  const { error: insertError } = await supabase.from("telemetry_events").insert({
    actor_id: user.id,
    event_name: UPGRADE_INTEREST_EVENT_NAME,
    event_category: UPGRADE_INTEREST_EVENT_CATEGORY,
    properties: buildUpgradeInterestTelemetryProperties({
      buildPassCost: IDEA_BUILD_PASS_CREDITS,
      freeMonthlyCredits: FREE_MONTHLY_CREDITS,
      intent,
      source,
    }),
  });

  if (insertError) {
    return {
      ok: false,
      message: "관심 등록을 저장하지 못했습니다. 다시 눌러 주세요.",
    };
  }

  return {
    ok: true,
    message: "Pro 관심이 기록됐습니다. 결제 없이 필요 시점을 남겼습니다.",
  };
}
