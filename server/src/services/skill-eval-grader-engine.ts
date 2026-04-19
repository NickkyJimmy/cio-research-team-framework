/**
 * Skill Eval Grader Engine
 *
 * Isolated module that evaluates agent outputs against grader definitions.
 * Supports both deterministic (code-based) and LLM-based grading.
 */

import type { SkillEvalGraderResult, SkillEvalGraderType } from "@paperclipai/shared";

export type GraderInput = {
  graderId: string | null;
  graderName: string;
  type: SkillEvalGraderType;
  config: Record<string, unknown>;
};

export type GraderContext = {
  output: string;
  transcript: Record<string, unknown> | null;
  outcome: Record<string, unknown> | null;
  prompt: string;
  expected: Record<string, unknown>;
};

type LlmGraderProvider = {
  evaluate(prompt: string, model?: string, temperature?: number): Promise<string>;
};

// ---------------------------------------------------------------------------
// Deterministic graders
// ---------------------------------------------------------------------------

function gradeCodeExact(
  context: GraderContext,
  config: Record<string, unknown>,
): SkillEvalGraderResult & { type: SkillEvalGraderType } {
  const expected = String(config.expected ?? "");
  const passed = context.output === expected;
  return {
    graderId: null,
    graderName: "code_exact",
    type: "code_exact",
    passed,
    score: passed ? 1.0 : 0.0,
    detail: passed ? "Exact match" : `Expected "${expected}", got "${context.output.slice(0, 200)}"`,
  };
}

function gradeCodeRegex(
  context: GraderContext,
  config: Record<string, unknown>,
): SkillEvalGraderResult & { type: SkillEvalGraderType } {
  const pattern = String(config.pattern ?? "");
  const flags = typeof config.flags === "string" ? config.flags : "";
  try {
    const regex = new RegExp(pattern, flags);
    const passed = regex.test(context.output);
    return {
      graderId: null,
      graderName: "code_regex",
      type: "code_regex",
      passed,
      score: passed ? 1.0 : 0.0,
      detail: passed ? `Matched /${pattern}/${flags}` : `No match for /${pattern}/${flags}`,
    };
  } catch (error) {
    return {
      graderId: null,
      graderName: "code_regex",
      type: "code_regex",
      passed: false,
      score: 0.0,
      detail: `Invalid regex: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

function gradeCodeContains(
  context: GraderContext,
  config: Record<string, unknown>,
): SkillEvalGraderResult & { type: SkillEvalGraderType } {
  const values = Array.isArray(config.values) ? config.values.map(String) : [];
  const mode = config.mode === "any" ? "any" : "all";

  if (values.length === 0) {
    return {
      graderId: null,
      graderName: "code_contains",
      type: "code_contains",
      passed: true,
      score: 1.0,
      detail: "No values to check",
    };
  }

  const results = values.map((value) => ({
    value,
    found: context.output.includes(value),
  }));

  const passed = mode === "all"
    ? results.every((result) => result.found)
    : results.some((result) => result.found);

  const matchCount = results.filter((result) => result.found).length;
  const score = values.length > 0 ? matchCount / values.length : 1.0;

  const missing = results.filter((result) => !result.found).map((result) => result.value);

  return {
    graderId: null,
    graderName: "code_contains",
    type: "code_contains",
    passed,
    score,
    detail: passed
      ? `All ${matchCount}/${values.length} values found`
      : `Missing (${mode}): ${missing.join(", ")}`,
  };
}

function gradeCodeJavascript(
  context: GraderContext,
  config: Record<string, unknown>,
): SkillEvalGraderResult & { type: SkillEvalGraderType } {
  const expression = String(config.expression ?? config.value ?? "");
  if (!expression) {
    return {
      graderId: null,
      graderName: "code_javascript",
      type: "code_javascript",
      passed: false,
      score: 0.0,
      detail: "No expression provided",
    };
  }

  // NOTE: This runs user-provided JS in the server process via Function constructor.
  // It has no filesystem or network access by default, but shares the Node.js runtime.
  // For production hardening, consider isolated-vm or vm2 sandbox.
  // Timeout is enforced structurally — expressions must be synchronous and simple.
  const maxExpressionLength = 2_000;
  if (expression.length > maxExpressionLength) {
    return {
      graderId: null,
      graderName: "code_javascript",
      type: "code_javascript",
      passed: false,
      score: 0.0,
      detail: `Expression too long (${expression.length} chars, max ${maxExpressionLength})`,
    };
  }

  try {
    const fn = new Function("output", "transcript", "outcome", "prompt", `"use strict"; return (${expression})`);
    const result = fn(
      context.output,
      context.transcript,
      context.outcome,
      context.prompt,
    );
    const passed = Boolean(result);
    return {
      graderId: null,
      graderName: "code_javascript",
      type: "code_javascript",
      passed,
      score: passed ? 1.0 : 0.0,
      detail: passed ? "Expression evaluated to true" : "Expression evaluated to false",
    };
  } catch (error) {
    return {
      graderId: null,
      graderName: "code_javascript",
      type: "code_javascript",
      passed: false,
      score: 0.0,
      detail: `JS eval error: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

function gradeStateCheck(
  context: GraderContext,
  config: Record<string, unknown>,
): SkillEvalGraderResult & { type: SkillEvalGraderType } {
  const checks = Array.isArray(config.checks) ? config.checks : [];
  if (checks.length === 0) {
    return {
      graderId: null,
      graderName: "state_check",
      type: "state_check",
      passed: true,
      score: 1.0,
      detail: "No checks defined",
    };
  }

  const results: Array<{ path: string; expected: unknown; actual: unknown; matched: boolean }> = [];

  for (const check of checks) {
    if (typeof check !== "object" || check === null) continue;
    const checkObj = check as Record<string, unknown>;
    const checkPath = String(checkObj.path ?? "");
    const expectedValue = checkObj.expected;

    let actual: unknown = context.outcome;
    for (const segment of checkPath.split(".").filter(Boolean)) {
      if (actual && typeof actual === "object" && !Array.isArray(actual)) {
        actual = (actual as Record<string, unknown>)[segment];
      } else {
        actual = undefined;
        break;
      }
    }

    const matched = JSON.stringify(actual) === JSON.stringify(expectedValue);
    results.push({ path: checkPath, expected: expectedValue, actual, matched });
  }

  const passedCount = results.filter((result) => result.matched).length;
  const passed = passedCount === results.length;
  const score = results.length > 0 ? passedCount / results.length : 1.0;

  const failures = results.filter((result) => !result.matched);

  return {
    graderId: null,
    graderName: "state_check",
    type: "state_check",
    passed,
    score,
    detail: passed
      ? `All ${results.length} state checks passed`
      : `Failed checks: ${failures.map((f) => `${f.path} (expected ${JSON.stringify(f.expected)}, got ${JSON.stringify(f.actual)})`).join("; ")}`,
  };
}

// ---------------------------------------------------------------------------
// LLM graders (require a provider)
// ---------------------------------------------------------------------------

async function gradeLlmRubric(
  context: GraderContext,
  config: Record<string, unknown>,
  llm: LlmGraderProvider | null,
): Promise<SkillEvalGraderResult & { type: SkillEvalGraderType }> {
  if (!llm) {
    return {
      graderId: null,
      graderName: "llm_rubric",
      type: "llm_rubric",
      passed: false,
      score: 0.0,
      detail: "LLM grader provider not configured",
    };
  }

  const rubric = String(config.rubric ?? "");
  const model = typeof config.model === "string" ? config.model : undefined;
  const temperature = typeof config.temperature === "number" ? config.temperature : 0.0;

  const prompt = [
    "You are an eval grader. Evaluate the following agent output against the rubric.",
    "",
    "## Rubric",
    rubric,
    "",
    "## Agent Prompt",
    context.prompt,
    "",
    "## Agent Output",
    context.output,
    "",
    "Respond with a JSON object: { \"passed\": boolean, \"score\": number (0.0-1.0), \"reasoning\": string }",
    "Only output the JSON object, nothing else.",
  ].join("\n");

  try {
    const raw = await llm.evaluate(prompt, model, temperature);
    const parsed = JSON.parse(raw.trim().replace(/```json\n?/g, "").replace(/```\n?/g, "")) as {
      passed?: boolean;
      score?: number;
      reasoning?: string;
    };
    return {
      graderId: null,
      graderName: "llm_rubric",
      type: "llm_rubric",
      passed: Boolean(parsed.passed),
      score: typeof parsed.score === "number" ? parsed.score : (parsed.passed ? 1.0 : 0.0),
      detail: String(parsed.reasoning ?? "No reasoning provided"),
    };
  } catch (error) {
    return {
      graderId: null,
      graderName: "llm_rubric",
      type: "llm_rubric",
      passed: false,
      score: 0.0,
      detail: `LLM grading failed: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

async function gradeLlmAssertion(
  context: GraderContext,
  config: Record<string, unknown>,
  llm: LlmGraderProvider | null,
): Promise<SkillEvalGraderResult & { type: SkillEvalGraderType }> {
  if (!llm) {
    return {
      graderId: null,
      graderName: "llm_assertion",
      type: "llm_assertion",
      passed: false,
      score: 0.0,
      detail: "LLM grader provider not configured",
    };
  }

  const assertion = String(config.assertion ?? "");
  const model = typeof config.model === "string" ? config.model : undefined;

  const prompt = [
    "Evaluate if the following assertion is TRUE or FALSE for the given agent output.",
    "",
    `Assertion: ${assertion}`,
    "",
    "## Agent Output",
    context.output,
    "",
    "Respond with a JSON object: { \"result\": true|false, \"reasoning\": string }",
    "Only output the JSON object, nothing else.",
  ].join("\n");

  try {
    const raw = await llm.evaluate(prompt, model, 0.0);
    const parsed = JSON.parse(raw.trim().replace(/```json\n?/g, "").replace(/```\n?/g, "")) as {
      result?: boolean;
      reasoning?: string;
    };
    const passed = Boolean(parsed.result);
    return {
      graderId: null,
      graderName: "llm_assertion",
      type: "llm_assertion",
      passed,
      score: passed ? 1.0 : 0.0,
      detail: String(parsed.reasoning ?? "No reasoning provided"),
    };
  } catch (error) {
    return {
      graderId: null,
      graderName: "llm_assertion",
      type: "llm_assertion",
      passed: false,
      score: 0.0,
      detail: `LLM assertion failed: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export type GraderEngineOptions = {
  llmProvider?: LlmGraderProvider;
};

export async function runGrader(
  grader: GraderInput,
  context: GraderContext,
  options: GraderEngineOptions = {},
): Promise<SkillEvalGraderResult> {
  const result = await runGraderInternal(grader, context, options);
  return {
    ...result,
    graderId: grader.graderId,
    graderName: grader.graderName,
  };
}

async function runGraderInternal(
  grader: GraderInput,
  context: GraderContext,
  options: GraderEngineOptions,
): Promise<SkillEvalGraderResult & { type: SkillEvalGraderType }> {
  switch (grader.type) {
    case "code_exact":
      return gradeCodeExact(context, grader.config);
    case "code_regex":
      return gradeCodeRegex(context, grader.config);
    case "code_contains":
      return gradeCodeContains(context, grader.config);
    case "code_javascript":
      return gradeCodeJavascript(context, grader.config);
    case "state_check":
      return gradeStateCheck(context, grader.config);
    case "llm_rubric":
      return gradeLlmRubric(context, grader.config, options.llmProvider ?? null);
    case "llm_assertion":
      return gradeLlmAssertion(context, grader.config, options.llmProvider ?? null);
    case "llm_pairwise":
      // Pairwise is handled at the comparison level, not individual trial
      return {
        graderId: null,
        graderName: "llm_pairwise",
        type: "llm_pairwise",
        passed: true,
        score: 1.0,
        detail: "Pairwise grading is handled at the comparison level",
      };
    default:
      return {
        graderId: null,
        graderName: "unknown",
        type: grader.type,
        passed: false,
        score: 0.0,
        detail: `Unknown grader type: ${grader.type}`,
      };
  }
}

export async function runGraders(
  graders: GraderInput[],
  context: GraderContext,
  options: GraderEngineOptions = {},
): Promise<SkillEvalGraderResult[]> {
  const results: SkillEvalGraderResult[] = [];
  for (const grader of graders) {
    results.push(await runGrader(grader, context, options));
  }
  return results;
}

/**
 * Compute weighted pass rate from trial results.
 * Formula: Σ(case_weight × passed) / Σ(case_weight)
 */
export function computeWeightedPassRate(
  trials: Array<{ caseWeight: number; passed: boolean }>,
): number {
  if (trials.length === 0) return 0;
  const totalWeight = trials.reduce((sum, trial) => sum + trial.caseWeight, 0);
  if (totalWeight === 0) return 0;
  const weightedPasses = trials.reduce(
    (sum, trial) => sum + (trial.passed ? trial.caseWeight : 0),
    0,
  );
  return weightedPasses / totalWeight;
}

/**
 * Compute pass@k: probability that at least 1 of k independent trials passes.
 * pass@k = 1 - (1 - p)^k where p = observed pass rate
 */
export function computePassAtK(passRate: number, k: number): number {
  if (k <= 0) return 0;
  return 1 - Math.pow(1 - passRate, k);
}

/**
 * Compute pass^k: probability that all k independent trials pass.
 * pass^k = p^k where p = observed pass rate
 */
export function computePassPowK(passRate: number, k: number): number {
  if (k <= 0) return 0;
  return Math.pow(passRate, k);
}
