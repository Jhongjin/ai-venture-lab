import { NextResponse } from "next/server";

const noStoreHeaders = {
  "Cache-Control": "no-store",
} as const;

export function noStoreJson<T>(body: T, status = 200) {
  return NextResponse.json(body, {
    headers: noStoreHeaders,
    status,
  });
}

export function noStoreJsonError(message: string, status: number) {
  return noStoreJson({ error: message }, status);
}
