import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const moduleUrl = pathToFileURL(path.join(process.cwd(), "src/lib/browser-timing.ts")).href;
const {
  clearBrowserInterval,
  clearBrowserTimeout,
  scheduleBrowserInterval,
  scheduleBrowserTimeout,
  waitForBrowserDelay,
} = await import(moduleUrl);

const timeoutDelays = [];
const intervalDelays = [];
const clearedTimeouts = [];
const clearedIntervals = [];

globalThis.window = {
  setTimeout(callback, delayMs) {
    timeoutDelays.push(delayMs);
    callback();
    return `timeout-${timeoutDelays.length}`;
  },
  clearTimeout(timeoutId) {
    clearedTimeouts.push(timeoutId);
  },
  setInterval(callback, delayMs) {
    intervalDelays.push(delayMs);
    callback();
    return `interval-${intervalDelays.length}`;
  },
  clearInterval(intervalId) {
    clearedIntervals.push(intervalId);
  },
};

let timeoutRan = false;
const timeoutId = scheduleBrowserTimeout(() => {
  timeoutRan = true;
}, 25);
assert.equal(timeoutId, "timeout-1");
assert.equal(timeoutRan, true);
assert.deepEqual(timeoutDelays, [25]);

clearBrowserTimeout(timeoutId);
assert.deepEqual(clearedTimeouts, ["timeout-1"]);

let defaultDelayRan = false;
scheduleBrowserTimeout(() => {
  defaultDelayRan = true;
});
assert.equal(defaultDelayRan, true);
assert.deepEqual(timeoutDelays, [25, 0]);

let intervalRan = false;
const intervalId = scheduleBrowserInterval(() => {
  intervalRan = true;
}, 2600);
assert.equal(intervalId, "interval-1");
assert.equal(intervalRan, true);
assert.deepEqual(intervalDelays, [2600]);

clearBrowserInterval(intervalId);
assert.deepEqual(clearedIntervals, ["interval-1"]);

await waitForBrowserDelay(420);
assert.deepEqual(timeoutDelays, [25, 0, 420]);

const directTimerPatterns = [
  "window.setTimeout",
  "window.clearTimeout",
  "window.setInterval",
  "window.clearInterval",
];

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

const allowedFile = path.normalize(path.join(process.cwd(), "src/lib/browser-timing.ts"));
const codeFiles = collectCodeFiles(path.join(process.cwd(), "src/components"))
  .map((filePath) => path.normalize(filePath))
  .filter((filePath) => filePath !== allowedFile);

for (const filePath of codeFiles) {
  const source = fs.readFileSync(filePath, "utf8");

  for (const pattern of directTimerPatterns) {
    assert.equal(
      source.includes(pattern),
      false,
      `${path.relative(process.cwd(), filePath)} should use src/lib/browser-timing.ts for ${pattern}`,
    );
  }
}

console.log("Browser timing smoke passed.");
