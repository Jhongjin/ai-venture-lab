import { NextResponse } from "next/server";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const MAX_DISPLAY_NAME_LENGTH = 80;

type SignupRequestBody = {
  displayName?: unknown;
  email?: unknown;
  password?: unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim().slice(0, maxLength) : "";
}

function toEmail(value: unknown) {
  return toText(value, 254).toLowerCase();
}

function jsonError(error: string, status: number) {
  return NextResponse.json({ error }, { status });
}

function formatAdminSignupError(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("already") || normalized.includes("registered") || normalized.includes("exists")) {
    return "이미 가입된 이메일입니다. 로그인으로 계속 진행해 주세요.";
  }

  if (normalized.includes("password")) {
    return "비밀번호 조건을 확인해 주세요. 최소 6자 이상으로 입력해 주세요.";
  }

  return "계정을 만드는 중 문제가 생겼습니다. 잠시 후 다시 시도해 주세요.";
}

export async function POST(request: Request) {
  let body: SignupRequestBody;

  try {
    const payload = await request.json();
    body = isRecord(payload) ? payload : {};
  } catch {
    return jsonError("요청 형식이 올바르지 않습니다.", 400);
  }

  const email = toEmail(body.email);
  const password = typeof body.password === "string" ? body.password : "";
  const displayName = toText(body.displayName, MAX_DISPLAY_NAME_LENGTH);

  if (!email || !email.includes("@")) {
    return jsonError("사용할 이메일을 올바르게 입력해 주세요.", 400);
  }

  if (password.length < 6) {
    return jsonError("비밀번호는 6자 이상으로 입력해 주세요.", 400);
  }

  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    return jsonError("회원가입 서버 설정을 찾을 수 없습니다. 관리자에게 배포 설정 확인을 요청해 주세요.", 503);
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      display_name: displayName,
    },
  });

  if (error) {
    const status = "status" in error && typeof error.status === "number" ? error.status : 400;
    return jsonError(formatAdminSignupError(error.message), status === 500 ? 500 : 400);
  }

  return NextResponse.json({
    ok: true,
    userId: data.user?.id ?? null,
  });
}
