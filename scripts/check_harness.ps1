$ErrorActionPreference = "Stop"

$required = @(
  "AGENTS.md",
  "README.md",
  "docs/OPERATING_MODEL.md",
  "docs/DECISION_LOG.md",
  "docs/RISK_REGISTER.md",
  "docs/QA_CHECKLIST.md",
  "templates/IDEA_BRIEF.md",
  "templates/PRD.md",
  "templates/MVP_SPEC.md",
  ".env.example"
)

$missing = @()
foreach ($path in $required) {
  if (-not (Test-Path -LiteralPath $path)) {
    $missing += $path
  }
}

if ($missing.Count -gt 0) {
  Write-Error ("Missing harness files: " + ($missing -join ", "))
}

Write-Host "Harness check passed."
