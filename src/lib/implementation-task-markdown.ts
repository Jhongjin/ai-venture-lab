import { getProductSurfaceProfile } from "@/lib/product-surface";
import {
  buildProductSurfaceContextSection,
  implementationSurfaceTaskGuidance,
} from "@/lib/product-surface-implementation";
import type { ImplementationTaskType } from "@/lib/supabase/types";
import {
  getBlockedImplementationTaskHint,
  getImplementationEvidenceChecklist,
  getImplementationTaskOwnerRole,
  implementationRunFocus,
  implementationTaskPriorityLabels,
  implementationTaskStatusLabels,
  implementationTaskTypeLabels,
  sortImplementationTasksForAction,
} from "@/lib/implementation-task-metadata";
import type { Idea, ImplementationTask } from "@/lib/venture-data";
import { decisionLabels, stageLabels } from "@/lib/workbench-labels";

export type ImplementationMarkdownState = Pick<
  Idea,
  "stage" | "decision" | "signal" | "risk_summary" | "next_evidence" | "product_surface"
>;

function getImplementationMarkdownProductSurface(idea: Idea, state: ImplementationMarkdownState) {
  return getProductSurfaceProfile(state.product_surface ?? idea.product_surface, {
    name: idea.name,
    one_liner: idea.one_liner,
    target_user: idea.target_user,
    buyer: idea.buyer,
    signal: state.signal ?? idea.signal,
    risk_summary: state.risk_summary ?? idea.risk_summary,
    next_evidence: state.next_evidence ?? idea.next_evidence,
  });
}

export function buildImplementationTaskTicketMarkdown({
  idea,
  state,
  task,
}: {
  idea: Idea;
  state: ImplementationMarkdownState;
  task: ImplementationTask;
}) {
  const productSurface = getImplementationMarkdownProductSurface(idea, state);
  const surfaceGuidance = implementationSurfaceTaskGuidance[productSurface.key];
  const blockerHint = task.status === "blocked" ? getBlockedImplementationTaskHint(task) : null;

  return `# ${task.title}

## 컨텍스트

- 아이디어: ${idea.name}
- 한 줄 설명: ${idea.one_liner || "미정"}
- 대상 사용자: ${idea.target_user || "미정"}
- 현재 단계: ${stageLabels[state.stage]}
- 현재 판단: ${decisionLabels[state.decision]}

${buildProductSurfaceContextSection(productSurface, surfaceGuidance)}

## 태스크

- 유형: ${implementationTaskTypeLabels[task.task_type]}
- 우선순위: ${implementationTaskPriorityLabels[task.priority]}
- 상태: ${implementationTaskStatusLabels[task.status]}
- 담당 역할: ${task.owner_role || "owner 미정"}

${blockerHint ? `## 차단 해소 힌트

- 담당: ${blockerHint.ownerRole}
- 다음 액션: ${blockerHint.nextAction}
- 해소 증거: ${blockerHint.unblockEvidence}
- 에스컬레이션: ${blockerHint.escalation}` : ""}

## 수용 기준

${task.acceptance_criteria.trim() || "- 수용 기준이 아직 없습니다."}

## 완료 증거로 남길 것

- 커밋 또는 PR
- Preview 또는 Production URL
- Vercel inspect URL 또는 배포 로그
- 검증 명령 결과
- 핵심 여정 스모크 결과
- Supabase RLS 또는 Firebase Security Rules/IAM 허용/차단 검증
- 환경변수 공개 키와 서버 전용 비밀값 경계
- 남은 리스크와 롤백 메모

## 기본 검증

\`\`\`powershell
pnpm lint
pnpm typecheck
pnpm harness:check
pnpm build
\`\`\`
`;
}

export function buildImplementationBacklogMarkdown({
  idea,
  state,
  tasks,
  viewName = "열린 태스크",
  filterSummary = "상태: 완료 제외 / 담당: 전체 / 증거: 전체",
  evidenceByTaskId = {},
  emptyMessage = "대상 개발 태스크가 없습니다.",
}: {
  idea: Idea;
  state: ImplementationMarkdownState;
  tasks: ImplementationTask[];
  viewName?: string;
  filterSummary?: string;
  evidenceByTaskId?: Record<string, string>;
  emptyMessage?: string;
}) {
  const productSurface = getImplementationMarkdownProductSurface(idea, state);
  const surfaceGuidance = implementationSurfaceTaskGuidance[productSurface.key];
  const lines =
    tasks.length > 0
      ? sortImplementationTasksForAction(tasks)
          .map((task, index) => {
            const evidence = evidenceByTaskId[task.id] ?? task.evidence ?? "";
            const checklist = getImplementationEvidenceChecklist(task, evidence);
            const passedCount = checklist.filter((item) => item.passed).length;
            const missingLabels = checklist.filter((item) => !item.passed).map((item) => item.label);

            return [
              `${index + 1}. ${task.title} / ${implementationTaskTypeLabels[task.task_type]} / ${implementationTaskPriorityLabels[task.priority]} / ${implementationTaskStatusLabels[task.status]} / ${task.owner_role || "owner 미정"} / 증거 ${passedCount}/${checklist.length}`,
              `   - 수용 기준: ${task.acceptance_criteria.replace(/\n/g, "\n     ") || "미정"}`,
              `   - 증거 공백: ${missingLabels.length > 0 ? missingLabels.join(", ") : "없음"}`,
            ].join("\n");
          })
          .join("\n")
      : emptyMessage;

  return `# 개발 백로그: ${idea.name} - ${viewName}

## 제품 상태

- 한 줄 설명: ${idea.one_liner || "미정"}
- 현재 단계: ${stageLabels[state.stage]}
- 현재 판단: ${decisionLabels[state.decision]}
- 보기: ${filterSummary}

${buildProductSurfaceContextSection(productSurface, surfaceGuidance)}

## 열린 태스크 우선순위

${lines}

## 실행 규칙

- 차단 태스크를 먼저 해소합니다.
- 진행 중 태스크는 완료 증거를 붙여 완료로 옮깁니다.
- 할 일 태스크는 우선순위가 높은 것부터 진행합니다.
- 완료 처리 전 커밋, PR, 배포 URL, Vercel inspect URL 또는 배포 로그, 스모크 결과, 남은 리스크 중 최소 하나를 증거로 남깁니다.
`;
}

export function buildFilteredImplementationRunPromptMarkdown({
  idea,
  state,
  tasks,
  filterSummary,
  evidenceByTaskId = {},
}: {
  idea: Idea;
  state: ImplementationMarkdownState;
  tasks: ImplementationTask[];
  filterSummary: string;
  evidenceByTaskId?: Record<string, string>;
}) {
  const productSurface = getImplementationMarkdownProductSurface(idea, state);
  const surfaceGuidance = implementationSurfaceTaskGuidance[productSurface.key];
  const sortedTasks = sortImplementationTasksForAction(tasks);
  const roleLines =
    sortedTasks.length > 0
      ? Array.from(new Set(sortedTasks.map((task) => `${getImplementationTaskOwnerRole(task)}|${task.task_type}`)))
          .map((entry) => {
            const [ownerRole, taskType] = entry.split("|") as [string, ImplementationTaskType];

            return `- ${ownerRole}: ${implementationTaskTypeLabels[taskType]} - ${implementationRunFocus[taskType]}`;
          })
          .join("\n")
      : "- 현재 필터 조건에 맞는 실행 태스크가 없습니다.";
  const taskLines =
    sortedTasks.length > 0
      ? sortedTasks
          .map((task, index) => {
            const evidence = evidenceByTaskId[task.id] ?? task.evidence ?? "";
            const checklist = getImplementationEvidenceChecklist(task, evidence);
            const missingLabels = checklist.filter((item) => !item.passed).map((item) => item.label);
            const blockerHint = task.status === "blocked" ? getBlockedImplementationTaskHint(task) : null;

            return [
              `## ${index + 1}. ${task.title}`,
              `- 담당 역할: ${getImplementationTaskOwnerRole(task)}`,
              `- 유형/우선순위/상태: ${implementationTaskTypeLabels[task.task_type]} / ${implementationTaskPriorityLabels[task.priority]} / ${implementationTaskStatusLabels[task.status]}`,
              `- 수용 기준:\n${task.acceptance_criteria.trim() || "  - 미정"}`,
              `- 증거 공백: ${missingLabels.length > 0 ? missingLabels.join(", ") : "없음"}`,
              blockerHint
                ? `- 차단 해소: ${blockerHint.nextAction}\n- 해소 증거: ${blockerHint.unblockEvidence}\n- 에스컬레이션: ${blockerHint.escalation}`
                : "- 차단 해소: 해당 없음",
            ].join("\n");
          })
          .join("\n\n")
      : "현재 필터 조건에 맞는 실행 태스크가 없습니다.";

  return `# 제작 도구 작업 안내: ${idea.name}

너는 이 프로젝트의 제작 담당자입니다. 아래 필터 조건에 해당하는 태스크만 처리하고, 범위를 벗어나는 리팩터링이나 기능 확장은 하지 않습니다.

## 공통 컨텍스트

- 제품 가치: ${idea.one_liner || "미정"}
- 대상 사용자: ${idea.target_user || "미정"}
- 구매자: ${idea.buyer || "미정"}
- 현재 단계: ${stageLabels[state.stage]}
- 현재 판단: ${decisionLabels[state.decision]}
- 추가 확인 내용: ${state.next_evidence || "미정"}
- 필터 조건: ${filterSummary}

${buildProductSurfaceContextSection(productSurface, surfaceGuidance)}

## 역할별 초점

${roleLines}

## 작업 목록

${taskLines}

## 실행 규칙

- 기존 코드베이스 패턴, 파일 구조, 디자인 시스템을 우선합니다.
- 서로 다른 작업자가 있을 수 있으므로 사용자 또는 다른 작업자의 변경을 되돌리지 않습니다.
- SQL, RLS, Firebase Rules, Vercel 환경변수처럼 사용자가 직접 처리해야 하는 작업은 명확한 코드 블록과 실행 위치를 분리해 보고합니다.
- GitHub Actions workflow 변경은 현재 token scope가 풀릴 때까지 보류합니다.
- 완료 전 pnpm lint, pnpm typecheck, 필요한 경우 pnpm quality:full 또는 production smoke 결과를 남깁니다.

## 완료 보고 형식

- 변경 요약
- 수정 파일
- 검증 결과
- 남은 차단/SQL/외부 작업
- 커밋/PR 또는 배포 증거
`;
}
