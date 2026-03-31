import { Router, type IRouter } from "express";
import { Response } from "express";
import bcrypt from "bcryptjs";
import { db, partnersTable, partnerDealsTable, partnerLeadsTable, partnerResourcesTable, partnerCertificationsTable, partnerCertProgressTable, partnerAnnouncementsTable, partnerCommissionsTable, partnerSupportTicketsTable, partnerTicketMessagesTable, ticketsTable, ticketMessagesTable, usersTable, tsdDealPushLogsTable, tsdProductsTable, telarusVendorsTable, trainingRequestsTable } from "@workspace/db";
import { eq, and, desc, sql, count, sum, asc } from "drizzle-orm";
import { requirePartnerAuth, requirePartnerAdmin, generatePartnerToken, isMainSiteAdmin, PartnerRequest, MAIN_SITE_ADMIN_SENTINEL } from "../middlewares/partnerAuth.js";
import { requireAuth, requireAdmin, type AuthRequest } from "../middlewares/auth.js";
import { sendDealSubmittedNotification, sendLeadSubmittedNotification, sendTicketSubmittedNotification, sendTrainingRequestNotification, sendPartnerRegistrationNotification, sendPartnerApprovalNotification, sendPartnerTierChangeNotification } from "../lib/email.js";
import { pushDeal, type TsdId } from "../lib/tsd-adapter.js";

const router: IRouter = Router();

// ─── Tier Promotion (Revenue-based) ────────────────────────────────────────────
const TIER_THRESHOLDS = {
  silver: 100000,
  gold: 250000,
  platinum: 500000,
};

async function promotePartnerByRevenue(partnerId: number) {
  try {
    const [partner] = await db.select({
      id: partnersTable.id,
      tier: partnersTable.tier,
      ytdRevenue: partnersTable.ytdRevenue,
    }).from(partnersTable).where(eq(partnersTable.id, partnerId)).limit(1);
    
    if (!partner) return;
    
    const ytd = parseFloat(String(partner.ytdRevenue || 0));
    let newTier = partner.tier;
    
    if (ytd >= TIER_THRESHOLDS.platinum && partner.tier !== "platinum") {
      newTier = "platinum";
    } else if (ytd >= TIER_THRESHOLDS.gold && !["gold", "platinum"].includes(partner.tier)) {
      newTier = "gold";
    } else if (ytd >= TIER_THRESHOLDS.silver && !["silver", "gold", "platinum"].includes(partner.tier)) {
      newTier = "silver";
    }
    
    if (newTier !== partner.tier) {
      const [updated] = await db.update(partnersTable).set({
        tier: newTier as any,
        updatedAt: new Date(),
      }).where(eq(partnersTable.id, partnerId)).returning();
      console.log(`✓ Partner #${partnerId} promoted: ${partner.tier} → ${newTier} (YTD: $${ytd.toLocaleString()})`);
      if (updated) {
        sendPartnerTierChangeNotification({
          companyName: updated.companyName,
          contactName: updated.contactName,
          email: updated.email,
        }, partner.tier, newTier).catch(err => console.error("[Email] Partner auto-promotion tier notification error:", err));
      }
    }
  } catch (err) {
    console.error("Error promoting partner:", err);
  }
}

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
    const token = generatePartnerToken(partner.id, partner.isAdmin);
    res.status(201).json({ token, partner: sanitizePartner(partner) });
    sendPartnerRegistrationNotification({
      companyName: partner.companyName,
      contactName: partner.contactName,
      email: partner.email,
      password,
    }).catch(err => console.error("[Email] Partner registration notification error:", err));
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
    const token = generatePartnerToken(partner.id, partner.isAdmin);
    res.json({ token, partner: sanitizePartner(partner) });
  } catch (err) {
    console.error("Partner login error:", err);
    res.status(500).json({ error: "server_error", message: "Login failed" });
  }
});

router.get("/partner/auth/me", requirePartnerAuth, async (req: PartnerRequest, res: Response) => {
  try {
    if (req.partnerId === MAIN_SITE_ADMIN_SENTINEL) {
      const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.mainSiteUserId!)).limit(1);
      if (!user) { res.status(404).json({ error: "not_found", message: "Admin user not found" }); return; }
      res.json({
        id: user.id,
        companyName: user.company || "Siebert Services (Admin)",
        contactName: user.name,
        email: user.email,
        phone: user.phone || null,
        tier: "platinum",
        status: "approved",
        totalDeals: 0,
        ytdRevenue: "0",
        isAdmin: true,
        isMainSiteAdmin: true,
        specializations: [],
      });
      return;
    }
    const [partner] = await db.select().from(partnersTable).where(eq(partnersTable.id, req.partnerId!)).limit(1);
    if (!partner) { res.status(404).json({ error: "not_found", message: "Partner not found" }); return; }
    res.json(sanitizePartner(partner));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to get profile" });
  }
});

router.post("/partner/auth/change-password", requirePartnerAuth, async (req: PartnerRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      res.status(400).json({ error: "validation_error", message: "currentPassword and newPassword are required" });
      return;
    }
    const [partner] = await db.select().from(partnersTable).where(eq(partnersTable.id, req.partnerId!)).limit(1);
    if (!partner) {
      res.status(404).json({ error: "not_found", message: "Partner not found" });
      return;
    }
    const valid = await bcrypt.compare(currentPassword, partner.password);
    if (!valid) {
      res.status(401).json({ error: "unauthorized", message: "Current password is incorrect" });
      return;
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.update(partnersTable).set({ password: hashedPassword, updatedAt: new Date() }).where(eq(partnersTable.id, req.partnerId!));
    res.json({ success: true, message: "Password changed successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to change password" });
  }
});

router.put("/partner/profile", requirePartnerAuth, async (req: PartnerRequest, res: Response) => {
  if (isMainSiteAdmin(req)) { res.status(403).json({ error: "forbidden", message: "Profile updates are not available for admin accounts here" }); return; }
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
    if (req.partnerId === MAIN_SITE_ADMIN_SENTINEL) {
      const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.mainSiteUserId!)).limit(1);
      res.json({
        partner: {
          id: req.mainSiteUserId,
          companyName: user?.company || "Siebert Services (Admin)",
          contactName: user?.name || "Admin",
          email: user?.email || "",
          tier: "platinum",
          status: "approved",
          isAdmin: true,
          isMainSiteAdmin: true,
          totalDeals: 0,
          ytdRevenue: "0",
          specializations: [],
        },
        stats: { totalDeals: 0, activeDeals: 0, wonDeals: 0, totalPipeline: 0, totalRevenue: 0, pendingCommissions: 0, paidCommissions: 0, openTickets: 0, totalLeads: 0, convertedLeads: 0 },
        dealsByStage: {},
        monthlyDeals: {},
        recentDeals: [],
        recentCommissions: [],
      });
      return;
    }
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
  if (isMainSiteAdmin(req)) { res.json([]); return; }
  try {
    const deals = await db.select().from(partnerDealsTable)
      .where(eq(partnerDealsTable.partnerId, req.partnerId!))
      .orderBy(desc(partnerDealsTable.createdAt));
    res.json(deals.map(d => ({
      ...d,
      products: JSON.parse(d.products),
      tsdTargets: JSON.parse(d.tsdTargets || "[]"),
      vendorSelections: JSON.parse(d.vendorSelections || "[]"),
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to load deals" });
  }
});

router.post("/partner/deals", requirePartnerAuth, async (req: PartnerRequest, res: Response) => {
  if (isMainSiteAdmin(req)) {
    res.status(403).json({ error: "forbidden", message: "Admin accounts cannot register deals through the partner interface. Use the admin panel." });
    return;
  }
  try {
    const { title, customerName, customerEmail, customerPhone, description, products, vendorSelections, estimatedValue, stage, expectedCloseDate, notes, tsdTargets } = req.body;
    if (!title || !customerName) {
      res.status(400).json({ error: "validation_error", message: "title and customerName are required" });
      return;
    }
    const confirmedTsdTargets: TsdId[] = Array.isArray(tsdTargets) ? tsdTargets : [];
    const [deal] = await db.insert(partnerDealsTable).values({
      partnerId: req.partnerId!,
      title, customerName,
      customerEmail: customerEmail || null, customerPhone: customerPhone || null,
      description: description || null,
      products: JSON.stringify(products || []),
      vendorSelections: JSON.stringify(Array.isArray(vendorSelections) ? vendorSelections : []),
      estimatedValue: estimatedValue || null,
      stage: stage || "prospect",
      expectedCloseDate: expectedCloseDate ? new Date(expectedCloseDate) : null,
      notes: notes || null,
      tsdTargets: JSON.stringify(confirmedTsdTargets),
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

    if (confirmedTsdTargets.length > 0 && partner) {
      const productList: string[] = JSON.parse(deal.products || "[]");
      const payload = {
        dealId: deal.id,
        title: deal.title,
        customerName: deal.customerName,
        customerEmail: deal.customerEmail,
        products: productList,
        estimatedValue: deal.estimatedValue,
        partnerCompany: partner.companyName,
        partnerEmail: partner.email,
      };
      const pushPromises = confirmedTsdTargets.map(async (tsdId) => {
        try {
          const result = await pushDeal(tsdId, payload);
          await db.insert(tsdDealPushLogsTable).values({
            dealId: deal.id,
            tsdId,
            status: result.success ? "success" : "failed",
            errorMessage: result.success ? null : result.errorMessage,
            payload: JSON.stringify({ externalId: result.externalId }),
          });
        } catch (pushErr: any) {
          console.error(`[TSD] Push to ${tsdId} failed:`, pushErr);
          await db.insert(tsdDealPushLogsTable).values({
            dealId: deal.id,
            tsdId,
            status: "failed",
            errorMessage: pushErr.message || "Unknown error",
          }).catch(() => {});
        }
      });
      Promise.all(pushPromises).catch(err => console.error("[TSD] Push batch error:", err));
    }

    res.status(201).json({ ...deal, products: JSON.parse(deal.products), tsdTargets: confirmedTsdTargets, vendorSelections: JSON.parse(deal.vendorSelections || "[]") });
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
          const [partnerRecord] = await tx.select({ commissionRate: partnersTable.commissionRate }).from(partnersTable).where(eq(partnersTable.id, req.partnerId!)).limit(1);
          const COMMISSION_RATE = parseFloat(partnerRecord?.commissionRate || "10") / 100;
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
    
    if (status === "won" && !wasPreviouslyWon) {
      await promotePartnerByRevenue(req.partnerId!);
    }
    
    res.json({ ...result, products: JSON.parse(result.products) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to update deal" });
  }
});

// ─── Leads ────────────────────────────────────────────────────────────────────

router.get("/partner/leads", requirePartnerAuth, async (req: PartnerRequest, res: Response) => {
  if (isMainSiteAdmin(req)) { res.json([]); return; }
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

router.post("/partner/leads", requirePartnerAuth, async (req: PartnerRequest, res: Response) => {
  if (isMainSiteAdmin(req)) {
    res.status(403).json({ error: "forbidden", message: "Admin accounts cannot submit leads through the partner interface. Use the admin panel." });
    return;
  }
  try {
    const { companyName, contactName, email, phone, interest, notes } = req.body;
    if (!companyName || !contactName || !interest) {
      res.status(400).json({ error: "invalid_input", message: "Company name, contact name, and interest are required" });
      return;
    }
    const [lead] = await db.insert(partnerLeadsTable).values({
      partnerId: req.partnerId!,
      companyName: companyName.trim(),
      contactName: contactName.trim(),
      email: email?.trim() || null,
      phone: phone?.trim() || null,
      interest: interest.trim(),
      notes: notes?.trim() || null,
      source: "partner_submission",
    }).returning();
    
    res.status(201).json(lead);
    
    const [partner] = await db.select().from(partnersTable).where(eq(partnersTable.id, req.partnerId!)).limit(1);
    if (partner) {
      sendLeadSubmittedNotification(lead, {
        companyName: partner.companyName,
        contactName: partner.contactName,
        email: partner.email,
      }).catch(err => console.error("[Email] Lead notification error:", err));
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to submit lead" });
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
  if (isMainSiteAdmin(req)) {
    res.status(403).json({ error: "forbidden", message: "Admin accounts do not have certification progress to track." });
    return;
  }
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

// ─── TSD Product Catalog (Partner-facing) ─────────────────────────────────────

router.get("/partner/tsd-products", requirePartnerAuth, async (_req: PartnerRequest, res: Response) => {
  try {
    const products = await db.select().from(tsdProductsTable)
      .where(eq(tsdProductsTable.active, true))
      .orderBy(tsdProductsTable.category, asc(tsdProductsTable.sortOrder), tsdProductsTable.name);
    const parsed = products.map(p => ({ ...p, availableAt: JSON.parse(p.availableAt) }));
    const grouped: Record<string, typeof parsed> = {};
    for (const p of parsed) {
      if (!grouped[p.category]) grouped[p.category] = [];
      grouped[p.category].push(p);
    }
    res.json({ products: parsed, grouped });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to load product catalog" });
  }
});

// ─── Vendors (Telarus) ────────────────────────────────────────────────────────

router.get("/partner/vendors", requirePartnerAuth, async (_req: PartnerRequest, res: Response) => {
  try {
    const rows = await db.select({
      id: telarusVendorsTable.id,
      externalId: telarusVendorsTable.externalId,
      name: telarusVendorsTable.name,
      accountType: telarusVendorsTable.accountType,
      industry: telarusVendorsTable.industry,
      website: telarusVendorsTable.website,
      partnerType: telarusVendorsTable.partnerType,
      isActive: telarusVendorsTable.isActive,
      products: telarusVendorsTable.products,
    })
      .from(telarusVendorsTable)
      .where(eq(telarusVendorsTable.isActive, true))
      .orderBy(asc(telarusVendorsTable.name));
    const vendors = rows.map(v => {
      try {
        return { ...v, products: JSON.parse(v.products || "[]") };
      } catch (e) {
        console.error(`Failed to parse products for vendor ${v.name}:`, v.products, e);
        return { ...v, products: [] };
      }
    });
    res.json(vendors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to load vendors" });
  }
});

// ─── Commissions ──────────────────────────────────────────────────────────────

router.get("/partner/commissions", requirePartnerAuth, async (req: PartnerRequest, res: Response) => {
  if (isMainSiteAdmin(req)) { res.json([]); return; }
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
  if (isMainSiteAdmin(req)) { res.json({ totalEarned: 0, pending: 0, paid: 0, approved: 0, monthlyEarnings: {}, totalTransactions: 0 }); return; }
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

// ─── Partner: Dispute commission ──────────────────────────────────────────────

router.post("/partner/commissions/:id/dispute", requirePartnerAuth, async (req: PartnerRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const { reason } = req.body;
    const [commission] = await db.select()
      .from(partnerCommissionsTable)
      .where(and(eq(partnerCommissionsTable.id, id), eq(partnerCommissionsTable.partnerId, req.partnerId!)))
      .limit(1);
    if (!commission) { res.status(404).json({ error: "not_found" }); return; }
    if (!["pending", "approved"].includes(commission.status)) {
      res.status(400).json({ error: "invalid_status", message: "Only pending or approved commissions can be disputed" });
      return;
    }
    const [updated] = await db.update(partnerCommissionsTable)
      .set({ status: "disputed", notes: reason || "Partner disputed this commission" })
      .where(eq(partnerCommissionsTable.id, id)).returning();
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to dispute commission" });
  }
});

// ─── Support Tickets ──────────────────────────────────────────────────────────

router.get("/partner/tickets", requirePartnerAuth, async (req: PartnerRequest, res: Response) => {
  if (isMainSiteAdmin(req)) { res.json([]); return; }
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
  if (isMainSiteAdmin(req)) {
    res.status(403).json({ error: "forbidden", message: "Admin accounts cannot submit support tickets. Please use a partner account." });
    return;
  }
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

router.post("/admin/partners", requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { companyName, contactName, email, password, phone, website, address, city, state, zip, country, businessType, yearsInBusiness, employeeCount, annualRevenue, specializations, tier, status } = req.body;
    if (!companyName || !contactName || !email || !password) {
      res.status(400).json({ error: "validation_error", message: "companyName, contactName, email, and password are required" });
      return;
    }
    const existing = await db.select({ id: partnersTable.id }).from(partnersTable).where(eq(partnersTable.email, email)).limit(1);
    if (existing.length > 0) {
      res.status(400).json({ error: "conflict", message: "A partner with this email already exists" });
      return;
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const [partner] = await db.insert(partnersTable).values({
      companyName, contactName, email, password: hashedPassword,
      phone: phone || null, website: website || null,
      address: address || null, city: city || null, state: state || null, zip: zip || null,
      country: country || "US", businessType: businessType || null,
      yearsInBusiness: yearsInBusiness || null, employeeCount: employeeCount || null,
      annualRevenue: annualRevenue || null,
      specializations: JSON.stringify(Array.isArray(specializations) ? specializations : []),
      tier: tier || "registered",
      status: status || "approved",
      approvedAt: (status === "approved" || !status) ? new Date() : null,
    }).returning();
    res.status(201).json(sanitizePartner(partner));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to create partner" });
  }
});

router.get("/admin/partners/:id", requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const [partner] = await db.select().from(partnersTable).where(eq(partnersTable.id, id)).limit(1);
    if (!partner) { res.status(404).json({ error: "not_found", message: "Partner not found" }); return; }
    const deals = await db.select().from(partnerDealsTable).where(eq(partnerDealsTable.partnerId, id)).orderBy(desc(partnerDealsTable.createdAt));
    res.json({ ...sanitizePartner(partner), deals });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to load partner" });
  }
});

router.put("/admin/partners/:id", requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { companyName, contactName, email, phone, website, address, city, state, zip, country, businessType, yearsInBusiness, employeeCount, annualRevenue, specializations, tier, status } = req.body;
    const [existing] = await db.select({ status: partnersTable.status, tier: partnersTable.tier }).from(partnersTable).where(eq(partnersTable.id, id)).limit(1);
    const updates: Record<string, any> = { updatedAt: new Date() };
    if (companyName !== undefined) updates.companyName = companyName;
    if (contactName !== undefined) updates.contactName = contactName;
    if (email !== undefined) updates.email = email;
    if (phone !== undefined) updates.phone = phone || null;
    if (website !== undefined) updates.website = website || null;
    if (address !== undefined) updates.address = address || null;
    if (city !== undefined) updates.city = city || null;
    if (state !== undefined) updates.state = state || null;
    if (zip !== undefined) updates.zip = zip || null;
    if (country !== undefined) updates.country = country || "US";
    if (businessType !== undefined) updates.businessType = businessType || null;
    if (yearsInBusiness !== undefined) updates.yearsInBusiness = yearsInBusiness || null;
    if (employeeCount !== undefined) updates.employeeCount = employeeCount || null;
    if (annualRevenue !== undefined) updates.annualRevenue = annualRevenue || null;
    if (specializations !== undefined) updates.specializations = JSON.stringify(Array.isArray(specializations) ? specializations : []);
    if (tier !== undefined) updates.tier = tier;
    if (status !== undefined) {
      updates.status = status;
      if (status === "approved") updates.approvedAt = new Date();
    }
    const [partner] = await db.update(partnersTable).set(updates).where(eq(partnersTable.id, id)).returning();
    if (!partner) { res.status(404).json({ error: "not_found", message: "Partner not found" }); return; }
    res.json(sanitizePartner(partner));
    if (status === "approved" && existing && existing.status !== "approved") {
      sendPartnerApprovalNotification({
        companyName: partner.companyName,
        contactName: partner.contactName,
        email: partner.email,
      }).catch(err => console.error("[Email] Partner approval notification error:", err));
    }
    if (tier !== undefined && existing && existing.tier !== tier) {
      sendPartnerTierChangeNotification({
        companyName: partner.companyName,
        contactName: partner.contactName,
        email: partner.email,
      }, existing.tier, tier).catch(err => console.error("[Email] Partner tier change notification error:", err));
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to update partner" });
  }
});

router.post("/admin/partners/:id/reset-password", requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { password } = req.body;
    if (!password || password.length < 8) {
      res.status(400).json({ error: "validation_error", message: "Password must be at least 8 characters" });
      return;
    }
    const hashed = await bcrypt.hash(password, 10);
    await db.update(partnersTable).set({ password: hashed, updatedAt: new Date() }).where(eq(partnersTable.id, id));
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to reset password" });
  }
});

router.delete("/admin/partners/:id", requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(partnersTable).where(eq(partnersTable.id, id));
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to delete partner" });
  }
});

router.put("/admin/partners/:id/approve", requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const [existing] = await db.select({ status: partnersTable.status }).from(partnersTable).where(eq(partnersTable.id, id)).limit(1);
    const wasAlreadyApproved = existing?.status === "approved";
    const [partner] = await db.update(partnersTable).set({
      status: "approved", approvedAt: new Date(), updatedAt: new Date(),
    }).where(eq(partnersTable.id, id)).returning();
    res.json(sanitizePartner(partner));
    if (partner && !wasAlreadyApproved) {
      sendPartnerApprovalNotification({
        companyName: partner.companyName,
        contactName: partner.contactName,
        email: partner.email,
      }).catch(err => console.error("[Email] Partner approval notification error:", err));
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to approve partner" });
  }
});

router.put("/admin/partners/:id/tier", requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { tier } = req.body;
    const [existing] = await db.select({ tier: partnersTable.tier }).from(partnersTable).where(eq(partnersTable.id, id)).limit(1);
    const [partner] = await db.update(partnersTable).set({ tier, updatedAt: new Date() }).where(eq(partnersTable.id, id)).returning();
    res.json(sanitizePartner(partner));
    if (partner && existing && existing.tier !== tier) {
      sendPartnerTierChangeNotification({
        companyName: partner.companyName,
        contactName: partner.contactName,
        email: partner.email,
      }, existing.tier, tier).catch(err => console.error("[Email] Partner tier change notification error:", err));
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to update tier" });
  }
});

router.put("/admin/partners/:id/client-tickets", requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { enabled } = req.body;
    const [partner] = await db.update(partnersTable).set({ 
      clientTicketsEnabled: typeof enabled === "boolean" ? enabled : !((await db.select({ clientTicketsEnabled: partnersTable.clientTicketsEnabled }).from(partnersTable).where(eq(partnersTable.id, id)).limit(1))[0]?.clientTicketsEnabled),
      updatedAt: new Date() 
    }).where(eq(partnersTable.id, id)).returning();
    if (!partner) { res.status(404).json({ error: "not_found", message: "Partner not found" }); return; }
    res.json({ clientTicketsEnabled: partner.clientTicketsEnabled });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to toggle client tickets" });
  }
});

router.post("/admin/partners/promote/check", requireAuth, async (_req, res) => {
  try {
    const partners = await db.select({ id: partnersTable.id }).from(partnersTable);
    let promotedCount = 0;
    for (const p of partners) {
      const [before] = await db.select({ tier: partnersTable.tier }).from(partnersTable).where(eq(partnersTable.id, p.id)).limit(1);
      await promotePartnerByRevenue(p.id);
      const [after] = await db.select({ tier: partnersTable.tier }).from(partnersTable).where(eq(partnersTable.id, p.id)).limit(1);
      if (before.tier !== after.tier) promotedCount++;
    }
    res.json({ message: `Checked ${partners.length} partners, promoted ${promotedCount}`, thresholds: TIER_THRESHOLDS });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to check promotions" });
  }
});

router.get("/admin/tier-thresholds", requireAuth, (_req, res) => {
  res.json({
    thresholds: TIER_THRESHOLDS,
    tiers: ["registered", "silver", "gold", "platinum"],
    description: "Partners are automatically promoted based on YTD revenue when deals are closed, or manually via /admin/partners/promote/check"
  });
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
    
    const [partner] = await db.select().from(partnersTable).where(eq(partnersTable.id, partnerId)).limit(1);
    if (partner) {
      sendLeadSubmittedNotification(lead, {
        companyName: partner.companyName,
        contactName: partner.contactName,
        email: partner.email,
      }).catch(err => console.error("[Email] Lead notification error:", err));
    }
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

router.get("/admin/partner/commissions/export", requireAdmin, async (_req, res) => {
  try {
    const commissions = await db.select({
      id: partnerCommissionsTable.id,
      partnerCompany: partnersTable.companyName,
      partnerContact: partnersTable.contactName,
      partnerEmail: partnersTable.email,
      type: partnerCommissionsTable.type,
      description: partnerCommissionsTable.description,
      amount: partnerCommissionsTable.amount,
      rate: partnerCommissionsTable.rate,
      status: partnerCommissionsTable.status,
      notes: partnerCommissionsTable.notes,
      paidAt: partnerCommissionsTable.paidAt,
      createdAt: partnerCommissionsTable.createdAt,
    }).from(partnerCommissionsTable)
      .leftJoin(partnersTable, eq(partnerCommissionsTable.partnerId, partnersTable.id))
      .orderBy(desc(partnerCommissionsTable.createdAt));

    const rows = [
      ["ID", "Partner Company", "Contact", "Email", "Type", "Description", "Amount", "Rate %", "Status", "Notes", "Paid At", "Created At"],
      ...commissions.map(c => [
        c.id,
        c.partnerCompany || "",
        c.partnerContact || "",
        c.partnerEmail || "",
        c.type,
        c.description,
        c.amount,
        c.rate || "",
        c.status,
        c.notes || "",
        c.paidAt ? new Date(c.paidAt).toISOString() : "",
        new Date(c.createdAt).toISOString(),
      ])
    ];
    const csv = rows.map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="commissions-${new Date().toISOString().slice(0, 10)}.csv"`);
    res.send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to export commissions" });
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
    const { status, notes, amount, rate } = req.body;
    const updates: any = {};
    if (status !== undefined) {
      const validStatuses = ["pending", "approved", "paid", "disputed", "rejected"];
      if (!validStatuses.includes(status)) {
        res.status(400).json({ error: "invalid_status", message: `Status must be one of: ${validStatuses.join(", ")}` });
        return;
      }
      updates.status = status;
      if (status === "paid") updates.paidAt = new Date();
    }
    if (notes !== undefined) updates.notes = notes || null;
    if (amount !== undefined) updates.amount = parseFloat(amount).toFixed(2);
    if (rate !== undefined) updates.rate = rate || null;
    if (Object.keys(updates).length === 0) {
      res.status(400).json({ error: "validation_error", message: "No fields to update" });
      return;
    }
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

router.get("/admin/partner/tickets/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [ticket] = await db.select().from(partnerSupportTicketsTable).where(eq(partnerSupportTicketsTable.id, id)).limit(1);
    if (!ticket) { res.status(404).json({ error: "not_found" }); return; }
    const messages = await db.select().from(partnerTicketMessagesTable)
      .where(eq(partnerTicketMessagesTable.ticketId, id))
      .orderBy(asc(partnerTicketMessagesTable.createdAt));
    res.json({ ...ticket, messages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to load ticket" });
  }
});

router.delete("/admin/partner/tickets/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(partnerTicketMessagesTable).where(eq(partnerTicketMessagesTable.ticketId, id));
    await db.delete(partnerSupportTicketsTable).where(eq(partnerSupportTicketsTable.id, id));
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to delete ticket" });
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

// ─── Partner Admin: Client Ticket Management ──────────────────────────────────

router.get("/partner/admin/client-tickets", requirePartnerAdmin, async (_req: PartnerRequest, res: Response) => {
  try {
    const tickets = await db
      .select({
        id: ticketsTable.id,
        subject: ticketsTable.subject,
        description: ticketsTable.description,
        priority: ticketsTable.priority,
        status: ticketsTable.status,
        category: ticketsTable.category,
        createdAt: ticketsTable.createdAt,
        updatedAt: ticketsTable.updatedAt,
        userId: ticketsTable.userId,
        clientName: usersTable.name,
        clientEmail: usersTable.email,
        clientCompany: usersTable.company,
      })
      .from(ticketsTable)
      .leftJoin(usersTable, eq(ticketsTable.userId, usersTable.id))
      .orderBy(desc(ticketsTable.createdAt));
    res.json(tickets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to load client tickets" });
  }
});

router.get("/partner/admin/client-tickets/:id", requirePartnerAdmin, async (req: PartnerRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const [ticket] = await db
      .select({
        id: ticketsTable.id,
        subject: ticketsTable.subject,
        description: ticketsTable.description,
        priority: ticketsTable.priority,
        status: ticketsTable.status,
        category: ticketsTable.category,
        createdAt: ticketsTable.createdAt,
        updatedAt: ticketsTable.updatedAt,
        userId: ticketsTable.userId,
        clientName: usersTable.name,
        clientEmail: usersTable.email,
        clientCompany: usersTable.company,
      })
      .from(ticketsTable)
      .leftJoin(usersTable, eq(ticketsTable.userId, usersTable.id))
      .where(eq(ticketsTable.id, id))
      .limit(1);
    if (!ticket) { res.status(404).json({ error: "not_found" }); return; }
    const messages = await db.select().from(ticketMessagesTable)
      .where(eq(ticketMessagesTable.ticketId, id))
      .orderBy(ticketMessagesTable.createdAt);
    res.json({ ...ticket, messages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to load ticket" });
  }
});

router.put("/partner/admin/client-tickets/:id", requirePartnerAdmin, async (req: PartnerRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const { status } = req.body;
    const updates: any = { updatedAt: new Date() };
    if (status) updates.status = status;
    const [ticket] = await db.update(ticketsTable).set(updates).where(eq(ticketsTable.id, id)).returning();
    res.json(ticket);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to update ticket" });
  }
});

router.post("/partner/admin/client-tickets/:id/messages", requirePartnerAdmin, async (req: PartnerRequest, res: Response) => {
  try {
    const ticketId = parseInt(req.params.id as string);
    const { message } = req.body;
    if (!message) { res.status(400).json({ error: "validation_error", message: "message is required" }); return; }

    const [ticket] = await db.select().from(ticketsTable).where(eq(ticketsTable.id, ticketId)).limit(1);
    if (!ticket) { res.status(404).json({ error: "not_found" }); return; }

    const [msg] = await db.insert(ticketMessagesTable).values({
      ticketId,
      senderType: "admin",
      senderName: "Siebert Services",
      message,
    }).returning();

    if (ticket.status === "open") {
      await db.update(ticketsTable).set({ status: "in_progress", updatedAt: new Date() }).where(eq(ticketsTable.id, ticketId));
    }

    res.status(201).json(msg);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to send message" });
  }
});

// ─── Training Requests ────────────────────────────────────────────────────────

router.post("/training-requests", requirePartnerAuth, async (req: PartnerRequest, res: Response) => {
  if (isMainSiteAdmin(req)) { res.status(403).json({ error: "forbidden", message: "Training requests must be submitted by a partner account" }); return; }
  try {
    const { vendorName, topic, preferredDate, attendeeCount, contactName, contactEmail, notes } = req.body;

    if (!vendorName || typeof vendorName !== "string" || vendorName.trim().length === 0) {
      res.status(400).json({ error: "validation_error", message: "vendorName is required" });
      return;
    }
    if (!topic || typeof topic !== "string" || topic.trim().length === 0) {
      res.status(400).json({ error: "validation_error", message: "topic is required" });
      return;
    }
    if (!contactName || typeof contactName !== "string" || contactName.trim().length === 0) {
      res.status(400).json({ error: "validation_error", message: "contactName is required" });
      return;
    }
    if (!contactEmail || typeof contactEmail !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
      res.status(400).json({ error: "validation_error", message: "A valid contactEmail is required" });
      return;
    }

    const parsedAttendeeCount = attendeeCount !== undefined ? parseInt(String(attendeeCount), 10) : 1;
    if (isNaN(parsedAttendeeCount) || parsedAttendeeCount < 1 || parsedAttendeeCount > 10000) {
      res.status(400).json({ error: "validation_error", message: "attendeeCount must be a positive integer" });
      return;
    }

    const [request] = await db.insert(trainingRequestsTable).values({
      partnerId: req.partnerId!,
      vendorName: vendorName.trim(),
      topic: topic.trim(),
      preferredDate: preferredDate ? String(preferredDate).trim() : null,
      attendeeCount: parsedAttendeeCount,
      contactName: contactName.trim(),
      contactEmail: contactEmail.trim().toLowerCase(),
      notes: notes ? String(notes).trim() : null,
    }).returning();

    const [partner] = await db.select().from(partnersTable).where(eq(partnersTable.id, req.partnerId!)).limit(1);
    if (partner) {
      sendTrainingRequestNotification(
        {
          vendorName: request.vendorName,
          topic: request.topic,
          preferredDate: request.preferredDate,
          attendeeCount: request.attendeeCount,
          contactName: request.contactName,
          contactEmail: request.contactEmail,
          notes: request.notes,
        },
        {
          companyName: partner.companyName,
          contactName: partner.contactName,
          email: partner.email,
        }
      ).catch(err => console.error("[Email] Training request notification error:", err));
    }

    res.status(201).json(request);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to submit training request" });
  }
});

function sanitizePartner(partner: any) {
  const { password: _, ...safe } = partner;
  return { ...safe, specializations: JSON.parse(safe.specializations || "[]") };
}

export default router;
