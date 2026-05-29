import { noStoreJson } from "@/lib/no-store-json";

export function authJson<T>(body: T, status = 200) {
  return noStoreJson(body, status);
}

export function authJsonError(error: string, status: number) {
  return authJson({ error }, status);
}
