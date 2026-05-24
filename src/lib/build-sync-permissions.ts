import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/types";

type BuildSyncIdea = Pick<Database["public"]["Tables"]["ideas"]["Row"], "id" | "name" | "organization_id" | "created_by">;

const buildSyncAdminRoles = new Set(["owner", "admin"]);

export async function getBuildSyncIdeaAccess(
  supabase: SupabaseClient<Database>,
  ideaId: string,
  userId: string,
): Promise<
  | {
      ok: true;
      idea: BuildSyncIdea;
      canManage: boolean;
    }
  | {
      ok: false;
      status: number;
      error: string;
    }
> {
  const { data: idea, error: ideaError } = await supabase
    .from("ideas")
    .select("id, name, organization_id, created_by")
    .eq("id", ideaId)
    .maybeSingle();

  if (ideaError) {
    return { ok: false, status: 500, error: `Could not read idea: ${ideaError.message}` };
  }

  if (!idea) {
    return { ok: false, status: 404, error: "Idea was not found or you do not have access." };
  }

  let canManage = idea.created_by === userId;

  if (!canManage && idea.organization_id) {
    const { data: membership, error: membershipError } = await supabase
      .from("organization_members")
      .select("role")
      .eq("organization_id", idea.organization_id)
      .eq("user_id", userId)
      .maybeSingle();

    if (membershipError) {
      return { ok: false, status: 500, error: `Could not verify workspace permission: ${membershipError.message}` };
    }

    canManage = Boolean(membership && buildSyncAdminRoles.has(membership.role));
  }

  return { ok: true, idea, canManage };
}
