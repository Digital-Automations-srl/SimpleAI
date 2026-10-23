import { EModelEndpoint, MODEL_ROUTER_MCP_PREFIX } from 'librechat-data-provider';
import type { TEphemeralAgent, TModelRouterConfig, TModelSpec } from 'librechat-data-provider';

type BuiltinToolKey = 'web_search' | 'execute_code' | 'file_search';

const BUILTIN_TOOL_KEYS = new Set<string>(['web_search', 'execute_code', 'file_search']);
const KNOWN_ENDPOINTS = new Set<string>(Object.values(EModelEndpoint));

export interface ModelRouterBody {
  spec?: string | null;
  endpoint?: string;
  endpointType?: string;
  model?: string;
  ephemeralAgent?: TEphemeralAgent | null;
}

/** The conversation keeps pointing at the automatic spec, so the next turn is routed too. */
export interface RouterConversationFields {
  spec: string;
  endpoint?: string;
  endpointType?: string;
  model?: string;
}

/** A spec on a `librechat.yaml` custom endpoint needs the `custom` type the client would send. */
function resolveEndpointType(spec: TModelSpec): string | undefined {
  const { endpoint, endpointType } = spec.preset;
  if (endpointType != null) {
    return endpointType;
  }
  return endpoint != null && !KNOWN_ENDPOINTS.has(endpoint) ? EModelEndpoint.custom : undefined;
}

function isBuiltinToolKey(key: string): key is BuiltinToolKey {
  return BUILTIN_TOOL_KEYS.has(key);
}

function mcpServerName(key: string): string | undefined {
  return key.startsWith(MODEL_ROUTER_MCP_PREFIX)
    ? key.slice(MODEL_ROUTER_MCP_PREFIX.length)
    : undefined;
}

/**
 * Configured tools the classifier may still decide on. A built-in tool the user set to
 * `false` is a deliberate switch-off and is never asked about; one already on needs no
 * question. MCP servers carry no switched-off state, so only already-selected ones are skipped.
 */
export function getRoutableTools(
  config: TModelRouterConfig,
  ephemeralAgent?: TEphemeralAgent | null,
): string[] {
  const selectedServers = new Set(ephemeralAgent?.mcp ?? []);
  return Object.keys(config.tools ?? {}).filter((key) => {
    if (isBuiltinToolKey(key)) {
      return ephemeralAgent?.[key] === undefined;
    }
    const server = mcpServerName(key);
    return server != null && server !== '' && !selectedServers.has(server);
  });
}

function withTools(
  ephemeralAgent: TEphemeralAgent | null | undefined,
  tools: string[],
): TEphemeralAgent {
  const servers = tools.map(mcpServerName).filter((name): name is string => !!name);
  const builtins = Object.fromEntries(
    tools.filter(isBuiltinToolKey).map((key): [BuiltinToolKey, boolean] => [key, true]),
  );
  return {
    ...(ephemeralAgent ?? {}),
    ...builtins,
    ...(servers.length > 0 && { mcp: [...(ephemeralAgent?.mcp ?? []), ...servers] }),
  };
}

/** Rewrites the request as if the user had picked `target` and switched on `tools`. */
export function applyRouterDecision(
  body: ModelRouterBody,
  target: TModelSpec,
  tools: string[],
): void {
  body.spec = target.name;
  body.endpoint = target.preset.endpoint ?? undefined;
  body.model = target.preset.model ?? undefined;
  const endpointType = resolveEndpointType(target);
  if (endpointType != null) {
    body.endpointType = endpointType;
  } else {
    delete body.endpointType;
  }
  if (tools.length > 0) {
    body.ephemeralAgent = withTools(body.ephemeralAgent, tools);
  }
}

export function getRouterConversationFields(routerSpec: TModelSpec): RouterConversationFields {
  return {
    spec: routerSpec.name,
    endpoint: routerSpec.preset.endpoint ?? undefined,
    endpointType: resolveEndpointType(routerSpec),
    model: routerSpec.preset.model ?? undefined,
  };
}
