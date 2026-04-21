import { Router, type IRouter, type Request, type Response } from "express";
import { db, invoicesTable, subscriptionsTable, partnersTable, usersTable, pricingTiersTable, partnerCommissionsTable, documentsTable } from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../middlewares/auth.js";
import { getStripe, isStripeConfigured, STRIPE_PUBLISHABLE_KEY } from "../lib/stripe.js";
import { sendContractEmail, sendSubscriptionPendingEmail, sendSubscriptionApprovedEmail, sendSubscriptionRejectedEmail } from "../lib/email.js";
import { generateMSAContract } from "../lib/contract.js";

const router: IRouter = Router();

function getBaseUrl(req: Request): string {
  const host = req.get("host") || "";
  const proto = req.get("x-forwarded-proto") || req.protocol || "https";
  return `${proto}://${host}`;
}

function stripeNotConfiguredError(res: Response) {
  res.status(503).json({ error: "stripe_not_configured", message: "Stripe payment processing is not yet configured." });
}

router.get("/billing/config", (_req, res) => {
  res.json({ publishableKey: STRIPE_PUBLISHABLE_KEY, configured: isStripeConfigured() });
});

router.post("/invoices/:id/pay", requireAuth, async (req: any, res) => {
  if (!isStripeConfigured()) return stripeNotConfiguredError(res);
  try {
    const stripe = getStripe();
    const id = parseInt(req.params.id);
    const userId = req.userId;

    const [invoice] = await db.select().from(invoicesTable).where(eq(invoicesTable.id, id));
    if (!invoice) { res.status(404).json({ error: "not_found" }); return; }
    if (invoice.userId !== userId) { res.status(403).json({ error: "forbidden" }); return; }
    if (invoice.status === "paid") { res.status(400).json({ error: "already_paid" }); return; }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
    let customerId = user?.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({ email: user?.email, name: user?.name, metadata: { userId: String(userId) } });
      customerId = customer.id;
      await db.update(usersTable).set({ stripeCustomerId: customerId }).where(eq(usersTable.id, userId));
    }

    const base = getBaseUrl(req);
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer: customerId,
      line_items: [{
        price_data: {
          currency: "usd",
          product_data: { name: invoice.title || `Invoice ${invoice.invoiceNumber}` },
          unit_amount: Math.round(parseFloat(invoice.total) * 100),
        },
        quantity: 1,
      }],
      metadata: { invoiceId: String(invoice.id), type: "invoice_payment" },
      success_url: `${base}/partners/billing?payment=success&invoice=${invoice.id}`,
      cancel_url: `${base}/partners/billing?payment=cancelled`,
    });

    await db.update(invoicesTable).set({ stripeCheckoutSessionId: session.id }).where(eq(invoicesTable.id, id));
    res.json({ url: session.url, sessionId: session.id });
  } catch (err: any) {
    console.error("[Stripe] Invoice pay error:", err);
    res.status(500).json({ error: "stripe_error", message: err.message });
  }
});

router.get("/billing/subscription", requireAuth, async (req: any, res) => {
  try {
    const userId = req.userId;
    const subs = await db.select().from(subscriptionsTable)
      .where(and(eq(subscriptionsTable.userId, userId)))
      .orderBy(desc(subscriptionsTable.createdAt))
      .limit(1);
    res.json({ subscription: subs[0] || null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error" });
  }
});

router.post("/admin/billing/subscriptions", requireAdmin, async (req: any, res) => {
  if (!isStripeConfigured()) return stripeNotConfiguredError(res);
  try {
    const stripe = getStripe();
    const { userId, partnerId, tierId, billingCycle = "monthly" } = req.body;

    let tier: any = null;
    if (tierId) {
      const [t] = await db.select().from(pricingTiersTable).where(eq(pricingTiersTable.id, parseInt(tierId)));
      tier = t;
    }
    if (!tier) { res.status(404).json({ error: "tier_not_found" }); return; }

    const annualPriceRaw = parseFloat(tier.annualPrice ?? "0");
    const effectiveAnnualPrice = annualPriceRaw > 0 ? tier.annualPrice : tier.startingPrice;
    const priceAmount = billingCycle === "annual"
      ? Math.round(parseFloat(effectiveAnnualPrice) * 100)
      : Math.round(parseFloat(tier.startingPrice) * 100);

    let email = "";
    let name = "";
    let existingCustomerId: string | null | undefined = null;

    if (userId) {
      const [user] = await db.select().from(usersTable).where(eq(usersTable.id, parseInt(userId)));
      if (!user) { res.status(404).json({ error: "user_not_found" }); return; }
      email = user.email; name = user.name; existingCustomerId = user.stripeCustomerId;
    } else if (partnerId) {
      const [partner] = await db.select().from(partnersTable).where(eq(partnersTable.id, parseInt(partnerId)));
      if (!partner) { res.status(404).json({ error: "partner_not_found" }); return; }
      email = partner.email; name = partner.contactName; existingCustomerId = partner.stripeCustomerId;
    } else {
      res.status(400).json({ error: "must_provide_userId_or_partnerId" }); return;
    }

    let customerId = existingCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({ email, name, metadata: { userId: userId || "", partnerId: partnerId || "" } });
      customerId = customer.id;
      if (userId) await db.update(usersTable).set({ stripeCustomerId: customerId }).where(eq(usersTable.id, parseInt(userId)));
      if (partnerId) await db.update(partnersTable).set({ stripeCustomerId: customerId }).where(eq(partnersTable.id, parseInt(partnerId)));
    }

    const product = await stripe.products.create({ name: `${tier.name} Plan`, metadata: { tierId: String(tier.id), tierSlug: tier.slug } });
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: priceAmount,
      currency: "usd",
      recurring: { interval: billingCycle === "annual" ? "year" : "month" },
    });

    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: price.id }],
      metadata: { tierId: String(tier.id), planSlug: tier.slug, userId: userId || "", partnerId: partnerId || "" },
    });

    const [saved] = await db.insert(subscriptionsTable).values({
      userId: userId ? parseInt(userId) : null,
      partnerId: partnerId ? parseInt(partnerId) : null,
      stripeSubscriptionId: subscription.id,
      stripeCustomerId: customerId,
      stripePriceId: price.id,
      stripeProductId: product.id,
      planId: tier.slug,
      planName: tier.name,
      status: subscription.status as any,
      currentPeriodStart: new Date(((subscription as any).current_period_start as number) * 1000),
      currentPeriodEnd: new Date(((subscription as any).current_period_end as number) * 1000),
      cancelAtPeriodEnd: (subscription as any).cancel_at_period_end ?? false,
      billingCycle,
      amount: String(priceAmount / 100),
    }).returning();

    // Generate and send MSA contract (non-blocking — errors don't fail the subscription creation)
    (async () => {
      try {
        const effectiveDate = new Date(((subscription as any).current_period_start as number) * 1000);
        const seats = 1; // Admin-created subscriptions are per-entity, not seat-counted; default to 1
        const cycle = billingCycle as "monthly" | "annual";
        const companyName = name;

        const pdfBuffer = await generateMSAContract({
          customerName: name,
          customerEmail: email,
          companyName,
          planName: tier.name,
          planSlug: tier.slug,
          billingCycle: cycle,
          pricePerUser: priceAmount / 100,
          seats,
          subscriptionId: subscription.id,
          effectiveDate,
        });

        await sendContractEmail({
          customerName: name,
          customerEmail: email,
          companyName,
          planName: tier.name,
          billingCycle: cycle,
          pricePerUser: priceAmount / 100,
          seats,
          subscriptionId: subscription.id,
          effectiveDate,
          contractPdf: pdfBuffer,
        });

        const refId = subscription.id.replace("sub_", "").slice(0, 12).toUpperCase();
        await db.insert(documentsTable).values({
          name: `MSA — ${companyName} — ${tier.name} Plan`,
          description: `Managed Services Agreement created by admin. Plan: ${tier.name} (${billingCycle}), effective ${effectiveDate.toISOString().slice(0, 10)}.`,
          filename: `Siebert_Services_MSA_${refId}.pdf`,
          mimeType: "application/pdf",
          size: pdfBuffer.length,
          content: pdfBuffer.toString("base64"),
          category: "contract" as any,
          partnerId: partnerId ? parseInt(partnerId) : null,
          uploadedBy: "admin",
          tags: JSON.stringify(["contract", "msa", "admin-created", tier.slug]),
          active: true,
        });

        console.log(`[Admin Billing] Contract generated and sent to ${email} for subscription ${subscription.id}`);
      } catch (contractErr) {
        console.error("[Admin Billing] Contract generation failed (non-fatal):", contractErr);
      }
    })();

    res.status(201).json({ subscription: saved, stripeSubscription: subscription });
  } catch (err: any) {
    console.error("[Stripe] Create subscription error:", err);
    res.status(500).json({ error: "stripe_error", message: err.message });
  }
});

router.put("/admin/billing/subscriptions/:id/cancel", requireAdmin, async (req: any, res) => {
  if (!isStripeConfigured()) return stripeNotConfiguredError(res);
  try {
    const stripe = getStripe();
    const id = parseInt(req.params.id);
    const { immediately = false } = req.body;

    const [sub] = await db.select().from(subscriptionsTable).where(eq(subscriptionsTable.id, id));
    if (!sub) { res.status(404).json({ error: "not_found" }); return; }

    if (immediately) {
      await stripe.subscriptions.cancel(sub.stripeSubscriptionId);
      await db.update(subscriptionsTable).set({ status: "canceled", canceledAt: new Date(), updatedAt: new Date() }).where(eq(subscriptionsTable.id, id));
    } else {
      await stripe.subscriptions.update(sub.stripeSubscriptionId, { cancel_at_period_end: true });
      await db.update(subscriptionsTable).set({ cancelAtPeriodEnd: true, updatedAt: new Date() }).where(eq(subscriptionsTable.id, id));
    }

    const [updated] = await db.select().from(subscriptionsTable).where(eq(subscriptionsTable.id, id));
    res.json({ subscription: updated });
  } catch (err: any) {
    console.error("[Stripe] Cancel subscription error:", err);
    res.status(500).json({ error: "stripe_error", message: err.message });
  }
});

// ─── Pending signups list ────────────────────────────────────────────────────

router.get("/admin/billing/pending-signups", requireAdmin, async (_req, res) => {
  try {
    const pending = await db.select().from(subscriptionsTable)
      .where(eq(subscriptionsTable.approvalStatus, "pending"))
      .orderBy(desc(subscriptionsTable.createdAt));
    res.json(pending);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error" });
  }
});

// ─── Approve a pending signup (capture pre-auth, send contract) ──────────────

router.post("/admin/billing/subscriptions/:id/approve", requireAdmin, async (req: any, res) => {
  if (!isStripeConfigured()) return stripeNotConfiguredError(res);
  try {
    const stripe = getStripe();
    const id = parseInt(req.params.id);

    const [sub] = await db.select().from(subscriptionsTable).where(eq(subscriptionsTable.id, id));
    if (!sub) { res.status(404).json({ error: "not_found" }); return; }
    if (sub.approvalStatus !== "pending") {
      res.status(400).json({ error: "not_pending", message: "Subscription is not in pending approval state." });
      return;
    }

    const paymentIntentId = sub.stripePaymentIntentId;
    if (!paymentIntentId) {
      res.status(400).json({ error: "no_payment_intent", message: "No pre-authorization payment intent found." });
      return;
    }

    // Capture the pre-authorization — this actually charges the customer's card.
    await stripe.paymentIntents.capture(paymentIntentId);

    // Mark approved in the database.
    await db.update(subscriptionsTable)
      .set({ approvalStatus: "approved", status: "active" as any, updatedAt: new Date() })
      .where(eq(subscriptionsTable.id, id));

    // Send the MSA contract + welcome email now that they're approved.
    try {
      const customerEmail = sub.customerEmail || "";
      const customerName = sub.customerName || "Valued Customer";
      if (customerEmail) {
        let tierRecord: any = null;
        const tiers = await db.select().from(pricingTiersTable);
        tierRecord = tiers.find((t: any) => t.slug === sub.planId) || tiers[0];

        const cycle = (sub.billingCycle || "monthly") as "monthly" | "annual";
        const pricePerUser = parseFloat(tierRecord?.startingPrice || sub.amount || "89");
        const seats = sub.seats || 1;
        const effectiveDate = sub.currentPeriodStart || new Date();

        const pdfBuffer = await generateMSAContract({
          customerName,
          customerEmail,
          companyName: customerName,
          planName: sub.planName || "Managed Services",
          planSlug: sub.planId || "essentials",
          billingCycle: cycle,
          pricePerUser,
          seats,
          subscriptionId: sub.stripeSubscriptionId,
          effectiveDate,
        });

        await sendContractEmail({
          customerName,
          customerEmail,
          companyName: customerName,
          planName: sub.planName || "Managed Services",
          billingCycle: cycle,
          pricePerUser,
          seats,
          subscriptionId: sub.stripeSubscriptionId,
          effectiveDate,
          contractPdf: pdfBuffer,
        });

        // Store the contract in admin documents for records.
        const refId = sub.stripeSubscriptionId.replace("sub_", "").slice(0, 12).toUpperCase();
        await db.insert(documentsTable).values({
          name: `MSA — ${customerName} — ${sub.planName} Plan`,
          description: `MSA generated on admin approval. Plan: ${sub.planName} (${cycle}), ${seats} seats.`,
          filename: `Siebert_Services_MSA_${refId}.pdf`,
          mimeType: "application/pdf",
          size: pdfBuffer.length,
          content: pdfBuffer.toString("base64"),
          category: "contract" as any,
          uploadedBy: "system",
          tags: JSON.stringify(["contract", "msa", "auto-generated", sub.planId]),
          active: true,
        });

        await sendSubscriptionApprovedEmail({ customerName, customerEmail, planName: sub.planName || "Managed Services", billingCycle: cycle, seats, amount: parseFloat(sub.amount || "0") });
        console.log(`[Billing] Subscription ${sub.stripeSubscriptionId} approved — contract sent to ${customerEmail}`);
      }
    } catch (emailErr) {
      console.error("[Billing] Approval email/contract failed (non-fatal):", emailErr);
    }

    const [updated] = await db.select().from(subscriptionsTable).where(eq(subscriptionsTable.id, id));
    res.json({ subscription: updated, message: "Subscription approved and customer notified." });
  } catch (err: any) {
    console.error("[Stripe] Approve subscription error:", err);
    res.status(500).json({ error: "stripe_error", message: err.message });
  }
});

// ─── Reject a pending signup (cancel pre-auth + subscription) ────────────────

router.post("/admin/billing/subscriptions/:id/reject", requireAdmin, async (req: any, res) => {
  if (!isStripeConfigured()) return stripeNotConfiguredError(res);
  try {
    const stripe = getStripe();
    const id = parseInt(req.params.id);
    const { reason = "" } = req.body;

    const [sub] = await db.select().from(subscriptionsTable).where(eq(subscriptionsTable.id, id));
    if (!sub) { res.status(404).json({ error: "not_found" }); return; }
    if (sub.approvalStatus !== "pending") {
      res.status(400).json({ error: "not_pending", message: "Subscription is not in pending approval state." });
      return;
    }

    // Cancel the subscription — this also releases the pre-authorized hold on the card.
    await stripe.subscriptions.cancel(sub.stripeSubscriptionId);

    // If the payment intent is still in requires_capture state, cancel it explicitly.
    if (sub.stripePaymentIntentId) {
      try {
        const pi = await stripe.paymentIntents.retrieve(sub.stripePaymentIntentId);
        if (pi.status === "requires_capture") {
          await stripe.paymentIntents.cancel(sub.stripePaymentIntentId);
        }
      } catch { /* Payment intent may already be cancelled */ }
    }

    await db.update(subscriptionsTable)
      .set({ approvalStatus: "rejected", status: "canceled" as any, canceledAt: new Date(), updatedAt: new Date() })
      .where(eq(subscriptionsTable.id, id));

    // Notify the customer.
    try {
      const customerEmail = sub.customerEmail || "";
      const customerName = sub.customerName || "Valued Customer";
      if (customerEmail) {
        await sendSubscriptionRejectedEmail({ customerName, customerEmail, planName: sub.planName || "Managed Services", reason });
        console.log(`[Billing] Subscription ${sub.stripeSubscriptionId} rejected — customer notified at ${customerEmail}`);
      }
    } catch (emailErr) {
      console.error("[Billing] Rejection email failed (non-fatal):", emailErr);
    }

    const [updated] = await db.select().from(subscriptionsTable).where(eq(subscriptionsTable.id, id));
    res.json({ subscription: updated, message: "Subscription rejected and pre-authorization released." });
  } catch (err: any) {
    console.error("[Stripe] Reject subscription error:", err);
    res.status(500).json({ error: "stripe_error", message: err.message });
  }
});

router.get("/admin/billing/subscriptions", requireAdmin, async (_req, res) => {
  try {
    const subs = await db.select().from(subscriptionsTable).orderBy(desc(subscriptionsTable.createdAt));
    res.json(subs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error" });
  }
});

router.get("/admin/billing/stats", requireAdmin, async (_req, res) => {
  try {
    const subs = await db.select().from(subscriptionsTable);
    const invoices = await db.select({
      id: invoicesTable.id,
      status: invoicesTable.status,
      total: invoicesTable.total,
      paidAt: invoicesTable.paidAt,
      createdAt: invoicesTable.createdAt,
      clientName: usersTable.name,
      clientEmail: usersTable.email,
      invoiceNumber: invoicesTable.invoiceNumber,
      title: invoicesTable.title,
    }).from(invoicesTable)
      .leftJoin(usersTable, eq(invoicesTable.userId, usersTable.id))
      .orderBy(desc(invoicesTable.createdAt))
      .limit(20);

    const activeSubs = subs.filter(s => s.status === "active" || s.status === "trialing");
    const mrr = activeSubs.reduce((sum, s) => {
      const amt = parseFloat(s.amount || "0");
      return sum + (s.billingCycle === "annual" ? amt / 12 : amt);
    }, 0);

    const allInvoices = await db.select({ status: invoicesTable.status, total: invoicesTable.total }).from(invoicesTable);
    const outstanding = allInvoices.filter(i => i.status === "sent" || i.status === "viewed" || i.status === "overdue").reduce((s, i) => s + parseFloat(i.total || "0"), 0);
    const totalRevenue = allInvoices.filter(i => i.status === "paid").reduce((s, i) => s + parseFloat(i.total || "0"), 0);
    const overdueCount = allInvoices.filter(i => i.status === "overdue").length;

    res.json({ mrr, outstanding, totalRevenue, overdueCount, activeSubscriptions: activeSubs.length, recentInvoices: invoices, subscriptions: subs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error" });
  }
});

router.post("/checkout/:tierId", async (req: Request, res: Response) => {
  if (!isStripeConfigured()) return stripeNotConfiguredError(res);
  try {
    const stripe = getStripe();
    const tierId = req.params.tierId;
    const { billingCycle = "monthly", email, seatQuantity = 1 } = req.body;
    const seats = Math.max(1, Math.min(500, parseInt(String(seatQuantity), 10) || 1));

    let tier: any = null;
    const tierIdStr = String(tierId);
    const isSlug = isNaN(parseInt(tierIdStr));
    if (isSlug) {
      const [t] = await db.select().from(pricingTiersTable).where(eq(pricingTiersTable.slug, tierIdStr));
      tier = t;
    } else {
      const [t] = await db.select().from(pricingTiersTable).where(eq(pricingTiersTable.id, parseInt(tierIdStr)));
      tier = t;
    }

    if (!tier) { res.status(404).json({ error: "tier_not_found" }); return; }
    if (tier.slug === "enterprise") {
      res.status(400).json({ error: "contact_sales", message: "Enterprise plans require a custom quote. Please contact us." });
      return;
    }

    const base = getBaseUrl(req);

    const resolvePriceId = async (retrying = false): Promise<string> => {
      const freshTier = retrying
        ? (await db.select().from(pricingTiersTable).where(eq(pricingTiersTable.id, tier.id)))[0]
        : tier;

      const cachedPriceId: string | null = billingCycle === "annual"
        ? (freshTier.stripeAnnualPriceId || null)
        : (freshTier.stripeMonthlyPriceId || null);

      if (cachedPriceId) return cachedPriceId;

      const freshAnnualRaw = parseFloat(freshTier.annualPrice ?? "0");
      const freshEffectiveAnnual = freshAnnualRaw > 0 ? freshTier.annualPrice : freshTier.startingPrice;
      const priceAmount = billingCycle === "annual"
        ? Math.round(parseFloat(freshEffectiveAnnual) * 100)
        : Math.round(parseFloat(freshTier.startingPrice) * 100);

      let productId: string | null = freshTier.stripeProductId || null;
      if (!productId) {
        const product = await stripe.products.create({
          name: `${freshTier.name} Plan`,
          description: freshTier.tagline || undefined,
          metadata: { tierId: String(freshTier.id), planSlug: freshTier.slug },
        });
        productId = product.id;
        await db.update(pricingTiersTable).set({ stripeProductId: productId, updatedAt: new Date() }).where(eq(pricingTiersTable.id, freshTier.id));
      }

      const price = await stripe.prices.create({
        product: productId,
        currency: "usd",
        unit_amount: priceAmount,
        recurring: { interval: billingCycle === "annual" ? "year" : "month" },
        metadata: { tierId: String(freshTier.id), planSlug: freshTier.slug, billingCycle },
      });

      if (billingCycle === "annual") {
        await db.update(pricingTiersTable).set({ stripeAnnualPriceId: price.id, updatedAt: new Date() }).where(eq(pricingTiersTable.id, freshTier.id));
      } else {
        await db.update(pricingTiersTable).set({ stripeMonthlyPriceId: price.id, updatedAt: new Date() }).where(eq(pricingTiersTable.id, freshTier.id));
      }

      return price.id;
    };

    const createSession = async (priceId: string) => stripe.checkout.sessions.create({
      mode: "subscription",
      ...(email ? { customer_email: email } : {}),
      line_items: [{ price: priceId, quantity: seats }],
      metadata: { tierId: String(tier.id), planSlug: tier.slug, billingCycle, seats: String(seats), type: "self_checkout" },
      allow_promotion_codes: true,
      // Pre-authorize the first payment without capturing — the admin must
      // approve the signup before funds are captured from the customer's card.
      payment_intent_data: { capture_method: "manual" },
      success_url: `${base}/welcome?plan=${encodeURIComponent(tier.slug)}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/pricing`,
    });

    try {
      const priceId = await resolvePriceId();
      const session = await createSession(priceId);
      res.json({ url: session.url, sessionId: session.id });
    } catch (stripeErr: any) {
      if (stripeErr?.code === "resource_missing") {
        console.warn("[Stripe] Cached IDs are stale (test-mode?), clearing and retrying for tier:", tier.slug);
        await db.update(pricingTiersTable)
          .set({ stripeProductId: null, stripeMonthlyPriceId: null, stripeAnnualPriceId: null, updatedAt: new Date() })
          .where(eq(pricingTiersTable.id, tier.id));
        const freshPriceId = await resolvePriceId(true);
        const session = await createSession(freshPriceId);
        res.json({ url: session.url, sessionId: session.id });
      } else {
        throw stripeErr;
      }
    }
  } catch (err: any) {
    console.error("[Stripe] Self-checkout error:", err);
    res.status(500).json({ error: "stripe_error", message: err.message });
  }
});

router.post("/admin/commissions/:id/payout", requireAdmin, async (req: any, res) => {
  try {
    const id = parseInt(req.params.id);
    const { method = "auto" } = req.body;

    const [commission] = await db.select({
      id: partnerCommissionsTable.id,
      amount: partnerCommissionsTable.amount,
      status: partnerCommissionsTable.status,
      partnerId: partnerCommissionsTable.partnerId,
      stripeTransferId: partnerCommissionsTable.stripeTransferId,
    }).from(partnerCommissionsTable).where(eq(partnerCommissionsTable.id, id));

    if (!commission) { res.status(404).json({ error: "not_found" }); return; }
    if (commission.status !== "approved") { res.status(400).json({ error: "not_approved", message: "Commission must be approved before payout." }); return; }

    const [partner] = await db.select().from(partnersTable).where(eq(partnersTable.id, commission.partnerId));

    let stripeTransferId: string | null = null;
    let resolvedMethod = method;
    let warning: string | undefined;

    const canUseStripe = (method === "stripe" || method === "auto") && isStripeConfigured() && partner?.stripeConnectAccountId;

    if (method === "stripe" && !partner?.stripeConnectAccountId) {
      res.status(400).json({ error: "no_connect_account", message: "Partner does not have a Stripe Connect account. Use manual payout." });
      return;
    }

    if (canUseStripe) {
      const stripe = getStripe();
      const account = await stripe.accounts.retrieve(partner.stripeConnectAccountId!);
      if (!account.payouts_enabled) {
        if (method === "stripe") {
          res.status(400).json({ error: "payouts_not_enabled", message: "Partner's Stripe account is not fully verified. They must complete Stripe onboarding before receiving payouts." });
          return;
        }
        resolvedMethod = "manual";
        warning = "Stripe account not fully verified — payout recorded as manual";
        console.warn(`[Stripe Connect] Auto-fallback to manual for commission #${id}: partner #${commission.partnerId} payouts_enabled=false`);
      } else {
        const transfer = await stripe.transfers.create({
          amount: Math.round(parseFloat(commission.amount) * 100),
          currency: "usd",
          destination: partner.stripeConnectAccountId!,
          metadata: { commissionId: String(id), partnerId: String(commission.partnerId) },
        });
        stripeTransferId = transfer.id;
        resolvedMethod = "stripe";
        console.log(`[Stripe Connect] Transfer ${stripeTransferId} initiated for commission #${id}`);
      }
    } else {
      resolvedMethod = "manual";
    }

    await db.update(partnerCommissionsTable).set({
      status: "paid",
      paidAt: new Date(),
      stripeTransferId: stripeTransferId || null,
      payoutMethod: resolvedMethod,
    }).where(eq(partnerCommissionsTable.id, id));

    const [updated] = await db.select().from(partnerCommissionsTable).where(eq(partnerCommissionsTable.id, id));
    res.json({ commission: updated, stripeTransferId, method: resolvedMethod, ...(warning ? { warning } : {}) });
  } catch (err: any) {
    console.error("[Stripe] Commission payout error:", err);
    res.status(500).json({ error: "stripe_error", message: err.message });
  }
});

async function resolvePartnerJwt(req: any, res: Response): Promise<{ partnerId: number } | null> {
  const authHeader = req.headers.authorization;
  if (!authHeader) { res.status(401).json({ error: "unauthorized" }); return null; }
  const token = authHeader.replace("Bearer ", "");
  const jwt = await import("jsonwebtoken");
  const secret = process.env.JWT_SECRET || "siebert-partner-secret-2024";
  let payload: any;
  try {
    payload = jwt.default.verify(token, secret);
  } catch {
    const altSecret = process.env.JWT_SECRET || "siebert-services-secret-key-2024";
    try { payload = jwt.default.verify(token, altSecret); } catch { res.status(401).json({ error: "unauthorized" }); return null; }
  }
  const partnerId = payload.partnerId || payload.userId;
  if (!partnerId) { res.status(401).json({ error: "unauthorized" }); return null; }
  return { partnerId };
}

router.get("/partner/billing/invoices", async (req: any, res) => {
  try {
    const auth = await resolvePartnerJwt(req, res);
    if (!auth) return;
    const { partnerId } = auth;

    const invoices = await db.select().from(invoicesTable)
      .where(eq(invoicesTable.partnerId, partnerId))
      .orderBy(desc(invoicesTable.createdAt));

    const subs = await db.select().from(subscriptionsTable)
      .where(eq(subscriptionsTable.partnerId, partnerId))
      .orderBy(desc(subscriptionsTable.createdAt))
      .limit(1);

    res.json({ invoices: invoices.map(i => ({ ...i, items: JSON.parse(i.items || "[]") })), subscription: subs[0] || null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error" });
  }
});

router.get("/partner/billing/invoices/history", async (req: any, res) => {
  if (!isStripeConfigured()) { res.json({ invoices: [] }); return; }
  try {
    const auth = await resolvePartnerJwt(req, res);
    if (!auth) return;
    const { partnerId } = auth;

    const [partner] = await db.select({ stripeCustomerId: partnersTable.stripeCustomerId })
      .from(partnersTable)
      .where(eq(partnersTable.id, partnerId));

    const stripeCustomerId = partner?.stripeCustomerId;
    if (!stripeCustomerId) { res.json({ invoices: [] }); return; }

    const stripe = getStripe();
    const allInvoices: any[] = await stripe.invoices.list({
      customer: stripeCustomerId,
      status: "paid",
      limit: 100,
    }).autoPagingToArray({ limit: 1000 });

    const history = allInvoices.map((inv: any) => ({
      id: inv.id,
      number: inv.number,
      description: inv.description || inv.lines?.data?.[0]?.description || "Invoice",
      amount: inv.amount_paid / 100,
      currency: inv.currency,
      date: new Date(inv.created * 1000).toISOString(),
      periodStart: inv.period_start ? new Date(inv.period_start * 1000).toISOString() : null,
      periodEnd: inv.period_end ? new Date(inv.period_end * 1000).toISOString() : null,
      hostedInvoiceUrl: inv.hosted_invoice_url || null,
      invoicePdf: inv.invoice_pdf || null,
    }));

    res.json({ invoices: history });
  } catch (err: any) {
    console.error("[Stripe] Invoice history error:", err);
    res.status(500).json({ error: "stripe_error", message: err.message });
  }
});

export default router;
