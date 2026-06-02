import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import ts from "typescript";

const modulePath = path.join(process.cwd(), "src/lib/auth-form-utils.ts");
const source = readFileSync(modulePath, "utf8");
const { outputText } = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
  fileName: modulePath,
});
const moduleUrl = `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`;
const {
  buildSignupRequestPayload,
  formatAuthMessage,
  getSignupUrl,
  readSignupError,
} = await import(moduleUrl);

assert.equal(getSignupUrl(), "/api/auth/signup");
assert.deepEqual(
  buildSignupRequestPayload({
    displayName: "  Operator  ",
    email: "  operator@example.com  ",
    password: " secret ",
  }),
  {
    displayName: "Operator",
    email: "operator@example.com",
    password: " secret ",
  },
);
assert.equal(formatAuthMessage("Invalid login credentials"), "이메일 또는 비밀번호가 올바르지 않습니다.");
assert.equal(formatAuthMessage("User already registered"), "이미 가입된 이메일입니다. 로그인으로 계속 진행해 주세요.");
assert.equal(formatAuthMessage("Password should be at least 6 characters"), "비밀번호 조건을 확인해 주세요. 최소 6자 이상을 권장합니다.");
assert.equal(
  formatAuthMessage("Error sending confirmation email"),
  "확인 메일 발송 설정 때문에 가입을 마치지 못했습니다. 잠시 후 다시 시도해 주세요.",
);
assert.equal(formatAuthMessage("Network unavailable"), "Network unavailable");
assert.equal(
  await readSignupError({
    async json() {
      return { error: "User already been registered" };
    },
  }),
  "이미 가입된 이메일입니다. 로그인으로 계속 진행해 주세요.",
);
assert.equal(
  await readSignupError({
    async json() {
      throw new Error("invalid json");
    },
  }),
  "계정을 만드는 중 문제가 생겼습니다. 잠시 후 다시 시도해 주세요.",
);

console.log("Auth form utils smoke passed.");
