import { productSurfaceMarkdown, resolveProductSurfaceForIdea } from "@/lib/product-surface";
import {
  buildSurfaceArchitectureNotes,
  buildSurfaceDesignContext,
  implementationSurfaceTaskGuidance,
} from "@/lib/product-surface-implementation";
import type { Experiment, Idea, OrchestrationRun, VentureArtifact } from "@/lib/venture-data";
import { decisionLabels, stageLabels } from "@/lib/workbench-labels";

type AppDevelopmentPlanState = Pick<Idea, "decision" | "next_evidence" | "product_surface" | "risk_summary" | "stage">;

export function hasAppDevelopmentPlanArtifactType(
  artifacts: VentureArtifact[],
  artifactType: VentureArtifact["artifact_type"],
) {
  return artifacts.some((artifact) => artifact.artifact_type === artifactType);
}

export function getDoneAppDevelopmentPlanPhases(runs: OrchestrationRun[]) {
  return new Set(runs.filter((run) => run.status === "done").map((run) => run.phase));
}

export function getPrimaryAppDevelopmentPlanExperiment(experiments: Experiment[]) {
  return experiments[0] ?? null;
}

export function buildAppDevelopmentPlanMarkdown({
  idea,
  state,
  experiments,
  runs,
  artifacts,
}: {
  idea: Idea;
  state: AppDevelopmentPlanState;
  experiments: Experiment[];
  runs: OrchestrationRun[];
  artifacts: VentureArtifact[];
}) {
  const productSurface = resolveProductSurfaceForIdea(idea, state);
  const hasPrd = hasAppDevelopmentPlanArtifactType(artifacts, "prd");
  const hasResearchNote = hasAppDevelopmentPlanArtifactType(artifacts, "research_note");
  const hasMvpSpec = hasAppDevelopmentPlanArtifactType(artifacts, "mvp_spec");
  const hasBackendDecision = hasAppDevelopmentPlanArtifactType(artifacts, "backend_decision");
  const hasDesignBrief = hasAppDevelopmentPlanArtifactType(artifacts, "design_brief");
  const hasTechSpec = hasAppDevelopmentPlanArtifactType(artifacts, "tech_spec");
  const donePhases = getDoneAppDevelopmentPlanPhases(runs);
  const primaryExperiment = getPrimaryAppDevelopmentPlanExperiment(experiments);
  const surfaceGuidance = implementationSurfaceTaskGuidance[productSurface.key];
  const surfaceDesignContext = buildSurfaceDesignContext(productSurface, surfaceGuidance);
  const surfaceArchitectureNotes = buildSurfaceArchitectureNotes(productSurface, surfaceGuidance);

  return `# 앱 개발 실행 계획: ${idea.name}

## 0. 개발 진입 조건

- 현재 단계: ${stageLabels[state.stage]}
- 현재 판단: ${decisionLabels[state.decision]}
- 조사 요약 저장: ${hasResearchNote ? "완료" : "권장"}
- PRD 저장: ${hasPrd ? "완료" : "필요"}
- 첫 제작 범위 저장: ${hasMvpSpec ? "완료" : "필요"}
- 백엔드 결정 저장: ${hasBackendDecision ? "완료" : "필요"}
- 디자인 기준 저장: ${hasDesignBrief ? "완료" : "필요"}
- 기술 명세 저장: ${hasTechSpec ? "완료" : "필요"}
- 검증 계획: ${primaryExperiment ? `${primaryExperiment.name} / ${primaryExperiment.success_metric || "성공 지표 미정"}` : "측정 가능한 검증 계획 필요"}
- 추가 확인 내용: ${state.next_evidence || "미정"}

${productSurfaceMarkdown(productSurface)}

## 0.1 준비도 점검

- 디자인 준비도: 핵심 여정, 제품 기획서, 첫 제작 범위, 백엔드 결정, 빈 상태/로딩/오류/권한/모바일/접근성 커버리지를 확인합니다.
- 개발 착수 준비도: 승인된 제품 기획서, 승인된 첫 제작 범위, 백엔드 결정, 승인된 디자인 기준, 승인된 기술 명세, 제작 실행 계획, 구현 할 일, 높은 리스크 상태를 확인합니다.
- 운영 안전장치: Vercel 환경변수, Supabase RLS 또는 Firebase Security Rules, Preview/Production 배포 로그, 롤백 기준을 코드 작업 전에 기록합니다.
- 준비도 점검은 출시 준비도보다 앞선 작업입니다. 부족한 항목이 있으면 코드 작업보다 제작 자료 또는 리스크 정리를 우선합니다.

## 0.5 백엔드 선택

현재 AI Venture Lab 운영 콘솔은 Supabase를 유지합니다. 새 앱 아이디어를 실제 제품으로 만들 때는 docs/BACKEND_DECISION_GUIDE.md를 기준으로 Supabase, Firebase, Firebase SQL Connect, 또는 하이브리드를 다시 선택합니다.

### 기본 선택지

- Supabase: 관계형 데이터, SQL, RLS, 운영 콘솔, B2B 워크플로우에 적합합니다.
- Firebase: 모바일/웹 동시 개발, 실시간/오프라인, Google Analytics, Crashlytics, Cloud Messaging, Remote Config, Test Lab, App Check가 중요할 때 적합합니다.
- Firebase SQL Connect: PostgreSQL이 필요하지만 Firebase SDK, realtime sync, Google Cloud/Firebase 운영 경험도 필요한 경우 검토합니다.

### 제작 형태 기준

- 현재 권장 형태: ${productSurface.label}
- 첫 제작 형태: ${productSurface.firstBuild}
- 스택 기본값: ${productSurface.stackHint}
- 이 값은 기획서, 디자인 기준, 기술 명세, 외부 제작 도구 전달 자료의 기준입니다.

### 선택 기록

- 선택한 백엔드:
- 선택 이유:
- 제외한 백엔드와 이유:
- 인증 경계:
- 데이터 권한 경계:
- 로컬 개발/에뮬레이터:
- 환경변수와 비밀값 경계:
- 배포 로그와 롤백:

## 1. 기획

### 목표

${idea.one_liner || "아이디어의 핵심 사용자 가치가 아직 비어 있습니다."}

### 해야 할 일

- 대상 사용자와 구매자를 분리해 제품 기획서에 고정합니다.
- 핵심 사용자 여정 1개와 성공 지표 1개만 선택합니다.
- 하지 않을 기능과 중단 기준을 명시합니다.
- 발생 계기, 현재 우회 방법, 문제 비용을 인터뷰나 실제 기록으로 확인합니다.
- 앱이 아닌 수동 운영/콘텐츠/스프레드시트로 더 빠르게 검증 가능한지 비교합니다.

### 제작 자료

- PRD
- 첫 제작 범위
- 실험 성공 기준
- kill criteria
- acceptance criteria

## 2. 디자인

### DESIGN.md 컨텍스트

${surfaceDesignContext}

### 디자인 작업 안내

${idea.name}의 MVP 화면을 설계한다. 제작 형태는 ${productSurface.label}이며, 첫 제작 형태는 ${productSurface.firstBuild}이다. 대상 사용자는 ${idea.target_user || "미정"}이고 구매자는 ${
    idea.buyer || "미정"
  }이다. 사용자는 "${idea.one_liner || "핵심 문제"}"를 해결하려고 들어온다. 첫 화면은 설명 페이지가 아니라 바로 실행 가능한 작업 화면이어야 한다. 화면은 ${productSurface.iaHint} 기준의 핵심 여정, 입력 폼, 결과 상태, 오류/빈 상태, 권한 없음, 모바일 단일 컬럼을 포함한다. UI는 AI Venture Lab DESIGN.md 기준을 따르고, 각 화면마다 primary action은 하나만 둔다.

### 화면

- 진입 화면
- 핵심 입력 화면
- 결과/제작 자료 화면
- 빈 상태, 오류 상태, 권한 없음 상태
- 모바일 단일 컬럼 화면

### 체크

- 사용자가 첫 가치까지 도달하는 클릭 수를 줄입니다.
- 모바일에서 입력 필드와 버튼이 겹치지 않게 검증합니다.
- 민감 데이터 입력 전 고지와 동의를 분리합니다.
- 진행 상태와 다음 추천 행동을 항상 보이게 합니다.
- 되돌리기, 취소, 재시도 경로를 둡니다.

## 3. 개발

### 기술 명세 작성 안내

${idea.name}의 첫 개발 범위를 기술 명세로 작성한다. 반드시 Supabase, Firebase, Firebase SQL Connect, 하이브리드 중 하나를 선택하고 선택 이유를 기록한다. Next.js App Router 기준으로 Server Component, Client Component, Server Action 또는 Route Handler의 경계를 나누고, 선택한 백엔드의 권한 모델, 환경변수, UI 상태, 검증 명령, 수동 스모크 경로, 롤백 경로를 포함한다. 범위는 ${state.next_evidence || "추가 확인 내용"}을 확인하는 데 필요한 수직 슬라이스로 제한한다.

### 기본 아키텍처

${surfaceArchitectureNotes}
- Next.js 앱 라우터 또는 선택한 제작 형태에 맞는 클라이언트 앱 경계를 사용
- 선택한 백엔드의 인증, 데이터 저장, 권한 경계를 기술 명세에 고정
- Vercel 배포 또는 선택한 제작 환경의 Preview/Production 경로
- 서버 액션 또는 API는 권한 확인 후 쓰기 수행
- use client 경계는 브라우저 상태와 이벤트가 필요한 컴포넌트로만 제한
- 민감한 읽기/쓰기는 서버 또는 RLS 정책에서 재검증

### 구현 순서

1. 데이터 모델과 RLS를 먼저 확정합니다.
2. 핵심 여정의 입력, 저장, 조회를 구현합니다.
3. 빈 상태, 오류 상태, 로딩 상태를 추가합니다.
4. 실험 지표를 남길 이벤트 또는 기록 구조를 붙입니다.
5. QA와 보안 체크를 통과한 뒤 프로덕션 배포합니다.
6. AI/자동화 기능은 사람의 검토, 재시도, 폐기 경로를 붙인 뒤 활성화합니다.

### 데이터/RLS 체크

- 새 테이블이 public schema에 있으면 RLS를 활성화합니다.
- select/insert/update/delete별 정책을 나눠 작성합니다.
- insert/update에는 사용자 또는 조직 소유권 with check 조건을 둡니다.
- 허용 케이스와 차단 케이스를 모두 테스트합니다.
- 정책 변경 후 SQL Editor, migration, 또는 로컬 검증 로그 중 하나를 제작 자료에 남깁니다.

### Firebase 체크

- Firestore/Storage를 쓰면 Security Rules를 먼저 작성합니다.
- Rules는 request.auth, 소유권, 조직 멤버십, 입력 데이터 형태를 검증합니다.
- 서버 SDK/Admin SDK를 쓰면 IAM과 서버 전용 경계를 검토합니다.
- 공개 클라이언트에서 Firebase 리소스를 직접 호출하면 App Check를 검토합니다.
- SQL Connect를 쓰면 schema/query/mutation, auth, region, 가격, realtime/offline 동작을 확인합니다.
- Security Rules 또는 IAM 변경 후 허용/차단 케이스와 Emulator/Preview 결과를 기록합니다.

### 환경변수 체크

- Vercel Preview와 Production에 필요한 변수명을 분리해 적습니다.
- 브라우저에 노출 가능한 공개 키와 서버 전용 비밀값을 분리합니다.
- 서비스 역할 키, Admin SDK, 결제/AI API 키는 서버 경계 안에서만 사용합니다.
- 환경변수 변경 뒤에는 재배포 여부와 배포 로그를 확인합니다.

### 품질 점검

- pnpm lint
- pnpm typecheck
- pnpm build
- pnpm harness:check
- 핵심 여정 브라우저 스모크
- 배포 후 Production 스모크
- Vercel 배포 로그 또는 inspect 링크 확인

## 4. QA와 디버깅

- 인증 전/후 주요 버튼 상태 확인
- 새 기록 생성 후 화면 즉시 반영 확인
- 읽기 전용, 내 기록, 워크스페이스 권한 확인
- 실패한 저장 요청의 오류 메시지 확인
- 모바일 폭에서 레이아웃 확인
- 빈 상태, 로딩, 성공, 오류, 권한 없음 상태 확인
- 데이터 생성/수정/삭제의 허용/거부 경계 확인
- 회귀가 발생한 경우 재현 절차, 원인, 수정, 검증 명령을 기록

## 5. 보안과 개인정보

${state.risk_summary || "보안/개인정보 리스크가 아직 정리되지 않았습니다."}

- Vercel 환경변수만 사용하고 클라이언트에 비밀값을 노출하지 않습니다.
- Supabase RLS와 정책을 출시 전 SQL로 재확인합니다.
- 민감 데이터는 최소 수집, 보관 기간, 삭제 경로를 정합니다.
- 서비스 역할 키는 서버 전용으로만 사용하고 일반 사용자 플로우에 쓰지 않습니다.
- 감사 로그가 필요한 관리자/조직 변경은 이벤트를 남깁니다.

## 6. 배포와 롤백

- Vercel Preview에서 핵심 여정을 먼저 확인합니다.
- Production 배포 후 로그인, 저장, 조회, 제작 자료 저장을 스모크 테스트합니다.
- Vercel inspect URL, 배포 로그, Production alias 반영 여부를 완료 증거로 남깁니다.
- 장애 시 직전 배포로 롤백하고 DB 변경은 되돌릴 스크립트를 준비합니다.
- 환경변수 변경 후에는 새 배포가 되었는지 확인합니다.
- 사용자 영향, 롤백 조건, 연락 채널을 릴리스 노트에 남깁니다.

## 7. 현재 실행 상태

- 전략: ${donePhases.has("strategy") ? "완료" : "필요"}
- 리서치: ${donePhases.has("research") ? "완료" : "필요"}
- 제품: ${donePhases.has("product") ? "완료" : "필요"}
- 디자인: ${donePhases.has("design") ? "완료" : "필요"}
- 개발: ${donePhases.has("build") ? "완료" : "필요"}
- QA: ${donePhases.has("qa") ? "완료" : "필요"}
- 보안: ${donePhases.has("security") ? "완료" : "필요"}
- 출시: ${donePhases.has("launch") ? "완료" : "필요"}
`;
}
