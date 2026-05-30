"use client";

import { Code2 } from "lucide-react";

type Step8TelemetrySnippetCardsProps = {
  onCopyDraft: (body: string, label: string) => void;
  telemetryClientHelperSnippet: string;
  telemetryEnvSnippet: string;
  telemetryNextRouteSnippet: string;
  telemetrySmokeCommandSnippet: string;
};

export function Step8TelemetrySnippetCards({
  onCopyDraft,
  telemetryClientHelperSnippet,
  telemetryEnvSnippet,
  telemetryNextRouteSnippet,
  telemetrySmokeCommandSnippet,
}: Step8TelemetrySnippetCardsProps) {
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
    <div className="mt-3 grid gap-3 xl:grid-cols-2">
      {telemetrySnippetCards.map((snippet) => (
        <div key={snippet.label} className="border border-slate-200 bg-white p-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{snippet.label}</div>
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
  );
}
