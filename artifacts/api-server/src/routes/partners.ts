import { Router, type IRouter } from "express";
import { Response } from "express";
import bcrypt from "bcryptjs";
import { db, partnersTable, partnerDealsTable, partnerLeadsTable, partnerResourcesTable, partnerCertificationsTable, partnerCertProgressTable, partnerAnnouncementsTable, partnerCommissionsTable, partnerSupportTicketsTable, partnerTicketMessagesTable, partnerMdfRequestsTable } from "@workspace/db";
import { eq, and, desc, sql, count, sum } from "drizzle-orm";
import { requirePartnerAuth, generatePartnerToken, PartnerRequest } from "../middlewares/partnerAuth.js";
import { requireAuth, requireAdmin, type AuthRequest } from "../middlewares/auth.js";
import { sendDealSubmittedNotification, sendTicketSubmittedNotification } from "../lib/email.js";

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

// ─── Dashboard Stats ─────────────────────────────────────────────────────────

router.get("/partner/dashboard", requirePartnerAuth, async (req: PartnerRequest, res: Response) => {
  try {
    const [partner] = await db.select().from(partnersTable).where(eq(partnersTable.id, req.partnerId!)).limit(1);
    const deals = await db.select().from(partnerDealsTable).where(eq(partnerDealsTable.partnerId, req.partnerId!));
    const commissions = await db.select().from(partnerCommissionsTable).where(eq(partnerCommissionsTable.partnerId, req.partnerId!));
    const tickets = await db.select().from(partnerSupportTicketsTable).where(eq(partnerSupportTicketsTable.partnerId, req.partnerId!));
    const leads = await db.select().from(partnerLeadsTable).where(eq(partnerLeadsTable.partnerId, req.partnerId!));

    const activeDeals = deals.filter(d => !["won", "lost", "expired"].includes(d.status));
    const wonDeals = deals.filter(d => d.status === "won");
    const totalPipeline = activeDeals.reduce((sum, d) => sum + parseFloat(d.estimatedValue || "0"), 0);
    const totalRevenue = wonDeals.reduce((sum, d) => sum + parseFloat(d.actualValue || d.estimatedValue || "0"), 0);
    const pendingCommissions = commissions.filter(c => c.status === "pending").reduce((sum, c) => sum + parseFloat(c.amount), 0);
    const paidCommissions = commissions.filter(c => c.status === "paid").reduce((sum, c) => sum + parseFloat(c.amount), 0);
    const openTickets = tickets.filter(t => !["resolved", "closed"].includes(t.status)).length;

    const dealsByStage = deals.reduce((acc: Record<string, number>, d) => {
      acc[d.stage] = (acc[d.stage] || 0) + 1;
      return acc;
    }, {});

    const monthlyDeals: Record<string, { count: number; value: number }> = {};
    deals.forEach(d => {
      const month = new Date(d.createdAt).toISOString().slice(0, 7);
      if (!monthlyDeals[month]) monthlyDeals[month] = { count: 0, value: 0 };
      monthlyDeals[month].count++;
      monthlyDeals[month].value += parseFloat(d.estimatedValue || "0");
    });

    res.json({
      partner: sanitizePartner(partner),
      stats: {
        totalDeals: deals.length,
        activeDeals: activeDeals.length,
        wonDeals: wonDeals.length,
        totalPipeline,
        totalRevenue,
        pendingCommissions,
        paidCommissions,
        openTickets,
        totalLeads: leads.length,
        convertedLeads: leads.filter(l => l.status === "converted").length,
      },
      dealsByStage,
      monthlyDeals,
      recentDeals: deals.slice(0, 5),
      recentCommissions: commissions.slice(0, 5),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to load dashboard" });
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
    const [partner] = await db.select().from(partnersTable).where(eq(partnersTable.id, req.partnerId!)).limit(1);
    if (partner) {
      await db.update(partnersTable)
        .set({ totalDeals: partner.totalDeals + 1 })
        .where(eq(partnersTable.id, req.partnerId!));
      sendDealSubmittedNotification(deal, {
        companyName: partner.companyName,
        contactName: partner.contactName,
        email: partner.email,
      }).catch(err => console.error("[Email] Deal notification error:", err));
    }
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
    const updateData: any = {
      title: title || undefined, customerName: customerName || undefined,
      customerEmail: customerEmail || null, description: description || null,
      products: products ? JSON.stringify(products) : undefined,
      estimatedValue: estimatedValue || null, actualValue: actualValue || null,
      stage: stage || undefined, status: status || undefined,
      expectedCloseDate: expectedCloseDate ? new Date(expectedCloseDate) : null,
      notes: notes || null, updatedAt: new Date(),
    };
    if (status === "won") updateData.closedAt = new Date();

    const existingDeal = await db.select().from(partnerDealsTable)
      .where(and(eq(partnerDealsTable.id, id), eq(partnerDealsTable.partnerId, req.partnerId!))).then(r => r[0]);
    if (!existingDeal) { res.status(404).json({ error: "not_found", message: "Deal not found" }); return; }
    const wasPreviouslyWon = existingDeal.status === "won";

    const result = await db.transaction(async (tx) => {
      const [deal] = await tx.update(partnerDealsTable).set(updateData)
        .where(and(eq(partnerDealsTable.id, id), eq(partnerDealsTable.partnerId, req.partnerId!))).returning();
      if (!deal) return null;

      if (status === "won" && !wasPreviouslyWon) {
        const existingCommission = await tx.select({ id: partnerCommissionsTable.id })
          .from(partnerCommissionsTable)
          .where(and(eq(partnerCommissionsTable.dealId, deal.id), eq(partnerCommissionsTable.type, "deal")))
          .then(r => r[0]);

        if (!existingCommission) {
          const COMMISSION_RATE = 0.10;
          const dealValue = parseFloat(String(deal.actualValue || deal.estimatedValue || "0"));
          if (dealValue > 0) {
            const commissionAmount = (dealValue * COMMISSION_RATE).toFixed(2);
            await tx.insert(partnerCommissionsTable).values({
              partnerId: req.partnerId!,
              dealId: deal.id,
              type: "deal",
              description: `Commission on deal: ${deal.title} (${(COMMISSION_RATE * 100).toFixed(0)}% of ${dealValue.toLocaleString("en-US", { style: "currency", currency: "USD" })})`,
              amount: commissionAmount,
              rate: (COMMISSION_RATE * 100).toFixed(2),
              status: "pending",
            });
            await tx.update(partnersTable).set({
              totalRevenue: sql`${partnersTable.totalRevenue} + ${dealValue}`,
              ytdRevenue: sql`${partnersTable.ytdRevenue} + ${dealValue}`,
            }).where(eq(partnersTable.id, req.partnerId!));
          }
        }
      }

      return deal;
    });

    if (!result) { res.status(404).json({ error: "not_found", message: "Deal not found" }); return; }
    res.json({ ...result, products: JSON.parse(result.products) });
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

// ─── Commissions ──────────────────────────────────────────────────────────────

router.get("/partner/commissions", requirePartnerAuth, async (req: PartnerRequest, res: Response) => {
  try {
    const commissions = await db.select().from(partnerCommissionsTable)
      .where(eq(partnerCommissionsTable.partnerId, req.partnerId!))
      .orderBy(desc(partnerCommissionsTable.createdAt));
    res.json(commissions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to load commissions" });
  }
});

router.get("/partner/commissions/summary", requirePartnerAuth, async (req: PartnerRequest, res: Response) => {
  try {
    const commissions = await db.select().from(partnerCommissionsTable)
      .where(eq(partnerCommissionsTable.partnerId, req.partnerId!));

    const totalEarned = commissions.reduce((sum, c) => sum + parseFloat(c.amount), 0);
    const pending = commissions.filter(c => c.status === "pending").reduce((sum, c) => sum + parseFloat(c.amount), 0);
    const paid = commissions.filter(c => c.status === "paid").reduce((sum, c) => sum + parseFloat(c.amount), 0);
    const approved = commissions.filter(c => c.status === "approved").reduce((sum, c) => sum + parseFloat(c.amount), 0);

    const monthlyEarnings: Record<string, number> = {};
    commissions.forEach(c => {
      const month = new Date(c.createdAt).toISOString().slice(0, 7);
      monthlyEarnings[month] = (monthlyEarnings[month] || 0) + parseFloat(c.amount);
    });

    res.json({ totalEarned, pending, paid, approved, monthlyEarnings, totalTransactions: commissions.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to load commission summary" });
  }
});

// ─── Support Tickets ──────────────────────────────────────────────────────────

router.get("/partner/tickets", requirePartnerAuth, async (req: PartnerRequest, res: Response) => {
  try {
    const tickets = await db.select().from(partnerSupportTicketsTable)
      .where(eq(partnerSupportTicketsTable.partnerId, req.partnerId!))
      .orderBy(desc(partnerSupportTicketsTable.createdAt));
    res.json(tickets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to load tickets" });
  }
});

router.post("/partner/tickets", requirePartnerAuth, async (req: PartnerRequest, res: Response) => {
  try {
    const { subject, description, category, priority } = req.body;
    if (!subject || !description) {
      res.status(400).json({ error: "validation_error", message: "subject and description are required" });
      return;
    }
    const [ticket] = await db.insert(partnerSupportTicketsTable).values({
      partnerId: req.partnerId!,
      subject, description,
      category: category || "general",
      priority: priority || "medium",
    }).returning();

    const [partner] = await db.select().from(partnersTable).where(eq(partnersTable.id, req.partnerId!)).limit(1);
    if (partner) {
      sendTicketSubmittedNotification(
        { subject, description, priority: priority || "medium", category: category || "general" },
        { companyName: partner.companyName, contactName: partner.contactName, email: partner.email },
      ).catch(err => console.error("[Email] Ticket notification error:", err));
    }

    res.status(201).json(ticket);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to create ticket" });
  }
});

router.get("/partner/tickets/:id", requirePartnerAuth, async (req: PartnerRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const [ticket] = await db.select().from(partnerSupportTicketsTable)
      .where(and(eq(partnerSupportTicketsTable.id, id), eq(partnerSupportTicketsTable.partnerId, req.partnerId!)))
      .limit(1);
    if (!ticket) { res.status(404).json({ error: "not_found" }); return; }
    const messages = await db.select().from(partnerTicketMessagesTable)
      .where(eq(partnerTicketMessagesTable.ticketId, id))
      .orderBy(partnerTicketMessagesTable.createdAt);
    res.json({ ...ticket, messages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to load ticket" });
  }
});

router.post("/partner/tickets/:id/messages", requirePartnerAuth, async (req: PartnerRequest, res: Response) => {
  try {
    const ticketId = parseInt(req.params.id as string);
    const { message } = req.body;
    if (!message) { res.status(400).json({ error: "validation_error", message: "message is required" }); return; }

    const [ticket] = await db.select().from(partnerSupportTicketsTable)
      .where(and(eq(partnerSupportTicketsTable.id, ticketId), eq(partnerSupportTicketsTable.partnerId, req.partnerId!)))
      .limit(1);
    if (!ticket) { res.status(404).json({ error: "not_found" }); return; }

    const [partner] = await db.select().from(partnersTable).where(eq(partnersTable.id, req.partnerId!)).limit(1);

    const [msg] = await db.insert(partnerTicketMessagesTable).values({
      ticketId, senderType: "partner",
      senderName: partner?.contactName || "Partner",
      message,
    }).returning();

    if (ticket.status === "resolved" || ticket.status === "closed") {
      await db.update(partnerSupportTicketsTable).set({ status: "open", updatedAt: new Date() }).where(eq(partnerSupportTicketsTable.id, ticketId));
    }

    res.status(201).json(msg);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to send message" });
  }
});

// ─── MDF Requests ─────────────────────────────────────────────────────────────

router.get("/partner/mdf", requirePartnerAuth, async (req: PartnerRequest, res: Response) => {
  try {
    const requests = await db.select().from(partnerMdfRequestsTable)
      .where(eq(partnerMdfRequestsTable.partnerId, req.partnerId!))
      .orderBy(desc(partnerMdfRequestsTable.createdAt));
    res.json(requests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to load MDF requests" });
  }
});

router.post("/partner/mdf", requirePartnerAuth, async (req: PartnerRequest, res: Response) => {
  try {
    const { title, description, activityType, requestedAmount, startDate, endDate, expectedLeads } = req.body;
    if (!title || !description || !activityType || !requestedAmount) {
      res.status(400).json({ error: "validation_error", message: "title, description, activityType, and requestedAmount are required" });
      return;
    }
    const [request] = await db.insert(partnerMdfRequestsTable).values({
      partnerId: req.partnerId!,
      title, description, activityType,
      requestedAmount: parseFloat(requestedAmount).toFixed(2),
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      expectedLeads: expectedLeads || null,
      status: "submitted",
    }).returning();
    res.status(201).json(request);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to create MDF request" });
  }
});

router.put("/partner/mdf/:id", requirePartnerAuth, async (req: PartnerRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const { proofOfExecution } = req.body;
    const [request] = await db.update(partnerMdfRequestsTable).set({
      proofOfExecution: proofOfExecution || null,
      status: proofOfExecution ? "completed" : undefined,
      updatedAt: new Date(),
    }).where(and(eq(partnerMdfRequestsTable.id, id), eq(partnerMdfRequestsTable.partnerId, req.partnerId!))).returning();
    if (!request) { res.status(404).json({ error: "not_found" }); return; }
    res.json(request);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to update MDF request" });
  }
});

// ─── Admin Partner Management ─────────────────────────────────────────────────

router.get("/admin/partners", requireAuth, async (_req, res) => {
  try {
    const partners = await db.select().from(partnersTable).orderBy(desc(partnersTable.createdAt));
    res.json(partners.map(p => sanitizePartner(p)));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to load partners" });
  }
});

router.put("/admin/partners/:id/approve", requireAuth, async (req, res) => {
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

router.put("/admin/partners/:id/tier", requireAuth, async (req, res) => {
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

router.post("/admin/partner/leads", requireAuth, async (req, res) => {
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

router.post("/admin/partner/resources", requireAuth, async (req, res) => {
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

router.post("/admin/partner/announcements", requireAuth, async (req, res) => {
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

router.post("/admin/partner/certifications", requireAuth, async (req, res) => {
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

router.get("/admin/partner/commissions", requireAdmin, async (_req, res) => {
  try {
    const commissions = await db.select({
      id: partnerCommissionsTable.id,
      partnerId: partnerCommissionsTable.partnerId,
      dealId: partnerCommissionsTable.dealId,
      type: partnerCommissionsTable.type,
      description: partnerCommissionsTable.description,
      amount: partnerCommissionsTable.amount,
      rate: partnerCommissionsTable.rate,
      status: partnerCommissionsTable.status,
      paidAt: partnerCommissionsTable.paidAt,
      periodStart: partnerCommissionsTable.periodStart,
      periodEnd: partnerCommissionsTable.periodEnd,
      createdAt: partnerCommissionsTable.createdAt,
      partnerCompany: partnersTable.companyName,
      partnerContact: partnersTable.contactName,
      partnerEmail: partnersTable.email,
    }).from(partnerCommissionsTable)
      .leftJoin(partnersTable, eq(partnerCommissionsTable.partnerId, partnersTable.id))
      .orderBy(desc(partnerCommissionsTable.createdAt));
    res.json(commissions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to load commissions" });
  }
});

router.post("/admin/partner/commissions", requireAdmin, async (req, res) => {
  try {
    const { partnerId, dealId, type, description, amount, rate, status, periodStart, periodEnd } = req.body;
    const [commission] = await db.insert(partnerCommissionsTable).values({
      partnerId, dealId: dealId || null,
      type: type || "deal", description,
      amount: parseFloat(amount).toFixed(2),
      rate: rate || null,
      status: status || "pending",
      periodStart: periodStart ? new Date(periodStart) : null,
      periodEnd: periodEnd ? new Date(periodEnd) : null,
    }).returning();
    res.status(201).json(commission);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to create commission" });
  }
});

router.put("/admin/partner/commissions/:id", requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body;
    const validStatuses = ["pending", "approved", "paid", "disputed", "rejected"];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ error: "invalid_status", message: `Status must be one of: ${validStatuses.join(", ")}` });
      return;
    }
    const updates: any = { status };
    if (status === "paid") updates.paidAt = new Date();
    const [commission] = await db.update(partnerCommissionsTable).set(updates).where(eq(partnerCommissionsTable.id, id)).returning();
    res.json(commission);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to update commission" });
  }
});

router.get("/admin/partner/tickets", requireAuth, async (_req, res) => {
  try {
    const tickets = await db.select().from(partnerSupportTicketsTable).orderBy(desc(partnerSupportTicketsTable.createdAt));
    res.json(tickets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to load partner tickets" });
  }
});

router.put("/admin/partner/tickets/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status, assignedTo, resolution } = req.body;
    const updates: any = { updatedAt: new Date() };
    if (status) updates.status = status;
    if (assignedTo !== undefined) updates.assignedTo = assignedTo;
    if (resolution !== undefined) updates.resolution = resolution;
    if (status === "resolved") updates.resolvedAt = new Date();
    const [ticket] = await db.update(partnerSupportTicketsTable).set(updates).where(eq(partnerSupportTicketsTable.id, id)).returning();
    res.json(ticket);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to update ticket" });
  }
});

router.post("/admin/partner/tickets/:id/messages", requireAuth, async (req, res) => {
  try {
    const ticketId = parseInt(req.params.id);
    const { message, senderName } = req.body;
    const [msg] = await db.insert(partnerTicketMessagesTable).values({
      ticketId, senderType: "admin",
      senderName: senderName || "Siebert Services",
      message,
    }).returning();
    res.status(201).json(msg);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to send message" });
  }
});

router.put("/admin/partner/mdf/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status, approvedAmount } = req.body;
    const updates: any = { updatedAt: new Date() };
    if (status) updates.status = status;
    if (approvedAmount !== undefined) updates.approvedAmount = parseFloat(approvedAmount).toFixed(2);
    if (status === "approved") updates.approvedAt = new Date();
    const [request] = await db.update(partnerMdfRequestsTable).set(updates).where(eq(partnerMdfRequestsTable.id, id)).returning();
    res.json(request);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to update MDF request" });
  }
});

function sanitizePartner(partner: any) {
  const { password: _, ...safe } = partner;
  return { ...safe, specializations: JSON.parse(safe.specializations || "[]") };
}

export default router;
