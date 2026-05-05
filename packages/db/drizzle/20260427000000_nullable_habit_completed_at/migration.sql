ALTER TABLE "habit_completions" ALTER COLUMN "completed_at" DROP NOT NULL;
--> statement-breakpoint
ALTER TABLE "habit_completions" ALTER COLUMN "completed_at" DROP DEFAULT;
