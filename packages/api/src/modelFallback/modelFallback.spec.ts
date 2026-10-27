import type { FallbackSpec } from './chain';
import { attachModelFallbackGate } from './build';
import { createModelFallbackGate } from './gate';
import { resolveFallbackChain } from './chain';
import { getModelFallbackMeta } from './note';

const spec = (name: string, endpoint: string, model: string): FallbackSpec => ({
  name,
  label: name.toUpperCase(),
  preset: { endpoint, model },
});

const specs: FallbackSpec[] = [
  spec('h', 'anthropic', 'claude-haiku-5-5'),
  spec('m', 'openAI', 'gpt-6-mini'),
  spec('s', 'anthropic', 'claude-sonnet-5'),
  spec('l', 'azureOpenAI', 'gpt-6-luna'),
  spec('l2', 'azureOpenAI', 'gpt-6-luna-2'),
  spec('o', 'anthropic', 'claude-opus-4-8'),
  spec('r', 'openAI', 'gpt-6-reasoning'),
  { name: 'auto', router: { candidates: {} } },
];

const config = {
  tiers: [
    ['h', 'm'],
    ['l', 'l2', 's'],
    ['o', 'r'],
  ],
};

const names = (chain: FallbackSpec[]) => chain.map((entry) => entry.name);

describe('resolveFallbackChain', () => {
  it('tries the same tier first, other providers before the same one, then the higher tiers', () => {
    const chain = resolveFallbackChain(config, specs, {
      endpoint: 'azureOpenAI',
      model: 'gpt-6-luna',
    });
    expect(names(chain)).toEqual(['s', 'l2', 'o', 'r']);
  });

  it('never falls back to a lower tier', () => {
    const chain = resolveFallbackChain(config, specs, {
      endpoint: 'anthropic',
      model: 'claude-opus-4-8',
    });
    expect(names(chain)).toEqual(['r']);
  });

  it('has no fallback for a model outside every tier', () => {
    expect(
      resolveFallbackChain(config, specs, { endpoint: 'google', model: 'gemini-3-pro' }),
    ).toEqual([]);
  });

  it('has no fallback without the configuration', () => {
    expect(
      resolveFallbackChain(undefined, specs, { endpoint: 'azureOpenAI', model: 'gpt-6-luna' }),
    ).toEqual([]);
  });

  it('ignores names without a concrete spec', () => {
    const chain = resolveFallbackChain(
      { tiers: [['h', 'missing', 'auto', 'm']] },
      [...specs, { name: 'partial', preset: { endpoint: 'openAI' } }],
      { endpoint: 'anthropic', model: 'claude-haiku-5-5' },
    );
    expect(names(chain)).toEqual(['m']);
  });
});

describe('resolveFallbackChain with specs sharing a model', () => {
  const shared: FallbackSpec[] = [
    spec('mini', 'openAI', 'gpt-5.4-mini'),
    spec('gpt', 'azureOpenAI', 'gpt-5.4'),
    spec('sonnet', 'anthropic', 'claude-sonnet-5'),
    spec('reasoning', 'azureOpenAI', 'gpt-5.4'),
    spec('opus', 'anthropic', 'claude-opus-4-8'),
  ];
  const tiers = { tiers: [['mini'], ['gpt', 'sonnet'], ['reasoning', 'opus']] };
  const primary = { endpoint: 'azureOpenAI', model: 'gpt-5.4' };

  it('uses the tier of the spec the user picked', () => {
    expect(names(resolveFallbackChain(tiers, shared, { ...primary, spec: 'reasoning' }))).toEqual([
      'opus',
    ]);
    expect(names(resolveFallbackChain(tiers, shared, { ...primary, spec: 'gpt' }))).toEqual([
      'sonnet',
      'opus',
    ]);
  });

  it('uses the highest matching tier without a spec, so it never steps down', () => {
    expect(names(resolveFallbackChain(tiers, shared, primary))).toEqual(['opus']);
  });

  it('ignores a spec that does not serve the primary model', () => {
    expect(names(resolveFallbackChain(tiers, shared, { ...primary, spec: 'mini' }))).toEqual([
      'opus',
    ]);
  });
});

describe('getModelFallbackMeta', () => {
  it('has nothing to say for an agent without fallbacks', () => {
    expect(getModelFallbackMeta({ model: 'gpt-6-luna' })).toBeUndefined();
  });

  it('has nothing to say when no fallback answered', () => {
    const agent = { model: 'gpt-6-luna' };
    attachModelFallbackGate(agent, createModelFallbackGate());
    expect(getModelFallbackMeta(agent)).toBeUndefined();
  });

  it('names the primary and the fallbacks that answered', async () => {
    const agent = { model: 'gpt-6-luna' };
    const gate = createModelFallbackGate();
    attachModelFallbackGate(agent, gate);
    gate.fallbackCallback('claude-sonnet-5').handleLLMEnd();
    expect(getModelFallbackMeta(agent)).toEqual({ from: 'gpt-6-luna', to: ['claude-sonnet-5'] });
  });
});
