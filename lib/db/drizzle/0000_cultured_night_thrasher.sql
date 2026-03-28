CREATE TYPE "public"."user_role" AS ENUM('client', 'admin');--> statement-breakpoint
CREATE TYPE "public"."company_size" AS ENUM('1-10', '11-50', '51-200', '200+');--> statement-breakpoint
CREATE TYPE "public"."proposal_status" AS ENUM('draft', 'sent', 'viewed', 'accepted', 'rejected', 'expired');--> statement-breakpoint
CREATE TYPE "public"."quote_status" AS ENUM('pending', 'reviewed', 'quoted', 'closed');--> statement-breakpoint
CREATE TYPE "public"."ticket_category" AS ENUM('hardware', 'software', 'network', 'zoom', 'cloud', 'security', 'other');--> statement-breakpoint
CREATE TYPE "public"."ticket_priority" AS ENUM('low', 'medium', 'high', 'critical');--> statement-breakpoint
CREATE TYPE "public"."ticket_status" AS ENUM('open', 'in_progress', 'resolved', 'closed');--> statement-breakpoint
CREATE TYPE "public"."sender_type" AS ENUM('user', 'agent');--> statement-breakpoint
CREATE TYPE "public"."blog_post_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."cert_status" AS ENUM('not_started', 'in_progress', 'completed', 'expired');--> statement-breakpoint
CREATE TYPE "public"."commission_status" AS ENUM('pending', 'approved', 'paid', 'disputed', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."deal_stage" AS ENUM('prospect', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost');--> statement-breakpoint
CREATE TYPE "public"."deal_status" AS ENUM('registered', 'in_progress', 'won', 'lost', 'expired');--> statement-breakpoint
CREATE TYPE "public"."document_category" AS ENUM('contract', 'proposal', 'invoice', 'report', 'agreement', 'other');--> statement-breakpoint
CREATE TYPE "public"."lead_status_partner" AS ENUM('new', 'contacted', 'qualified', 'converted', 'lost');--> statement-breakpoint
CREATE TYPE "public"."partner_status" AS ENUM('pending', 'approved', 'rejected', 'suspended');--> statement-breakpoint
CREATE TYPE "public"."partner_ticket_priority" AS ENUM('low', 'medium', 'high', 'urgent');--> statement-breakpoint
CREATE TYPE "public"."partner_ticket_status" AS ENUM('open', 'in_progress', 'waiting', 'resolved', 'closed');--> statement-breakpoint
CREATE TYPE "public"."partner_tier" AS ENUM('registered', 'silver', 'gold', 'platinum');--> statement-breakpoint
CREATE TYPE "public"."resource_category" AS ENUM('marketing', 'sales', 'technical', 'training', 'zoom', 'general');--> statement-breakpoint
CREATE TYPE "public"."resource_type" AS ENUM('pdf', 'video', 'link', 'image', 'presentation');--> statement-breakpoint
CREATE TYPE "public"."tsd_provider" AS ENUM('avant', 'telarus', 'intelisys');--> statement-breakpoint
CREATE TYPE "public"."tsd_sync_direction" AS ENUM('outbound', 'inbound');--> statement-breakpoint
CREATE TYPE "public"."tsd_sync_entity" AS ENUM('deal', 'lead', 'commission', 'webhook');--> statement-breakpoint
CREATE TYPE "public"."tsd_sync_status" AS ENUM('success', 'failure', 'partial');--> statement-breakpoint
CREATE TABLE "login_codes" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"code" text NOT NULL,
	"type" text DEFAULT 'partner' NOT NULL,
	"expires_at" timestamp NOT NULL,
	"used_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"company" text NOT NULL,
	"phone" text,
	"role" "user_role" DEFAULT 'client' NOT NULL,
	"sso_provider" text,
	"sso_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "contacts" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"company" text,
	"service" text,
	"message" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quote_line_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"proposal_id" integer NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"category" text DEFAULT 'service' NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"unit_price" numeric(12, 2) NOT NULL,
	"unit" text DEFAULT 'each' NOT NULL,
	"recurring" boolean DEFAULT false NOT NULL,
	"recurring_interval" text,
	"total" numeric(12, 2) NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quote_proposals" (
	"id" serial PRIMARY KEY NOT NULL,
	"quote_id" integer,
	"proposal_number" text NOT NULL,
	"client_name" text NOT NULL,
	"client_email" text NOT NULL,
	"client_company" text NOT NULL,
	"client_phone" text,
	"title" text NOT NULL,
	"summary" text,
	"subtotal" numeric(12, 2) DEFAULT '0' NOT NULL,
	"discount" numeric(12, 2) DEFAULT '0' NOT NULL,
	"discount_type" text DEFAULT 'fixed' NOT NULL,
	"tax" numeric(12, 2) DEFAULT '0' NOT NULL,
	"total" numeric(12, 2) DEFAULT '0' NOT NULL,
	"status" "proposal_status" DEFAULT 'draft' NOT NULL,
	"valid_until" timestamp,
	"terms" text,
	"notes" text,
	"sent_at" timestamp,
	"viewed_at" timestamp,
	"responded_at" timestamp,
	"client_signature" text,
	"version" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "quote_proposals_proposal_number_unique" UNIQUE("proposal_number")
);
--> statement-breakpoint
CREATE TABLE "quotes" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"company" text NOT NULL,
	"company_size" "company_size",
	"services" text NOT NULL,
	"budget" text,
	"timeline" text,
	"details" text,
	"status" "quote_status" DEFAULT 'pending' NOT NULL,
	"assigned_to" text,
	"internal_notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ticket_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"ticket_id" integer NOT NULL,
	"sender_type" text NOT NULL,
	"sender_name" text NOT NULL,
	"message" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tickets" (
	"id" serial PRIMARY KEY NOT NULL,
	"subject" text NOT NULL,
	"description" text NOT NULL,
	"priority" "ticket_priority" NOT NULL,
	"category" "ticket_category" NOT NULL,
	"status" "ticket_status" DEFAULT 'open' NOT NULL,
	"user_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chat_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"sender" "sender_type" NOT NULL,
	"message" text NOT NULL,
	"name" text,
	"email" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "activity_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"action" text NOT NULL,
	"entity" text NOT NULL,
	"entity_id" integer,
	"details" text,
	"ip_address" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "blog_posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"excerpt" text,
	"content" text NOT NULL,
	"cover_image" text,
	"author" text DEFAULT 'Siebert Services' NOT NULL,
	"category" text DEFAULT 'general' NOT NULL,
	"tags" text DEFAULT '[]' NOT NULL,
	"status" "blog_post_status" DEFAULT 'draft' NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "blog_posts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "faq_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"question" text NOT NULL,
	"answer" text NOT NULL,
	"category" text DEFAULT 'general' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cms_services" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"icon" text DEFAULT 'Monitor' NOT NULL,
	"category" text DEFAULT 'general' NOT NULL,
	"features" text DEFAULT '[]' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"value" text NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "site_settings_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "team_members" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"role" text NOT NULL,
	"bio" text,
	"image_url" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "testimonials" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"company" text NOT NULL,
	"role" text,
	"content" text NOT NULL,
	"rating" integer DEFAULT 5 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"filename" text NOT NULL,
	"mime_type" text DEFAULT 'application/octet-stream' NOT NULL,
	"size" integer DEFAULT 0 NOT NULL,
	"content" text NOT NULL,
	"category" "document_category" DEFAULT 'other' NOT NULL,
	"partner_id" integer,
	"uploaded_by" text DEFAULT 'admin' NOT NULL,
	"tags" text DEFAULT '[]' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "partner_announcements" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"category" text DEFAULT 'general' NOT NULL,
	"min_tier" "partner_tier" DEFAULT 'registered' NOT NULL,
	"pinned" boolean DEFAULT false NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"published_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "partner_cert_progress" (
	"id" serial PRIMARY KEY NOT NULL,
	"partner_id" integer NOT NULL,
	"certification_id" integer NOT NULL,
	"status" "cert_status" DEFAULT 'not_started' NOT NULL,
	"progress_pct" integer DEFAULT 0 NOT NULL,
	"completed_at" timestamp,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "partner_certifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"provider" text DEFAULT 'Siebert Services' NOT NULL,
	"category" text DEFAULT 'general' NOT NULL,
	"duration" text,
	"badge_url" text,
	"active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "partner_commissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"partner_id" integer NOT NULL,
	"deal_id" integer,
	"type" text DEFAULT 'deal' NOT NULL,
	"description" text NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"rate" numeric(5, 2),
	"status" "commission_status" DEFAULT 'pending' NOT NULL,
	"notes" text,
	"tsd_discrepancy" text,
	"paid_at" timestamp,
	"period_start" timestamp,
	"period_end" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "partner_deals" (
	"id" serial PRIMARY KEY NOT NULL,
	"partner_id" integer NOT NULL,
	"title" text NOT NULL,
	"customer_name" text NOT NULL,
	"customer_email" text,
	"customer_phone" text,
	"description" text,
	"products" text DEFAULT '[]' NOT NULL,
	"estimated_value" numeric(12, 2),
	"actual_value" numeric(12, 2),
	"status" "deal_status" DEFAULT 'registered' NOT NULL,
	"stage" "deal_stage" DEFAULT 'prospect' NOT NULL,
	"expected_close_date" timestamp,
	"closed_at" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "partner_leads" (
	"id" serial PRIMARY KEY NOT NULL,
	"partner_id" integer NOT NULL,
	"company_name" text NOT NULL,
	"contact_name" text NOT NULL,
	"email" text,
	"phone" text,
	"source" text,
	"interest" text,
	"status" "lead_status_partner" DEFAULT 'new' NOT NULL,
	"notes" text,
	"assigned_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "partner_resources" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"url" text NOT NULL,
	"type" "resource_type" DEFAULT 'pdf' NOT NULL,
	"category" "resource_category" DEFAULT 'general' NOT NULL,
	"min_tier" "partner_tier" DEFAULT 'registered' NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"download_count" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "partner_support_tickets" (
	"id" serial PRIMARY KEY NOT NULL,
	"partner_id" integer NOT NULL,
	"subject" text NOT NULL,
	"description" text NOT NULL,
	"category" text DEFAULT 'general' NOT NULL,
	"priority" "partner_ticket_priority" DEFAULT 'medium' NOT NULL,
	"status" "partner_ticket_status" DEFAULT 'open' NOT NULL,
	"assigned_to" text,
	"resolution" text,
	"resolved_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "partner_ticket_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"ticket_id" integer NOT NULL,
	"sender_type" text DEFAULT 'partner' NOT NULL,
	"sender_name" text NOT NULL,
	"message" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "partners" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_name" text NOT NULL,
	"contact_name" text NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"phone" text,
	"website" text,
	"address" text,
	"city" text,
	"state" text,
	"zip" text,
	"country" text DEFAULT 'US' NOT NULL,
	"business_type" text,
	"years_in_business" text,
	"employee_count" text,
	"annual_revenue" text,
	"specializations" text DEFAULT '[]' NOT NULL,
	"tier" "partner_tier" DEFAULT 'registered' NOT NULL,
	"status" "partner_status" DEFAULT 'pending' NOT NULL,
	"total_deals" integer DEFAULT 0 NOT NULL,
	"total_revenue" numeric(12, 2) DEFAULT '0' NOT NULL,
	"ytd_revenue" numeric(12, 2) DEFAULT '0' NOT NULL,
	"commission_rate" numeric(5, 2) DEFAULT '10.00' NOT NULL,
	"sso_provider" text,
	"sso_id" text,
	"is_admin" boolean DEFAULT false NOT NULL,
	"approved_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "partners_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "tsd_configs" (
	"id" serial PRIMARY KEY NOT NULL,
	"provider" "tsd_provider" NOT NULL,
	"enabled" boolean DEFAULT false NOT NULL,
	"credential_ref" text,
	"webhook_secret" text,
	"last_lead_sync_at" timestamp,
	"last_commission_sync_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tsd_configs_provider_unique" UNIQUE("provider")
);
--> statement-breakpoint
CREATE TABLE "tsd_sync_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"provider" "tsd_provider" NOT NULL,
	"direction" "tsd_sync_direction" NOT NULL,
	"entity_type" "tsd_sync_entity" NOT NULL,
	"status" "tsd_sync_status" NOT NULL,
	"records_affected" integer DEFAULT 0 NOT NULL,
	"payload_summary" text,
	"error_message" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "conversations" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"conversation_id" integer NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "quote_line_items" ADD CONSTRAINT "quote_line_items_proposal_id_quote_proposals_id_fk" FOREIGN KEY ("proposal_id") REFERENCES "public"."quote_proposals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_proposals" ADD CONSTRAINT "quote_proposals_quote_id_quotes_id_fk" FOREIGN KEY ("quote_id") REFERENCES "public"."quotes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket_messages" ADD CONSTRAINT "ticket_messages_ticket_id_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."tickets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partner_cert_progress" ADD CONSTRAINT "partner_cert_progress_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partner_cert_progress" ADD CONSTRAINT "partner_cert_progress_certification_id_partner_certifications_id_fk" FOREIGN KEY ("certification_id") REFERENCES "public"."partner_certifications"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partner_commissions" ADD CONSTRAINT "partner_commissions_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partner_commissions" ADD CONSTRAINT "partner_commissions_deal_id_partner_deals_id_fk" FOREIGN KEY ("deal_id") REFERENCES "public"."partner_deals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partner_deals" ADD CONSTRAINT "partner_deals_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partner_leads" ADD CONSTRAINT "partner_leads_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partner_support_tickets" ADD CONSTRAINT "partner_support_tickets_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partner_ticket_messages" ADD CONSTRAINT "partner_ticket_messages_ticket_id_partner_support_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."partner_support_tickets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "IDX_session_expire" ON "sessions" USING btree ("expire");