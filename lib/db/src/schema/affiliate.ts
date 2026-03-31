import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";

/**
 * Tracks every click on an ISP affiliate "Get Started" button.
 * Used for first-party analytics before CJ Affiliate confirms conversions.
 */
export const affiliateClicksTable = pgTable("affiliate_clicks", {
  id: serial("id").primaryKey(),
  // Provider clicked (e.g. "Xfinity", "AT&T")
  providerName: text("provider_name").notNull(),
  // Technology type (e.g. "Fiber", "Cable")
  technology: text("technology"),
  // Address the user searched (full matched address string)
  addressSearched: text("address_searched"),
  // State code derived from the searched address (e.g. "TX")
  stateCode: text("state_code"),
  // Flow: "home" or "business"
  userType: text("user_type"),
  // Anonymous session identifier (from cookie or generated per-visit)
  sessionId: text("session_id"),
  // Referring page path
  referrerPath: text("referrer_path"),
  // User agent for device/browser breakdown
  userAgent: text("user_agent"),
  clickedAt: timestamp("clicked_at").notNull().defaultNow(),
});

export type AffiliateClick = typeof affiliateClicksTable.$inferSelect;
export type NewAffiliateClick = typeof affiliateClicksTable.$inferInsert;
