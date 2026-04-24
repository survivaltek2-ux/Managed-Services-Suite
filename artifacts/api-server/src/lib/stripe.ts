import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;

export const stripe = key
  ? new Stripe(key, { apiVersion: "2025-02-24.acacia" as any })
  : null;

export function getStripe(): Stripe {
  if (!stripe) {
    throw new Error("Stripe is not configured. Please set STRIPE_SECRET_KEY.");
  }
  return stripe;
}

export const STRIPE_PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY || "";
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || "";

export function isStripeConfigured(): boolean {
  return !!process.env.STRIPE_SECRET_KEY;
}

/**
 * In Stripe API version 2025-02-24.acacia and later, `current_period_start` /
 * `current_period_end` were moved off the Subscription object onto each
 * subscription item. This helper reads from the item first and falls back to
 * the legacy subscription-level field, so it works against both shapes.
 *
 * Returns `null` if the field is missing or invalid (avoids `Invalid Date`
 * writes to the DB).
 */
export function getSubscriptionPeriod(sub: any): {
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
} {
  const item = sub?.items?.data?.[0] || {};
  const startSec = item.current_period_start ?? sub?.current_period_start;
  const endSec   = item.current_period_end   ?? sub?.current_period_end;
  const toDate = (s: unknown): Date | null => {
    if (typeof s !== "number" || !Number.isFinite(s) || s <= 0) return null;
    const d = new Date(s * 1000);
    return isNaN(d.getTime()) ? null : d;
  };
  return { currentPeriodStart: toDate(startSec), currentPeriodEnd: toDate(endSec) };
}

/**
 * Boot-time health check that verifies the Stripe API key actually works
 * (a single lightweight `balance.retrieve` call). Logs a clear warning if
 * misconfigured so the issue is visible immediately at startup instead of
 * surfacing only when a customer clicks "Get Started".
 */
export async function runStripeBootHealthCheck(): Promise<void> {
  if (!isStripeConfigured()) {
    console.warn("[Stripe Health] STRIPE_SECRET_KEY not set — pricing → checkout will return 503.");
    return;
  }
  try {
    const s = getStripe();
    await s.balance.retrieve();
    const mode = (process.env.STRIPE_SECRET_KEY || "").startsWith("sk_live_") ? "live" : "test";
    console.log(`[Stripe Health] OK — API key valid (${mode} mode).`);
    if (!STRIPE_WEBHOOK_SECRET) {
      console.warn("[Stripe Health] STRIPE_WEBHOOK_SECRET not set — webhook events will be rejected.");
    }
    if (!STRIPE_PUBLISHABLE_KEY) {
      console.warn("[Stripe Health] STRIPE_PUBLISHABLE_KEY not set — client-side Stripe.js features may not work.");
    }
  } catch (err: any) {
    console.error(
      `[Stripe Health] FAILED — Stripe API rejected the key. type=${err?.type || "unknown"} code=${err?.code || "none"} message=${err?.message || err}`,
    );
  }
}
