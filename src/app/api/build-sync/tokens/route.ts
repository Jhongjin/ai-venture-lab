import { getBuildSyncIdeaAccess } from "@/lib/build-sync-permissions";
import { buildSyncJson, buildSyncJsonError } from "@/lib/build-sync-http";
import {
  isBuildSyncTokenRegistryMissing,
  toPublicBuildSyncToken,
  type BuildSyncRegistryStatus,
} from "@/lib/build-sync-registry";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return buildSyncJsonError("Supabase is not configured.", 503);
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return buildSyncJsonError("Login is required before reading external build tool connections.", 401);
  }

  const ideaId = new URL(request.url).searchParams.get("ideaId")?.trim();

  if (!ideaId) {
    return buildSyncJsonError("ideaId is required.", 400);
  }

  const access = await getBuildSyncIdeaAccess(supabase, ideaId, user.id);

  if (!access.ok) {
    return buildSyncJsonError(access.error, access.status);
  }

  if (!access.canManage) {
    return buildSyncJsonError("You do not have permission to manage external build tool connections for this idea.", 403);
  }

  const admin = getSupabaseAdminClient();

  if (!admin) {
    return buildSyncJson({
      ok: true,
      registryStatus: "unavailable" satisfies BuildSyncRegistryStatus,
      tokens: [],
      message: "Supabase service role is not configured, so individual external build tool connection management is unavailable.",
    });
  }

  const { data, error } = await admin
    .from("build_sync_tokens")
    .select("*")
    .eq("idea_id", access.idea.id)
    .order("created_at", { ascending: false });

  if (error) {
    if (isBuildSyncTokenRegistryMissing(error)) {
      return buildSyncJson({
        ok: true,
        registryStatus: "missing" satisfies BuildSyncRegistryStatus,
        tokens: [],
        message: "Apply the build_sync_tokens migration to enable individual external build tool connection management.",
      });
    }

    return buildSyncJsonError(`Could not read external build tool connections: ${error.message}`, 500);
  }

  return buildSyncJson({
    ok: true,
    registryStatus: "ready" satisfies BuildSyncRegistryStatus,
    tokens: (data ?? []).map(toPublicBuildSyncToken),
  });
}
