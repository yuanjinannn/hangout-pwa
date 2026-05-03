const { chromium } = require("playwright");

const BASE_URL = process.env.SMOKE_BASE_URL || "http://127.0.0.1:4173/";
const BROWSER_PATH = process.env.SMOKE_BROWSER_PATH || "";
const STORAGE_KEY = "hangout-pwa-state-v3";
const PUBLIC = "\u516c\u5f00";
const RECRUITING = "\u62db\u52df\u4e2d";
const CONFIRMED = "\u5df2\u786e\u8ba4";
const REVIEW = "\u5f85\u5ba1\u6838";

const results = [];
const issues = [];
const consoleErrors = [];
const failedRequests = [];

async function step(name, fn) {
  const started = Date.now();
  try {
    const detail = await fn();
    results.push({ name, ok: true, ms: Date.now() - started, detail: detail || "" });
  } catch (error) {
    const detail = error && error.message ? error.message : String(error);
    results.push({ name, ok: false, ms: Date.now() - started, detail });
    issues.push(`${name}: ${detail}`);
  }
}

async function main() {
  const launchOptions = { headless: true };
  if (BROWSER_PATH) launchOptions.executablePath = BROWSER_PATH;

  const browser = await chromium.launch(launchOptions);
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    locale: "zh-CN"
  });
  const page = await context.newPage();

  page.on("console", (message) => {
    if (message.type() !== "error") return;
    if (message.text().startsWith("Failed to load resource: the server responded with a status of 503")) return;
    consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => consoleErrors.push(error.message));
  page.on("requestfailed", (request) => {
    const type = request.resourceType();
    if (["document", "script", "xhr", "fetch", "stylesheet"].includes(type)) {
      failedRequests.push(`${type} ${request.url()} ${request.failure()?.errorText || ""}`);
    }
  });

  await step("home loads and shell renders", async () => {
    await page.goto(BASE_URL, { waitUntil: "networkidle", timeout: 30000 });
    await page.locator("#app .phone-shell").waitFor({ timeout: 10000 });
    const navCount = await page.locator(".bottom-nav button").count();
    if (navCount !== 4) throw new Error(`bottom nav count=${navCount}`);
    const activeSections = await page.locator("section.active").count();
    if (activeSections !== 1) throw new Error(`active section count=${activeSections}`);
    return "shell, topbar, and bottom tabs rendered";
  });

  await step("map search imports or falls back", async () => {
    await page.locator(".bottom-nav [data-tab=\"places\"]").click();
    await page.locator("section.active [data-filter=\"placeFilters.query\"]").fill("\u5496\u5561");
    const before = await page.evaluate((key) => {
      const state = JSON.parse(localStorage.getItem(key));
      return state ? state.places.length : 8;
    }, STORAGE_KEY);
    const responsePromise = page.waitForResponse(
      (response) => response.url().includes("/api/places") && response.request().method() === "GET",
      { timeout: 25000 }
    );
    await page.locator("section.active [data-action=\"live-search\"]").click();
    const response = await responsePromise;
    const body = await response.json().catch(() => ({}));
    await page.waitForFunction(
      () => !document.querySelector("section.active")?.innerText.includes("\u6b63\u5728\u8fde\u63a5\u5730\u56fe\u641c\u7d22"),
      null,
      { timeout: 15000 }
    );
    const after = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)).places.length, STORAGE_KEY);
    if (response.status() === 503 && /AMAP_KEY|未配置/.test(body.message || "")) {
      if (after !== before) throw new Error(`fallback changed places: before=${before}, after=${after}`);
      return `api ${response.status()}, no AMAP_KEY, local recommendations preserved`;
    }
    if (!response.ok()) throw new Error(`api status ${response.status()}: ${body.message || "no message"}`);
    if (!Array.isArray(body.places) || body.places.length === 0) throw new Error("api returned no places");
    if (after <= before) throw new Error(`places not imported: before=${before}, after=${after}`);
    return `api ${response.status()}, returned ${body.places.length}, local places ${before}->${after}`;
  });

  let createdId = "";
  await step("create public activity ticket", async () => {
    await page.locator(".bottom-nav [data-tab=\"plan\"]").click();
    await page.locator("section.active [data-create=\"title\"]").fill("Smoke test activity");
    await page.locator(`section.active [data-create-visibility="${PUBLIC}"]`).click();
    await page.locator("section.active [data-create=\"participantNames\"]").fill("Test Friend");
    await page.locator("section.active [data-create=\"capacity\"]").fill("5");
    await page.locator("section.active [data-create=\"note\"]").fill("Automated smoke test note");
    await page.locator("section.active [data-action=\"create-activity\"]").click();
    await page.waitForFunction(
      (key) => JSON.parse(localStorage.getItem(key)).activities[0]?.title === "Smoke test activity",
      STORAGE_KEY,
      { timeout: 10000 }
    );
    const created = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)).activities[0], STORAGE_KEY);
    createdId = created.id;
    if (created.visibility !== PUBLIC) throw new Error(`visibility=${created.visibility}`);
    if (created.status !== RECRUITING) throw new Error(`status=${created.status}`);
    return `created ${createdId}`;
  });

  await step("interest, vote, finalize", async () => {
    if (!createdId) throw new Error("missing created activity id");
    const active = page.locator("section.active");
    await active.locator(`[data-action="interest"][data-id="${createdId}"]`).click();
    await active.locator(`[data-action="vote"][data-id="${createdId}"][data-value="maybe"]`).first().click();
    await active.locator(`[data-action="finalize"][data-id="${createdId}"]`).click();
    const activity = await page.evaluate(
      ({ key, id }) => JSON.parse(localStorage.getItem(key)).activities.find((item) => item.id === id),
      { key: STORAGE_KEY, id: createdId }
    );
    if (activity.status !== CONFIRMED) throw new Error(`status after finalize=${activity.status}`);
    if (!activity.finalTime || !activity.finalPlaceId) throw new Error("missing final time/place");
    return `finalized with time=${activity.finalTime}, place=${activity.finalPlaceId}`;
  });

  await step("report threshold enters review", async () => {
    if (!createdId) throw new Error("missing created activity id");
    const active = page.locator("section.active");
    const reportButton = active.locator(`[data-action="report"][data-id="${createdId}"]`);
    for (let index = 0; index < 3; index += 1) {
      await reportButton.scrollIntoViewIfNeeded();
      await reportButton.click();
    }
    const activity = await page.evaluate(
      ({ key, id }) => JSON.parse(localStorage.getItem(key)).activities.find((item) => item.id === id),
      { key: STORAGE_KEY, id: createdId }
    );
    if (activity.reports < 3) throw new Error(`reports=${activity.reports}`);
    if (activity.status !== REVIEW) throw new Error(`status after 3 reports=${activity.status}`);
    return `reports=${activity.reports}, status=${activity.status}`;
  });

  await step("demo data reset works", async () => {
    await page.locator(".avatar-button[data-action=\"open-profile\"]").click();
    page.once("dialog", (dialog) => dialog.accept());
    await page.locator("[data-action=\"reset-demo\"]").click();
    await page.waitForFunction(
      (key) => {
        const state = JSON.parse(localStorage.getItem(key));
        return state.activities.length === 3 && state.places.length === 8 && state.currentUserId === "u1";
      },
      STORAGE_KEY,
      { timeout: 10000 }
    );
    return "state restored to seed data";
  });

  await step("PWA cache is populated", async () => {
    await page.waitForTimeout(500);
    const cacheInfo = await page.evaluate(async () => {
      if (!("caches" in window)) return { supported: false, counts: [] };
      const names = await caches.keys();
      const counts = [];
      for (const name of names) {
        const keys = await caches.open(name).then((cache) => cache.keys());
        counts.push({ name, count: keys.length });
      }
      return { supported: true, names, counts };
    });
    if (!cacheInfo.supported) throw new Error("Cache API unsupported");
    if (!cacheInfo.names.some((name) => name.startsWith("hangout-pwa-"))) throw new Error("hangout cache missing");
    return JSON.stringify(cacheInfo.counts);
  });

  await browser.close();

  const report = { results, issues, consoleErrors, failedRequests };
  console.log(JSON.stringify(report, null, 2));
  if (issues.length || consoleErrors.length || failedRequests.length) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
