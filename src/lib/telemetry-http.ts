import { NextResponse } from "next/server";

const telemetryNoStoreHeaders = {
  "Cache-Control": "no-store",
} as const;

export function telemetryJson<T>(body: T, status = 200) {
  return NextResponse.json(body, {
    headers: telemetryNoStoreHeaders,
    status,
  });
}

export function telemetryJsonError(message: string, status: number) {
  return telemetryJson({ error: message }, status);
}
