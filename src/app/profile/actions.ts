"use server";

import { getSupabaseServerClient } from "@/lib/supabase/server";
import { FREE_MONTHLY_CREDITS, IDEA_BUILD_PASS_CREDITS } from "@/lib/billing";

type UpgradeInterestResult = {
  ok: boolean;
  message: string;
};

type UpgradeInterestInput = {
  intent?: string;
  source?: string;
};

const allowedUpgradeInterestSources = new Set(["profile_credit_summary", "step5_credit_panel"]);
const allowedUpgradeInterestIntents = new Set(["insufficient_credits_for_build_pass", "repeated_production_packages"]);
const upgradeInterestDedupeWindowMs = 24 * 60 * 60 * 1000;

function normalizeUpgradeInterestInput(input: UpgradeInterestInput | undefined) {
  const source =
    input?.source && allowedUpgradeInterestSources.has(input.source) ? input.source : "profile_credit_summary";
  const intent =
    input?.intent && allowedUpgradeInterestIntents.has(input.intent)
      ? input.intent
      : "repeated_production_packages";

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

  const dedupeSince = new Date(Date.now() - upgradeInterestDedupeWindowMs).toISOString();
  const { data: recentEvents, error: recentEventError } = await supabase
    .from("telemetry_events")
    .select("id")
    .eq("actor_id", user.id)
    .eq("event_name", "upgrade_interest_clicked")
    .eq("event_category", "billing")
    .gte("occurred_at", dedupeSince)
    .contains("properties", { source, intent, plan: "pro" })
    .limit(1);

  if (!recentEventError && recentEvents && recentEvents.length > 0) {
    return {
      ok: true,
      message: "이미 관심 신호가 기록됐습니다. 중복 저장 없이 수요 신호로 유지합니다.",
    };
  }

  const { error: insertError } = await supabase.from("telemetry_events").insert({
    actor_id: user.id,
    event_name: "upgrade_interest_clicked",
    event_category: "billing",
    properties: {
      source,
      plan: "pro",
      intent,
      credit_model: {
        free_monthly_credits: FREE_MONTHLY_CREDITS,
        build_pass_cost: IDEA_BUILD_PASS_CREDITS,
      },
    },
  });

  if (insertError) {
    return {
      ok: false,
      message: "관심 등록을 저장하지 못했습니다. 다시 눌러 주세요.",
    };
  }

  return {
    ok: true,
    message: "관심 등록됐습니다. 반복 제작 수요 신호로 기록됩니다.",
  };
}
