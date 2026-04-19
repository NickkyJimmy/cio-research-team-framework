import {
  pgTable,
  uuid,
  text,
  timestamp,
  jsonb,
  real,
  index,
} from "drizzle-orm/pg-core";
import { companies } from "./companies.js";
import { skillEvalSuites } from "./skill_eval_suites.js";
import { skillEvalBenchmarks } from "./skill_eval_benchmarks.js";

export const skillEvalAlerts = pgTable(
  "skill_eval_alerts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    companyId: uuid("company_id").notNull().references(() => companies.id),
    suiteId: uuid("suite_id").notNull().references(() => skillEvalSuites.id, { onDelete: "cascade" }),
    benchmarkId: uuid("benchmark_id").references(() => skillEvalBenchmarks.id, { onDelete: "set null" }),
    type: text("type").notNull(),
    severity: text("severity").notNull().default("warning"),
    metric: text("metric").notNull(),
    threshold: real("threshold").notNull(),
    actualValue: real("actual_value"),
    previousValue: real("previous_value"),
    message: text("message").notNull(),
    acknowledged: text("acknowledged"),
    acknowledgedAt: timestamp("acknowledged_at", { withTimezone: true }),
    details: jsonb("details").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    companySuiteIdx: index("skill_eval_alerts_company_suite_idx").on(table.companyId, table.suiteId),
    companyCreatedIdx: index("skill_eval_alerts_company_created_idx").on(table.companyId, table.createdAt),
  }),
);
