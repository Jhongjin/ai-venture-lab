import assert from "node:assert/strict";
import path from "node:path";
import { pathToFileURL } from "node:url";

const sourceRedactionModuleUrl = pathToFileURL(path.join(process.cwd(), "src/lib/source-redaction.ts")).href;
const { hasSensitiveSourceSignal, redactSensitiveSource } = await import(sourceRedactionModuleUrl);

const sensitiveSource = [
  "email test@example.com",
  "phone 010-1234-5678",
  "id 900101-1234567",
  "card 1234-5678-9012-3456",
  "계좌 123-456-789",
].join("\n");

assert.equal(hasSensitiveSourceSignal(sensitiveSource), true, "expected sensitive source signal");

const redacted = redactSensitiveSource(sensitiveSource);
for (const rawToken of ["test@example.com", "010-1234-5678", "900101-1234567", "1234-5678-9012-3456", "123-456-789"]) {
  assert.equal(redacted.includes(rawToken), false, `raw sensitive token leaked: ${rawToken}`);
}

for (const redactionToken of [
  "[redacted-email]",
  "[redacted-phone]",
  "[redacted-id]",
  "[redacted-card]",
  "[redacted-sensitive]",
]) {
  assert.equal(redacted.includes(redactionToken), true, `missing redaction marker: ${redactionToken}`);
}

assert.equal(hasSensitiveSourceSignal("반복 업무 메모와 고객 문의 흐름"), false, "expected plain source to pass");

console.log("Source redaction smoke passed.");
