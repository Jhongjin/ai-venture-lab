import type { Json } from "@/lib/supabase/types";
import type { TelemetryEvent } from "@/lib/venture-data";

export function formatTelemetryTime(value: string) {
  return new Date(value).toLocaleString("ko-KR", {
    timeZone: "Asia/Seoul",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatStableKoreanDate(value: string) {
  return new Date(value).toLocaleDateString("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export function formatTelemetryProperties(properties: Json) {
  if (!properties || typeof properties !== "object" || Array.isArray(properties)) {
    return "";
  }

  return Object.entries(properties)
    .filter(([, value]) => value !== undefined && value !== null && typeof value !== "object")
    .slice(0, 4)
    .map(([key, value]) => `${key}: ${String(value)}`)
    .join(" · ");
}

export function eventCountForWindow(events: TelemetryEvent[], days: number) {
  const referenceTime = Math.max(...events.map((event) => new Date(event.occurred_at).getTime()).filter(Number.isFinite));

  if (!Number.isFinite(referenceTime)) {
    return 0;
  }

  const threshold = referenceTime - days * 24 * 60 * 60 * 1000;

  return events.filter((event) => new Date(event.occurred_at).getTime() >= threshold).length;
}
