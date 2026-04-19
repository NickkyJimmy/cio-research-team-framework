import {
  pgTable,
  uuid,
  text,
  timestamp,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { companies } from "./companies.js";
import { skillEvalBenchmarks } from "./skill_eval_benchmarks.js";
import { skillEvalCases } from "./skill_eval_cases.js";

export const skillEvalComparisons = pgTable(
  "skill_eval_comparisons",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    companyId: uuid("company_id").notNull().references(() => companies.id),
    benchmarkId: uuid("benchmark_id").notNull().references(() => skillEvalBenchmarks.id, { onDelete: "cascade" }),
    caseId: uuid("case_id").notNull().references(() => skillEvalCases.id),
    variantA: text("variant_a").notNull(),
    variantB: text("variant_b").notNull(),
    winner: text("winner"),
    judgeType: text("judge_type").notNull(),
    judgeConfig: jsonb("judge_config").$type<Record<string, unknown>>(),
    reasoning: text("reasoning"),
    scores: jsonb("scores").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    benchmarkCaseIdx: index("skill_eval_comparisons_benchmark_case_idx").on(table.benchmarkId, table.caseId),
  }),
);
