import type { DecisionStatus } from "@/lib/supabase/types";
import type { Experiment, Idea, ImplementationTask, Risk } from "@/lib/venture-data";
import {
  decisionLabels,
  experimentStatusLabels,
  riskSeverityLabels,
  riskStatusLabels,
  stageLabels,
} from "@/lib/workbench-labels";

type PostLaunchLearningState = Pick<Idea, "stage" | "decision" | "next_evidence">;

type PostLaunchGateCheck = {
  label: string;
  passed: boolean;
  detail: string;
};

type PostLaunchReleaseDecisionPacket = {
  recommendation: DecisionStatus;
  blockers: string[];
};

export function buildPostLaunchLearningLoopMarkdown({
  idea,
  state,
  experiments,
  risks,
  releaseDecisionPacket,
  launchReadiness,
  implementationTasks,
}: {
  idea: Idea;
  state: PostLaunchLearningState;
  experiments: Experiment[];
  risks: Risk[];
  releaseDecisionPacket: PostLaunchReleaseDecisionPacket | null;
  launchReadiness: PostLaunchGateCheck[];
  implementationTasks: ImplementationTask[];
}) {
  const releaseRecommendation = releaseDecisionPacket ? decisionLabels[releaseDecisionPacket.recommendation] : "미계산";
  const openHighRisks = risks.filter(
    (risk) => ["high", "critical"].includes(risk.severity) && risk.status !== "closed",
  );
  const doneTaskCount = implementationTasks.filter((task) => task.status === "done").length;
  const unresolvedLaunchChecks = launchReadiness.filter((check) => !check.passed);
  const experimentLines =
    experiments.length > 0
      ? experiments
          .map(
            (experiment) =>
              `- ${experiment.name}: ${experimentStatusLabels[experiment.status] ?? experiment.status} / 성공 지표: ${
                experiment.success_metric || "미정"
              }`,
          )
          .join("\n")
      : "- 출시 후 학습에 연결할 실험이 없습니다. 첫 사용자 5명 관찰 실험을 추가하세요.";
  const riskLines =
    openHighRisks.length > 0
      ? openHighRisks
          .map(
            (risk) =>
              `- ${risk.title}: ${riskSeverityLabels[risk.severity]} / ${
                riskStatusLabels[risk.status] ?? risk.status
              } / ${risk.mitigation || "완화책 미정"}`,
          )
          .join("\n")
      : "- 열린 높음/치명 리스크가 없습니다.";
  const blockerLines = releaseDecisionPacket?.blockers.length
    ? releaseDecisionPacket.blockers.map((blocker) => `- ${blocker}`).join("\n")
    : unresolvedLaunchChecks.length > 0
      ? unresolvedLaunchChecks.map((check) => `- ${check.label}: ${check.detail}`).join("\n")
      : "- 출시 후 관찰 가능한 상태입니다.";

  return `# 출시 후 학습 루프: ${idea.name}

출시의 목적은 끝내는 것이 아니라 더 정확한 다음 판단을 얻는 것입니다. 이 문서는 첫 공개 후 7일, 14일, 30일에 어떤 신호를 보고 진행, 보완, 전환, 중단을 결정할지 정의합니다.

## 0. 현재 출시 기준

- 제품 가치: ${idea.one_liner || "미정"}
- 대상 사용자: ${idea.target_user || "미정"}
- 구매자: ${idea.buyer || "미정"}
- 현재 단계/판단: ${stageLabels[state.stage]} / ${decisionLabels[state.decision]}
- 출시 판단 권고: ${releaseRecommendation}
- 구현 태스크 완료: ${doneTaskCount}/${implementationTasks.length}
- 추가 확인 내용: ${state.next_evidence || "미정"}

## 1. 출시 후 핵심 질문

1. 대상 사용자가 첫 세션에서 핵심 행동을 완료하는가?
2. 이 문제가 실제로 반복되는가, 아니면 일회성 관심인가?
3. 구매자와 사용자가 같은 성공 기준을 말하는가?
4. 수동 운영보다 앱이 시간을 줄이거나 실수를 줄이는가?
5. 높은 리스크를 낮추면서도 가치 전달이 유지되는가?

## 2. 7일 학습 지표

| 지표 | 수집 방법 | 진행 신호 | 보류/전환 신호 |
| --- | --- | --- | --- |
| 활성 사용자 | 가입 또는 초대 후 핵심 화면 방문 | 타겟 5명 이상 방문 | 방문은 있으나 핵심 행동 없음 |
| 핵심 행동 완료 | 첫 기록 저장, 제작 자료 저장, 예약/요청 등 앱별 핵심 행동 | 방문자의 40% 이상 완료 | 입력 중 이탈 또는 저장 실패 반복 |
| 반복 사용 | 7일 내 2회 이상 재방문 | 2명 이상 반복 사용 | 첫 방문 후 재방문 없음 |
| 구매 신호 | 가격 질문, 결제 의향, 조직 도입 문의 | 1명 이상 명확한 예산 또는 도입 일정 | 좋다는 반응만 있고 예산 없음 |
| 운영 리스크 | 권한 오류, 개인정보 불안, 수동 지원 요청 | 차단 없이 처리 가능 | 같은 리스크가 2회 이상 반복 |

## 3. 이벤트/로그 초안

| 이벤트 | 속성 | 개인정보 주의 |
| --- | --- | --- |
| app_opened | user_id_hash, workspace_id, source | 원본 이메일 저장 금지 |
| record_created | record_type, stage, has_required_fields | 본문 원문 저장 금지 |
| evidence_added | evidence_type, confidence | 민감 원문 마스킹 |
| artifact_saved | artifact_type, version, source | 제작 자료 본문 로그 제외 |
| gate_blocked | gate_name, blocker_type | 사용자 식별 최소화 |
| decision_recorded | decision, reason_length | reason 원문 로그 제외 |

## 4. 사용자 인터뷰 질문

- 이 앱을 열기 직전 어떤 상황이었나요?
- 지금까지 이 문제를 어떻게 해결했나요?
- 첫 화면에서 무엇을 먼저 해야 하는지 바로 보였나요?
- 저장 또는 결과 확인 과정에서 멈춘 지점은 어디였나요?
- 월 얼마라면 직접 결제하거나 조직에 요청할 수 있나요?
- 이 기능이 없어도 계속 쓸 이유가 있나요?

## 5. 현재 실험 연결

${experimentLines}

## 6. 출시 전/후 차단 항목

${blockerLines}

## 7. 높은 리스크 모니터링

${riskLines}

## 8. 7/14/30일 판단 기준

### Day 7

- 진행: 핵심 행동 40% 이상, 반복 사용자 2명 이상, 매우 높은 리스크 없음
- 보완: 관심은 있으나 핵심 행동 완료율이 낮음
- 전환: 타겟은 반응하지만 구매자/문제/화면 흐름이 다름
- 중단: 핵심 행동, 반복 사용, 구매 신호가 모두 없음

### Day 14

- 진행: 유료 의향 또는 조직 도입 논의 1건 이상
- 보완: 기능 누락보다 온보딩/설명/권한 문제로 막힘
- 전환: 다른 세그먼트에서 더 강한 수요가 확인됨
- 중단: 수동 운영 대비 개선이 입증되지 않음

### Day 30

- 진행: 반복 사용과 지불 의향이 함께 확인됨
- 보완: 데이터 품질, 권한, UX 마찰이 주요 병목
- 전환: 더 좁은 업무/고객군으로 제품 경계를 다시 정의
- 중단: 운영 비용이 학습 가치보다 커짐

## 9. 다음 루프 운영 방식

1. 매주 같은 요일에 지표, 인터뷰, 리스크, 지원 요청을 한 화면에 모읍니다.
2. 새 기능 요구는 바로 만들지 않고, 같은 요구가 3회 이상 반복될 때 태스크로 전환합니다.
3. 개인정보/권한/결제/의료/법률 리스크는 기능 요구보다 먼저 처리합니다.
4. 판단 기록에는 숫자, 관찰, 사용자의 실제 문장을 분리해서 남깁니다.
5. 다음 빌드 명령 패킷은 Day 7 또는 Day 14 판단 뒤 다시 생성합니다.
`;
}
