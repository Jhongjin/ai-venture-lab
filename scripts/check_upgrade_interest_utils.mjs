import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const moduleUrl = pathToFileURL(path.join(process.cwd(), "src/lib/upgrade-interest.ts")).href;
const {
  PRO_INTEREST_DEMAND_SIGNAL_MESSAGE,
  PRO_INTEREST_NO_CHECKOUT_BOUNDARY_MESSAGE,
  PRO_INTEREST_PAUSED_CHECKOUT_MESSAGE,
  buildUpgradeInterestDedupeProperties,
  buildUpgradeInterestSummaryDisplayState,
  buildUpgradeInterestTelemetryProperties,
  compareUpgradeInterestCountEntries,
  formatUpgradeInterestCount,
  getUpgradeInterestDedupeSinceIso,
  getTopUpgradeInterestCountLabel,
  getUpgradeInterestIntentLabel,
  getUpgradeInterestSourceLabel,
  normalizeUpgradeInterestInput,
  normalizeUpgradeInterestIntent,
  normalizeUpgradeInterestSource,
  sortUpgradeInterestCountEntries,
} = await import(moduleUrl);

assert.deepEqual(normalizeUpgradeInterestInput(undefined), {
  intent: "repeated_production_packages",
  source: "profile_credit_summary",
});
assert.deepEqual(normalizeUpgradeInterestInput({ intent: "unknown", source: "unknown" }), {
  intent: "repeated_production_packages",
  source: "profile_credit_summary",
});
assert.deepEqual(
  normalizeUpgradeInterestInput({
    intent: "insufficient_credits_for_build_pass",
    source: "step5_credit_panel",
  }),
  {
    intent: "insufficient_credits_for_build_pass",
    source: "step5_credit_panel",
  },
);
assert.equal(normalizeUpgradeInterestSource("step5_credit_panel"), "step5_credit_panel");
assert.equal(normalizeUpgradeInterestSource("unknown"), "profile_credit_summary");
assert.equal(normalizeUpgradeInterestIntent("insufficient_credits_for_build_pass"), "insufficient_credits_for_build_pass");
assert.equal(normalizeUpgradeInterestIntent("unknown"), "repeated_production_packages");
assert.equal(getUpgradeInterestSourceLabel("step5_credit_panel"), "STEP 5 크레딧 부족");
assert.equal(getUpgradeInterestIntentLabel("repeated_production_packages"), "반복 제작");
assert.equal(formatUpgradeInterestCount(12345), "12,345");
assert.equal(
  getUpgradeInterestDedupeSinceIso(Date.parse("2026-06-03T00:00:00.000Z")),
  "2026-06-02T00:00:00.000Z",
);
assert.equal(
  getTopUpgradeInterestCountLabel(
    {
      profile_credit_summary: 1,
      step5_credit_panel: 3,
    },
    getUpgradeInterestSourceLabel,
    "아직 없음",
  ),
  "STEP 5 크레딧 부족 3회",
);
assert.deepEqual(
  sortUpgradeInterestCountEntries({
    profile_credit_summary: 1,
    step5_credit_panel: 3,
  }),
  [
    ["step5_credit_panel", 3],
    ["profile_credit_summary", 1],
  ],
);
assert.equal(compareUpgradeInterestCountEntries(["profile_credit_summary", 1], ["step5_credit_panel", 3]), 2);
assert.equal(compareUpgradeInterestCountEntries(["step5_credit_panel", 3], ["profile_credit_summary", 1]), -2);
assert.equal(compareUpgradeInterestCountEntries(["profile_credit_summary", 1], ["step5_credit_panel", 1]), 0);
assert.equal(getTopUpgradeInterestCountLabel({}, getUpgradeInterestIntentLabel, "아직 없음"), "아직 없음");
assert.equal(
  getTopUpgradeInterestCountLabel({ repeated_production_packages: 0 }, getUpgradeInterestIntentLabel, "아직 없음"),
  "아직 없음",
);
assert.deepEqual(
  buildUpgradeInterestDedupeProperties({
    intent: "insufficient_credits_for_build_pass",
    source: "step5_credit_panel",
  }),
  {
    intent: "insufficient_credits_for_build_pass",
    plan: "pro",
    source: "step5_credit_panel",
  },
);
assert.deepEqual(
  buildUpgradeInterestTelemetryProperties({
    buildPassCost: 30,
    freeMonthlyCredits: 100,
    intent: "repeated_production_packages",
    source: "profile_credit_summary",
  }),
  {
    credit_model: {
      build_pass_cost: 30,
      free_monthly_credits: 100,
    },
    intent: "repeated_production_packages",
    plan: "pro",
    source: "profile_credit_summary",
  },
);
assert.deepEqual(
  buildUpgradeInterestSummaryDisplayState({
    intentCounts: {},
    latestEvents: [],
    sourceCounts: {},
    totalCount: 0,
  }),
  {
    demandQualityLabel: "아직 관심을 남기지 않음",
    latestEventLabel: "아직 Pro 관심 등록이 없습니다.",
    nextDemandAction: "제작 패스가 부족하거나 반복 제작이 필요할 때 Pro 관심만 먼저 남길 수 있습니다.",
    topIntentLabel: "아직 없음",
    topSourceLabel: "아직 없음",
  },
);
assert.deepEqual(
  buildUpgradeInterestSummaryDisplayState({
    intentCounts: {
      insufficient_credits_for_build_pass: 2,
      repeated_production_packages: 1,
    },
    latestEvents: [
      {
        intent: "insufficient_credits_for_build_pass",
        occurredAt: "2026-06-04T03:12:00.000Z",
        source: "step5_credit_panel",
      },
    ],
    sourceCounts: {
      profile_credit_summary: 1,
      step5_credit_panel: 2,
    },
    totalCount: 3,
  }),
  {
    demandQualityLabel: "반복 제작 필요가 보임",
    latestEventLabel: "STEP 5 크레딧 부족 · 크레딧 부족 · 2026-06-04",
    nextDemandAction: "비슷한 순간에 Pro가 다시 필요해지면, 결제 오픈 전에 포함 범위를 더 명확히 정합니다.",
    topIntentLabel: "크레딧 부족 2회",
    topSourceLabel: "STEP 5 크레딧 부족 2회",
  },
);
assert.match(PRO_INTEREST_NO_CHECKOUT_BOUNDARY_MESSAGE, /결제 화면은 열지 않습니다/);
assert.match(PRO_INTEREST_PAUSED_CHECKOUT_MESSAGE, /결제는 아직 열지 않습니다/);
assert.match(PRO_INTEREST_DEMAND_SIGNAL_MESSAGE, /결제 요청이 아니라/);

const summaryComponentPath = path.join(process.cwd(), "src/components/profile-upgrade-interest-summary.tsx");
const summaryComponentSource = fs.readFileSync(summaryComponentPath, "utf8");
assert.equal(
  summaryComponentSource.includes(".sort("),
  false,
  "profile-upgrade-interest-summary should use upgrade-interest helpers for count sorting",
);
assert.equal(
  summaryComponentSource.includes("summary.totalCount === 0"),
  false,
  "profile-upgrade-interest-summary should delegate demand quality copy to upgrade-interest helpers",
);

const profileActionPath = path.join(process.cwd(), "src/app/profile/actions.ts");
const profileActionSource = fs.readFileSync(profileActionPath, "utf8");
assert.equal(
  profileActionSource.includes("new Date("),
  false,
  "profile actions should delegate Pro interest dedupe time calculation to upgrade-interest helpers",
);
assert.equal(
  profileActionSource.includes("normalizeUpgradeInterestSource"),
  false,
  "profile actions should delegate Pro interest source normalization to upgrade-interest helpers",
);
assert.equal(
  profileActionSource.includes("normalizeUpgradeInterestIntent"),
  false,
  "profile actions should delegate Pro interest intent normalization to upgrade-interest helpers",
);
assert.equal(
  profileActionSource.includes("UPGRADE_INTEREST_PLAN"),
  false,
  "profile actions should delegate Pro interest plan properties to upgrade-interest helpers",
);
assert.equal(
  profileActionSource.includes("credit_model"),
  false,
  "profile actions should delegate Pro interest credit model properties to upgrade-interest helpers",
);

console.log("Upgrade interest utils smoke passed.");
