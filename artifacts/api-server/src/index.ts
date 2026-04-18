import app from "./app";
import { ensureTsdConfigsExist, startTsdSyncScheduler } from "./lib/tsdSync.js";
import { seedDatabase } from "./db-seed.js";
import { startZoomWebSocketSubscription } from "./lib/zoomWebSocket.js";
import { startLeadMagnetSequenceScheduler } from "./lib/leadMagnetSequence.js";

const rawPort = process.env["PORT"] ?? "8080";
const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, async () => {
  console.log(`Server listening on port ${port}`);
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
