import { EventEmitter } from 'events';
import { EModelEndpoint, tModelRouterSchema } from 'librechat-data-provider';
import type { TModelSpec } from 'librechat-data-provider';
import type { CreateRouterDecisionData } from '@librechat/data-schemas';
import type { Response } from 'express';
import type { ModelRouterRequest } from './middleware';
import type { RouterHistoryMessage } from './state';
import type { JevResponse } from './jev';
import { buildRouterQuestions, resolveRouterDecision, toolQuestionName } from './decide';
import { applyRouterDecision, getRoutableTools } from './apply';
import { buildRouterState, extractMessageText } from './state';
import { createModelRouter } from './middleware';
import { callJev } from './jev';

const routerConfig = tModelRouterSchema.parse({
  fallback: 'sonnet',
  candidates: {
    opus: 'Analisi complesse e ragionamento lungo',
    sonnet: 'Compiti di media complessità',
    haiku: 'Domande brevi e semplici',
  },
  tools: {
    web_search: 'Informazioni recenti dal web',
    execute_code: 'Calcoli o elaborazione di file',
    'mcp:AIDA': 'Documenti aziendali in AIDA',
  },
  minConfidence: 0.3,
});

function spec(name: string, endpoint: string, model: string): TModelSpec {
  return { name, label: name.toUpperCase(), preset: { endpoint, model } };
}

const specs: TModelSpec[] = [
  {
    ...spec('auto', EModelEndpoint.anthropic, 'claude-sonnet-5'),
    label: 'Automatico',
    router: routerConfig,
  },
  spec('opus', EModelEndpoint.anthropic, 'claude-opus-4-8'),
  spec('sonnet', EModelEndpoint.anthropic, 'claude-sonnet-5'),
  spec('haiku', EModelEndpoint.azureOpenAI, 'gpt-5.4-mini'),
];

function jevResponse(
  choice: string,
  confidence: number,
  tools: Record<string, number> = {},
): JevResponse {
  return {
    model: 'jev-1.13.0',
    answers: {
      model: { type: 'choice', choice, confidence, probabilities: { [choice]: confidence } },
      ...Object.fromEntries(
        Object.entries(tools).map(([key, noul]) => [
          toolQuestionName(key),
          { type: 'noul' as const, noul },
        ]),
      ),
    },
    usage: { input_tokens: 321, output_tokens: 4 },
  };
}

interface FakeJev {
  fetchFn: typeof fetch;
  requests: { url: string; headers: Record<string, string>; body: Record<string, unknown> }[];
}

/** Stand-in for TypeSafe's HTTP API: the only external dependency of the router. */
function fakeJev(reply: () => { status: number; json?: unknown }): FakeJev {
  const requests: FakeJev['requests'] = [];
  const fetchFn = (async (url: string, init: RequestInit) => {
    requests.push({
      url,
      headers: init.headers as Record<string, string>,
      body: JSON.parse(init.body as string),
    });
    const { status, json } = reply();
    return new Response(JSON.stringify(json ?? {}), { status });
  }) as unknown as typeof fetch;
  return { fetchFn, requests };
}

function createStore(history: RouterHistoryMessage[] = []) {
  const decisions: CreateRouterDecisionData[] = [];
  return {
    decisions,
    getMessages: async () => history,
    createRouterDecision: async (data: CreateRouterDecisionData) => {
      decisions.push(data);
      return data;
    },
  };
}

function request(body: ModelRouterRequest['body'], path = '/anthropic'): ModelRouterRequest {
  return { path, user: { id: 'user-1' }, config: { modelSpecs: { list: specs } }, body };
}

async function run(
  req: ModelRouterRequest,
  deps: Parameters<typeof createModelRouter>[0],
  afterNext: () => void = () => undefined,
): Promise<void> {
  const res = new EventEmitter();
  const next = jest.fn(afterNext);
  await createModelRouter(deps)(req, res as unknown as Response, next);
  expect(next).toHaveBeenCalledTimes(1);
  res.emit('close');
  await new Promise((resolve) => setImmediate(resolve));
}

describe('buildRouterState', () => {
  const history: RouterHistoryMessage[] = [
    { messageId: 'm1', parentMessageId: null, isCreatedByUser: true, text: 'Analizza il bando' },
    {
      messageId: 'm2',
      parentMessageId: 'm1',
      isCreatedByUser: false,
      text: '',
      content: [{ type: 'tool_call' }, { type: 'text', text: 'Ecco tre opzioni: 1, 2, 3' }],
    },
    { messageId: 'sibling', parentMessageId: 'm1', isCreatedByUser: false, text: 'Ramo scartato' },
    { messageId: 'm3', parentMessageId: 'm2', isCreatedByUser: true, text: 'x'.repeat(50) },
    { messageId: 'm4', parentMessageId: 'm3', isCreatedByUser: false, text: 'Risposta finale' },
  ];

  it('follows the parent chain and ends with the new message', () => {
    const state = buildRouterState({
      history,
      parentMessageId: 'm2',
      text: '3',
      historyMessages: 5,
      maxMessageChars: 100,
    });

    expect(state.conversation).toEqual([
      { role: 'user', text: 'Analizza il bando' },
      { role: 'assistant', text: 'Ecco tre opzioni: 1, 2, 3' },
      { role: 'user', text: '3' },
    ]);
  });

  it('keeps only the most recent messages and truncates long ones', () => {
    const state = buildRouterState({
      history,
      parentMessageId: 'm4',
      text: 'ok',
      historyMessages: 3,
      maxMessageChars: 10,
    });

    expect(state.conversation).toEqual([
      { role: 'user', text: `${'x'.repeat(10)}…` },
      { role: 'assistant', text: 'Risposta f…' },
      { role: 'user', text: 'ok' },
    ]);
  });

  it('reads text parts when the message text is empty', () => {
    expect(extractMessageText(history[1])).toBe('Ecco tre opzioni: 1, 2, 3');
  });
});

describe('resolveRouterDecision', () => {
  const toolKeys = ['web_search', 'mcp:AIDA'];

  it('asks one choice over the candidates and one yes/no per tool', () => {
    const questions = buildRouterQuestions(routerConfig, toolKeys);

    expect(questions.model).toMatchObject({ type: 'choice', criteria: routerConfig.candidates });
    expect(questions.tool_web_search).toMatchObject({ type: 'noul' });
    expect(questions.tool_mcp_AIDA).toMatchObject({ type: 'noul' });
  });

  it('picks the chosen spec and the tools above the threshold', () => {
    const decision = resolveRouterDecision(
      routerConfig,
      jevResponse('opus', 0.8, { web_search: 0.9, 'mcp:AIDA': 0.2 }),
      toolKeys,
    );

    expect(decision).toMatchObject({
      spec: 'opus',
      tools: ['web_search'],
      confidence: 0.8,
      jevModel: 'jev-1.13.0',
      inputTokens: 321,
    });
    expect(decision.fallbackReason).toBeUndefined();
  });

  it('falls back when Jev is unsure', () => {
    const decision = resolveRouterDecision(routerConfig, jevResponse('haiku', 0.2), toolKeys);
    expect(decision).toMatchObject({ spec: 'sonnet', fallbackReason: 'low_confidence' });
  });

  it('falls back when the answer is not a configured candidate', () => {
    const decision = resolveRouterDecision(routerConfig, jevResponse('gpt-99', 0.9), toolKeys);
    expect(decision).toMatchObject({ spec: 'sonnet', fallbackReason: 'invalid_answer' });
  });
});

describe('tool switches', () => {
  it('never asks about a tool the user switched off or already switched on', () => {
    expect(
      getRoutableTools(routerConfig, { web_search: false, execute_code: true, mcp: [] }),
    ).toEqual(['mcp:AIDA']);
    expect(getRoutableTools(routerConfig, { mcp: ['AIDA'] })).toEqual([
      'web_search',
      'execute_code',
    ]);
  });

  it('rewrites the request onto the target spec and switches tools on', () => {
    const body: ModelRouterRequest['body'] = {
      spec: 'auto',
      endpoint: EModelEndpoint.anthropic,
      endpointType: 'custom',
      model: 'claude-sonnet-5',
      ephemeralAgent: { mcp: ['odoo'], web_search: false },
    };

    applyRouterDecision(body, specs[3], ['execute_code', 'mcp:AIDA']);

    expect(body).toEqual({
      spec: 'haiku',
      endpoint: EModelEndpoint.azureOpenAI,
      model: 'gpt-5.4-mini',
      ephemeralAgent: { mcp: ['odoo', 'AIDA'], web_search: false, execute_code: true },
    });
  });
  it('marks a target on a custom endpoint with the custom endpoint type', () => {
    const body: ModelRouterRequest['body'] = { spec: 'auto', endpoint: EModelEndpoint.anthropic };

    applyRouterDecision(body, spec('glm', 'Regolo GLM', 'glm5.2'), []);

    expect(body).toEqual({
      spec: 'glm',
      endpoint: 'Regolo GLM',
      endpointType: EModelEndpoint.custom,
      model: 'glm5.2',
    });
  });
});

describe('callJev', () => {
  it('posts the state and questions with the bearer key', async () => {
    const jev = fakeJev(() => ({ status: 200, json: jevResponse('opus', 0.9) }));

    const response = await callJev({
      baseURL: 'https://api.typesafe.ai/',
      apiKey: 'secret',
      model: 'jev-latest',
      state: { conversation: [{ role: 'user', text: 'ciao' }] },
      questions: buildRouterQuestions(routerConfig, []),
      timeoutMs: 1000,
      fetchFn: jev.fetchFn,
    });

    expect(response.answers.model).toMatchObject({ choice: 'opus' });
    expect(jev.requests[0].url).toBe('https://api.typesafe.ai/v1/systemone');
    expect(jev.requests[0].headers.Authorization).toBe('Bearer secret');
    expect(jev.requests[0].body).toMatchObject({ model: 'jev-latest' });
  });
});

describe('createModelRouter', () => {
  it('routes the automatic spec and records the decision', async () => {
    const jev = fakeJev(() => ({
      status: 200,
      json: jevResponse('haiku', 0.85, { web_search: 0.7 }),
    }));
    const store = createStore([
      { messageId: 'm1', parentMessageId: null, isCreatedByUser: true, text: 'Ciao' },
    ]);
    const req = request({
      spec: 'auto',
      endpoint: EModelEndpoint.anthropic,
      model: 'claude-sonnet-5',
      text: 'Che tempo fa a Udine?',
      parentMessageId: 'm1',
      conversationId: 'convo-1',
    });

    await run(req, { ...store, apiKey: 'secret', fetchFn: jev.fetchFn });

    expect(req.body).toMatchObject({
      spec: 'haiku',
      endpoint: EModelEndpoint.azureOpenAI,
      model: 'gpt-5.4-mini',
      ephemeralAgent: { web_search: true },
    });
    expect(req.modelRouter?.conversation).toEqual({
      spec: 'auto',
      endpoint: EModelEndpoint.anthropic,
      endpointType: undefined,
      model: 'claude-sonnet-5',
    });
    expect(jev.requests[0].body.state).toEqual({
      conversation: [
        { role: 'user', text: 'Ciao' },
        { role: 'user', text: 'Che tempo fa a Udine?' },
      ],
    });
    expect(store.decisions).toEqual([
      expect.objectContaining({
        user: 'user-1',
        conversationId: 'convo-1',
        routerSpec: 'auto',
        spec: 'haiku',
        model: 'gpt-5.4-mini',
        tools: ['web_search'],
        confidence: 0.85,
      }),
    ]);
  });

  it('records a new conversation under the id the controller assigns', async () => {
    const jev = fakeJev(() => ({ status: 200, json: jevResponse('opus', 0.9) }));
    const store = createStore();
    const req = request({
      spec: 'auto',
      endpoint: EModelEndpoint.anthropic,
      text: 'Ciao',
      conversationId: 'new',
    });

    await run(req, { ...store, apiKey: 'secret', fetchFn: jev.fetchFn }, () => {
      if (req.body) {
        req.body.conversationId = 'assigned-by-controller';
      }
    });

    expect(store.decisions[0]).toMatchObject({
      conversationId: 'assigned-by-controller',
      spec: 'opus',
    });
  });

  it('uses the fallback spec when Jev fails', async () => {
    const jev = fakeJev(() => ({ status: 529 }));
    const store = createStore();
    const req = request({ spec: 'auto', endpoint: EModelEndpoint.anthropic, text: 'Ciao' });

    await run(req, { ...store, apiKey: 'secret', fetchFn: jev.fetchFn });

    expect(req.body).toMatchObject({ spec: 'sonnet', model: 'claude-sonnet-5' });
    expect(store.decisions[0]).toMatchObject({ spec: 'sonnet', fallbackReason: 'request_failed' });
  });

  it('uses the fallback spec without calling Jev when no key is configured', async () => {
    const jev = fakeJev(() => ({ status: 200, json: jevResponse('opus', 0.9) }));
    const store = createStore();
    const req = request({ spec: 'auto', endpoint: EModelEndpoint.anthropic, text: 'Ciao' });

    await run(req, { ...store, fetchFn: jev.fetchFn });

    expect(jev.requests).toHaveLength(0);
    expect(store.decisions[0]).toMatchObject({
      spec: 'sonnet',
      fallbackReason: 'missing_api_key',
    });
  });

  it('leaves manually chosen specs and resumed turns untouched', async () => {
    const jev = fakeJev(() => ({ status: 200, json: jevResponse('opus', 0.9) }));
    const store = createStore();
    const manual = request({ spec: 'haiku', endpoint: EModelEndpoint.azureOpenAI, text: 'Ciao' });
    const resumed = request(
      { spec: 'auto', endpoint: EModelEndpoint.anthropic, text: 'Ciao' },
      '/resume',
    );

    await run(manual, { ...store, apiKey: 'secret', fetchFn: jev.fetchFn });
    await run(resumed, { ...store, apiKey: 'secret', fetchFn: jev.fetchFn });

    expect(manual.body?.spec).toBe('haiku');
    expect(resumed.body?.spec).toBe('auto');
    expect(jev.requests).toHaveLength(0);
    expect(store.decisions).toHaveLength(0);
  });
});
