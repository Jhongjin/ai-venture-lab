"use server";

import { getSupabaseServerClient } from "@/lib/supabase/server";
import { FREE_MONTHLY_CREDITS, IDEA_BUILD_PASS_CREDITS } from "@/lib/billing";

type UpgradeInterestResult = {
  ok: boolean;
  message: string;
};

export async function recordProfileUpgradeInterest(): Promise<UpgradeInterestResult> {
  const supabase = await getSupabaseServerClient();

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

  const { error: insertError } = await supabase.from("telemetry_events").insert({
    actor_id: user.id,
    event_name: "upgrade_interest_clicked",
    event_category: "billing",
    properties: {
      source: "profile_credit_summary",
      plan: "pro",
      intent: "repeated_production_packages",
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
