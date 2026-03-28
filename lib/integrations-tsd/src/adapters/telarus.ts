import crypto from "crypto";
import type { TsdConnector, TsdDeal, TsdLead, TsdCommission, TsdWebhookEvent, TsdPushResult } from "../types.js";
import { withRetry } from "../utils.js";

const TELARUS_BASE_URL = "https://api.telarus.com/v2";

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
  private apiKey: string;
  private agentId: string;

  constructor(credentials: { apiKey: string; agentId?: string }) {
    this.apiKey = credentials.apiKey;
    this.agentId = credentials.agentId || "";
  }

  private get headers() {
    return {
      "X-API-Key": this.apiKey,
      "X-Agent-Id": this.agentId,
      "Content-Type": "application/json",
      "Accept": "application/json",
    };
  }

  async testConnection(): Promise<{ ok: boolean; error?: string }> {
    try {
      const res = await withRetry(() =>
        fetch(`${TELARUS_BASE_URL}/status`, { headers: this.headers })
      );
      if (res.status === 403) return { ok: false, error: "Invalid API key or agent ID" };
      if (res.ok) return { ok: true };
      return { ok: false, error: `HTTP ${res.status}` };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : String(err) };
    }
  }

  async pushDeal(deal: TsdDeal): Promise<TsdPushResult> {
    try {
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
        agent_id: this.agentId,
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
      const params = new URLSearchParams();
      if (since) params.set("modified_after", since.toISOString());
      if (this.agentId) params.set("agent_id", this.agentId);

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
      const params = new URLSearchParams();
      if (since) params.set("modified_after", since.toISOString());
      if (this.agentId) params.set("agent_id", this.agentId);

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
