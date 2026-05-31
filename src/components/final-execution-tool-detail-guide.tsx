"use client";

import type { ReactNode } from "react";

import type { ExternalBuildToolProfile } from "@/lib/build-delivery";

type FinalExecutionToolDetailGuideProps = {
  activeExternalBuildTool: Pick<ExternalBuildToolProfile, "key" | "label" | "startFileName">;
  toolFolder: string;
};

type GuideStepProps = {
  children: ReactNode;
};

function GuideStep({ children }: GuideStepProps) {
  return <li className="border border-slate-200 bg-slate-50 p-3">{children}</li>;
}

export function FinalExecutionToolDetailGuide({
  activeExternalBuildTool,
  toolFolder,
}: FinalExecutionToolDetailGuideProps) {
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
  const toolSpecificGuideSteps: ReactNode[] = isCursorExternalDelivery
    ? [
        <>
          <span className="font-semibold text-slate-950">Cursor 연결 파일 받기</span>를 눌러 PowerShell 파일을 받습니다.
        </>,
        "받은 파일을 실제 개발할 프로젝트 폴더의 루트로 옮깁니다.",
        "Cursor에서 그 프로젝트 폴더를 엽니다.",
        <>
          Cursor 터미널 또는 PowerShell에서 <span className="font-semibold text-slate-950">설치 명령</span>을 먼저
          실행합니다.
        </>,
        <>
          같은 터미널에서 <span className="font-semibold text-slate-950">확인 명령</span>을 실행해 T-001 첫 작업이 읽히는지
          확인합니다.
        </>,
        <>
          T-001이 보이면 Cursor를 다시 열고 Settings &gt; MCP의 Workspace MCP Servers에서{" "}
          <span className="font-semibold text-slate-950">ai-venture-lab</span>이 보이는지 확인합니다. 처음 1회는 토글을 직접
          켜야 할 수 있습니다.
        </>,
        <>
          <span className="font-semibold text-slate-950">ai-venture-lab</span>이 Enabled 상태이고 도구가 활성화됐는지
          확인합니다.
        </>,
      ]
    : isAntigravityExternalDelivery
      ? [
          <>
            <span className="font-semibold text-slate-950">Google Antigravity 연결 파일 받기</span>를 눌러 PowerShell 파일을
            받습니다.
          </>,
          "받은 파일을 실제 개발할 프로젝트 폴더의 루트로 옮깁니다.",
          "Antigravity에서 그 프로젝트 폴더를 엽니다.",
          <>
            Antigravity 터미널 또는 PowerShell에서 <span className="font-semibold text-slate-950">설치 명령</span>을 먼저
            실행합니다.
          </>,
          <>
            같은 터미널에서 <span className="font-semibold text-slate-950">확인 명령</span>을 실행해 T-001 첫 작업이 읽히는지
            확인합니다.
          </>,
          <>
            프로젝트 안의 <span className="font-mono text-xs">.antigravity/mcp_config.json</span>과 지침 파일이 생성됐는지
            확인합니다.
          </>,
        ]
      : isClaudeCodeExternalDelivery
        ? [
            <>
              <span className="font-semibold text-slate-950">Claude Code 연결 파일 받기</span>를 눌러 PowerShell 파일을
              받습니다.
            </>,
            "받은 파일을 실제 개발할 프로젝트 폴더의 루트로 옮깁니다.",
            "Windows Terminal 또는 PowerShell에서 그 프로젝트 루트를 엽니다.",
            <>
              프로젝트 루트에서 <span className="font-semibold text-slate-950">설치 명령</span>을 실행합니다.
            </>,
            <>
              같은 터미널에서 <span className="font-semibold text-slate-950">확인 명령</span>을 실행해 T-001 첫 작업이 읽히는지
              확인합니다.
            </>,
            <>
              같은 프로젝트 루트에서 Claude Code를 실행하고 <span className="font-mono text-xs">/mcp</span>로{" "}
              <span className="font-semibold text-slate-950">ai-venture-lab</span> 연결을 확인합니다.
            </>,
          ]
        : isCodexExternalDelivery
          ? [
              <>
                <span className="font-semibold text-slate-950">Codex 연결 파일 받기</span>를 눌러 PowerShell 파일을 받습니다.
              </>,
              "받은 파일을 실제 개발할 프로젝트 폴더의 루트로 옮깁니다.",
              "Codex를 그 프로젝트 루트에서 엽니다.",
              <>
                프로젝트 루트 터미널 또는 PowerShell에서 <span className="font-semibold text-slate-950">설치 명령</span>을
                실행합니다.
              </>,
              <>
                같은 터미널에서 <span className="font-semibold text-slate-950">확인 명령</span>을 실행해 T-001 첫 작업이 읽히는지
                확인합니다.
              </>,
              <>
                <span className="font-mono text-xs">AGENTS.ai-venture-lab.md</span>와{" "}
                <span className="font-mono text-xs">{activeExternalBuildTool.startFileName}</span>이 생성됐는지 확인합니다.
              </>,
            ]
          : [];
  const startPromptStepNumber = usesNumberedLiveGuide ? String(toolSpecificGuideSteps.length + 1) : "6";
  const progressStepNumber = usesNumberedLiveGuide ? String(toolSpecificGuideSteps.length + 2) : "7";

  return (
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
        {toolSpecificGuideSteps.map((step, index) => (
          <GuideStep key={index}>
            {index + 1}. {step}
          </GuideStep>
        ))}
        <GuideStep>
          {startPromptStepNumber}. <span className="font-mono text-xs">{activeExternalBuildTool.startFileName}</span>{" "}
          내용은 확인 명령에서 T-001을 본 뒤 {startPromptTarget}에 붙여 넣고 첫 작업을 시작합니다.
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
  );
}
