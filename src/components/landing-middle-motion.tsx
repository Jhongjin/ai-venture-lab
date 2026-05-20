const intakeItems = ["회의 메모", "대화 로그", "브리프 초안"];
const packageItems = ["질문 초안", "7일 실험", "중단 기준"];
const pulseBars = [20, 34, 18, 44, 30, 52, 38, 24, 42, 32, 48, 26];

export function LandingMiddleMotion() {
  return (
    <div className="landing-middle-motion relative min-h-[420px] overflow-hidden bg-[#0f141f] p-5 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] sm:p-6 xl:[clip-path:polygon(4%_0,100%_0,96%_100%,0_100%)]">
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.46]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(188,211,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(188,211,255,0.1) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      <div aria-hidden="true" className="avl-middle-sweep absolute inset-y-0 left-[-18%] w-[38%]" />
      <div aria-hidden="true" className="absolute bottom-0 left-0 right-0 h-48 bg-[radial-gradient(circle_at_36%_100%,rgba(188,211,255,0.2),transparent_46%)]" />

      <div className="relative flex flex-wrap items-start justify-between gap-5 xl:pl-6 xl:pr-8">
        <div>
          <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-[#bcd3ff]">validation motion field</div>
          <p className="mt-3 max-w-[34ch] break-keep text-sm font-semibold leading-6 text-slate-100">
            흩어진 메모가 아이디어, 질문, 실험 조건으로 정리되는 장면입니다.
          </p>
        </div>
        <div className="flex border-b border-white/14 text-center">
          {["intake", "select", "package"].map((label, index) => (
            <span key={label} className={`${index === 1 ? "text-[#bcd3ff]" : "text-slate-400"} px-3 py-2 font-mono text-[10px] font-semibold uppercase tracking-[0.16em]`}>
              {label}
            </span>
          ))}
        </div>
      </div>

      <div className="relative mt-8 min-h-[250px] xl:mx-6">
        <div aria-hidden="true" className="absolute inset-x-0 top-[20%] h-px bg-white/12" />
        <div aria-hidden="true" className="absolute inset-x-0 top-[48%] h-px bg-white/10" />
        <div aria-hidden="true" className="absolute inset-x-0 top-[76%] h-px bg-white/12" />
        <div aria-hidden="true" className="absolute bottom-0 left-[24%] top-0 hidden w-px bg-white/10 xl:block" />
        <div aria-hidden="true" className="absolute bottom-0 right-[24%] top-0 hidden w-px bg-white/10 xl:block" />

        <div className="absolute left-0 top-0 z-[1] hidden gap-3 xl:grid">
          {intakeItems.map((item, index) => (
            <div key={item} className={`max-w-[170px] border-t border-white/12 px-4 py-3 ${index === 1 ? "ml-7" : index === 2 ? "ml-14" : ""}`}>
              <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">input 0{index + 1}</div>
              <div className="mt-4 text-sm font-semibold text-white">{item}</div>
            </div>
          ))}
        </div>

        <div className="absolute inset-x-4 top-[21%] h-px xl:left-[24%] xl:right-[24%]">
          <span className="avl-middle-packet avl-middle-packet-a absolute left-0 top-1/2 h-2 w-16 bg-[#bcd3ff]" />
        </div>
        <div className="absolute inset-x-4 top-[49%] h-px xl:left-[24%] xl:right-[24%]">
          <span className="avl-middle-packet avl-middle-packet-b absolute left-0 top-1/2 h-2 w-20 bg-white/80" />
        </div>
        <div className="absolute inset-x-4 top-[77%] h-px xl:left-[24%] xl:right-[24%]">
          <span className="avl-middle-packet avl-middle-packet-c absolute left-0 top-1/2 h-2 w-14 bg-[#c9b47a]" />
        </div>

        <div className="avl-middle-card absolute left-1/2 top-1/2 w-[58%] px-2 py-2 xl:w-[24%]">
          <span aria-hidden="true" className="absolute left-[-34px] top-1/2 h-px w-7 bg-[#bcd3ff]/70" />
          <span aria-hidden="true" className="absolute right-[-18px] top-4 h-2.5 w-2.5 bg-[#bcd3ff]" />
          <span aria-hidden="true" className="absolute bottom-[-14px] left-0 h-px w-20 bg-white/16" />
          <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-[#bcd3ff]">active idea</div>
          <div className="mt-3 break-keep text-[24px] font-semibold leading-none tracking-tight text-white">아이디어 한 건</div>
        </div>

        <div className="absolute right-0 top-0 z-[1] hidden max-w-[180px] gap-3 xl:grid">
          {packageItems.map((item, index) => (
            <div key={item} className={`border-t px-4 py-3 ${index === 2 ? "border-[#bcd3ff] text-[#dbe8ff]" : "border-white/12 text-white"} ${index === 1 ? "mr-7" : index === 2 ? "mr-14" : ""}`}>
              <div className={`font-mono text-[10px] font-semibold uppercase tracking-[0.18em] ${index === 2 ? "text-slate-500" : "text-slate-500"}`}>output 0{index + 1}</div>
              <div className="mt-4 text-sm font-semibold">{item}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="relative mt-6 grid grid-cols-12 items-end gap-1.5 border-t border-white/10 pt-5">
        {pulseBars.map((height, index) => (
          <span
            key={`${height}-${index}`}
            className="avl-middle-bar block bg-[#bcd3ff]/50"
            style={{ height: `${height}px`, animationDelay: `${index * 0.11}s` }}
          />
        ))}
      </div>
    </div>
  );
}
