import type { Experiment, Idea, ImplementationTask, OrchestrationRun, Risk, VentureArtifact } from "@/lib/venture-data";
import { decisionLabels, stageLabels } from "@/lib/workbench-labels";

type LaunchChecklistState = Pick<Idea, "stage" | "decision" | "next_evidence">;

export function hasLaunchChecklistArtifactType(
  artifacts: VentureArtifact[],
  artifactType: VentureArtifact["artifact_type"],
) {
  return artifacts.some((artifact) => artifact.artifact_type === artifactType);
}

export function hasApprovedLaunchChecklistArtifactType(
  artifacts: VentureArtifact[],
  artifactType: VentureArtifact["artifact_type"],
) {
  return artifacts.some((artifact) => artifact.artifact_type === artifactType && artifact.status === "approved");
}

export function countDoneLaunchChecklistImplementationTasks(implementationTasks: ImplementationTask[]) {
  return implementationTasks.filter((task) => task.status === "done").length;
}

export function getLaunchChecklistHighRisks(risks: Risk[]) {
  return risks.filter((risk) => ["high", "critical"].includes(risk.severity));
}

export function getDoneLaunchChecklistPhases(runs: OrchestrationRun[]) {
  return new Set(runs.filter((run) => run.status === "done").map((run) => run.phase));
}

export function buildLaunchChecklistProductArtifactLines({
  artifacts,
  implementationTasks,
}: {
  artifacts: VentureArtifact[];
  implementationTasks: ImplementationTask[];
}) {
  const hasPrd = hasLaunchChecklistArtifactType(artifacts, "prd");
  const hasApprovedPrd = hasApprovedLaunchChecklistArtifactType(artifacts, "prd");
  const hasMvpSpec = hasLaunchChecklistArtifactType(artifacts, "mvp_spec");
  const hasApprovedMvpSpec = hasApprovedLaunchChecklistArtifactType(artifacts, "mvp_spec");
  const hasBackendDecision = hasLaunchChecklistArtifactType(artifacts, "backend_decision");
  const hasDesignBrief = hasLaunchChecklistArtifactType(artifacts, "design_brief");
  const hasApprovedDesignBrief = hasApprovedLaunchChecklistArtifactType(artifacts, "design_brief");
  const hasTechSpec = hasLaunchChecklistArtifactType(artifacts, "tech_spec");
  const hasApprovedTechSpec = hasApprovedLaunchChecklistArtifactType(artifacts, "tech_spec");
  const hasDevRunbook = hasLaunchChecklistArtifactType(artifacts, "dev_runbook");
  const hasIdeaBrief = hasLaunchChecklistArtifactType(artifacts, "idea_brief");
  const hasResearchNote = hasLaunchChecklistArtifactType(artifacts, "research_note");
  const doneImplementationTaskCount = countDoneLaunchChecklistImplementationTasks(implementationTasks);

  return `- [${hasPrd ? "x" : " "}] 제품 기획서 저장
- [${hasApprovedPrd ? "x" : " "}] 제품 기획서 제작 자료 승인
- [${hasMvpSpec ? "x" : " "}] 첫 제작 범위 저장
- [${hasApprovedMvpSpec ? "x" : " "}] 첫 제작 범위 승인
- [${hasBackendDecision ? "x" : " "}] 백엔드 결정 저장
- [${hasDesignBrief ? "x" : " "}] 디자인 기준 저장
- [${hasApprovedDesignBrief ? "x" : " "}] 디자인 기준 제작 자료 승인
- [${hasTechSpec ? "x" : " "}] 기술 명세 저장
- [${hasApprovedTechSpec ? "x" : " "}] 기술 명세 제작 자료 승인
- [${hasDevRunbook ? "x" : " "}] 제작 실행 계획 저장
- [${hasIdeaBrief ? "x" : " "}] 아이디어 요약 저장
- [${hasResearchNote ? "x" : " "}] 조사 요약 저장
- [${implementationTasks.length > 0 ? "x" : " "}] 구현 태스크 생성
- [${implementationTasks.length > 0 && doneImplementationTaskCount === implementationTasks.length ? "x" : " "}] 구현 태스크 완료 (${doneImplementationTaskCount}/${implementationTasks.length})`;
}

export function buildLaunchChecklistPhaseLines(donePhases: Set<OrchestrationRun["phase"]>) {
  return `- [${donePhases.has("strategy") ? "x" : " "}] 전략 실행 완료
- [${donePhases.has("research") ? "x" : " "}] 리서치 실행 완료
- [${donePhases.has("product") ? "x" : " "}] 제품 실행 완료
- [${donePhases.has("design") ? "x" : " "}] 디자인 실행 완료
- [${donePhases.has("build") ? "x" : " "}] 개발 실행 완료
- [${donePhases.has("qa") ? "x" : " "}] QA 실행 완료
- [${donePhases.has("security") ? "x" : " "}] 보안 실행 완료
- [${donePhases.has("launch") ? "x" : " "}] 출시 실행 완료`;
}

export function buildLaunchChecklistExperimentLines(experiments: Experiment[]) {
  return experiments.length > 0
    ? experiments.map((experiment) => `- [ ] ${experiment.name}: ${experiment.success_metric || "성공 지표 미정"}`).join("\n")
    : "- [ ] 측정 가능한 실험을 하나 추가합니다.";
}

export function buildLaunchChecklistRiskLines(risks: Risk[]) {
  const highRiskLines = getLaunchChecklistHighRisks(risks).map((risk) => `- [ ] ${risk.title} (${risk.severity}, ${risk.status})`);

  return highRiskLines.length > 0 ? highRiskLines.join("\n") : "- [x] 현재 높음/매우 높은 연결 리스크가 없습니다.";
}

export function buildLaunchChecklistMarkdown({
  idea,
  state,
  risks,
  experiments,
  runs,
  artifacts,
  implementationTasks,
}: {
  idea: Idea;
  state: LaunchChecklistState;
  risks: Risk[];
  experiments: Experiment[];
  runs: OrchestrationRun[];
  artifacts: VentureArtifact[];
  implementationTasks: ImplementationTask[];
}) {
  const productArtifactLines = buildLaunchChecklistProductArtifactLines({ artifacts, implementationTasks });
  const donePhases = getDoneLaunchChecklistPhases(runs);
  const phaseLines = buildLaunchChecklistPhaseLines(donePhases);
  const plannedExperimentLines = buildLaunchChecklistExperimentLines(experiments);
  const riskLines = buildLaunchChecklistRiskLines(risks);

  return `# 출시 체크리스트: ${idea.name}

## 판단

- 현재 판단: ${decisionLabels[state.decision]}
- 현재 단계: ${stageLabels[state.stage]}
- 추가 확인 내용: ${state.next_evidence || "미정"}

## 제품 제작 자료

${productArtifactLines}

## 실행 단계 점검

${phaseLines}

## 검증 계획 점검

${plannedExperimentLines}

## 리스크 점검

${riskLines}

## 운영 점검

- [ ] 운영 환경과 유사한 환경에서 핵심 여정 테스트
- [ ] 오류 상태와 빈 상태 검토
- [ ] 워크스페이스 기록의 Supabase RLS 검증
- [ ] Firebase 선택 시 Security Rules, IAM, App Check 검증
- [ ] Vercel 환경변수 검증
- [ ] Preview/Production 배포 로그 또는 Vercel inspect URL 보관
- [ ] 롤백 경로 지정
- [ ] 최종 판단 기록
`;
}
