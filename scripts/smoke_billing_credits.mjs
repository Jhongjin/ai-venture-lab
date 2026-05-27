const baseUrl = process.env.BILLING_SMOKE_URL || process.env.SMOKE_URL || "https://ai-venture-lab.vercel.app";
const timeoutMs = Number.parseInt(process.env.BILLING_SMOKE_TIMEOUT_MS || "30000", 10);

function fail(message) {
  throw new Error(`Billing credit smoke failed: ${message}`);
}

async function fetchWithTimeout(path, init = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(new URL(path, baseUrl), {
      ...init,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function expectStatus(path, init, expectedStatus) {
  const response = await fetchWithTimeout(path, init);
  const body = await response.json().catch(() => ({}));

  if (response.status !== expectedStatus) {
    fail(`${path} returned HTTP ${response.status}; expected ${expectedStatus}. ${body.error ?? ""}`.trim());
  }

  return body;
}

async function main() {
  const creditsBody = await expectStatus("/api/billing/credits", {}, 401);
  if (typeof creditsBody.error !== "string" || !creditsBody.error.includes("Login")) {
    fail("/api/billing/credits did not return the expected login-required error.");
  }

  const passBody = await expectStatus(
    "/api/billing/build-pass",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ideaId: "00000000-0000-4000-8000-000000000000" }),
    },
    401,
  );
  if (typeof passBody.error !== "string" || !passBody.error.includes("Login")) {
    fail("/api/billing/build-pass did not return the expected login-required error.");
  }

  console.log("Billing credit smoke passed.");
  console.log("Anonymous credit summary: rejected");
  console.log("Anonymous build-pass unlock: rejected");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
