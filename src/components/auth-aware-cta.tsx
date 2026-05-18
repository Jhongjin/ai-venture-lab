"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight } from "@phosphor-icons/react";
import type { User } from "@supabase/supabase-js";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type AuthAwareCtaProps = {
  className: string;
  signedInLabel?: string;
  signedOutLabel?: string;
  pendingLabel?: string;
};

export function AuthAwareCta({
  className,
  signedInLabel = "실행 보드 열기",
  signedOutLabel = "로그인 후 시작",
  pendingLabel = "계정 확인 중",
}: AuthAwareCtaProps) {
  const supabase = getSupabaseBrowserClient();
  const [user, setUser] = useState<User | null>(null);
  const [isLoaded, setIsLoaded] = useState(() => !supabase);

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

  if (!isLoaded) {
    return (
      <span aria-busy="true" className={`${className} pointer-events-none opacity-70`}>
        {pendingLabel}
      </span>
    );
  }

  return (
    <Link href={user ? "/workspace" : "/login"} className={className}>
      {user ? signedInLabel : signedOutLabel}
      <ArrowRight size={16} />
    </Link>
  );
}
