import { logger } from '@librechat/data-schemas';
import { parseCompactConvo } from 'librechat-data-provider';
import type { EndpointSchemaKey, TPreset } from 'librechat-data-provider';
import type { FallbackConfig } from '@librechat/agents';
import type { EndpointTokenConfig } from '~/types/tokens';
import type { ModelFallbackGate } from './gate';
import type { FallbackSpec } from './chain';

const GATE_KEY = Symbol('simpleai.modelFallbackGate');

/** Preset fields that describe the spec, not the call to the model. */
const PRESENTATION_FIELDS = [
  'endpoint',
  'endpointType',
  'spec',
  'iconURL',
  'greeting',
  'modelLabel',
  'promptPrefix',
  'maxContextTokens',
] as const;

export interface FallbackEntry {
  provider: string;
  llmConfig: Record<string, unknown>;
  maxContextTokens?: number;
  endpointTokenConfig?: EndpointTokenConfig;
}

/** Builds the client options of one fallback the way the primary model's are built. */
export type BuildFallbackEntry = (
  endpoint: string,
  modelParameters: Record<string, unknown>,
) => Promise<FallbackEntry>;

/** The fallback answers with the parameters of its own spec (thinking, output limits). */
export function getSpecModelParameters(preset: Record<string, unknown>): Record<string, unknown> {
  const parsed =
    parseCompactConvo({
      endpoint: preset.endpoint as EndpointSchemaKey,
      endpointType: preset.endpointType as EndpointSchemaKey | null | undefined,
      conversation: preset as Partial<TPreset>,
    }) ?? {};
  const parameters: Record<string, unknown> = { ...parsed, model: preset.model };
  for (const field of PRESENTATION_FIELDS) {
    delete parameters[field];
  }
  return parameters;
}

/**
 * A fallback whose context window is smaller than the primary's is left out: the library would
 * fail to fit the conversation and start its overflow recovery instead of answering.
 */
export async function buildModelFallbacks({
  chain,
  gate,
  buildEntry,
  minContextTokens,
}: {
  chain: FallbackSpec[];
  gate: ModelFallbackGate;
  buildEntry: BuildFallbackEntry;
  minContextTokens?: number;
}): Promise<FallbackConfig[]> {
  const fallbacks: FallbackConfig[] = [];
  for (const spec of chain) {
    const preset = spec.preset ?? {};
    const model = String(preset.model);
    try {
      const entry = await buildEntry(String(preset.endpoint), getSpecModelParameters(preset));
      /** The spec's own window wins over the model's, as it does when the spec is the primary. */
      const maxContextTokens =
        typeof preset.maxContextTokens === 'number'
          ? preset.maxContextTokens
          : entry.maxContextTokens;
      if (
        minContextTokens != null &&
        maxContextTokens != null &&
        maxContextTokens < minContextTokens
      ) {
        logger.debug(`[modelFallback] Skipping "${spec.name}": smaller context window`);
        continue;
      }
      const callbacks = Array.isArray(entry.llmConfig.callbacks) ? entry.llmConfig.callbacks : [];
      fallbacks.push({
        provider: entry.provider,
        clientOptions: {
          ...entry.llmConfig,
          callbacks: [
            ...callbacks,
            gate.fallbackCallback({
              name: spec.name ?? model,
              model,
              endpointTokenConfig: entry.endpointTokenConfig,
            }),
          ],
        },
        maxContextTokens,
      } as FallbackConfig);
    } catch (error) {
      logger.warn(`[modelFallback] Skipping fallback spec "${spec.name}"`, error);
    }
  }
  return fallbacks;
}

/** Non-enumerable, so the gate never travels with a serialized agent. */
export function attachModelFallbackGate(agent: object, gate: ModelFallbackGate): void {
  Object.defineProperty(agent, GATE_KEY, { value: gate, enumerable: false, configurable: true });
}

export function getModelFallbackGate(agent: unknown): ModelFallbackGate | undefined {
  if (typeof agent !== 'object' || agent === null) {
    return undefined;
  }
  return (agent as { [GATE_KEY]?: ModelFallbackGate })[GATE_KEY];
}
