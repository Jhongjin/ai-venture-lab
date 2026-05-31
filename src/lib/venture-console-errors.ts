export function formatAuthError(message: string) {
  if (message.toLowerCase().includes("rate limit")) {
    return "이메일 로그인 발송 제한에 걸렸습니다. 잠시 기다렸다 다시 시도하거나, 관리자가 미리 만든 비밀번호 계정으로 로그인하세요.";
  }

  if (message.toLowerCase().includes("invalid SignIn credentials")) {
    return "이메일 또는 비밀번호가 올바르지 않습니다. 관리자가 만든 기존 계정인지, 비밀번호가 맞는지 확인하세요.";
  }

  return message;
}

export function formatWorkspaceError(message: string) {
  const normalizedMessage = message.toLowerCase();

  if (normalizedMessage.includes("row-level security") && normalizedMessage.includes("organizations")) {
    return "팀 공간 생성 권한 설정이 맞지 않아 저장이 막혔습니다. 관리자에게 최신 워크스페이스 정책 적용을 요청한 뒤 다시 시도하세요.";
  }

  if (normalizedMessage.includes("duplicate key") && normalizedMessage.includes("organizations_slug")) {
    return "이미 이 계정용 팀 공간이 만들어져 있습니다. 새로고침 후 팀 공간 목록을 다시 확인하세요.";
  }

  return message;
}

export function formatAuthCallbackMessage(error: string, description: string | null) {
  if (error === "missing_callback_state") {
    return "로그인 링크에 필요한 코드가 없습니다. 새 링크를 요청한 뒤 가장 최근 이메일을 여세요.";
  }

  if (error === "callback_exchange_failed") {
    const normalizedDescription = description?.toLowerCase() ?? "";

    if (normalizedDescription.includes("verifier")) {
      return "로그인 링크는 열렸지만 원래 브라우저 세션을 찾지 못했습니다. 링크를 다시 요청한 뒤 로그인 링크를 보낸 같은 브라우저 프로필에서 여세요.";
    }

    return description
      ? `로그인 링크 확인 실패: ${description}`
      : "로그인 링크 확인에 실패했습니다. 새 링크를 요청한 뒤 다시 시도하세요.";
  }

  return description ? `${error}: ${description}` : error;
}
