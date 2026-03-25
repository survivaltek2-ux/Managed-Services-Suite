import { pgTable, text, serial, timestamp, integer, boolean, pgEnum, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const partnerTierEnum = pgEnum("partner_tier", ["registered", "silver", "gold", "platinum"]);
export const partnerStatusEnum = pgEnum("partner_status", ["pending", "approved", "rejected", "suspended"]);
export const dealStatusEnum = pgEnum("deal_status", ["registered", "in_progress", "won", "lost", "expired"]);
export const dealStageEnum = pgEnum("deal_stage", ["prospect", "qualification", "proposal", "negotiation", "closed_won", "closed_lost"]);
export const resourceTypeEnum = pgEnum("resource_type", ["pdf", "video", "link", "image", "presentation"]);
export const resourceCategoryEnum = pgEnum("resource_category", ["marketing", "sales", "technical", "training", "zoom", "general"]);
export const certStatusEnum = pgEnum("cert_status", ["not_started", "in_progress", "completed", "expired"]);
export const leadStatusEnum = pgEnum("lead_status_partner", ["new", "contacted", "qualified", "converted", "lost"]);

export const partnersTable = pgTable("partners", {
  id: serial("id").primaryKey(),
  companyName: text("company_name").notNull(),
  contactName: text("contact_name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  phone: text("phone"),
  website: text("website"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zip: text("zip"),
  country: text("country").notNull().default("US"),
  businessType: text("business_type"),
  yearsInBusiness: text("years_in_business"),
  employeeCount: text("employee_count"),
  annualRevenue: text("annual_revenue"),
  specializations: text("specializations").notNull().default("[]"),
  tier: partnerTierEnum("tier").notNull().default("registered"),
  status: partnerStatusEnum("status").notNull().default("pending"),
  totalDeals: integer("total_deals").notNull().default(0),
  totalRevenue: decimal("total_revenue", { precision: 12, scale: 2 }).notNull().default("0"),
  ytdRevenue: decimal("ytd_revenue", { precision: 12, scale: 2 }).notNull().default("0"),
  ssoProvider: text("sso_provider"),
  ssoId: text("sso_id"),
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const partnerDealsTable = pgTable("partner_deals", {
  id: serial("id").primaryKey(),
  partnerId: integer("partner_id").notNull().references(() => partnersTable.id),
  title: text("title").notNull(),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email"),
  customerPhone: text("customer_phone"),
  description: text("description"),
  products: text("products").notNull().default("[]"),
  estimatedValue: decimal("estimated_value", { precision: 12, scale: 2 }),
  actualValue: decimal("actual_value", { precision: 12, scale: 2 }),
  status: dealStatusEnum("status").notNull().default("registered"),
  stage: dealStageEnum("stage").notNull().default("prospect"),
  expectedCloseDate: timestamp("expected_close_date"),
  closedAt: timestamp("closed_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const partnerLeadsTable = pgTable("partner_leads", {
  id: serial("id").primaryKey(),
  partnerId: integer("partner_id").notNull().references(() => partnersTable.id),
  companyName: text("company_name").notNull(),
  contactName: text("contact_name").notNull(),
  email: text("email"),
  phone: text("phone"),
  source: text("source"),
  interest: text("interest"),
  status: leadStatusEnum("status").notNull().default("new"),
  notes: text("notes"),
  assignedAt: timestamp("assigned_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const partnerResourcesTable = pgTable("partner_resources", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  url: text("url").notNull(),
  type: resourceTypeEnum("type").notNull().default("pdf"),
  category: resourceCategoryEnum("category").notNull().default("general"),
  minTier: partnerTierEnum("min_tier").notNull().default("registered"),
  featured: boolean("featured").notNull().default(false),
  downloadCount: integer("download_count").notNull().default(0),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const partnerCertificationsTable = pgTable("partner_certifications", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  provider: text("provider").notNull().default("Siebert Services"),
  category: text("category").notNull().default("general"),
  duration: text("duration"),
  badgeUrl: text("badge_url"),
  active: boolean("active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const partnerCertProgressTable = pgTable("partner_cert_progress", {
  id: serial("id").primaryKey(),
  partnerId: integer("partner_id").notNull().references(() => partnersTable.id),
  certificationId: integer("certification_id").notNull().references(() => partnerCertificationsTable.id),
  status: certStatusEnum("status").notNull().default("not_started"),
  progressPct: integer("progress_pct").notNull().default(0),
  completedAt: timestamp("completed_at"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const partnerAnnouncementsTable = pgTable("partner_announcements", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  category: text("category").notNull().default("general"),
  minTier: partnerTierEnum("min_tier").notNull().default("registered"),
  pinned: boolean("pinned").notNull().default(false),
  active: boolean("active").notNull().default(true),
  publishedAt: timestamp("published_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const commissionStatusEnum = pgEnum("commission_status", ["pending", "approved", "paid", "disputed", "rejected"]);
export const mdfStatusEnum = pgEnum("mdf_status", ["draft", "submitted", "approved", "rejected", "completed", "expired"]);
export const partnerTicketStatusEnum = pgEnum("partner_ticket_status", ["open", "in_progress", "waiting", "resolved", "closed"]);
export const partnerTicketPriorityEnum = pgEnum("partner_ticket_priority", ["low", "medium", "high", "urgent"]);

export const partnerCommissionsTable = pgTable("partner_commissions", {
  id: serial("id").primaryKey(),
  partnerId: integer("partner_id").notNull().references(() => partnersTable.id),
  dealId: integer("deal_id").references(() => partnerDealsTable.id),
  type: text("type").notNull().default("deal"),
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  rate: decimal("rate", { precision: 5, scale: 2 }),
  status: commissionStatusEnum("status").notNull().default("pending"),
  paidAt: timestamp("paid_at"),
  periodStart: timestamp("period_start"),
  periodEnd: timestamp("period_end"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const partnerSupportTicketsTable = pgTable("partner_support_tickets", {
  id: serial("id").primaryKey(),
  partnerId: integer("partner_id").notNull().references(() => partnersTable.id),
  subject: text("subject").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull().default("general"),
  priority: partnerTicketPriorityEnum("priority").notNull().default("medium"),
  status: partnerTicketStatusEnum("status").notNull().default("open"),
  assignedTo: text("assigned_to"),
  resolution: text("resolution"),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const partnerTicketMessagesTable = pgTable("partner_ticket_messages", {
  id: serial("id").primaryKey(),
  ticketId: integer("ticket_id").notNull().references(() => partnerSupportTicketsTable.id),
  senderType: text("sender_type").notNull().default("partner"),
  senderName: text("sender_name").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const partnerMdfRequestsTable = pgTable("partner_mdf_requests", {
  id: serial("id").primaryKey(),
  partnerId: integer("partner_id").notNull().references(() => partnersTable.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  activityType: text("activity_type").notNull(),
  requestedAmount: decimal("requested_amount", { precision: 12, scale: 2 }).notNull(),
  approvedAmount: decimal("approved_amount", { precision: 12, scale: 2 }),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  expectedLeads: integer("expected_leads"),
  status: mdfStatusEnum("status").notNull().default("draft"),
  proofOfExecution: text("proof_of_execution"),
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertPartnerSchema = createInsertSchema(partnersTable).omit({ id: true, createdAt: true, updatedAt: true, tier: true, status: true, totalDeals: true, totalRevenue: true, ytdRevenue: true, approvedAt: true });
export const insertDealSchema = createInsertSchema(partnerDealsTable).omit({ id: true, createdAt: true, updatedAt: true, partnerId: true, status: true });
export const insertLeadSchema = createInsertSchema(partnerLeadsTable).omit({ id: true, createdAt: true, assignedAt: true, partnerId: true });
export const insertResourceSchema = createInsertSchema(partnerResourcesTable).omit({ id: true, createdAt: true, downloadCount: true });
export const insertCertSchema = createInsertSchema(partnerCertificationsTable).omit({ id: true, createdAt: true });
export const insertAnnouncementSchema = createInsertSchema(partnerAnnouncementsTable).omit({ id: true, createdAt: true });

export const insertCommissionSchema = createInsertSchema(partnerCommissionsTable).omit({ id: true, createdAt: true });
export const insertSupportTicketSchema = createInsertSchema(partnerSupportTicketsTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertTicketMessageSchema = createInsertSchema(partnerTicketMessagesTable).omit({ id: true, createdAt: true });
export const insertMdfRequestSchema = createInsertSchema(partnerMdfRequestsTable).omit({ id: true, createdAt: true, updatedAt: true });

export type Partner = typeof partnersTable.$inferSelect;
export type PartnerDeal = typeof partnerDealsTable.$inferSelect;
export type PartnerLead = typeof partnerLeadsTable.$inferSelect;
export type PartnerResource = typeof partnerResourcesTable.$inferSelect;
export type PartnerCertification = typeof partnerCertificationsTable.$inferSelect;
export type PartnerCertProgress = typeof partnerCertProgressTable.$inferSelect;
export type PartnerAnnouncement = typeof partnerAnnouncementsTable.$inferSelect;
export type PartnerCommission = typeof partnerCommissionsTable.$inferSelect;
export type PartnerSupportTicket = typeof partnerSupportTicketsTable.$inferSelect;
export type PartnerTicketMessage = typeof partnerTicketMessagesTable.$inferSelect;
export type PartnerMdfRequest = typeof partnerMdfRequestsTable.$inferSelect;
