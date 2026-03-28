import { Router, type IRouter, type Request, type Response } from "express";
import { db, tsdConfigsTable, tsdSyncLogsTable, partnerLeadsTable, partnerCommissionsTable, partnersTable, tsdDealMappingsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { createTsdConnector, resolveCredentialRef } from "@workspace/integrations-tsd";
import type { TsdProvider } from "@workspace/integrations-tsd";
import { safeJsonStringify } from "@workspace/integrations-tsd";
import { safeDecryptSecret } from "../lib/tsdSecrets.js";

const router: IRouter = Router();

const TSD_PROVIDERS: TsdProvider[] = ["telarus", "intelisys"];

function resolveWebhookSecret(provider: TsdProvider, dbSecret: string | null): string | null {
  const envKey = `${provider.toUpperCase()}_WEBHOOK_SECRET`;
  if (process.env[envKey]) return process.env[envKey]!;
  if (dbSecret) return safeDecryptSecret(dbSecret);
  return null;
}

function resolveProviderCredential(provider: TsdProvider, dbCredRef: string | null): string | null {
  const envCred = resolveCredentialRef(provider);
  if (envCred) return envCred;
  if (dbCredRef) return safeDecryptSecret(dbCredRef);
  return null;
}

router.post("/webhooks/tsd/:provider", async (req: Request, res: Response) => {
  const { provider } = req.params as { provider: string };

  if (!TSD_PROVIDERS.includes(provider as TsdProvider)) {
    res.status(404).json({ error: "unknown_provider" });
    return;
  }

  const [cfg] = await db.select().from(tsdConfigsTable)
    .where(eq(tsdConfigsTable.provider, provider as TsdProvider))
    .limit(1);

  if (!cfg || !cfg.enabled) {
    res.status(404).json({ error: "provider_not_configured" });
    return;
  }

  const webhookSecret = resolveWebhookSecret(provider as TsdProvider, cfg.webhookSecret);
  if (!webhookSecret) {
    res.status(400).json({ error: "webhook_secret_not_configured" });
    return;
  }

  const credRef = resolveProviderCredential(provider as TsdProvider, cfg.credentialRef);
  if (!credRef) {
    res.status(400).json({ error: "no_credentials" });
    return;
  }

  const rawBuffer = req.rawBody;
  if (!rawBuffer) {
    res.status(400).json({ error: "missing_raw_body" });
    return;
  }

  const rawBodyStr = rawBuffer.toString("utf8");

  const signature = (
    req.headers["x-hub-signature-256"] ||
    req.headers["x-telarus-signature"] ||
    req.headers["x-intelisys-signature"] ||
    req.headers["x-signature"] ||
    ""
  ) as string;

  try {
    const connector = createTsdConnector(provider as TsdProvider, credRef);
    const event = await connector.handleWebhook(rawBodyStr, signature, webhookSecret);

    await handleTsdWebhookEvent(event);

    await db.insert(tsdSyncLogsTable).values({
      provider: provider as TsdProvider,
      direction: "inbound",
      entityType: "webhook",
      status: "success",
      recordsAffected: 1,
      payloadSummary: safeJsonStringify({ type: event.type }),
    });

    res.json({ received: true, type: event.type });
  } catch (err) {
    console.error(`[Webhook] TSD ${provider} error:`, err);

    await db.insert(tsdSyncLogsTable).values({
      provider: provider as TsdProvider,
      direction: "inbound",
      entityType: "webhook",
      status: "failure",
      recordsAffected: 0,
      errorMessage: err instanceof Error ? err.message : String(err),
    });

    if (err instanceof Error && err.message.includes("signature")) {
      res.status(401).json({ error: "invalid_signature" });
    } else {
      res.status(500).json({ error: "processing_error" });
    }
  }
});

async function handleTsdWebhookEvent(event: {
  type: "deal_update" | "lead_assigned" | "commission_paid" | "unknown";
  provider: TsdProvider;
  payload: Record<string, unknown>;
}): Promise<void> {
  switch (event.type) {
    case "lead_assigned": {
      const p = event.payload;
      const companyName = (p.company_name || p.company || p.account_name || "Unknown") as string;
      const contactName = (p.contact_name || p.full_name || "Unknown") as string;
      const email = (p.email || "") as string;
      const externalLeadId = (p.lead_id || p.id || "") as string;

      const firstPartner = await db.select({ id: partnersTable.id }).from(partnersTable).limit(1);
      if (firstPartner.length > 0) {
        const source = `tsd:${event.provider}`;
        let isDuplicate = false;

        if (email) {
          const emailMatch = await db.select({ id: partnerLeadsTable.id })
            .from(partnerLeadsTable)
            .where(and(eq(partnerLeadsTable.source, source), eq(partnerLeadsTable.email, email)))
            .limit(1);
          isDuplicate = emailMatch.length > 0;
        } else if (externalLeadId) {
          const idMatch = await db.select({ id: partnerLeadsTable.id })
            .from(partnerLeadsTable)
            .where(and(
              eq(partnerLeadsTable.source, source),
              eq(partnerLeadsTable.companyName, companyName)
            ))
            .limit(1);
          isDuplicate = idMatch.length > 0;
        }

        if (!isDuplicate) {
          await db.insert(partnerLeadsTable).values({
            partnerId: firstPartner[0].id,
            companyName,
            contactName,
            email: email || null,
            phone: (p.phone as string) || null,
            source,
            interest: (p.service_type || p.interest) as string || null,
            status: "new",
          });
        }
      }
      break;
    }

    case "deal_update": {
      console.log(`[Webhook] Deal update from ${event.provider}:`, safeJsonStringify(event.payload));
      break;
    }

    case "commission_paid": {
      const p = event.payload;
      const externalId = (p.deal_id || p.opportunity_id || p.reference) as string;
      if (externalId) {
        const mapping = await db.select({ dealId: tsdDealMappingsTable.dealId })
          .from(tsdDealMappingsTable)
          .where(and(
            eq(tsdDealMappingsTable.provider, event.provider),
            eq(tsdDealMappingsTable.externalId, externalId)
          ))
          .limit(1);

        if (mapping.length > 0) {
          await db.update(partnerCommissionsTable)
            .set({ status: "paid", paidAt: new Date() })
            .where(eq(partnerCommissionsTable.dealId, mapping[0].dealId));
        }
      }
      break;
    }

    default:
      console.log(`[Webhook] Unknown event type from ${event.provider}`);
  }
}

export default router;
