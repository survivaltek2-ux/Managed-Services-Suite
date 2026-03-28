export const TSD_IDS = ["avant", "telarus", "intelisys"] as const;
export type TsdId = (typeof TSD_IDS)[number];

export const TSD_LABELS: Record<TsdId, string> = {
  avant: "Avant",
  telarus: "Telarus",
  intelisys: "Intelisys",
};

export interface TsdDealPayload {
  dealId: number;
  title: string;
  customerName: string;
  customerEmail?: string | null;
  products: string[];
  estimatedValue?: string | number | null;
  partnerCompany: string;
  partnerEmail: string;
}

export interface TsdPushResult {
  tsdId: TsdId;
  success: boolean;
  externalId?: string;
  errorMessage?: string;
}

async function pushToAvant(deal: TsdDealPayload): Promise<TsdPushResult> {
  const apiKey = process.env.AVANT_API_KEY;
  if (!apiKey) {
    console.log(`[TSD:Avant] No API key configured — simulating push for deal #${deal.dealId}`);
    return { tsdId: "avant", success: true, externalId: `avant-sim-${deal.dealId}` };
  }
  try {
    const res = await fetch("https://api.avant.com/v1/deals", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        opportunity_name: deal.title,
        customer_name: deal.customerName,
        customer_email: deal.customerEmail,
        products: deal.products,
        estimated_value: deal.estimatedValue,
        partner_company: deal.partnerCompany,
        partner_email: deal.partnerEmail,
      }),
    });
    if (!res.ok) {
      const errText = await res.text();
      return { tsdId: "avant", success: false, errorMessage: `HTTP ${res.status}: ${errText}` };
    }
    const data: any = await res.json();
    return { tsdId: "avant", success: true, externalId: data.id || data.deal_id };
  } catch (err: any) {
    return { tsdId: "avant", success: false, errorMessage: err.message };
  }
}

async function pushToTelarus(deal: TsdDealPayload): Promise<TsdPushResult> {
  const apiKey = process.env.TELARUS_API_KEY;
  if (!apiKey) {
    console.log(`[TSD:Telarus] No API key configured — simulating push for deal #${deal.dealId}`);
    return { tsdId: "telarus", success: true, externalId: `telarus-sim-${deal.dealId}` };
  }
  try {
    const res = await fetch("https://api.telarus.com/v2/opportunities", {
      method: "POST",
      headers: { "X-API-Key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        name: deal.title,
        customer_company: deal.customerName,
        customer_email: deal.customerEmail,
        products: deal.products,
        value: deal.estimatedValue,
        partner_company: deal.partnerCompany,
        partner_email: deal.partnerEmail,
      }),
    });
    if (!res.ok) {
      const errText = await res.text();
      return { tsdId: "telarus", success: false, errorMessage: `HTTP ${res.status}: ${errText}` };
    }
    const data: any = await res.json();
    return { tsdId: "telarus", success: true, externalId: data.id || data.opportunity_id };
  } catch (err: any) {
    return { tsdId: "telarus", success: false, errorMessage: err.message };
  }
}

async function pushToIntelisys(deal: TsdDealPayload): Promise<TsdPushResult> {
  const apiKey = process.env.INTELISYS_API_KEY;
  if (!apiKey) {
    console.log(`[TSD:Intelisys] No API key configured — simulating push for deal #${deal.dealId}`);
    return { tsdId: "intelisys", success: true, externalId: `intelisys-sim-${deal.dealId}` };
  }
  try {
    const res = await fetch("https://api.intelisys.com/v1/deals/register", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        deal_name: deal.title,
        customer: deal.customerName,
        customer_email: deal.customerEmail,
        products: deal.products,
        estimated_value: deal.estimatedValue,
        partner: deal.partnerCompany,
        partner_email: deal.partnerEmail,
      }),
    });
    if (!res.ok) {
      const errText = await res.text();
      return { tsdId: "intelisys", success: false, errorMessage: `HTTP ${res.status}: ${errText}` };
    }
    const data: any = await res.json();
    return { tsdId: "intelisys", success: true, externalId: data.id || data.registration_id };
  } catch (err: any) {
    return { tsdId: "intelisys", success: false, errorMessage: err.message };
  }
}

export async function pushDeal(tsdId: TsdId, deal: TsdDealPayload): Promise<TsdPushResult> {
  switch (tsdId) {
    case "avant": return pushToAvant(deal);
    case "telarus": return pushToTelarus(deal);
    case "intelisys": return pushToIntelisys(deal);
    default: return { tsdId, success: false, errorMessage: `Unknown TSD: ${tsdId}` };
  }
}
