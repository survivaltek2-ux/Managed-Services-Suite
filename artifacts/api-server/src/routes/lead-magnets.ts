import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { db, leadMagnetSubmissionsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth, AuthRequest } from "../middlewares/auth.js";
import { sendLeadMagnetSubmission, type LeadMagnetKey, type LeadMagnetPayload } from "../lib/email.js";

const router: IRouter = Router();

const ALLOWED_MAGNETS = new Set([
  "cybersecurity_assessment",
  "downtime_calculator",
  "hipaa_checklist",
  "buyers_guide",
]);

function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.userRole !== "admin") {
    res.status(403).json({ error: "forbidden", message: "Admin access required" });
    return;
  }
  next();
}

function siteBaseUrl(req: Request): string {
  const explicit = process.env.PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  const host = req.get("host") || "siebertrservices.com";
  const proto = req.get("x-forwarded-proto") || "https";
  return `${proto}://${host}`;
}

router.post("/lead-magnets/submit", async (req, res) => {
  try {
    const { magnet, name, email, company, phone, payload, source } = req.body || {};
    if (!magnet || !ALLOWED_MAGNETS.has(magnet)) {
      res.status(400).json({ error: "validation_error", message: "valid magnet is required" });
      return;
    }
    if (!name || !email) {
      res.status(400).json({ error: "validation_error", message: "name and email are required" });
      return;
    }

    const safePayload: LeadMagnetPayload = (payload && typeof payload === "object") ? payload as LeadMagnetPayload : {};
    const [submission] = await db.insert(leadMagnetSubmissionsTable).values({
      magnet: magnet as LeadMagnetKey,
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      company: company ? String(company).trim() : null,
      phone: phone ? String(phone).trim() : null,
      payload: safePayload,
      source: source ? String(source).slice(0, 200) : null,
    }).returning();

    sendLeadMagnetSubmission({
      magnet: submission.magnet as LeadMagnetKey,
      name: submission.name,
      email: submission.email,
      company: submission.company,
      phone: submission.phone,
      payload: (submission.payload || {}) as LeadMagnetPayload,
    }, siteBaseUrl(req))
      .then(async () => {
        await db.update(leadMagnetSubmissionsTable)
          .set({ emailSent: "sent" })
          .where(eq(leadMagnetSubmissionsTable.id, submission.id));
      })
      .catch(async (err) => {
        console.error("[Email] Lead magnet send error:", err);
        await db.update(leadMagnetSubmissionsTable)
          .set({ emailSent: "failed" })
          .where(eq(leadMagnetSubmissionsTable.id, submission.id))
          .catch(() => {});
      });

    res.status(201).json({
      id: submission.id,
      magnet: submission.magnet,
      thankYouPath: `/resources/${magnet.replace(/_/g, "-")}/thanks`,
    });
  } catch (err) {
    console.error("Lead magnet submit error:", err);
    res.status(500).json({ error: "server_error", message: "Failed to submit. Please try again." });
  }
});

router.get("/admin/lead-magnets", requireAuth, requireAdmin, async (_req: AuthRequest, res: Response) => {
  try {
    const rows = await db.select().from(leadMagnetSubmissionsTable).orderBy(desc(leadMagnetSubmissionsTable.createdAt));
    res.json(rows);
  } catch (err) {
    console.error("Admin lead-magnets error:", err);
    res.status(500).json({ error: "server_error", message: "Failed to load lead magnet submissions" });
  }
});

router.delete("/admin/lead-magnets/:id", requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    await db.delete(leadMagnetSubmissionsTable).where(eq(leadMagnetSubmissionsTable.id, id));
    res.json({ success: true });
  } catch (err) {
    console.error("Delete lead-magnet error:", err);
    res.status(500).json({ error: "server_error", message: "Failed to delete submission" });
  }
});

export default router;
