import type { Database, OrganizationRole } from "@/lib/supabase/types";

type OrganizationInsert = Database["public"]["Tables"]["organizations"]["Insert"];
export type AddableOrganizationRole = Extract<OrganizationRole, "admin" | "member" | "viewer">;

export const defaultWorkspaceName = "AI Venture Lab";
export const addableOrganizationRoles: AddableOrganizationRole[] = ["member", "viewer", "admin"];
export const organizationRoleLabels: Record<OrganizationRole, string> = {
  owner: "소유자",
  admin: "관리자",
  member: "멤버",
  viewer: "뷰어",
};
export const workspaceRecordTables = [
  "ideas",
  "risks",
  "decisions",
  "experiments",
  "orchestration_runs",
  "venture_artifacts",
  "implementation_tasks",
] as const;

export function buildDefaultWorkspaceInsertRow({ userId }: { userId: string }): OrganizationInsert {
  return {
    name: defaultWorkspaceName,
    slug: `ai-venture-lab-${userId.slice(0, 8)}`,
    created_by: userId,
  };
}

export function buildAttachPersonalRecordsPatch({ organizationId }: { organizationId: string }) {
  return {
    organization_id: organizationId,
  };
}

export function buildAddOrganizationMemberParams({
  email,
  organizationId,
  role,
}: {
  email: string;
  organizationId: string;
  role: AddableOrganizationRole;
}) {
  return {
    target_email: email.trim(),
    target_organization_id: organizationId,
    target_role: role,
  };
}

export function buildUpdateOrganizationMemberRoleParams({
  organizationId,
  role,
  userId,
}: {
  organizationId: string;
  role: AddableOrganizationRole;
  userId: string;
}) {
  return {
    target_organization_id: organizationId,
    target_role: role,
    target_user_id: userId,
  };
}

export function buildRemoveOrganizationMemberParams({
  organizationId,
  userId,
}: {
  organizationId: string;
  userId: string;
}) {
  return {
    target_organization_id: organizationId,
    target_user_id: userId,
  };
}
