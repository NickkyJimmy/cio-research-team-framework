import {
  pgTable,
  uuid,
  text,
  timestamp,
  jsonb,
  integer,
  real,
  index,
} from "drizzle-orm/pg-core";
import { companies } from "./companies.js";
import { skillEvalSuites } from "./skill_eval_suites.js";

export const skillEvalCases = pgTable(
  "skill_eval_cases",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    companyId: uuid("company_id").notNull().references(() => companies.id),
    suiteId: uuid("suite_id").notNull().references(() => skillEvalSuites.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    caseType: text("case_type").notNull().default("behavior"),
    prompt: text("prompt").notNull(),
    contextFiles: jsonb("context_files").$type<Array<{ path: string; content: string }>>().notNull().default([]),
    expected: jsonb("expected").$type<Record<string, unknown>>().notNull().default({}),
    graderConfig: jsonb("grader_config").$type<Record<string, unknown>>(),
    shouldFire: text("should_fire"),
    tags: jsonb("tags").$type<string[]>().notNull().default([]),
    weight: real("weight").notNull().default(1.0),
    orderIndex: integer("order_index").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    companySuiteIdx: index("skill_eval_cases_company_suite_idx").on(table.companyId, table.suiteId),
  }),
);
