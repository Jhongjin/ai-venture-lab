export const FREE_MONTHLY_CREDITS = 100;
export const IDEA_BUILD_PASS_CREDITS = 30;
export const FREE_PACKAGE_ARTIFACT_LIMIT = 4;
export const FULL_PACKAGE_ARTIFACT_COUNT = 10;
export const PRO_UPGRADE_VALUE_TEXT = "반복 제작 패키지, 외부 개발 도구 자동 반영, 출처 기반 시장 점검";
export const PRO_UPGRADE_SIGNAL_TEXTS = [
  "한 달에 여러 아이디어를 제작 패키지까지 밀어붙일 때",
  "Cursor, Codex, Claude Code, Antigravity 연결 파일과 자동 반영이 반복해서 필요할 때",
  "출처 기반 시장 점검과 팀 공유 기록을 계속 남겨야 할 때",
];

export type CreditSystemStatus = "ready" | "missing" | "unavailable";
export type CreditPlanLadderItem = {
  label: string;
  title: string;
  body: string;
};

export type IdeaBuildPassSummary = {
  ideaId: string;
  costCredits: number;
  createdAt: string;
};

export type CreditLedgerEntryType = "monthly_grant" | "build_pass_spend" | "refund" | "adjustment";

export type CreditLedgerEntry = {
  id: string;
  amount: number;
  createdAt: string;
  entryType: CreditLedgerEntryType;
  ideaId: string | null;
  note: string;
  periodKey: string;
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
  ledgerEntries: CreditLedgerEntry[];
  message: string | null;
};

export type BillingErrorLike = {
  code?: string;
  message?: string;
  details?: string | null;
  hint?: string | null;
};

const koreanNumberFormatter = new Intl.NumberFormat("ko-KR");

export function formatKoreanNumber(value: number) {
  return koreanNumberFormatter.format(value);
}

export function formatCreditAmount(value: number | null, fallback = "확인 필요") {
  if (value === null) {
    return fallback;
  }

  return `${formatKoreanNumber(value)} 크레딧`;
}

export function formatCompactCreditAmount(value: number | null, fallback = "확인 필요") {
  if (value === null) {
    return fallback;
  }

  return `${formatKoreanNumber(value)}크레딧`;
}

export function formatSignedCreditAmount(value: number) {
  const prefix = value > 0 ? "+" : "";

  return `${prefix}${formatCreditAmount(value)}`;
}

export function formatBuildPassCount(value: number | null, fallback = "확인 필요") {
  if (value === null) {
    return fallback;
  }

  return `${formatKoreanNumber(value)}개`;
}

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

export function getBuildPassShortfall(balance: number | null, buildPassCost = IDEA_BUILD_PASS_CREDITS) {
  if (balance === null || buildPassCost <= 0 || balance >= buildPassCost) {
    return null;
  }

  return buildPassCost - balance;
}

export function getMonthlyBuildPassCapacity(monthlyCreditGrant: number, buildPassCost = IDEA_BUILD_PASS_CREDITS) {
  return getBuildPassCapacity(monthlyCreditGrant, buildPassCost) ?? 0;
}

export function getCreditPeriodKey(date = new Date()) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export function getCreditPlanLadder({
  monthlyGrant = FREE_MONTHLY_CREDITS,
  buildPassCost = IDEA_BUILD_PASS_CREDITS,
  freeArtifactLimit = FREE_PACKAGE_ARTIFACT_LIMIT,
  fullArtifactCount = FULL_PACKAGE_ARTIFACT_COUNT,
}: {
  monthlyGrant?: number;
  buildPassCost?: number;
  freeArtifactLimit?: number;
  fullArtifactCount?: number;
} = {}): CreditPlanLadderItem[] {
  return [
    {
      label: "Free",
      title: "처음 검증",
      body: `월 ${monthlyGrant}크레딧으로 기본 ${freeArtifactLimit}/${fullArtifactCount} 제작 자료와 첫 검증 판단을 확인합니다.`,
    },
    {
      label: "제작 패스",
      title: "한 아이디어 실행",
      body: `${buildPassCost}크레딧으로 전체 ${fullArtifactCount}단계 제작 패키지와 외부 개발 도구 연결 파일을 엽니다.`,
    },
    {
      label: "Pro 관심",
      title: "반복 제작",
      body: `여러 제작 패키지, 자동 반영, 출처 기반 시장 점검이 계속 필요할 때 결제 전 수요 신호를 남깁니다.`,
    },
  ];
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
    ledgerEntries: [],
    message,
  };
}
