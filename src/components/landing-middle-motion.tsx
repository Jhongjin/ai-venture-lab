const intakeItems = ["회의 메모", "대화 로그", "브리프 초안"];
const packageItems = ["질문 초안", "7일 실험", "중단 기준"];
const pulseBars = [28, 44, 22, 58, 36, 66, 48, 30, 54, 40, 62, 34];

export function LandingMiddleMotion() {
  return (
    <div className="landing-middle-motion relative min-h-[520px] overflow-hidden border border-slate-950 bg-[#0f141f] p-5 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] sm:p-6 xl:p-7">
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

      <div className="relative flex flex-wrap items-start justify-between gap-5">
        <div>
          <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-[#bcd3ff]">validation motion field</div>
          <p className="mt-3 max-w-[34ch] break-keep text-sm font-semibold leading-6 text-slate-100">
            흩어진 메모가 후보, 질문, 실험 조건으로 바뀌는 과정을 한 장면으로 보여줍니다.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-px bg-white/10 text-center">
          {["intake", "select", "package"].map((label, index) => (
            <span key={label} className={`${index === 1 ? "bg-[#bcd3ff] text-slate-950" : "bg-white/[0.04] text-slate-300"} px-3 py-2 font-mono text-[10px] font-semibold uppercase tracking-[0.16em]`}>
              {label}
            </span>
          ))}
        </div>
      </div>

      <div className="relative mt-8 grid gap-4 xl:grid-cols-[0.24fr_0.52fr_0.24fr]">
        <div className="relative z-[1] grid gap-3">
          {intakeItems.map((item, index) => (
            <div key={item} className={`${index === 0 ? "bg-white/[0.1]" : "bg-white/[0.045]"} border border-white/10 px-4 py-4`}>
              <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">input 0{index + 1}</div>
              <div className="mt-4 text-sm font-semibold text-white">{item}</div>
            </div>
          ))}
        </div>

        <div className="relative min-h-[300px] overflow-hidden border border-white/10 bg-[#111927]/86">
          <div aria-hidden="true" className="absolute inset-x-6 top-[28%] h-px bg-white/12">
            <span className="avl-middle-packet avl-middle-packet-a absolute left-0 top-1/2 h-2 w-16 bg-[#bcd3ff]" />
          </div>
          <div aria-hidden="true" className="absolute inset-x-6 top-[50%] h-px bg-white/14">
            <span className="avl-middle-packet avl-middle-packet-b absolute left-0 top-1/2 h-2 w-20 bg-white/80" />
          </div>
          <div aria-hidden="true" className="absolute inset-x-6 top-[72%] h-px bg-white/12">
            <span className="avl-middle-packet avl-middle-packet-c absolute left-0 top-1/2 h-2 w-14 bg-[#c9b47a]" />
          </div>

          <div aria-hidden="true" className="absolute left-8 right-8 top-8 bottom-8 border border-white/10" />
          <div aria-hidden="true" className="absolute left-[18%] top-8 bottom-8 w-px bg-white/10" />
          <div aria-hidden="true" className="absolute right-[18%] top-8 bottom-8 w-px bg-white/10" />

          <div className="avl-middle-card absolute left-1/2 top-1/2 w-[76%] border border-[#bcd3ff]/32 bg-[#0f141f]/94 px-5 py-5 shadow-[0_26px_56px_rgba(2,6,23,0.42)]">
            <div className="flex items-center justify-between gap-4">
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#bcd3ff]">active candidate</span>
              <span className="avl-middle-cursor h-2.5 w-2.5 bg-[#bcd3ff]" />
            </div>
            <div className="mt-5 break-keep text-[26px] font-semibold leading-none tracking-tight text-white">후보 한 건</div>
            <p className="mt-4 max-w-[36ch] text-sm leading-6 text-slate-300">
              지금 판단할 후보만 남기고 질문과 리스크를 같은 레인으로 보냅니다.
            </p>
            <div className="mt-5 grid grid-cols-3 gap-px bg-white/10">
              {["질문", "리스크", "실험"].map((label, index) => (
                <span key={label} className={`${index === 0 ? "bg-[#bcd3ff] text-slate-950" : "bg-white/[0.04] text-slate-300"} px-3 py-2 text-center text-[10px] font-semibold tracking-[0.08em]`}>
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="relative z-[1] grid gap-3">
          {packageItems.map((item, index) => (
            <div key={item} className={`${index === 2 ? "bg-[#bcd3ff] text-slate-950" : "bg-white/[0.045] text-white"} border border-white/10 px-4 py-4`}>
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
