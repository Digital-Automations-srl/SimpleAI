import http from 'node:http';
import { HumanMessage } from '@langchain/core/messages';
import { Providers, tryFallbackProviders } from '@librechat/agents';
import type { AddressInfo } from 'node:net';
import type { FallbackConfig } from '@librechat/agents';
import { createModelFallbackGate } from './gate';

/**
 * The gate inside the real `tryFallbackProviders` of `@librechat/agents`: the fallback is a real
 * OpenAI client talking to a local server, so only the provider's HTTP endpoint is faked.
 */
function streamChunk(content: string, finish: string | null = null): string {
  return `data: ${JSON.stringify({
    id: 'chatcmpl-1',
    object: 'chat.completion.chunk',
    created: 0,
    model: 'fallback-model',
    choices: [{ index: 0, delta: { content }, finish_reason: finish }],
  })}\n\n`;
}

describe('model fallback inside @librechat/agents', () => {
  let server: http.Server;
  let baseURL: string;
  let requests = 0;

  beforeAll(async () => {
    server = http.createServer((req, res) => {
      requests += 1;
      req.resume();
      req.on('end', () => {
        res.writeHead(200, { 'Content-Type': 'text/event-stream' });
        res.write(streamChunk('Risposta di riserva'));
        res.write(streamChunk('', 'stop'));
        res.end('data: [DONE]\n\n');
      });
    });
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    baseURL = `http://127.0.0.1:${(server.address() as AddressInfo).port}/v1`;
  });

  afterAll(async () => {
    await new Promise((resolve) => server.close(resolve));
  });

  beforeEach(() => {
    requests = 0;
  });

  const fallbackFor = (gate: ReturnType<typeof createModelFallbackGate>): FallbackConfig[] => [
    {
      provider: Providers.OPENAI,
      clientOptions: {
        model: 'fallback-model',
        apiKey: 'test-key',
        streaming: true,
        maxRetries: 0,
        configuration: { baseURL },
        callbacks: [gate.fallbackCallback('fallback-model')],
      },
    } as FallbackConfig,
  ];

  /** Streaming the answer needs a whole Graph; reaching the provider is what the gate decides. */
  it('lets the fallback reach its provider after a rate limit', async () => {
    const gate = createModelFallbackGate();
    const primaryError = Object.assign(new Error('exceeded token rate limit'), { status: 429 });
    gate.primaryCallback.handleLLMError(primaryError);

    const attempt = tryFallbackProviders({
      fallbacks: fallbackFor(gate),
      messages: [new HumanMessage('ciao')],
      primaryError,
    }).catch((error: unknown) => error);

    expect(await attempt).not.toBe(primaryError);
    expect(requests).toBe(1);
  });

  it('never calls the fallback for a request error and rethrows it', async () => {
    const gate = createModelFallbackGate();
    const primaryError = Object.assign(new Error('Invalid file'), { status: 400 });
    gate.primaryCallback.handleLLMError(primaryError);

    await expect(
      tryFallbackProviders({
        fallbacks: fallbackFor(gate),
        messages: [new HumanMessage('ciao')],
        primaryError,
      }),
    ).rejects.toBe(primaryError);
    expect(requests).toBe(0);
    expect(gate.getServedModels()).toEqual([]);
  });

  it('never calls the fallback once the primary streamed text', async () => {
    const gate = createModelFallbackGate();
    const primaryError = Object.assign(new Error('Overloaded'), { status: 529 });
    gate.primaryCallback.handleLLMNewToken('Ecco');
    gate.primaryCallback.handleLLMError(primaryError);

    await expect(
      tryFallbackProviders({
        fallbacks: fallbackFor(gate),
        messages: [new HumanMessage('ciao')],
        primaryError,
      }),
    ).rejects.toBe(primaryError);
    expect(requests).toBe(0);
  });
});
