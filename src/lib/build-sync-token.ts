import { createHash, createHmac, randomUUID, timingSafeEqual } from "node:crypto";

export type BuildSyncTool = "cursor" | "codex" | "claude_code" | "antigravity";

export type BuildSyncTokenPayload = {
  v: 1;
  ideaId: string;
  organizationId: string | null;
  actorId: string;
  tool: BuildSyncTool;
  iat: number;
  exp: number;
  nonce: string;
};

const BUILD_SYNC_TOKEN_VERSION = 1;
const DEFAULT_TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 30;

export function getBuildSyncTokenSecret() {
  return (
    process.env.BUILD_SYNC_TOKEN_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.TELEMETRY_INGEST_SECRET ||
    ""
  );
}

export function hashBuildSyncToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function encodeBase64Url(value: string | Buffer) {
  return Buffer.from(value).toString("base64url");
}

function signPayload(encodedPayload: string, secret: string) {
  return createHmac("sha256", secret).update(encodedPayload).digest("base64url");
}

function isBuildSyncTokenPayload(value: unknown): value is BuildSyncTokenPayload {
  if (!value || typeof value !== "object") {
    return false;
  }

  const payload = value as Partial<BuildSyncTokenPayload>;
  return (
    payload.v === BUILD_SYNC_TOKEN_VERSION &&
    typeof payload.ideaId === "string" &&
    typeof payload.actorId === "string" &&
    (payload.tool === "cursor" ||
      payload.tool === "codex" ||
      payload.tool === "claude_code" ||
      payload.tool === "antigravity") &&
    typeof payload.iat === "number" &&
    typeof payload.exp === "number" &&
    typeof payload.nonce === "string" &&
    (typeof payload.organizationId === "string" || payload.organizationId === null)
  );
}

export function createBuildSyncToken({
  ideaId,
  organizationId,
  actorId,
  tool,
  ttlMs = DEFAULT_TOKEN_TTL_MS,
}: {
  ideaId: string;
  organizationId: string | null;
  actorId: string;
  tool: BuildSyncTool;
  ttlMs?: number;
}) {
  const secret = getBuildSyncTokenSecret();

  if (!secret) {
    throw new Error("BUILD_SYNC_TOKEN_SECRET is not configured.");
  }

  const now = Date.now();
  const payload: BuildSyncTokenPayload = {
    v: BUILD_SYNC_TOKEN_VERSION,
    ideaId,
    organizationId,
    actorId,
    tool,
    iat: now,
    exp: now + ttlMs,
    nonce: randomUUID(),
  };
  const encodedPayload = encodeBase64Url(JSON.stringify(payload));
  const signature = signPayload(encodedPayload, secret);

  return {
    token: `${encodedPayload}.${signature}`,
    expiresAt: new Date(payload.exp).toISOString(),
    payload,
  };
}

export function verifyBuildSyncToken(token: string):
  | { ok: true; payload: BuildSyncTokenPayload }
  | { ok: false; error: string } {
  const secret = getBuildSyncTokenSecret();

  if (!secret) {
    return { ok: false, error: "Build sync token secret is not configured." };
  }

  const [encodedPayload, signature] = token.split(".");

  if (!encodedPayload || !signature) {
    return { ok: false, error: "Malformed build sync token." };
  }

  const expectedSignature = signPayload(encodedPayload, secret);
  const expectedBuffer = Buffer.from(expectedSignature);
  const actualBuffer = Buffer.from(signature);

  if (expectedBuffer.length !== actualBuffer.length || !timingSafeEqual(expectedBuffer, actualBuffer)) {
    return { ok: false, error: "Invalid build sync token signature." };
  }

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8"));

    if (!isBuildSyncTokenPayload(payload)) {
      return { ok: false, error: "Invalid build sync token payload." };
    }

    if (payload.exp < Date.now()) {
      return { ok: false, error: "Build sync token expired." };
    }

    return { ok: true, payload };
  } catch {
    return { ok: false, error: "Build sync token cannot be decoded." };
  }
}
