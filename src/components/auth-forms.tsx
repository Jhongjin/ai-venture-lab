"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { ArrowRight, ArrowsClockwise, CheckCircle, SignIn, Sparkle, UserCircle } from "@phosphor-icons/react";
import type { User } from "@supabase/supabase-js";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

function formatAuthMessage(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("invalid login credentials")) {
    return "이메일 또는 비밀번호가 올바르지 않습니다.";
  }

  if (normalized.includes("already registered") || normalized.includes("already been registered")) {
    return "이미 가입된 이메일입니다. 로그인으로 계속 진행해 주세요.";
  }

  if (normalized.includes("password")) {
    return "비밀번호 조건을 확인해 주세요. 최소 6자 이상을 권장합니다.";
  }

  return message;
}

export function LoginForm() {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    if (!supabase) {
      setMessage("로그인 환경 설정을 찾을 수 없습니다.");
      return;
    }

    if (!email.trim() || !password) {
      setMessage("이메일과 비밀번호를 모두 입력해 주세요.");
      return;
    }

    setIsBusy(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setIsBusy(false);

    if (error) {
      setMessage(formatAuthMessage(error.message));
      return;
    }

    setPassword("");
    router.push("/workspace");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <label className="grid gap-2 text-sm font-semibold text-slate-700">
        이메일
        <input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          className="avl-input"
        />
      </label>
      <label className="grid gap-2 text-sm font-semibold text-slate-700">
        비밀번호
        <input
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          type="password"
          autoComplete="current-password"
          placeholder="비밀번호"
          className="avl-input"
        />
      </label>

      <button type="submit" disabled={isBusy} className="avl-btn avl-btn-primary h-11 px-4 disabled:opacity-60">
        {isBusy ? <ArrowsClockwise className="animate-spin" size={18} /> : <SignIn size={18} />}
        로그인
      </button>

      {message ? <p className="text-sm leading-6 text-slate-600">{message}</p> : null}

      <div className="border-t border-slate-200 pt-4 text-sm leading-6 text-slate-600">
        아직 계정이 없다면{" "}
        <Link href="/signup" className="font-semibold text-slate-950 underline underline-offset-4">
          회원가입
        </Link>
        으로 시작할 수 있습니다.
      </div>
    </form>
  );
}

export function SignupForm() {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    if (!supabase) {
      setMessage("회원가입 환경 설정을 찾을 수 없습니다.");
      return;
    }

    if (!email.trim() || !password || !confirmPassword) {
      setMessage("이메일과 비밀번호를 모두 입력해 주세요.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("비밀번호가 서로 다릅니다.");
      return;
    }

    setIsBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          display_name: displayName.trim(),
        },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/profile`,
      },
    });
    setIsBusy(false);

    if (error) {
      setMessage(formatAuthMessage(error.message));
      return;
    }

    setPassword("");
    setConfirmPassword("");

    if (data.session) {
      router.push("/profile");
      router.refresh();
      return;
    }

    setMessage("가입 확인 메일을 보냈습니다. 이메일의 링크를 열면 프로필 설정으로 이어집니다.");
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <label className="grid gap-2 text-sm font-semibold text-slate-700">
        이름
        <input
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          type="text"
          autoComplete="name"
          placeholder="표시 이름"
          className="avl-input"
        />
      </label>
      <label className="grid gap-2 text-sm font-semibold text-slate-700">
        이메일
        <input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          className="avl-input"
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          비밀번호
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            autoComplete="new-password"
            placeholder="6자 이상"
            className="avl-input"
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          비밀번호 확인
          <input
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            type="password"
            autoComplete="new-password"
            placeholder="한 번 더 입력"
            className="avl-input"
          />
        </label>
      </div>

      <button type="submit" disabled={isBusy} className="avl-btn avl-btn-primary h-11 px-4 disabled:opacity-60">
        {isBusy ? <ArrowsClockwise className="animate-spin" size={18} /> : <Sparkle size={18} />}
        계정 만들기
      </button>

      {message ? <p className="text-sm leading-6 text-slate-600">{message}</p> : null}

      <div className="border-t border-slate-200 pt-4 text-sm leading-6 text-slate-600">
        이미 계정이 있다면{" "}
        <Link href="/login" className="font-semibold text-slate-950 underline underline-offset-4">
          로그인
        </Link>
        하세요.
      </div>
    </form>
  );
}

export function ProfileForm() {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();
  const [user, setUser] = useState<User | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(() => !supabase);
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    supabase.auth.getUser().then(({ data }) => {
      const nextUser = data.user ?? null;
      const metadata = nextUser?.user_metadata ?? {};

      setUser(nextUser);
      setDisplayName(typeof metadata.display_name === "string" ? metadata.display_name : "");
      setCompany(typeof metadata.company === "string" ? metadata.company : "");
      setRole(typeof metadata.role === "string" ? metadata.role : "");
      setIsLoaded(true);
    });
  }, [supabase]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    if (!supabase || !user) {
      setMessage("프로필을 수정하려면 먼저 로그인해 주세요.");
      return;
    }

    setIsBusy(true);
    const { error } = await supabase.auth.updateUser({
      data: {
        display_name: displayName.trim(),
        company: company.trim(),
        role: role.trim(),
      },
    });

    if (!error && newPassword) {
      const passwordResult = await supabase.auth.updateUser({ password: newPassword });
      if (passwordResult.error) {
        setIsBusy(false);
        setMessage(formatAuthMessage(passwordResult.error.message));
        return;
      }
      setNewPassword("");
    }

    setIsBusy(false);

    if (error) {
      setMessage(formatAuthMessage(error.message));
      return;
    }

    setMessage("프로필을 저장했습니다.");
    router.refresh();
  }

  async function handleSignOut() {
    if (!supabase) {
      return;
    }

    setIsBusy(true);
    await supabase.auth.signOut();
    setIsBusy(false);
    router.push("/");
    router.refresh();
  }

  if (!isLoaded) {
    return <div className="avl-surface-muted p-4 text-sm leading-6 text-slate-600">프로필을 불러오는 중입니다.</div>;
  }

  if (!user) {
    return (
      <div className="grid gap-4">
        <div className="avl-surface-muted p-4 text-sm leading-6 text-slate-600">
          프로필을 수정하려면 로그인이 필요합니다.
        </div>
        <Link href="/login" className="avl-btn avl-btn-primary h-11 px-4">
          로그인하기
          <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="avl-surface-muted p-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center border border-slate-200 bg-white text-slate-700">
            <UserCircle size={20} />
          </span>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-slate-950">{displayName || user.email}</div>
            <div className="break-all text-xs leading-5 text-slate-500">{user.email}</div>
          </div>
        </div>
      </div>

      <label className="grid gap-2 text-sm font-semibold text-slate-700">
        표시 이름
        <input
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          type="text"
          autoComplete="name"
          className="avl-input"
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          소속
          <input
            value={company}
            onChange={(event) => setCompany(event.target.value)}
            type="text"
            placeholder="팀 또는 회사"
            className="avl-input"
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          역할
          <input
            value={role}
            onChange={(event) => setRole(event.target.value)}
            type="text"
            placeholder="대표, 기획, 개발 등"
            className="avl-input"
          />
        </label>
      </div>
      <label className="grid gap-2 text-sm font-semibold text-slate-700">
        새 비밀번호
        <input
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          type="password"
          autoComplete="new-password"
          placeholder="변경할 때만 입력"
          className="avl-input"
        />
      </label>

      <div className="flex flex-wrap gap-2">
        <button type="submit" disabled={isBusy} className="avl-btn avl-btn-primary h-11 px-4 disabled:opacity-60">
          {isBusy ? <ArrowsClockwise className="animate-spin" size={18} /> : <CheckCircle size={18} />}
          프로필 저장
        </button>
        <button type="button" onClick={handleSignOut} disabled={isBusy} className="avl-btn avl-btn-secondary h-11 px-4 disabled:opacity-60">
          로그아웃
        </button>
      </div>

      <Link href="/workspace" className="avl-btn avl-btn-subtle h-11 px-4">
        실행 보드로 이동
        <ArrowRight size={16} />
      </Link>

      {message ? <p className="text-sm leading-6 text-slate-600">{message}</p> : null}
    </form>
  );
}
