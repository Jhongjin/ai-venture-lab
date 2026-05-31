import type { OrchestrationPhase } from "@/lib/supabase/types";
import type { Idea, OrchestrationRun } from "@/lib/venture-data";
import { decisionLabels, stageLabels } from "@/lib/workbench-labels";

type RunOutputTemplateState = Pick<Idea, "stage" | "decision" | "next_evidence">;

export function buildRunOutputTemplate(
  run: OrchestrationRun,
  idea: Idea,
  state: RunOutputTemplateState,
) {
  const context = [
    `아이디어: ${idea.name}`,
    `단계: ${stageLabels[state.stage]}`,
    `판단: ${decisionLabels[state.decision]}`,
    `추가 확인 내용: ${state.next_evidence || "미정"}`,
  ].join("\n");

  const templates: Record<OrchestrationPhase, string> = {
    strategy: `# 전략 제작 자료

${context}

## 기회
- 사용자 고통:
- 구매자:
- 발생 계기:

## 판단 기준
- 반드시 증명할 것:
- 중단 조건:
- 승격 조건:

## 제약 조건
- 시간:
- 예산:
- 법무/보안:

## 다음 실행 약속
- 담당자:
- 실행:
- 기한:
`,
    research: `# 리서치 제작 자료

${context}

## 확인한 출처
- 출처:
- 출처:
- 출처:

## 시장 증거
- 사용자 고통:
- 기존 대안:
- 지불 의사 신호:

## 리스크 증거
- 규제:
- 개인정보:
- 경쟁:

## 확신도
- 알게 된 것:
- 아직 모르는 것:
- 추가 확인 내용:
`,
    product: `# 제품 제작 자료

${context}

## 문제 프레이밍
- 대상 사용자:
- 구매자:
- 발생 계기:
- 현재 우회 방법:
- 문제 비용:

## 사용자 이야기
사용자로서:
나는:
그 이유는:

## MVP 요구사항
- 반드시 포함:
- 있으면 좋음:
- 아직 제외:

## 수용 기준
- 조건/행동/결과:
- 조건/행동/결과:

## No-gos와 중단 기준
- 이번 MVP에서 하지 않을 것:
- 실험 실패 시 중단/전환 기준:

## 지표
- 활성화:
- 성공 지표:
- 실패 신호:
`,
    design: `# 디자인 제작 자료

${context}

## 디자인 기준
- 제품 맥락:
- 대상 사용자:
- primary action:
- 화면 목록:
- 컴포넌트 목록:
- 데이터 표시/수집:

## DESIGN.md 적용
- 색상 역할:
- 타이포그래피:
- 간격/밀도:
- radius/elevation:
- 피해야 할 표현:

## 주요 흐름
1. 진입:
2. 핵심 행동:
3. 성공 상태:

## 화면과 상태
- 빈 상태:
- 로딩:
- 오류:
- 성공:
- 권한 없음:
- 읽기 전용:

## 사용성 리스크
- 모바일:
- 접근성:
- 혼동되는 문구:
- 오류 예방/복구:
- AI 신뢰/불확실성:

## 디자인 판단
- 그대로 진행:
- 개발 전 수정:
`,
    build: `# 개발 제작 자료

${context}

## 백엔드 선택
- 선택한 백엔드:
- 선택 이유:
- 제외한 백엔드와 이유:
- Supabase 적합성:
- Firebase 적합성:
- Firebase SQL Connect 적합성:
- 하이브리드 리스크:

## 기술 경계
- Server Component:
- Client Component:
- Server Action 또는 Route Handler:
- Supabase client/server 사용 위치:

## 데이터와 RLS
- 테이블:
- 마이그레이션:
- select 정책:
- insert/update/delete 정책:
- with check 조건:
- 허용/거부 테스트:

## Firebase 경계
- Firebase 제품:
- Firestore/SQL Connect/Realtime Database 모델:
- Security Rules 또는 IAM:
- App Check:
- Cloud Functions:
- Storage:
- Emulator/Preview 검증:

## 구현 범위
- 파일/모듈:
- 데이터 변경:
- 외부 서비스:

## 계획
1. 구현:
2. 검증:
3. 배포:

## 안전장치
- 기능 플래그 또는 롤백:
- 비밀값/환경변수:
- 백엔드 규칙 허용/차단 검증:
- Preview/Production 배포 로그 또는 Vercel inspect:
- 마이그레이션 리스크:
- 중복 제출 방지:
- stale UI/refresh 처리:

## 완료 기준
- 사용자에게 보이는 결과:
- 테스트:
- 배포:
- 수동 스모크 경로:
`,
    qa: `# QA 제작 자료

${context}

## 핵심 여정
- 테스트한 단계:
- 결과:

## 회귀 확인 범위
- 인증:
- 데이터 쓰기:
- 제작 자료/실행 워크플로우:
- 모바일 레이아웃:
- 빈/로딩/성공/오류:
- 권한 없음/읽기 전용:
- 새로고침 없는 화면 반영:

## 실패
- 이슈:
- 재현:
- 심각도:

## 검증 명령
- lint:
- typecheck:
- build:
- harness:
- 브라우저 스모크:

## 판정
- 통과/차단:
- 증거:
`,
    debug: `# 디버깅 제작 자료

${context}

## 재현
- 환경:
- 단계:
- 기대 결과:
- 실제 결과:

## 진단
- 추정 원인:
- 증거:
- 영향 범위:

## 수정
- 변경:
- 검증:
- 남은 리스크:
- 재발 방지:
`,
    security: `# 보안 제작 자료

${context}

## 데이터 분류
- 개인정보:
- 비밀값:
- 민감한 비즈니스 데이터:
- 규제 가능 데이터:

## 접근 제어
- 인증 요구:
- RLS/권한:
- 관리자 행동:
- with check/소유권:

## 악용과 개인정보
- 악용 경로:
- 보관:
- 동의/고지:
- 로그/감사:
- rate limit/대량 요청:
- AI 출력 검토/폐기:

## 판정
- 통과/차단:
- 필요한 완화:
`,
    launch: `# 출시 제작 자료

${context}

## 준비 상태
- 승인된 PRD:
- 승인된 첫 제작 범위:
- QA 점검:
- 보안 점검:

## 판단
- 진행/전환/중단/추가 조사:
- 이유:

## 릴리스 계획
- 담당자:
- 롤백:
- 먼저 볼 지표:
`,
  };

  return templates[run.phase].trim();
}
