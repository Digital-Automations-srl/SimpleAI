import type { BuildFallbackEntry } from './build';
import type { FallbackSpec } from './chain';
import {
  buildModelFallbacks,
  getModelFallbackGate,
  getSpecModelParameters,
  attachModelFallbackGate,
} from './build';
import { createModelFallbackGate } from './gate';

const chain: FallbackSpec[] = [
  { name: 'broken', preset: { endpoint: 'openAI', model: 'gpt-6-mini' } },
  { name: 'sonnet-5', preset: { endpoint: 'anthropic', model: 'claude-sonnet-5', thinking: true } },
];

describe('buildModelFallbacks', () => {
  it('skips an entry that cannot be built and hooks the gate on the others', async () => {
    const gate = createModelFallbackGate();
    const calls: Array<[string, Record<string, unknown>]> = [];
    const buildEntry: BuildFallbackEntry = async (endpoint, modelParameters) => {
      calls.push([endpoint, modelParameters]);
      if (endpoint === 'openAI') {
        throw new Error('No API key');
      }
      return {
        provider: 'anthropic',
        llmConfig: { model: modelParameters.model, callbacks: ['existing'] },
        maxContextTokens: 200000,
      };
    };

    const fallbacks = await buildModelFallbacks({ chain, gate, buildEntry });

    expect(calls.map(([endpoint]) => endpoint)).toEqual(['openAI', 'anthropic']);
    expect(fallbacks).toHaveLength(1);
    expect(fallbacks[0].provider).toBe('anthropic');
    expect(fallbacks[0].maxContextTokens).toBe(200000);
    const { model, callbacks } = fallbacks[0].clientOptions as {
      model: string;
      callbacks: unknown[];
    };
    expect(model).toBe('claude-sonnet-5');
    expect(callbacks[0]).toBe('existing');
    expect(callbacks[1]).toMatchObject({ name: 'simpleai-model-fallback-entry' });
  });
});

describe('getSpecModelParameters', () => {
  it('keeps the model parameters of the spec and drops its presentation fields', () => {
    const parameters = getSpecModelParameters({
      endpoint: 'anthropic',
      model: 'claude-sonnet-5',
      thinking: true,
      iconURL: 'anthropic',
      greeting: 'Ciao',
      modelLabel: 'Sonnet 5',
      promptPrefix: 'Sei un assistente',
    });
    expect(parameters).toMatchObject({ model: 'claude-sonnet-5', thinking: true });
    for (const key of ['endpoint', 'iconURL', 'greeting', 'modelLabel', 'promptPrefix']) {
      expect(parameters).not.toHaveProperty(key);
    }
  });
});

describe('attachModelFallbackGate', () => {
  it('keeps the gate off the serialized agent', () => {
    const agent = { id: 'agent', model: 'gpt-6-luna' };
    const gate = createModelFallbackGate();
    attachModelFallbackGate(agent, gate);

    expect(getModelFallbackGate(agent)).toBe(gate);
    expect(JSON.parse(JSON.stringify(agent))).toEqual({ id: 'agent', model: 'gpt-6-luna' });
    expect(getModelFallbackGate({})).toBeUndefined();
    expect(getModelFallbackGate(undefined)).toBeUndefined();
  });
});
