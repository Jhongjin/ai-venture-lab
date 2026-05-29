import { NextResponse } from "next/server";

const authNoStoreHeaders = {
  "Cache-Control": "no-store",
} as const;

export function authJson<T>(body: T, status = 200) {
  return NextResponse.json(body, {
    headers: authNoStoreHeaders,
    status,
  });
}

export function authJsonError(error: string, status: number) {
  return authJson({ error }, status);
}
