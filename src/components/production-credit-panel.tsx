"use client";

import { CheckCircle2, Coins, LockKeyhole } from "lucide-react";

import { UpgradeInterestButton } from "@/components/upgrade-interest-button";
import {
  PRO_INTEREST_DEMAND_SIGNAL_MESSAGE,
  PRO_INTEREST_PAUSED_CHECKOUT_MESSAGE,
} from "@/lib/upgrade-interest";
import {
  PRO_UPGRADE_VALUE_TEXT,
  formatBuildPassCount,
  formatCompactCreditAmount,
  formatKoreanNumber,
  getBuildPassShortfall,
  getMonthlyBuildPassCapacity,
  getProductionCreditNextAction,
  getProductionCreditSpendConfidenceItems,
  type CreditSystemStatus,
} from "@/lib/billing";

const freeProductionPackageItems = ["아이디어 요약", "조사 요약", "7일 검증 계획", "검증 완료 요약"];
const unlockedProductionPackageItems = [
  "제품 기획서",
  "화면 구조",
  "디자인 기준",
  "기술 방향",
  "작업 순서",
  "외부 개발 도구 전달 자료",
];

type ProductionCreditPanelProps = {
  buildPassCost: number;
  creditBalance: number | null;
  creditBalanceLabel: string;
  creditMessage: string | null;
  creditStatus: CreditSystemStatus | null | undefined;
  remainingBuildPassCount: number | null;
  freeArtifactLimit: number;
  fullArtifactCount: number;
  hasEnoughCreditsForBuildPass: boolean;
  hasSelectedIdeaBuildPass: boolean;
  isBuildPassUnlocking: boolean;
  isCreditSummaryLoading: boolean;
  isCreditSystemMissing: boolean;
  isCreditSystemReady: boolean;
  monthlyCreditGrant: number;
  needsSelectedIdeaBuildPass: boolean;
  onUnlockBuildPass: () => void;
};

export function ProductionCreditPanel({
  buildPassCost,
  creditBalance,
  creditBalanceLabel,
  creditMessage,
  creditStatus,
  remainingBuildPassCount,
  freeArtifactLimit,
  fullArtifactCount,
  hasEnoughCreditsForBuildPass,
  hasSelectedIdeaBuildPass,
  isBuildPassUnlocking,
  isCreditSummaryLoading,
  isCreditSystemMissing,
  isCreditSystemReady,
  monthlyCreditGrant,
  needsSelectedIdeaBuildPass,
  onUnlockBuildPass,
}: ProductionCreditPanelProps) {
  const nextCreditAction = getProductionCreditNextAction({
    creditStatus,
    hasEnoughCreditsForBuildPass,
    hasSelectedIdeaBuildPass,
    isCreditSummaryLoading,
    isCreditSystemMissing,
    isCreditSystemReady,
    needsSelectedIdeaBuildPass,
  });
  const remainingBuildPassLabel = isCreditSummaryLoading
    ? "확인 중"
    : formatBuildPassCount(remainingBuildPassCount);
  const buildPassShortfall = getBuildPassShortfall(creditBalance, buildPassCost);
  const spendConfidenceItems = getProductionCreditSpendConfidenceItems({
    buildPassCost,
    creditBalance,
    hasSelectedIdeaBuildPass,
  });
  const packageClarityItems = [
    ["Free", `기본 ${freeArtifactLimit}/${fullArtifactCount}단계로 판단 자료 확보`],
    ["제작 패스", `${buildPassCost}크레딧으로 전체 ${fullArtifactCount}단계 실행 패키지 저장`],
    ["최종 실행", "작업 순서와 외부 개발 도구 연결 파일로 이어짐"],
  ] as const;
  const executionValuePathItems = [
    ["1. 전체 자료 열기", `Free ${freeArtifactLimit}/${fullArtifactCount}에서 전체 ${fullArtifactCount}단계로 확장`],
    ["2. AI 패키지 저장", "기획서, 화면 구조, 기술 방향을 한 번에 묶어 저장"],
    ["3. 최종 실행 연결", "Cursor, Codex, Claude Code, Antigravity 전달 파일 받기"],
  ] as const;
  const freeMonthlyPassCapacity = getMonthlyBuildPassCapacity(monthlyCreditGrant, buildPassCost);
  const proPathItems = [
    ["Free 기준", `월 ${monthlyCreditGrant}크레딧으로 제작 패스 최대 ${freeMonthlyPassCapacity}개`],
    ["Pro가 필요한 순간", `${PRO_UPGRADE_VALUE_TEXT}이 계속 필요할 때`],
    [
      "지금 행동",
      needsSelectedIdeaBuildPass && !hasEnoughCreditsForBuildPass
        ? "부족하면 결제 없이 Pro 관심 기록으로 남김"
      : "충분하면 제작 패스를 열고 실행 패키지로 이동",
    ],
  ] as const;
  const proInterestReasonItems = [
    ["반복 제작", "이번 달 제작 패스를 더 열어야 할 때"],
    ["외부 도구", "작업 상태 자동 반영을 계속 써야 할 때"],
    ["시장 근거", "출처 기반 시장 점검을 반복해야 할 때"],
  ] as const;

  return (
    <section data-smoke="production-credit-panel" className="mb-5 border border-slate-200 bg-white p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-slate-200 bg-slate-50 text-slate-700">
            <Coins size={20} />
          </div>
          <div>
            <div className="avl-kicker">Free 제작 크레딧</div>
            <h3 className="mt-2 text-base font-semibold text-slate-950">
              기본 {freeArtifactLimit}단계는 Free, 전체 {fullArtifactCount}단계 제작 패키지는 {buildPassCost}
              크레딧으로 엽니다
            </h3>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
              월 {monthlyCreditGrant}크레딧이 자동 지급되고, 한 아이디어를 제작 패키지와 외부 개발 도구 연결까지 이어갈 때 제작 패스 1개를 씁니다.
            </p>
            <div
              data-smoke="production-credit-one-pass-boundary"
              className="mt-3 border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold leading-6 text-blue-950"
            >
              아이디어 1개를 STEP 7 연결 파일까지 끝내는 단위가 제작 패스 1개입니다. 제작 패스 1개는 {buildPassCost}
              크레딧이고, 전체 {fullArtifactCount}단계 실행 패키지를 엽니다.
            </div>
            <div data-smoke="production-credit-package-clarity" className="mt-3 grid gap-px bg-slate-200 sm:grid-cols-3">
              {packageClarityItems.map(([label, detail]) => (
                <div key={label} className="bg-slate-50 px-3 py-3">
                  <div className="text-xs font-semibold tracking-[0.14em] text-slate-500">{label}</div>
                  <p className="mt-1 text-sm font-semibold leading-6 text-slate-950">{detail}</p>
                </div>
              ))}
            </div>
            <details data-smoke="production-credit-pro-path-details" className="mt-3 border border-slate-200 bg-white px-3 py-3">
              <summary className="cursor-pointer list-none text-sm font-semibold text-slate-950">
                Free/Pro 기준 보기
              </summary>
              <div data-smoke="production-credit-pro-path" className="mt-3 grid gap-px bg-slate-200 sm:grid-cols-3">
                {proPathItems.map(([label, detail]) => (
                  <div key={label} className="bg-white px-3 py-3">
                    <div className="text-xs font-semibold tracking-[0.14em] text-slate-500">{label}</div>
                    <p className="mt-1 text-sm leading-6 text-slate-700">{detail}</p>
                  </div>
                ))}
              </div>
              <p
                data-smoke="production-credit-pro-paused-boundary"
                className="mt-3 text-xs font-semibold leading-5 text-slate-700"
              >
                {PRO_INTEREST_PAUSED_CHECKOUT_MESSAGE}
              </p>
              <p
                data-smoke="production-credit-no-checkout-summary"
                className="mt-1 text-xs font-semibold leading-5 text-slate-700"
              >
                Pro 관심 등록은 결제가 아니라 수요 신호입니다. 카드 정보나 결제창은 요청하지 않습니다.
              </p>
            </details>
            <div data-smoke="production-credit-execution-package-value" className="mt-3 border border-blue-200 bg-blue-50 p-3">
              <div className="text-xs font-semibold text-blue-800">왜 제작 패스를 쓰나요?</div>
              <p className="mt-2 text-sm leading-6 text-blue-950">
                {buildPassCost}크레딧은 문서 묶음 값이 아니라 실행 패키지를 여는 비용입니다. 제품 기획서, 화면 구조, 디자인 기준,
                기술 방향, 작업 순서, 외부 개발 도구 연결 자료까지 이어져 바로 제작을 시작할 수 있게 합니다.
              </p>
              <div data-smoke="production-credit-value-path" className="mt-3 grid gap-px bg-blue-200 sm:grid-cols-3">
                {executionValuePathItems.map(([title, detail]) => (
                  <div key={title} className="bg-white p-3">
                    <div className="text-xs font-semibold text-blue-800">{title}</div>
                    <p className="mt-1 break-keep text-xs leading-5 text-slate-600">{detail}</p>
                  </div>
                ))}
              </div>
            </div>
            <details data-smoke="production-credit-spend-confidence-details" className="mt-3 border border-slate-200 bg-slate-50 px-3 py-3">
              <summary className="cursor-pointer list-none text-sm font-semibold text-slate-950">
                차감 전 확인 보기
              </summary>
              <div data-smoke="production-credit-spend-confidence" className="mt-3 grid gap-px bg-slate-200 sm:grid-cols-3">
                {spendConfidenceItems.map(([label, detail]) => (
                  <div key={label} className="bg-slate-50 p-3">
                    <div className="text-xs font-semibold text-slate-500">{label}</div>
                    <p className="mt-1 text-sm font-semibold leading-6 text-slate-950">{detail}</p>
                  </div>
                ))}
              </div>
            </details>
            <div className="mt-3 grid gap-2 md:grid-cols-2">
              <div className="border border-slate-200 bg-slate-50 p-3">
                <div className="text-xs font-semibold text-slate-500">Free에서 이미 받은 것</div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {freeProductionPackageItems.map((item) => (
                    <span key={item} className="avl-pill avl-pill-success">
                      <CheckCircle2 size={13} />
                      {item}
                    </span>
                  ))}
                </div>
              </div>
              <div className="border border-slate-200 bg-white p-3">
                <div className="text-xs font-semibold text-slate-500">제작 패스 후 열리는 것</div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {unlockedProductionPackageItems.map((item) => (
                    <span key={item} className="avl-pill avl-pill-neutral">
                      <LockKeyhole size={13} />
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            {isCreditSystemMissing ? (
              <p className="mt-2 text-sm font-semibold text-amber-700">
                크레딧 DB 준비 전이라 지금 배포에서는 기존 제작 흐름을 그대로 유지합니다.
              </p>
            ) : creditStatus === "unavailable" ? (
              <p className="mt-2 text-sm font-semibold text-amber-700">
                크레딧 상태를 확인하지 못해 이번 세션에서는 제작 흐름을 막지 않습니다.
              </p>
            ) : creditMessage ? (
              <p className="mt-2 text-sm font-semibold text-slate-700">{creditMessage}</p>
            ) : null}
          </div>
        </div>

        <div className="min-w-56 border border-slate-200 bg-slate-50 p-3">
          <div className="text-xs font-semibold text-slate-500">현재 잔여</div>
          <div className="mt-2 text-2xl font-semibold text-slate-950">
            {isCreditSummaryLoading ? "확인 중" : creditBalanceLabel}
          </div>
          <div className="mt-3 border-t border-slate-200 pt-3">
            <div className="text-xs font-semibold text-slate-500">이번 달 남은 패스</div>
            <div data-smoke="production-credit-pass-capacity" className="mt-1 text-sm font-semibold leading-6 text-slate-950">
              {remainingBuildPassLabel}
            </div>
          </div>
          <div className="mt-3 border-t border-slate-200 pt-3">
            <div className="text-xs font-semibold text-slate-500">지금 할 일</div>
            <p data-smoke="production-credit-next-action" className="mt-1 text-sm font-semibold leading-6 text-slate-950">
              {nextCreditAction}
            </p>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {hasSelectedIdeaBuildPass ? (
              <span className="avl-pill avl-pill-success">
                <CheckCircle2 size={14} />
                제작 패스 열림
              </span>
            ) : isCreditSystemReady ? (
              <span className="avl-pill avl-pill-neutral">
                Free {freeArtifactLimit}/{fullArtifactCount}
              </span>
            ) : (
              <span className="avl-pill avl-pill-warning">준비 중</span>
            )}
          </div>
          {needsSelectedIdeaBuildPass ? (
            <button
              type="button"
              onClick={onUnlockBuildPass}
              disabled={isBuildPassUnlocking || isCreditSummaryLoading || !hasEnoughCreditsForBuildPass}
              className="avl-btn avl-btn-primary mt-3 h-10 w-full justify-center px-3 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <LockKeyhole size={16} />
              {isBuildPassUnlocking ? "여는 중" : `${buildPassCost}크레딧으로 제작 패스 열기`}
            </button>
          ) : null}
          {needsSelectedIdeaBuildPass && !hasEnoughCreditsForBuildPass ? (
            <div data-smoke="step5-upgrade-interest" className="mt-3 border border-amber-200 bg-amber-50 p-3">
              <p className="text-xs font-semibold text-amber-800">잔여 크레딧이 부족합니다.</p>
              {buildPassShortfall !== null ? (
                <p data-smoke="step5-credit-shortfall" className="mt-1 text-sm font-semibold leading-6 text-amber-950">
                  다음 제작 패스까지 {formatCompactCreditAmount(buildPassShortfall)} 부족합니다.
                </p>
              ) : null}
              <p className="mt-1 text-xs leading-5 text-amber-950">
                Pro가 필요한 이유는 {PRO_UPGRADE_VALUE_TEXT}을 반복해서 쓰는 것입니다. 결제는 아직 시작하지 않습니다.
              </p>
              <p
                data-smoke="step5-pro-interest-boundary"
                className="mt-1 text-xs font-semibold leading-5 text-amber-950"
              >
                {PRO_INTEREST_DEMAND_SIGNAL_MESSAGE}
              </p>
              <p
                data-smoke="step5-pro-interest-not-payment"
                className="mt-1 text-xs font-semibold leading-5 text-amber-950"
              >
                지금 남기는 것은 결제 예약이 아니라 어떤 상황에서 Pro가 필요한지 알려주는 표시입니다.
              </p>
              <div data-smoke="step5-pro-interest-reasons" className="mt-3 grid gap-px bg-amber-200">
                {proInterestReasonItems.map(([label, detail]) => (
                  <div key={label} className="bg-white px-3 py-2">
                    <div className="text-xs font-semibold text-amber-800">{label}</div>
                    <p className="mt-1 text-xs leading-5 text-slate-600">{detail}</p>
                  </div>
                ))}
              </div>
              <UpgradeInterestButton
                idleMessage={
                  buildPassShortfall !== null
                    ? `${formatKoreanNumber(buildPassShortfall)}크레딧 부족한 상태를 Pro 관심 기록으로 남깁니다.`
                    : "부족한 크레딧 상태를 Pro 관심 기록으로 남깁니다."
                }
                intent="insufficient_credits_for_build_pass"
                source="step5_credit_panel"
                wrapperClassName="mt-3 flex flex-col gap-2"
              />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
