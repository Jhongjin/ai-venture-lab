import { NextResponse } from "next/server";

const billingNoStoreHeaders = {
  "Cache-Control": "no-store",
} as const;

export function billingJson<T>(body: T, status = 200) {
  return NextResponse.json(body, {
    headers: billingNoStoreHeaders,
    status,
  });
}

export function billingJsonError(message: string, status: number) {
  return billingJson({ error: message }, status);
}
