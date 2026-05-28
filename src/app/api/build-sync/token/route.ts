import { NextResponse } from "next/server";

import { IDEA_BUILD_PASS_CREDITS } from "@/lib/billing";
import { getIdeaBuildPassAccess } from "@/lib/billing-access";
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
  return value === "cursor" || value === "codex" || value === "claude_code" || value === "antigravity" ? value : null;
}

function parseRequestedTtlMs(value: unknown): number | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    return Number.NaN;
  }

  const maxTtlSeconds = 60 * 60 * 24 * 30;
  return Math.min(Math.floor(value), maxTtlSeconds) * 1000;
}

function getBuildSyncToolLabel(tool: BuildSyncTool) {
  if (tool === "codex") {
    return "Codex";
  }

  if (tool === "claude_code") {
    return "Claude Code";
  }

  if (tool === "antigravity") {
    return "Google Antigravity";
  }

  return "Cursor";
}

function shouldEnforceCreditBuildPass() {
  return process.env.ENFORCE_CREDIT_BUILD_PASS === "1";
}

function normalizeOrigin(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  try {
    const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    return new URL(withProtocol).origin;
  } catch {
    return "";
  }
}

function getBuildSyncProgressEndpoint(request: Request) {
  const requestUrl = new URL(request.url);
  const configuredOrigin = normalizeOrigin(
    process.env.NEXT_PUBLIC_APP_URL ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.APP_URL ||
      process.env.SITE_URL ||
      process.env.VERCEL_PROJECT_PRODUCTION_URL ||
      "",
  );

  if (configuredOrigin) {
    return new URL("/api/build-sync/progress", configuredOrigin).toString();
  }

  if (requestUrl.hostname === "localhost" || requestUrl.hostname === "127.0.0.1") {
    return new URL("/api/build-sync/progress", requestUrl.origin).toString();
  }

  return new URL("/api/build-sync/progress", "https://ai-venture-lab.vercel.app").toString();
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
    return jsonError("Only Cursor, Codex, Claude Code, and Google Antigravity build sync are supported right now.", 400);
  }

  const ttlMs = parseRequestedTtlMs(body.expiresInSeconds);

  if (Number.isNaN(ttlMs)) {
    return jsonError("expiresInSeconds must be a non-negative number.", 400);
  }

  const access = await getBuildSyncIdeaAccess(supabase, body.ideaId, user.id);

  if (!access.ok) {
    return jsonError(access.error, access.status);
  }

  if (!access.canManage) {
    return jsonError("You do not have permission to connect this idea to an external build tool.", 403);
  }

  if (shouldEnforceCreditBuildPass()) {
    const buildPass = await getIdeaBuildPassAccess(supabase, body.ideaId);

    if (buildPass.status === "unavailable") {
      return jsonError(buildPass.message, 503);
    }

    if (buildPass.required && !buildPass.hasPass) {
      return jsonError(
        `제작 패키지와 외부 개발 도구 연결을 열려면 ${IDEA_BUILD_PASS_CREDITS}크레딧 제작 패스가 필요합니다.`,
        402,
      );
    }
  }

  try {
    const idea = access.idea;
    const syncToken = createBuildSyncToken({
      ideaId: idea.id,
      organizationId: idea.organization_id,
      actorId: user.id,
      tool,
      ttlMs,
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
      endpoint: getBuildSyncProgressEndpoint(request),
      token: syncToken.token,
      expiresAt: syncToken.expiresAt,
      registryStatus,
      connection,
      message:
        registryStatus === "ready"
          ? `${getBuildSyncToolLabel(tool)} connection token was recorded and can be revoked individually.`
          : `${getBuildSyncToolLabel(tool)} connection token was created. Apply the build_sync_tokens migration to enable individual revocation.`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create a build sync token.";
    return jsonError(message, 503);
  }
}
