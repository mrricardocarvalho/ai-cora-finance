CREATE TABLE IF NOT EXISTS "autopilot_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"trigger_type" text NOT NULL,
	"trigger_condition" jsonb NOT NULL,
	"action_type" text NOT NULL,
	"action_params" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_triggered" timestamp with time zone,
	"trigger_count" integer DEFAULT 0 NOT NULL
);

CREATE TABLE IF NOT EXISTS "rule_execution_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"rule_id" uuid NOT NULL,
	"triggered_at" timestamp with time zone DEFAULT now() NOT NULL,
	"event_data" jsonb,
	"action_result" jsonb
);

DO $$ BEGIN
 ALTER TABLE "autopilot_rules" ADD CONSTRAINT "autopilot_rules_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "rule_execution_log" ADD CONSTRAINT "rule_execution_log_rule_id_autopilot_rules_id_fk" FOREIGN KEY ("rule_id") REFERENCES "public"."autopilot_rules"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
