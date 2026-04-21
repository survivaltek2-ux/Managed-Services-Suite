import { Router, type IRouter, type Request, type Response } from "express";
import { db, invoicesTable, subscriptionsTable, partnerCommissionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { STRIPE_WEBHOOK_SECRET, isStripeConfigured, getStripe } from "../lib/stripe.js";
import { sendPaymentReceiptEmail } from "../lib/email.js";

const router: IRouter = Router();

const processedReceiptEventIds = new Set<string>();
const RECEIPT_EVENT_MAX = 1000;

function markReceiptEventProcessed(eventId: string): boolean {
  if (processedReceiptEventIds.has(eventId)) return false;
  if (processedReceiptEventIds.size >= RECEIPT_EVENT_MAX) {
    const first = processedReceiptEventIds.values().next().value;
    if (first) processedReceiptEventIds.delete(first);
  }
  processedReceiptEventIds.add(eventId);
  return true;
}

router.post("/webhooks/stripe", async (req: Request, res: Response) => {
  if (!isStripeConfigured()) {
    res.status(503).json({ error: "stripe_not_configured" });
    return;
  }

  const stripe = getStripe();
  const sig = req.headers["stripe-signature"] as string;

  if (!STRIPE_WEBHOOK_SECRET) {
    console.warn("[Stripe Webhook] STRIPE_WEBHOOK_SECRET not set — skipping signature verification");
    res.status(400).json({ error: "webhook_secret_not_configured" });
    return;
  }

  if (!req.rawBody) {
    res.status(400).json({ error: "missing_raw_body" });
    return;
  }

  let event: any;
  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    console.error("[Stripe Webhook] Signature verification failed:", err.message);
    res.status(400).json({ error: "invalid_signature", message: err.message });
    return;
  }

  console.log(`[Stripe Webhook] Received: ${event.type}`);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as any;
        const { invoiceId, type } = session.metadata || {};

        if (type === "invoice_payment" && invoiceId) {
          await db.update(invoicesTable).set({
            status: "paid",
            paidAt: new Date(),
            stripePaymentIntentId: session.payment_intent || null,
            stripeCheckoutSessionId: session.id,
            updatedAt: new Date(),
          }).where(eq(invoicesTable.id, parseInt(invoiceId)));
          console.log(`[Stripe Webhook] Invoice #${invoiceId} marked paid`);
        }

        if (type === "self_checkout") {
          const stripeSubscriptionId = session.subscription;
          if (stripeSubscriptionId) {
            const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
            const { tierId, planSlug, billingCycle } = session.metadata || {};
            const existing = await db.select().from(subscriptionsTable).where(eq(subscriptionsTable.stripeSubscriptionId, stripeSubscriptionId));
            if (existing.length === 0) {
              await db.insert(subscriptionsTable).values({
                stripeSubscriptionId,
                stripeCustomerId: session.customer,
                stripePriceId: (subscription.items.data[0]?.price?.id) || "",
                stripeProductId: (subscription.items.data[0]?.price?.product as string) || null,
                planId: planSlug || "unknown",
                planName: planSlug || "unknown",
                status: subscription.status as any,
                currentPeriodStart: new Date(((subscription as any).current_period_start as number) * 1000),
                currentPeriodEnd: new Date(((subscription as any).current_period_end as number) * 1000),
                cancelAtPeriodEnd: (subscription as any).cancel_at_period_end ?? false,
                billingCycle: billingCycle || "monthly",
                amount: String((subscription.items.data[0]?.price?.unit_amount || 0) / 100),
              });
            }
          }
        }
        break;
      }

      case "invoice.paid": {
        const stripeInvoice = event.data.object as any;
        if (stripeInvoice.payment_intent) {
          const rows = await db.select().from(invoicesTable).where(eq(invoicesTable.stripePaymentIntentId, stripeInvoice.payment_intent));
          if (rows.length > 0) {
            await db.update(invoicesTable).set({
              status: "paid",
              paidAt: new Date(),
              stripeInvoiceId: stripeInvoice.id,
              updatedAt: new Date(),
            }).where(eq(invoicesTable.stripePaymentIntentId, stripeInvoice.payment_intent));
            console.log(`[Stripe Webhook] Invoice paid via payment_intent ${stripeInvoice.payment_intent}`);
          }
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const stripeInvoice = event.data.object as any;
        const customerEmail: string | null = stripeInvoice.customer_email || null;

        if (!markReceiptEventProcessed(event.id)) {
          console.log(`[Stripe Webhook] invoice.payment_succeeded ${event.id} already processed — skipping duplicate receipt`);
          break;
        }

        if (customerEmail && stripeInvoice.amount_paid > 0) {
          try {
            await sendPaymentReceiptEmail({
              customerEmail,
              customerName: stripeInvoice.customer_name || null,
              amountPaid: stripeInvoice.amount_paid,
              currency: stripeInvoice.currency || "usd",
              invoiceNumber: stripeInvoice.number || null,
              description: stripeInvoice.description || stripeInvoice.lines?.data?.[0]?.description || null,
              periodStart: stripeInvoice.period_start ? new Date(stripeInvoice.period_start * 1000) : null,
              periodEnd: stripeInvoice.period_end ? new Date(stripeInvoice.period_end * 1000) : null,
              hostedInvoiceUrl: stripeInvoice.hosted_invoice_url || null,
              invoicePdf: stripeInvoice.invoice_pdf || null,
            });
            console.log(`[Stripe Webhook] Receipt sent to ${customerEmail} for invoice ${stripeInvoice.id}`);
          } catch (emailErr) {
            console.error("[Stripe Webhook] Failed to send receipt email:", emailErr);
          }
        } else {
          console.log(`[Stripe Webhook] invoice.payment_succeeded — no customer email or zero amount, skipping receipt`);
        }
        break;
      }

      case "invoice.payment_failed": {
        const stripeInvoice = event.data.object as any;
        if (stripeInvoice.payment_intent) {
          await db.update(invoicesTable).set({
            status: "overdue",
            updatedAt: new Date(),
          }).where(eq(invoicesTable.stripePaymentIntentId, stripeInvoice.payment_intent));
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as any;
        await db.update(subscriptionsTable).set({
          status: subscription.status,
          currentPeriodStart: new Date(subscription.current_period_start * 1000),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
          updatedAt: new Date(),
        }).where(eq(subscriptionsTable.stripeSubscriptionId, subscription.id));
        console.log(`[Stripe Webhook] Subscription ${subscription.id} updated to ${subscription.status}`);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as any;
        await db.update(subscriptionsTable).set({
          status: "canceled",
          canceledAt: new Date(),
          updatedAt: new Date(),
        }).where(eq(subscriptionsTable.stripeSubscriptionId, subscription.id));
        console.log(`[Stripe Webhook] Subscription ${subscription.id} canceled`);
        break;
      }

      case "transfer.created": {
        const transfer = event.data.object as any;
        const { commissionId } = transfer.metadata || {};
        if (commissionId) {
          await db.update(partnerCommissionsTable).set({
            status: "paid",
            paidAt: new Date(),
            stripeTransferId: transfer.id,
          }).where(eq(partnerCommissionsTable.id, parseInt(commissionId)));
          console.log(`[Stripe Webhook] Commission #${commissionId} payout transfer created`);
        }
        break;
      }

      case "transfer.failed": {
        const transfer = event.data.object as any;
        const { commissionId } = transfer.metadata || {};
        if (commissionId) {
          const failureMessage = transfer.failure_message || "Transfer failed";
          await db.update(partnerCommissionsTable).set({
            status: "approved",
            paidAt: null,
            stripeTransferId: null,
            payoutMethod: null,
            notes: `Stripe transfer failed: ${failureMessage}. Ready to retry.`,
          }).where(eq(partnerCommissionsTable.id, parseInt(commissionId)));
          console.warn(`[Stripe Webhook] Commission #${commissionId} transfer failed: ${failureMessage}`);
        }
        break;
      }

      case "account.updated": {
        const account = event.data.object as any;
        const accountId: string = account.id;
        const payoutsEnabled: boolean = account.payouts_enabled ?? false;
        const detailsSubmitted: boolean = account.details_submitted ?? false;

        const rows = await db.select({ id: partnersTable.id, email: partnersTable.email })
          .from(partnersTable)
          .where(eq(partnersTable.stripeConnectAccountId, accountId))
          .limit(1);

        if (rows.length > 0) {
          console.log(`[Stripe Webhook] account.updated for partner #${rows[0].id}: payoutsEnabled=${payoutsEnabled}, detailsSubmitted=${detailsSubmitted}`);
        } else {
          console.log(`[Stripe Webhook] account.updated for unknown account ${accountId} — no matching partner`);
        }
        break;
      }

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }

    res.json({ received: true, type: event.type });
  } catch (err) {
    console.error(`[Stripe Webhook] Error processing ${event.type}:`, err);
    res.status(500).json({ error: "processing_error" });
  }
});

export default router;
