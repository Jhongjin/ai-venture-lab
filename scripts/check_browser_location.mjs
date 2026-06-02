import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const moduleUrl = pathToFileURL(path.join(process.cwd(), "src/lib/browser-location.ts")).href;
const { getBrowserLocationSnapshot, replaceBrowserHistoryUrl } = await import(moduleUrl);

let replacedUrl = null;
globalThis.window = {
  location: {
    hash: "#review",
    origin: "https://ai-venture-lab.vercel.app",
    pathname: "/workspace",
    search: "?code=AUTH_CODE",
  },
  history: {
    replaceState(_state, _title, nextUrl) {
      replacedUrl = nextUrl;
    },
  },
};

assert.deepEqual(getBrowserLocationSnapshot(), {
  hash: "#review",
  origin: "https://ai-venture-lab.vercel.app",
  pathname: "/workspace",
  search: "?code=AUTH_CODE",
});
replaceBrowserHistoryUrl("/workspace?next=%2Fworkspace#review");
assert.equal(replacedUrl, "/workspace?next=%2Fworkspace#review");

function collectCodeFiles(directory) {
  const entries = fs.readdirSync(directory, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      return collectCodeFiles(entryPath);
    }

    if (!/\.(ts|tsx)$/.test(entry.name)) {
      return [];
    }

    return [entryPath];
  });
}

for (const filePath of collectCodeFiles(path.join(process.cwd(), "src/components"))) {
  const source = fs.readFileSync(filePath, "utf8");

  assert.equal(
    source.includes("window."),
    false,
    `${path.relative(process.cwd(), filePath)} should use browser helper modules instead of direct window access`,
  );
}

console.log("Browser location smoke passed.");
