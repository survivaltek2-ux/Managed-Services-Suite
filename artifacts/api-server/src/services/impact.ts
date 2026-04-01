/**
 * Impact.com Publisher API Service
 *
 * Docs: https://integrations.impact.com/impact-publisher/reference/overview
 * Base: https://api.impact.com/Mediapartners/{AccountSID}/
 *
 * Auth: HTTP Basic — username = IMPACT_ACCOUNT_SID, password = IMPACT_AUTH_TOKEN
 */

const ACCOUNT_SID = process.env.IMPACT_ACCOUNT_SID;
const AUTH_TOKEN = process.env.IMPACT_AUTH_TOKEN;
const BASE_URL = `https://api.impact.com/Mediapartners/${ACCOUNT_SID}`;

function authHeader(): string {
  if (!ACCOUNT_SID || !AUTH_TOKEN) {
    throw new Error("Impact credentials not configured (IMPACT_ACCOUNT_SID / IMPACT_AUTH_TOKEN missing)");
  }
  return "Basic " + Buffer.from(`${ACCOUNT_SID}:${AUTH_TOKEN}`).toString("base64");
}

async function impactFetch(path: string, params: Record<string, string> = {}): Promise<any> {
  const url = new URL(`${BASE_URL}${path}`);
  url.searchParams.set("MediaType", "json");
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: authHeader(),
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Impact API error ${res.status}: ${text.slice(0, 300)}`);
  }

  return res.json();
}

// ─────────────────────────────────────────────────────────────────────────────
// Campaigns (programs we're enrolled in / have applied to)
// ─────────────────────────────────────────────────────────────────────────────

export interface ImpactCampaign {
  CampaignId: string;
  CampaignName: string;
  AdvertiserId: string;
  AdvertiserName: string;
  AdvertiserUrl: string;
  CampaignUrl: string;
  CampaignDescription: string;
  ContractStatus: string;  // "Active" | "Pending" | "Declined" | "Deactivated" | "Applied"
  TrackingLink: string;    // Your live affiliate link (already generated)
  CampaignLogoUri: string; // Relative URI — prefix with https://api.impact.com to get full URL
  AllowsDeeplinking: string;
  DeeplinkDomains: string[];
}

export async function getCampaigns(): Promise<ImpactCampaign[]> {
  const data = await impactFetch("/Campaigns", { PageSize: "100" });
  return data.Campaigns ?? [];
}

// ─────────────────────────────────────────────────────────────────────────────
// Tracking Links (your actual affiliate URLs per campaign)
// ─────────────────────────────────────────────────────────────────────────────

export interface ImpactTrackingLink {
  Id: string;
  CampaignId: string;
  AdvertiserName: string;
  Name: string;
  TrackingLink: string;
  LandingPageUrl: string;
  Status: string;
}

export async function getTrackingLinks(): Promise<ImpactTrackingLink[]> {
  const data = await impactFetch("/TrackingLinks", { PageSize: "100" });
  return data.TrackingLinks ?? [];
}

// ─────────────────────────────────────────────────────────────────────────────
// Performance Report (earnings, clicks, conversions)
// ─────────────────────────────────────────────────────────────────────────────

export interface ImpactActionEntry {
  CampaignId: string;
  CampaignName: string;
  AdvertiserName: string;
  ActionDate: string;
  EventDate: string;
  Status: string;
  Payout: number;
  SaleAmount: number;
  OrderId: string;
  ActionTrackerId: string;
  ActionTrackerName: string;
}

export async function getActions(options: {
  startDate?: string;  // YYYY-MM-DD
  endDate?: string;
  status?: string;     // "APPROVED" | "PENDING" | "REVERSED"
} = {}): Promise<ImpactActionEntry[]> {
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const fmt = (d: Date) => d.toISOString().split("T")[0];

  const params: Record<string, string> = {
    StartDate: options.startDate ?? fmt(thirtyDaysAgo),
    EndDate: options.endDate ?? fmt(today),
    PageSize: "500",
  };
  if (options.status) params.Status = options.status;

  const data = await impactFetch("/Reports/adv_action_listings", params);
  return data.Records ?? data.Actions ?? data.ActionListings ?? [];
}

// ─────────────────────────────────────────────────────────────────────────────
// Media / Ads available from campaigns
// ─────────────────────────────────────────────────────────────────────────────

export interface ImpactMedia {
  Id: string;
  CampaignId: string;
  AdvertiserName: string;
  Name: string;
  MimeType: string;
  Url: string;
  TrackingLink: string;
  Width: number;
  Height: number;
}

export async function getMedia(campaignId?: string): Promise<ImpactMedia[]> {
  const params: Record<string, string> = { PageSize: "100" };
  if (campaignId) params.CampaignId = campaignId;
  const data = await impactFetch("/Media", params);
  return data.Media ?? [];
}

// ─────────────────────────────────────────────────────────────────────────────
// Summary helper — fetches everything needed for admin dashboard
// ─────────────────────────────────────────────────────────────────────────────

export async function getImpactSummary() {
  const [campaigns, actions] = await Promise.all([
    getCampaigns(),
    getActions(),
  ]);

  // TrackingLinks are already included on each Campaign object
  const trackingLinks = campaigns
    .filter(c => c.TrackingLink)
    .map(c => ({
      Id: c.CampaignId,
      CampaignId: c.CampaignId,
      AdvertiserName: c.AdvertiserName,
      Name: c.CampaignName,
      TrackingLink: c.TrackingLink,
      LandingPageUrl: c.CampaignUrl,
      Status: c.ContractStatus,
    }));

  const totalEarnings = actions
    .filter(a => a.Status === "APPROVED")
    .reduce((sum, a) => sum + (Number(a.Payout) || 0), 0);

  const pendingEarnings = actions
    .filter(a => a.Status === "PENDING")
    .reduce((sum, a) => sum + (Number(a.Payout) || 0), 0);

  return {
    campaigns,
    trackingLinks,
    actions,
    stats: {
      totalCampaigns: campaigns.length,
      activeCampaigns: campaigns.filter(c => c.ContractStatus === "Active").length,
      pendingCampaigns: campaigns.filter(c => c.ContractStatus === "Pending" || c.ContractStatus === "Applied").length,
      totalEarnings,
      pendingEarnings,
      totalActions: actions.length,
    },
  };
}
