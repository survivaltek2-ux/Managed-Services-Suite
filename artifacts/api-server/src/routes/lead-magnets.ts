import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { db, leadMagnetSubmissionsTable, leadMagnetSequenceSendsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth, AuthRequest } from "../middlewares/auth.js";
import { sendLeadMagnetSubmission, type LeadMagnetKey, type LeadMagnetPayload } from "../lib/email.js";
import { generateLeadMagnetPdf, type LeadMagnetPdfKey } from "../lib/pdfGenerator.js";
import { ObjectStorageService, ObjectNotFoundError, objectStorageClient } from "../lib/objectStorage.js";
import { randomUUID } from "crypto";
import {
  buildUnsubscribeUrl,
  verifyUnsubscribeToken,
  markUnsubscribed,
  getAllSequencePauseStates,
  setSequencePaused,
  isSequencePaused,
  SEQUENCES,
} from "../lib/leadMagnetSequence.js";

const router: IRouter = Router();
const objectStorage = new ObjectStorageService();

const ALLOWED_MAGNETS = new Set([
  "cybersecurity_assessment",
  "downtime_calculator",
  "hipaa_checklist",
  "buyers_guide",
]);

const PDF_MAGNETS = new Set<LeadMagnetPdfKey>(["hipaa_checklist", "buyers_guide"]);

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

async function uploadPdfToPrivateStorage(buffer: Buffer, filename: string): Promise<string> {
  const privateDir = objectStorage.getPrivateObjectDir();
  const id = randomUUID();
  const fullPath = `${privateDir}${privateDir.endsWith("/") ? "" : "/"}lead-magnets/${id}-${filename}`;
  // parseObjectPath is internal; replicate split here.
  const noLead = fullPath.startsWith("/") ? fullPath.slice(1) : fullPath;
  const [bucketName, ...rest] = noLead.split("/");
  const objectName = rest.join("/");
  const file = objectStorageClient.bucket(bucketName).file(objectName);
  await file.save(buffer, { contentType: "application/pdf", resumable: false });
  // Return entity-style path consistent with normalizeObjectEntityPath
  let entityDir = privateDir;
  if (!entityDir.endsWith("/")) entityDir = `${entityDir}/`;
  const entityId = `lead-magnets/${id}-${filename}`;
  return `/objects/${entityId}`;
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

    const baseUrl = siteBaseUrl(req);
    const unsubscribeUrl = buildUnsubscribeUrl(baseUrl, submission.id);

    // Generate PDF + upload to private storage (only for the two PDF magnets).
    let pdfAttachment: { filename: string; content: Buffer; contentType: string } | undefined;
    if (PDF_MAGNETS.has(submission.magnet as LeadMagnetPdfKey)) {
      try {
        const { buffer, filename } = await generateLeadMagnetPdf(submission.magnet as LeadMagnetPdfKey);
        pdfAttachment = { filename, content: buffer, contentType: "application/pdf" };
        try {
          const storagePath = await uploadPdfToPrivateStorage(buffer, filename);
          await db.update(leadMagnetSubmissionsTable)
            .set({ pdfStoragePath: storagePath })
            .where(eq(leadMagnetSubmissionsTable.id, submission.id));
        } catch (storageErr) {
          console.error("[LeadMagnet] Failed to upload PDF to object storage:", storageErr);
        }
      } catch (pdfErr) {
        console.error("[LeadMagnet] Failed to generate PDF:", pdfErr);
      }
    }

    sendLeadMagnetSubmission({
      id: submission.id,
      magnet: submission.magnet as LeadMagnetKey,
      name: submission.name,
      email: submission.email,
      company: submission.company,
      phone: submission.phone,
      payload: (submission.payload || {}) as LeadMagnetPayload,
      pdfAttachment,
      unsubscribeUrl,
    }, baseUrl)
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

// Public PDF download for the two gated guides. Generates on demand so the
// printable-page CTA + email link both work even if storage upload failed.
router.get("/lead-magnets/:magnet/pdf", async (req: Request, res: Response) => {
  try {
    const magnet = req.params.magnet?.replace(/-/g, "_");
    if (!magnet || !PDF_MAGNETS.has(magnet as LeadMagnetPdfKey)) {
      res.status(404).json({ error: "not_found", message: "Unknown guide" });
      return;
    }
    const { buffer, filename } = await generateLeadMagnetPdf(magnet as LeadMagnetPdfKey);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Length", String(buffer.length));
    res.setHeader("Cache-Control", "private, max-age=300");
    res.send(buffer);
  } catch (err) {
    console.error("Lead magnet PDF error:", err);
    res.status(500).json({ error: "server_error", message: "Failed to generate PDF" });
  }
});


function escHtml(s: string): string {
  return String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function unsubscribePage(message: string, status: "ok" | "error", emailContext?: string | null): string {
  const color = status === "ok" ? "#16a34a" : "#dc2626";
  const safeEmail = emailContext ? `<strong>${escHtml(emailContext)}</strong>` : "";
  const safeMessage = escHtml(message);
  const fullMessage = safeEmail ? safeMessage.replace("[[EMAIL]]", safeEmail) : safeMessage.replace("[[EMAIL]]", "");
  return `<!doctype html><html><head><meta charset="utf-8"><title>Unsubscribe — Siebert Services</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>body{font-family:Inter,Arial,sans-serif;background:#f9fafb;margin:0;padding:0;}
      .wrap{max-width:520px;margin:80px auto;padding:32px;background:#fff;border:1px solid #e5e7eb;border-radius:8px;}
      h1{margin:0 0 12px;font-size:20px;color:#111827;}p{font-size:14px;color:#374151;line-height:1.6;}
      .badge{display:inline-block;padding:6px 10px;border-radius:999px;font-size:12px;font-weight:600;background:${color}20;color:${color};margin-bottom:16px;}
      a{color:#0176d3;}</style></head><body>
    <div class="wrap"><span class="badge">${status === "ok" ? "Unsubscribed" : "Error"}</span>
    <h1>Siebert Services</h1><p>${fullMessage}</p>
    <p style="margin-top:24px;font-size:12px;color:#9ca3af;">Questions? Email <a href="mailto:support@siebertrservices.com">support@siebertrservices.com</a> or call 866-484-9180.</p>
    </div></body></html>`;
}

router.get("/lead-magnets/unsubscribe", async (req, res) => {
  const token = String(req.query.token || "");
  const id = verifyUnsubscribeToken(token);
  if (!id) {
    res.status(400).type("html").send(unsubscribePage("This unsubscribe link is invalid or has expired. Please contact support to be removed.", "error"));
    return;
  }
  const result = await markUnsubscribed(id);
  if (!result.ok) {
    res.status(404).type("html").send(unsubscribePage("We couldn't find that subscription. It may have already been removed.", "error"));
    return;
  }
  const msg = result.email
    ? `You've been unsubscribed from Siebert Services lead-magnet follow-up emails for [[EMAIL]]. You won't receive any further automated messages on the resource you downloaded.`
    : `You've been unsubscribed from Siebert Services lead-magnet follow-up emails. You won't receive any further automated messages on the resource you downloaded.`;
  res.type("html").send(unsubscribePage(msg, "ok", result.email || null));
});

router.post("/lead-magnets/unsubscribe", async (req, res) => {
  const token = String(req.body?.token || req.query.token || "");
  const id = verifyUnsubscribeToken(token);
  if (!id) { res.status(400).json({ error: "invalid_token" }); return; }
  const result = await markUnsubscribed(id);
  if (!result.ok) { res.status(404).json({ error: "not_found" }); return; }
  res.json({ success: true });
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

router.get("/admin/lead-magnets/:id/pdf", requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const [row] = await db.select().from(leadMagnetSubmissionsTable).where(eq(leadMagnetSubmissionsTable.id, id));
    if (!row) {
      res.status(404).json({ error: "not_found" });
      return;
    }

    // Prefer the stored copy so admins see the exact PDF the user received.
    if (row.pdfStoragePath) {
      try {
        const file = await objectStorage.getObjectEntityFile(row.pdfStoragePath);
        const [buffer] = await file.download();
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename="lead-magnet-${row.id}.pdf"`);
        res.send(buffer);
        return;
      } catch (err) {
        if (!(err instanceof ObjectNotFoundError)) {
          console.error("[Admin] PDF fetch error:", err);
        }
      }
    }

    // Fallback: regenerate from the same template.
    if (PDF_MAGNETS.has(row.magnet as LeadMagnetPdfKey)) {
      const { buffer, filename } = await generateLeadMagnetPdf(row.magnet as LeadMagnetPdfKey);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.send(buffer);
      return;
    }
    res.status(404).json({ error: "not_found", message: "No PDF available for this submission" });
  } catch (err) {
    console.error("Admin lead-magnet PDF error:", err);
    res.status(500).json({ error: "server_error", message: "Failed to fetch PDF" });
  }
});

router.get("/admin/lead-magnets/sequences", requireAuth, requireAdmin, async (_req: AuthRequest, res: Response) => {
  try {
    const pauseStates = await getAllSequencePauseStates();
    const summary = (Object.keys(SEQUENCES) as LeadMagnetKey[]).map((magnet) => ({
      magnet,
      paused: pauseStates[magnet] || false,
      steps: SEQUENCES[magnet].map(s => ({ step: s.step, delayDays: s.delayDays, subject: s.subject, intro: s.intro })),
    }));
    res.json(summary);
  } catch (err) {
    console.error("Admin lead-magnets sequences error:", err);
    res.status(500).json({ error: "server_error", message: "Failed to load sequences" });
  }
});

router.patch("/admin/lead-magnets/sequences/:magnet", requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const magnet = req.params.magnet as LeadMagnetKey;
    if (!ALLOWED_MAGNETS.has(magnet)) { res.status(400).json({ error: "invalid_magnet" }); return; }
    const paused = !!req.body?.paused;
    await setSequencePaused(magnet, paused);
    res.json({ magnet, paused: await isSequencePaused(magnet) });
  } catch (err) {
    console.error("Admin lead-magnets pause error:", err);
    res.status(500).json({ error: "server_error", message: "Failed to update sequence" });
  }
});

router.get("/admin/lead-magnets/:id/sequence", requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const sends = await db.select().from(leadMagnetSequenceSendsTable)
      .where(eq(leadMagnetSequenceSendsTable.submissionId, id));
    res.json(sends);
  } catch (err) {
    console.error("Admin lead-magnet sequence sends error:", err);
    res.status(500).json({ error: "server_error", message: "Failed to load sequence sends" });
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
