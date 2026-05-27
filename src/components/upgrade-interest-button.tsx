"use client";

import { useState } from "react";

import { recordProfileUpgradeInterest } from "@/app/profile/actions";

type SaveState = "idle" | "saving" | "saved" | "error";

type UpgradeInterestButtonProps = {
  idleMessage?: string;
  intent?: string;
  source?: "profile_credit_summary" | "step5_credit_panel";
  wrapperClassName?: string;
};

function getButtonLabel(saveState: SaveState) {
  if (saveState === "saving") {
    return "등록 중";
  }

  if (saveState === "saved") {
    return "관심 등록 완료";
  }

  return "Pro 관심 등록";
}

export function UpgradeInterestButton({
  idleMessage = "지금은 결제 없이 관심만 남깁니다.",
  intent = "repeated_production_packages",
  source = "profile_credit_summary",
  wrapperClassName = "mt-4 flex flex-col gap-2 sm:flex-row sm:items-center",
}: UpgradeInterestButtonProps) {
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [message, setMessage] = useState(idleMessage);

  async function handleClick() {
    if (saveState === "saving" || saveState === "saved") {
      return;
    }

    setSaveState("saving");
    setMessage("관심 신호를 저장하고 있습니다.");

    try {
      const result = await recordProfileUpgradeInterest({ intent, source });
      setSaveState(result.ok ? "saved" : "error");
      setMessage(result.message);
    } catch {
      setSaveState("error");
      setMessage("관심 등록을 저장하지 못했습니다. 다시 눌러 주세요.");
    }
  }

  return (
    <div className={wrapperClassName}>
      <button
        type="button"
        data-smoke="upgrade-interest-button"
        className="avl-btn avl-btn-primary h-9 px-3 text-xs disabled:cursor-not-allowed disabled:opacity-70"
        disabled={saveState === "saving" || saveState === "saved"}
        onClick={handleClick}
      >
        {getButtonLabel(saveState)}
      </button>
      <p data-smoke="upgrade-interest-status" aria-live="polite" className="text-xs leading-5 text-slate-500">
        {message}
      </p>
    </div>
  );
}
