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

function assertShortText(value, label, minLength = 2) {
  if (typeof value !== "string" || value.trim().length < minLength) {
    fail(`missing or too-short ${label}`);
  }
}

function assertArray(value, label, minLength = 1) {
  if (!Array.isArray(value) || value.length < minLength) {
    fail(`missing ${label}`);
  }
}

function assertPublicSource(source, index) {
  if (!source || typeof source !== "object") {
    fail(`source ${index + 1} is not an object`);
  }

  assertShortText(source.title, `source ${index + 1} title`, 4);
  assertText(source.reason, `source ${index + 1} reason`);

  if (typeof source.url !== "string" || !/^https?:\/\//i.test(source.url.trim())) {
    fail(`source ${index + 1} is missing a public URL`);
  }

  if (source.source_type === "user_input") {
    fail(`source ${index + 1} is a fallback user_input source`);
  }

  if (!["low", "medium", "high"].includes(source.strength)) {
    fail(`source ${index + 1} has invalid strength`);
  }
}

function assertCompetitor(competitor, index) {
  if (!competitor || typeof competitor !== "object") {
    fail(`competitor ${index + 1} is not an object`);
  }

  assertShortText(competitor.name, `competitor ${index + 1} name`);
  assertShortText(competitor.category, `competitor ${index + 1} category`);
  assertText(competitor.note, `competitor ${index + 1} note`);

  if (!["low", "medium", "high"].includes(competitor.threat)) {
    fail(`competitor ${index + 1} has invalid threat`);
  }
}

function assertSignal(signal, index) {
  if (!signal || typeof signal !== "object") {
    fail(`market signal ${index + 1} is not an object`);
  }

  assertShortText(signal.label, `market signal ${index + 1} label`);
  assertText(signal.finding, `market signal ${index + 1} finding`);
}

function assertBarrier(barrier, index) {
  if (!barrier || typeof barrier !== "object") {
    fail(`entry barrier ${index + 1} is not an object`);
  }

  assertShortText(barrier.label, `entry barrier ${index + 1} label`);
  assertText(barrier.note, `entry barrier ${index + 1} note`);

  if (!["low", "medium", "high"].includes(barrier.severity)) {
    fail(`entry barrier ${index + 1} has invalid severity`);
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
  assertText(scan.alternatives, "alternatives");
  assertText(scan.next_action, "next_action");
  assertText(scan.caveat, "caveat");
  assertArray(scan.market_signals, "market_signals", 3);
  assertArray(scan.competitor_map, "competitor_map", 3);
  assertArray(scan.entry_barrier_checks, "entry_barrier_checks", 2);
  assertArray(scan.research_queries, "research_queries", 3);

  scan.market_signals.forEach(assertSignal);
  scan.competitor_map.forEach(assertCompetitor);
  scan.entry_barrier_checks.forEach(assertBarrier);
  scan.research_queries.forEach((query, index) => assertText(query, `research query ${index + 1}`));

  if (payload.mode === "openai_web") {
    assertShortText(payload.model, "model", 4);
    assertArray(scan.sources, "sources", 3);
    scan.sources.forEach(assertPublicSource);

    if (!scan.sources.some((source) => source.strength === "medium" || source.strength === "high")) {
      fail("sources do not include a medium or high strength reference");
    }
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
