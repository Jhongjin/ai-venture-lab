export function buildCursorMcpServerScript() {
  return `#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import readline from "node:readline";

const root = process.cwd();
const resourceFiles = {
  "venture://package": "AI_VENTURE_PACKAGE.md",
  "venture://tasks": "AI_VENTURE_TASKS.md",
  "venture://guide": "README_VENTURE_LAB_CURSOR.md",
  "venture://start": "AI_VENTURE_CURSOR_START.md"
};

function send(payload) {
  process.stdout.write(JSON.stringify({ jsonrpc: "2.0", ...payload }) + "\\n");
}

function result(id, value) {
  if (id !== undefined && id !== null) {
    send({ id, result: value });
  }
}

function error(id, code, message) {
  if (id !== undefined && id !== null) {
    send({ id, error: { code, message } });
  }
}

async function readText(relativePath) {
  try {
    return await readFile(path.join(root, relativePath), "utf8");
  } catch {
    return "";
  }
}

async function readJson(relativePath) {
  try {
    return JSON.parse(await readFile(path.join(root, relativePath), "utf8"));
  } catch {
    return null;
  }
}

async function syncProgress(record) {
  const config = await readJson(".cursor/venture-lab-sync.json");

  if (!config || typeof config.endpoint !== "string" || typeof config.token !== "string") {
    return "Venture Lab 자동 반영 설정이 없어 로컬 기록만 저장했습니다.";
  }

  try {
    const response = await fetch(config.endpoint, {
      method: "POST",
      headers: {
        "authorization": "Bearer " + config.token,
        "content-type": "application/json"
      },
      body: JSON.stringify(record)
    });
    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      return "Venture Lab 자동 반영 실패: " + String(payload.error || response.status);
    }

    const changedCount = Number(payload.insertedTaskCount || 0) + Number(payload.updatedTaskCount || 0);
    return "Venture Lab 서버에도 반영했습니다. 변경 " + changedCount + "개.";
  } catch (reason) {
    return "Venture Lab 자동 반영 실패: " + (reason instanceof Error ? reason.message : String(reason));
  }
}

function extractNextTask(taskText) {
  const sections = taskText.split(/\\n## T-/).slice(1).map((section) => "## T-" + section.trim());
  if (sections.length === 0) {
    return taskText.trim() || "저장된 작업 목록이 없습니다.";
  }

  const active = sections.find((section) => !section.includes("- 상태: 완료")) || sections[0];
  return active.trim();
}

async function recordProgress(args) {
  const progressPath = path.join(root, ".cursor", "venture-lab-progress.json");
  let records = [];

  try {
    records = JSON.parse(await readFile(progressPath, "utf8"));
    if (!Array.isArray(records)) {
      records = [];
    }
  } catch {
    records = [];
  }

  const record = {
    task: String(args?.task || "unnamed task"),
    status: String(args?.status || "reported"),
    summary: String(args?.summary || ""),
    files: Array.isArray(args?.files) ? args.files.map(String) : [],
    verification: String(args?.verification || ""),
    recordedAt: new Date().toISOString()
  };

  records.push(record);

  await mkdir(path.dirname(progressPath), { recursive: true });
  await writeFile(progressPath, JSON.stringify(records, null, 2) + "\\n", "utf8");
  return "진행 기록을 .cursor/venture-lab-progress.json에 저장했습니다. " + await syncProgress(record);
}

function parseFlagArgs(argv) {
  const flags = {};
  let current = null;

  for (const item of argv) {
    if (item.startsWith("--")) {
      current = item.slice(2);
      flags[current] = flags[current] || [];
      continue;
    }

    if (current) {
      flags[current].push(item);
    }
  }

  return flags;
}

function firstFlag(flags, name, fallback = "") {
  return String(flags[name]?.[0] || fallback);
}

function collectFileFlags(flags) {
  return [...(flags.file || []), ...(flags.files || [])]
    .flatMap((value) => String(value).split(","))
    .map((value) => value.trim())
    .filter(Boolean);
}

async function readProgressRecords() {
  const progress = await readJson(".cursor/venture-lab-progress.json");
  return Array.isArray(progress) ? progress : [];
}

async function printStatus() {
  const config = await readJson(".cursor/venture-lab-sync.json");
  const progress = await readProgressRecords();

  console.log("AI Venture Lab connector");
  console.log("Project: " + String(config?.ideaName || "unknown"));
  console.log("Project key: " + String(config?.projectKey || "unknown"));
  console.log("Server sync: " + (config?.endpoint && config?.token ? "configured" : "local only"));
  console.log("Local progress records: " + String(progress.length));
}

function printHelp() {
  console.log([
    "AI Venture Lab local connector",
    "",
    "Commands:",
    "  node .cursor/venture-lab-cli.mjs mcp",
    "  node .cursor/venture-lab-cli.mjs status",
    "  node .cursor/venture-lab-cli.mjs next-task",
    "  node .cursor/venture-lab-cli.mjs read package|tasks|guide|start",
    "  node .cursor/venture-lab-cli.mjs record-progress --task T-001 --status done --summary completed --file src/app/page.tsx --verification pnpm-build-passed",
    "",
    "The connector never prints the sync token. Progress is saved locally first, then synced to Venture Lab when configured."
  ].join("\\n"));
}

async function handle(message) {
  const id = message.id;
  const method = message.method;

  if (!method) {
    return;
  }

  if (method === "initialize") {
    result(id, {
      protocolVersion: message.params?.protocolVersion || "2025-06-18",
      capabilities: {
        resources: {},
        tools: {},
        prompts: {}
      },
      serverInfo: {
        name: "ai-venture-lab-local",
        version: "0.1.0"
      }
    });
    return;
  }

  if (method === "notifications/initialized") {
    return;
  }

  if (method === "resources/list") {
    result(id, {
      resources: [
        { uri: "venture://package", name: "AI Venture Lab package", mimeType: "text/markdown" },
        { uri: "venture://tasks", name: "AI Venture Lab tasks", mimeType: "text/markdown" },
        { uri: "venture://guide", name: "AI Venture Lab guide", mimeType: "text/markdown" },
        { uri: "venture://start", name: "AI Venture Lab start prompt", mimeType: "text/markdown" }
      ]
    });
    return;
  }

  if (method === "resources/read") {
    const uri = message.params?.uri;
    const relativePath = resourceFiles[uri];
    if (!relativePath) {
      error(id, -32602, "Unknown AI Venture Lab resource URI.");
      return;
    }

    result(id, {
      contents: [
        {
          uri,
          mimeType: "text/markdown",
          text: await readText(relativePath)
        }
      ]
    });
    return;
  }

  if (method === "tools/list") {
    result(id, {
      tools: [
        {
          name: "venture_next_task",
          description: "Read the next AI Venture Lab implementation task from AI_VENTURE_TASKS.md.",
          inputSchema: { type: "object", properties: {}, additionalProperties: false }
        },
        {
          name: "venture_record_progress",
          description: "Record Cursor progress locally and sync it back to AI Venture Lab when configured.",
          inputSchema: {
            type: "object",
            properties: {
              task: { type: "string" },
              status: { type: "string" },
              summary: { type: "string" },
              files: { type: "array", items: { type: "string" } },
              verification: { type: "string" }
            },
            required: ["task", "status", "summary"]
          }
        }
      ]
    });
    return;
  }

  if (method === "tools/call") {
    const name = message.params?.name;
    const args = message.params?.arguments || {};

    if (name === "venture_next_task") {
      result(id, {
        content: [
          {
            type: "text",
            text: extractNextTask(await readText("AI_VENTURE_TASKS.md"))
          }
        ]
      });
      return;
    }

    if (name === "venture_record_progress") {
      result(id, {
        content: [
          {
            type: "text",
            text: await recordProgress(args)
          }
        ]
      });
      return;
    }

    error(id, -32602, "Unknown AI Venture Lab tool.");
    return;
  }

  if (method === "prompts/list") {
    result(id, {
      prompts: [
        {
          name: "venture_start",
          description: "Start implementing from the AI Venture Lab production package."
        }
      ]
    });
    return;
  }

  if (method === "prompts/get") {
    result(id, {
      description: "Start implementing from the AI Venture Lab production package.",
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: await readText("AI_VENTURE_CURSOR_START.md")
          }
        }
      ]
    });
    return;
  }

  error(id, -32601, "Method not found.");
}

function startMcpServer() {
  const rl = readline.createInterface({ input: process.stdin });
  rl.on("line", (line) => {
    if (!line.trim()) {
      return;
    }

    try {
      void handle(JSON.parse(line));
    } catch (reason) {
      console.error("[ai-venture-lab-mcp] invalid message", reason);
    }
  });
}

async function runCli() {
  const command = process.argv[2] || "mcp";

  if (command === "mcp") {
    startMcpServer();
    return;
  }

  if (command === "status") {
    await printStatus();
    return;
  }

  if (command === "next-task") {
    console.log(extractNextTask(await readText("AI_VENTURE_TASKS.md")));
    return;
  }

  if (command === "read") {
    const key = process.argv[3] || "start";
    const aliases = {
      package: "venture://package",
      tasks: "venture://tasks",
      guide: "venture://guide",
      start: "venture://start"
    };
    const relativePath = resourceFiles[aliases[key] || key] || resourceFiles[key];

    if (!relativePath) {
      throw new Error("Unknown resource. Use package, tasks, guide, or start.");
    }

    console.log(await readText(relativePath));
    return;
  }

  if (command === "record-progress") {
    const flags = parseFlagArgs(process.argv.slice(3));
    const message = await recordProgress({
      task: firstFlag(flags, "task", "manual task"),
      status: firstFlag(flags, "status", "reported"),
      summary: firstFlag(flags, "summary"),
      files: collectFileFlags(flags),
      verification: firstFlag(flags, "verification")
    });
    console.log(message);
    return;
  }

  printHelp();
}

runCli().catch((reason) => {
  console.error(reason instanceof Error ? reason.message : String(reason));
  process.exitCode = 1;
});
`;
}

