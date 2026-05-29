import { noStoreJson, noStoreJsonError } from "@/lib/no-store-json";

export function aiRouteJson<T>(body: T, status = 200) {
  return noStoreJson(body, status);
}

export function aiRouteJsonError(message: string, status: number) {
  return noStoreJsonError(message, status);
}
