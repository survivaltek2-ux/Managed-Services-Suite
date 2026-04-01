/**
 * Affiliate Commission Configuration — Siebert Services
 *
 * All rates based on publicly documented affiliate programs (2025-2026).
 * Paste your real affiliate links into the `affiliateUrl` fields once approved.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * HOW TO ACTIVATE AFFILIATE LINKS
 * ─────────────────────────────────────────────────────────────────────────────
 * 1. Sign up at the relevant network (CJ Affiliate, Impact, PartnerStack, etc.)
 * 2. Apply to each brand's program individually
 * 3. Once approved, generate a deep link to the brand's checkout/order page
 * 4. Paste that link into the `affiliateUrl` field below (replace null)
 *
 * Key affiliate networks used here:
 * - CJ Affiliate:   https://www.cj.com
 * - Impact:         https://impact.com
 * - PartnerStack:   https://partnerstack.com
 * - FlexOffers:     https://www.flexoffers.com
 * ─────────────────────────────────────────────────────────────────────────────
 */

export interface CommissionEntry {
  rateUsd: number;
  commissionType: "per_sale" | "per_lead" | "percent_sale" | "negotiated";
  // For percent_sale type, the approximate $ value at an assumed avg order
  percentRate?: string;
  network: string;
  affiliateSignupUrl: string;
  affiliateUrl: string | null;
  notes: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// RESIDENTIAL ISP — sorted by rateUsd descending (used for provider card order)
// ─────────────────────────────────────────────────────────────────────────────

export const RESIDENTIAL_COMMISSIONS: Record<string, CommissionEntry> = {
  xfinity: {
    rateUsd: 135,
    commissionType: "per_sale",
    network: "CJ Affiliate",
    affiliateSignupUrl: "https://www.cj.com",
    affiliateUrl: null,
    notes: "Up to $135/activated order. 30-day cookie. Apply at CJ Affiliate.",
  },
  comcast: {
    rateUsd: 135,
    commissionType: "per_sale",
    network: "CJ Affiliate",
    affiliateSignupUrl: "https://www.cj.com",
    affiliateUrl: null,
    notes: "Same program as Xfinity. Apply at CJ Affiliate.",
  },
  "at&t": {
    rateUsd: 100,
    commissionType: "per_sale",
    network: "CJ Affiliate",
    affiliateSignupUrl: "https://www.cj.com",
    affiliateUrl: null,
    notes: "Up to $100/sale. 30-day cookie. Also available via FlexOffers.",
  },
  att: {
    rateUsd: 100,
    commissionType: "per_sale",
    network: "CJ Affiliate",
    affiliateSignupUrl: "https://www.cj.com",
    affiliateUrl: null,
    notes: "AT&T alias. Up to $100/sale.",
  },
  spectrum: {
    rateUsd: 92,
    commissionType: "per_sale",
    network: "CJ Affiliate",
    affiliateSignupUrl: "https://www.cj.com",
    affiliateUrl: null,
    notes: "$65–$120/sale range; midpoint estimate. Apply at CJ Affiliate.",
  },
  charter: {
    rateUsd: 92,
    commissionType: "per_sale",
    network: "CJ Affiliate",
    affiliateSignupUrl: "https://www.cj.com",
    affiliateUrl: null,
    notes: "Charter/Spectrum brand. Same program.",
  },
  verizon: {
    rateUsd: 75,
    commissionType: "per_sale",
    network: "CJ Affiliate / FlexOffers",
    affiliateSignupUrl: "https://www.cj.com",
    affiliateUrl: null,
    notes: "Up to $75/sale. Available on CJ Affiliate and FlexOffers.",
  },
  frontier: {
    rateUsd: 37,
    commissionType: "per_sale",
    network: "CJ Affiliate",
    affiliateSignupUrl: "https://www.cj.com",
    affiliateUrl: null,
    notes: "$20–$55/item range; midpoint estimate. Apply at CJ Affiliate.",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// BUSINESS CONNECTIVITY — carrier circuits and enterprise internet
// ─────────────────────────────────────────────────────────────────────────────

export const BUSINESS_CONNECTIVITY_COMMISSIONS: Record<string, CommissionEntry> = {
  carrierfinder: {
    rateUsd: 0,
    commissionType: "negotiated",
    network: "CarrierFinder Partner Program",
    affiliateSignupUrl: "https://www.carrierfinder.com/partner",
    affiliateUrl: null,
    notes:
      "Commission paid after circuit installed and billing starts. Contact partnersupport@carrierfinder.com. Typical business circuit commissions: $200–$2,000+ per deal.",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// VOIP & BUSINESS COMMUNICATIONS
// Sign up at the networks noted, then apply to each brand.
// ─────────────────────────────────────────────────────────────────────────────

export const VOIP_COMMISSIONS: Record<string, CommissionEntry> = {
  ringcentral: {
    rateUsd: 100,
    commissionType: "per_sale",
    network: "CJ Affiliate / Impact",
    affiliateSignupUrl: "https://www.cj.com",
    affiliateUrl: null,
    notes:
      "Up to $100/sale (paid plan) or $25/lead (free trial). 30-day cookie. Search 'RingCentral' in CJ marketplace.",
  },
  nextiva: {
    rateUsd: 50,
    commissionType: "per_sale",
    network: "PartnerStack",
    affiliateSignupUrl: "https://partnerstack.com",
    affiliateUrl: null,
    notes:
      "Commission varies by plan. Apply via PartnerStack or Nextiva's partner page at nextiva.com/partners.",
  },
  vonage: {
    rateUsd: 50,
    commissionType: "per_sale",
    network: "CJ Affiliate",
    affiliateSignupUrl: "https://www.cj.com",
    affiliateUrl: null,
    notes:
      "Business VoIP plans. Commission varies; search 'Vonage' in CJ marketplace.",
  },
  talkroute: {
    rateUsd: 175,
    commissionType: "per_sale",
    network: "Direct (Talkroute affiliate program)",
    affiliateSignupUrl: "https://talkroute.com/affiliate-program/",
    affiliateUrl: null,
    notes:
      "$100–$250/sale depending on plan. Self-managed program at talkroute.com. High commission for a VoIP brand.",
  },
  grasshopper: {
    rateUsd: 40,
    commissionType: "per_sale",
    network: "CJ Affiliate",
    affiliateSignupUrl: "https://www.cj.com",
    affiliateUrl: null,
    notes:
      "Virtual phone system for small business. Search 'Grasshopper' in CJ marketplace.",
  },
  ooma: {
    rateUsd: 50,
    commissionType: "per_sale",
    network: "FlexOffers",
    affiliateSignupUrl: "https://www.flexoffers.com",
    affiliateUrl: null,
    notes:
      "Business and home VoIP. Apply via FlexOffers.",
  },
  "8x8": {
    rateUsd: 100,
    commissionType: "per_sale",
    network: "Direct (8x8 ReferTo8 Program)",
    affiliateSignupUrl: "https://www.8x8.com/partners",
    affiliateUrl: null,
    notes:
      "$100/qualified sale. 8x8's ReferTo8 referral program. UCaaS + contact center — good MSP fit. Apply at 8x8.com/partners.",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// CYBERSECURITY & ENDPOINT PROTECTION
// ─────────────────────────────────────────────────────────────────────────────

export const CYBERSECURITY_COMMISSIONS: Record<string, CommissionEntry> = {
  malwarebytes: {
    rateUsd: 0,
    commissionType: "percent_sale",
    percentRate: "30–40%",
    network: "Impact / Direct",
    affiliateSignupUrl: "https://www.malwarebytes.com/affiliate",
    affiliateUrl: null,
    notes:
      "30–40% per sale (sliding scale). Great for recommending to small business clients. Apply at malwarebytes.com/affiliate.",
  },
  acronis: {
    rateUsd: 0,
    commissionType: "percent_sale",
    percentRate: "15–25%",
    network: "Direct (Acronis Partner Program)",
    affiliateSignupUrl: "https://www.acronis.com/en-us/partners/",
    affiliateUrl: null,
    notes:
      "15% base, up to 25%+ for top performers. Backup + cyber protection — perfect for MSP upsell. Apply at acronis.com/partners.",
  },
  bitdefender: {
    rateUsd: 0,
    commissionType: "percent_sale",
    percentRate: "20–36%",
    network: "CJ Affiliate",
    affiliateSignupUrl: "https://www.cj.com",
    affiliateUrl: null,
    notes:
      "20% base, up to 36% for top affiliates. B2B and consumer plans. Search 'Bitdefender' in CJ marketplace.",
  },
  kaspersky: {
    rateUsd: 0,
    commissionType: "percent_sale",
    percentRate: "15–20%",
    network: "Impact",
    affiliateSignupUrl: "https://impact.com",
    affiliateUrl: null,
    notes:
      "Business and consumer tiers. Apply at impact.com — search 'Kaspersky'.",
  },
  carbonblack: {
    rateUsd: 0,
    commissionType: "negotiated",
    network: "VMware/Broadcom Partner Program",
    affiliateSignupUrl: "https://www.vmware.com/partners.html",
    affiliateUrl: null,
    notes:
      "Enterprise EDR platform. Commission negotiated through VMware/Broadcom partner program. Best for enterprise clients.",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// VPN & NETWORK SECURITY
// ─────────────────────────────────────────────────────────────────────────────

export const VPN_COMMISSIONS: Record<string, CommissionEntry> = {
  nordvpn: {
    rateUsd: 0,
    commissionType: "percent_sale",
    percentRate: "40–100%",
    network: "Impact",
    affiliateSignupUrl: "https://affiliates.nordvpn.com",
    affiliateUrl: null,
    notes:
      "100% of 1-month plan, 40% of 6-month and 1-year plans, 30% on renewals. Consumer-focused. Apply at affiliates.nordvpn.com.",
  },
  nordlayer: {
    rateUsd: 0,
    commissionType: "percent_sale",
    percentRate: "20–30%",
    network: "Direct (NordLayer Partner Program)",
    affiliateSignupUrl: "https://nordlayer.com/partner-program/",
    affiliateUrl: null,
    notes:
      "Business VPN (NordVPN's B2B product). Recurring commissions on subscriptions. Apply at nordlayer.com/partner-program — better fit than NordVPN for business clients.",
  },
  expressvpn: {
    rateUsd: 36,
    commissionType: "per_sale",
    network: "Impact",
    affiliateSignupUrl: "https://impact.com",
    affiliateUrl: null,
    notes:
      "$13–$36/sale depending on plan. Consumer-grade but popular. Apply at impact.com.",
  },
  privateinternetaccess: {
    rateUsd: 0,
    commissionType: "percent_sale",
    percentRate: "33%",
    network: "CJ Affiliate",
    affiliateSignupUrl: "https://www.cj.com",
    affiliateUrl: null,
    notes:
      "33% per sale. Search 'Private Internet Access' in CJ marketplace.",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// PASSWORD MANAGEMENT & IDENTITY
// ─────────────────────────────────────────────────────────────────────────────

export const PASSWORD_MGMT_COMMISSIONS: Record<string, CommissionEntry> = {
  "1password": {
    rateUsd: 25,
    commissionType: "per_sale",
    network: "PartnerStack",
    affiliateSignupUrl: "https://1password.partnerstack.com",
    affiliateUrl: null,
    notes:
      "$25/sale for individual, higher for Teams/Business plans. Apply at 1password.partnerstack.com.",
  },
  lastpass: {
    rateUsd: 0,
    commissionType: "percent_sale",
    percentRate: "25%",
    network: "Impact",
    affiliateSignupUrl: "https://impact.com",
    affiliateUrl: null,
    notes:
      "25% per sale. Business and personal plans. Apply at impact.com — search 'LastPass'.",
  },
  dashlane: {
    rateUsd: 0,
    commissionType: "percent_sale",
    percentRate: "25%",
    network: "Impact",
    affiliateSignupUrl: "https://impact.com",
    affiliateUrl: null,
    notes:
      "25% per sale. Business-tier plans available. Apply at impact.com — search 'Dashlane'.",
  },
  keeper: {
    rateUsd: 0,
    commissionType: "percent_sale",
    percentRate: "20%",
    network: "CJ Affiliate",
    affiliateSignupUrl: "https://www.cj.com",
    affiliateUrl: null,
    notes:
      "20% per sale. Business and personal plans. Strong enterprise focus. Search 'Keeper Security' in CJ marketplace.",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// BACKUP & CLOUD STORAGE
// ─────────────────────────────────────────────────────────────────────────────

export const BACKUP_COMMISSIONS: Record<string, CommissionEntry> = {
  backblaze: {
    rateUsd: 0,
    commissionType: "percent_sale",
    percentRate: "10–25%",
    network: "CJ Affiliate",
    affiliateSignupUrl: "https://www.cj.com",
    affiliateUrl: null,
    notes:
      "Business Backup + B2 Cloud Storage. 10–25% per sale. Search 'Backblaze' in CJ marketplace.",
  },
  idriveenterprise: {
    rateUsd: 0,
    commissionType: "percent_sale",
    percentRate: "up to 20%",
    network: "FlexOffers / Direct",
    affiliateSignupUrl: "https://www.flexoffers.com",
    affiliateUrl: null,
    notes:
      "IDrive for Business/Enterprise. Good fit for MSP upsell. Apply via FlexOffers.",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// HOME SECURITY — residential and SMB/commercial monitoring
// ─────────────────────────────────────────────────────────────────────────────

export const HOME_SECURITY_COMMISSIONS: Record<string, CommissionEntry> = {
  adt: {
    rateUsd: 200,
    commissionType: "per_sale",
    network: "CJ Affiliate / FlexOffers",
    affiliateSignupUrl: "https://www.adt.com/business/affiliates",
    affiliateUrl: null,
    notes:
      "$200 Visa gift card per confirmed residential sale. Highest flat-rate home security commission available. Search 'ADT' in CJ Affiliate.",
  },
  simplisafe: {
    rateUsd: 75,
    commissionType: "per_sale",
    network: "Impact",
    affiliateSignupUrl: "https://www.simplisafe.com/business/affiliate",
    affiliateUrl: "https://simplisafehomeimprovementpros.sjv.io/c/5136149/1807168/21481",
    notes:
      "No contract required. DIY installation with professional monitoring available. Easy for customers to setup and manage.",
  },
  ring: {
    rateUsd: 0,
    commissionType: "percent_sale",
    percentRate: "~10%",
    network: "Amazon Associates",
    affiliateSignupUrl: "https://affiliate-program.amazon.com",
    affiliateUrl: null,
    notes:
      "~10% per sale via Amazon Associates (Ring is Amazon-owned). Good for bundling with ISP recommendations. Apply at affiliate-program.amazon.com.",
  },
  vivint: {
    rateUsd: 150,
    commissionType: "per_sale",
    network: "CJ Affiliate",
    affiliateSignupUrl: "https://www.vivint.com/business/affiliates",
    affiliateUrl: null,
    notes:
      "Smart home + professional monitoring. $100–$200/sale range. Search 'Vivint' in CJ Affiliate.",
  },
  brinks: {
    rateUsd: 100,
    commissionType: "per_sale",
    network: "CJ Affiliate",
    affiliateSignupUrl: "https://www.brinks.com/business/affiliate-partners",
    affiliateUrl: null,
    notes:
      "Brinks Home Security. Up to $100/sale. Search 'Brinks Home Security' in CJ Affiliate.",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// CONSUMER ANTIVIRUS & INTERNET SECURITY
// Great cross-sell alongside ISP recommendations.
// ─────────────────────────────────────────────────────────────────────────────

export const CONSUMER_ANTIVIRUS_COMMISSIONS: Record<string, CommissionEntry> = {
  norton360: {
    rateUsd: 0,
    commissionType: "percent_sale",
    percentRate: "25–50%",
    network: "CJ Affiliate / Impact",
    affiliateSignupUrl: "https://www.cj.com",
    affiliateUrl: null,
    notes:
      "25% base on CJ, up to 50% on Impact for top publishers. Norton 360 + LifeLock bundles available. Search 'Norton' in CJ marketplace.",
  },
  mcafee: {
    rateUsd: 0,
    commissionType: "percent_sale",
    percentRate: "25%",
    network: "CJ Affiliate",
    affiliateSignupUrl: "https://www.mcafee.com/business/partners",
    affiliateUrl: null,
    notes:
      "25% per sale OR $10 flat (varies by deal). Consumer and family plans. Search 'McAfee' in CJ Affiliate.",
  },
  avast: {
    rateUsd: 0,
    commissionType: "percent_sale",
    percentRate: "25–40%",
    network: "CJ Affiliate",
    affiliateSignupUrl: "https://www.avast.com/business/affiliates",
    affiliateUrl: null,
    notes:
      "25% base, up to 40% at higher volumes. Consumer antivirus — high conversion alongside ISP/internet plans. Search 'Avast' in CJ Affiliate.",
  },
  avgantivirus: {
    rateUsd: 0,
    commissionType: "percent_sale",
    percentRate: "25–40%",
    network: "CJ Affiliate",
    affiliateSignupUrl: "https://www.cj.com",
    affiliateUrl: null,
    notes:
      "AVG (owned by Avast/Gen Digital). Same commission structure. Search 'AVG' in CJ Affiliate.",
  },
  totalav: {
    rateUsd: 0,
    commissionType: "percent_sale",
    percentRate: "40–70%",
    network: "CJ Affiliate / Direct",
    affiliateSignupUrl: "https://www.totalav.com/affiliate",
    affiliateUrl: null,
    notes:
      "One of the highest consumer antivirus commission rates (up to 70%). Budget-friendly product that converts well. Search 'TotalAV' in CJ Affiliate.",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// IDENTITY THEFT PROTECTION
// High-value sell alongside antivirus + ISP recommendations.
// ─────────────────────────────────────────────────────────────────────────────

export const IDENTITY_PROTECTION_COMMISSIONS: Record<string, CommissionEntry> = {
  lifelock: {
    rateUsd: 0,
    commissionType: "percent_sale",
    percentRate: "up to 20%",
    network: "CJ Affiliate",
    affiliateSignupUrl: "https://www.lifelock.com/business/affiliates",
    affiliateUrl: null,
    notes:
      "Up to 20% per sale (LifeLock/Norton brand). Annual plans yield the highest commission. Search 'LifeLock' in CJ Affiliate.",
  },
  aura: {
    rateUsd: 95,
    commissionType: "per_sale",
    network: "Impact",
    affiliateSignupUrl: "https://www.aura.com/business/affiliates",
    affiliateUrl: null,
    notes:
      "$65–$125 per qualified enrollment (using midpoint $95). All-in-one ID theft + antivirus + VPN. Apply at impact.com — search 'Aura'.",
  },
  identityguard: {
    rateUsd: 0,
    commissionType: "percent_sale",
    percentRate: "15–20%",
    network: "CJ Affiliate",
    affiliateSignupUrl: "https://www.cj.com",
    affiliateUrl: null,
    notes:
      "Identity Guard (Aura-owned brand). 15–20% per sale. Consumer and family plans. Search 'Identity Guard' in CJ Affiliate.",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// CLOUD PRODUCTIVITY (Microsoft 365, Google Workspace)
// Per-user commissions — ideal for business client upsell.
// ─────────────────────────────────────────────────────────────────────────────

export const CLOUD_PRODUCTIVITY_COMMISSIONS: Record<string, CommissionEntry> = {
  microsoft365: {
    rateUsd: 10,
    commissionType: "per_sale",
    network: "Microsoft Affiliate Program (CJ Affiliate)",
    affiliateSignupUrl: "https://www.microsoft.com/en-us/partners",
    affiliateUrl: null,
    notes:
      "$10/annual signup, $5/monthly signup (flat per-account, not per-user). Search 'Microsoft' in CJ Affiliate. Also consider Microsoft CSP (Cloud Solution Provider) reseller program for higher ongoing revenue.",
  },
  googleworkspace: {
    rateUsd: 13,
    commissionType: "per_sale",
    network: "CJ Affiliate",
    affiliateSignupUrl: "https://workspace.google.com/partners",
    affiliateUrl: null,
    notes:
      "$9–$18 per new user (Business Starter $9, Standard $18). Scales well for business clients. Search 'Google Workspace' in CJ Affiliate. Also consider becoming a Google Workspace Reseller.",
  },
  dropboxbusiness: {
    rateUsd: 0,
    commissionType: "percent_sale",
    percentRate: "15–25%",
    network: "Impact",
    affiliateSignupUrl: "https://impact.com",
    affiliateUrl: null,
    notes:
      "Dropbox Business and Plus plans. 15–25% per sale. Apply at impact.com — search 'Dropbox'.",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// WEB HOSTING & DOMAINS
// High flat commissions; good for residential/small business clients.
// ─────────────────────────────────────────────────────────────────────────────

export const WEB_HOSTING_COMMISSIONS: Record<string, CommissionEntry> = {
  bluehost: {
    rateUsd: 65,
    commissionType: "per_sale",
    network: "CJ Affiliate / Impact",
    affiliateSignupUrl: "https://www.bluehost.com/affiliates",
    affiliateUrl: null,
    notes:
      "$65/sale base, tiered higher at volume. Popular consumer/SMB host. Search 'Bluehost' in CJ Affiliate.",
  },
  siteground: {
    rateUsd: 50,
    commissionType: "per_sale",
    network: "Direct (SiteGround Affiliate Program)",
    affiliateSignupUrl: "https://www.siteground.com/affiliates",
    affiliateUrl: null,
    notes:
      "$50–$100/sale (tiered by volume). Strong brand and good conversions. Apply at siteground.com/affiliates.",
  },
  hostgator: {
    rateUsd: 65,
    commissionType: "per_sale",
    network: "CJ Affiliate / Impact",
    affiliateSignupUrl: "https://www.hostgator.com/affiliates",
    affiliateUrl: null,
    notes:
      "$65/sale base. Budget-friendly hosting — strong consumer market appeal. Search 'HostGator' in CJ Affiliate.",
  },
  godaddy: {
    rateUsd: 0,
    commissionType: "percent_sale",
    percentRate: "15%",
    network: "CJ Affiliate",
    affiliateSignupUrl: "https://www.godaddy.com/affiliates",
    affiliateUrl: null,
    notes:
      "15% per sale on hosting, domains, and add-ons. Massive brand recognition. Search 'GoDaddy' in CJ Affiliate.",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// LEGACY ALIAS (kept for backward compat)
// ─────────────────────────────────────────────────────────────────────────────
export const BUSINESS_COMMISSIONS = BUSINESS_CONNECTIVITY_COMMISSIONS;

// ─────────────────────────────────────────────────────────────────────────────
// LOOKUP HELPERS
// ─────────────────────────────────────────────────────────────────────────────

export function lookupResidentialCommission(brandName: string): CommissionEntry | null {
  const key = brandName.toLowerCase().trim();
  if (RESIDENTIAL_COMMISSIONS[key]) return RESIDENTIAL_COMMISSIONS[key];
  for (const [k, entry] of Object.entries(RESIDENTIAL_COMMISSIONS)) {
    if (key.includes(k) || k.includes(key)) return entry;
  }
  return null;
}

export function getResidentialCommissionRate(brandName: string): number {
  return lookupResidentialCommission(brandName)?.rateUsd ?? 0;
}

/**
 * All non-ISP affiliate programs in a flat list, sorted by estimated revenue potential.
 * Used for internal reference and admin reporting.
 */
export function getAllServicePrograms(): Array<CommissionEntry & { slug: string; category: string }> {
  const entries: Array<CommissionEntry & { slug: string; category: string }> = [];

  const addCategory = (map: Record<string, CommissionEntry>, category: string) => {
    for (const [slug, entry] of Object.entries(map)) {
      entries.push({ ...entry, slug, category });
    }
  };

  addCategory(VOIP_COMMISSIONS, "VoIP & Communications");
  addCategory(CYBERSECURITY_COMMISSIONS, "Cybersecurity");
  addCategory(VPN_COMMISSIONS, "VPN & Network Security");
  addCategory(PASSWORD_MGMT_COMMISSIONS, "Password Management");
  addCategory(BACKUP_COMMISSIONS, "Backup & Storage");
  addCategory(BUSINESS_CONNECTIVITY_COMMISSIONS, "Business Connectivity");
  addCategory(HOME_SECURITY_COMMISSIONS, "Home Security");
  addCategory(CONSUMER_ANTIVIRUS_COMMISSIONS, "Consumer Antivirus");
  addCategory(IDENTITY_PROTECTION_COMMISSIONS, "Identity Protection");
  addCategory(CLOUD_PRODUCTIVITY_COMMISSIONS, "Cloud Productivity");
  addCategory(WEB_HOSTING_COMMISSIONS, "Web Hosting & Domains");

  return entries.sort((a, b) => b.rateUsd - a.rateUsd);
}
