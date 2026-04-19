/**
 * @fileoverview Mem0 memory hydration service for Paperclip heartbeat runs.
 *
 * This module provides automatic memory retrieval from Mem0 and injects
 * relevant context into the agent's prompt before each heartbeat run.
 *
 * Architecture:
 * - Reads the Mem0 API key from the company's secret store (by name: MEM0_API_KEY)
 * - Queries Mem0's search API using the issue title/description as the query
 * - Returns a formatted markdown block that gets injected into the agent's context
 * - Falls back silently if no API key is configured or if the Mem0 API is unreachable
 *
 * @module server/services/mem0-memory
 */

import type { Db } from "@paperclipai/db";
import { logger } from "../middleware/logger.js";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MEM0_SECRET_NAME = "MEM0_API_KEY";
const MEM0_API_BASE = "https://api.mem0.ai";
const MEM0_DEFAULT_TOP_K = 5;
const MEM0_TIMEOUT_MS = 8_000;
const MEM0_MAX_QUERY_LENGTH = 500;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Mem0Memory {
  id: string;
  memory: string;
  hash?: string;
  score?: number;
  metadata?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

interface MemoryHydrationContext {
  companyId: string;
  agentId: string;
  issueTitle?: string | null;
  issueDescription?: string | null;
  wakeReason?: string | null;
}

// ---------------------------------------------------------------------------
// Secret resolution
// ---------------------------------------------------------------------------

/**
 * Try to resolve the Mem0 API key from the company's secret store.
 * Returns null if not configured (non-fatal).
 */
async function resolveMem0ApiKey(
  db: Db,
  companyId: string,
): Promise<string | null> {
  try {
    // Lazy-import to avoid circular deps
    const { secretService } = await import("./secrets.js");
    const secretsSvc = secretService(db);
    const secret = await secretsSvc.getByName(companyId, MEM0_SECRET_NAME);
    if (!secret) return null;
    return secretsSvc.resolveSecretValue(companyId, secret.id, "latest");
  } catch (err) {
    logger.debug(
      { companyId, error: err instanceof Error ? err.message : String(err) },
      "mem0: could not resolve API key",
    );
    return null;
  }
}

// ---------------------------------------------------------------------------
// Mem0 API Client
// ---------------------------------------------------------------------------

async function mem0Search(
  apiKey: string,
  query: string,
  userId: string,
  limit: number,
  apiBase: string = MEM0_API_BASE,
): Promise<Mem0Memory[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), MEM0_TIMEOUT_MS);

  try {
    const response = await fetch(`${apiBase}/v1/memories/search/`, {
      method: "POST",
      headers: {
        Authorization: `Token ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        user_id: userId,
        limit,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      logger.warn(
        { status: response.status, body: body.slice(0, 200) },
        "mem0: search API returned error",
      );
      return [];
    }

    const data = await response.json();
    // The Mem0 API returns either { results: [...] } or a bare array
    if (Array.isArray(data)) return data;
    return (data as { results?: Mem0Memory[] }).results ?? [];
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      logger.warn({ query: query.slice(0, 80), userId }, "mem0: search timed out");
    } else {
      logger.warn(
        { error: err instanceof Error ? err.message : String(err) },
        "mem0: search failed",
      );
    }
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

async function mem0Add(
  apiKey: string,
  content: string,
  userId: string,
  metadata?: Record<string, unknown>,
  apiBase: string = MEM0_API_BASE,
): Promise<boolean> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), MEM0_TIMEOUT_MS);

  try {
    const response = await fetch(`${apiBase}/v1/memories/`, {
      method: "POST",
      headers: {
        Authorization: `Token ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [{ role: "user", content }],
        user_id: userId,
        metadata: {
          source: "paperclip",
          ...metadata,
        },
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      logger.warn({ status: response.status }, "mem0: add API returned error");
      return false;
    }
    return true;
  } catch (err) {
    logger.warn(
      { error: err instanceof Error ? err.message : String(err) },
      "mem0: add failed",
    );
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

// ---------------------------------------------------------------------------
// Connection Test
// ---------------------------------------------------------------------------

export interface Mem0ConnectionTestResult {
  connected: boolean;
  hasApiKey: boolean;
  apiKeySource: string;
  latencyMs: number | null;
  error: string | null;
  memoriesFound: number | null;
}

/**
 * Test the Mem0 connection for a given company.
 * Checks: (1) API key exists, (2) API is reachable, (3) search works.
 */
export async function testMem0Connection(
  db: Db,
  companyId: string,
): Promise<Mem0ConnectionTestResult> {
  const apiKey = await resolveMem0ApiKey(db, companyId);
  if (!apiKey) {
    return {
      connected: false,
      hasApiKey: false,
      apiKeySource: MEM0_SECRET_NAME,
      latencyMs: null,
      error: `No secret named "${MEM0_SECRET_NAME}" found for this company. Create one in Settings → Secrets.`,
      memoriesFound: null,
    };
  }

  const started = Date.now();
  try {
    const results = await mem0Search(apiKey, "connection test", `paperclip:${companyId}:test`, 1);
    const latencyMs = Date.now() - started;
    return {
      connected: true,
      hasApiKey: true,
      apiKeySource: MEM0_SECRET_NAME,
      latencyMs,
      error: null,
      memoriesFound: results.length,
    };
  } catch (err) {
    return {
      connected: false,
      hasApiKey: true,
      apiKeySource: MEM0_SECRET_NAME,
      latencyMs: Date.now() - started,
      error: err instanceof Error ? err.message : String(err),
      memoriesFound: null,
    };
  }
}

// ---------------------------------------------------------------------------
// Memory Hydration (for heartbeat injection)
// ---------------------------------------------------------------------------

function buildMem0UserId(companyId: string, agentId: string): string {
  return `paperclip:${companyId}:${agentId}`;
}

function buildSearchQuery(ctx: MemoryHydrationContext): string {
  const parts: string[] = [];
  if (ctx.issueTitle) parts.push(ctx.issueTitle);
  if (ctx.wakeReason && ctx.wakeReason !== "scheduled") parts.push(ctx.wakeReason);
  if (ctx.issueDescription) {
    // Take only the first portion of the description to form the query
    parts.push(ctx.issueDescription.slice(0, 200));
  }
  const query = parts.join(" — ").trim();
  if (!query) return "";
  return query.length > MEM0_MAX_QUERY_LENGTH
    ? query.slice(0, MEM0_MAX_QUERY_LENGTH)
    : query;
}

/**
 * Render memories into a markdown block for injection into the agent prompt.
 */
function renderMemoryBlock(memories: Mem0Memory[]): string {
  if (memories.length === 0) return "";

  const lines = [
    "## Long-Term Memory (from Mem0)",
    "",
    "The following facts were automatically retrieved from your long-term memory store.",
    "Use these to inform your current work. They were stored during previous tasks.",
    "",
  ];

  for (const [i, m] of memories.entries()) {
    const score = m.score != null ? ` (relevance: ${(m.score * 100).toFixed(0)}%)` : "";
    const age = m.created_at
      ? ` — stored ${m.created_at}`
      : "";
    lines.push(`${i + 1}. ${m.memory}${score}${age}`);
  }

  lines.push("");
  lines.push(
    "If any of these memories are outdated, use the `memory_forget` tool to remove them.",
  );
  lines.push(
    "If you learn important new facts during this run, use `memory_note` to store them.",
  );

  return lines.join("\n");
}

/**
 * Hydrate agent memory from Mem0 for a heartbeat run.
 *
 * This is the main entry point called by heartbeat.ts before assembling the
 * runtime config. It:
 * 1. Resolves the MEM0_API_KEY from company secrets
 * 2. Builds a search query from the issue title + description
 * 3. Queries Mem0 for relevant memories
 * 4. Returns a formatted markdown block for injection
 *
 * Returns null if: no API key configured, no issue context, or API call fails.
 * This is always non-fatal — the agent runs normally without memories if anything fails.
 */
export async function hydrateMemoryForRun(
  db: Db,
  ctx: MemoryHydrationContext,
): Promise<string | null> {
  const apiKey = await resolveMem0ApiKey(db, ctx.companyId);
  if (!apiKey) {
    logger.debug({ companyId: ctx.companyId }, "mem0: no API key configured, skipping memory hydration");
    return null;
  }

  const query = buildSearchQuery(ctx);
  if (!query) {
    logger.debug(
      { companyId: ctx.companyId, agentId: ctx.agentId },
      "mem0: no useful query from context, skipping",
    );
    return null;
  }

  const userId = buildMem0UserId(ctx.companyId, ctx.agentId);
  const started = Date.now();
  const memories = await mem0Search(apiKey, query, userId, MEM0_DEFAULT_TOP_K);
  const durationMs = Date.now() - started;

  logger.info(
    { companyId: ctx.companyId, agentId: ctx.agentId, queryLength: query.length, memoriesFound: memories.length, durationMs },
    "mem0: memory hydration complete",
  );

  if (memories.length === 0) return null;
  return renderMemoryBlock(memories);
}

/**
 * Auto-capture a run summary into Mem0 after a heartbeat completes.
 *
 * Called by heartbeat.ts after a run produces a summary.
 * Non-fatal — silently skips if API key not configured or API fails.
 */
export async function captureRunSummary(
  db: Db,
  ctx: {
    companyId: string;
    agentId: string;
    runId: string;
    summary: string;
    issueTitle?: string | null;
  },
): Promise<void> {
  if (!ctx.summary.trim()) return;

  const apiKey = await resolveMem0ApiKey(db, ctx.companyId);
  if (!apiKey) return;

  const userId = buildMem0UserId(ctx.companyId, ctx.agentId);
  const content = ctx.issueTitle
    ? `[Issue: ${ctx.issueTitle}] ${ctx.summary}`
    : ctx.summary;

  const success = await mem0Add(apiKey, content, userId, {
    runId: ctx.runId,
    agentId: ctx.agentId,
    autoCapture: true,
  });

  if (success) {
    logger.info(
      { companyId: ctx.companyId, agentId: ctx.agentId, runId: ctx.runId },
      "mem0: auto-captured run summary",
    );
  }
}
