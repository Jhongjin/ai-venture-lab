import { productSurfaceMarkdown, resolveProductSurfaceForIdea } from "@/lib/product-surface";
import type { DecisionStatus } from "@/lib/supabase/types";
import type { Decision, Experiment, Idea, OrchestrationRun, Risk } from "@/lib/venture-data";
import {
  decisionLabels,
  experimentStatusLabels,
  phaseLabels,
  riskSeverityLabels,
  riskStatusLabels,
  runStatusLabels,
  stageLabels,
} from "@/lib/workbench-labels";

type PrdMarkdownState = Pick<
  Idea,
  "stage" | "decision" | "signal" | "risk_summary" | "next_evidence" | "product_surface"
>;

type PrdGateCheck = {
  label: string;
  passed: boolean;
  detail: string;
};

type ValidationEvidenceCoachSummary = {
  score: number;
  label: string;
  nextFocus: {
    action: string;
  } | null;
};

export function getHighPrdRisks(risks: Risk[]) {
  return risks.filter((risk) => ["high", "critical"].includes(risk.severity));
}

export function buildPrdHandoffMarkdown({
  idea,
  state,
  score,
  recommendation,
  prdReadinessScore,
  prdReadinessChecks,
  validationEvidenceCoach,
  risks,
  experiments,
  decisions,
  nextPrdBlocker,
}: {
  idea: Idea;
  state: PrdMarkdownState;
  score: number;
  recommendation: DecisionStatus;
  prdReadinessScore: number;
  prdReadinessChecks: PrdGateCheck[];
  validationEvidenceCoach: ValidationEvidenceCoachSummary | null;
  risks: Risk[];
  experiments: Experiment[];
  decisions: Decision[];
  nextPrdBlocker: PrdGateCheck | null;
}) {
  const productSurface = resolveProductSurfaceForIdea(idea, state);
  const readinessLines = prdReadinessChecks
    .map((check) => `- [${check.passed ? "x" : " "}] ${check.label}: ${check.detail}`)
    .join("\n");
  const highRiskLines = getHighPrdRisks(risks).map(
    (risk) => `- ${risk.title}: ${riskSeverityLabels[risk.severity]} / ${riskStatusLabels[risk.status] ?? risk.status}`,
  );
  const experimentLines =
    experiments.length > 0
      ? experiments
          .map(
            (experiment) =>
              `- ${experiment.name}: ${experimentStatusLabels[experiment.status] ?? experiment.status} / ${
                experiment.success_metric || "성공 지표 미정"
              }`,
          )
          .join("\n")
      : "- 연결된 실험이 없습니다.";
  const decisionLines =
    decisions.length > 0
      ? decisions.map((decision) => `- ${decisionLabels[decision.decision]}: ${decision.reason || "근거 미기록"}`).join("\n")
      : "- 판단 기록이 없습니다.";
  const handoffDecision =
    prdReadinessScore >= 100
      ? "제품 기획서 작성 가능"
      : prdReadinessScore >= 70
        ? "조건부 제품 기획서 작성"
        : "검증 보완 후 제품 기획서";

  return `# 제품 기획서 전환 요약: ${idea.name}

## 전환 판단

- 핸드오프 판단: ${handoffDecision}
- 제품 기획서 준비도: ${prdReadinessScore}%
- 검증 증거 점수: ${validationEvidenceCoach ? `${validationEvidenceCoach.score}% / ${validationEvidenceCoach.label}` : "미계산"}
- 점수 기반 추천: ${decisionLabels[recommendation]}
- 현재 운영 판단: ${decisionLabels[state.decision]}
- 벤처 점수: ${score}
- 다음 차단 항목: ${nextPrdBlocker ? `${nextPrdBlocker.label} - ${nextPrdBlocker.detail}` : "없음"}

## 제품 기획서에 고정할 문제 범위

- 아이디어: ${idea.name}
- 한 줄 설명: ${idea.one_liner || "미정"}
- 대상 사용자: ${idea.target_user || "미정"}
- 구매자/승인자: ${idea.buyer || "미정"}
- 핵심 수요 신호: ${state.signal || "미정"}
- 추가 확인 내용/검증 초점: ${state.next_evidence || validationEvidenceCoach?.nextFocus?.action || "미정"}

${productSurfaceMarkdown(productSurface)}

## 준비도 체크

${readinessLines || "- 준비도 체크가 없습니다."}

## 실험과 판단 근거

${experimentLines}

${decisionLines}

## 높은 리스크

${highRiskLines.length > 0 ? highRiskLines.join("\n") : "- 높음/치명 리스크가 없습니다."}

## 제품 기획서 작성 지시

1. 검증된 문제, 사용자, 구매자만 제품 기획서 범위에 포함합니다.
2. 첫 제작 범위는 1개 핵심 여정과 1개 성공 지표로 제한합니다.
3. 제외 범위와 중단 기준을 제품 기획서에 명시합니다.
4. 열려 있는 높은 리스크는 수용 조건 또는 차단 조건으로 분리합니다.
5. 디자인/개발 단계로 넘기기 전에 제품 기획서와 첫 제작 범위를 각각 승인 상태로 바꿉니다.

## 제품 제작 자료로 넘길 결정

- 포함 범위:
- 제외 범위:
- 1차 성공 지표:
- No-go 기준:
- 승인자:
`;
}

export function buildPrdMarkdown({
  idea,
  state,
  score,
  recommendation,
  risks,
  experiments,
  runs,
}: {
  idea: Idea;
  state: PrdMarkdownState;
  score: number;
  recommendation: DecisionStatus;
  risks: Risk[];
  experiments: Experiment[];
  runs: OrchestrationRun[];
}) {
  const productSurface = resolveProductSurfaceForIdea(idea, state);
  const riskLines =
    risks.length > 0
      ? risks
          .map(
            (risk) =>
              `- ${risk.title} (${riskSeverityLabels[risk.severity]}, ${riskStatusLabels[risk.status] ?? risk.status}): ${
                risk.mitigation || "미정"
              }`,
          )
          .join("\n")
      : "- 아직 연결된 리스크가 없습니다.";
  const experimentLines =
    experiments.length > 0
      ? experiments
          .map(
            (experiment) =>
              `- ${experiment.name} (${experimentStatusLabels[experiment.status] ?? experiment.status}): ${
                experiment.success_metric || "성공 지표 미정"
              }`,
          )
          .join("\n")
      : "- 아직 계획된 실험이 없습니다.";
  const runLines =
    runs.length > 0
      ? runs
          .map(
            (run) =>
              `### ${phaseLabels[run.phase]} (${runStatusLabels[run.status]})\n\n담당 역할: ${
                run.owner_role || "미정"
              }\n\n목표: ${run.objective || "미정"}\n\n제작 자료:\n\n${run.output || "미정"}`,
          )
          .join("\n\n")
      : "아직 실행 기록이 없습니다.";

  return `# 제품 기획서: ${idea.name}

## 목표

${idea.one_liner || "미정"}

${productSurfaceMarkdown(productSurface)}

## 사용자, 구매자, 상황

- 대상 사용자: ${idea.target_user || "미정"}
- 구매자: ${idea.buyer || "미정"}
- 발생 계기: 사용자가 이 문제를 겪는 순간과 장소를 인터뷰로 확인합니다.
- 현재 대안/우회 방법: ${state.signal || "미정"}
- 문제 비용: 시간, 돈, 실수, 불안, 책임, 기회비용 중 무엇이 큰지 확인합니다.

## 문제 정의

${state.signal || "미정"}

## 증거와 가정

### 알고 있는 것

- 수요 신호: ${state.signal || "미정"}
- 리스크 요약: ${state.risk_summary || "미정"}

### 아직 가정인 것

- ${idea.target_user || "대상 사용자"}가 이 문제를 반복적으로 겪습니다.
- ${idea.buyer || "구매자"}가 현재 대안보다 나은 결과에 지불 의향을 보입니다.
- 수동 또는 반자동 검증으로도 핵심 가치를 확인할 수 있습니다.

### 다음에 증명할 것

${state.next_evidence || "미정"}

## 현재 판단 상태

- 단계: ${stageLabels[state.stage]}
- 현재 판단: ${decisionLabels[state.decision]}
- 벤처 점수: ${score}
- 추천 판단: ${decisionLabels[recommendation]}

## 목표와 성공 지표

- 사용자 결과: 사용자가 핵심 문제를 더 빠르고 안전하게 해결합니다.
- 사업 결과: 구매자가 반복적으로 비용을 낼 이유를 확인합니다.
- 첫 성공 지표: ${experiments[0]?.success_metric || "측정 가능한 실험 성공 지표를 먼저 정의합니다."}

## 범위와 No-gos

- 증거 공백이 해결되기 전에는 검증 가능한 최소 제작 범위를 넘기지 않습니다.
- 데이터 처리 방침 없이 민감한 개인정보를 수집하지 않습니다.
- 여러 사용자군, 여러 결제 모델, 전체 플랫폼 자동화는 첫 제작 범위에서 제외합니다.
- 앱이 아니라 콘텐츠, 수동 운영, 스프레드시트, API, 파트너십으로 더 빠르게 검증할 수 있으면 먼저 비교합니다.

## 중단 기준

- ${idea.target_user || "대상 사용자"} 5명 중 3명 이상이 최근 실제 사례를 말하지 못하면 중단 또는 전환합니다.
- 실험 참여자 5명 중 2명 이상이 비용, 재사용, 도입 의향을 보이지 않으면 범위를 재검토합니다.
- 높음/매우 높은 리스크가 완화되지 않으면 개발 진입을 보류합니다.

## 요구사항

### 기능 요구사항

- 핵심 사용자 문제와 예상 워크플로우를 기록합니다.
- 추가 확인 내용을 검증하는 데 필요한 최소 프로토타입을 지원합니다.
- 리스크, 실험, 판단 기록을 아이디어에 연결합니다.
- 사용자가 작업 결과를 저장하거나 다음 행동으로 옮길 수 있어야 합니다.

### 비기능 요구사항

- 첫 버전은 14일 안에 테스트할 수 있을 만큼 작게 유지합니다.
- 인증, 워크스페이스, RLS, 감사 로그, 롤백 경로를 유지합니다.
- 빈 상태, 로딩, 성공, 오류, 권한 없음, 읽기 전용 상태를 구현합니다.

## 사용자 이야기와 수용 기준

1. ${idea.target_user || "사용자"}로서, 나는 ${idea.one_liner || "핵심 문제 해결"}을 하고 싶다. 그래야 ${state.next_evidence || "검증할 결과"}를 얻을 수 있다.
   - Given 인증된 사용자가 아이디어를 선택했을 때
   - When 핵심 입력을 저장하면
   - Then 화면이 즉시 갱신되고 저장 결과가 DB에 남는다.

2. 운영자로서, 나는 리스크와 실험을 같은 아이디어에 연결하고 싶다. 그래야 출시 판단을 근거 있게 기록할 수 있다.
   - Given 아이디어에 연결된 리스크 또는 실험이 있을 때
   - When 점수와 판단을 저장하면
   - Then 출시 준비도와 제작 자료 점검 상태가 최신 상태를 반영한다.

### 데이터

- 아이디어 기록
- 리스크
- 실험
- 판단 기록
- 실행 단계 기록
- 제작 자료와 승인 상태
- 핵심 이벤트: 생성, 판단 저장, 리스크 추가, 실험 상태 변경, 제작 자료 승인

### 보안과 개인정보

${state.risk_summary || "미정"}

## UX 메모

개발 전에 디자인 제작 자료를 기준으로 화면과 상태를 확정합니다.

- 첫 화면: 사용자가 다음에 할 작업을 바로 이해해야 합니다.
- 기본 흐름: ${productSurface.iaHint}
- 상태: 빈 상태, 로딩, 성공, 오류, 권한 없음, 읽기 전용, 모바일 단일 컬럼
- 접근성: 충분한 대비, 명확한 라벨, 키보드 이동, 오류 메시지와 해결 행동
- 신뢰: 민감 데이터 입력 전에 목적, 보관, 삭제 경로를 보여줍니다.

## AI/자동화 주의사항

- AI가 추천한 판단은 최종 결정이 아니라 근거 초안입니다.
- 불확실한 추천에는 신뢰도, 필요한 추가 증거, 사람의 승인 경로를 함께 보여줍니다.
- 사용자가 생성 결과를 수정, 재시도, 폐기할 수 있어야 합니다.

## 지표

- 활성화: 사용자가 핵심 워크플로우 결과에 도달합니다.
- 검증: 실험 성공 지표를 충족합니다.
- 리스크: 해결되지 않은 높음/매우 높은 리스크가 계속 보입니다.
- 품질: 저장 후 새로고침 없이 화면에 반영됩니다.

## 검증 계획

${experimentLines}

## 실행 메모

${runLines}

## 출시 리스크

${riskLines}

## 릴리스 기준

- 증거 공백이 해결되었거나 명시적으로 수용되었습니다.
- 높음/매우 높은 리스크가 완화되었거나 막힌 상태입니다.
- QA와 보안 실행이 완료되었습니다.
- 최종 판단이 기록되었습니다.
- Preview와 Production에서 로그인, 저장, 조회, 제작 자료 저장이 스모크 테스트되었습니다.
- 장애 시 직전 배포와 DB 롤백 또는 보정 경로가 있습니다.

## 열린 질문

${state.next_evidence || "미정"}
`;
}
