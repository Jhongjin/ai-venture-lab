export type ApiJsonResult<TPayload> = {
  payload: TPayload;
  response: Response;
};

async function readApiResponseJson<TPayload>(response: Pick<Response, "json">, fallback: TPayload): Promise<TPayload> {
  return response.json().catch(() => fallback) as Promise<TPayload>;
}

export async function fetchApiResponse(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  return fetch(input, init);
}

export async function fetchApiJson<TPayload>({
  fallback,
  init,
  input,
}: {
  fallback: TPayload;
  init?: RequestInit;
  input: RequestInfo | URL;
}): Promise<ApiJsonResult<TPayload>> {
  const response = await fetchApiResponse(input, init);
  const payload = await readApiResponseJson<TPayload>(response, fallback);

  return {
    payload,
    response,
  };
}
