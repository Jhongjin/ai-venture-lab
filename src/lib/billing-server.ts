import {
  emptyCreditSummary,
  FREE_MONTHLY_CREDITS,
  getCreditPeriodKey,
  isCreditSchemaMissing,
  type CreditSummary,
  type CreditLedgerEntry,
  type IdeaBuildPassSummary,
} from "@/lib/billing";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export type CreditSummaryReadResult = {
  error: string | null;
  httpStatus: number;
  summary: CreditSummary | null;
  userId: string | null;
};

type BuildPassRow = {
  cost_credits: number;
  created_at: string;
  idea_id: string;
};

type CreditLedgerRow = {
  id: string;
  amount: number;
  created_at: string;
  entry_type: CreditLedgerEntry["entryType"];
  idea_id: string | null;
  note: string;
  period_key: string;
};

export function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

export function getNumberFromRpcResult(value: unknown, key: string) {
  if (!isRecord(value)) {
    return null;
  }

  const candidate = value[key];
  return typeof candidate === "number" && Number.isFinite(candidate) ? candidate : null;
}

export function getBooleanFromRpcResult(value: unknown, key: string) {
  return isRecord(value) && value[key] === true;
}

export function getStringFromRpcResult(value: unknown, key: string) {
  if (!isRecord(value)) {
    return null;
  }

  const candidate = value[key];
  return typeof candidate === "string" && candidate.trim() ? candidate : null;
}

export function mapBuildPassSummaries(rows: BuildPassRow[] | null | undefined): IdeaBuildPassSummary[] {
  return (rows ?? []).map((pass) => ({
    costCredits: pass.cost_credits,
    createdAt: pass.created_at,
    ideaId: pass.idea_id,
  }));
}

export function mapCreditLedgerEntries(rows: CreditLedgerRow[] | null | undefined): CreditLedgerEntry[] {
  return (rows ?? []).map((entry) => ({
    id: entry.id,
    amount: entry.amount,
    createdAt: entry.created_at,
    entryType: entry.entry_type,
    ideaId: entry.idea_id,
    note: entry.note,
    periodKey: entry.period_key,
  }));
}

export async function readAuthenticatedCreditSummary(): Promise<CreditSummaryReadResult> {
  const supabase = await getSupabaseServerClient();
  const periodKey = getCreditPeriodKey();

  if (!supabase) {
    return {
      error: "Supabase is not configured.",
      httpStatus: 200,
      summary: emptyCreditSummary("unavailable", periodKey, "Supabase is not configured."),
      userId: null,
    };
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      error: "Login is required before reading Venture Credits.",
      httpStatus: 401,
      summary: null,
      userId: null,
    };
  }

  const grantResult = await supabase.rpc("grant_monthly_free_credits", {
    grant_amount: FREE_MONTHLY_CREDITS,
    target_period: periodKey,
  });

  if (grantResult.error) {
    if (isCreditSchemaMissing(grantResult.error)) {
      return {
        error: "Apply the credit ledger migration to enable Venture Credits.",
        httpStatus: 200,
        summary: emptyCreditSummary("missing", periodKey, "Apply the credit ledger migration to enable Venture Credits."),
        userId: user.id,
      };
    }

    const message = `Could not read Venture Credits: ${grantResult.error.message}`;
    return {
      error: message,
      httpStatus: 503,
      summary: emptyCreditSummary("unavailable", periodKey, message),
      userId: user.id,
    };
  }

  const passResult = await supabase
    .from("idea_build_passes")
    .select("idea_id, cost_credits, created_at")
    .order("created_at", { ascending: false });

  if (passResult.error) {
    if (isCreditSchemaMissing(passResult.error)) {
      return {
        error: "Apply the credit ledger migration to enable Venture Credits.",
        httpStatus: 200,
        summary: emptyCreditSummary("missing", periodKey, "Apply the credit ledger migration to enable Venture Credits."),
        userId: user.id,
      };
    }

    const message = `Could not read build passes: ${passResult.error.message}`;
    return {
      error: message,
      httpStatus: 503,
      summary: emptyCreditSummary("unavailable", periodKey, message),
      userId: user.id,
    };
  }

  const ledgerResult = await supabase
    .from("credit_ledger")
    .select("id, amount, created_at, entry_type, idea_id, note, period_key")
    .order("created_at", { ascending: false })
    .limit(12);

  if (ledgerResult.error) {
    if (isCreditSchemaMissing(ledgerResult.error)) {
      return {
        error: "Apply the credit ledger migration to enable Venture Credits.",
        httpStatus: 200,
        summary: emptyCreditSummary("missing", periodKey, "Apply the credit ledger migration to enable Venture Credits."),
        userId: user.id,
      };
    }

    const message = `Could not read credit history: ${ledgerResult.error.message}`;
    return {
      error: message,
      httpStatus: 503,
      summary: emptyCreditSummary("unavailable", periodKey, message),
      userId: user.id,
    };
  }

  return {
    error: null,
    httpStatus: 200,
    summary: {
      ...emptyCreditSummary("ready", getStringFromRpcResult(grantResult.data, "periodKey") ?? periodKey),
      balance: getNumberFromRpcResult(grantResult.data, "balance") ?? 0,
      buildPasses: mapBuildPassSummaries(passResult.data),
      ledgerEntries: mapCreditLedgerEntries(ledgerResult.data),
      message: null,
    },
    userId: user.id,
  };
}
