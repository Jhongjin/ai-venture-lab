import { resolveProductSurfaceForIdea } from "@/lib/product-surface";
import type { Idea, OrchestrationRun } from "@/lib/venture-data";

type DesignBriefState = Pick<Idea, "next_evidence" | "product_surface">;

export function buildDesignBriefMarkdown({
  idea,
  state,
  runs,
}: {
  idea: Idea;
  state: DesignBriefState;
  runs: OrchestrationRun[];
}) {
  const productSurface = resolveProductSurfaceForIdea(idea, state);
  const designRun = runs.find((run) => run.phase === "design");

  return `# 디자인 기준: ${idea.name}

## 제품 맥락

- 대상 사용자: ${idea.target_user || "미정"}
- 구매자: ${idea.buyer || "미정"}
- 핵심 가치: ${idea.one_liner || "미정"}
- 추가 확인 내용: ${state.next_evidence || "미정"}
- 제작 형태: ${productSurface.label}
- 정보 구조 기준: ${productSurface.iaHint}
- 첫 제작 형태: ${productSurface.firstBuild}
- 디자인 방향 기준: ${productSurface.promptFocus}
- 외부 전달 기준: ${productSurface.handoffHint}

## UX 원칙

- 첫 화면은 설명 페이지가 아니라 사용자가 바로 실행할 수 있는 작업 화면입니다.
- 흐름은 왼쪽 순서 메뉴와 오른쪽 입력/제작 자료 패널처럼 현재 단계와 다음 행동을 분리합니다.
- 긴 스크롤에 의존하지 않고, 사용자가 위아래로 왕복하지 않아도 되게 합니다.
- primary action은 각 화면에서 하나만 두고, 보조 행동은 낮은 위계로 둡니다.
- 민감 데이터 입력 전 목적, 보관, 삭제 경로를 먼저 보여줍니다.

## 핵심 여정

1. 사용자가 ${idea.one_liner || "핵심 문제"}를 시작합니다.
2. 필수 입력만 채우고 결과 또는 제작 자료를 생성합니다.
3. 오류, 빈 상태, 권한 없음, 저장 완료 상태가 명확하게 보입니다.
4. 추가 확인 내용을 검토하거나 다음 단계로 이동합니다.

## 화면 목록

- 진입/대시보드
- 핵심 입력 폼
- 결과/제작 자료 검토
- 저장 완료 및 다음 행동
- 빈 상태, 로딩, 오류, 권한 없음, 읽기 전용
- 모바일 단일 컬럼

## 디자인 제작 자료

${designRun?.output || "디자인 실행 결과가 아직 없습니다. 화면 흐름, 상태, 모바일 제약을 먼저 작성하세요."}

## 검수 체크

- 사용자가 첫 가치까지 도달하는 클릭 수가 최소화되었습니다.
- 모바일에서 입력 필드, 버튼, 긴 텍스트가 겹치지 않습니다.
- 색상은 상태와 다음 행동을 구분하는 데 쓰입니다.
- 라벨, 오류 메시지, 저장 결과가 화면 안에서 바로 이해됩니다.
- 접근성 대비와 키보드 이동을 확인합니다.
`;
}
