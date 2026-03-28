import crypto from "crypto";
import type { TsdConnector, TsdDeal, TsdLead, TsdCommission, TsdWebhookEvent, TsdPushResult } from "../types.js";
import { withRetry } from "../utils.js";

const INTELISYS_BASE_URL = "https://api.intelisys.com/partner/v1";

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

export class IntelisysAdapter implements TsdConnector {
  readonly provider = "intelisys" as const;
  private apiKey: string;
  private partnerId: string;

  constructor(credentials: { apiKey: string; partnerId?: string }) {
    this.apiKey = credentials.apiKey;
    this.partnerId = credentials.partnerId || "";
  }

  private get headers() {
    return {
      "Authorization": `ApiKey ${this.apiKey}`,
      "X-Partner-Id": this.partnerId,
      "Content-Type": "application/json",
      "Accept": "application/json",
    };
  }

  async testConnection(): Promise<{ ok: boolean; error?: string }> {
    try {
      const res = await withRetry(() =>
        fetch(`${INTELISYS_BASE_URL}/account`, { headers: this.headers })
      );
      if (res.status === 401) return { ok: false, error: "Invalid API key or partner ID" };
      if (res.ok) return { ok: true };
      return { ok: false, error: `HTTP ${res.status}` };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : String(err) };
    }
  }

  async pushDeal(deal: TsdDeal): Promise<TsdPushResult> {
    try {
      const body = {
        deal_name: deal.title,
        customer_name: deal.customerName,
        customer_email: deal.customerEmail,
        customer_phone: deal.customerPhone,
        notes: deal.description,
        estimated_mrr: deal.estimatedValue
          ? (parseFloat(deal.estimatedValue) / 12).toFixed(2)
          : undefined,
        services: deal.products,
        stage: deal.stage || "prospect",
        partner_id: this.partnerId,
      };

      const res = await withRetry(() =>
        fetch(`${INTELISYS_BASE_URL}/deals`, {
          method: "POST",
          headers: this.headers,
          body: JSON.stringify(body),
        })
      );

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        return { success: false, error: `Intelisys API error ${res.status}: ${text}` };
      }

      const data = asRecord(await res.json().catch(() => ({})));
      return { success: true, externalId: str(data.id) || str(data.deal_id) || undefined };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : String(err) };
    }
  }

  async pullLeads(since?: Date): Promise<TsdLead[]> {
    try {
      const params = new URLSearchParams();
      if (since) params.set("since", since.toISOString());
      if (this.partnerId) params.set("partner_id", this.partnerId);

      const res = await withRetry(() =>
        fetch(`${INTELISYS_BASE_URL}/leads?${params}`, { headers: this.headers })
      );

      if (!res.ok) return [];

      const data = asRecord(await res.json().catch(() => ({})));
      const leads = asArray(data.items ?? data.leads);

      return leads.map((l) => {
        const r = asRecord(l);
        const firstName = str(r.first_name);
        const lastName = str(r.last_name);
        const fullName = `${firstName} ${lastName}`.trim() || str(r.contact_name) || "Unknown";
        return {
          externalId: str(r.id),
          companyName: str(r.company_name ?? r.account) || "Unknown",
          contactName: fullName,
          email: strOrUndef(r.email),
          phone: strOrUndef(r.phone ?? r.mobile),
          source: "intelisys",
          interest: strOrUndef(r.service ?? r.interest),
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
      if (since) params.set("since", since.toISOString());
      if (this.partnerId) params.set("partner_id", this.partnerId);

      const res = await withRetry(() =>
        fetch(`${INTELISYS_BASE_URL}/commissions?${params}`, { headers: this.headers })
      );

      if (!res.ok) return [];

      const data = asRecord(await res.json().catch(() => ({})));
      const commissions = asArray(data.items ?? data.commissions);

      return commissions.map((c) => {
        const r = asRecord(c);
        return {
          externalId: str(r.id),
          dealReference: strOrUndef(r.deal_id ?? r.reference),
          amount: str(r.amount ?? r.commission_amount) || "0",
          status: str(r.status) || "pending",
          description: strOrUndef(r.description ?? r.service_name),
          paidAt: typeof r.payment_date === "string" ? new Date(r.payment_date) : undefined,
          periodStart: typeof r.from_date === "string" ? new Date(r.from_date) : undefined,
          periodEnd: typeof r.to_date === "string" ? new Date(r.to_date) : undefined,
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

    const action = str(payload.action);
    let type: TsdWebhookEvent["type"] = "unknown";
    if (action === "deal_updated") type = "deal_update";
    else if (action === "lead_assigned") type = "lead_assigned";
    else if (action === "commission_paid") type = "commission_paid";

    return { type, provider: "intelisys", payload, raw: rawBody };
  }
}
