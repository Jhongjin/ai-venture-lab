import type { ProductSurfaceKey, ProductSurfaceProfile } from "@/lib/product-surface";

export type ImplementationSurfaceTaskGuidance = {
  planningScope: string;
  designFlow: string;
  dataBoundary: string;
  backendBoundary: string;
  frontendSlice: string;
  stateCoverage: string;
  qaSmoke: string;
  securityFocus: string;
  deployHandoff: string;
  expansionGuard: string;
};

export const implementationSurfaceTaskGuidance: Record<ProductSurfaceKey, ImplementationSurfaceTaskGuidance> = {
  web_app: {
    planningScope: "로그인 이후 핵심 입력, 결과 확인, 저장된 기록 조회까지를 한 번에 확인할 수 있어야 합니다.",
    designFlow: "대시보드, 핵심 입력, 결과 검토, 기록 상세 흐름을 먼저 그립니다.",
    dataBoundary: "사용자/조직 소유 데이터, 입력 기록, 결과 저장, 변경 이력을 분리합니다.",
    backendBoundary: "인증 세션, Server Action 또는 API, RLS 정책 경계가 라우트별로 드러나야 합니다.",
    frontendSlice: "로그인 이후 핵심 입력, 결과 확인, 저장된 기록 조회 흐름을 얇게 완성합니다.",
    stateCoverage: "입력 없음, 저장 중, 결과 없음, 권한 없음, 읽기 전용 상태가 같은 흐름 안에서 확인됩니다.",
    qaSmoke: "로그인 후 입력-저장-조회-새로고침 복구를 브라우저 스모크로 확인합니다.",
    securityFocus: "조직 밖 기록 조회/수정 차단, 서버 전용 비밀값 노출, 로그 민감정보를 확인합니다.",
    deployHandoff: "외부 제작 도구에는 라우트, 컴포넌트, Server Action/API, 데이터 모델, smoke 명령을 묶어 넘깁니다.",
    expansionGuard: "결제, 복잡한 관리자, AI 자동 실행은 별도 승인 전까지 제외합니다.",
  },
  mobile_app: {
    planningScope: "휴대폰에서 첫 행동을 끝내고 재방문 이유까지 확인할 수 있어야 합니다.",
    designFlow: "온보딩, 홈, 핵심 행동, 알림/재방문, 권한/설정 흐름을 모바일 단일 여정으로 그립니다.",
    dataBoundary: "기기 권한 상태, 알림 토큰, 오프라인/재방문 기록, 사용자 소유 데이터를 분리합니다.",
    backendBoundary: "모바일 API, 권한 요청 상태, 푸시/분석 도구 경계가 명확해야 합니다.",
    frontendSlice: "모바일 폭 핵심 화면 또는 반응형 웹앱으로 첫 행동을 완료할 수 있게 만듭니다.",
    stateCoverage: "권한 거부, 네트워크 오류, 작은 화면, 재방문 상태가 모바일 화면에서 확인됩니다.",
    qaSmoke: "모바일 뷰포트에서 온보딩-핵심 행동-저장/재방문 흐름을 확인합니다.",
    securityFocus: "위치, 카메라, 알림 권한은 필요한 시점에만 요청하고 저장 정보는 최소화합니다.",
    deployHandoff: "외부 제작 도구에는 모바일 화면 상태, 권한 요청, 푸시/분석 경계, 앱스토어 전 검증 명령을 넘깁니다.",
    expansionGuard: "네이티브 전환, 푸시 자동화, 앱스토어 배포는 별도 승인 전까지 제외합니다.",
  },
  web_site: {
    planningScope: "방문자가 제안을 이해하고 신청 또는 예약까지 끝낼 수 있어야 합니다.",
    designFlow: "첫 화면, 문제/제안, 신뢰 근거, 신청/예약, FAQ, 완료 후 안내를 공개 페이지 구조로 그립니다.",
    dataBoundary: "신청자 정보 최소 수집, 동의 문구, 신청 상태, 후속 연락 기록을 분리합니다.",
    backendBoundary: "신청 폼 저장, 이메일/CRM 알림, 중복 제출과 스팸 방지 기준을 정합니다.",
    frontendSlice: "공개 랜딩, 전환 버튼, 신청 폼, 제출 완료 화면을 먼저 완성합니다.",
    stateCoverage: "폼 검증, 제출 중, 제출 성공/실패, 모바일 전환 버튼 상태가 확인됩니다.",
    qaSmoke: "데스크톱과 모바일에서 전환 버튼, 신청 폼, 제출 완료, SEO 기본 태그를 확인합니다.",
    securityFocus: "개인정보 동의, 스팸 제출, 폼 남용, 공개 페이지에 노출되는 민감정보를 확인합니다.",
    deployHandoff: "외부 제작 도구에는 섹션 순서, 전환 문구, 폼 저장/알림, SEO, 신청 후 처리 기준을 넘깁니다.",
    expansionGuard: "회원 계정, 결제, 복잡한 CMS, 다단계 CRM 자동화는 별도 승인 전까지 제외합니다.",
  },
  automation: {
    planningScope: "입력 출처에서 처리 결과까지 수동 운영으로도 같은 가치를 낼 수 있어야 합니다.",
    designFlow: "입력 출처, 처리 대기열, 자동 처리 결과, 사람 검토, 로그/실패 복구 흐름을 그립니다.",
    dataBoundary: "원본 입력은 필요한 만큼만 보관하고, 처리 상태, 재시도, 승인 결과, 실패 사유를 분리합니다.",
    backendBoundary: "webhook, queue, worker, 사람 승인, 재시도 경계가 한 흐름으로 이어져야 합니다.",
    frontendSlice: "수동 운영 콘솔에서 처리 전후를 비교하고 승인/반려/재시도를 할 수 있게 만듭니다.",
    stateCoverage: "대기, 처리 중, 승인 필요, 실패, 재시도, 수동 대체 상태가 화면에서 확인됩니다.",
    qaSmoke: "샘플 입력을 넣고 처리 결과, 사람 검토, 실패 재시도, 로그 기록까지 확인합니다.",
    securityFocus: "외부 토큰, 개인정보 마스킹, 자동 실행 전 사람 승인 경계, 실패 로그 노출을 확인합니다.",
    deployHandoff: "외부 제작 도구에는 트리거, 처리 단계, 승인/재시도, 실패 로그, 수동 대체 경로를 넘깁니다.",
    expansionGuard: "외부 계정 직접 조작, 완전 자동 실행, 대량 발송은 별도 승인 전까지 제외합니다.",
  },
  operator_console: {
    planningScope: "운영자가 목록을 보고 판단, 배정, 상태 변경, 추적까지 끝낼 수 있어야 합니다.",
    designFlow: "현황판, 리스트/필터, 상세, 상태 변경, 담당/권한, 감사 로그 흐름을 그립니다.",
    dataBoundary: "상태 전환, 담당자, 조직 권한, 감사 로그, 필터 기준을 데이터 모델에 남깁니다.",
    backendBoundary: "역할별 조회/수정 권한, 상태 전환 정책, 감사 로그 기록이 서버 경계에 있어야 합니다.",
    frontendSlice: "리스트, 상세, 상태 변경, 담당자/권한 표시를 콘솔형 첫 제작 범위로 구현합니다.",
    stateCoverage: "빈 리스트, 필터 결과 없음, 권한 없음, 읽기 전용, 동시 수정 충돌 상태가 확인됩니다.",
    qaSmoke: "역할별 목록/상세 조회와 상태 변경의 허용/차단 케이스를 확인합니다.",
    securityFocus: "권한 상승, 조직 밖 데이터 노출, 상태 변경 감사 로그 누락을 확인합니다.",
    deployHandoff: "외부 제작 도구에는 테이블/상세 계약, 상태 전환, 권한 정책, 감사 로그, 운영 smoke를 넘깁니다.",
    expansionGuard: "대량 작업, 고급 분석, 복잡한 자동 배정은 별도 승인 전까지 제외합니다.",
  },
  mcp_handoff: {
    planningScope: "사용자가 제작 패키지를 만들고 외부 제작 도구에서 바로 시작할 수 있어야 합니다.",
    designFlow: "패키지 생성, 도구 선택, 연결 지침, 실행 로그, 재생성/버전 관리 흐름을 그립니다.",
    dataBoundary: "패키지 버전, 대상 도구, 생성된 자료 참조, 실행 이력, 재생성 사유를 분리합니다.",
    backendBoundary: "제작 패키지 생성, 버전 관리, 다운로드/복사, 비밀값 제외 경계가 서버에서 보장되어야 합니다.",
    frontendSlice: "패키지 만들기, 최종 요약 검토, 도구별 전달 자료 확인, 복사/다운로드 흐름을 완성합니다.",
    stateCoverage: "생성 중, 패키지 없음, 오래된 패키지, 복사 성공, 재생성 필요 상태가 확인됩니다.",
    qaSmoke: "패키지에 기획서, 정보 구조, 디자인 기준, 기술 스택, 작업 순서, 검증 명령이 모두 들어있는지 확인합니다.",
    securityFocus: "비밀값 제거, 허용/금지 범위, 외부 도구에 넘기면 안 되는 사용자 원문을 확인합니다.",
    deployHandoff: "외부 제작 도구에는 제작 지시서, 읽어야 할 문서, 허용/금지 범위, 검증 명령, 보고 형식을 넘깁니다.",
    expansionGuard: "외부 제작 도구 직접 제어, 자동 repo 수정, credentials 전달은 별도 승인 전까지 제외합니다.",
  },
};

export function getSurfaceVisualStandard(key: ProductSurfaceKey) {
  switch (key) {
    case "mobile_app":
      return "모바일 단일 흐름, 큰 터치 영역, 권한/알림 상태, 하단 primary action을 우선합니다.";
    case "web_site":
      return "첫 화면 제안, 신뢰 근거, 신청/예약 폼, 완료 후 후속 안내가 빠르게 읽히게 합니다.";
    case "automation":
      return "대기열, 처리 상태, 사람 검토, 재시도, 실패 로그가 한눈에 보이는 업무 화면을 우선합니다.";
    case "operator_console":
      return "조밀하지만 읽기 쉬운 리스트/상세/상태 변경 UI와 권한/감사 기록을 우선합니다.";
    case "mcp_handoff":
      return "패키지 생성, 도구 선택, 전달 자료, 버전/재생성 상태가 명확한 제작 도구 연결 화면을 우선합니다.";
    default:
      return "로그인 이후 핵심 입력, 결과 확인, 저장 기록이 빠르게 이어지는 제품형 웹 화면을 우선합니다.";
  }
}

export function buildSurfaceDesignContext(profile: ProductSurfaceProfile, guidance: ImplementationSurfaceTaskGuidance) {
  return [
    `- 제품 성격: ${profile.description}`,
    `- 화면 구조: ${guidance.designFlow}`,
    `- 정보 구조: ${profile.iaHint}`,
    `- 첫 제작 형태: ${profile.firstBuild}`,
    `- 시각 기준: ${getSurfaceVisualStandard(profile.key)}`,
    `- 외부 전달 기준: ${profile.handoffHint}`,
    "- 금지: 결과물 형태와 맞지 않는 운영 콘솔 고정 화면, 마케팅형 히어로, 긴 스크롤 의존, 불명확한 저장 상태",
  ].join("\n");
}

export function buildSurfaceArchitectureNotes(profile: ProductSurfaceProfile, guidance: ImplementationSurfaceTaskGuidance) {
  return [
    `- 제작 형태별 스택 기준: ${profile.stackHint}`,
    `- 첫 제작 형태: ${profile.firstBuild}`,
    `- 데이터/권한 경계: ${guidance.dataBoundary}`,
    `- 백엔드 경계: ${guidance.backendBoundary}`,
    `- 화면 슬라이스: ${guidance.frontendSlice}`,
    `- 검증 스모크: ${guidance.qaSmoke}`,
  ].join("\n");
}

export function buildProductSurfaceContextSection(profile: ProductSurfaceProfile, guidance: ImplementationSurfaceTaskGuidance) {
  return `## 결과물 형태 기준

- 결과물 형태: ${profile.label}
- 정보 구조 기준: ${profile.iaHint}
- 첫 제작 형태: ${profile.firstBuild}
- 제작 기준: ${profile.harnessFocus}
- 핵심 화면/흐름: ${guidance.designFlow}
- 스택/권한 기준: ${profile.stackHint}
- 외부 전달 기준: ${profile.handoffHint}`;
}

export function buildSurfaceScreenOutline(profile: ProductSurfaceProfile, guidance: ImplementationSurfaceTaskGuidance) {
  if (profile.key === "web_site") {
    return `1. 첫 화면
   - 누구를 위한 제안인지, 어떤 문제를 해결하는지, 다음 행동이 무엇인지 5초 안에 보여줍니다.
   - 전환 버튼은 하나의 주 행동으로 둡니다.
2. 문제/제안/신뢰 근거 섹션
   - 현재 대안, 차별점, 실제 근거 또는 검증 가설을 짧게 배치합니다.
3. 신청/예약/문의 폼
   - 필수 입력, 동의 문구, 제출 중/성공/실패 상태를 포함합니다.
4. FAQ와 반박 해소
   - 가격, 처리 방식, 개인정보, 후속 연락 기준을 설명합니다.
5. 제출 완료 후 후속 안내
   - 다음 연락, 확인 메일, 취소/삭제 경로를 보여줍니다.`;
  }

  if (profile.key === "mobile_app") {
    return `1. 온보딩/권한 안내
   - 첫 행동 전에 필요한 권한과 이유를 짧게 설명합니다.
2. 홈/오늘 할 일
   - 모바일 한 화면에서 핵심 행동으로 바로 이동합니다.
3. 핵심 행동 화면
   - 엄지 조작, 저장 중, 네트워크 오류, 재시도 상태를 포함합니다.
4. 알림/재방문 화면
   - 사용자가 다시 돌아올 이유와 기록 확인 경로를 둡니다.
5. 설정/권한 화면
   - 알림, 위치, 카메라, 데이터 삭제 상태를 분리합니다.`;
  }

  if (profile.key === "automation") {
    return `1. 입력 출처 화면
   - 수동 입력, 업로드, webhook 등 들어오는 일을 한곳에서 확인합니다.
2. 처리 대기열
   - 자동 처리 전/중/완료/실패와 사람 검토 필요 상태를 보여줍니다.
3. 처리 결과 검토
   - 승인, 반려, 재시도, 수동 대체 경로를 제공합니다.
4. 로그/실패 복구
   - 실패 원인, 재처리, 담당자 확인을 남깁니다.
5. 리포트
   - 자동화 전후 시간 절감과 누락 감소 신호를 보여줍니다.`;
  }

  if (profile.key === "operator_console") {
    return `1. 현황판
   - 처리해야 할 항목, 위험 상태, 담당자 공백을 먼저 보여줍니다.
2. 리스트/필터
   - 상태, 담당, 우선순위, 기간으로 빠르게 스캔합니다.
3. 상세/상태 변경
   - 판단 근거, 메모, 상태 전환, 저장 성공/실패를 포함합니다.
4. 담당/권한
   - 역할별 조회/수정 가능 범위를 보여줍니다.
5. 감사 로그
   - 누가 언제 무엇을 바꿨는지 확인합니다.`;
  }

  return `1. 대시보드/작업 시작 화면
   - ${guidance.designFlow}
   - 오늘 해야 할 다음 행동과 최근 기록을 보여줍니다.
2. 핵심 입력 화면
   - 필수 입력과 선택 입력을 분리하고 하나의 primary action을 둡니다.
3. 결과 또는 제작 자료 검토 화면
   - 사용자가 결과를 비교, 승인, 수정, 저장할 수 있는 구조를 둡니다.
4. 상세/기록 화면
   - 상태, 근거, 리스크, 담당자, 수정 이력을 확인합니다.
5. 설정/권한 또는 데이터 경계 화면
   - 민감 데이터, 삭제, 권한, 워크스페이스 경계를 명확히 표시합니다.`;
}

export function buildSurfaceBlueprintStructure(profile: ProductSurfaceProfile) {
  if (profile.key === "web_site") {
    return `### 주요 섹션

1. 첫 화면
2. 문제/제안
3. 신뢰 근거
4. 신청/예약 폼
5. FAQ
6. 완료 후 안내

### 주요 라우트

| Route | 목적 | 포함 상태 |
| --- | --- | --- |
| / | 공개 랜딩과 전환 버튼 | 로딩, 모바일, SEO 기본 태그 |
| /apply | 신청/예약 폼 | 검증 오류, 제출 중, 제출 실패 |
| /thanks | 제출 완료와 다음 안내 | 완료, 중복 제출, 취소/삭제 안내 |
| /admin/leads | 신청 기록 확인 | 권한 없음, 빈 상태, 읽기 전용 |`;
  }

  if (profile.key === "mobile_app") {
    return `### 주요 화면

1. 온보딩
2. 홈
3. 핵심 행동
4. 기록 상세
5. 알림/설정

### 주요 화면 계약

| Screen | 목적 | 포함 상태 |
| --- | --- | --- |
| Onboarding | 가치와 권한 요청 이유 안내 | 권한 허용, 거부, 나중에 하기 |
| Home | 오늘 할 핵심 행동 | 빈 상태, 재방문, 로딩 |
| Action | 핵심 입력/저장 | 네트워크 오류, 저장 중, 성공 |
| HistoryDetail | 기록과 다음 행동 | 읽기 전용, 삭제/수정 |
| Settings | 권한/알림/데이터 삭제 | 권한 없음, 연결 해제 |`;
  }

  if (profile.key === "automation") {
    return `### 주요 화면

1. 입력 출처
2. 처리 대기열
3. 사람 검토
4. 실행 로그
5. 리포트

### 주요 라우트

| Route | 목적 | 포함 상태 |
| --- | --- | --- |
| /sources | 입력 출처와 수동 입력 | 연결 전, 입력 없음, 오류 |
| /queue | 처리 대기열 | 대기, 처리 중, 실패 |
| /review/[id] | 사람 검토와 승인/반려 | 승인 필요, 재시도, 권한 없음 |
| /logs | 실행 로그와 실패 복구 | 필터 없음, 재처리 중 |
| /reports | 자동화 전후 성과 | 데이터 없음, 기간 필터 |`;
  }

  if (profile.key === "operator_console") {
    return `### 주요 화면

1. 현황판
2. 리스트/필터
3. 상세/상태 변경
4. 담당/권한
5. 감사 로그

### 주요 라우트

| Route | 목적 | 포함 상태 |
| --- | --- | --- |
| / | 운영 현황과 위험 항목 | 로딩, 빈 상태, 읽기 전용 |
| /items | 리스트와 필터 | 필터 결과 없음, 권한 없음 |
| /items/[id] | 상세, 판단, 상태 변경 | 수정 중, 충돌, 저장 실패 |
| /members | 담당자와 권한 | 초대 전, 권한 부족 |
| /audit | 감사 로그 | 기록 없음, 기간 필터 |`;
  }

  return `### 주요 화면

1. 시작
2. 핵심 입력
3. 결과 검토
4. 기록 상세
5. 설정/권한

### 주요 라우트

| Route | 목적 | 포함 상태 |
| --- | --- | --- |
| / | 사용자가 오늘 해야 할 핵심 행동을 보여주는 대시보드 | 로딩, 빈 상태, 읽기 전용, 저장 성공 |
| /new | 핵심 입력 폼과 검증 전 저장 흐름 | 입력 전, 입력 중, 저장 실패, 권한 없음 |
| /records/[id] | 저장된 기록의 상세, 점수, 리스크, 다음 행동 | 수정 중, 승인됨, 보관됨 |
| /settings | 사용자/워크스페이스/데이터 삭제와 권한 경계 | 초대 전, 멤버 없음, 권한 부족 |`;
}
