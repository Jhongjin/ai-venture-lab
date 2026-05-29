import { billingJson, billingJsonError } from "@/lib/billing-http";
import { readAuthenticatedCreditSummary } from "@/lib/billing-server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const result = await readAuthenticatedCreditSummary();

  if (!result.summary) {
    return billingJsonError(result.error ?? "Login is required before reading Venture Credits.", result.httpStatus);
  }

  return billingJson(result.summary, result.httpStatus);
}
