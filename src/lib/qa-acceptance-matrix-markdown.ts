import {
  implementationTaskStatusLabels,
  implementationTaskTypeLabels,
} from "@/lib/implementation-task-metadata";
import type { DecisionStatus } from "@/lib/supabase/types";
import type { Experiment, Idea, ImplementationTask, Risk } from "@/lib/venture-data";
import {
  decisionLabels,
  experimentStatusLabels,
  riskSeverityLabels,
  riskStatusLabels,
  stageLabels,
} from "@/lib/workbench-labels";

type QaAcceptanceState = Pick<Idea, "stage" | "decision">;

export type QaGateCheck = {
  label: string;
  passed: boolean;
  detail: string;
};

type QaReleaseDecisionPacket = {
  recommendation: DecisionStatus;
  confidenceLabel: string;
  blockers: string[];
};

type QaBackendCandidate = {
  label: string;
};

export function getRecommendedQaBackend(backendCandidateScores: QaBackendCandidate[]) {
  return backendCandidateScores[0]?.label ?? "Supabase";
}

export function isFirebaseQaBackend(recommendedBackend: string) {
  return /Firebase/i.test(recommendedBackend);
}

export function getHighQaRisks(risks: Risk[]) {
  return risks.filter((risk) => ["high", "critical"].includes(risk.severity));
}

export function getIncompleteQaChecks(checks: QaGateCheck[]) {
  return checks.filter((check) => !check.passed);
}

export function getCompletedQaImplementationTasks(implementationTasks: ImplementationTask[]) {
  return implementationTasks.filter((task) => task.status === "done");
}

export function getOpenQaImplementationTasks(implementationTasks: ImplementationTask[]) {
  return implementationTasks.filter((task) => task.status !== "done");
}

export function buildQaExperimentLines(experiments: Experiment[]) {
  return experiments.length > 0
    ? experiments
        .map(
          (experiment) =>
            `- ${experiment.name}: ${experimentStatusLabels[experiment.status] ?? experiment.status} / ${
              experiment.success_metric || "성공 지표 미정"
            }`,
        )
        .join("\n")
    : "- 연결된 실험이 없습니다. QA 전에 성공 지표가 있는 실험을 최소 1개 정의합니다.";
}

export function buildQaRiskLines(risks: Risk[]) {
  const highRisks = getHighQaRisks(risks);

  return highRisks.length > 0
    ? highRisks
        .map(
          (risk) =>
            `- ${risk.title}: ${riskSeverityLabels[risk.severity]} / ${
              riskStatusLabels[risk.status] ?? risk.status
            } / ${risk.mitigation || "완화책 미정"}`,
        )
        .join("\n")
    : "- 높음/치명 리스크가 없습니다.";
}

export function buildQaTaskCoverageLines(implementationTasks: ImplementationTask[]) {
  return implementationTasks.length > 0
    ? implementationTasks
        .map(
          (task) =>
            `- [${task.status === "done" ? "x" : " "}] ${task.title}: ${
              implementationTaskTypeLabels[task.task_type]
            } / ${implementationTaskStatusLabels[task.status]}`,
        )
        .join("\n")
    : "- 구현 태스크가 없습니다.";
}

export function buildQaBlockerLines(checks: QaGateCheck[], emptyMessage: string) {
  const incompleteChecks = getIncompleteQaChecks(checks);

  return incompleteChecks.length > 0
    ? incompleteChecks.map((check) => `- ${check.label}: ${check.detail}`).join("\n")
    : emptyMessage;
}

export function formatQaReleaseSummary(releaseDecisionPacket: QaReleaseDecisionPacket | null) {
  return releaseDecisionPacket
    ? `${decisionLabels[releaseDecisionPacket.recommendation]} / 신뢰도 ${
        releaseDecisionPacket.confidenceLabel
      } / 차단 ${releaseDecisionPacket.blockers.length}개`
    : "출시 판단 패킷 미생성";
}

export function buildQaBackendRuleRows(recommendedBackend: string) {
  return isFirebaseQaBackend(recommendedBackend)
    ? [
        "| Firebase Rules 허용 | 로그인한 owner가 본인 문서 생성/수정 | 성공, audit/event 기록 |",
        "| Firebase Rules 차단 | 다른 uid 또는 workspace 문서 쓰기 | permission-denied 표시, 데이터 변경 없음 |",
        "| App Check/Emulator | Preview 또는 Emulator에서 rules 시나리오 실행 | 허용/차단 로그 보관 |",
      ].join("\n")
    : [
        "| Supabase RLS 허용 | 로그인한 owner가 본인 record insert/update | 성공, owner_id/workspace_id 보존 |",
        "| Supabase RLS 차단 | 다른 owner/workspace record update/delete | 거부, 데이터 변경 없음 |",
        "| 서비스 키 경계 | 브라우저 번들에서 service role 키 검색 | 노출 없음 |",
      ].join("\n");
}

export function buildQaAcceptanceMatrixMarkdown({
  idea,
  state,
  risks,
  experiments,
  implementationTasks,
  launchReadiness,
  implementationGateChecks,
  releaseDecisionPacket,
  backendCandidateScores,
}: {
  idea: Idea;
  state: QaAcceptanceState;
  risks: Risk[];
  experiments: Experiment[];
  implementationTasks: ImplementationTask[];
  launchReadiness: QaGateCheck[];
  implementationGateChecks: QaGateCheck[];
  releaseDecisionPacket: QaReleaseDecisionPacket | null;
  backendCandidateScores: QaBackendCandidate[];
}) {
  const recommendedBackend = getRecommendedQaBackend(backendCandidateScores);
  const completedTasks = getCompletedQaImplementationTasks(implementationTasks);
  const openTasks = getOpenQaImplementationTasks(implementationTasks);
  const experimentLines = buildQaExperimentLines(experiments);
  const riskLines = buildQaRiskLines(risks);
  const taskCoverageLines = buildQaTaskCoverageLines(implementationTasks);
  const launchBlockerLines = buildQaBlockerLines(launchReadiness, "- 출시 준비도 차단 항목이 없습니다.");
  const implementationBlockerLines = buildQaBlockerLines(
    implementationGateChecks,
    "- 개발 완료 점검 차단 항목이 없습니다.",
  );
  const releaseSummary = formatQaReleaseSummary(releaseDecisionPacket);
  const backendRuleRows = buildQaBackendRuleRows(recommendedBackend);

  return `# 품질 점검표: ${idea.name}

이 문서는 구현 완료 직후 실행할 검수, 디버깅, 보안 확인 순서를 정의합니다. 테스트는 기능이 많아 보이는지보다 첫 사용자가 핵심 가치를 안전하게 통과하는지를 기준으로 합니다.

## 0. 현재 QA 상태

- 제품 가치: ${idea.one_liner || "미정"}
- 대상 사용자: ${idea.target_user || "미정"}
- 구매자: ${idea.buyer || "미정"}
- 현재 단계/판단: ${stageLabels[state.stage]} / ${decisionLabels[state.decision]}
- 추천 백엔드: ${recommendedBackend}
- 출시 판단: ${releaseSummary}
- 구현 태스크 완료: ${completedTasks.length}/${implementationTasks.length}
- 열린 구현 태스크: ${openTasks.length}

## 1. 핵심 여정 검수

| 우선순위 | 시나리오 | 입력/상태 | 기대 결과 |
| --- | --- | --- | --- |
| P0 | 첫 진입 | 로그아웃 또는 새 사용자 | 로그인 필요, 워크스페이스 필요, 첫 행동이 명확히 보임 |
| P0 | 핵심 입력 저장 | 이름, 대상 사용자, 수요 신호, 추가 확인 내용 입력 | 저장 성공, 목록/상세 즉시 갱신, 성공 메시지 표시 |
| P0 | 저장 실패 | 필수값 누락 또는 네트워크 실패 | 필드 아래 오류와 재시도 경로 표시 |
| P0 | 기록 상세 | 방금 저장한 기록 선택 | 점수, 리스크, 제작 자료, 다음 행동이 같은 문맥으로 표시 |
| P0 | 권한 차단 | 읽기 전용 또는 다른 workspace 기록 | 쓰기 버튼 비활성화 또는 서버 차단, 사유 표시 |
| P1 | 제작 자료 저장 | 기획서/첫 제작 범위/제작 실행 계획 초안 저장 | 버전 증가, 보관함 최신본 표시 |
| P1 | 완료 증거 저장 | 구현 태스크에 커밋/스모크/URL 입력 | 점검 점수 갱신, 보고서에 반영 |
| P1 | 모바일 검수 | 390px 폭, 긴 한글 텍스트 | 메뉴와 입력폼 겹침 없음, 버튼 텍스트 잘림 없음 |
| P1 | 빈 상태 | 데이터 없는 사용자 | 다음 행동 CTA와 설명이 보이고 빈 카드만 나열되지 않음 |
| P1 | 오류 상태 | API 오류, 권한 오류 | 사용자가 무엇을 다시 해야 하는지 한 문장으로 보임 |

## 2. 권한/보안 검수

| 항목 | 테스트 | 기대 결과 |
| --- | --- | --- |
${backendRuleRows}
| 환경변수 경계 | NEXT_PUBLIC_ 접두사와 서버 전용 키 분리 확인 | 공개 키만 브라우저 노출, 비밀값은 서버 전용 |
| 민감정보 | 입력/로그/제작 자료에 이메일, 전화, 건강/금융 정보가 남는지 확인 | 필요 최소 수집, 마스킹 또는 저장 금지 |
| 감사/추적 | 승인, 삭제, 권한 변경이 있다면 이벤트 기록 확인 | actor, action, target, timestamp 보관 |

## 3. 디버깅 프로토콜

1. 실패 시 화면 상태, 재현 입력, 사용자 권한, 브라우저 콘솔, 네트워크 응답을 먼저 기록합니다.
2. 서버 오류는 Vercel logs 또는 inspect URL에서 같은 시간대 요청을 확인합니다.
3. 데이터 불일치는 DB/RLS 또는 Firebase Rules 허용/차단 테스트로 좁힙니다.
4. 수정 후 동일 재현 절차를 다시 실행하고 회귀 스모크를 남깁니다.
5. 원인과 수정 범위가 불명확하면 새 기능 추가보다 실패를 재현하는 테스트를 먼저 만듭니다.

## 4. 브라우저/배포 검증 명령

\`\`\`bash
pnpm lint
pnpm typecheck
pnpm build
pnpm smoke:routes
pnpm smoke:browser
pnpm smoke:prod
\`\`\`

## 5. 실험/성공 지표 연결

${experimentLines}

QA 통과만으로 진행 판단을 내리지 않습니다. 위 실험의 성공 지표가 실제 사용자 행동으로 확인되어야 합니다.

## 6. 높은 리스크 확인

${riskLines}

높음/치명 리스크는 종료 또는 수용 판단 없이 출시 판단을 \`진행\`으로 기록하지 않습니다.

## 7. 구현 태스크 커버리지

${taskCoverageLines}

## 8. 남은 차단 항목

### 출시 준비도

${launchBlockerLines}

### 개발 완료 점검

${implementationBlockerLines}

## 9. 완료 보고 템플릿

- QA 실행자:
- 테스트 일시:
- 브라우저/기기:
- 통과:
- 실패:
- 재현 절차:
- 수정 커밋:
- 재검증 명령:
- Production URL:
- Vercel inspect URL:
- 남은 리스크:
- 롤백 기준:
`;
}
