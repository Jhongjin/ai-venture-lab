"use client";

type FinalExecutionSetupChecksProps = {
  progressPath: string;
  startFileName: string;
};

export function FinalExecutionSetupChecks({ progressPath, startFileName }: FinalExecutionSetupChecksProps) {
  const installResultItems = [
    ["START 파일", `${startFileName} 첫 메시지`],
    ["작업 목록", "T-001부터 볼 수 있는 제작 순서"],
    ["진행 기록", `${progressPath} 자동 반영 백업`],
  ] as const;
  const recoveryItems = [
    ["확인 명령 실패", "대부분 실행 위치가 다릅니다"],
    ["먼저 볼 것", "package.json, app 또는 src가 보이는지 확인"],
    ["다시 할 것", "외부 프로젝트 루트로 이동한 뒤 확인 명령만 다시 실행"],
  ] as const;

  return (
    <>
      <details data-smoke="final-execution-install-result" className="border border-emerald-200 bg-emerald-50 p-4">
        <summary className="cursor-pointer list-none text-sm font-semibold text-emerald-950">
          설치 후 생기는 파일 보기
        </summary>
        <p className="mt-2 text-sm leading-6 text-emerald-950">
          처음에는 설치 명령과 확인 명령만 실행하면 됩니다. 파일 구성은 확인이 필요할 때만 봅니다.
        </p>
        <div data-smoke="final-execution-install-result-files" className="mt-3 grid gap-px bg-emerald-200 sm:grid-cols-3">
          {installResultItems.map(([label, detail]) => (
            <div key={label} className="bg-white px-3 py-2">
              <div className="text-xs font-semibold tracking-[0.14em] text-emerald-700">{label}</div>
              <p className="mt-1 text-sm leading-6 text-slate-700">{detail}</p>
            </div>
          ))}
        </div>
      </details>
      <div data-smoke="final-execution-root-check" className="border border-slate-200 bg-slate-50 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="text-sm font-semibold text-slate-950">실행 위치 확인</div>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              연결 파일은 실제 앱 파일이 있는 외부 프로젝트 루트에서만 실행합니다. AI Venture Lab 폴더나 다운로드
              폴더에서 실행하지 않습니다.
            </p>
          </div>
          <div className="grid gap-2 text-sm leading-6 text-slate-700 sm:min-w-[420px] sm:grid-cols-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">실행할 곳</div>
              <div className="mt-1 font-semibold text-slate-950">외부 프로젝트 루트</div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">아닌 곳</div>
              <div className="mt-1 font-semibold text-rose-700">다운로드 폴더, AI Venture Lab 폴더</div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">확인 방법</div>
              <div className="mt-1 font-semibold text-slate-950">package.json, app, src가 보이는 곳</div>
            </div>
          </div>
        </div>
        <div
          data-smoke="final-execution-folder-check-question"
          className="mt-3 border border-emerald-200 bg-white px-3 py-2 text-sm leading-6 text-emerald-950"
        >
          실행 전 5초 확인: 지금 터미널 폴더에 package.json, app 또는 src가 보이면 설치 명령을 실행합니다. 안 보이면 먼저
          실제 프로젝트 루트로 이동하세요. 아직 앱 프로젝트가 없다면 새 폴더를 만든 뒤 그 폴더에서 실행하세요. 현재 폴더가
          AI Venture Lab 프로젝트라면 새 앱 프로젝트로 이동한 뒤 실행하세요.
        </div>
        <div data-smoke="final-execution-check-failure-recovery" className="mt-3 grid gap-px bg-rose-200 sm:grid-cols-3">
          {recoveryItems.map(([label, detail]) => (
            <div key={label} className="bg-white px-3 py-3">
              <div className="text-xs font-semibold tracking-[0.14em] text-rose-700">{label}</div>
              <p className="mt-1 text-sm font-semibold leading-6 text-slate-950">{detail}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
