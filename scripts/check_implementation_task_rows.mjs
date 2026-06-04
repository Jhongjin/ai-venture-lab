import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const moduleUrl = pathToFileURL(path.join(process.cwd(), "src/lib/implementation-task-rows.ts")).href;
const {
  buildImplementationTaskCreatedTelemetryProperties,
  buildImplementationTaskCreateControlStates,
  buildImplementationTaskEvidenceEditControlState,
  buildImplementationTaskEvidenceTelemetryProperties,
  buildImplementationTaskEvidenceSaveControlState,
  buildImplementationTaskEvidenceSavePermissionDeniedMessage,
  buildImplementationTaskEvidenceSavedMessage,
  buildImplementationTaskEvidencePatch,
  buildImplementationTaskInsertRows,
  buildImplementationTaskStartControlState,
  buildImplementationTaskStatusControlState,
  buildImplementationTaskStatusTelemetryProperties,
  buildImplementationTaskStatusPatch,
  buildImplementationTaskStatusChangedMessage,
  buildImplementationTaskStatusUpdatePermissionDeniedMessage,
  buildImplementationTasksAlreadyExistMessage,
  buildImplementationTasksCreateLoginRequiredMessage,
  buildImplementationTasksCreatedMessage,
  buildImplementationTasksCreatedTelemetryProperties,
  buildManualImplementationTaskCreatedMessage,
  buildManualImplementationTaskInsertRow,
  buildManualImplementationTaskLoginRequiredMessage,
  buildManualImplementationTaskTitleRequiredMessage,
  getImplementationTaskTableErrorMessage,
  getMissingImplementationTaskDrafts,
} = await import(moduleUrl);

const ideaWorkbenchSource = fs.readFileSync(path.join(process.cwd(), "src/components/idea-workbench.tsx"), "utf8");

const drafts = [
  {
    acceptance_criteria: "Lock scope",
    owner_role: "product-builder",
    priority: "high",
    task_type: "planning",
    title: "기획서와 첫 제작 범위 잠금",
  },
  {
    acceptance_criteria: "Build first screen",
    owner_role: "frontend-builder",
    priority: "high",
    task_type: "frontend",
    title: "핵심 입력/저장/조회 화면 구현",
  },
  {
    acceptance_criteria: "Smoke production",
    owner_role: "release-manager",
    priority: "medium",
    task_type: "deploy",
    title: "Vercel Preview/Production 스모크와 롤백 기록",
  },
];

const missingDrafts = getMissingImplementationTaskDrafts({
  drafts,
  existingTasks: [
    { title: " 기획서와 첫 제작 범위 잠금 " },
    { title: "이미 저장된 별도 작업" },
  ],
});

assert.deepEqual(
  missingDrafts.map((draft) => draft.title),
  ["핵심 입력/저장/조회 화면 구현", "Vercel Preview/Production 스모크와 롤백 기록"],
);

const rows = buildImplementationTaskInsertRows({
  drafts: missingDrafts,
  existingTaskCount: 3,
  ideaId: "idea-1",
  organizationId: "org-1",
  sourceArtifactId: "artifact-1",
});

assert.deepEqual(
  rows.map((row) => [row.title, row.status, row.sort_order, row.idea_id, row.organization_id, row.source_artifact_id]),
  [
    ["핵심 입력/저장/조회 화면 구현", "todo", 3, "idea-1", "org-1", "artifact-1"],
    ["Vercel Preview/Production 스모크와 롤백 기록", "todo", 4, "idea-1", "org-1", "artifact-1"],
  ],
);
assert.equal(rows[0].evidence, "");
assert.equal(rows[0].owner_role, "frontend-builder");
assert.equal(rows[1].priority, "medium");

assert.deepEqual(
  buildManualImplementationTaskInsertRow({
    draft: {
      acceptance_criteria: "  사용자는 저장 후 다음 버튼만 누른다  ",
      owner_role: " prototype-builder ",
      priority: "medium",
      task_type: "frontend",
      title: "  저장 게이트 확인 UI 구현  ",
    },
    existingTaskCount: 5,
    ideaId: "idea-2",
    organizationId: null,
    sourceArtifactId: null,
  }),
  {
    acceptance_criteria: "사용자는 저장 후 다음 버튼만 누른다",
    evidence: "",
    idea_id: "idea-2",
    organization_id: null,
    owner_role: "prototype-builder",
    priority: "medium",
    sort_order: 5,
    source_artifact_id: null,
    status: "todo",
    task_type: "frontend",
    title: "저장 게이트 확인 UI 구현",
  },
);

assert.deepEqual(buildImplementationTaskStatusPatch("doing"), { status: "doing" });
assert.deepEqual(buildImplementationTaskEvidencePatch("saved evidence", "old evidence"), { evidence: "saved evidence" });
assert.deepEqual(buildImplementationTaskEvidencePatch(undefined, "old evidence"), { evidence: "old evidence" });
assert.deepEqual(buildImplementationTaskEvidencePatch(undefined, null), { evidence: "" });
assert.deepEqual(
  buildImplementationTaskCreatedTelemetryProperties({
    owner_role: "",
    priority: "medium",
    task_type: "frontend",
  }),
  {
    task_type: "frontend",
    priority: "medium",
    owner_role: "미정",
  },
);
assert.deepEqual(
  buildImplementationTasksCreatedTelemetryProperties({
    hasSourceArtifact: false,
    taskCount: 2,
  }),
  {
    task_count: 2,
    source_artifact: "no",
  },
);
assert.deepEqual(
  buildImplementationTasksCreatedTelemetryProperties({
    hasSourceArtifact: true,
    taskCount: 1,
  }).source_artifact,
  "yes",
);
assert.deepEqual(
  buildImplementationTaskStatusTelemetryProperties({
    previousStatus: "todo",
    task: {
      status: "done",
      task_type: "qa",
    },
  }),
  {
    task_type: "qa",
    status: "done",
    previous_status: "todo",
  },
);
assert.deepEqual(
  buildImplementationTaskEvidenceTelemetryProperties({
    evidence: "배포 smoke 통과",
    status: "done",
    task_type: "deploy",
  }),
  {
    task_type: "deploy",
    evidence_length: 11,
    status: "done",
  },
);
assert.equal(buildImplementationTasksCreatedMessage(2), "2개의 제작 할 일을 만들었습니다.");
assert.equal(buildImplementationTasksCreateLoginRequiredMessage(), "제작 할 일을 만들려면 먼저 로그인하세요.");
assert.equal(buildImplementationTasksAlreadyExistMessage(), "이 아이디어에는 이미 기본 제작 할 일이 있습니다.");
assert.deepEqual(buildImplementationTaskCreateControlStates({
  hasUser: true,
  isBusy: false,
}), {
  defaultTasks: {
    disabled: false,
    label: "기본 태스크 생성",
  },
  manualTask: {
    disabled: false,
    label: "태스크 추가",
  },
});
assert.deepEqual(buildImplementationTaskCreateControlStates({
  hasUser: false,
  isBusy: true,
}), {
  defaultTasks: {
    disabled: true,
    label: "기본 태스크 생성",
  },
  manualTask: {
    disabled: true,
    label: "태스크 추가",
  },
});
assert.deepEqual(buildImplementationTaskStartControlState({
  canManage: true,
  isBusy: false,
}), {
  disabled: false,
  label: "진행 시작",
});
assert.deepEqual(buildImplementationTaskStartControlState({
  canManage: false,
  isBusy: true,
}), {
  disabled: true,
  label: "진행 시작",
});
assert.deepEqual(buildImplementationTaskEvidenceEditControlState({
  canManage: true,
  isBusy: false,
}), {
  disabled: false,
  placeholder: "완료 증거, PR/커밋, 스모크 결과, 남은 리스크",
});
assert.deepEqual(buildImplementationTaskEvidenceSaveControlState({
  canManage: true,
  currentEvidence: "old evidence",
  draftEvidence: "new evidence",
  isBusy: false,
}), {
  disabled: false,
  label: "증거 저장",
});
assert.deepEqual(buildImplementationTaskEvidenceSaveControlState({
  canManage: true,
  currentEvidence: "old evidence",
  draftEvidence: "old evidence",
  isBusy: false,
}), {
  disabled: true,
  label: "증거 저장",
});
assert.deepEqual(buildImplementationTaskStatusControlState({
  canManage: true,
  currentStatus: "todo",
  isBusy: false,
  nextStatus: "doing",
  statusLabel: "진행 중",
}), {
  disabled: false,
  label: "진행 중",
});
assert.deepEqual(buildImplementationTaskStatusControlState({
  canManage: true,
  currentStatus: "doing",
  isBusy: false,
  nextStatus: "doing",
  statusLabel: "진행 중",
}), {
  disabled: true,
  label: "진행 중",
});
assert.ok(
  ideaWorkbenchSource.includes("implementationTaskCreateControlStates.defaultTasks.disabled"),
  "IdeaWorkbench should render default implementation task create disabled state from shared helper.",
);
assert.ok(
  ideaWorkbenchSource.includes("implementationTaskCreateControlStates.manualTask.disabled"),
  "IdeaWorkbench should render manual implementation task create disabled state from shared helper.",
);
assert.ok(
  ideaWorkbenchSource.includes("nextImplementationTaskStartControlState.disabled"),
  "IdeaWorkbench should render next implementation task start disabled state from shared helper.",
);
assert.ok(
  ideaWorkbenchSource.includes("buildImplementationTaskEvidenceSaveControlState"),
  "IdeaWorkbench should resolve implementation task evidence save state from shared helper.",
);
assert.ok(
  ideaWorkbenchSource.includes("buildImplementationTaskStatusControlState"),
  "IdeaWorkbench should resolve implementation task status button state from shared helper.",
);
assert.equal(buildManualImplementationTaskCreatedMessage(), "제작 할 일을 추가했습니다.");
assert.equal(buildManualImplementationTaskLoginRequiredMessage(), "제작 할 일을 추가하려면 먼저 로그인하세요.");
assert.equal(buildManualImplementationTaskTitleRequiredMessage(), "제작 할 일 제목은 필수입니다.");
assert.equal(
  buildImplementationTaskStatusChangedMessage({ statusLabel: "진행 중", taskTitle: "핵심 입력 구현" }),
  "핵심 입력 구현 상태를 진행 중(으)로 변경했습니다.",
);
assert.equal(
  buildImplementationTaskStatusUpdatePermissionDeniedMessage(),
  "제작 할 일 작성자 또는 협업 공간 관리자만 이 할 일을 수정할 수 있습니다.",
);
assert.equal(buildImplementationTaskEvidenceSavedMessage(), "제작 할 일 근거를 저장했습니다.");
assert.equal(
  buildImplementationTaskEvidenceSavePermissionDeniedMessage(),
  "제작 할 일 작성자 또는 협업 공간 관리자만 이 근거를 저장할 수 있습니다.",
);
assert.equal(
  getImplementationTaskTableErrorMessage({ code: "42P01", message: "relation does not exist" }),
  "implementation_tasks 테이블이 아직 없습니다. 이번 배포의 Supabase SQL을 먼저 실행하세요.",
);
assert.equal(getImplementationTaskTableErrorMessage({ code: "42501", message: "permission denied" }), "permission denied");

console.log("Implementation task rows smoke passed.");
