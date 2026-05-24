import { NextResponse } from "next/server";

import { createBuildSyncToken, type BuildSyncTool } from "@/lib/build-sync-token";
import { getBuildSyncIdeaAccess } from "@/lib/build-sync-permissions";
import { recordBuildSyncToken, type BuildSyncRegistryStatus } from "@/lib/build-sync-registry";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function parseBuildSyncTool(value: unknown): BuildSyncTool | null {
  return value === "cursor" ? value : null;
}

export async function POST(request: Request) {
  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return jsonError("Supabase is not configured.", 503);
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return jsonError("Login is required before creating a build sync token.", 401);
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body.", 400);
  }

  if (!isRecord(body) || typeof body.ideaId !== "string") {
    return jsonError("ideaId is required.", 400);
  }

  const tool = parseBuildSyncTool(body.tool);

  if (!tool) {
    return jsonError("Only Cursor build sync is supported right now.", 400);
  }

  const access = await getBuildSyncIdeaAccess(supabase, body.ideaId, user.id);

  if (!access.ok) {
    return jsonError(access.error, access.status);
  }

  if (!access.canManage) {
    return jsonError("You do not have permission to connect this idea to an external build tool.", 403);
  }

  try {
    const idea = access.idea;
    const syncToken = createBuildSyncToken({
      ideaId: idea.id,
      organizationId: idea.organization_id,
      actorId: user.id,
      tool,
    });
    const admin = getSupabaseAdminClient();
    let registryStatus: BuildSyncRegistryStatus = "unavailable";
    let connection = null;

    if (admin) {
      const registryResult = await recordBuildSyncToken({
        admin,
        token: syncToken.token,
        payload: syncToken.payload,
        expiresAt: syncToken.expiresAt,
      });

      if (!registryResult.ok) {
        return jsonError(registryResult.error, 503);
      }

      registryStatus = registryResult.registryStatus;
      connection = registryResult.connection;
    }

    return NextResponse.json({
      ok: true,
      tool,
      ideaId: idea.id,
      projectName: idea.name,
      endpoint: new URL("/api/build-sync/progress", request.url).toString(),
      token: syncToken.token,
      expiresAt: syncToken.expiresAt,
      registryStatus,
      connection,
      message:
        registryStatus === "ready"
          ? "Cursor connection token was recorded and can be revoked individually."
          : "Cursor connection token was created. Apply the build_sync_tokens migration to enable individual revocation.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create a build sync token.";
    return jsonError(message, 503);
  }
}
