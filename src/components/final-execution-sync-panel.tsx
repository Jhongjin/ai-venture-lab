"use client";

import type { ChangeEvent } from "react";

import {
  FinalExecutionProgressImportPanel,
  type FinalExecutionProgressImportItem,
} from "@/components/final-execution-progress-import-panel";
import { FinalExecutionSyncStatusCard } from "@/components/final-execution-sync-status-card";
import type { ImplementationTaskStatus } from "@/lib/supabase/types";
import type { WorkbenchReviewGridRow } from "@/components/workbench-review-grid";

type FinalExecutionSyncPanelProps = {
  activeToolLabel: string;
  canUseActions: boolean;
  externalSyncReviewRows: ReadonlyArray<WorkbenchReviewGridRow>;
  isBusy: boolean;
  isLiveExternalDelivery: boolean;
  isTaskSyncRefreshing: boolean;
  liveExternalToolProgressPath: string;
  onChangeProgressImportText: (value: string) => void;
  onImportProgressResult: () => void;
  onLoadProgressImportFile: (event: ChangeEvent<HTMLInputElement>) => void;
  onRefreshTaskSync: () => void;
  progressImportItems: ReadonlyArray<FinalExecutionProgressImportItem>;
  progressImportMessage: string | null;
  progressImportText: string;
  statusLabels: Record<ImplementationTaskStatus, string>;
  statusTone: Record<ImplementationTaskStatus, string>;
  taskSyncMessage: string | null;
  taskSyncUpdatedAt: string | null;
};

export function FinalExecutionSyncPanel({
  activeToolLabel,
  canUseActions,
  externalSyncReviewRows,
  isBusy,
  isLiveExternalDelivery,
  isTaskSyncRefreshing,
  liveExternalToolProgressPath,
  onChangeProgressImportText,
  onImportProgressResult,
  onLoadProgressImportFile,
  onRefreshTaskSync,
  progressImportItems,
  progressImportMessage,
  progressImportText,
  statusLabels,
  statusTone,
  taskSyncMessage,
  taskSyncUpdatedAt,
}: FinalExecutionSyncPanelProps) {
  return (
    <section className="border border-slate-200 bg-white p-4">
      <FinalExecutionSyncStatusCard
        activeToolLabel={activeToolLabel}
        canUseActions={canUseActions}
        isBusy={isBusy}
        isLiveExternalDelivery={isLiveExternalDelivery}
        isTaskSyncRefreshing={isTaskSyncRefreshing}
        onRefreshTaskSync={onRefreshTaskSync}
        reviewRows={externalSyncReviewRows}
        taskSyncMessage={taskSyncMessage}
        taskSyncUpdatedAt={taskSyncUpdatedAt}
      />

      <FinalExecutionProgressImportPanel
        activeToolLabel={activeToolLabel}
        canUseActions={canUseActions}
        isBusy={isBusy}
        isLiveExternalDelivery={isLiveExternalDelivery}
        isTaskSyncRefreshing={isTaskSyncRefreshing}
        liveExternalToolProgressPath={liveExternalToolProgressPath}
        onChangeProgressImportText={onChangeProgressImportText}
        onImportProgressResult={onImportProgressResult}
        onLoadProgressImportFile={onLoadProgressImportFile}
        onRefreshTaskSync={onRefreshTaskSync}
        progressImportItems={progressImportItems}
        progressImportMessage={progressImportMessage}
        progressImportText={progressImportText}
        statusLabels={statusLabels}
        statusTone={statusTone}
      />
    </section>
  );
}
