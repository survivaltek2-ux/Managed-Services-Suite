import crypto from "crypto";
import type { TsdConnector, TsdDeal, TsdLead, TsdCommission, TsdWebhookEvent, TsdPushResult, TsdLoginResult, TsdAuthCredentials } from "../types.js";
import { withRetry } from "../utils.js";

const SALESFORCE_SOAP_LOGIN_URL = "https://login.salesforce.com/services/Soap/u/59.0";
const SALESFORCE_API_VERSION = "v59.0";

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

function extractXmlValue(xml: string, tag: string): string {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match ? match[1].trim() : "";
}

function buildSoapLoginEnvelope(username: string, password: string): string {
  const escaped = (s: string) =>
    s.replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");

  return `<?xml version="1.0" encoding="utf-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:partner.soap.sforce.com">
  <soapenv:Body>
    <urn:login>
      <urn:username>${escaped(username)}</urn:username>
      <urn:password>${escaped(password)}</urn:password>
    </urn:login>
  </soapenv:Body>
</soapenv:Envelope>`;
}

interface SalesforceSession {
  sessionId: string;
  serverUrl: string;
  instanceUrl: string;
  expiresAt: number;
}

export class TelarusAdapter implements TsdConnector {
  readonly provider = "telarus" as const;
  private credentials: TsdAuthCredentials;
  private session: SalesforceSession | null = null;

  constructor(credentials: TsdAuthCredentials) {
    this.credentials = credentials;

    if (credentials.type === "api_key" && credentials.apiKey) {
      this.session = {
        sessionId: credentials.apiKey,
        serverUrl: "https://api.telarus.com/v2",
        instanceUrl: "https://api.telarus.com",
        expiresAt: Date.now() + 365 * 24 * 60 * 60 * 1000,
      };
    }
  }

  isAuthenticated(): boolean {
    return !!this.session && Date.now() < this.session.expiresAt;
  }

  private get sfHeaders(): Record<string, string> {
    return {
      "Authorization": `Bearer ${this.session?.sessionId || ""}`,
      "Content-Type": "application/json",
      "Accept": "application/json",
    };
  }

  private get instanceUrl(): string {
    return this.session?.instanceUrl || "";
  }

  async login(): Promise<TsdLoginResult> {
    if (this.credentials.type === "api_key") {
      return { success: true, sessionToken: this.credentials.apiKey };
    }

    if (!this.credentials.username || !this.credentials.password) {
      return { success: false, error: "Username and password are required for Telarus/Salesforce login" };
    }

    const passwordWithToken = this.credentials.securityToken
      ? `${this.credentials.password}${this.credentials.securityToken}`
      : this.credentials.password;

    const soapBody = buildSoapLoginEnvelope(this.credentials.username, passwordWithToken);

    try {
      console.log("[Telarus] Attempting Salesforce SOAP login...");

      const res = await withRetry(() =>
        fetch(SALESFORCE_SOAP_LOGIN_URL, {
          method: "POST",
          headers: {
            "Content-Type": "text/xml; charset=utf-8",
            "SOAPAction": "login",
          },
          body: soapBody,
        }),
        1,
        2000
      );

      const responseText = await res.text();

      if (!res.ok || responseText.includes("soapenv:Fault") || responseText.includes(":Fault")) {
        const faultString = extractXmlValue(responseText, "faultstring");
        const exceptionCode = extractXmlValue(responseText, "sf:exceptionCode") ||
          extractXmlValue(responseText, "exceptionCode");

        if (exceptionCode === "INVALID_LOGIN" || faultString.toLowerCase().includes("invalid login")) {
          return { success: false, error: "Invalid username, password, or security token" };
        }

        if (exceptionCode === "LOGIN_MUST_USE_SECURITY_TOKEN") {
          return { success: false, error: "Security token required. Append your Salesforce Security Token to the password, or configure it separately." };
        }

        return { success: false, error: `Salesforce login failed: ${faultString || exceptionCode || "Unknown error"}` };
      }

      const sessionId = extractXmlValue(responseText, "sessionId");
      const serverUrlRaw = extractXmlValue(responseText, "serverUrl");

      if (!sessionId) {
        return { success: false, error: "No session ID returned from Salesforce SOAP login" };
      }

      const instanceUrl = serverUrlRaw.match(/^(https:\/\/[^/]+)/)?.[1] || "";

      this.session = {
        sessionId,
        serverUrl: serverUrlRaw,
        instanceUrl,
        expiresAt: Date.now() + 2 * 60 * 60 * 1000,
      };

      console.log(`[Telarus] Salesforce login successful. Instance: ${instanceUrl}`);
      return { success: true, sessionToken: sessionId };

    } catch (err) {
      return { success: false, error: `Salesforce login error: ${err instanceof Error ? err.message : String(err)}` };
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

  private async sfQuery(soql: string): Promise<unknown[]> {
    await this.ensureAuthenticated();

    const url = `${this.instanceUrl}/services/data/${SALESFORCE_API_VERSION}/query/?q=${encodeURIComponent(soql)}`;
    const res = await withRetry(() => fetch(url, { headers: this.sfHeaders }));

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.warn(`[Telarus] SOQL query failed (${res.status}): ${errText.slice(0, 200)}`);
      return [];
    }

    const data = asRecord(await res.json().catch(() => ({})));
    return asArray(data.records);
  }

  private async sfQueryAll(soql: string): Promise<unknown[]> {
    await this.ensureAuthenticated();

    let url: string | null =
      `${this.instanceUrl}/services/data/${SALESFORCE_API_VERSION}/query/?q=${encodeURIComponent(soql)}`;
    const allRecords: unknown[] = [];

    while (url) {
      const res = await fetch(url, { headers: this.sfHeaders });
      if (!res.ok) break;

      const data = asRecord(await res.json().catch(() => ({})));
      allRecords.push(...asArray(data.records));

      const nextUrl = strOrUndef(data.nextRecordsUrl);
      url = nextUrl ? `${this.instanceUrl}${nextUrl}` : null;
    }

    return allRecords;
  }

  private async sfCreate(objectName: string, fields: Record<string, unknown>): Promise<{ id?: string; success: boolean; error?: string }> {
    await this.ensureAuthenticated();

    const url = `${this.instanceUrl}/services/data/${SALESFORCE_API_VERSION}/sobjects/${objectName}`;
    const res = await withRetry(() =>
      fetch(url, {
        method: "POST",
        headers: this.sfHeaders,
        body: JSON.stringify(fields),
      })
    );

    if (!res.ok) {
      const errBody = await res.json().catch(() => [{ message: "Unknown error" }]);
      const errMsg = Array.isArray(errBody) ? errBody.map((e: { message?: string }) => e.message).join("; ") : String(errBody);
      return { success: false, error: `Salesforce create ${objectName} failed: ${errMsg}` };
    }

    const data = asRecord(await res.json().catch(() => ({})));
    return { success: true, id: str(data.id) };
  }

  async testConnection(): Promise<{ ok: boolean; error?: string; requiresMfa?: boolean }> {
    if (this.credentials.type === "api_key") {
      return { ok: true };
    }

    const loginResult = await this.login();
    if (!loginResult.success) {
      return { ok: false, error: loginResult.error };
    }

    try {
      const res = await fetch(
        `${this.instanceUrl}/services/data/${SALESFORCE_API_VERSION}/`,
        { headers: this.sfHeaders }
      );
      if (res.ok) return { ok: true };
      return { ok: false, error: `API check failed: HTTP ${res.status}` };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : String(err) };
    }
  }

  async pushDeal(deal: TsdDeal): Promise<TsdPushResult> {
    if (this.credentials.type === "api_key") {
      return this.pushDealLegacyApi(deal);
    }

    try {
      await this.ensureAuthenticated();

      const leadFields: Record<string, unknown> = {
        LastName: deal.customerName.split(" ").slice(-1)[0] || deal.customerName,
        FirstName: deal.customerName.split(" ").slice(0, -1).join(" ") || undefined,
        Company: deal.customerName,
        Email: deal.customerEmail || undefined,
        Phone: deal.customerPhone || undefined,
        Description: [
          deal.description,
          deal.products?.length ? `Products: ${deal.products.join(", ")}` : undefined,
          deal.estimatedValue ? `Estimated Value: $${deal.estimatedValue}` : undefined,
          `Partner Deal: ${deal.title}`,
        ].filter(Boolean).join("\n\n"),
        LeadSource: "Partner Referral",
        Status: "Open - Not Contacted",
      };

      const result = await this.sfCreate("Lead", leadFields);

      if (result.success) {
        console.log(`[Telarus] Created Salesforce Lead: ${result.id}`);
        return { success: true, externalId: result.id };
      }

      return { success: false, error: result.error };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : String(err) };
    }
  }

  private async pushDealLegacyApi(deal: TsdDeal): Promise<TsdPushResult> {
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
        agent_id: this.credentials.agentId,
      };

      const res = await withRetry(() =>
        fetch(`https://api.telarus.com/v2/deals`, {
          method: "POST",
          headers: {
            "X-API-Key": this.session?.sessionId || "",
            "Content-Type": "application/json",
          },
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
    if (this.credentials.type === "api_key") {
      return this.pullLeadsLegacyApi(since);
    }

    try {
      const sinceClause = since ? ` AND LastModifiedDate >= ${since.toISOString()}` : "";
      const soql = `SELECT Id, Company, FirstName, LastName, Email, Phone, Status, LeadSource, Description, Industry FROM Lead WHERE LeadSource = 'Partner Referral'${sinceClause} ORDER BY LastModifiedDate DESC LIMIT 200`;

      const records = await this.sfQueryAll(soql);

      return records.map((r) => {
        const rec = asRecord(r);
        const firstName = str(rec.FirstName);
        const lastName = str(rec.LastName);
        const fullName = `${firstName} ${lastName}`.trim() || str(rec.Company) || "Unknown";

        return {
          externalId: str(rec.Id),
          companyName: str(rec.Company) || "Unknown",
          contactName: fullName,
          email: strOrUndef(rec.Email),
          phone: strOrUndef(rec.Phone),
          source: "telarus",
          interest: strOrUndef(rec.Industry) || strOrUndef(rec.Description)?.slice(0, 100),
          status: str(rec.Status) || "new",
        } satisfies TsdLead;
      });
    } catch (err) {
      console.error("[Telarus] pullLeads error:", err);
      return [];
    }
  }

  private async pullLeadsLegacyApi(since?: Date): Promise<TsdLead[]> {
    try {
      const params = new URLSearchParams();
      if (since) params.set("modified_after", since.toISOString());
      if (this.credentials.agentId) params.set("agent_id", this.credentials.agentId);

      const res = await withRetry(() =>
        fetch(`https://api.telarus.com/v2/leads?${params}`, {
          headers: { "X-API-Key": this.session?.sessionId || "" },
        })
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
    if (this.credentials.type === "api_key") {
      return this.pullCommissionsLegacyApi(since);
    }

    try {
      const sinceClause = since ? ` AND LastModifiedDate >= ${since.toISOString()}` : "";

      const customObjNames = ["Commission__c", "Partner_Commission__c", "Agent_Commission__c"];
      let records: unknown[] = [];
      let foundObject = "";

      for (const objName of customObjNames) {
        try {
          const testRecords = await this.sfQuery(
            `SELECT Id FROM ${objName} LIMIT 1`
          );
          if (testRecords.length >= 0) {
            foundObject = objName;
            break;
          }
        } catch {
          continue;
        }
      }

      if (foundObject) {
        const soql = `SELECT Id, Amount__c, Status__c, Opportunity__c, Description__c, Payment_Date__c, Period_Start__c, Period_End__c FROM ${foundObject}${sinceClause ? ` WHERE${sinceClause}` : ""} ORDER BY LastModifiedDate DESC LIMIT 200`;
        records = await this.sfQueryAll(soql).catch(() => []);
      } else {
        const oppSoql = `SELECT Id, Amount, StageName, CloseDate, Description, Name FROM Opportunity WHERE RecordType.Name LIKE '%Commission%'${sinceClause} LIMIT 200`;
        records = await this.sfQueryAll(oppSoql).catch(() => []);
      }

      return records.map((r) => {
        const rec = asRecord(r);
        return {
          externalId: str(rec.Id),
          dealReference: strOrUndef(rec.Opportunity__c ?? rec.OpportunityId),
          amount: str(rec.Amount__c ?? rec.Amount) || "0",
          status: str(rec.Status__c ?? rec.StageName) || "pending",
          description: strOrUndef(rec.Description__c ?? rec.Description ?? rec.Name),
          paidAt: typeof rec.Payment_Date__c === "string" ? new Date(rec.Payment_Date__c) : undefined,
          periodStart: typeof rec.Period_Start__c === "string" ? new Date(rec.Period_Start__c) : undefined,
          periodEnd: typeof rec.Period_End__c === "string" ? new Date(rec.Period_End__c) : undefined,
        } satisfies TsdCommission;
      });
    } catch (err) {
      console.error("[Telarus] pullCommissions error:", err);
      return [];
    }
  }

  private async pullCommissionsLegacyApi(since?: Date): Promise<TsdCommission[]> {
    try {
      const params = new URLSearchParams();
      if (since) params.set("modified_after", since.toISOString());
      if (this.credentials.agentId) params.set("agent_id", this.credentials.agentId);

      const res = await withRetry(() =>
        fetch(`https://api.telarus.com/v2/commissions?${params}`, {
          headers: { "X-API-Key": this.session?.sessionId || "" },
        })
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
