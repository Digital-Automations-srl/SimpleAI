import { Providers, FakeChatModel } from '@librechat/agents';
import type { LLMConfig } from '@librechat/agents';
import type { AgentBuilderResponse } from 'librechat-data-provider';
import type { Response } from 'express';
import type { AgentBuilderCategoryOption, AgentBuilderOptions, BuilderSpec } from './options';
import type { ServerRequest } from '~/types';
import type { RawAgentDraft } from './draft';
import {
  sanitizeDraft,
  generateAgentDraft,
  AgentBuilderError,
  CONFIGURE_AGENT_TOOL,
  buildBuilderInstructions,
  createConfigureAgentTool,
} from './draft';
import { findBuilderSpec, resolveBuilderModels, resolveBuilderTools } from './options';
import { createAgentBuilderHandler, isAgentBuilderEnabled } from './handler';
import * as providers from '~/endpoints/config/providers';
import * as testHook from '~/agents/testHook';

const specs: BuilderSpec[] = [
  {
    name: 'auto',
    preset: { endpoint: 'anthropic', model: 'claude-sonnet-5' },
    router: { candidates: { haiku: 'Compiti semplici', sonnet: 'Compiti medi', ghost: 'Assente' } },
  },
  { name: 'haiku', preset: { endpoint: 'anthropic', model: 'claude-haiku-5-5' } },
  { name: 'sonnet', preset: { endpoint: 'anthropic', model: 'claude-sonnet-5' } },
  { name: 'luna', preset: { endpoint: 'azureOpenAI', model: 'gpt-6-luna' } },
  { name: 'empty', preset: { endpoint: 'anthropic' } },
];

const options: AgentBuilderOptions = {
  models: [
    {
      spec: 'haiku',
      description: 'Compiti semplici',
      provider: 'anthropic',
      model: 'claude-haiku-5-5',
    },
    {
      spec: 'sonnet',
      description: 'Compiti medi',
      provider: 'anthropic',
      model: 'claude-sonnet-5',
    },
  ],
  categories: [
    { value: 'general', label: 'com_agents_category_general' },
    { value: 'hr', label: 'Risorse umane', description: 'Personale e selezione' },
  ],
  tools: ['web_search', 'execute_code'],
};

describe('findBuilderSpec', () => {
  it('returns the configured concrete spec', () => {
    expect(findBuilderSpec({ spec: 'sonnet' }, specs)?.name).toBe('sonnet');
  });

  it('rejects a missing config, an unknown spec, a router spec and a spec without a model', () => {
    expect(findBuilderSpec(undefined, specs)).toBeUndefined();
    expect(findBuilderSpec({ spec: 'missing' }, specs)).toBeUndefined();
    expect(findBuilderSpec({ spec: 'auto' }, specs)).toBeUndefined();
    expect(findBuilderSpec({ spec: 'empty' }, specs)).toBeUndefined();
  });
});

describe('resolveBuilderModels', () => {
  it('defaults to the router candidates, skipping specs that do not exist', () => {
    expect(resolveBuilderModels({ spec: 'sonnet' }, specs)).toEqual([
      {
        spec: 'haiku',
        description: 'Compiti semplici',
        provider: 'anthropic',
        model: 'claude-haiku-5-5',
      },
      {
        spec: 'sonnet',
        description: 'Compiti medi',
        provider: 'anthropic',
        model: 'claude-sonnet-5',
      },
    ]);
  });

  it('prefers the explicit models and honours the allowed providers', () => {
    const models = { luna: 'Economico', sonnet: 'Bilanciato' };
    expect(resolveBuilderModels({ spec: 'sonnet', models }, specs).map((m) => m.spec)).toEqual([
      'luna',
      'sonnet',
    ]);
    expect(
      resolveBuilderModels({ spec: 'sonnet', models }, specs, ['azureOpenAI']).map((m) => m.spec),
    ).toEqual(['luna']);
  });
});

describe('resolveBuilderTools', () => {
  it('offers only the tools whose capability is enabled', () => {
    expect(resolveBuilderTools(['execute_code', 'file_search'])).toEqual(['execute_code']);
    expect(resolveBuilderTools()).toEqual([]);
  });
});

describe('buildBuilderInstructions', () => {
  it('lists the options and the current form, hiding untranslated labels', () => {
    const prompt = buildBuilderInstructions(options, { name: 'Bozza', tools: ['web_search'] });
    expect(prompt).toContain('- haiku: Compiti semplici');
    expect(prompt).toContain('- web_search: ricerca sul web');
    expect(prompt).toContain('- general\n');
    expect(prompt).toContain('- hr (Risorse umane): Personale e selezione');
    expect(prompt).toContain('"name": "Bozza"');
    expect(prompt).not.toContain('com_agents_category_general');
  });

  it('marks empty option lists explicitly', () => {
    expect(buildBuilderInstructions({ models: [], categories: [], tools: [] })).toContain(
      'Strumenti disponibili:\n- (nessuno)',
    );
  });
});

describe('createConfigureAgentTool', () => {
  it('restricts category, model and tools to the options', async () => {
    const drafts: RawAgentDraft[] = [];
    const configure = createConfigureAgentTool(options, (draft) => drafts.push(draft));
    const valid = {
      reply: 'Fatto',
      name: 'Agente',
      description: 'Descrizione',
      instructions: 'Sei un agente',
      category: 'hr',
      model: 'haiku',
      tools: ['web_search'],
    };

    await configure.invoke(valid);
    await expect(configure.invoke({ ...valid, model: 'opus' })).rejects.toThrow();
    expect(drafts).toEqual([valid]);
  });
});

describe('sanitizeDraft', () => {
  it('maps the chosen spec onto provider and model and trims the text fields', () => {
    const result = sanitizeDraft(
      {
        reply: ' Pronto ',
        name: '  Assistente HR ',
        description: 'Risponde sulle ferie',
        instructions: 'Sei un assistente HR.',
        category: 'hr',
        model: 'haiku',
        tools: ['execute_code', 'web_search'],
      },
      options,
    );
    expect(result).toEqual({
      reply: 'Pronto',
      draft: {
        name: 'Assistente HR',
        description: 'Risponde sulle ferie',
        instructions: 'Sei un assistente HR.',
        category: 'hr',
        provider: 'anthropic',
        model: 'claude-haiku-5-5',
        tools: ['web_search', 'execute_code'],
      },
    });
  });

  it('drops values outside the options and clips over-long fields', () => {
    const { reply, draft } = sanitizeDraft(
      { name: 'x'.repeat(300), category: 'legal', model: 'opus', tools: ['file_search'] },
      options,
    );
    expect(reply).not.toBe('');
    expect(draft.name).toHaveLength(256);
    expect(draft.category).toBeUndefined();
    expect(draft.provider).toBeUndefined();
    expect(draft.model).toBeUndefined();
    expect(draft.tools).toEqual([]);
  });
});

describe('generateAgentDraft', () => {
  const llmConfig = { provider: Providers.OPENAI, model: 'gpt-test', apiKey: 'test' } as LLMConfig;

  function fakeModel(toolCalls: ConstructorParameters<typeof FakeChatModel>[0]['toolCalls']) {
    return jest.spyOn(testHook, 'applyTestRunHook').mockImplementation((run) => {
      (run.Graph as unknown as { overrideModel: FakeChatModel }).overrideModel = new FakeChatModel({
        responses: [''],
        toolCalls,
      });
    });
  }

  afterEach(() => jest.restoreAllMocks());

  it('returns the configuration the model passed to configure_agent', async () => {
    fakeModel([
      {
        id: 'call_1',
        name: CONFIGURE_AGENT_TOOL,
        type: 'tool_call',
        args: {
          reply: 'Ho creato il tuo agente',
          name: 'Traduttore',
          description: 'Traduce testi',
          instructions: 'Sei un traduttore.',
          category: 'general',
          model: 'sonnet',
          tools: [],
        },
      },
    ]);

    const result = await generateAgentDraft({
      llmConfig,
      messages: [{ role: 'user', text: 'Voglio un traduttore' }],
      options,
      runId: 'run-1',
      userId: 'user-1',
    });

    expect(result.reply).toBe('Ho creato il tuo agente');
    expect(result.draft).toMatchObject({
      name: 'Traduttore',
      category: 'general',
      provider: 'anthropic',
      model: 'claude-sonnet-5',
      tools: [],
    });
  });

  it('fails when the model answers without calling the tool', async () => {
    fakeModel(undefined);

    await expect(
      generateAgentDraft({
        llmConfig,
        messages: [{ role: 'user', text: 'Ciao' }],
        options,
        runId: 'run-2',
        userId: 'user-1',
      }),
    ).rejects.toBeInstanceOf(AgentBuilderError);
  });
});

/**
 * `POST /api/agents/builder/draft` below the route: real request validation, real option
 * resolution and sanitizing, real Run with a fake model. Only the provider initializer is
 * stubbed, since it would reach a live provider.
 */
describe('createAgentBuilderHandler', () => {
  const categories: AgentBuilderCategoryOption[] = [
    { value: 'general', label: 'com_agents_category_general' },
    { value: 'hr', label: 'Risorse umane' },
  ];

  const builderAppConfig = {
    config: { agentBuilder: { spec: 'sonnet' } },
    modelSpecs: { list: specs },
    endpoints: { agents: { capabilities: ['web_search', 'execute_code'] } },
  };

  type HandlerDeps = Parameters<typeof createAgentBuilderHandler>[0];
  type CapturedBody = Partial<AgentBuilderResponse> & { error?: string };
  type CapturedResponse = { status?: number; body?: CapturedBody };

  function createResponse() {
    const captured: CapturedResponse = {};
    const res = {
      status(code: number) {
        captured.status = code;
        return res;
      },
      json(body: CapturedBody) {
        captured.body = body;
        return res;
      },
    };
    return { res: res as unknown as Response, captured };
  }

  function stubProvider() {
    return jest.spyOn(providers, 'getProviderConfig').mockReturnValue({
      getOptions: jest.fn().mockResolvedValue({ llmConfig: { model: 'gpt-test', apiKey: 'test' } }),
      overrideProvider: Providers.OPENAI,
    } as ReturnType<typeof providers.getProviderConfig>);
  }

  function fakeDraft(args?: Record<string, unknown>) {
    return jest.spyOn(testHook, 'applyTestRunHook').mockImplementation((run) => {
      (run.Graph as unknown as { overrideModel: FakeChatModel }).overrideModel = new FakeChatModel({
        responses: [''],
        toolCalls:
          args == null
            ? undefined
            : [{ id: 'call_1', name: CONFIGURE_AGENT_TOOL, type: 'tool_call', args }],
      });
    });
  }

  const validDraft = {
    reply: 'Ho creato il tuo agente HR',
    name: 'Assistente HR',
    description: 'Risponde sulle ferie',
    instructions: 'Sei un assistente HR.',
    category: 'hr',
    model: 'haiku',
    tools: ['execute_code'],
  };

  interface DraftCall {
    body: object;
    getActiveCategories?: jest.Mock;
    config?: object;
    user?: { id: string } | null;
  }

  async function callHandler({
    body,
    getActiveCategories = jest.fn().mockResolvedValue(categories),
    config = builderAppConfig,
    user = { id: 'user-1' },
  }: DraftCall) {
    const handler = createAgentBuilderHandler({ getActiveCategories } as unknown as HandlerDeps);
    const { res, captured } = createResponse();
    const req = { body, config, user: user ?? undefined } as unknown as ServerRequest;
    await handler(req, res);
    return { captured, getActiveCategories };
  }

  beforeEach(() => {
    stubProvider();
  });
  afterEach(() => jest.restoreAllMocks());

  it('is enabled only by a concrete spec', () => {
    const asConfig = (config: object) => config as ServerRequest['config'];
    expect(isAgentBuilderEnabled(asConfig(builderAppConfig))).toBe(true);
    expect(isAgentBuilderEnabled(undefined)).toBe(false);
    expect(
      isAgentBuilderEnabled(
        asConfig({ ...builderAppConfig, config: { agentBuilder: { spec: 'auto' } } }),
      ),
    ).toBe(false);
  });

  it.each([
    ['no agentBuilder config', { ...builderAppConfig, config: {} }],
    ['a router spec', { ...builderAppConfig, config: { agentBuilder: { spec: 'auto' } } }],
  ])('answers 404 with %s', async (_label, config) => {
    const { captured, getActiveCategories } = await callHandler({
      body: { messages: [{ role: 'user', text: 'Un traduttore' }] },
      config,
    });
    expect(captured.status).toBe(404);
    expect(captured.body?.error).toBe('The agent builder is not configured');
    expect(getActiveCategories).not.toHaveBeenCalled();
  });

  it.each([
    ['the last turn from the assistant', { messages: [{ role: 'assistant', text: 'Ciao' }] }],
    [
      'more than 40 turns',
      { messages: Array.from({ length: 41 }, () => ({ role: 'user', text: 'Ancora' })) },
    ],
    ['a blank turn', { messages: [{ role: 'user', text: '   ' }] }],
    ['a turn over 8000 characters', { messages: [{ role: 'user', text: 'x'.repeat(8001) }] }],
    [
      'an unknown tool in the current form',
      { messages: [{ role: 'user', text: 'Ok' }], current: { tools: ['file_search'] } },
    ],
    ['no messages', {}],
  ])('answers 400 to %s', async (_label, body) => {
    const { captured, getActiveCategories } = await callHandler({ body });
    expect(captured.status).toBe(400);
    expect(captured.body?.error).toBe('Invalid agent builder request');
    expect(getActiveCategories).not.toHaveBeenCalled();
  });

  it('answers 400 without an authenticated user', async () => {
    const { captured } = await callHandler({
      body: { messages: [{ role: 'user', text: 'Ok' }] },
      user: null,
    });
    expect(captured.status).toBe(400);
  });

  it('answers 502 when the model does not configure the agent', async () => {
    fakeDraft(undefined);
    const { captured } = await callHandler({
      body: { messages: [{ role: 'user', text: 'Ciao' }] },
    });
    expect(captured.status).toBe(502);
    expect(captured.body?.error).toBe('The agent builder could not draft the agent');
  });

  it('answers 502 when the categories cannot be read', async () => {
    fakeDraft(validDraft);
    const { captured } = await callHandler({
      body: { messages: [{ role: 'user', text: 'Un agente HR' }] },
      getActiveCategories: jest.fn().mockRejectedValue(new Error('db down')),
    });
    expect(captured.status).toBe(502);
    expect(captured.body?.error).toBe('The agent builder could not draft the agent');
  });

  it('answers 200 with the draft mapped onto the configured options', async () => {
    fakeDraft(validDraft);
    const { captured, getActiveCategories } = await callHandler({
      body: {
        messages: [{ role: 'user', text: 'Un agente HR' }],
        current: { name: 'Bozza', tools: ['web_search'] },
      },
    });
    expect(getActiveCategories).toHaveBeenCalledTimes(1);
    expect(captured.status).toBe(200);
    expect(captured.body).toEqual({
      reply: 'Ho creato il tuo agente HR',
      draft: {
        name: 'Assistente HR',
        description: 'Risponde sulle ferie',
        instructions: 'Sei un assistente HR.',
        category: 'hr',
        provider: 'anthropic',
        model: 'claude-haiku-5-5',
        tools: ['execute_code'],
      },
    });
  });

  it('drafts what the next refining request can send back', async () => {
    fakeDraft({ ...validDraft, reply: 'r'.repeat(9000), instructions: 'i'.repeat(40000) });
    const first = await callHandler({
      body: { messages: [{ role: 'user', text: 'Un agente HR' }] },
    });
    expect(first.captured.status).toBe(200);
    const reply = first.captured.body?.reply ?? '';
    const instructions = first.captured.body?.draft?.instructions ?? '';

    fakeDraft(validDraft);
    const refined = await callHandler({
      body: {
        messages: [
          { role: 'user', text: 'Un agente HR' },
          { role: 'assistant', text: reply },
          { role: 'user', text: 'Più formale' },
        ],
        current: { instructions },
      },
    });
    expect(refined.captured.status).toBe(200);
  });
});
