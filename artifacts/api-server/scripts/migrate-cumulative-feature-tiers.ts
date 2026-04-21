/**
 * Migration: Progressive cumulative feature tiers
 *
 * Updates the Business and Enterprise pricing tier rows so each tier
 * explicitly includes all features from the tier below, with a visual
 * divider marker ("__divider__:") separating inherited from new features.
 *
 * Run with:  tsx scripts/migrate-cumulative-feature-tiers.ts
 *
 * Safe to run multiple times — uses slug-based WHERE clauses and
 * overwrites only the features / excluded_features columns.
 */

import { db, pricingTiersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const ESSENTIALS_FEATURES = [
  "Business-hours help desk (M–F 8–5)",
  "Remote monitoring & patching",
  "Endpoint antivirus",
  "Microsoft 365 administration",
  "Quarterly health check",
  "Email & phone support",
];

const BUSINESS_FEATURES = [
  ...ESSENTIALS_FEATURES,
  "__divider__:Everything in Essentials, plus:",
  "Extended-hours help desk (7am–8pm)",
  "Endpoint Detection & Response (EDR)",
  "Microsoft 365 + security hardening",
  "Multi-factor authentication rollout",
  "Backup & disaster-recovery monitoring",
  "Quarterly business reviews (vCIO)",
  "On-site dispatch (4 hrs / month, New York only)",
];

const ENTERPRISE_FEATURES = [
  ...ESSENTIALS_FEATURES,
  "Extended-hours help desk (7am–8pm)",
  "Endpoint Detection & Response (EDR)",
  "Microsoft 365 + security hardening",
  "Multi-factor authentication rollout",
  "Backup & disaster-recovery monitoring",
  "Quarterly business reviews (vCIO)",
  "On-site dispatch (4 hrs / month, New York only)",
  "__divider__:Everything in Business, plus:",
  "24/7/365 help desk + emergency line",
  "Full EDR + Managed SOC monitoring",
  "Microsoft 365 E3/E5 management",
  "MFA, conditional access, SSO design",
  "Immutable backup + tested restores",
  "Compliance program (HIPAA, SOC 2, CMMC)",
  "Named vCIO + monthly strategy meetings",
  "Unlimited on-site dispatch (New York only)",
  "Dedicated account team",
];

async function run() {
  console.log("[migrate] Updating Business tier features...");
  const [biz] = await db
    .update(pricingTiersTable)
    .set({
      features: JSON.stringify(BUSINESS_FEATURES),
      excludedFeatures: JSON.stringify([
        "24/7 after-hours support",
        "Dedicated SOC analyst",
        "Compliance program management",
      ]),
    })
    .where(eq(pricingTiersTable.slug, "business"))
    .returning({ id: pricingTiersTable.id, slug: pricingTiersTable.slug });

  if (biz) {
    console.log(`[migrate] Business tier updated (id=${biz.id})`);
  } else {
    console.warn("[migrate] Business tier not found — skipped");
  }

  console.log("[migrate] Updating Enterprise tier features...");
  const [ent] = await db
    .update(pricingTiersTable)
    .set({
      features: JSON.stringify(ENTERPRISE_FEATURES),
      excludedFeatures: JSON.stringify([]),
    })
    .where(eq(pricingTiersTable.slug, "enterprise"))
    .returning({ id: pricingTiersTable.id, slug: pricingTiersTable.slug });

  if (ent) {
    console.log(`[migrate] Enterprise tier updated (id=${ent.id})`);
  } else {
    console.warn("[migrate] Enterprise tier not found — skipped");
  }

  console.log("[migrate] Done.");
  process.exit(0);
}

run().catch((err) => {
  console.error("[migrate] Error:", err);
  process.exit(1);
});
