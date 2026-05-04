$ErrorActionPreference = "Stop"

$required = @(
  "AGENTS.md",
  "README.md",
  "docs/OPERATING_MODEL.md",
  "docs/DECISION_LOG.md",
  "docs/RISK_REGISTER.md",
  "docs/QA_CHECKLIST.md",
  "docs/SUPABASE_SETUP.md",
  "templates/IDEA_BRIEF.md",
  "templates/PRD.md",
  "templates/MVP_SPEC.md",
  ".env.example",
  "supabase/bootstrap.sql",
  "supabase/migrations/20260503000000_initial_harness.sql",
  "supabase/migrations/20260503010000_add_operator_ownership.sql",
  "supabase/migrations/20260503060000_add_orchestration_runs.sql",
  "supabase/migrations/20260504000000_add_venture_artifacts.sql",
  "supabase/migrations/20260504010000_add_artifact_lifecycle.sql"
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
