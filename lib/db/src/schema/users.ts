import { pgTable, text, serial, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const userRoleEnum = pgEnum("user_role", ["client", "admin"]);

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  company: text("company").notNull(),
  phone: text("phone"),
  role: userRoleEnum("role").notNull().default("client"),
  ssoProvider: text("sso_provider"),
  ssoId: text("sso_id"),
  stripeCustomerId: text("stripe_customer_id"),
  resetToken: text("reset_token"),
  resetTokenExpires: timestamp("reset_token_expires"),
  msObjectId: text("ms_object_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({ id: true, createdAt: true, role: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
