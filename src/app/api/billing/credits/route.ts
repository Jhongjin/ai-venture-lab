import { NextResponse } from "next/server";

import {
  emptyCreditSummary,
  FREE_MONTHLY_CREDITS,
  getCreditPeriodKey,
  IDEA_BUILD_PASS_CREDITS,
  isCreditSchemaMissing,
  type CreditSummary,
} from "@/lib/billing";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function getNumberFromRpcResult(value: unknown, key: string) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const candidate = (value as Record<string, unknown>)[key];
  return typeof candidate === "number" && Number.isFinite(candidate) ? candidate : null;
}

function getStringFromRpcResult(value: unknown, key: string) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const candidate = (value as Record<string, unknown>)[key];
  return typeof candidate === "string" && candidate.trim() ? candidate : null;
}

export async function GET() {
  const supabase = await getSupabaseServerClient();
  const periodKey = getCreditPeriodKey();

  if (!supabase) {
    return NextResponse.json(emptyCreditSummary("unavailable", periodKey, "Supabase is not configured."));
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return jsonError("Login is required before reading Venture Credits.", 401);
  }

  const grantResult = await supabase.rpc("grant_monthly_free_credits", {
    target_period: periodKey,
    grant_amount: FREE_MONTHLY_CREDITS,
  });

  if (grantResult.error) {
    if (isCreditSchemaMissing(grantResult.error)) {
      return NextResponse.json(
        emptyCreditSummary("missing", periodKey, "Apply the credit ledger migration to enable Venture Credits."),
      );
    }

    return NextResponse.json(
      emptyCreditSummary("unavailable", periodKey, `Could not read Venture Credits: ${grantResult.error.message}`),
      { status: 503 },
    );
  }

  const passResult = await supabase
    .from("idea_build_passes")
    .select("idea_id, cost_credits, created_at")
    .order("created_at", { ascending: false });

  if (passResult.error) {
    if (isCreditSchemaMissing(passResult.error)) {
      return NextResponse.json(
        emptyCreditSummary("missing", periodKey, "Apply the credit ledger migration to enable Venture Credits."),
      );
    }

    return NextResponse.json(
      emptyCreditSummary("unavailable", periodKey, `Could not read build passes: ${passResult.error.message}`),
      { status: 503 },
    );
  }

  const response: CreditSummary = {
    ...emptyCreditSummary("ready", getStringFromRpcResult(grantResult.data, "periodKey") ?? periodKey),
    balance: getNumberFromRpcResult(grantResult.data, "balance") ?? 0,
    buildPassCost: IDEA_BUILD_PASS_CREDITS,
    buildPasses: (passResult.data ?? []).map((pass) => ({
      ideaId: pass.idea_id,
      costCredits: pass.cost_credits,
      createdAt: pass.created_at,
    })),
    message: null,
  };

  return NextResponse.json(response);
}
