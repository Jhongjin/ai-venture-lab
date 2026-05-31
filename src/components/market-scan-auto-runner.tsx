"use client";

import { useEffect, useRef } from "react";

type MarketScanAutoRunnerProps = {
  active: boolean;
  autoKey: string | null;
  disabled: boolean;
  onRun: () => Promise<void>;
};

export function MarketScanAutoRunner({ active, autoKey, disabled, onRun }: MarketScanAutoRunnerProps) {
  const lastRunKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!active || disabled || !autoKey || lastRunKeyRef.current === autoKey) {
      return;
    }

    lastRunKeyRef.current = autoKey;
    void onRun();
  }, [active, autoKey, disabled, onRun]);

  return null;
}
