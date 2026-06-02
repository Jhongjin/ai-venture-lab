import {
  implementationDependencyRules,
  implementationTaskPriorityLabels,
  implementationTaskStatusLabels,
  implementationTaskTypeLabels,
  type ImplementationDependencyStatus,
} from "@/lib/implementation-task-metadata";
import { decisionLabels, stageLabels } from "@/lib/workbench-labels";
import type { Idea } from "@/lib/venture-data";

type ImplementationDecisionState = Pick<Idea, "decision" | "stage">;

export type ImplementationDependencyPlanArtifactSaveDraft = {
  artifactType: "dev_runbook";
  body: string;
  source: "implementation_dependency_plan";
  title: string;
};

export function buildImplementationDependencyPlanArtifactSaveDraft({
  body,
  ideaName,
}: {
  body: string;
  ideaName: string | null;
}) {
  if (!ideaName || !body) {
    return null;
  }

  return {
    artifactType: "dev_runbook" as const,
    body,
    source: "implementation_dependency_plan" as const,
    title: `${ideaName} 개발 실행 순서 점검`,
  };
}

export function buildImplementationDependencyPlanMarkdown({
  idea,
  state,
  statuses,
}: {
  idea: Idea;
  state: ImplementationDecisionState;
  statuses: ImplementationDependencyStatus[];
}) {
  const readyStatuses = statuses.filter((status) => status.ready);
  const waitingStatuses = statuses.filter((status) => status.task.status !== "done" && !status.ready);
  const completedStatuses = statuses.filter((status) => status.task.status === "done");
  const nextStatus = readyStatuses[0] ?? null;
  const lineForStatus = (status: ImplementationDependencyStatus, index: number) =>
    `${index + 1}. ${status.task.title}
   - 유형/상태/우선순위: ${implementationTaskTypeLabels[status.task.task_type]} / ${
     implementationTaskStatusLabels[status.task.status]
   } / ${implementationTaskPriorityLabels[status.task.priority]}
   - 점검 상태: ${status.gate}
   - 다음 액션: ${status.nextAction}
   - 선행 조건: ${
     implementationDependencyRules[status.task.task_type].prerequisites
       .map((prerequisite) => implementationTaskTypeLabels[prerequisite])
       .join(", ") || "없음"
   }
   - 막힘: ${status.blockers.join(", ") || "없음"}`;

  return `# 개발 실행 순서 점검: ${idea.name}

## 현재 문맥

- 단계: ${stageLabels[state.stage]}
- 판단: ${decisionLabels[state.decision]}
- 한 줄 설명: ${idea.one_liner || "미정"}

## 권장 다음 태스크

${nextStatus ? lineForStatus(nextStatus, 0) : "열린 태스크 중 선행 조건을 모두 통과한 항목이 없습니다."}

## 바로 시작 가능

${readyStatuses.length > 0 ? readyStatuses.map(lineForStatus).join("\n\n") : "- 바로 시작 가능한 태스크가 없습니다."}

## 선행 조건 대기

${waitingStatuses.length > 0 ? waitingStatuses.map(lineForStatus).join("\n\n") : "- 선행 조건에 막힌 태스크가 없습니다."}

## 완료된 점검

${
  completedStatuses.length > 0
    ? completedStatuses
        .map(
          (status) =>
            `- ${status.task.title}: ${implementationTaskTypeLabels[status.task.task_type]} / ${
              implementationTaskStatusLabels[status.task.status]
            }`,
        )
        .join("\n")
    : "- 완료된 태스크가 없습니다."
}

## 실행 원칙

- 기획 범위가 잠기기 전에는 디자인, 데이터, 백엔드, 프론트 구현을 확장하지 않습니다.
- 데이터 모델이 준비되기 전에는 백엔드 권한과 API 구현을 완료 처리하지 않습니다.
- 디자인과 백엔드 경계가 준비되기 전에는 프론트 수직 슬라이스를 완료 처리하지 않습니다.
- QA와 보안이 완료되기 전에는 Production 배포 태스크를 완료 처리하지 않습니다.
`;
}

export function buildImplementationDependencyPlanDraft({
  idea,
  state,
  statuses,
}: {
  idea: Idea | null;
  state: ImplementationDecisionState | null;
  statuses: ImplementationDependencyStatus[];
}) {
  if (!idea || !state) {
    return "";
  }

  return buildImplementationDependencyPlanMarkdown({
    idea,
    state,
    statuses,
  });
}
