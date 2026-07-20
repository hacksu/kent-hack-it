CREATE TABLE "ssh_instance_sessions" (
	"uid" text PRIMARY KEY NOT NULL,
	"challenge_id" integer NOT NULL,
	"container_id" text NOT NULL,
	"port" integer NOT NULL,
	"password" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ssh_instance_sessions" ADD CONSTRAINT "ssh_instance_sessions_uid_user_id_fk" FOREIGN KEY ("uid") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ssh_instance_sessions" ADD CONSTRAINT "ssh_instance_sessions_challenge_id_challenges_id_fk" FOREIGN KEY ("challenge_id") REFERENCES "public"."challenges"("id") ON DELETE no action ON UPDATE no action;