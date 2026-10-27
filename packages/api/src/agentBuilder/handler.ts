import { z } from 'zod';
import { randomUUID } from 'node:crypto';
import { logger } from '@librechat/data-schemas';
import { EModelEndpoint } from 'librechat-data-provider';
import type { LLMConfig } from '@librechat/agents';
import type { Response } from 'express';
import type { EndpointDbMethods, ServerRequest } from '~/types';
import type { AgentBuilderCategoryOption, AgentBuilderOptions, BuilderSpec } from './options';
import { findBuilderSpec, resolveBuilderModels, resolveBuilderTools } from './options';
import { getProviderConfig } from '~/endpoints';
import {
  generateAgentDraft,
  BUILDER_MESSAGE_MAX_CHARS,
  BUILDER_INSTRUCTIONS_MAX_CHARS,
} from './draft';

const MAX_MESSAGES = 40;

const builderToolSchema = z.enum(['web_search', 'execute_code']);

const agentBuilderRequestSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        text: z.string().trim().min(1).max(BUILDER_MESSAGE_MAX_CHARS),
      }),
    )
    .min(1)
    .max(MAX_MESSAGES)
    .refine((messages) => messages[messages.length - 1]?.role === 'user', {
      message: 'The last message must come from the user',
    }),
  current: z
    .object({
      name: z.string().max(256).nullish(),
      description: z.string().max(512).nullish(),
      instructions: z.string().max(BUILDER_INSTRUCTIONS_MAX_CHARS).nullish(),
      category: z.string().max(256).nullish(),
      provider: z.string().max(256).nullish(),
      model: z.string().max(256).nullish(),
      tools: z.array(builderToolSchema).optional(),
    })
    .optional(),
});

export interface AgentBuilderDeps extends EndpointDbMethods {
  getActiveCategories: () => Promise<AgentBuilderCategoryOption[]>;
}

/** True when `agentBuilder.spec` names a concrete spec: the client then shows the "Crea" tab. */
export function isAgentBuilderEnabled(appConfig?: ServerRequest['config']): boolean {
  return (
    findBuilderSpec(appConfig?.config?.agentBuilder, appConfig?.modelSpecs?.list ?? []) != null
  );
}

async function resolveBuilderLLMConfig(
  req: ServerRequest,
  spec: BuilderSpec,
  db: EndpointDbMethods,
): Promise<LLMConfig> {
  const endpoint = spec.preset?.endpoint ?? '';
  const { getOptions, overrideProvider } = getProviderConfig({
    provider: endpoint,
    appConfig: req.config,
  });
  const options = await getOptions({
    req,
    endpoint,
    model_parameters: { model: spec.preset?.model },
    db,
  });
  return { ...options.llmConfig, provider: overrideProvider } as LLMConfig;
}

/**
 * `POST /api/agents/builder/draft`: turns the user's description of an agent, and the form as
 * it stands, into a complete configuration the client applies to the agent form.
 */
export function createAgentBuilderHandler(deps: AgentBuilderDeps) {
  return async (req: ServerRequest, res: Response): Promise<void> => {
    const appConfig = req.config;
    const builderConfig = appConfig?.config?.agentBuilder;
    const specs = appConfig?.modelSpecs?.list ?? [];
    const builderSpec = findBuilderSpec(builderConfig, specs);
    if (builderSpec == null) {
      res.status(404).json({ error: 'The agent builder is not configured' });
      return;
    }

    const parsed = agentBuilderRequestSchema.safeParse(req.body);
    const userId = req.user?.id;
    if (!parsed.success || userId == null) {
      res.status(400).json({ error: 'Invalid agent builder request' });
      return;
    }

    try {
      const agentsConfig = appConfig?.endpoints?.[EModelEndpoint.agents];
      const options: AgentBuilderOptions = {
        models: resolveBuilderModels(builderConfig, specs, agentsConfig?.allowedProviders),
        tools: resolveBuilderTools(agentsConfig?.capabilities),
        categories: (await deps.getActiveCategories()).map(({ value, label, description }) => ({
          value,
          label,
          description,
        })),
      };
      const llmConfig = await resolveBuilderLLMConfig(req, builderSpec, deps);
      const result = await generateAgentDraft({
        llmConfig,
        messages: parsed.data.messages,
        current: parsed.data.current,
        options,
        runId: randomUUID(),
        userId,
      });
      res.status(200).json(result);
    } catch (error) {
      logger.error('[agentBuilder] Draft generation failed', error);
      res.status(502).json({ error: 'The agent builder could not draft the agent' });
    }
  };
}
