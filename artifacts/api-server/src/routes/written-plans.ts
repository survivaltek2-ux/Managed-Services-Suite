import { Router, Request, Response } from "express";
import { db, writtenPlansTable, planActivityEventsTable, validateQuestionnaireAnswers, partnersTable } from "@workspace/db";
import { eq, desc, and, lt, gt, inArray, sql } from "drizzle-orm";
import { requirePartnerAuth, PartnerRequest, MAIN_SITE_ADMIN_SENTINEL } from "../middlewares/partnerAuth.js";
import {
  sendPlanReadyEmail,
  sendPlanApprovedEmail,
  sendPlanCallRequestedEmail,
  sendPlanDeclinedEmail,
  sendPlanExpiringEmail,
} from "../lib/email.js";
import { generatePlanPdf } from "../lib/planPdf.js";
import crypto from "crypto";

const router = Router();

// ─── Typed JSON shapes ────────────────────────────────────────────────────────

interface RecommendedService { service: string; description: string; }
interface PlanContentShape {
  executiveSummary: string;
  currentEnvironment: string;
  keyFindings: string[];
  recommendedServices: RecommendedService[];
  nextSteps: string[];
}
type QuestionnaireAnswers = Record<string, string | string[]>;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function generatePlanNumber(): string {
  const now = new Date();
  const y = now.getFullYear().toString().slice(-2);
  const m = (now.getMonth() + 1).toString().padStart(2, "0");
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `WP-${y}${m}-${rand}`;
}

function generateReviewToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

async function logEvent(planId: number, eventType: string, metadata: object = {}) {
  await db.insert(planActivityEventsTable).values({ planId, eventType, metadata });
}

// ─── Pain-point → service mapping ────────────────────────────────────────────

const PAIN_POINT_MAP: Record<string, { service: string; description: string }> = {
  downtime: {
    service: "Managed IT Support",
    description: "Proactive monitoring and rapid response to eliminate unplanned downtime and keep your systems running at full capacity.",
  },
  security: {
    service: "Cybersecurity Bundle",
    description: "Endpoint detection & response, threat monitoring, and security hardening to protect your business from modern threats.",
  },
  compliance: {
    service: "Compliance Services",
    description: "HIPAA, SOC 2, and CMMC program management to help you meet regulatory requirements and pass audits confidently.",
  },
  backup: {
    service: "Backup & Disaster Recovery",
    description: "Immutable, tested backups with rapid restore capabilities to ensure business continuity after any incident.",
  },
  email: {
    service: "Microsoft 365 Management",
    description: "Full administration of Microsoft 365, including security hardening, licensing, and user lifecycle management.",
  },
  remote: {
    service: "Remote Workforce Enablement",
    description: "Secure VPN, MFA, and collaboration tools to support a productive and protected distributed team.",
  },
  hardware: {
    service: "Hardware Lifecycle Management",
    description: "Procurement, deployment, and refresh planning so your team always has reliable, up-to-date equipment.",
  },
  cloud: {
    service: "Cloud Migration & Management",
    description: "Strategy, migration, and ongoing management of cloud workloads on Azure, AWS, or Microsoft 365.",
  },
  voip: {
    service: "VoIP & Unified Communications",
    description: "Modern phone systems that reduce costs, improve flexibility, and integrate with your business workflows.",
  },
  vendor: {
    service: "Vendor & ISP Management",
    description: "Single point of accountability for all your technology vendors, including ISP and telecom relationships.",
  },
};

function strVal(v: string | string[] | undefined): string {
  if (!v) return "";
  return Array.isArray(v) ? v[0] ?? "" : v;
}
function arrVal(v: string | string[] | undefined): string[] {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

function generatePlanContent(answers: QuestionnaireAnswers): PlanContentShape {
  const company = strVal(answers.clientCompany) || strVal(answers.companyName) || "your company";
  const headcount = strVal(answers.headcount) || "your team";
  const locations = strVal(answers.locations) || "your location(s)";
  const painPoints = arrVal(answers.painPoints);
  const complianceNeeds = arrVal(answers.complianceNeeds);
  const currentSetup = strVal(answers.currentItSetup) || "current infrastructure";
  const priorities = arrVal(answers.priorities);
  const budget = strVal(answers.budgetRange) || null;
  const timeline = strVal(answers.preferredTimeline) || null;

  // Map pain points to recommended services
  const recommendedServices: { service: string; description: string }[] = [];
  const seen = new Set<string>();

  for (const pp of painPoints) {
    const key = pp.toLowerCase().replace(/[^a-z]/g, "");
    for (const [mapKey, val] of Object.entries(PAIN_POINT_MAP)) {
      if (key.includes(mapKey) && !seen.has(val.service)) {
        seen.add(val.service);
        recommendedServices.push(val);
      }
    }
  }

  if (complianceNeeds.length > 0 && !seen.has("Compliance Services")) {
    seen.add("Compliance Services");
    recommendedServices.push(PAIN_POINT_MAP.compliance);
  }

  if (recommendedServices.length === 0) {
    recommendedServices.push(PAIN_POINT_MAP.downtime, PAIN_POINT_MAP.security);
  }

  const keyFindings: string[] = [
    `${company} currently operates with approximately ${headcount} employees across ${locations}.`,
    ...(painPoints.length > 0
      ? [`Key challenges identified: ${painPoints.join(", ")}.`]
      : ["General IT optimization opportunities were identified during assessment."]),
    ...(complianceNeeds.length > 0
      ? [`Compliance obligations noted: ${complianceNeeds.join(", ")}.`]
      : []),
    `Current IT environment: ${currentSetup}.`,
    ...(priorities.length > 0
      ? [`Top priorities expressed: ${priorities.join(", ")}.`]
      : []),
  ];

  const nextSteps = [
    "Schedule a discovery call with your Siebert Services account executive to finalize service scope.",
    "Review and sign this written plan to formally begin the engagement.",
    "Siebert Services will conduct a full technical onboarding within 5 business days of agreement.",
    ...(budget ? [`Budget alignment discussion based on your stated range of ${budget}.`] : []),
    ...(timeline ? [`Target go-live aligned to your preferred timeline: ${timeline}.`] : []),
  ];

  return {
    executiveSummary: `This IT assessment plan has been prepared for ${company} following a discovery session with Siebert Services. Based on our evaluation of your current environment and business objectives, this document outlines key findings, recommended services, and a clear path forward to modernize and secure your technology infrastructure. Siebert Services is committed to delivering measurable improvements in uptime, security, and operational efficiency for your organization.`,
    currentEnvironment: `${company} maintains an IT environment supporting approximately ${headcount} employees across ${locations}. ${currentSetup ? `The current setup includes: ${currentSetup}.` : ""} This assessment identifies areas where targeted improvements will deliver the greatest business value.`,
    keyFindings,
    recommendedServices,
    nextSteps,
  };
}

// ─── Partner email resolver ───────────────────────────────────────────────────

async function resolvePartnerEmail(partnerId: number | null): Promise<string | undefined> {
  if (!partnerId) return undefined;
  try {
    const [partner] = await db.select({ email: partnersTable.email }).from(partnersTable).where(eq(partnersTable.id, partnerId)).limit(1);
    return partner?.email || undefined;
  } catch { return undefined; }
}

// ─── Partner/Admin Routes ────────────────────────────────────────────────────

router.get("/partner/plans", requirePartnerAuth, async (req: PartnerRequest, res: Response) => {
  try {
    const partnerId = req.partnerId!;
    const plans = await db.select().from(writtenPlansTable)
      .where(partnerId === MAIN_SITE_ADMIN_SENTINEL ? undefined : eq(writtenPlansTable.partnerId, partnerId))
      .orderBy(desc(writtenPlansTable.createdAt));
    res.json({ plans });
  } catch (err) {
    console.error("[WrittenPlans] list error:", err);
    res.status(500).json({ error: "server_error" });
  }
});

router.get("/partner/plans/:id", requirePartnerAuth, async (req: PartnerRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const [plan] = await db.select().from(writtenPlansTable).where(eq(writtenPlansTable.id, id)).limit(1);
    if (!plan) { res.status(404).json({ error: "not_found" }); return; }
    if (req.partnerId !== MAIN_SITE_ADMIN_SENTINEL && plan.partnerId !== req.partnerId) {
      res.status(403).json({ error: "forbidden" }); return;
    }
    const events = await db.select().from(planActivityEventsTable)
      .where(eq(planActivityEventsTable.planId, id))
      .orderBy(planActivityEventsTable.createdAt);
    // Build complete revision lineage: root plan + all children
    const rootId = plan.parentPlanId ?? plan.id;
    const rootFetch = plan.parentPlanId
      ? db.select().from(writtenPlansTable).where(eq(writtenPlansTable.id, rootId)).limit(1)
      : Promise.resolve([plan]);
    const childrenFetch = db.select().from(writtenPlansTable)
      .where(eq(writtenPlansTable.parentPlanId, rootId))
      .orderBy(writtenPlansTable.version);
    const [[rootPlan], children] = await Promise.all([rootFetch, childrenFetch]);
    const revisions = rootPlan
      ? [rootPlan, ...children].sort((a, b) => a.version - b.version)
      : children.sort((a, b) => a.version - b.version);
    res.json({ plan, events, revisions });
  } catch (err) {
    console.error("[WrittenPlans] get error:", err);
    res.status(500).json({ error: "server_error" });
  }
});

router.post("/partner/plans/draft", requirePartnerAuth, async (req: PartnerRequest, res: Response) => {
  try {
    const { clientName, clientEmail, clientTitle, clientCompany, clientPhone, questionnaireAnswers, onBehalfOfPartnerId } = req.body;
    if (!clientName || !clientEmail || !clientCompany) {
      res.status(400).json({ error: "validation_error", message: "clientName, clientEmail, and clientCompany are required" });
      return;
    }
    const planNumber = generatePlanNumber();
    let effectivePartnerId: number | null = req.partnerId === MAIN_SITE_ADMIN_SENTINEL ? null : req.partnerId ?? null;
    if (req.partnerId === MAIN_SITE_ADMIN_SENTINEL && onBehalfOfPartnerId && typeof onBehalfOfPartnerId === "number") {
      const [partnerExists] = await db.select({ id: partnersTable.id }).from(partnersTable).where(eq(partnersTable.id, onBehalfOfPartnerId)).limit(1);
      if (!partnerExists) {
        res.status(400).json({ error: "invalid_partner", message: "onBehalfOfPartnerId does not refer to an existing partner" });
        return;
      }
      effectivePartnerId = onBehalfOfPartnerId;
    }
    const [plan] = await db.insert(writtenPlansTable).values({
      partnerId: effectivePartnerId,
      planNumber,
      clientName, clientEmail,
      clientTitle: clientTitle || null,
      clientCompany, clientPhone: clientPhone || null,
      questionnaireAnswers: questionnaireAnswers || {},
      planContent: {},
      validityDays: 30,
    }).returning();
    await logEvent(plan.id, "created", { planNumber, draft: true });
    res.status(201).json({ plan });
  } catch (err) {
    console.error("[WrittenPlans] draft create error:", err);
    res.status(500).json({ error: "server_error" });
  }
});

router.post("/partner/plans", requirePartnerAuth, async (req: PartnerRequest, res: Response) => {
  try {
    const { clientName, clientEmail, clientTitle, clientCompany, clientPhone, questionnaireAnswers, validityDays, onBehalfOfPartnerId } = req.body;
    if (!clientName || !clientEmail || !clientCompany) {
      res.status(400).json({ error: "validation_error", message: "clientName, clientEmail, and clientCompany are required" });
      return;
    }
    // Validate required questionnaire fields
    const qaErrors = validateQuestionnaireAnswers({ ...(questionnaireAnswers || {}), clientName, clientEmail, clientCompany });
    if (qaErrors.length > 0) {
      res.status(400).json({ error: "validation_error", message: qaErrors.join("; ") });
      return;
    }
    const planContent = generatePlanContent({ ...(questionnaireAnswers as QuestionnaireAnswers), clientCompany, clientName });
    const planNumber = generatePlanNumber();
    // Admin can create on behalf of a specific partner
    let effectivePartnerId: number | null = req.partnerId === MAIN_SITE_ADMIN_SENTINEL ? null : req.partnerId ?? null;
    if (req.partnerId === MAIN_SITE_ADMIN_SENTINEL && onBehalfOfPartnerId && typeof onBehalfOfPartnerId === "number") {
      const [partnerExists] = await db.select({ id: partnersTable.id }).from(partnersTable).where(eq(partnersTable.id, onBehalfOfPartnerId)).limit(1);
      if (!partnerExists) {
        res.status(400).json({ error: "invalid_partner", message: "onBehalfOfPartnerId does not refer to an existing partner" });
        return;
      }
      effectivePartnerId = onBehalfOfPartnerId;
    }
    const [plan] = await db.insert(writtenPlansTable).values({
      partnerId: effectivePartnerId,
      planNumber,
      clientName, clientEmail,
      clientTitle: clientTitle || null,
      clientCompany, clientPhone: clientPhone || null,
      questionnaireAnswers: questionnaireAnswers || {},
      planContent,
      validityDays: validityDays || 30,
    }).returning();
    await logEvent(plan.id, "created", { planNumber });
    res.status(201).json({ plan });
  } catch (err) {
    console.error("[WrittenPlans] create error:", err);
    res.status(500).json({ error: "server_error" });
  }
});

router.put("/partner/plans/:id", requirePartnerAuth, async (req: PartnerRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const [existing] = await db.select().from(writtenPlansTable).where(eq(writtenPlansTable.id, id)).limit(1);
    if (!existing) { res.status(404).json({ error: "not_found" }); return; }
    if (req.partnerId !== MAIN_SITE_ADMIN_SENTINEL && existing.partnerId !== req.partnerId) {
      res.status(403).json({ error: "forbidden" }); return;
    }
    if (existing.status === "approved") {
      res.status(400).json({ error: "cannot_edit_approved" }); return;
    }
    const { clientName, clientEmail, clientTitle, clientCompany, clientPhone, questionnaireAnswers, planContent, validityDays, personalNote } = req.body;
    const [plan] = await db.update(writtenPlansTable).set({
      clientName: clientName || existing.clientName,
      clientEmail: clientEmail || existing.clientEmail,
      clientTitle: clientTitle ?? existing.clientTitle,
      clientCompany: clientCompany || existing.clientCompany,
      clientPhone: clientPhone ?? existing.clientPhone,
      questionnaireAnswers: questionnaireAnswers ?? existing.questionnaireAnswers,
      planContent: planContent ?? existing.planContent,
      validityDays: validityDays ?? existing.validityDays,
      personalNote: personalNote ?? existing.personalNote,
      updatedAt: new Date(),
    }).where(eq(writtenPlansTable.id, id)).returning();
    res.json({ plan });
  } catch (err) {
    console.error("[WrittenPlans] update error:", err);
    res.status(500).json({ error: "server_error" });
  }
});

router.put("/partner/plans/:id/regenerate", requirePartnerAuth, async (req: PartnerRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const [existing] = await db.select().from(writtenPlansTable).where(eq(writtenPlansTable.id, id)).limit(1);
    if (!existing) { res.status(404).json({ error: "not_found" }); return; }
    if (req.partnerId !== MAIN_SITE_ADMIN_SENTINEL && existing.partnerId !== req.partnerId) {
      res.status(403).json({ error: "forbidden" }); return;
    }
    const answers = (existing.questionnaireAnswers as QuestionnaireAnswers) ?? {};
    const planContent = generatePlanContent({ ...answers, clientCompany: existing.clientCompany, clientName: existing.clientName });
    const [plan] = await db.update(writtenPlansTable).set({ planContent, updatedAt: new Date() })
      .where(eq(writtenPlansTable.id, id)).returning();
    res.json({ plan });
  } catch (err) {
    console.error("[WrittenPlans] regenerate error:", err);
    res.status(500).json({ error: "server_error" });
  }
});

router.post("/partner/plans/:id/send", requirePartnerAuth, async (req: PartnerRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const [existing] = await db.select().from(writtenPlansTable).where(eq(writtenPlansTable.id, id)).limit(1);
    if (!existing) { res.status(404).json({ error: "not_found" }); return; }
    if (req.partnerId !== MAIN_SITE_ADMIN_SENTINEL && existing.partnerId !== req.partnerId) {
      res.status(403).json({ error: "forbidden" }); return;
    }
    if (["approved", "declined"].includes(existing.status)) {
      res.status(400).json({ error: "cannot_send_terminal", message: "Cannot resend a plan that has been approved or declined. Create a revision instead." });
      return;
    }
    const existingContent = existing.planContent as PlanContentShape | null;
    if (!existingContent?.executiveSummary || !existingContent?.recommendedServices?.length) {
      res.status(400).json({ error: "plan_content_missing", message: "Plan content must be generated before sending. Use 'Generate Plan' first." });
      return;
    }
    const { personalNote, validityDays, clientEmail } = req.body;
    const token = generateReviewToken();
    const vdays = validityDays || existing.validityDays || 30;
    const expiresAt = new Date(Date.now() + vdays * 86400000);
    const finalEmail = clientEmail || existing.clientEmail;

    const [plan] = await db.update(writtenPlansTable).set({
      status: "sent",
      reviewToken: token,
      expiresAt,
      validityDays: vdays,
      personalNote: personalNote ?? existing.personalNote,
      clientEmail: finalEmail,
      sentAt: new Date(),
      updatedAt: new Date(),
    }).where(eq(writtenPlansTable.id, id)).returning();

    await logEvent(plan.id, "sent", { to: finalEmail });

    const baseUrl = process.env.PARTNER_PORTAL_URL || "https://siebertrservices.com/partner-portal";
    const reviewUrl = `${baseUrl}/plan-review/${token}`;

    const content = plan.planContent as PlanContentShape | null;
    sendPlanReadyEmail({
      clientName: plan.clientName,
      clientEmail: finalEmail,
      company: plan.clientCompany,
      planNumber: plan.planNumber,
      reviewUrl,
      expiresAt,
      executiveSummary: content?.executiveSummary || "",
      personalNote: plan.personalNote || undefined,
    }).catch(e => console.error("[WrittenPlans] send email error:", e));

    res.json({ plan, reviewUrl });
  } catch (err) {
    console.error("[WrittenPlans] send error:", err);
    res.status(500).json({ error: "server_error" });
  }
});

router.post("/partner/plans/:id/revise", requirePartnerAuth, async (req: PartnerRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const [existing] = await db.select().from(writtenPlansTable).where(eq(writtenPlansTable.id, id)).limit(1);
    if (!existing) { res.status(404).json({ error: "not_found" }); return; }
    if (req.partnerId !== MAIN_SITE_ADMIN_SENTINEL && existing.partnerId !== req.partnerId) {
      res.status(403).json({ error: "forbidden" }); return;
    }
    const parentId = existing.parentPlanId || existing.id;
    const siblings = await db.select().from(writtenPlansTable).where(eq(writtenPlansTable.parentPlanId, parentId));
    const nextVersion = Math.max(existing.version, ...siblings.map(s => s.version)) + 1;
    const planNumber = generatePlanNumber();
    const [newPlan] = await db.insert(writtenPlansTable).values({
      partnerId: existing.partnerId,
      planNumber,
      version: nextVersion,
      parentPlanId: parentId,
      clientName: existing.clientName,
      clientEmail: existing.clientEmail,
      clientTitle: existing.clientTitle,
      clientCompany: existing.clientCompany,
      clientPhone: existing.clientPhone,
      questionnaireAnswers: existing.questionnaireAnswers as QuestionnaireAnswers,
      planContent: existing.planContent as PlanContentShape,
      validityDays: existing.validityDays,
      personalNote: existing.personalNote,
    }).returning();
    await logEvent(newPlan.id, "revised", { fromPlanId: id, fromVersion: existing.version });
    res.status(201).json({ plan: newPlan });
  } catch (err) {
    console.error("[WrittenPlans] revise error:", err);
    res.status(500).json({ error: "server_error" });
  }
});

router.delete("/partner/plans/:id", requirePartnerAuth, async (req: PartnerRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const [existing] = await db.select().from(writtenPlansTable).where(eq(writtenPlansTable.id, id)).limit(1);
    if (!existing) { res.status(404).json({ error: "not_found" }); return; }
    if (req.partnerId !== MAIN_SITE_ADMIN_SENTINEL && existing.partnerId !== req.partnerId) {
      res.status(403).json({ error: "forbidden" }); return;
    }
    if (existing.status === "approved") {
      res.status(400).json({ error: "cannot_delete_approved", message: "Approved plans cannot be deleted for audit retention." });
      return;
    }
    await db.delete(planActivityEventsTable).where(eq(planActivityEventsTable.planId, id));
    await db.delete(writtenPlansTable).where(eq(writtenPlansTable.id, id));
    res.json({ success: true });
  } catch (err) {
    console.error("[WrittenPlans] delete error:", err);
    res.status(500).json({ error: "server_error" });
  }
});

// ─── PDF Download ─────────────────────────────────────────────────────────────

router.get("/partner/plans/:id/pdf", requirePartnerAuth, async (req: PartnerRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const [plan] = await db.select().from(writtenPlansTable).where(eq(writtenPlansTable.id, id)).limit(1);
    if (!plan) { res.status(404).json({ error: "not_found" }); return; }
    if (req.partnerId !== MAIN_SITE_ADMIN_SENTINEL && plan.partnerId !== req.partnerId) {
      res.status(403).json({ error: "forbidden" }); return;
    }
    const pdfBuffer = await generatePlanPdf(plan);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="plan-${plan.planNumber}.pdf"`);
    res.send(pdfBuffer);
  } catch (err) {
    console.error("[WrittenPlans] PDF error:", err);
    res.status(500).json({ error: "server_error" });
  }
});

// ─── Public Routes (token-based, no auth) ────────────────────────────────────

router.get("/public/plan-review/:token", async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const [plan] = await db.select().from(writtenPlansTable)
      .where(eq(writtenPlansTable.reviewToken, token)).limit(1);
    if (!plan) { res.status(404).json({ error: "not_found" }); return; }
    if (plan.expiresAt && plan.expiresAt < new Date() && plan.status !== "approved") {
      res.json({ plan: { ...plan, signatureImage: null }, expired: true });
      return;
    }
    let responsePlan = plan;
    if (plan.status === "sent") {
      const [updatedPlan] = await db.update(writtenPlansTable).set({ status: "viewed", viewedAt: new Date(), updatedAt: new Date() })
        .where(eq(writtenPlansTable.id, plan.id)).returning();
      await logEvent(plan.id, "viewed");
      responsePlan = updatedPlan;
    }
    res.json({ plan: { ...responsePlan, signatureImage: responsePlan.status === "approved" ? responsePlan.signatureImage : null }, expired: false });
  } catch (err) {
    console.error("[WrittenPlans] public get error:", err);
    res.status(500).json({ error: "server_error" });
  }
});

router.post("/public/plan-review/:token/sign", async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const { signerName, signerTitle, signatureImage } = req.body;
    if (!signerName || !signatureImage) {
      res.status(400).json({ error: "validation_error", message: "signerName and signatureImage are required" });
      return;
    }
    if (typeof signerName !== "string" || signerName.trim().length > 200) {
      res.status(400).json({ error: "validation_error", message: "signerName must be a string of 200 characters or fewer" });
      return;
    }
    if (signerTitle !== undefined && signerTitle !== null && (typeof signerTitle !== "string" || signerTitle.length > 200)) {
      res.status(400).json({ error: "validation_error", message: "signerTitle must be a string of 200 characters or fewer" });
      return;
    }
    if (typeof signatureImage !== "string" || !signatureImage.startsWith("data:image/png;base64,")) {
      res.status(400).json({ error: "validation_error", message: "signatureImage must be a PNG base64 data URL (data:image/png;base64,...)" });
      return;
    }
    const MAX_SIGNATURE_BYTES = 5 * 1024 * 1024;
    if (Buffer.byteLength(signatureImage, "utf8") > MAX_SIGNATURE_BYTES) {
      res.status(400).json({ error: "validation_error", message: "signatureImage exceeds the 5 MB size limit" });
      return;
    }
    const [plan] = await db.select().from(writtenPlansTable)
      .where(eq(writtenPlansTable.reviewToken, token)).limit(1);
    if (!plan) { res.status(404).json({ error: "not_found" }); return; }
    if (plan.expiresAt && plan.expiresAt < new Date()) {
      res.status(400).json({ error: "expired" }); return;
    }
    if (["approved", "declined", "call_requested"].includes(plan.status)) {
      res.status(400).json({ error: "already_responded" }); return;
    }
    const [updated] = await db.update(writtenPlansTable).set({
      status: "approved",
      approvedAt: new Date(),
      signerName,
      signerTitle: signerTitle || null,
      signatureImage,
      updatedAt: new Date(),
    }).where(eq(writtenPlansTable.id, plan.id)).returning();
    await logEvent(plan.id, "approved", { signerName, signerTitle });

    resolvePartnerEmail(updated.partnerId).then(partnerEmail =>
      sendPlanApprovedEmail(updated, partnerEmail).catch(e => console.error("[Email] plan approved error:", e))
    );

    res.json({ success: true, plan: updated });
  } catch (err) {
    console.error("[WrittenPlans] sign error:", err);
    res.status(500).json({ error: "server_error" });
  }
});

router.post("/public/plan-review/:token/decline", async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const { reason, note } = req.body;
    if (!reason || typeof reason !== "string" || !reason.trim()) {
      res.status(400).json({ error: "validation_error", message: "A decline reason is required" });
      return;
    }
    if (reason.trim().length > 500) {
      res.status(400).json({ error: "validation_error", message: "Decline reason must be 500 characters or fewer" });
      return;
    }
    if (note !== undefined && note !== null && (typeof note !== "string" || note.length > 2000)) {
      res.status(400).json({ error: "validation_error", message: "Decline note must be 2000 characters or fewer" });
      return;
    }
    const [plan] = await db.select().from(writtenPlansTable)
      .where(eq(writtenPlansTable.reviewToken, token)).limit(1);
    if (!plan) { res.status(404).json({ error: "not_found" }); return; }
    if (plan.expiresAt && plan.expiresAt < new Date()) {
      res.status(400).json({ error: "expired" }); return;
    }
    if (["approved", "declined", "call_requested"].includes(plan.status)) {
      res.status(400).json({ error: "already_responded" }); return;
    }
    await db.update(writtenPlansTable).set({
      status: "declined",
      declineReason: reason.trim(),
      declineNote: note || null,
      updatedAt: new Date(),
    }).where(eq(writtenPlansTable.id, plan.id));
    await logEvent(plan.id, "declined", { reason, note });
    resolvePartnerEmail(plan.partnerId).then(partnerEmail =>
      sendPlanDeclinedEmail(plan, reason, note, partnerEmail).catch(e => console.error("[Email] plan declined error:", e))
    );
    res.json({ success: true });
  } catch (err) {
    console.error("[WrittenPlans] decline error:", err);
    res.status(500).json({ error: "server_error" });
  }
});

router.post("/public/plan-review/:token/request-call", async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const [plan] = await db.select().from(writtenPlansTable)
      .where(eq(writtenPlansTable.reviewToken, token)).limit(1);
    if (!plan) { res.status(404).json({ error: "not_found" }); return; }
    if (plan.expiresAt && plan.expiresAt < new Date()) {
      res.status(400).json({ error: "expired" }); return;
    }
    if (["approved", "declined", "call_requested"].includes(plan.status)) {
      res.status(400).json({ error: "already_responded" }); return;
    }
    await db.update(writtenPlansTable).set({ status: "call_requested", updatedAt: new Date() })
      .where(eq(writtenPlansTable.id, plan.id));
    await logEvent(plan.id, "call_requested");
    resolvePartnerEmail(plan.partnerId).then(partnerEmail =>
      sendPlanCallRequestedEmail(plan, partnerEmail).catch(e => console.error("[Email] call requested error:", e))
    );
    res.json({ success: true });
  } catch (err) {
    console.error("[WrittenPlans] request-call error:", err);
    res.status(500).json({ error: "server_error" });
  }
});

router.get("/public/plan-review/:token/pdf", async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const [plan] = await db.select().from(writtenPlansTable)
      .where(eq(writtenPlansTable.reviewToken, token)).limit(1);
    if (!plan) { res.status(404).json({ error: "not_found" }); return; }
    if (plan.status === "declined") {
      res.status(403).json({ error: "plan_declined", message: "PDF is unavailable for declined plans." });
      return;
    }
    if (plan.expiresAt && plan.expiresAt < new Date() && plan.status !== "approved") {
      res.status(410).json({ error: "expired", message: "This plan has expired." });
      return;
    }
    const pdfBuffer = await generatePlanPdf(plan);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="plan-${plan.planNumber}.pdf"`);
    res.send(pdfBuffer);
  } catch (err) {
    console.error("[WrittenPlans] public PDF error:", err);
    res.status(500).json({ error: "server_error" });
  }
});

// ─── Reminder Cron ───────────────────────────────────────────────────────────

const REMINDER_ADVISORY_LOCK_ID = 202604211; // stable integer for pg advisory lock

export async function sendPlanExpiryReminders() {
  try {
    // Acquire a PostgreSQL advisory lock so only one instance runs reminders at a time
    const lockResult = await db.execute<{ acquired: boolean }>(
      sql`SELECT pg_try_advisory_lock(${REMINDER_ADVISORY_LOCK_ID}) AS acquired`
    );
    const lockRow = lockResult.rows?.[0];
    if (!lockRow?.acquired) return;
    try {
      await runReminderBatch();
    } finally {
      await db.execute(sql`SELECT pg_advisory_unlock(${REMINDER_ADVISORY_LOCK_ID})`);
    }
  } catch (err) {
    console.error("[WrittenPlans] reminder cron error:", err);
  }
}

async function runReminderBatch() {
  try {
    const now = new Date();
    const threeDaysOut = new Date(Date.now() + 3 * 86400000);
    // Include sent AND viewed; exclude already expired plans
    const plans = await db.select().from(writtenPlansTable)
      .where(
        and(
          inArray(writtenPlansTable.status, ["sent", "viewed"]),
          lt(writtenPlansTable.expiresAt, threeDaysOut),
          gt(writtenPlansTable.expiresAt, now)
        )
      );
    for (const plan of plans) {
      // Single reminder per plan — skip if any reminder has ever been sent
      const events = await db.select().from(planActivityEventsTable)
        .where(and(eq(planActivityEventsTable.planId, plan.id), eq(planActivityEventsTable.eventType, "reminder_sent")))
        .limit(1);
      if (events.length > 0) continue;
      const partnerEmail = await resolvePartnerEmail(plan.partnerId);
      await sendPlanExpiringEmail(plan, partnerEmail).catch(e => console.error("[Email] expiry reminder error:", e));
      await logEvent(plan.id, "reminder_sent");
    }
  } catch (err) {
    console.error("[WrittenPlans] reminder cron error:", err);
  }
}

export default router;
