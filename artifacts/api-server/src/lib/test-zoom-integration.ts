import { verifyZoomWebhook, handleSmsReceived, hasRecentMfaCode } from "./zoomSms.js";
import { db, tsdConfigsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

async function test() {
  console.log("\n════════════════════════════════════════════");
  console.log("  ZOOM SMS WEBHOOK INTEGRATION TEST SUITE");
  console.log("════════════════════════════════════════════\n");

  try {
    console.log("📋 TEST 1: Environment Variables Check");
    const zoomAccountId = process.env.ZOOM_ACCOUNT_ID;
    const zoomPhoneNumber = process.env.ZOOM_PHONE_NUMBER;
    const zoomClientSecret = process.env.ZOOM_CLIENT_SECRET;
    const zoomWebhookSecret = process.env.ZOOM_WEBHOOK_SECRET;

    console.log(`  ZOOM_ACCOUNT_ID: ${zoomAccountId ? "SET" : "MISSING"}`);
    console.log(`  ZOOM_PHONE_NUMBER: ${zoomPhoneNumber || "MISSING"}`);
    console.log(`  ZOOM_CLIENT_SECRET: ${zoomClientSecret ? "SET" : "MISSING"}`);
    console.log(`  ZOOM_WEBHOOK_SECRET: ${zoomWebhookSecret ? "SET" : "NOT SET (needed for webhook verification)"}`);

    console.log("\n🔐 TEST 2: Webhook Verification");
    const verifyResult = verifyZoomWebhook("test_plain_token_12345");
    console.log(`  plainToken: ${verifyResult.plainToken}`);
    console.log(`  encryptedToken: ${verifyResult.encryptedToken ? "Generated ✓" : "FAILED ✗"}`);

    console.log("\n💬 TEST 3: SMS Code Extraction Simulation");
    const testMessages = [
      { text: "Your verification code is 123456", expected: "123456" },
      { text: "code: 789012", expected: "789012" },
      { text: "MFA: 345678 - do not share", expected: "345678" },
      { text: "Hello, how are you?", expected: null },
    ];

    for (const msg of testMessages) {
      const result = await handleSmsReceived({
        event: "phone.sms_received",
        payload: {
          account_id: "test",
          object: { body: msg.text, from: { phone_number: "+1-555-000-0000" } },
        },
      });
      const pass = (result === msg.expected) ? "✓ PASS" : `✗ FAIL (got: ${result})`;
      console.log(`  "${msg.text}" → ${result || "null"} ${pass}`);
    }

    console.log("\n🔧 TEST 4: Telarus Config Status");
    const [telarusConfig] = await db
      .select()
      .from(tsdConfigsTable)
      .where(eq(tsdConfigsTable.provider, "telarus"))
      .limit(1);

    if (telarusConfig) {
      console.log(`  Telarus config found ✓`);
      console.log(`  Username: ${telarusConfig.username ? "SET" : "NOT SET"}`);
      console.log(`  Password: ${telarusConfig.password ? "SET" : "NOT SET"}`);
      console.log(`  MFA Phone: ${telarusConfig.mfaPhone ? "SET" : "NOT SET"}`);
      console.log(`  MFA Code: ${telarusConfig.mfaCode ? "SET ✓" : "NOT SET (waiting for webhook)"}`);
      console.log(`  Enabled: ${telarusConfig.enabled ? "YES" : "NO"}`);
    } else {
      console.log(`  ⚠ No Telarus config found in database`);
    }

    const hasMfa = await hasRecentMfaCode();
    console.log(`  Has Recent MFA Code: ${hasMfa ? "YES ✓" : "NO"}`);

    console.log("\n════════════════════════════════════════════");
    console.log("  ✅ ALL TESTS COMPLETED");
    console.log("════════════════════════════════════════════");
    console.log("\n📌 NEXT STEPS:");
    console.log("  1. Set ZOOM_WEBHOOK_SECRET in Replit secrets");
    console.log("  2. In Zoom Dev Portal, set webhook URL to:");
    console.log("     https://<your-domain>/api/webhooks/zoom/sms");
    console.log("  3. Subscribe to 'phone.sms_received' event");
    console.log("  4. Zoom will verify the webhook using the secret");
    console.log("  5. When Telarus sends SMS, code auto-updates!\n");
  } catch (err) {
    console.error("\n❌ TEST FAILED:", err);
    process.exit(1);
  }
}

test().then(() => process.exit(0));
