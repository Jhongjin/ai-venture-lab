import { chromium } from "@playwright/test";

import { loadLocalEnvFiles } from "./load_local_env.mjs";

loadLocalEnvFiles();

const baseUrl = process.env.BROWSER_SMOKE_URL || process.env.SMOKE_URL || "https://ai-venture-lab.vercel.app";
const email = process.env.BROWSER_SMOKE_EMAIL;
const password = process.env.BROWSER_SMOKE_PASSWORD;
const headless = process.env.BROWSER_SMOKE_HEADLESS !== "0";
const timeout = Number.parseInt(process.env.BROWSER_SMOKE_TIMEOUT_MS || "45000", 10);

function fail(message) {
  throw new Error(`Telemetry smoke idea creation failed: ${message}`);
}

function hasConfigValue(value) {
  return Boolean(value && value.trim());
}

function makeStamp() {
  return new Date().toISOString().replace(/\D/g, "").slice(0, 14);
}

async function loginInBrowser(page) {
  await page.goto(new URL("/login", baseUrl).toString(), { waitUntil: "networkidle", timeout });
  await page.getByLabel(/이메일/).fill(email, { timeout });
  await page.getByLabel(/비밀번호/).fill(password, { timeout });
  await page.getByRole("button", { name: /비밀번호로 로그인|^로그인$/ }).click({ timeout });
  await page.getByRole("heading", { name: /실행 보드|아이디어 찾기|사업성 평가|후보 선택/ }).first().waitFor({
    state: "visible",
    timeout,
  });
  await page.waitForFunction(() => document.cookie.includes("-auth-token"), undefined, { timeout });
}

async function resolveSupabasePublicConfigFromPage(page) {
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const envAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (hasConfigValue(envUrl) && hasConfigValue(envAnonKey)) {
    return { url: envUrl, anonKey: envAnonKey };
  }

  return page.evaluate(async () => {
    const scriptUrls = [...document.scripts].map((script) => script.src).filter(Boolean);

    for (const scriptUrl of scriptUrls) {
      const source = await fetch(scriptUrl).then((response) => response.text()).catch(() => "");
      const match = source.match(
        /"(https:\/\/[a-z0-9-]+\.supabase\.co)","(eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)"/,
      );

      if (match) {
        return { url: match[1], anonKey: match[2] };
      }
    }

    return null;
  });
}

async function readBrowserAccessToken(page) {
  return page.evaluate(() => {
    const authCookie = document.cookie
      .split("; ")
      .find((cookie) => cookie.startsWith("sb-") && cookie.includes("-auth-token="));

    if (!authCookie) {
      return "";
    }

    const [, rawCookieValue = ""] = authCookie.split("=");
    const decodedCookie = decodeURIComponent(rawCookieValue);
    const jsonText = decodedCookie.startsWith("base64-") ? atob(decodedCookie.slice("base64-".length)) : decodedCookie;
    const session = JSON.parse(jsonText);
    return typeof session.access_token === "string" ? session.access_token : "";
  });
}

async function createDisposableIdea(page, config) {
  const accessToken = await readBrowserAccessToken(page);

  if (!accessToken) {
    fail("browser access token was not available.");
  }

  const stamp = makeStamp();
  const result = await page.evaluate(
    async ({ accessToken: browserAccessToken, config: browserConfig, stamp: browserStamp }) => {
      const response = await fetch(`${browserConfig.url}/rest/v1/ideas?select=id`, {
        method: "POST",
        headers: {
          apikey: browserConfig.anonKey,
          Authorization: `Bearer ${browserAccessToken}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify({
          name: `telemetry-smoke-${browserStamp}`,
          one_liner: "Disposable smoke idea for telemetry ingest no-store verification.",
          target_user: "AI Venture Lab operator",
          buyer: "AI Venture Lab operator",
          stage: "research",
          decision: "research_more",
          problem_intensity: 3,
          frequency: 3,
          reachability: 3,
          willingness_to_pay: 3,
          mvp_speed: 4,
          differentiation: 3,
          regulatory_risk: 1,
          signal: "Verifies telemetry ingest secret, linked idea lookup, and no-store response headers.",
          risk_summary: "Disposable smoke data only. No secrets are printed.",
          next_evidence: "Telemetry ingest smoke should return ok=true for this disposable idea.",
          product_surface: "web_app",
        }),
      });
      const body = await response.json().catch(() => ({}));

      return {
        ok: response.ok,
        status: response.status,
        idea: Array.isArray(body) ? body[0] : null,
      };
    },
    { accessToken, config, stamp },
  );

  if (!result.ok || !result.idea?.id) {
    fail(`could not create disposable idea through Supabase REST. HTTP ${result.status}`);
  }

  return result.idea.id;
}

async function main() {
  if (!email || !password) {
    fail("missing BROWSER_SMOKE_EMAIL/PASSWORD.");
  }

  const browser = await chromium.launch({ headless });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();

  try {
    await loginInBrowser(page);
    const config = await resolveSupabasePublicConfigFromPage(page);

    if (!config?.url || !config?.anonKey) {
      fail("could not resolve Supabase public config from the production app bundle.");
    }

    const ideaId = await createDisposableIdea(page, config);
    console.log(ideaId);
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
