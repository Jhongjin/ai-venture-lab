export type SignupRequestPayloadInput = {
  displayName: string;
  email: string;
  password: string;
};

export function getSignupUrl() {
  return "/api/auth/signup";
}

export function buildSignupRequestPayload({ displayName, email, password }: SignupRequestPayloadInput) {
  return {
    displayName: displayName.trim(),
    email: email.trim(),
    password,
  };
}

export function formatAuthMessage(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("confirmation email")) {
    return "확인 메일 발송 설정 때문에 가입을 마치지 못했습니다. 잠시 후 다시 시도해 주세요.";
  }

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

export async function readSignupError(response: Pick<Response, "json">) {
  try {
    const payload: unknown = await response.json();

    if (
      typeof payload === "object" &&
      payload !== null &&
      !Array.isArray(payload) &&
      typeof (payload as { error?: unknown }).error === "string"
    ) {
      return formatAuthMessage((payload as { error: string }).error);
    }
  } catch {
    // Fall through to the generic message below.
  }

  return "계정을 만드는 중 문제가 생겼습니다. 잠시 후 다시 시도해 주세요.";
}
