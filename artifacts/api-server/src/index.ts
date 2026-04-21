import app from "./app";
import { ensureTsdConfigsExist, startTsdSyncScheduler } from "./lib/tsdSync.js";
import { seedDatabase } from "./db-seed.js";
import { startZoomWebSocketSubscription } from "./lib/zoomWebSocket.js";
import { startLeadMagnetSequenceScheduler } from "./lib/leadMagnetSequence.js";
import { db } from "@workspace/db";
import { sql } from "drizzle-orm";

async function runStartupMigrations() {
  await db.execute(sql`ALTER TABLE partners ADD COLUMN IF NOT EXISTS last_stripe_reminder_sent_at timestamp`);
  await db.execute(sql`ALTER TABLE lead_magnet_submissions ADD COLUMN IF NOT EXISTS unsubscribed_at timestamp`);
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
