import { pgTable, text, serial, timestamp, integer, boolean, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const siteSettingsTable = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const servicesTable = pgTable("cms_services", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull().default("Monitor"),
  category: text("category").notNull().default("general"),
  features: text("features").notNull().default("[]"),
  sortOrder: integer("sort_order").notNull().default(0),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const testimonialsTable = pgTable("testimonials", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  company: text("company").notNull(),
  role: text("role"),
  content: text("content").notNull(),
  rating: integer("rating").notNull().default(5),
  active: boolean("active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const teamMembersTable = pgTable("team_members", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  bio: text("bio"),
  imageUrl: text("image_url"),
  sortOrder: integer("sort_order").notNull().default(0),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const faqItemsTable = pgTable("faq_items", {
  id: serial("id").primaryKey(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  category: text("category").notNull().default("general"),
  sortOrder: integer("sort_order").notNull().default(0),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const blogPostStatusEnum = pgEnum("blog_post_status", ["draft", "published", "archived"]);

export const blogPostsTable = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  excerpt: text("excerpt"),
  content: text("content").notNull(),
  coverImage: text("cover_image"),
  author: text("author").notNull().default("Siebert Services"),
  category: text("category").notNull().default("general"),
  tags: text("tags").notNull().default("[]"),
  status: blogPostStatusEnum("status").notNull().default("draft"),
  featured: boolean("featured").notNull().default(false),
  publishedAt: timestamp("published_at"),
  scheduledAt: timestamp("scheduled_at"),
  contentType: text("content_type").notNull().default("news"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const activityLogTable = pgTable("activity_log", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  action: text("action").notNull(),
  entity: text("entity").notNull(),
  entityId: integer("entity_id"),
  details: text("details"),
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const caseStudiesTable = pgTable("case_studies", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  client: text("client").notNull(),
  industry: text("industry").notNull().default("General"),
  summary: text("summary").notNull(),
  problem: text("problem").notNull(),
  solution: text("solution").notNull(),
  result: text("result").notNull(),
  metrics: text("metrics").notNull().default("[]"),
  services: text("services").notNull().default("[]"),
  coverImage: text("cover_image"),
  logoUrl: text("logo_url"),
  quote: text("quote"),
  quoteAuthor: text("quote_author"),
  quoteRole: text("quote_role"),
  featured: boolean("featured").notNull().default(false),
  active: boolean("active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  publishedAt: timestamp("published_at").defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const certificationsTable = pgTable("certifications", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull().default("partner"),
  logoUrl: text("logo_url"),
  url: text("url"),
  sortOrder: integer("sort_order").notNull().default(0),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const companyStatsTable = pgTable("company_stats", {
  id: serial("id").primaryKey(),
  label: text("label").notNull(),
  value: text("value").notNull(),
  suffix: text("suffix"),
  icon: text("icon").notNull().default("TrendingUp"),
  sortOrder: integer("sort_order").notNull().default(0),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type CaseStudy = typeof caseStudiesTable.$inferSelect;
export type Certification = typeof certificationsTable.$inferSelect;
export type CompanyStat = typeof companyStatsTable.$inferSelect;

export const insertCaseStudySchema = createInsertSchema(caseStudiesTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCertificationSchema = createInsertSchema(certificationsTable).omit({ id: true, createdAt: true });
export const insertCompanyStatSchema = createInsertSchema(companyStatsTable).omit({ id: true, createdAt: true });

export const pageSectionsTable = pgTable("page_sections", {
  id: serial("id").primaryKey(),
  pageSlug: text("page_slug").notNull(),
  sectionKey: text("section_key").notNull(),
  content: text("content").notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type PageSection = typeof pageSectionsTable.$inferSelect;
export const insertPageSectionSchema = createInsertSchema(pageSectionsTable).omit({ id: true, updatedAt: true });

export const insertSiteSettingSchema = createInsertSchema(siteSettingsTable).omit({ id: true, updatedAt: true });
export const insertServiceSchema = createInsertSchema(servicesTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertTestimonialSchema = createInsertSchema(testimonialsTable).omit({ id: true, createdAt: true });
export const insertTeamMemberSchema = createInsertSchema(teamMembersTable).omit({ id: true, createdAt: true });
export const insertFaqItemSchema = createInsertSchema(faqItemsTable).omit({ id: true, createdAt: true });
export const insertBlogPostSchema = createInsertSchema(blogPostsTable).omit({ id: true, createdAt: true, updatedAt: true });

export type SiteSetting = typeof siteSettingsTable.$inferSelect;
export type CmsService = typeof servicesTable.$inferSelect;
export type Testimonial = typeof testimonialsTable.$inferSelect;
export type TeamMember = typeof teamMembersTable.$inferSelect;
export type FaqItem = typeof faqItemsTable.$inferSelect;
export type BlogPost = typeof blogPostsTable.$inferSelect;
export type ActivityLog = typeof activityLogTable.$inferSelect;
