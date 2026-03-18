import { pgTable, text, serial, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const quoteStatusEnum = pgEnum("quote_status", ["pending", "reviewed", "quoted", "closed"]);
export const companySizeEnum = pgEnum("company_size", ["1-10", "11-50", "51-200", "200+"]);

export const quotesTable = pgTable("quotes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  company: text("company").notNull(),
  companySize: companySizeEnum("company_size"),
  services: text("services").notNull(), // JSON array stored as text
  budget: text("budget"),
  timeline: text("timeline"),
  details: text("details"),
  status: quoteStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertQuoteSchema = createInsertSchema(quotesTable).omit({ id: true, createdAt: true, status: true });
export type InsertQuote = z.infer<typeof insertQuoteSchema>;
export type Quote = typeof quotesTable.$inferSelect;
