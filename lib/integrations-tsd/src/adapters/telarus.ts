import crypto from "crypto";
import type { TsdConnector, TsdDeal, TsdLead, TsdCommission, TsdWebhookEvent, TsdPushResult, TsdLoginResult, TsdAuthCredentials } from "../types.js";
import { withRetry } from "../utils.js";

const TELARUS_BASE_URL = "https://api.telarus.com/v2";
const TELARUS_AUTH_URL = "https://api.telarus.com/v2/auth";

function str(v: unknown): string {
  return typeof v === "string" ? v : typeof v === "number" ? String(v) : "";
}

function strOrUndef(v: unknown): string | undefined {
  return typeof v === "string" && v.length > 0 ? v : undefined;
}

function asRecord(v: unknown): Record<string, unknown> {
  return v !== null && typeof v === "object" && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : {};
}

function asArray(v: unknown): unknown[] {
  return Array.isArray(v) ? v : [];
}

function verifyHmacSignature(rawBody: string, signature: string, secret: string): boolean {
  const expectedHex = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");
  const sigHex = signature.replace(/^sha256=/, "");
  if (!/^[0-9a-f]+$/i.test(sigHex) || sigHex.length !== expectedHex.length) {
    return false;
  }
  return crypto.timingSafeEqual(
    Buffer.from(expectedHex, "hex"),
    Buffer.from(sigHex, "hex")
  );
}

export class TelarusAdapter implements TsdConnector {
  readonly provider = "telarus" as const;
  private credentials: TsdAuthCredentials;
  private sessionToken: string | null = null;
  private sessionExpiresAt: number = 0;

  constructor(credentials: TsdAuthCredentials) {
    this.credentials = credentials;
    if (credentials.type === "api_key" && credentials.apiKey) {
      this.sessionToken = credentials.apiKey;
      this.sessionExpiresAt = Date.now() + 365 * 24 * 60 * 60 * 1000;
    }
  }

  isAuthenticated(): boolean {
    return !!this.sessionToken && Date.now() < this.sessionExpiresAt;
  }

  private get headers(): Record<string, string> {
    const h: Record<string, string> = {
      "Content-Type": "application/json",
      "Accept": "application/json",
    };

    if (this.sessionToken) {
      if (this.credentials.type === "api_key") {
        h["X-API-Key"] = this.sessionToken;
        if (this.credentials.agentId) {
          h["X-Agent-Id"] = this.credentials.agentId;
        }
      } else {
        h["Authorization"] = `Bearer ${this.sessionToken}`;
      }
    }

    return h;
  }

  async login(): Promise<TsdLoginResult> {
    if (this.credentials.type === "api_key") {
      this.sessionToken = this.credentials.apiKey || null;
      this.sessionExpiresAt = Date.now() + 365 * 24 * 60 * 60 * 1000;
      return { success: true, sessionToken: this.sessionToken || undefined };
    }

    if (!this.credentials.username || !this.credentials.password) {
      return { success: false, error: "Username and password are required for Telarus login" };
    }

    try {
      const loginRes = await withRetry(() =>
        fetch(`${TELARUS_AUTH_URL}/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify({
            username: this.credentials.username,
            password: this.credentials.password,
          }),
        }),
        1,
        2000
      );

      if (!loginRes.ok) {
        const errorText = await loginRes.text().catch(() => "");
        if (loginRes.status === 401) {
          return { success: false, error: "Invalid username or password" };
        }
        return { success: false, error: `Login failed (HTTP ${loginRes.status}): ${errorText}` };
      }

      const loginData = asRecord(await loginRes.json().catch(() => ({})));

      const needsMfa = loginData.mfa_required === true ||
        loginData.requires_mfa === true ||
        loginData.status === "mfa_required" ||
        loginData.challenge === "sms";

      if (needsMfa) {
        console.log("[Telarus] MFA required, checking for stored code...");

        if (!this.credentials.mfaCode) {
          return {
            success: false,
            requiresMfa: true,
            mfaMethod: "sms",
            error: "MFA code required. Waiting for SMS code via Zoom webhook.",
          };
        }

        const mfaToken = str(loginData.mfa_token) || str(loginData.session_token) || str(loginData.token);

        const mfaRes = await withRetry(() =>
          fetch(`${TELARUS_AUTH_URL}/mfa/verify`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Accept": "application/json" },
            body: JSON.stringify({
              mfa_token: mfaToken,
              code: this.credentials.mfaCode,
              session_token: mfaToken,
            }),
          }),
          1,
          2000
        );

        if (!mfaRes.ok) {
          const errorText = await mfaRes.text().catch(() => "");
          return { success: false, error: `MFA verification failed (HTTP ${mfaRes.status}): ${errorText}` };
        }

        const mfaData = asRecord(await mfaRes.json().catch(() => ({})));
        const token = str(mfaData.access_token) || str(mfaData.token) || str(mfaData.session_token);

        if (!token) {
          return { success: false, error: "MFA succeeded but no session token returned" };
        }

        this.sessionToken = token;
        const expiresIn = typeof mfaData.expires_in === "number" ? mfaData.expires_in : 3600;
        this.sessionExpiresAt = Date.now() + expiresIn * 1000;

        console.log("[Telarus] MFA login successful, session expires in", expiresIn, "seconds");
        return { success: true, sessionToken: token };
      }

      const token = str(loginData.access_token) || str(loginData.token) || str(loginData.session_token);
      if (!token) {
        return { success: false, error: "Login succeeded but no session token returned" };
      }

      this.sessionToken = token;
      const expiresIn = typeof loginData.expires_in === "number" ? loginData.expires_in : 3600;
      this.sessionExpiresAt = Date.now() + expiresIn * 1000;

      console.log("[Telarus] Login successful (no MFA), session expires in", expiresIn, "seconds");
      return { success: true, sessionToken: token };

    } catch (err) {
      return { success: false, error: `Login error: ${err instanceof Error ? err.message : String(err)}` };
    }
  }

  private async ensureAuthenticated(): Promise<void> {
    if (!this.isAuthenticated()) {
      const result = await this.login();
      if (!result.success) {
        throw new Error(`Telarus authentication failed: ${result.error}`);
      }
    }
  }

  async testConnection(): Promise<{ ok: boolean; error?: string; requiresMfa?: boolean }> {
    try {
      if (this.credentials.type === "username_password") {
        const loginResult = await this.login();
        if (!loginResult.success) {
          return {
            ok: false,
            error: loginResult.error,
            requiresMfa: loginResult.requiresMfa,
          };
        }
      }

      const res = await withRetry(() =>
        fetch(`${TELARUS_BASE_URL}/status`, { headers: this.headers })
      );
      if (res.status === 401 || res.status === 403) {
        return { ok: false, error: "Authentication failed — invalid credentials or expired session" };
      }
      if (res.ok) return { ok: true };
      return { ok: false, error: `HTTP ${res.status}` };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : String(err) };
    }
  }

  async pushDeal(deal: TsdDeal): Promise<TsdPushResult> {
    try {
      await this.ensureAuthenticated();

      const body = {
        name: deal.title,
        customer: {
          company: deal.customerName,
          email: deal.customerEmail,
          phone: deal.customerPhone,
        },
        description: deal.description,
        value: deal.estimatedValue ? parseFloat(deal.estimatedValue) : undefined,
        stage: deal.stage,
        services: deal.products,
        agent_id: this.credentials.agentId,
      };

      const res = await withRetry(() =>
        fetch(`${TELARUS_BASE_URL}/deals`, {
          method: "POST",
          headers: this.headers,
          body: JSON.stringify(body),
        })
      );

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        return { success: false, error: `Telarus API error ${res.status}: ${text}` };
      }

      const data = asRecord(await res.json().catch(() => ({})));
      return { success: true, externalId: str(data.id) || str(data.deal_id) || undefined };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : String(err) };
    }
  }

  async pullLeads(since?: Date): Promise<TsdLead[]> {
    try {
      await this.ensureAuthenticated();

      const params = new URLSearchParams();
      if (since) params.set("modified_after", since.toISOString());
      if (this.credentials.agentId) params.set("agent_id", this.credentials.agentId);

      const res = await withRetry(() =>
        fetch(`${TELARUS_BASE_URL}/leads?${params}`, { headers: this.headers })
      );

      if (!res.ok) return [];

      const data = asRecord(await res.json().catch(() => ({})));
      const leads = asArray(data.results ?? data.leads);

      return leads.map((l) => {
        const r = asRecord(l);
        return {
          externalId: str(r.id),
          companyName: str(r.company ?? r.customer_name) || "Unknown",
          contactName: str(r.contact ?? r.contact_name) || "Unknown",
          email: strOrUndef(r.email),
          phone: strOrUndef(r.phone),
          source: "telarus",
          interest: strOrUndef(r.service_type ?? r.interest),
          status: str(r.status) || "new",
        } satisfies TsdLead;
      });
    } catch {
      return [];
    }
  }

  async pullCommissions(since?: Date): Promise<TsdCommission[]> {
    try {
      await this.ensureAuthenticated();

      const params = new URLSearchParams();
      if (since) params.set("modified_after", since.toISOString());
      if (this.credentials.agentId) params.set("agent_id", this.credentials.agentId);

      const res = await withRetry(() =>
        fetch(`${TELARUS_BASE_URL}/commissions?${params}`, { headers: this.headers })
      );

      if (!res.ok) return [];

      const data = asRecord(await res.json().catch(() => ({})));
      const commissions = asArray(data.results ?? data.commissions);

      return commissions.map((c) => {
        const r = asRecord(c);
        return {
          externalId: str(r.id),
          dealReference: strOrUndef(r.deal_id ?? r.opportunity_id),
          amount: str(r.amount) || "0",
          status: str(r.status) || "pending",
          description: strOrUndef(r.description ?? r.service_description),
          paidAt: typeof r.paid_date === "string" ? new Date(r.paid_date) : undefined,
          periodStart: typeof r.period_start === "string" ? new Date(r.period_start) : undefined,
          periodEnd: typeof r.period_end === "string" ? new Date(r.period_end) : undefined,
        } satisfies TsdCommission;
      });
    } catch {
      return [];
    }
  }

  async handleWebhook(rawBody: string, signature: string, secret: string): Promise<TsdWebhookEvent> {
    if (!verifyHmacSignature(rawBody, signature, secret)) {
      throw new Error("Invalid webhook signature");
    }

    let payload: Record<string, unknown>;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      throw new Error("Invalid webhook payload");
    }

    const eventType = str(payload.type);
    let type: TsdWebhookEvent["type"] = "unknown";
    if (eventType === "deal.updated") type = "deal_update";
    else if (eventType === "lead.assigned") type = "lead_assigned";
    else if (eventType === "commission.paid") type = "commission_paid";

    return { type, provider: "telarus", payload, raw: rawBody };
  }
}
