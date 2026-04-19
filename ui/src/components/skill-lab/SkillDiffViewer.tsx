import type { SkillSnapshot } from "@paperclipai/shared";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type VariantSummaryLike = {
  passRate?: number;
  avgTokens?: { totalTokens?: number } | null;
  avgLatencyMs?: number | null;
  avgCostCents?: number | null;
};

interface SkillDiffViewerProps {
  variantA: { key: string; snapshot: SkillSnapshot; summary?: VariantSummaryLike };
  variantB: { key: string; snapshot: SkillSnapshot; summary?: VariantSummaryLike };
  onPromote: (variantKey: string) => void;
}

function delta(a: number, b: number) {
  const d = b - a;
  const sign = d > 0 ? "+" : "";
  return `${sign}${d.toFixed(2)}`;
}

export function SkillDiffViewer({ variantA, variantB, onPromote }: SkillDiffViewerProps) {
  const passA = variantA.summary?.passRate ?? 0;
  const passB = variantB.summary?.passRate ?? 0;
  const tokensA = variantA.summary?.avgTokens?.totalTokens ?? 0;
  const tokensB = variantB.summary?.avgTokens?.totalTokens ?? 0;
  const latencyA = variantA.summary?.avgLatencyMs ?? 0;
  const latencyB = variantB.summary?.avgLatencyMs ?? 0;
  const costA = variantA.summary?.avgCostCents ?? 0;
  const costB = variantB.summary?.avgCostCents ?? 0;

  return (
    <div className="flex flex-col gap-3">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Performance Comparison</CardTitle>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div>Pass rate: {(passA * 100).toFixed(1)}% {"->"} {(passB * 100).toFixed(1)}% ({delta(passA * 100, passB * 100)}%)</div>
          <div>Tokens: {tokensA} {"->"} {tokensB} ({delta(tokensA, tokensB)})</div>
          <div>Latency: {latencyA}ms {"->"} {latencyB}ms ({delta(latencyA, latencyB)}ms)</div>
          <div>Cost: {costA}c {"->"} {costB}c ({delta(costA, costB)}c)</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">SKILL.md Diff (A vs B)</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs whitespace-pre-wrap rounded bg-muted/40 p-3">
{variantA.snapshot.skillMd === variantB.snapshot.skillMd
  ? "No changes"
  : `--- ${variantA.key}\n+++ ${variantB.key}\n\n${variantB.snapshot.skillMd}`}
          </pre>
        </CardContent>
      </Card>

      {passB > passA ? (
        <div className="flex items-center justify-end">
          <Button onClick={() => onPromote(variantB.key)}>Promote "{variantB.key}" to Live</Button>
        </div>
      ) : null}
    </div>
  );
}
