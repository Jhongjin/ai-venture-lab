"use client";

import { useState } from "react";
import {
  ClipboardText,
  Path,
  RocketLaunch,
  ShieldCheck,
  Sparkle,
} from "@phosphor-icons/react";

const stages = [
  {
    label: "raw input",
    title: "초안 수집",
    body: "회의 메모, 대화 로그, 브리프 초안을 그대로 받습니다.",
    icon: ClipboardText,
    className: "left-6 top-16 md:left-10",
  },
  {
    label: "candidate",
    title: "후보 정리",
    body: "AI가 지금 판단할 후보 1건과 비교 후보를 먼저 나눕니다.",
    icon: Sparkle,
    className: "right-6 top-24 md:right-10",
  },
  {
    label: "validation",
    title: "검증 스프린트",
    body: "질문, 리스크, 7일 실험을 같은 맥락 안에 붙입니다.",
    icon: ShieldCheck,
    className: "left-8 bottom-28 md:left-16",
  },
  {
    label: "ship path",
    title: "실행 연결",
    body: "기획, MVP 범위, 출시 판단이 한 보드에서 이어집니다.",
    icon: RocketLaunch,
    className: "right-8 bottom-18 md:right-16",
  },
];

const signals = [
  "한 번에 한 후보만 앞으로 꺼냅니다.",
  "결정에 필요한 질문과 증거를 함께 남깁니다.",
  "출시 후 신호도 다시 보드로 돌아옵니다.",
];

export function LandingHeroVisual() {
  const [pointer, setPointer] = useState({ x: 50, y: 50 });

  const handleMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setPointer({ x, y });
  };

  const resetPointer = () => setPointer({ x: 50, y: 50 });

  const glowStyle = {
    background: `radial-gradient(420px circle at ${pointer.x}% ${pointer.y}%, rgba(129, 140, 248, 0.18), transparent 34%), radial-gradient(240px circle at ${Math.max(pointer.x - 10, 0)}% ${Math.min(pointer.y + 6, 100)}%, rgba(96, 165, 250, 0.12), transparent 28%)`,
  };

  return (
    <div
      className="landing-hero-visual group relative min-h-[540px] overflow-hidden border border-white/10 bg-[#11141c] text-white"
      onMouseMove={handleMove}
      onMouseLeave={resetPointer}
    >
      <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:36px_36px]" />
      <div aria-hidden="true" className="absolute inset-0 opacity-70 landing-hero-scan" />
      <div aria-hidden="true" className="absolute inset-0 transition-transform duration-300" style={glowStyle} />
      <div aria-hidden="true" className="absolute inset-6 border border-white/8" />

      <div className="absolute inset-x-6 top-6 flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400 md:inset-x-8">
        <span className="inline-flex items-center gap-2">
          <Path size={14} weight="bold" />
          execution field
        </span>
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3 py-1 text-[10px] tracking-[0.22em] text-slate-300">
          live signal
        </span>
      </div>

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative h-[300px] w-[300px] md:h-[360px] md:w-[360px]">
          <div className="absolute inset-0 rounded-full border border-white/10 landing-hero-orbit" />
          <div className="absolute inset-[14%] rounded-full border border-white/8 landing-hero-orbit-delayed" />
          <div className="absolute inset-[28%] rounded-full border border-white/10" />

          <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_22px_rgba(255,255,255,0.55)]" />
          <div className="absolute left-[18%] top-[28%] h-[54%] w-px bg-[linear-gradient(180deg,transparent,rgba(255,255,255,0.45),transparent)]" />
          <div className="absolute left-[34%] top-[18%] h-px w-[42%] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.45),transparent)]" />
          <div className="absolute left-[58%] top-[36%] h-[34%] w-px bg-[linear-gradient(180deg,transparent,rgba(255,255,255,0.45),transparent)]" />
          <div className="absolute left-[28%] top-[64%] h-px w-[40%] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.45),transparent)]" />

          <div className="absolute left-[16%] top-[25%] h-2.5 w-2.5 rounded-full bg-[#a5b4fc] shadow-[0_0_16px_rgba(165,180,252,0.75)] landing-hero-node" />
          <div className="absolute left-[56%] top-[18%] h-2.5 w-2.5 rounded-full bg-[#7dd3fc] shadow-[0_0_16px_rgba(125,211,252,0.75)] landing-hero-node-delayed" />
          <div className="absolute left-[62%] top-[58%] h-2.5 w-2.5 rounded-full bg-[#c4b5fd] shadow-[0_0_16px_rgba(196,181,253,0.75)] landing-hero-node" />
          <div className="absolute left-[26%] top-[72%] h-2.5 w-2.5 rounded-full bg-[#93c5fd] shadow-[0_0_16px_rgba(147,197,253,0.75)] landing-hero-node-delayed" />
        </div>
      </div>

      {stages.map((stage, index) => {
        const Icon = stage.icon;
        const xOffset = (pointer.x - 50) / (index % 2 === 0 ? 10 : -12);
        const yOffset = (pointer.y - 50) / (index < 2 ? 16 : -16);

        return (
          <div
            key={stage.label}
            className={`absolute w-[220px] border border-white/10 bg-[#141823]/90 p-4 shadow-[0_20px_40px_rgba(0,0,0,0.28)] backdrop-blur-sm md:w-[250px] ${stage.className}`}
            style={{ transform: `translate3d(${xOffset}px, ${yOffset}px, 0)` }}
          >
            <div className="flex items-start justify-between gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center border border-white/10 bg-white/6 text-slate-100">
                <Icon size={18} weight="bold" />
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                {stage.label}
              </span>
            </div>
            <div className="mt-4 text-[20px] font-semibold leading-tight tracking-tight text-white">
              {stage.title}
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-300">{stage.body}</p>
          </div>
        );
      })}

      <div className="absolute inset-x-6 bottom-6 grid gap-px border border-white/10 bg-white/10 md:inset-x-8 md:grid-cols-3">
        {signals.map((signal) => (
          <div key={signal} className="bg-[#121620]/90 px-4 py-4 text-sm leading-6 text-slate-200">
            {signal}
          </div>
        ))}
      </div>
    </div>
  );
}
