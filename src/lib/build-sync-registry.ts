import type { SupabaseClient } from "@supabase/supabase-js";

import { hashBuildSyncToken, type BuildSyncTokenPayload, type BuildSyncTool } from "@/lib/build-sync-token";
import type { BuildSyncTokenStatus, Database } from "@/lib/supabase/types";

type BuildSyncTokenRow = Database["public"]["Tables"]["build_sync_tokens"]["Row"];

type RegistryErrorLike = {
  code?: string;
  message?: string;
  details?: string | null;
  hint?: string | null;
};

export type BuildSyncRegistryStatus = "ready" | "missing" | "unavailable";

export type PublicBuildSyncToken = {
  id: string;
  tool: BuildSyncTool;
  status: BuildSyncTokenStatus;
  expiresAt: string;
  lastUsedAt: string | null;
  createdAt: string;
  revokedAt: string | null;
};

function getBuildSyncToolLabel(tool: BuildSyncTokenPayload["tool"]) {
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

export function isBuildSyncTokenRegistryMissing(error: RegistryErrorLike | null | undefined) {
  if (!error) {
    return false;
  }

  const message = `${error.message ?? ""} ${error.details ?? ""} ${error.hint ?? ""}`.toLowerCase();

  return (
    error.code === "42P01" ||
    error.code === "PGRST205" ||
    (message.includes("build_sync_tokens") &&
      (message.includes("does not exist") || message.includes("schema cache") || message.includes("could not find")))
  );
}

function isBuildSyncTokenToolConstraintError(error: RegistryErrorLike | null | undefined) {
  if (!error) {
    return false;
  }

  const message = `${error.message ?? ""} ${error.details ?? ""} ${error.hint ?? ""}`.toLowerCase();

  return error.code === "23514" && message.includes("build_sync_tokens_tool_check");
}

export function toPublicBuildSyncToken(row: BuildSyncTokenRow): PublicBuildSyncToken {
  const expiresAt = new Date(row.expires_at).getTime();
  const status = row.status === "active" && Number.isFinite(expiresAt) && expiresAt < Date.now() ? "expired" : row.status;

  return {
    id: row.id,
    tool: row.tool,
    status,
    expiresAt: row.expires_at,
    lastUsedAt: row.last_used_at,
    createdAt: row.created_at,
    revokedAt: row.revoked_at,
  };
}

export async function recordBuildSyncToken({
  admin,
  token,
  payload,
  expiresAt,
}: {
  admin: SupabaseClient<Database>;
  token: string;
  payload: BuildSyncTokenPayload;
  expiresAt: string;
}): Promise<
  | {
      ok: true;
      registryStatus: BuildSyncRegistryStatus;
      connection: PublicBuildSyncToken | null;
    }
  | {
      ok: false;
      error: string;
    }
> {
  const { data, error } = await admin
    .from("build_sync_tokens")
    .insert({
      idea_id: payload.ideaId,
      organization_id: payload.organizationId,
      actor_id: payload.actorId,
      tool: payload.tool,
      token_hash: hashBuildSyncToken(token),
      status: "active",
      expires_at: expiresAt,
    })
    .select("*")
    .single();

  if (error) {
    if (isBuildSyncTokenRegistryMissing(error)) {
      return { ok: true, registryStatus: "missing", connection: null };
    }

    if (isBuildSyncTokenToolConstraintError(error) && payload.tool !== "cursor") {
      return {
        ok: false,
        error:
          `${getBuildSyncToolLabel(payload.tool)} connection tokens require the latest build_sync_tokens tool-check migration. Apply it in Supabase, then try again.`,
      };
    }

    return { ok: false, error: `Could not record ${getBuildSyncToolLabel(payload.tool)} connection token: ${error.message}` };
  }

  return { ok: true, registryStatus: "ready", connection: toPublicBuildSyncToken(data) };
}

export async function validateRegisteredBuildSyncToken({
  admin,
  token,
  payload,
}: {
  admin: SupabaseClient<Database>;
  token: string;
  payload: BuildSyncTokenPayload;
}): Promise<
  | {
      ok: true;
      registryStatus: BuildSyncRegistryStatus;
      tokenId: string | null;
    }
  | {
      ok: false;
      status: number;
      error: string;
    }
> {
  const { data, error } = await admin
    .from("build_sync_tokens")
    .select("*")
    .eq("token_hash", hashBuildSyncToken(token))
    .maybeSingle();

  if (error) {
    if (isBuildSyncTokenRegistryMissing(error)) {
      return { ok: true, registryStatus: "missing", tokenId: null };
    }

    return { ok: false, status: 500, error: `Could not verify ${getBuildSyncToolLabel(payload.tool)} connection token: ${error.message}` };
  }

  if (!data) {
    return {
      ok: false,
      status: 401,
      error: `This ${getBuildSyncToolLabel(payload.tool)} connection file is not registered anymore. Download a new connection file from Venture Lab.`,
    };
  }

  if (data.idea_id !== payload.ideaId || data.actor_id !== payload.actorId || data.tool !== payload.tool) {
    return { ok: false, status: 403, error: `This ${getBuildSyncToolLabel(payload.tool)} connection token does not match the requested project.` };
  }

  if ((data.organization_id ?? null) !== payload.organizationId) {
    return { ok: false, status: 403, error: `This ${getBuildSyncToolLabel(payload.tool)} connection token does not match this workspace.` };
  }

  if (data.status !== "active") {
    return { ok: false, status: 401, error: `This ${getBuildSyncToolLabel(payload.tool)} connection has been revoked or expired.` };
  }

  const expiresAt = new Date(data.expires_at).getTime();

  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) {
    await admin
      .from("build_sync_tokens")
      .update({
        status: "expired",
      })
      .eq("id", data.id);

    return { ok: false, status: 401, error: `This ${getBuildSyncToolLabel(payload.tool)} connection token expired. Download a new connection file.` };
  }

  return { ok: true, registryStatus: "ready", tokenId: data.id };
}

export async function markBuildSyncTokenUsed(admin: SupabaseClient<Database>, tokenId: string | null) {
  if (!tokenId) {
    return;
  }

  await admin
    .from("build_sync_tokens")
    .update({
      last_used_at: new Date().toISOString(),
    })
    .eq("id", tokenId);
}
