"use server";

import { getSupabaseServerClient } from "@/lib/supabase/server";
import { FREE_MONTHLY_CREDITS, IDEA_BUILD_PASS_CREDITS } from "@/lib/billing";
import {
  UPGRADE_INTEREST_EVENT_CATEGORY,
  UPGRADE_INTEREST_EVENT_NAME,
  buildUpgradeInterestAlreadyRecordedMessage,
  buildUpgradeInterestDedupeProperties,
  buildUpgradeInterestLoginRequiredMessage,
  buildUpgradeInterestSaveFailedMessage,
  buildUpgradeInterestSavedMessage,
  buildUpgradeInterestStorageUnavailableMessage,
  buildUpgradeInterestTelemetryProperties,
  getUpgradeInterestDedupeSinceIso,
  normalizeUpgradeInterestInput,
  type UpgradeInterestInput,
} from "@/lib/upgrade-interest";

type UpgradeInterestResult = {
  ok: boolean;
  message: string;
};

export async function recordProfileUpgradeInterest(input?: UpgradeInterestInput): Promise<UpgradeInterestResult> {
  const supabase = await getSupabaseServerClient();
  const { intent, source } = normalizeUpgradeInterestInput(input);

  if (!supabase) {
    return {
      ok: false,
      message: buildUpgradeInterestStorageUnavailableMessage(),
    };
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      ok: false,
      message: buildUpgradeInterestLoginRequiredMessage(),
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
      message: buildUpgradeInterestAlreadyRecordedMessage(),
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
      message: buildUpgradeInterestSaveFailedMessage(),
    };
  }

  return {
    ok: true,
    message: buildUpgradeInterestSavedMessage(),
  };
}
