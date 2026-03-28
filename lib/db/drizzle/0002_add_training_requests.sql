DO $$ BEGIN
 CREATE TYPE "public"."training_request_status" AS ENUM('pending', 'scheduled', 'completed', 'cancelled');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "training_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"partner_id" integer NOT NULL,
	"vendor_name" text NOT NULL,
	"topic" text NOT NULL,
	"preferred_date" text,
	"attendee_count" integer DEFAULT 1 NOT NULL,
	"contact_name" text NOT NULL,
	"contact_email" text NOT NULL,
	"notes" text,
	"status" "training_request_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "training_requests" ADD CONSTRAINT "training_requests_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
