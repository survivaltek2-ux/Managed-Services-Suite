import { pgTable, text, serial, timestamp, integer, decimal, boolean, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { partnersTable } from "./partners";

export const marketplaceVendorStatusEnum = pgEnum("marketplace_vendor_status", ["pending", "approved", "rejected", "suspended"]);
export const marketplaceProductStatusEnum = pgEnum("marketplace_product_status", ["draft", "active", "inactive"]);
export const marketplaceOrderStatusEnum = pgEnum("marketplace_order_status", ["pending", "completed", "cancelled", "refunded"]);

export const marketplaceVendorsTable = pgTable("marketplace_vendors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  contactEmail: text("contact_email").notNull(),
  website: text("website"),
  commissionPercent: decimal("commission_percent", { precision: 5, scale: 2 }).notNull().default("15.00"),
  status: marketplaceVendorStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const marketplaceProductsTable = pgTable("marketplace_products", {
  id: serial("id").primaryKey(),
  vendorId: integer("vendor_id").notNull().references(() => marketplaceVendorsTable.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // ISP, VoIP, Security, etc.
  price: decimal("price", { precision: 12, scale: 2 }),
  commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }).notNull().default("15.00"),
  status: marketplaceProductStatusEnum("status").notNull().default("draft"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const marketplaceOrdersTable = pgTable("marketplace_orders", {
  id: serial("id").primaryKey(),
  partnerId: integer("partner_id").notNull().references(() => partnersTable.id),
  productId: integer("product_id").notNull().references(() => marketplaceProductsTable.id),
  vendorId: integer("vendor_id").notNull().references(() => marketplaceVendorsTable.id),
  status: marketplaceOrderStatusEnum("status").notNull().default("pending"),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  commissionAmount: decimal("commission_amount", { precision: 12, scale: 2 }).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const marketplacePayoutsTable = pgTable("marketplace_payouts", {
  id: serial("id").primaryKey(),
  partnerId: integer("partner_id").notNull().references(() => partnersTable.id),
  totalCommission: decimal("total_commission", { precision: 12, scale: 2 }).notNull(),
  status: pgEnum("payout_status", ["pending", "processing", "completed", "failed"])("status").notNull().default("pending"),
  payoutDate: timestamp("payout_date"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertMarketplaceVendorSchema = createInsertSchema(marketplaceVendorsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type MarketplaceVendor = typeof marketplaceVendorsTable.$inferSelect;
export type InsertMarketplaceVendor = z.infer<typeof insertMarketplaceVendorSchema>;

export const insertMarketplaceProductSchema = createInsertSchema(marketplaceProductsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type MarketplaceProduct = typeof marketplaceProductsTable.$inferSelect;
export type InsertMarketplaceProduct = z.infer<typeof insertMarketplaceProductSchema>;

export const insertMarketplaceOrderSchema = createInsertSchema(marketplaceOrdersTable).omit({ id: true, createdAt: true, updatedAt: true });
export type MarketplaceOrder = typeof marketplaceOrdersTable.$inferSelect;
export type InsertMarketplaceOrder = z.infer<typeof insertMarketplaceOrderSchema>;

export const insertMarketplacePayoutSchema = createInsertSchema(marketplacePayoutsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type MarketplacePayout = typeof marketplacePayoutsTable.$inferSelect;
export type InsertMarketplacePayout = z.infer<typeof insertMarketplacePayoutSchema>;
