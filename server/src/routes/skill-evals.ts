/**
 * Skill Eval Routes
 *
 * REST endpoints for skill eval suites, cases, graders, metrics, benchmarks, alerts.
 */

import { Router } from "express";
import type { Db } from "@paperclipai/db";
import {
  createSkillEvalSuiteSchema,
  updateSkillEvalSuiteSchema,
  createSkillEvalCaseSchema,
  updateSkillEvalCaseSchema,
  createSkillEvalGraderSchema,
  updateSkillEvalGraderSchema,
  createSkillEvalMetricSchema,
  createSkillEvalBenchmarkSchema,
  quickCompareSchema,
  promoteSchema,
} from "@paperclipai/shared";
import { validate } from "../middleware/validate.js";
import { skillEvalService } from "../services/skill-evals.js";
import { logActivity } from "../services/activity-log.js";
import { assertCompanyAccess, getActorInfo } from "./authz.js";

export function skillEvalRoutes(db: Db) {
  const router = Router();
  const svc = skillEvalService(db);

  // =========================================================================
  // Suites
  // =========================================================================

  router.get("/companies/:companyId/skill-evals/suites", async (req, res, next) => {
    try {
      const companyId = req.params.companyId as string;
      assertCompanyAccess(req, companyId);
      const suites = await svc.listSuites(companyId);
      res.json(suites);
    } catch (err) {
      next(err);
    }
  });

  router.post(
    "/companies/:companyId/skill-evals/suites",
    validate(createSkillEvalSuiteSchema),
    async (req, res, next) => {
      try {
        const companyId = req.params.companyId as string;
        assertCompanyAccess(req, companyId);
        const suite = await svc.createSuite(companyId, req.body);
        const actor = getActorInfo(req);
        await logActivity(db, {
          companyId,
          actorType: actor.actorType,
          actorId: actor.actorId,
          action: "skill_eval.suite.created",
          entityType: "skill_eval_suite",
          entityId: suite.id,
          details: { name: suite.name },
        });
        res.status(201).json(suite);
      } catch (err) {
        next(err);
      }
    },
  );

  router.get("/companies/:companyId/skill-evals/suites/:suiteId", async (req, res, next) => {
    try {
      const companyId = req.params.companyId as string;
      const suiteId = req.params.suiteId as string;
      assertCompanyAccess(req, companyId);
      const suite = await svc.getSuite(companyId, suiteId);
      if (!suite) return res.status(404).json({ error: "Suite not found" });
      res.json(suite);
    } catch (err) {
      next(err);
    }
  });

  router.get("/companies/:companyId/skill-evals/suites/:suiteId/summary", async (req, res, next) => {
    try {
      const companyId = req.params.companyId as string;
      const suiteId = req.params.suiteId as string;
      assertCompanyAccess(req, companyId);
      const suite = await svc.getSuite(companyId, suiteId);
      if (!suite) return res.status(404).json({ error: "Suite not found" });

      const benchmarks = await svc.listBenchmarks(companyId);
      const latestBenchmark = benchmarks.find(
        (b) => b.suiteId === suiteId && b.status === "completed",
      );

      const alerts = await svc.listAlerts(companyId);
      const suiteAlerts = alerts.filter((a) => a.suiteId === suiteId);

      res.json({
        suite,
        latestBenchmark: latestBenchmark ?? null,
        alertCount: suiteAlerts.length,
        unacknowledgedAlerts: suiteAlerts.filter((a) => !a.acknowledged).length,
      });
    } catch (err) {
      next(err);
    }
  });

  router.patch(
    "/companies/:companyId/skill-evals/suites/:suiteId",
    validate(updateSkillEvalSuiteSchema),
    async (req, res, next) => {
      try {
        const companyId = req.params.companyId as string;
        const suiteId = req.params.suiteId as string;
        assertCompanyAccess(req, companyId);
        const suite = await svc.updateSuite(companyId, suiteId, req.body);
        const actor = getActorInfo(req);
        await logActivity(db, {
          companyId,
          actorType: actor.actorType,
          actorId: actor.actorId,
          action: "skill_eval.suite.updated",
          entityType: "skill_eval_suite",
          entityId: suite.id,
          details: { name: suite.name },
        });
        res.json(suite);
      } catch (err) {
        next(err);
      }
    },
  );

  router.delete("/companies/:companyId/skill-evals/suites/:suiteId", async (req, res, next) => {
    try {
      const companyId = req.params.companyId as string;
      const suiteId = req.params.suiteId as string;
      assertCompanyAccess(req, companyId);
      const result = await svc.deleteSuite(companyId, suiteId);
      const actor = getActorInfo(req);
      await logActivity(db, {
        companyId,
        actorType: actor.actorType,
        actorId: actor.actorId,
        action: "skill_eval.suite.deleted",
        entityType: "skill_eval_suite",
        entityId: result.id,
        details: {},
      });
      res.json(result);
    } catch (err) {
      next(err);
    }
  });

  // =========================================================================
  // Cases
  // =========================================================================

  router.get("/companies/:companyId/skill-evals/suites/:suiteId/cases", async (req, res, next) => {
    try {
      const companyId = req.params.companyId as string;
      const suiteId = req.params.suiteId as string;
      assertCompanyAccess(req, companyId);
      const cases = await svc.listCases(companyId, suiteId);
      res.json(cases);
    } catch (err) {
      next(err);
    }
  });

  router.post(
    "/companies/:companyId/skill-evals/suites/:suiteId/cases",
    validate(createSkillEvalCaseSchema),
    async (req, res, next) => {
      try {
        const companyId = req.params.companyId as string;
        const suiteId = req.params.suiteId as string;
        assertCompanyAccess(req, companyId);
        const evalCase = await svc.createCase(companyId, suiteId, req.body);
        res.status(201).json(evalCase);
      } catch (err) {
        next(err);
      }
    },
  );

  router.get("/companies/:companyId/skill-evals/cases/:caseId", async (req, res, next) => {
    try {
      const companyId = req.params.companyId as string;
      const caseId = req.params.caseId as string;
      assertCompanyAccess(req, companyId);
      const evalCase = await svc.getCase(companyId, caseId);
      if (!evalCase) return res.status(404).json({ error: "Case not found" });
      res.json(evalCase);
    } catch (err) {
      next(err);
    }
  });

  router.patch(
    "/companies/:companyId/skill-evals/cases/:caseId",
    validate(updateSkillEvalCaseSchema),
    async (req, res, next) => {
      try {
        const companyId = req.params.companyId as string;
        const caseId = req.params.caseId as string;
        assertCompanyAccess(req, companyId);
        const evalCase = await svc.updateCase(companyId, caseId, req.body);
        res.json(evalCase);
      } catch (err) {
        next(err);
      }
    },
  );

  router.delete("/companies/:companyId/skill-evals/cases/:caseId", async (req, res, next) => {
    try {
      const companyId = req.params.companyId as string;
      const caseId = req.params.caseId as string;
      assertCompanyAccess(req, companyId);
      const result = await svc.deleteCase(companyId, caseId);
      res.json(result);
    } catch (err) {
      next(err);
    }
  });

  // =========================================================================
  // Graders
  // =========================================================================

  router.get("/companies/:companyId/skill-evals/graders", async (req, res, next) => {
    try {
      const companyId = req.params.companyId as string;
      assertCompanyAccess(req, companyId);
      const graders = await svc.listGraders(companyId);
      res.json(graders);
    } catch (err) {
      next(err);
    }
  });

  router.post(
    "/companies/:companyId/skill-evals/graders",
    validate(createSkillEvalGraderSchema),
    async (req, res, next) => {
      try {
        const companyId = req.params.companyId as string;
        assertCompanyAccess(req, companyId);
        const grader = await svc.createGrader(companyId, req.body);
        res.status(201).json(grader);
      } catch (err) {
        next(err);
      }
    },
  );

  router.patch(
    "/companies/:companyId/skill-evals/graders/:graderId",
    validate(updateSkillEvalGraderSchema),
    async (req, res, next) => {
      try {
        const companyId = req.params.companyId as string;
        const graderId = req.params.graderId as string;
        assertCompanyAccess(req, companyId);
        const grader = await svc.updateGrader(companyId, graderId, req.body);
        res.json(grader);
      } catch (err) {
        next(err);
      }
    },
  );

  router.delete("/companies/:companyId/skill-evals/graders/:graderId", async (req, res, next) => {
    try {
      const companyId = req.params.companyId as string;
      const graderId = req.params.graderId as string;
      assertCompanyAccess(req, companyId);
      const result = await svc.deleteGrader(companyId, graderId);
      res.json(result);
    } catch (err) {
      next(err);
    }
  });

  // =========================================================================
  // Metrics
  // =========================================================================

  router.get("/companies/:companyId/skill-evals/metrics", async (req, res, next) => {
    try {
      const companyId = req.params.companyId as string;
      assertCompanyAccess(req, companyId);
      const metrics = await svc.listMetrics(companyId);
      res.json(metrics);
    } catch (err) {
      next(err);
    }
  });

  router.post(
    "/companies/:companyId/skill-evals/metrics",
    validate(createSkillEvalMetricSchema),
    async (req, res, next) => {
      try {
        const companyId = req.params.companyId as string;
        assertCompanyAccess(req, companyId);
        const metric = await svc.createMetric(companyId, req.body);
        res.status(201).json(metric);
      } catch (err) {
        next(err);
      }
    },
  );

  // =========================================================================
  // Benchmarks
  // =========================================================================

  router.get("/companies/:companyId/skill-evals/benchmarks", async (req, res, next) => {
    try {
      const companyId = req.params.companyId as string;
      assertCompanyAccess(req, companyId);
      const benchmarks = await svc.listBenchmarks(companyId);
      res.json(benchmarks);
    } catch (err) {
      next(err);
    }
  });

  router.post(
    "/companies/:companyId/skill-evals/benchmarks",
    validate(createSkillEvalBenchmarkSchema),
    async (req, res, next) => {
      try {
        const companyId = req.params.companyId as string;
        assertCompanyAccess(req, companyId);
        const benchmark = await svc.runBenchmark(companyId, req.body);
        const actor = getActorInfo(req);
        await logActivity(db, {
          companyId,
          actorType: actor.actorType,
          actorId: actor.actorId,
          action: "skill_eval.benchmark.created",
          entityType: "skill_eval_benchmark",
          entityId: benchmark.id,
          details: { suiteId: benchmark.suiteId, variants: benchmark.variants },
        });
        res.status(201).json(benchmark);
      } catch (err) {
        next(err);
      }
    },
  );

  router.post(
    "/companies/:companyId/skill-evals/benchmarks/compare",
    validate(quickCompareSchema),
    async (req, res, next) => {
      try {
        const companyId = req.params.companyId as string;
        assertCompanyAccess(req, companyId);
        const benchmark = await svc.runQuickCompare(companyId, req.body);
        const actor = getActorInfo(req);
        await logActivity(db, {
          companyId,
          actorType: actor.actorType,
          actorId: actor.actorId,
          action: "skill_eval.quick_compare.created",
          entityType: "skill_eval_benchmark",
          entityId: benchmark.id,
          details: {
            suiteId: benchmark.suiteId,
            variants: benchmark.variants,
          },
        });
        res.status(201).json({ benchmarkId: benchmark.id, status: benchmark.status });
      } catch (err) {
        next(err);
      }
    },
  );

  router.post(
    "/companies/:companyId/skill-evals/promote",
    validate(promoteSchema),
    async (req, res, next) => {
      try {
        const companyId = req.params.companyId as string;
        assertCompanyAccess(req, companyId);
        const result = await svc.promoteVariantToLive(
          companyId,
          String(req.body.benchmarkId),
          String(req.body.winningVariantKey),
        );
        const actor = getActorInfo(req);
        await logActivity(db, {
          companyId,
          actorType: actor.actorType,
          actorId: actor.actorId,
          action: "skill_eval.promoted",
          entityType: "company_skill",
          entityId: result.skillId,
          details: {
            benchmarkId: String(req.body.benchmarkId),
            variant: String(req.body.winningVariantKey),
          },
        });
        res.json(result);
      } catch (err) {
        next(err);
      }
    },
  );

  router.get("/companies/:companyId/skill-evals/benchmarks/:benchmarkId", async (req, res, next) => {
    try {
      const companyId = req.params.companyId as string;
      const benchmarkId = req.params.benchmarkId as string;
      assertCompanyAccess(req, companyId);
      const benchmark = await svc.getBenchmark(companyId, benchmarkId);
      if (!benchmark) return res.status(404).json({ error: "Benchmark not found" });
      res.json(benchmark);
    } catch (err) {
      next(err);
    }
  });

  router.get("/companies/:companyId/skill-evals/benchmarks/:benchmarkId/trials", async (req, res, next) => {
    try {
      const companyId = req.params.companyId as string;
      const benchmarkId = req.params.benchmarkId as string;
      assertCompanyAccess(req, companyId);
      const trials = await svc.listTrials(companyId, benchmarkId);
      res.json(trials);
    } catch (err) {
      next(err);
    }
  });

  router.get("/companies/:companyId/skill-evals/benchmarks/:benchmarkId/comparisons", async (req, res, next) => {
    try {
      const companyId = req.params.companyId as string;
      const benchmarkId = req.params.benchmarkId as string;
      assertCompanyAccess(req, companyId);
      const comparisons = await svc.listComparisons(companyId, benchmarkId);
      res.json(comparisons);
    } catch (err) {
      next(err);
    }
  });

  router.post("/companies/:companyId/skill-evals/benchmarks/:benchmarkId/cancel", async (req, res, next) => {
    try {
      const companyId = req.params.companyId as string;
      const benchmarkId = req.params.benchmarkId as string;
      assertCompanyAccess(req, companyId);
      const benchmark = await svc.cancelBenchmark(companyId, benchmarkId);
      const actor = getActorInfo(req);
      await logActivity(db, {
        companyId,
        actorType: actor.actorType,
        actorId: actor.actorId,
        action: "skill_eval.benchmark.cancelled",
        entityType: "skill_eval_benchmark",
        entityId: benchmark.id,
        details: {},
      });
      res.json(benchmark);
    } catch (err) {
      next(err);
    }
  });

  // =========================================================================
  // Alerts
  // =========================================================================

  router.get("/companies/:companyId/skill-evals/alerts", async (req, res, next) => {
    try {
      const companyId = req.params.companyId as string;
      assertCompanyAccess(req, companyId);
      const alerts = await svc.listAlerts(companyId);
      res.json(alerts);
    } catch (err) {
      next(err);
    }
  });

  router.patch("/companies/:companyId/skill-evals/alerts/:alertId/acknowledge", async (req, res, next) => {
    try {
      const companyId = req.params.companyId as string;
      assertCompanyAccess(req, companyId);
      // TODO: add acknowledgeAlert method to skillEvalService
      res.json({ acknowledged: true });
    } catch (err) {
      next(err);
    }
  });

  // =========================================================================
  // Import
  // =========================================================================

  router.post("/companies/:companyId/skill-evals/suites/:suiteId/import-promptfoo", async (req, res, next) => {
    try {
      const companyId = req.params.companyId as string;
      const suiteId = req.params.suiteId as string;
      assertCompanyAccess(req, companyId);
      const { yamlContent } = req.body as { yamlContent: string };
      if (!yamlContent || typeof yamlContent !== "string") {
        return res.status(400).json({ error: "yamlContent is required" });
      }
      const result = await svc.importFromPromptfoo(companyId, suiteId, yamlContent);
      const actor = getActorInfo(req);
      await logActivity(db, {
        companyId,
        actorType: actor.actorType,
        actorId: actor.actorId,
        action: "skill_eval.suite.imported_promptfoo",
        entityType: "skill_eval_suite",
        entityId: suiteId,
        details: { importedCount: result.imported },
      });
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  });

  return router;
}
