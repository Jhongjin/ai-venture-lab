$ErrorActionPreference = "Stop"

$checks = @(
  @{
    Path = "src/components/idea-workbench.tsx"
    Terms = @(
      "Vercel inspect URL",
      "Security Rules",
      "Production",
      "hasEnvironmentChecklist",
      "hasBackendRulesChecklist",
      "hasReleaseOpsChecklist"
    )
  },
  @{
    Path = "templates/TECH_SPEC.md"
    Terms = @(
      "Allowed/denied policy checks",
      "Vercel Preview variables",
      "Vercel Production variables",
      "Vercel deploy log or inspect URL",
      "Last known good deployment"
    )
  },
  @{
    Path = "templates/DEV_RUNBOOK.md"
    Terms = @(
      "Backend rules allowed/denied test plan",
      "Vercel environment variables",
      "Preview/Production deploy log or inspect link",
      "DB correction or revert SQL"
    )
  },
  @{
    Path = "templates/LAUNCH_CHECKLIST.md"
    Terms = @(
      "Vercel Preview/Production deploy log or inspect URL",
      "allowed and denied cases",
      "Last known good deployment"
    )
  },
  @{
    Path = "docs/CI_WORKFLOW_SCOPE_BOUNDARY.md"
    Terms = @(
      "ci_workflow_scope_boundary_docs_only",
      "workflow_scope_blocked",
      "no_workflow_file_mutation",
      "local_quality_full_is_required_gate",
      "future_ci_mirrors_local_gates",
      "no_secret_output",
      "no_production_mutation"
    )
  },
  @{
    Path = "docs/BETA_ENV_AND_SMOKE_BOUNDARY.md"
    Terms = @(
      "beta_env_smoke_boundary_docs_only",
      "names_only_no_values",
      "disposable_beta_account_only",
      "disposable_smoke_cleanup_runbook",
      "cleanup_owner_required",
      "smoke_data_ttl_required",
      "post_smoke_cleanup_status_required",
      "user_owned_cleanup_required",
      "cleanup_evidence_summary_only",
      "no_cleanup_without_user_approval",
      "no_auth_db_cleanup_automation",
      "no_primary_operator_data_cleanup",
      "rls_allowed_denied_smoke",
      "write_smoke_requires_explicit_approval",
      "telemetry_smoke_local_secret_only",
      "no_secret_output",
      "no_production_mutation"
    )
  },
  @{
    Path = "docs/RLS_ALLOWED_DENIED_SMOKE_PLAN.md"
    Terms = @(
      "rls_allowed_denied_smoke_plan",
      "second_disposable_account_required",
      "disposable_workspace_pair_required",
      "cross_workspace_denied_case",
      "summary_only_rls_evidence",
      "rls_smoke_runner_scaffold",
      "blocked_safe_runner",
      "write_flags_disabled",
      "explicit_rls_smoke_url_required"
    )
  },
  @{
    Path = "docs/SUPABASE_RLS_POLICY_POSTURE_REVIEW.md"
    Terms = @(
      "supabase_rls_policy_posture_review",
      "production_posture_summary_only",
      "initial_public_read_policy",
      "private_workspace_reads_migration",
      "owner_workspace_scoped_reads",
      "static_rls_policy_inventory",
      "legacy_seed_visibility_carveout",
      "production_migration_application_summary_recorded",
      "old_public_read_policies_absent",
      "rls_allowed_denied_browser_smoke_passed",
      "summary_only_evidence"
    )
  },
  @{
    Path = "docs/RLS_DISPOSABLE_FIXTURE_HANDOFF.md"
    Terms = @(
      "rls_disposable_fixture_handoff",
      "fixture_handoff_only",
      "two_disposable_auth_users_required",
      "two_private_workspace_labels_required",
      "synthetic_workspace_labels_only",
      "local_env_names_only",
      "production_migration_confirmation_required",
      "public_read_policies_absent_required",
      "disposable_pair_confirmed_before_rerun",
      "summary_only_rls_evidence",
      "forbidden_flags_block_smoke_run",
      "rls_fixture_cleanup_boundary",
      "fixture_retention_or_cleanup_decision_required",
      "rls_fixture_cleanup_owner_required",
      "no_rls_fixture_cleanup_automation",
      "rls_allowed_denied_browser_smoke_passed"
    )
  },
  @{
    Path = "docs/SMOKE_DATA_CLEANUP_RUNBOOK.md"
    Terms = @(
      "smoke_data_cleanup_runbook",
      "cleanup_boundary_ready",
      "disposable_fixture_retention",
      "summary_only_cleanup_evidence",
      "telemetry_event_cleanup_requires_user_approval",
      "no_primary_data_cleanup",
      "cleanup_requires_explicit_approval",
      "no_external_runtime_mutation"
    )
  },
  @{
    Path = "docs/PUBLIC_BETA_CHECKLIST.md"
    Terms = @(
      "public_beta_cleanup_gate",
      "disposable_smoke_records_reviewed",
      "cleanup_owner_recorded_before_beta"
    )
  },
  @{
    Path = "docs/SECURITY_PRIVACY.md"
    Terms = @(
      "cleanup_ownership_required_for_write_smoke",
      "no_primary_operator_data_cleanup"
    )
  },
  @{
    Path = "docs/PHASE_STATUS.md"
    Terms = @(
      "smoke_cleanup_user_action_recorded",
      "cleanup_status_not_applicable_or_owner_confirmed"
    )
  },
  @{
    Path = "docs/DEVELOPMENT_HARNESS.md"
    Terms = @(
      "Backend rules evidence",
      "No release handoff without a Preview/Production deploy log or Vercel inspect URL",
      "No environment-variable change without recording Preview/Production scope",
      "Save the Vercel inspect URL or deploy log location"
    )
  },
  @{
    Path = ".agents/skills/app-development-orchestrator/SKILL.md"
    Terms = @(
      "environment variables",
      "backend rules allowed/denied checks",
      "deploy-log location",
      "rollback criteria"
    )
  },
  @{
    Path = ".agents/skills/prototype-builder/SKILL.md"
    Terms = @(
      "Preview/Production environment variables",
      "deploy-log location",
      "allowed and denied backend-rule evidence"
    )
  },
  @{
    Path = ".agents/skills/security-privacy-review/SKILL.md"
    Terms = @(
      "allowed and denied evidence",
      "deploy logs",
      "Missing allowed/denied verification"
    )
  }
)

$missing = @()

foreach ($check in $checks) {
  if (-not (Test-Path -LiteralPath $check.Path)) {
    $missing += "$($check.Path): file missing"
    continue
  }

  $content = Get-Content -LiteralPath $check.Path -Raw
  foreach ($term in $check.Terms) {
    if (-not $content.Contains($term)) {
      $missing += "$($check.Path): missing '$term'"
    }
  }
}

if ($missing.Count -gt 0) {
  Write-Error ("Release readiness check failed:`n" + ($missing -join "`n"))
}

Write-Host "Release readiness check passed."
