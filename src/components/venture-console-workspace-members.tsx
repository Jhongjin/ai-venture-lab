"use client";

import { Trash, UsersThree } from "@phosphor-icons/react";
import type { Database, OrganizationRole } from "@/lib/supabase/types";

type OrganizationMember = Database["public"]["Tables"]["organization_members"]["Row"];
type AddableOrganizationRole = Extract<OrganizationRole, "admin" | "member" | "viewer">;

type VentureConsoleWorkspaceMembersProps = {
  activeMembers: OrganizationMember[];
  canManageMembers: boolean;
  currentUserId: string;
  memberActionKey: string | null;
  memberRoles: AddableOrganizationRole[];
  onRemoveMember: (member: OrganizationMember) => void | Promise<void>;
  onUpdateMemberRole: (member: OrganizationMember, role: AddableOrganizationRole) => void | Promise<void>;
  organizationRoleLabels: Record<OrganizationRole, string>;
  ownerCount: number;
};

export function VentureConsoleWorkspaceMembers({
  activeMembers,
  canManageMembers,
  currentUserId,
  memberActionKey,
  memberRoles,
  onRemoveMember,
  onUpdateMemberRole,
  organizationRoleLabels,
  ownerCount,
}: VentureConsoleWorkspaceMembersProps) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-950">
        <UsersThree size={16} />
        멤버
      </div>
      <div className="grid gap-2">
        {activeMembers.map((member) => (
          <div key={`${member.organization_id}-${member.user_id}`} className="avl-surface-muted p-3">
            <div className="flex flex-col gap-3">
              <div>
                <div className="break-all text-sm font-semibold text-slate-950">{member.email || member.user_id}</div>
                <div className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  {organizationRoleLabels[member.role]}
                  {member.user_id === currentUserId ? " / 나" : ""}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {memberRoles.map((role) => {
                  const actionKey = `${member.user_id}:role:${role}`;
                  const isLastOwner = member.role === "owner" && ownerCount <= 1;

                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={() => {
                        void onUpdateMemberRole(member, role);
                      }}
                      disabled={!canManageMembers || member.role === role || isLastOwner || memberActionKey === actionKey}
                      className="avl-btn avl-btn-secondary h-8 px-2.5 text-xs shadow-none disabled:opacity-45"
                    >
                      {memberActionKey === actionKey ? "..." : organizationRoleLabels[role]}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => {
                    void onRemoveMember(member);
                  }}
                  disabled={
                    !canManageMembers ||
                    (member.role === "owner" && ownerCount <= 1) ||
                    memberActionKey === `${member.user_id}:remove`
                  }
                  className="avl-btn avl-btn-danger h-8 px-2.5 text-xs shadow-none disabled:opacity-45"
                >
                  <Trash size={13} />
                  {memberActionKey === `${member.user_id}:remove` ? "..." : "제거"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
