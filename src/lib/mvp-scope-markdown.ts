import { artifactLabels } from "@/lib/artifact-labels";
import { productSurfaceMarkdown, resolveProductSurfaceForIdea } from "@/lib/product-surface";
import type { Experiment, Idea, OrchestrationRun, Risk, VentureArtifact } from "@/lib/venture-data";
import { experimentStatusLabels, riskSeverityLabels, riskStatusLabels } from "@/lib/workbench-labels";

type MvpScopeState = Pick<Idea, "signal" | "risk_summary" | "next_evidence" | "product_surface">;

export function getMvpScopeRunByPhase(runs: OrchestrationRun[], phase: OrchestrationRun["phase"]) {
  return runs.find((run) => run.phase === phase) ?? null;
}

export function getHighMvpScopeRisks(risks: Risk[]) {
  return risks.filter((risk) => ["high", "critical"].includes(risk.severity));
}

export function getApprovedMvpScopeArtifacts(artifacts: VentureArtifact[]) {
  return artifacts.filter((artifact) => artifact.status === "approved");
}

export function getFirstMetricMvpScopeExperiment(experiments: Experiment[]) {
  return experiments.find((experiment) => experiment.success_metric.trim()) ?? experiments[0] ?? null;
}

export function buildMvpSpecMarkdown({
  idea,
  state,
  experiments,
  runs,
}: {
  idea: Idea;
  state: MvpScopeState;
  experiments: Experiment[];
  runs: OrchestrationRun[];
}) {
  const productSurface = resolveProductSurfaceForIdea(idea, state);
  const buildRun = getMvpScopeRunByPhase(runs, "build");
  const designRun = getMvpScopeRunByPhase(runs, "design");
  const qaRun = getMvpScopeRunByPhase(runs, "qa");
  const securityRun = getMvpScopeRunByPhase(runs, "security");
  const experimentLines =
    experiments.length > 0
      ? experiments
          .map((experiment) => `- ${experiment.name}: ${experiment.success_metric || "성공 지표 미정"}`)
          .join("\n")
      : "- 개발 전에 측정 가능한 실험을 하나 정의합니다.";

  return `# 첫 제작 범위: ${idea.name}

## 가설

${idea.target_user || "대상 사용자"}를 위한 가장 작은 워크플로우를 만들면 ${
    state.next_evidence || "추가 확인 내용"
  }을 확인할 수 있습니다.

${productSurfaceMarkdown(productSurface)}

## Appetite

- 기본 개발 예산: 1명 기준 3~7일 안에 사용 가능한 수직 슬라이스
- 범위 조정 원칙: 일정은 고정하고 기능 범위를 줄입니다.

## 사용자와 구매자

- 사용자: ${idea.target_user || "미정"}
- 구매자: ${idea.buyer || "미정"}

## 가장 위험한 가정

- 사용자가 실제로 이 문제를 반복 경험합니다.
- 구매자가 기존 대안보다 나은 결과에 비용을 냅니다.
- 핵심 가치가 완전 자동화 없이도 전달됩니다.

## 반드시 포함

- ${idea.one_liner || "미정"}에 연결된 하나의 집중된 사용자 여정
- 가설 검증에 필요한 필드만 수집
- 선택한 아이디어의 리스크와 실험 추적
- 인증된 워크스페이스 접근
- 저장 직후 화면 즉시 갱신
- 측정 가능한 성공/실패 기록

## 있으면 좋은 것

- 명확한 빈 상태와 오류 상태
- 복사 또는 저장 가능한 제작 자료
- Supabase 기록 기반의 기본 감사 추적

## 아직 하지 않을 것

- 여러 제품을 아우르는 넓은 탐색 구조
- 외부 계정을 직접 조작하는 고급 자동화
- 보안 검토 없는 민감한 운영 데이터 수집
- 여러 페르소나와 복잡한 권한 체계
- 실험 전 결제/구독 자동화

## 화면

${designRun?.output || "디자인 제작 자료를 기준으로 화면을 정의합니다."}

## 필수 화면 상태

- 빈 상태: 아직 기록이 없을 때 다음 입력을 유도합니다.
- 로딩: 저장/조회 중 현재 상태를 보여줍니다.
- 성공: 저장 결과와 다음 행동을 보여줍니다.
- 오류: 실패 이유와 재시도 또는 수정 행동을 보여줍니다.
- 권한 없음/읽기 전용: 왜 편집할 수 없는지 알려줍니다.

## 데이터 모델

- ideas
- risks
- decisions
- experiments
- orchestration_runs
- venture_artifacts

## 연동

- Supabase Auth and Postgres
- Vercel 배포
- 수동 운영 방식이 안정화된 뒤 AI/model 호출 추가

## 수동 또는 컨시어지 경로

- 앱이 완성되기 전에는 운영자가 같은 결과물을 수동으로 만들어 사용자 반응을 확인합니다.
- 자동화는 사용자가 반복적으로 요구한 단계부터 붙입니다.

## 프로토타입 메모

${buildRun?.output || "개발 제작 자료를 기준으로 구현 범위를 정의합니다."}

## 검증 계획

${experimentLines}

QA 메모:

${qaRun?.output || "QA 실행 제작 자료 미정"}

보안 메모:

${securityRun?.output || state.risk_summary || "보안 실행 제작 자료 미정"}

## 중단 기준

- 실험 성공 지표가 충족되지 않고 사용자가 다음 테스트를 요청하지 않습니다.
- 리스크 완화 없이 민감 데이터 처리가 필요합니다.
- 첫 수직 슬라이스가 appetite를 초과합니다.

## 출시 점검

- 제품 기획서 제작 자료가 저장됨
- 첫 제작 범위 문서가 저장됨
- 최소 하나의 실험이 계획됨
- QA와 보안 실행이 완료되었거나 열린 리스크로 명시 수용됨
`;
}

export function buildMvpSlicePlanMarkdown({
  idea,
  state,
  experiments,
  risks,
  artifacts,
}: {
  idea: Idea;
  state: MvpScopeState;
  experiments: Experiment[];
  risks: Risk[];
  artifacts: VentureArtifact[];
}) {
  const productSurface = resolveProductSurfaceForIdea(idea, state);
  const experimentLines =
    experiments.length > 0
      ? experiments
          .slice(0, 5)
          .map(
            (experiment) =>
              `- ${experiment.name} (${experimentStatusLabels[experiment.status] ?? experiment.status}): ${
                experiment.success_metric || "성공 지표 미정"
              }`,
          )
          .join("\n")
      : "- 아직 연결된 실험이 없습니다. 먼저 인터뷰, 랜딩, 수동 운영 테스트 중 하나를 만듭니다.";
  const highRiskLines = getHighMvpScopeRisks(risks).map(
    (risk) =>
      `- ${risk.title} (${riskSeverityLabels[risk.severity]}, ${riskStatusLabels[risk.status] ?? risk.status}): ${
        risk.mitigation || "완화 조건 미정"
      }`,
  );
  const approvedArtifactLines = getApprovedMvpScopeArtifacts(artifacts)
    .slice(0, 6)
    .map((artifact) => `- ${artifactLabels[artifact.artifact_type]}: ${artifact.title}`);
  const firstExperiment = getFirstMetricMvpScopeExperiment(experiments);
  const primaryMetric = firstExperiment?.success_metric || state.next_evidence || "사용자가 핵심 여정을 완료하고 다음 테스트 또는 구매 의향을 남깁니다.";

  return `# 첫 제작 범위 플랜: ${idea.name}

## 제품 전환 원칙

- 목표: ${idea.one_liner || "미정"}
- 대상 사용자: ${idea.target_user || "미정"}
- 구매자/승인자: ${idea.buyer || "미정"}
- 첫 성공 지표: ${primaryMetric}
- 범위 원칙: 자동화를 전제로 하되, 첫 버전은 검증 속도에 맞춰 기능을 줄입니다.
- 개발 진입 조건: 문제, 구매자, 수요 신호, 추가 확인 내용이 한 문장으로 연결되어야 합니다.
- 제작 형태: ${productSurface.label}
- 제작 기준: ${productSurface.harnessFocus}

## 현재 검증 재료

- 수요 신호: ${state.signal || "미정"}
- 리스크 요약: ${state.risk_summary || "미정"}
- 추가 확인 내용: ${state.next_evidence || "미정"}

### 연결된 실험

${experimentLines}

### 승인된 제작 자료

${approvedArtifactLines.length > 0 ? approvedArtifactLines.join("\n") : "- 승인된 제품 제작 자료가 없습니다. 제품 기획서, 디자인 기준, 기술 명세 중 최소 하나를 승인하세요."}

### 높은 리스크

${highRiskLines.length > 0 ? highRiskLines.join("\n") : "- 높음/치명 리스크가 없습니다."}

## 0단계. 수동 검증

목적: 앱을 만들기 전에 사람이 같은 결과를 직접 제공해 사용자의 실제 행동을 확인합니다.

포함:

- 인터뷰, 수동 리포트, 스프레드시트, 노션/폼, 카카오톡/이메일 운영
- 사용자가 원하는 입력과 결과물 샘플 수집
- 구매자에게 가격, 예산, 승인 경로 질문

수용 기준:

- ${idea.target_user || "대상 사용자"} 5명 이상에게 최근 실제 사례를 확인합니다.
- 3명 이상이 현재 대안보다 낫다고 평가합니다.
- 2명 이상이 지불, 재사용, 도입, 소개 중 하나의 행동 의향을 보입니다.

No-go:

- 실제 사례 없이 "있으면 좋겠다"만 반복됩니다.
- 구매자 또는 승인자가 불명확합니다.
- 민감정보 처리 없이는 결과를 줄 수 없습니다.

## 1단계. 가장 작은 제품 범위

목적: 수동 검증에서 반복된 한 가지 여정만 제품화합니다.

포함:

- 인증된 사용자와 워크스페이스 경계
- 핵심 입력 1개, 저장, 조회, 편집, 상태 메시지
- 결과물 복사 또는 저장
- 최소 감사 흔적과 권한 차단

제외:

- 다중 페르소나별 복잡한 권한
- 결제, 추천 알고리즘, 외부 계정 직접 조작
- 전체 운영 자동화와 관리자 백오피스

수용 기준:

- 사용자가 3분 안에 핵심 입력을 저장하고 결과를 확인합니다.
- 저장 직후 새로고침 없이 목록과 상세가 갱신됩니다.
- 빈 상태, 로딩, 성공, 오류, 읽기 전용 상태가 있습니다.

## 2단계. AI/자동화 확장

목적: 반복된 수동 단계를 AI 보조 기능으로 바꿉니다.

포함:

- 입력 내용을 요약, 분류, 초안 생성, 다음 질문 추천
- 생성 결과의 신뢰도, 근거, 수정/폐기 버튼
- 사람 승인 후 저장되는 human-in-the-loop 흐름

제외:

- 사용자의 돈, 계정, 개인정보를 자동으로 조작하는 실행
- 법률, 의료, 금융 판단을 최종 결론처럼 제시하는 기능
- 근거 없는 자동 승인

수용 기준:

- AI 결과가 사용자 시간을 줄인다는 정성 피드백을 받습니다.
- 결과가 DB에 저장되기 전 사용자가 검토하거나 수정할 수 있습니다.
- 민감정보는 최소 수집하고 AI 입력문과 로그 보관 범위를 명시합니다.

## 3단계. 출시 전 점검

목적: 작은 제품을 안전하게 배포하고 되돌릴 수 있게 만듭니다.

포함:

- 품질 점검 스모크: 로그인, 저장, 조회, 편집, 제작 자료 저장
- 보안 스모크: RLS 또는 Security Rules 허용/차단 검증
- Vercel Production 배포 로그, 환경변수 경계, 롤백 기준
- 높은 리스크의 종료 또는 명시적 수용 기록

수용 기준:

- pnpm quality:full과 프로덕션 스모크가 통과합니다.
- 배포 URL, 커밋, 검증 명령, 남은 리스크가 개발 완료 보고서에 남습니다.
- 장애 시 직전 정상 배포로 되돌릴 기준이 있습니다.

## 우선순위 결정

1. 수동 검증이 실패하면 개발하지 않습니다.
2. 첫 제작 범위는 사용자가 반복 요구한 한 가지 여정만 만듭니다.
3. AI/자동화 확장은 첫 제작 범위에서 반복 사용이 확인된 뒤 붙입니다.
4. 출시 전 점검은 베타 사용자에게 열기 전 반드시 완료합니다.

## 다음 개발 태스크 후보

- 제품 기획서/첫 제작 범위 잠금: 포함, 제외, No-go, 성공 지표 승인
- 핵심 화면 설계: 첫 입력, 결과, 빈 상태, 오류, 읽기 전용
- 데이터와 권한: 사용자/워크스페이스 경계, 저장/조회/차단 검증
- 첫 수직 슬라이스 구현: ${idea.one_liner || "핵심 사용자 여정"}
- QA/보안/배포 증거 기록
`;
}
