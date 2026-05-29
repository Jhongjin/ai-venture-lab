import { noStoreJson, noStoreJsonError } from "@/lib/no-store-json";

export function billingJson<T>(body: T, status = 200) {
  return noStoreJson(body, status);
}

export function billingJsonError(message: string, status: number) {
  return noStoreJsonError(message, status);
}
