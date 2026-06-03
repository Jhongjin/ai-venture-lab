import { artifactLabels, artifactStatusLabels } from "@/lib/artifact-labels";
import { resolveProductSurfaceForIdea } from "@/lib/product-surface";
import type { Experiment, Idea, OrchestrationRun, Risk, VentureArtifact } from "@/lib/venture-data";
import { decisionLabels, phaseLabels, stageLabels } from "@/lib/workbench-labels";

type ImplementationHandoffState = Pick<Idea, "stage" | "decision" | "next_evidence" | "product_surface">;

export function getApprovedImplementationHandoffArtifacts(artifacts: VentureArtifact[]) {
  return artifacts.filter((artifact) => artifact.status === "approved");
}

export function getDoneImplementationHandoffPhaseLabels(runs: OrchestrationRun[]) {
  return runs.filter((run) => run.status === "done").map((run) => phaseLabels[run.phase]);
}

export function buildImplementationHandoffArtifactLines(artifacts: VentureArtifact[]) {
  return artifacts.length > 0
    ? artifacts
        .slice(0, 8)
        .map(
          (artifact) =>
            `- ${artifactLabels[artifact.artifact_type]} v${artifact.version ?? 1}: ${
              artifact.title || "제목 없음"
            } (${artifactStatusLabels[artifact.status]})`,
        )
        .join("\n")
    : "- 아직 저장된 제작 자료가 없습니다.";
}

export function buildImplementationHandoffRiskLines(risks: Risk[]) {
  return risks.length > 0
    ? risks.map((risk) => `- ${risk.title}: ${risk.severity} / ${risk.status} / ${risk.mitigation}`).join("\n")
    : "- 연결된 리스크가 없습니다.";
}

export function buildImplementationHandoffExperimentLines(experiments: Experiment[]) {
  return experiments.length > 0
    ? experiments.map((experiment) => `- ${experiment.name}: ${experiment.status} / ${experiment.success_metric || "성공 지표 미정"}`).join("\n")
    : "- 연결된 실험이 없습니다.";
}

export function buildImplementationHandoffDonePhaseLines(donePhases: string[]) {
  return donePhases.length > 0 ? donePhases.map((phase) => `- ${phase}`).join("\n") : "- 아직 완료된 역할 단계가 없습니다.";
}

export function buildImplementationHandoffMarkdown({
  idea,
  state,
  risks,
  experiments,
  runs,
  artifacts,
}: {
  idea: Idea;
  state: ImplementationHandoffState;
  risks: Risk[];
  experiments: Experiment[];
  runs: OrchestrationRun[];
  artifacts: VentureArtifact[];
}) {
  const productSurface = resolveProductSurfaceForIdea(idea, state);
  const approvedArtifacts = getApprovedImplementationHandoffArtifacts(artifacts);
  const artifactLines = buildImplementationHandoffArtifactLines(artifacts);
  const riskLines = buildImplementationHandoffRiskLines(risks);
  const experimentLines = buildImplementationHandoffExperimentLines(experiments);
  const donePhases = getDoneImplementationHandoffPhaseLabels(runs);
  const donePhaseLines = buildImplementationHandoffDonePhaseLines(donePhases);

  return `# 제작 도구 전달 자료: ${idea.name}

너는 이 아이디어의 MVP를 구현하는 선임 개발 담당자다. 아래 범위만 구현하고, 불확실한 것은 작게 검증 가능한 형태로 남겨라.

## 목표

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

## 구현 원칙

- 첫 릴리스는 하나의 핵심 사용자 여정만 구현한다.
- 저장, 조회, 권한, 오류, 빈 상태, 모바일 레이아웃을 함께 끝낸다.
- 비밀값은 서버 전용 환경변수로만 사용한다.
- Supabase를 쓰면 RLS와 insert/update with check를 먼저 설계한다.
- Firebase를 쓰면 Security Rules, App Check, Auth 경계를 먼저 설계한다.
- AI 기능은 사람의 검토, 재시도, 폐기 경로가 있을 때만 켠다.

## 제작 자료 상태

- 승인된 제작 자료 수: ${approvedArtifacts.length}
${artifactLines}

## 리스크

${riskLines}

## 검증 계획

${experimentLines}

## 완료된 실행 단계

${donePhaseLines}

## 구현 작업 목록

1. 제품 기획서와 첫 제작 범위를 읽고 ${productSurface.firstBuild}에 맞는 핵심 사용자 여정 1개를 고정한다.
2. 백엔드 결정 제작 자료를 읽고 Supabase/Firebase/Firebase SQL Connect/하이브리드 중 하나를 확정한다.
3. 데이터 모델, 권한 정책, 환경변수, 배포 로그 확인, 롤백 조건을 먼저 작성한다.
4. 핵심 입력 폼과 결과 화면을 구현한다.
5. 저장 성공 후 화면이 즉시 갱신되게 한다.
6. 빈 상태, 로딩, 성공, 오류, 권한 없음, 읽기 전용 상태를 구현한다.
7. 테스트와 수동 스모크 경로를 문서화한다.
8. Vercel Preview에서 확인한 뒤 Production 배포한다.

## 운영 안전장치

- 환경변수: Vercel Preview/Production 변수명, 공개 키, 서버 전용 비밀값, 재배포 필요 여부를 보고한다.
- 백엔드 규칙: Supabase RLS 또는 Firebase Security Rules/IAM의 허용/차단 테스트 결과를 보고한다.
- 배포 로그: Preview URL, Production URL, Vercel inspect URL 또는 빌드 로그 확인 결과를 남긴다.
- 롤백: 직전 배포로 되돌리는 조건, DB 보정 SQL 또는 되돌림 SQL 필요 여부를 남긴다.

## 품질 점검

- pnpm lint
- pnpm typecheck
- pnpm build
- pnpm harness:check
- 핵심 여정 브라우저 스모크
- 인증 전/후 저장 버튼 상태 확인
- 허용/차단 권한 케이스 확인
- 모바일 폭 레이아웃 확인
- Production 배포 후 로그인, 저장, 조회 확인

## 금지

- 제품 기획서/첫 제작 범위를 넘는 넓은 플랫폼화
- 리스크 수용 기록 없는 민감 데이터 수집
- 서비스 역할 키를 클라이언트에서 사용하는 구현
- 새로고침해야만 반영되는 저장 UX
- 오류 메시지가 없는 실패 상태

## 완료 보고 형식

- 변경 파일
- 구현한 사용자 여정
- DB/환경변수/백엔드 규칙/배포 변경
- Preview/Production URL과 배포 로그 또는 inspect 링크
- 검증 명령 결과
- 롤백 경로, 남은 리스크와 다음 작업
`;
}
