import assert from "node:assert/strict";
import path from "node:path";
import { pathToFileURL } from "node:url";

const moduleUrl = pathToFileURL(path.join(process.cwd(), "src/lib/auth-callback-url.ts")).href;
const {
  buildWorkspaceEmailRedirectUrl,
  readAuthCallbackErrorState,
  readMagicLinkCodeState,
} = await import(moduleUrl);

assert.deepEqual(
  readAuthCallbackErrorState({
    hash: "#panel",
    pathname: "/workspace",
    search: "?auth_error=callback_exchange_failed&auth_error_description=Verifier%20missing&next=/workspace&keep=yes",
  }),
  {
    description: "Verifier missing",
    error: "callback_exchange_failed",
    nextUrl: "/workspace?next=%2Fworkspace&keep=yes#panel",
  },
);
assert.equal(
  readAuthCallbackErrorState({
    hash: "",
    pathname: "/workspace",
    search: "?next=/workspace",
  }),
  null,
);

assert.deepEqual(
  readMagicLinkCodeState({
    hash: "",
    pathname: "/",
    search: "?code=AUTH_CODE&next=/workspace",
  }),
  {
    code: "AUTH_CODE",
    nextUrl: "/?next=%2Fworkspace",
  },
);
assert.equal(
  readMagicLinkCodeState({
    hash: "#done",
    pathname: "/",
    search: "?next=/workspace",
  }),
  null,
);

assert.equal(
  buildWorkspaceEmailRedirectUrl("https://ai-venture-lab.vercel.app"),
  "https://ai-venture-lab.vercel.app/auth/callback?next=/workspace",
);

console.log("Auth callback URL utils smoke passed.");
