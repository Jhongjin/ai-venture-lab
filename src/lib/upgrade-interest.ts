export const UPGRADE_INTEREST_EVENT_NAME = "upgrade_interest_clicked";
export const UPGRADE_INTEREST_EVENT_CATEGORY = "billing";
export const UPGRADE_INTEREST_PLAN = "pro";
export const UPGRADE_INTEREST_DEDUPE_WINDOW_MS = 24 * 60 * 60 * 1000;
export const PRO_INTEREST_NO_CHECKOUT_BOUNDARY_MESSAGE =
  "결제 화면은 열지 않습니다. 이 버튼은 Pro가 필요해진 순간만 저장합니다.";
export const PRO_INTEREST_PAUSED_CHECKOUT_MESSAGE =
  "결제는 아직 열지 않습니다. Pro 관심 등록은 어떤 순간에 유료 가치가 필요한지 확인하는 수요 신호입니다.";
export const PRO_INTEREST_DEMAND_SIGNAL_MESSAGE =
  "관심 등록은 결제 요청이 아니라, 어떤 순간에 Pro가 필요한지 남기는 수요 신호입니다.";

export const upgradeInterestSources = ["profile_credit_summary", "step5_credit_panel"] as const;
export const upgradeInterestIntents = ["insufficient_credits_for_build_pass", "repeated_production_packages"] as const;

export type UpgradeInterestSource = (typeof upgradeInterestSources)[number];
export type UpgradeInterestIntent = (typeof upgradeInterestIntents)[number];

export type UpgradeInterestInput = {
  intent?: string;
  source?: string;
};

export type NormalizedUpgradeInterestInput = {
  intent: UpgradeInterestIntent;
  source: UpgradeInterestSource;
};

export type UpgradeInterestDedupeProperties = {
  source: UpgradeInterestSource;
  plan: typeof UPGRADE_INTEREST_PLAN;
  intent: UpgradeInterestIntent;
};

export type UpgradeInterestTelemetryProperties = UpgradeInterestDedupeProperties & {
  credit_model: {
    free_monthly_credits: number;
    build_pass_cost: number;
  };
};

export type UpgradeInterestTelemetryPropertiesInput = {
  buildPassCost: number;
  freeMonthlyCredits: number;
  intent: UpgradeInterestIntent;
  source: UpgradeInterestSource;
};

export type UpgradeInterestSummaryDisplayEvent = {
  intent: string;
  occurredAt: string;
  source: string;
};

export type UpgradeInterestSummaryDisplayInput = {
  intentCounts: Record<string, number>;
  latestEvents: UpgradeInterestSummaryDisplayEvent[];
  sourceCounts: Record<string, number>;
  totalCount: number;
};

export type UpgradeInterestSummaryDisplayState = {
  demandQualityLabel: string;
  latestEventLabel: string;
  nextDemandAction: string;
  topIntentLabel: string;
  topSourceLabel: string;
};

const fallbackSource: UpgradeInterestSource = "profile_credit_summary";
const fallbackIntent: UpgradeInterestIntent = "repeated_production_packages";

const upgradeInterestSourceLabels: Record<UpgradeInterestSource, string> = {
  profile_credit_summary: "마이페이지",
  step5_credit_panel: "STEP 5 크레딧 부족",
};

const upgradeInterestIntentLabels: Record<UpgradeInterestIntent, string> = {
  insufficient_credits_for_build_pass: "크레딧 부족",
  repeated_production_packages: "반복 제작",
};

function isOneOf<T extends readonly string[]>(values: T, value: string | undefined): value is T[number] {
  return Boolean(value && values.includes(value));
}

export function normalizeUpgradeInterestSource(value: string | undefined): UpgradeInterestSource {
  return isOneOf(upgradeInterestSources, value) ? value : fallbackSource;
}

export function normalizeUpgradeInterestIntent(value: string | undefined): UpgradeInterestIntent {
  return isOneOf(upgradeInterestIntents, value) ? value : fallbackIntent;
}

export function normalizeUpgradeInterestInput(
  input: UpgradeInterestInput | undefined,
): NormalizedUpgradeInterestInput {
  const source = normalizeUpgradeInterestSource(input?.source);
  const intent = normalizeUpgradeInterestIntent(input?.intent);

  return { intent, source };
}

export function buildUpgradeInterestStorageUnavailableMessage() {
  return "관심 등록을 저장할 수 없습니다. 잠시 후 다시 시도해 주세요.";
}

export function buildUpgradeInterestLoginRequiredMessage() {
  return "로그인 후 다시 시도해 주세요.";
}

export function buildUpgradeInterestAlreadyRecordedMessage() {
  return "이미 Pro 관심이 기록됐습니다. 중복 저장 없이 유지합니다.";
}

export function buildUpgradeInterestSaveFailedMessage() {
  return "관심 등록을 저장하지 못했습니다. 다시 눌러 주세요.";
}

export function buildUpgradeInterestSavedMessage() {
  return "Pro 관심이 기록됐습니다. 결제 없이 필요 시점을 남겼습니다.";
}

export function getUpgradeInterestSourceLabel(source: string) {
  return upgradeInterestSourceLabels[source as UpgradeInterestSource] ?? "위치 미확인";
}

export function getUpgradeInterestIntentLabel(intent: string) {
  return upgradeInterestIntentLabels[intent as UpgradeInterestIntent] ?? "의도 미확인";
}

export function formatUpgradeInterestCount(value: number) {
  return value.toLocaleString("ko-KR");
}

export function getUpgradeInterestDedupeSinceIso(currentTimeMs = Date.now()) {
  return new Date(currentTimeMs - UPGRADE_INTEREST_DEDUPE_WINDOW_MS).toISOString();
}

export function compareUpgradeInterestCountEntries([, countA]: [string, number], [, countB]: [string, number]) {
  return countB - countA;
}

export function sortUpgradeInterestCountEntries(counts: Record<string, number>) {
  return Object.entries(counts).sort(compareUpgradeInterestCountEntries);
}

export function getTopUpgradeInterestCountLabel(
  counts: Record<string, number>,
  getLabel: (key: string) => string,
  fallback: string,
) {
  const [topKey, topValue] = sortUpgradeInterestCountEntries(counts)[0] ?? [];

  if (!topKey || !topValue) {
    return fallback;
  }

  return `${getLabel(topKey)} ${formatUpgradeInterestCount(topValue)}회`;
}

export function buildUpgradeInterestDedupeProperties({
  intent,
  source,
}: {
  intent: UpgradeInterestIntent;
  source: UpgradeInterestSource;
}): UpgradeInterestDedupeProperties {
  return {
    source,
    plan: UPGRADE_INTEREST_PLAN,
    intent,
  };
}

export function buildUpgradeInterestTelemetryProperties({
  buildPassCost,
  freeMonthlyCredits,
  intent,
  source,
}: UpgradeInterestTelemetryPropertiesInput): UpgradeInterestTelemetryProperties {
  return {
    ...buildUpgradeInterestDedupeProperties({ intent, source }),
    credit_model: {
      free_monthly_credits: freeMonthlyCredits,
      build_pass_cost: buildPassCost,
    },
  };
}

export function buildUpgradeInterestSummaryDisplayState(
  summary: UpgradeInterestSummaryDisplayInput,
): UpgradeInterestSummaryDisplayState {
  const latestEvent = summary.latestEvents[0] ?? null;
  const topSourceLabel = getTopUpgradeInterestCountLabel(summary.sourceCounts, getUpgradeInterestSourceLabel, "아직 없음");
  const topIntentLabel = getTopUpgradeInterestCountLabel(summary.intentCounts, getUpgradeInterestIntentLabel, "아직 없음");
  const demandQualityLabel =
    summary.totalCount === 0
      ? "아직 관심을 남기지 않음"
      : summary.totalCount >= 2
        ? "반복 제작 필요가 보임"
        : "첫 관심 기록됨";
  const nextDemandAction =
    summary.totalCount === 0
      ? "제작 패스가 부족하거나 반복 제작이 필요할 때 Pro 관심만 먼저 남길 수 있습니다."
      : summary.totalCount >= 2
        ? "비슷한 순간에 Pro가 다시 필요해지면, 결제 오픈 전에 포함 범위를 더 명확히 정합니다."
        : "다음에도 크레딧 부족이나 반복 제작 상황이 생기는지 기록만 이어서 봅니다.";
  const latestEventLabel = latestEvent
    ? `${getUpgradeInterestSourceLabel(latestEvent.source)} · ${getUpgradeInterestIntentLabel(
        latestEvent.intent,
      )} · ${latestEvent.occurredAt.slice(0, 10)}`
    : "아직 Pro 관심 등록이 없습니다.";

  return {
    demandQualityLabel,
    latestEventLabel,
    nextDemandAction,
    topIntentLabel,
    topSourceLabel,
  };
}
