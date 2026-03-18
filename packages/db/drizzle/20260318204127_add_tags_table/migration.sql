CREATE TABLE "tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"color" text DEFAULT '#6366f1' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tags" ADD CONSTRAINT "tags_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE "todos" ADD COLUMN "tag_id" uuid;
--> statement-breakpoint
ALTER TABLE "todos" ADD CONSTRAINT "todos_tag_id_tags_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE SET NULL;
--> statement-breakpoint
ALTER TABLE "todos" DROP COLUMN "activity_type";
--> statement-breakpoint
ALTER TABLE "habits" ADD COLUMN "tag_id" uuid;
--> statement-breakpoint
ALTER TABLE "habits" ADD CONSTRAINT "habits_tag_id_tags_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE SET NULL;
--> statement-breakpoint
ALTER TABLE "habits" DROP COLUMN "activity_type";
--> statement-breakpoint
ALTER TABLE "time_blocks" ADD COLUMN "tag_id" uuid;
--> statement-breakpoint
ALTER TABLE "time_blocks" ADD CONSTRAINT "time_blocks_tag_id_tags_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE SET NULL;
--> statement-breakpoint
ALTER TABLE "time_blocks" DROP COLUMN "activity_type";