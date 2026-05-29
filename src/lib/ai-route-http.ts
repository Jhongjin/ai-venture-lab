import { NextResponse } from "next/server";

const aiRouteNoStoreHeaders = {
  "Cache-Control": "no-store",
} as const;

export function aiRouteJson<T>(body: T, status = 200) {
  return NextResponse.json(body, {
    headers: aiRouteNoStoreHeaders,
    status,
  });
}

export function aiRouteJsonError(message: string, status: number) {
  return aiRouteJson({ error: message }, status);
}
