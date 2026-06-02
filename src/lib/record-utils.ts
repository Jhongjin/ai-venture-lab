export function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function cleanInlineText(value: unknown, maxLength = 900) {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim().slice(0, maxLength) : "";
}

export async function readResponseJson<T>(response: Pick<Response, "json">, fallback: T): Promise<T> {
  try {
    return (await response.json()) as T;
  } catch {
    return fallback;
  }
}

export function getApiMessage(value: unknown, fallback: string) {
  if (!isPlainRecord(value)) {
    return fallback;
  }

  const error = value.error;
  if (typeof error === "string" && error.trim()) {
    return error;
  }

  const message = value.message;
  return typeof message === "string" && message.trim() ? message : fallback;
}
