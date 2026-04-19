import {
  definePlugin,
  runWorker,
  type PluginContext,
  type ToolResult,
  type ToolRunContext,
} from "@paperclipai/plugin-sdk";
import {
  DEFAULT_CONFIG,
  PLUGIN_ID,
  TOOL_NAMES,
} from "./constants.js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Mem0Config = {
  apiBaseUrl?: string;
  secretRef?: string;
  defaultTopK?: number;
  autoCapture?: boolean;
};

interface Mem0Memory {
  id: string;
  memory: string;
  hash?: string;
  metadata?: Record<string, unknown>;
  score?: number;
  created_at?: string;
  updated_at?: string;
}

interface Mem0SearchResponse {
  results: Mem0Memory[];
}

interface Mem0AddResponse {
  results: Array<{
    id: string;
    memory: string;
    event: string;
  }>;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function getConfig(ctx: PluginContext): Promise<Mem0Config> {
  const raw = await ctx.config.get();
  return { ...DEFAULT_CONFIG, ...(raw as Mem0Config) };
}

async function resolveApiKey(ctx: PluginContext, config: Mem0Config): Promise<string> {
  const ref = config.secretRef || DEFAULT_CONFIG.secretRef;
  const key = await ctx.secrets.resolve(ref);
  if (!key) {
    throw new Error(
      `Mem0 API key not found. Configure a secret named "${ref}" in Paperclip Settings → Secrets.`
    );
  }
  return key;
}

/**
 * Build a stable Mem0 user_id from the Paperclip run context.
 * Format: `paperclip:<companyId>:<agentId>` — this scopes memories
 * so each agent in each company has its own memory namespace.
 */
function buildMem0UserId(runCtx: ToolRunContext): string {
  return `paperclip:${runCtx.companyId}:${runCtx.agentId}`;
}

/**
 * Build a Mem0 user_id from event context (for auto-capture).
 */
function buildMem0UserIdFromEvent(companyId: string, agentId: string): string {
  return `paperclip:${companyId}:${agentId}`;
}

// ---------------------------------------------------------------------------
// Mem0 API Client
// ---------------------------------------------------------------------------

async function mem0Search(
  ctx: PluginContext,
  config: Mem0Config,
  apiKey: string,
  query: string,
  userId: string,
  limit: number,
): Promise<Mem0Memory[]> {
  const url = `${config.apiBaseUrl || DEFAULT_CONFIG.apiBaseUrl}/v1/memories/search/`;
  const started = Date.now();

  const response = await ctx.http.fetch(url, {
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
  });

  const latencyMs = Date.now() - started;
  await ctx.metrics.write("mem0.query.latency_ms", latencyMs);
  await ctx.metrics.write("mem0.query.count", 1);

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "");
    throw new Error(`Mem0 search failed (${response.status}): ${errorBody}`);
  }

  const data = (await response.json()) as Mem0SearchResponse | Mem0Memory[];

  // The Mem0 API returns either { results: [...] } or a bare array
  if (Array.isArray(data)) return data;
  return data.results ?? [];
}

async function mem0Add(
  ctx: PluginContext,
  config: Mem0Config,
  apiKey: string,
  content: string,
  userId: string,
  metadata?: Record<string, unknown>,
): Promise<Mem0AddResponse> {
  const url = `${config.apiBaseUrl || DEFAULT_CONFIG.apiBaseUrl}/v1/memories/`;
  const started = Date.now();

  const response = await ctx.http.fetch(url, {
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
        plugin: PLUGIN_ID,
        ...metadata,
      },
    }),
  });

  const latencyMs = Date.now() - started;
  await ctx.metrics.write("mem0.write.latency_ms", latencyMs);
  await ctx.metrics.write("mem0.write.count", 1);

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "");
    throw new Error(`Mem0 add failed (${response.status}): ${errorBody}`);
  }

  return (await response.json()) as Mem0AddResponse;
}

async function mem0Delete(
  ctx: PluginContext,
  config: Mem0Config,
  apiKey: string,
  memoryId: string,
): Promise<void> {
  const url = `${config.apiBaseUrl || DEFAULT_CONFIG.apiBaseUrl}/v1/memories/${memoryId}/`;

  const response = await ctx.http.fetch(url, {
    method: "DELETE",
    headers: {
      Authorization: `Token ${apiKey}`,
      "Content-Type": "application/json",
    },
  });

  await ctx.metrics.write("mem0.delete.count", 1);

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "");
    throw new Error(`Mem0 delete failed (${response.status}): ${errorBody}`);
  }
}

// ---------------------------------------------------------------------------
// Plugin Definition
// ---------------------------------------------------------------------------

const plugin = definePlugin({
  async setup(ctx: PluginContext) {
    ctx.logger.info("Mem0 Memory plugin starting up", { pluginId: PLUGIN_ID });

    // ----- Agent Tool: memory_search -----
    ctx.tools.register(
      TOOL_NAMES.memorySearch,
      {
        displayName: "Memory Search",
        description:
          "Search long-term memory for facts, decisions, or context from past work.",
        parametersSchema: {
          type: "object",
          properties: {
            query: { type: "string" },
            limit: { type: "number" },
          },
          required: ["query"],
        },
      },
      async (params: unknown, runCtx: ToolRunContext): Promise<ToolResult> => {
        try {
          const p = params as Record<string, unknown>;
          const query = String(p.query ?? "");
          if (!query.trim()) {
            return { error: "query is required" };
          }

          const config = await getConfig(ctx);
          const apiKey = await resolveApiKey(ctx, config);
          const userId = buildMem0UserId(runCtx);
          const limit = typeof p.limit === "number" ? p.limit : config.defaultTopK ?? 5;

          const memories = await mem0Search(ctx, config, apiKey, query, userId, limit);

          if (memories.length === 0) {
            return {
              content: "No relevant memories found for this query.",
              data: { results: [], count: 0 },
            };
          }

          // Format memories into a readable block for the agent
          const formatted = memories
            .map((m, i) => {
              const score = m.score != null ? ` (relevance: ${(m.score * 100).toFixed(0)}%)` : "";
              const meta = m.metadata
                ? `\n   metadata: ${JSON.stringify(m.metadata)}`
                : "";
              return `${i + 1}. [${m.id}]${score}\n   ${m.memory}${meta}`;
            })
            .join("\n\n");

          return {
            content: `Found ${memories.length} relevant memories:\n\n${formatted}`,
            data: { results: memories, count: memories.length },
          };
        } catch (err) {
          ctx.logger.error("memory_search failed", {
            error: err instanceof Error ? err.message : String(err),
          });
          return { error: err instanceof Error ? err.message : String(err) };
        }
      },
    );

    // ----- Agent Tool: memory_note -----
    ctx.tools.register(
      TOOL_NAMES.memoryNote,
      {
        displayName: "Memory Note",
        description:
          "Store a durable fact, decision, or preference in long-term memory.",
        parametersSchema: {
          type: "object",
          properties: {
            content: { type: "string" },
            metadata: { type: "object" },
          },
          required: ["content"],
        },
      },
      async (params: unknown, runCtx: ToolRunContext): Promise<ToolResult> => {
        try {
          const p = params as Record<string, unknown>;
          const content = String(p.content ?? "");
          if (!content.trim()) {
            return { error: "content is required" };
          }

          const config = await getConfig(ctx);
          const apiKey = await resolveApiKey(ctx, config);
          const userId = buildMem0UserId(runCtx);
          const metadata = (p.metadata as Record<string, unknown>) ?? {};

          const result = await mem0Add(ctx, config, apiKey, content, userId, {
            ...metadata,
            agentId: runCtx.agentId,
            runId: runCtx.runId,
            projectId: runCtx.projectId,
          });

          await ctx.activity.log({
            companyId: runCtx.companyId,
            entityType: "agent",
            entityId: runCtx.agentId,
            message: `Agent stored a memory note via Mem0: "${content.slice(0, 100)}${content.length > 100 ? "…" : ""}"`,
            metadata: { plugin: PLUGIN_ID, memoryCount: result.results?.length },
          });

          return {
            content: `Memory stored successfully. ${result.results?.length ?? 0} memory record(s) created.`,
            data: result,
          };
        } catch (err) {
          ctx.logger.error("memory_note failed", {
            error: err instanceof Error ? err.message : String(err),
          });
          return { error: err instanceof Error ? err.message : String(err) };
        }
      },
    );

    // ----- Agent Tool: memory_forget -----
    ctx.tools.register(
      TOOL_NAMES.memoryForget,
      {
        displayName: "Memory Forget",
        description: "Delete a specific memory by ID.",
        parametersSchema: {
          type: "object",
          properties: {
            memoryId: { type: "string" },
          },
          required: ["memoryId"],
        },
      },
      async (params: unknown, runCtx: ToolRunContext): Promise<ToolResult> => {
        try {
          const p = params as Record<string, unknown>;
          const memoryId = String(p.memoryId ?? "");
          if (!memoryId.trim()) {
            return { error: "memoryId is required" };
          }

          const config = await getConfig(ctx);
          const apiKey = await resolveApiKey(ctx, config);

          await mem0Delete(ctx, config, apiKey, memoryId);

          await ctx.activity.log({
            companyId: runCtx.companyId,
            entityType: "agent",
            entityId: runCtx.agentId,
            message: `Agent deleted memory ${memoryId} via Mem0.`,
            metadata: { plugin: PLUGIN_ID, memoryId },
          });

          return {
            content: `Memory ${memoryId} has been deleted.`,
            data: { deleted: memoryId },
          };
        } catch (err) {
          ctx.logger.error("memory_forget failed", {
            error: err instanceof Error ? err.message : String(err),
          });
          return { error: err instanceof Error ? err.message : String(err) };
        }
      },
    );

    // ----- Auto-capture: Post-run memory ingestion -----
    ctx.events.on("agent.run.finished", async (event) => {
      try {
        const config = await getConfig(ctx);
        if (!config.autoCapture) return;

        const payload = event.payload as Record<string, unknown>;
        const agentId = (payload.agentId ?? event.actorId ?? "") as string;
        const companyId = event.companyId;
        const runId = (payload.runId ?? "") as string;
        const summary = (payload.summary ?? payload.output ?? "") as string;

        if (!summary.trim() || !agentId) return;

        const apiKey = await resolveApiKey(ctx, config);
        const userId = buildMem0UserIdFromEvent(companyId, agentId);

        await mem0Add(ctx, config, apiKey, summary, userId, {
          autoCapture: true,
          runId,
          agentId,
        });

        ctx.logger.info("Auto-captured run summary to Mem0", {
          companyId,
          agentId,
          runId,
        });
      } catch (err) {
        ctx.logger.warn("Auto-capture failed (non-fatal)", {
          error: err instanceof Error ? err.message : String(err),
        });
      }
    });

    ctx.logger.info("Mem0 Memory plugin setup complete", {
      tools: Object.values(TOOL_NAMES),
    });
  },
});

// Entry point
runWorker(plugin, import.meta.url);
