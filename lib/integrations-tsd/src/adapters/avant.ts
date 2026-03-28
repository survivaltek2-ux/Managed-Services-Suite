import crypto from "crypto";
import type { TsdConnector, TsdDeal, TsdLead, TsdCommission, TsdWebhookEvent, TsdPushResult } from "../types.js";
import { withRetry } from "../utils.js";

const AVANT_BASE_URL = "https://api.avantcommunications.com/v1";

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

export class AvantAdapter implements TsdConnector {
  readonly provider = "avant" as const;
  private username: string;
  private password: string;

  constructor(credentials: { username: string; password: string }) {
    this.username = credentials.username;
    this.password = credentials.password;
  }

  private get headers() {
    const token = Buffer.from(`${this.username}:${this.password}`).toString("base64");
    return {
      "Authorization": `Basic ${token}`,
      "Content-Type": "application/json",
      "Accept": "application/json",
    };
  }

  async testConnection(): Promise<{ ok: boolean; error?: string }> {
    try {
      const res = await withRetry(() =>
        fetch(`${AVANT_BASE_URL}/ping`, { headers: this.headers })
      );
      if (res.status === 401) return { ok: false, error: "Invalid username or password" };
      if (res.ok) return { ok: true };
      return { ok: false, error: `HTTP ${res.status}` };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : String(err) };
    }
  }

  async pushDeal(deal: TsdDeal): Promise<TsdPushResult> {
    try {
      const body = {
        opportunity_name: deal.title,
        account_name: deal.customerName,
        contact_email: deal.customerEmail,
        contact_phone: deal.customerPhone,
        description: deal.description,
        amount: deal.estimatedValue ? parseFloat(deal.estimatedValue) : undefined,
        stage: deal.stage || "Prospect",
        products: deal.products,
      };

      const res = await withRetry(() =>
        fetch(`${AVANT_BASE_URL}/opportunities`, {
          method: "POST",
          headers: this.headers,
          body: JSON.stringify(body),
        })
      );

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        return { success: false, error: `Avant API error ${res.status}: ${text}` };
      }

      const data = asRecord(await res.json().catch(() => ({})));
      return { success: true, externalId: str(data.id) || str(data.opportunity_id) || undefined };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : String(err) };
    }
  }

  async pullLeads(since?: Date): Promise<TsdLead[]> {
    try {
      const params = new URLSearchParams();
      if (since) params.set("updated_after", since.toISOString());

      const res = await withRetry(() =>
        fetch(`${AVANT_BASE_URL}/leads?${params}`, { headers: this.headers })
      );

      if (!res.ok) return [];

      const data = asRecord(await res.json().catch(() => ({})));
      const leads = asArray(data.leads ?? data.data);

      return leads.map((l) => {
        const r = asRecord(l);
        return {
          externalId: str(r.id),
          companyName: str(r.company_name ?? r.account_name) || "Unknown",
          contactName: str(r.contact_name ?? r.full_name) || "Unknown",
          email: strOrUndef(r.email),
          phone: strOrUndef(r.phone),
          source: "avant",
          interest: strOrUndef(r.interest ?? r.product_interest),
          status: str(r.status) || "new",
        } satisfies TsdLead;
      });
    } catch {
      return [];
    }
  }

  async pullCommissions(since?: Date): Promise<TsdCommission[]> {
    try {
      const params = new URLSearchParams();
      if (since) params.set("updated_after", since.toISOString());

      const res = await withRetry(() =>
        fetch(`${AVANT_BASE_URL}/commissions?${params}`, { headers: this.headers })
      );

      if (!res.ok) return [];

      const data = asRecord(await res.json().catch(() => ({})));
      const commissions = asArray(data.commissions ?? data.data);

      return commissions.map((c) => {
        const r = asRecord(c);
        return {
          externalId: str(r.id),
          dealReference: strOrUndef(r.opportunity_id ?? r.deal_id),
          amount: str(r.amount) || "0",
          status: str(r.status) || "pending",
          description: strOrUndef(r.description),
          paidAt: typeof r.paid_at === "string" ? new Date(r.paid_at) : undefined,
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

    const eventType = str(payload.event_type);
    let type: TsdWebhookEvent["type"] = "unknown";
    if (eventType === "opportunity.updated") type = "deal_update";
    else if (eventType === "lead.assigned") type = "lead_assigned";
    else if (eventType === "commission.paid") type = "commission_paid";

    return { type, provider: "avant", payload, raw: rawBody };
  }
}
