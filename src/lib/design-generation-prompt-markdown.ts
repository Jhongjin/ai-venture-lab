import { resolveProductSurfaceForIdea } from "@/lib/product-surface";
import { buildSurfaceScreenOutline, implementationSurfaceTaskGuidance } from "@/lib/product-surface-implementation";
import type { Experiment, Idea, Risk } from "@/lib/venture-data";
import { decisionLabels, riskSeverityLabels, stageLabels } from "@/lib/workbench-labels";

type DesignGenerationPromptState = Pick<
  Idea,
  "stage" | "decision" | "signal" | "next_evidence" | "product_surface"
>;

type DesignGenerationBackendCandidate = {
  label: string;
};

export function buildDesignGenerationPromptMarkdown({
  idea,
  state,
  risks,
  experiments,
  backendCandidateScores,
}: {
  idea: Idea;
  state: DesignGenerationPromptState;
  risks: Risk[];
  experiments: Experiment[];
  backendCandidateScores: DesignGenerationBackendCandidate[];
}) {
  const productSurface = resolveProductSurfaceForIdea(idea, state);
  const surfaceGuidance = implementationSurfaceTaskGuidance[productSurface.key];
  const surfaceOpening =
    productSurface.key === "web_site"
      ? "아래 내용을 기반으로 전환 가능한 랜딩/웹사이트 첫 화면과 신청 흐름을 생성하세요. 방문자가 제안을 이해하고 신청 또는 예약까지 끝낼 수 있어야 합니다."
      : "아래 내용을 기반으로 실제 앱 첫 화면과 핵심 업무 흐름을 생성하세요. 마케팅 랜딩 페이지가 아니라, 사용자가 바로 입력하고 저장하고 다음 행동으로 넘어가는 제품 화면이어야 합니다.";
  const screenOutline = buildSurfaceScreenOutline(productSurface, surfaceGuidance);
  const topBackend = backendCandidateScores[0]?.label ?? "Supabase";
  const riskLines =
    risks.length > 0
      ? risks
          .slice(0, 5)
          .map((risk) => `- ${risk.title}: ${riskSeverityLabels[risk.severity]} / ${risk.mitigation || "완화 방안 미정"}`)
          .join("\n")
      : "- 아직 연결된 리스크가 없습니다. 개인정보, 권한, 결제, 규제 리스크를 기본 상태로 고려하세요.";
  const experimentLines =
    experiments.length > 0
      ? experiments
          .slice(0, 4)
          .map((experiment) => `- ${experiment.name}: ${experiment.success_metric || "성공 지표 미정"}`)
          .join("\n")
      : "- 아직 실험이 없습니다. 첫 화면에서 사용자가 핵심 행동을 완료했는지 측정할 수 있게 설계하세요.";

  return `# 디자인 생성 지시: ${idea.name}

${surfaceOpening}

## 제품 맥락

- 앱 이름: ${idea.name}
- 한 줄 설명: ${idea.one_liner || "미정"}
- 대상 사용자: ${idea.target_user || "미정"}
- 구매자/승인자: ${idea.buyer || "미정"}
- 현재 단계: ${stageLabels[state.stage]}
- 현재 판단: ${decisionLabels[state.decision]}
- 추천 백엔드: ${topBackend}
- 제작 형태: ${productSurface.label}
- 정보 구조 기준: ${productSurface.iaHint}
- 첫 제작 형태: ${productSurface.firstBuild}
- 제작 기준: ${productSurface.harnessFocus}
- 외부 전달 기준: ${productSurface.handoffHint}
- 다음 검증 증거: ${state.next_evidence || "미정"}

## 사용자가 해결하려는 문제

${state.signal || "사용자의 반복 문제, 현재 대안, 비용/시간 손실을 화면 구조에서 드러내세요."}

## 생성할 화면

${screenOutline}

## UX 구조

- 왼쪽에는 순서 기반 메뉴 또는 단계형 사이드바를 둡니다.
- 오른쪽에는 현재 단계의 입력 폼, 결과, 저장 상태만 보여줍니다.
- 긴 스크롤보다 탭, 세그먼트, 단계 전환을 우선합니다.
- 사용자는 위아래로 왕복하지 않고 다음 행동을 찾을 수 있어야 합니다.
- 빈 상태에는 기능 설명 대신 사용자가 바로 할 수 있는 첫 행동을 배치합니다.

## 컴포넌트 요구사항

- 버튼에는 가능한 경우 아이콘과 짧은 동사를 함께 사용합니다.
- 상태는 배지, 체크, 경고, 진행률로 구분합니다.
- 표/리스트는 반복 업무를 빠르게 스캔할 수 있게 촘촘하지만 답답하지 않게 설계합니다.
- 카드 반경은 8px 이하로 절제합니다.
- 모바일에서는 단일 컬럼, 하단 고정 primary action, 접을 수 있는 메뉴를 사용합니다.
- 텍스트가 버튼이나 카드 밖으로 넘치지 않게 줄바꿈과 min/max width를 안정적으로 잡습니다.

## 시각 스타일

- 운영 도구처럼 조용하고 명확한 UI를 만듭니다.
- 과한 히어로, 장식용 그라디언트, 추상 배경 오브젝트, 의미 없는 일러스트를 피합니다.
- 색상은 상태와 우선순위를 구분하는 데 사용하고, 한 가지 색조만 반복하지 않습니다.
- 접근성 대비, 포커스 상태, 키보드 이동이 가능한 구조로 만듭니다.

## 데이터와 권한

- 백엔드 후보: ${topBackend}
- 사용자는 자기 기록 또는 워크스페이스 기록만 볼 수 있다고 가정합니다.
- 저장 성공, 저장 실패, 권한 없음, 읽기 전용, 로딩, 빈 상태를 모두 설계합니다.
- 민감 데이터가 있다면 수집 목적, 보관, 삭제 경로를 화면에 포함합니다.

## 리스크

${riskLines}

## 검증 계획

${experimentLines}

## 생성 도구별 출력 지시

### v0 또는 React 코드 생성 도구

- Next.js App Router, React, TypeScript, Tailwind CSS 기준으로 생성합니다.
- lucide-react 아이콘을 사용합니다.
- shadcn/ui 계열 컴포넌트를 쓰되, 불필요한 랜딩 페이지 섹션은 만들지 않습니다.
- 실제 데이터 연결 전에는 명확한 mock data와 loading/error/empty state를 포함합니다.

### Stitch/Figma/시각 디자인 생성 도구

- 데스크톱 1440px와 모바일 390px 시안을 함께 만듭니다.
- 첫 화면에서 제품의 실제 업무 화면이 보여야 합니다.
- 입력 폼, 결과 패널, 상태 메시지, 리스트/테이블, 권한/빈 상태를 포함합니다.

## 제작 자료 검수 기준

- 첫 화면에서 ${idea.target_user || "사용자"}가 무엇을 해야 하는지 5초 안에 이해됩니다.
- 핵심 입력부터 저장 완료까지 한 흐름이 보입니다.
- 저장/오류/권한/빈 상태가 누락되지 않았습니다.
- 모바일에서 버튼과 텍스트가 겹치지 않습니다.
- 이 화면만 보고 개발자가 첫 제작 범위를 구현할 수 있습니다.
`;
}
