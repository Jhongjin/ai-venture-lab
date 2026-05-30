"use client";

import { ArrowsClockwise, Buildings, UsersThree } from "@phosphor-icons/react";

type WorkspaceSummaryOrganization = {
  id: string;
  name: string;
};

type VentureConsoleWorkspaceSummaryProps = {
  activeMemberCount: number;
  activeMembershipLabel: string;
  activeOrganization: WorkspaceSummaryOrganization;
  isWorkspaceBusy: boolean;
  onAttachPersonalRecords: () => void | Promise<void>;
  onSelectWorkspace: (organizationId: string) => void | Promise<void>;
  organizations: WorkspaceSummaryOrganization[];
  personalRecordCount: number;
};

export function VentureConsoleWorkspaceSummary({
  activeMemberCount,
  activeMembershipLabel,
  activeOrganization,
  isWorkspaceBusy,
  onAttachPersonalRecords,
  onSelectWorkspace,
  organizations,
  personalRecordCount,
}: VentureConsoleWorkspaceSummaryProps) {
  return (
    <>
      <label className="grid gap-2 text-sm font-semibold text-slate-700">
        활성 워크스페이스
        <select
          value={activeOrganization.id}
          onChange={(event) => {
            void onSelectWorkspace(event.target.value);
          }}
          className="avl-select"
        >
          {organizations.map((organization) => (
            <option key={organization.id} value={organization.id}>
              {organization.name}
            </option>
          ))}
        </select>
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border border-slate-200 bg-slate-50 p-4">
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">역할</div>
          <div className="mt-2 text-lg font-semibold capitalize text-slate-950">{activeMembershipLabel}</div>
        </div>
        <div className="avl-surface-muted p-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
            <UsersThree size={14} />
            멤버
          </div>
          <div className="mt-2 text-lg font-semibold text-slate-950">{activeMemberCount}</div>
        </div>
      </div>
      {personalRecordCount > 0 ? (
        <div className="avl-surface-muted border-amber-200 bg-amber-50 p-4">
          <div className="text-sm font-semibold text-amber-950">
            {personalRecordCount}개의 개인 기록이 아직 워크스페이스 밖에 있습니다.
          </div>
          <p className="mt-1 text-sm leading-6 text-amber-900">
            팀으로 함께 보거나 같은 경계로 묶고 싶을 때만 연결하면 됩니다.
          </p>
          <button
            type="button"
            onClick={() => {
              void onAttachPersonalRecords();
            }}
            disabled={isWorkspaceBusy}
            className="avl-btn avl-btn-primary mt-3 h-10 px-4 disabled:opacity-60"
          >
            {isWorkspaceBusy ? <ArrowsClockwise className="animate-spin" size={18} /> : <Buildings size={18} />}
            개인 기록 연결
          </button>
        </div>
      ) : null}
    </>
  );
}
