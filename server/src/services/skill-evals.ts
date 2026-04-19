/**
 * Skill Eval Service
 *
 * CRUD for eval suites, cases, graders, metrics, benchmarks.
 * Benchmark runner orchestrates heartbeat runs with skill variant overrides.
 */

import { and, asc, desc, eq, inArray } from "drizzle-orm";
import type { Db } from "@paperclipai/db";
import {
  skillEvalSuites,
  skillEvalCases,
  skillEvalGraders,
  skillEvalMetrics,
  skillEvalBenchmarks,
  skillEvalTrials,
  skillEvalComparisons,
  skillEvalAlerts,
  companySkills as companySkillsTable,
} from "@paperclipai/db";
import type {
  SkillEvalSuite,
  SkillEvalCase,
  SkillEvalGrader,
  SkillEvalMetric,
  SkillEvalBenchmark,
  SkillEvalTrial,
  SkillEvalComparison,
  SkillEvalAlert,
  SkillEvalBenchmarkSummary,
  SkillEvalVariantSummary,
  SkillEvalCaseSummary,
  SkillEvalGraderResult,
  SkillEvalTokenUsage,
  CustomVariants,
  VariantConfig,
  SkillSnapshot,
  CreateSkillEvalSuite,
  UpdateSkillEvalSuite,
  CreateSkillEvalCase,
  UpdateSkillEvalCase,
  CreateSkillEvalGrader,
  UpdateSkillEvalGrader,
  CreateSkillEvalMetric,
  CreateSkillEvalBenchmark,
} from "@paperclipai/shared";
import { notFound } from "../errors.js";
import {
  runGraders,
  computeWeightedPassRate,
  computePassAtK,
  computePassPowK,
  type GraderInput,
  type GraderContext,
  type GraderEngineOptions,
} from "./skill-eval-grader-engine.js";
import { heartbeatService, type SkillOverrideOptions } from "./heartbeat.js";
import { companySkillService } from "./company-skills.js";
import { logActivity } from "./activity-log.js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SkillEvalSuiteRow = typeof skillEvalSuites.$inferSelect;
type SkillEvalCaseRow = typeof skillEvalCases.$inferSelect;
type SkillEvalGraderRow = typeof skillEvalGraders.$inferSelect;
type SkillEvalBenchmarkRow = typeof skillEvalBenchmarks.$inferSelect;
type SkillEvalTrialRow = typeof skillEvalTrials.$inferSelect;

type BenchmarkVariantResolution = {
  skillOverride: SkillOverrideOptions | null;
};

class Semaphore {
  private readonly capacity: number;
  private active = 0;
  private readonly queue: Array<() => void> = [];

  constructor(capacity: number) {
    this.capacity = Math.max(1, capacity);
  }

  async acquire<T>(fn: () => Promise<T>): Promise<T> {
    await this.waitTurn();
    try {
      return await fn();
    } finally {
      this.release();
    }
  }

  private async waitTurn() {
    if (this.active < this.capacity) {
      this.active += 1;
      return;
    }
    await new Promise<void>((resolve) => {
      this.queue.push(() => {
        this.active += 1;
        resolve();
      });
    });
  }

  private release() {
    this.active = Math.max(0, this.active - 1);
    const next = this.queue.shift();
    if (next) next();
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mapSuiteRow(row: SkillEvalSuiteRow): SkillEvalSuite {
  return {
    id: row.id,
    companyId: row.companyId,
    agentId: row.agentId ?? null,
    name: row.name,
    description: row.description,
    skillId: row.skillId,
    config: row.config,
    status: row.status as SkillEvalSuite["status"],
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function mapCaseRow(row: SkillEvalCaseRow): SkillEvalCase {
  return {
    id: row.id,
    companyId: row.companyId,
    suiteId: row.suiteId,
    name: row.name,
    description: row.description,
    caseType: (row.caseType ?? "behavior") as SkillEvalCase["caseType"],
    prompt: row.prompt,
    contextFiles: row.contextFiles as SkillEvalCase["contextFiles"],
    expected: row.expected as Record<string, unknown>,
    graderConfig: row.graderConfig as Record<string, unknown> | null,
    shouldFire: row.shouldFire,
    tags: (row.tags as string[]) ?? [],
    weight: row.weight,
    orderIndex: row.orderIndex,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function mapGraderRow(row: SkillEvalGraderRow): SkillEvalGrader {
  return {
    id: row.id,
    companyId: row.companyId,
    name: row.name,
    type: row.type as SkillEvalGrader["type"],
    config: row.config,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function mapBenchmarkRow(row: SkillEvalBenchmarkRow): SkillEvalBenchmark {
  return {
    id: row.id,
    companyId: row.companyId,
    suiteId: row.suiteId,
    agentId: row.agentId,
    skillId: row.skillId,
    skillSnapshot: row.skillSnapshot,
    name: row.name,
    status: row.status as SkillEvalBenchmark["status"],
    variants: (row.variants as string[]) ?? [],
    benchmarkMode: row.benchmarkMode as "standard" | "skill_lab",
    customVariants: (row.customVariants as Record<string, any>) ?? {},
    trialsPerCase: row.trialsPerCase,
    maxConcurrent: row.maxConcurrent,
    config: row.config,
    summary: row.summary as SkillEvalBenchmarkSummary | null,
    paperclipSyncStatus: row.paperclipSyncStatus,
    feedbackExportId: row.feedbackExportId,
    startedAt: row.startedAt,
    finishedAt: row.finishedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function mapTrialRow(row: SkillEvalTrialRow): SkillEvalTrial {
  return {
    id: row.id,
    companyId: row.companyId,
    benchmarkId: row.benchmarkId,
    caseId: row.caseId,
    variant: row.variant as SkillEvalTrial["variant"],
    trialNumber: row.trialNumber,
    heartbeatRunId: row.heartbeatRunId,
    status: row.status as SkillEvalTrial["status"],
    transcript: row.transcript,
    outcome: row.outcome,
    graderResults: row.graderResults as SkillEvalGraderResult[] | null,
    metricValues: row.metricValues,
    tokenUsage: row.tokenUsage,
    latencyMs: row.latencyMs,
    costCents: row.costCents,
    error: row.error,
    startedAt: row.startedAt,
    finishedAt: row.finishedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

export function skillEvalService(db: Db) {
  const heartbeat = heartbeatService(db);
  const companySkills = companySkillService(db);

  // =========================================================================
  // Suites
  // =========================================================================

  async function listSuites(companyId: string): Promise<SkillEvalSuite[]> {
    const rows = await db
      .select()
      .from(skillEvalSuites)
      .where(eq(skillEvalSuites.companyId, companyId))
      .orderBy(desc(skillEvalSuites.updatedAt));
    return rows.map(mapSuiteRow);
  }

  async function getSuite(companyId: string, suiteId: string): Promise<SkillEvalSuite | null> {
    const [row] = await db
      .select()
      .from(skillEvalSuites)
      .where(and(eq(skillEvalSuites.companyId, companyId), eq(skillEvalSuites.id, suiteId)))
      .limit(1);
    return row ? mapSuiteRow(row) : null;
  }

  async function createSuite(companyId: string, input: CreateSkillEvalSuite): Promise<SkillEvalSuite> {
    const [row] = await db
      .insert(skillEvalSuites)
      .values({
        companyId,
        name: input.name,
        description: input.description ?? null,
        skillId: input.skillId ?? null,
        config: input.config ?? {},
        status: input.status ?? "draft",
      })
      .returning();
    return mapSuiteRow(row!);
  }

  async function updateSuite(
    companyId: string,
    suiteId: string,
    input: UpdateSkillEvalSuite,
  ): Promise<SkillEvalSuite> {
    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (input.name !== undefined) updates.name = input.name;
    if (input.description !== undefined) updates.description = input.description;
    if (input.skillId !== undefined) updates.skillId = input.skillId;
    if (input.config !== undefined) updates.config = input.config;
    if (input.status !== undefined) updates.status = input.status;

    const [row] = await db
      .update(skillEvalSuites)
      .set(updates)
      .where(and(eq(skillEvalSuites.companyId, companyId), eq(skillEvalSuites.id, suiteId)))
      .returning();
    if (!row) throw notFound("Suite not found");
    return mapSuiteRow(row);
  }

  async function deleteSuite(companyId: string, suiteId: string): Promise<{ id: string }> {
    const [row] = await db
      .delete(skillEvalSuites)
      .where(and(eq(skillEvalSuites.companyId, companyId), eq(skillEvalSuites.id, suiteId)))
      .returning({ id: skillEvalSuites.id });
    if (!row) throw notFound("Suite not found");
    return row;
  }

  // =========================================================================
  // Cases
  // =========================================================================

  async function listCases(companyId: string, suiteId: string): Promise<SkillEvalCase[]> {
    const rows = await db
      .select()
      .from(skillEvalCases)
      .where(and(eq(skillEvalCases.companyId, companyId), eq(skillEvalCases.suiteId, suiteId)))
      .orderBy(asc(skillEvalCases.orderIndex), asc(skillEvalCases.createdAt));
    return rows.map(mapCaseRow);
  }

  async function getCase(companyId: string, caseId: string): Promise<SkillEvalCase | null> {
    const [row] = await db
      .select()
      .from(skillEvalCases)
      .where(and(eq(skillEvalCases.companyId, companyId), eq(skillEvalCases.id, caseId)))
      .limit(1);
    return row ? mapCaseRow(row) : null;
  }

  async function createCase(
    companyId: string,
    suiteId: string,
    input: CreateSkillEvalCase,
  ): Promise<SkillEvalCase> {
    const [row] = await db
      .insert(skillEvalCases)
      .values({
        companyId,
        suiteId,
        name: input.name,
        description: input.description ?? null,
        caseType: input.caseType ?? "behavior",
        prompt: input.prompt,
        contextFiles: input.contextFiles ?? [],
        expected: input.expected ?? {},
        graderConfig: input.graderConfig ?? null,
        shouldFire: input.shouldFire ?? null,
        tags: input.tags ?? [],
        weight: input.weight ?? 1.0,
        orderIndex: input.orderIndex ?? 0,
      })
      .returning();
    return mapCaseRow(row!);
  }

  async function updateCase(
    companyId: string,
    caseId: string,
    input: UpdateSkillEvalCase,
  ): Promise<SkillEvalCase> {
    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (input.name !== undefined) updates.name = input.name;
    if (input.description !== undefined) updates.description = input.description;
    if (input.caseType !== undefined) updates.caseType = input.caseType;
    if (input.prompt !== undefined) updates.prompt = input.prompt;
    if (input.contextFiles !== undefined) updates.contextFiles = input.contextFiles;
    if (input.expected !== undefined) updates.expected = input.expected;
    if (input.graderConfig !== undefined) updates.graderConfig = input.graderConfig;
    if (input.shouldFire !== undefined) updates.shouldFire = input.shouldFire;
    if (input.tags !== undefined) updates.tags = input.tags;
    if (input.weight !== undefined) updates.weight = input.weight;
    if (input.orderIndex !== undefined) updates.orderIndex = input.orderIndex;

    const [row] = await db
      .update(skillEvalCases)
      .set(updates)
      .where(and(eq(skillEvalCases.companyId, companyId), eq(skillEvalCases.id, caseId)))
      .returning();
    if (!row) throw notFound("Case not found");
    return mapCaseRow(row);
  }

  async function deleteCase(companyId: string, caseId: string): Promise<{ id: string }> {
    const [row] = await db
      .delete(skillEvalCases)
      .where(and(eq(skillEvalCases.companyId, companyId), eq(skillEvalCases.id, caseId)))
      .returning({ id: skillEvalCases.id });
    if (!row) throw notFound("Case not found");
    return row;
  }

  // =========================================================================
  // Graders
  // =========================================================================

  async function listGraders(companyId: string): Promise<SkillEvalGrader[]> {
    const rows = await db
      .select()
      .from(skillEvalGraders)
      .where(eq(skillEvalGraders.companyId, companyId))
      .orderBy(asc(skillEvalGraders.name));
    return rows.map(mapGraderRow);
  }

  async function createGrader(companyId: string, input: CreateSkillEvalGrader): Promise<SkillEvalGrader> {
    const [row] = await db
      .insert(skillEvalGraders)
      .values({
        companyId,
        name: input.name,
        type: input.type,
        config: input.config,
      })
      .returning();
    return mapGraderRow(row!);
  }

  async function updateGrader(
    companyId: string,
    graderId: string,
    input: UpdateSkillEvalGrader,
  ): Promise<SkillEvalGrader> {
    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (input.name !== undefined) updates.name = input.name;
    if (input.type !== undefined) updates.type = input.type;
    if (input.config !== undefined) updates.config = input.config;

    const [row] = await db
      .update(skillEvalGraders)
      .set(updates)
      .where(and(eq(skillEvalGraders.companyId, companyId), eq(skillEvalGraders.id, graderId)))
      .returning();
    if (!row) throw notFound("Grader not found");
    return mapGraderRow(row);
  }

  async function deleteGrader(companyId: string, graderId: string): Promise<{ id: string }> {
    const [row] = await db
      .delete(skillEvalGraders)
      .where(and(eq(skillEvalGraders.companyId, companyId), eq(skillEvalGraders.id, graderId)))
      .returning({ id: skillEvalGraders.id });
    if (!row) throw notFound("Grader not found");
    return row;
  }

  // =========================================================================
  // Metrics
  // =========================================================================

  async function listMetrics(companyId: string): Promise<SkillEvalMetric[]> {
    const rows = await db
      .select()
      .from(skillEvalMetrics)
      .where(eq(skillEvalMetrics.companyId, companyId))
      .orderBy(asc(skillEvalMetrics.name));
    return rows.map((row) => ({
      id: row.id,
      companyId: row.companyId,
      name: row.name,
      description: row.description,
      type: row.type as SkillEvalMetric["type"],
      graderId: row.graderId,
      extraction: row.extraction,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }));
  }

  async function createMetric(companyId: string, input: CreateSkillEvalMetric): Promise<SkillEvalMetric> {
    const [row] = await db
      .insert(skillEvalMetrics)
      .values({
        companyId,
        name: input.name,
        description: input.description ?? null,
        type: input.type,
        graderId: input.graderId ?? null,
        extraction: input.extraction ?? null,
      })
      .returning();
    return {
      id: row!.id,
      companyId: row!.companyId,
      name: row!.name,
      description: row!.description,
      type: row!.type as SkillEvalMetric["type"],
      graderId: row!.graderId,
      extraction: row!.extraction,
      createdAt: row!.createdAt,
      updatedAt: row!.updatedAt,
    };
  }

  // =========================================================================
  // Benchmarks
  // =========================================================================

  async function listBenchmarks(companyId: string): Promise<SkillEvalBenchmark[]> {
    const rows = await db
      .select()
      .from(skillEvalBenchmarks)
      .where(eq(skillEvalBenchmarks.companyId, companyId))
      .orderBy(desc(skillEvalBenchmarks.createdAt));
    return rows.map(mapBenchmarkRow);
  }

  async function getBenchmark(companyId: string, benchmarkId: string): Promise<SkillEvalBenchmark | null> {
    const [row] = await db
      .select()
      .from(skillEvalBenchmarks)
      .where(and(eq(skillEvalBenchmarks.companyId, companyId), eq(skillEvalBenchmarks.id, benchmarkId)))
      .limit(1);
    return row ? mapBenchmarkRow(row) : null;
  }

  async function snapshotSkill(companyId: string, skillId: string | null | undefined) {
    if (!skillId) return null;
    const [skill] = await db
      .select()
      .from(companySkillsTable)
      .where(and(eq(companySkillsTable.companyId, companyId), eq(companySkillsTable.id, skillId)))
      .limit(1);
    if (!skill) return null;
    return {
      id: skill.id,
      key: skill.key,
      slug: skill.slug,
      name: skill.name,
      description: skill.description,
      markdown: skill.markdown,
      sourceType: skill.sourceType,
      sourceLocator: skill.sourceLocator,
      sourceRef: skill.sourceRef,
      trustLevel: skill.trustLevel,
      compatibility: skill.compatibility,
      fileInventory: skill.fileInventory,
      metadata: skill.metadata,
      snapshotAt: new Date().toISOString(),
    };
  }

  async function captureSkillBundle(
    companyId: string,
    skillId: string,
  ): Promise<SkillSnapshot> {
    const skill = await companySkills.detail(companyId, skillId);
    if (!skill) throw notFound("Skill not found");

    const scripts: Array<{ path: string; content: string }> = [];
    const references: Array<{ path: string; content: string }> = [];
    const assets: Array<{ path: string; contentHash: string; url?: string }> = [];

    for (const file of skill.fileInventory) {
      const detail = await companySkills.readFile(companyId, skillId, file.path);
      if (!detail) continue;
      if (detail.path.startsWith("scripts/")) {
        scripts.push({ path: detail.path, content: detail.content });
      } else if (detail.path.startsWith("references/")) {
        references.push({ path: detail.path, content: detail.content });
      } else if (detail.path.startsWith("assets/")) {
        assets.push({ path: detail.path, contentHash: String(detail.content.length), url: undefined });
      }
    }

    return {
      name: skill.name,
      description: skill.description ?? "",
      skillMd: skill.markdown,
      scripts,
      references,
      assets,
    };
  }

  async function getSkillBundle(companyId: string, skillId: string): Promise<SkillSnapshot> {
    return captureSkillBundle(companyId, skillId);
  }

  function variantSnapshot(config: VariantConfig): SkillSnapshot | null {
    if (config.type === "skill_snapshot" || config.type === "custom_draft") return config.snapshot;
    return null;
  }

  function outputFromRun(run: Awaited<ReturnType<ReturnType<typeof heartbeatService>["getRun"]>>): string {
    const result = run?.resultJson as Record<string, unknown> | null | undefined;
    if (!result) return "";
    for (const key of ["summary", "result", "message"]) {
      const value = result[key];
      if (typeof value === "string" && value.trim()) return value;
    }
    return JSON.stringify(result);
  }

  async function waitForRunCompletion(runId: string, timeoutMs = 10 * 60 * 1000) {
    const started = Date.now();
    while (Date.now() - started < timeoutMs) {
      const run = await heartbeat.getRun(runId);
      if (!run) throw notFound("Heartbeat run not found");
      if (run.status === "succeeded" || run.status === "failed" || run.status === "cancelled" || run.status === "timed_out") {
        return run;
      }
      await new Promise((resolve) => setTimeout(resolve, 800));
    }
    throw new Error("Timed out waiting for heartbeat run completion");
  }

  function resolveVariantOverrides(input: {
    mode: "standard" | "skill_lab";
    skillId: string | null;
    variants: string[];
    customVariants: CustomVariants;
    snapshot: SkillSnapshot | null;
  }): Record<string, BenchmarkVariantResolution> {
    const out: Record<string, BenchmarkVariantResolution> = {};
    if (input.mode === "skill_lab") {
      for (const [key, config] of Object.entries(input.customVariants)) {
        if (config.type === "no_skill") {
          out[key] = {
            skillOverride: input.skillId ? { mode: "exclude", skillId: input.skillId } : null,
          };
          continue;
        }
        out[key] = {
          skillOverride: input.skillId
            ? { mode: "replace", skillId: input.skillId, snapshot: config.snapshot }
            : null,
        };
      }
      return out;
    }

    for (const variant of input.variants) {
      if (variant === "without_skill") {
        out[variant] = {
          skillOverride: input.skillId ? { mode: "exclude", skillId: input.skillId } : null,
        };
      } else if (variant === "updated_skill") {
        out[variant] = {
          skillOverride: input.skillId && input.snapshot
            ? { mode: "replace", skillId: input.skillId, snapshot: input.snapshot }
            : null,
        };
      } else {
        out[variant] = { skillOverride: null };
      }
    }
    return out;
  }

  async function createBenchmark(
    companyId: string,
    input: CreateSkillEvalBenchmark,
  ): Promise<SkillEvalBenchmark> {
    const snapshot = await snapshotSkill(companyId, input.skillId);

    const [row] = await db
      .insert(skillEvalBenchmarks)
      .values({
        companyId,
        suiteId: input.suiteId,
        agentId: input.agentId,
        skillId: input.skillId ?? null,
        skillSnapshot: snapshot,
        name: input.name ?? null,
        status: "queued",
        variants: input.variants ?? ["with_skill", "without_skill"],
        benchmarkMode: input.benchmarkMode ?? "standard",
        customVariants: input.customVariants ?? {},
        trialsPerCase: input.trialsPerCase ?? 3,
        maxConcurrent: input.maxConcurrent ?? 3,
        config: input.config ?? {},
      })
      .returning();
    return mapBenchmarkRow(row!);
  }

  async function runBenchmark(companyId: string, input: CreateSkillEvalBenchmark): Promise<SkillEvalBenchmark> {
    const benchmark = await createBenchmark(companyId, input);

    const cases = await db
      .select()
      .from(skillEvalCases)
      .where(and(eq(skillEvalCases.companyId, companyId), eq(skillEvalCases.suiteId, input.suiteId)))
      .orderBy(asc(skillEvalCases.orderIndex), asc(skillEvalCases.createdAt));

    const trialsPerCase = input.trialsPerCase ?? 3;
    const variants = input.variants ?? ["with_skill", "without_skill"];
    const mode = input.benchmarkMode ?? "standard";
    const standardSnapshot = input.skillId ? await captureSkillBundle(companyId, input.skillId) : null;
    const customVariants = input.customVariants ?? {};
    const resolvedVariants = resolveVariantOverrides({
      mode,
      skillId: input.skillId ?? null,
      variants,
      customVariants,
      snapshot: standardSnapshot,
    });

    const trialRows: Array<typeof skillEvalTrials.$inferInsert> = [];
    for (const variant of Object.keys(resolvedVariants)) {
      for (const evalCase of cases) {
        for (let i = 1; i <= trialsPerCase; i += 1) {
          trialRows.push({
            companyId,
            benchmarkId: benchmark.id,
            caseId: evalCase.id,
            variant,
            trialNumber: i,
            status: "queued",
          });
        }
      }
    }

    if (trialRows.length > 0) {
      await db.insert(skillEvalTrials).values(trialRows);
    }

    await db
      .update(skillEvalBenchmarks)
      .set({ status: "running", startedAt: new Date(), updatedAt: new Date() })
      .where(and(eq(skillEvalBenchmarks.companyId, companyId), eq(skillEvalBenchmarks.id, benchmark.id)));

    const semaphore = new Semaphore(input.maxConcurrent ?? 3);
    const allTrials = await db
      .select()
      .from(skillEvalTrials)
      .where(and(eq(skillEvalTrials.companyId, companyId), eq(skillEvalTrials.benchmarkId, benchmark.id)));

    await Promise.all(allTrials.map((trial) => semaphore.acquire(async () => {
      const [rowCase] = await db
        .select()
        .from(skillEvalCases)
        .where(and(eq(skillEvalCases.companyId, companyId), eq(skillEvalCases.id, trial.caseId)))
        .limit(1);
      if (!rowCase) return;

      await db
        .update(skillEvalTrials)
        .set({ status: "running", startedAt: new Date(), updatedAt: new Date() })
        .where(eq(skillEvalTrials.id, trial.id));

      try {
        const override = resolvedVariants[trial.variant]?.skillOverride ?? null;
        const run = await heartbeat.invoke(
          input.agentId,
          "automation",
          {
            source: "skill_eval",
            benchmarkId: benchmark.id,
            caseId: rowCase.id,
            prompt: rowCase.prompt,
            contextFiles: rowCase.contextFiles,
          },
          "system",
          undefined,
          override ?? undefined,
        );

        if (!run) {
          throw new Error("Heartbeat wakeup could not be enqueued");
        }

        if ("status" in run && run.status === "skipped") {
          const reason = "reason" in run && typeof run.reason === "string" ? run.reason : null;
          throw new Error(reason || "Heartbeat wakeup skipped");
        }
        const runId = run.id;
        const doneRun = await waitForRunCompletion(runId);
        const transcript = (doneRun.contextSnapshot ?? null) as Record<string, unknown> | null;
        const outcome = (doneRun.resultJson ?? null) as Record<string, unknown> | null;
        const output = outputFromRun(doneRun);
        const graders = Array.isArray((rowCase.graderConfig as Record<string, unknown> | null)?.inline)
          ? ((rowCase.graderConfig as Record<string, unknown>).inline as GraderInput[])
          : [];
        const graderResults = await runGraders(graders, {
          output,
          transcript,
          outcome,
          prompt: rowCase.prompt,
          expected: (rowCase.expected ?? {}) as Record<string, unknown>,
        });
        const passed = graderResults.length > 0 ? graderResults.every((g) => g.passed) : doneRun.status === "succeeded";

        await db
          .update(skillEvalTrials)
          .set({
            status: passed ? "passed" : "failed",
            heartbeatRunId: doneRun.id,
            transcript,
            outcome,
            graderResults: graderResults as unknown as Array<Record<string, unknown>>,
            metricValues: null,
            tokenUsage: (doneRun.usageJson as { inputTokens: number; outputTokens: number; totalTokens: number } | null) ?? null,
            latencyMs: null,
            costCents: null,
            finishedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(skillEvalTrials.id, trial.id));
      } catch (error) {
        await db
          .update(skillEvalTrials)
          .set({
            status: "error",
            error: error instanceof Error ? error.message : String(error),
            finishedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(skillEvalTrials.id, trial.id));
      }
    })));

    const completedTrials = await db
      .select()
      .from(skillEvalTrials)
      .where(and(eq(skillEvalTrials.companyId, companyId), eq(skillEvalTrials.benchmarkId, benchmark.id)));
    const caseMap = new Map(cases.map((c) => [c.id, c]));
    const summary = computeBenchmarkSummary(completedTrials, caseMap, benchmark.trialsPerCase);

    await db
      .update(skillEvalBenchmarks)
      .set({
        status: "completed",
        summary: summary as unknown as Record<string, unknown>,
        finishedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(and(eq(skillEvalBenchmarks.companyId, companyId), eq(skillEvalBenchmarks.id, benchmark.id)));

    const [finalRow] = await db
      .select()
      .from(skillEvalBenchmarks)
      .where(and(eq(skillEvalBenchmarks.companyId, companyId), eq(skillEvalBenchmarks.id, benchmark.id)))
      .limit(1);
    return mapBenchmarkRow(finalRow!);
  }

  async function runQuickCompare(companyId: string, input: {
    suiteId: string;
    agentId: string;
    skillId: string;
    variantA: { label: string; markdown: string };
    variantB: { label: string; markdown: string };
    trialsPerCase?: number;
  }): Promise<SkillEvalBenchmark> {
    const base = await captureSkillBundle(companyId, input.skillId);
    const customVariants: CustomVariants = {
      [input.variantA.label]: {
        type: "custom_draft",
        label: input.variantA.label,
        snapshot: { ...base, skillMd: input.variantA.markdown },
      },
      [input.variantB.label]: {
        type: "custom_draft",
        label: input.variantB.label,
        snapshot: { ...base, skillMd: input.variantB.markdown },
      },
    };

    return runBenchmark(companyId, {
      suiteId: input.suiteId,
      agentId: input.agentId,
      skillId: input.skillId,
      benchmarkMode: "skill_lab",
      customVariants,
      variants: Object.keys(customVariants),
      trialsPerCase: input.trialsPerCase ?? 3,
      maxConcurrent: 3,
      name: `Quick compare: ${input.variantA.label} vs ${input.variantB.label}`,
      config: {},
    });
  }

  async function promoteVariantToLive(
    companyId: string,
    benchmarkId: string,
    winningVariantKey: string,
  ): Promise<{ skillId: string; promotedVariant: string }> {
    const benchmark = await getBenchmark(companyId, benchmarkId);
    if (!benchmark) throw notFound("Benchmark not found");
    if (benchmark.benchmarkMode !== "skill_lab") throw new Error("Can only promote from skill_lab benchmark");
    if (benchmark.status !== "completed") throw new Error("Benchmark must be completed before promoting");
    if (!benchmark.skillId) throw new Error("Benchmark has no target skill");

    const variant = benchmark.customVariants[winningVariantKey] as VariantConfig | undefined;
    if (!variant) throw notFound("Winning variant not found");
    if (variant.type === "no_skill") throw new Error("Cannot promote no_skill variant");

    const snapshot = variantSnapshot(variant);
    if (!snapshot) throw new Error("Selected variant has no snapshot");

    await companySkills.updateFile(companyId, benchmark.skillId, "SKILL.md", snapshot.skillMd);
    for (const file of [...snapshot.scripts, ...snapshot.references]) {
      await companySkills.updateFile(companyId, benchmark.skillId, file.path, file.content);
    }

    await logActivity(db, {
      companyId,
      actorType: "system",
      actorId: "skill_eval_service",
      action: "skill_eval.promoted_from_lab",
      entityType: "company_skill",
      entityId: benchmark.skillId,
      details: { benchmarkId, variantKey: winningVariantKey },
    });

    return { skillId: benchmark.skillId, promotedVariant: winningVariantKey };
  }

  async function cancelBenchmark(companyId: string, benchmarkId: string): Promise<SkillEvalBenchmark> {
    // Mark benchmark as cancelled
    const [row] = await db
      .update(skillEvalBenchmarks)
      .set({
        status: "cancelled",
        finishedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(skillEvalBenchmarks.companyId, companyId),
          eq(skillEvalBenchmarks.id, benchmarkId),
          inArray(skillEvalBenchmarks.status, ["queued", "running"]),
        ),
      )
      .returning();
    if (!row) throw notFound("Benchmark not found or already completed");

    // Skip all queued trials (let running ones finish naturally)
    await db
      .update(skillEvalTrials)
      .set({ status: "skipped", updatedAt: new Date() })
      .where(
        and(
          eq(skillEvalTrials.benchmarkId, benchmarkId),
          eq(skillEvalTrials.status, "queued"),
        ),
      );

    // Compute partial summary from completed trials
    const completedTrials = await db
      .select()
      .from(skillEvalTrials)
      .where(
        and(
          eq(skillEvalTrials.benchmarkId, benchmarkId),
          inArray(skillEvalTrials.status, ["passed", "failed"]),
        ),
      );

    if (completedTrials.length > 0) {
      const cases = await db
        .select()
        .from(skillEvalCases)
        .where(eq(skillEvalCases.suiteId, row.suiteId));
      const caseMap = new Map(cases.map((c) => [c.id, c]));
      const summary = computeBenchmarkSummary(completedTrials, caseMap, row.trialsPerCase);
      await db
        .update(skillEvalBenchmarks)
        .set({ summary: summary as unknown as Record<string, unknown>, updatedAt: new Date() })
        .where(eq(skillEvalBenchmarks.id, benchmarkId));
    }

    return mapBenchmarkRow(row);
  }

  // =========================================================================
  // Trials
  // =========================================================================

  async function listTrials(companyId: string, benchmarkId: string): Promise<SkillEvalTrial[]> {
    const rows = await db
      .select()
      .from(skillEvalTrials)
      .where(
        and(eq(skillEvalTrials.companyId, companyId), eq(skillEvalTrials.benchmarkId, benchmarkId)),
      )
      .orderBy(asc(skillEvalTrials.caseId), asc(skillEvalTrials.variant), asc(skillEvalTrials.trialNumber));
    return rows.map(mapTrialRow);
  }

  // =========================================================================
  // Comparisons
  // =========================================================================

  async function listComparisons(
    companyId: string,
    benchmarkId: string,
  ): Promise<SkillEvalComparison[]> {
    const rows = await db
      .select()
      .from(skillEvalComparisons)
      .where(
        and(
          eq(skillEvalComparisons.companyId, companyId),
          eq(skillEvalComparisons.benchmarkId, benchmarkId),
        ),
      )
      .orderBy(asc(skillEvalComparisons.caseId));
    return rows.map((row) => ({
      id: row.id,
      companyId: row.companyId,
      benchmarkId: row.benchmarkId,
      caseId: row.caseId,
      variantA: row.variantA,
      variantB: row.variantB,
      winner: row.winner as SkillEvalComparison["winner"],
      judgeType: row.judgeType as SkillEvalComparison["judgeType"],
      judgeConfig: row.judgeConfig as Record<string, unknown> | null,
      reasoning: row.reasoning,
      scores: row.scores as Record<string, unknown> | null,
      createdAt: row.createdAt,
    }));
  }

  // =========================================================================
  // Alerts
  // =========================================================================

  async function listAlerts(companyId: string): Promise<SkillEvalAlert[]> {
    const rows = await db
      .select()
      .from(skillEvalAlerts)
      .where(eq(skillEvalAlerts.companyId, companyId))
      .orderBy(desc(skillEvalAlerts.createdAt))
      .limit(50);
    return rows.map((row) => ({
      id: row.id,
      companyId: row.companyId,
      suiteId: row.suiteId,
      benchmarkId: row.benchmarkId,
      type: row.type as SkillEvalAlert["type"],
      severity: row.severity as SkillEvalAlert["severity"],
      metric: row.metric,
      threshold: row.threshold,
      actualValue: row.actualValue,
      previousValue: row.previousValue,
      message: row.message,
      acknowledged: row.acknowledged,
      acknowledgedAt: row.acknowledgedAt,
      details: row.details,
      createdAt: row.createdAt,
    }));
  }

  // =========================================================================
  // Benchmark summary computation
  // =========================================================================

  function computeBenchmarkSummary(
    trials: SkillEvalTrialRow[],
    caseMap: Map<string, SkillEvalCaseRow>,
    trialsPerCase: number,
  ): SkillEvalBenchmarkSummary {
    const completedTrials = trials.filter((t) => t.status === "passed" || t.status === "failed");
    const totalTrials = completedTrials.length;
    const passedTrials = completedTrials.filter((t) => t.status === "passed").length;
    const passRate = totalTrials > 0 ? passedTrials / totalTrials : 0;

    // Weighted pass rate: Σ(case_weight × passed) / (Σ(case_weight) × trials_per_case)
    const weightedTrials = completedTrials.map((t) => ({
      caseWeight: caseMap.get(t.caseId)?.weight ?? 1.0,
      passed: t.status === "passed",
    }));
    const weightedPassRate = computeWeightedPassRate(weightedTrials);

    // pass@k and pass^k
    const passAtK = computePassAtK(passRate, trialsPerCase);
    const passPowK = computePassPowK(passRate, trialsPerCase);

    // Aggregate token usage
    const tokenTrials = completedTrials.filter((t) => t.tokenUsage != null);
    const avgTokens: SkillEvalTokenUsage | null = tokenTrials.length > 0
      ? {
          inputTokens: Math.round(
            tokenTrials.reduce((s, t) => s + (t.tokenUsage?.inputTokens ?? 0), 0) / tokenTrials.length,
          ),
          outputTokens: Math.round(
            tokenTrials.reduce((s, t) => s + (t.tokenUsage?.outputTokens ?? 0), 0) / tokenTrials.length,
          ),
          totalTokens: Math.round(
            tokenTrials.reduce((s, t) => s + (t.tokenUsage?.totalTokens ?? 0), 0) / tokenTrials.length,
          ),
        }
      : null;

    const latencyTrials = completedTrials.filter((t) => t.latencyMs != null);
    const avgLatencyMs = latencyTrials.length > 0
      ? Math.round(latencyTrials.reduce((s, t) => s + (t.latencyMs ?? 0), 0) / latencyTrials.length)
      : null;

    const costTrials = completedTrials.filter((t) => t.costCents != null);
    const avgCostCents = costTrials.length > 0
      ? Math.round(costTrials.reduce((s, t) => s + (t.costCents ?? 0), 0) / costTrials.length)
      : null;

    // Per-variant breakdown
    const variantGroups = new Map<string, SkillEvalTrialRow[]>();
    for (const trial of completedTrials) {
      const group = variantGroups.get(trial.variant) ?? [];
      group.push(trial);
      variantGroups.set(trial.variant, group);
    }

    const perVariant: Record<string, SkillEvalVariantSummary> = {};
    for (const [variant, variantTrials] of variantGroups) {
      const vPassed = variantTrials.filter((t) => t.status === "passed").length;
      const vTotal = variantTrials.length;
      const vTokenTrials = variantTrials.filter((t) => t.tokenUsage != null);
      const vLatencyTrials = variantTrials.filter((t) => t.latencyMs != null);
      const vCostTrials = variantTrials.filter((t) => t.costCents != null);

      perVariant[variant] = {
        variant: variant as SkillEvalVariantSummary["variant"],
        totalTrials: vTotal,
        passedTrials: vPassed,
        passRate: vTotal > 0 ? vPassed / vTotal : 0,
        avgLatencyMs: vLatencyTrials.length > 0
          ? Math.round(vLatencyTrials.reduce((s, t) => s + (t.latencyMs ?? 0), 0) / vLatencyTrials.length)
          : null,
        avgCostCents: vCostTrials.length > 0
          ? Math.round(vCostTrials.reduce((s, t) => s + (t.costCents ?? 0), 0) / vCostTrials.length)
          : null,
        avgTokens: vTokenTrials.length > 0
          ? {
              inputTokens: Math.round(vTokenTrials.reduce((s, t) => s + (t.tokenUsage?.inputTokens ?? 0), 0) / vTokenTrials.length),
              outputTokens: Math.round(vTokenTrials.reduce((s, t) => s + (t.tokenUsage?.outputTokens ?? 0), 0) / vTokenTrials.length),
              totalTokens: Math.round(vTokenTrials.reduce((s, t) => s + (t.tokenUsage?.totalTokens ?? 0), 0) / vTokenTrials.length),
            }
          : null,
      };
    }

    // Per-case breakdown
    const caseGroups = new Map<string, SkillEvalTrialRow[]>();
    for (const trial of completedTrials) {
      const group = caseGroups.get(trial.caseId) ?? [];
      group.push(trial);
      caseGroups.set(trial.caseId, group);
    }

    const perCase: SkillEvalCaseSummary[] = [];
    for (const [caseId, caseTrials] of caseGroups) {
      const caseRow = caseMap.get(caseId);
      const caseVariantGroups = new Map<string, SkillEvalTrialRow[]>();
      for (const trial of caseTrials) {
        const group = caseVariantGroups.get(trial.variant) ?? [];
        group.push(trial);
        caseVariantGroups.set(trial.variant, group);
      }

      const casePerVariant: Record<string, SkillEvalVariantSummary> = {};
      for (const [variant, variantTrials] of caseVariantGroups) {
        const vPassed = variantTrials.filter((t) => t.status === "passed").length;
        const vTotal = variantTrials.length;
        casePerVariant[variant] = {
          variant: variant as SkillEvalVariantSummary["variant"],
          totalTrials: vTotal,
          passedTrials: vPassed,
          passRate: vTotal > 0 ? vPassed / vTotal : 0,
          avgLatencyMs: null,
          avgCostCents: null,
          avgTokens: null,
        };
      }

      perCase.push({
        caseId,
        caseName: caseRow?.name ?? "Unknown",
        weight: caseRow?.weight ?? 1.0,
        perVariant: casePerVariant,
      });
    }

    const uniqueCaseIds = new Set(completedTrials.map((t) => t.caseId));

    return {
      totalCases: uniqueCaseIds.size,
      totalTrials,
      passRate,
      weightedPassRate,
      passAtK,
      passPowK,
      avgTokens,
      avgLatencyMs,
      avgCostCents,
      perVariant,
      perCase,
    };
  }

  // =========================================================================
  // Regression alert detection
  // =========================================================================

  async function checkAndCreateAlerts(
    companyId: string,
    benchmark: SkillEvalBenchmarkRow,
    summary: SkillEvalBenchmarkSummary,
  ) {
    // Find previous completed benchmark for the same suite
    const [previous] = await db
      .select()
      .from(skillEvalBenchmarks)
      .where(
        and(
          eq(skillEvalBenchmarks.companyId, companyId),
          eq(skillEvalBenchmarks.suiteId, benchmark.suiteId),
          eq(skillEvalBenchmarks.status, "completed"),
        ),
      )
      .orderBy(desc(skillEvalBenchmarks.finishedAt))
      .limit(1);

    if (!previous?.summary) return;

    const prevSummary = previous.summary as unknown as SkillEvalBenchmarkSummary;
    const passRateDrop = prevSummary.passRate - summary.passRate;

    // Alert if pass rate dropped by more than 10%
    if (passRateDrop > 0.10) {
      await db.insert(skillEvalAlerts).values({
        companyId,
        suiteId: benchmark.suiteId,
        benchmarkId: benchmark.id,
        type: "pass_rate_drop",
        severity: passRateDrop > 0.25 ? "critical" : "warning",
        metric: "pass_rate",
        threshold: 0.10,
        actualValue: summary.passRate,
        previousValue: prevSummary.passRate,
        message: `Pass rate dropped by ${(passRateDrop * 100).toFixed(1)}% (${(prevSummary.passRate * 100).toFixed(1)}% → ${(summary.passRate * 100).toFixed(1)}%)`,
        details: {
          benchmarkId: benchmark.id,
          previousBenchmarkId: previous.id,
        },
      });
    }
  }

  // =========================================================================
  // Promptfoo import
  // =========================================================================

  async function importFromPromptfoo(
    companyId: string,
    suiteId: string,
    yamlContent: string,
  ): Promise<{ imported: number; cases: SkillEvalCase[] }> {
    // Parse simple YAML array of test cases (matching promptfoo test format)
    const cases: SkillEvalCase[] = [];
    const entries = parseSimpleYamlTestCases(yamlContent);

    for (const entry of entries) {
      const assertArr = Array.isArray(entry.assert) ? entry.assert as Array<Record<string, unknown>> : [];
      const description = typeof entry.description === "string" ? entry.description : undefined;
      const prompt = typeof entry.prompt === "string" ? entry.prompt : undefined;
      const vars = (entry.vars && typeof entry.vars === "object" && !Array.isArray(entry.vars))
        ? entry.vars as Record<string, unknown>
        : {};
      const graders = convertPromptfooAssertions(assertArr);
      const evalCase = await createCase(companyId, suiteId, {
        name: description ?? `Case ${cases.length + 1}`,
        prompt: prompt ?? buildPromptFromVars(vars),
        expected: { assertions: assertArr },
        graderConfig: graders.length > 0 ? { inline: graders } : undefined,
        tags: description?.includes(".") ? [description.split(".")[0]!] : [],
      });
      cases.push(evalCase);
    }

    return { imported: cases.length, cases };
  }

  function parseSimpleYamlTestCases(yaml: string): Array<Record<string, unknown>> {
    // Minimal YAML parser for promptfoo test case arrays
    // Handles the simple format in evals/promptfoo/tests/*.yaml
    const entries: Array<Record<string, unknown>> = [];
    let current: Record<string, unknown> | null = null;
    let currentAssert: Array<Record<string, unknown>> | null = null;
    let inAssert = false;

    for (const rawLine of yaml.split("\n")) {
      const line = rawLine.trimEnd();
      if (!line.trim() || line.trim().startsWith("#")) continue;

      // Top-level list item
      if (line.startsWith("- ") && !line.startsWith("    ")) {
        if (current) {
          if (currentAssert) current.assert = currentAssert;
          entries.push(current);
        }
        current = {};
        currentAssert = null;
        inAssert = false;
        const rest = line.slice(2).trim();
        const colonIdx = rest.indexOf(":");
        if (colonIdx > 0) {
          const key = rest.slice(0, colonIdx).trim();
          const value = rest.slice(colonIdx + 1).trim().replace(/^["']|["']$/g, "");
          current[key] = value;
        }
        continue;
      }

      if (!current) continue;

      // Indented key: value
      const trimmed = line.trimStart();
      if (trimmed.startsWith("assert:")) {
        inAssert = true;
        currentAssert = [];
        continue;
      }

      if (inAssert && trimmed.startsWith("- type:")) {
        const typeVal = trimmed.slice("- type:".length).trim();
        currentAssert!.push({ type: typeVal });
        continue;
      }

      if (inAssert && trimmed.startsWith("value:") && currentAssert!.length > 0) {
        const val = trimmed.slice("value:".length).trim().replace(/^["']|["']$/g, "");
        currentAssert![currentAssert!.length - 1]!.value = val;
        continue;
      }

      if (inAssert && trimmed.startsWith("metric:") && currentAssert!.length > 0) {
        const metric = trimmed.slice("metric:".length).trim();
        currentAssert![currentAssert!.length - 1]!.metric = metric;
        continue;
      }

      if (!inAssert) {
        const colonIdx = trimmed.indexOf(":");
        if (colonIdx > 0) {
          const key = trimmed.slice(0, colonIdx).trim();
          const value = trimmed.slice(colonIdx + 1).trim().replace(/^["']|["']$/g, "");
          if (key === "vars") {
            // Skip — handled separately
          } else {
            current[key] = value;
          }
        }
      }
    }

    if (current) {
      if (currentAssert) current.assert = currentAssert;
      entries.push(current);
    }

    return entries;
  }

  function buildPromptFromVars(vars: Record<string, unknown>): string {
    const parts: string[] = [];
    for (const [key, value] of Object.entries(vars)) {
      if (value) parts.push(`${key}: ${String(value)}`);
    }
    return parts.join("\n") || "No prompt";
  }

  function convertPromptfooAssertions(
    assertions: Array<Record<string, unknown>>,
  ): GraderInput[] {
    return assertions.map((assertion, idx) => {
      const type = String(assertion.type ?? "");
      const value = String(assertion.value ?? "");
      const name = String(assertion.metric ?? `assertion_${idx}`);

      switch (type) {
        case "contains":
          return {
            graderId: null,
            graderName: name,
            type: "code_contains" as const,
            config: { values: [value], mode: "all" },
          };
        case "not-contains":
          return {
            graderId: null,
            graderName: name,
            type: "code_javascript" as const,
            config: { expression: `!output.includes(${JSON.stringify(value)})` },
          };
        case "javascript":
          return {
            graderId: null,
            graderName: name,
            type: "code_javascript" as const,
            config: { expression: value },
          };
        default:
          return {
            graderId: null,
            graderName: name,
            type: "code_contains" as const,
            config: { values: [value], mode: "all" },
          };
      }
    });
  }

  // =========================================================================
  // Public API
  // =========================================================================

  return {
    // Suites
    listSuites,
    getSuite,
    createSuite,
    updateSuite,
    deleteSuite,
    // Cases
    listCases,
    getCase,
    createCase,
    updateCase,
    deleteCase,
    // Graders
    listGraders,
    createGrader,
    updateGrader,
    deleteGrader,
    // Metrics
    listMetrics,
    createMetric,
    // Benchmarks
    listBenchmarks,
    getBenchmark,
    createBenchmark,
    runBenchmark,
    runQuickCompare,
    cancelBenchmark,
    promoteVariantToLive,
    getSkillBundle,
    // Trials
    listTrials,
    // Comparisons
    listComparisons,
    // Alerts
    listAlerts,
    // Import
    importFromPromptfoo,
    // Internal (for route-level benchmark orchestration)
    computeBenchmarkSummary,
    checkAndCreateAlerts,
  };
}
