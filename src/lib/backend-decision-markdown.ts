import { productSurfaceMarkdown, resolveProductSurfaceForIdea } from "@/lib/product-surface";
import type { Idea } from "@/lib/venture-data";

type BackendDecisionState = Pick<Idea, "risk_summary" | "next_evidence" | "product_surface">;

type BackendDecisionCandidate = {
  label: string;
  score: number;
  summary: string;
  strengths: string[];
  cautions: string[];
};

export function buildBackendDecisionMarkdown({
  idea,
  state,
  candidates,
}: {
  idea: Idea;
  state: BackendDecisionState;
  candidates: BackendDecisionCandidate[];
}) {
  const productSurface = resolveProductSurfaceForIdea(idea, state);
  const recommended = candidates[0];
  const candidateRows = candidates
    .map(
      (candidate) =>
        `| ${candidate.label} | ${candidate.score} | ${candidate.strengths[0]} | ${candidate.cautions[0]} |`,
    )
    .join("\n");

  return `# 백엔드 결정: ${idea.name}

## 결정 요약

- 현재 권장: ${recommended?.label ?? "Supabase 우선 유지"}
- 추천 근거: ${recommended?.summary ?? "관계형 운영 콘솔과 RLS가 현재 기본 요구에 맞습니다."}
- 재검토 조건: 모바일 네이티브, 실시간/오프라인, 푸시, Crashlytics, Remote Config, Firebase Test Lab, App Check가 MVP 검증의 핵심이면 Firebase 또는 Firebase SQL Connect를 비교합니다.
- 판단 기준: ${state.next_evidence || "추가 확인 내용을 가장 빨리 검증하는 백엔드를 선택합니다."}

${productSurfaceMarkdown(productSurface)}

## 후보 평가표

| 후보 | 점수 | 강점 | 주의 |
| --- | ---: | --- | --- |
${candidateRows}

## Supabase를 선택하는 경우

- 관계형 데이터, SQL 질의, RLS, 조직 권한, 감사 로그가 핵심입니다.
- B2B 운영 콘솔, 관리자 워크플로우, 승인/점검 기록에 적합합니다.
- Vercel, Next.js App Router, Server Action/Route Handler 경계와 잘 맞습니다.

## Firebase를 선택하는 경우

- 모바일/웹 동시 개발, 실시간 동기화, 오프라인 경험이 핵심입니다.
- Analytics, Crashlytics, Cloud Messaging, Remote Config, Test Lab, App Check를 빠르게 묶어야 합니다.
- Firestore/Storage Security Rules, App Check, IAM, Admin SDK 경계를 먼저 설계합니다.

## Firebase SQL Connect를 검토하는 경우

- PostgreSQL 데이터 모델이 필요하지만 Firebase SDK와 Google Cloud 운영 경험도 중요합니다.
- region, 가격, realtime/offline 요구, schema/query/mutation 권한 모델을 비교합니다.

## 최종 선택 기록

- 선택한 백엔드:
- 선택 이유:
- 제외한 선택지와 이유:
- 인증 경계:
- 데이터 권한 경계:
- 로컬 개발/에뮬레이터:
- 환경변수:
- 백엔드 규칙 검증: RLS 또는 Security Rules 허용/차단 테스트
- 배포 로그: Vercel inspect URL 또는 Preview/Production 빌드 로그
- 배포/롤백:
- 남은 리스크: ${state.risk_summary || "미정"}
`;
}
