import { z } from 'zod';
import type { AgentSubagentsConfig } from './types/agents';
import type { TModelSpecPreset } from './schemas';
import {
  EModelEndpoint,
  tModelSpecPresetSchema,
  eModelEndpointSchema,
  AuthType,
  authTypeSchema,
} from './schemas';
import { getMaxSubagents } from './limits';

type ModelSpecSubagentsConfig = Omit<AgentSubagentsConfig, 'graphs'>;

export type TModelSpec = {
  name: string;
  label: string;
  preset: TModelSpecPreset;
  order?: number;
  default?: boolean;
  softDefault?: boolean;
  description?: string;
  /**
   * Optional group name for organizing specs in the UI selector.
   * - If it matches an endpoint name (e.g., "openAI", "groq"), the spec appears nested under that endpoint
   * - If it's a custom name (doesn't match any endpoint), it creates a separate collapsible group
   * - If omitted, the spec appears as a standalone item at the top level
   */
  group?: string;
  /**
   * Optional icon URL for the group this spec belongs to.
   * Only needs to be set on one spec per group - the first one found with a groupIcon will be used.
   * Can be a URL or an endpoint name to use its icon.
   */
  groupIcon?: string | EModelEndpoint;
  showIconInMenu?: boolean;
  showIconInHeader?: boolean;
  /** Show this spec's label and description on the chat landing in place of the greeting. */
  showOnLanding?: boolean;
  /** Conversation starter prompts shown on the chat landing while this spec is active. */
  conversation_starters?: string[];
  /**
   * When false, the spec is omitted from the model selector menu and from the
   * client startup config, but remains usable when invoked explicitly by name
   * via the `spec` field (server-side resolution uses the full, unfiltered list).
   * Unlike `showIconInMenu` (which only hides the icon), this hides the whole entry.
   * Defaults to true (listed).
   */
  showInMenu?: boolean;
  iconURL?: string | EModelEndpoint; // Allow using project-included icons
  authType?: AuthType;
  /** Hide the chat input tool badge row while this model spec is active. */
  hideBadgeRow?: boolean;
  webSearch?: boolean;
  fileSearch?: boolean;
  executeCode?: boolean;
  memory?: boolean;
  /** Equip the spec's ephemeral agent with the `ask_user_question` HITL tool. */
  askUserQuestion?: boolean;
  /**
   * Let the model dispatch tool calls in the background (poll results via
   * `check_background_task`). Code execution is background-NATIVE: when the
   * admin enables the `run_in_background` agent capability, an
   * `executeCode: true` spec backgrounds code with no flag here. `true` opts
   * in every other eligible tool; a string array opts in only the named
   * tools, matched against the spec's resolved tool ids (e.g.
   * `['slow_report_mcp_analytics']`; `execute_code` and `bash_tool` both
   * select the code pair). `false`, the empty list, or a list that omits the
   * code pair explicitly opts it back out. Requires the `run_in_background`
   * agent capability.
   */
  runInBackground?: boolean | string[];
  /**
   * Inject the `intent` label param so each call streams a live status label.
   * `true` opts in every eligible tool; a string array opts in only the named
   * tools, matched against the spec's resolved tool ids (e.g.
   * `['web_search', 'search_code_mcp_github']`). Requires the `tool_intents`
   * agent capability to be enabled by the admin.
   */
  describeIntent?: boolean | string[];
  artifacts?: string | boolean;
  mcpServers?: string[];
  skills?: boolean | string[];
  subagents?: ModelSpecSubagentsConfig;
  /** Turns the spec into an "automatic" entry: a classifier picks the spec that answers. */
  router?: TModelRouterConfig;
  /**
   * Set by the server in place of `router` when specs reach the client: the client then leaves
   * tool switches unset, so only a switch the user turned off reaches the router as `false`.
   */
  autoRouter?: boolean;
};

/** Tool keys the router may switch on: built-in tools or `mcp:<server>`. */
export const MODEL_ROUTER_BUILTIN_TOOLS = ['web_search', 'execute_code', 'file_search'] as const;
export const MODEL_ROUTER_MCP_PREFIX = 'mcp:';

export const tModelRouterSchema = z.object({
  /** Spec used whenever the classifier fails, times out, or is unsure. */
  fallback: z.string(),
  /** Spec name → description the classifier reads to tell candidates apart. */
  candidates: z.record(z.string(), z.string()),
  /** Tool key → when the tool is needed. Tools the user switched off are never re-enabled. */
  tools: z.record(z.string(), z.string()).optional(),
  instructions: z.string().optional(),
  model: z.string().default('jev-latest'),
  baseURL: z.string().default('https://api.typesafe.ai'),
  historyMessages: z.number().int().min(1).max(20).default(5),
  maxMessageChars: z.number().int().min(100).default(2000),
  timeoutMs: z.number().int().min(100).default(4000),
  minConfidence: z.number().min(0).max(1).default(0),
  toolThreshold: z.number().min(0).max(1).default(0.5),
});

export type TModelRouterConfig = z.infer<typeof tModelRouterSchema>;

export const modelSpecSubagentsSchema = z
  .object({
    enabled: z.boolean().optional(),
    allowSelf: z.boolean().optional(),
    shareFiles: z.boolean().optional(),
    agent_ids: z.array(z.string()).optional(),
  })
  .superRefine((subagents, ctx) => {
    const maxSubagents = getMaxSubagents();
    if ((subagents.agent_ids?.length ?? 0) > maxSubagents) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['agent_ids'],
        message: `agent_ids must contain at most ${maxSubagents} item(s)`,
      });
    }
  });

/**
 * The endpoint a spec targets. Only the agents endpoint can serve a preset that
 * names an `agent_id`, so an omitted `endpoint` is inferred rather than left
 * undefined — otherwise the spec matches no endpoint at all, the client sends
 * no endpoint when it is selected, and the request is rejected as a mismatch.
 *
 * Shared so the selector and the request pipeline resolve a spec identically.
 */
/**
 * Structural view of the fields endpoint resolution reads, so partial spec
 * shapes (e.g. `AppConfig['modelSpecs']`, which is deep-partial) qualify.
 */
type ModelSpecEndpointSource = {
  preset?: Pick<TModelSpecPreset, 'endpoint' | 'agent_id'> | null;
};

export function resolveModelSpecEndpoint(
  modelSpec: ModelSpecEndpointSource | undefined,
): string | undefined {
  const preset = modelSpec?.preset;
  if (preset?.endpoint != null) {
    return preset.endpoint;
  }
  /**
   * An explicit `endpoint: null` is a statement, not an omission — such specs
   * validated (and were skipped downstream) before inference existed, so
   * inferring here would silently activate them. Only an absent key infers,
   * and only from a non-empty `agent_id`: form-backed writers persist
   * untouched fields as `''`, which names no agent.
   */
  if (preset?.endpoint === null) {
    return undefined;
  }
  return preset?.agent_id ? EModelEndpoint.agents : undefined;
}

/**
 * Writes each spec's resolved endpoint back onto its preset so every consumer —
 * endpoint matching, the selector, access filters, startup presets, provider-key
 * reachability — reads a complete spec instead of re-deriving it. Apply once
 * where the effective config is assembled (YAML load and DB-override merge);
 * downstream code then needs no awareness of inference.
 *
 * Returns the original object, and the original spec objects, when nothing
 * needs filling in, so cached configs and memoized consumers see no new
 * identities.
 */
export function materializeModelSpecEndpoints<
  T extends { list?: ModelSpecEndpointSource[] } | null | undefined,
>(modelSpecs: T): T {
  const list = modelSpecs?.list;
  if (!list?.length) {
    return modelSpecs;
  }

  let changed = false;
  const materialized = list.map((spec) => {
    if (spec?.preset == null || spec.preset.endpoint != null) {
      return spec;
    }
    const endpoint = resolveModelSpecEndpoint(spec);
    if (endpoint == null) {
      return spec;
    }
    changed = true;
    return { ...spec, preset: { ...spec.preset, endpoint } };
  });

  if (!changed) {
    return modelSpecs;
  }
  return { ...modelSpecs, list: materialized } as T;
}

export const tModelSpecSchema = z.object({
  name: z.string(),
  label: z.string(),
  preset: tModelSpecPresetSchema,
  order: z.number().optional(),
  default: z.boolean().optional(),
  softDefault: z.boolean().optional(),
  description: z.string().optional(),
  group: z.string().optional(),
  groupIcon: z.union([z.string(), eModelEndpointSchema]).optional(),
  showIconInMenu: z.boolean().optional(),
  showIconInHeader: z.boolean().optional(),
  showOnLanding: z.boolean().optional(),
  conversation_starters: z.array(z.string()).optional(),
  showInMenu: z.boolean().optional(),
  iconURL: z.union([z.string(), eModelEndpointSchema]).optional(),
  authType: authTypeSchema.optional(),
  hideBadgeRow: z.boolean().optional(),
  webSearch: z.boolean().optional(),
  fileSearch: z.boolean().optional(),
  executeCode: z.boolean().optional(),
  memory: z.boolean().optional(),
  askUserQuestion: z.boolean().optional(),
  runInBackground: z.union([z.boolean(), z.array(z.string())]).optional(),
  describeIntent: z.union([z.boolean(), z.array(z.string())]).optional(),
  artifacts: z.union([z.string(), z.boolean()]).optional(),
  mcpServers: z.array(z.string()).optional(),
  skills: z.union([z.boolean(), z.array(z.string())]).optional(),
  subagents: modelSpecSubagentsSchema.optional(),
  router: tModelRouterSchema.optional(),
  autoRouter: z.boolean().optional(),
});

export const specsConfigSchema = z.object({
  enforce: z.boolean().default(false),
  prioritize: z.boolean().default(true),
  list: z.array(tModelSpecSchema).default([]),
  addedEndpoints: z.array(z.union([z.string(), eModelEndpointSchema])).optional(),
});

export type TSpecsConfig = z.infer<typeof specsConfigSchema>;
