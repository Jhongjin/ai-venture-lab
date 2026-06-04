import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const helperRelativePath = "src/lib/venture-events.ts";
const componentRelativePaths = [
  "src/components/idea-workbench.tsx",
  "src/components/venture-console-actions.tsx",
];
const subscriberRelativePaths = [
  "src/components/idea-workbench.tsx",
  "src/components/venture-console-shell.tsx",
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
const helperModuleUrl = pathToFileURL(path.join(root, helperRelativePath)).href;
const { buildWorkbenchVentureEventListeners, emitVentureEvent, subscribeToVentureEvents } = await import(helperModuleUrl);

const dispatchedEvents = [];
const addedListeners = [];
const removedListeners = [];
globalThis.CustomEvent = class VentureEventSmokeCustomEvent {
  constructor(type, init) {
    this.type = type;
    this.detail = init?.detail;
  }
};
globalThis.window = {
  dispatchEvent(event) {
    dispatchedEvents.push(event);
  },
  addEventListener(eventName, handler) {
    addedListeners.push([eventName, handler]);
  },
  removeEventListener(eventName, handler) {
    removedListeners.push([eventName, handler]);
  },
};

function smokeHandler() {}
const cleanup = subscribeToVentureEvents([["venture:test", smokeHandler]]);
assert.deepEqual(addedListeners, [["venture:test", smokeHandler]]);
cleanup();
assert.deepEqual(removedListeners, [["venture:test", smokeHandler]]);
const workbenchListeners = buildWorkbenchVentureEventListeners({
  artifactCreated: smokeHandler,
  artifactUpdated: smokeHandler,
  experimentCreated: smokeHandler,
  experimentUpdated: smokeHandler,
  ideaCreated: smokeHandler,
  ideaUpdated: smokeHandler,
  riskCreated: smokeHandler,
  riskUpdated: smokeHandler,
  runCreated: smokeHandler,
  runsCreated: smokeHandler,
  runUpdated: smokeHandler,
  taskCreated: smokeHandler,
  tasksCreated: smokeHandler,
  taskUpdated: smokeHandler,
  telemetryCreated: smokeHandler,
});
assert.deepEqual(
  workbenchListeners.map(([eventName]) => eventName),
  [
    "venture:idea-created",
    "venture:idea-updated",
    "venture:risk-created",
    "venture:risk-updated",
    "venture:experiment-created",
    "venture:experiment-updated",
    "venture:run-created",
    "venture:runs-created",
    "venture:run-updated",
    "venture:artifact-created",
    "venture:artifact-updated",
    "venture:task-created",
    "venture:tasks-created",
    "venture:task-updated",
    "venture:telemetry-created",
  ],
);

emitVentureEvent("venture:test", { id: "T-001" });
assert.equal(dispatchedEvents.length, 1);
assert.equal(dispatchedEvents[0].type, "venture:test");
assert.deepEqual(dispatchedEvents[0].detail, { id: "T-001" });

assert.ok(
  helperBody.includes("export function emitVentureEvent"),
  `${helperRelativePath} must export emitVentureEvent.`,
);
assert.ok(
  helperBody.includes("export function subscribeToVentureEvents"),
  `${helperRelativePath} must export subscribeToVentureEvents.`,
);
assert.ok(
  helperBody.includes("export function buildWorkbenchVentureEventListeners"),
  `${helperRelativePath} must export buildWorkbenchVentureEventListeners.`,
);
assert.ok(
  helperBody.includes("window.dispatchEvent("),
  `${helperRelativePath} must own browser event dispatch.`,
);
assert.ok(
  helperBody.includes("window.addEventListener("),
  `${helperRelativePath} must own browser event listener registration.`,
);
assert.ok(
  helperBody.includes("window.removeEventListener("),
  `${helperRelativePath} must own browser event listener cleanup.`,
);
assert.ok(
  helperBody.includes("new CustomEvent<T>"),
  `${helperRelativePath} must keep typed CustomEvent payloads.`,
);

for (const relativePath of componentRelativePaths) {
  const body = await readFile(path.join(root, relativePath), "utf8");
  assert.ok(
    body.includes('from "@/lib/venture-events"'),
    `${relativePath} must import from the shared venture event helper.`,
  );
  assert.ok(body.includes("emitVentureEvent"), `${relativePath} must use emitVentureEvent.`);
  assert.equal(body.includes("window.dispatchEvent("), false, `${relativePath} must not dispatch events directly.`);
  assert.equal(body.includes("new CustomEvent"), false, `${relativePath} must not create CustomEvent directly.`);
}

for (const relativePath of subscriberRelativePaths) {
  const body = await readFile(path.join(root, relativePath), "utf8");
  assert.ok(
    body.includes("subscribeToVentureEvents"),
    `${relativePath} must use subscribeToVentureEvents for venture event listeners.`,
  );
}

const componentFiles = await listFiles(path.join(root, "src/components"));
for (const filePath of componentFiles.filter((file) => file.endsWith(".tsx"))) {
  const body = await readFile(filePath, "utf8");
  const relativePath = normalizePath(filePath);
  assert.equal(body.includes("window.dispatchEvent("), false, `${relativePath} must not dispatch events directly.`);
  assert.equal(body.includes("new CustomEvent"), false, `${relativePath} must not create CustomEvent directly.`);
  assert.equal(
    body.includes("window.addEventListener("),
    false,
    `${relativePath} must not register venture event listeners directly.`,
  );
  assert.equal(
    body.includes("window.removeEventListener("),
    false,
    `${relativePath} must not clean up venture event listeners directly.`,
  );
}

console.log("Venture event helper smoke passed.");
