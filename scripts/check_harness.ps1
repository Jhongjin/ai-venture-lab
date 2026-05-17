$ErrorActionPreference = "Stop"

$required = @(
  "AGENTS.md",
  "README.md",
  "docs/OPERATING_MODEL.md",
  "docs/PHASE_STATUS.md",
  "docs/DECISION_LOG.md",
  "docs/RISK_REGISTER.md",
  "docs/BACKEND_DECISION_GUIDE.md",
  "docs/DEVELOPMENT_HARNESS.md",
  "docs/IDEA_PORTFOLIO.md",
  "docs/QA_CHECKLIST.md",
  "docs/SECURITY_PRIVACY.md",
  "docs/PUBLIC_BETA_LAUNCH_EVIDENCE_PACKET.md",
  "docs/PUBLIC_BETA_LAUNCH_GATE.md",
  "docs/SUPABASE_SETUP.md",
  "docs/SMOKE_DATA_CLEANUP_RUNBOOK.md",
  "docs/USER_TEST_GUIDE.md",
  "templates/IDEA_BRIEF.md",
  "templates/PRD.md",
  "templates/MVP_SPEC.md",
  "templates/TECH_SPEC.md",
  "templates/DEV_RUNBOOK.md",
  "templates/DESIGN_BRIEF.md",
  "templates/LAUNCH_CHECKLIST.md",
  "templates/USER_INTERVIEW.md",
  "DESIGN.md",
  ".vercelignore",
  ".env.example",
  "supabase/bootstrap.sql",
  "supabase/migrations/20260503000000_initial_harness.sql",
  "supabase/migrations/20260503010000_add_operator_ownership.sql",
  "supabase/migrations/20260503020000_add_organization_access_model.sql",
  "supabase/migrations/20260503030000_private_workspace_reads.sql",
  "supabase/migrations/20260503040000_member_management_rpc.sql",
  "supabase/migrations/20260503050000_member_lifecycle_rpc.sql",
  "supabase/migrations/20260503060000_add_orchestration_runs.sql",
  "supabase/migrations/20260504000000_add_venture_artifacts.sql",
  "supabase/migrations/20260504010000_add_artifact_lifecycle.sql",
  "supabase/migrations/20260504020000_add_artifact_status_notes.sql",
  "supabase/migrations/20260505000000_expand_venture_artifact_types.sql",
  "supabase/migrations/20260505010000_add_implementation_tasks.sql",
  ".agents/skills/app-development-orchestrator/SKILL.md",
  ".agents/skills/idea-screening/SKILL.md",
  ".agents/skills/market-research/SKILL.md",
  ".agents/skills/prd-writer/SKILL.md",
  ".agents/skills/prototype-builder/SKILL.md",
  ".agents/skills/qa-debug/SKILL.md",
  ".agents/skills/security-privacy-review/SKILL.md",
  ".agents/skills/ux-review/SKILL.md",
  ".codex/agents/strategy-reviewer.toml",
  ".codex/agents/market-research.toml",
  ".codex/agents/prd-writer.toml",
  ".codex/agents/design-reviewer.toml",
  ".codex/agents/prototype-builder.toml",
  ".codex/agents/qa-runner.toml",
  ".codex/agents/qa-debug.toml",
  ".codex/agents/security-reviewer.toml",
  ".codex/agents/launch-gate.toml",
  ".codex/hooks/pre_tool_policy.ps1",
  ".codex/hooks/post_edit_check.ps1",
  "scripts/run_quality_gate.ps1",
  "scripts/score_idea.ps1",
  "scripts/check_release_readiness.ps1",
  "scripts/smoke_routes.ps1",
  "scripts/smoke_production.ps1"
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
