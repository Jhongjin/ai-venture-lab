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
    Path = "templates/BETA_SESSION_FEEDBACK.md"
    Terms = @(
      "controlled_beta_session_feedback_template",
      "summary_only_beta_feedback_template",
      "synthetic_beta_data_only",
      "beta_feedback_triage",
      "copy_or_flow_fix",
      "evidence_gap",
      "workflow_gap",
      "scope_risk",
      "no_real_pii_beta_session",
      "regulated_advice_scoped_out",
      "no_secret_or_env_readback",
      "no_raw_logs_or_sql",
      "no_private_screenshot_evidence",
      "smoke_evidence_not_user_feedback",
      "no_raw_transcripts",
      "no_credentials_in_feedback",
      "no_single_session_launch_claim",
      "usable_beta_session_evidence"
    )
  },
  @{
    Path = "docs/CONTROLLED_BETA_SESSION_PLAYBOOK.md"
    Terms = @(
      "controlled_beta_session_playbook",
      "controlled_beta_operator_session",
      "session_guidance_only",
      "no_broad_public_launch_approval",
      "beta_session_preconditions",
      "launch_gate_decision_ship_required",
      "production_smoke_before_beta_session",
      "no_smoke_rerun_inside_interview",
      "synthetic_beta_data_only",
      "no_real_pii_beta_session",
      "regulated_advice_scoped_out",
      "no_secret_or_env_readback",
      "no_private_screenshot_evidence",
      "beta_session_script_korean",
      "next_action_clarity_check",
      "synthetic_idea_walkthrough",
      "operator_decision_capture",
      "beta_observer_notes_template",
      "summary_only_beta_feedback",
      "controlled_beta_session_feedback_template",
      "summary_only_beta_feedback_template",
      "no_raw_transcripts",
      "no_raw_logs_or_sql",
      "no_credentials_in_feedback",
      "beta_session_stop_conditions",
      "private_data_stop_condition",
      "secret_exposure_stop_condition",
      "workspace_exposure_stop_condition",
      "next_action_failure_stop_condition",
      "beta_feedback_triage",
      "copy_or_flow_fix",
      "evidence_gap",
      "workflow_gap",
      "scope_risk",
      "smoke_evidence_not_user_feedback",
      "usable_beta_session_evidence",
      "summary_only_exit_criteria",
      "blocker_owner_required",
      "no_single_session_launch_claim"
    )
  },
  @{
    Path = "docs/APP_NODE_RUNTIME_POSTURE.md"
    Terms = @(
      "app_node_runtime_posture",
      "javascript_action_runtime_separate_from_app_runtime",
      "vercel_runtime_separate_from_ci_runtime",
      "next_16_min_node_20_9",
      "local_node_24_evidence_recorded",
      "no_repo_node_runtime_pin_found",
      "ci_app_node_matrix_20_24_configured",
      "ci_app_node_matrix_passed",
      "same_quality_full_command_for_each_node",
      "app_node_matrix_decision",
      "node_20_floor_node_24_forward_check_configured",
      "no_runtime_selection_change",
      "package_engines_node_not_added",
      "vercel_project_node_setting_not_changed",
      "ci_app_node_matrix_pass_requires_github_run",
      "matrix_evidence_summary_only",
      "ci_app_node_matrix_run_25985698631",
      "node_20_matrix_job_passed",
      "node_24_matrix_job_passed",
      "node_runtime_revisit_triggers",
      "engines_node_requires_review",
      "vercel_node_setting_requires_review",
      "dependency_major_upgrade_requires_runtime_review",
      "node_matrix_no_secret_policy",
      "node_matrix_no_production_mutation",
      "node_matrix_no_authenticated_write_smoke",
      "node_matrix_no_telemetry_smoke",
      "node_matrix_no_admate_projects_mutation"
    )
  },
  @{
    Path = "docs/CI_WORKFLOW_SCOPE_BOUNDARY.md"
    Terms = @(
      "ci_workflow_scope_active",
      "workflow_scope_approved",
      "quality_workflow_enabled",
      "checkout_persist_credentials_false",
      "approved_workflow_file_quality_yml",
      "single_workflow_file_only",
      "permissions_block_contents_read_only",
      "ci_runner_notice_recorded",
      "node20_action_notice_nonblocking",
      "windows_latest_redirect_notice_nonblocking",
      "node24_action_runtime_test_enabled",
      "windows_2025_vs2026_runner_enabled",
      "ci_app_node_matrix_20_24_configured",
      "ci_app_node_matrix_passed",
      "javascript_action_runtime_separate_from_app_runtime",
      "ci_runtime_maintenance_applied",
      "force_javascript_actions_to_node24",
      "windows_2025_vs2026_image_test",
      "app_node_20_floor_node_24_forward_check_configured",
      "no_runtime_selection_change",
      "ci_app_node_matrix_pass_requires_github_run",
      "matrix_evidence_summary_only",
      "ci_app_node_matrix_run_25985698631",
      "node_20_matrix_job_passed",
      "node_24_matrix_job_passed",
      "local_quality_full_still_required",
      "ci_mirrors_local_quality_full",
      "contents_read_only",
      "workflow_forbidden_pattern_guard",
      "single_workflow_file_guard",
      "no_workflow_secrets_reference",
      "no_repo_secrets",
      "local_quality_full_is_required_gate",
      "workflow_change_requires_review",
      "no_secret_output",
      "no_production_mutation"
    )
  },
  @{
    Path = ".github/workflows/quality.yml"
    Terms = @(
      "name: Quality Gate",
      "pull_request:",
      "push:",
      "branches:",
      "main",
      "permissions:",
      "contents: read",
      "persist-credentials: false",
      "windows-2025-vs2026",
      "FORCE_JAVASCRIPT_ACTIONS_TO_NODE24",
      "strategy:",
      "matrix:",
      "fail-fast: false",
      "node-version:",
      "- ""20""",
      "- ""24""",
      'node-version: ${{ matrix.node-version }}',
      "pnpm install --frozen-lockfile",
      "pnpm quality:full"
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
      "smoke_cleanup_evidence_recorded",
      "missing_cleanup_row_blocks_beta",
      "cleanup_status_closed_for_controlled_beta",
      "cleanup_disposition_closed",
      "no_primary_data_cleanup",
      "cleanup_requires_explicit_approval",
      "no_external_runtime_mutation"
    )
  },
  @{
    Path = "docs/PUBLIC_BETA_LAUNCH_GATE.md"
    Terms = @(
      "public_beta_launch_gate",
      "controlled_beta_ship_approved",
      "launch_gate_decision_ship",
      "quality_full_passed",
      "production_smoke_passed",
      "authenticated_write_smoke_passed",
      "rls_allowed_denied_browser_smoke_passed",
      "telemetry_smoke_passed_after_rotation",
      "last_known_good_deployment_recorded",
      "ship_evidence_ledger",
      "cleanup_disposition_closed",
      "risk_acceptance_recorded_for_controlled_beta",
      "artifact_approval_approved_for_controlled_beta",
      "rollback_evidence_recorded",
      "external_runtime_rotation_scope_none_or_completed",
      "qa_signoff_approved_for_controlled_beta",
      "security_privacy_signoff_approved_for_controlled_beta",
      "github_actions_non_blocking_for_controlled_beta",
      "openai_key_optional_with_local_fallback",
      "launch_evidence_summary_only"
    )
  },
  @{
    Path = "docs/PUBLIC_BETA_LAUNCH_EVIDENCE_PACKET.md"
    Terms = @(
      "public_beta_launch_evidence_packet",
      "controlled_beta_ship_approved",
      "operator_decision_packet_only",
      "launch_gate_decision_ship",
      "controlled_beta_ship_scope",
      "proven_technical_evidence",
      "cleanup_disposition_closed",
      "external_runtime_rotation_scope_none_or_completed",
      "risk_acceptance_recorded_for_controlled_beta",
      "artifact_approval_approved_for_controlled_beta",
      "qa_signoff_approved_for_controlled_beta",
      "security_privacy_signoff_approved_for_controlled_beta",
      "rollback_evidence_recorded",
      "final_operator_decision_ship",
      "rollback_owner_operator",
      "last_known_good_deployment_recorded",
      "controlled_beta_constraints",
      "launch_packet_summary_only",
      "no_secret_values_in_launch_packet"
    )
  },
  @{
    Path = "docs/RISK_REGISTER.md"
    Terms = @(
      "risk_owner_recorded",
      "beta_gate_disposition_recorded",
      "high_risk_accepted_or_scoped_for_controlled_beta",
      "risk_acceptance_recorded_for_controlled_beta",
      "conditional_mitigation_not_launch_closure",
      "external_runtime_rotation_scope_none_or_completed",
      "high_risk_open_blocks_ship"
    )
  },
  @{
    Path = "docs/PHASE_STATUS.md"
    Terms = @(
      "launch_gate_decision_ship",
      "launch_gate_snapshot_recorded",
      "cleanup_disposition_closed",
      "risk_acceptance_recorded_for_controlled_beta",
      "rollback_evidence_recorded_before_ship"
    )
  },
  @{
    Path = "docs/PUBLIC_BETA_CHECKLIST.md"
    Terms = @(
      "controlled_beta_ship_approved",
      "launch_gate_decision_ship",
      "operator_decision_source_of_truth",
      "rollback_evidence_recorded",
      "controlled_beta_session_playbook",
      "summary_only_beta_feedback",
      "synthetic_beta_data_only",
      "controlled_beta_session_feedback_template",
      "smoke_evidence_not_user_feedback",
      "public_beta_cleanup_gate",
      "disposable_smoke_records_reviewed",
      "cleanup_owner_recorded_before_beta"
    )
  },
  @{
    Path = "docs/SECURITY_PRIVACY.md"
    Terms = @(
      "cleanup_ownership_required_for_write_smoke",
      "no_primary_operator_data_cleanup",
      "privacy_data_inventory_required",
      "retention_ttl_unresolved",
      "deletion_path_unresolved",
      "consent_boundary_unresolved",
      "ai_prompt_data_boundary_unresolved",
      "obvious_secret_pattern_scan",
      "secret_scan_not_proof",
      "possible_secret_blocks_evidence",
      "no_env_file_readback"
    )
  },
  @{
    Path = "docs/PHASE_STATUS.md"
    Terms = @(
      "smoke_cleanup_user_action_recorded",
      "cleanup_status_not_applicable_or_owner_confirmed",
      "final_operator_decision_ship",
      "last_known_good_deployment_recorded"
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

$workflowFiles = @(Get-ChildItem -Path ".github/workflows" -File -Filter "*.yml" -ErrorAction SilentlyContinue)
$workflowFiles += @(Get-ChildItem -Path ".github/workflows" -File -Filter "*.yaml" -ErrorAction SilentlyContinue)

if ($workflowFiles.Count -ne 1 -or $workflowFiles[0].FullName -notlike "*\quality.yml") {
  $names = if ($workflowFiles.Count -eq 0) { "none" } else { ($workflowFiles | ForEach-Object { $_.FullName }) -join ", " }
  $missing += ".github/workflows: expected only quality.yml, found $names"
}

$qualityWorkflow = ".github/workflows/quality.yml"
if (Test-Path -LiteralPath $qualityWorkflow) {
  $workflowText = Get-Content -LiteralPath $qualityWorkflow -Raw
  $forbiddenWorkflowPatterns = @(
    "secrets\.",
    "permissions:\s*write-all",
    "contents:\s*write",
    "actions:\s*write",
    "deployments:\s*write",
    "id-token:\s*write",
    "TELEMETRY_INGEST_SECRET",
    "SUPABASE_SERVICE_ROLE_KEY",
    "OPENAI_API_KEY",
    "BROWSER_SMOKE_PASSWORD",
    "smoke:telemetry",
    "smoke:browser:auth",
    "smoke:browser:rls",
    "vercel\s+(deploy|rollback|promote)",
    "supabase\s+",
    "psql\s+",
    "production\s+sql"
  )

  foreach ($pattern in $forbiddenWorkflowPatterns) {
    if ($workflowText -match $pattern) {
      $missing += "${qualityWorkflow}: forbidden workflow pattern found: $pattern"
    }
  }

  $workflowLines = $workflowText -split "\r?\n"
  $permissionHeaderIndexes = @()
  for ($i = 0; $i -lt $workflowLines.Count; $i++) {
    if ($workflowLines[$i] -match "^permissions:\s*$") {
      $permissionHeaderIndexes += $i
    }
  }

  if ($permissionHeaderIndexes.Count -ne 1) {
    $missing += "${qualityWorkflow}: expected exactly one top-level permissions block"
  } else {
    $permissionBlockLines = @()
    for ($j = $permissionHeaderIndexes[0] + 1; $j -lt $workflowLines.Count; $j++) {
      $line = $workflowLines[$j]
      if ($line -match "^\S" -and $line.Trim().Length -gt 0) {
        break
      }

      if ($line -match "^\s+\S") {
        $permissionBlockLines += $line
      }
    }

    $permissionEntries = @($permissionBlockLines | Where-Object { $_ -notmatch "^\s*(#.*)?$" })
    if ($permissionEntries.Count -ne 1 -or $permissionEntries[0] -notmatch "^\s+contents:\s*read\s*$") {
      $missing += "${qualityWorkflow}: permissions block must contain only 'contents: read'"
    }
  }
}

if ($missing.Count -gt 0) {
  Write-Error ("Release readiness check failed:`n" + ($missing -join "`n"))
}

$stateFailures = @()

$launchPacketPath = "docs/PUBLIC_BETA_LAUNCH_EVIDENCE_PACKET.md"
$launchGatePath = "docs/PUBLIC_BETA_LAUNCH_GATE.md"

if ((Test-Path -LiteralPath $launchPacketPath) -and (Test-Path -LiteralPath $launchGatePath)) {
  $launchPacket = Get-Content -LiteralPath $launchPacketPath -Raw
  $launchGate = Get-Content -LiteralPath $launchGatePath -Raw
  $combinedLaunchEvidence = $launchPacket + "`n" + $launchGate

  if ($combinedLaunchEvidence -match "(?m)^launch_gate_decision:\s*ship\s*$") {
    $blockingMarkers = @(
      "pending_user_decision",
      "pending_cleanup_blocks_ship",
      "pending_risk_acceptance_blocks_ship",
      "pending_artifact_approval_blocks_ship",
      "pending_rollback_evidence_blocks_ship",
      "pending_qa_signoff_blocks_ship",
      "pending_security_privacy_signoff_blocks_ship",
      "cleanup_disposition_unresolved",
      "risk_acceptance_unresolved",
      "artifact_approval_unresolved",
      "rollback_evidence_unresolved",
      "external_runtime_secret_rotation_unverified",
      "qa_signoff_unresolved",
      "security_privacy_signoff_unresolved"
    )

    foreach ($marker in $blockingMarkers) {
      if ($combinedLaunchEvidence.Contains($marker)) {
        $stateFailures += "launch evidence: ship decision is blocked by '$marker'"
      }
    }
  }
}

$secretPatternFindings = @()
$secretPatterns = @(
  "sk-[A-Za-z0-9_-]{20,}",
  "ghp_[A-Za-z0-9]{20,}",
  "github_pat_[A-Za-z0-9_]{20,}",
  "xox[baprs]-[A-Za-z0-9-]{20,}",
  "eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}",
  "(TELEMETRY_INGEST_SECRET|SUPABASE_SERVICE_ROLE_KEY|OPENAI_API_KEY|BROWSER_SMOKE_PASSWORD|BROWSER_RLS_SMOKE_PASSWORD_A|BROWSER_RLS_SMOKE_PASSWORD_B)\s*[:=]\s*['""]?[A-Za-z0-9+/_=-]{12,}"
)

$scanRoots = @("docs", "templates")
foreach ($root in $scanRoots) {
  if (-not (Test-Path -LiteralPath $root)) {
    continue
  }

  $files = Get-ChildItem -LiteralPath $root -Recurse -File | Where-Object {
    $_.Name -notmatch "^\.env" -and
    $_.FullName -notmatch "\\\.tmp\\" -and
    $_.FullName -notmatch "\\\.tmpshots\\"
  }

  foreach ($file in $files) {
    $content = Get-Content -LiteralPath $file.FullName -Raw
    foreach ($pattern in $secretPatterns) {
      if ($content -match $pattern) {
        $relativePath = Resolve-Path -LiteralPath $file.FullName -Relative
        $secretPatternFindings += "${relativePath}: possible secret pattern found"
        break
      }
    }
  }
}

if ($secretPatternFindings.Count -gt 0) {
  $stateFailures += "obvious secret pattern scan found possible evidence leaks:`n" + ($secretPatternFindings -join "`n")
}

if ($stateFailures.Count -gt 0) {
  Write-Error ("Release readiness state check failed:`n" + ($stateFailures -join "`n"))
}

Write-Host "Release readiness keyword check passed."
