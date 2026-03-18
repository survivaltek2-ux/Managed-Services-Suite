import { Router, type IRouter } from "express";
import { Response } from "express";
import { db, siteSettingsTable, servicesTable, testimonialsTable, teamMembersTable, faqItemsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, AuthRequest } from "../middlewares/auth.js";

const router: IRouter = Router();

function requireAdmin(req: AuthRequest, res: Response, next: Function) {
  if (req.userRole !== "admin") {
    res.status(403).json({ error: "forbidden", message: "Admin access required" });
    return;
  }
  next();
}

// ─── Public CMS Reads ────────────────────────────────────────────────────────

router.get("/cms/settings", async (_req, res) => {
  try {
    const settings = await db.select().from(siteSettingsTable);
    const map: Record<string, string> = {};
    for (const s of settings) map[s.key] = s.value;
    res.json(map);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to load settings" });
  }
});

router.get("/cms/services", async (_req, res) => {
  try {
    const services = await db.select().from(servicesTable)
      .where(eq(servicesTable.active, true));
    res.json(services.map(s => ({ ...s, features: JSON.parse(s.features) })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to load services" });
  }
});

router.get("/cms/testimonials", async (_req, res) => {
  try {
    const items = await db.select().from(testimonialsTable)
      .where(eq(testimonialsTable.active, true));
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to load testimonials" });
  }
});

router.get("/cms/team", async (_req, res) => {
  try {
    const members = await db.select().from(teamMembersTable)
      .where(eq(teamMembersTable.active, true));
    res.json(members);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to load team" });
  }
});

router.get("/cms/faq", async (_req, res) => {
  try {
    const items = await db.select().from(faqItemsTable)
      .where(eq(faqItemsTable.active, true));
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to load FAQ" });
  }
});

// ─── Admin CMS Writes ─────────────────────────────────────────────────────────

// Settings
router.put("/admin/cms/settings", requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const updates: Record<string, string> = req.body;
    for (const [key, value] of Object.entries(updates)) {
      const existing = await db.select().from(siteSettingsTable).where(eq(siteSettingsTable.key, key)).limit(1);
      if (existing.length > 0) {
        await db.update(siteSettingsTable).set({ value, updatedAt: new Date() }).where(eq(siteSettingsTable.key, key));
      } else {
        await db.insert(siteSettingsTable).values({ key, value });
      }
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to update settings" });
  }
});

// Services CRUD
router.get("/admin/cms/services", requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const services = await db.select().from(servicesTable);
    res.json(services.map(s => ({ ...s, features: JSON.parse(s.features) })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to load services" });
  }
});

router.post("/admin/cms/services", requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, icon, category, features, sortOrder, active } = req.body;
    const [service] = await db.insert(servicesTable).values({
      title, description,
      icon: icon || "Monitor",
      category: category || "general",
      features: JSON.stringify(features || []),
      sortOrder: sortOrder || 0,
      active: active !== false,
    }).returning();
    res.status(201).json({ ...service, features: JSON.parse(service.features) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to create service" });
  }
});

router.put("/admin/cms/services/:id", requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { title, description, icon, category, features, sortOrder, active } = req.body;
    const [service] = await db.update(servicesTable).set({
      title, description,
      icon: icon || "Monitor",
      category: category || "general",
      features: JSON.stringify(features || []),
      sortOrder: sortOrder ?? 0,
      active: active !== false,
      updatedAt: new Date(),
    }).where(eq(servicesTable.id, id)).returning();
    if (!service) { res.status(404).json({ error: "not_found", message: "Service not found" }); return; }
    res.json({ ...service, features: JSON.parse(service.features) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to update service" });
  }
});

router.delete("/admin/cms/services/:id", requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(servicesTable).where(eq(servicesTable.id, id));
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to delete service" });
  }
});

// Testimonials CRUD
router.get("/admin/cms/testimonials", requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const items = await db.select().from(testimonialsTable);
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to load testimonials" });
  }
});

router.post("/admin/cms/testimonials", requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { name, company, role, content, rating, active, sortOrder } = req.body;
    const [item] = await db.insert(testimonialsTable).values({
      name, company, role: role || null, content,
      rating: rating || 5, active: active !== false, sortOrder: sortOrder || 0,
    }).returning();
    res.status(201).json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to create testimonial" });
  }
});

router.put("/admin/cms/testimonials/:id", requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { name, company, role, content, rating, active, sortOrder } = req.body;
    const [item] = await db.update(testimonialsTable).set({
      name, company, role: role || null, content,
      rating: rating || 5, active: active !== false, sortOrder: sortOrder ?? 0,
    }).where(eq(testimonialsTable.id, id)).returning();
    if (!item) { res.status(404).json({ error: "not_found", message: "Testimonial not found" }); return; }
    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to update testimonial" });
  }
});

router.delete("/admin/cms/testimonials/:id", requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(testimonialsTable).where(eq(testimonialsTable.id, id));
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to delete testimonial" });
  }
});

// Team Members CRUD
router.get("/admin/cms/team", requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const members = await db.select().from(teamMembersTable);
    res.json(members);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to load team members" });
  }
});

router.post("/admin/cms/team", requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { name, role, bio, imageUrl, sortOrder, active } = req.body;
    const [member] = await db.insert(teamMembersTable).values({
      name, role, bio: bio || null, imageUrl: imageUrl || null,
      sortOrder: sortOrder || 0, active: active !== false,
    }).returning();
    res.status(201).json(member);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to create team member" });
  }
});

router.put("/admin/cms/team/:id", requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { name, role, bio, imageUrl, sortOrder, active } = req.body;
    const [member] = await db.update(teamMembersTable).set({
      name, role, bio: bio || null, imageUrl: imageUrl || null,
      sortOrder: sortOrder ?? 0, active: active !== false,
    }).where(eq(teamMembersTable.id, id)).returning();
    if (!member) { res.status(404).json({ error: "not_found", message: "Team member not found" }); return; }
    res.json(member);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to update team member" });
  }
});

router.delete("/admin/cms/team/:id", requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(teamMembersTable).where(eq(teamMembersTable.id, id));
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to delete team member" });
  }
});

// FAQ CRUD
router.get("/admin/cms/faq", requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const items = await db.select().from(faqItemsTable);
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to load FAQ" });
  }
});

router.post("/admin/cms/faq", requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { question, answer, category, sortOrder, active } = req.body;
    const [item] = await db.insert(faqItemsTable).values({
      question, answer, category: category || "general",
      sortOrder: sortOrder || 0, active: active !== false,
    }).returning();
    res.status(201).json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to create FAQ item" });
  }
});

router.put("/admin/cms/faq/:id", requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { question, answer, category, sortOrder, active } = req.body;
    const [item] = await db.update(faqItemsTable).set({
      question, answer, category: category || "general",
      sortOrder: sortOrder ?? 0, active: active !== false,
    }).where(eq(faqItemsTable.id, id)).returning();
    if (!item) { res.status(404).json({ error: "not_found", message: "FAQ item not found" }); return; }
    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to update FAQ item" });
  }
});

router.delete("/admin/cms/faq/:id", requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(faqItemsTable).where(eq(faqItemsTable.id, id));
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to delete FAQ item" });
  }
});

// Admin: read contact submissions and quote requests
router.get("/admin/contacts", requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { contactsTable } = await import("@workspace/db");
    const items = await db.select().from(contactsTable);
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to load contacts" });
  }
});

router.get("/admin/quotes", requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { quotesTable } = await import("@workspace/db");
    const items = await db.select().from(quotesTable);
    res.json(items.map(q => ({ ...q, services: JSON.parse(q.services) })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to load quotes" });
  }
});

router.get("/admin/tickets", requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { ticketsTable } = await import("@workspace/db");
    const items = await db.select().from(ticketsTable);
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to load tickets" });
  }
});

export default router;
