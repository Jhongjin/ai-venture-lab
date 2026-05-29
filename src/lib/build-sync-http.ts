import { noStoreJson, noStoreJsonError } from "@/lib/no-store-json";

export function buildSyncJson<T>(body: T, status = 200) {
  return noStoreJson(body, status);
}

export function buildSyncJsonError(message: string, status: number) {
  return noStoreJsonError(message, status);
}
