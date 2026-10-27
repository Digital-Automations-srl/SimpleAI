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
  new FakeListChatModel({ responses: ['risposta'], callbacks: [gate.fallbackCallback(model)] });

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
    expect(gate.getServedModels()).toEqual(['claude-sonnet-5']);
  });

  it('rethrows the primary error itself when it is not worth a fallback', async () => {
    const gate = createModelFallbackGate();
    const failure = { status: 400 };
    gate.primaryCallback.handleLLMError(failure);

    await expect(fallbackModel(gate, 'claude-sonnet-5').invoke('ciao')).rejects.toBe(failure);
    expect(gate.getServedModels()).toEqual([]);
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
    gate.fallbackCallback('claude-sonnet-5').handleLLMError({ status: 401 });

    await expect(fallbackModel(gate, 'gpt-5.4').invoke('ciao')).resolves.toBeDefined();
  });

  it('stops the chain with the primary error after a fallback that streamed and failed', async () => {
    const gate = createModelFallbackGate();
    const primaryFailure = { status: 429 };
    gate.primaryCallback.handleLLMError(primaryFailure);
    const first = new FailingAfterTokenModel({ status: 503 });
    first.callbacks = [gate.fallbackCallback('gpt-6-luna-2')];

    await expect(consume(first)).rejects.toEqual({ status: 503 });
    await expect(fallbackModel(gate, 'claude-sonnet-5').invoke('ciao')).rejects.toBe(
      primaryFailure,
    );
    expect(gate.getServedModels()).toEqual([]);
  });

  it('keeps concurrent calls apart', () => {
    const gate = createModelFallbackGate();
    const fallback = gate.fallbackCallback('claude-sonnet-5');
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
    const fallback = gate.fallbackCallback('claude-sonnet-5');

    expect(() => fallback.handleChatModelStart(undefined, undefined, 'fa', 'node-a')).not.toThrow();
  });
});
