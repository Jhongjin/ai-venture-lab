export type AuthCallbackLocationSnapshot = {
  hash: string;
  origin: string;
  pathname: string;
  search: string;
};

export type AuthCallbackErrorState = {
  description: string | null;
  error: string;
  nextUrl: string;
};

export type MagicLinkCodeState = {
  code: string;
  nextUrl: string;
};

function buildUrlAfterRemovingSearchParams({
  hash,
  keys,
  pathname,
  search,
}: Pick<AuthCallbackLocationSnapshot, "hash" | "pathname" | "search"> & { keys: string[] }) {
  const params = new URLSearchParams(search);

  keys.forEach((key) => params.delete(key));

  const nextQuery = params.toString();
  return `${pathname}${nextQuery ? `?${nextQuery}` : ""}${hash}`;
}

export function readAuthCallbackErrorState({
  hash,
  pathname,
  search,
}: Pick<AuthCallbackLocationSnapshot, "hash" | "pathname" | "search">): AuthCallbackErrorState | null {
  const params = new URLSearchParams(search);
  const error = params.get("auth_error");

  if (!error) {
    return null;
  }

  return {
    description: params.get("auth_error_description"),
    error,
    nextUrl: buildUrlAfterRemovingSearchParams({
      hash,
      keys: ["auth_error", "auth_error_description"],
      pathname,
      search,
    }),
  };
}

export function readMagicLinkCodeState({
  hash,
  pathname,
  search,
}: Pick<AuthCallbackLocationSnapshot, "hash" | "pathname" | "search">): MagicLinkCodeState | null {
  const params = new URLSearchParams(search);
  const code = params.get("code");

  if (!code) {
    return null;
  }

  return {
    code,
    nextUrl: buildUrlAfterRemovingSearchParams({
      hash,
      keys: ["code"],
      pathname,
      search,
    }),
  };
}

export function buildWorkspaceEmailRedirectUrl(origin: string) {
  return `${origin}/auth/callback?next=/workspace`;
}
