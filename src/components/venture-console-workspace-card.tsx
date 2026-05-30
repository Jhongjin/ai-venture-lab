"use client";

import type { FormEvent } from "react";
import { Buildings } from "@phosphor-icons/react";
import type { User } from "@supabase/supabase-js";
import type { Database, OrganizationRole } from "@/lib/supabase/types";
import { VentureConsoleWorkspaceAuditLog } from "@/components/venture-console-workspace-audit-log";
import { VentureConsoleWorkspaceEmptyState } from "@/components/venture-console-workspace-empty-state";
import { VentureConsoleWorkspaceMemberForm } from "@/components/venture-console-workspace-member-form";
import { VentureConsoleWorkspaceMembers } from "@/components/venture-console-workspace-members";
import { VentureConsoleWorkspaceSummary } from "@/components/venture-console-workspace-summary";

type Organization = Database["public"]["Tables"]["organizations"]["Row"];
type OrganizationMember = Database["public"]["Tables"]["organization_members"]["Row"];
type AuditEvent = Database["public"]["Tables"]["audit_events"]["Row"];
type AddableOrganizationRole = Extract<OrganizationRole, "admin" | "member" | "viewer">;
type VentureConsoleWorkspaceTask = "auth" | "workspace" | "extract" | "idea";

type VentureConsoleWorkspaceCardProps = {
  activeMemberCount: number;
  activeMembers: OrganizationMember[];
  activeMembership: OrganizationMember | null;
  activeOrganization: Organization | null;
  activeTask: VentureConsoleWorkspaceTask;
  auditEvents: AuditEvent[];
  canManageMembers: boolean;
  isMemberBusy: boolean;
  isWorkspaceBusy: boolean;
  memberActionKey: string | null;
  memberEmail: string;
  memberRole: AddableOrganizationRole;
  memberRoles: AddableOrganizationRole[];
  onAddMember: (event: FormEvent<HTMLFormElement>) => void | Promise<void>;
  onAttachPersonalRecords: () => void | Promise<void>;
  onCreateWorkspace: () => void | Promise<void>;
  onMemberEmailChange: (email: string) => void;
  onMemberRoleChange: (role: AddableOrganizationRole) => void;
  onRemoveMember: (member: OrganizationMember) => void | Promise<void>;
  onSelectWorkspace: (organizationId: string) => void | Promise<void>;
  onUpdateMemberRole: (member: OrganizationMember, role: AddableOrganizationRole) => void | Promise<void>;
  organizationRoleLabels: Record<OrganizationRole, string>;
  organizations: Organization[];
  ownerCount: number;
  personalRecordCount: number;
  user: Pick<User, "id"> | null;
  workspaceMessage: string | null;
};

export function VentureConsoleWorkspaceCard({
  activeMemberCount,
  activeMembers,
  activeMembership,
  activeOrganization,
  activeTask,
  auditEvents,
  canManageMembers,
  isMemberBusy,
  isWorkspaceBusy,
  memberActionKey,
  memberEmail,
  memberRole,
  memberRoles,
  onAddMember,
  onAttachPersonalRecords,
  onCreateWorkspace,
  onMemberEmailChange,
  onMemberRoleChange,
  onRemoveMember,
  onSelectWorkspace,
  onUpdateMemberRole,
  organizationRoleLabels,
  organizations,
  ownerCount,
  personalRecordCount,
  user,
  workspaceMessage,
}: VentureConsoleWorkspaceCardProps) {
  return (
    <div className={`avl-card p-6 ${activeTask === "workspace" ? "" : "hidden"}`}>
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-950">협업 공간 상태</h2>
          <p className="mt-1 text-sm text-slate-500">
            기본은 혼자 진행합니다. 팀으로 함께 볼 때만 협업 공간을 연결하세요.
          </p>
        </div>
        <Buildings className={activeOrganization ? "text-blue-600" : "text-slate-500"} size={24} />
      </div>

      {!user ? (
        <VentureConsoleWorkspaceEmptyState
          isWorkspaceBusy={isWorkspaceBusy}
          mode="login"
          onCreateWorkspace={onCreateWorkspace}
          personalRecordCount={personalRecordCount}
        />
      ) : activeOrganization ? (
        <div className="grid gap-4">
          <VentureConsoleWorkspaceSummary
            activeMemberCount={activeMemberCount}
            activeMembershipLabel={activeMembership ? organizationRoleLabels[activeMembership.role] : organizationRoleLabels.member}
            activeOrganization={activeOrganization}
            isWorkspaceBusy={isWorkspaceBusy}
            onAttachPersonalRecords={onAttachPersonalRecords}
            onSelectWorkspace={onSelectWorkspace}
            organizations={organizations}
            personalRecordCount={personalRecordCount}
          />
          <VentureConsoleWorkspaceMembers
            activeMembers={activeMembers}
            canManageMembers={canManageMembers}
            currentUserId={user.id}
            memberActionKey={memberActionKey}
            memberRoles={memberRoles}
            onRemoveMember={onRemoveMember}
            onUpdateMemberRole={onUpdateMemberRole}
            organizationRoleLabels={organizationRoleLabels}
            ownerCount={ownerCount}
          />
          <VentureConsoleWorkspaceMemberForm
            canManageMembers={canManageMembers}
            isMemberBusy={isMemberBusy}
            memberEmail={memberEmail}
            memberRole={memberRole}
            memberRoles={memberRoles}
            onMemberEmailChange={onMemberEmailChange}
            onMemberRoleChange={onMemberRoleChange}
            onSubmit={onAddMember}
            organizationRoleLabels={organizationRoleLabels}
          />
          <VentureConsoleWorkspaceAuditLog auditEvents={auditEvents} />
        </div>
      ) : (
        <VentureConsoleWorkspaceEmptyState
          isWorkspaceBusy={isWorkspaceBusy}
          mode="create"
          onCreateWorkspace={onCreateWorkspace}
          personalRecordCount={personalRecordCount}
        />
      )}

      {workspaceMessage ? <p className="mt-4 text-sm leading-6 text-slate-600">{workspaceMessage}</p> : null}
    </div>
  );
}
