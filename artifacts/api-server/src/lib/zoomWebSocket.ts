import WebSocket from "ws";
import { handleSmsReceived } from "./zoomSms.js";

const ZOOM_OAUTH_URL = "https://zoom.us/oauth/token";
const ZOOM_WS_URL = "wss://ws.zoom.us/ws";

const HEARTBEAT_INTERVAL_MS = 30_000;
const RECONNECT_BASE_DELAY_MS = 2_000;
const RECONNECT_MAX_DELAY_MS = 60_000;
const TOKEN_REFRESH_LEEWAY_MS = 60_000;

interface ZoomTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope?: string;
}

interface CachedToken {
  token: string;
  expiresAt: number;
}

let cachedToken: CachedToken | null = null;
let activeSocket: WebSocket | null = null;
let heartbeatTimer: NodeJS.Timeout | null = null;
let reconnectTimer: NodeJS.Timeout | null = null;
let reconnectAttempts = 0;
let stopped = false;

async function fetchAccessToken(): Promise<string> {
  const accountId = process.env.ZOOM_ACCOUNT_ID;
  const clientId = process.env.ZOOM_CLIENT_ID;
  const clientSecret = process.env.ZOOM_CLIENT_SECRET;

  if (!accountId || !clientId || !clientSecret) {
    throw new Error(
      "Zoom WebSocket: ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID, and ZOOM_CLIENT_SECRET must be set",
    );
  }

  if (cachedToken && cachedToken.expiresAt > Date.now() + TOKEN_REFRESH_LEEWAY_MS) {
    return cachedToken.token;
  }

  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const params = new URLSearchParams({
    grant_type: "account_credentials",
    account_id: accountId,
  });

  const res = await fetch(`${ZOOM_OAUTH_URL}?${params.toString()}`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Zoom OAuth token request failed (${res.status}): ${text.slice(0, 200)}`);
  }

  const data = (await res.json()) as ZoomTokenResponse;
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  console.log(`[Zoom WS] OAuth token acquired (expires in ${data.expires_in}s)`);
  return data.access_token;
}

function clearTimers(): void {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
}

function scheduleReconnect(subscriptionId: string): void {
  if (stopped) return;
  reconnectAttempts += 1;
  const delay = Math.min(
    RECONNECT_BASE_DELAY_MS * Math.pow(2, reconnectAttempts - 1),
    RECONNECT_MAX_DELAY_MS,
  );
  console.log(`[Zoom WS] Reconnecting in ${Math.round(delay / 1000)}s (attempt ${reconnectAttempts})`);
  reconnectTimer = setTimeout(() => {
    void connect(subscriptionId);
  }, delay);
}

async function handleIncomingMessage(raw: string): Promise<void> {
  let envelope: { module?: string; content?: unknown; success?: boolean; [k: string]: unknown };
  try {
    envelope = JSON.parse(raw);
  } catch {
    console.warn("[Zoom WS] Received non-JSON frame:", raw.slice(0, 200));
    return;
  }

  const moduleName = envelope.module;

  if (moduleName === "build_connection") {
    if (envelope.success === false) {
      console.error("[Zoom WS] build_connection failed:", JSON.stringify(envelope).slice(0, 300));
    } else {
      console.log("[Zoom WS] Connection established");
      reconnectAttempts = 0;
    }
    return;
  }

  if (moduleName === "heartbeat") {
    return;
  }

  if (moduleName !== "message") {
    console.log(`[Zoom WS] Unhandled module: ${moduleName}`);
    return;
  }

  let payload: { event?: string; payload?: unknown; event_ts?: number };
  try {
    payload =
      typeof envelope.content === "string"
        ? JSON.parse(envelope.content)
        : (envelope.content as typeof payload);
  } catch (err) {
    console.error("[Zoom WS] Failed to parse event content:", err);
    return;
  }

  if (!payload?.event) {
    console.warn("[Zoom WS] Message envelope missing event:", JSON.stringify(payload).slice(0, 200));
    return;
  }

  if (payload.event === "phone.sms_received") {
    try {
      const code = await handleSmsReceived(payload as Parameters<typeof handleSmsReceived>[0]);
      console.log(`[Zoom WS] SMS processed (code extracted: ${!!code})`);
    } catch (err) {
      console.error("[Zoom WS] Error processing SMS event:", err);
    }
    return;
  }

  console.log(`[Zoom WS] Unhandled event: ${payload.event}`);
}

async function connect(subscriptionId: string): Promise<void> {
  if (stopped) return;

  let accessToken: string;
  try {
    accessToken = await fetchAccessToken();
  } catch (err) {
    console.error("[Zoom WS] Failed to acquire access token:", err);
    scheduleReconnect(subscriptionId);
    return;
  }

  const url = `${ZOOM_WS_URL}?subscriptionId=${encodeURIComponent(subscriptionId)}&access_token=${encodeURIComponent(accessToken)}`;
  console.log(`[Zoom WS] Connecting (subscriptionId=${subscriptionId})`);

  const ws = new WebSocket(url);
  activeSocket = ws;

  ws.on("open", () => {
    console.log("[Zoom WS] Socket open");
    clearTimers();
    heartbeatTimer = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ module: "heartbeat" }));
      }
    }, HEARTBEAT_INTERVAL_MS);
  });

  ws.on("message", (data: WebSocket.RawData) => {
    void handleIncomingMessage(data.toString("utf8"));
  });

  ws.on("error", (err) => {
    console.error("[Zoom WS] Socket error:", err.message);
  });

  ws.on("close", (code, reason) => {
    console.warn(`[Zoom WS] Socket closed (code=${code}, reason=${reason.toString().slice(0, 100)})`);
    activeSocket = null;
    clearTimers();
    if (code === 4001 || code === 4003) {
      cachedToken = null;
    }
    scheduleReconnect(subscriptionId);
  });
}

export async function startZoomWebSocketSubscription(): Promise<void> {
  const subscriptionId = process.env.ZOOM_WS_SUBSCRIPTION_ID;
  if (!subscriptionId) {
    console.log("[Zoom WS] ZOOM_WS_SUBSCRIPTION_ID not set — WebSocket subscription disabled");
    return;
  }
  if (!process.env.ZOOM_ACCOUNT_ID || !process.env.ZOOM_CLIENT_ID || !process.env.ZOOM_CLIENT_SECRET) {
    console.warn(
      "[Zoom WS] Missing Server-to-Server OAuth credentials (ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID, ZOOM_CLIENT_SECRET) — WebSocket subscription disabled",
    );
    return;
  }
  stopped = false;
  reconnectAttempts = 0;
  await connect(subscriptionId);
}

export function stopZoomWebSocketSubscription(): void {
  stopped = true;
  clearTimers();
  if (activeSocket) {
    try {
      activeSocket.close(1000, "shutdown");
    } catch {
      /* ignore */
    }
    activeSocket = null;
  }
}
