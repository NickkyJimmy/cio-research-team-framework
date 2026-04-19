import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CustomVariants, SkillEvalBenchmarkSummary, SkillSnapshot } from "@paperclipai/shared";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { queryKeys } from "@/lib/queryKeys";
import { agentsApi } from "@/api/agents";
import { companySkillsApi } from "@/api/companySkills";
import { skillEvalsApi } from "@/api/skillEvals";
import { useToast } from "@/context/ToastContext";
import { SkillFileTree, type DraftFile } from "./SkillFileTree";
import { SkillDiffViewer } from "./SkillDiffViewer";

const SKILL_TEMPLATE_FALLBACK = `---
name: skill-name
description: What this skill does.
---

# Skill Name

## When to use
Use this skill whenever ...`;

interface SkillLabState {
  selectedSkillId: string | null;
  selectedSuiteId: string | null;
  selectedAgentId: string | null;
  editorMode: "split" | "full";
  activeFile: string;
  draftFiles: Record<string, DraftFile>;
  includeWithoutSkill: boolean;
  trialsPerCase: number;
  variantName: string;
  savedVariants: Record<string, SkillSnapshot>;
  selectedBenchmarkId: string | null;
  compareA: string;
  compareB: string;
}

function parseFrontmatter(markdown: string): { name: string; description: string } {
  const m = markdown.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return { name: "", description: "" };
  const yaml = m[1] ?? "";
  const name = (yaml.match(/^name:\s*(.+)$/m)?.[1] ?? "").trim();
  const description = (yaml.match(/^description:\s*(.+)$/m)?.[1] ?? "").trim();
  return { name, description };
}

function asSnapshotVariant(config: CustomVariants[string] | undefined): SkillSnapshot | null {
  if (!config) return null;
  if (config.type === "skill_snapshot" || config.type === "custom_draft") return config.snapshot;
  return null;
}

export function SkillLabTab({ companyId }: { companyId: string }) {
  const queryClient = useQueryClient();
  const { pushToast } = useToast();
  const storageKey = `skill-lab-${companyId}`;

  const [state, setState] = useState<SkillLabState>(() => {
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as Partial<SkillLabState>;
        return {
          selectedSkillId: parsed.selectedSkillId ?? null,
          selectedSuiteId: parsed.selectedSuiteId ?? null,
          selectedAgentId: parsed.selectedAgentId ?? null,
          editorMode: parsed.editorMode ?? "split",
          activeFile: parsed.activeFile ?? "SKILL.md",
          draftFiles: parsed.draftFiles ?? {},
          includeWithoutSkill: parsed.includeWithoutSkill ?? false,
          trialsPerCase: parsed.trialsPerCase ?? 3,
          variantName: parsed.variantName ?? "draft-v1",
          savedVariants: parsed.savedVariants ?? {},
          selectedBenchmarkId: parsed.selectedBenchmarkId ?? null,
          compareA: parsed.compareA ?? "",
          compareB: parsed.compareB ?? "",
        };
      } catch {
        // fall through
      }
    }
    return {
      selectedSkillId: null,
      selectedSuiteId: null,
      selectedAgentId: null,
      editorMode: "split",
      activeFile: "SKILL.md",
      draftFiles: {},
      includeWithoutSkill: false,
      trialsPerCase: 3,
      variantName: "draft-v1",
      savedVariants: {},
      selectedBenchmarkId: null,
      compareA: "",
      compareB: "",
    };
  });

  useEffect(() => {
    const handle = window.setTimeout(() => {
      localStorage.setItem(storageKey, JSON.stringify(state));
    }, 300);
    return () => window.clearTimeout(handle);
  }, [state, storageKey]);

  const suitesQuery = useQuery({
    queryKey: queryKeys.skillEvals.suites(companyId),
    queryFn: () => skillEvalsApi.listSuites(companyId),
  });

  const skillsQuery = useQuery({
    queryKey: queryKeys.companySkills.list(companyId),
    queryFn: () => companySkillsApi.list(companyId),
  });

  const agentsQuery = useQuery({
    queryKey: queryKeys.agents.list(companyId),
    queryFn: () => agentsApi.list(companyId),
  });

  const bundleQuery = useQuery({
    queryKey: ["skill-bundle", companyId, state.selectedSkillId],
    queryFn: () => skillEvalsApi.getSkillBundle(companyId, state.selectedSkillId!),
    enabled: Boolean(state.selectedSkillId),
  });

  const benchmarksQuery = useQuery({
    queryKey: queryKeys.skillEvals.benchmarks(companyId),
    queryFn: () => skillEvalsApi.listBenchmarks(companyId),
    refetchInterval: 5000,
  });

  useEffect(() => {
    const liveBundle = bundleQuery.data;
    if (!liveBundle) return;
    if (Object.keys(state.draftFiles).length > 0) return;

    const files: Record<string, DraftFile> = {
      "SKILL.md": { path: "SKILL.md", content: liveBundle.skillMd, modified: false },
    };
    liveBundle.scripts.forEach((script) => {
      files[script.path] = { path: script.path, content: script.content, modified: false };
    });
    liveBundle.references.forEach((reference) => {
      files[reference.path] = { path: reference.path, content: reference.content, modified: false };
    });
    setState((prev) => ({ ...prev, draftFiles: files, activeFile: "SKILL.md", savedVariants: {} }));
  }, [bundleQuery.data, state.draftFiles]);

  const activeContent = state.draftFiles[state.activeFile]?.content ?? "";

  const updateFile = (filePath: string, content: string) => {
    setState((prev) => ({
      ...prev,
      draftFiles: {
        ...prev.draftFiles,
        [filePath]: { path: filePath, content, modified: true },
      },
    }));
  };

  const buildSnapshot = (): SkillSnapshot => {
    const live = bundleQuery.data;
    const skillMd = state.draftFiles["SKILL.md"]?.content ?? "";
    const parsed = parseFrontmatter(skillMd);
    return {
      name: parsed.name || live?.name || "draft",
      description: parsed.description || live?.description || "",
      skillMd,
      scripts: Object.values(state.draftFiles)
        .filter((file) => file.path.startsWith("scripts/"))
        .map((file) => ({ path: file.path, content: file.content })),
      references: Object.values(state.draftFiles)
        .filter((file) => file.path.startsWith("references/"))
        .map((file) => ({ path: file.path, content: file.content })),
      assets: live?.assets ?? [],
    };
  };

  const variantsPreview = useMemo(() => {
    const base = bundleQuery.data;
    const variants: string[] = [];
    if (base) variants.push(`${base.name}_live`);
    if (state.includeWithoutSkill) variants.push("without_skill");
    variants.push(...Object.keys(state.savedVariants));
    return variants;
  }, [bundleQuery.data, state.includeWithoutSkill, state.savedVariants]);

  const skillLabBenchmarks = useMemo(() => {
    return (benchmarksQuery.data ?? []).filter(
      (benchmark) => benchmark.benchmarkMode === "skill_lab" && (!state.selectedSkillId || benchmark.skillId === state.selectedSkillId),
    );
  }, [benchmarksQuery.data, state.selectedSkillId]);

  const selectedBenchmark = useMemo(() => {
    return skillLabBenchmarks.find((benchmark) => benchmark.id === state.selectedBenchmarkId) ?? null;
  }, [skillLabBenchmarks, state.selectedBenchmarkId]);

  useEffect(() => {
    if (!selectedBenchmark) return;
    const keys = Object.keys(selectedBenchmark.customVariants ?? {});
    if (keys.length < 2) return;
    setState((prev) => ({
      ...prev,
      compareA: prev.compareA && keys.includes(prev.compareA) ? prev.compareA : keys[0] ?? "",
      compareB: prev.compareB && keys.includes(prev.compareB) ? prev.compareB : keys[1] ?? "",
    }));
  }, [selectedBenchmark]);

  const saveVariant = () => {
    const name = state.variantName.trim();
    if (!name) {
      pushToast({ title: "Variant name required", tone: "error" });
      return;
    }
    const snapshot = buildSnapshot();
    setState((prev) => ({
      ...prev,
      savedVariants: {
        ...prev.savedVariants,
        [name]: snapshot,
      },
    }));
    pushToast({ title: `Variant \"${name}\" saved` });
  };

  const launchMutation = useMutation({
    mutationFn: async () => {
      const live = bundleQuery.data;
      const customVariants: CustomVariants = {};
      if (live) {
        customVariants[`${live.name}_live`] = {
          type: "skill_snapshot",
          label: `${live.name} (live)`,
          snapshot: live,
        };
      }
      if (state.includeWithoutSkill) {
        customVariants["without_skill"] = { type: "no_skill" };
      }
      const savedEntries = Object.entries(state.savedVariants);
      if (savedEntries.length === 0) {
        throw new Error("Please create and save at least one variant first.");
      }
      for (const [key, snapshot] of savedEntries) {
        customVariants[key] = {
          type: "custom_draft",
          label: key,
          snapshot,
        };
      }

      return skillEvalsApi.launchSkillLabBenchmark(companyId, {
        suiteId: state.selectedSuiteId!,
        agentId: state.selectedAgentId!,
        skillId: state.selectedSkillId!,
        mode: "skill_lab",
        customVariants,
        trialsPerCase: state.trialsPerCase,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.skillEvals.benchmarks(companyId) });
      pushToast({ title: "Skill lab benchmark launched" });
    },
    onError: (error) => {
      pushToast({ title: error instanceof Error ? error.message : "Failed to launch benchmark", tone: "error" });
    },
  });

  const promoteMutation = useMutation({
    mutationFn: (input: { benchmarkId: string; winningVariantKey: string }) =>
      skillEvalsApi.promoteVariant(companyId, {
        benchmarkId: input.benchmarkId,
        winningVariantKey: input.winningVariantKey,
      }),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.companySkills.list(companyId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.skillEvals.benchmarks(companyId) });
      pushToast({ title: `Promoted variant ${result.promotedVariant}` });
    },
    onError: (error) => {
      pushToast({ title: error instanceof Error ? error.message : "Failed to promote", tone: "error" });
    },
  });

  const selectedCustomVariants = selectedBenchmark?.customVariants ?? {};
  const summary = (selectedBenchmark?.summary ?? null) as SkillEvalBenchmarkSummary | null;
  const compareASnapshot = asSnapshotVariant(state.compareA ? selectedCustomVariants[state.compareA] : undefined);
  const compareBSnapshot = asSnapshotVariant(state.compareB ? selectedCustomVariants[state.compareB] : undefined);

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Skill Lab</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs text-muted-foreground">Skill</label>
            <Select
              value={state.selectedSkillId ?? ""}
              onValueChange={(value) => setState((prev) => ({ ...prev, selectedSkillId: value, draftFiles: {} }))}
            >
              <SelectTrigger><SelectValue placeholder="Select skill" /></SelectTrigger>
              <SelectContent>
                {(skillsQuery.data ?? []).map((skill) => (
                  <SelectItem key={skill.id} value={skill.id}>{skill.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs text-muted-foreground">Suite</label>
            <Select
              value={state.selectedSuiteId ?? ""}
              onValueChange={(value) => setState((prev) => ({ ...prev, selectedSuiteId: value }))}
            >
              <SelectTrigger><SelectValue placeholder="Select suite" /></SelectTrigger>
              <SelectContent>
                {(suitesQuery.data ?? []).map((suite) => (
                  <SelectItem key={suite.id} value={suite.id}>{suite.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs text-muted-foreground">Agent</label>
            <Select
              value={state.selectedAgentId ?? ""}
              onValueChange={(value) => setState((prev) => ({ ...prev, selectedAgentId: value }))}
            >
              <SelectTrigger><SelectValue placeholder="Select agent" /></SelectTrigger>
              <SelectContent>
                {(agentsQuery.data ?? []).map((agent) => (
                  <SelectItem key={agent.id} value={agent.id}>{agent.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs text-muted-foreground">Trials per case</label>
            <Input
              type="number"
              min={1}
              max={10}
              value={state.trialsPerCase}
              onChange={(event) => setState((prev) => ({ ...prev, trialsPerCase: Number(event.target.value || 3) }))}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={state.includeWithoutSkill}
            onCheckedChange={(value) => setState((prev) => ({ ...prev, includeWithoutSkill: Boolean(value) }))}
          />
          <span className="text-sm text-muted-foreground">Include without_skill baseline</span>
        </div>
        <div className="text-xs text-muted-foreground">Variants: {variantsPreview.join(", ")}</div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Create Variant</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 md:flex-row md:items-end">
          <div className="flex-1">
            <label className="text-xs text-muted-foreground">Variant key</label>
            <Input
              value={state.variantName}
              onChange={(event) => setState((prev) => ({ ...prev, variantName: event.target.value }))}
              placeholder="e.g. intake-v2"
            />
          </div>
          <Button onClick={saveVariant}>Create & Save Variant</Button>
        </CardContent>
      </Card>

      <div className="grid gap-3 md:grid-cols-[260px_1fr]">
        <SkillFileTree
          files={state.draftFiles}
          activeFile={state.activeFile}
          onSelectFile={(path) => setState((prev) => ({ ...prev, activeFile: path }))}
          onAddFile={(path) => setState((prev) => ({
            ...prev,
            activeFile: path,
            draftFiles: {
              ...prev.draftFiles,
              [path]: { path, content: "", modified: true },
            },
          }))}
          onDeleteFile={(path) => setState((prev) => {
            const next = { ...prev.draftFiles };
            delete next[path];
            return { ...prev, draftFiles: next, activeFile: "SKILL.md" };
          })}
        />

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{state.activeFile || "SKILL.md"}</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={activeContent}
              onChange={(event) => updateFile(state.activeFile || "SKILL.md", event.target.value)}
              className="min-h-[420px] font-mono text-xs"
              placeholder={state.activeFile === "SKILL.md" ? SKILL_TEMPLATE_FALLBACK : ""}
            />
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={() => launchMutation.mutate()}
          disabled={
            launchMutation.isPending ||
            !state.selectedSkillId ||
            !state.selectedSuiteId ||
            !state.selectedAgentId
          }
        >
          {launchMutation.isPending ? "Launching..." : "Launch A/B Test"}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Results & Promote</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="grid gap-3 md:grid-cols-3">
            <div>
              <label className="text-xs text-muted-foreground">Benchmark</label>
              <Select
                value={state.selectedBenchmarkId ?? ""}
                onValueChange={(value) => setState((prev) => ({ ...prev, selectedBenchmarkId: value }))}
              >
                <SelectTrigger><SelectValue placeholder="Select benchmark" /></SelectTrigger>
                <SelectContent>
                  {skillLabBenchmarks.map((benchmark) => (
                    <SelectItem key={benchmark.id} value={benchmark.id}>{benchmark.id.slice(0, 8)} - {benchmark.status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Variant A</label>
              <Select value={state.compareA} onValueChange={(value) => setState((prev) => ({ ...prev, compareA: value }))}>
                <SelectTrigger><SelectValue placeholder="Variant A" /></SelectTrigger>
                <SelectContent>
                  {Object.keys(selectedCustomVariants).map((key) => (
                    <SelectItem key={key} value={key}>{key}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Variant B</label>
              <Select value={state.compareB} onValueChange={(value) => setState((prev) => ({ ...prev, compareB: value }))}>
                <SelectTrigger><SelectValue placeholder="Variant B" /></SelectTrigger>
                <SelectContent>
                  {Object.keys(selectedCustomVariants).map((key) => (
                    <SelectItem key={key} value={key}>{key}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedBenchmark && compareASnapshot && compareBSnapshot ? (
            <SkillDiffViewer
              variantA={{
                key: state.compareA,
                snapshot: compareASnapshot,
                summary: summary?.perVariant?.[state.compareA],
              }}
              variantB={{
                key: state.compareB,
                snapshot: compareBSnapshot,
                summary: summary?.perVariant?.[state.compareB],
              }}
              onPromote={(variantKey) => {
                if (!selectedBenchmark) return;
                promoteMutation.mutate({ benchmarkId: selectedBenchmark.id, winningVariantKey: variantKey });
              }}
            />
          ) : (
            <div className="text-xs text-muted-foreground">
              Pick a completed skill-lab benchmark and two snapshot variants to compare.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
