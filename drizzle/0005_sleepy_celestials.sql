CREATE TABLE "web_instances" (
	"challenge_id" integer PRIMARY KEY NOT NULL,
	"container_id" text NOT NULL,
	"port" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "challenges" ADD COLUMN "web_image_ref" text;--> statement-breakpoint
ALTER TABLE "web_instances" ADD CONSTRAINT "web_instances_challenge_id_challenges_id_fk" FOREIGN KEY ("challenge_id") REFERENCES "public"."challenges"("id") ON DELETE no action ON UPDATE no action;