import { resolveProductSurfaceForIdea } from "@/lib/product-surface";
import type { Experiment, Idea, OrchestrationRun } from "@/lib/venture-data";
import { decisionLabels, stageLabels } from "@/lib/workbench-labels";

type TechSpecState = Pick<Idea, "stage" | "decision" | "risk_summary" | "next_evidence" | "product_surface">;

export function getTechSpecBuildRun(runs: OrchestrationRun[]) {
  return runs.find((run) => run.phase === "build");
}

export function getTechSpecSecurityRun(runs: OrchestrationRun[]) {
  return runs.find((run) => run.phase === "security");
}

export function buildTechSpecExperimentLines(experiments: Experiment[]) {
  return experiments.length > 0
    ? experiments.map((experiment) => `- ${experiment.name}: ${experiment.success_metric || "성공 지표 미정"}`).join("\n")
    : "- 측정 가능한 실험을 하나 정의합니다.";
}

export function formatTechSpecSecurityOutput({
  securityRun,
  riskSummary,
}: {
  securityRun: OrchestrationRun | undefined;
  riskSummary: string | null | undefined;
}) {
  return securityRun?.output || riskSummary || "보안 제작 자료가 아직 없습니다.";
}

export function formatTechSpecBuildOutput(buildRun: OrchestrationRun | undefined) {
  return buildRun?.output || "개발 실행 결과가 아직 없습니다. 데이터 모델, API 경계, UI 상태를 먼저 작성하세요.";
}

export function buildTechSpecMarkdown({
  idea,
  state,
  experiments,
  runs,
}: {
  idea: Idea;
  state: TechSpecState;
  experiments: Experiment[];
  runs: OrchestrationRun[];
}) {
  const productSurface = resolveProductSurfaceForIdea(idea, state);
  const buildRun = getTechSpecBuildRun(runs);
  const securityRun = getTechSpecSecurityRun(runs);
  const experimentLines = buildTechSpecExperimentLines(experiments);
  const securityOutput = formatTechSpecSecurityOutput({ securityRun, riskSummary: state.risk_summary });
  const buildOutput = formatTechSpecBuildOutput(buildRun);

  return `# 기술 명세: ${idea.name}

## 개발 범위

${idea.one_liner || "핵심 문제"}를 검증하는 최소 수직 슬라이스만 구현합니다.

- 대상 사용자: ${idea.target_user || "미정"}
- 구매자: ${idea.buyer || "미정"}
- 단계: ${stageLabels[state.stage]}
- 판단: ${decisionLabels[state.decision]}
- 제작 형태: ${productSurface.label}
- 정보 구조 기준: ${productSurface.iaHint}
- 첫 제작 형태: ${productSurface.firstBuild}
- 추가 확인 내용: ${state.next_evidence || "미정"}

## 백엔드 결정

- 기본 후보: Supabase
- Firebase/Firebase SQL Connect 전환 조건: 모바일 네이티브, 실시간/오프라인, 푸시, Crashlytics, Remote Config, Test Lab, App Check가 검증 핵심일 때
- 제작 형태별 스택 기준: ${productSurface.stackHint}
- 외부 제작 도구 전달 기준: ${productSurface.handoffHint}
- 최종 선택은 백엔드 결정 제작 자료에 기록합니다.

## 애플리케이션 경계

- Server Component: 인증된 데이터 조회, 정적 설명, 서버에서 안전한 집계
- Client Component: 폼 입력, 필터, 탭, 저장 후 즉시 반영되는 로컬 상태
- Server Action/Route Handler: 민감한 쓰기, 외부 API 호출, 서비스 키가 필요한 처리
- Database/RLS or Security Rules: 소유권, 조직 권한, 입력 데이터 조건 검증

## 데이터 모델

- 핵심 엔티티:
- 필수 필드:
- 소유권/조직 경계:
- 감사 이벤트:
- 삭제/보관 정책:

## 실험과 이벤트

${experimentLines}

## 보안과 개인정보

${securityOutput}

- 비밀값은 서버 환경변수에만 둡니다.
- 클라이언트 공개 키와 서버 전용 키를 분리합니다.
- RLS 또는 Security Rules의 허용/차단 케이스를 모두 테스트합니다.
- 개인정보 최소 수집, 보관 기간, 삭제 경로를 명시합니다.

## 운영 안전장치

- Vercel 환경변수: Preview/Production 변수명, 공개 가능 여부, 서버 전용 여부를 표로 정리합니다.
- 백엔드 규칙: Supabase RLS 또는 Firebase Security Rules/IAM의 허용/차단 테스트를 적습니다.
- 배포 로그: Preview URL, Production URL, Vercel inspect URL 또는 빌드 로그 위치를 남깁니다.
- 롤백 기준: 어떤 실패에서 직전 배포로 되돌릴지, DB 보정 SQL이 필요한지 적습니다.

## 구현 메모

${buildOutput}

## 검증 명령

- pnpm lint
- pnpm typecheck
- pnpm build
- pnpm harness:check
- 핵심 여정 브라우저 스모크
- 프로덕션 스모크

## 롤백

- Vercel 직전 배포로 롤백합니다.
- DB 변경은 보정 SQL 또는 되돌림 SQL을 준비합니다.
- 환경변수 변경은 새 배포 여부, Vercel 로그, Production alias 반영을 확인합니다.
`;
}
