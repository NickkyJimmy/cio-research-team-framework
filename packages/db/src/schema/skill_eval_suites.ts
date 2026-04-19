import {
  pgTable,
  uuid,
  text,
  timestamp,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { companies } from "./companies.js";
import { agents } from "./agents.js";
import { companySkills } from "./company_skills.js";

export const skillEvalSuites = pgTable(
  "skill_eval_suites",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    companyId: uuid("company_id").notNull().references(() => companies.id),
    agentId: uuid("agent_id").references(() => agents.id, { onDelete: "set null" }),
    name: text("name").notNull(),
    description: text("description"),
    skillId: uuid("skill_id").references(() => companySkills.id, { onDelete: "set null" }),
    config: jsonb("config").$type<Record<string, unknown>>().notNull().default({}),
    status: text("status").notNull().default("draft"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    companyStatusIdx: index("skill_eval_suites_company_status_idx").on(table.companyId, table.status),
    companySkillIdx: index("skill_eval_suites_company_skill_idx").on(table.companyId, table.skillId),
    companyAgentIdx: index("skill_eval_suites_company_agent_idx").on(table.companyId, table.agentId),
  }),
);
