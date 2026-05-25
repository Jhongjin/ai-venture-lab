import { loadLocalEnvFiles } from "./load_local_env.mjs";

loadLocalEnvFiles();

const baseUrl = process.env.MARKET_SCAN_SMOKE_URL || process.env.SMOKE_URL || "https://ai-venture-lab.vercel.app";
const timeoutMs = Number.parseInt(process.env.MARKET_SCAN_SMOKE_TIMEOUT_MS || "180000", 10);
const requireWeb = process.env.MARKET_SCAN_SMOKE_ALLOW_ESTIMATE !== "1";

function fail(message) {
  throw new Error(`Market scan smoke failed: ${message}`);
}

function assertText(value, label) {
  if (typeof value !== "string" || value.trim().length < 12) {
    fail(`missing or too-short ${label}`);
  }
}

function assertArray(value, label, minLength = 1) {
  if (!Array.isArray(value) || value.length < minLength) {
    fail(`missing ${label}`);
  }
}

const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), timeoutMs);

try {
  const response = await fetch(new URL("/api/ideas/market-scan", baseUrl), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    signal: controller.signal,
    body: JSON.stringify({
      idea: {
        name: "시장 스모크 운영 콘솔",
        one_liner: "소규모 운영팀이 반복 문의와 처리 상태를 한 화면에서 관리하는 운영 콘솔",
        target_user: "소규모 운영팀 리더",
        buyer: "운영 책임자",
        product_surface: "operator_console",
      },
      state: {
        signal: "문의 처리 상태가 메신저와 스프레드시트에 흩어져 담당자 배정과 누락 확인이 반복됩니다.",
        risk_summary: "개인정보 노출과 권한 관리가 주요 리스크입니다.",
        next_evidence: "운영팀 5명에게 현재 처리 방식과 유료 전환 기준을 확인합니다.",
      },
      score: 21,
      risks: ["개인정보 노출 가능성", "조직 권한 경계 오류"],
      experiments: ["5명 운영자 인터뷰와 수동 처리 보드 테스트"],
    }),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    fail(`HTTP ${response.status}`);
  }

  if (!payload || typeof payload !== "object") {
    fail("response is not JSON object");
  }

  const scan = payload.scan;
  if (!scan || typeof scan !== "object") {
    fail("missing scan");
  }

  if (requireWeb && payload.mode !== "openai_web") {
    const fallbackReason =
      typeof scan?.sources?.[0]?.reason === "string" && scan.sources[0].reason.trim()
        ? ` Reason: ${scan.sources[0].reason.trim().slice(0, 240)}`
        : "";
    fail(
      `expected openai_web mode, got ${payload.mode || "unknown"}.${fallbackReason} Set MARKET_SCAN_SMOKE_ALLOW_ESTIMATE=1 to accept fallback estimates.`,
    );
  }

  assertText(scan.summary, "summary");
  assertText(scan.demand_forecast, "demand_forecast");
  assertText(scan.competition, "competition");
  assertText(scan.saturation, "saturation");
  assertText(scan.entry_barriers, "entry_barriers");
  assertText(scan.next_action, "next_action");
  assertArray(scan.market_signals, "market_signals");
  assertArray(scan.competitor_map, "competitor_map");
  assertArray(scan.entry_barrier_checks, "entry_barrier_checks");
  assertArray(scan.research_queries, "research_queries");

  if (payload.mode === "openai_web") {
    assertArray(scan.sources, "sources");
  }

  console.log(
    [
      `Market scan smoke passed for ${baseUrl}`,
      `mode=${payload.mode || "unknown"}`,
      `model=${payload.model || "none"}`,
      `sources=${Array.isArray(scan.sources) ? scan.sources.length : 0}`,
      `competitors=${scan.competitor_map.length}`,
    ].join(" "),
  );
} catch (error) {
  if (error?.name === "AbortError") {
    fail(`timed out after ${timeoutMs}ms`);
  }

  throw error;
} finally {
  clearTimeout(timeout);
}
