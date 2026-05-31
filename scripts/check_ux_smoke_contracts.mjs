import { readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();

const contracts = [
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
    tokens: ['[data-smoke="step8-simple-review-details"]'],
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
