import { AgentCapabilities } from 'librechat-data-provider';
import type {
  TPreset,
  TEphemeralAgent,
  AgentBuilderTool,
  AgentBuilderDraft,
  AgentBuilderCurrent,
  AgentBuilderMessage,
} from 'librechat-data-provider';
import type { UseFormSetValue } from 'react-hook-form';
import type { AgentForm } from '~/common';
import { createProviderOption } from '~/utils';

/** Turns sent to the builder: enough context to refine, bounded so the request stays small. */
export const BUILDER_HISTORY_LIMIT = 20;

const BUILDER_TOOLS: ReadonlyArray<AgentBuilderTool> = ['web_search', 'execute_code'];

/** The history window sent to the builder always opens on a user turn. */
export function trimBuilderHistory(messages: AgentBuilderMessage[]): AgentBuilderMessage[] {
  const recent = messages.slice(-BUILDER_HISTORY_LIMIT);
  const firstUser = recent.findIndex((message) => message.role === 'user');
  return firstUser > 0 ? recent.slice(firstUser) : recent;
}

export function getBuilderCurrent(values: AgentForm): AgentBuilderCurrent {
  const provider = typeof values.provider === 'string' ? values.provider : values.provider?.value;
  return {
    name: values.name,
    description: values.description,
    instructions: values.instructions,
    category: values.category,
    provider: typeof provider === 'string' ? provider : null,
    model: values.model,
    tools: BUILDER_TOOLS.filter((tool) => values[tool] === true),
  };
}

export interface AgentPreview {
  preset: Partial<TPreset>;
  ephemeralAgent: TEphemeralAgent;
}

/**
 * The unsaved agent as a plain chat: same model, parameters and instructions, and only the tools
 * the agent has, so the user's own chat toggles and MCP selection don't leak into the preview.
 */
export function getAgentPreview(values: AgentForm): AgentPreview | null {
  const { provider, model } = getBuilderCurrent(values);
  if (!provider || !model) {
    return null;
  }
  return {
    preset: {
      /** Same keys as a conversation's parameters; the endpoint schema drops what doesn't apply. */
      ...(values.model_parameters as Partial<TPreset>),
      endpoint: provider,
      model,
      promptPrefix: values.instructions ?? undefined,
      modelLabel: values.name || undefined,
    },
    ephemeralAgent: {
      mcp: [],
      web_search: values[AgentCapabilities.web_search] === true,
      execute_code: values[AgentCapabilities.execute_code] === true,
      file_search: false,
      memory: false,
      skills: false,
      artifacts: values[AgentCapabilities.artifacts] ?? '',
    },
  };
}

/** Writes the draft into the agent form as user edits, so saving persists them like any other. */
export function applyAgentDraft(draft: AgentBuilderDraft, setValue: UseFormSetValue<AgentForm>) {
  const options = { shouldDirty: true, shouldValidate: true };
  if (draft.name != null) {
    setValue('name', draft.name, options);
  }
  if (draft.description != null) {
    setValue('description', draft.description, options);
  }
  if (draft.instructions != null) {
    setValue('instructions', draft.instructions, options);
  }
  if (draft.category != null) {
    setValue('category', draft.category, options);
  }
  if (draft.provider != null && draft.model != null) {
    setValue('provider', createProviderOption(draft.provider), options);
    setValue('model', draft.model, options);
  }
  if (draft.tools != null) {
    const tools = new Set(draft.tools);
    setValue(AgentCapabilities.web_search, tools.has('web_search'), options);
    setValue(AgentCapabilities.execute_code, tools.has('execute_code'), options);
  }
}
