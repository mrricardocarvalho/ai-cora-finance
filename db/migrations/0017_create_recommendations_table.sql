CREATE TYPE "recommendation_status" AS ENUM ('active', 'completed', 'dismissed', 'snoozed');
CREATE TYPE "recommendation_priority" AS ENUM ('urgent', 'important', 'optimization');

CREATE TABLE IF NOT EXISTS "recommendations" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL REFERENCES "profiles"("id"),
	"type" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"action_link" text,
	"priority" "recommendation_priority" DEFAULT 'optimization',
	"status" "recommendation_status" DEFAULT 'active',
	"snoozed_until" timestamp,
	"impact_score" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
