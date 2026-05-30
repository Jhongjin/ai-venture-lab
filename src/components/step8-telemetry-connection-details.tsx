"use client";

type Step8TelemetryConnectionDetailsProps = {
  ideaId: string;
};

export function Step8TelemetryConnectionDetails({ ideaId }: Step8TelemetryConnectionDetailsProps) {
  return (
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
  );
}
