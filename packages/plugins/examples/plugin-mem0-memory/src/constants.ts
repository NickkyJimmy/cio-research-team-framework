// Plugin constants
export const PLUGIN_ID = "mem0-memory";
export const PLUGIN_VERSION = "0.1.0";

// Mem0 API defaults
export const MEM0_API_BASE = "https://api.mem0.ai";
export const MEM0_DEFAULT_TOP_K = 5;

// Tool names exposed to agents
export const TOOL_NAMES = {
  memorySearch: "memory_search",
  memoryNote: "memory_note",
  memoryForget: "memory_forget",
} as const;

// Secret reference keys
export const SECRET_REFS = {
  apiKey: "MEM0_API_KEY",
} as const;

// Default config values
export const DEFAULT_CONFIG = {
  apiBaseUrl: MEM0_API_BASE,
  defaultTopK: MEM0_DEFAULT_TOP_K,
  autoCapture: false,
  autoCaptureEvents: ["agent.run.finished"] as string[],
  secretRef: SECRET_REFS.apiKey,
};
