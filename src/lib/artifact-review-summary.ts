import type { VentureArtifact } from "@/lib/venture-data";
import type { VentureArtifactType } from "@/lib/supabase/types";
import { artifactLabels, artifactStatusLabels } from "@/lib/artifact-labels";

export type ArtifactReviewIntensity = "new" | "minor" | "moderate" | "major";

export type ArtifactReviewSummary = {
  previous: VentureArtifact | null;
  added: number;
  removed: number;
  addedSections: string[];
  removedSections: string[];
  intensity: ArtifactReviewIntensity;
  intensityLabel: string;
  recommendation: string;
  checks: string[];
};

export type ArtifactVersionSummary = {
  previous: VentureArtifact;
  added: number;
  removed: number;
};

export const artifactReviewIntensityTone: Record<ArtifactReviewIntensity, string> = {
  new: "avl-pill avl-pill-info",
  minor: "avl-pill avl-pill-success",
  moderate: "avl-pill avl-pill-warning",
  major: "avl-pill avl-pill-danger",
};

const artifactApprovalReviewChecks: Record<VentureArtifactType, string[]> = {
  idea_brief: ["문제와 대상 사용자가 현재 평가/리스크와 일치하는지 확인", "추가 확인 내용이 실제 실행 가능한지 확인"],
  research_note: ["출처와 관찰 사실이 추정과 분리되어 있는지 확인", "개인정보나 원문 민감정보가 남아 있지 않은지 확인"],
  prd: ["사용자, 문제, 범위, 제외 범위, 수용 기준이 서로 모순되지 않는지 확인", "성공 지표와 중단 기준이 측정 가능한지 확인"],
  mvp_spec: ["첫 제작 범위가 얇은 제품으로 제한되어 있는지 확인", "AI/자동화, 결제, 외부 계정 조작 등 제외 범위가 명확한지 확인"],
  backend_decision: ["환경변수 공개/서버 경계와 권한 규칙이 선택 백엔드에 맞는지 확인", "허용/차단 검증과 롤백 기준이 포함되어 있는지 확인"],
  design_brief: ["핵심 여정, 빈 상태, 오류, 모바일, 접근성 상태가 빠지지 않았는지 확인", "화면 흐름이 첫 제작 범위 밖으로 커지지 않았는지 확인"],
  tech_spec: ["데이터 모델, API/Server Action, 권한 경계, 검증 명령이 연결되어 있는지 확인", "마이그레이션과 롤백 경로가 운영 가능한지 확인"],
  dev_runbook: ["작업 순서, 담당 역할, 품질 점검, 완료 보고 형식이 실행 가능하게 적혀 있는지 확인", "사용자 액션과 자동 처리 가능한 작업이 분리되어 있는지 확인"],
  launch_checklist: ["QA, 보안, 높은 리스크, 최종 판단 기록이 출시 전에 닫히는지 확인", "Production smoke와 롤백 기준이 남아 있는지 확인"],
};

function splitComparableLines(body: string) {
  return body
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function countLines(lines: string[]) {
  const counts = new Map<string, number>();

  for (const line of lines) {
    counts.set(line, (counts.get(line) ?? 0) + 1);
  }

  return counts;
}

export function summarizeArtifactLineChanges(currentBody: string, previousBody: string) {
  const currentLines = splitComparableLines(currentBody);
  const previousLines = splitComparableLines(previousBody);
  const currentCounts = countLines(currentLines);
  const previousCounts = countLines(previousLines);
  let added = 0;
  let removed = 0;

  for (const [line, count] of currentCounts) {
    added += Math.max(0, count - (previousCounts.get(line) ?? 0));
  }

  for (const [line, count] of previousCounts) {
    removed += Math.max(0, count - (currentCounts.get(line) ?? 0));
  }

  return { added, removed };
}

export function getPreviousArtifactVersionCreatedAtTime(artifact: Pick<VentureArtifact, "created_at">) {
  return new Date(artifact.created_at).getTime();
}

export function comparePreviousArtifactVersions<T extends Pick<VentureArtifact, "created_at" | "version">>(
  a: T,
  b: T,
) {
  return (
    (b.version ?? 1) - (a.version ?? 1) ||
    getPreviousArtifactVersionCreatedAtTime(b) - getPreviousArtifactVersionCreatedAtTime(a)
  );
}

export function sortPreviousArtifactVersions<T extends Pick<VentureArtifact, "created_at" | "version">>(artifacts: T[]) {
  return [...artifacts].sort(comparePreviousArtifactVersions);
}

export function findPreviousArtifactVersion(artifact: VentureArtifact, artifacts: VentureArtifact[]) {
  return (
    sortPreviousArtifactVersions(
      artifacts.filter(
        (candidate) =>
          candidate.id !== artifact.id &&
          candidate.artifact_type === artifact.artifact_type &&
          (candidate.version ?? 1) < (artifact.version ?? 1),
      ),
    )[0] ?? null
  );
}

export function buildArtifactVersionSummaries(artifacts: VentureArtifact[]) {
  const summaries = new Map<string, ArtifactVersionSummary>();

  for (const artifact of artifacts) {
    const previous = findPreviousArtifactVersion(artifact, artifacts);

    if (previous) {
      summaries.set(artifact.id, {
        previous,
        ...summarizeArtifactLineChanges(artifact.body, previous.body),
      });
    }
  }

  return summaries;
}

function extractMarkdownSectionTitles(body: string) {
  return body
    .split(/\r?\n/)
    .map((line) => line.trim().match(/^#{1,3}\s+(.+)$/)?.[1]?.trim())
    .filter((section): section is string => Boolean(section));
}

export function summarizeArtifactReview(artifact: VentureArtifact, previous: VentureArtifact | null): ArtifactReviewSummary {
  const lineChanges = previous ? summarizeArtifactLineChanges(artifact.body, previous.body) : { added: 0, removed: 0 };
  const currentSections = new Set(extractMarkdownSectionTitles(artifact.body));
  const previousSections = new Set(previous ? extractMarkdownSectionTitles(previous.body) : []);
  const addedSections = [...currentSections].filter((section) => !previousSections.has(section));
  const removedSections = [...previousSections].filter((section) => !currentSections.has(section));
  const totalChanged = lineChanges.added + lineChanges.removed;
  const intensity: ArtifactReviewIntensity = !previous
    ? "new"
    : lineChanges.removed > 8 || removedSections.length > 0 || totalChanged >= 24
      ? "major"
      : totalChanged >= 8 || addedSections.length >= 3
        ? "moderate"
        : "minor";
  const intensityLabel: Record<ArtifactReviewIntensity, string> = {
    new: "신규",
    minor: "낮음",
    moderate: "중간",
    major: "높음",
  };
  const recommendation: Record<ArtifactReviewIntensity, string> = {
    new: "최초 버전입니다. 승인 전 필수 항목이 모두 들어 있는지 한 번에 확인하세요.",
    minor: "변경 폭이 작습니다. 상태 메모에 승인 근거를 짧게 남기면 충분합니다.",
    moderate: "변경 폭이 있습니다. 추가/변경된 섹션과 수용 기준을 확인한 뒤 승인하세요.",
    major: "큰 변경 또는 삭제가 있습니다. 이전 승인 내용과 충돌하지 않는지 리뷰 후 승인하세요.",
  };

  return {
    previous,
    added: lineChanges.added,
    removed: lineChanges.removed,
    addedSections,
    removedSections,
    intensity,
    intensityLabel: intensityLabel[intensity],
    recommendation: recommendation[intensity],
    checks: artifactApprovalReviewChecks[artifact.artifact_type],
  };
}

export function buildArtifactReviewSummaries(artifacts: VentureArtifact[]) {
  const summaries = new Map<string, ArtifactReviewSummary>();

  for (const artifact of artifacts) {
    summaries.set(artifact.id, summarizeArtifactReview(artifact, findPreviousArtifactVersion(artifact, artifacts)));
  }

  return summaries;
}

export function buildArtifactReviewSummaryState(artifacts: VentureArtifact[]) {
  return {
    artifactReviewSummaries: buildArtifactReviewSummaries(artifacts),
    artifactVersionSummaries: buildArtifactVersionSummaries(artifacts),
  };
}

export function buildArtifactReviewMemo(artifact: VentureArtifact, summary: ArtifactReviewSummary) {
  return `# 제작 자료 리뷰 메모: ${artifact.title || artifactLabels[artifact.artifact_type]}

## 기본 정보

- 유형: ${artifactLabels[artifact.artifact_type]}
- 상태: ${artifactStatusLabels[artifact.status ?? "draft"]}
- 현재 버전: v${artifact.version ?? 1}
- 이전 비교: ${summary.previous ? `v${summary.previous.version ?? 1}` : "최초 버전"}
- 리뷰 강도: ${summary.intensityLabel}

## 변경 요약

- 추가 라인: ${summary.added}
- 삭제 라인: ${summary.removed}
- 추가 섹션: ${summary.addedSections.join(", ") || "없음"}
- 삭제 섹션: ${summary.removedSections.join(", ") || "없음"}

## 승인 전 체크

${summary.checks.map((check) => `- ${check}`).join("\n")}

## 권장 판단

${summary.recommendation}
`;
}
