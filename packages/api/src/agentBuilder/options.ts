import { AgentCapabilities } from 'librechat-data-provider';
import type { AgentBuilderTool } from 'librechat-data-provider';

/** The spec fields the builder reads, loose enough for the deep-partial specs of the app config. */
export interface BuilderSpec {
  name?: string;
  preset?: { endpoint?: string | null; model?: string | null };
  router?: { candidates?: Record<string, string | undefined> } | null;
}

/** `agentBuilder` as it reaches the app config, where every field may be missing. */
export interface AgentBuilderConfigInput {
  spec?: string;
  models?: Record<string, string | undefined>;
}

export interface AgentBuilderModelOption {
  spec: string;
  description: string;
  provider: string;
  model: string;
}

export interface AgentBuilderCategoryOption {
  value: string;
  label: string;
  description?: string;
}

/** What the builder may pick from: anything else it answers is dropped before reaching the form. */
export interface AgentBuilderOptions {
  models: AgentBuilderModelOption[];
  categories: AgentBuilderCategoryOption[];
  tools: AgentBuilderTool[];
}

const BUILDER_TOOL_CAPABILITIES: ReadonlyArray<[AgentBuilderTool, AgentCapabilities]> = [
  ['web_search', AgentCapabilities.web_search],
  ['execute_code', AgentCapabilities.execute_code],
];

function isConcreteSpec(spec: BuilderSpec | undefined): spec is BuilderSpec {
  return spec != null && spec.router == null && !!spec.preset?.endpoint && !!spec.preset?.model;
}

/** The spec that writes the draft; undefined when the builder is not configured or misconfigured. */
export function findBuilderSpec(
  config: AgentBuilderConfigInput | undefined,
  specs: BuilderSpec[],
): BuilderSpec | undefined {
  if (config?.spec == null) {
    return undefined;
  }
  const spec = specs.find((candidate) => candidate.name === config.spec);
  return isConcreteSpec(spec) ? spec : undefined;
}

/**
 * Models the builder may assign to the agent, read from `agentBuilder.models` or, when absent,
 * from the candidates of the automatic spec, so the descriptions written for the router are reused.
 */
export function resolveBuilderModels(
  config: AgentBuilderConfigInput | undefined,
  specs: BuilderSpec[],
  allowedProviders: string[] = [],
): AgentBuilderModelOption[] {
  const descriptions =
    config?.models ?? specs.find((spec) => spec.router != null)?.router?.candidates ?? {};
  const specsByName = new Map(specs.map((spec) => [spec.name, spec]));
  const allowed = new Set(allowedProviders);

  return Object.entries(descriptions).flatMap(([name, description]): AgentBuilderModelOption[] => {
    const spec = specsByName.get(name);
    const provider = spec?.preset?.endpoint;
    const model = spec?.preset?.model;
    if (!isConcreteSpec(spec) || !provider || !model || description == null) {
      return [];
    }
    if (allowed.size > 0 && !allowed.has(provider)) {
      return [];
    }
    return [{ spec: name, description, provider, model }];
  });
}

export function resolveBuilderTools(capabilities: string[] = []): AgentBuilderTool[] {
  const enabled = new Set(capabilities);
  return BUILDER_TOOL_CAPABILITIES.filter(([, capability]) => enabled.has(capability)).map(
    ([tool]) => tool,
  );
}
