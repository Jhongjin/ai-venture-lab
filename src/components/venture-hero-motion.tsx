import {
  BracketsCurly,
  ChartLineUp,
  FileText,
  Gauge,
  ListChecks,
  Network,
  Package,
  Stack,
  WarningDiamond,
} from "@phosphor-icons/react/dist/ssr";

const intakeItems = [
  {
    label: "Raw memo",
    meta: "source",
    icon: FileText,
    tone: "text-slate-100",
  },
  {
    label: "Market signal",
    meta: "demand",
    icon: ChartLineUp,
    tone: "text-cyan-100",
  },
  {
    label: "Risk",
    meta: "blocker",
    icon: WarningDiamond,
    tone: "text-amber-100",
  },
];

const packageItems = [
  { label: "기획서", icon: FileText, value: "준비" },
  { label: "화면", icon: Network, value: "구성" },
  { label: "기술", icon: Stack, value: "선택" },
  { label: "작업", icon: ListChecks, value: "대기" },
];

const signalBars = [38, 58, 31, 72, 44, 64, 26, 52, 84, 46, 68, 34];

const signalStreams = [
  {
    top: "16%",
    left: "2%",
    width: "72%",
    rotate: "-7deg",
    delay: "0s",
    duration: "5.8s",
    color: "from-transparent via-cyan-100/85 to-transparent",
  },
  {
    top: "27%",
    left: "9%",
    width: "78%",
    rotate: "4deg",
    delay: "1.1s",
    duration: "6.7s",
    color: "from-transparent via-emerald-200/76 to-transparent",
  },
  {
    top: "39%",
    left: "-2%",
    width: "86%",
    rotate: "-2deg",
    delay: "0.4s",
    duration: "6.2s",
    color: "from-transparent via-sky-100/74 to-transparent",
  },
  {
    top: "57%",
    left: "7%",
    width: "82%",
    rotate: "6deg",
    delay: "2.2s",
    duration: "7.1s",
    color: "from-transparent via-amber-200/68 to-transparent",
  },
  {
    top: "72%",
    left: "0%",
    width: "74%",
    rotate: "-5deg",
    delay: "1.7s",
    duration: "6.4s",
    color: "from-transparent via-teal-200/74 to-transparent",
  },
];

const signalNodes = [
  { top: "22%", left: "18%", delay: "0.2s", color: "bg-cyan-200" },
  { top: "33%", left: "28%", delay: "1.5s", color: "bg-emerald-200" },
  { top: "46%", left: "13%", delay: "2.1s", color: "bg-sky-100" },
  { top: "63%", left: "24%", delay: "0.9s", color: "bg-amber-200" },
  { top: "76%", left: "36%", delay: "2.8s", color: "bg-teal-200" },
  { top: "18%", left: "52%", delay: "3.3s", color: "bg-cyan-100" },
];

export function VentureHeroMotion() {
  return (
    <div
      aria-hidden="true"
      className="venture-hero-motion pointer-events-none relative isolate min-h-[620px] w-full overflow-hidden bg-[#05070c] text-white sm:min-h-[560px] lg:min-h-[520px]"
    >
      <style>
        {`
          @keyframes vhm-sweep {
            0% { opacity: 0; transform: translate3d(-70%, 0, 0) skewX(-12deg); }
            22% { opacity: 0.42; }
            74% { opacity: 0.16; }
            100% { opacity: 0; transform: translate3d(410%, 0, 0) skewX(-12deg); }
          }

          @keyframes vhm-float-a {
            0%, 100% { transform: translate3d(0, 0, 0); opacity: 0.86; }
            50% { transform: translate3d(0, -8px, 0); opacity: 1; }
          }

          @keyframes vhm-float-b {
            0%, 100% { transform: translate3d(0, 0, 0); opacity: 0.82; }
            50% { transform: translate3d(0, 7px, 0); opacity: 1; }
          }

          @keyframes vhm-packet-ltr {
            0% { opacity: 0; transform: translate3d(-16%, -50%, 0) scaleX(0.34); }
            18% { opacity: 0.95; }
            76% { opacity: 0.58; }
            100% { opacity: 0; transform: translate3d(116%, -50%, 0) scaleX(1); }
          }

          @keyframes vhm-packet-rtl {
            0% { opacity: 0; transform: translate3d(116%, -50%, 0) scaleX(0.38); }
            20% { opacity: 0.82; }
            72% { opacity: 0.52; }
            100% { opacity: 0; transform: translate3d(-18%, -50%, 0) scaleX(1); }
          }

          @keyframes vhm-pulse {
            0%, 100% { opacity: 0.52; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.18); }
          }

          @keyframes vhm-bar {
            0%, 100% { opacity: 0.26; transform: scaleY(0.46); }
            50% { opacity: 0.92; transform: scaleY(1); }
          }

          @keyframes vhm-stack {
            0%, 100% { opacity: 0.68; transform: translate3d(0, 0, 0); }
            50% { opacity: 1; transform: translate3d(8px, 0, 0); }
          }

          @keyframes vhm-scanline {
            0% { opacity: 0; transform: translate3d(0, -24px, 0); }
            32% { opacity: 0.44; }
            100% { opacity: 0; transform: translate3d(0, 28px, 0); }
          }

          @keyframes vhm-signal-track {
            0% { opacity: 0.14; transform: scaleX(0.86); }
            42% { opacity: 0.56; transform: scaleX(1); }
            100% { opacity: 0.18; transform: scaleX(0.92); }
          }

          @keyframes vhm-signal-packet {
            0% { opacity: 0.12; transform: translate3d(-18%, -50%, 0) scaleX(0.1); }
            12% { opacity: 1; }
            52% { opacity: 0.86; transform: translate3d(54%, -50%, 0) scaleX(1); }
            100% { opacity: 0.14; transform: translate3d(118%, -50%, 0) scaleX(0.26); }
          }

          @keyframes vhm-bit-drift {
            0% { opacity: 0; transform: translate3d(-12px, 18px, 0) scale(0.72); }
            18% { opacity: 0.9; }
            68% { opacity: 0.64; }
            100% { opacity: 0; transform: translate3d(148px, -18px, 0) scale(1.28); }
          }

          @keyframes vhm-core-ripple {
            0% { opacity: 0; transform: scale(0.76); }
            28% { opacity: 0.42; }
            100% { opacity: 0; transform: scale(1.28); }
          }

          @keyframes vhm-output-spark {
            0%, 100% { opacity: 0.28; transform: translate3d(0, 0, 0); }
            50% { opacity: 0.94; transform: translate3d(12px, 0, 0); }
          }

          .vhm-motion {
            will-change: transform, opacity;
          }

          .vhm-sweep {
            animation: vhm-sweep 7.8s linear infinite;
          }

          .vhm-sweep-delayed {
            animation: vhm-sweep 9.4s linear infinite 2.1s;
          }

          .vhm-float-a {
            animation: vhm-float-a 6.4s ease-in-out infinite;
          }

          .vhm-float-b {
            animation: vhm-float-b 7.1s ease-in-out infinite;
          }

          .vhm-packet-ltr {
            animation: vhm-packet-ltr 3.7s ease-in-out infinite;
            transform-origin: left center;
          }

          .vhm-packet-rtl {
            animation: vhm-packet-rtl 4.6s ease-in-out infinite;
            transform-origin: right center;
          }

          .vhm-pulse {
            animation: vhm-pulse 2.4s ease-in-out infinite;
          }

          .vhm-bar {
            animation: vhm-bar 1.9s ease-in-out infinite;
            transform-origin: bottom;
          }

          .vhm-stack {
            animation: vhm-stack 4.2s ease-in-out infinite;
          }

          .vhm-scanline {
            animation: vhm-scanline 4.8s linear infinite;
          }

          .vhm-signal-track {
            animation: vhm-signal-track 5.8s ease-in-out infinite;
            transform-origin: center;
          }

          .vhm-signal-packet {
            animation: vhm-signal-packet 6.4s cubic-bezier(0.42, 0, 0.2, 1) infinite;
            transform-origin: left center;
          }

          .vhm-bit-drift {
            animation: vhm-bit-drift 6.2s cubic-bezier(0.38, 0, 0.2, 1) infinite;
          }

          .vhm-core-ripple {
            animation: vhm-core-ripple 3.8s ease-out infinite;
          }

          .vhm-output-spark {
            animation: vhm-output-spark 2.8s ease-in-out infinite;
          }

          @media (prefers-reduced-motion: reduce) {
            .venture-hero-motion .vhm-motion {
              animation: none !important;
              transition: none !important;
              transform: none !important;
            }
          }
        `}
      </style>

      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:34px_34px] opacity-55"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(115deg,rgba(37,99,235,0.18),transparent_32%,rgba(20,184,166,0.12)_54%,transparent_78%),linear-gradient(180deg,rgba(255,255,255,0.06),transparent_22%,rgba(0,0,0,0.36))]"
      />
      <div
        aria-hidden="true"
        className="vhm-motion vhm-sweep absolute inset-y-0 left-[-36%] w-[28%] bg-[linear-gradient(90deg,transparent,rgba(125,211,252,0.24),rgba(255,255,255,0.12),transparent)] blur-xl"
      />
      <div
        aria-hidden="true"
        className="vhm-motion vhm-sweep-delayed absolute inset-y-0 left-[-42%] w-[24%] bg-[linear-gradient(90deg,transparent,rgba(16,185,129,0.16),rgba(96,165,250,0.12),transparent)] blur-xl"
      />
      <div aria-hidden="true" className="vhm-motion vhm-scanline absolute inset-x-0 top-[32%] h-px bg-cyan-200/35" />
      <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,transparent_48%,rgba(0,0,0,0.54)_100%)]" />

      <div
        aria-hidden="true"
        className="absolute inset-0 z-[1] overflow-hidden opacity-90 [mask-image:linear-gradient(90deg,transparent,black_12%,black_86%,transparent)]"
      >
        {signalStreams.map((stream) => (
          <div
            className="absolute"
            key={`${stream.top}-${stream.left}`}
            style={{
              left: stream.left,
              top: stream.top,
              transform: `rotate(${stream.rotate})`,
              width: stream.width,
            }}
          >
            <span
              className={`vhm-motion vhm-signal-track absolute left-0 top-1/2 h-px w-full rounded-full bg-gradient-to-r ${stream.color}`}
              style={{ animationDelay: stream.delay, animationDuration: stream.duration }}
            />
            <span
              className={`vhm-motion vhm-signal-packet absolute left-0 top-1/2 h-1 w-36 rounded-full bg-gradient-to-r ${stream.color} shadow-[0_0_30px_rgba(125,211,252,0.44)]`}
              style={{ animationDelay: stream.delay, animationDuration: stream.duration }}
            />
          </div>
        ))}

        {signalNodes.map((node) => (
          <span
            aria-hidden="true"
            className={`vhm-motion vhm-bit-drift absolute h-2.5 w-2.5 rounded-[3px] ${node.color} shadow-[0_0_20px_rgba(125,211,252,0.5)]`}
            key={`${node.top}-${node.left}`}
            style={{ animationDelay: node.delay, left: node.left, top: node.top }}
          />
        ))}
      </div>

      <div className="relative z-10 flex min-h-[620px] flex-col p-4 sm:min-h-[560px] sm:p-5 lg:min-h-[520px] lg:p-6">
        <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2 font-mono text-[11px] font-semibold uppercase text-slate-300">
            <Gauge size={15} weight="bold" className="text-cyan-200" />
            Venture OS
          </div>
          <div className="flex items-center gap-2 font-mono text-[11px] font-semibold uppercase text-slate-400">
            <span aria-hidden="true" className="vhm-motion vhm-pulse h-2 w-2 rounded-[2px] bg-emerald-300" />
            Human gate live
          </div>
        </div>

        <div className="mt-4 grid flex-1 gap-3 lg:grid-cols-[0.95fr_1.22fr_0.95fr]">
          <div className="grid gap-3">
            <div className="vhm-motion vhm-float-a min-h-[210px] rounded-[6px] border border-white/10 bg-slate-950/70 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 font-mono text-[11px] font-semibold uppercase text-slate-300">
                  <FileText size={16} weight="bold" className="text-slate-100" />
                  Raw memo
                </div>
                <span className="rounded-[4px] border border-white/10 px-2 py-1 font-mono text-[10px] uppercase text-slate-500">
                  intake
                </span>
              </div>

              <div className="mt-5 space-y-3">
                <div className="h-2 w-[92%] rounded-[2px] bg-white/22" />
                <div className="h-2 w-[74%] rounded-[2px] bg-white/14" />
                <div className="h-2 w-[84%] rounded-[2px] bg-white/16" />
                <div className="h-2 w-[58%] rounded-[2px] bg-white/10" />
              </div>

              <div className="mt-7 grid grid-cols-12 items-end gap-1.5 border-t border-white/10 pt-4">
                {signalBars.map((height, index) => (
                  <span
                    aria-hidden="true"
                    className="vhm-motion vhm-bar block rounded-[2px] bg-cyan-200/55"
                    key={`${height}-${index}`}
                    style={{ height: `${height}px`, animationDelay: `${index * 0.08}s` }}
                  />
                ))}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {intakeItems.map((item, index) => {
                const Icon = item.icon;

                return (
                  <div
                    className="rounded-[6px] border border-white/10 bg-black/26 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                    key={item.label}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[5px] border border-white/10 bg-white/8 ${item.tone}`}>
                        <Icon size={17} weight="bold" />
                      </span>
                      <span className="font-mono text-[10px] uppercase text-slate-500">0{index + 1}</span>
                    </div>
                    <div className="mt-3 text-sm font-semibold text-white">{item.label}</div>
                    <div className="mt-1 font-mono text-[10px] uppercase text-slate-500">{item.meta}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="relative min-h-[320px] overflow-hidden rounded-[6px] border border-white/10 bg-[#080d14]/78 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] sm:min-h-[360px] lg:min-h-0">
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(125,211,252,0.08)_50%,transparent),linear-gradient(180deg,transparent,rgba(255,255,255,0.05)_50%,transparent)] opacity-80"
            />
            <div aria-hidden="true" className="absolute left-5 right-5 top-[25%] h-px bg-white/12" />
            <div aria-hidden="true" className="absolute left-5 right-5 top-1/2 h-px bg-cyan-200/22" />
            <div aria-hidden="true" className="absolute left-5 right-5 top-[75%] h-px bg-white/12" />
            <div aria-hidden="true" className="absolute bottom-5 left-[22%] top-5 w-px bg-white/10" />
            <div aria-hidden="true" className="absolute bottom-5 left-1/2 top-5 w-px bg-white/12" />
            <div aria-hidden="true" className="absolute bottom-5 right-[22%] top-5 w-px bg-white/10" />

            <div className="absolute left-6 right-6 top-[25%]">
              <span aria-hidden="true" className="vhm-motion vhm-packet-ltr absolute left-0 top-1/2 h-2 w-20 rounded-[2px] bg-cyan-200 shadow-[0_0_20px_rgba(125,211,252,0.42)]" />
            </div>
            <div className="absolute left-6 right-6 top-1/2">
              <span aria-hidden="true" className="vhm-motion vhm-packet-rtl absolute left-0 top-1/2 h-2 w-24 rounded-[2px] bg-emerald-200/85 shadow-[0_0_20px_rgba(110,231,183,0.32)]" />
            </div>
            <div className="absolute left-6 right-6 top-[75%]">
              <span aria-hidden="true" className="vhm-motion vhm-packet-ltr absolute left-0 top-1/2 h-2 w-16 rounded-[2px] bg-amber-200/85 shadow-[0_0_20px_rgba(253,230,138,0.28)]" style={{ animationDelay: "0.9s" }} />
            </div>

            <div className="absolute left-1/2 top-1/2 w-[min(68%,280px)] -translate-x-1/2 -translate-y-1/2">
              <div className="relative rounded-[6px] border border-cyan-200/30 bg-slate-950/90 p-4 text-center shadow-[0_24px_70px_rgba(0,0,0,0.42)]">
                <span aria-hidden="true" className="vhm-motion vhm-core-ripple absolute inset-[-28px] rounded-[10px] border border-cyan-200/24" />
                <span
                  aria-hidden="true"
                  className="vhm-motion vhm-core-ripple absolute inset-[-48px] rounded-[14px] border border-emerald-200/16"
                  style={{ animationDelay: "1.4s" }}
                />
                <span aria-hidden="true" className="absolute -left-8 top-1/2 h-px w-8 bg-cyan-200/45" />
                <span aria-hidden="true" className="absolute -right-8 top-1/2 h-px w-8 bg-cyan-200/45" />
                <span aria-hidden="true" className="absolute left-1/2 top-[-32px] h-8 w-px bg-cyan-200/28" />
                <span aria-hidden="true" className="absolute bottom-[-32px] left-1/2 h-8 w-px bg-cyan-200/28" />

                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-[6px] border border-cyan-200/28 bg-cyan-300/10 text-cyan-100">
                  <BracketsCurly size={20} weight="bold" />
                </div>
                <div className="mt-3 font-mono text-[11px] font-semibold uppercase text-cyan-100">
                  Validation
                </div>
                <div className="mt-2 text-[22px] font-semibold leading-none text-white">evidence gate</div>
                <div className="mx-auto mt-4 h-px w-24 bg-[linear-gradient(90deg,transparent,rgba(125,211,252,0.8),transparent)]" />
              </div>
            </div>

            <div className="absolute left-4 top-4 rounded-[5px] border border-white/10 bg-black/30 px-3 py-2 font-mono text-[10px] uppercase text-slate-400">
              source to package
            </div>
            <div className="absolute bottom-4 right-4 rounded-[5px] border border-emerald-200/18 bg-emerald-300/8 px-3 py-2 font-mono text-[10px] uppercase text-emerald-100">
              operator approved
            </div>
          </div>

          <div className="grid gap-3">
            <div className="vhm-motion vhm-float-b rounded-[6px] border border-white/10 bg-slate-950/72 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 font-mono text-[11px] font-semibold uppercase text-slate-300">
                  <Package size={16} weight="bold" className="text-emerald-100" />
                  Build package
                </div>
                <span className="rounded-[4px] border border-emerald-200/18 bg-emerald-300/8 px-2 py-1 font-mono text-[10px] uppercase text-emerald-100">
                  shipped
                </span>
              </div>

              <div className="mt-5 divide-y divide-white/10 border-y border-white/10">
                {packageItems.map((item, index) => {
                  const Icon = item.icon;

                  return (
                    <div className="flex items-center justify-between gap-3 py-3" key={item.label}>
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[5px] border border-white/10 bg-white/8 text-slate-100">
                          <Icon size={16} weight="bold" />
                        </span>
                        <span className="font-mono text-[12px] font-semibold uppercase text-white">{item.label}</span>
                      </div>
                      <span
                        className="vhm-motion vhm-output-spark font-mono text-[10px] uppercase text-slate-500"
                        style={{ animationDelay: `${index * 0.18}s` }}
                      >
                        {item.value}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[6px] border border-white/10 bg-black/28 p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="font-mono text-[11px] font-semibold uppercase text-slate-400">handoff integrity</span>
                <span className="font-mono text-[11px] text-cyan-100">92%</span>
              </div>
              <div className="mt-4 grid grid-cols-4 gap-2">
                {["기획서", "화면", "기술", "작업"].map((label, index) => (
                  <div className="min-w-0 border-t border-white/10 pt-2" key={label}>
                    <div className="h-1.5 rounded-[2px] bg-white/10">
                      <span
                        aria-hidden="true"
                        className="vhm-motion vhm-packet-ltr block h-full rounded-[2px] bg-cyan-200/70"
                        style={{ animationDelay: `${index * 0.22}s` }}
                      />
                    </div>
                    <div className="mt-2 truncate font-mono text-[10px] uppercase text-slate-400">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
