import {
  pgTable,
  uuid,
  text,
  timestamp,
  jsonb,
  integer,
  index,
} from "drizzle-orm/pg-core";
import { companies } from "./companies.js";
import { heartbeatRuns } from "./heartbeat_runs.js";
import { skillEvalBenchmarks } from "./skill_eval_benchmarks.js";
import { skillEvalCases } from "./skill_eval_cases.js";

export const skillEvalTrials = pgTable(
  "skill_eval_trials",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    companyId: uuid("company_id").notNull().references(() => companies.id),
    benchmarkId: uuid("benchmark_id").notNull().references(() => skillEvalBenchmarks.id, { onDelete: "cascade" }),
    caseId: uuid("case_id").notNull().references(() => skillEvalCases.id),
    variant: text("variant").notNull(),
    trialNumber: integer("trial_number").notNull(),
    heartbeatRunId: uuid("heartbeat_run_id").references(() => heartbeatRuns.id, { onDelete: "set null" }),
    status: text("status").notNull().default("queued"),
    transcript: jsonb("transcript").$type<Record<string, unknown>>(),
    outcome: jsonb("outcome").$type<Record<string, unknown>>(),
    graderResults: jsonb("grader_results").$type<Array<Record<string, unknown>>>(),
    metricValues: jsonb("metric_values").$type<Record<string, unknown>>(),
    tokenUsage: jsonb("token_usage").$type<{ inputTokens: number; outputTokens: number; totalTokens: number }>(),
    latencyMs: integer("latency_ms"),
    costCents: integer("cost_cents"),
    error: text("error"),
    startedAt: timestamp("started_at", { withTimezone: true }),
    finishedAt: timestamp("finished_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    companyBenchmarkIdx: index("skill_eval_trials_company_benchmark_idx").on(table.companyId, table.benchmarkId),
    benchmarkCaseVariantIdx: index("skill_eval_trials_benchmark_case_variant_idx").on(
      table.benchmarkId,
      table.caseId,
      table.variant,
    ),
  }),
);
