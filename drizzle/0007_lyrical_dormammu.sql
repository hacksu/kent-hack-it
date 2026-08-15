ALTER TABLE "event_config" RENAME COLUMN "site_active" TO "event_active";--> statement-breakpoint
ALTER TABLE "event_config" ADD COLUMN "gym_active" boolean DEFAULT false NOT NULL;