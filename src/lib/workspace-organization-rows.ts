import type { Database } from "@/lib/supabase/types";

type OrganizationInsert = Database["public"]["Tables"]["organizations"]["Insert"];

export const defaultWorkspaceName = "AI Venture Lab";

export function buildDefaultWorkspaceInsertRow({ userId }: { userId: string }): OrganizationInsert {
  return {
    name: defaultWorkspaceName,
    slug: `ai-venture-lab-${userId.slice(0, 8)}`,
    created_by: userId,
  };
}
