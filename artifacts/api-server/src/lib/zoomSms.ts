import { db, tsdConfigsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { encryptSecret } from "./tsdSecrets.js";

const ZOOM_ACCOUNT_ID = process.env.ZOOM_ACCOUNT_ID || "";
const ZOOM_CLIENT_SECRET = process.env.ZOOM_CLIENT_SECRET || "";
const ZOOM_PHONE_NUMBER = process.env.ZOOM_PHONE_NUMBER || "";

interface ZoomTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface ZoomSmsMessage {
  id: string;
  body: string;
  from: string;
  to: string;
  created_at: string;
}

let cachedAccessToken: { token: string; expiresAt: number } | null = null;

async function getZoomAccessToken(): Promise<string> {
  if (cachedAccessToken && cachedAccessToken.expiresAt > Date.now()) {
    return cachedAccessToken.token;
  }

  try {
    const response = await fetch("https://zoom.us/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${ZOOM_ACCOUNT_ID}:${ZOOM_CLIENT_SECRET}`).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        scope: "sms:read",
      }),
    });

    if (!response.ok) {
      throw new Error(`Zoom auth failed: ${response.status}`);
    }

    const data = (await response.json()) as ZoomTokenResponse;
    cachedAccessToken = {
      token: data.access_token,
      expiresAt: Date.now() + (data.expires_in - 60) * 1000,
    };
    return data.access_token;
  } catch (err) {
    console.error("[Zoom SMS] Token fetch failed:", err);
    throw err;
  }
}

function extractMfaCode(message: string): string | null {
  const codePatterns = [
    /\b(\d{6})\b/,
    /code[:\s]+(\d{6})/i,
    /verification[:\s]+(\d{6})/i,
    /mfa[:\s]+(\d{6})/i,
  ];

  for (const pattern of codePatterns) {
    const match = message.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export async function fetchAndUpdateTelarusMfaCode(): Promise<string | null> {
  try {
    if (!ZOOM_ACCOUNT_ID || !ZOOM_CLIENT_SECRET || !ZOOM_PHONE_NUMBER) {
      console.warn("[Zoom SMS] Zoom credentials not configured");
      return null;
    }

    const accessToken = await getZoomAccessToken();

    const response = await fetch(
      `https://api.zoom.us/v1/sms/messages?phone_number=${encodeURIComponent(ZOOM_PHONE_NUMBER)}&page_size=10`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!response.ok) {
      console.error("[Zoom SMS] Failed to fetch messages:", response.status);
      return null;
    }

    const data = (await response.json()) as { messages?: ZoomSmsMessage[] };
    const messages = data.messages || [];

    for (const msg of messages) {
      const code = extractMfaCode(msg.body);
      if (code) {
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

          console.log("[Zoom SMS] Updated Telarus MFA code");
          return code;
        }
      }
    }

    console.log("[Zoom SMS] No MFA code found in recent messages");
    return null;
  } catch (err) {
    console.error("[Zoom SMS] Error:", err);
    return null;
  }
}

export async function refreshTelarusMfaBeforeSync(): Promise<void> {
  const code = await fetchAndUpdateTelarusMfaCode();
  if (!code) {
    console.warn("[Zoom SMS] Could not refresh Telarus MFA code - sync may fail");
  }
}
