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
            scope: "sms:read sms:write phone:read",
          }),
        });
        
        if (!response.ok) {
          console.log(`  ❌ OAuth token failed: ${response.status}`);
          throw new Error(`OAuth failed: ${response.status}`);
        }
        
        const data = await response.json() as any;
        console.log(`  ✓ Zoom OAuth successful`);
        console.log(`  ℹ Token expires in: ${data.expires_in}s`);
        return data.access_token;
      })();

      console.log("\n📱 TEST 2a: List Zoom Phone Numbers");
      const phoneListResponse = await fetch("https://api.zoom.us/v1/phone/numbers", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      console.log(`  Response: ${phoneListResponse.status}`);
      if (phoneListResponse.ok) {
        const phoneData = await phoneListResponse.json() as any;
        console.log(`  ℹ Available phone numbers:`, phoneData);
      } else {
        const errorText = await phoneListResponse.text();
        console.log(`  ⚠ Error:`, errorText.substring(0, 200));
      }

      console.log("\n💬 TEST 2b: Try SMS Endpoints");
      const endpoints = [
        `https://api.zoom.us/v1/sms/messages?phone_number=${encodeURIComponent(zoomPhoneNumber)}&page_size=10`,
        `https://api.zoom.us/v1/phone/sms/messages?phone_number=${encodeURIComponent(zoomPhoneNumber)}&page_size=10`,
        `https://api.zoom.us/v1/sms/${encodeURIComponent(zoomPhoneNumber)}/messages?page_size=10`,
        `https://api.zoom.us/v1/phone/numbers/${encodeURIComponent(zoomPhoneNumber)}/messages?page_size=10`,
        `https://api.zoom.us/v1/phone/messages?phone_number=${encodeURIComponent(zoomPhoneNumber)}&page_size=10`,
      ];

      let msgResponse;
      let msgData;
      let workingEndpoint = null;
      
      for (const endpoint of endpoints) {
        const cleanEndpoint = endpoint.split('?')[0];
        msgResponse = await fetch(endpoint, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        
        console.log(`  Endpoint: ${cleanEndpoint}`);
        console.log(`    Status: ${msgResponse.status}`);
        
        try {
          msgData = await msgResponse.json() as any;
          if (msgResponse.status === 200 || msgResponse.status === 201) {
            console.log(`  ✓ SUCCESS: ${cleanEndpoint}`);
            workingEndpoint = cleanEndpoint;
            break;
          } else {
            console.log(`    Error: ${msgData.message || msgData.error || JSON.stringify(msgData).substring(0, 100)}`);
          }
        } catch (e) {
          const text = await msgResponse.text();
          console.log(`    Not JSON: ${text.substring(0, 150)}`);
        }
      }

      if (workingEndpoint) {
        console.log(`\n  ✓ Found working endpoint: ${workingEndpoint}`);
        if (msgData?.messages && msgData.messages.length > 0) {
          console.log(`  ✓ Found ${msgData.messages.length} messages`);
          msgData.messages.slice(0, 3).forEach((msg: any, i: number) => {
            console.log(`    [${i}] From: ${msg.from}, Body: ${msg.body?.substring(0, 50)}...`);
          });
        } else {
          console.log(`  ⚠ No messages in response`);
        }
      } else {
        console.log(`\n  ❌ Could not find working endpoint`);
        console.log(`  Please check: https://developers.zoom.us/docs/api/rest/reference/sms-api/`);
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
