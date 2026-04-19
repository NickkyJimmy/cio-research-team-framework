import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  SkillEvalSuite,
  SkillEvalCase,
  SkillEvalGrader,
  SkillEvalBenchmark,
  SkillEvalAlert,
  SkillEvalBenchmarkSummary,
  SkillEvalVariantSummary,
} from "@paperclipai/shared";
import { useCompany } from "../context/CompanyContext";
import { useBreadcrumbs } from "../context/BreadcrumbContext";
import { useToast } from "../context/ToastContext";
import { skillEvalsApi } from "../api/skillEvals";
import { agentsApi } from "../api/agents";
import { companySkillsApi } from "../api/companySkills";
import { queryKeys } from "../lib/queryKeys";
import { EmptyState } from "../components/EmptyState";
import { PageSkeleton } from "../components/PageSkeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "../lib/utils";
import {
  FlaskConical,
  Plus,
  Play,
  XCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Trash2,
  BarChart3,
  FileText,
  ListChecks,
  Shield,
  ChevronRight,
} from "lucide-react";
import { SkillLabTab } from "../components/skill-lab/SkillLabTab";

// ============================================================================
// Helpers
// ============================================================================

function formatDate(d: Date | string) {
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function passRateColor(rate: number) {
  if (rate >= 0.9) return "text-emerald-600";
  if (rate >= 0.7) return "text-amber-600";
  return "text-red-600";
}

function passRateBg(rate: number) {
  if (rate >= 0.9) return "bg-emerald-500";
  if (rate >= 0.7) return "bg-amber-500";
  return "bg-red-500";
}

function statusColor(status: string) {
  switch (status) {
    case "completed": return "text-emerald-600";
    case "running": return "text-blue-600";
    case "cancelled": return "text-muted-foreground";
    case "failed": return "text-red-600";
    default: return "text-muted-foreground";
  }
}

function statusIcon(status: string) {
  switch (status) {
    case "completed": return CheckCircle2;
    case "running": return Clock;
    case "cancelled": return XCircle;
    case "failed": return AlertTriangle;
    default: return Clock;
  }
}

// ============================================================================
// Suite Card
// ============================================================================

function SuiteCard({
  suite,
  selected,
  onSelect,
  onDelete,
}: {
  suite: SkillEvalSuite;
  selected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className={cn(
        "group flex items-center justify-between border rounded-lg px-4 py-3 cursor-pointer transition-colors",
        selected ? "border-foreground bg-accent/30" : "border-border hover:bg-accent/20",
      )}
      onClick={onSelect}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium truncate">{suite.name}</span>
          <Badge variant={suite.status === "active" ? "default" : "secondary"}>
            {suite.status}
          </Badge>
          {suite.agentId && (
            <Badge variant="outline" className="text-xs">agent-scoped</Badge>
          )}
        </div>
        {suite.description && (
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{suite.description}</p>
        )}
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </div>
    </div>
  );
}

// ============================================================================
// Cases Tab Content
// ============================================================================

function CasesTab({
  companyId,
  suiteId,
}: {
  companyId: string;
  suiteId: string;
}) {
  const queryClient = useQueryClient();
  const { pushToast } = useToast();
  const [showNewCase, setShowNewCase] = useState(false);
  const [newCaseName, setNewCaseName] = useState("");
  const [newCasePrompt, setNewCasePrompt] = useState("");

  const casesQuery = useQuery({
    queryKey: queryKeys.skillEvals.cases(companyId, suiteId),
    queryFn: () => skillEvalsApi.listCases(companyId, suiteId),
  });

  const createCaseMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      skillEvalsApi.createCase(companyId, suiteId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.skillEvals.cases(companyId, suiteId) });
      setShowNewCase(false);
      setNewCaseName("");
      setNewCasePrompt("");
      pushToast({ title: "Test case created" });
    },
  });

  const deleteCaseMutation = useMutation({
    mutationFn: (caseId: string) => skillEvalsApi.deleteCase(companyId, caseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.skillEvals.cases(companyId, suiteId) });
      pushToast({ title: "Test case deleted" });
    },
  });

  const cases = casesQuery.data ?? [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">{cases.length} test cases</h3>
        <Button size="sm" onClick={() => setShowNewCase(true)}>
          <Plus className="h-3.5 w-3.5" data-icon="inline-start" /> Add Case
        </Button>
      </div>

      {showNewCase && (
        <Card>
          <CardContent className="pt-4 flex flex-col gap-3">
            <Input
              placeholder="Case name (e.g. 'handles empty input')"
              value={newCaseName}
              onChange={(e) => setNewCaseName(e.target.value)}
            />
            <Textarea
              placeholder="Prompt / input for the agent"
              value={newCasePrompt}
              onChange={(e) => setNewCasePrompt(e.target.value)}
              className="min-h-20"
            />
            <div className="flex items-center gap-2 justify-end">
              <Button variant="ghost" size="sm" onClick={() => setShowNewCase(false)}>Cancel</Button>
              <Button
                size="sm"
                onClick={() => createCaseMutation.mutate({ name: newCaseName, prompt: newCasePrompt })}
                disabled={createCaseMutation.isPending || !newCaseName.trim()}
              >
                {createCaseMutation.isPending ? "Creating..." : "Create"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {casesQuery.isLoading ? (
        <PageSkeleton variant="detail" />
      ) : cases.length === 0 ? (
        <EmptyState icon={ListChecks} message="No test cases yet. Add one to get started." />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Weight</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {cases.map((c: SkillEvalCase) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell>
                  <Badge variant="outline">{c.caseType}</Badge>
                </TableCell>
                <TableCell className="tabular-nums">{c.weight ?? 1}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {(c.tags ?? []).map((tag: string) => (
                      <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => deleteCaseMutation.mutate(c.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

// ============================================================================
// Graders Tab Content
// ============================================================================

function GradersTab({ companyId }: { companyId: string }) {
  const queryClient = useQueryClient();
  const { pushToast } = useToast();

  const gradersQuery = useQuery({
    queryKey: queryKeys.skillEvals.graders(companyId),
    queryFn: () => skillEvalsApi.listGraders(companyId),
  });

  const deleteGraderMutation = useMutation({
    mutationFn: (graderId: string) => skillEvalsApi.deleteGrader(companyId, graderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.skillEvals.graders(companyId) });
      pushToast({ title: "Grader deleted" });
    },
  });

  const graders = gradersQuery.data ?? [];

  if (gradersQuery.isLoading) return <PageSkeleton variant="detail" />;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">{graders.length} graders</h3>
      </div>

      {graders.length === 0 ? (
        <EmptyState icon={Shield} message="No graders configured. Graders are created alongside test cases." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {graders.map((g: SkillEvalGrader) => (
            <Card key={g.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">{g.name}</CardTitle>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => deleteGraderMutation.mutate(g.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <CardDescription>
                  <Badge variant="outline">{g.type}</Badge>
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Benchmarks Tab Content
// ============================================================================

function BenchmarksTab({
  companyId,
  suites,
}: {
  companyId: string;
  suites: SkillEvalSuite[];
}) {
  const queryClient = useQueryClient();
  const { pushToast } = useToast();
  const [launchOpen, setLaunchOpen] = useState(false);
  const [selectedSuiteId, setSelectedSuiteId] = useState("");
  const [selectedAgentId, setSelectedAgentId] = useState("");
  const [selectedSkillId, setSelectedSkillId] = useState("");
  const [variants, setVariants] = useState<string[]>(["with_skill", "updated_skill"]);
  const [trialsPerCase, setTrialsPerCase] = useState("3");
  const [maxConcurrent, setMaxConcurrent] = useState("3");
  const [expandedBenchmarkId, setExpandedBenchmarkId] = useState<string | null>(null);

  const agentsQuery = useQuery({
    queryKey: queryKeys.agents.list(companyId),
    queryFn: () => agentsApi.list(companyId),
    enabled: launchOpen,
  });

  const skillsQuery = useQuery({
    queryKey: queryKeys.companySkills.list(companyId),
    queryFn: () => companySkillsApi.list(companyId),
    enabled: launchOpen,
  });

  const benchmarksQuery = useQuery({
    queryKey: queryKeys.skillEvals.benchmarks(companyId),
    queryFn: () => skillEvalsApi.listBenchmarks(companyId),
    refetchInterval: 10_000,
  });

  const createBenchmarkMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      skillEvalsApi.createBenchmark(companyId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.skillEvals.benchmarks(companyId) });
      setLaunchOpen(false);
      pushToast({ title: "Benchmark launched" });
    },
  });

  const cancelBenchmarkMutation = useMutation({
    mutationFn: (benchmarkId: string) =>
      skillEvalsApi.cancelBenchmark(companyId, benchmarkId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.skillEvals.benchmarks(companyId) });
      pushToast({ title: "Benchmark cancelled" });
    },
  });

  const benchmarks = benchmarksQuery.data ?? [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">{benchmarks.length} benchmarks</h3>
        <Button size="sm" onClick={() => setLaunchOpen(true)} disabled={suites.length === 0}>
          <Play className="h-3.5 w-3.5" data-icon="inline-start" /> Launch Benchmark
        </Button>
      </div>

      {/* Launch Dialog */}
      <Dialog open={launchOpen} onOpenChange={setLaunchOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Launch Benchmark</DialogTitle>
            <DialogDescription>Select a suite and configure the benchmark run.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Suite</label>
              <Select value={selectedSuiteId} onValueChange={setSelectedSuiteId}>
                <SelectTrigger><SelectValue placeholder="Select a suite" /></SelectTrigger>
                <SelectContent>
                  {suites.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Agent</label>
                <Select value={selectedAgentId} onValueChange={setSelectedAgentId}>
                  <SelectTrigger><SelectValue placeholder="Select an agent" /></SelectTrigger>
                  <SelectContent>
                    {(agentsQuery.data ?? []).map((a) => (
                      <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Skill (Optional)</label>
                <Select value={selectedSkillId} onValueChange={setSelectedSkillId}>
                  <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {(skillsQuery.data ?? []).map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Variants</label>
              <div className="flex items-center gap-4">
                {["with_skill", "without_skill", "updated_skill"].map((v) => (
                  <div key={v} className="flex items-center space-x-2">
                    <Checkbox
                      id={`var-${v}`}
                      checked={variants.includes(v)}
                      onCheckedChange={(checked) => {
                        if (checked) setVariants([...variants, v]);
                        else setVariants(variants.filter((x) => x !== v));
                      }}
                    />
                    <label htmlFor={`var-${v}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      {v.replace("_", " ")}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Trials per case</label>
                <Input type="number" min="1" max="100" value={trialsPerCase} onChange={(e) => setTrialsPerCase(e.target.value)} />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Max concurrent</label>
                <Input type="number" min="1" max="20" value={maxConcurrent} onChange={(e) => setMaxConcurrent(e.target.value)} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setLaunchOpen(false)}>Cancel</Button>
            <Button
              onClick={() => createBenchmarkMutation.mutate({
                suiteId: selectedSuiteId,
                agentId: selectedAgentId,
                skillId: selectedSkillId === "none" ? null : selectedSkillId || null,
                variants,
                trialsPerCase: parseInt(trialsPerCase) || 3,
                maxConcurrentTrials: parseInt(maxConcurrent) || 3,
              })}
              disabled={!selectedSuiteId || !selectedAgentId || variants.length === 0 || createBenchmarkMutation.isPending}
            >
              {createBenchmarkMutation.isPending ? "Launching..." : "Launch"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {benchmarksQuery.isLoading ? (
        <PageSkeleton variant="detail" />
      ) : benchmarks.length === 0 ? (
        <EmptyState icon={BarChart3} message="No benchmarks yet. Launch one to compare skill variants." />
      ) : (
        <div className="flex flex-col gap-3">
          {benchmarks.map((b: SkillEvalBenchmark) => {
            const StatusIcon = statusIcon(b.status);
            const expanded = expandedBenchmarkId === b.id;
            const summary = b.summary as SkillEvalBenchmarkSummary | null;

            return (
              <Card key={b.id} className="overflow-hidden">
                <div
                  className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-accent/10 transition-colors"
                  onClick={() => setExpandedBenchmarkId(expanded ? null : b.id)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <StatusIcon className={cn("h-4 w-4 shrink-0", statusColor(b.status))} />
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">
                        {suites.find((s) => s.id === b.suiteId)?.name ?? b.suiteId}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(b.createdAt)} · {b.variants.join(" vs ")} · {b.trialsPerCase} trials/case
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {b.status === "running" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); cancelBenchmarkMutation.mutate(b.id); }}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <XCircle className="h-3.5 w-3.5" data-icon="inline-start" /> Cancel
                      </Button>
                    )}
                    {summary && (
                      <span className={cn("text-sm font-semibold tabular-nums", passRateColor(summary.weightedPassRate))}>
                        {Math.round(summary.weightedPassRate * 100)}%
                      </span>
                    )}
                    <ChevronRight className={cn("h-4 w-4 text-muted-foreground transition-transform", expanded && "rotate-90")} />
                  </div>
                </div>

                {expanded && summary && (
                  <div className="border-t border-border px-4 py-4 flex flex-col gap-4">
                    {/* Overall metrics */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center">
                        <div className={cn("text-lg font-bold tabular-nums", passRateColor(summary.weightedPassRate))}>
                          {Math.round(summary.weightedPassRate * 100)}%
                        </div>
                        <div className="text-xs text-muted-foreground">Weighted Pass Rate</div>
                      </div>
                      {summary.passAtK !== undefined && (
                        <div className="text-center">
                          <div className="text-lg font-bold tabular-nums">
                            {Math.round(summary.passAtK * 100)}%
                          </div>
                          <div className="text-xs text-muted-foreground">Pass@K</div>
                        </div>
                      )}
                      {summary.passPowK !== undefined && (
                        <div className="text-center">
                          <div className="text-lg font-bold tabular-nums">
                            {Math.round(summary.passPowK * 100)}%
                          </div>
                          <div className="text-xs text-muted-foreground">Pass^K</div>
                        </div>
                      )}
                    </div>

                    {/* Per-variant breakdown */}
                    {summary.perVariant && (
                      <div>
                        <h4 className="text-xs font-medium text-muted-foreground mb-2">Per Variant</h4>
                        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                          {Object.entries(summary.perVariant).map(([variant, data]) => {
                            const vData = data as SkillEvalVariantSummary;
                            return (
                            <div key={variant} className="border border-border rounded-md p-3">
                              <div className="flex items-center justify-between mb-2">
                                <Badge variant="outline" className="text-xs">{variant}</Badge>
                                <span className={cn("text-sm font-semibold tabular-nums", passRateColor(vData.passRate ?? 0))}>
                                  {Math.round((vData.passRate ?? 0) * 100)}%
                                </span>
                              </div>
                              <Progress
                                value={(vData.passRate ?? 0) * 100}
                                className="h-1.5"
                              />
                            </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Comparison recommendation */}
                    {summary.comparison && (
                      <div className="border-t border-border pt-3">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground">Recommendation:</span>
                          <Badge
                          variant={summary.comparison.recommendation === "promote" ? "default" : "secondary"}
                          >
                            {summary.comparison.recommendation}
                          </Badge>
                          {summary.comparison.winner && (
                            <span className="text-muted-foreground">Winner: <strong>{summary.comparison.winner}</strong></span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Alerts Tab Content
// ============================================================================

function AlertsTab({ companyId }: { companyId: string }) {
  const queryClient = useQueryClient();
  const { pushToast } = useToast();

  const alertsQuery = useQuery({
    queryKey: queryKeys.skillEvals.alerts(companyId),
    queryFn: () => skillEvalsApi.listAlerts(companyId),
  });

  const acknowledgeMutation = useMutation({
    mutationFn: (alertId: string) => skillEvalsApi.acknowledgeAlert(companyId, alertId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.skillEvals.alerts(companyId) });
      pushToast({ title: "Alert acknowledged" });
    },
  });

  const alerts = alertsQuery.data ?? [];

  if (alertsQuery.isLoading) return <PageSkeleton variant="detail" />;

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-sm font-medium text-muted-foreground">
        {alerts.filter((a: SkillEvalAlert) => !a.acknowledged).length} unacknowledged
      </h3>

      {alerts.length === 0 ? (
        <EmptyState icon={CheckCircle2} message="No regression alerts. Your skills are stable." />
      ) : (
        <div className="flex flex-col gap-2">
          {alerts.map((alert: SkillEvalAlert) => (
            <div
              key={alert.id}
              className={cn(
                "flex items-center justify-between border rounded-lg px-4 py-3",
                alert.acknowledged ? "border-border opacity-60" : "border-amber-500/30 bg-amber-50/5",
              )}
            >
              <div className="flex items-center gap-3 min-w-0">
                <AlertTriangle className={cn(
                  "h-4 w-4 shrink-0",
                  alert.severity === "critical" ? "text-red-500" : "text-amber-500",
                )} />
                <div className="min-w-0">
                  <div className="text-sm font-medium">{alert.message}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatDate(alert.createdAt)} · {alert.severity} · {alert.type}
                  </div>
                </div>
              </div>
              {!alert.acknowledged && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => acknowledgeMutation.mutate(alert.id)}
                  disabled={acknowledgeMutation.isPending}
                >
                  Acknowledge
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Main Page Component
// ============================================================================

export function SkillEvals() {
  const { selectedCompanyId } = useCompany();
  const { setBreadcrumbs } = useBreadcrumbs();
  const queryClient = useQueryClient();
  const { pushToast } = useToast();

  const [selectedSuiteId, setSelectedSuiteId] = useState<string | null>(null);
  const [showCreateSuite, setShowCreateSuite] = useState(false);
  const [newSuiteName, setNewSuiteName] = useState("");
  const [newSuiteDesc, setNewSuiteDesc] = useState("");
  const [activeTab, setActiveTab] = useState("cases");

  useEffect(() => {
    setBreadcrumbs([{ label: "Skill Evals", href: "/skill-evals" }]);
  }, [setBreadcrumbs]);

  const suitesQuery = useQuery({
    queryKey: queryKeys.skillEvals.suites(selectedCompanyId ?? ""),
    queryFn: () => skillEvalsApi.listSuites(selectedCompanyId!),
    enabled: Boolean(selectedCompanyId),
  });

  const alertsQuery = useQuery({
    queryKey: queryKeys.skillEvals.alerts(selectedCompanyId ?? ""),
    queryFn: () => skillEvalsApi.listAlerts(selectedCompanyId!),
    enabled: Boolean(selectedCompanyId),
  });

  const createSuiteMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      skillEvalsApi.createSuite(selectedCompanyId!, body),
    onSuccess: (suite) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.skillEvals.suites(selectedCompanyId!) });
      setSelectedSuiteId(suite.id);
      setShowCreateSuite(false);
      setNewSuiteName("");
      setNewSuiteDesc("");
      pushToast({ title: "Suite created" });
    },
  });

  const deleteSuiteMutation = useMutation({
    mutationFn: (suiteId: string) => skillEvalsApi.deleteSuite(selectedCompanyId!, suiteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.skillEvals.suites(selectedCompanyId!) });
      setSelectedSuiteId(null);
      pushToast({ title: "Suite deleted" });
    },
  });

  const suites = suitesQuery.data ?? [];
  const unacknowledgedAlerts = (alertsQuery.data ?? []).filter((a: SkillEvalAlert) => !a.acknowledged).length;
  const selectedSuite = suites.find((s) => s.id === selectedSuiteId);

  if (!selectedCompanyId) {
    return <EmptyState icon={FlaskConical} message="Select a company to view skill evals." />;
  }

  if (suitesQuery.isLoading) return <PageSkeleton variant="detail" />;

  return (
    <div className="flex h-full min-h-0">
      {/* Sidebar — Suite List */}
      <div className="w-72 shrink-0 border-r border-border flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h2 className="text-sm font-semibold">Eval Suites</h2>
          <Button variant="ghost" size="icon-sm" onClick={() => setShowCreateSuite(true)}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {showCreateSuite && (
          <div className="border-b border-border px-3 py-3 flex flex-col gap-2">
            <Input
              placeholder="Suite name"
              value={newSuiteName}
              onChange={(e) => setNewSuiteName(e.target.value)}
              className="h-8 text-sm"
            />
            <Textarea
              placeholder="Description (optional)"
              value={newSuiteDesc}
              onChange={(e) => setNewSuiteDesc(e.target.value)}
              className="min-h-14 text-sm"
            />
            <div className="flex items-center gap-2 justify-end">
              <Button variant="ghost" size="sm" onClick={() => setShowCreateSuite(false)}>Cancel</Button>
              <Button
                size="sm"
                onClick={() => createSuiteMutation.mutate({ name: newSuiteName, description: newSuiteDesc || null })}
                disabled={!newSuiteName.trim() || createSuiteMutation.isPending}
              >
                Create
              </Button>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
          {suites.length === 0 ? (
            <div className="text-xs text-muted-foreground px-2 py-4 text-center">
              No eval suites yet. Create one to get started.
            </div>
          ) : (
            suites.map((suite) => (
              <SuiteCard
                key={suite.id}
                suite={suite}
                selected={suite.id === selectedSuiteId}
                onSelect={() => setSelectedSuiteId(suite.id)}
                onDelete={() => deleteSuiteMutation.mutate(suite.id)}
              />
            ))
          )}
        </div>
      </div>

      {/* Main Content — Tabbed */}
      <div className="flex-1 min-w-0 flex flex-col">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <div className="border-b border-border px-4 pt-2">
            <TabsList>
              <TabsTrigger value="cases" className="gap-1.5">
                <FileText className="h-3.5 w-3.5" />
                Cases
              </TabsTrigger>
              <TabsTrigger value="graders" className="gap-1.5">
                <Shield className="h-3.5 w-3.5" />
                Graders
              </TabsTrigger>
              <TabsTrigger value="benchmarks" className="gap-1.5">
                <BarChart3 className="h-3.5 w-3.5" />
                Benchmarks
              </TabsTrigger>
              <TabsTrigger value="alerts" className="gap-1.5 relative">
                <AlertTriangle className="h-3.5 w-3.5" />
                Alerts
                {unacknowledgedAlerts > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                    {unacknowledgedAlerts}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="skill-lab" className="gap-1.5">
                <FlaskConical className="h-3.5 w-3.5" />
                Skill Lab
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            <TabsContent value="cases" className="mt-0">
              {selectedSuite ? (
                <CasesTab companyId={selectedCompanyId} suiteId={selectedSuite.id} />
              ) : (
                <EmptyState icon={FlaskConical} message="Select a suite from the sidebar to manage its test cases." />
              )}
            </TabsContent>

            <TabsContent value="graders" className="mt-0">
              <GradersTab companyId={selectedCompanyId} />
            </TabsContent>

            <TabsContent value="benchmarks" className="mt-0">
              <BenchmarksTab companyId={selectedCompanyId} suites={suites} />
            </TabsContent>

            <TabsContent value="alerts" className="mt-0">
              <AlertsTab companyId={selectedCompanyId} />
            </TabsContent>

            <TabsContent value="skill-lab" className="mt-0">
              <SkillLabTab companyId={selectedCompanyId} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
