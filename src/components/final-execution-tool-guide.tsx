"use client";

import type { ReactNode } from "react";
import { Clipboard, ClipboardList, Code2 } from "lucide-react";

import type { ExternalBuildToolProfile } from "@/lib/build-delivery";

type CommandPathItem = readonly [title: string, detail: string];

type FinalExecutionToolGuideProps = {
  activeExternalBuildTool: Pick<
    ExternalBuildToolProfile,
    "handoffNote" | "handoffSteps" | "key" | "label" | "packageFiles" | "startFileName" | "startMethod"
  >;
  commandPathItems: ReadonlyArray<CommandPathItem>;
  copyDraft: (body: string, label: string) => Promise<void> | void;
  guideDraft: string;
  isLiveExternalDelivery: boolean;
  mcpConfigDraft: string;
  nextTaskCommand: string;
  setupCommand: string;
  successCriterion: string;
  toolFolder: string;
};

type GuideStepProps = {
  children: ReactNode;
};

function GuideStep({ children }: GuideStepProps) {
  return <li className="border border-slate-200 bg-slate-50 p-3">{children}</li>;
}

export function FinalExecutionToolGuide({
  activeExternalBuildTool,
  commandPathItems,
  copyDraft,
  guideDraft,
  isLiveExternalDelivery,
  mcpConfigDraft,
  nextTaskCommand,
  setupCommand,
  successCriterion,
  toolFolder,
}: FinalExecutionToolGuideProps) {
  const isCursorExternalDelivery = activeExternalBuildTool.key === "cursor";
  const isCodexExternalDelivery = activeExternalBuildTool.key === "codex";
  const isClaudeCodeExternalDelivery = activeExternalBuildTool.key === "claude_code";
  const isAntigravityExternalDelivery = activeExternalBuildTool.key === "antigravity";
  const usesNumberedLiveGuide =
    isCursorExternalDelivery || isCodexExternalDelivery || isClaudeCodeExternalDelivery || isAntigravityExternalDelivery;
  const startPromptTarget = isCursorExternalDelivery
    ? "Composer"
    : isAntigravityExternalDelivery
      ? "Antigravity Agent 첫 메시지"
      : isClaudeCodeExternalDelivery
        ? "Claude Code 첫 메시지"
        : "Codex 첫 메시지";
  const startPromptStepNumber = isCursorExternalDelivery ? "8" : usesNumberedLiveGuide ? "7" : "6";
  const progressStepNumber = isCursorExternalDelivery ? "9" : usesNumberedLiveGuide ? "8" : "7";

  return (
    <div className="border border-slate-200 bg-white p-4">
      <div className="text-sm font-semibold text-slate-950">
        {isLiveExternalDelivery ? "실행만 하기" : "외부 도구 전달 방식"}
      </div>
      {isLiveExternalDelivery ? (
        <>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            아래 세 줄만 끝내면 {activeExternalBuildTool.label}가 제작 패키지, 작업 목록, 진행 기록 파일을 읽을 수
            있습니다. 도구별 세부 설정은 필요할 때만 펼쳐 확인하세요.
          </p>
          <div
            data-smoke="final-execution-command-path"
            className="mt-3 grid gap-px bg-slate-200 text-sm leading-6 text-slate-700"
          >
            {commandPathItems.map(([title, detail]) => (
              <div key={title} className="bg-slate-50 p-3">
                <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{title}</div>
                <p className="mt-1 text-sm leading-6 text-slate-700">{detail}</p>
              </div>
            ))}
          </div>
          <div data-smoke="final-execution-success-criterion" className="mt-3 border border-emerald-200 bg-emerald-50 px-3 py-2">
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-700">성공 기준</div>
            <p className="mt-1 text-sm font-semibold leading-6 text-emerald-950">{successCriterion}</p>
          </div>
          <details data-smoke="final-execution-detail-guide" className="mt-3 border border-slate-200 bg-slate-50 p-3">
            <summary className="cursor-pointer list-none">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-sm font-semibold text-slate-950">
                    {activeExternalBuildTool.label}에서 시작하는 순서 자세히 보기
                  </div>
                  <p className="mt-1 text-xs leading-5 text-slate-600">
                    IDE 설정, 터미널 에이전트 시작, 자동 반영 확인이 필요할 때만 엽니다.
                  </p>
                </div>
                <span className="avl-pill avl-pill-neutral">상세 안내</span>
              </div>
            </summary>
            <ol className="mt-3 grid gap-3 text-sm leading-6 text-slate-600">
              {isCursorExternalDelivery ? (
                <>
                  <GuideStep>
                    1. <span className="font-semibold text-slate-950">Cursor 연결 파일 받기</span>를 눌러 PowerShell 파일을
                    받습니다.
                  </GuideStep>
                  <GuideStep>2. 받은 파일을 실제 개발할 프로젝트 폴더의 루트로 옮깁니다.</GuideStep>
                  <GuideStep>3. Cursor에서 그 프로젝트 폴더를 엽니다.</GuideStep>
                  <GuideStep>
                    4. Cursor 터미널 또는 PowerShell에서{" "}
                    <span className="font-semibold text-slate-950">설치 명령</span>을 먼저 실행합니다.
                  </GuideStep>
                  <GuideStep>
                    5. 같은 터미널에서 <span className="font-semibold text-slate-950">확인 명령</span>을 실행해 첫 작업이
                    읽히는지 확인합니다.
                  </GuideStep>
                  <GuideStep>
                    6. Cursor를 다시 열고 Settings &gt; MCP의 Workspace MCP Servers에서{" "}
                    <span className="font-semibold text-slate-950">ai-venture-lab</span>이 보이는지 확인합니다. 처음 1회는
                    토글을 직접 켜야 할 수 있습니다.
                  </GuideStep>
                  <GuideStep>
                    7. <span className="font-semibold text-slate-950">ai-venture-lab</span>이 Enabled 상태이고 도구가
                    활성화됐는지 확인합니다.
                  </GuideStep>
                </>
              ) : null}
              {isAntigravityExternalDelivery ? (
                <>
                  <GuideStep>
                    1. <span className="font-semibold text-slate-950">Google Antigravity 연결 파일 받기</span>를 눌러
                    PowerShell 파일을 받습니다.
                  </GuideStep>
                  <GuideStep>2. 받은 파일을 실제 개발할 프로젝트 폴더의 루트로 옮깁니다.</GuideStep>
                  <GuideStep>3. Antigravity에서 그 프로젝트 폴더를 엽니다.</GuideStep>
                  <GuideStep>
                    4. Antigravity 터미널 또는 PowerShell에서{" "}
                    <span className="font-semibold text-slate-950">설치 명령</span>을 먼저 실행합니다.
                  </GuideStep>
                  <GuideStep>
                    5. 같은 터미널에서 <span className="font-semibold text-slate-950">확인 명령</span>을 실행해 첫 작업이
                    읽히는지 확인합니다.
                  </GuideStep>
                  <GuideStep>
                    6. 프로젝트 안의 <span className="font-mono text-xs">.antigravity/mcp_config.json</span>과 지침 파일이
                    생성됐는지 확인합니다.
                  </GuideStep>
                </>
              ) : null}
              {isClaudeCodeExternalDelivery ? (
                <>
                  <GuideStep>
                    1. <span className="font-semibold text-slate-950">Claude Code 연결 파일 받기</span>를 눌러 PowerShell
                    파일을 받습니다.
                  </GuideStep>
                  <GuideStep>2. 받은 파일을 실제 개발할 프로젝트 폴더의 루트로 옮깁니다.</GuideStep>
                  <GuideStep>3. Windows Terminal 또는 PowerShell에서 그 프로젝트 루트를 엽니다.</GuideStep>
                  <GuideStep>
                    4. 프로젝트 루트에서 <span className="font-semibold text-slate-950">설치 명령</span>을 실행합니다.
                  </GuideStep>
                  <GuideStep>
                    5. 같은 터미널에서 <span className="font-semibold text-slate-950">확인 명령</span>을 실행해 첫 작업이
                    읽히는지 확인합니다.
                  </GuideStep>
                  <GuideStep>
                    6. 같은 프로젝트 루트에서 Claude Code를 실행하고 <span className="font-mono text-xs">/mcp</span>로{" "}
                    <span className="font-semibold text-slate-950">ai-venture-lab</span> 연결을 확인합니다.
                  </GuideStep>
                </>
              ) : null}
              {isCodexExternalDelivery ? (
                <>
                  <GuideStep>
                    1. <span className="font-semibold text-slate-950">Codex 연결 파일 받기</span>를 눌러 PowerShell 파일을
                    받습니다.
                  </GuideStep>
                  <GuideStep>2. 받은 파일을 실제 개발할 프로젝트 폴더의 루트로 옮깁니다.</GuideStep>
                  <GuideStep>3. Codex를 그 프로젝트 루트에서 엽니다.</GuideStep>
                  <GuideStep>
                    4. 프로젝트 루트 터미널 또는 PowerShell에서{" "}
                    <span className="font-semibold text-slate-950">설치 명령</span>을 실행합니다.
                  </GuideStep>
                  <GuideStep>
                    5. 같은 터미널에서 <span className="font-semibold text-slate-950">확인 명령</span>을 실행해 첫 작업이
                    읽히는지 확인합니다.
                  </GuideStep>
                  <GuideStep>
                    6. <span className="font-mono text-xs">AGENTS.ai-venture-lab.md</span>와{" "}
                    <span className="font-mono text-xs">{activeExternalBuildTool.startFileName}</span>이 생성됐는지 확인합니다.
                  </GuideStep>
                </>
              ) : null}
              <GuideStep>
                {startPromptStepNumber}. <span className="font-mono text-xs">{activeExternalBuildTool.startFileName}</span>{" "}
                내용을 {startPromptTarget}에 붙여 넣고 첫 작업을 시작합니다.
              </GuideStep>
              <GuideStep>
                {progressStepNumber}. 작업이 끝나면{" "}
                {isCursorExternalDelivery || isClaudeCodeExternalDelivery ? (
                  <span className="font-mono text-xs">venture_record_progress</span>
                ) : (
                  <span className="font-mono text-xs">{toolFolder}/venture-lab-cli.mjs record-progress</span>
                )}{" "}
                로 완료 보고를 남기게 합니다. Venture Lab 작업 상태가 자동으로 갱신됩니다.
              </GuideStep>
            </ol>
          </details>
          <div
            data-smoke="final-execution-command-sequence"
            className="mt-3 border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold leading-6 text-blue-950"
          >
            같은 프로젝트 루트 터미널에서 1. 설치 명령, 2. 확인 명령 순서로 실행합니다.
          </div>
          <div className="mt-3 border border-slate-200 bg-slate-50 p-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-xs font-semibold text-slate-950">먼저 실행할 설치 명령</div>
              <button
                type="button"
                onClick={() => copyDraft(setupCommand, "설치 명령")}
                className="avl-btn avl-btn-secondary h-8 px-2.5 text-xs"
              >
                <Clipboard size={14} />
                설치 명령 복사
              </button>
            </div>
            <div className="mt-2 rounded-none bg-slate-950 px-3 py-2 font-mono text-xs text-white break-all">
              {setupCommand}
            </div>
          </div>
          <div className="mt-3 border border-slate-200 bg-slate-50 p-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-xs font-semibold text-slate-950">설치 후 확인 명령</div>
              <button
                type="button"
                onClick={() => copyDraft(nextTaskCommand, "확인 명령")}
                className="avl-btn avl-btn-secondary h-8 px-2.5 text-xs"
              >
                <Clipboard size={14} />
                확인 명령 복사
              </button>
            </div>
            <div className="mt-2 rounded-none bg-slate-950 px-3 py-2 font-mono text-xs text-white break-all">
              {nextTaskCommand}
            </div>
          </div>
          <p className="mt-3 text-xs leading-5 text-slate-500">
            실행 위치는 다운로드 폴더가 아니라 실제 개발할 프로젝트 루트입니다. 이 스크립트가 그 위치에{" "}
            <span className="font-mono">{toolFolder}/venture-lab-cli.mjs</span>, 자동 반영 연결 정보, 제작 패키지와 작업 목록을
            만듭니다.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {mcpConfigDraft ? (
              <button
                type="button"
                onClick={() => copyDraft(mcpConfigDraft, `${activeExternalBuildTool.label} MCP 설정`)}
                disabled={!mcpConfigDraft}
                className="avl-btn avl-btn-secondary h-10 px-3 disabled:opacity-50"
              >
                <Code2 size={16} />
                MCP 설정 복사
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => copyDraft(guideDraft, `${activeExternalBuildTool.label} 연결 가이드`)}
              disabled={!guideDraft}
              className="avl-btn avl-btn-secondary h-10 px-3 disabled:opacity-50"
            >
              <ClipboardList size={16} />
              가이드 복사
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="mt-2 text-sm leading-6 text-slate-600">{activeExternalBuildTool.startMethod}</p>
          <ol className="mt-3 grid gap-2 text-sm leading-6 text-slate-600">
            {activeExternalBuildTool.handoffSteps.map((step, index) => (
              <GuideStep key={step}>
                {index + 1}. {step}
              </GuideStep>
            ))}
          </ol>
          <div className="mt-3 border border-slate-200 bg-slate-50 p-3">
            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">함께 받는 파일 기준</div>
            <div className="mt-2 grid gap-2 text-xs leading-5 text-slate-600 sm:grid-cols-2">
              {activeExternalBuildTool.packageFiles.map((file) => (
                <div key={file} className="border border-slate-200 bg-white p-2">
                  {file}
                </div>
              ))}
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">{activeExternalBuildTool.handoffNote}</p>
          </div>
        </>
      )}
    </div>
  );
}
