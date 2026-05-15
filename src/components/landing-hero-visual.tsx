"use client";

import { useEffect, useState } from "react";
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

const focusPoints = [
  { x: 21, y: 27 },
  { x: 78, y: 32 },
  { x: 25, y: 70 },
  { x: 76, y: 68 },
];

type LandingHeroVisualProps = {
  variant?: "panel" | "hero";
};

export function LandingHeroVisual({ variant = "panel" }: LandingHeroVisualProps) {
  const [pointer, setPointer] = useState({ x: 50, y: 50 });
  const [hovering, setHovering] = useState(false);
  const [activeStage, setActiveStage] = useState(0);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveStage((current) => (current + 1) % stages.length);
    }, 2600);

    return () => window.clearInterval(intervalId);
  }, []);

  const handleMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setPointer({ x, y });
    setHovering(true);
  };

  const resetPointer = () => {
    setHovering(false);
    setPointer({ x: 50, y: 50 });
  };

  const focusPoint = hovering ? pointer : focusPoints[activeStage];
  const shellClassName =
    variant === "hero"
      ? "min-h-[620px] border-l border-white/8 xl:min-h-[680px]"
      : "min-h-[540px] border border-white/10";

  const glowStyle = {
    background: `radial-gradient(420px circle at ${focusPoint.x}% ${focusPoint.y}%, rgba(129, 140, 248, 0.22), transparent 34%), radial-gradient(260px circle at ${Math.max(focusPoint.x - 8, 0)}% ${Math.min(focusPoint.y + 10, 100)}%, rgba(56, 189, 248, 0.16), transparent 28%)`,
  };

  return (
    <div
      className={`landing-hero-visual group relative overflow-hidden bg-[#0e1118] text-white ${shellClassName}`}
      onMouseMove={handleMove}
      onMouseLeave={resetPointer}
    >
      <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:36px_36px]" />
      <div aria-hidden="true" className="absolute inset-0 opacity-70 landing-hero-scan" />
      <div aria-hidden="true" className="absolute inset-0 opacity-60 landing-hero-grid-drift" />
      <div aria-hidden="true" className="absolute inset-0 transition-transform duration-300" style={glowStyle} />
      <div aria-hidden="true" className="absolute inset-6 border border-white/8" />
      <div aria-hidden="true" className="absolute inset-x-16 top-[24%] h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.08),transparent)]" />
      <div aria-hidden="true" className="absolute inset-x-20 top-[68%] h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.08),transparent)]" />

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

          <div aria-hidden="true" className="absolute left-[24%] top-[24%] h-px w-[28%] landing-hero-stream" />
          <div aria-hidden="true" className="absolute left-[58%] top-[34%] h-[24%] w-px landing-hero-stream-vertical" />
          <div aria-hidden="true" className="absolute left-[34%] top-[66%] h-px w-[30%] landing-hero-stream-delayed" />
        </div>
      </div>

      {stages.map((stage, index) => {
        const Icon = stage.icon;
        const xOffset = (pointer.x - 50) / (index % 2 === 0 ? 10 : -12);
        const yOffset = (pointer.y - 50) / (index < 2 ? 16 : -16);
        const isActive = index === activeStage;
        const activeClassName = isActive
          ? "border-sky-300/35 bg-[#151b28]/96 shadow-[0_0_0_1px_rgba(125,211,252,0.15),0_24px_48px_rgba(2,8,23,0.55)]"
          : "border-white/10 bg-[#141823]/90 shadow-[0_20px_40px_rgba(0,0,0,0.28)]";
        const floatClassName = ["landing-hero-card-float-a", "landing-hero-card-float-b", "landing-hero-card-float-c", "landing-hero-card-float-d"][index];

        return (
          <div
            key={stage.label}
            className={`absolute w-[220px] p-4 backdrop-blur-sm transition-[transform,border-color,box-shadow,background-color] duration-500 md:w-[250px] ${stage.className} ${activeClassName} ${floatClassName}`}
            style={{ transform: `translate3d(${xOffset}px, ${yOffset}px, 0)` }}
          >
            <div className="flex items-start justify-between gap-3">
              <span className={`inline-flex h-10 w-10 items-center justify-center border text-slate-100 transition-colors duration-500 ${isActive ? "border-sky-300/35 bg-sky-400/12" : "border-white/10 bg-white/6"}`}>
                <Icon size={18} weight="bold" />
              </span>
              <span className={`text-[10px] font-semibold uppercase tracking-[0.2em] transition-colors duration-500 ${isActive ? "text-sky-200" : "text-slate-400"}`}>
                {stage.label}
              </span>
            </div>
            <div className="mt-4 text-[20px] font-semibold leading-tight tracking-tight text-white">
              {stage.title}
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-300">{stage.body}</p>
            <div className={`mt-4 h-px transition-all duration-500 ${isActive ? "bg-[linear-gradient(90deg,rgba(125,211,252,0.8),rgba(196,181,253,0.65),transparent)]" : "bg-white/10"}`} />
          </div>
        );
      })}

      <div className="absolute inset-x-6 bottom-6 grid gap-px border border-white/10 bg-white/10 md:inset-x-8 md:grid-cols-3">
        {signals.map((signal, index) => (
          <div
            key={signal}
            className={`px-4 py-4 text-sm leading-6 transition-colors duration-500 ${
              index === activeStage % signals.length
                ? "bg-[#182032] text-white"
                : "bg-[#121620]/90 text-slate-200"
            }`}
          >
            {signal}
          </div>
        ))}
      </div>
    </div>
  );
}
