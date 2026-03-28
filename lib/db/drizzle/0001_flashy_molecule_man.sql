CREATE TABLE "tsd_deal_mappings" (
	"id" serial PRIMARY KEY NOT NULL,
	"deal_id" integer NOT NULL,
	"provider" "tsd_provider" NOT NULL,
	"external_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tsd_deal_mappings" ADD CONSTRAINT "tsd_deal_mappings_deal_id_partner_deals_id_fk" FOREIGN KEY ("deal_id") REFERENCES "public"."partner_deals"("id") ON DELETE no action ON UPDATE no action;