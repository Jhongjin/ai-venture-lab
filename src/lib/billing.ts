export const FREE_MONTHLY_CREDITS = 100;
export const IDEA_BUILD_PASS_CREDITS = 30;
export const FREE_PACKAGE_ARTIFACT_LIMIT = 4;
export const FULL_PACKAGE_ARTIFACT_COUNT = 10;

export type CreditSystemStatus = "ready" | "missing" | "unavailable";

export type IdeaBuildPassSummary = {
  ideaId: string;
  costCredits: number;
  createdAt: string;
};

export type CreditSummary = {
  status: CreditSystemStatus;
  plan: "free";
  periodKey: string;
  monthlyGrant: number;
  buildPassCost: number;
  freeArtifactLimit: number;
  fullArtifactCount: number;
  balance: number | null;
  buildPasses: IdeaBuildPassSummary[];
  message: string | null;
};

export type BillingErrorLike = {
  code?: string;
  message?: string;
  details?: string | null;
  hint?: string | null;
};

export function getBuildPassCapacity(balance: number | null, buildPassCost = IDEA_BUILD_PASS_CREDITS) {
  if (balance === null || buildPassCost <= 0) {
    return null;
  }

  return Math.floor(balance / buildPassCost);
}

export function getBalanceAfterBuildPass(balance: number | null, buildPassCost = IDEA_BUILD_PASS_CREDITS) {
  if (balance === null || buildPassCost <= 0 || balance < buildPassCost) {
    return null;
  }

  return balance - buildPassCost;
}

export function getCreditPeriodKey(date = new Date()) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export function isCreditSchemaMissing(error: BillingErrorLike | null | undefined) {
  if (!error) {
    return false;
  }

  const message = `${error.message ?? ""} ${error.details ?? ""} ${error.hint ?? ""}`.toLowerCase();

  return (
    error.code === "42P01" ||
    error.code === "42883" ||
    error.code === "PGRST202" ||
    error.code === "PGRST205" ||
    (message.includes("credit_ledger") &&
      (message.includes("does not exist") || message.includes("schema cache") || message.includes("could not find"))) ||
    (message.includes("idea_build_passes") &&
      (message.includes("does not exist") || message.includes("schema cache") || message.includes("could not find"))) ||
    (message.includes("grant_monthly_free_credits") && message.includes("schema cache")) ||
    (message.includes("spend_credits_for_idea_build_pass") && message.includes("schema cache"))
  );
}

export function emptyCreditSummary(status: CreditSystemStatus, periodKey = getCreditPeriodKey(), message: string | null = null): CreditSummary {
  return {
    status,
    plan: "free",
    periodKey,
    monthlyGrant: FREE_MONTHLY_CREDITS,
    buildPassCost: IDEA_BUILD_PASS_CREDITS,
    freeArtifactLimit: FREE_PACKAGE_ARTIFACT_LIMIT,
    fullArtifactCount: FULL_PACKAGE_ARTIFACT_COUNT,
    balance: null,
    buildPasses: [],
    message,
  };
}
