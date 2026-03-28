import crypto from "crypto";
import { db, tsdConfigsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { encryptSecret } from "./tsdSecrets.js";

const ZOOM_WEBHOOK_SECRET = process.env.ZOOM_WEBHOOK_SECRET || "";

interface ZoomWebhookPayload {
  event: string;
  payload: {
    plainToken?: string;
    account_id?: string;
    object?: {
      id?: string;
      from?: { phone_number?: string };
      to?: { phone_number?: string };
      message?: string;
      body?: string;
      date_time?: string;
    };
  };
  event_ts?: number;
}

function extractMfaCode(message: string): string | null {
  const codePatterns = [
    /\b(\d{6})\b/,
    /code[:\s]+(\d{6})/i,
    /verification[:\s]+(\d{6})/i,
    /mfa[:\s]+(\d{6})/i,
    /\b(\d{4})\b/,
  ];

  for (const pattern of codePatterns) {
    const match = message.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export function verifyZoomWebhook(plainToken: string): { plainToken: string; encryptedToken: string } {
  const encryptedToken = crypto
    .createHmac("sha256", ZOOM_WEBHOOK_SECRET)
    .update(plainToken)
    .digest("hex");

  return { plainToken, encryptedToken };
}

export async function handleSmsReceived(payload: ZoomWebhookPayload): Promise<string | null> {
  try {
    const obj = payload.payload?.object;
    const messageBody = obj?.message || obj?.body || "";

    if (!messageBody) {
      console.log("[Zoom SMS] No message body in webhook payload");
      return null;
    }

    console.log(`[Zoom SMS] Received SMS from ${obj?.from?.phone_number || "unknown"}: ${messageBody.substring(0, 50)}...`);

    const code = extractMfaCode(messageBody);
    if (!code) {
      console.log("[Zoom SMS] No MFA code found in message");
      return null;
    }

    console.log(`[Zoom SMS] Extracted MFA code: ${code}`);

    const [cfg] = await db
      .select()
      .from(tsdConfigsTable)
      .where(eq(tsdConfigsTable.provider, "telarus"))
      .limit(1);

    if (cfg) {
      const encryptedCode = encryptSecret(code);
      await db
        .update(tsdConfigsTable)
        .set({ mfaCode: encryptedCode, updatedAt: new Date() })
        .where(eq(tsdConfigsTable.id, cfg.id));

      console.log("[Zoom SMS] Updated Telarus MFA code in database");
      return code;
    } else {
      console.warn("[Zoom SMS] No Telarus config found to update");
      return code;
    }
  } catch (err) {
    console.error("[Zoom SMS] Error handling SMS webhook:", err);
    return null;
  }
}

export async function hasRecentMfaCode(): Promise<boolean> {
  const [cfg] = await db
    .select()
    .from(tsdConfigsTable)
    .where(eq(tsdConfigsTable.provider, "telarus"))
    .limit(1);

  return !!(cfg?.mfaCode);
}
