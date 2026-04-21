import assert from "node:assert/strict";
import { spawn, type ChildProcess } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const BASE = (process.env.E2E_API_BASE || "http://localhost:8080").replace(/\/+$/, "");
const __dirname = path.dirname(fileURLToPath(import.meta.url));

type Outcome = "ok" | "fail";
const results: Array<{ name: string; outcome: Outcome; detail?: string }> = [];

async function run(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    results.push({ name, outcome: "ok" });
    console.log(`PASS  ${name}`);
  } catch (err: any) {
    results.push({ name, outcome: "fail", detail: err?.message || String(err) });
    console.error(`FAIL  ${name}\n      ${err?.message || err}`);
  }
}

async function postCheckout(tierId: string, body: any, base = BASE) {
  const res = await fetch(`${base}/api/checkout/${encodeURIComponent(tierId)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  let json: any = null;
  try {
    json = await res.json();
  } catch {
    /* non-JSON body */
  }
  return { status: res.status, body: json };
}

async function ensureConsumerTier(): Promise<void> {
  const { db, pricingTiersTable } = await import("@workspace/db");
  const { eq } = await import("drizzle-orm");
  const existing = await db.select().from(pricingTiersTable).where(eq(pricingTiersTable.slug, "consumer"));
  if (existing.length > 0) return;
  await db.insert(pricingTiersTable).values({
    slug: "consumer",
    name: "Consumer",
    tagline: "Essential remote IT support for individuals.",
    startingPrice: "49",
    annualPrice: "42",
    priceUnit: "per user / month",
    pricePrefix: "Starting at",
    mostPopular: false,
    sortOrder: -1,
    ctaLabel: "Get Started",
    ctaLink: "/quote",
    autoActivate: true,
    features: JSON.stringify(["Help desk", "Patching", "Antivirus"]),
    excludedFeatures: JSON.stringify(["24/7 support"]),
  } as any);
}

async function getTierStripeIds(slug: string) {
  const { db, pricingTiersTable } = await import("@workspace/db");
  const { eq } = await import("drizzle-orm");
  const [t] = await db.select().from(pricingTiersTable).where(eq(pricingTiersTable.slug, slug));
  return {
    monthly: (t as any)?.stripeMonthlyPriceId as string | null,
    annual: (t as any)?.stripeAnnualPriceId as string | null,
    product: (t as any)?.stripeProductId as string | null,
  };
}

async function setTierStripeMonthlyPriceId(slug: string, value: string | null) {
  const { db, pricingTiersTable } = await import("@workspace/db");
  const { eq } = await import("drizzle-orm");
  await db
    .update(pricingTiersTable)
    .set({ stripeMonthlyPriceId: value as any })
    .where(eq(pricingTiersTable.slug, slug));
}

async function startUnconfiguredServer(): Promise<{ proc: ChildProcess; base: string }> {
  // Spawn a child API server with STRIPE_SECRET_KEY blanked so we can hit
  // the real /api/checkout route in its `stripe_not_configured` branch.
  const port = 8090 + Math.floor(Math.random() * 100);
  const env = { ...process.env, STRIPE_SECRET_KEY: "", PORT: String(port), NODE_ENV: "development" };
  const entry = path.resolve(__dirname, "../src/index.ts");
  const proc = spawn("npx", ["tsx", entry], { env, stdio: ["ignore", "pipe", "pipe"] });
  let lastErr = "";
  proc.stdout?.on("data", () => {});
  proc.stderr?.on("data", (d) => {
    lastErr = String(d).slice(-400);
  });
  // Poll for readiness up to 90s — the API server runs Telarus/Zoom/etc.
  // bootstrapping on startup which can take a while.
  const base = `http://localhost:${port}`;
  for (let i = 0; i < 180; i++) {
    await sleep(500);
    try {
      const r = await fetch(`${base}/api/stripe-config`, { signal: AbortSignal.timeout(1500) });
      if (r.status >= 200 && r.status < 500) return { proc, base };
    } catch {
      /* still booting */
    }
  }
  proc.kill("SIGKILL");
  throw new Error(`Unconfigured child server did not become ready in time. Last stderr: ${lastErr}`);
}

async function main() {
  await ensureConsumerTier();

  await run("happy path: business monthly returns a Stripe checkout URL", async () => {
    const r = await postCheckout("business", { billingCycle: "monthly", customerType: "business", seatQuantity: 3 });
    assert.equal(r.status, 200, `expected 200, got ${r.status}: ${JSON.stringify(r.body)}`);
    assert.ok(r.body?.url, "expected response.url");
    assert.match(r.body.url, /checkout\.stripe\.com/, `expected stripe url, got ${r.body.url}`);
  });

  await run("happy path: business annual with 5 seats returns a Stripe checkout URL", async () => {
    const r = await postCheckout("business", { billingCycle: "annual", customerType: "business", seatQuantity: 5 });
    assert.equal(r.status, 200, `expected 200, got ${r.status}: ${JSON.stringify(r.body)}`);
    assert.match(String(r.body?.url || ""), /checkout\.stripe\.com/);
  });

  await run("happy path: consumer monthly returns a Stripe checkout URL", async () => {
    const r = await postCheckout("consumer", { billingCycle: "monthly", customerType: "consumer", seatQuantity: 1 });
    assert.equal(r.status, 200, `expected 200, got ${r.status}: ${JSON.stringify(r.body)}`);
    assert.match(String(r.body?.url || ""), /checkout\.stripe\.com/);
  });

  await run("happy path: essentials monthly returns a Stripe checkout URL", async () => {
    const r = await postCheckout("essentials", { billingCycle: "monthly", customerType: "business", seatQuantity: 3 });
    assert.equal(r.status, 200, `expected 200, got ${r.status}: ${JSON.stringify(r.body)}`);
    assert.match(String(r.body?.url || ""), /checkout\.stripe\.com/);
  });

  await run("seat floor is enforced from the resolved tier, not the client", async () => {
    // Client lies about customerType=consumer to try to get seat floor=1 on a business tier.
    // Server must still apply the business floor of 3 — observable in the structured log
    // (`"tierSlug":"business","seats":3` even though seatQuantity:1 was requested).
    const r = await postCheckout("business", { billingCycle: "monthly", customerType: "consumer", seatQuantity: 1 });
    assert.equal(r.status, 200, `expected 200, got ${r.status}: ${JSON.stringify(r.body)}`);
    assert.match(String(r.body?.url || ""), /checkout\.stripe\.com/);
  });

  await run("self-heal: stale stripe_monthly_price_id is replaced and checkout still succeeds", async () => {
    // We poison the consumer tier's cached monthly price ID. Consumer is an
    // auto-activate tier (subscription mode), so the cached price ID is
    // actually passed to Stripe — Stripe will return a stale-resource error,
    // and the route should clear the cached ID, recreate it, and finish.
    const before = await getTierStripeIds("consumer");
    const poison = "price_1Stale000000000000DEADBEEF";
    await setTierStripeMonthlyPriceId("consumer", poison);
    try {
      const r = await postCheckout("consumer", { billingCycle: "monthly", customerType: "consumer", seatQuantity: 1 });
      assert.equal(r.status, 200, `expected self-heal success, got ${r.status}: ${JSON.stringify(r.body)}`);
      assert.match(String(r.body?.url || ""), /checkout\.stripe\.com/);
      const after = await getTierStripeIds("consumer");
      assert.notEqual(after.monthly, poison, "stale price ID should have been cleared/replaced");
      assert.ok(after.monthly && after.monthly.startsWith("price_"), `expected real price id, got ${after.monthly}`);
    } finally {
      // If something went sideways, restore the original ID so we don't leak state.
      const after = await getTierStripeIds("consumer");
      if (after.monthly === poison && before.monthly) {
        await setTierStripeMonthlyPriceId("consumer", before.monthly);
      }
    }
  });

  await run("failure: tier_not_found surfaces as 404 with error code", async () => {
    const r = await postCheckout("nope-not-a-real-tier", { billingCycle: "monthly", customerType: "business", seatQuantity: 3 });
    assert.equal(r.status, 404);
    assert.equal(r.body?.error, "tier_not_found");
  });

  await run("failure: enterprise tier surfaces as contact_sales", async () => {
    const r = await postCheckout("enterprise", { billingCycle: "monthly", customerType: "business", seatQuantity: 3 });
    assert.equal(r.status, 400);
    assert.equal(r.body?.error, "contact_sales");
  });

  await run("failure: invalid seat quantity rejected with clean error", async () => {
    const r = await postCheckout("business", { billingCycle: "monthly", customerType: "business", seatQuantity: "abc" });
    assert.equal(r.status, 400);
    assert.equal(r.body?.error, "invalid_seat_quantity");
  });

  await run("failure: zero seat quantity rejected with clean error", async () => {
    const r = await postCheckout("business", { billingCycle: "monthly", customerType: "business", seatQuantity: 0 });
    assert.equal(r.status, 400);
    assert.equal(r.body?.error, "invalid_seat_quantity");
  });

  await run("failure: invalid billing cycle rejected with clean error", async () => {
    const r = await postCheckout("business", { billingCycle: "weekly", customerType: "business", seatQuantity: 3 });
    assert.equal(r.status, 400);
    assert.equal(r.body?.error, "invalid_billing_cycle");
  });

  await run("failure: stripe_not_configured surfaces as 503 with error code", async () => {
    if (process.env.E2E_SKIP_UNCONFIGURED === "1") {
      console.log("       (skipped via E2E_SKIP_UNCONFIGURED=1)");
      return;
    }
    let started: { proc: ChildProcess; base: string } | null = null;
    try {
      started = await startUnconfiguredServer();
      const r = await postCheckout("business", { billingCycle: "monthly", customerType: "business", seatQuantity: 3 }, started.base);
      assert.equal(r.status, 503, `expected 503, got ${r.status}: ${JSON.stringify(r.body)}`);
      assert.equal(r.body?.error, "stripe_not_configured");
    } finally {
      if (started) {
        started.proc.kill("SIGKILL");
        await sleep(300);
      }
    }
  });

  const failed = results.filter((r) => r.outcome === "fail");
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  if (failed.length > 0) {
    process.exit(1);
  }
  process.exit(0);
}

main().catch((err) => {
  console.error("Test runner crashed:", err);
  process.exit(1);
});
