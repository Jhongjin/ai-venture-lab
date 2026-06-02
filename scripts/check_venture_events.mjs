import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const helperRelativePath = "src/lib/venture-events.ts";
const componentRelativePaths = [
  "src/components/idea-workbench.tsx",
  "src/components/venture-console-actions.tsx",
];

function normalizePath(filePath) {
  return path.relative(root, filePath).replaceAll("\\", "/");
}

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const entryPath = path.join(directory, entry.name);
      return entry.isDirectory() ? listFiles(entryPath) : entryPath;
    }),
  );

  return files.flat();
}

const helperBody = await readFile(path.join(root, helperRelativePath), "utf8");
assert.ok(
  helperBody.includes("export function emitVentureEvent"),
  `${helperRelativePath} must export emitVentureEvent.`,
);
assert.ok(
  helperBody.includes("window.dispatchEvent("),
  `${helperRelativePath} must own browser event dispatch.`,
);
assert.ok(
  helperBody.includes("new CustomEvent<T>"),
  `${helperRelativePath} must keep typed CustomEvent payloads.`,
);

for (const relativePath of componentRelativePaths) {
  const body = await readFile(path.join(root, relativePath), "utf8");
  assert.ok(
    body.includes('import { emitVentureEvent } from "@/lib/venture-events";'),
    `${relativePath} must import emitVentureEvent from the shared helper.`,
  );
  assert.ok(body.includes("emitVentureEvent"), `${relativePath} must use emitVentureEvent.`);
  assert.equal(body.includes("window.dispatchEvent("), false, `${relativePath} must not dispatch events directly.`);
  assert.equal(body.includes("new CustomEvent"), false, `${relativePath} must not create CustomEvent directly.`);
}

const componentFiles = await listFiles(path.join(root, "src/components"));
for (const filePath of componentFiles.filter((file) => file.endsWith(".tsx"))) {
  const body = await readFile(filePath, "utf8");
  const relativePath = normalizePath(filePath);
  assert.equal(body.includes("window.dispatchEvent("), false, `${relativePath} must not dispatch events directly.`);
  assert.equal(body.includes("new CustomEvent"), false, `${relativePath} must not create CustomEvent directly.`);
}

console.log("Venture event helper smoke passed.");
