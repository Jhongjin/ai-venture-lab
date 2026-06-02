import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

const workbenchTasksUrl = pathToFileURL(path.join(process.cwd(), "src/lib/workbench-tasks.ts")).href;
const modulePath = path.join(process.cwd(), "src/lib/workbench-current-action-copy.ts");
const source = readFileSync(modulePath, "utf8").replace(
  'from "@/lib/workbench-tasks";',
  `from ${JSON.stringify(workbenchTasksUrl)};`,
);
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  fileName: modulePath,
});
const moduleUrl = `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`;
const {
  buildWorkbenchCurrentActionDisplayState,
  getWorkbenchOperatorActionItems,
  getWorkbenchOperatorGateNote,
} = await import(moduleUrl);

const workbenchTasks = [
  {
    description: "최종 실행으로 넘깁니다.",
    id: "launch",
    label: "최종 실행",
    status: "40%",
  },
  {
    description: "성과를 확인합니다.",
    id: "learning",
    label: "성과 확인",
    status: "대기",
  },
];

const launchState = buildWorkbenchCurrentActionDisplayState({
  activeTask: "launch",
  canEnterLaunch: false,
  hasMarketScanArtifact: true,
  hasOutdatedMarketScanArtifact: false,
  hasSavedDevelopmentAutoPackage: false,
  isDiscardedIdea: false,
  isScoreEvaluationSaved: true,
  isValidationBundleSaved: true,
  nextLaunchBlocker: {
    detail: "제작 패키지를 먼저 저장하세요.",
    label: "제작 패키지",
  },
  selectedIdea: {
    decision: "ship",
    stage: "launch",
  },
  workbenchTasks,
});
assert.equal(launchState.activeTaskLabel, "최종 실행");
assert.equal(launchState.progressLabel, "STEP 7 최종 실행");
assert.equal(launchState.title, "최종 실행 전 준비가 남아 있습니다. 이 단계는 준비가 끝나야 열립니다.");
assert.match(launchState.detail, /제작 패키지: 제작 패키지를 먼저 저장하세요\./);
assert.equal(launchState.gateNote, "연결 파일을 받은 뒤 실제 외부 프로젝트에서 실행을 시작합니다.");
assert.deepEqual(launchState.actionItems, ["준비 완료 확인", "연결 파일 받기", "선택한 개발 방식으로 실행"]);

const discardedState = buildWorkbenchCurrentActionDisplayState({
  activeTask: "score",
  canEnterLaunch: true,
  hasMarketScanArtifact: false,
  hasOutdatedMarketScanArtifact: false,
  hasSavedDevelopmentAutoPackage: true,
  isDiscardedIdea: true,
  isScoreEvaluationSaved: false,
  isValidationBundleSaved: false,
  nextLaunchBlocker: null,
  selectedIdea: {
    decision: "kill",
    stage: "score",
  },
  workbenchTasks: [],
});
assert.equal(discardedState.activeTaskLabel, "현재 단계");
assert.equal(discardedState.progressLabel, "삭제됨");
assert.match(discardedState.title, /삭제한 아이디어/);

assert.deepEqual(getWorkbenchOperatorActionItems("orchestration"), [
  "작업 순서 자동 만들기",
  "T-001 확인",
  "하단 다음 단계",
]);
assert.equal(getWorkbenchOperatorGateNote("development"), "제작 패키지를 저장하면 STEP 6 작업 순서 확인이 열립니다.");

console.log("Workbench current action copy smoke passed.");
