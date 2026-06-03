import { artifactSourceLabels } from "@/lib/artifact-labels";
import { productSurfaceMarkdown, resolveProductSurfaceForIdea } from "@/lib/product-surface";
import type { DecisionStatus } from "@/lib/supabase/types";
import type { Decision, Experiment, Idea, OrchestrationRun, Risk, VentureArtifact } from "@/lib/venture-data";
import {
  decisionLabels,
  experimentStatusLabels,
  phaseLabels,
  riskSeverityLabels,
  riskStatusLabels,
  runStatusLabels,
  stageLabels,
} from "@/lib/workbench-labels";

type ValidationPackageState = Pick<
  Idea,
  "stage" | "decision" | "signal" | "risk_summary" | "next_evidence" | "product_surface"
>;

export function getValidationPackageResearchRuns(runs: OrchestrationRun[]) {
  return runs.filter((run) => ["strategy", "research"].includes(run.phase));
}

export function getHighValidationSprintRisks(risks: Risk[]) {
  return risks.filter((risk) => ["high", "critical"].includes(risk.severity));
}

export function getPrimaryValidationSprintExperiment(experiments: Experiment[]) {
  return experiments[0] ?? null;
}

export function buildIdeaBriefRiskLines(risks: Risk[]) {
  return risks.length > 0
    ? risks
        .map((risk) => `- ${risk.title} (${riskSeverityLabels[risk.severity]}): ${risk.mitigation || "완화 방안 미정"}`)
        .join("\n")
    : "- 아직 연결된 리스크가 없습니다.";
}

export function buildResearchBriefRiskLines(risks: Risk[]) {
  return risks.length > 0
    ? risks
        .map(
          (risk) =>
            `- ${risk.title} (${riskSeverityLabels[risk.severity]}, ${riskStatusLabels[risk.status] ?? risk.status}): ${
              risk.mitigation || "완화 방안 미정"
            }`,
        )
        .join("\n")
    : "- 아직 연결된 리스크가 없습니다. 보안, 개인정보, 규제, 운영 책임 리스크를 먼저 적어보세요.";
}

export function buildResearchBriefExperimentLines(experiments: Experiment[]) {
  return experiments.length > 0
    ? experiments
        .map(
          (experiment) =>
            `- ${experiment.name} (${experimentStatusLabels[experiment.status] ?? experiment.status}): ${
              experiment.success_metric || "성공 지표 미정"
            }`,
        )
        .join("\n")
    : "- 아직 실험이 없습니다. 5명 인터뷰, 랜딩/대기자, 수동 컨시어지, 가격 민감도 테스트 중 하나를 선택하세요.";
}

export function buildResearchBriefRunLines(runs: OrchestrationRun[]) {
  const researchRuns = getValidationPackageResearchRuns(runs);

  return researchRuns.length > 0
    ? researchRuns
        .map((run) => `### ${phaseLabels[run.phase]} (${runStatusLabels[run.status]})\n\n목표: ${run.objective || "미정"}\n\n제작 자료:\n\n${run.output || "미정"}`)
        .join("\n\n")
    : "전략/조사 실행 기록이 아직 없습니다.";
}

export function buildValidationSprintHighRiskLines(risks: Risk[]) {
  const highRiskLines = getHighValidationSprintRisks(risks).map(
    (risk) => `- ${risk.title}: ${risk.mitigation || "완화 방안 미정"}`,
  );

  return highRiskLines.length > 0 ? highRiskLines.join("\n") : "- 현재 높음/치명 리스크가 없습니다. 개인정보, 규제, 운영 책임 리스크를 다시 확인하세요.";
}

export function getValidationSummaryResearchArtifacts(artifacts: VentureArtifact[]) {
  return artifacts.filter((artifact) => artifact.artifact_type === "research_note");
}

export function buildValidationSummaryRiskLines(risks: Risk[]) {
  return risks.length > 0
    ? risks
        .map((risk) => `- ${risk.title}: ${riskSeverityLabels[risk.severity]} / ${riskStatusLabels[risk.status] ?? risk.status}`)
        .join("\n")
    : "- 연결된 리스크가 없습니다.";
}

export function buildValidationSummaryExperimentLines(experiments: Experiment[]) {
  return experiments.length > 0
    ? experiments
        .map(
          (experiment) =>
            `- ${experiment.name}: ${experimentStatusLabels[experiment.status] ?? experiment.status} / ${
              experiment.success_metric || "성공 지표 미정"
            }`,
        )
        .join("\n")
    : "- 연결된 실험이 없습니다.";
}

export function buildValidationSummaryResearchLines(artifacts: VentureArtifact[]) {
  const researchArtifacts = getValidationSummaryResearchArtifacts(artifacts);

  return researchArtifacts.length > 0
    ? researchArtifacts
        .slice(0, 8)
        .map((artifact) => `- ${artifact.title || "제목 없음"} (${artifactSourceLabels[artifact.source] ?? artifact.source})`)
        .join("\n")
    : "- 저장된 리서치 노트가 없습니다.";
}

export function buildValidationSummaryDecisionLines(decisions: Decision[]) {
  return decisions.length > 0
    ? decisions
        .slice(0, 5)
        .map((decision) => `- ${decisionLabels[decision.decision]}: ${decision.reason || "근거 미기록"}`)
        .join("\n")
    : "- 판단 기록이 없습니다.";
}

export function getOpenValidationSummaryHighRisks(risks: Risk[]) {
  return risks.filter((risk) => ["high", "critical"].includes(risk.severity) && risk.status !== "closed");
}

export function getDoneValidationSummaryExperiments(experiments: Experiment[]) {
  return experiments.filter((experiment) => experiment.status === "done");
}

export function buildIdeaBriefMarkdown({
  idea,
  state,
  score,
  recommendation,
  risks,
}: {
  idea: Idea;
  state: ValidationPackageState;
  score: number;
  recommendation: DecisionStatus;
  risks: Risk[];
}) {
  const productSurface = resolveProductSurfaceForIdea(idea, state);
  const riskLines = buildIdeaBriefRiskLines(risks);

  return `# 아이디어 요약: ${idea.name}

## 요약

- 한 줄 설명: ${idea.one_liner || "미정"}
- 대상 사용자: ${idea.target_user || "미정"}
- 구매자: ${idea.buyer || "미정"}
- 단계: ${stageLabels[state.stage]}
- 현재 판단: ${decisionLabels[state.decision]}
- 점수: ${score}
- 추천 판단: ${decisionLabels[recommendation]}

${productSurfaceMarkdown(productSurface)}

## 수요 신호

${state.signal || "미정"}

## 리스크 요약

${state.risk_summary || "미정"}

## 다음에 확인할 증거

${state.next_evidence || "미정"}

## 연결된 리스크

${riskLines}
`;
}

export function buildResearchBriefMarkdown({
  idea,
  state,
  score,
  recommendation,
  risks,
  experiments,
  runs,
}: {
  idea: Idea;
  state: ValidationPackageState;
  score: number;
  recommendation: DecisionStatus;
  risks: Risk[];
  experiments: Experiment[];
  runs: OrchestrationRun[];
}) {
  const productSurface = resolveProductSurfaceForIdea(idea, state);
  const riskLines = buildResearchBriefRiskLines(risks);
  const experimentLines = buildResearchBriefExperimentLines(experiments);
  const researchRunLines = buildResearchBriefRunLines(runs);

  return `# 조사 요약: ${idea.name}

## 1. 검증 목표

- 한 줄 설명: ${idea.one_liner || "미정"}
- 대상 사용자: ${idea.target_user || "미정"}
- 구매자: ${idea.buyer || "미정"}
- 현재 단계: ${stageLabels[state.stage]}
- 현재 판단: ${decisionLabels[state.decision]}
- 점수: ${score}
- 추천 판단: ${decisionLabels[recommendation]}
- 이번 리서치의 핵심 질문: ${state.next_evidence || "사용자가 실제로 반복 문제를 겪고 돈이나 시간을 낼 만큼 중요한가?"}

${productSurfaceMarkdown(productSurface)}

## 2. 가장 위험한 가정

1. ${idea.target_user || "대상 사용자"}가 최근 30일 안에 이 문제를 실제로 겪었다.
2. 현재 대안은 느리거나 비싸거나 불안하거나 책임 추적이 어렵다.
3. ${idea.buyer || "구매자"}가 이 문제를 해결하기 위해 예산, 시간, 내부 승인을 쓸 수 있다.
4. 첫 제작 범위는 완전 자동화 없이도 핵심 가치를 전달할 수 있다.
5. 개인정보, 규제, 보안 리스크를 낮은 비용으로 통제할 수 있다.

## 3. 데스크 리서치 체크리스트

### 시장과 사용자

- 검색 키워드:
  - "${idea.name}"
  - "${idea.one_liner || "핵심 문제"}"
  - "${idea.target_user || "대상 사용자"} workflow"
  - "${idea.buyer || "구매자"} budget"
- 확인할 것:
  - 이 문제가 이미 커뮤니티, 리뷰, Q&A, 채용 공고, 정부/협회 자료에서 반복적으로 드러나는가?
  - 사용자가 현재 어떤 도구, 사람, 엑셀, 카카오톡, 이메일, 전화로 우회하고 있는가?
  - 구매자가 누구인지 사용자와 구매자가 분리되는지 확인한다.

### 경쟁과 대안

| 유형 | 후보 | 사용자가 얻는 가치 | 약점 | 우리 첫 제작 범위가 이길 수 있는 지점 |
| --- | --- | --- | --- | --- |
| 직접 경쟁 | 조사 필요 | 조사 필요 | 조사 필요 | 조사 필요 |
| 간접 대안 | 스프레드시트/메신저/수동 운영 | 낮은 도입 비용 | 반복, 추적, 책임 공백 | 단일 기록과 다음 행동 |
| 전문 서비스 | 대행사/컨설턴트/센터 | 신뢰와 책임 | 비용, 대기, 표준화 한계 | 작은 반복 문제 자동화 |
| 아무것도 안 함 | 현재 방식 유지 | 전환 비용 없음 | 손실이 계속 누적 | 손실을 수치화 |

### 가격과 구매 의향

- 현재 문제의 월간 비용: 시간, 인건비, 오류 비용, 기회비용으로 환산한다.
- 가격 앵커:
  - 개인/소규모: 월 9,900원, 29,000원, 49,000원 중 거부감 확인
  - 업무/조직: 좌석당 월 과금, 작업당 과금, 절감액 기반 과금 비교
- 반드시 물어볼 질문:
  - "이 문제가 해결되면 누가 결제할까요?"
  - "오늘 당장 해결된다면 얼마까지 현실적인가요?"
  - "도입하려면 누구의 허가가 필요한가요?"

### 규제, 보안, 개인정보

- 수집 데이터: 이름, 연락처, 일정, 건강, 금융, 위치, 대화, 사진, 민감한 문서 중 무엇이 포함되는가?
- 보관 기간과 삭제 요청 경로를 먼저 정한다.
- 법률/의료/금융/심리/노무 판단처럼 자격이나 면책이 필요한 영역인지 확인한다.
- 자동화가 사용자를 대신해 외부 계정을 조작하면 약관, 동의, 로그, 취소 경로를 검토한다.

## 4. 인터뷰 스크립트

1. 최근에 이 문제가 발생한 실제 사례를 시간순으로 설명해주세요.
2. 그때 어떤 도구나 사람에게 의존했나요?
3. 가장 오래 걸린 단계와 가장 불안했던 단계는 무엇이었나요?
4. 해결하지 못했을 때 비용이나 손실은 무엇이었나요?
5. 이미 비용을 낸 적이 있다면 얼마였고, 왜 냈나요?
6. 첫 버전에서 없어도 되는 기능은 무엇인가요?
7. 이 결과물을 누가 최종 승인하거나 결제하나요?
8. 이 서비스를 써보지 않을 이유가 있다면 무엇인가요?

## 5. 증거 수집 표

| 증거 | 목표 수량 | 통과 기준 | 현재 상태 | 다음 행동 |
| --- | ---: | --- | --- | --- |
| 문제 인터뷰 | 5명 | 3명 이상이 최근 실제 사례를 말함 | 미수집 | 대상자 리스트 작성 |
| 현재 대안 캡처 | 5건 | 3개 이상 반복 우회 방식 확인 | 미수집 | 스크린샷/메모 수집 |
| 가격 신호 | 5명 | 2명 이상 구체 금액 또는 승인자 언급 | 미수집 | 가격 질문 추가 |
| 경쟁/대안 조사 | 5개 | 직접/간접 대안의 약점 확인 | 미수집 | 대안 표 작성 |
| 리스크 확인 | 3개 | 높음/치명 리스크 완화 조건 작성 | 진행 중 | 리스크 상태 갱신 |

## 6. 연결된 리스크

${riskLines}

## 7. 연결된 실험

${experimentLines}

## 8. 실행 메모

${researchRunLines}

## 9. Go / No-Go 기준

### Go

- 인터뷰 5명 중 3명 이상이 최근 실제 문제를 말한다.
- 구매자 또는 승인자가 명확하다.
- 사용자가 현재 대안의 비용, 불편, 불안을 구체적으로 말한다.
- 높음/치명 리스크에 대한 완화 조건이 문서화된다.
- 7일 안에 수동 또는 반자동 MVP로 검증할 수 있다.

### No-Go 또는 Pivot

- 사용자가 문제를 일반론으로만 말하고 최근 사례를 말하지 못한다.
- 구매자가 없거나 결제/승인 경로가 모호하다.
- 규제/보안 리스크가 첫 제작 범위에서 통제되지 않는다.
- 이미 충분히 싼 대안이 있고 사용자가 전환 이유를 말하지 못한다.
- MVP가 2주 이상 걸려야만 검증 가능하다.

## 10. 다음 리서치 액션

${state.next_evidence || "인터뷰 대상자 5명, 경쟁/대안 5개, 가격 질문 3개를 먼저 채우세요."}
`;
}

export function buildValidationSprintMarkdown({
  idea,
  state,
  score,
  recommendation,
  risks,
  experiments,
}: {
  idea: Idea;
  state: ValidationPackageState;
  score: number;
  recommendation: DecisionStatus;
  risks: Risk[];
  experiments: Experiment[];
}) {
  const productSurface = resolveProductSurfaceForIdea(idea, state);
  const highRiskLines = buildValidationSprintHighRiskLines(risks);
  const primaryExperiment = getPrimaryValidationSprintExperiment(experiments);

  return `# 7일 검증 계획: ${idea.name}

## 목적

- 한 줄 설명: ${idea.one_liner || "미정"}
- 대상 사용자: ${idea.target_user || "미정"}
- 구매자: ${idea.buyer || "미정"}
- 현재 점수: ${score}
- 추천 판단: ${decisionLabels[recommendation]}
- 이번 주에 확인할 핵심 증거: ${state.next_evidence || "문제 빈도, 현재 대안, 지불 의향, 구매/승인 경로"}

${productSurfaceMarkdown(productSurface)}

## 검증 원칙

- 개발 전에 사용자 증거를 먼저 모읍니다.
- 5명 인터뷰, 5개 대안 조사, 3개 가격 질문을 최소 단위로 둡니다.
- 긍정 답변이 아니라 최근 실제 사례와 비용 신호를 증거로 봅니다.
- 민감 데이터는 받지 않고, 예시나 익명화된 흐름만 확인합니다.
- 7일 안에 결론을 못 내면 범위를 줄이거나 아이디어를 전환합니다.

## Day 1: 대상자와 가설 고정

- 인터뷰 대상자 10명을 적습니다.
- 실제 사용자와 구매자/승인자를 분리합니다.
- 다음 가설을 한 문장으로 확정합니다.

\`\`\`text
${idea.target_user || "대상 사용자"}는 ${idea.one_liner || "핵심 문제"} 때문에 최근 30일 안에 반복 비용을 겪었고, ${idea.buyer || "구매자"}는 현재 대안보다 나은 결과에 비용을 낼 수 있다.
\`\`\`

## Day 2-3: 인터뷰 모집 메시지

### 짧은 DM

\`\`\`text
안녕하세요. ${idea.target_user || "대상 사용자"}가 ${idea.one_liner || "겪는 문제"}를 실제로 어떻게 해결하는지 15분 정도 여쭤보고 싶습니다. 제품 판매 목적이 아니라 문제 검증 인터뷰이고, 민감한 정보는 받지 않습니다. 최근 경험이 있으시면 편한 시간 하나만 알려주실 수 있을까요?
\`\`\`

### 업무/조직용 이메일

\`\`\`text
제목: ${idea.name} 문제 검증 인터뷰 요청

안녕하세요.
${idea.target_user || "대상 사용자"}의 ${idea.one_liner || "반복 업무 문제"}를 검증 중입니다.
현재 어떤 방식으로 해결하고 있는지, 비용이나 병목이 있는지 15분 정도 듣고 싶습니다.

질문은 최근 사례, 현재 대안, 비용/승인 경로 중심이며 민감한 개인정보는 수집하지 않습니다.
가능하시면 이번 주 가능한 시간 2개만 회신 부탁드립니다.
\`\`\`

## Day 3-4: 인터뷰 질문

1. 최근 30일 안에 이 문제가 발생한 사례가 있나요?
2. 그때 어떤 도구, 사람, 문서, 메신저를 사용했나요?
3. 가장 오래 걸리거나 실수하기 쉬운 단계는 무엇인가요?
4. 해결 실패 시 비용, 불안, 책임, 시간 손실은 무엇인가요?
5. 지금 해결 방식에 이미 돈을 쓰고 있나요?
6. 오늘 바로 더 나은 방식이 있다면 누가 결제하거나 승인하나요?
7. 첫 버전에서 없어도 되는 기능은 무엇인가요?
8. 이 서비스를 절대 쓰지 않을 이유는 무엇인가요?

## Day 4: 경쟁/대안 캡처

| 대안 | 사용자가 하는 일 | 비용 | 불편/리스크 | 우리 첫 제작 범위가 이길 수 있는 작은 지점 |
| --- | --- | --- | --- | --- |
| 현재 수동 방식 | 조사 필요 | 조사 필요 | 조사 필요 | 조사 필요 |
| 스프레드시트/메신저 | 조사 필요 | 조사 필요 | 조사 필요 | 조사 필요 |
| 기존 앱/서비스 1 | 조사 필요 | 조사 필요 | 조사 필요 | 조사 필요 |
| 기존 앱/서비스 2 | 조사 필요 | 조사 필요 | 조사 필요 | 조사 필요 |
| 전문 대행/센터 | 조사 필요 | 조사 필요 | 조사 필요 | 조사 필요 |

## Day 5: 가격과 도입 검증

- "이 문제가 한 달에 몇 시간 또는 얼마의 비용을 만드나요?"
- "현재 이 문제 해결에 이미 쓰는 돈이 있나요?"
- "월 9,900원 / 29,000원 / 49,000원 중 어디부터 비싸다고 느끼나요?"
- "조직에서 쓰려면 누가 승인하나요?"
- "무료 파일럿 후 계속 쓰려면 어떤 결과가 필요하나요?"

## Day 6: 리스크 점검

높음/치명 리스크:

${highRiskLines}

필수 확인:

- 개인정보/민감정보를 수집하지 않고도 첫 제작 범위가 가능한가?
- 자동화가 외부 계정, 결제, 법률/의료/금융 판단을 대신하지 않는가?
- 문제가 생겼을 때 취소, 삭제, 기록 확인 경로가 있는가?

## Day 7: 판정

### 진행

- 인터뷰 5명 중 3명 이상이 최근 실제 사례를 말함
- 2명 이상이 지불/승인 경로를 구체적으로 설명함
- 현재 대안의 불편이 반복적이고 수치화 가능함
- 리스크 완화 조건이 첫 제작 범위 안에 있음

### 추가 조사

- 문제는 있으나 구매자, 가격, 승인 경로가 흐림
- 리스크는 있으나 완화 가능성이 있음
- 첫 제작 범위를 더 줄이면 7일 안에 검증 가능함

### 중단 또는 전환

- 최근 사례가 부족함
- 이미 충분히 좋은 대안이 있음
- 구매자가 없거나 비용 신호가 없음
- 높음/치명 리스크가 첫 제작 범위에서 통제되지 않음

## 연결된 실험

- 현재 1순위 실험: ${primaryExperiment ? `${primaryExperiment.name} / ${primaryExperiment.success_metric || "성공 지표 미정"}` : "아직 실험이 없습니다."}

## 최종 기록 템플릿

\`\`\`text
인터뷰 수:
최근 실제 사례를 말한 사람:
구매/승인 경로를 말한 사람:
가격 신호:
가장 강한 현재 대안:
가장 큰 리스크:
판정:
다음 행동:
\`\`\`
`;
}

export function buildValidationSummaryMarkdown({
  idea,
  state,
  score,
  recommendation,
  risks,
  experiments,
  artifacts,
  decisions,
}: {
  idea: Idea;
  state: ValidationPackageState;
  score: number;
  recommendation: DecisionStatus;
  risks: Risk[];
  experiments: Experiment[];
  artifacts: VentureArtifact[];
  decisions: Decision[];
}) {
  const productSurface = resolveProductSurfaceForIdea(idea, state);
  const riskLines = buildValidationSummaryRiskLines(risks);
  const experimentLines = buildValidationSummaryExperimentLines(experiments);
  const researchLines = buildValidationSummaryResearchLines(artifacts);
  const decisionLines = buildValidationSummaryDecisionLines(decisions);
  const openHighRisks = getOpenValidationSummaryHighRisks(risks);
  const doneExperiments = getDoneValidationSummaryExperiments(experiments);
  const suggestedGate =
    openHighRisks.length > 0
      ? "추가 조사"
      : doneExperiments.length > 0 && score >= 18
        ? "진행"
        : score >= 14
          ? "추가 조사"
          : "중단 또는 전환";

  return `# 검증 완료 요약: ${idea.name}

## 결론 초안

- 추천 판단: ${suggestedGate}
- 점수 기반 추천: ${decisionLabels[recommendation]}
- 현재 판단: ${decisionLabels[state.decision]}
- 현재 단계: ${stageLabels[state.stage]}
- 벤처 점수: ${score}
- 추가 확인 내용: ${state.next_evidence || "미정"}

## 아이디어

- 한 줄 설명: ${idea.one_liner || "미정"}
- 대상 사용자: ${idea.target_user || "미정"}
- 구매자: ${idea.buyer || "미정"}

${productSurfaceMarkdown(productSurface)}

## 핵심 수요 신호

${state.signal || "미정"}

## 리서치/근거 제작 자료

${researchLines}

## 실험 상태

${experimentLines}

## 리스크 상태

${riskLines}

## 판단 기록

${decisionLines}

## 진행 조건

- 리서치 노트가 1개 이상 저장되어 있다.
- 실험이 완료되었거나, 완료 전이라면 다음 실험이 명확하다.
- 높음/치명 리스크가 닫혔거나 수용 조건이 문서화되었다.
- 구매자 또는 승인자가 명확하다.
- 제품 기획서로 옮겨도 되는 문제 범위가 하나로 좁혀졌다.

## 보류 조건

- 최근 실제 사례가 부족하다.
- 구매자, 가격, 승인 경로가 모호하다.
- 실험은 계획만 있고 결과 학습이 없다.
- 리스크가 열려 있는데 완화 조건이 없다.
- 첫 제작 범위가 아직 2주 이상 걸릴 만큼 넓다.

## 최종 운영자 메모

- 최종 판단:
- 판단 근거:
- 다음 행동:
`;
}
