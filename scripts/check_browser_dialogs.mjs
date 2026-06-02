import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const moduleUrl = pathToFileURL(path.join(process.cwd(), "src/lib/browser-dialogs.ts")).href;
const { confirmBrowserAction } = await import(moduleUrl);

const confirmMessages = [];
globalThis.window = {
  confirm(message) {
    confirmMessages.push(message);
    return message.includes("진행");
  },
};

assert.equal(confirmBrowserAction("계속 진행할까요?"), true);
assert.equal(confirmBrowserAction("취소할까요?"), false);
assert.deepEqual(confirmMessages, ["계속 진행할까요?", "취소할까요?"]);

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
    source.includes("window.confirm"),
    false,
    `${path.relative(process.cwd(), filePath)} should use src/lib/browser-dialogs.ts for window.confirm`,
  );
}

console.log("Browser dialogs smoke passed.");
