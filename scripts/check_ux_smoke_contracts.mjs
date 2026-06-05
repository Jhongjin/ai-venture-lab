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
      "buildWorkbenchCurrentActionDisplayState",
      'data-smoke="market-scan-source-boundary"',
      "추정 초안",
      "공개 출처가 없습니다. 웹 조사 다시 시도로 출처를 붙인 뒤 제작 패키지 근거로 쓰세요.",
    ],
  },
  {
    file: "src/lib/market-scan.ts",
    tokens: [
      "getPublicMarketScanSources",
      "buildMarketScanReviewState",
      "웹 출처를 붙이지 못해 사용자 입력 기반 추정으로 준비됐습니다.",
      "제작 패키지 근거로 쓰기 전, 웹 조사 다시 시도로 공개 출처를 붙이는 것이 안전합니다.",
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
      "buildWorkbenchCurrentActionDisplayState",
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
    tokens: [
      'data-smoke="step6-save-does-not-run"',
      "T-001 이름과 완료 기준 확인",
      "단계 결과와 상태 버튼은 실제",
      "작업 순서를 저장해도 외부 도구가 바로 실행되지 않습니다",
    ],
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
      "후보 한 건을 저장하면 STEP 2가 열립니다.",
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
      "처음이라면 메모만 붙이고 AI 정리만 누르세요.",
      "저장한 후보는 다음 단계와 제작 패키지로 이어집니다.",
    ],
    orderedTokens: [
      'data-smoke="first-use-one-sentence"',
      "<FirstUseInputStatus",
      "<FirstUseSourceTextarea",
      "<FirstUseInputExamples",
      "<FirstUseFastPath",
      "<FirstUseResultPreview",
    ],
  },
  {
    file: "src/components/idea-extraction-left-panel.tsx",
    tokens: [
      'data-smoke="idea-extraction-left-panel"',
      "IdeaExtractionInputSurface",
      "IdeaExtractionActionPanel",
      "IdeaExtractionFlowSteps",
    ],
    orderedTokens: [
      "<IdeaExtractionInputSurface",
      "<IdeaExtractionActionPanel",
      "<IdeaExtractionNotices",
      "<IdeaExtractionFlowSteps",
    ],
  },
  {
    file: "src/components/first-use-fast-path.tsx",
    tokens: [
      'data-smoke="first-use-fast-path"',
      "2. 버튼 누르기",
      "이 내용으로 아이디어 정리하기로 후보 3개",
      "첫 검증 질문 받기",
      "후보 한 건을 저장한 뒤에만 하단 다음 단계 버튼이 열리고",
    ],
  },
  {
    file: "src/components/first-use-input-status.tsx",
    tokens: [
      'data-smoke="first-use-current-action"',
      "아직 없으면 AI가 아이디어 도출하기",
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
      'data-smoke="step5-review-details-optional"',
      'data-smoke="step5-review-bridge-optional"',
      "지금 확인할 것",
      "3개만 확인",
      "맞으면 저장.",
      "만들 것",
      "결과물/개발 방식",
      "범위",
      "포함/제외",
      "첫 작업",
      "T-001",
      "저장해도 이동하지 않습니다.",
      "이동은 하단 다음 버튼입니다.",
      "요약 보기",
      "연결 보기",
      "보완 메모",
      "바꿀 점만 적으세요.",
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
      "도구 전달 자료",
      "Cursor, Codex, Claude Code, Antigravity가 읽을 첫 지시문",
      "다음 단계 연결",
      "최종 실행에서 외부 개발 도구 파일로 넘깁니다.",
    ],
  },
  {
    file: "src/components/step8-action-highlights.tsx",
    tokens: [
      'data-smoke="step8-simple-review-details"',
      'data-smoke="step8-primary-action-now"',
      'data-smoke="step8-one-sentence-outcome"',
      'data-smoke="step8-next-judgment-brief"',
      'data-smoke="step8-external-completion-bridge"',
      "오늘 확인할 것",
      "요약 보기",
      "오늘 답할 질문",
      'dataSmoke="step8-simple-review"',
    ],
  },
  {
    file: "src/components/step8-next-task-focus.tsx",
    tokens: [
      'data-smoke="step8-next-task-focus"',
      'data-smoke="step8-all-tasks-complete-focus"',
      'data-smoke="step8-no-next-task-review-focus"',
      "이어 할 것",
      "남은 작업 없음",
      "완료 근거와 오늘 판단만 봅니다.",
      "상태만 확인",
      "막힘/건너뜀/누락만 봅니다.",
      "실행은 STEP 7.",
      "여기서는 반영만 봅니다.",
    ],
  },
  {
    file: "src/components/step8-decision-guidance.tsx",
    tokens: [
      'data-smoke="step8-single-decision-rule"',
      'data-smoke="step8-decision-options"',
      'data-smoke="step8-action-ladder-details"',
      "순서 보기",
      "후보 보기",
    ],
  },
  {
    file: "src/components/step8-current-decision-strip.tsx",
    tokens: ['data-smoke="step8-current-decision-strip"', "완료된 것", "이어 할 것", "지금 판단"],
  },
  {
    file: "src/components/step8-learning-header.tsx",
    tokens: [
      'data-smoke="step8-confirm-not-run-header"',
      "완료된 것, 이어 할 것, 지금 판단만 봅니다.",
      "실행은 STEP 7.",
      "여기서는 반영과 판단만 확인합니다.",
    ],
  },
  {
    file: "src/components/final-execution-sync-status-card.tsx",
    tokens: [
      'data-smoke="final-execution-sync-meaning"',
      "완료 보고 한 번이 작업 상태, 다음 작업, STEP 8 판단 카드까지 같이 바꿉니다.",
      "진행 JSON 붙여넣기는 실패했을 때만 엽니다.",
    ],
  },
  {
    file: "src/components/step8-sync-brief.tsx",
    tokens: [
      'data-smoke="step8-sync-one-line"',
      'data-smoke="step8-sync-meaning"',
      "최근 확인",
      "완료 보고가 들어오면 작업표와 요약이 같이 바뀝니다.",
      "사용자는 새 실행을 시작하지 않습니다.",
    ],
  },
  {
    file: "src/components/step8-progress-section.tsx",
    tokens: [
      'data-smoke="step8-progress-one-line-summary"',
      "완료 {completedCount}/{totalCount || 0} · 다음",
      "상태만 확인",
      'data-smoke="step8-empty-primary-action"',
      "먼저 STEP 7에서 연결 파일로 첫 제작 작업을 시작하세요.",
      "완료 보고가 들어오면 완료된 것, 이어 할 것, 지금 판단만 봅니다.",
    ],
  },
  {
    file: "src/lib/step8-learning-summary.ts",
    tokens: [
      "전체 목록은 필요할 때 엽니다.",
      "완료 근거와 오늘 판단만 봅니다.",
      "최종 실행에서 첫 제작 작업을 넘기면 완료된 것, 이어 할 것, 지금 판단이 여기에 표시됩니다.",
      "실행은 STEP 7에서 계속합니다.",
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
    file: "src/components/final-execution-package-panel.tsx",
    tokens: [
      'data-smoke="final-execution-primary-download-cue"',
      "연결 파일 받기만 누르세요.",
      "설치 확인 뒤에만 START 지시문 복사와 보관용 문서 받기를 씁니다.",
      "실행 위치: 실제 앱 폴더 최상단",
    ],
  },
  {
    file: "src/components/final-execution-external-tool-section.tsx",
    tokens: [
      'data-smoke="final-execution-live-three-actions"',
      "받기",
      "만들 앱 프로젝트 루트",
      "설치 명령 후 확인 명령",
    ],
  },
  {
    file: "src/components/final-execution-simple-path.tsx",
    tokens: [
      'data-smoke="final-execution-simple-path"',
      "아직 앱 폴더가 없다면 먼저 새 폴더를 만들고",
      "새 프로젝트는 방금 만든 빈 폴더여도 됩니다.",
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
      "기존 앱 파일 또는 새 빈 폴더",
      "새 앱이면",
      "방금 만든 빈 폴더여도 됩니다.",
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
      "Claude Code 연결 파일을 준비했습니다. 연결 도구 또는 record-progress 명령",
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
    file: "src/components/upgrade-interest-button.tsx",
    tokens: [
      'data-smoke="upgrade-interest-no-checkout-boundary"',
      "PRO_INTEREST_NO_CHECKOUT_BOUNDARY_MESSAGE",
    ],
  },
  {
    file: "src/components/production-credit-panel.tsx",
    tokens: [
      'data-smoke="step5-pro-interest-boundary"',
      'data-smoke="step5-pro-interest-not-payment"',
      'data-smoke="production-credit-pro-paused-boundary"',
      'data-smoke="production-credit-no-checkout-summary"',
      "PRO_INTEREST_PAUSED_CHECKOUT_MESSAGE",
      "PRO_INTEREST_DEMAND_SIGNAL_MESSAGE",
      "결제가 아니라 수요 신호",
    ],
  },
  {
    file: "src/components/profile-credit-summary.tsx",
    tokens: [
      'data-smoke="profile-current-plan-summary"',
      'data-smoke="profile-pro-interest-boundary"',
      'data-smoke="profile-pro-interest-not-payment"',
      "PRO_INTEREST_PAUSED_CHECKOUT_MESSAGE",
      "현재는 Free입니다.",
      "결제 예약이나 구독 신청이 아니라",
    ],
  },
  {
    file: "src/components/profile-upgrade-interest-summary.tsx",
    tokens: [
      'data-smoke="profile-upgrade-interest-paused-boundary"',
      'data-smoke="profile-upgrade-interest-not-payment"',
      "PRO_INTEREST_PAUSED_CHECKOUT_MESSAGE",
      "결제 예약이나 구독 신청이 아니라",
      "중복 기준",
    ],
  },
  {
    file: "src/lib/upgrade-interest.ts",
    tokens: [
      "PRO_INTEREST_NO_CHECKOUT_BOUNDARY_MESSAGE",
      "결제 화면은 열지 않습니다.",
      "Pro가 필요해진 순간만 저장합니다.",
      "PRO_INTEREST_PAUSED_CHECKOUT_MESSAGE",
      "결제는 아직 열지 않습니다.",
      "어떤 순간에 유료 가치가 필요한지",
      "PRO_INTEREST_DEMAND_SIGNAL_MESSAGE",
      "결제 요청이 아니라",
      "수요 신호",
    ],
  },
  {
    file: "scripts/smoke_billing_credits.mjs",
    tokens: [
      '[data-smoke="step5-execution-package-focus"]',
      "처음엔 첫 메시지, T-001, 완료 기준만 봅니다.",
      "나머지는 도구가 읽습니다.",
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

    if (contract.orderedTokens) {
      let previousIndex = -1;

      for (const token of contract.orderedTokens) {
        const index = body.indexOf(token);

        if (index === -1) {
          fail(`${contract.file} is missing ordered token ${JSON.stringify(token)}`);
        }

        if (index <= previousIndex) {
          fail(`${contract.file} has ordered token out of sequence: ${JSON.stringify(token)}`);
        }

        previousIndex = index;
      }
    }
  }

  console.log("UX smoke contract check passed.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
