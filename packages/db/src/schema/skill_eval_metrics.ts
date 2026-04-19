import {
  pgTable,
  uuid,
  text,
  timestamp,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { companies } from "./companies.js";
import { skillEvalGraders } from "./skill_eval_graders.js";

export const skillEvalMetrics = pgTable(
  "skill_eval_metrics",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    companyId: uuid("company_id").notNull().references(() => companies.id),
    name: text("name").notNull(),
    description: text("description"),
    type: text("type").notNull(),
    graderId: uuid("grader_id").references(() => skillEvalGraders.id, { onDelete: "set null" }),
    extraction: jsonb("extraction").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    companyIdx: index("skill_eval_metrics_company_idx").on(table.companyId),
  }),
);
