import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const moduleUrl = pathToFileURL(path.join(process.cwd(), "src/lib/upgrade-interest.ts")).href;
const {
  PRO_INTEREST_DEMAND_SIGNAL_MESSAGE,
  PRO_INTEREST_NO_CHECKOUT_BOUNDARY_MESSAGE,
  PRO_INTEREST_PAUSED_CHECKOUT_MESSAGE,
  compareUpgradeInterestCountEntries,
  formatUpgradeInterestCount,
  getUpgradeInterestDedupeSinceIso,
  getTopUpgradeInterestCountLabel,
  getUpgradeInterestIntentLabel,
  getUpgradeInterestSourceLabel,
  normalizeUpgradeInterestIntent,
  normalizeUpgradeInterestSource,
  sortUpgradeInterestCountEntries,
} = await import(moduleUrl);

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

const profileActionPath = path.join(process.cwd(), "src/app/profile/actions.ts");
const profileActionSource = fs.readFileSync(profileActionPath, "utf8");
assert.equal(
  profileActionSource.includes("new Date("),
  false,
  "profile actions should delegate Pro interest dedupe time calculation to upgrade-interest helpers",
);

console.log("Upgrade interest utils smoke passed.");
