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
