import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { db, leadMagnetSubmissionsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth, AuthRequest } from "../middlewares/auth.js";
import { sendLeadMagnetSubmission, type LeadMagnetKey, type LeadMagnetPayload } from "../lib/email.js";
import { generateLeadMagnetPdf, type LeadMagnetPdfKey } from "../lib/pdfGenerator.js";
import { ObjectStorageService, ObjectNotFoundError, objectStorageClient } from "../lib/objectStorage.js";
import { randomUUID } from "crypto";

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
      magnet: submission.magnet as LeadMagnetKey,
      name: submission.name,
      email: submission.email,
      company: submission.company,
      phone: submission.phone,
      payload: (submission.payload || {}) as LeadMagnetPayload,
      pdfAttachment,
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
