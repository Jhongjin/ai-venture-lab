import { getApiMessage, isPlainRecord } from "@/lib/record-utils";

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

export type CreditAccessState = {
  isCreditSystemReady: boolean;
  isCreditSystemMissing: boolean;
  hasSelectedIdeaBuildPass: boolean;
  isCreditSystemChecking: boolean;
  needsSelectedIdeaBuildPass: boolean;
  canUseFullProductionPackage: boolean;
  buildPassCost: number;
  freeArtifactLimit: number;
  fullArtifactCount: number;
  monthlyCreditGrant: number;
  creditBalance: number | null;
  remainingBuildPassCount: number | null;
  hasEnoughCreditsForBuildPass: boolean;
  creditBalanceLabel: string;
};

export type ProductionCreditNextActionInput = {
  creditStatus: CreditSystemStatus | null | undefined;
  hasEnoughCreditsForBuildPass: boolean;
  hasSelectedIdeaBuildPass: boolean;
  isCreditSummaryLoading: boolean;
  isCreditSystemMissing: boolean;
  isCreditSystemReady: boolean;
  needsSelectedIdeaBuildPass: boolean;
};

export type BuildPassUnlockResult = {
  alreadyUnlocked: boolean;
  chargedCredits: number;
  creditMessage: string;
};

export type BuildPassUnlockState =
  | {
      alreadyUnlocked: boolean;
      chargedCredits: number;
      creditMessage: string;
      creditSummary: CreditSummary;
      ok: true;
    }
  | {
      alreadyUnlocked: false;
      chargedCredits: null;
      creditMessage: string;
      creditSummary: CreditSummary | null;
      ok: false;
    };

export type CreditSummaryReadState = {
  creditMessage: string | null;
  creditSummary: CreditSummary | null;
  ok: boolean;
};

export type CreditPeriodLedgerTotals = {
  granted: number;
  spent: number;
};

export type BuildPassRequirementMessageMode =
  | "ai_package_start"
  | "ai_package_panel"
  | "save_package"
  | "save_package_gate"
  | "delivery_bundle";

export function buildBuildPassUnlockLoginRequiredMessage() {
  return "제작 패스를 열려면 먼저 로그인하세요.";
}

export function buildBuildPassAlreadyUnlockedMessage() {
  return "이 아이디어는 이미 전체 제작 패키지가 열려 있습니다.";
}

export function buildBuildPassUnlockFailedMessage() {
  return "제작 패스를 열지 못했습니다.";
}

export function buildBuildPassUnlockRetryMessage() {
  return "제작 패스를 열지 못했습니다. 잠시 후 다시 시도하세요.";
}

export function buildBuildPassUnlockSuccessMessage() {
  return "전체 제작 패키지가 열렸습니다. 이제 AI 제작 패키지를 만들고 저장할 수 있습니다.";
}

export function buildBuildPassUnlockRequestPayload(ideaId: string) {
  return { ideaId };
}

export function getCreditSummaryUrl() {
  return "/api/billing/credits";
}

export function getBuildPassUnlockUrl() {
  return "/api/billing/build-pass";
}

export function buildCreditSummaryReadFailedMessage() {
  return "크레딧 상태를 읽지 못했습니다.";
}

export function buildCreditSummaryLoadFailedMessage() {
  return "크레딧 상태를 불러오지 못했습니다.";
}

export function buildCreditSummaryLoadRetryMessage() {
  return "크레딧 상태를 불러오지 못했습니다. 잠시 후 다시 시도하세요.";
}

export function isCreditSummary(value: unknown): value is CreditSummary {
  return (
    isPlainRecord(value) &&
    (value.status === "ready" || value.status === "missing" || value.status === "unavailable") &&
    value.plan === "free" &&
    typeof value.periodKey === "string" &&
    typeof value.monthlyGrant === "number" &&
    typeof value.buildPassCost === "number" &&
    typeof value.freeArtifactLimit === "number" &&
    typeof value.fullArtifactCount === "number" &&
    (typeof value.balance === "number" || value.balance === null) &&
    Array.isArray(value.buildPasses) &&
    Array.isArray(value.ledgerEntries)
  );
}

export function buildCreditSummaryReadState({
  payload,
  responseOk,
}: {
  payload: unknown;
  responseOk: boolean;
}): CreditSummaryReadState {
  if (!responseOk || !isCreditSummary(payload)) {
    const fallback = responseOk ? buildCreditSummaryReadFailedMessage() : buildCreditSummaryLoadFailedMessage();

    return {
      creditMessage: getApiMessage(payload, fallback),
      creditSummary: null,
      ok: false,
    };
  }

  return {
    creditMessage: payload.message,
    creditSummary: payload,
    ok: true,
  };
}

export function buildBuildPassUnlockState({
  fallbackBuildPassCost,
  payload,
  responseOk,
}: {
  fallbackBuildPassCost: number;
  payload: unknown;
  responseOk: boolean;
}): BuildPassUnlockState {
  const creditSummary = isCreditSummary(payload) ? payload : null;

  if (!responseOk || !creditSummary) {
    return {
      alreadyUnlocked: false,
      chargedCredits: null,
      creditMessage: getApiMessage(payload, buildBuildPassUnlockFailedMessage()),
      creditSummary,
      ok: false,
    };
  }

  const unlockResult = getBuildPassUnlockResult(creditSummary, fallbackBuildPassCost);

  return {
    alreadyUnlocked: unlockResult.alreadyUnlocked,
    chargedCredits: unlockResult.chargedCredits,
    creditMessage: unlockResult.creditMessage,
    creditSummary,
    ok: true,
  };
}

export function getBuildPassUnlockResult(
  creditSummary: CreditSummary,
  fallbackBuildPassCost = creditSummary.buildPassCost,
): BuildPassUnlockResult {
  const payload = creditSummary as CreditSummary & {
    alreadyUnlocked?: unknown;
    chargedCredits?: unknown;
  };
  const chargedCredits = typeof payload.chargedCredits === "number" ? payload.chargedCredits : fallbackBuildPassCost;
  const alreadyUnlocked = payload.alreadyUnlocked === true;

  return {
    alreadyUnlocked,
    chargedCredits,
    creditMessage: alreadyUnlocked
      ? "이 아이디어의 전체 제작 패키지는 이미 열려 있습니다."
      : `${formatCompactCreditAmount(chargedCredits)}을 사용해 전체 제작 패키지를 열었습니다.`,
  };
}

export function buildBuildPassUnlockedTelemetryProperties({
  chargedCredits,
  ideaId,
}: {
  chargedCredits: number;
  ideaId: string;
}) {
  return {
    idea_id: ideaId,
    charged_credits: chargedCredits,
  };
}

export function getBuildPassRequirementMessage({
  buildPassCost,
  isChecking,
  mode,
}: {
  buildPassCost: number;
  isChecking: boolean;
  mode: BuildPassRequirementMessageMode;
}) {
  if (isChecking) {
    if (mode === "ai_package_start" || mode === "ai_package_panel") {
      return "크레딧 상태를 확인한 뒤 AI 제작 패키지를 만들 수 있습니다.";
    }

    if (mode === "delivery_bundle") {
      return "크레딧 상태를 확인한 뒤 제작 전달 묶음을 만들 수 있습니다.";
    }

    return "크레딧 상태를 확인한 뒤 제작 패키지를 저장할 수 있습니다.";
  }

  const costLabel = formatCompactCreditAmount(buildPassCost);

  if (mode === "ai_package_start") {
    return `${costLabel} 제작 패스를 열면 AI 제작 패키지와 외부 개발 도구 연결을 이어갈 수 있습니다.`;
  }

  if (mode === "ai_package_panel") {
    return `${costLabel} 제작 패스를 열면 AI가 전체 제작 패키지를 만들고 외부 개발 도구 연결까지 이어갑니다.`;
  }

  if (mode === "delivery_bundle") {
    return `${costLabel} 제작 패스를 열면 제작 전달 묶음을 만들 수 있습니다.`;
  }

  if (mode === "save_package_gate") {
    return "제작 패스를 열어야 전체 제작 패키지를 저장하고 다음 작업 순서로 넘어갈 수 있습니다.";
  }

  return `${costLabel} 제작 패스를 열면 제작 패키지를 저장할 수 있습니다.`;
}

export function getProductionCreditNextAction({
  creditStatus,
  hasEnoughCreditsForBuildPass,
  hasSelectedIdeaBuildPass,
  isCreditSummaryLoading,
  isCreditSystemMissing,
  isCreditSystemReady,
  needsSelectedIdeaBuildPass,
}: ProductionCreditNextActionInput) {
  if (isCreditSummaryLoading) {
    return "크레딧 상태를 확인하는 중입니다.";
  }

  if (hasSelectedIdeaBuildPass) {
    return "제작 패스가 열렸습니다. 아래 AI 제작 패키지 만들기를 누르세요.";
  }

  if (needsSelectedIdeaBuildPass && hasEnoughCreditsForBuildPass) {
    return "먼저 제작 패스를 여세요. 그다음 AI 제작 패키지 만들기가 열립니다.";
  }

  if (needsSelectedIdeaBuildPass) {
    return "잔여 크레딧이 부족해 제작 패스를 열 수 없습니다.";
  }

  if (isCreditSystemMissing) {
    return "크레딧 DB 준비 전이라 아래 제작 흐름을 그대로 진행하세요.";
  }

  if (creditStatus === "unavailable") {
    return "크레딧 확인 실패 상태라 이번 세션은 아래 제작 흐름을 그대로 진행하세요.";
  }

  if (isCreditSystemReady) {
    return "아이디어를 선택하면 제작 패스를 열 수 있습니다.";
  }

  return "아래 제작 흐름을 진행하세요.";
}

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

export function getCreditPeriodLedgerTotals(
  ledgerEntries: CreditLedgerEntry[],
  periodKey: string | null | undefined,
): CreditPeriodLedgerTotals {
  const currentPeriodLedgerEntries = ledgerEntries.filter((entry) => entry.periodKey === periodKey);
  const granted = currentPeriodLedgerEntries
    .filter((entry) => entry.amount > 0)
    .reduce((sum, entry) => sum + entry.amount, 0);
  const spent = Math.abs(
    currentPeriodLedgerEntries.filter((entry) => entry.amount < 0).reduce((sum, entry) => sum + entry.amount, 0),
  );

  return { granted, spent };
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

export function getCreditAccessState({
  creditSummary,
  selectedIdeaId,
  hasUser,
  isCreditSummaryLoading,
}: {
  creditSummary: CreditSummary | null;
  selectedIdeaId: string | null;
  hasUser: boolean;
  isCreditSummaryLoading: boolean;
}): CreditAccessState {
  const buildPassIdeaIds = new Set((creditSummary?.buildPasses ?? []).map((pass) => pass.ideaId));
  const isCreditSystemReady = creditSummary?.status === "ready";
  const isCreditSystemMissing = creditSummary?.status === "missing";
  const hasSelectedIdeaBuildPass = Boolean(selectedIdeaId && buildPassIdeaIds.has(selectedIdeaId));
  const isCreditSystemChecking = hasUser && isCreditSummaryLoading && !creditSummary;
  const needsSelectedIdeaBuildPass = Boolean(selectedIdeaId && isCreditSystemReady && !hasSelectedIdeaBuildPass);
  const canUseFullProductionPackage = (!isCreditSystemReady && !isCreditSystemChecking) || hasSelectedIdeaBuildPass;
  const buildPassCost = creditSummary?.buildPassCost ?? IDEA_BUILD_PASS_CREDITS;
  const freeArtifactLimit = creditSummary?.freeArtifactLimit ?? FREE_PACKAGE_ARTIFACT_LIMIT;
  const fullArtifactCount = creditSummary?.fullArtifactCount ?? FULL_PACKAGE_ARTIFACT_COUNT;
  const monthlyCreditGrant = creditSummary?.monthlyGrant ?? FREE_MONTHLY_CREDITS;
  const creditBalance = creditSummary?.balance ?? null;
  const remainingBuildPassCount = getBuildPassCapacity(creditBalance, buildPassCost);
  const hasEnoughCreditsForBuildPass = !isCreditSystemReady || (creditBalance ?? 0) >= buildPassCost;
  const creditBalanceLabel = formatCreditAmount(creditBalance, "확인 중");

  return {
    isCreditSystemReady,
    isCreditSystemMissing,
    hasSelectedIdeaBuildPass,
    isCreditSystemChecking,
    needsSelectedIdeaBuildPass,
    canUseFullProductionPackage,
    buildPassCost,
    freeArtifactLimit,
    fullArtifactCount,
    monthlyCreditGrant,
    creditBalance,
    remainingBuildPassCount,
    hasEnoughCreditsForBuildPass,
    creditBalanceLabel,
  };
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
      body: `여러 제작 패키지, 자동 반영, 출처 기반 시장 점검이 계속 필요할 때 결제 없이 Pro 관심 기록만 남깁니다.`,
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
