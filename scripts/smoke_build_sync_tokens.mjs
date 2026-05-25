import { chromium } from "@playwright/test";

import { loadLocalEnvFiles } from "./load_local_env.mjs";

loadLocalEnvFiles();

const baseUrl = process.env.BUILD_SYNC_SMOKE_URL || process.env.BROWSER_SMOKE_URL || process.env.SMOKE_URL || "https://ai-venture-lab.vercel.app";
const email = process.env.BUILD_SYNC_SMOKE_EMAIL || process.env.BROWSER_SMOKE_EMAIL;
const password = process.env.BUILD_SYNC_SMOKE_PASSWORD || process.env.BROWSER_SMOKE_PASSWORD;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const configuredIdeaId = process.env.BUILD_SYNC_SMOKE_IDEA_ID || process.env.TELEMETRY_SMOKE_IDEA_ID;
const headless = (process.env.BUILD_SYNC_SMOKE_HEADLESS || process.env.BROWSER_SMOKE_HEADLESS) !== "0";
const keepData = process.env.BUILD_SYNC_SMOKE_KEEP_DATA === "1";
const allowProgressWrite = process.env.BUILD_SYNC_SMOKE_ALLOW_PROGRESS_WRITE === "1";
const timeout = Number.parseInt(process.env.BUILD_SYNC_SMOKE_TIMEOUT_MS || process.env.BROWSER_SMOKE_TIMEOUT_MS || "45000", 10);

function fail(message) {
  throw new Error(`Build sync token smoke failed: ${message}`);
}

function requireEnv(name, value) {
  if (!value) {
    fail(`missing ${name}. Set BUILD_SYNC_SMOKE_EMAIL/PASSWORD or BROWSER_SMOKE_EMAIL/PASSWORD.`);
  }
}

function makeStamp() {
  return new Date().toISOString().replace(/[^\d]/g, "").slice(0, 14);
}

function hasConfigValue(value) {
  return Boolean(value && value.trim());
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

async function callAppApi(page, path, init = {}) {
  return page.evaluate(
    async ({ path: requestPath, init: requestInit }) => {
      const response = await fetch(requestPath, { credentials: "include", ...requestInit });
      const body = await response.json().catch(() => ({}));
      return {
        status: response.status,
        ok: response.ok,
        body,
      };
    },
    { path, init },
  );
}

async function verifyLearningTaskBoard(page, ideaId) {
  const learningUrl = new URL("/workspace", baseUrl);
  learningUrl.searchParams.set("task", "learning");
  learningUrl.searchParams.set("idea", ideaId);

  await page.goto(learningUrl.toString(), { waitUntil: "networkidle", timeout });
  await page.getByRole("heading", { name: "성과 확인" }).waitFor({
    state: "visible",
    timeout,
  });
  await page.getByRole("heading", { name: "제작 작업 진행표" }).waitFor({
    state: "visible",
    timeout,
  });
  const taskBoard = page.locator("section", {
    has: page.getByRole("heading", { name: "제작 작업 진행표" }),
  });
  await taskBoard.locator("span", { hasText: "build sync smoke registry verification" }).first().waitFor({
    state: "visible",
    timeout,
  });
  await taskBoard.locator("span.avl-pill-success:visible", { hasText: "완료" }).first().waitFor({
    state: "visible",
    timeout,
  });
}

async function verifyFinalExecutionCursorGuide(page, ideaId) {
  const launchUrl = new URL("/workspace", baseUrl);
  launchUrl.searchParams.set("task", "launch");
  launchUrl.searchParams.set("idea", ideaId);

  await page.goto(launchUrl.toString(), { waitUntil: "networkidle", timeout });
  await page.getByRole("heading", { name: "최종 실행" }).waitFor({
    state: "visible",
    timeout,
  });
  await page.getByRole("heading", { name: "Cursor 프로젝트에 연결 파일을 설치합니다" }).waitFor({
    state: "visible",
    timeout,
  });
  await page.getByText("Cursor에서 시작하는 순서", { exact: true }).waitFor({
    state: "visible",
    timeout,
  });
  await page.getByText("node .cursor/venture-lab-cli.mjs next-task", { exact: true }).waitFor({
    state: "visible",
    timeout,
  });
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function verifyPackageOnlyExternalToolHandoffs(page, ideaId) {
  const launchUrl = new URL("/workspace", baseUrl);
  launchUrl.searchParams.set("task", "launch");
  launchUrl.searchParams.set("idea", ideaId);

  const packageOnlyTools = ["Codex", "Claude Code", "Google Antigravity"];

  await page.goto(launchUrl.toString(), { waitUntil: "networkidle", timeout });
  await page.getByRole("heading", { name: "최종 실행" }).waitFor({
    state: "visible",
    timeout,
  });

  const exposesDeferredGenericMcp = await page
    .getByRole("button", { name: /^범용 MCP 전달$/ })
    .isVisible({ timeout: 1000 })
    .catch(() => false);

  if (exposesDeferredGenericMcp) {
    fail("Deferred generic MCP handoff appeared in the supported external tool selector.");
  }

  for (const toolLabel of packageOnlyTools) {
    await page.getByRole("button", { name: new RegExp(`^${escapeRegExp(toolLabel)}$`) }).click({ timeout });
    await page.getByRole("heading", { name: `${toolLabel}용 제작 패키지를 받습니다` }).waitFor({
      state: "visible",
      timeout,
    });
    await page.getByRole("button", { name: "시작 패키지 받기" }).waitFor({
      state: "visible",
      timeout,
    });
    await page.getByText(`${toolLabel}는 현재 시작 패키지와 완료 보고 반영으로 진행합니다.`, { exact: false }).waitFor({
      state: "visible",
      timeout,
    });
    await page.getByText("원격 자동 쓰기는 아직 제공하지 않습니다.", { exact: false }).waitFor({
      state: "visible",
      timeout,
    });

    const exposesCursorSetup = await page
      .getByRole("button", { name: "Cursor 연결 파일 받기" })
      .isVisible({ timeout: 1000 })
      .catch(() => false);

    if (exposesCursorSetup) {
      fail(`${toolLabel} package-only handoff exposed the Cursor setup button.`);
    }
  }
}

async function resolveSupabasePublicConfigFromPage(page) {
  if (hasConfigValue(supabaseUrl) && hasConfigValue(supabaseAnonKey)) {
    return { url: supabaseUrl, anonKey: supabaseAnonKey };
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

async function createDisposableIdea(page, config) {
  const stamp = makeStamp();
  const result = await page.evaluate(
    async ({ config: browserConfig, stamp: browserStamp }) => {
      function readAccessToken() {
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
      }

      const accessToken = readAccessToken();

      if (!accessToken) {
        return { ok: false, error: "Browser session access token was not available." };
      }

      const response = await fetch(`${browserConfig.url}/rest/v1/ideas?select=id,name,organization_id`, {
        method: "POST",
        headers: {
          apikey: browserConfig.anonKey,
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify({
          name: `build-sync-smoke-${browserStamp}`,
          one_liner: "Disposable smoke idea for Cursor build sync token registry verification.",
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
          signal: "Verifies Cursor token issuance, use, revoke, and rejection against production APIs.",
          risk_summary: "Disposable smoke data only. No secrets are printed.",
          next_evidence: "Token registry status should be ready after build_sync_tokens SQL migration.",
          product_surface: "web_app",
        }),
      });
      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        return {
          ok: false,
          error: typeof body.message === "string" ? body.message : `HTTP ${response.status}`,
        };
      }

      return { ok: true, idea: Array.isArray(body) ? body[0] : null };
    },
    { config, stamp },
  );

  if (!result.ok || !result.idea?.id) {
    fail(`could not create disposable smoke idea: ${result.error ?? "missing idea"}`);
  }

  return result.idea.id;
}

async function createDisposableLaunchPackage(page, config, ideaId) {
  const result = await page.evaluate(
    async ({ config: browserConfig, ideaId: browserIdeaId }) => {
      function readAccessToken() {
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
      }

      const accessToken = readAccessToken();

      if (!accessToken) {
        return { ok: false, error: "Browser session access token was not available." };
      }

      const body = [
        "# 제작 패키지",
        "",
        "Build sync smoke package for final execution guide verification.",
        "",
        "```yaml",
        "build_delivery_mode: external_tool",
        "external_tool: cursor",
        "external_tool_label: Cursor",
        "```",
      ].join("\n");
      const response = await fetch(`${browserConfig.url}/rest/v1/venture_artifacts?select=id`, {
        method: "POST",
        headers: {
          apikey: browserConfig.anonKey,
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify({
          idea_id: browserIdeaId,
          artifact_type: "dev_runbook",
          title: "build sync smoke 제작 패키지",
          body,
          source: "agent_run_package",
          status: "approved",
          status_note: "Disposable smoke package for Cursor final execution guide verification.",
        }),
      });
      const responseBody = await response.json().catch(() => ({}));

      if (!response.ok) {
        return {
          ok: false,
          error: typeof responseBody.message === "string" ? responseBody.message : `HTTP ${response.status}`,
        };
      }

      return { ok: true };
    },
    { config, ideaId },
  );

  if (!result.ok) {
    fail(`could not create disposable launch package: ${result.error ?? "unknown error"}`);
  }
}

async function cleanupDisposableIdea(page, config, ideaId) {
  return page.evaluate(
    async ({ config: browserConfig, ideaId: browserIdeaId }) => {
      function readAccessToken() {
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
      }

      const accessToken = readAccessToken();

      if (!accessToken) {
        return { ok: false, error: "Browser session access token was not available." };
      }

      const response = await fetch(`${browserConfig.url}/rest/v1/ideas?id=eq.${encodeURIComponent(browserIdeaId)}`, {
        method: "DELETE",
        headers: {
          apikey: browserConfig.anonKey,
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const body = await response.text().catch(() => "");

      return {
        ok: response.ok,
        error: response.ok ? "" : body || `HTTP ${response.status}`,
      };
    },
    { config, ideaId },
  );
}

async function main() {
  requireEnv("BUILD_SYNC_SMOKE_EMAIL", email);
  requireEnv("BUILD_SYNC_SMOKE_PASSWORD", password);

  let ideaId = null;
  let resolvedSupabaseConfig = null;
  let usedDisposableIdea = false;

  const browser = await chromium.launch({ headless });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
  });
  const page = await context.newPage();

  try {
    await loginInBrowser(page);
    const supabaseConfig = await resolveSupabasePublicConfigFromPage(page);

    if (supabaseConfig) {
      ideaId = await createDisposableIdea(page, supabaseConfig);
      resolvedSupabaseConfig = supabaseConfig;
      usedDisposableIdea = true;
    } else {
      ideaId = configuredIdeaId?.trim() || null;
    }

    if (!ideaId) {
      fail("missing BUILD_SYNC_SMOKE_IDEA_ID or TELEMETRY_SMOKE_IDEA_ID. Supabase public config could not be resolved from the app bundle.");
    }

    const tokenResult = await callAppApi(page, "/api/build-sync/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ideaId, tool: "cursor" }),
    });

    if (!tokenResult.ok) {
      fail(`token issue returned HTTP ${tokenResult.status}: ${tokenResult.body.error ?? "unknown error"}`);
    }

    if (tokenResult.body.registryStatus !== "ready") {
      fail(`expected registryStatus=ready after SQL migration, received ${tokenResult.body.registryStatus ?? "missing"}`);
    }

    if (!tokenResult.body.token || !tokenResult.body.connection?.id) {
      fail("token issue response did not include a bearer token and connection id.");
    }

    const token = tokenResult.body.token;
    const connectionId = tokenResult.body.connection.id;

    const listResult = await callAppApi(page, `/api/build-sync/tokens?ideaId=${encodeURIComponent(ideaId)}`);
    if (!listResult.ok || listResult.body.registryStatus !== "ready") {
      fail(`connection list was not ready: HTTP ${listResult.status}`);
    }

    const activeConnection = (listResult.body.tokens ?? []).find(
      (connection) => connection.id === connectionId && connection.status === "active",
    );
    if (!activeConnection) {
      fail("issued Cursor connection was not visible as active in the connection list.");
    }

    if (usedDisposableIdea || allowProgressWrite) {
      const progressResult = await callAppApi(page, "/api/build-sync/progress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          records: [
            {
              task: "T-001 build sync smoke registry verification",
              status: "done",
              summary: "Verified that a registered Cursor connection can write progress before revocation.",
              files: ["scripts/smoke_build_sync_tokens.mjs"],
              verification: "Token registry status was ready and progress API accepted the active token.",
              recordedAt: new Date().toISOString(),
            },
          ],
        }),
      });

      if (!progressResult.ok || progressResult.body.registryStatus !== "ready") {
        fail(`active token progress write failed: HTTP ${progressResult.status}`);
      }

      const usedListResult = await callAppApi(page, `/api/build-sync/tokens?ideaId=${encodeURIComponent(ideaId)}`);
      const usedConnection = (usedListResult.body.tokens ?? []).find((connection) => connection.id === connectionId);
      if (!usedConnection?.lastUsedAt) {
        fail("active token progress write did not update lastUsedAt.");
      }

      if (usedDisposableIdea && resolvedSupabaseConfig) {
        await createDisposableLaunchPackage(page, resolvedSupabaseConfig, ideaId);
        await verifyFinalExecutionCursorGuide(page, ideaId);
        await verifyPackageOnlyExternalToolHandoffs(page, ideaId);
      }

      await verifyLearningTaskBoard(page, ideaId);
    }

    const revokeResult = await callAppApi(page, `/api/build-sync/tokens/${encodeURIComponent(connectionId)}`, {
      method: "DELETE",
    });

    if (!revokeResult.ok || revokeResult.body.connection?.status !== "revoked") {
      fail(`connection revoke failed: HTTP ${revokeResult.status}`);
    }

    const rejectedProgressResult = await callAppApi(page, "/api/build-sync/progress", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        records: [
          {
            task: "T-002 revoked token should fail",
            status: "done",
            summary: "This write must be rejected because the connection was revoked.",
            verification: "Expected HTTP 401.",
            recordedAt: new Date().toISOString(),
          },
        ],
      }),
    });

    if (rejectedProgressResult.status !== 401) {
      fail(`revoked token was not rejected. Expected HTTP 401, received ${rejectedProgressResult.status}`);
    }

    console.log("Build sync token smoke passed.");
    console.log("Registry status: ready");
    console.log("Issued connection: active");
    console.log(
      usedDisposableIdea || allowProgressWrite
        ? "Progress write: accepted before revoke"
        : "Progress write: skipped before revoke to avoid mutating an existing idea",
    );
    console.log(
      usedDisposableIdea || allowProgressWrite
        ? "Task board UI: synced task visible in STEP 8"
        : "Task board UI: skipped because progress write was skipped",
    );
    console.log(
      usedDisposableIdea && resolvedSupabaseConfig
        ? "Final execution UI: Cursor CLI check visible in STEP 7"
        : "Final execution UI: skipped because disposable launch package was not available",
    );
    console.log(
      usedDisposableIdea && resolvedSupabaseConfig
        ? "Package-only handoff UI: non-Cursor tools stay on start-package guidance"
        : "Package-only handoff UI: skipped because disposable launch package was not available",
    );
    console.log("Connection revoke: accepted");
    console.log("Revoked token write: rejected");
  } finally {
    if (ideaId && usedDisposableIdea && resolvedSupabaseConfig && !keepData) {
      const cleanupResult = await cleanupDisposableIdea(page, resolvedSupabaseConfig, ideaId).catch((error) => ({
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      }));

      if (!cleanupResult.ok) {
        console.log(`Cleanup warning: disposable smoke idea was not deleted (${cleanupResult.error}).`);
      } else {
        console.log("Cleanup: disposable smoke idea deleted.");
      }
    } else if (ideaId && usedDisposableIdea) {
      console.log(`Cleanup skipped by BUILD_SYNC_SMOKE_KEEP_DATA=1 for disposable idea ${ideaId}.`);
    }

    await browser.close();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
