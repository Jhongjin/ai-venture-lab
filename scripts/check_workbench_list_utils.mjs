import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const moduleUrl = pathToFileURL(path.join(process.cwd(), "src/lib/workbench-list-utils.ts")).href;
const {
  appendRecord,
  appendRecords,
  buildWorkbenchComparisonIdeaListItemStates,
  buildDiscardIdeaPatch,
  buildRestoreIdeaPatch,
  buildWorkbenchDiscardedIdeaListItemStates,
  buildWorkbenchEditPermissionState,
  buildWorkbenchEmptySelectionState,
  buildWorkbenchIdeaDiscardConfirmMessage,
  buildWorkbenchIdeaDiscardFailedMessage,
  buildWorkbenchIdeaDiscardedMessage,
  buildWorkbenchIdeaActionControlState,
  buildWorkbenchIdeaDisplayState,
  buildWorkbenchIdeaFilterButtonClassName,
  buildWorkbenchIdeaFilterButtonStates,
  buildWorkbenchIdeaListItemCardClassName,
  buildWorkbenchIdeaListItemStates,
  buildWorkbenchIdeaListVisibilityDisplayState,
  buildWorkbenchIdeaPermanentDeleteConfirmMessage,
  buildWorkbenchIdeaPermanentDeleteFailedMessage,
  buildWorkbenchIdeaRemovalCompletionState,
  buildWorkbenchIdeaRelatedTableDeleteFailedMessage,
  buildWorkbenchIdeaRestoreFailedMessage,
  buildWorkbenchIdeaRestoredMessage,
  buildWorkbenchIdeaVisibilityState,
  buildWorkbenchSelectedIdeaPanelState,
  buildWorkbenchIdeasBulkDiscardConfirmMessage,
  buildWorkbenchIdeasBulkDiscardFailedMessage,
  buildWorkbenchIdeasBulkPermanentDeleteConfirmMessage,
  buildWorkbenchIdeasBulkPermanentDeleteFailedMessage,
  buildWorkbenchIdeasBulkRelatedTableDeleteFailedMessage,
  buildWorkbenchIdeasBulkRestoreConfirmMessage,
  buildWorkbenchIdeasBulkRestoreFailedMessage,
  filterVisibleWorkbenchIdeas,
  canManageWorkbenchRecord,
  compareWorkbenchIdeasByCreatedAtDesc,
  compareWorkbenchIdeas,
  getActiveIdeas,
  getWorkbenchIdeaCreatedAtTime,
  getIdeaDeletionRelatedTables,
  getIdeaStageRank,
  getInitialSelectedWorkbenchIdeaId,
  getInitialWorkbenchTask,
  getNextSelectedWorkbenchIdeaAfterRemoval,
  getSelectedWorkbenchIdea,
  getWorkbenchComparisonIdeas,
  getWorkbenchRecordAccessDisplay,
  getWorkbenchRecordAccessState,
  getWorkbenchIdeaDiscardSelectionState,
  getWorkbenchIdeaRemovalSelectionState,
  getVisibleActiveIdeaCount,
  getVisibleDiscardedIdeas,
  isWorkbenchAdminRole,
  isDiscardedIdea,
  isIdeaStageAtOrAfter,
  isRemovedWorkbenchIdeaSelected,
  mergeRecordMap,
  omitRecordKey,
  prependRecord,
  prependRecords,
  removeRecordById,
  removeWorkbenchIdeaFromList,
  removeRecordsByIdeaId,
  replaceRecordById,
  replaceWorkbenchIdeaInList,
  replaceRecordsByIdeaId,
  replaceRecordsById,
  setRecordField,
  setRecordFields,
  setRecordKey,
  sortWorkbenchIdeas,
  upsertRecordById,
  upsertRecordsById,
  upsertWorkbenchIdea,
  workbenchIdeaCreatedSelectedMessage,
  workbenchIdeaDeleteLoginRequiredMessage,
  workbenchIdeaDeletePermissionDeniedMessage,
  workbenchIdeaFilterModes,
  workbenchIdeaReadOnlyMessage,
  workbenchIdeaRestoreLoginRequiredMessage,
  workbenchIdeaRestorePermissionDeniedMessage,
  workbenchIdeaSelectionRequiredMessage,
  workbenchStorageConnectionRequiredMessage,
  workbenchStorageNotConfiguredMessage,
} = await import(moduleUrl);

const ideaWorkbenchSource = readFileSync(path.join(process.cwd(), "src/components/idea-workbench.tsx"), "utf8");

function idea({
  access,
  createdAt,
  decision = "pending",
  id,
  name,
  productSurface = null,
  stage,
}) {
  return {
    access,
    buyer: "",
    created_at: createdAt,
    created_by: null,
    decision,
    differentiation: 0,
    frequency: 0,
    id,
    mvp_speed: 0,
    name,
    next_evidence: "",
    one_liner: "",
    organization_id: null,
    problem_intensity: 0,
    product_surface: productSurface,
    reachability: 0,
    regulatory_risk: 0,
    risk_summary: "",
    signal: "",
    stage,
    target_user: "",
    updated_at: createdAt,
    willingness_to_pay: 0,
  };
}

const ideas = [
  idea({ access: "workspace_member", createdAt: "2026-05-02T00:00:00.000Z", id: "shared-old", name: "공유 운영", stage: "prd" }),
  idea({ access: "owned", createdAt: "2026-05-04T00:00:00.000Z", id: "owned-new", name: "내 신규", stage: "score" }),
  idea({ access: "hidden", createdAt: "2026-05-05T00:00:00.000Z", id: "hidden", name: "숨김", stage: "score" }),
  idea({ access: "workspace_admin", createdAt: "2026-05-06T00:00:00.000Z", id: "admin", name: "관리 공유", stage: "launch" }),
  idea({ access: "owned", createdAt: "2026-05-07T00:00:00.000Z", decision: "kill", id: "deleted", name: "삭제", stage: "paused" }),
];
const getAccess = (record) => record.access;

assert.equal(getIdeaStageRank("intake") < getIdeaStageRank("launch"), true);
assert.equal(isIdeaStageAtOrAfter("prototype", "prd"), true);
assert.equal(isIdeaStageAtOrAfter("score", "launch"), false);
assert.equal(isDiscardedIdea(ideas[4]), true);
assert.equal(isWorkbenchAdminRole("owner"), true);
assert.equal(isWorkbenchAdminRole("admin"), true);
assert.equal(isWorkbenchAdminRole("member"), false);
assert.deepEqual(workbenchIdeaFilterModes, ["all", "mine", "read_only"]);
assert.equal(
  buildWorkbenchIdeaFilterButtonClassName({ isActive: true, placement: "sidebar" }),
  "h-9 rounded-[0.125rem] text-sm font-semibold transition bg-white text-slate-950 shadow-sm",
);
assert.equal(
  buildWorkbenchIdeaFilterButtonClassName({ isActive: false, placement: "panel" }),
  "h-10 text-sm font-semibold transition text-slate-500 hover:text-slate-900",
);
assert.deepEqual(
  buildWorkbenchIdeaFilterButtonStates({ activeMode: "mine", placement: "sidebar" }).map((buttonState) => ({
    className: buttonState.className,
    isActive: buttonState.isActive,
    mode: buttonState.mode,
  })),
  [
    {
      className: "h-9 rounded-[0.125rem] text-sm font-semibold transition text-slate-500 hover:text-slate-900",
      isActive: false,
      mode: "all",
    },
    {
      className: "h-9 rounded-[0.125rem] text-sm font-semibold transition bg-white text-slate-950 shadow-sm",
      isActive: true,
      mode: "mine",
    },
    {
      className: "h-9 rounded-[0.125rem] text-sm font-semibold transition text-slate-500 hover:text-slate-900",
      isActive: false,
      mode: "read_only",
    },
  ],
);
assert.ok(
  ideaWorkbenchSource.includes("sidebarIdeaFilterButtonStates.map"),
  "IdeaWorkbench should render sidebar filter buttons from shared state.",
);
assert.ok(
  ideaWorkbenchSource.includes("panelIdeaFilterButtonStates.map"),
  "IdeaWorkbench should render panel filter buttons from shared state.",
);
assert.ok(
  !ideaWorkbenchSource.includes("workbenchIdeaFilterModes.map"),
  "IdeaWorkbench should not render filter buttons by mapping raw filter modes.",
);
assert.ok(
  !ideaWorkbenchSource.includes("filterMode === value"),
  "IdeaWorkbench should not calculate filter button active classes inline.",
);
assert.equal(workbenchIdeaCreatedSelectedMessage, "새 아이디어를 실행 보드에 바로 추가하고 선택했습니다.");
assert.equal(workbenchIdeaDeleteLoginRequiredMessage, "아이디어를 삭제하려면 먼저 로그인해 주세요.");
assert.equal(workbenchIdeaDeletePermissionDeniedMessage, "이 아이디어를 삭제할 권한이 없습니다.");
assert.equal(workbenchIdeaSelectionRequiredMessage, "먼저 아이디어를 선택하세요.");
assert.equal(workbenchIdeaReadOnlyMessage, "현재 운영자에게는 이 아이디어가 읽기 전용입니다.");
assert.equal(workbenchIdeaRestoreLoginRequiredMessage, "아이디어를 되살리려면 먼저 로그인해 주세요.");
assert.equal(workbenchIdeaRestorePermissionDeniedMessage, "이 아이디어를 되살릴 권한이 없습니다.");
assert.equal(workbenchStorageConnectionRequiredMessage, "저장 연결을 먼저 확인해 주세요.");
assert.equal(workbenchStorageNotConfiguredMessage, "저장 연결이 설정되어 있지 않습니다.");
assert.deepEqual(getIdeaDeletionRelatedTables(), [
  "telemetry_events",
  "implementation_tasks",
  "venture_artifacts",
  "orchestration_runs",
  "experiments",
  "decisions",
  "risks",
]);
assert.deepEqual(buildDiscardIdeaPatch("2026-06-01T00:00:00.000Z"), {
  decision: "kill",
  stage: "paused",
  updated_at: "2026-06-01T00:00:00.000Z",
});
assert.deepEqual(buildRestoreIdeaPatch("2026-06-01T00:00:00.000Z"), {
  decision: "research_more",
  stage: "score",
  updated_at: "2026-06-01T00:00:00.000Z",
});
assert.deepEqual(
  buildWorkbenchEmptySelectionState({
    editState: null,
    selectedIdea: ideas[0],
    visibleIdeaCount: 3,
  }),
  {
    hasSelectableIdeas: true,
    shouldShowEmptyState: true,
  },
);
assert.deepEqual(
  buildWorkbenchEmptySelectionState({
    editState: {},
    selectedIdea: ideas[0],
    visibleIdeaCount: 0,
  }),
  {
    hasSelectableIdeas: false,
    shouldShowEmptyState: false,
  },
);
assert.ok(
  !ideaWorkbenchSource.includes("const hasSelectableIdeas = visibleIdeas.length > 0"),
  "IdeaWorkbench should use the shared empty-selection helper.",
);
assert.ok(
  !ideaWorkbenchSource.includes("const canEdit = Boolean"),
  "IdeaWorkbench should use the shared edit-permission helper.",
);
assert.deepEqual(buildWorkbenchIdeaActionControlState({
  isBusy: false,
  label: "삭제",
}), {
  disabled: false,
  label: "삭제",
});
assert.deepEqual(buildWorkbenchIdeaActionControlState({
  isBusy: true,
  label: "되살리기",
}), {
  disabled: true,
  label: "되살리기",
});
assert.ok(
  !ideaWorkbenchSource.includes("disabled={isBusy}"),
  "IdeaWorkbench should render idea action disabled state from shared action controls.",
);
assert.ok(
  ideaWorkbenchSource.includes("workbenchIdeaDiscardControlState.disabled"),
  "IdeaWorkbench should render idea discard disabled state from shared action controls.",
);
assert.ok(
  ideaWorkbenchSource.includes("workbenchIdeaRestoreControlState.label"),
  "IdeaWorkbench should render idea restore label from shared action controls.",
);
assert.ok(
  !ideaWorkbenchSource.includes("visibleIdeas.length > 0 && selectedIdea && !isDiscardedIdea(selectedIdea) ? (() => {"),
  "IdeaWorkbench should use the shared selected-idea panel helper instead of a JSX IIFE.",
);
assert.ok(
  !ideaWorkbenchSource.includes("visibleIdeas.map((idea) => {"),
  "IdeaWorkbench should use the shared visible idea list item helper.",
);
assert.ok(
  !ideaWorkbenchSource.includes("discardedIdeas.map((idea) => {"),
  "IdeaWorkbench should use the shared discarded idea list item helper.",
);
assert.deepEqual(
  buildWorkbenchEditPermissionState({
    memberships: [],
    selectedIdea: { created_by: "viewer-1", organization_id: null },
    user: { id: "viewer-1" },
  }),
  { canEdit: true },
);
assert.deepEqual(
  buildWorkbenchEditPermissionState({
    memberships: [{ organization_id: "org-1", role: "admin", user_id: "viewer-1" }],
    selectedIdea: { created_by: "owner-2", organization_id: "org-1" },
    user: { id: "viewer-1" },
  }),
  { canEdit: true },
);
assert.deepEqual(
  buildWorkbenchEditPermissionState({
    memberships: [{ organization_id: "org-1", role: "member", user_id: "viewer-1" }],
    selectedIdea: { created_by: "owner-2", organization_id: "org-1" },
    user: { id: "viewer-1" },
  }),
  { canEdit: false },
);
assert.deepEqual(
  buildWorkbenchEditPermissionState({
    memberships: [],
    selectedIdea: null,
    user: { id: "viewer-1" },
  }),
  { canEdit: false },
);
assert.equal(
  buildWorkbenchIdeaDiscardFailedMessage({ errorMessage: "permission denied", ideaName: "AI Venture Lab" }),
  "AI Venture Lab 아이디어를 삭제 목록으로 옮기지 못했습니다: permission denied",
);
assert.equal(
  buildWorkbenchIdeaDiscardFailedMessage({ errorMessage: null, ideaName: "AI Venture Lab" }),
  "AI Venture Lab 아이디어를 삭제 목록으로 옮기지 못했습니다: 응답 없음",
);
assert.equal(
  buildWorkbenchIdeaDiscardConfirmMessage("AI Venture Lab"),
  "\"AI Venture Lab\" 아이디어를 삭제 목록으로 옮길까요?\n나중에 다시 되살릴 수 있습니다.",
);
assert.equal(buildWorkbenchIdeaDiscardedMessage("AI Venture Lab"), "\"AI Venture Lab\" 아이디어를 삭제 목록으로 옮겼습니다.");
assert.equal(
  buildWorkbenchIdeaRestoreFailedMessage({ errorMessage: "permission denied", ideaName: "AI Venture Lab" }),
  "AI Venture Lab 아이디어를 되살리지 못했습니다: permission denied",
);
assert.equal(buildWorkbenchIdeaRestoredMessage("AI Venture Lab"), "\"AI Venture Lab\" 아이디어를 다시 진행 목록으로 옮겼습니다.");
assert.equal(
  buildWorkbenchIdeaPermanentDeleteConfirmMessage("AI Venture Lab"),
  "\"AI Venture Lab\" 아이디어와 연결된 리스크, 판단, 실험, 제작 자료, 실행 기록까지 영구 삭제할까요?\n이 작업은 되돌릴 수 없습니다.",
);
assert.equal(
  buildWorkbenchIdeasBulkDiscardConfirmMessage(3),
  "선택한 3개 아이디어를 삭제 목록으로 옮길까요?\n나중에 삭제한 아이디어 화면에서 다시 되살릴 수 있습니다.",
);
assert.equal(buildWorkbenchIdeasBulkRestoreConfirmMessage(2), "선택한 2개 아이디어를 검토 아이디어로 되살릴까요?");
assert.equal(
  buildWorkbenchIdeasBulkPermanentDeleteConfirmMessage(4),
  "선택한 4개 아이디어와 연결된 리스크, 판단, 실험, 제작 자료, 실행 기록까지 영구 삭제할까요?\n이 작업은 되돌릴 수 없습니다.",
);
assert.equal(
  buildWorkbenchIdeasBulkDiscardFailedMessage("permission denied"),
  "선택한 아이디어를 삭제 목록으로 옮기지 못했습니다: permission denied",
);
assert.equal(
  buildWorkbenchIdeasBulkDiscardFailedMessage(null),
  "선택한 아이디어를 삭제 목록으로 옮기지 못했습니다: 응답 없음",
);
assert.equal(
  buildWorkbenchIdeasBulkRestoreFailedMessage("permission denied"),
  "선택한 아이디어를 되살리지 못했습니다: permission denied",
);
assert.equal(
  buildWorkbenchIdeasBulkRelatedTableDeleteFailedMessage({
    errorMessage: "permission denied",
    table: "risks",
  }),
  "선택한 아이디어 삭제 중 risks 정리에서 막혔습니다: permission denied",
);
assert.equal(
  buildWorkbenchIdeasBulkPermanentDeleteFailedMessage("permission denied"),
  "선택한 아이디어를 삭제하지 못했습니다: permission denied",
);
assert.equal(
  buildWorkbenchIdeaRelatedTableDeleteFailedMessage({
    errorMessage: "permission denied",
    ideaName: "AI Venture Lab",
    table: "risks",
  }),
  "AI Venture Lab 삭제 중 risks 정리에서 막혔습니다: permission denied",
);
assert.equal(
  buildWorkbenchIdeaPermanentDeleteFailedMessage({
    errorMessage: "permission denied",
    ideaName: "AI Venture Lab",
  }),
  "AI Venture Lab 아이디어를 삭제하지 못했습니다: permission denied",
);
assert.deepEqual(getActiveIdeas(ideas).map((record) => record.id), ["shared-old", "owned-new", "hidden", "admin"]);

assert.deepEqual(
  sortWorkbenchIdeas([ideas[3], ideas[1], ideas[0]]).map((record) => record.id),
  ["owned-new", "shared-old", "admin"],
);
assert.deepEqual(
  replaceWorkbenchIdeaInList([ideas[0], ideas[1]], { ...ideas[0], stage: "prototype" }).map((record) => record.id),
  ["owned-new", "shared-old"],
);
assert.deepEqual(removeWorkbenchIdeaFromList([ideas[3], ideas[1], ideas[0]], "owned-new").map((record) => record.id), [
  "shared-old",
  "admin",
]);
assert.equal(getWorkbenchIdeaCreatedAtTime(ideas[1]), 1777852800000);
assert.equal(compareWorkbenchIdeasByCreatedAtDesc(ideas[1], ideas[0]) < 0, true);
assert.equal(compareWorkbenchIdeas(ideas[1], ideas[0]) < 0, true);
assert.equal(compareWorkbenchIdeas(ideas[2], ideas[1]) < 0, true);
assert.equal(getInitialSelectedWorkbenchIdeaId(ideas, "admin"), "admin");
assert.equal(getInitialSelectedWorkbenchIdeaId(ideas, "deleted"), "hidden");
assert.equal(getInitialSelectedWorkbenchIdeaId([ideas[4]]), "");
assert.equal(getInitialWorkbenchTask(ideas), "score");
assert.equal(getInitialWorkbenchTask([ideas[4]]), "select");
assert.equal(getInitialWorkbenchTask([]), "select");
assert.deepEqual(
  {
    nextSelectedIdeaId: getWorkbenchIdeaDiscardSelectionState(ideas).nextSelectedIdea?.id,
    nextTask: getWorkbenchIdeaDiscardSelectionState(ideas).nextTask,
  },
  { nextSelectedIdeaId: "hidden", nextTask: "select" },
);
assert.deepEqual(getWorkbenchIdeaDiscardSelectionState([ideas[4]]), {
  nextSelectedIdea: null,
  nextTask: "archive",
});
assert.equal(getSelectedWorkbenchIdea(ideas, "admin")?.id, "admin");
assert.equal(getSelectedWorkbenchIdea(ideas, "missing")?.id, "shared-old");
assert.equal(getSelectedWorkbenchIdea([ideas[4]], "missing")?.id, "deleted");
assert.equal(getSelectedWorkbenchIdea([], "missing"), null);
assert.deepEqual(
  getWorkbenchComparisonIdeas([ideas[1], ideas[0], ideas[3]], "owned-new").map((record) => record.id),
  ["shared-old", "admin"],
);
assert.deepEqual(
  getWorkbenchComparisonIdeas([ideas[1], ideas[0], ideas[3]], "owned-new", 1).map((record) => record.id),
  ["shared-old"],
);
const getPanelDisplayState = (record) =>
  buildWorkbenchIdeaDisplayState({
    getRecordAccessState: getAccess,
    getProductSurface: () => ({
      description: "반복 업무를 자동으로 처리하는 흐름입니다.",
      firstBuild: "자동화 설정과 결과 확인 흐름",
      handoffHint: "작업 목록과 자동 실행 조건을 넘깁니다.",
      harnessFocus: "자동화 입력/결과 확인을 검증합니다.",
      iaHint: "설정, 실행, 결과 화면을 둡니다.",
      key: "automation",
      label: "업무 자동화",
      promptFocus: "반복 업무 자동 실행을 우선 반영합니다.",
      shortLabel: "자동화",
      stackHint: "API와 스케줄러를 비교합니다.",
    }),
    getProgress: () => ({
      label: "STEP 5 제작 패키지",
      task: "development",
    }),
    idea: record,
  });
const selectedIdeaPanelState = buildWorkbenchSelectedIdeaPanelState({
  getIdeaDisplayState: getPanelDisplayState,
  selectedIdea: ideas[1],
  visibleIdeas: [ideas[1], ideas[0], ideas[3]],
});
assert.equal(selectedIdeaPanelState.shouldShow, true);
assert.equal(selectedIdeaPanelState.selectedIdeaDisplay.productSurface.label, "업무 자동화");
assert.equal(selectedIdeaPanelState.showManageActions, true);
assert.deepEqual(selectedIdeaPanelState.comparisonIdeas.map((record) => record.id), ["shared-old", "admin"]);
const comparisonIdeaListItemStates = buildWorkbenchComparisonIdeaListItemStates({
  comparisonIdeas: selectedIdeaPanelState.comparisonIdeas,
  getIdeaDisplayState: getPanelDisplayState,
});
assert.deepEqual(
  comparisonIdeaListItemStates.map(({ display, idea: record, showDiscardAction, stepLabel }) => ({
    id: record.id,
    progressLabel: display.progress.label,
    showDiscardAction,
    stepLabel,
  })),
  [
    { id: "shared-old", progressLabel: "STEP 5 제작 패키지", showDiscardAction: false, stepLabel: "2" },
    { id: "admin", progressLabel: "STEP 5 제작 패키지", showDiscardAction: true, stepLabel: "3" },
  ],
);
assert.deepEqual(
  buildWorkbenchComparisonIdeaListItemStates({
    comparisonIdeas: [],
    getIdeaDisplayState: getPanelDisplayState,
  }),
  [],
);
assert.ok(
  !ideaWorkbenchSource.includes("comparisonIdeas.map((idea, index)"),
  "IdeaWorkbench should render comparison ideas from shared list item state.",
);
assert.ok(
  !ideaWorkbenchSource.includes("accessDisplay.isManageable ? ("),
  "IdeaWorkbench should render idea manage actions from shared item state.",
);
assert.ok(
  !ideaWorkbenchSource.includes("canManage ? ("),
  "IdeaWorkbench should render discarded idea manage actions from shared item state.",
);
assert.ok(
  !ideaWorkbenchSource.includes("index + 2"),
  "IdeaWorkbench should render comparison idea step labels from shared list item state.",
);
assert.ok(
  ideaWorkbenchSource.includes("comparisonIdeaListItems.map"),
  "IdeaWorkbench should map comparison idea item state instead of raw ideas.",
);
assert.deepEqual(
  buildWorkbenchSelectedIdeaPanelState({
    getIdeaDisplayState: getPanelDisplayState,
    selectedIdea: ideas[4],
    visibleIdeas: [ideas[4]],
  }),
  {
    comparisonIdeas: [],
    selectedIdeaDisplay: null,
    showManageActions: false,
    shouldShow: false,
  },
);
assert.deepEqual(
  buildWorkbenchSelectedIdeaPanelState({
    getIdeaDisplayState: getPanelDisplayState,
    selectedIdea: ideas[1],
    visibleIdeas: [],
  }),
  {
    comparisonIdeas: [],
    selectedIdeaDisplay: null,
    showManageActions: false,
    shouldShow: false,
  },
);
const visibleIdeaListItemStates = buildWorkbenchIdeaListItemStates({
  getIdeaDisplayState: getPanelDisplayState,
  selectedIdeaId: "owned-new",
  visibleIdeas: [ideas[1], ideas[0], ideas[3]],
});
assert.deepEqual(
  visibleIdeaListItemStates.map(({ cardClassName, idea: record, isSelected, showDiscardAction, stagePillTone }) => ({
    cardClassName,
    id: record.id,
    isSelected,
    showDiscardAction,
    stagePillTone,
  })),
  [
    {
      cardClassName: "border p-4 text-left transition border-blue-200 bg-blue-50 text-slate-950 shadow-sm",
      id: "owned-new",
      isSelected: true,
      showDiscardAction: true,
      stagePillTone: "avl-pill-info",
    },
    {
      cardClassName:
        "border p-4 text-left transition border-slate-200 bg-white text-slate-900 hover:border-slate-300 hover:bg-slate-50",
      id: "shared-old",
      isSelected: false,
      showDiscardAction: false,
      stagePillTone: "avl-pill-neutral",
    },
    {
      cardClassName:
        "border p-4 text-left transition border-slate-200 bg-white text-slate-900 hover:border-slate-300 hover:bg-slate-50",
      id: "admin",
      isSelected: false,
      showDiscardAction: true,
      stagePillTone: "avl-pill-neutral",
    },
  ],
);
assert.equal(visibleIdeaListItemStates[0].display.accessDisplay.label, "내 기록");
assert.equal(
  buildWorkbenchIdeaListItemCardClassName({ isSelected: true }),
  "border p-4 text-left transition border-blue-200 bg-blue-50 text-slate-950 shadow-sm",
);
assert.equal(
  buildWorkbenchIdeaListItemCardClassName({ isSelected: false }),
  "border p-4 text-left transition border-slate-200 bg-white text-slate-900 hover:border-slate-300 hover:bg-slate-50",
);
assert.deepEqual(
  buildWorkbenchIdeaListVisibilityDisplayState({
    comparisonIdeaCount: 2,
    discardedIdeaCount: 1,
    visibleIdeaCount: 3,
  }),
  {
    discardedIdeaCountLabel: "1개",
    showComparisonIdeas: true,
    showDiscardedIdeaList: true,
    showVisibleIdeaList: true,
  },
);
assert.deepEqual(
  buildWorkbenchIdeaListVisibilityDisplayState({
    comparisonIdeaCount: 0,
    discardedIdeaCount: 0,
    visibleIdeaCount: 0,
  }),
  {
    discardedIdeaCountLabel: "0개",
    showComparisonIdeas: false,
    showDiscardedIdeaList: false,
    showVisibleIdeaList: false,
  },
);
assert.ok(
  ideaWorkbenchSource.includes("cardClassName"),
  "IdeaWorkbench should render idea list item card classes from shared state.",
);
assert.ok(
  !ideaWorkbenchSource.includes("visibleIdeaListItems.length > 0"),
  "IdeaWorkbench should render sidebar idea list visibility from shared display state.",
);
assert.ok(
  !ideaWorkbenchSource.includes("comparisonIdeas.length > 0"),
  "IdeaWorkbench should render comparison idea visibility from shared display state.",
);
assert.ok(
  !ideaWorkbenchSource.includes("discardedIdeaListItems.length > 0"),
  "IdeaWorkbench should render discarded idea visibility from shared display state.",
);
assert.ok(
  ideaWorkbenchSource.includes("workbenchIdeaListVisibilityDisplayState.discardedIdeaCountLabel"),
  "IdeaWorkbench should render discarded idea count label from shared display state.",
);
assert.ok(
  !ideaWorkbenchSource.includes("isSelected"),
  "IdeaWorkbench should not render visible idea list card selected classes inline.",
);
assert.deepEqual(
  buildWorkbenchIdeaListItemStates({
    getIdeaDisplayState: getPanelDisplayState,
    selectedIdeaId: "owned-new",
    visibleIdeas: [],
  }),
  [],
);
const discardedIdeaListItemStates = buildWorkbenchDiscardedIdeaListItemStates({
  discardedIdeas: [ideas[4], ideas[2]],
  getIdeaDisplayState: getPanelDisplayState,
});
assert.deepEqual(
  discardedIdeaListItemStates.map(({ canManage, idea: record, showManageActions }) => ({
    canManage,
    id: record.id,
    showManageActions,
  })),
  [
    { canManage: true, id: "deleted", showManageActions: true },
    { canManage: false, id: "hidden", showManageActions: false },
  ],
);
assert.equal(discardedIdeaListItemStates[0].display.productSurface.label, "업무 자동화");
assert.deepEqual(
  buildWorkbenchDiscardedIdeaListItemStates({
    discardedIdeas: [],
    getIdeaDisplayState: getPanelDisplayState,
  }),
  [],
);
assert.equal(
  isRemovedWorkbenchIdeaSelected({
    currentSelectedIdeaId: "owned-new",
    removedIdeaId: "owned-new",
    selectedIdeaId: "admin",
  }),
  true,
);
assert.equal(
  isRemovedWorkbenchIdeaSelected({
    currentSelectedIdeaId: "admin",
    removedIdeaId: "owned-new",
    selectedIdeaId: "admin",
  }),
  false,
);
assert.equal(
  getNextSelectedWorkbenchIdeaAfterRemoval({
    currentSelectedIdeaId: "owned-new",
    nextIdeas: ideas.filter((record) => record.id !== "owned-new"),
    removedIdeaId: "owned-new",
    selectedIdeaId: "owned-new",
  })?.id,
  "hidden",
);
assert.equal(
  getNextSelectedWorkbenchIdeaAfterRemoval({
    currentSelectedIdeaId: "admin",
    nextIdeas: ideas.filter((record) => record.id !== "shared-old"),
    removedIdeaId: "shared-old",
    selectedIdeaId: "admin",
  })?.id,
  "admin",
);
assert.equal(
  getNextSelectedWorkbenchIdeaAfterRemoval({
    currentSelectedIdeaId: "deleted",
    nextIdeas: [ideas[4]],
    removedIdeaId: "deleted",
    selectedIdeaId: "deleted",
  }),
  null,
);
assert.deepEqual(
  getWorkbenchIdeaRemovalSelectionState({
    currentSelectedIdeaId: "owned-new",
    nextIdeas: ideas.filter((record) => record.id !== "owned-new"),
    removedIdeaId: "owned-new",
    selectedIdeaId: "owned-new",
  }),
  { isRemovingSelectedIdea: true, nextSelectedIdea: ideas[2] },
);
assert.deepEqual(
  buildWorkbenchIdeaRemovalCompletionState({
    ideaName: "AI Venture Lab",
    isRemovingSelectedIdea: true,
    nextSelectedIdea: ideas[2],
    remainingIdeaCount: 2,
  }),
  {
    message: "\"AI Venture Lab\" 아이디어를 완전히 삭제했고, 다음 아이디어로 이동했습니다.",
    nextTask: "score",
  },
);
assert.deepEqual(
  buildWorkbenchIdeaRemovalCompletionState({
    ideaName: "AI Venture Lab",
    isRemovingSelectedIdea: false,
    nextSelectedIdea: ideas[2],
    remainingIdeaCount: 2,
  }),
  {
    message: "\"AI Venture Lab\" 아이디어를 완전히 삭제했고, 다음 아이디어로 이동했습니다.",
    nextTask: null,
  },
);
assert.deepEqual(
  buildWorkbenchIdeaRemovalCompletionState({
    ideaName: "AI Venture Lab",
    isRemovingSelectedIdea: true,
    nextSelectedIdea: null,
    remainingIdeaCount: 1,
  }),
  {
    message: "\"AI Venture Lab\" 아이디어를 완전히 삭제했습니다.",
    nextTask: "archive",
  },
);
assert.equal(
  buildWorkbenchIdeaRemovalCompletionState({
    ideaName: "AI Venture Lab",
    isRemovingSelectedIdea: true,
    nextSelectedIdea: null,
    remainingIdeaCount: 0,
  }).nextTask,
  "select",
);

assert.deepEqual(
  filterVisibleWorkbenchIdeas(ideas, "all", getAccess).map((record) => record.id),
  ["owned-new", "shared-old", "admin"],
);
assert.deepEqual(
  filterVisibleWorkbenchIdeas(ideas, "mine", getAccess).map((record) => record.id),
  ["owned-new"],
);
assert.deepEqual(
  filterVisibleWorkbenchIdeas(ideas, "read_only", getAccess).map((record) => record.id),
  ["shared-old", "admin"],
);
assert.equal(getVisibleActiveIdeaCount(ideas, getAccess), 3);
assert.deepEqual(getVisibleDiscardedIdeas(ideas, getAccess).map((record) => record.id), ["deleted"]);
const visibilityState = buildWorkbenchIdeaVisibilityState(ideas, "all", getAccess);
assert.deepEqual(visibilityState.visibleIdeas.map((record) => record.id), ["owned-new", "shared-old", "admin"]);
assert.deepEqual(visibilityState.discardedIdeas.map((record) => record.id), ["deleted"]);
assert.equal(visibilityState.activeVisibleIdeaCount, 3);
assert.equal(visibilityState.discardedVisibleIdeaCount, 1);
const displayState = buildWorkbenchIdeaDisplayState({
  getRecordAccessState: getAccess,
  getProductSurface: () => ({
    description: "반복 업무를 자동으로 처리하는 흐름입니다.",
    firstBuild: "자동화 설정과 결과 확인 흐름",
    handoffHint: "작업 목록과 자동 실행 조건을 넘깁니다.",
    harnessFocus: "자동화 입력/결과 확인을 검증합니다.",
    iaHint: "설정, 실행, 결과 화면을 둡니다.",
    key: "automation",
    label: "업무 자동화",
    promptFocus: "반복 업무 자동 실행을 우선 반영합니다.",
    shortLabel: "자동화",
    stackHint: "API와 스케줄러를 비교합니다.",
  }),
  getProgress: () => ({
    label: "STEP 5 제작 패키지",
    task: "development",
  }),
  idea: idea({
    access: "owned",
    createdAt: "2026-05-08T00:00:00.000Z",
    id: "display",
    name: "자동화 OS",
    productSurface: "automation",
    stage: "prototype",
  }),
});
assert.equal(displayState.accessDisplay.label, "내 기록");
assert.equal(displayState.accessDisplay.isManageable, true);
assert.equal(displayState.productSurface.label, "업무 자동화");
assert.equal(displayState.progress.label, "STEP 5 제작 패키지");
assert.equal(displayState.progress.task, "development");

const memberships = [
  { organization_id: "org-admin", role: "admin", user_id: "viewer-1" },
  { organization_id: "org-member", role: "member", user_id: "viewer-1" },
  { organization_id: "org-other", role: "owner", user_id: "other-user" },
];
const viewer = { id: "viewer-1" };
const ownedRecord = { created_by: "viewer-1", organization_id: null };
const adminRecord = { created_by: "other-user", organization_id: "org-admin" };
const memberRecord = { created_by: "other-user", organization_id: "org-member" };
const hiddenRecord = { created_by: "other-user", organization_id: "org-other" };
assert.equal(getWorkbenchRecordAccessState({ memberships, record: ownedRecord, user: viewer }), "owned");
assert.equal(getWorkbenchRecordAccessState({ memberships, record: adminRecord, user: viewer }), "workspace_admin");
assert.equal(getWorkbenchRecordAccessState({ memberships, record: memberRecord, user: viewer }), "workspace_member");
assert.equal(getWorkbenchRecordAccessState({ memberships, record: hiddenRecord, user: viewer }), "hidden");
assert.equal(getWorkbenchRecordAccessState({ memberships, record: ownedRecord, user: null }), "hidden");
assert.equal(canManageWorkbenchRecord({ memberships, record: ownedRecord, user: viewer }), true);
assert.equal(canManageWorkbenchRecord({ memberships, record: adminRecord, user: viewer }), true);
assert.equal(canManageWorkbenchRecord({ memberships, record: memberRecord, user: viewer }), false);
assert.deepEqual(
  ["owned", "workspace_admin", "workspace_member", "hidden"].map((accessState) => {
    const display = getWorkbenchRecordAccessDisplay(accessState);
    return [display.label, display.isManageable, display.pillTone];
  }),
  [
    ["내 기록", true, "avl-pill-success"],
    ["팀 관리자", true, "avl-pill-success"],
    ["팀 기록", false, "avl-pill-neutral"],
    ["숨김", false, "avl-pill-neutral"],
  ],
);

assert.deepEqual(upsertRecordById([{ id: "a", value: 1 }], { id: "a", value: 2 }), [{ id: "a", value: 2 }]);
assert.deepEqual(upsertRecordsById([{ id: "a", value: 1 }], [{ id: "b", value: 2 }]), [
  { id: "b", value: 2 },
  { id: "a", value: 1 },
]);
assert.deepEqual(replaceRecordById([{ id: "a", value: 1 }], { id: "a", value: 2 }), [{ id: "a", value: 2 }]);
assert.deepEqual(replaceRecordById([{ id: "a", value: 1 }], { id: "b", value: 2 }), [{ id: "a", value: 1 }]);
assert.deepEqual(
  replaceRecordsById(
    [
      { id: "a", value: 1 },
      { id: "b", value: 2 },
    ],
    [{ id: "b", value: 3 }],
  ),
  [
    { id: "a", value: 1 },
    { id: "b", value: 3 },
  ],
);
assert.deepEqual(prependRecord([{ id: "b" }], { id: "a" }), [{ id: "a" }, { id: "b" }]);
assert.deepEqual(prependRecords([{ id: "c" }], [{ id: "a" }, { id: "b" }]), [
  { id: "a" },
  { id: "b" },
  { id: "c" },
]);
assert.deepEqual(appendRecord([{ id: "a" }], { id: "b" }), [{ id: "a" }, { id: "b" }]);
assert.deepEqual(appendRecords([{ id: "a" }], [{ id: "b" }, { id: "c" }]), [
  { id: "a" },
  { id: "b" },
  { id: "c" },
]);
assert.deepEqual(mergeRecordMap({ a: "old", b: "keep" }, { a: "new", c: "added" }), {
  a: "new",
  b: "keep",
  c: "added",
});
assert.deepEqual(omitRecordKey({ a: "keep", b: "drop" }, "b"), { a: "keep" });
assert.deepEqual(omitRecordKey({ a: "keep" }, "missing"), { a: "keep" });
assert.deepEqual(setRecordKey({ a: "keep" }, "b", "set"), { a: "keep", b: "set" });
assert.deepEqual(setRecordKey({ a: "old" }, "a", "new"), { a: "new" });
assert.deepEqual(setRecordField({ a: "old", b: 1 }, "a", "new"), { a: "new", b: 1 });
assert.deepEqual(setRecordFields({ a: "old", b: 1 }, { a: "new" }), { a: "new", b: 1 });
assert.deepEqual(removeRecordById([{ id: "a" }, { id: "b" }], "a"), [{ id: "b" }]);
assert.deepEqual(
  removeRecordsByIdeaId(
    [
      { id: "risk-1", idea_id: "idea-1" },
      { id: "risk-2", idea_id: "idea-2" },
      { id: "global", idea_id: null },
    ],
    "idea-1",
  ),
  [
    { id: "risk-2", idea_id: "idea-2" },
    { id: "global", idea_id: null },
  ],
);
assert.deepEqual(
  replaceRecordsByIdeaId(
    [
      { id: "old-1", idea_id: "idea-1" },
      { id: "keep-1", idea_id: "idea-2" },
    ],
    "idea-1",
    [
      { id: "new-1", idea_id: "idea-1" },
      { id: "new-2", idea_id: "idea-1" },
    ],
  ),
  [
    { id: "keep-1", idea_id: "idea-2" },
    { id: "new-1", idea_id: "idea-1" },
    { id: "new-2", idea_id: "idea-1" },
  ],
);
assert.deepEqual(upsertWorkbenchIdea([ideas[0]], ideas[1]).map((record) => record.id), ["owned-new", "shared-old"]);

console.log("Workbench list utils smoke passed.");
