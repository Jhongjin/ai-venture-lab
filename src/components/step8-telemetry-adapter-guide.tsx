"use client";

import { Clipboard, Code2, Save } from "lucide-react";

type Step8TelemetryAdapterGuideProps = {
  canSave: boolean;
  ideaId: string;
  isBusy: boolean;
  onCopyDraft: (body: string, label: string) => void;
  onSaveGuide: () => void;
  telemetryAdapterGuideDraft: string;
  telemetryClientHelperSnippet: string;
  telemetryEnvSnippet: string;
  telemetryNextRouteSnippet: string;
  telemetrySmokeCommandSnippet: string;
};

export function Step8TelemetryAdapterGuide({
  canSave,
  ideaId,
  isBusy,
  onCopyDraft,
  onSaveGuide,
  telemetryAdapterGuideDraft,
  telemetryClientHelperSnippet,
  telemetryEnvSnippet,
  telemetryNextRouteSnippet,
  telemetrySmokeCommandSnippet,
}: Step8TelemetryAdapterGuideProps) {
  const telemetrySnippetCards = [
    {
      label: "1. 서버 환경변수",
      detail: "외부 앱 서버에만 넣고 브라우저 번들에는 절대 노출하지 않습니다.",
      action: "환경변수 복사",
      body: telemetryEnvSnippet,
    },
    {
      label: "2. Next.js 서버 라우트",
      detail: "브라우저 요청을 서버에서 받아 AI Venture Lab 수집 API로 중계합니다.",
      action: "라우트 복사",
      body: telemetryNextRouteSnippet,
    },
    {
      label: "3. 브라우저 helper",
      detail: "제품 화면에서는 비밀값 없이 내부 서버 라우트만 호출합니다.",
      action: "helper 복사",
      body: telemetryClientHelperSnippet,
    },
    {
      label: "4. 운영 확인",
      detail: "수집 경로, 서버 비밀값, 저장 권한이 정상인지 한 번에 확인합니다.",
      action: "스모크 복사",
      body: telemetrySmokeCommandSnippet,
    },
  ];

  return (
    <div className="mt-4 avl-card p-4 text-slate-900">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="text-[11px] font-semibold tracking-[0.14em] text-slate-500">제작팀 전달</div>
          <h3 className="mt-2 text-base font-semibold text-slate-950">첫 버전 사용 신호 연결</h3>
          <p className="mt-1 text-sm leading-6 text-slate-600">출시된 앱의 사용자 행동을 받아오는 전달용 정보입니다.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onCopyDraft(telemetryAdapterGuideDraft, "성과 신호 연결 가이드")}
            disabled={!telemetryAdapterGuideDraft}
            className="avl-btn avl-btn-secondary h-10 px-3 disabled:opacity-50"
          >
            <Clipboard size={16} />
            연결 가이드 복사
          </button>
          <button
            type="button"
            onClick={onSaveGuide}
            disabled={isBusy || !canSave || !telemetryAdapterGuideDraft}
            className="avl-btn avl-btn-primary h-10 px-3 disabled:opacity-50"
          >
            <Save size={16} />
            연결 가이드 저장
          </button>
        </div>
      </div>
      <details className="mt-4 border border-slate-200 bg-slate-50 p-3">
        <summary className="cursor-pointer list-none text-sm font-semibold text-slate-950">연결 정보 열기</summary>
        <div className="mt-3 border border-slate-200 bg-white p-3">
          <p className="text-sm leading-6 text-slate-600">
            아래 값은 개발자나 Codex 작업 세션에 전달할 때만 확인합니다. 비밀값은 브라우저나 문서에 저장하지 않습니다.
          </p>
          <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,0.9fr)_minmax(320px,0.7fr)]">
            <div className="border border-slate-200 bg-slate-50 p-3">
              <div className="text-xs font-semibold tracking-[0.14em] text-slate-500">수집 주소</div>
              <code className="mt-2 block break-all border border-slate-200 bg-slate-950 px-3 py-2 text-xs leading-5 text-white">
                POST https://ai-venture-lab.vercel.app/api/telemetry/ingest
              </code>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                헤더에는 서버 전용 `TELEMETRY_INGEST_SECRET`을 Bearer 토큰으로 넣습니다.
              </p>
            </div>
            <div className="border border-slate-200 bg-slate-50 p-3">
              <div className="text-xs font-semibold tracking-[0.14em] text-slate-500">아이디어 ID</div>
              <code className="mt-2 block break-all border border-slate-200 bg-white px-3 py-2 text-xs leading-5 text-slate-700">
                {ideaId}
              </code>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                외부 앱 이벤트는 이 ID로 현재 아이디어의 성과 확인 화면에 연결됩니다.
              </p>
            </div>
          </div>
          <div className="mt-3 grid gap-3 xl:grid-cols-2">
            {telemetrySnippetCards.map((snippet) => (
              <div key={snippet.label} className="border border-slate-200 bg-white p-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                      {snippet.label}
                    </div>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{snippet.detail}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onCopyDraft(snippet.body, snippet.label)}
                    disabled={!snippet.body}
                    className="avl-btn avl-btn-secondary h-9 shrink-0 px-3 text-xs disabled:opacity-50"
                  >
                    <Code2 size={14} />
                    {snippet.action}
                  </button>
                </div>
                <pre className="mt-3 max-h-36 overflow-auto border border-slate-200 bg-slate-950 p-3 text-xs leading-5 text-slate-100">
                  <code>{snippet.body}</code>
                </pre>
              </div>
            ))}
          </div>
        </div>
      </details>
    </div>
  );
}
