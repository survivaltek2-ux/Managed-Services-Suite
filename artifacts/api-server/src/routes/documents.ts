import { Router, type IRouter } from "express";
import { Response } from "express";
import { db, documentsTable, partnersTable } from "@workspace/db";
import { eq, and, or, isNull, desc } from "drizzle-orm";
import { requirePartnerAuth, PartnerRequest } from "../middlewares/partnerAuth.js";
import { requireAuth, requireAdmin, type AuthRequest } from "../middlewares/auth.js";

const router: IRouter = Router();

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// ─── Partner: List accessible documents ──────────────────────────────────────

router.get("/partner/documents", requirePartnerAuth, async (req: PartnerRequest, res: Response) => {
  try {
    const docs = await db.select({
      id: documentsTable.id,
      name: documentsTable.name,
      description: documentsTable.description,
      filename: documentsTable.filename,
      mimeType: documentsTable.mimeType,
      size: documentsTable.size,
      category: documentsTable.category,
      partnerId: documentsTable.partnerId,
      uploadedBy: documentsTable.uploadedBy,
      tags: documentsTable.tags,
      createdAt: documentsTable.createdAt,
    })
      .from(documentsTable)
      .where(
        and(
          eq(documentsTable.active, true),
          or(
            isNull(documentsTable.partnerId),
            eq(documentsTable.partnerId, req.partnerId!),
          )
        )
      )
      .orderBy(desc(documentsTable.createdAt));
    res.json(docs.map(d => ({ ...d, tags: JSON.parse(d.tags || "[]") })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to load documents" });
  }
});

// ─── Partner: Upload document ─────────────────────────────────────────────────

router.post("/partner/documents", requirePartnerAuth, async (req: PartnerRequest, res: Response) => {
  try {
    const { name, description, filename, mimeType, size, content, category, tags } = req.body;
    if (!name || !filename || !content) {
      res.status(400).json({ error: "validation_error", message: "name, filename, and content are required" });
      return;
    }
    if (size && size > MAX_FILE_SIZE) {
      res.status(400).json({ error: "file_too_large", message: "File must be under 10MB" });
      return;
    }
    const [doc] = await db.insert(documentsTable).values({
      name, description: description || null,
      filename, mimeType: mimeType || "application/octet-stream",
      size: size || 0, content,
      category: category || "other",
      partnerId: req.partnerId!,
      uploadedBy: "partner",
      tags: JSON.stringify(Array.isArray(tags) ? tags : []),
    }).returning({ id: documentsTable.id, name: documentsTable.name, filename: documentsTable.filename, mimeType: documentsTable.mimeType, size: documentsTable.size, category: documentsTable.category, createdAt: documentsTable.createdAt });
    res.status(201).json(doc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to upload document" });
  }
});

// ─── Partner: Download document ───────────────────────────────────────────────

router.get("/partner/documents/:id/download", requirePartnerAuth, async (req: PartnerRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const [doc] = await db.select()
      .from(documentsTable)
      .where(
        and(
          eq(documentsTable.id, id),
          eq(documentsTable.active, true),
          or(
            isNull(documentsTable.partnerId),
            eq(documentsTable.partnerId, req.partnerId!),
          )
        )
      )
      .limit(1);
    if (!doc) { res.status(404).json({ error: "not_found" }); return; }
    res.json({ content: doc.content, filename: doc.filename, mimeType: doc.mimeType });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to download document" });
  }
});

// ─── Partner: Delete own document ─────────────────────────────────────────────

router.delete("/partner/documents/:id", requirePartnerAuth, async (req: PartnerRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const [doc] = await db.select({ id: documentsTable.id, uploadedBy: documentsTable.uploadedBy, partnerId: documentsTable.partnerId })
      .from(documentsTable)
      .where(and(eq(documentsTable.id, id), eq(documentsTable.partnerId, req.partnerId!)))
      .limit(1);
    if (!doc) { res.status(404).json({ error: "not_found" }); return; }
    if (doc.uploadedBy !== "partner") {
      res.status(403).json({ error: "forbidden", message: "Cannot delete admin-uploaded documents" });
      return;
    }
    await db.update(documentsTable).set({ active: false }).where(eq(documentsTable.id, id));
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to delete document" });
  }
});

// ─── Admin: List all documents ────────────────────────────────────────────────

router.get("/admin/documents", requireAuth, async (_req, res) => {
  try {
    const docs = await db.select({
      id: documentsTable.id,
      name: documentsTable.name,
      description: documentsTable.description,
      filename: documentsTable.filename,
      mimeType: documentsTable.mimeType,
      size: documentsTable.size,
      category: documentsTable.category,
      partnerId: documentsTable.partnerId,
      uploadedBy: documentsTable.uploadedBy,
      tags: documentsTable.tags,
      active: documentsTable.active,
      createdAt: documentsTable.createdAt,
      partnerCompany: partnersTable.companyName,
    })
      .from(documentsTable)
      .leftJoin(partnersTable, eq(documentsTable.partnerId, partnersTable.id))
      .orderBy(desc(documentsTable.createdAt));
    res.json(docs.map(d => ({ ...d, tags: JSON.parse(d.tags || "[]") })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to load documents" });
  }
});

// ─── Admin: Upload document ───────────────────────────────────────────────────

router.post("/admin/documents", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, filename, mimeType, size, content, category, partnerId, tags } = req.body;
    if (!name || !filename || !content) {
      res.status(400).json({ error: "validation_error", message: "name, filename, and content are required" });
      return;
    }
    if (size && size > MAX_FILE_SIZE) {
      res.status(400).json({ error: "file_too_large", message: "File must be under 10MB" });
      return;
    }
    const [doc] = await db.insert(documentsTable).values({
      name, description: description || null,
      filename, mimeType: mimeType || "application/octet-stream",
      size: size || 0, content,
      category: category || "other",
      partnerId: partnerId ? parseInt(partnerId) : null,
      uploadedBy: "admin",
      tags: JSON.stringify(Array.isArray(tags) ? tags : []),
    }).returning({ id: documentsTable.id, name: documentsTable.name, filename: documentsTable.filename, mimeType: documentsTable.mimeType, size: documentsTable.size, category: documentsTable.category, partnerId: documentsTable.partnerId, createdAt: documentsTable.createdAt });
    res.status(201).json(doc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to upload document" });
  }
});

// ─── Admin: Download document ─────────────────────────────────────────────────

router.get("/admin/documents/:id/download", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const [doc] = await db.select().from(documentsTable).where(eq(documentsTable.id, id)).limit(1);
    if (!doc) { res.status(404).json({ error: "not_found" }); return; }
    res.json({ content: doc.content, filename: doc.filename, mimeType: doc.mimeType });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to download document" });
  }
});

// ─── Admin: Update document metadata ─────────────────────────────────────────

router.put("/admin/documents/:id", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const { name, description, category, partnerId, tags, active } = req.body;
    const updates: any = { updatedAt: new Date() };
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description || null;
    if (category !== undefined) updates.category = category;
    if (partnerId !== undefined) updates.partnerId = partnerId ? parseInt(partnerId) : null;
    if (tags !== undefined) updates.tags = JSON.stringify(Array.isArray(tags) ? tags : []);
    if (active !== undefined) updates.active = active;
    const [doc] = await db.update(documentsTable).set(updates).where(eq(documentsTable.id, id)).returning();
    if (!doc) { res.status(404).json({ error: "not_found" }); return; }
    res.json({ ...doc, tags: JSON.parse(doc.tags || "[]") });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to update document" });
  }
});

// ─── Admin: Delete document ───────────────────────────────────────────────────

router.delete("/admin/documents/:id", requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    await db.update(documentsTable).set({ active: false }).where(eq(documentsTable.id, id));
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to delete document" });
  }
});

export default router;
