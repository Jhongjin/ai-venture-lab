import { productSurfaceMarkdown, resolveProductSurfaceForIdea } from "@/lib/product-surface";
import type { Experiment, Idea } from "@/lib/venture-data";
import { decisionLabels, stageLabels } from "@/lib/workbench-labels";

type MvpScaffoldManifestState = Pick<Idea, "stage" | "decision" | "next_evidence" | "product_surface">;

export type MvpScaffoldBackendCandidate = {
  label: string;
};

export function getRecommendedMvpScaffoldBackend(backendCandidateScores: MvpScaffoldBackendCandidate[]) {
  return backendCandidateScores[0]?.label || "Supabase";
}

export function usesFirebaseMvpScaffoldBackend(backendLabel: string) {
  return /Firebase/i.test(backendLabel);
}

export function getMvpScaffoldExclusions(productSurface: { key: string }) {
  return productSurface.key === "web_site"
    ? "회원 계정, 결제, 고급 AI 자동화, 복잡한 관리자 대시보드, 다단계 CRM 자동화는 첫 슬라이스에서 제외합니다."
    : "마케팅 랜딩 페이지, 결제, 고급 AI 자동화, 관리자 대시보드, 복잡한 알림은 첫 슬라이스에서 제외합니다.";
}

export function buildMvpScaffoldManifestMarkdown({
  idea,
  state,
  experiments,
  backendCandidateScores,
}: {
  idea: Idea;
  state: MvpScaffoldManifestState;
  experiments: Experiment[];
  backendCandidateScores: MvpScaffoldBackendCandidate[];
}) {
  const topBackend = getRecommendedMvpScaffoldBackend(backendCandidateScores);
  const productSurface = resolveProductSurfaceForIdea(idea, state);
  const usesFirebase = usesFirebaseMvpScaffoldBackend(topBackend);
  const scaffoldExclusions = getMvpScaffoldExclusions(productSurface);
  const envLines = usesFirebase
    ? [
        "| NEXT_PUBLIC_FIREBASE_API_KEY | 클라이언트 공개 | Firebase Web SDK 공개 키 |",
        "| NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN | 클라이언트 공개 | Firebase Auth domain |",
        "| NEXT_PUBLIC_FIREBASE_PROJECT_ID | 클라이언트 공개 | Firebase project id |",
        "| FIREBASE_SERVICE_ACCOUNT_JSON | 서버 전용 | Admin SDK 또는 서버 작업이 필요할 때만 사용 |",
        "| OPENAI_API_KEY | 서버 전용 | AI 생성 기능이 Slice 2로 승인된 뒤 사용 |",
      ].join("\n")
    : [
        "| NEXT_PUBLIC_SUPABASE_URL | 클라이언트 공개 | Supabase project URL |",
        "| NEXT_PUBLIC_SUPABASE_ANON_KEY | 클라이언트 공개 | RLS 전제 익명 공개 키 |",
        "| SUPABASE_SERVICE_ROLE_KEY | 서버 전용 | 마이그레이션/관리 작업에서만 사용, 브라우저 금지 |",
        "| OPENAI_API_KEY | 서버 전용 | AI 생성 기능이 Slice 2로 승인된 뒤 사용 |",
      ].join("\n");
  const backendRules = usesFirebase
    ? `## Firebase 규칙 초안

- Firestore/Realtime Database/SQL Connect 중 하나만 첫 버전에 선택합니다.
- Security Rules는 owner_id 또는 workspace_members 기준으로 읽기/쓰기 권한을 제한합니다.
- App Check는 외부 공개 전 활성화합니다.
- Emulator Suite에서 허용/차단 케이스를 테스트합니다.
- Cloud Functions는 서버 비밀값이 필요한 작업에만 사용합니다.`
    : `## Supabase 스키마/RLS 초안

\`\`\`sql
create table if not exists public.records (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  workspace_id uuid,
  name text not null,
  status text not null default 'draft',
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.records enable row level security;

create policy "records_select_own"
on public.records for select
to authenticated
using (owner_id = auth.uid());

create policy "records_insert_own"
on public.records for insert
to authenticated
with check (owner_id = auth.uid());

create policy "records_update_own"
on public.records for update
to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());
\`\`\`

- 워크스페이스 협업이 필요하면 membership 테이블을 먼저 만들고 정책에 exists 조건을 추가합니다.
- 삭제는 첫 버전에서 hard delete보다 archived 상태를 우선 검토합니다.`;
  const experimentLines =
    experiments.length > 0
      ? experiments
          .slice(0, 5)
          .map((experiment) => `- ${experiment.name}: ${experiment.success_metric || "성공 지표 미정"}`)
          .join("\n")
      : "- 첫 구현 전 성공 지표를 가진 실험을 1개 이상 정의합니다.";

  return `# 첫 제작 뼈대 안내서: ${idea.name}

이 문서는 빈 저장소 또는 새 서비스 디렉터리에서 첫 제작 범위를 만들 때 쓰는 실행 지시입니다. 구현 범위는 ${state.next_evidence || "추가 확인 내용"}을 확인하는 데 필요한 최소 흐름으로 제한합니다.

## 제품 입력

- 한 줄 가치: ${idea.one_liner || "미정"}
- 대상 사용자: ${idea.target_user || "미정"}
- 구매자: ${idea.buyer || "미정"}
- 현재 단계: ${stageLabels[state.stage]}
- 현재 판단: ${decisionLabels[state.decision]}
- 제작 형태: ${productSurface.label}
- 정보 구조 기준: ${productSurface.iaHint}
- 첫 제작 형태: ${productSurface.firstBuild}
- 제작 기준: ${productSurface.harnessFocus}
- 외부 전달 기준: ${productSurface.handoffHint}
- 추천 백엔드: ${topBackend}

## 권장 스택

- Next.js App Router
- React + TypeScript
- Tailwind CSS
- lucide-react icons
- Vercel Preview/Production
- ${topBackend}

## 제작 기준

${productSurfaceMarkdown(productSurface)}

## 파일 트리

\`\`\`txt
app/
  layout.tsx
  page.tsx
  records/
    [id]/
      page.tsx
  settings/
    page.tsx
  api/
    records/
      route.ts
components/
  app-shell.tsx
  step-navigation.tsx
  record-intake-form.tsx
  record-workbench.tsx
  evidence-panel.tsx
  artifact-panel.tsx
  permission-notice.tsx
lib/
  auth/
    session.ts
  backend/
    client.ts
    server.ts
  validation/
    record-schema.ts
  analytics/
    events.ts
scripts/
  smoke-production.ps1
  smoke-browser.mjs
docs/
  ENVIRONMENT.md
  RELEASE_CHECKLIST.md
\`\`\`

## 라우트 책임

- \`/\`: 오늘의 다음 행동, 최근 기록, 새 기록 CTA
- \`/records/[id]\`: 기록 상세, 점수/상태, 근거, 제작 자료, 추가 확인 내용
- \`/settings\`: 계정, 워크스페이스, 데이터 삭제, 권한 경계
- \`/api/records\`: 서버에서 입력 검증 후 저장. 서버 비밀값이 필요한 외부 호출은 여기서만 실행

## 환경변수

| 이름 | 노출 | 용도 |
| --- | --- | --- |
${envLines}

${backendRules}

## 첫 구현 순서

1. AppShell과 단계형 좌측 메뉴를 만듭니다.
2. 새 기록 입력 폼을 만들고 필수 필드 검증을 붙입니다.
3. ${topBackend} 읽기/쓰기 클라이언트 경계를 나눕니다.
4. 기록 저장 후 목록과 상세가 새로고침 없이 갱신되게 합니다.
5. 빈 상태, 로딩, 저장 실패, 권한 없음, 읽기 전용 상태를 만듭니다.
6. 제작 자료/근거 패널은 mock data로 시작하고 저장 계약이 정해지면 연결합니다.
7. 모바일 390px에서 메뉴가 작업을 가리지 않게 합니다.
8. Preview 배포 후 핵심 저장/조회 스모크를 통과시킵니다.

## 검증 계획

${experimentLines}

## 완료 기준

- 사용자가 새 기록을 만들고 저장 성공을 확인합니다.
- 저장된 기록을 다시 열 수 있습니다.
- 권한 없는 쓰기 시도가 차단됩니다.
- 환경변수 공개/서버 전용 경계가 문서화됩니다.
- \`pnpm lint\`, \`pnpm typecheck\`, \`pnpm build\`가 통과합니다.
- Preview URL과 Production URL, Vercel inspect 링크, 롤백 기준이 완료 보고에 남습니다.

## 제작 도구 실행 안내

위 파일 트리와 완료 기준만 구현합니다. ${scaffoldExclusions} 변경 후에는 파일 목록, 검증 명령, 남은 리스크, 배포 URL, 롤백 조건을 보고합니다.
`;
}
