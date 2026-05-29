import { getBuildSyncIdeaAccess } from "@/lib/build-sync-permissions";
import { buildSyncJson, buildSyncJsonError } from "@/lib/build-sync-http";
import { isBuildSyncTokenRegistryMissing, toPublicBuildSyncToken } from "@/lib/build-sync-registry";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ tokenId: string }> },
) {
  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return buildSyncJsonError("Supabase is not configured.", 503);
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return buildSyncJsonError("Login is required before revoking an external build tool connection.", 401);
  }

  const { tokenId } = await params;

  if (!tokenId) {
    return buildSyncJsonError("tokenId is required.", 400);
  }

  const admin = getSupabaseAdminClient();

  if (!admin) {
    return buildSyncJsonError("Supabase service role is not configured.", 503);
  }

  const { data: tokenRow, error: tokenError } = await admin
    .from("build_sync_tokens")
    .select("*")
    .eq("id", tokenId)
    .maybeSingle();

  if (tokenError) {
    if (isBuildSyncTokenRegistryMissing(tokenError)) {
      return buildSyncJsonError("Apply the build_sync_tokens migration before revoking individual external build tool connections.", 503);
    }

    return buildSyncJsonError(`Could not read external build tool connection: ${tokenError.message}`, 500);
  }

  if (!tokenRow) {
    return buildSyncJsonError("External build tool connection was not found.", 404);
  }

  const access = await getBuildSyncIdeaAccess(supabase, tokenRow.idea_id, user.id);

  if (!access.ok) {
    return buildSyncJsonError(access.error, access.status);
  }

  if (!access.canManage) {
    return buildSyncJsonError("You do not have permission to revoke this external build tool connection.", 403);
  }

  const { data: revokedToken, error: revokeError } = await admin
    .from("build_sync_tokens")
    .update({
      status: "revoked",
      revoked_at: new Date().toISOString(),
      revoked_by: user.id,
    })
    .eq("id", tokenRow.id)
    .select("*")
    .single();

  if (revokeError) {
    return buildSyncJsonError(`Could not revoke external build tool connection: ${revokeError.message}`, 500);
  }

  return buildSyncJson({
    ok: true,
    connection: toPublicBuildSyncToken(revokedToken),
  });
}
