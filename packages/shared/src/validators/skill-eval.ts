import { z } from "zod";
import {
  SKILL_EVAL_SUITE_STATUSES,
  SKILL_EVAL_VARIANTS,
  SKILL_EVAL_CASE_TYPES,
  SKILL_EVAL_GRADER_TYPES,
  SKILL_EVAL_METRIC_TYPES,
  SKILL_EVAL_ALERT_SEVERITIES,
} from "../types/skill-eval.js";

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

export const skillEvalSuiteStatusSchema = z.enum(SKILL_EVAL_SUITE_STATUSES);
export const skillEvalVariantSchema = z.enum(SKILL_EVAL_VARIANTS);
export const skillEvalCaseTypeSchema = z.enum(SKILL_EVAL_CASE_TYPES);
export const skillEvalGraderTypeSchema = z.enum(SKILL_EVAL_GRADER_TYPES);
export const skillEvalMetricTypeSchema = z.enum(SKILL_EVAL_METRIC_TYPES);
export const skillEvalAlertSeveritySchema = z.enum(SKILL_EVAL_ALERT_SEVERITIES);

export const createSkillEvalSuiteSchema = z.object({
  name: z.string().trim().min(1).max(200),
  description: z.string().trim().max(2000).optional(),
  skillId: z.string().uuid().optional(),
  config: z.record(z.unknown()).optional(),
  status: skillEvalSuiteStatusSchema.optional(),
});
export type CreateSkillEvalSuite = z.infer<typeof createSkillEvalSuiteSchema>;

export const updateSkillEvalSuiteSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(2000).optional().nullable(),
  skillId: z.string().uuid().optional().nullable(),
  config: z.record(z.unknown()).optional(),
  status: skillEvalSuiteStatusSchema.optional(),
});
export type UpdateSkillEvalSuite = z.infer<typeof updateSkillEvalSuiteSchema>;

// ---------------------------------------------------------------------------
// Case
// ---------------------------------------------------------------------------

export const createSkillEvalCaseSchema = z.object({
  name: z.string().trim().min(1).max(200),
  description: z.string().trim().max(2000).optional(),
  caseType: skillEvalCaseTypeSchema.optional(),
  prompt: z.string().trim().min(1).max(50_000),
  contextFiles: z
    .array(z.object({ path: z.string(), content: z.string() }))
    .max(50)
    .optional(),
  expected: z.record(z.unknown()).optional(),
  graderConfig: z.record(z.unknown()).optional(),
  shouldFire: z.string().trim().max(200).optional().nullable(),
  tags: z.array(z.string().trim().max(50)).max(20).optional(),
  weight: z.number().min(0).max(100).optional(),
  orderIndex: z.number().int().min(0).optional(),
});
export type CreateSkillEvalCase = z.infer<typeof createSkillEvalCaseSchema>;

export const updateSkillEvalCaseSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(2000).optional().nullable(),
  caseType: skillEvalCaseTypeSchema.optional(),
  prompt: z.string().trim().min(1).max(50_000).optional(),
  contextFiles: z
    .array(z.object({ path: z.string(), content: z.string() }))
    .max(50)
    .optional(),
  expected: z.record(z.unknown()).optional(),
  graderConfig: z.record(z.unknown()).optional().nullable(),
  shouldFire: z.string().trim().max(200).optional().nullable(),
  tags: z.array(z.string().trim().max(50)).max(20).optional(),
  weight: z.number().min(0).max(100).optional(),
  orderIndex: z.number().int().min(0).optional(),
});
export type UpdateSkillEvalCase = z.infer<typeof updateSkillEvalCaseSchema>;

// ---------------------------------------------------------------------------
// Grader
// ---------------------------------------------------------------------------

export const createSkillEvalGraderSchema = z.object({
  name: z.string().trim().min(1).max(200),
  type: skillEvalGraderTypeSchema,
  config: z.record(z.unknown()),
});
export type CreateSkillEvalGrader = z.infer<typeof createSkillEvalGraderSchema>;

export const updateSkillEvalGraderSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  type: skillEvalGraderTypeSchema.optional(),
  config: z.record(z.unknown()).optional(),
});
export type UpdateSkillEvalGrader = z.infer<typeof updateSkillEvalGraderSchema>;

// ---------------------------------------------------------------------------
// Metric
// ---------------------------------------------------------------------------

export const createSkillEvalMetricSchema = z.object({
  name: z.string().trim().min(1).max(200),
  description: z.string().trim().max(2000).optional(),
  type: skillEvalMetricTypeSchema,
  graderId: z.string().uuid().optional(),
  extraction: z.record(z.unknown()).optional(),
});
export type CreateSkillEvalMetric = z.infer<typeof createSkillEvalMetricSchema>;

// ---------------------------------------------------------------------------
// Benchmark
// ---------------------------------------------------------------------------

export const skillSnapshotSchema = z.object({
  name: z.string(),
  description: z.string(),
  skillMd: z.string(),
  scripts: z.array(z.object({ path: z.string(), content: z.string() })),
  references: z.array(z.object({ path: z.string(), content: z.string() })),
  assets: z.array(z.object({ path: z.string(), contentHash: z.string(), url: z.string().optional() })),
});

export const variantConfigSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("skill_snapshot"), label: z.string(), snapshot: skillSnapshotSchema }),
  z.object({ type: z.literal("no_skill") }),
  z.object({ type: z.literal("custom_draft"), label: z.string(), snapshot: skillSnapshotSchema }),
]);

export const skillLabBenchmarkCreateSchema = z.object({
  suiteId: z.string().uuid(),
  agentId: z.string().uuid(),
  skillId: z.string().uuid(),
  mode: z.literal("skill_lab"),
  customVariants: z.record(z.string(), variantConfigSchema),
  trialsPerCase: z.number().int().min(1).max(10).optional(),
  maxConcurrent: z.number().int().min(1).max(10).optional(),
});

export const quickCompareSchema = z.object({
  suiteId: z.string().uuid(),
  agentId: z.string().uuid(),
  skillId: z.string().uuid(),
  variantA: z.object({ label: z.string(), markdown: z.string() }),
  variantB: z.object({ label: z.string(), markdown: z.string() }),
  trialsPerCase: z.number().int().min(1).max(10).optional(),
});

export const promoteSchema = z.object({
  benchmarkId: z.string().uuid(),
  winningVariantKey: z.string(),
});

export const createSkillEvalBenchmarkSchema = z.object({
  suiteId: z.string().uuid(),
  agentId: z.string().uuid(),
  skillId: z.string().uuid().optional(),
  name: z.string().trim().max(200).optional(),
  variants: z.array(z.string()).min(1).max(10).optional(),
  benchmarkMode: z.enum(["standard", "skill_lab"]).optional(),
  customVariants: z.record(variantConfigSchema).optional(),
  trialsPerCase: z.number().int().min(1).max(20).optional(),
  maxConcurrent: z.number().int().min(1).max(10).optional(),
  config: z.record(z.unknown()).optional(),
});
export type CreateSkillEvalBenchmark = z.infer<typeof createSkillEvalBenchmarkSchema>;
export type SkillLabBenchmarkCreate = z.infer<typeof skillLabBenchmarkCreateSchema>;
export type QuickCompare = z.infer<typeof quickCompareSchema>;
export type Promote = z.infer<typeof promoteSchema>;
