import { NextResponse } from "next/server";

import { readAuthenticatedCreditSummary } from "@/lib/billing-server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET() {
  const result = await readAuthenticatedCreditSummary();

  if (!result.summary) {
    return jsonError(result.error ?? "Login is required before reading Venture Credits.", result.httpStatus);
  }

  return NextResponse.json(result.summary, { status: result.httpStatus });
}
