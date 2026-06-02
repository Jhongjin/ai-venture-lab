import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

const modulePath = path.join(process.cwd(), "src/lib/external-tool-setup-scripts.ts");
const downloadFileNameUrl = pathToFileURL(path.join(process.cwd(), "src/lib/download-file-name.ts")).href;
const source = readFileSync(modulePath, "utf8").replace(
  'from "@/lib/download-file-name";',
  `from ${JSON.stringify(downloadFileNameUrl)};`,
);
const { outputText } = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
  fileName: modulePath,
});
const moduleUrl = `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`;
const {
  buildCursorSetupPowerShell,
  buildLiveExternalToolSetupDownloadDraft,
  buildLiveToolSetupPowerShell,
} = await import(moduleUrl);

const idea = {
  id: "idea-1",
  name: "AI Venture Lab",
};
const productSurface = {
  label: "운영 콘솔",
};

const downloadDraft = buildLiveExternalToolSetupDownloadDraft({
  config: {
    buildFiles: ({ guideDraft, syncConfigDraft }) => [
      { body: guideDraft, path: "README.md" },
      { body: syncConfigDraft, path: ".cursor/venture-lab-sync.json" },
    ],
    buildGuideDraft: ({ idea, productSurface, projectKey, syncExpiresAt }) =>
      `guide:${idea.name}:${productSurface.label}:${projectKey}:${syncExpiresAt}`,
    buildSetupScript: ({ files, idea, projectKey }) =>
      `script:${idea.name}:${projectKey}:${files.map((file) => `${file.path}=${file.base64}`).join("|")}`,
    errorMessage: "Cursor 연결 파일을 만들지 못했습니다.",
    fileLabel: "Cursor 연결 스크립트",
    fileSuffix: "cursor-setup",
    loginMessage: "Cursor 자동 연결 파일을 받으려면 먼저 로그인하세요.",
    successMessage: "Cursor 연결 파일을 준비했습니다.",
    tool: "cursor",
    toolLabel: "Cursor",
  },
  encodeSetupFiles: (files) => files.map((file) => ({ base64: `encoded:${file.body}`, path: file.path })),
  idea,
  productSurface,
  projectKey: "PROJECT-1",
  syncConfigDraft: "sync-config",
  syncExpiresAt: "2026-06-02T00:00:00.000Z",
});

assert.equal(downloadDraft.label, "Cursor 연결 스크립트");
assert.equal(downloadDraft.fileName, "ai-venture-lab-cursor-setup.ps1");
assert.equal(downloadDraft.mimeType, "text/plain;charset=utf-8");
assert.match(downloadDraft.body, /script:AI Venture Lab:PROJECT-1/);
assert.match(downloadDraft.body, /README.md=encoded:guide:AI Venture Lab:운영 콘솔:PROJECT-1:2026-06-02T00:00:00.000Z/);
assert.match(downloadDraft.body, /.cursor\/venture-lab-sync.json=encoded:sync-config/);

const cursorScript = buildCursorSetupPowerShell({
  files: [{ base64: "abc", path: ".cursor/rules/ai-venture-lab.mdc" }],
  idea,
  projectKey: "PROJECT-1",
});
assert.match(cursorScript, /AI Venture Lab Cursor connection setup/);
assert.match(cursorScript, /\$ignoreEntries = @\(".cursor\/venture-lab-sync.json", ".cursor\/venture-lab-progress.json"\)/);
assert.match(cursorScript, /node .cursor\/venture-lab-cli.mjs next-task/);

const liveScript = buildLiveToolSetupPowerShell({
  files: [{ base64: "abc", path: ".claude/venture-lab-cli.mjs" }],
  folder: ".claude",
  idea,
  projectKey: "PROJECT-1",
  startFileName: "AI_VENTURE_CLAUDE_START.md",
  toolLabel: "Claude Code",
});
assert.match(liveScript, /AI Venture Lab Claude Code connection setup/);
assert.match(liveScript, /node .claude\/venture-lab-cli.mjs next-task/);
assert.match(liveScript, /AI_VENTURE_CLAUDE_START.md/);

console.log("External tool setup scripts smoke passed.");
