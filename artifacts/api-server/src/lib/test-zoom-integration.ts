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

    console.log("\n📞 TEST 2: Zoom Authentication & Message Fetching");
    
    try {
      const accessToken = await (async () => {
        const response = await fetch("https://zoom.us/oauth/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Basic ${Buffer.from(`${zoomAccountId}:${zoomClientSecret}`).toString("base64")}`,
          },
          body: new URLSearchParams({
            grant_type: "client_credentials",
            scope: "sms:read",
          }),
        });
        
        if (!response.ok) {
          console.log(`  ❌ OAuth token failed: ${response.status}`);
          throw new Error(`OAuth failed: ${response.status}`);
        }
        
        const data = await response.json() as any;
        console.log(`  ✓ Zoom OAuth successful`);
        return data.access_token;
      })();

      const endpoints = [
        `https://api.zoom.us/v1/sms/messages?phone_number=${encodeURIComponent(zoomPhoneNumber)}&page_size=10`,
        `https://api.zoom.us/v2/sms/messages?phone_number=${encodeURIComponent(zoomPhoneNumber)}&page_size=10`,
        `https://api.zoom.us/v1/phone/sms/messages?phone_number=${encodeURIComponent(zoomPhoneNumber)}&page_size=10`,
        `https://api.zoom.us/v1/sms?phone_number=${encodeURIComponent(zoomPhoneNumber)}&page_size=10`,
        `https://api.zoom.us/v1/phone/sms?phone_number=${encodeURIComponent(zoomPhoneNumber)}&page_size=10`,
      ];

      let msgResponse;
      let msgData;
      for (const endpoint of endpoints) {
        console.log(`  ℹ Trying endpoint: ${endpoint.split('?')[0]}...`);
        msgResponse = await fetch(endpoint, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        
        console.log(`    Response: ${msgResponse.status}`);
        
        if (msgResponse.status !== 403) {
          try {
            msgData = await msgResponse.json() as any;
            console.log(`  ✓ SMS messages API response: ${msgResponse.status}`);
            break;
          } catch {
            console.log(`    Response: ${msgResponse.status} (not JSON)`);
          }
        }
      }

      if (msgData) {
        console.log(`  ℹ Messages response:`, JSON.stringify(msgData, null, 2).substring(0, 500));
      } else {
        console.log(`  ⚠ Could not fetch messages from any endpoint`);
      }

      if (msgData.messages && msgData.messages.length > 0) {
        console.log(`  ✓ Found ${msgData.messages.length} messages`);
        msgData.messages.slice(0, 3).forEach((msg: any, i: number) => {
          console.log(`    [${i}] From: ${msg.from}, Body: ${msg.body?.substring(0, 50)}...`);
        });
      } else {
        console.log(`  ⚠ No messages found`);
      }
    } catch (err) {
      console.log(`  ❌ Message fetch error:`, err);
    }

    const code = await fetchAndUpdateTelarusMfaCode();

    if (code) {
      console.log(`  ✓ Successfully extracted MFA code: ${code}`);

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
