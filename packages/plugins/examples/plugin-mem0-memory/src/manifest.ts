import type { PaperclipPluginManifestV1 } from "@paperclipai/plugin-sdk";
import { DEFAULT_CONFIG, PLUGIN_ID, PLUGIN_VERSION, TOOL_NAMES } from "./constants.js";

const manifest: PaperclipPluginManifestV1 = {
  id: PLUGIN_ID,
  apiVersion: 1,
  version: PLUGIN_VERSION,
  displayName: "Mem0 Memory",
  description:
    "Provides long-term memory for agents via the Mem0 platform. Agents can search, store, and forget facts that persist across runs and tickets.",
  author: "Paperclip",
  categories: ["automation", "connector"],
  capabilities: [
    "http.outbound",
    "secrets.read-ref",
    "plugin.state.read",
    "plugin.state.write",
    "events.subscribe",
    "activity.log.write",
    "metrics.write",
    "agent.tools.register",
    "companies.read",
    "agents.read",
  ],
  entrypoints: {
    worker: "./dist/worker.js",
  },
  instanceConfigSchema: {
    type: "object",
    properties: {
      apiBaseUrl: {
        type: "string",
        title: "Mem0 API Base URL",
        description:
          "Base URL for the Mem0 API. Use the default for the hosted platform, or provide your self-hosted URL.",
        default: DEFAULT_CONFIG.apiBaseUrl,
      },
      secretRef: {
        type: "string",
        title: "API Key Secret Reference",
        description:
          "Name of the Paperclip secret containing your Mem0 API key.",
        default: DEFAULT_CONFIG.secretRef,
      },
      defaultTopK: {
        type: "number",
        title: "Default Search Results",
        description:
          "How many memory snippets to return for each search query.",
        default: DEFAULT_CONFIG.defaultTopK,
      },
      autoCapture: {
        type: "boolean",
        title: "Auto-capture Run Summaries",
        description:
          "Automatically write a memory note after each agent run completes.",
        default: DEFAULT_CONFIG.autoCapture,
      },
    },
  },
  tools: [
    {
      name: TOOL_NAMES.memorySearch,
      displayName: "Memory Search",
      description:
        "Search long-term memory for facts, decisions, or context from past work. Use when the current ticket references prior projects, people, or decisions you don't have in your immediate context.",
      parametersSchema: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description:
              "Natural language query describing what you need to remember.",
          },
          limit: {
            type: "number",
            description: "Max number of results to return (default: 5).",
          },
        },
        required: ["query"],
      },
    },
    {
      name: TOOL_NAMES.memoryNote,
      displayName: "Memory Note",
      description:
        "Store a durable fact, decision, or preference in long-term memory so it survives beyond this run. Use when you learn something important that future work should know about.",
      parametersSchema: {
        type: "object",
        properties: {
          content: {
            type: "string",
            description:
              "The fact, decision, or note to remember. Write as a clear, self-contained statement.",
          },
          metadata: {
            type: "object",
            description:
              "Optional key-value metadata to attach (e.g. project name, date, category).",
          },
        },
        required: ["content"],
      },
    },
    {
      name: TOOL_NAMES.memoryForget,
      displayName: "Memory Forget",
      description:
        "Delete a specific memory by ID. Use when a user explicitly says prior context is wrong or outdated.",
      parametersSchema: {
        type: "object",
        properties: {
          memoryId: {
            type: "string",
            description: "The ID of the memory to delete.",
          },
        },
        required: ["memoryId"],
      },
    },
  ],
};

export default manifest;
