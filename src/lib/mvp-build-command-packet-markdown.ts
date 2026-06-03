import { resolveProductSurfaceForIdea } from "@/lib/product-surface";
import {
  implementationTaskPriorityLabels,
  implementationTaskStatusLabels,
  implementationTaskTypeLabels,
} from "@/lib/implementation-task-metadata";
import type { DecisionStatus } from "@/lib/supabase/types";
import type { Idea, ImplementationTask } from "@/lib/venture-data";
import { decisionLabels, stageLabels } from "@/lib/workbench-labels";

type MvpBuildCommandState = Pick<Idea, "stage" | "decision" | "next_evidence" | "product_surface">;

type MvpBuildBackendCandidate = {
  label: string;
};

type MvpBuildReleaseDecisionPacket = {
  recommendation: DecisionStatus;
  blockers: string[];
};

export type MvpBuildDependencyStatus = {
  task: ImplementationTask;
  ready: boolean;
  blockers: string[];
  gate: string;
  nextAction: string;
};

export type MvpBuildArtifactReviewItem = {
  status: string;
  label: string;
  detail: string;
};

export function getRecommendedMvpBuildBackend(backendCandidateScores: MvpBuildBackendCandidate[]) {
  return backendCandidateScores[0]?.label ?? "Supabase";
}

export function getOpenMvpBuildDependencyStatuses(dependencyStatuses: MvpBuildDependencyStatus[]) {
  return dependencyStatuses.filter((status) => status.task.status !== "done");
}

export function getReadyMvpBuildDependencyStatuses(dependencyStatuses: MvpBuildDependencyStatus[]) {
  return getOpenMvpBuildDependencyStatuses(dependencyStatuses)
    .filter((status) => status.ready)
    .slice(0, 5);
}

export function getWaitingMvpBuildDependencyStatuses(dependencyStatuses: MvpBuildDependencyStatus[]) {
  return getOpenMvpBuildDependencyStatuses(dependencyStatuses)
    .filter((status) => !status.ready)
    .slice(0, 5);
}

export function getApprovedMvpBuildArtifacts(artifactReviewQueue: MvpBuildArtifactReviewItem[]) {
  return artifactReviewQueue.filter((item) => item.status === "approved");
}

export function buildMvpBuildSurfaceExclusionLine(productSurfaceKey: string) {
  return productSurfaceKey === "web_site"
    ? "- 복잡한 내부 운영 콘솔이나 다단계 CRM 자동화를 첫 슬라이스에 끼워 넣지 않는다."
    : "- 마케팅 랜딩 페이지 중심으로 만들지 않는다.";
}

export function getNextMvpBuildReleaseBlocker(releaseDecisionPacket: MvpBuildReleaseDecisionPacket | null) {
  return releaseDecisionPacket?.blockers[0] ?? "출시 판단 패킷이 아직 없습니다.";
}

export function formatMvpBuildLaunchInstruction(releaseDecisionPacket: MvpBuildReleaseDecisionPacket | null) {
  return releaseDecisionPacket?.recommendation === "ship"
    ? "출시 하드닝까지 진행 가능하지만 Production 반영 전 smoke, inspect URL, 롤백 기준을 완료 보고에 남깁니다."
    : "공개 출시 작업은 보류하고, 아래 차단 항목을 해소하는 첫 제작/검증 범위만 구현합니다.";
}

export function buildReadyMvpBuildTaskLines(readyTasks: MvpBuildDependencyStatus[]) {
  if (readyTasks.length === 0) {
    return "1. 바로 시작 가능한 태스크가 없습니다. 선행 조건 또는 제작 자료 승인을 먼저 닫습니다.";
  }

  return readyTasks
    .map(
      (status, index) =>
        `${index + 1}. ${status.task.title} / ${implementationTaskTypeLabels[status.task.task_type]} / ${implementationTaskPriorityLabels[status.task.priority]}\n   - 수용 기준: ${status.task.acceptance_criteria.trim() || "미정"}\n   - 다음 행동: ${status.nextAction}`,
    )
    .join("\n");
}

export function buildWaitingMvpBuildTaskLines(waitingTasks: MvpBuildDependencyStatus[]) {
  if (waitingTasks.length === 0) {
    return "- 선행 조건 때문에 대기 중인 태스크가 없습니다.";
  }

  return waitingTasks
    .map(
      (status) => `- ${status.task.title}: ${status.blockers.join(", ") || status.gate}\n  - 대기 해소: ${status.nextAction}`,
    )
    .join("\n");
}

export function buildMvpBuildTaskSnapshotLines(implementationTasks: ImplementationTask[]) {
  if (implementationTasks.length === 0) {
    return "- 구현 태스크가 없습니다. 먼저 기본 태스크를 생성하세요.";
  }

  return implementationTasks
    .map(
      (task) =>
        `- ${task.title}: ${implementationTaskTypeLabels[task.task_type]} / ${implementationTaskStatusLabels[task.status]} / ${implementationTaskPriorityLabels[task.priority]}`,
    )
    .join("\n");
}

export function buildMvpBuildArtifactQueueLines(artifactReviewQueue: MvpBuildArtifactReviewItem[]) {
  return artifactReviewQueue
    .map((item) => `- [${item.status === "approved" ? "x" : " "}] ${item.label}: ${item.detail}`)
    .join("\n");
}

export function buildMvpBuildCommandPacketMarkdown({
  idea,
  state,
  appBlueprint,
  scaffoldManifest,
  implementationHandoff,
  releaseDecisionPacket,
  implementationTasks,
  dependencyStatuses,
  backendCandidateScores,
  artifactReviewQueue,
}: {
  idea: Idea;
  state: MvpBuildCommandState;
  appBlueprint: string;
  scaffoldManifest: string;
  implementationHandoff: string;
  releaseDecisionPacket: MvpBuildReleaseDecisionPacket | null;
  implementationTasks: ImplementationTask[];
  dependencyStatuses: MvpBuildDependencyStatus[];
  backendCandidateScores: MvpBuildBackendCandidate[];
  artifactReviewQueue: MvpBuildArtifactReviewItem[];
}) {
  const recommendedBackend = getRecommendedMvpBuildBackend(backendCandidateScores);
  const productSurface = resolveProductSurfaceForIdea(idea, state);
  const surfaceExclusionLine = buildMvpBuildSurfaceExclusionLine(productSurface.key);
  const readyTasks = getReadyMvpBuildDependencyStatuses(dependencyStatuses);
  const waitingTasks = getWaitingMvpBuildDependencyStatuses(dependencyStatuses);
  const approvedArtifacts = getApprovedMvpBuildArtifacts(artifactReviewQueue);
  const nextReleaseBlocker = getNextMvpBuildReleaseBlocker(releaseDecisionPacket);
  const launchInstruction = formatMvpBuildLaunchInstruction(releaseDecisionPacket);
  const readyTaskLines = buildReadyMvpBuildTaskLines(readyTasks);
  const waitingTaskLines = buildWaitingMvpBuildTaskLines(waitingTasks);
  const taskSnapshotLines = buildMvpBuildTaskSnapshotLines(implementationTasks);
  const artifactQueueLines = buildMvpBuildArtifactQueueLines(artifactReviewQueue);

  return `# 제작 시작 안내 묶음: ${idea.name}

이 패킷은 실제 구현 세션의 첫 메시지로 사용합니다. 구현자는 이 문서의 순서, 제외 범위, 검증 명령을 우선하고, 승인되지 않은 확장은 만들지 않습니다.

## 0. 현재 명령

- 제품 가치: ${idea.one_liner || "미정"}
- 대상 사용자: ${idea.target_user || "미정"}
- 구매자: ${idea.buyer || "미정"}
- 현재 단계/판단: ${stageLabels[state.stage]} / ${decisionLabels[state.decision]}
- 제작 형태: ${productSurface.label}
- 정보 구조 기준: ${productSurface.iaHint}
- 첫 제작 형태: ${productSurface.firstBuild}
- 제작 기준: ${productSurface.harnessFocus}
- 외부 전달 기준: ${productSurface.handoffHint}
- 추천 백엔드: ${recommendedBackend}
- 출시 권고: ${releaseDecisionPacket ? decisionLabels[releaseDecisionPacket.recommendation] : "미계산"}
- 출시 지침: ${launchInstruction}
- 첫 차단 항목: ${nextReleaseBlocker}

## 1. 제작자 시작 안내

너는 ${idea.name}의 첫 제작 범위를 구현하는 선임 개발 담당자다. 목표는 "${state.next_evidence || idea.one_liner || "추가 확인 내용"}"을 확인하는 하나의 작은 구현 흐름을 ${productSurface.firstBuild} 형태로 완성하는 것이다.

반드시 다음 순서를 지킨다.

1. 승인된 제작 자료와 태스크만 읽고 범위를 잠근다.
2. 데이터 모델, 권한 경계, 환경변수를 먼저 확인한다.
3. ${productSurface.promptFocus} 기준으로 핵심 입력, 저장, 조회, 오류/빈 상태, 권한 상태를 한 흐름으로 구현한다.
4. 모바일 390px와 데스크톱 1440px에서 겹침 없는지 확인한다.
5. 완료 전 lint, typecheck, build, 핵심 스모크를 실행한다.
6. 배포가 필요한 변경은 Preview/Production URL, Vercel inspect URL, 롤백 기준을 보고한다.

하지 않는다.

${surfaceExclusionLine}
- 결제, 대규모 관리자, 외부 계정 자동 조작, 고급 AI 자동화는 승인 제작 자료에 없으면 만들지 않는다.
- RLS 또는 Security Rules 없이 쓰기 기능을 만들지 않는다.
- 사용자의 기존 변경을 되돌리지 않는다.

## 2. 바로 시작 가능한 태스크

${readyTaskLines}

## 3. 선행 조건 대기 태스크

${waitingTaskLines}

## 4. 전체 태스크 스냅샷

${taskSnapshotLines}

## 5. 제작 자료 승인 상태

- 승인된 핵심 제작 자료: ${approvedArtifacts.length}/${artifactReviewQueue.length}

${artifactQueueLines}

## 6. 필수 검증 명령

\`\`\`bash
pnpm lint
pnpm typecheck
pnpm build
pnpm harness:check
pnpm release:check
\`\`\`

브라우저/배포 변경이 있으면 추가로 실행합니다.

\`\`\`bash
pnpm smoke:routes
pnpm smoke:browser
pnpm smoke:prod
\`\`\`

## 7. 완료 보고 형식

- 변경 요약
- 수정 파일
- 실행한 검증 명령과 결과
- 권한/RLS 또는 Security Rules 허용/차단 증거
- Preview/Production URL과 Vercel inspect URL
- 남은 차단 항목
- 롤백 기준
- 다음 작업

## 8. 앱 구조 요약 원문

${appBlueprint}

## 9. 시작 구조 원문

${scaffoldManifest}

## 10. 제작 전달 자료 원문

${implementationHandoff}
`;
}
