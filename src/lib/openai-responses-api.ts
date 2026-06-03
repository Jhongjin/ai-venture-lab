const OPENAI_RESPONSES_API_URL = "https://api.openai.com/v1/responses";

export type OpenAIResponsesJsonResult<TPayload> = {
  payload: TPayload;
  response: Response;
};

export async function postOpenAIResponsesJson<TPayload>({
  apiKey,
  body,
  fallback,
}: {
  apiKey: string;
  body: unknown;
  fallback: TPayload;
}): Promise<OpenAIResponsesJsonResult<TPayload>> {
  const response = await fetch(OPENAI_RESPONSES_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const payload = (await response.json().catch(() => fallback)) as TPayload;

  return {
    payload,
    response,
  };
}
