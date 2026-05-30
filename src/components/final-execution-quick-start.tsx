"use client";

import { FinalExecutionActionBanner } from "@/components/final-execution-action-banner";
import { FinalExecutionAfterFirstTaskCard } from "@/components/final-execution-after-first-task-card";
import { FinalExecutionSetupChecks } from "@/components/final-execution-setup-checks";
import { FinalExecutionSimplePath } from "@/components/final-execution-simple-path";
import { FinalExecutionToolStartModeCard } from "@/components/final-execution-tool-start-mode-card";
import type { ExternalBuildToolProfile } from "@/lib/build-delivery";

type FinalExecutionQuickStartProps = {
  activeExternalBuildTool: Pick<ExternalBuildToolProfile, "key" | "label" | "startFileName">;
  decisionSentence: string;
  isExternalTool: boolean;
  nextTaskCommand: string;
  progressPath: string;
};

export function FinalExecutionQuickStart({
  activeExternalBuildTool,
  decisionSentence,
  isExternalTool,
  nextTaskCommand,
  progressPath,
}: FinalExecutionQuickStartProps) {
  return (
    <>
      <FinalExecutionActionBanner
        activeToolLabel={activeExternalBuildTool.label}
        decisionSentence={decisionSentence}
        isExternalTool={isExternalTool}
      />
      {isExternalTool ? (
        <div className="grid gap-3">
          <FinalExecutionSimplePath
            activeToolLabel={activeExternalBuildTool.label}
            nextTaskCommand={nextTaskCommand}
            startFileName={activeExternalBuildTool.startFileName}
          />
          <FinalExecutionSetupChecks
            progressPath={progressPath}
            startFileName={activeExternalBuildTool.startFileName}
          />
          <FinalExecutionToolStartModeCard
            activeExternalBuildTool={activeExternalBuildTool}
            isExternalTool={isExternalTool}
          />
          <FinalExecutionAfterFirstTaskCard />
        </div>
      ) : null}
    </>
  );
}
