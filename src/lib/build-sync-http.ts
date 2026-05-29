import { NextResponse } from "next/server";

const buildSyncNoStoreHeaders = {
  "Cache-Control": "no-store",
} as const;

export function buildSyncJson<T>(body: T, status = 200) {
  return NextResponse.json(body, {
    headers: buildSyncNoStoreHeaders,
    status,
  });
}

export function buildSyncJsonError(message: string, status: number) {
  return buildSyncJson({ error: message }, status);
}
