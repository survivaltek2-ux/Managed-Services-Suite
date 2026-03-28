import { Router, type IRouter, type Response } from "express";
import { db, tsdConfigsTable, tsdSyncLogsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth, requireAdmin, type AuthRequest } from "../middlewares/auth.js";
import { resolveCredentialRef, createTsdConnector } from "@workspace/integrations-tsd";
import type { TsdProvider } from "@workspace/integrations-tsd";
import { syncLeadsFromTSDs, syncCommissionsFromTSDs } from "../lib/tsdSync.js";
import { encryptSecret, safeDecryptSecret } from "../lib/tsdSecrets.js";

const router: IRouter = Router();

const TSD_PROVIDERS: TsdProvider[] = ["avant", "telarus", "intelisys"];

function credentialStatus(provider: TsdProvider, dbCredRef: string | null): {
  hasCredential: boolean;
  credentialSource: "env" | "db" | null;
} {
  const envCred = resolveCredentialRef(provider);
  if (envCred) return { hasCredential: true, credentialSource: "env" };
  if (dbCredRef) return { hasCredential: true, credentialSource: "db" };
  return { hasCredential: false, credentialSource: null };
}

function resolveCredential(provider: TsdProvider, dbCredRef: string | null): string | null {
  const envCred = resolveCredentialRef(provider);
  if (envCred) return envCred;
  if (dbCredRef) return safeDecryptSecret(dbCredRef);
  return null;
}

function webhookSecretStatus(provider: TsdProvider, dbSecret: string | null): boolean {
  return !!(process.env[`${provider.toUpperCase()}_WEBHOOK_SECRET`] || dbSecret);
}

function encryptOrThrow(value: string): string {
  return encryptSecret(value);
}

router.get("/admin/tsd/configs", requireAuth, requireAdmin, async (_req: AuthRequest, res: Response) => {
  try {
    const configs = await db.select().from(tsdConfigsTable).orderBy(tsdConfigsTable.provider);
    const result = configs.map(c => {
      const { hasCredential, credentialSource } = credentialStatus(c.provider as TsdProvider, c.credentialRef);
      return {
        id: c.id,
        provider: c.provider,
        enabled: c.enabled,
        hasCredential,
        credentialSource,
        hasDbCredential: !!c.credentialRef,
        hasWebhookSecret: webhookSecretStatus(c.provider as TsdProvider, c.webhookSecret),
        lastLeadSyncAt: c.lastLeadSyncAt,
        lastCommissionSyncAt: c.lastCommissionSyncAt,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      };
    });
    res.json(result);
  } catch (err) {
    console.error("[TSD] Get configs error:", err);
    res.status(500).json({ error: "server_error", message: "Failed to load TSD configs" });
  }
});

router.put("/admin/tsd/configs/:provider", requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { provider } = req.params as { provider: string };
    if (!TSD_PROVIDERS.includes(provider as TsdProvider)) {
      res.status(400).json({ error: "invalid_provider", message: "Unknown TSD provider" });
      return;
    }

    const { enabled, credentialRef, webhookSecret } = req.body;

    const existing = await db.select().from(tsdConfigsTable)
      .where(eq(tsdConfigsTable.provider, provider as TsdProvider)).limit(1);

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (typeof enabled === "boolean") updateData.enabled = enabled;
    if (credentialRef && credentialRef !== "" && !credentialRef.includes("****")) {
      updateData.credentialRef = encryptOrThrow(credentialRef);
    }
    if (webhookSecret !== undefined && webhookSecret !== "" && !webhookSecret.includes("****")) {
      updateData.webhookSecret = encryptOrThrow(webhookSecret);
    }

    let savedConfig;
    if (existing.length === 0) {
      const [created] = await db.insert(tsdConfigsTable).values({
        provider: provider as TsdProvider,
        enabled: typeof enabled === "boolean" ? enabled : false,
        credentialRef: credentialRef && !credentialRef.includes("****") ? encryptOrThrow(credentialRef) : null,
        webhookSecret: webhookSecret && !webhookSecret.includes("****") ? encryptOrThrow(webhookSecret) : null,
      }).returning();
      savedConfig = created;
    } else {
      const [updated] = await db.update(tsdConfigsTable)
        .set(updateData)
        .where(eq(tsdConfigsTable.provider, provider as TsdProvider))
        .returning();
      savedConfig = updated;
    }

    const { hasCredential, credentialSource } = credentialStatus(provider as TsdProvider, savedConfig.credentialRef);
    res.json({
      id: savedConfig.id,
      provider: savedConfig.provider,
      enabled: savedConfig.enabled,
      hasCredential,
      credentialSource,
      hasDbCredential: !!savedConfig.credentialRef,
      hasWebhookSecret: webhookSecretStatus(provider as TsdProvider, savedConfig.webhookSecret),
      lastLeadSyncAt: savedConfig.lastLeadSyncAt,
      lastCommissionSyncAt: savedConfig.lastCommissionSyncAt,
    });
  } catch (err) {
    console.error("[TSD] Update config error:", err);
    res.status(500).json({ error: "server_error", message: "Failed to update TSD config" });
  }
});

router.post("/admin/tsd/configs/:provider/test", requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { provider } = req.params as { provider: string };
    if (!TSD_PROVIDERS.includes(provider as TsdProvider)) {
      res.status(400).json({ error: "invalid_provider", message: "Unknown TSD provider" });
      return;
    }

    const [cfg] = await db.select().from(tsdConfigsTable)
      .where(eq(tsdConfigsTable.provider, provider as TsdProvider)).limit(1);

    const credRef = resolveCredential(provider as TsdProvider, cfg?.credentialRef || null);
    if (!credRef) {
      res.json({ ok: false, error: `No credentials configured. Set ${provider.toUpperCase()}_API_KEY env var or enter credentials in the admin UI.` });
      return;
    }

    const connector = createTsdConnector(provider as TsdProvider, credRef);
    const result = await connector.testConnection();
    res.json(result);
  } catch (err) {
    console.error("[TSD] Test connection error:", err);
    res.json({ ok: false, error: err instanceof Error ? err.message : "Connection test failed" });
  }
});

router.post("/admin/tsd/sync/:provider/leads", requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { provider } = req.params as { provider: string };
    const isAll = provider === "all";

    if (!isAll && !TSD_PROVIDERS.includes(provider as TsdProvider)) {
      res.status(400).json({ error: "invalid_provider" });
      return;
    }

    const targetProvider = isAll ? undefined : (provider as TsdProvider);
    syncLeadsFromTSDs(targetProvider).catch(err => console.error("[TSD] Manual lead sync error:", err));
    res.json({ message: "Lead sync started", provider });
  } catch (err) {
    res.status(500).json({ error: "server_error", message: "Failed to trigger sync" });
  }
});

router.post("/admin/tsd/sync/:provider/commissions", requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { provider } = req.params as { provider: string };
    const isAll = provider === "all";

    if (!isAll && !TSD_PROVIDERS.includes(provider as TsdProvider)) {
      res.status(400).json({ error: "invalid_provider" });
      return;
    }

    const targetProvider = isAll ? undefined : (provider as TsdProvider);
    syncCommissionsFromTSDs(targetProvider).catch(err => console.error("[TSD] Manual commission sync error:", err));
    res.json({ message: "Commission sync started", provider });
  } catch (err) {
    res.status(500).json({ error: "server_error", message: "Failed to trigger sync" });
  }
});

router.get("/admin/tsd/logs", requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { provider, limit: limitParam } = req.query;
    const limit = Math.min(parseInt(String(limitParam || "50")), 200);

    if (provider && TSD_PROVIDERS.includes(provider as TsdProvider)) {
      const logs = await db.select().from(tsdSyncLogsTable)
        .where(eq(tsdSyncLogsTable.provider, provider as TsdProvider))
        .orderBy(desc(tsdSyncLogsTable.createdAt))
        .limit(limit);
      res.json(logs);
      return;
    }

    const logs = await db.select().from(tsdSyncLogsTable)
      .orderBy(desc(tsdSyncLogsTable.createdAt))
      .limit(limit);
    res.json(logs);
  } catch (err) {
    console.error("[TSD] Get logs error:", err);
    res.status(500).json({ error: "server_error", message: "Failed to load sync logs" });
  }
});

export default router;
