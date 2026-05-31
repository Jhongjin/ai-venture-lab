import type { Idea } from "@/lib/venture-data";

type SetupFile = { path: string; base64: string };

function escapePowerShellSingleQuoted(value: string) {
  return value.replace(/'/g, "''");
}

function buildSetupFileRows(files: SetupFile[]) {
  return files.map((file) => `  @{ Path = '${escapePowerShellSingleQuoted(file.path)}'; Base64 = '${file.base64}' }`).join("\n");
}

export function buildCursorSetupPowerShell({
  idea,
  projectKey,
  files,
}: {
  idea: Idea;
  projectKey: string;
  files: SetupFile[];
}) {
  const fileRows = buildSetupFileRows(files);

  return `# AI Venture Lab Cursor connection setup
# Project: ${idea.name}
# Key: ${projectKey}

$ErrorActionPreference = 'Stop'
$root = Get-Location
$files = @(
${fileRows}
)

foreach ($file in $files) {
  $target = Join-Path $root $file.Path
  $directory = Split-Path -Parent $target

  if ($directory -and -not (Test-Path -LiteralPath $directory)) {
    New-Item -ItemType Directory -Path $directory -Force | Out-Null
  }

  $bytes = [Convert]::FromBase64String($file.Base64)
  $text = [System.Text.Encoding]::UTF8.GetString($bytes)
  [System.IO.File]::WriteAllText($target, $text, [System.Text.UTF8Encoding]::new($false))
  Write-Host "created $($file.Path)"
}

$gitignorePath = Join-Path $root ".gitignore"
$ignoreEntries = @(".cursor/venture-lab-sync.json", ".cursor/venture-lab-progress.json")

if (-not (Test-Path -LiteralPath $gitignorePath)) {
  New-Item -ItemType File -Path $gitignorePath -Force | Out-Null
}

$existingIgnore = Get-Content -LiteralPath $gitignorePath -Raw -ErrorAction SilentlyContinue

foreach ($entry in $ignoreEntries) {
  if (-not $existingIgnore -or $existingIgnore -notmatch [regex]::Escape($entry)) {
    Add-Content -LiteralPath $gitignorePath -Value $entry
    Write-Host "gitignored $entry"
  }
}

Write-Host ""
Write-Host "AI Venture Lab Cursor connection files are ready."
Write-Host "Next check command: node .cursor/venture-lab-cli.mjs next-task"
Write-Host "Then reopen Cursor and enable ai-venture-lab in Settings > MCP > Workspace MCP Servers."
Write-Host "After it shows Enabled, paste AI_VENTURE_CURSOR_START.md into Composer."
Write-Host "When Cursor calls venture_record_progress, Venture Lab task status will be updated automatically."
`;
}

export function buildCodexSetupPowerShell({
  idea,
  projectKey,
  files,
}: {
  idea: Idea;
  projectKey: string;
  files: SetupFile[];
}) {
  const fileRows = buildSetupFileRows(files);

  return `# AI Venture Lab Codex connection setup
# Project: ${idea.name}
# Key: ${projectKey}

$ErrorActionPreference = 'Stop'
$root = Get-Location
$files = @(
${fileRows}
)

foreach ($file in $files) {
  $target = Join-Path $root $file.Path
  $directory = Split-Path -Parent $target

  if ($directory -and -not (Test-Path -LiteralPath $directory)) {
    New-Item -ItemType Directory -Path $directory -Force | Out-Null
  }

  $bytes = [Convert]::FromBase64String($file.Base64)
  $text = [System.Text.Encoding]::UTF8.GetString($bytes)
  [System.IO.File]::WriteAllText($target, $text, [System.Text.UTF8Encoding]::new($false))
  Write-Host "created $($file.Path)"
}

$gitignorePath = Join-Path $root ".gitignore"
$ignoreEntries = @(".codex/venture-lab-sync.json", ".codex/venture-lab-progress.json")

if (-not (Test-Path -LiteralPath $gitignorePath)) {
  New-Item -ItemType File -Path $gitignorePath -Force | Out-Null
}

$existingIgnore = Get-Content -LiteralPath $gitignorePath -Raw -ErrorAction SilentlyContinue

foreach ($entry in $ignoreEntries) {
  if (-not $existingIgnore -or $existingIgnore -notmatch [regex]::Escape($entry)) {
    Add-Content -LiteralPath $gitignorePath -Value $entry
    Write-Host "gitignored $entry"
  }
}

Write-Host ""
Write-Host "AI Venture Lab Codex connection files are ready."
Write-Host "Check: node .codex/venture-lab-cli.mjs next-task"
Write-Host "Next: open this project in Codex and paste AI_VENTURE_CODEX_START.md as the first message."
Write-Host "When Codex runs record-progress, Venture Lab task status will be updated automatically."
`;
}

export function buildLiveToolSetupPowerShell({
  idea,
  projectKey,
  files,
  toolLabel,
  folder,
  startFileName,
}: {
  idea: Idea;
  projectKey: string;
  files: SetupFile[];
  toolLabel: string;
  folder: string;
  startFileName: string;
}) {
  const fileRows = buildSetupFileRows(files);

  return `# AI Venture Lab ${toolLabel} connection setup
# Project: ${idea.name}
# Key: ${projectKey}

$ErrorActionPreference = 'Stop'
$root = Get-Location
$files = @(
${fileRows}
)

foreach ($file in $files) {
  $target = Join-Path $root $file.Path
  $directory = Split-Path -Parent $target

  if ($directory -and -not (Test-Path -LiteralPath $directory)) {
    New-Item -ItemType Directory -Path $directory -Force | Out-Null
  }

  $bytes = [Convert]::FromBase64String($file.Base64)
  $text = [System.Text.Encoding]::UTF8.GetString($bytes)
  [System.IO.File]::WriteAllText($target, $text, [System.Text.UTF8Encoding]::new($false))
  Write-Host "created $($file.Path)"
}

$gitignorePath = Join-Path $root ".gitignore"
$ignoreEntries = @("${folder}/venture-lab-sync.json", "${folder}/venture-lab-progress.json")

if (-not (Test-Path -LiteralPath $gitignorePath)) {
  New-Item -ItemType File -Path $gitignorePath -Force | Out-Null
}

$existingIgnore = Get-Content -LiteralPath $gitignorePath -Raw -ErrorAction SilentlyContinue

foreach ($entry in $ignoreEntries) {
  if (-not $existingIgnore -or $existingIgnore -notmatch [regex]::Escape($entry)) {
    Add-Content -LiteralPath $gitignorePath -Value $entry
    Write-Host "gitignored $entry"
  }
}

Write-Host ""
Write-Host "AI Venture Lab ${toolLabel} connection files are ready."
Write-Host "Check: node ${folder}/venture-lab-cli.mjs next-task"
Write-Host "Next: open this project in ${toolLabel} and paste ${startFileName} as the first message."
Write-Host "When ${toolLabel} records progress, Venture Lab task status will be updated automatically."
`;
}
