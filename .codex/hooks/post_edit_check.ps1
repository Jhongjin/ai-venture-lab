$ErrorActionPreference = "Stop"

if (Test-Path -LiteralPath "package.json") {
  pnpm lint
}
