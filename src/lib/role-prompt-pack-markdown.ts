import { artifactLabels, artifactStatusLabels } from "@/lib/artifact-labels";
import {
  implementationTaskPriorityLabels,
  implementationTaskStatusLabels,
  implementationTaskTypeLabels,
} from "@/lib/implementation-task-metadata";
import { resolveProductSurfaceForIdea } from "@/lib/product-surface";
import type { OrchestrationPhase } from "@/lib/supabase/types";
import type { Experiment, Idea, ImplementationTask, OrchestrationRun, Risk, VentureArtifact } from "@/lib/venture-data";
import {
  decisionLabels,
  experimentStatusLabels,
  orchestrationPhaseConfigs,
  riskSeverityLabels,
  riskStatusLabels,
  runStatusLabels,
  stageLabels,
} from "@/lib/workbench-labels";

type RolePromptPackState = Pick<
  Idea,
  "stage" | "decision" | "next_evidence" | "signal" | "risk_summary" | "product_surface"
>;

const promptInstructions: Record<OrchestrationPhase, string[]> = {
  strategy: [
    "기회 크기, 사용자 고통, 구매자, 차별화, 타이밍, 중단 기준을 한 장으로 정리한다.",
    "점수보다 증거를 우선하고, 강한 주장에는 필요한 추가 근거를 붙인다.",
    "반환은 proceed, research_more, pivot, kill 중 하나와 그 이유로 끝낸다.",
  ],
  research: [
    "시장, 경쟁 대안, 규제, 가격/지불 의향, 실제 사용 맥락을 검증한다.",
    "출처 없는 사실 주장은 사용하지 말고 확인 필요 항목으로 분리한다.",
    "인터뷰 질문, 검색 쿼리, 관찰해야 할 커뮤니티/리뷰 신호를 제안한다.",
  ],
  product: [
    "검증된 증거만 사용해 제품 기획서, 범위 제외 항목, 수용 기준, 성공 지표를 좁힌다.",
    "첫 릴리스는 하나의 핵심 여정과 하나의 측정 지표로 제한한다.",
    "불확실한 기능은 백로그가 아니라 검증 질문으로 되돌린다.",
  ],
  design: [
    "첫 화면이 바로 작업 화면이 되도록 핵심 여정, 입력, 결과, 빈/오류/권한 상태를 설계한다.",
    "데스크톱과 모바일에서 긴 스크롤 왕복이 생기지 않도록 왼쪽 단계, 오른쪽 작업 패널 구조를 우선한다.",
    "민감 데이터 고지, 되돌리기, 재시도, 저장 후 즉시 반영 상태를 포함한다.",
  ],
  build: [
    "제품 기획서와 첫 제작 범위를 넘지 않는 수직 슬라이스를 구현한다.",
    "데이터 모델, 권한, 환경변수, UI 상태, 품질 명령, 롤백 경로를 먼저 고정한다.",
    "저장 성공 후 화면 즉시 반영, 오류 메시지, 모바일 레이아웃을 구현 완료 기준에 포함한다.",
  ],
  qa: [
    "핵심 여정, 인증 전/후, 읽기 전용, 빈/로딩/성공/오류, 모바일, 회귀 위험을 검증한다.",
    "수동 스모크 경로와 자동 명령 결과를 분리해서 기록한다.",
    "실패 항목은 재현 절차, 기대/실제 결과, 차단 여부로 남긴다.",
  ],
  debug: [
    "가장 작은 재현 경로를 먼저 만들고 원인을 UI, 데이터, 권한, 네트워크, 배포 중 하나로 좁힌다.",
    "수정 전후 검증 명령과 스모크 결과를 남긴다.",
    "임시 우회와 근본 수정이 다르면 둘을 분리해 보고한다.",
  ],
  security: [
    "PII, 비밀값, 권한, RLS/Security Rules, prompt injection, abuse, retention을 검토한다.",
    "출시 차단 보안 이슈와 개선 권고를 분리한다.",
    "민감 데이터는 최소 수집, 보관 기간, 삭제 경로, 감사 로그 필요성을 확인한다.",
  ],
  launch: [
    "증거, 승인 제작 자료, 실험 결과, QA/보안, 고위험 리스크, 최종 판단 기록을 확인한다.",
    "ship, research_more, pivot, kill 중 하나를 추천하고 남은 조건을 명시한다.",
    "배포 후 스모크, 롤백 기준, 운영 모니터링 항목을 포함한다.",
  ],
};

export function buildRolePromptArtifactLines(artifacts: VentureArtifact[]) {
  if (artifacts.length === 0) {
    return "- 저장된 제작 자료가 없습니다.";
  }

  return artifacts
    .slice(0, 12)
    .map(
      (artifact) =>
        `- ${artifactLabels[artifact.artifact_type]} v${artifact.version ?? 1}: ${
          artifact.title || "제목 없음"
        } (${artifactStatusLabels[artifact.status]})`,
    )
    .join("\n");
}

export function buildRolePromptRiskLines(risks: Risk[]) {
  if (risks.length === 0) {
    return "- 연결된 리스크가 없습니다.";
  }

  return risks
    .map((risk) => `- ${risk.title}: ${riskSeverityLabels[risk.severity]} / ${riskStatusLabels[risk.status] ?? risk.status}`)
    .join("\n");
}

export function buildRolePromptExperimentLines(experiments: Experiment[]) {
  if (experiments.length === 0) {
    return "- 연결된 실험이 없습니다.";
  }

  return experiments
    .map(
      (experiment) =>
        `- ${experiment.name}: ${experimentStatusLabels[experiment.status]} / ${
          experiment.success_metric || "성공 지표 미정"
        }`,
    )
    .join("\n");
}

export function buildRolePromptTaskLines(implementationTasks: ImplementationTask[]) {
  if (implementationTasks.length === 0) {
    return "- 아직 구현 태스크가 없습니다.";
  }

  return implementationTasks
    .slice(0, 12)
    .map(
      (task) =>
        `- ${task.title}: ${implementationTaskTypeLabels[task.task_type]} / ${
          implementationTaskPriorityLabels[task.priority]
        } / ${implementationTaskStatusLabels[task.status]}`,
    )
    .join("\n");
}

export function buildRolePromptInstructionLines(phase: OrchestrationPhase) {
  return promptInstructions[phase].map((instruction) => `- ${instruction}`).join("\n");
}

export function buildRolePromptRoleSections(runs: OrchestrationRun[]) {
  const runByPhase = new Map(runs.map((run) => [run.phase, run]));

  return orchestrationPhaseConfigs
    .map((config) => {
      const run = runByPhase.get(config.phase);
      const instructionLines = buildRolePromptInstructionLines(config.phase);

      return `## ${config.label} / ${config.ownerRole}

역할 목표: ${run?.objective || config.objective}
현재 상태: ${run ? runStatusLabels[run.status] : "아직 실행 순서 묶음에 생성되지 않음"}

작업 안내:
${instructionLines}

반환 형식:
- 결론
- 근거
- 차단 항목
- 다음 액션
- 저장 또는 승인해야 할 제작 자료`;
    })
    .join("\n\n");
}

export function buildRolePromptPackMarkdown({
  idea,
  state,
  risks,
  experiments,
  runs,
  artifacts,
  implementationTasks,
}: {
  idea: Idea;
  state: RolePromptPackState;
  risks: Risk[];
  experiments: Experiment[];
  runs: OrchestrationRun[];
  artifacts: VentureArtifact[];
  implementationTasks: ImplementationTask[];
}) {
  const productSurface = resolveProductSurfaceForIdea(idea, state);
  const artifactLines = buildRolePromptArtifactLines(artifacts);
  const riskLines = buildRolePromptRiskLines(risks);
  const experimentLines = buildRolePromptExperimentLines(experiments);
  const taskLines = buildRolePromptTaskLines(implementationTasks);
  const rolePrompts = buildRolePromptRoleSections(runs);

  return `# 역할별 작업 안내 묶음: ${idea.name}

이 문서는 하나의 아이디어를 전략, 리서치, 제품, 디자인, 개발, QA, 디버깅, 보안, 출시 역할에 나눠 맡길 때 쓰는 공통 컨텍스트와 역할별 작업 안내입니다.

## 공통 컨텍스트

- 제품 가치: ${idea.one_liner || "미정"}
- 대상 사용자: ${idea.target_user || "미정"}
- 구매자: ${idea.buyer || "미정"}
- 현재 단계: ${stageLabels[state.stage]}
- 현재 판단: ${decisionLabels[state.decision]}
- 제작 형태: ${productSurface.label}
- 정보 구조 기준: ${productSurface.iaHint}
- 첫 제작 형태: ${productSurface.firstBuild}
- 제작 기준: ${productSurface.harnessFocus}
- 외부 전달 기준: ${productSurface.handoffHint}
- 추가 확인 내용: ${state.next_evidence || "미정"}
- 수요 신호: ${state.signal || "미정"}
- 리스크 요약: ${state.risk_summary || "미정"}

## 제작 자료 상태

${artifactLines}

## 리스크

${riskLines}

## 실험

${experimentLines}

## 구현 태스크

${taskLines}

## 공통 작업 규칙

- 답변은 한국어로 작성한다.
- 모르는 사실은 추정하지 말고 확인 필요로 분리한다.
- 새 기능보다 현재 점검을 통과시키는 데 필요한 가장 작은 제작 자료를 우선한다.
- 개인정보, 결제, 의료/요양, 법률, 금융, 가족/직장 대화 데이터는 민감 데이터로 다룬다.
- 결과는 AI가 저장한 자료에 남길 수 있도록 복사 가능한 Markdown으로 작성한다.
- 결과는 ${productSurface.label} 기준의 PRD, 디자인, 기술 스택, 제작 지시로 이어질 수 있어야 한다.

${rolePrompts}
`;
}
