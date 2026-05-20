export type ProductSurfaceKey =
  | "web_app"
  | "mobile_app"
  | "web_site"
  | "automation"
  | "operator_console"
  | "mcp_handoff";

export type ProductSurfaceProfile = {
  key: ProductSurfaceKey;
  label: string;
  shortLabel: string;
  description: string;
  firstBuild: string;
  stackHint: string;
  harnessFocus: string;
  promptFocus: string;
};

export type ProductSurfaceInput = {
  name?: string | null;
  one_liner?: string | null;
  target_user?: string | null;
  buyer?: string | null;
  signal?: string | null;
  risk_summary?: string | null;
  next_evidence?: string | null;
  firstPrototypeScope?: string | null;
  pricingHypothesis?: string | null;
  sourceBlock?: string | null;
};

export const productSurfaceOrder: ProductSurfaceKey[] = [
  "web_app",
  "mobile_app",
  "web_site",
  "automation",
  "operator_console",
  "mcp_handoff",
];

export const productSurfaceProfiles: Record<ProductSurfaceKey, ProductSurfaceProfile> = {
  web_app: {
    key: "web_app",
    label: "웹 서비스",
    shortLabel: "웹",
    description: "브라우저에서 로그인, 입력, 저장, 결과 확인까지 이어지는 제품형 서비스입니다.",
    firstBuild: "Next.js 기반의 핵심 입력-결과-저장 흐름",
    stackHint: "Next.js App Router, TypeScript, Supabase, Vercel을 기본값으로 둡니다.",
    harnessFocus: "제작 패키지에는 화면 흐름, 데이터 모델, 권한, 배포 확인까지 함께 담습니다.",
    promptFocus: "웹 화면, 인증, 데이터 저장, 상태 UX, Vercel 배포 조건을 우선 반영합니다.",
  },
  mobile_app: {
    key: "mobile_app",
    label: "모바일 앱",
    shortLabel: "앱",
    description: "휴대폰 사용 맥락, 알림, 위치, 카메라, 네이티브 경험이 중요한 서비스입니다.",
    firstBuild: "모바일 핵심 화면 또는 반응형 웹앱으로 먼저 검증한 뒤 네이티브 전환",
    stackHint: "Expo/React Native 또는 Flutter, Firebase/Supabase, 푸시/분석 도구를 비교합니다.",
    harnessFocus: "제작 패키지에는 모바일 화면, 권한 요청, 알림, 재방문 흐름, 앱 배포 전 검증 기준을 담습니다.",
    promptFocus: "모바일 첫 화면, 권한 상태, 푸시/알림, 앱스토어 이전 검증 경로를 우선 반영합니다.",
  },
  web_site: {
    key: "web_site",
    label: "랜딩/웹사이트",
    shortLabel: "사이트",
    description: "랜딩, 예약, 신청, 설명, 콘텐츠 전환처럼 공개 페이지가 중심인 서비스입니다.",
    firstBuild: "랜딩 페이지, 신청 폼, 대기자 또는 상담 신청 흐름",
    stackHint: "Next.js, Vercel, 폼/이메일/CRM 연동, 간단한 CMS를 우선 검토합니다.",
    harnessFocus: "제작 패키지에는 카피, 전환 버튼, 검색 노출, 신청 저장, 신청 후 후속 처리까지 담습니다.",
    promptFocus: "랜딩 구조, 신청 폼, 전환 지표, 콘텐츠/SEO, 문의 처리 흐름을 우선 반영합니다.",
  },
  automation: {
    key: "automation",
    label: "업무 자동화",
    shortLabel: "자동화",
    description: "반복 업무를 받아 정리, 분류, 알림, 리포트, 워크플로로 처리하는 서비스입니다.",
    firstBuild: "수동 운영이 가능한 작업 콘솔과 자동화 전후 비교 흐름",
    stackHint: "Next.js 운영 화면, Supabase, queue/webhook, n8n 또는 서버 작업자를 검토합니다.",
    harnessFocus: "제작 패키지에는 입력 출처, 자동 처리 규칙, 사람 검토, 로그, 실패 복구 기준을 담습니다.",
    promptFocus: "자동화 트리거, 처리 단계, 예외 처리, 사람 승인, 로그/리포트 생성을 우선 반영합니다.",
  },
  operator_console: {
    key: "operator_console",
    label: "운영 콘솔",
    shortLabel: "콘솔",
    description: "팀이나 운영자가 기록을 보고 판단, 배정, 처리, 추적하는 업무형 제품입니다.",
    firstBuild: "리스트, 상세, 상태 변경, 담당자/권한이 있는 콘솔형 첫 제작 범위",
    stackHint: "Next.js App Router, Supabase Postgres/RLS, Vercel을 우선 검토합니다.",
    harnessFocus: "제작 패키지에는 권한, 상태 변경, 감사 로그, 필터, 빈/오류/읽기 전용 상태를 담습니다.",
    promptFocus: "대시보드, 리스트/상세, 상태 변경, 권한, 감사 로그, 운영 지표를 우선 반영합니다.",
  },
  mcp_handoff: {
    key: "mcp_handoff",
    label: "제작 도구 연동",
    shortLabel: "연동",
    description: "Cursor, Codex, Claude 같은 제작 도구로 넘길 제작 패키지와 연결 흐름이 핵심입니다.",
    firstBuild: "제작 패키지, 제작 도구 연결 지침, CLI 설치 흐름",
    stackHint: "Next.js 제어 화면, 연결 서버/CLI 패키지, 문서와 제작 지시 버전 관리를 검토합니다.",
    harnessFocus: "제작 패키지에는 기획서, 디자인, 기술 명세, 제작 지시, 검증 명령을 제작 도구에서 바로 쓸 수 있게 담습니다.",
    promptFocus: "제작 도구별 설치, 연결 등록, 코드 생성 지시, 검증/배포 명령을 우선 반영합니다.",
  },
};

const surfaceSignals: Record<ProductSurfaceKey, string[]> = {
  web_app: [
    "saas",
    "웹앱",
    "웹 앱",
    "회원",
    "로그인",
    "워크스페이스",
    "폼",
    "저장",
    "조회",
    "결과",
    "서비스",
    "플랫폼",
  ],
  mobile_app: [
    "모바일",
    "앱스토어",
    "ios",
    "android",
    "네이티브",
    "휴대폰",
    "핸드폰",
    "폰",
    "푸시",
    "알림",
    "위치",
    "카메라",
    "걸음",
  ],
  web_site: ["랜딩", "홈페이지", "웹사이트", "사이트", "예약 페이지", "신청 페이지", "공개 페이지", "seo", "블로그"],
  automation: [
    "자동화",
    "반복 업무",
    "워크플로",
    "워크플로우",
    "n8n",
    "zapier",
    "메일",
    "이메일",
    "슬랙",
    "리포트",
    "배치",
    "스케줄",
    "분류",
  ],
  operator_console: [
    "콘솔",
    "대시보드",
    "관리자",
    "운영",
    "crm",
    "cs",
    "리뷰",
    "승인",
    "담당자",
    "배정",
    "조직",
    "권한",
    "b2b",
  ],
  mcp_handoff: ["mcp", "cursor", "코덱스", "codex", "claude", "클로드", "ide", "개발 도구", "프롬프트", "하네스"],
};

function normalizeSurfaceText(input: ProductSurfaceInput) {
  return [
    input.name,
    input.one_liner,
    input.target_user,
    input.buyer,
    input.signal,
    input.risk_summary,
    input.next_evidence,
    input.firstPrototypeScope,
    input.pricingHypothesis,
    input.sourceBlock,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function inferProductSurface(input: ProductSurfaceInput): ProductSurfaceProfile {
  const text = normalizeSurfaceText(input);
  const scores = Object.fromEntries(
    productSurfaceOrder.map((key) => [
      key,
      surfaceSignals[key].reduce((score, signal) => score + (text.includes(signal.toLowerCase()) ? 1 : 0), 0),
    ]),
  ) as Record<ProductSurfaceKey, number>;

  if (/(^|\s)앱(\s|$)|앱을|앱으로|앱에서|앱 기반/.test(text)) {
    scores.mobile_app += 1;
  }

  if (/웹\/앱|웹과 앱|웹이나 앱|web\/app/.test(text)) {
    scores.web_app += 1;
    scores.mobile_app += 1;
  }

  if (/업무|운영|관리|팀|조직/.test(text) && /자동|정리|분류|리포트|배정/.test(text)) {
    scores.automation += 2;
    scores.operator_console += 1;
  }

  if (/사용자|구매자|결제|구독|대기자|신청/.test(text) && /브라우저|웹|서비스|saas|플랫폼/.test(text)) {
    scores.web_app += 2;
  }

  const orderedKeys: ProductSurfaceKey[] = [
    "mcp_handoff",
    "mobile_app",
    "automation",
    "operator_console",
    "web_site",
    "web_app",
  ];
  const bestKey = orderedKeys.reduce<ProductSurfaceKey>((best, key) => {
    if (scores[key] > scores[best]) {
      return key;
    }

    return best;
  }, "web_app");

  return productSurfaceProfiles[scores[bestKey] > 0 ? bestKey : "web_app"];
}

export function getProductSurfaceProfile(key: unknown, fallbackInput: ProductSurfaceInput): ProductSurfaceProfile {
  if (typeof key === "string" && key in productSurfaceProfiles) {
    return productSurfaceProfiles[key as ProductSurfaceKey];
  }

  return inferProductSurface(fallbackInput);
}

export function productSurfaceMarkdown(profile: ProductSurfaceProfile) {
  return `## 제작 형태

- 권장 제작 형태: ${profile.label}
- 첫 제작 형태: ${profile.firstBuild}
- 기술 스택 기준: ${profile.stackHint}
- 제작 기준: ${profile.harnessFocus}
- 제작 도구 전달 기준: ${profile.promptFocus}`;
}
