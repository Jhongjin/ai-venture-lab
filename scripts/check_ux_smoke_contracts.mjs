import { readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();

const contracts = [
  {
    file: "src/components/step2-score-handoff-bridge.tsx",
    tokens: [
      'data-smoke="step2-score-handoff-bridge"',
      "사업성 평가는 STEP 3 검증 계획의 기준입니다",
      "검증 계획과 시장 점검 기준",
    ],
  },
  {
    file: "src/components/step3-validation-gate-bridge.tsx",
    tokens: [
      'data-smoke="step3-validation-gate-bridge"',
      "검증 계획과 시장 근거가 저장되면 STEP 4가 열립니다",
      "직접 인터뷰나 테스트 결과는 실제 결과가 있을 때만",
    ],
  },
  {
    file: "src/components/step4-validation-bundle-bridge.tsx",
    tokens: [
      'data-smoke="step4-validation-bundle-bridge"',
      "검증 자료는 STEP 5 제작 패키지의 입력 근거입니다",
      "다음 사용처",
    ],
  },
  {
    file: "src/components/workbench-current-action.tsx",
    tokens: [
      'data-smoke="workbench-current-action"',
      'data-smoke="workbench-current-action-checklist"',
      "지금 할 일",
    ],
  },
  {
    file: "src/components/idea-workbench.tsx",
    tokens: ["결과물 형태 확인", "검증 계획 확인", "제작 패키지 저장", "T-001 확인"],
  },
  {
    file: "scripts/smoke_browser_auth.mjs",
    tokens: [
      '[data-smoke="workbench-current-action"]',
      '[data-smoke="step2-score-handoff-bridge"]',
      '[data-smoke="step3-validation-gate-bridge"]',
      '[data-smoke="step4-validation-bundle-bridge"]',
      "작업 순서 자동 만들기",
      "사업성 평가 저장",
    ],
  },
  {
    file: "src/components/first-use-result-preview.tsx",
    tokens: [
      'data-smoke="first-use-result-preview"',
      "AI 아이디어 후보 3개",
      "결과물 형태와 개발 방식",
      "저장 완료 전에는 다음 단계 버튼이 잠긴 상태",
    ],
  },
  {
    file: "src/components/step5-package-review.tsx",
    tokens: [
      'data-smoke="step5-review-save-focus"',
      "1. 만들 결과",
      "2. 첫 제작 범위",
      "3. 첫 작업",
    ],
  },
  {
    file: "src/components/step8-action-highlights.tsx",
    tokens: [
      'data-smoke="step8-simple-review-details"',
      "완료/다음/판단 설명 보기",
      'dataSmoke="step8-simple-review"',
    ],
  },
  {
    file: "scripts/smoke_browser_auth.mjs",
    tokens: ['[data-smoke="first-use-result-preview"]'],
  },
  {
    file: "scripts/smoke_build_sync_tokens.mjs",
    tokens: ['[data-smoke="step8-simple-review-details"]', '[data-smoke="workbench-current-action"]', "T-001 확인"],
  },
  {
    file: "scripts/smoke_billing_credits.mjs",
    tokens: [
      '[data-smoke="step5-execution-package-focus"]',
      "처음에는 세 가지만 확인합니다",
      "T-001이 첫 작업인지",
    ],
  },
];

function fail(message) {
  throw new Error(`UX smoke contract check failed: ${message}`);
}

async function main() {
  for (const contract of contracts) {
    const body = await readFile(path.join(root, contract.file), "utf8");

    for (const token of contract.tokens) {
      if (!body.includes(token)) {
        fail(`${contract.file} is missing ${JSON.stringify(token)}`);
      }
    }
  }

  console.log("UX smoke contract check passed.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
