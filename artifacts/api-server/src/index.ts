import app from "./app";
import { ensureTsdConfigsExist, startTsdSyncScheduler } from "./lib/tsdSync.js";
import { seedDatabase } from "./db-seed.js";
import { startZoomWebSocketSubscription } from "./lib/zoomWebSocket.js";
import { startLeadMagnetSequenceScheduler } from "./lib/leadMagnetSequence.js";
import { db } from "@workspace/db";
import { sql } from "drizzle-orm";

async function runStartupMigrations() {
  // partners — columns added incrementally after initial schema
  await db.execute(sql`ALTER TABLE partners ADD COLUMN IF NOT EXISTS sso_provider text`);
  await db.execute(sql`ALTER TABLE partners ADD COLUMN IF NOT EXISTS sso_id text`);
  await db.execute(sql`ALTER TABLE partners ADD COLUMN IF NOT EXISTS is_admin boolean NOT NULL DEFAULT false`);
  await db.execute(sql`ALTER TABLE partners ADD COLUMN IF NOT EXISTS client_tickets_enabled boolean NOT NULL DEFAULT false`);
  await db.execute(sql`ALTER TABLE partners ADD COLUMN IF NOT EXISTS stripe_customer_id text`);
  await db.execute(sql`ALTER TABLE partners ADD COLUMN IF NOT EXISTS stripe_connect_account_id text`);
  await db.execute(sql`ALTER TABLE partners ADD COLUMN IF NOT EXISTS last_stripe_reminder_sent_at timestamp`);
  await db.execute(sql`ALTER TABLE partners ADD COLUMN IF NOT EXISTS approved_at timestamp`);

  // partner_commissions — Stripe payout columns
  await db.execute(sql`ALTER TABLE partner_commissions ADD COLUMN IF NOT EXISTS stripe_transfer_id text`);
  await db.execute(sql`ALTER TABLE partner_commissions ADD COLUMN IF NOT EXISTS payout_method text`);
  await db.execute(sql`ALTER TABLE partner_commissions ADD COLUMN IF NOT EXISTS tsd_discrepancy text`);
  await db.execute(sql`ALTER TABLE partner_commissions ADD COLUMN IF NOT EXISTS period_start timestamp`);
  await db.execute(sql`ALTER TABLE partner_commissions ADD COLUMN IF NOT EXISTS period_end timestamp`);

  // lead_magnet_submissions — unsubscribe support
  await db.execute(sql`ALTER TABLE lead_magnet_submissions ADD COLUMN IF NOT EXISTS unsubscribed_at timestamp`);

  // tsd_configs — per-entity last-sync timestamps added over time
  await db.execute(sql`ALTER TABLE tsd_configs ADD COLUMN IF NOT EXISTS last_opportunity_sync_at timestamp`);
  await db.execute(sql`ALTER TABLE tsd_configs ADD COLUMN IF NOT EXISTS last_account_sync_at timestamp`);
  await db.execute(sql`ALTER TABLE tsd_configs ADD COLUMN IF NOT EXISTS last_contact_sync_at timestamp`);
  await db.execute(sql`ALTER TABLE tsd_configs ADD COLUMN IF NOT EXISTS last_order_sync_at timestamp`);
  await db.execute(sql`ALTER TABLE tsd_configs ADD COLUMN IF NOT EXISTS last_quote_sync_at timestamp`);
  await db.execute(sql`ALTER TABLE tsd_configs ADD COLUMN IF NOT EXISTS last_activity_sync_at timestamp`);
  await db.execute(sql`ALTER TABLE tsd_configs ADD COLUMN IF NOT EXISTS last_task_sync_at timestamp`);
  await db.execute(sql`ALTER TABLE tsd_configs ADD COLUMN IF NOT EXISTS last_vendor_sync_at timestamp`);

  console.log("[migrate] Startup column migrations applied");
}

const rawPort = process.env["PORT"] ?? "8080";
const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, async () => {
  console.log(`Server listening on port ${port}`);
  try {
    await runStartupMigrations();
  } catch (err) {
    console.error("[migrate] Startup migration error:", err);
  }
  try {
    await seedDatabase();
  } catch (err) {
    console.error("[seed] Startup seed error:", err);
  }
  try {
    await ensureTsdConfigsExist();
    await startTsdSyncScheduler();
  } catch (err) {
    console.error("[TSD] Startup error:", err);
  }
  try {
    await startZoomWebSocketSubscription();
  } catch (err) {
    console.error("[Zoom WS] Startup error:", err);
  }
  try {
    startLeadMagnetSequenceScheduler();
  } catch (err) {
    console.error("[LeadMagnetSeq] Startup error:", err);
  }
});
