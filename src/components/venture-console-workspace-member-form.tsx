"use client";

import type { FormEvent } from "react";
import { ArrowsClockwise, UsersThree } from "@phosphor-icons/react";
import type { OrganizationRole } from "@/lib/supabase/types";

type AddableOrganizationRole = Extract<OrganizationRole, "admin" | "member" | "viewer">;

type VentureConsoleWorkspaceMemberFormProps = {
  canManageMembers: boolean;
  isMemberBusy: boolean;
  memberEmail: string;
  memberRole: AddableOrganizationRole;
  memberRoles: AddableOrganizationRole[];
  onMemberEmailChange: (email: string) => void;
  onMemberRoleChange: (role: AddableOrganizationRole) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void | Promise<void>;
  organizationRoleLabels: Record<OrganizationRole, string>;
};

export function VentureConsoleWorkspaceMemberForm({
  canManageMembers,
  isMemberBusy,
  memberEmail,
  memberRole,
  memberRoles,
  onMemberEmailChange,
  onMemberRoleChange,
  onSubmit,
  organizationRoleLabels,
}: VentureConsoleWorkspaceMemberFormProps) {
  return (
    <form onSubmit={onSubmit} className="grid gap-3 avl-surface-muted p-4">
      <div className="text-sm font-semibold text-slate-950">기존 계정 추가</div>
      <div className="grid gap-3 sm:grid-cols-[1fr_132px]">
        <input
          value={memberEmail}
          onChange={(event) => onMemberEmailChange(event.target.value)}
          type="email"
          placeholder="member@example.com"
          disabled={!canManageMembers}
          className="avl-input"
        />
        <select
          value={memberRole}
          onChange={(event) => onMemberRoleChange(event.target.value as AddableOrganizationRole)}
          disabled={!canManageMembers}
          className="avl-select"
        >
          {memberRoles.map((role) => (
            <option key={role} value={role}>
              {organizationRoleLabels[role]}
            </option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        disabled={isMemberBusy || !canManageMembers}
        className="avl-btn avl-btn-primary h-10 px-4 disabled:opacity-60"
      >
        {isMemberBusy ? <ArrowsClockwise className="animate-spin" size={18} /> : <UsersThree size={18} />}
        멤버 추가
      </button>
    </form>
  );
}
