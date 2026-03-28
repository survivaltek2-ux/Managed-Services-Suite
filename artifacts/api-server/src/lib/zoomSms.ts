import crypto from "crypto";
import { db, tsdConfigsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { encryptSecret } from "./tsdSecrets.js";

const ZOOM_WEBHOOK_SECRET = process.env.ZOOM_WEBHOOK_SECRET || "";
const ZOOM_PHONE_NUMBER = process.env.ZOOM_PHONE_NUMBER || "";
const MFA_CODE_MAX_AGE_MS = 10 * 60 * 1000;

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

export function verifyZoomWebhookSignature(payload: string, timestamp: string, signature: string): boolean {
  if (!ZOOM_WEBHOOK_SECRET) {
    console.warn("[Zoom SMS] ZOOM_WEBHOOK_SECRET not set — cannot verify webhook signatures");
    return false;
  }

  const message = `v0:${timestamp}:${payload}`;
  const expectedSignature = `v0=${crypto
    .createHmac("sha256", ZOOM_WEBHOOK_SECRET)
    .update(message)
    .digest("hex")}`;

  try {
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(signature)
    );
  } catch {
    return false;
  }
}

function normalizePhone(phone: string): string {
  return phone.replace(/[\s\-\(\)\.]/g, "");
}

function isExpectedRecipient(toPhone: string | undefined): boolean {
  if (!ZOOM_PHONE_NUMBER || !toPhone) return true;
  return normalizePhone(toPhone) === normalizePhone(ZOOM_PHONE_NUMBER);
}

export async function handleSmsReceived(payload: ZoomWebhookPayload): Promise<string | null> {
  try {
    const obj = payload.payload?.object;
    const messageBody = obj?.message || obj?.body || "";

    if (!messageBody) {
      console.log("[Zoom SMS] No message body in webhook payload");
      return null;
    }

    if (!isExpectedRecipient(obj?.to?.phone_number)) {
      console.log(`[Zoom SMS] Ignoring SMS — recipient ${obj?.to?.phone_number} does not match configured number`);
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
      const now = new Date();
      await db
        .update(tsdConfigsTable)
        .set({
          mfaCode: encryptedCode,
          updatedAt: now,
        })
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

export async function getRecentMfaCode(): Promise<string | null> {
  const [cfg] = await db
    .select()
    .from(tsdConfigsTable)
    .where(eq(tsdConfigsTable.provider, "telarus"))
    .limit(1);

  if (!cfg?.mfaCode || !cfg?.updatedAt) return null;

  const age = Date.now() - new Date(cfg.updatedAt).getTime();
  if (age > MFA_CODE_MAX_AGE_MS) {
    console.log(`[Zoom SMS] MFA code is ${Math.round(age / 1000)}s old — expired (max ${MFA_CODE_MAX_AGE_MS / 1000}s)`);
    return null;
  }

  return cfg.mfaCode;
}

export async function clearMfaCode(): Promise<void> {
  await db
    .update(tsdConfigsTable)
    .set({ mfaCode: null, updatedAt: new Date() })
    .where(eq(tsdConfigsTable.provider, "telarus"));
  console.log("[Zoom SMS] Cleared used MFA code");
}
