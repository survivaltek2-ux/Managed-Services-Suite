/**
 * ISP Affiliate Commission Configuration
 *
 * Sources and rates based on publicly documented affiliate programs (2025-2026).
 * Update commission rates here as you negotiate or confirm real rates.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * HOW TO ACTIVATE AFFILIATE LINKS
 * ─────────────────────────────────────────────────────────────────────────────
 * 1. Sign up at CJ Affiliate: https://www.cj.com  (publisher account)
 * 2. Apply to each ISP program (search by brand name in the CJ marketplace)
 * 3. Once approved, generate a deep link to each ISP's order/shopping page
 * 4. Paste those links into the `affiliateUrl` fields below (replace null)
 *
 * Networks:
 * - CJ Affiliate (Commission Junction): https://www.cj.com
 * - FlexOffers: https://www.flexoffers.com
 * - CarrierFinder Partner: https://www.carrierfinder.com/partner
 * ─────────────────────────────────────────────────────────────────────────────
 */

export interface CommissionEntry {
  // Estimated commission in USD per activated sale (or per lead for CPL programs)
  rateUsd: number;
  commissionType: "per_sale" | "per_lead" | "negotiated";
  network: string;
  affiliateSignupUrl: string;
  // Your actual affiliate URL once approved (null until activated)
  affiliateUrl: string | null;
  notes: string;
}

/**
 * RESIDENTIAL affiliate commission config.
 * Providers are matched by brand name (case-insensitive, partial match supported).
 * Sorted by rateUsd descending in code — highest earners shown first.
 */
export const RESIDENTIAL_COMMISSIONS: Record<string, CommissionEntry> = {
  xfinity: {
    rateUsd: 135,
    commissionType: "per_sale",
    network: "CJ Affiliate",
    affiliateSignupUrl: "https://www.cj.com",
    affiliateUrl: null, // Replace with your CJ affiliate URL once approved
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
    notes: "$65-$120/sale range; using midpoint estimate. Apply at CJ Affiliate.",
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
    notes: "$20-$55/item range; using midpoint estimate. Apply at CJ Affiliate.",
  },
};

/**
 * BUSINESS affiliate commission config.
 * CarrierFinder is the recommended platform for business/enterprise leads.
 * Commission rates are negotiated after circuit activation.
 */
export const BUSINESS_COMMISSIONS: Record<string, CommissionEntry> = {
  carrierfinder: {
    rateUsd: 0, // Negotiated per deal; can be hundreds to thousands per circuit
    commissionType: "negotiated",
    network: "CarrierFinder Partner Program",
    affiliateSignupUrl: "https://www.carrierfinder.com/partner",
    affiliateUrl: null, // Set your CarrierFinder referral URL once registered
    notes:
      "Commission paid after circuit installed and billing starts. Contact partnersupport@carrierfinder.com for rates. Typical telecom business circuit commissions range $200-$2000+ per deal.",
  },
};

/**
 * Look up the commission entry for a given brand name.
 * Returns null if no match found.
 */
export function lookupResidentialCommission(brandName: string): CommissionEntry | null {
  const key = brandName.toLowerCase().trim();
  // Exact match first
  if (RESIDENTIAL_COMMISSIONS[key]) return RESIDENTIAL_COMMISSIONS[key];
  // Partial match
  for (const [k, entry] of Object.entries(RESIDENTIAL_COMMISSIONS)) {
    if (key.includes(k) || k.includes(key)) return entry;
  }
  return null;
}

/**
 * Get estimated commission rate for a brand name (0 if unknown).
 * Used for sorting providers by revenue potential.
 */
export function getResidentialCommissionRate(brandName: string): number {
  return lookupResidentialCommission(brandName)?.rateUsd ?? 0;
}
