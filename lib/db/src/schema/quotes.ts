import { pgTable, text, serial, timestamp, pgEnum, integer, decimal, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const quoteStatusEnum = pgEnum("quote_status", ["pending", "reviewed", "quoted", "closed"]);
export const companySizeEnum = pgEnum("company_size", ["1-10", "11-50", "51-200", "200+"]);
export const proposalStatusEnum = pgEnum("proposal_status", ["draft", "sent", "viewed", "accepted", "rejected", "expired"]);

export const quotesTable = pgTable("quotes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  company: text("company").notNull(),
  companySize: companySizeEnum("company_size"),
  services: text("services").notNull(),
  budget: text("budget"),
  timeline: text("timeline"),
  details: text("details"),
  status: quoteStatusEnum("status").notNull().default("pending"),
  assignedTo: text("assigned_to"),
  internalNotes: text("internal_notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const quoteProposalsTable = pgTable("quote_proposals", {
  id: serial("id").primaryKey(),
  quoteId: integer("quote_id").references(() => quotesTable.id),
  proposalNumber: text("proposal_number").notNull().unique(),
  clientName: text("client_name").notNull(),
  clientEmail: text("client_email").notNull(),
  clientCompany: text("client_company").notNull(),
  clientPhone: text("client_phone"),
  title: text("title").notNull(),
  summary: text("summary"),
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull().default("0"),
  discount: decimal("discount", { precision: 12, scale: 2 }).notNull().default("0"),
  discountType: text("discount_type").notNull().default("fixed"),
  tax: decimal("tax", { precision: 12, scale: 2 }).notNull().default("0"),
  total: decimal("total", { precision: 12, scale: 2 }).notNull().default("0"),
  status: proposalStatusEnum("status").notNull().default("draft"),
  validUntil: timestamp("valid_until"),
  terms: text("terms"),
  notes: text("notes"),
  sentAt: timestamp("sent_at"),
  viewedAt: timestamp("viewed_at"),
  respondedAt: timestamp("responded_at"),
  clientSignature: text("client_signature"),
  version: integer("version").notNull().default(1),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const quoteLineItemsTable = pgTable("quote_line_items", {
  id: serial("id").primaryKey(),
  proposalId: integer("proposal_id").notNull().references(() => quoteProposalsTable.id),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull().default("service"),
  quantity: integer("quantity").notNull().default(1),
  unitPrice: decimal("unit_price", { precision: 12, scale: 2 }).notNull(),
  unit: text("unit").notNull().default("each"),
  recurring: boolean("recurring").notNull().default(false),
  recurringInterval: text("recurring_interval"),
  total: decimal("total", { precision: 12, scale: 2 }).notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const insertQuoteSchema = createInsertSchema(quotesTable).omit({ id: true, createdAt: true, status: true });
export const insertProposalSchema = createInsertSchema(quoteProposalsTable).omit({ id: true, createdAt: true, updatedAt: true, version: true });
export const insertLineItemSchema = createInsertSchema(quoteLineItemsTable).omit({ id: true });

export type InsertQuote = z.infer<typeof insertQuoteSchema>;
export type Quote = typeof quotesTable.$inferSelect;
export type QuoteProposal = typeof quoteProposalsTable.$inferSelect;
export type QuoteLineItem = typeof quoteLineItemsTable.$inferSelect;
