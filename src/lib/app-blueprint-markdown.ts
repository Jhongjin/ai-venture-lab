import { buildSurfaceBlueprintStructure } from "@/lib/product-surface-implementation";
import { resolveProductSurfaceForIdea } from "@/lib/product-surface";
import {
  implementationTaskPriorityLabels,
  implementationTaskStatusLabels,
  implementationTaskTypeLabels,
  sortImplementationTasksForAction,
} from "@/lib/implementation-task-metadata";
import type { Experiment, Idea, ImplementationTask, Risk } from "@/lib/venture-data";
import { decisionLabels, riskSeverityLabels, riskStatusLabels, stageLabels } from "@/lib/workbench-labels";

type AppBlueprintState = Pick<Idea, "stage" | "decision" | "next_evidence" | "product_surface">;

type AppBlueprintBackendCandidate = {
  label: string;
};

export function buildAppBlueprintMarkdown({
  idea,
  state,
  risks,
  experiments,
  implementationTasks,
  backendCandidateScores,
}: {
  idea: Idea;
  state: AppBlueprintState;
  risks: Risk[];
  experiments: Experiment[];
  implementationTasks: ImplementationTask[];
  backendCandidateScores: AppBlueprintBackendCandidate[];
}) {
  const productSurface = resolveProductSurfaceForIdea(idea, state);
  const topBackend = backendCandidateScores[0]?.label || "Supabase";
  const highRisks = risks.filter((risk) => risk.severity === "high" || risk.severity === "critical");
  const riskLines =
    risks.length > 0
      ? risks
          .slice(0, 8)
          .map((risk) => `- ${risk.title}: ${riskSeverityLabels[risk.severity]} / ${riskStatusLabels[risk.status] || risk.status} / ${risk.mitigation || "완화책 미정"}`)
          .join("\n")
      : "- 아직 등록된 리스크가 없습니다. 인증, 개인정보, 결제, 규제, 운영 장애 리스크를 먼저 적습니다.";
  const experimentLines =
    experiments.length > 0
      ? experiments
          .slice(0, 6)
          .map(
            (experiment) =>
              `- ${experiment.name}: ${experiment.status} / ${experiment.success_metric || "성공 지표 미정"} / 결과는 근거 제작 자료에 기록`,
          )
          .join("\n")
      : "- 첫 제작 전에 5명 이상 대상 사용자에게 핵심 행동을 시켜 보는 검증 계획을 정의합니다.";
  const taskLines =
    implementationTasks.length > 0
      ? sortImplementationTasksForAction(implementationTasks)
          .slice(0, 10)
          .map(
            (task, index) =>
              `${index + 1}. ${task.title} / ${implementationTaskTypeLabels[task.task_type]} / ${implementationTaskStatusLabels[task.status]} / ${implementationTaskPriorityLabels[task.priority]}`,
          )
          .join("\n")
      : "1. 범위 잠금: 포함/제외 범위, No-go 조건, 성공 지표를 먼저 확정합니다.\n2. 데이터 경계: 사용자/워크스페이스/레코드 소유권을 정의합니다.\n3. 핵심 입력-저장-조회 흐름: 첫 수직 슬라이스를 구현합니다.\n4. 권한 차단과 오류 상태: 허용/차단/빈 상태/로딩을 모두 검증합니다.\n5. 배포와 스모크: Preview, Production, 롤백 기준을 남깁니다.";
  const surfaceStructure = buildSurfaceBlueprintStructure(productSurface);

  return `# 앱 구조 청사진: ${idea.name}

이 문서는 제품 기획서, 첫 제작 범위, 디자인 기준, 기술 명세를 실제 앱 구조로 번역하는 구현 청사진입니다. 개발자는 이 문서를 기준으로 라우트, 컴포넌트, 데이터 모델, API/액션, 테스트를 만들고 과한 확장을 피합니다.

## 1. 제품 경계

- 한 줄 가치: ${idea.one_liner || "미정"}
- 대상 사용자: ${idea.target_user || "미정"}
- 구매자: ${idea.buyer || "미정"}
- 현재 단계: ${stageLabels[state.stage]}
- 현재 판단: ${decisionLabels[state.decision]}
- 추가 확인 내용: ${state.next_evidence || "미정"}
- 제작 형태: ${productSurface.label}
- 정보 구조 기준: ${productSurface.iaHint}
- 첫 제작 형태: ${productSurface.firstBuild}
- 추천 백엔드: ${topBackend}
- 빌드 원칙: 가장 작은 수직 슬라이스로 ${state.next_evidence || "추가 확인 내용"}을 확인합니다.
- 제작 기준: ${productSurface.harnessFocus}
- 외부 전달 기준: ${productSurface.handoffHint}

## 2. 첫 버전 정보 구조

${surfaceStructure}

## 3. 컴포넌트 맵

- AppShell: 상단 제품명, 좌측 단계 메뉴, 우측 현재 작업 영역
- StepNavigation: 단계별 완료/차단/다음 행동 표시
- IntakeForm: 이름, 대상 사용자, 문제, 수요 신호, 추가 확인 내용 입력
- WorkbenchPanel: 점수, 판단, 리스크 감점, 저장 상태
- EvidencePanel: 실험, 인터뷰, 수동 근거, 신뢰도 표시
- ArtifactLibrary: 제작 자료 유형, 버전, 승인 상태, 복사/저장
- RiskPanel: 높은 리스크, 완화책, 종료 조건
- BuildReadinessPanel: 개발 착수 점검, 누락 항목, 다음 작업
- PermissionNotice: 로그인 필요, 읽기 전용, 워크스페이스 없음, 권한 없음

## 4. 데이터 모델 초안

| Entity | 핵심 필드 | 권한 경계 |
| --- | --- | --- |
| workspace | id, name, owner_id, created_at | owner/admin만 설정 변경 |
| membership | workspace_id, user_id, role | 본인 또는 관리자만 조회 |
| record | id, workspace_id, owner_id, name, one_liner, stage, decision | owner 또는 workspace member |
| evidence | id, record_id, type, source, body, confidence, created_by | record 접근권 상속 |
| risk | id, record_id, severity, status, mitigation | record 접근권 상속 |
| artifact | id, record_id, type, version, status, body, source | record 접근권 상속, 승인 변경은 editor 이상 |
| event_log | id, actor_id, action, target_type, target_id, metadata | 관리자/감사용 읽기 |

## 5. API와 서버 액션 계약

- listRecords: 현재 사용자 또는 워크스페이스의 기록을 최신순으로 조회합니다.
- createRecord: 핵심 입력을 저장하고 event_log에 created 이벤트를 남깁니다.
- updateRecordScore: 점수/단계/판단/추가 확인 내용을 갱신합니다.
- createEvidence: 실험 결과나 인터뷰 근거를 저장합니다.
- createArtifact: 제작 자료 초안을 버전 증가 방식으로 저장합니다.
- approveArtifact: 승인 권한을 확인한 뒤 status를 approved로 바꿉니다.
- generateDraft: AI 생성이 들어가면 서버 Route Handler에서만 호출하고 원문 입력, 모델, 비용, 결과 id를 저장합니다.

## 6. 백엔드 규칙

- 선택 후보: ${topBackend}
- Supabase라면 모든 테이블에 RLS를 켜고 workspace_id 또는 owner_id 기준 정책을 둡니다.
- Firebase라면 Firestore Security Rules, App Check, Emulator 테스트를 첫 스프린트에 포함합니다.
- Firebase SQL Connect라면 SQL schema, Connector, IAM/Rules 경계를 문서화하고 로컬 검증 명령을 둡니다.
- 서비스 키, OpenAI 키, 결제 키는 클라이언트 번들에 노출하지 않습니다.

## 7. 화면 상태 체크리스트

- [ ] 로그인 전
- [ ] 로그인 후 워크스페이스 없음
- [ ] 읽기 전용 기록
- [ ] 새 기록 저장 중
- [ ] 저장 성공 후 목록 즉시 반영
- [ ] 저장 실패와 재시도
- [ ] 권한 없음
- [ ] 빈 제작 자료
- [ ] 모바일 390px에서 메뉴 접힘
- [ ] 데스크톱 1440px에서 좌측 메뉴와 우측 폼 동시 표시

## 8. 리스크 입력

${riskLines}

높음/치명 리스크 수: ${highRisks.length}

## 9. 검증 계획 입력

${experimentLines}

## 10. 첫 개발 태스크

${taskLines}

## 11. 수용 테스트

1. 새 사용자가 로그인 상태를 명확히 인지합니다.
2. 핵심 입력 폼을 채우고 저장하면 목록이 새로고침 없이 갱신됩니다.
3. 저장된 기록을 선택하면 점수, 리스크, 제작 자료 영역이 같은 문맥으로 바뀝니다.
4. 권한 없는 사용자는 쓰기 버튼이 비활성화되고 사유를 봅니다.
5. 제작 자료 저장 시 버전이 증가하고 최신본이 보관함 상단에 나타납니다.
6. 모바일에서 좌측 메뉴가 작업을 가리지 않습니다.
7. 배포 후 Production URL에서 로그인, 저장, 조회, 제작 자료 저장 스모크가 통과합니다.

## 12. 제작 담당자 시작 안내

너는 ${idea.name}의 첫 제작 범위를 구현하는 선임 개발 담당자다. 위 앱 구조 청사진만 기준으로 Next.js App Router, TypeScript, Tailwind, ${topBackend} 경계를 잡아라. 첫 작업은 라우트 맵, 컴포넌트 맵, 데이터 모델, 권한 규칙, 스모크 테스트를 가장 작은 구현 흐름으로 연결하는 것이다. ${productSurface.label}에 맞는 실제 핵심 흐름, 저장/제출/조회, 권한, 오류 상태를 우선한다. 완료 보고에는 변경 파일, 검증 명령, 배포 URL, 남은 리스크, 롤백 기준을 포함한다.
`;
}
