import { Router, type IRouter } from "express";
import { Response } from "express";
import bcrypt from "bcryptjs";
import { db, partnersTable, partnerDealsTable, partnerLeadsTable, partnerResourcesTable, partnerCertificationsTable, partnerCertProgressTable, partnerAnnouncementsTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { requirePartnerAuth, generatePartnerToken, PartnerRequest } from "../middlewares/partnerAuth.js";

const router: IRouter = Router();

// ─── Auth ─────────────────────────────────────────────────────────────────────

router.post("/partner/auth/register", async (req, res) => {
  try {
    const { companyName, contactName, email, password, phone, website, businessType, specializations, yearsInBusiness, employeeCount, annualRevenue, address, city, state, zip } = req.body;
    if (!companyName || !contactName || !email || !password) {
      res.status(400).json({ error: "validation_error", message: "companyName, contactName, email, and password are required" });
      return;
    }
    const existing = await db.select().from(partnersTable).where(eq(partnersTable.email, email)).limit(1);
    if (existing.length > 0) {
      res.status(400).json({ error: "conflict", message: "A partner account with this email already exists" });
      return;
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const [partner] = await db.insert(partnersTable).values({
      companyName, contactName, email, password: hashedPassword,
      phone: phone || null, website: website || null, businessType: businessType || null,
      specializations: JSON.stringify(specializations || []),
      yearsInBusiness: yearsInBusiness || null, employeeCount: employeeCount || null,
      annualRevenue: annualRevenue || null, address: address || null,
      city: city || null, state: state || null, zip: zip || null,
    }).returning();
    const token = generatePartnerToken(partner.id);
    res.status(201).json({ token, partner: sanitizePartner(partner) });
  } catch (err) {
    console.error("Partner register error:", err);
    res.status(500).json({ error: "server_error", message: "Registration failed" });
  }
});

router.post("/partner/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: "validation_error", message: "email and password are required" });
      return;
    }
    const [partner] = await db.select().from(partnersTable).where(eq(partnersTable.email, email)).limit(1);
    if (!partner) {
      res.status(401).json({ error: "unauthorized", message: "Invalid credentials" });
      return;
    }
    const valid = await bcrypt.compare(password, partner.password);
    if (!valid) {
      res.status(401).json({ error: "unauthorized", message: "Invalid credentials" });
      return;
    }
    const token = generatePartnerToken(partner.id);
    res.json({ token, partner: sanitizePartner(partner) });
  } catch (err) {
    console.error("Partner login error:", err);
    res.status(500).json({ error: "server_error", message: "Login failed" });
  }
});

router.get("/partner/auth/me", requirePartnerAuth, async (req: PartnerRequest, res: Response) => {
  try {
    const [partner] = await db.select().from(partnersTable).where(eq(partnersTable.id, req.partnerId!)).limit(1);
    if (!partner) { res.status(404).json({ error: "not_found", message: "Partner not found" }); return; }
    res.json(sanitizePartner(partner));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to get profile" });
  }
});

router.put("/partner/profile", requirePartnerAuth, async (req: PartnerRequest, res: Response) => {
  try {
    const { companyName, contactName, phone, website, businessType, specializations, address, city, state, zip } = req.body;
    const [partner] = await db.update(partnersTable).set({
      companyName: companyName || undefined, contactName: contactName || undefined,
      phone: phone || null, website: website || null, businessType: businessType || null,
      specializations: specializations ? JSON.stringify(specializations) : undefined,
      address: address || null, city: city || null, state: state || null, zip: zip || null,
      updatedAt: new Date(),
    }).where(eq(partnersTable.id, req.partnerId!)).returning();
    res.json(sanitizePartner(partner));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to update profile" });
  }
});

// ─── Deals ────────────────────────────────────────────────────────────────────

router.get("/partner/deals", requirePartnerAuth, async (req: PartnerRequest, res: Response) => {
  try {
    const deals = await db.select().from(partnerDealsTable)
      .where(eq(partnerDealsTable.partnerId, req.partnerId!))
      .orderBy(desc(partnerDealsTable.createdAt));
    res.json(deals.map(d => ({ ...d, products: JSON.parse(d.products) })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to load deals" });
  }
});

router.post("/partner/deals", requirePartnerAuth, async (req: PartnerRequest, res: Response) => {
  try {
    const { title, customerName, customerEmail, customerPhone, description, products, estimatedValue, stage, expectedCloseDate, notes } = req.body;
    if (!title || !customerName) {
      res.status(400).json({ error: "validation_error", message: "title and customerName are required" });
      return;
    }
    const [deal] = await db.insert(partnerDealsTable).values({
      partnerId: req.partnerId!,
      title, customerName,
      customerEmail: customerEmail || null, customerPhone: customerPhone || null,
      description: description || null,
      products: JSON.stringify(products || []),
      estimatedValue: estimatedValue || null,
      stage: stage || "prospect",
      expectedCloseDate: expectedCloseDate ? new Date(expectedCloseDate) : null,
      notes: notes || null,
    }).returning();
    // Update partner deal count
    await db.update(partnersTable)
      .set({ totalDeals: (await db.select().from(partnersTable).where(eq(partnersTable.id, req.partnerId!)).limit(1))[0].totalDeals + 1 })
      .where(eq(partnersTable.id, req.partnerId!));
    res.status(201).json({ ...deal, products: JSON.parse(deal.products) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to register deal" });
  }
});

router.put("/partner/deals/:id", requirePartnerAuth, async (req: PartnerRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const { title, customerName, customerEmail, description, products, estimatedValue, actualValue, stage, status, expectedCloseDate, notes } = req.body;
    const [deal] = await db.update(partnerDealsTable).set({
      title: title || undefined, customerName: customerName || undefined,
      customerEmail: customerEmail || null, description: description || null,
      products: products ? JSON.stringify(products) : undefined,
      estimatedValue: estimatedValue || null, actualValue: actualValue || null,
      stage: stage || undefined, status: status || undefined,
      expectedCloseDate: expectedCloseDate ? new Date(expectedCloseDate) : null,
      notes: notes || null, updatedAt: new Date(),
    }).where(and(eq(partnerDealsTable.id, id), eq(partnerDealsTable.partnerId, req.partnerId!))).returning();
    if (!deal) { res.status(404).json({ error: "not_found", message: "Deal not found" }); return; }
    res.json({ ...deal, products: JSON.parse(deal.products) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to update deal" });
  }
});

// ─── Leads ────────────────────────────────────────────────────────────────────

router.get("/partner/leads", requirePartnerAuth, async (req: PartnerRequest, res: Response) => {
  try {
    const leads = await db.select().from(partnerLeadsTable)
      .where(eq(partnerLeadsTable.partnerId, req.partnerId!))
      .orderBy(desc(partnerLeadsTable.assignedAt));
    res.json(leads);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to load leads" });
  }
});

router.put("/partner/leads/:id", requirePartnerAuth, async (req: PartnerRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const { status, notes } = req.body;
    const [lead] = await db.update(partnerLeadsTable).set({
      status: status || undefined, notes: notes || null,
    }).where(and(eq(partnerLeadsTable.id, id), eq(partnerLeadsTable.partnerId, req.partnerId!))).returning();
    if (!lead) { res.status(404).json({ error: "not_found", message: "Lead not found" }); return; }
    res.json(lead);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to update lead" });
  }
});

// ─── Resources ────────────────────────────────────────────────────────────────

router.get("/partner/resources", requirePartnerAuth, async (req: PartnerRequest, res: Response) => {
  try {
    const [partner] = await db.select({ tier: partnersTable.tier }).from(partnersTable).where(eq(partnersTable.id, req.partnerId!)).limit(1);
    const resources = await db.select().from(partnerResourcesTable)
      .where(eq(partnerResourcesTable.active, true))
      .orderBy(desc(partnerResourcesTable.featured), desc(partnerResourcesTable.createdAt));
    res.json(resources);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to load resources" });
  }
});

router.post("/partner/resources/:id/download", requirePartnerAuth, async (_req, res: Response) => {
  try {
    const id = parseInt(_req.params.id as string);
    await db.update(partnerResourcesTable)
      .set({ downloadCount: (await db.select({ downloadCount: partnerResourcesTable.downloadCount }).from(partnerResourcesTable).where(eq(partnerResourcesTable.id, id)).limit(1))[0].downloadCount + 1 })
      .where(eq(partnerResourcesTable.id, id));
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to track download" });
  }
});

// ─── Certifications ───────────────────────────────────────────────────────────

router.get("/partner/certifications", requirePartnerAuth, async (req: PartnerRequest, res: Response) => {
  try {
    const certs = await db.select().from(partnerCertificationsTable)
      .where(eq(partnerCertificationsTable.active, true))
      .orderBy(partnerCertificationsTable.sortOrder);
    const progress = await db.select().from(partnerCertProgressTable)
      .where(eq(partnerCertProgressTable.partnerId, req.partnerId!));
    const progressMap = Object.fromEntries(progress.map(p => [p.certificationId, p]));
    res.json(certs.map(c => ({ ...c, progress: progressMap[c.id] || null })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to load certifications" });
  }
});

router.post("/partner/certifications/:id/progress", requirePartnerAuth, async (req: PartnerRequest, res: Response) => {
  try {
    const certId = parseInt(req.params.id as string);
    const { status, progressPct } = req.body;
    const existing = await db.select().from(partnerCertProgressTable)
      .where(and(eq(partnerCertProgressTable.partnerId, req.partnerId!), eq(partnerCertProgressTable.certificationId, certId)))
      .limit(1);
    if (existing.length > 0) {
      const [updated] = await db.update(partnerCertProgressTable).set({
        status: status || existing[0].status,
        progressPct: progressPct ?? existing[0].progressPct,
        completedAt: status === "completed" ? new Date() : existing[0].completedAt,
      }).where(eq(partnerCertProgressTable.id, existing[0].id)).returning();
      res.json(updated);
    } else {
      const [created] = await db.insert(partnerCertProgressTable).values({
        partnerId: req.partnerId!, certificationId: certId,
        status: status || "in_progress", progressPct: progressPct || 0,
      }).returning();
      res.status(201).json(created);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to update certification progress" });
  }
});

// ─── Announcements ────────────────────────────────────────────────────────────

router.get("/partner/announcements", requirePartnerAuth, async (_req, res: Response) => {
  try {
    const items = await db.select().from(partnerAnnouncementsTable)
      .where(eq(partnerAnnouncementsTable.active, true))
      .orderBy(desc(partnerAnnouncementsTable.pinned), desc(partnerAnnouncementsTable.publishedAt));
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to load announcements" });
  }
});

// ─── Admin Partner Management ─────────────────────────────────────────────────

router.get("/admin/partners", async (_req, res) => {
  try {
    const partners = await db.select().from(partnersTable).orderBy(desc(partnersTable.createdAt));
    res.json(partners.map(p => sanitizePartner(p)));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to load partners" });
  }
});

router.put("/admin/partners/:id/approve", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [partner] = await db.update(partnersTable).set({
      status: "approved", approvedAt: new Date(), updatedAt: new Date(),
    }).where(eq(partnersTable.id, id)).returning();
    res.json(sanitizePartner(partner));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to approve partner" });
  }
});

router.put("/admin/partners/:id/tier", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { tier } = req.body;
    const [partner] = await db.update(partnersTable).set({ tier, updatedAt: new Date() }).where(eq(partnersTable.id, id)).returning();
    res.json(sanitizePartner(partner));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to update tier" });
  }
});

router.post("/admin/partner/leads", async (req, res) => {
  try {
    const { partnerId, companyName, contactName, email, phone, source, interest } = req.body;
    const [lead] = await db.insert(partnerLeadsTable).values({
      partnerId, companyName, contactName,
      email: email || null, phone: phone || null,
      source: source || null, interest: interest || null,
    }).returning();
    res.status(201).json(lead);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to assign lead" });
  }
});

router.post("/admin/partner/resources", async (req, res) => {
  try {
    const { title, description, url, type, category, minTier, featured } = req.body;
    const [resource] = await db.insert(partnerResourcesTable).values({
      title, description: description || null, url,
      type: type || "pdf", category: category || "general",
      minTier: minTier || "registered", featured: featured || false,
    }).returning();
    res.status(201).json(resource);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to create resource" });
  }
});

router.post("/admin/partner/announcements", async (req, res) => {
  try {
    const { title, body, category, minTier, pinned } = req.body;
    const [announcement] = await db.insert(partnerAnnouncementsTable).values({
      title, body, category: category || "general",
      minTier: minTier || "registered", pinned: pinned || false,
    }).returning();
    res.status(201).json(announcement);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to create announcement" });
  }
});

router.post("/admin/partner/certifications", async (req, res) => {
  try {
    const { name, description, provider, category, duration, sortOrder } = req.body;
    const [cert] = await db.insert(partnerCertificationsTable).values({
      name, description: description || null,
      provider: provider || "Siebert Services",
      category: category || "general", duration: duration || null,
      sortOrder: sortOrder || 0,
    }).returning();
    res.status(201).json(cert);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to create certification" });
  }
});

function sanitizePartner(partner: any) {
  const { password: _, ...safe } = partner;
  return { ...safe, specializations: JSON.parse(safe.specializations || "[]") };
}

export default router;
