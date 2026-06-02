export type JsonPostRequestOptions = {
  credentials?: RequestCredentials;
};

export function buildJsonPostRequestInit(body: unknown, options: JsonPostRequestOptions = {}): RequestInit {
  return {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    ...(options.credentials ? { credentials: options.credentials } : {}),
    body: JSON.stringify(body),
  };
}
