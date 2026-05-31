import type { Experiment, Idea, ImplementationTask, OrchestrationRun, Risk, VentureArtifact } from "@/lib/venture-data";
import { decisionLabels, stageLabels } from "@/lib/workbench-labels";

type LaunchChecklistState = Pick<Idea, "stage" | "decision" | "next_evidence">;

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
  const hasPrd = artifacts.some((artifact) => artifact.artifact_type === "prd");
  const hasApprovedPrd = artifacts.some((artifact) => artifact.artifact_type === "prd" && artifact.status === "approved");
  const hasMvpSpec = artifacts.some((artifact) => artifact.artifact_type === "mvp_spec");
  const hasApprovedMvpSpec = artifacts.some(
    (artifact) => artifact.artifact_type === "mvp_spec" && artifact.status === "approved",
  );
  const hasBackendDecision = artifacts.some((artifact) => artifact.artifact_type === "backend_decision");
  const hasDesignBrief = artifacts.some((artifact) => artifact.artifact_type === "design_brief");
  const hasApprovedDesignBrief = artifacts.some(
    (artifact) => artifact.artifact_type === "design_brief" && artifact.status === "approved",
  );
  const hasTechSpec = artifacts.some((artifact) => artifact.artifact_type === "tech_spec");
  const hasApprovedTechSpec = artifacts.some(
    (artifact) => artifact.artifact_type === "tech_spec" && artifact.status === "approved",
  );
  const hasDevRunbook = artifacts.some((artifact) => artifact.artifact_type === "dev_runbook");
  const hasResearchNote = artifacts.some((artifact) => artifact.artifact_type === "research_note");
  const doneImplementationTaskCount = implementationTasks.filter((task) => task.status === "done").length;
  const highRiskLines = risks
    .filter((risk) => ["high", "critical"].includes(risk.severity))
    .map((risk) => `- [ ] ${risk.title} (${risk.severity}, ${risk.status})`);
  const donePhases = new Set(runs.filter((run) => run.status === "done").map((run) => run.phase));
  const plannedExperimentLines =
    experiments.length > 0
      ? experiments.map((experiment) => `- [ ] ${experiment.name}: ${experiment.success_metric || "성공 지표 미정"}`).join("\n")
      : "- [ ] 측정 가능한 실험을 하나 추가합니다.";

  return `# 출시 체크리스트: ${idea.name}

## 판단

- 현재 판단: ${decisionLabels[state.decision]}
- 현재 단계: ${stageLabels[state.stage]}
- 추가 확인 내용: ${state.next_evidence || "미정"}

## 제품 제작 자료

- [${hasPrd ? "x" : " "}] 제품 기획서 저장
- [${hasApprovedPrd ? "x" : " "}] 제품 기획서 제작 자료 승인
- [${hasMvpSpec ? "x" : " "}] 첫 제작 범위 저장
- [${hasApprovedMvpSpec ? "x" : " "}] 첫 제작 범위 승인
- [${hasBackendDecision ? "x" : " "}] 백엔드 결정 저장
- [${hasDesignBrief ? "x" : " "}] 디자인 기준 저장
- [${hasApprovedDesignBrief ? "x" : " "}] 디자인 기준 제작 자료 승인
- [${hasTechSpec ? "x" : " "}] 기술 명세 저장
- [${hasApprovedTechSpec ? "x" : " "}] 기술 명세 제작 자료 승인
- [${hasDevRunbook ? "x" : " "}] 제작 실행 계획 저장
- [${artifacts.some((artifact) => artifact.artifact_type === "idea_brief") ? "x" : " "}] 아이디어 요약 저장
- [${hasResearchNote ? "x" : " "}] 조사 요약 저장
- [${implementationTasks.length > 0 ? "x" : " "}] 구현 태스크 생성
- [${implementationTasks.length > 0 && doneImplementationTaskCount === implementationTasks.length ? "x" : " "}] 구현 태스크 완료 (${doneImplementationTaskCount}/${implementationTasks.length})

## 실행 단계 점검

- [${donePhases.has("strategy") ? "x" : " "}] 전략 실행 완료
- [${donePhases.has("research") ? "x" : " "}] 리서치 실행 완료
- [${donePhases.has("product") ? "x" : " "}] 제품 실행 완료
- [${donePhases.has("design") ? "x" : " "}] 디자인 실행 완료
- [${donePhases.has("build") ? "x" : " "}] 개발 실행 완료
- [${donePhases.has("qa") ? "x" : " "}] QA 실행 완료
- [${donePhases.has("security") ? "x" : " "}] 보안 실행 완료
- [${donePhases.has("launch") ? "x" : " "}] 출시 실행 완료

## 검증 계획 점검

${plannedExperimentLines}

## 리스크 점검

${highRiskLines.length > 0 ? highRiskLines.join("\n") : "- [x] 현재 높음/매우 높은 연결 리스크가 없습니다."}

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
