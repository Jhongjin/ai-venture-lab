import { NextResponse } from "next/server";

import { createBuildSyncToken, type BuildSyncTool } from "@/lib/build-sync-token";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const buildSyncAdminRoles = new Set(["owner", "admin"]);

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

  const { data: idea, error: ideaError } = await supabase
    .from("ideas")
    .select("id, name, organization_id, created_by")
    .eq("id", body.ideaId)
    .maybeSingle();

  if (ideaError) {
    return jsonError(`Could not read idea: ${ideaError.message}`, 500);
  }

  if (!idea) {
    return jsonError("Idea was not found or you do not have access.", 404);
  }

  let canIssueToken = idea.created_by === user.id;

  if (!canIssueToken && idea.organization_id) {
    const { data: membership, error: membershipError } = await supabase
      .from("organization_members")
      .select("role")
      .eq("organization_id", idea.organization_id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (membershipError) {
      return jsonError(`Could not verify workspace permission: ${membershipError.message}`, 500);
    }

    canIssueToken = Boolean(membership && buildSyncAdminRoles.has(membership.role));
  }

  if (!canIssueToken) {
    return jsonError("You do not have permission to connect this idea to an external build tool.", 403);
  }

  try {
    const syncToken = createBuildSyncToken({
      ideaId: idea.id,
      organizationId: idea.organization_id,
      actorId: user.id,
      tool,
    });

    return NextResponse.json({
      ok: true,
      tool,
      ideaId: idea.id,
      projectName: idea.name,
      endpoint: new URL("/api/build-sync/progress", request.url).toString(),
      token: syncToken.token,
      expiresAt: syncToken.expiresAt,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create a build sync token.";
    return jsonError(message, 503);
  }
}
