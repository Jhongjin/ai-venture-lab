"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, Sparkle, UserCircle } from "@phosphor-icons/react";
import type { User } from "@supabase/supabase-js";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export function SiteHeader() {
  const pathname = usePathname();
  const supabase = getSupabaseBrowserClient();
  const [user, setUser] = useState<User | null>(null);
  const [isLoaded, setIsLoaded] = useState(() => !supabase);
  const isWorkspace = pathname === "/workspace";
  const routeLabel = pathname === "/" ? "홈" : isWorkspace ? "실행 공간" : pathname === "/guide" ? "가이드" : "계정";

  useEffect(() => {
    if (!supabase) {
      return;
    }

    let isMounted = true;

    supabase.auth.getUser().then(({ data }) => {
      if (!isMounted) {
        return;
      }

      setUser(data.user ?? null);
      setIsLoaded(true);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsLoaded(true);
    });

    return () => {
      isMounted = false;
      data.subscription.unsubscribe();
    };
  }, [supabase]);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-[#f2f0eb]/92 px-4 py-3 backdrop-blur sm:px-6">
      <div className="mx-auto w-full max-w-[1600px] border border-slate-200 bg-white/95 px-4 py-3 shadow-[0_1px_0_rgba(15,23,42,0.03)] sm:px-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-3 text-slate-950">
            <span className="avl-kicker text-slate-700">
              <Sparkle size={14} />
              AI Venture Lab
            </span>
            <span className="avl-pill avl-pill-neutral">{routeLabel}</span>
          </Link>

          <nav aria-label="주요 메뉴" className="flex flex-wrap items-center gap-2">
            {pathname === "/" ? null : (
              <Link href="/" className="avl-btn avl-btn-subtle h-9 px-3 text-xs">
                홈
              </Link>
            )}
            <Link
              href="/guide"
              className={`avl-btn avl-btn-subtle h-9 px-3 text-xs ${
                pathname === "/guide" ? "border-slate-950 bg-white text-slate-950" : ""
              }`}
            >
              가이드
            </Link>

            {!isLoaded ? (
              <span aria-busy="true" className="avl-btn avl-btn-subtle h-9 px-4 text-sm opacity-70">
                계정 확인 중
              </span>
            ) : user ? (
              <>
                <Link href="/profile" className="avl-btn avl-btn-subtle h-9 px-3 text-xs">
                  <UserCircle size={15} />
                  마이페이지
                </Link>
                {isWorkspace ? null : (
                  <Link href="/workspace" className="avl-btn avl-btn-primary h-9 px-4 text-sm">
                    실행 보드 열기
                    <ArrowRight size={15} />
                  </Link>
                )}
              </>
            ) : (
              <Link href="/login" className="avl-btn avl-btn-primary h-9 px-4 text-sm">
                로그인 / 회원가입
                <ArrowRight size={15} />
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
