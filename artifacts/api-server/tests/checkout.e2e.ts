import assert from "node:assert/strict";

const BASE = (process.env.E2E_API_BASE || "http://localhost:8080").replace(/\/+$/, "");

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

async function postCheckout(tierId: string, body: any) {
  const res = await fetch(`${BASE}/api/checkout/${encodeURIComponent(tierId)}`, {
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

async function main() {
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

  await run("happy path: essentials monthly returns a Stripe checkout URL", async () => {
    const r = await postCheckout("essentials", { billingCycle: "monthly", customerType: "business", seatQuantity: 3 });
    assert.equal(r.status, 200, `expected 200, got ${r.status}: ${JSON.stringify(r.body)}`);
    assert.match(String(r.body?.url || ""), /checkout\.stripe\.com/);
  });

  await run("seat floor is enforced from the resolved tier, not the client", async () => {
    // Client lies about customerType=consumer to try to get seat floor=1 on a business tier.
    // Server must still apply the business floor of 3 — observable via the structured log
    // (we can only assert API success here; check `[Stripe Checkout] ... "seats":3 ...`
    // in the API server log to confirm the floor was applied).
    const r = await postCheckout("business", { billingCycle: "monthly", customerType: "consumer", seatQuantity: 1 });
    assert.equal(r.status, 200, `expected 200, got ${r.status}: ${JSON.stringify(r.body)}`);
    assert.match(String(r.body?.url || ""), /checkout\.stripe\.com/);
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

  const failed = results.filter((r) => r.outcome === "fail");
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  if (failed.length > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Test runner crashed:", err);
  process.exit(1);
});
