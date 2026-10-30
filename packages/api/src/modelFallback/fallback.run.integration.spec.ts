import http from 'node:http';
import { logger } from '@librechat/data-schemas';
import { Providers, Run } from '@librechat/agents';
import { HumanMessage } from '@langchain/core/messages';
import type { AddressInfo } from 'node:net';
import type { FallbackSpec } from './chain';
import { applyModelFallbacks } from './apply';

/**
 * A whole agent run of `@librechat/agents` whose model is rate limited: the primary, an Anthropic
 * fallback and an OpenAI fallback are local servers recording what each provider receives.
 * Covers what the live test on lbc found missing (T193): the fallback answered without the
 * agent's instructions, its tools and the attached documents, after minutes of retries.
 */
interface FakeProvider {
  url: string;
  bodies: Array<Record<string, unknown>>;
  status: number;
  close: () => Promise<void>;
}

const INSTRUCTIONS = 'Sei il revisore delle email di Meccanica Rossi.';
const PDF_BASE64 = 'JVBERi0xLjQK';

function sse(events: Array<[string | null, unknown]>): string {
  return events
    .map(([event, data]) => `${event ? `event: ${event}\n` : ''}data: ${JSON.stringify(data)}\n\n`)
    .join('');
}

const anthropicAnswer = sse([
  [
    'message_start',
    {
      type: 'message_start',
      message: {
        id: 'msg_1',
        type: 'message',
        role: 'assistant',
        model: 'claude-test',
        content: [],
        stop_reason: null,
        stop_sequence: null,
        usage: { input_tokens: 10, output_tokens: 1 },
      },
    },
  ],
  [
    'content_block_start',
    { type: 'content_block_start', index: 0, content_block: { type: 'text', text: '' } },
  ],
  [
    'content_block_delta',
    { type: 'content_block_delta', index: 0, delta: { type: 'text_delta', text: 'Revisione' } },
  ],
  ['content_block_stop', { type: 'content_block_stop', index: 0 }],
  [
    'message_delta',
    {
      type: 'message_delta',
      delta: { stop_reason: 'end_turn', stop_sequence: null },
      usage: { output_tokens: 3 },
    },
  ],
  ['message_stop', { type: 'message_stop' }],
]);

const openAIAnswer = `${sse([
  [
    null,
    {
      id: 'chatcmpl-1',
      object: 'chat.completion.chunk',
      created: 0,
      model: 'gpt-test',
      choices: [{ index: 0, delta: { content: 'Revisione' }, finish_reason: null }],
    },
  ],
  [
    null,
    {
      id: 'chatcmpl-1',
      object: 'chat.completion.chunk',
      created: 0,
      model: 'gpt-test',
      choices: [{ index: 0, delta: {}, finish_reason: 'stop' }],
    },
  ],
])}data: [DONE]\n\n`;

async function startProvider(answer: string, status = 200): Promise<FakeProvider> {
  const provider = { bodies: [], status } as unknown as FakeProvider;
  const server = http.createServer((req, res) => {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      provider.bodies.push(JSON.parse(body || '{}'));
      if (provider.status !== 200) {
        res.writeHead(provider.status, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            type: 'error',
            error: { type: 'rate_limit_error', message: `Rate limit reached (${provider.status})` },
          }),
        );
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/event-stream' });
      res.end(answer);
    });
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  provider.url = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  provider.close = () => new Promise((resolve) => server.close(() => resolve()));
  return provider;
}

const specs: FallbackSpec[] = [
  { name: 'primary', preset: { endpoint: 'openAI', model: 'primary-model' } },
  { name: 'claude', preset: { endpoint: 'anthropic', model: 'claude-test' } },
  { name: 'gpt', preset: { endpoint: 'openAI', model: 'gpt-test' } },
];

jest.setTimeout(60_000);

describe('an agent run whose model is rate limited (SimpleAI fallback)', () => {
  let primary: FakeProvider;
  let anthropic: FakeProvider;
  let openAI: FakeProvider;

  beforeAll(async () => {
    primary = await startProvider('', 429);
    anthropic = await startProvider(anthropicAnswer);
    openAI = await startProvider(openAIAnswer);
  });

  afterAll(async () => {
    await Promise.all([primary.close(), anthropic.close(), openAI.close()]);
  });

  beforeEach(() => {
    primary.bodies = [];
    anthropic.bodies = [];
    openAI.bodies = [];
    anthropic.status = 200;
  });

  async function runAgent() {
    const llmConfig: Record<string, unknown> = {
      model: 'primary-model',
      apiKey: 'test-key',
      streaming: true,
      configuration: { baseURL: `${primary.url}/v1` },
    };
    const gate = await applyModelFallbacks({
      llmConfig,
      primary: { endpoint: 'openAI', model: 'primary-model', spec: 'primary' },
      appConfig: {
        config: { modelFallback: { tiers: [['primary', 'claude', 'gpt']] } },
        modelSpecs: { list: specs },
      },
      buildEntry: async (endpoint, parameters) =>
        endpoint === 'anthropic'
          ? {
              provider: Providers.ANTHROPIC,
              llmConfig: {
                model: parameters.model,
                apiKey: 'test-key',
                streaming: true,
                anthropicApiUrl: anthropic.url,
              },
            }
          : {
              provider: Providers.OPENAI,
              llmConfig: {
                model: parameters.model,
                apiKey: 'test-key',
                streaming: true,
                configuration: { baseURL: `${openAI.url}/v1` },
              },
            },
    });
    if (gate == null) {
      throw new Error('expected a fallback gate');
    }
    const run = await Run.create({
      runId: `fallback-run-${Date.now()}`,
      skipCleanup: true,
      tokenCounter: () => 1,
      graphConfig: {
        type: 'standard',
        agents: [
          {
            agentId: 'revisore',
            provider: Providers.OPENAI,
            clientOptions: llmConfig,
            instructions: INSTRUCTIONS,
            maxContextTokens: 100_000,
            toolDefinitions: [
              {
                name: 'web_search',
                description: 'Cerca sul web',
                parameters: {
                  type: 'object',
                  properties: { query: { type: 'string' } },
                  required: ['query'],
                },
              },
            ],
          },
        ],
      },
    } as Parameters<typeof Run.create>[0]);
    await run.processStream(
      {
        messages: [
          new HumanMessage({
            content: [
              { type: 'text', text: 'Rivedi la mail nel documento' },
              {
                type: 'file',
                file: {
                  filename: 'bozza.pdf',
                  file_data: `data:application/pdf;base64,${PDF_BASE64}`,
                },
              },
            ],
          }),
        ],
      },
      { configurable: { thread_id: 'fallback-run' }, version: 'v2' },
    );
    return { gate, llmConfig };
  }

  it('hands over to the fallback at once, without retrying the rate-limited model', async () => {
    const { llmConfig } = await runAgent();
    expect(llmConfig.maxRetries).toBe(0);
    expect(primary.bodies).toHaveLength(1);
  });

  it("answers with the agent's instructions, tools and documents shaped for Anthropic", async () => {
    const { gate } = await runAgent();
    expect(gate.getServed()).toEqual(['claude']);
    expect(openAI.bodies).toHaveLength(0);

    const [body] = anthropic.bodies;
    expect(JSON.stringify(body.system)).toContain('Meccanica Rossi');
    expect((body.tools as Array<{ name: string }>).map((tool) => tool.name)).toContain(
      'web_search',
    );
    const [message] = body.messages as Array<{ content: Array<Record<string, unknown>> }>;
    expect(message.content).toContainEqual(
      expect.objectContaining({
        type: 'document',
        source: expect.objectContaining({
          type: 'base64',
          media_type: 'application/pdf',
          data: PDF_BASE64,
        }),
      }),
    );
  });

  it('carries everything to the next fallback and logs why the previous one failed', async () => {
    const info = jest.spyOn(logger, 'info').mockImplementation(() => logger);
    anthropic.status = 529;
    const { gate } = await runAgent();

    expect(anthropic.bodies).toHaveLength(1);
    expect(gate.getServed()).toEqual(['gpt']);
    const [body] = openAI.bodies;
    const messages = body.messages as Array<{ role: string; content: unknown }>;
    expect(messages[0]).toEqual(expect.objectContaining({ role: 'system' }));
    expect(JSON.stringify(messages[0].content)).toContain('Meccanica Rossi');
    expect(
      (body.tools as Array<{ function: { name: string } }>).map((tool) => tool.function.name),
    ).toContain('web_search');
    expect(JSON.stringify(messages[1].content)).toContain(
      `data:application/pdf;base64,${PDF_BASE64}`,
    );

    const logs = info.mock.calls.map(([message]) => String(message));
    expect(logs).toContainEqual(
      expect.stringMatching(/^\[modelFallback\] "primary" failed \(429 /),
    );
    expect(logs).toContainEqual(expect.stringMatching(/"claude" failed \(529 .*\), trying "gpt"$/));
    expect(logs.every((message) => !message.includes('\n'))).toBe(true);
    info.mockRestore();
  });
});
