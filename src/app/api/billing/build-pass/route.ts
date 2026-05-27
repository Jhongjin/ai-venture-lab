import { NextResponse } from "next/server";

import {
  emptyCreditSummary,
  FREE_PACKAGE_ARTIFACT_LIMIT,
  FREE_MONTHLY_CREDITS,
  FULL_PACKAGE_ARTIFACT_COUNT,
  getCreditPeriodKey,
  IDEA_BUILD_PASS_CREDITS,
  isCreditSchemaMissing,
} from "@/lib/billing";
import {
  getBooleanFromRpcResult,
  getNumberFromRpcResult,
  getStringFromRpcResult,
  isRecord,
  mapBuildPassSummaries,
} from "@/lib/billing-server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: Request) {
  const supabase = await getSupabaseServerClient();
  const periodKey = getCreditPeriodKey();

  if (!supabase) {
    return NextResponse.json(emptyCreditSummary("unavailable", periodKey, "Supabase is not configured."), { status: 503 });
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return jsonError("Login is required before unlocking the production package.", 401);
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body.", 400);
  }

  if (!isRecord(body) || typeof body.ideaId !== "string" || !body.ideaId.trim()) {
    return jsonError("ideaId is required.", 400);
  }

  const grantResult = await supabase.rpc("grant_monthly_free_credits", {
    target_period: periodKey,
    grant_amount: FREE_MONTHLY_CREDITS,
  });

  if (grantResult.error) {
    if (isCreditSchemaMissing(grantResult.error)) {
      return NextResponse.json(
        emptyCreditSummary("missing", periodKey, "Apply the credit ledger migration to enable Venture Credits."),
        { status: 503 },
      );
    }

    return jsonError(`Could not prepare Venture Credits: ${grantResult.error.message}`, 503);
  }

  const spendResult = await supabase.rpc("spend_credits_for_idea_build_pass", {
    target_idea_id: body.ideaId,
    spend_amount: IDEA_BUILD_PASS_CREDITS,
  });

  if (spendResult.error) {
    if (isCreditSchemaMissing(spendResult.error)) {
      return NextResponse.json(
        emptyCreditSummary("missing", periodKey, "Apply the credit ledger migration to enable Venture Credits."),
        { status: 503 },
      );
    }

    if (spendResult.error.message.includes("INSUFFICIENT_CREDITS")) {
      return jsonError("크레딧이 부족합니다. Pro 결제 또는 추가 크레딧 충전이 필요합니다.", 402);
    }

    if (spendResult.error.message.includes("BUILD_PASS_PERMISSION_DENIED")) {
      return jsonError("이 아이디어의 제작 패키지를 열 권한이 없습니다.", 403);
    }

    if (spendResult.error.message.includes("IDEA_NOT_FOUND")) {
      return jsonError("아이디어를 찾을 수 없습니다.", 404);
    }

    return jsonError(`Could not unlock the production package: ${spendResult.error.message}`, 503);
  }

  const passResult = await supabase
    .from("idea_build_passes")
    .select("idea_id, cost_credits, created_at")
    .order("created_at", { ascending: false });

  if (passResult.error) {
    return jsonError(`Production package was unlocked, but build passes could not be refreshed: ${passResult.error.message}`, 503);
  }

  return NextResponse.json({
    ok: true,
    status: "ready",
    plan: "free",
    periodKey,
    monthlyGrant: FREE_MONTHLY_CREDITS,
    buildPassCost: IDEA_BUILD_PASS_CREDITS,
    freeArtifactLimit: FREE_PACKAGE_ARTIFACT_LIMIT,
    fullArtifactCount: FULL_PACKAGE_ARTIFACT_COUNT,
    balance: getNumberFromRpcResult(spendResult.data, "balance") ?? 0,
    chargedCredits: getNumberFromRpcResult(spendResult.data, "chargedCredits") ?? 0,
    alreadyUnlocked: getBooleanFromRpcResult(spendResult.data, "alreadyUnlocked"),
    ideaId: getStringFromRpcResult(spendResult.data, "ideaId") ?? body.ideaId,
    buildPasses: mapBuildPassSummaries(passResult.data),
    message: null,
  });
}
