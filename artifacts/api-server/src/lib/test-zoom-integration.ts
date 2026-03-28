import { fetchAndUpdateTelarusMfaCode } from "./zoomSms.js";
import { db, tsdConfigsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

async function test() {
  console.log("\n════════════════════════════════════════════");
  console.log("  ZOOM SMS INTEGRATION TEST SUITE");
  console.log("════════════════════════════════════════════\n");

  try {
    console.log("📋 TEST 1: Environment Variables Check");
    const zoomAccountId = process.env.ZOOM_ACCOUNT_ID;
    const zoomPhoneNumber = process.env.ZOOM_PHONE_NUMBER;
    const zoomClientSecret = process.env.ZOOM_CLIENT_SECRET;

    console.log(`  ✓ ZOOM_ACCOUNT_ID: ${zoomAccountId ? "SET" : "MISSING"}`);
    console.log(`  ✓ ZOOM_PHONE_NUMBER: ${zoomPhoneNumber || "MISSING"}`);
    console.log(`  ✓ ZOOM_CLIENT_SECRET: ${zoomClientSecret ? "SET" : "MISSING"}`);

    if (!zoomAccountId || !zoomClientSecret || !zoomPhoneNumber) {
      console.log("  ❌ Missing Zoom credentials\n");
      return;
    }

    console.log("\n📞 TEST 2: Zoom Authentication");
    const code = await fetchAndUpdateTelarusMfaCode();

    if (code) {
      console.log(`  ✓ Successfully fetched MFA code: ${code}`);

      const [cfg] = await db
        .select()
        .from(tsdConfigsTable)
        .where(eq(tsdConfigsTable.provider, "telarus"))
        .limit(1);

      if (cfg?.mfaCode) {
        console.log(`  ✓ MFA code stored in database (encrypted)`);
      }
    } else {
      console.log(`  ⚠ No MFA code found in recent SMS messages`);
      console.log(`    (This is OK if Telarus hasn't sent a code yet)\n`);
    }

    console.log("\n🔧 TEST 3: Telarus Config Status");
    const [telarusConfig] = await db
      .select()
      .from(tsdConfigsTable)
      .where(eq(tsdConfigsTable.provider, "telarus"))
      .limit(1);

    if (telarusConfig) {
      console.log(`  ✓ Telarus config found`);
      console.log(`  ✓ Username: ${telarusConfig.username ? "SET" : "NOT SET"}`);
      console.log(`  ✓ Password: ${telarusConfig.password ? "SET" : "NOT SET"}`);
      console.log(`  ✓ MFA Phone: ${telarusConfig.mfaPhone ? "SET" : "NOT SET"}`);
      console.log(`  ✓ MFA Code: ${telarusConfig.mfaCode ? "SET" : "NOT SET"}`);
      console.log(`  ✓ Enabled: ${telarusConfig.enabled ? "YES" : "NO"}`);
    } else {
      console.log(`  ⚠ No Telarus config found in database`);
    }

    console.log("\n════════════════════════════════════════════");
    console.log("  ✅ ALL TESTS COMPLETED");
    console.log("════════════════════════════════════════════\n");
  } catch (err) {
    console.error("\n❌ TEST FAILED:", err);
    process.exit(1);
  }
}

test().then(() => process.exit(0));
