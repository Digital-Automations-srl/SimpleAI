import type { FallbackPrimary, FallbackSpec, ModelFallbackConfigInput } from './chain';
import type { BuildFallbackEntry } from './build';
import type { ModelFallbackGate } from './gate';
import { resolveFallbackChain } from './chain';
import { buildModelFallbacks } from './build';
import { createModelFallbackGate } from './gate';

export interface ModelFallbackAppConfig {
  config?: { modelFallback?: ModelFallbackConfigInput };
  modelSpecs?: { list?: FallbackSpec[] };
}

/**
 * Hooks the fallback chain of the primary model on its client options; returns the gate that
 * records which fallbacks answered, or undefined when the model has no fallback.
 */
export async function applyModelFallbacks({
  llmConfig,
  primary,
  appConfig,
  buildEntry,
}: {
  llmConfig: Record<string, unknown>;
  primary: FallbackPrimary & { maxContextTokens?: number };
  appConfig?: ModelFallbackAppConfig;
  buildEntry: BuildFallbackEntry;
}): Promise<ModelFallbackGate | undefined> {
  const chain = resolveFallbackChain(
    appConfig?.config?.modelFallback,
    appConfig?.modelSpecs?.list ?? [],
    primary,
  );
  if (chain.length === 0) {
    return undefined;
  }
  const gate = createModelFallbackGate();
  const fallbacks = await buildModelFallbacks({
    chain,
    gate,
    buildEntry,
    minContextTokens: primary.maxContextTokens,
  });
  if (fallbacks.length === 0) {
    return undefined;
  }
  const callbacks = Array.isArray(llmConfig.callbacks) ? llmConfig.callbacks : [];
  llmConfig.callbacks = [...callbacks, gate.primaryCallback];
  llmConfig.fallbacks = fallbacks;
  return gate;
}
