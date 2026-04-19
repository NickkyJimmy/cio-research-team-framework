CREATE TABLE "skill_eval_alerts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"suite_id" uuid NOT NULL,
	"benchmark_id" uuid,
	"type" text NOT NULL,
	"severity" text DEFAULT 'warning' NOT NULL,
	"metric" text NOT NULL,
	"threshold" real NOT NULL,
	"actual_value" real,
	"previous_value" real,
	"message" text NOT NULL,
	"acknowledged" text,
	"acknowledged_at" timestamp with time zone,
	"details" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "skill_eval_benchmarks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"suite_id" uuid NOT NULL,
	"agent_id" uuid NOT NULL,
	"skill_id" uuid,
	"skill_snapshot" jsonb,
	"name" text,
	"status" text DEFAULT 'queued' NOT NULL,
	"variants" jsonb DEFAULT '["with_skill","without_skill"]'::jsonb NOT NULL,
	"trials_per_case" integer DEFAULT 3 NOT NULL,
	"max_concurrent" integer DEFAULT 3 NOT NULL,
	"config" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"summary" jsonb,
	"paperclip_sync_status" text,
	"feedback_export_id" uuid,
	"started_at" timestamp with time zone,
	"finished_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "skill_eval_cases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"suite_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"case_type" text DEFAULT 'behavior' NOT NULL,
	"prompt" text NOT NULL,
	"context_files" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"expected" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"grader_config" jsonb,
	"should_fire" text,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"weight" real DEFAULT 1 NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "skill_eval_comparisons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"benchmark_id" uuid NOT NULL,
	"case_id" uuid NOT NULL,
	"variant_a" text NOT NULL,
	"variant_b" text NOT NULL,
	"winner" text,
	"judge_type" text NOT NULL,
	"judge_config" jsonb,
	"reasoning" text,
	"scores" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "skill_eval_graders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"config" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "skill_eval_metrics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"type" text NOT NULL,
	"grader_id" uuid,
	"extraction" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "skill_eval_suites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"agent_id" uuid,
	"name" text NOT NULL,
	"description" text,
	"skill_id" uuid,
	"config" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "skill_eval_trials" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"benchmark_id" uuid NOT NULL,
	"case_id" uuid NOT NULL,
	"variant" text NOT NULL,
	"trial_number" integer NOT NULL,
	"heartbeat_run_id" uuid,
	"status" text DEFAULT 'queued' NOT NULL,
	"transcript" jsonb,
	"outcome" jsonb,
	"grader_results" jsonb,
	"metric_values" jsonb,
	"token_usage" jsonb,
	"latency_ms" integer,
	"cost_cents" integer,
	"error" text,
	"started_at" timestamp with time zone,
	"finished_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "skill_eval_alerts" ADD CONSTRAINT "skill_eval_alerts_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skill_eval_alerts" ADD CONSTRAINT "skill_eval_alerts_suite_id_skill_eval_suites_id_fk" FOREIGN KEY ("suite_id") REFERENCES "public"."skill_eval_suites"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skill_eval_alerts" ADD CONSTRAINT "skill_eval_alerts_benchmark_id_skill_eval_benchmarks_id_fk" FOREIGN KEY ("benchmark_id") REFERENCES "public"."skill_eval_benchmarks"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skill_eval_benchmarks" ADD CONSTRAINT "skill_eval_benchmarks_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skill_eval_benchmarks" ADD CONSTRAINT "skill_eval_benchmarks_suite_id_skill_eval_suites_id_fk" FOREIGN KEY ("suite_id") REFERENCES "public"."skill_eval_suites"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skill_eval_benchmarks" ADD CONSTRAINT "skill_eval_benchmarks_agent_id_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skill_eval_benchmarks" ADD CONSTRAINT "skill_eval_benchmarks_skill_id_company_skills_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."company_skills"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skill_eval_cases" ADD CONSTRAINT "skill_eval_cases_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skill_eval_cases" ADD CONSTRAINT "skill_eval_cases_suite_id_skill_eval_suites_id_fk" FOREIGN KEY ("suite_id") REFERENCES "public"."skill_eval_suites"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skill_eval_comparisons" ADD CONSTRAINT "skill_eval_comparisons_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skill_eval_comparisons" ADD CONSTRAINT "skill_eval_comparisons_benchmark_id_skill_eval_benchmarks_id_fk" FOREIGN KEY ("benchmark_id") REFERENCES "public"."skill_eval_benchmarks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skill_eval_comparisons" ADD CONSTRAINT "skill_eval_comparisons_case_id_skill_eval_cases_id_fk" FOREIGN KEY ("case_id") REFERENCES "public"."skill_eval_cases"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skill_eval_graders" ADD CONSTRAINT "skill_eval_graders_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skill_eval_metrics" ADD CONSTRAINT "skill_eval_metrics_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skill_eval_metrics" ADD CONSTRAINT "skill_eval_metrics_grader_id_skill_eval_graders_id_fk" FOREIGN KEY ("grader_id") REFERENCES "public"."skill_eval_graders"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skill_eval_suites" ADD CONSTRAINT "skill_eval_suites_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skill_eval_suites" ADD CONSTRAINT "skill_eval_suites_agent_id_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skill_eval_suites" ADD CONSTRAINT "skill_eval_suites_skill_id_company_skills_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."company_skills"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skill_eval_trials" ADD CONSTRAINT "skill_eval_trials_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skill_eval_trials" ADD CONSTRAINT "skill_eval_trials_benchmark_id_skill_eval_benchmarks_id_fk" FOREIGN KEY ("benchmark_id") REFERENCES "public"."skill_eval_benchmarks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skill_eval_trials" ADD CONSTRAINT "skill_eval_trials_case_id_skill_eval_cases_id_fk" FOREIGN KEY ("case_id") REFERENCES "public"."skill_eval_cases"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skill_eval_trials" ADD CONSTRAINT "skill_eval_trials_heartbeat_run_id_heartbeat_runs_id_fk" FOREIGN KEY ("heartbeat_run_id") REFERENCES "public"."heartbeat_runs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "skill_eval_alerts_company_suite_idx" ON "skill_eval_alerts" USING btree ("company_id","suite_id");--> statement-breakpoint
CREATE INDEX "skill_eval_alerts_company_created_idx" ON "skill_eval_alerts" USING btree ("company_id","created_at");--> statement-breakpoint
CREATE INDEX "skill_eval_benchmarks_company_status_idx" ON "skill_eval_benchmarks" USING btree ("company_id","status");--> statement-breakpoint
CREATE INDEX "skill_eval_benchmarks_company_suite_idx" ON "skill_eval_benchmarks" USING btree ("company_id","suite_id");--> statement-breakpoint
CREATE INDEX "skill_eval_benchmarks_company_agent_idx" ON "skill_eval_benchmarks" USING btree ("company_id","agent_id");--> statement-breakpoint
CREATE INDEX "skill_eval_cases_company_suite_idx" ON "skill_eval_cases" USING btree ("company_id","suite_id");--> statement-breakpoint
CREATE INDEX "skill_eval_comparisons_benchmark_case_idx" ON "skill_eval_comparisons" USING btree ("benchmark_id","case_id");--> statement-breakpoint
CREATE INDEX "skill_eval_graders_company_type_idx" ON "skill_eval_graders" USING btree ("company_id","type");--> statement-breakpoint
CREATE INDEX "skill_eval_metrics_company_idx" ON "skill_eval_metrics" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "skill_eval_suites_company_status_idx" ON "skill_eval_suites" USING btree ("company_id","status");--> statement-breakpoint
CREATE INDEX "skill_eval_suites_company_skill_idx" ON "skill_eval_suites" USING btree ("company_id","skill_id");--> statement-breakpoint
CREATE INDEX "skill_eval_suites_company_agent_idx" ON "skill_eval_suites" USING btree ("company_id","agent_id");--> statement-breakpoint
CREATE INDEX "skill_eval_trials_company_benchmark_idx" ON "skill_eval_trials" USING btree ("company_id","benchmark_id");--> statement-breakpoint
CREATE INDEX "skill_eval_trials_benchmark_case_variant_idx" ON "skill_eval_trials" USING btree ("benchmark_id","case_id","variant");