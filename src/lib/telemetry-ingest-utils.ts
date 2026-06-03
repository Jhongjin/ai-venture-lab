const MAX_TELEMETRY_OCCURRED_AT_LENGTH = 80;

function toTelemetryIngestText(value: unknown, maxLength = MAX_TELEMETRY_OCCURRED_AT_LENGTH) {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim().slice(0, maxLength) : "";
}

export function safeTelemetryIngestIsoDate(value: unknown, fallbackDate = new Date()) {
  const text = toTelemetryIngestText(value);

  if (!text) {
    return fallbackDate.toISOString();
  }

  const date = new Date(text);

  return Number.isNaN(date.getTime()) ? fallbackDate.toISOString() : date.toISOString();
}
