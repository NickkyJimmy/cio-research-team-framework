import type {
  SkillEvalSuite,
  SkillEvalCase,
  SkillEvalGrader,
  SkillEvalMetric,
  SkillEvalBenchmark,
  SkillEvalTrial,
  SkillEvalComparison,
  SkillEvalAlert,
  SkillLabBenchmarkRequest,
  QuickCompareRequest,
  PromoteRequest,
  SkillSnapshot,
} from "@paperclipai/shared";
import { api } from "./client";

function enc(s: string) {
  return encodeURIComponent(s);
}

export const skillEvalsApi = {
  // Suites
  listSuites: (companyId: string) =>
    api.get<SkillEvalSuite[]>(`/companies/${enc(companyId)}/skill-evals/suites`),
  createSuite: (companyId: string, body: Record<string, unknown>) =>
    api.post<SkillEvalSuite>(`/companies/${enc(companyId)}/skill-evals/suites`, body),
  getSuite: (companyId: string, suiteId: string) =>
    api.get<SkillEvalSuite>(`/companies/${enc(companyId)}/skill-evals/suites/${enc(suiteId)}`),
  getSuiteSummary: (companyId: string, suiteId: string) =>
    api.get<{ suite: SkillEvalSuite; latestBenchmark: SkillEvalBenchmark | null; alertCount: number; unacknowledgedAlerts: number }>(
      `/companies/${enc(companyId)}/skill-evals/suites/${enc(suiteId)}/summary`,
    ),
  updateSuite: (companyId: string, suiteId: string, body: Record<string, unknown>) =>
    api.patch<SkillEvalSuite>(`/companies/${enc(companyId)}/skill-evals/suites/${enc(suiteId)}`, body),
  deleteSuite: (companyId: string, suiteId: string) =>
    api.delete<{ id: string }>(`/companies/${enc(companyId)}/skill-evals/suites/${enc(suiteId)}`),

  // Cases
  listCases: (companyId: string, suiteId: string) =>
    api.get<SkillEvalCase[]>(`/companies/${enc(companyId)}/skill-evals/suites/${enc(suiteId)}/cases`),
  createCase: (companyId: string, suiteId: string, body: Record<string, unknown>) =>
    api.post<SkillEvalCase>(`/companies/${enc(companyId)}/skill-evals/suites/${enc(suiteId)}/cases`, body),
  getCase: (companyId: string, caseId: string) =>
    api.get<SkillEvalCase>(`/companies/${enc(companyId)}/skill-evals/cases/${enc(caseId)}`),
  updateCase: (companyId: string, caseId: string, body: Record<string, unknown>) =>
    api.patch<SkillEvalCase>(`/companies/${enc(companyId)}/skill-evals/cases/${enc(caseId)}`, body),
  deleteCase: (companyId: string, caseId: string) =>
    api.delete<{ id: string }>(`/companies/${enc(companyId)}/skill-evals/cases/${enc(caseId)}`),

  // Graders
  listGraders: (companyId: string) =>
    api.get<SkillEvalGrader[]>(`/companies/${enc(companyId)}/skill-evals/graders`),
  createGrader: (companyId: string, body: Record<string, unknown>) =>
    api.post<SkillEvalGrader>(`/companies/${enc(companyId)}/skill-evals/graders`, body),
  updateGrader: (companyId: string, graderId: string, body: Record<string, unknown>) =>
    api.patch<SkillEvalGrader>(`/companies/${enc(companyId)}/skill-evals/graders/${enc(graderId)}`, body),
  deleteGrader: (companyId: string, graderId: string) =>
    api.delete<{ id: string }>(`/companies/${enc(companyId)}/skill-evals/graders/${enc(graderId)}`),

  // Metrics
  listMetrics: (companyId: string) =>
    api.get<SkillEvalMetric[]>(`/companies/${enc(companyId)}/skill-evals/metrics`),
  createMetric: (companyId: string, body: Record<string, unknown>) =>
    api.post<SkillEvalMetric>(`/companies/${enc(companyId)}/skill-evals/metrics`, body),

  // Benchmarks
  listBenchmarks: (companyId: string) =>
    api.get<SkillEvalBenchmark[]>(`/companies/${enc(companyId)}/skill-evals/benchmarks`),
  createBenchmark: (companyId: string, body: Record<string, unknown>) =>
    api.post<SkillEvalBenchmark>(`/companies/${enc(companyId)}/skill-evals/benchmarks`, body),
  launchSkillLabBenchmark: (companyId: string, body: SkillLabBenchmarkRequest) =>
    api.post<{ benchmarkId: string; status?: string }>(`/companies/${enc(companyId)}/skill-evals/benchmarks`, body),
  quickCompare: (companyId: string, body: QuickCompareRequest) =>
    api.post<{ benchmarkId: string; status?: string }>(`/companies/${enc(companyId)}/skill-evals/benchmarks/compare`, body),
  promoteVariant: (companyId: string, body: PromoteRequest) =>
    api.post<{ skillId: string; promotedVariant: string }>(`/companies/${enc(companyId)}/skill-evals/promote`, body),
  getSkillBundle: (companyId: string, skillId: string) =>
    api.get<SkillSnapshot>(`/companies/${enc(companyId)}/skills/${enc(skillId)}/bundle`),
  getBenchmark: (companyId: string, benchmarkId: string) =>
    api.get<SkillEvalBenchmark>(`/companies/${enc(companyId)}/skill-evals/benchmarks/${enc(benchmarkId)}`),
  listTrials: (companyId: string, benchmarkId: string) =>
    api.get<SkillEvalTrial[]>(`/companies/${enc(companyId)}/skill-evals/benchmarks/${enc(benchmarkId)}/trials`),
  listComparisons: (companyId: string, benchmarkId: string) =>
    api.get<SkillEvalComparison[]>(`/companies/${enc(companyId)}/skill-evals/benchmarks/${enc(benchmarkId)}/comparisons`),
  cancelBenchmark: (companyId: string, benchmarkId: string) =>
    api.post<SkillEvalBenchmark>(`/companies/${enc(companyId)}/skill-evals/benchmarks/${enc(benchmarkId)}/cancel`, {}),

  // Alerts
  listAlerts: (companyId: string) =>
    api.get<SkillEvalAlert[]>(`/companies/${enc(companyId)}/skill-evals/alerts`),
  acknowledgeAlert: (companyId: string, alertId: string) =>
    api.patch<{ acknowledged: boolean }>(`/companies/${enc(companyId)}/skill-evals/alerts/${enc(alertId)}/acknowledge`, {}),

  // Import
  importPromptfoo: (companyId: string, suiteId: string, yamlContent: string) =>
    api.post<{ imported: number; cases: SkillEvalCase[] }>(
      `/companies/${enc(companyId)}/skill-evals/suites/${enc(suiteId)}/import-promptfoo`,
      { yamlContent },
    ),
};
