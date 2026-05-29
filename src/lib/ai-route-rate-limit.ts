import { NextResponse } from "next/server";

type AiRouteRateLimitOptions = {
  limit: number;
  route: string;
  windowMs: number;
};

type AiRouteRateLimitBucket = {
  count: number;
  resetAt: number;
};

const aiRouteRateLimitBuckets = new Map<string, AiRouteRateLimitBucket>();
let aiRouteRateLimitCalls = 0;

function getClientKey(request: Request, route: string) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = request.headers.get("x-real-ip")?.trim();
  const userAgent = request.headers.get("user-agent")?.slice(0, 120) || "unknown";
  const client = forwardedFor || realIp || "unknown";

  return `${route}:${client}:${userAgent}`;
}

function cleanExpiredBuckets(now: number) {
  for (const [key, bucket] of aiRouteRateLimitBuckets) {
    if (bucket.resetAt <= now) {
      aiRouteRateLimitBuckets.delete(key);
    }
  }
}

export function enforceAiRouteRateLimit(request: Request, { limit, route, windowMs }: AiRouteRateLimitOptions) {
  const now = Date.now();
  const key = getClientKey(request, route);
  const existingBucket = aiRouteRateLimitBuckets.get(key);

  aiRouteRateLimitCalls += 1;
  if (aiRouteRateLimitCalls % 100 === 0) {
    cleanExpiredBuckets(now);
  }

  if (!existingBucket || existingBucket.resetAt <= now) {
    aiRouteRateLimitBuckets.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });
    return null;
  }

  existingBucket.count += 1;

  if (existingBucket.count <= limit) {
    return null;
  }

  const retryAfterSeconds = Math.max(1, Math.ceil((existingBucket.resetAt - now) / 1000));

  return NextResponse.json(
    {
      error: "AI 요청이 잠시 많습니다. 잠깐 후 다시 시도해 주세요.",
      retryAfterSeconds,
    },
    {
      headers: {
        "Cache-Control": "no-store",
        "Retry-After": String(retryAfterSeconds),
      },
      status: 429,
    },
  );
}
