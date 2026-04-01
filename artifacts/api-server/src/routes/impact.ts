import { Router, Request, Response } from "express";
import { requireAdmin } from "../middlewares/auth.js";
import {
  getCampaigns,
  getTrackingLinks,
  getActions,
  getImpactSummary,
} from "../services/impact.js";

const router = Router();

/**
 * GET /api/admin/impact/status
 * Quick connection test — returns credential status and basic account info.
 */
router.get("/admin/impact/status", requireAdmin, async (_req: Request, res: Response) => {
  try {
    const campaigns = await getCampaigns();
    res.json({
      connected: true,
      accountSid: process.env.IMPACT_ACCOUNT_SID,
      totalCampaigns: campaigns.length,
      activeCampaigns: campaigns.filter(c => c.ContractStatus === "Active").length,
      pendingCampaigns: campaigns.filter(c => c.ContractStatus === "Pending" || c.ContractStatus === "Applied").length,
    });
  } catch (err: any) {
    res.status(500).json({ connected: false, error: err.message });
  }
});

/**
 * GET /api/admin/impact/campaigns
 * All campaigns (programs) the account is enrolled in or has applied to.
 */
router.get("/admin/impact/campaigns", requireAdmin, async (_req: Request, res: Response) => {
  try {
    const campaigns = await getCampaigns();
    res.json({ campaigns });
  } catch (err: any) {
    console.error("[Impact] Campaigns error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/admin/impact/tracking-links
 * All approved tracking/affiliate links ready to use.
 */
router.get("/admin/impact/tracking-links", requireAdmin, async (_req: Request, res: Response) => {
  try {
    const trackingLinks = await getTrackingLinks();
    res.json({ trackingLinks });
  } catch (err: any) {
    console.error("[Impact] Tracking links error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/admin/impact/actions
 * Conversion events (clicks → confirmed commissions).
 * Optional query params: startDate, endDate (YYYY-MM-DD), status (APPROVED|PENDING|REVERSED)
 */
router.get("/admin/impact/actions", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, status } = req.query as Record<string, string>;
    const actions = await getActions({ startDate, endDate, status });
    res.json({ actions });
  } catch (err: any) {
    console.error("[Impact] Actions error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/admin/impact/summary
 * Full dashboard summary: campaigns + tracking links + 30-day earnings.
 */
router.get("/admin/impact/summary", requireAdmin, async (_req: Request, res: Response) => {
  try {
    const summary = await getImpactSummary();
    res.json(summary);
  } catch (err: any) {
    console.error("[Impact] Summary error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
