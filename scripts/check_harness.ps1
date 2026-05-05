$ErrorActionPreference = "Stop"

$required = @(
  "AGENTS.md",
  "README.md",
  "docs/OPERATING_MODEL.md",
  "docs/DECISION_LOG.md",
  "docs/RISK_REGISTER.md",
  "docs/BACKEND_DECISION_GUIDE.md",
  "docs/DEVELOPMENT_HARNESS.md",
  "docs/QA_CHECKLIST.md",
  "docs/SUPABASE_SETUP.md",
  "templates/IDEA_BRIEF.md",
  "templates/PRD.md",
  "templates/MVP_SPEC.md",
  "templates/TECH_SPEC.md",
  "templates/DEV_RUNBOOK.md",
  "templates/DESIGN_BRIEF.md",
  "DESIGN.md",
  ".vercelignore",
  ".env.example",
  "supabase/bootstrap.sql",
  "supabase/migrations/20260503000000_initial_harness.sql",
  "supabase/migrations/20260503010000_add_operator_ownership.sql",
  "supabase/migrations/20260503060000_add_orchestration_runs.sql",
  "supabase/migrations/20260504000000_add_venture_artifacts.sql",
  "supabase/migrations/20260504010000_add_artifact_lifecycle.sql",
  "supabase/migrations/20260505000000_expand_venture_artifact_types.sql"
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
