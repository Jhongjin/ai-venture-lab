export function hasSensitiveSourceSignal(value: string) {
  return /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}|\d{2,3}[-\s]?\d{3,4}[-\s]?\d{4}|주민등록|계좌|카드번호|비밀번호|여권/iu.test(
    value,
  );
}

export function redactSensitiveSource(value: string) {
  return value
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/giu, "[redacted-email]")
    .replace(/\b\d{6}[-\s]?\d{7}\b/g, "[redacted-id]")
    .replace(/\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g, "[redacted-card]")
    .replace(/\b\d{2,3}[-\s]?\d{3,4}[-\s]?\d{4}\b/g, "[redacted-phone]")
    .replace(/(계좌|카드번호|비밀번호|여권)\s*[:：]?\s*[A-Z0-9\-_\t ]{4,}/giu, "$1 [redacted-sensitive]");
}
