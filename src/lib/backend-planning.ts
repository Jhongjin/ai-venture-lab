import { resolveProductSurfaceForIdea } from "@/lib/product-surface";
import type { Experiment, Idea, Risk } from "@/lib/venture-data";

export type BackendCandidateKey = "supabase" | "firebase" | "firebase_sql_connect" | "hybrid";

export type BackendCandidateScore = {
  key: BackendCandidateKey;
  label: string;
  score: number;
  summary: string;
  strengths: string[];
  cautions: string[];
};

export type BackendExecutionCheck = {
  label: string;
  detail: string;
  evidence: string;
  tone: "required" | "recommended";
};

export type BackendExecutionPlan = {
  backend: BackendCandidateScore;
  envVars: string[];
  checks: BackendExecutionCheck[];
  localCommand: string;
  productionGate: string;
  rollback: string;
};

type BackendPlanningState = Pick<Idea, "signal" | "risk_summary" | "next_evidence" | "mvp_speed" | "product_surface">;

function includesAny(text: string, terms: string[]) {
  return terms.some((term) => text.includes(term));
}

function clampBackendScore(score: number) {
  return Math.max(0, Math.min(100, score));
}

export function buildBackendCandidateScores({
  idea,
  state,
  experiments,
  risks,
}: {
  idea: Idea;
  state: BackendPlanningState;
  experiments: Experiment[];
  risks: Risk[];
}): BackendCandidateScore[] {
  const text = [
    idea.name,
    idea.one_liner,
    idea.target_user,
    idea.buyer,
    state.signal,
    state.risk_summary,
    state.next_evidence,
    ...experiments.flatMap((experiment) => [experiment.name, experiment.success_metric]),
    ...risks.flatMap((risk) => [risk.title, risk.area, risk.mitigation]),
  ]
    .join(" ")
    .toLowerCase();
  const relational = includesAny(text, ["운영", "콘솔", "센터", "관리", "승인", "권한", "워크플로", "리포트", "감사", "b2b", "sql", "관계형"]);
  const mobile = includesAny(text, ["모바일", "ios", "android", "네이티브", "앱스토어", "푸시", "알림", "카메라", "위치"]);
  const realtime = includesAny(text, ["실시간", "채팅", "동기화", "협업", "라이브", "presence", "offline", "오프라인"]);
  const analytics = includesAny(text, ["analytics", "분석", "crash", "crashlytics", "remote config", "a/b", "ab test", "test lab", "app check"]);
  const googleStack = includesAny(text, ["google", "firebase", "gcp", "cloud functions", "cloud messaging", "genkit", "data connect", "sql connect"]);
  const sensitive = includesAny(text, ["개인정보", "민감", "건강", "의료", "금융", "상담", "요양", "법률", "위치", "사진", "가족"]);
  const regulated = sensitive || risks.some((risk) => ["high", "critical"].includes(risk.severity));
  const fastMvp = state.mvp_speed >= 4 || includesAny(text, ["mvp", "첫 버전", "프로토타입", "빠르게", "2주"]);
  const productSurface = resolveProductSurfaceForIdea(idea, state);
  const surfaceIsWebApp = productSurface.key === "web_app" || productSurface.key === "operator_console" || productSurface.key === "automation";
  const surfaceIsMobile = productSurface.key === "mobile_app";
  const surfaceIsMcp = productSurface.key === "mcp_handoff";

  const supabaseScore = clampBackendScore(
    54 +
      (relational ? 18 : 0) +
      (regulated ? 10 : 0) +
      (fastMvp ? 6 : 0) +
      (surfaceIsWebApp ? 8 : 0) +
      (surfaceIsMcp ? 5 : 0) -
      (mobile ? 6 : 0) -
      (realtime ? 4 : 0),
  );
  const firebaseScore = clampBackendScore(
    42 +
      (mobile ? 20 : 0) +
      (surfaceIsMobile ? 12 : 0) +
      (realtime ? 14 : 0) +
      (analytics ? 12 : 0) +
      (googleStack ? 8 : 0) -
      (relational ? 8 : 0) -
      (regulated ? 3 : 0),
  );
  const sqlConnectScore = clampBackendScore(
    38 +
      (relational ? 12 : 0) +
      (mobile || realtime || surfaceIsMobile ? 10 : 0) +
      (googleStack ? 12 : 0) +
      (analytics ? 6 : 0) -
      (!relational ? 6 : 0),
  );
  const hybridScore = clampBackendScore(
    36 +
      (relational && (mobile || realtime) ? 18 : 0) +
      (regulated && analytics ? 10 : 0) +
      (googleStack ? 8 : 0) -
      (fastMvp ? 8 : 0) +
      (surfaceIsMobile && relational ? 8 : 0),
  );

  const candidates: BackendCandidateScore[] = [
    {
      key: "supabase",
      label: "Supabase",
      score: supabaseScore,
      summary: "관계형 데이터, SQL, RLS, 운영 콘솔, 조직 권한이 중심인 첫 버전에 적합합니다.",
      strengths: ["Postgres/RLS 기반 권한", "SQL 질의와 운영자 테이블 점검", "Vercel/Next.js 운영 콘솔과 빠른 궁합"],
      cautions: ["모바일 네이티브 진단/푸시/오프라인은 별도 설계 필요", "실시간 앱 품질 도구는 직접 조합해야 함"],
    },
    {
      key: "firebase",
      label: "Firebase",
      score: firebaseScore,
      summary: "모바일, 실시간, 오프라인, 푸시, Analytics/Crashlytics/App Check가 핵심인 첫 버전에 적합합니다.",
      strengths: ["모바일/웹 SDK와 Google Analytics", "Crashlytics, Cloud Messaging, Remote Config, Test Lab", "App Check와 Emulator Suite"],
      cautions: ["복잡한 조인/운영 리포트는 Firestore 모델링 비용이 큼", "Security Rules와 IAM 경계를 별도로 검증해야 함"],
    },
    {
      key: "firebase_sql_connect",
      label: "Firebase SQL Connect",
      score: sqlConnectScore,
      summary: "PostgreSQL이 필요하지만 Firebase SDK, Google Cloud, 앱 품질 도구도 중요한 경우 검토합니다.",
      strengths: ["Firebase 생태계와 Postgres 모델 절충", "Generated SDK와 Google Cloud 운영 연결", "모바일 앱과 SQL 모델을 함께 검토 가능"],
      cautions: ["Supabase와 운영 모델이 다름", "Cloud SQL, region, 가격, 로컬 에뮬레이터 범위 확인 필요"],
    },
    {
      key: "hybrid",
      label: "Hybrid",
      score: hybridScore,
      summary: "관계형 운영 데이터와 모바일/실시간 앱 경험을 분리해야 할 때만 선택합니다.",
      strengths: ["운영 콘솔은 SQL/RLS, 앱 경험은 Firebase로 분리", "민감 데이터와 이벤트 데이터를 다른 경계로 통제", "점진적 전환 가능"],
      cautions: ["첫 버전부터 복잡도가 빠르게 커짐", "동기화, 권한, 장애 대응 책임이 두 배가 될 수 있음"],
    },
  ];

  return candidates.sort((left, right) => right.score - left.score);
}

export function buildBackendExecutionPlan(backend: BackendCandidateScore): BackendExecutionPlan {
  const sharedChecks: BackendExecutionCheck[] = [
    {
      label: "클라이언트/서버 키 경계",
      detail: "브라우저에 노출되는 공개 설정과 서버 전용 비밀값을 분리합니다.",
      evidence: "Vercel Production env 목록에서 NEXT_PUBLIC 또는 공개 Firebase config와 서버 전용 키 경계를 기록",
      tone: "required",
    },
    {
      label: "허용/차단 테스트",
      detail: "로그인 사용자 본인/조직 데이터 접근은 허용하고 타인 데이터 접근은 차단합니다.",
      evidence: "허용 케이스 1개와 차단 케이스 1개의 실행 결과 또는 스크린샷/로그",
      tone: "required",
    },
    {
      label: "Preview/Production 재검증",
      detail: "Preview와 Production에서 같은 권한 경계와 환경변수가 적용되는지 확인합니다.",
      evidence: "Vercel inspect URL, smoke 명령, 배포 URL",
      tone: "required",
    },
  ];

  if (backend.key === "firebase") {
    return {
      backend,
      envVars: [
        "NEXT_PUBLIC_FIREBASE_API_KEY",
        "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
        "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
        "FIREBASE_SERVICE_ACCOUNT 또는 Google Cloud IAM 서버 자격 증명",
      ],
      checks: [
        {
          label: "Security Rules",
          detail: "Firestore/Storage Rules에서 request.auth, uid, 조직 멤버십, 입력 데이터 형태를 검증합니다.",
          evidence: "Emulator 또는 Preview에서 본인 문서 write 허용, 다른 uid write 거부 결과",
          tone: "required",
        },
        {
          label: "App Check",
          detail: "공개 클라이언트에서 Firebase 리소스를 직접 호출한다면 App Check 적용 여부를 결정합니다.",
          evidence: "App Check 설정 또는 초기 검증 기간 미적용 사유",
          tone: "recommended",
        },
        ...sharedChecks,
      ],
      localCommand: "firebase emulators:start && pnpm lint && pnpm typecheck && pnpm build",
      productionGate: "Security Rules 배포 후 Preview/Production에서 본인 write와 타인 write 차단을 재확인합니다.",
      rollback: "직전 Rules 배포본과 Vercel 직전 Ready 배포로 되돌립니다.",
    };
  }

  if (backend.key === "firebase_sql_connect") {
    return {
      backend,
      envVars: [
        "NEXT_PUBLIC_FIREBASE_API_KEY",
        "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
        "FIREBASE_SERVICE_ACCOUNT 또는 Google Cloud IAM 서버 자격 증명",
        "SQL_CONNECT_INSTANCE / generated SDK 설정",
      ],
      checks: [
        {
          label: "Schema/Connector 권한",
          detail: "SQL Connect schema, query, mutation이 인증 사용자와 조직 경계를 반영하는지 확인합니다.",
          evidence: "허용 query/mutation과 차단 query/mutation 결과",
          tone: "required",
        },
        {
          label: "Region/가격",
          detail: "Cloud SQL region, Firebase region, 예상 쿼리 비용과 cold path를 첫 제작 범위에 맞춥니다.",
          evidence: "선택 region, 가격 메모, 데이터 보관/삭제 기준",
          tone: "recommended",
        },
        ...sharedChecks,
      ],
      localCommand: "firebase emulators:start && pnpm lint && pnpm typecheck && pnpm build",
      productionGate: "generated SDK와 connector 배포 후 Preview에서 권한/쿼리 shape를 재확인합니다.",
      rollback: "직전 connector/schema 배포본과 Vercel 직전 Ready 배포로 되돌립니다.",
    };
  }

  if (backend.key === "hybrid") {
    return {
      backend,
      envVars: [
        "NEXT_PUBLIC_SUPABASE_URL",
        "NEXT_PUBLIC_SUPABASE_ANON_KEY",
        "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
        "SUPABASE_SERVICE_ROLE_KEY 서버 전용",
        "FIREBASE_SERVICE_ACCOUNT 서버 전용",
      ],
      checks: [
        {
          label: "데이터 소유권 분리",
          detail: "어떤 데이터가 Supabase에 남고 어떤 이벤트/실시간 데이터가 Firebase로 가는지 경계를 고정합니다.",
          evidence: "데이터 분리 표와 동기화 실패 시 우선 소스",
          tone: "required",
        },
        {
          label: "이중 권한 검증",
          detail: "Supabase RLS와 Firebase Rules/IAM을 각각 허용/차단 케이스로 검증합니다.",
          evidence: "Supabase allowed/denied, Firebase allowed/denied 결과",
          tone: "required",
        },
        ...sharedChecks,
      ],
      localCommand: "pnpm lint && pnpm typecheck && pnpm build && pnpm smoke:routes",
      productionGate: "두 백엔드가 모두 Preview/Production에서 같은 사용자 경계를 적용하는지 확인합니다.",
      rollback: "Vercel 직전 Ready 배포와 각 백엔드의 직전 정책/Rules 배포본으로 되돌립니다.",
    };
  }

  return {
    backend,
    envVars: ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY 서버 전용"],
    checks: [
      {
        label: "RLS 활성화",
        detail: "모든 사용자 기록 테이블에서 RLS를 켜고 owner/workspace 정책을 적용합니다.",
        evidence: "SQL Editor 또는 migration에서 RLS/policy 적용 로그",
        tone: "required",
      },
      {
        label: "Service role 차단 경계",
        detail: "service role key는 서버 전용 작업에만 쓰고 클라이언트 번들에 노출하지 않습니다.",
        evidence: "Vercel env 공개/서버 키 경계 메모와 NEXT_PUBLIC 사용 목록",
        tone: "required",
      },
      ...sharedChecks,
    ],
    localCommand: "pnpm lint && pnpm typecheck && pnpm build && pnpm smoke:routes",
    productionGate: "RLS 정책 적용 후 Production에서 로그인 사용자 insert/update와 타인 데이터 차단을 재확인합니다.",
    rollback: "직전 migration/policy 백업과 Vercel 직전 Ready 배포로 되돌립니다.",
  };
}
