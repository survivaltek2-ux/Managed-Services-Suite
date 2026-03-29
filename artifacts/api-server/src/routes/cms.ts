import { Router, type IRouter } from "express";
import { Response, Request, NextFunction } from "express";
import { db, siteSettingsTable, servicesTable, testimonialsTable, teamMembersTable, faqItemsTable, blogPostsTable, activityLogTable, usersTable, contactsTable, quotesTable, ticketsTable } from "@workspace/db";
import { eq, desc, like, or, sql, count } from "drizzle-orm";
import { requireAuth, AuthRequest } from "../middlewares/auth.js";
import { requirePartnerAuth, PartnerRequest } from "../middlewares/partnerAuth.js";
import jwt from "jsonwebtoken";
import { getSmtpSettings, testSmtpConnection, invalidateSmtpCache } from "../lib/email.js";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET || "siebert-services-secret-key-2024";
const router: IRouter = Router();

function requireAdmin(req: AuthRequest, res: Response, next: Function) {
  if (req.userRole !== "admin") {
    res.status(403).json({ error: "forbidden", message: "Admin access required" });
    return;
  }
  next();
}

function requireAdminOrPartnerAdmin(req: Request & AuthRequest & PartnerRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "unauthorized", message: "Authentication required" });
    return;
  }

  const token = authHeader.substring(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId?: number; role?: string; partnerId?: number; isAdmin?: boolean };
    if ((payload.userId && payload.role === "admin") || (payload.partnerId && payload.isAdmin === true)) {
      req.userId = payload.userId;
      req.userRole = payload.role;
      req.partnerId = payload.partnerId;
      req.partnerIsAdmin = payload.isAdmin === true;
      next();
    } else {
      res.status(403).json({ error: "forbidden", message: "Admin access required" });
    }
  } catch {
    res.status(401).json({ error: "unauthorized", message: "Invalid or expired token" });
  }
}

async function logActivity(userId: number | undefined, action: string, entity: string, entityId?: number, details?: string) {
  try {
    await db.insert(activityLogTable).values({ userId: userId || null, action, entity, entityId: entityId || null, details: details || null });
  } catch (e) { /* silent */ }
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

router.get("/cms/blog", async (_req, res) => {
  try {
    const posts = await db.select().from(blogPostsTable)
      .where(eq(blogPostsTable.status, "published"))
      .orderBy(desc(blogPostsTable.publishedAt));
    res.json(posts.map(p => ({ ...p, tags: JSON.parse(p.tags) })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to load blog posts" });
  }
});

router.get("/cms/blog/:slug", async (req, res) => {
  try {
    const [post] = await db.select().from(blogPostsTable)
      .where(eq(blogPostsTable.slug, req.params.slug as string))
      .limit(1);
    if (!post || post.status !== "published") {
      res.status(404).json({ error: "not_found", message: "Blog post not found" });
      return;
    }
    res.json({ ...post, tags: JSON.parse(post.tags) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to load blog post" });
  }
});

// ─── Admin CMS Writes ─────────────────────────────────────────────────────────

// Dashboard Stats
router.get("/admin/dashboard/stats", requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const [contactCount] = await db.select({ count: count() }).from(contactsTable);
    const [quoteCount] = await db.select({ count: count() }).from(quotesTable);
    const [ticketCount] = await db.select({ count: count() }).from(ticketsTable);
    const [openTickets] = await db.select({ count: count() }).from(ticketsTable).where(eq(ticketsTable.status, "open"));
    const [blogCount] = await db.select({ count: count() }).from(blogPostsTable);
    const [userCount] = await db.select({ count: count() }).from(usersTable);

    const recentContacts = await db.select().from(contactsTable).orderBy(desc(contactsTable.createdAt)).limit(5);
    const recentQuotes = await db.select().from(quotesTable).orderBy(desc(quotesTable.createdAt)).limit(5);

    res.json({
      contacts: contactCount.count,
      quotes: quoteCount.count,
      tickets: ticketCount.count,
      openTickets: openTickets.count,
      blogPosts: blogCount.count,
      users: userCount.count,
      recentContacts,
      recentQuotes: recentQuotes.map(q => ({ ...q, services: JSON.parse(q.services) })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to load dashboard stats" });
  }
});

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
    await logActivity(req.userId, "update", "settings", undefined, `Updated ${Object.keys(updates).length} settings`);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to update settings" });
  }
});

// SMTP Settings
router.get("/admin/smtp", requireAuth, requireAdmin, async (_req: AuthRequest, res: Response) => {
  try {
    const settings = await getSmtpSettings();
    res.json(settings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to load SMTP settings" });
  }
});

const EMAIL_DB_KEYS = [
  "mailgun_api_key", "mailgun_domain",
  "smtp_host", "smtp_port", "smtp_user", "smtp_pass",
  "smtp_from_email", "smtp_from_name", "notification_email",
];
const MASKED_PLACEHOLDER = "••••••••";
const MASKED_KEYS = new Set(["smtp_pass", "mailgun_api_key"]);

router.put("/admin/smtp", requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const body: Record<string, string> = req.body;
    for (const key of EMAIL_DB_KEYS) {
      if (!(key in body)) continue;
      if (MASKED_KEYS.has(key) && body[key] === MASKED_PLACEHOLDER) continue;
      const value = String(body[key]);
      const existing = await db.select().from(siteSettingsTable).where(eq(siteSettingsTable.key, key)).limit(1);
      if (existing.length > 0) {
        await db.update(siteSettingsTable).set({ value, updatedAt: new Date() }).where(eq(siteSettingsTable.key, key));
      } else {
        await db.insert(siteSettingsTable).values({ key, value });
      }
    }
    invalidateSmtpCache();
    await logActivity(req.userId, "update", "smtp_settings", undefined, "Updated email configuration");
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to save email settings" });
  }
});

router.post("/admin/smtp/test", requireAuth, requireAdmin, async (_req: AuthRequest, res: Response) => {
  try {
    const result = await testSmtpConnection();
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: "Unexpected error during test" });
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
    await logActivity(req.userId, "create", "service", service.id, `Created service: ${title}`);
    res.status(201).json({ ...service, features: JSON.parse(service.features) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to create service" });
  }
});

router.put("/admin/cms/services/:id", requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
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
    await logActivity(req.userId, "update", "service", id, `Updated service: ${title}`);
    res.json({ ...service, features: JSON.parse(service.features) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to update service" });
  }
});

router.delete("/admin/cms/services/:id", requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    await db.delete(servicesTable).where(eq(servicesTable.id, id));
    await logActivity(req.userId, "delete", "service", id);
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
    await logActivity(req.userId, "create", "testimonial", item.id, `Created testimonial from: ${name}`);
    res.status(201).json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to create testimonial" });
  }
});

router.put("/admin/cms/testimonials/:id", requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const { name, company, role, content, rating, active, sortOrder } = req.body;
    const [item] = await db.update(testimonialsTable).set({
      name, company, role: role || null, content,
      rating: rating || 5, active: active !== false, sortOrder: sortOrder ?? 0,
    }).where(eq(testimonialsTable.id, id)).returning();
    if (!item) { res.status(404).json({ error: "not_found", message: "Testimonial not found" }); return; }
    await logActivity(req.userId, "update", "testimonial", id);
    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to update testimonial" });
  }
});

router.delete("/admin/cms/testimonials/:id", requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    await db.delete(testimonialsTable).where(eq(testimonialsTable.id, id));
    await logActivity(req.userId, "delete", "testimonial", id);
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
    await logActivity(req.userId, "create", "team_member", member.id, `Added team member: ${name}`);
    res.status(201).json(member);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to create team member" });
  }
});

router.put("/admin/cms/team/:id", requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const { name, role, bio, imageUrl, sortOrder, active } = req.body;
    const [member] = await db.update(teamMembersTable).set({
      name, role, bio: bio || null, imageUrl: imageUrl || null,
      sortOrder: sortOrder ?? 0, active: active !== false,
    }).where(eq(teamMembersTable.id, id)).returning();
    if (!member) { res.status(404).json({ error: "not_found", message: "Team member not found" }); return; }
    await logActivity(req.userId, "update", "team_member", id);
    res.json(member);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to update team member" });
  }
});

router.delete("/admin/cms/team/:id", requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    await db.delete(teamMembersTable).where(eq(teamMembersTable.id, id));
    await logActivity(req.userId, "delete", "team_member", id);
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
    await logActivity(req.userId, "create", "faq", item.id);
    res.status(201).json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to create FAQ item" });
  }
});

router.put("/admin/cms/faq/:id", requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const { question, answer, category, sortOrder, active } = req.body;
    const [item] = await db.update(faqItemsTable).set({
      question, answer, category: category || "general",
      sortOrder: sortOrder ?? 0, active: active !== false,
    }).where(eq(faqItemsTable.id, id)).returning();
    if (!item) { res.status(404).json({ error: "not_found", message: "FAQ item not found" }); return; }
    await logActivity(req.userId, "update", "faq", id);
    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to update FAQ item" });
  }
});

router.delete("/admin/cms/faq/:id", requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    await db.delete(faqItemsTable).where(eq(faqItemsTable.id, id));
    await logActivity(req.userId, "delete", "faq", id);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to delete FAQ item" });
  }
});

// ─── Blog CRUD ──────────────────────────────────────────────────────────────

router.get("/admin/cms/blog", requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const posts = await db.select().from(blogPostsTable).orderBy(desc(blogPostsTable.createdAt));
    res.json(posts.map(p => ({ ...p, tags: JSON.parse(p.tags) })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to load blog posts" });
  }
});

router.post("/admin/cms/blog", requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { title, slug, excerpt, content, coverImage, author, category, tags, status, featured } = req.body;
    if (!title || !content) {
      res.status(400).json({ error: "validation_error", message: "title and content are required" });
      return;
    }
    const autoSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const [post] = await db.insert(blogPostsTable).values({
      title, slug: autoSlug, excerpt: excerpt || null, content,
      coverImage: coverImage || null, author: author || "Siebert Services",
      category: category || "general", tags: JSON.stringify(tags || []),
      status: status || "draft", featured: featured || false,
      publishedAt: status === "published" ? new Date() : null,
    }).returning();
    await logActivity(req.userId, "create", "blog_post", post.id, `Created blog post: ${title}`);
    res.status(201).json({ ...post, tags: JSON.parse(post.tags) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to create blog post" });
  }
});

router.put("/admin/cms/blog/:id", requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const { title, slug, excerpt, content, coverImage, author, category, tags, status, featured } = req.body;
    const existing = await db.select().from(blogPostsTable).where(eq(blogPostsTable.id, id)).limit(1);
    const wasPublished = existing[0]?.status === "published";
    const [post] = await db.update(blogPostsTable).set({
      title, slug, excerpt: excerpt || null, content,
      coverImage: coverImage || null, author: author || "Siebert Services",
      category: category || "general", tags: JSON.stringify(tags || []),
      status: status || "draft", featured: featured || false,
      publishedAt: status === "published" && !wasPublished ? new Date() : existing[0]?.publishedAt,
      updatedAt: new Date(),
    }).where(eq(blogPostsTable.id, id)).returning();
    if (!post) { res.status(404).json({ error: "not_found", message: "Blog post not found" }); return; }
    await logActivity(req.userId, "update", "blog_post", id, `Updated blog post: ${title}`);
    res.json({ ...post, tags: JSON.parse(post.tags) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to update blog post" });
  }
});

router.delete("/admin/cms/blog/:id", requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    await db.delete(blogPostsTable).where(eq(blogPostsTable.id, id));
    await logActivity(req.userId, "delete", "blog_post", id);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to delete blog post" });
  }
});

// ─── User Management ────────────────────────────────────────────────────────

router.get("/admin/users", requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const users = await db.select({
      id: usersTable.id, name: usersTable.name, email: usersTable.email,
      company: usersTable.company, phone: usersTable.phone, role: usersTable.role,
      createdAt: usersTable.createdAt,
    }).from(usersTable).orderBy(desc(usersTable.createdAt));
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to load users" });
  }
});

router.post("/admin/users", requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { name, email: rawEmail, password, company, phone, role } = req.body;
    const email = rawEmail?.trim().toLowerCase();
    
    if (!name || !email || !password || !company) {
      res.status(400).json({ error: "validation_error", message: "name, email, password, and company are required" });
      return;
    }

    const existing = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (existing.length > 0) {
      res.status(400).json({ error: "conflict", message: "An account with this email already exists" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [user] = await db.insert(usersTable).values({
      name,
      email,
      password: hashedPassword,
      company,
      phone: phone || null,
      role: role || "client",
    }).returning();

    await logActivity(req.userId, "create", "user", user.id);
    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      company: user.company,
      phone: user.phone,
      role: user.role,
      createdAt: user.createdAt,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to create user" });
  }
});

router.put("/admin/users/:id/role", requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const { role } = req.body;
    if (!["client", "admin"].includes(role)) {
      res.status(400).json({ error: "validation_error", message: "Invalid role" });
      return;
    }
    const [user] = await db.update(usersTable).set({ role }).where(eq(usersTable.id, id)).returning();
    if (!user) { res.status(404).json({ error: "not_found" }); return; }
    await logActivity(req.userId, "update", "user", id, `Changed role to: ${role}`);
    res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to update user role" });
  }
});

router.delete("/admin/users/:id", requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    if (id === req.userId) {
      res.status(400).json({ error: "validation_error", message: "Cannot delete your own account" });
      return;
    }
    await db.delete(usersTable).where(eq(usersTable.id, id));
    await logActivity(req.userId, "delete", "user", id);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to delete user" });
  }
});

// ─── Enhanced Contacts / Quotes / Tickets ─────────────────────────────────────

router.get("/admin/contacts", requireAdminOrPartnerAdmin, async (req: AuthRequest & PartnerRequest, res: Response) => {
  try {
    const items = await db.select().from(contactsTable).orderBy(desc(contactsTable.createdAt));
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to load contacts" });
  }
});

router.delete("/admin/contacts/:id", requireAdminOrPartnerAdmin, async (req: AuthRequest & PartnerRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    await db.delete(contactsTable).where(eq(contactsTable.id, id));
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to delete contact" });
  }
});

router.get("/admin/quotes", requireAdminOrPartnerAdmin, async (req: AuthRequest & PartnerRequest, res: Response) => {
  try {
    const items = await db.select().from(quotesTable).orderBy(desc(quotesTable.createdAt));
    res.json(items.map(q => ({ ...q, services: JSON.parse(q.services) })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to load quotes" });
  }
});

router.put("/admin/quotes/:id/status", requireAdminOrPartnerAdmin, async (req: AuthRequest & PartnerRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const { status, internalNotes, assignedTo } = req.body;
    const updates: any = {};
    if (status) updates.status = status;
    if (internalNotes !== undefined) updates.internalNotes = internalNotes;
    if (assignedTo !== undefined) updates.assignedTo = assignedTo;
    const [quote] = await db.update(quotesTable).set(updates).where(eq(quotesTable.id, id)).returning();
    if (!quote) { res.status(404).json({ error: "not_found" }); return; }
    await logActivity(req.userId, "update", "quote", id, `Status changed to: ${status}`);
    res.json({ ...quote, services: JSON.parse(quote.services) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to update quote" });
  }
});

router.delete("/admin/quotes/:id", requireAdminOrPartnerAdmin, async (req: AuthRequest & PartnerRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    await db.delete(quotesTable).where(eq(quotesTable.id, id));
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to delete quote" });
  }
});

router.get("/admin/tickets", requireAdminOrPartnerAdmin, async (req: AuthRequest & PartnerRequest, res: Response) => {
  try {
    const items = await db.select().from(ticketsTable).orderBy(desc(ticketsTable.createdAt));
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to load tickets" });
  }
});

router.put("/admin/tickets/:id/status", requireAdminOrPartnerAdmin, async (req: AuthRequest & PartnerRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const { status } = req.body;
    const [ticket] = await db.update(ticketsTable).set({ status, updatedAt: new Date() }).where(eq(ticketsTable.id, id)).returning();
    if (!ticket) { res.status(404).json({ error: "not_found" }); return; }
    await logActivity(req.userId, "update", "ticket", id, `Status changed to: ${status}`);
    res.json(ticket);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to update ticket" });
  }
});

router.delete("/admin/tickets/:id", requireAdminOrPartnerAdmin, async (req: AuthRequest & PartnerRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    await db.delete(ticketsTable).where(eq(ticketsTable.id, id));
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to delete ticket" });
  }
});

// ─── Activity Log ───────────────────────────────────────────────────────────

router.get("/admin/activity", requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const activities = await db.select().from(activityLogTable)
      .orderBy(desc(activityLogTable.createdAt))
      .limit(limit);
    res.json(activities);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to load activity log" });
  }
});

// ─── CSV Exports ────────────────────────────────────────────────────────────

router.get("/admin/export/contacts", requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const items = await db.select().from(contactsTable).orderBy(desc(contactsTable.createdAt));
    const csv = generateCSV(items, ["id", "name", "email", "phone", "company", "service", "message", "createdAt"]);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=contacts.csv");
    res.send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to export contacts" });
  }
});

router.get("/admin/export/quotes", requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const items = await db.select().from(quotesTable).orderBy(desc(quotesTable.createdAt));
    const csv = generateCSV(items, ["id", "name", "email", "phone", "company", "companySize", "services", "budget", "timeline", "status", "createdAt"]);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=quotes.csv");
    res.send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to export quotes" });
  }
});

router.get("/admin/export/tickets", requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const items = await db.select().from(ticketsTable).orderBy(desc(ticketsTable.createdAt));
    const csv = generateCSV(items, ["id", "subject", "description", "priority", "category", "status", "createdAt"]);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=tickets.csv");
    res.send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to export tickets" });
  }
});

function generateCSV(data: any[], fields: string[]): string {
  const header = fields.join(",");
  const rows = data.map(item =>
    fields.map(f => {
      const val = item[f];
      if (val === null || val === undefined) return "";
      const str = String(val);
      return str.includes(",") || str.includes('"') || str.includes("\n")
        ? `"${str.replace(/"/g, '""')}"`
        : str;
    }).join(",")
  );
  return [header, ...rows].join("\n");
}

export default router;
