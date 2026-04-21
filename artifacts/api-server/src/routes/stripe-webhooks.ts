import { Router, type IRouter, type Request, type Response } from "express";
import { db, invoicesTable, subscriptionsTable, partnerCommissionsTable, documentsTable, pricingTiersTable, partnersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { STRIPE_WEBHOOK_SECRET, isStripeConfigured, getStripe } from "../lib/stripe.js";
import { sendPaymentReceiptEmail, sendContractEmail } from "../lib/email.js";
import { generateMSAContract } from "../lib/contract.js";

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
            const { tierId, planSlug, billingCycle, seats: seatsStr } = session.metadata || {};
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

            // Generate and send contract
            try {
              const customerEmail: string =
                session.customer_details?.email || session.customer_email || "";
              const customerName: string =
                session.customer_details?.name || "Valued Customer";
              const companyName: string =
                session.customer_details?.name || customerName;

              let tierRecord: any = null;
              if (tierId) {
                const [t] = await db.select().from(pricingTiersTable).where(eq(pricingTiersTable.id, parseInt(tierId)));
                tierRecord = t;
              }
              if (!tierRecord && planSlug) {
                const rows = await db.select().from(pricingTiersTable);
                tierRecord = rows.find((r: any) => r.slug === planSlug) || null;
              }

              const resolvedPlanName: string = tierRecord?.name || (planSlug ? planSlug.charAt(0).toUpperCase() + planSlug.slice(1) : "Managed Services");
              const resolvedPlanSlug: string = tierRecord?.slug || planSlug || "essentials";
              const cycle = (billingCycle || "monthly") as "monthly" | "annual";
              const pricePerUser: number = cycle === "annual"
                ? parseFloat(tierRecord?.annualPrice || "0") || parseFloat(tierRecord?.startingPrice || "89")
                : parseFloat(tierRecord?.startingPrice || "89");
              const seats: number = parseInt(seatsStr || "3", 10) || 3;
              const effectiveDate = new Date(((subscription as any).current_period_start as number) * 1000);

              if (customerEmail) {
                const pdfBuffer = await generateMSAContract({
                  customerName,
                  customerEmail,
                  companyName,
                  planName: resolvedPlanName,
                  planSlug: resolvedPlanSlug,
                  billingCycle: cycle,
                  pricePerUser,
                  seats,
                  subscriptionId: stripeSubscriptionId,
                  effectiveDate,
                });

                await sendContractEmail({
                  customerName,
                  customerEmail,
                  companyName,
                  planName: resolvedPlanName,
                  billingCycle: cycle,
                  pricePerUser,
                  seats,
                  subscriptionId: stripeSubscriptionId,
                  effectiveDate,
                  contractPdf: pdfBuffer,
                });

                // Store contract in documents table for admin records
                const refId = stripeSubscriptionId.replace("sub_", "").slice(0, 12).toUpperCase();
                await db.insert(documentsTable).values({
                  name: `MSA — ${companyName || customerName} — ${resolvedPlanName} Plan`,
                  description: `Managed Services Agreement generated on subscription. Plan: ${resolvedPlanName} (${cycle}), ${seats} seats, effective ${effectiveDate.toISOString().slice(0, 10)}.`,
                  filename: `Siebert_Services_MSA_${refId}.pdf`,
                  mimeType: "application/pdf",
                  size: pdfBuffer.length,
                  content: pdfBuffer.toString("base64"),
                  category: "contract" as any,
                  uploadedBy: "system",
                  tags: JSON.stringify(["contract", "msa", "auto-generated", resolvedPlanSlug]),
                  active: true,
                });

                console.log(`[Stripe Webhook] Contract generated and sent to ${customerEmail} for subscription ${stripeSubscriptionId}`);
              } else {
                console.warn(`[Stripe Webhook] No customer email on session ${session.id} — contract not sent`);
              }
            } catch (contractErr) {
              console.error("[Stripe Webhook] Contract generation failed (non-fatal):", contractErr);
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
