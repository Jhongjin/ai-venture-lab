import { NextResponse } from "next/server";

import { getBuildSyncIdeaAccess } from "@/lib/build-sync-permissions";
import { isBuildSyncTokenRegistryMissing, toPublicBuildSyncToken } from "@/lib/build-sync-registry";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ tokenId: string }> },
) {
  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return jsonError("Supabase is not configured.", 503);
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return jsonError("Login is required before revoking a Cursor connection.", 401);
  }

  const { tokenId } = await params;

  if (!tokenId) {
    return jsonError("tokenId is required.", 400);
  }

  const admin = getSupabaseAdminClient();

  if (!admin) {
    return jsonError("Supabase service role is not configured.", 503);
  }

  const { data: tokenRow, error: tokenError } = await admin
    .from("build_sync_tokens")
    .select("*")
    .eq("id", tokenId)
    .maybeSingle();

  if (tokenError) {
    if (isBuildSyncTokenRegistryMissing(tokenError)) {
      return jsonError("Apply the build_sync_tokens migration before revoking individual Cursor connections.", 503);
    }

    return jsonError(`Could not read Cursor connection: ${tokenError.message}`, 500);
  }

  if (!tokenRow) {
    return jsonError("Cursor connection was not found.", 404);
  }

  const access = await getBuildSyncIdeaAccess(supabase, tokenRow.idea_id, user.id);

  if (!access.ok) {
    return jsonError(access.error, access.status);
  }

  if (!access.canManage) {
    return jsonError("You do not have permission to revoke this Cursor connection.", 403);
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
    return jsonError(`Could not revoke Cursor connection: ${revokeError.message}`, 500);
  }

  return NextResponse.json({
    ok: true,
    connection: toPublicBuildSyncToken(revokedToken),
  });
}
