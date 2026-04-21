CREATE TABLE IF NOT EXISTS "written_plans" (
	"id" serial PRIMARY KEY NOT NULL,
	"partner_id" integer,
	"plan_number" text NOT NULL,
	"version" integer NOT NULL DEFAULT 1,
	"parent_plan_id" integer,
	"client_name" text NOT NULL,
	"client_email" text NOT NULL,
	"client_title" text,
	"client_company" text NOT NULL,
	"client_phone" text,
	"questionnaire_answers" jsonb NOT NULL DEFAULT '{}',
	"plan_content" jsonb NOT NULL DEFAULT '{}',
	"status" text NOT NULL DEFAULT 'draft',
	"review_token" text,
	"expires_at" timestamp,
	"validity_days" integer NOT NULL DEFAULT 30,
	"personal_note" text,
	"sent_at" timestamp,
	"viewed_at" timestamp,
	"approved_at" timestamp,
	"signer_name" text,
	"signer_title" text,
	"signature_image" text,
	"decline_reason" text,
	"decline_note" text,
	"created_at" timestamp NOT NULL DEFAULT now(),
	"updated_at" timestamp NOT NULL DEFAULT now(),
	CONSTRAINT "written_plans_plan_number_unique" UNIQUE("plan_number"),
	CONSTRAINT "written_plans_review_token_unique" UNIQUE("review_token")
);

CREATE TABLE IF NOT EXISTS "plan_activity_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"plan_id" integer NOT NULL,
	"event_type" text NOT NULL,
	"metadata" jsonb DEFAULT '{}',
	"created_at" timestamp NOT NULL DEFAULT now(),
	CONSTRAINT "plan_activity_events_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "written_plans"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "written_plans_partner_id_idx" ON "written_plans" ("partner_id");
CREATE INDEX IF NOT EXISTS "written_plans_review_token_idx" ON "written_plans" ("review_token");
CREATE INDEX IF NOT EXISTS "written_plans_status_idx" ON "written_plans" ("status");
CREATE INDEX IF NOT EXISTS "written_plans_expires_at_idx" ON "written_plans" ("expires_at");
CREATE INDEX IF NOT EXISTS "plan_activity_events_plan_id_idx" ON "plan_activity_events" ("plan_id");
