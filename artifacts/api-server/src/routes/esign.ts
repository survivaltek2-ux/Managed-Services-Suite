import { Router, type IRouter, type Request, type Response } from "express";
import { db, documentsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { requireAdmin, type AuthRequest } from "../middlewares/auth.js";
import {
  createAndSendEnvelope,
  getEnvelopeStatus,
  downloadCompletedPdf,
  verifyWebhookSignature,
  isSignwellConfigured,
  type EsignSigner,
} from "../lib/esign.js";
import { sendEsignNotification } from "../lib/email.js";

const router: IRouter = Router();

// ─── Admin: Check SignWell configuration ──────────────────────────────────────

router.get("/admin/esign/status", requireAdmin, (_req, res) => {
  res.json({
    configured: isSignwellConfigured(),
    testMode: process.env.SIGNWELL_TEST_MODE !== "false",
    provider: "SignWell",
  });
});

// ─── Admin: List envelopes ────────────────────────────────────────────────────

router.get("/admin/esign/envelopes", requireAdmin, async (_req, res) => {
  try {
    const rows = await db.execute(sql`
      SELECT e.*,
             d.name        AS document_name,
             d.filename    AS document_filename,
             p.company_name AS partner_company
      FROM esign_envelopes e
      LEFT JOIN documents  d ON e.document_id  = d.id
      LEFT JOIN partners   p ON e.partner_id   = p.id
      ORDER BY e.created_at DESC
    `);
    res.json((rows as any[]).map(parseEnvelope));
  } catch (err) {
    console.error("[esign] list error:", err);
    res.status(500).json({ error: "server_error", message: "Failed to list envelopes" });
  }
});

// ─── Admin: Get single envelope ───────────────────────────────────────────────

router.get("/admin/esign/envelopes/:id", requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const rows = await db.execute(sql`
      SELECT e.*,
             d.name        AS document_name,
             d.filename    AS document_filename,
             p.company_name AS partner_company
      FROM esign_envelopes e
      LEFT JOIN documents  d ON e.document_id  = d.id
      LEFT JOIN partners   p ON e.partner_id   = p.id
      WHERE e.id = ${id}
      LIMIT 1
    `);
    if (!(rows as any[]).length) {
      res.status(404).json({ error: "not_found" });
      return;
    }
    res.json(parseEnvelope((rows as any[])[0]));
  } catch (err) {
    console.error("[esign] get error:", err);
    res.status(500).json({ error: "server_error", message: "Failed to get envelope" });
  }
});

// ─── Admin: Send document for signature ──────────────────────────────────────

router.post("/admin/esign/envelopes", requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    if (!isSignwellConfigured()) {
      res.status(503).json({
        error: "not_configured",
        message: "SignWell API key not configured. Add SIGNWELL_API_KEY to your secrets.",
      });
      return;
    }

    const { documentId, signers, subject, message, initiatedByEmail, initiatedByName } = req.body;

    if (!documentId || !signers || !Array.isArray(signers) || signers.length === 0) {
      res.status(400).json({ error: "validation_error", message: "documentId and signers are required" });
      return;
    }

    for (const s of signers) {
      if (!s.name || !s.email) {
        res.status(400).json({ error: "validation_error", message: "Each signer needs name and email" });
        return;
      }
    }

    // Fetch document
    const [doc] = await db.select().from(documentsTable).where(eq(documentsTable.id, documentId)).limit(1);
    if (!doc) {
      res.status(404).json({ error: "not_found", message: "Document not found" });
      return;
    }

    // Build signer list with stable IDs and signing order
    const esignSigners: EsignSigner[] = signers.map((s: any, i: number) => ({
      id: `signer_${i + 1}`,
      name: s.name,
      email: s.email,
      role: s.role || undefined,
      signingOrder: s.signingOrder ?? i + 1,
    }));

    const envelopeResult = await createAndSendEnvelope({
      documentName: doc.name,
      fileBase64: doc.content,
      fileName: doc.filename,
      signers: esignSigners,
      subject: subject || `Please sign: ${doc.name}`,
      message: message || undefined,
    });

    // Initial timeline event
    const initialEvents = [
      {
        type: "document_sent",
        timestamp: new Date().toISOString(),
        recipientEmail: null,
        recipientName: null,
      },
    ];

    // Store in DB
    await db.execute(sql`
      INSERT INTO esign_envelopes
        (document_id, partner_id, provider_envelope_id, document_name, signers_json,
         status, subject, message, initiated_by_email, initiated_by_name,
         events_json, sent_at)
      VALUES
        (${documentId}, ${doc.partnerId ?? null},
         ${envelopeResult.providerEnvelopeId}, ${doc.name},
         ${JSON.stringify(esignSigners)}, ${"sent"},
         ${subject || `Please sign: ${doc.name}`},
         ${message || null},
         ${initiatedByEmail || null}, ${initiatedByName || null},
         ${JSON.stringify(initialEvents)},
         NOW())
    `);

    const inserted = await db.execute(sql`
      SELECT id FROM esign_envelopes
      WHERE provider_envelope_id = ${envelopeResult.providerEnvelopeId}
      LIMIT 1
    `);

    res.status(201).json({
      id: (inserted as any[])[0]?.id,
      providerEnvelopeId: envelopeResult.providerEnvelopeId,
      status: envelopeResult.status,
    });
  } catch (err: any) {
    console.error("[esign] send error:", err);
    res.status(500).json({ error: "server_error", message: err.message || "Failed to send envelope" });
  }
});

// ─── Admin: Refresh envelope status from provider ─────────────────────────────
// Appends a status-refresh event to events_json; never overwrites existing history.

router.post("/admin/esign/envelopes/:id/refresh", requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const rows = await db.execute(sql`SELECT * FROM esign_envelopes WHERE id = ${id} LIMIT 1`);
    const env = (rows as any[])[0];
    if (!env) { res.status(404).json({ error: "not_found" }); return; }

    if (!isSignwellConfigured()) {
      res.status(503).json({ error: "not_configured", message: "SignWell not configured" });
      return;
    }

    const latest = await getEnvelopeStatus(env.provider_envelope_id);

    // Append to the existing event log — never overwrite
    const existingEvents: any[] = tryParse(env.events_json, []);
    const previousStatus: string = env.status;

    if (latest.status !== previousStatus) {
      existingEvents.push({
        type: `status_changed_to_${latest.status}`,
        timestamp: new Date().toISOString(),
        previousStatus,
        newStatus: latest.status,
        recipientEmail: null,
        recipientName: null,
        source: "manual_refresh",
      });
    }

    // Also surface per-recipient signed/viewed changes as timeline events
    for (const r of latest.recipients) {
      if (r.signedAt && !existingEvents.find(e => e.type === "document_signed" && e.recipientEmail === r.email)) {
        existingEvents.push({
          type: "document_signed",
          timestamp: r.signedAt,
          recipientEmail: r.email,
          recipientName: r.name,
          source: "manual_refresh",
        });
      }
      if (r.viewedAt && !existingEvents.find(e => e.type === "document_viewed" && e.recipientEmail === r.email)) {
        existingEvents.push({
          type: "document_viewed",
          timestamp: r.viewedAt,
          recipientEmail: r.email,
          recipientName: r.name,
          source: "manual_refresh",
        });
      }
    }

    const completedAt = latest.completedAt ? new Date(latest.completedAt) : (env.completed_at || null);

    await db.execute(sql`
      UPDATE esign_envelopes
      SET status       = ${latest.status},
          events_json  = ${JSON.stringify(existingEvents)},
          completed_at = ${completedAt},
          updated_at   = NOW()
      WHERE id = ${id}
    `);

    res.json({ status: latest.status, recipients: latest.recipients });
  } catch (err: any) {
    console.error("[esign] refresh error:", err);
    res.status(500).json({ error: "server_error", message: err.message || "Failed to refresh" });
  }
});

// ─── Webhook: SignWell events ─────────────────────────────────────────────────

router.post("/esign/webhook", async (req: Request, res: Response) => {
  try {
    const webhookSecret = process.env.SIGNWELL_WEBHOOK_SECRET || "";
    const signature = (req.headers["x-signwell-signature"] as string) || "";

    // Use raw body captured by app.ts for accurate HMAC computation
    const rawBody: string = req.rawBody
      ? req.rawBody.toString("utf8")
      : JSON.stringify(req.body);

    if (webhookSecret && !verifyWebhookSignature(rawBody, signature, webhookSecret)) {
      console.warn("[esign webhook] invalid signature");
      res.status(401).json({ error: "invalid_signature" });
      return;
    }

    const payload = req.body;
    const eventType: string = payload.event_type || payload.event || "";
    const doc = payload.document || payload.data?.document || payload;
    const providerEnvelopeId: string = doc.id || "";

    if (!providerEnvelopeId) {
      res.json({ received: true });
      return;
    }

    const rows = await db.execute(sql`
      SELECT * FROM esign_envelopes WHERE provider_envelope_id = ${providerEnvelopeId} LIMIT 1
    `);
    const envelope = (rows as any[])[0];
    if (!envelope) {
      res.json({ received: true });
      return;
    }

    // Map SignWell events to our status
    const statusMap: Record<string, string> = {
      document_completed: "completed",
      document_signed:    "signed",
      document_viewed:    "viewed",
      document_declined:  "declined",
      document_expired:   "expired",
      document_sent:      "sent",
    };
    const newStatus = statusMap[eventType] || envelope.status;

    // Append event to events_json log (append-only)
    const existingEvents: any[] = tryParse(envelope.events_json, []);
    existingEvents.push({
      type: eventType,
      timestamp: new Date().toISOString(),
      recipientEmail: payload.recipient?.email || null,
      recipientName: payload.recipient?.name || null,
      source: "webhook",
    });

    let completedAt = envelope.completed_at;
    let executedDocumentId: number | null = envelope.executed_document_id ?? null;

    if (eventType === "document_completed" && !completedAt) {
      completedAt = new Date();

      // Download executed PDF and store in documents table
      try {
        const pdfBuffer = await downloadCompletedPdf(providerEnvelopeId);
        const base64 = pdfBuffer.toString("base64");
        const originalName = envelope.document_name || "Executed Document";
        const execFilename = `executed_${originalName.replace(/\s+/g, "_")}_${Date.now()}.pdf`;

        const inserted = await db.insert(documentsTable).values({
          name: `[Executed] ${originalName}`,
          description: `Executed copy from SignWell envelope ${providerEnvelopeId}`,
          filename: execFilename,
          mimeType: "application/pdf",
          size: pdfBuffer.length,
          content: base64,
          category: "contract",
          partnerId: envelope.partner_id ?? null,
          uploadedBy: "esign",
          tags: JSON.stringify(["executed", "esigned"]),
        }).returning({ id: documentsTable.id });

        executedDocumentId = inserted[0]?.id ?? null;
      } catch (dlErr) {
        console.error("[esign webhook] PDF download failed:", dlErr);
      }

      // Notify the initiating admin
      if (envelope.initiated_by_email) {
        try {
          await sendEsignNotification({
            to: envelope.initiated_by_email,
            adminName: envelope.initiated_by_name || "Admin",
            documentName: envelope.document_name || "Document",
            envelopeId: envelope.id,
            eventType: "completed",
          });
        } catch (emailErr) {
          console.error("[esign webhook] notification email failed:", emailErr);
        }
      }
    }

    if (eventType === "document_declined" && envelope.initiated_by_email) {
      try {
        await sendEsignNotification({
          to: envelope.initiated_by_email,
          adminName: envelope.initiated_by_name || "Admin",
          documentName: envelope.document_name || "Document",
          envelopeId: envelope.id,
          eventType: "declined",
          recipientName: payload.recipient?.name,
        });
      } catch (emailErr) {
        console.error("[esign webhook] decline email failed:", emailErr);
      }
    }

    await db.execute(sql`
      UPDATE esign_envelopes
      SET status               = ${newStatus},
          events_json          = ${JSON.stringify(existingEvents)},
          completed_at         = ${completedAt || null},
          executed_document_id = ${executedDocumentId},
          updated_at           = NOW()
      WHERE id = ${envelope.id}
    `);

    res.json({ received: true });
  } catch (err) {
    console.error("[esign webhook] error:", err);
    res.status(500).json({ error: "server_error" });
  }
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseEnvelope(row: any) {
  return {
    ...row,
    signers: tryParse(row.signers_json, []),
    events: tryParse(row.events_json, []),
  };
}

function tryParse(str: string | null, fallback: any) {
  try { return JSON.parse(str || ""); } catch { return fallback; }
}

export default router;
