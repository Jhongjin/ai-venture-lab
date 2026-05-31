import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

const modulePath = path.join(process.cwd(), "src/lib/extraction-candidate-match.ts");
const textMatchModuleUrl = pathToFileURL(path.join(process.cwd(), "src/lib/text-match-utils.ts")).href;
const source = readFileSync(modulePath, "utf8").replace(
  'from "./text-match-utils";',
  `from ${JSON.stringify(textMatchModuleUrl)};`,
);
const { outputText } = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
  fileName: modulePath,
});
const moduleUrl = `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`;
const { candidateSimilarityScore, findBestCandidateMatch, findSimilarIdea } = await import(moduleUrl);

const candidate = {
  id: "candidate-care-console",
  name: "돌봄 운영 콘솔",
  one_liner: "보호자와 케어센터가 돌봄 기록과 일정을 공유하는 콘솔",
  target_user: "가족 보호자와 케어센터 운영자",
  buyer: "케어센터",
  signal: "돌봄 일정과 기록이 흩어져 조율 시간이 반복 낭비됨",
  firstPrototypeScope: "가족 초대, 돌봄 일정, 일일 기록, 이슈 알림",
};

const matchingIdea = {
  name: "돌봄 운영 콘솔",
  one_liner: "보호자와 센터가 돌봄 기록을 함께 확인",
  target_user: "가족 보호자와 케어센터 운영자",
  buyer: "케어센터",
  signal: "조율 시간이 반복 낭비됨",
};

const unrelatedIdea = {
  name: "숏폼 영상 편집 도구",
  one_liner: "사진과 영상을 자동으로 숏폼 편집",
  target_user: "콘텐츠 제작자",
  buyer: "개인 크리에이터",
  signal: "영상 편집 시간이 오래 걸림",
};

const similarMatch = findSimilarIdea(candidate, [unrelatedIdea, matchingIdea]);
assert.equal(similarMatch?.idea.name, "돌봄 운영 콘솔");
assert.equal(similarMatch?.score, 100);
assert.equal(similarMatch?.reason, "이름이 거의 같습니다.");

assert.equal(findSimilarIdea(candidate, [unrelatedIdea]), null);

const replayMatch = {
  ...candidate,
  id: "ai-care-console",
  name: "돌봄 기록 콘솔",
  signal: "가족과 센터 사이 돌봄 기록이 흩어져 확인이 늦어짐",
};
const replayMiss = {
  ...candidate,
  id: "ai-video-tool",
  name: "영상 편집 도구",
  one_liner: "앨범 사진을 숏폼 영상으로 자동 편집",
  target_user: "콘텐츠 제작자",
  buyer: "개인 크리에이터",
  signal: "편집 시간이 오래 걸림",
  firstPrototypeScope: "사진 업로드, 스토리보드, 1분 영상",
};

assert.ok(candidateSimilarityScore(candidate, replayMatch) > candidateSimilarityScore(candidate, replayMiss));
assert.equal(findBestCandidateMatch(candidate, [replayMiss, replayMatch])?.item.id, "ai-care-console");
assert.equal(findBestCandidateMatch(candidate, [replayMiss, replayMatch], new Set(["ai-care-console"]))?.item.id, "ai-video-tool");

console.log("Extraction candidate match smoke passed.");
