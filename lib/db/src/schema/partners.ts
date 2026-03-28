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
  commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }).notNull().default("10.00"),
  ssoProvider: text("sso_provider"),
  ssoId: text("sso_id"),
  isAdmin: boolean("is_admin").notNull().default(false),
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
  tsdTargets: text("tsd_targets").notNull().default("[]"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const tsdDealPushStatusEnum = pgEnum("tsd_sync_status", ["pending", "success", "failed"]);

export const tsdVendorMappingsTable = pgTable("tsd_vendor_mappings", {
  id: serial("id").primaryKey(),
  productName: text("product_name").notNull().unique(),
  tsdIds: text("tsd_ids").notNull().default("[]"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const tsdDealPushLogsTable = pgTable("tsd_sync_logs", {
  id: serial("id").primaryKey(),
  dealId: integer("deal_id").references(() => partnerDealsTable.id),
  tsdId: text("tsd_id").notNull(),
  status: tsdDealPushStatusEnum("status").notNull().default("pending"),
  errorMessage: text("error_message"),
  payload: text("payload"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
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
  notes: text("notes"),
  tsdDiscrepancy: text("tsd_discrepancy"),
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

export const documentCategoryEnum = pgEnum("document_category", ["contract", "proposal", "invoice", "report", "agreement", "other"]);

export const documentsTable = pgTable("documents", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  filename: text("filename").notNull(),
  mimeType: text("mime_type").notNull().default("application/octet-stream"),
  size: integer("size").notNull().default(0),
  content: text("content").notNull(),
  category: documentCategoryEnum("category").notNull().default("other"),
  partnerId: integer("partner_id").references(() => partnersTable.id),
  uploadedBy: text("uploaded_by").notNull().default("admin"),
  tags: text("tags").notNull().default("[]"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const tsdProviderEnum = pgEnum("tsd_provider", ["avant", "telarus", "intelisys"]);
export const tsdSyncDirectionEnum = pgEnum("tsd_sync_direction", ["outbound", "inbound"]);
export const tsdProviderSyncStatusEnum = pgEnum("tsd_provider_sync_status", ["success", "failure", "partial"]);
export const tsdSyncEntityEnum = pgEnum("tsd_sync_entity", ["deal", "lead", "commission", "webhook"]);

export const tsdConfigsTable = pgTable("tsd_configs", {
  id: serial("id").primaryKey(),
  provider: tsdProviderEnum("provider").notNull().unique(),
  enabled: boolean("enabled").notNull().default(false),
  credentialRef: text("credential_ref"),
  username: text("username"),
  password: text("password"),
  mfaPhone: text("mfa_phone"),
  mfaCode: text("mfa_code"),
  webhookSecret: text("webhook_secret"),
  lastLeadSyncAt: timestamp("last_lead_sync_at"),
  lastCommissionSyncAt: timestamp("last_commission_sync_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const tsdDealMappingsTable = pgTable("tsd_deal_mappings", {
  id: serial("id").primaryKey(),
  dealId: integer("deal_id").notNull().references(() => partnerDealsTable.id),
  provider: tsdProviderEnum("provider").notNull(),
  externalId: text("external_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const tsdSyncLogsTable = pgTable("tsd_provider_sync_logs", {
  id: serial("id").primaryKey(),
  provider: tsdProviderEnum("provider").notNull(),
  direction: tsdSyncDirectionEnum("direction").notNull(),
  entityType: tsdSyncEntityEnum("entity_type").notNull(),
  status: tsdProviderSyncStatusEnum("status").notNull(),
  recordsAffected: integer("records_affected").notNull().default(0),
  payloadSummary: text("payload_summary"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const tsdProductsTable = pgTable("tsd_products", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  availableAt: text("available_at").notNull().default("[]"),
  active: boolean("active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
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
export const insertDocumentSchema = createInsertSchema(documentsTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertTsdConfigSchema = createInsertSchema(tsdConfigsTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertTsdSyncLogSchema = createInsertSchema(tsdSyncLogsTable).omit({ id: true, createdAt: true });
export const insertTsdProductSchema = createInsertSchema(tsdProductsTable).omit({ id: true, createdAt: true, updatedAt: true });

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
export type Document = typeof documentsTable.$inferSelect;
export type TsdConfig = typeof tsdConfigsTable.$inferSelect;
export type TsdSyncLog = typeof tsdSyncLogsTable.$inferSelect;
export type TsdDealMapping = typeof tsdDealMappingsTable.$inferSelect;
export type TsdVendorMapping = typeof tsdVendorMappingsTable.$inferSelect;
export type TsdDealPushLog = typeof tsdDealPushLogsTable.$inferSelect;
export type TsdProduct = typeof tsdProductsTable.$inferSelect;
