import { noStoreJson, noStoreJsonError } from "@/lib/no-store-json";

export function telemetryJson<T>(body: T, status = 200) {
  return noStoreJson(body, status);
}

export function telemetryJsonError(message: string, status: number) {
  return noStoreJsonError(message, status);
}
