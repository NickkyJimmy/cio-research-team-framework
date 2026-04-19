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
import { agents } from "./agents.js";
import { companySkills } from "./company_skills.js";
import { skillEvalSuites } from "./skill_eval_suites.js";

export const skillEvalBenchmarks = pgTable(
  "skill_eval_benchmarks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    companyId: uuid("company_id").notNull().references(() => companies.id),
    suiteId: uuid("suite_id").notNull().references(() => skillEvalSuites.id),
    agentId: uuid("agent_id").notNull().references(() => agents.id),
    skillId: uuid("skill_id").references(() => companySkills.id, { onDelete: "set null" }),
    skillSnapshot: jsonb("skill_snapshot").$type<Record<string, unknown>>(),
    name: text("name"),
    status: text("status").notNull().default("queued"),
    variants: jsonb("variants").$type<string[]>().notNull().default(["with_skill", "without_skill"]),
    trialsPerCase: integer("trials_per_case").notNull().default(3),
    maxConcurrent: integer("max_concurrent").notNull().default(3),
    benchmarkMode: text("benchmark_mode").notNull().default("standard"),
    customVariants: jsonb("custom_variants").$type<Record<string, unknown>>().notNull().default({}),
    config: jsonb("config").$type<Record<string, unknown>>().notNull().default({}),
    summary: jsonb("summary").$type<Record<string, unknown>>(),
    paperclipSyncStatus: text("paperclip_sync_status"),
    feedbackExportId: uuid("feedback_export_id"),
    startedAt: timestamp("started_at", { withTimezone: true }),
    finishedAt: timestamp("finished_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    companyStatusIdx: index("skill_eval_benchmarks_company_status_idx").on(table.companyId, table.status),
    companySuiteIdx: index("skill_eval_benchmarks_company_suite_idx").on(table.companyId, table.suiteId),
    companyAgentIdx: index("skill_eval_benchmarks_company_agent_idx").on(table.companyId, table.agentId),
  }),
);
