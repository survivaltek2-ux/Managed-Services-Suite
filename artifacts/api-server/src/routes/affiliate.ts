import { Router, Request, Response } from "express";
import { db, affiliateClicksTable } from "@workspace/db";
import { desc, count, sql } from "drizzle-orm";
import { requireAdmin } from "../middlewares/auth.js";

const router = Router();

/**
 * POST /api/affiliate/click
 * Public endpoint — logs an affiliate button click for first-party analytics.
 * Called by the frontend when a user clicks "Get Started" on a provider card.
 */
router.post("/api/affiliate/click", async (req: Request, res: Response) => {
  try {
    const {
      providerName,
      technology,
      addressSearched,
      stateCode,
      userType,
      sessionId,
      referrerPath,
    } = req.body;

    if (!providerName) {
      return res.status(400).json({ error: "providerName is required" });
    }

    await db.insert(affiliateClicksTable).values({
      providerName: String(providerName).slice(0, 200),
      technology: technology ? String(technology).slice(0, 100) : null,
      addressSearched: addressSearched ? String(addressSearched).slice(0, 500) : null,
      stateCode: stateCode ? String(stateCode).slice(0, 5) : null,
      userType: userType ? String(userType).slice(0, 20) : null,
      sessionId: sessionId ? String(sessionId).slice(0, 100) : null,
      referrerPath: referrerPath ? String(referrerPath).slice(0, 500) : null,
      userAgent: req.headers["user-agent"]?.slice(0, 500) ?? null,
    });

    res.json({ ok: true });
  } catch (err) {
    console.error("[Affiliate Click] Error logging click:", err);
    // Non-critical — don't block the user's flow
    res.json({ ok: true });
  }
});

/**
 * GET /api/admin/affiliate/clicks
 * Admin only — returns click analytics grouped by provider.
 */
router.get("/api/admin/affiliate/clicks", requireAdmin, async (_req: Request, res: Response) => {
  try {
    const [byProvider, byState, recent, total] = await Promise.all([
      // Clicks grouped by provider, last 90 days
      db
        .select({
          providerName: affiliateClicksTable.providerName,
          technology: affiliateClicksTable.technology,
          clicks: count(),
        })
        .from(affiliateClicksTable)
        .where(sql`${affiliateClicksTable.clickedAt} > NOW() - INTERVAL '90 days'`)
        .groupBy(affiliateClicksTable.providerName, affiliateClicksTable.technology)
        .orderBy(desc(count())),

      // Clicks grouped by state, last 90 days
      db
        .select({
          stateCode: affiliateClicksTable.stateCode,
          userType: affiliateClicksTable.userType,
          clicks: count(),
        })
        .from(affiliateClicksTable)
        .where(sql`${affiliateClicksTable.clickedAt} > NOW() - INTERVAL '90 days'`)
        .groupBy(affiliateClicksTable.stateCode, affiliateClicksTable.userType)
        .orderBy(desc(count()))
        .limit(20),

      // 20 most recent individual clicks
      db
        .select()
        .from(affiliateClicksTable)
        .orderBy(desc(affiliateClicksTable.clickedAt))
        .limit(20),

      // All-time total
      db.select({ total: count() }).from(affiliateClicksTable),
    ]);

    res.json({ byProvider, byState, recent, totalAllTime: total[0]?.total ?? 0 });
  } catch (err) {
    console.error("[Affiliate Admin] Error fetching clicks:", err);
    res.status(500).json({ error: "server_error" });
  }
});

export default router;
