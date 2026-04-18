import { pgTable, text, serial, timestamp, jsonb, pgEnum, integer, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const leadMagnetEnum = pgEnum("lead_magnet", [
  "cybersecurity_assessment",
  "downtime_calculator",
  "hipaa_checklist",
  "buyers_guide",
]);

export const leadMagnetSubmissionsTable = pgTable("lead_magnet_submissions", {
  id: serial("id").primaryKey(),
  magnet: leadMagnetEnum("magnet").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  company: text("company"),
  phone: text("phone"),
  payload: jsonb("payload").default({}).notNull(),
  source: text("source"),
  emailSent: text("email_sent").notNull().default("pending"),
  pdfStoragePath: text("pdf_storage_path"),
  unsubscribedAt: timestamp("unsubscribed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const leadMagnetSequenceSendsTable = pgTable("lead_magnet_sequence_sends", {
  id: serial("id").primaryKey(),
  submissionId: integer("submission_id").notNull().references(() => leadMagnetSubmissionsTable.id, { onDelete: "cascade" }),
  step: integer("step").notNull(),
  status: text("status").notNull().default("sent"),
  sentAt: timestamp("sent_at").notNull().defaultNow(),
}, (t) => ({
  uniqStep: uniqueIndex("lead_magnet_seq_uniq").on(t.submissionId, t.step),
}));

export const insertLeadMagnetSubmissionSchema = createInsertSchema(leadMagnetSubmissionsTable).omit({
  id: true,
  createdAt: true,
  emailSent: true,
  unsubscribedAt: true,
});
export type InsertLeadMagnetSubmission = z.infer<typeof insertLeadMagnetSubmissionSchema>;
export type LeadMagnetSubmission = typeof leadMagnetSubmissionsTable.$inferSelect;
export type LeadMagnetSequenceSend = typeof leadMagnetSequenceSendsTable.$inferSelect;
