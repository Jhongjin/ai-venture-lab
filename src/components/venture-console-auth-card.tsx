"use client";

import type { FormEvent } from "react";
import { ArrowsClockwise, ShieldCheck, SignIn, SignOut } from "@phosphor-icons/react";
import type { User } from "@supabase/supabase-js";

type VentureConsoleAuthTask = "auth" | "workspace" | "extract" | "idea";

type VentureConsoleAuthCardProps = {
  activeTask: VentureConsoleAuthTask;
  authMessage: string | null;
  email: string;
  isAuthBusy: boolean;
  isAuthLoaded: boolean;
  onEmailChange: (email: string) => void;
  onEmailLinkSignIn: () => void | Promise<void>;
  onPasswordChange: (password: string) => void;
  onPasswordSignIn: (event: FormEvent<HTMLFormElement>) => void | Promise<void>;
  onSignOut: () => void | Promise<void>;
  password: string;
  user: Pick<User, "email"> | null;
};

export function VentureConsoleAuthCard({
  activeTask,
  authMessage,
  email,
  isAuthBusy,
  isAuthLoaded,
  onEmailChange,
  onEmailLinkSignIn,
  onPasswordChange,
  onPasswordSignIn,
  onSignOut,
  password,
  user,
}: VentureConsoleAuthCardProps) {
  return (
    <div className={`avl-card p-6 ${activeTask === "auth" ? "" : "hidden"}`}>
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-950">로그인</h2>
          <p className="mt-1 text-sm text-slate-500">
            관리자가 만든 계정의 이메일과 비밀번호로 로그인합니다. 별도 인증키나 메일 링크는 필요 없습니다.
          </p>
        </div>
        <ShieldCheck className={user ? "text-emerald-600" : "text-slate-500"} size={24} />
      </div>

      {!isAuthLoaded ? (
        <div className="avl-surface-muted p-4 text-sm leading-6 text-slate-600">현재 세션을 확인하는 중입니다...</div>
      ) : user ? (
        <div className="grid gap-4">
          <div className="avl-surface-muted border-emerald-200 bg-emerald-50 p-4">
            <div className="text-sm font-semibold text-emerald-900">로그인됨</div>
            <div className="mt-1 break-all text-sm text-emerald-800">{user.email}</div>
          </div>
          <button
            type="button"
            onClick={onSignOut}
            disabled={isAuthBusy}
            className="avl-btn avl-btn-primary h-11 px-4 disabled:opacity-60"
          >
            <SignOut size={18} />
            로그아웃
          </button>
        </div>
      ) : (
        <form onSubmit={onPasswordSignIn} className="grid gap-3">
          <div className="avl-surface-muted p-3 text-sm leading-6 text-slate-700">
            관리자 계정의 이메일과 비밀번호로 바로 시작합니다. 로그인되면 다음 단계는 자동으로 열립니다.
          </div>
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            이메일
            <input
              value={email}
              onChange={(event) => onEmailChange(event.target.value)}
              type="email"
              placeholder="you@example.com"
              className="avl-input"
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            비밀번호
            <input
              value={password}
              onChange={(event) => onPasswordChange(event.target.value)}
              type="password"
              placeholder="관리자가 발급한 계정 비밀번호"
              className="avl-input"
            />
          </label>
          <button
            type="submit"
            disabled={isAuthBusy}
            className="avl-btn avl-btn-primary h-11 px-4 disabled:opacity-60"
          >
            {isAuthBusy ? <ArrowsClockwise className="animate-spin" size={18} /> : <SignIn size={18} />}
            비밀번호로 로그인
          </button>
          <details className="avl-surface-muted p-3">
            <summary className="cursor-pointer text-sm font-semibold text-slate-700">
              이메일 링크가 꼭 필요할 때만 사용
            </summary>
            <div className="mt-3 grid gap-3 text-sm leading-6 text-slate-600">
              <p>발송 제한이나 SMTP 설정에 영향을 받기 때문에, 운영 테스트는 비밀번호 로그인을 기본으로 권장합니다.</p>
              <button
                type="button"
                onClick={onEmailLinkSignIn}
                disabled={isAuthBusy}
                className="avl-btn avl-btn-secondary h-11 px-4 disabled:opacity-60"
              >
                {isAuthBusy ? <ArrowsClockwise className="animate-spin" size={18} /> : <SignIn size={18} />}
                이메일 로그인 링크 받기
              </button>
            </div>
          </details>
        </form>
      )}

      {authMessage ? <p className="mt-4 text-sm leading-6 text-slate-600">{authMessage}</p> : null}
    </div>
  );
}
