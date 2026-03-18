-- Rename tags table to activity_types
ALTER TABLE "tags" RENAME TO "activity_types";
--> statement-breakpoint

-- Update the FK constraint on activity_types (user_id references users)
ALTER TABLE "activity_types" DROP CONSTRAINT "tags_user_id_users_id_fkey";
--> statement-breakpoint
ALTER TABLE "activity_types" ADD CONSTRAINT "activity_types_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;
--> statement-breakpoint

-- Rename tag_id column to activity_type_id on todos
ALTER TABLE "todos" RENAME COLUMN "tag_id" TO "activity_type_id";
--> statement-breakpoint
ALTER TABLE "todos" DROP CONSTRAINT "todos_tag_id_tags_id_fkey";
--> statement-breakpoint
ALTER TABLE "todos" ADD CONSTRAINT "todos_activity_type_id_activity_types_id_fkey" FOREIGN KEY ("activity_type_id") REFERENCES "activity_types"("id") ON DELETE SET NULL;
--> statement-breakpoint

-- Rename tag_id column to activity_type_id on habits
ALTER TABLE "habits" RENAME COLUMN "tag_id" TO "activity_type_id";
--> statement-breakpoint
ALTER TABLE "habits" DROP CONSTRAINT "habits_tag_id_tags_id_fkey";
--> statement-breakpoint
ALTER TABLE "habits" ADD CONSTRAINT "habits_activity_type_id_activity_types_id_fkey" FOREIGN KEY ("activity_type_id") REFERENCES "activity_types"("id") ON DELETE SET NULL;
--> statement-breakpoint

-- Rename tag_id column to activity_type_id on time_blocks
ALTER TABLE "time_blocks" RENAME COLUMN "tag_id" TO "activity_type_id";
--> statement-breakpoint
ALTER TABLE "time_blocks" DROP CONSTRAINT "time_blocks_tag_id_tags_id_fkey";
--> statement-breakpoint
ALTER TABLE "time_blocks" ADD CONSTRAINT "time_blocks_activity_type_id_activity_types_id_fkey" FOREIGN KEY ("activity_type_id") REFERENCES "activity_types"("id") ON DELETE SET NULL;
