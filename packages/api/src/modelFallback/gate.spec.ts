import { logger } from '@librechat/data-schemas';
import { FakeListChatModel } from '@langchain/core/utils/testing';
import type { ModelFallbackGate } from './gate';
import { createModelFallbackGate, isFallbackEligibleError } from './gate';

class FailingAfterTokenModel extends FakeListChatModel {
  constructor(private readonly failure: object) {
    super({ responses: ['parziale'] });
  }

  async *_streamResponseChunks(
    ...args: Parameters<FakeListChatModel['_streamResponseChunks']>
  ): ReturnType<FakeListChatModel['_streamResponseChunks']> {
    const [, , runManager] = args;
    await runManager?.handleLLMNewToken('parziale');
    yield* [];
    throw this.failure;
  }
}

const fallbackModel = (gate: ModelFallbackGate, model: string) =>
  new FakeListChatModel({
    responses: ['risposta'],
    callbacks: [gate.fallbackCallback({ name: model, model })],
  });

describe('isFallbackEligibleError', () => {
  it.each([
    ['rate limit', { status: 429 }],
    ['overloaded status', { status: 529 }],
    ['server error', { status: 503 }],
    ['nested status', { response: { status: 500 } }],
    ['overloaded type', { error: { type: 'overloaded_error' } }],
    ['rate limit message', new Error('Your requests have exceeded token rate limit.')],
  ])('accepts %s', (_name, error) => {
    expect(isFallbackEligibleError(error)).toBe(true);
  });

  it.each([
    ['bad request', { status: 400 }],
    ['payload too large', { status: 413 }],
    ['context overflow', new Error('context length exceeded')],
    ['nothing', undefined],
  ])('refuses %s', (_name, error) => {
    expect(isFallbackEligibleError(error)).toBe(false);
  });
});

describe('createModelFallbackGate', () => {
  const consume = async (model: FakeListChatModel) => {
    const chunks = [];
    for await (const chunk of await model.stream('ciao')) {
      chunks.push(chunk);
    }
    return chunks;
  };

  it('lets a fallback answer a rate-limited primary and records it', async () => {
    const gate = createModelFallbackGate();
    gate.primaryCallback.handleLLMError({ status: 429 });

    await expect(fallbackModel(gate, 'claude-sonnet-5').invoke('ciao')).resolves.toBeDefined();
    expect(gate.getServed()).toEqual(['claude-sonnet-5']);
  });

  it('rethrows the primary error itself when it is not worth a fallback', async () => {
    const gate = createModelFallbackGate();
    const failure = { status: 400 };
    gate.primaryCallback.handleLLMError(failure);

    await expect(fallbackModel(gate, 'claude-sonnet-5').invoke('ciao')).rejects.toBe(failure);
    expect(gate.getServed()).toEqual([]);
  });

  it('keeps the error once the primary has streamed text', async () => {
    const gate = createModelFallbackGate();
    const failure = { status: 503 };
    gate.primaryCallback.handleLLMNewToken('Ciao');
    gate.primaryCallback.handleLLMError(failure);

    await expect(fallbackModel(gate, 'claude-sonnet-5').invoke('ciao')).rejects.toBe(failure);
  });

  it('does not count an empty token as text shown to the user', async () => {
    const gate = createModelFallbackGate();
    gate.primaryCallback.handleLLMNewToken('');
    gate.primaryCallback.handleLLMError({ status: 529 });

    await expect(fallbackModel(gate, 'claude-sonnet-5').invoke('ciao')).resolves.toBeDefined();
  });

  it('counts a streamed tool call as output shown to the user', async () => {
    const gate = createModelFallbackGate();
    const failure = { status: 503 };
    gate.primaryCallback.handleLLMNewToken('', undefined, 'run', undefined, undefined, {
      chunk: { message: { tool_call_chunks: [{ name: 'web_search', args: '' }] } },
    });
    gate.primaryCallback.handleLLMError(failure);

    await expect(fallbackModel(gate, 'claude-sonnet-5').invoke('ciao')).rejects.toBe(failure);
  });

  it('starts a new primary call clean', async () => {
    const gate = createModelFallbackGate();
    gate.primaryCallback.handleLLMNewToken('Ciao');
    gate.primaryCallback.handleLLMError({ status: 400 });
    gate.primaryCallback.handleChatModelStart();
    gate.primaryCallback.handleLLMError({ status: 429 });

    await expect(fallbackModel(gate, 'claude-sonnet-5').invoke('ciao')).resolves.toBeDefined();
  });

  it('tries the next fallback after one failing for its own reasons', async () => {
    const gate = createModelFallbackGate();
    const primaryFailure = { status: 429 };
    gate.primaryCallback.handleLLMError(primaryFailure);
    gate
      .fallbackCallback({ name: 'claude-sonnet-5', model: 'claude-sonnet-5' })
      .handleLLMError({ status: 401 });

    await expect(fallbackModel(gate, 'gpt-5.4').invoke('ciao')).resolves.toBeDefined();
  });

  it('stops the chain with the primary error after a fallback that streamed and failed', async () => {
    const gate = createModelFallbackGate();
    const primaryFailure = { status: 429 };
    gate.primaryCallback.handleLLMError(primaryFailure);
    const first = new FailingAfterTokenModel({ status: 503 });
    first.callbacks = [gate.fallbackCallback({ name: 'gpt-6-luna-2', model: 'gpt-6-luna-2' })];

    await expect(consume(first)).rejects.toEqual({ status: 503 });
    await expect(fallbackModel(gate, 'claude-sonnet-5').invoke('ciao')).rejects.toBe(
      primaryFailure,
    );
    expect(gate.getServed()).toEqual([]);
  });

  it('keeps concurrent calls apart', () => {
    const gate = createModelFallbackGate();
    const fallback = gate.fallbackCallback({ name: 'claude-sonnet-5', model: 'claude-sonnet-5' });
    const failure = { status: 503 };
    gate.primaryCallback.handleChatModelStart(undefined, undefined, 'a', 'node-a');
    gate.primaryCallback.handleLLMNewToken('Ciao', undefined, 'a', 'node-a');
    gate.primaryCallback.handleLLMError(failure, 'a', 'node-a');
    gate.primaryCallback.handleChatModelStart(undefined, undefined, 'b', 'node-b');

    expect(() => fallback.handleChatModelStart(undefined, undefined, 'fa', 'node-a')).toThrow(
      expect.objectContaining(failure),
    );
  });

  it('never blocks a fallback with an undefined error', () => {
    const gate = createModelFallbackGate();
    const fallback = gate.fallbackCallback({ name: 'claude-sonnet-5', model: 'claude-sonnet-5' });

    expect(() => fallback.handleChatModelStart(undefined, undefined, 'fa', 'node-a')).not.toThrow();
  });

  it('leaves no note for a context summary a fallback wrote', () => {
    const gate = createModelFallbackGate();
    const fallback = gate.fallbackCallback({ name: 'sonnet-5', model: 'claude-sonnet-5' });
    fallback.handleChatModelStart(undefined, undefined, 'summary', 'node', undefined, [], {
      summarization: true,
    });
    fallback.handleLLMEnd(undefined, 'summary');
    fallback.handleChatModelStart(undefined, undefined, 'answer', 'node');
    fallback.handleLLMEnd(undefined, 'answer');

    expect(gate.getServed()).toEqual(['sonnet-5']);
  });

  it('names the fallback by its spec', () => {
    const gate = createModelFallbackGate({ from: 'luna' });
    gate.fallbackCallback({ name: 'auto-sonnet', model: 'claude-sonnet-5' }).handleLLMEnd();

    expect(gate.from).toBe('luna');
    expect(gate.getServed()).toEqual(['auto-sonnet']);
  });

  it("prices a fallback's usage with its own rates, never the primary's", () => {
    const rates = { 'glm-5': { prompt: 1, completion: 2, context: 64000 } };
    const gate = createModelFallbackGate({ primaryModel: 'gpt-6-luna' });
    gate.fallbackCallback({ name: 'glm', model: 'glm-5', endpointTokenConfig: rates });
    gate.fallbackCallback({ name: 'sonnet-5', model: 'claude-sonnet-5' });
    gate.fallbackCallback({ name: 'luna-eu', model: 'gpt-6-luna', endpointTokenConfig: rates });

    expect(gate.getTokenConfig('glm-5')).toEqual({ endpointTokenConfig: rates });
    expect(gate.getTokenConfig('claude-sonnet-5')).toEqual({ endpointTokenConfig: undefined });
    expect(gate.getTokenConfig('gpt-6-luna')).toBeUndefined();
    expect(gate.getTokenConfig(undefined)).toBeUndefined();
  });

  it('logs at info level when a fallback takes over', async () => {
    const info = jest.spyOn(logger, 'info').mockImplementation(() => logger);
    const gate = createModelFallbackGate({ from: 'luna' });
    gate.primaryCallback.handleLLMError({ status: 429, message: 'rate limit' });

    await fallbackModel(gate, 'claude-sonnet-5').invoke('ciao');

    expect(info).toHaveBeenCalledWith(
      '[modelFallback] "luna" failed (429 rate limit), trying "claude-sonnet-5"',
    );
    info.mockRestore();
  });
});
