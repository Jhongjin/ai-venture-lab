export type GateCheck = {
  label: string;
  passed: boolean;
  detail: string;
};

export type GateCheckSummary = {
  nextBlocker: GateCheck | null;
  passedCount: number;
  score: number;
};

type WorkbenchDecisionStatus = "pending" | "research_more" | "ship" | "pivot" | "kill";

export function summarizeGateChecks(checks: GateCheck[]): GateCheckSummary {
  const passedCount = checks.filter((check) => check.passed).length;

  return {
    nextBlocker: checks.find((check) => !check.passed) ?? null,
    passedCount,
    score: checks.length === 0 ? 0 : Math.round((passedCount / checks.length) * 100),
  };
}

export function buildPrdReadinessChecks({
  decision,
  decisionCount,
  decisionLabel,
  hasCompletedExperiment,
  hasEvidenceCaptureArtifact,
  hasExperimentResultArtifact,
  hasIdeaBriefArtifact,
  hasResearchNoteArtifact,
  hasValidationSprintArtifact,
  hasValidationSummaryArtifact,
  highRiskCount,
  missing,
  unresolvedHighRiskCount,
}: {
  decision: WorkbenchDecisionStatus;
  decisionCount: number;
  decisionLabel: string;
  hasCompletedExperiment: boolean;
  hasEvidenceCaptureArtifact: boolean;
  hasExperimentResultArtifact: boolean;
  hasIdeaBriefArtifact: boolean;
  hasResearchNoteArtifact: boolean;
  hasValidationSprintArtifact: boolean;
  hasValidationSummaryArtifact: boolean;
  highRiskCount: number;
  missing: string[];
  unresolvedHighRiskCount: number;
}): GateCheck[] {
  return [
    {
      label: "기본 입력",
      passed: missing.length === 0,
      detail: missing.length === 0 ? "한 줄 설명, 대상 사용자, 구매자, 수요 신호가 채워져 있습니다." : missing.join(", "),
    },
    {
      label: "아이디어 요약",
      passed: hasIdeaBriefArtifact,
      detail: hasIdeaBriefArtifact ? "짧은 요약 문서가 저장되어 있습니다." : "검증 자료에서 아이디어 요약을 저장하세요.",
    },
    {
      label: "리서치 근거",
      passed: hasResearchNoteArtifact,
      detail: hasResearchNoteArtifact ? "리서치 노트가 1개 이상 저장되어 있습니다." : "조사 요약 또는 근거 노트를 저장하세요.",
    },
    {
      label: "7일 검증 계획",
      passed: hasValidationSprintArtifact,
      detail: hasValidationSprintArtifact ? "7일 검증 계획이 저장되어 있습니다." : "7일 검증 계획을 저장하세요.",
    },
    {
      label: "현장 근거",
      passed: hasEvidenceCaptureArtifact || hasExperimentResultArtifact,
      detail:
        hasEvidenceCaptureArtifact || hasExperimentResultArtifact
          ? "수동 근거 또는 검증 결과가 기록되어 있습니다."
          : "인터뷰, 외부 자료, 가격 신호, 검증 결과 중 하나를 저장하세요.",
    },
    {
      label: "검증 학습",
      passed: hasCompletedExperiment || hasExperimentResultArtifact,
      detail:
        hasCompletedExperiment || hasExperimentResultArtifact
          ? "완료된 검증 계획 또는 검증 결과 노트가 있습니다."
          : "검증 계획을 완료하거나 검증 결과 기록을 저장하세요.",
    },
    {
      label: "높은 리스크 통제",
      passed: unresolvedHighRiskCount === 0,
      detail:
        highRiskCount === 0
          ? "높음/치명 리스크가 없습니다."
          : `${highRiskCount - unresolvedHighRiskCount}/${highRiskCount}개 높은 리스크가 종료되었습니다.`,
    },
    {
      label: "판단 기록",
      passed: decision !== "pending" && decisionCount > 0,
      detail:
        decision !== "pending" && decisionCount > 0
          ? `${decisionLabel} 판단과 기록 ${decisionCount}개가 있습니다.`
          : "진행, 추가 조사, 전환, 중단 중 하나로 판단 근거를 남기세요.",
    },
    {
      label: "검증 완료 요약",
      passed: hasValidationSummaryArtifact,
      detail: hasValidationSummaryArtifact ? "기획서로 넘어가기 전 요약 메모가 저장되어 있습니다." : "검증 완료 요약을 저장하세요.",
    },
  ];
}

export function buildDesignReadinessChecks({
  hasBackendDecisionArtifact,
  hasDesignBriefArtifact,
  hasDesignStateCoverage,
  hasDoneDesignRun,
  hasMvpSpecArtifact,
  hasPrdArtifact,
  nextEvidence,
  oneLiner,
  targetUser,
}: {
  hasBackendDecisionArtifact: boolean;
  hasDesignBriefArtifact: boolean;
  hasDesignStateCoverage: boolean;
  hasDoneDesignRun: boolean;
  hasMvpSpecArtifact: boolean;
  hasPrdArtifact: boolean;
  nextEvidence: string;
  oneLiner: string;
  targetUser: string;
}): GateCheck[] {
  const hasCoreJourney = Boolean(oneLiner.trim() && targetUser.trim() && nextEvidence.trim());
  const hasDesignExecution = hasDoneDesignRun || hasDesignBriefArtifact;

  return [
    {
      label: "핵심 여정 고정",
      passed: hasCoreJourney,
      detail: hasCoreJourney
        ? "사용자, 가치 제안, 추가 확인 내용이 한 흐름으로 연결되어 있습니다."
        : "한 줄 설명, 대상 사용자, 추가 확인 내용을 먼저 고정하세요.",
    },
    {
      label: "제품 기획서",
      passed: hasPrdArtifact,
      detail: hasPrdArtifact ? "제품 기획서 초안이 저장되어 있습니다." : "제작 자료에서 제품 기획서를 저장하세요.",
    },
    {
      label: "첫 제작 범위",
      passed: hasMvpSpecArtifact,
      detail: hasMvpSpecArtifact ? "포함/제외 범위가 저장되어 있습니다." : "첫 제작 범위를 저장하세요.",
    },
    {
      label: "백엔드 선택",
      passed: hasBackendDecisionArtifact,
      detail: hasBackendDecisionArtifact
        ? "데이터/인증/운영 경계가 백엔드 결정에 기록되어 있습니다."
        : "백엔드 선택 비교를 보고 결정을 저장하세요.",
    },
    {
      label: "디자인 상태 커버리지",
      passed: hasDesignStateCoverage,
      detail: hasDesignStateCoverage
        ? "빈 상태, 로딩, 오류, 권한, 모바일, 접근성 상태가 디자인 기준에 포함되어 있습니다."
        : "디자인 기준에 빈 상태, 로딩, 오류, 권한, 모바일, 접근성을 명시하세요.",
    },
    {
      label: "디자인 실행",
      passed: hasDesignExecution,
      detail: hasDesignExecution ? "디자인 기준이 준비되어 있습니다." : "디자인 기준을 저장하세요.",
    },
  ];
}

export function buildBuildReadinessChecks({
  hasApprovedDesignBriefArtifact,
  hasApprovedMvpSpecArtifact,
  hasApprovedPrdArtifact,
  hasApprovedTechSpecArtifact,
  hasBackendDecisionArtifact,
  hasBackendRulesChecklist,
  hasDesignBriefArtifact,
  hasDevRunbookArtifact,
  hasEnvironmentChecklist,
  hasMvpSlicePlanArtifact,
  hasMvpSpecArtifact,
  hasPrdArtifact,
  hasReleaseOpsChecklist,
  hasTechSpecArtifact,
  implementationTaskCount,
  unresolvedHighRiskCount,
}: {
  hasApprovedDesignBriefArtifact: boolean;
  hasApprovedMvpSpecArtifact: boolean;
  hasApprovedPrdArtifact: boolean;
  hasApprovedTechSpecArtifact: boolean;
  hasBackendDecisionArtifact: boolean;
  hasBackendRulesChecklist: boolean;
  hasDesignBriefArtifact: boolean;
  hasDevRunbookArtifact: boolean;
  hasEnvironmentChecklist: boolean;
  hasMvpSlicePlanArtifact: boolean;
  hasMvpSpecArtifact: boolean;
  hasPrdArtifact: boolean;
  hasReleaseOpsChecklist: boolean;
  hasTechSpecArtifact: boolean;
  implementationTaskCount: number;
  unresolvedHighRiskCount: number;
}): GateCheck[] {
  return [
    {
      label: "제품 기획서 승인",
      passed: hasApprovedPrdArtifact,
      detail: hasApprovedPrdArtifact
        ? "제품 기획서가 승인되어 제작 입력으로 쓸 수 있습니다."
        : hasPrdArtifact
          ? "제품 기획서 초안은 있고 승인이 필요합니다."
          : "제품 기획서를 먼저 저장하세요.",
    },
    {
      label: "첫 제작 범위 승인",
      passed: hasApprovedMvpSpecArtifact,
      detail: hasApprovedMvpSpecArtifact
        ? "첫 수직 슬라이스 범위가 승인되었습니다."
        : hasMvpSpecArtifact
          ? "첫 제작 범위 초안은 있고 승인이 필요합니다."
          : "첫 제작 범위를 먼저 저장하세요.",
    },
    {
      label: "첫 제작 범위 플랜",
      passed: hasMvpSlicePlanArtifact,
      detail: hasMvpSlicePlanArtifact
        ? "수동 검증, 얇은 제품, AI/자동화, 출시 준비 순서가 저장되어 있습니다."
        : "제작 자료에서 첫 제작 범위 플랜을 저장하세요.",
    },
    {
      label: "백엔드 결정",
      passed: hasBackendDecisionArtifact,
      detail: hasBackendDecisionArtifact
        ? "Supabase/Firebase 선택 근거가 기록되어 있습니다."
        : "백엔드 선택 비교에서 결정을 저장하세요.",
    },
    {
      label: "디자인 승인",
      passed: hasApprovedDesignBriefArtifact,
      detail: hasApprovedDesignBriefArtifact
        ? "구현 전 화면 흐름과 상태가 승인되었습니다."
        : hasDesignBriefArtifact
          ? "디자인 기준 초안은 있고 승인이 필요합니다."
          : "디자인 기준을 저장하세요.",
    },
    {
      label: "기술 명세 승인",
      passed: hasApprovedTechSpecArtifact,
      detail: hasApprovedTechSpecArtifact
        ? "데이터 모델, 권한, 검증 명령이 승인되었습니다."
        : hasTechSpecArtifact
          ? "기술 명세 초안은 있고 승인이 필요합니다."
          : "기술 명세를 저장하세요.",
    },
    {
      label: "제작 실행 계획",
      passed: hasDevRunbookArtifact,
      detail: hasDevRunbookArtifact
        ? "제작 순서와 로컬/배포 검증 경로가 있습니다."
        : "제작 실행 계획을 저장하세요.",
    },
    {
      label: "환경변수 경계",
      passed: hasEnvironmentChecklist,
      detail: hasEnvironmentChecklist
        ? "Vercel 환경변수와 서버/클라이언트 비밀값 경계가 제작 자료에 있습니다."
        : "기술 명세나 제작 실행 계획에 Vercel 환경변수, 서버 전용 키, 클라이언트 공개 키 경계를 적으세요.",
    },
    {
      label: "백엔드 규칙 검증",
      passed: hasBackendRulesChecklist,
      detail: hasBackendRulesChecklist
        ? "RLS 또는 Security Rules의 허용/차단 검증이 기록되어 있습니다."
        : "Supabase RLS 또는 Firebase Security Rules의 허용/차단 테스트 계획을 저장하세요.",
    },
    {
      label: "롤백/배포 로그",
      passed: hasReleaseOpsChecklist,
      detail: hasReleaseOpsChecklist
        ? "Production 배포 로그와 롤백 경로가 제작 자료에 있습니다."
        : "Preview/Production 배포 로그, Vercel inspect 링크, 롤백 기준을 제작 실행 계획에 기록하세요.",
    },
    {
      label: "태스크 분해",
      passed: implementationTaskCount > 0,
      detail: implementationTaskCount > 0 ? `${implementationTaskCount}개 구현 태스크로 쪼개져 있습니다.` : "기본 태스크를 생성하세요.",
    },
    {
      label: "높은 리스크",
      passed: unresolvedHighRiskCount === 0,
      detail:
        unresolvedHighRiskCount === 0
          ? "열린 높음/치명 리스크가 없습니다."
          : `${unresolvedHighRiskCount}개 높음/치명 리스크가 남아 있습니다.`,
    },
  ];
}

export function buildImplementationGateChecks({
  blockedTaskCount,
  completedTaskCount,
  completedTaskWithEvidenceCount,
  hasDoneQaRun,
  hasDoneSecurityRun,
  implementationTaskCount,
}: {
  blockedTaskCount: number;
  completedTaskCount: number;
  completedTaskWithEvidenceCount: number;
  hasDoneQaRun: boolean;
  hasDoneSecurityRun: boolean;
  implementationTaskCount: number;
}): GateCheck[] {
  return [
    {
      label: "제작 할 일 생성",
      passed: implementationTaskCount > 0,
      detail: implementationTaskCount > 0 ? `${implementationTaskCount}개의 실행 할 일이 있습니다.` : "제작 준비 과정에서 기본 실행 할 일을 생성하세요.",
    },
    {
      label: "차단된 할 일 없음",
      passed: blockedTaskCount === 0,
      detail: blockedTaskCount > 0 ? `${blockedTaskCount}개 할 일이 차단 상태입니다.` : "현재 차단 상태의 할 일이 없습니다.",
    },
    {
      label: "모든 할 일 완료",
      passed: implementationTaskCount > 0 && completedTaskCount === implementationTaskCount,
      detail: implementationTaskCount > 0 ? `${completedTaskCount}/${implementationTaskCount}개 완료` : "완료할 할 일이 아직 없습니다.",
    },
    {
      label: "완료 증거 기록",
      passed: completedTaskCount > 0 && completedTaskWithEvidenceCount === completedTaskCount,
      detail:
        completedTaskCount > 0
          ? `${completedTaskWithEvidenceCount}/${completedTaskCount}개 완료 항목에 근거가 있습니다.`
          : "완료된 할 일이 생기면 커밋, PR, 스모크 결과, 배포 URL 같은 근거를 기록하세요.",
    },
    {
      label: "QA와 보안 단계 완료",
      passed: hasDoneQaRun && hasDoneSecurityRun,
      detail: "QA와 보안 점검이 모두 완료되어야 합니다.",
    },
  ];
}
