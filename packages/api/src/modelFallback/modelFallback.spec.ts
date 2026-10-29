import { logger } from '@librechat/data-schemas';
import type { FallbackSpec } from './chain';
import { createInitializedAgentContextFingerprint } from '~/agents/compatibility';
import { getModelFallbackMeta, resolveFallbackTokenConfig } from './note';
import { sanitizeResumeModelParameters } from '~/agents/hitl/policy';
import { applyModelFallbacks, omitModelFallbacks } from './apply';
import { resolveFallbackChain, findPrimarySpec } from './chain';
import { attachModelFallbackGate } from './build';
import { createModelFallbackGate } from './gate';

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
    gate.fallbackCallback({ name: 'claude-sonnet-5', model: 'claude-sonnet-5' }).handleLLMEnd();
    expect(getModelFallbackMeta(agent)).toEqual({ from: 'gpt-6-luna', to: ['claude-sonnet-5'] });
  });
});

describe('unknown names in the tiers', () => {
  it('are ignored with one warning per name', () => {
    const warn = jest.spyOn(logger, 'warn').mockImplementation(() => logger);
    const withTypo = {
      tiers: [
        ['h', 'haiku-typo'],
        ['o', 'router'],
      ],
    };
    const withRouter = [...specs, { name: 'router', router: { candidates: {} } }];
    const primary = { endpoint: 'anthropic', model: 'claude-haiku-5-5' };

    expect(names(resolveFallbackChain(withTypo, withRouter, primary))).toEqual(['o']);
    resolveFallbackChain(withTypo, withRouter, primary);

    const messages = warn.mock.calls.map(([message]) => String(message));
    expect(messages.filter((message) => message.includes('"haiku-typo"'))).toHaveLength(1);
    expect(messages.filter((message) => message.includes('"router"'))).toHaveLength(1);
    warn.mockRestore();
  });
});

describe('findPrimarySpec', () => {
  it('is the picked spec only when it serves the primary model', () => {
    expect(
      findPrimarySpec(specs, { endpoint: 'anthropic', model: 'claude-sonnet-5', spec: 's' }),
    ).toMatchObject({ name: 's' });
    expect(
      findPrimarySpec(specs, { endpoint: 'anthropic', model: 'claude-opus-4-8', spec: 's' }),
    ).toBeUndefined();
    expect(
      findPrimarySpec(specs, { endpoint: 'anthropic', model: 'claude-sonnet-5' }),
    ).toBeUndefined();
  });
});

describe('applyModelFallbacks', () => {
  const buildEntry = async (_endpoint: string, parameters: Record<string, unknown>) => ({
    provider: 'anthropic',
    llmConfig: { model: parameters.model },
  });

  it('names the primary by its spec in the note', async () => {
    const agent = { model: 'claude-sonnet-5' };
    const gate = await applyModelFallbacks({
      llmConfig: {},
      primary: { endpoint: 'anthropic', model: 'claude-sonnet-5', spec: 's' },
      appConfig: { config: { modelFallback: config }, modelSpecs: { list: specs } },
      buildEntry,
    });
    if (gate == null) {
      throw new Error('expected a gate');
    }
    attachModelFallbackGate(agent, gate);
    gate.fallbackCallback({ name: 'o', model: 'claude-opus-4-8' }).handleLLMEnd();

    expect(getModelFallbackMeta(agent)).toEqual({ from: 's', to: ['o'] });
  });
});

describe('resolveFallbackTokenConfig', () => {
  const rates = { 'glm-5': { prompt: 1, completion: 2, context: 64000 } };

  it("finds the rates on the producing agent's gate", () => {
    const primary = { model: 'gpt-6-luna' };
    const connected = { model: 'claude-sonnet-5' };
    const gate = createModelFallbackGate();
    gate.fallbackCallback({ name: 'glm', model: 'glm-5', endpointTokenConfig: rates });
    attachModelFallbackGate(connected, gate);
    const agents = new Map<string, unknown>([['agent_b', connected]]);

    expect(
      resolveFallbackTokenConfig({
        usage: { agentId: 'agent_b', model: 'glm-5' },
        primary,
        agents,
      }),
    ).toEqual({ endpointTokenConfig: rates });
    expect(
      resolveFallbackTokenConfig({
        usage: { agentId: 'agent_a', model: 'glm-5' },
        primary,
        agents,
      }),
    ).toBeUndefined();
  });
});

describe('fallbacks outside resume and context fingerprint', () => {
  const withFallbacks = {
    model: 'gpt-6-luna',
    temperature: 0.2,
    fallbacks: [{ provider: 'anthropic', clientOptions: { model: 'claude-sonnet-5' } }],
  };
  const { fallbacks: _fallbacks, ...withoutFallbacks } = withFallbacks;

  it('omitModelFallbacks drops only the chain', () => {
    expect(omitModelFallbacks(withFallbacks)).toEqual(withoutFallbacks);
    expect(omitModelFallbacks(undefined)).toBeUndefined();
  });

  it('resume params never carry the chain', () => {
    expect(sanitizeResumeModelParameters(withFallbacks)).not.toHaveProperty('fallbacks');
  });

  it('the chain does not change the agent context fingerprint', () => {
    const fingerprint = (model_parameters: object) =>
      createInitializedAgentContextFingerprint({
        agents: [{ id: 'agent', provider: 'openAI', model: 'gpt-6-luna', model_parameters }],
      } as never).digest;

    expect(fingerprint(withFallbacks)).toBe(fingerprint(withoutFallbacks));
  });
});
