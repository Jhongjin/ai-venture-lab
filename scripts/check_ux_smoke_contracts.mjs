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
      'data-smoke="workbench-save-gate-note"',
      "지금 할 일",
    ],
  },
  {
    file: "src/components/idea-workbench.tsx",
    tokens: [
      "getWorkbenchOperatorFocusCopy",
      "getWorkbenchOperatorActionItems",
      "getWorkbenchOperatorGateNote",
      "Claude Code 연결 파일을 준비했습니다. 연결 도구 또는 record-progress 명령",
    ],
  },
  {
    file: "src/components/workbench-form-controls.tsx",
    tokens: [
      'data-smoke="draft-document-save-boundary"',
      "isSaved ? <CheckCircle2",
      "복사는 외부 문서나 메신저에 붙여 넣을 때 쓰는 보조 동작입니다.",
      "이 문서는 저장되어 상단 진행 상태에 반영되었습니다.",
    ],
  },
  {
    file: "src/lib/workbench-current-action-copy.ts",
    tokens: [
      "결과물 형태 확인",
      "검증 계획 확인",
      "제작 패키지 저장",
      "T-001 확인",
      "사업성 평가를 저장하면 STEP 3 검증 계획으로 이어집니다.",
      "작업 순서를 저장하면 STEP 7 최종 실행이 열립니다.",
    ],
  },
  {
    file: "scripts/smoke_browser_auth.mjs",
    tokens: [
      '[data-smoke="workbench-current-action"]',
      '[data-smoke="workbench-save-gate-note"]',
      '[data-smoke="step2-score-handoff-bridge"]',
      '[data-smoke="step3-validation-gate-bridge"]',
      '[data-smoke="step4-validation-bundle-bridge"]',
      "작업 순서 자동 만들기",
      "사업성 평가 저장",
    ],
  },
  {
    file: "src/components/step6-work-order-header.tsx",
    tokens: ['data-smoke="step6-save-does-not-run"', "작업 순서를 저장해도 외부 도구가 바로 실행되지 않습니다"],
  },
  {
    file: "src/components/step6-execution-bridge.tsx",
    tokens: [
      'data-smoke="step6-current-action"',
      'data-smoke="step6-step7-boundary"',
      "T-001 이름과 완료 기준만 먼저 보고",
      "STEP 6에서 끝낼 일",
      "연결 파일 받기, 설치 명령과 확인 명령 복사, START 파일로 첫 작업 시작",
    ],
  },
  {
    file: "src/components/step6-run-list.tsx",
    tokens: [
      'data-smoke="step6-status-does-not-move"',
      "상태 변경은 실제 진행 기록용이며 단계 이동 버튼이 아닙니다.",
    ],
  },
  {
    file: "src/components/first-use-result-preview.tsx",
    tokens: [
      'data-smoke="first-use-result-preview"',
      "AI 아이디어 후보 3개",
      "결과물 형태와 개발 방식",
      "무엇을 만들지는 결과물 형태, 어디서 만들지는 개발 방식",
      "저장 완료 전에는 다음 단계 버튼이 잠긴 상태",
    ],
  },
  {
    file: "src/components/recommended-idea-build-direction.tsx",
    tokens: [
      'data-smoke="recommended-build-direction-sentence"',
      "저장될 제작 방향",
      "결과물 형태는 무엇을 만들지, 개발 방식은 어디서 만들지를 정합니다.",
      "실제 연결 파일은 STEP 7에서만 받습니다.",
    ],
  },
  {
    file: "src/components/product-surface-selector.tsx",
    tokens: [
      'data-smoke="product-surface-selector"',
      "예: 모바일 앱으로 만들고, Cursor로 개발합니다.",
      "이 화면에서는 앞부분인 결과물 형태만 확인합니다.",
    ],
  },
  {
    file: "src/components/generated-idea-slot-card.tsx",
    tokens: [
      'data-smoke="generated-idea-keep-does-not-save"',
      "킵은 비교 표시만 합니다",
      "저장은 아래 킵한 후보로 아이디어 정리하기 버튼에서 합니다",
    ],
  },
  {
    file: "src/components/idea-extraction-action-panel.tsx",
    tokens: [
      'data-smoke="idea-regenerate-does-not-save"',
      "다른 후보 더 확인하기는 저장이나 단계 이동 없이 후보만 바꿉니다",
      "최종 저장은 킵한 후보로 아이디어 정리하기에서만 합니다",
    ],
  },
  {
    file: "src/components/recommended-idea-actions.tsx",
    tokens: [
      'data-smoke="recommended-edit-does-not-save"',
      "수정은 내용만 바꾸는 보조 행동입니다",
      "저장과 다음 단계 시작은 이 아이디어 저장하고 검증 시작 버튼에서만 진행됩니다",
    ],
  },
  {
    file: "src/components/first-use-idea-intake.tsx",
    tokens: [
      'data-smoke="first-use-one-sentence"',
      'data-smoke="first-use-final-output"',
      "처음이라면 메모를 그대로 붙이고 이 내용으로 아이디어 정리하기만 누르세요.",
      "제작 패키지, 작업 순서, STEP 7 연결 파일까지 이어집니다",
    ],
  },
  {
    file: "src/components/first-use-fast-path.tsx",
    tokens: [
      'data-smoke="first-use-fast-path"',
      "2. 버튼 누르기",
      "이 내용으로 아이디어 정리하기로 후보 3개",
    ],
  },
  {
    file: "src/components/first-use-input-status.tsx",
    tokens: [
      'data-smoke="first-use-current-action"',
      "후보 한 건을 저장하면 실행 보드에서 STEP 2 사업성 평가가 열립니다.",
      "마음에 드는 한 건만 저장하면 실행 보드에서 STEP 2가 이어집니다.",
    ],
  },
  {
    file: "src/components/first-use-source-textarea.tsx",
    tokens: [
      'data-smoke="first-use-short-input-ok"',
      "짧아도 됩니다.",
      "회의록 한 줄, GPT 대화 일부, 반복 업무 메모",
      "AI가 후보와 검증 질문으로 정리합니다.",
    ],
  },
  {
    file: "src/components/step5-package-review.tsx",
    tokens: [
      'data-smoke="step5-review-save-focus"',
      'data-smoke="step5-save-does-not-move"',
      "1. 만들 결과",
      "2. 첫 제작 범위",
      "3. 첫 작업",
      "저장은 STEP 6으로 자동 이동하지 않고",
    ],
  },
  {
    file: "src/components/step5-package-current-action.tsx",
    tokens: [
      'data-smoke="step5-package-current-action"',
      'data-smoke="step5-ai-prepares-user-confirms"',
      "3. 저장 후 이동",
      "저장 완료 후 하단 다음 단계 버튼으로 STEP 6 이동",
      "AI가 먼저 기획서, 제작 범위, 첫 작업을 정리합니다",
      "사용자는 요약을 확인하고 저장만 하면 됩니다",
      "문서 보관용이 아니라 외부 개발",
      "도구나 내부 개발을 시작하기 위한 실행 패키지입니다.",
    ],
  },
  {
    file: "src/components/step5-execution-package-value-grid.tsx",
    tokens: [
      'data-smoke="step5-execution-package-value-grid"',
      "실행 패키지",
      "개발 시작 기준",
      "제작 범위 잠금",
      "다음 단계 연결",
      "최종 실행에서 외부 개발 도구 파일로 넘깁니다.",
    ],
  },
  {
    file: "src/components/step8-action-highlights.tsx",
    tokens: [
      'data-smoke="step8-simple-review-details"',
      'data-smoke="step8-primary-action-now"',
      "오늘 확인할 것",
      "완료/다음/판단 설명 보기",
      'dataSmoke="step8-simple-review"',
    ],
  },
  {
    file: "src/components/step8-next-task-focus.tsx",
    tokens: [
      'data-smoke="step8-next-task-focus"',
      "오늘 확인할 것",
      "실제 실행은 STEP 7 또는 외부 도구에서 이어갑니다.",
      "여기서는 완료 보고 반영 여부만 봅니다.",
    ],
  },
  {
    file: "src/components/step8-decision-guidance.tsx",
    tokens: ['data-smoke="step8-visible-action-sequence"', "확인 순서", "완료 상태 → 다음 행동 → 오늘 판단"],
  },
  {
    file: "src/components/step8-current-decision-strip.tsx",
    tokens: ['data-smoke="step8-current-decision-strip"', "완료 상태", "다음 행동", "오늘 판단"],
  },
  {
    file: "src/components/step8-learning-header.tsx",
    tokens: [
      'data-smoke="step8-confirm-not-run-header"',
      "STEP 8은 새 실행을 시작하는 화면이 아닙니다.",
      "완료 보고를 확인하고 다음 판단 하나만 고르는 화면입니다.",
    ],
  },
  {
    file: "src/components/final-execution-sync-status-card.tsx",
    tokens: [
      'data-smoke="final-execution-sync-meaning"',
      "완료 보고 한 번이 작업 상태, 다음 작업, STEP 8 판단 카드까지 같이 바꿉니다.",
    ],
  },
  {
    file: "src/components/step8-sync-brief.tsx",
    tokens: [
      'data-smoke="step8-sync-meaning"',
      "완료 보고가 들어오면 작업표 상태와 이 요약이 같이 바뀝니다.",
    ],
  },
  {
    file: "src/components/step8-progress-section.tsx",
    tokens: [
      'data-smoke="step8-empty-primary-action"',
      "먼저 STEP 7에서 연결 파일로 첫 제작 작업을 시작하세요.",
      "완료된 것, 다음 작업, 오늘 판단만 보여줍니다.",
    ],
  },
  {
    file: "src/lib/step8-learning-summary.ts",
    tokens: [
      "전체 목록은 진행 순서 확인용으로만 봅니다.",
      "다음 판단은 위의 한눈 요약에서 정합니다.",
      "최종 실행에서 첫 제작 작업을 넘기면 완료된 것, 남은 것, 지금 판단할 것이 여기에 표시됩니다.",
      "실제 실행은 STEP 7/외부 도구에서 이어가고, 여기서는 완료 보고 반영 여부만 확인하세요.",
      "완료 보고가 반영되면 다음 판단으로 넘어갈 수 있습니다.",
    ],
  },
  {
    file: "src/components/step8-primary-cta.tsx",
    tokens: [
      'data-smoke="step8-primary-cta-confirm-only"',
      'data-smoke="step8-report-copy-secondary"',
      "지금은 이 화면에서 확인만 하고, 실제 실행은 STEP 7에서 계속합니다.",
      "리포트 복사는 보관이나 공유용이며 단계 이동 버튼이 아닙니다.",
    ],
  },
  {
    file: "src/components/final-execution-action-banner.tsx",
    tokens: [
      'data-smoke="final-execution-run-place-one-liner"',
      "연결 파일을 실제 앱 폴더 최상단으로 옮긴 뒤",
      "그 프로젝트 루트",
      "다운로드 폴더나 AI Venture Lab 폴더에서는",
      'data-smoke="final-execution-simple-mode-note"',
      "실행만 하기:",
      'data-smoke="final-execution-button-order"',
      "버튼 순서:",
      "연결 파일 받기 - 설치 명령 복사 - 확인 명령 복사 - START 파일 열기",
    ],
  },
  {
    file: "src/components/final-execution-simple-path.tsx",
    tokens: [
      'data-smoke="final-execution-simple-path"',
      "아직 앱 폴더가 없다면 먼저 새 폴더를 만들고",
      "결과에 T-001 첫 작업이 보이면 성공입니다.",
    ],
  },
  {
    file: "src/components/final-execution-command-copy-blocks.tsx",
    tokens: [
      'data-smoke="final-execution-command-sequence"',
      "복사 버튼은 명령을 클립보드에 넣는 역할만 합니다",
      "확인 명령에서 T-001이 보인 뒤에만 START 파일을 열어 첫 작업을 시작하세요.",
      "도구 설정 복사",
    ],
  },
  {
    file: "src/components/final-execution-tool-guide.tsx",
    tokens: [
      "확인 명령으로 T-001 첫 작업이 읽히는지",
      "확인 명령 결과에 T-001이 보이면 설치 완료입니다.",
    ],
  },
  {
    file: "src/components/final-execution-tool-detail-guide.tsx",
    tokens: [
      'data-smoke="final-execution-detail-guide"',
      "T-001 첫 작업이 읽히는지",
      "내용은 확인 명령에서 T-001을 본 뒤",
    ],
  },
  {
    file: "src/components/final-execution-setup-checks.tsx",
    tokens: [
      'data-smoke="final-execution-folder-check-question"',
      'data-smoke="final-execution-check-failure-recovery"',
      "아직 앱 프로젝트가 없다면 새 폴더를 만든 뒤 그 폴더에서 실행하세요.",
      "확인 명령 실패",
      "외부 프로젝트 루트로 이동한 뒤 확인 명령만 다시 실행",
    ],
  },
  {
    file: "src/components/final-execution-tool-start-mode-card.tsx",
    tokens: [
      'data-smoke="final-execution-start-prompt-target"',
      "START 파일 붙여넣을 곳",
      "에이전트 채팅 입력창",
      "터미널 에이전트의 첫 입력창",
    ],
  },
  {
    file: "src/lib/build-delivery.ts",
    tokens: [
      "확인 명령에서 T-001이 보이면 Cursor를 다시 열어 ai-venture-lab MCP 서버를 확인합니다.",
      "확인 명령에서 T-001이 보이면 Codex 작업 세션에서 같은 프로젝트를 엽니다.",
      "확인 명령에서 T-001이 보이면 Claude Code를 같은 프로젝트 루트에서 엽니다.",
      "확인 명령에서 T-001이 보이면 Antigravity에서 같은 프로젝트를 엽니다.",
    ],
  },
  {
    file: "src/lib/external-tool-handoff-markdown.ts",
    tokens: [
      "확인 명령 결과에 T-001이 보이면 Cursor를 새로고침하거나 다시 열고",
      "연결 도구가 보이면",
      "T-001이 보이면 Codex에서 같은 프로젝트 폴더를 열고",
      "T-001이 보이면 Claude Code를 같은 프로젝트 루트에서 열고",
      "T-001이 보이면 Antigravity에서 같은 프로젝트 폴더를 열고",
    ],
  },
  {
    file: "src/lib/external-tool-setup-scripts.ts",
    tokens: [
      "Only after that command shows T-001, reopen Cursor",
      "After it shows T-001, open this project in Codex",
      "After it shows T-001, open this project in ${toolLabel}",
    ],
  },
  {
    file: "scripts/smoke_browser_auth.mjs",
    tokens: ['[data-smoke="first-use-result-preview"]', '[data-smoke="first-use-short-input-ok"]'],
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
