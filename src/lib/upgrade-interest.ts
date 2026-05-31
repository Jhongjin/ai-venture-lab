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

export function getUpgradeInterestSourceLabel(source: string) {
  return upgradeInterestSourceLabels[source as UpgradeInterestSource] ?? "위치 미확인";
}

export function getUpgradeInterestIntentLabel(intent: string) {
  return upgradeInterestIntentLabels[intent as UpgradeInterestIntent] ?? "의도 미확인";
}
