 // ---------------------------------------------------------------------------
// Skill Eval Types
// ---------------------------------------------------------------------------

export const SKILL_EVAL_SUITE_STATUSES = ["draft", "active", "archived"] as const;
export type SkillEvalSuiteStatus = (typeof SKILL_EVAL_SUITE_STATUSES)[number];

export const SKILL_EVAL_VARIANTS = ["with_skill", "without_skill", "updated_skill"] as const;
export type SkillEvalVariant = (typeof SKILL_EVAL_VARIANTS)[number];

export interface SkillSnapshot {
  name: string;
  description: string;
  skillMd: string;
  scripts: Array<{ path: string; content: string }>;
  references: Array<{ path: string; content: string }>;
  assets: Array<{ path: string; contentHash: string; url?: string }>;
}

export type VariantConfig =
  | { type: "skill_snapshot"; label: string; snapshot: SkillSnapshot }
  | { type: "no_skill" }
  | { type: "custom_draft"; label: string; snapshot: SkillSnapshot };

export type BenchmarkMode = "standard" | "skill_lab";

export type CustomVariants = Record<string, VariantConfig>;

export const SKILL_TEMPLATE_YAML = `---
name: skill-name
description: >-
  What this skill does and when to trigger it.
  Be specific about trigger contexts. Claude tends to undertrigger,
  so make descriptions assertive.
---`;

export const SKILL_TEMPLATE_BODY = `# Skill Name

## When to use
Use this skill whenever the user mentions [specific triggers].

## Instructions

### Step 1: Understand the context
[Why this step matters - explain the reasoning]

### Step 2: Execute the core task
[Specific actions in imperative form]

### Step 3: Deliver the output
[Expected format and structure]

## Output Format
ALWAYS use this template:
\`\`\`
# [Title]
## Section 1
## Section 2
\`\`\`

## Examples

**Example 1:**
Input: [realistic user prompt]
Output: [expected agent response]

**Example 2:**
Input: [edge case prompt]
Output: [how to handle it]`;

export const SKILL_TEMPLATE_FULL = SKILL_TEMPLATE_YAML + "\n\n" + SKILL_TEMPLATE_BODY;

export interface SkillLabBenchmarkRequest {
  suiteId: string;
  agentId: string;
  skillId: string;
  mode: "skill_lab";
  customVariants: CustomVariants;
  trialsPerCase?: number;
  maxConcurrent?: number;
}

export interface QuickCompareRequest {
  suiteId: string;
  agentId: string;
  skillId: string;
  variantA: { label: string; markdown: string };
  variantB: { label: string; markdown: string };
  trialsPerCase?: number;
}

export interface PromoteRequest {
  benchmarkId: string;
  winningVariantKey: string;
}

export const SKILL_EVAL_CASE_TYPES = ["behavior", "trigger"] as const;
export type SkillEvalCaseType = (typeof SKILL_EVAL_CASE_TYPES)[number];

export const SKILL_EVAL_GRADER_TYPES = [
  "code_exact",
  "code_regex",
  "code_contains",
  "code_javascript",
  "llm_rubric",
  "llm_assertion",
  "llm_pairwise",
  "state_check",
] as const;
export type SkillEvalGraderType = (typeof SKILL_EVAL_GRADER_TYPES)[number];

export const SKILL_EVAL_METRIC_TYPES = ["numeric", "boolean", "categorical"] as const;
export type SkillEvalMetricType = (typeof SKILL_EVAL_METRIC_TYPES)[number];

export const SKILL_EVAL_BENCHMARK_STATUSES = [
  "queued",
  "running",
  "completed",
  "failed",
  "cancelled",
] as const;
export type SkillEvalBenchmarkStatus = (typeof SKILL_EVAL_BENCHMARK_STATUSES)[number];

export const SKILL_EVAL_TRIAL_STATUSES = [
  "queued",
  "running",
  "passed",
  "failed",
  "error",
  "skipped",
] as const;
export type SkillEvalTrialStatus = (typeof SKILL_EVAL_TRIAL_STATUSES)[number];

export const SKILL_EVAL_COMPARISON_WINNERS = [
  "variant_a",
  "variant_b",
  "tie",
  "inconclusive",
] as const;
export type SkillEvalComparisonWinner = (typeof SKILL_EVAL_COMPARISON_WINNERS)[number];

export const SKILL_EVAL_JUDGE_TYPES = ["llm", "code", "human"] as const;
export type SkillEvalJudgeType = (typeof SKILL_EVAL_JUDGE_TYPES)[number];

export const SKILL_EVAL_ALERT_TYPES = [
  "pass_rate_drop",
  "latency_increase",
  "cost_increase",
  "regression",
] as const;
export type SkillEvalAlertType = (typeof SKILL_EVAL_ALERT_TYPES)[number];

export const SKILL_EVAL_ALERT_SEVERITIES = ["info", "warning", "critical"] as const;
export type SkillEvalAlertSeverity = (typeof SKILL_EVAL_ALERT_SEVERITIES)[number];

// ---------------------------------------------------------------------------
// Entity shapes
// ---------------------------------------------------------------------------

export type SkillEvalSuite = {
  id: string;
  companyId: string;
  agentId: string | null;
  name: string;
  description: string | null;
  skillId: string | null;
  config: Record<string, unknown>;
  status: SkillEvalSuiteStatus;
  createdAt: Date | string;
  updatedAt: Date | string;
};

export type SkillEvalCase = {
  id: string;
  companyId: string;
  suiteId: string;
  name: string;
  description: string | null;
  caseType: SkillEvalCaseType;
  prompt: string;
  contextFiles: Array<{ path: string; content: string }>;
  expected: Record<string, unknown>;
  graderConfig: Record<string, unknown> | null;
  shouldFire: string | null;
  tags: string[];
  weight: number;
  orderIndex: number;
  createdAt: Date | string;
  updatedAt: Date | string;
};

export type SkillEvalGrader = {
  id: string;
  companyId: string;
  name: string;
  type: SkillEvalGraderType;
  config: Record<string, unknown>;
  createdAt: Date | string;
  updatedAt: Date | string;
};

export type SkillEvalMetric = {
  id: string;
  companyId: string;
  name: string;
  description: string | null;
  type: SkillEvalMetricType;
  graderId: string | null;
  extraction: Record<string, unknown> | null;
  createdAt: Date | string;
  updatedAt: Date | string;
};

export type SkillEvalTokenUsage = {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
};

export type SkillEvalGraderResult = {
  graderId: string | null;
  graderName: string;
  type: SkillEvalGraderType;
  passed: boolean;
  score: number | null;
  detail: string | null;
};

export type SkillEvalVariantSummary = {
  variant: SkillEvalVariant;
  totalTrials: number;
  passedTrials: number;
  passRate: number;
  avgLatencyMs: number | null;
  avgCostCents: number | null;
  avgTokens: SkillEvalTokenUsage | null;
};

export type SkillEvalCaseSummary = {
  caseId: string;
  caseName: string;
  weight: number;
  perVariant: Record<string, SkillEvalVariantSummary>;
};

export const SKILL_EVAL_RECOMMENDATIONS = ["promote", "reject", "retire", "inconclusive"] as const;
export type SkillEvalRecommendation = (typeof SKILL_EVAL_RECOMMENDATIONS)[number];

export type SkillEvalComparisonSummary = {
  winner: SkillEvalVariant | "tie";
  recommendation: SkillEvalRecommendation;
};

export type SkillEvalBenchmarkSummary = {
  totalCases: number;
  totalTrials: number;
  passRate: number;
  weightedPassRate: number;
  passAtK: number;
  passPowK: number;
  avgTokens: SkillEvalTokenUsage | null;
  avgLatencyMs: number | null;
  avgCostCents: number | null;
  perVariant: Record<string, SkillEvalVariantSummary>;
  perCase: SkillEvalCaseSummary[];
  comparison?: SkillEvalComparisonSummary;
};

export type SkillEvalBenchmark = {
  id: string;
  companyId: string;
  suiteId: string;
  agentId: string;
  skillId: string | null;
  skillSnapshot: Record<string, unknown> | null;
  name: string | null;
  status: SkillEvalBenchmarkStatus;
  variants: string[];
  benchmarkMode: BenchmarkMode;
  customVariants: CustomVariants;
  trialsPerCase: number;
  maxConcurrent: number;
  config: Record<string, unknown>;
  summary: SkillEvalBenchmarkSummary | null;
  paperclipSyncStatus: string | null;
  feedbackExportId: string | null;
  startedAt: Date | string | null;
  finishedAt: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
};

export type SkillEvalTrial = {
  id: string;
  companyId: string;
  benchmarkId: string;
  caseId: string;
  variant: SkillEvalVariant;
  trialNumber: number;
  heartbeatRunId: string | null;
  status: SkillEvalTrialStatus;
  transcript: Record<string, unknown> | null;
  outcome: Record<string, unknown> | null;
  graderResults: SkillEvalGraderResult[] | null;
  metricValues: Record<string, unknown> | null;
  tokenUsage: SkillEvalTokenUsage | null;
  latencyMs: number | null;
  costCents: number | null;
  error: string | null;
  startedAt: Date | string | null;
  finishedAt: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
};

export type SkillEvalComparison = {
  id: string;
  companyId: string;
  benchmarkId: string;
  caseId: string;
  variantA: string;
  variantB: string;
  winner: SkillEvalComparisonWinner | null;
  judgeType: SkillEvalJudgeType;
  judgeConfig: Record<string, unknown> | null;
  reasoning: string | null;
  scores: Record<string, unknown> | null;
  createdAt: Date | string;
};

export type SkillEvalAlert = {
  id: string;
  companyId: string;
  suiteId: string;
  benchmarkId: string | null;
  type: SkillEvalAlertType;
  severity: SkillEvalAlertSeverity;
  metric: string;
  threshold: number;
  actualValue: number | null;
  previousValue: number | null;
  message: string;
  acknowledged: string | null;
  acknowledgedAt: Date | string | null;
  details: Record<string, unknown> | null;
  createdAt: Date | string;
};
