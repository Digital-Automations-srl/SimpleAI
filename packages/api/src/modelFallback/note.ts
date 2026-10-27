import type { TModelFallbackMeta } from 'librechat-data-provider';
import { getModelFallbackGate } from './build';

/** What the response message records when fallback models answered for the agent's model. */
export function getModelFallbackMeta(agent: unknown): TModelFallbackMeta | undefined {
  const to = getModelFallbackGate(agent)?.getServedModels() ?? [];
  if (to.length === 0) {
    return undefined;
  }
  return { from: String((agent as { model?: unknown }).model), to };
}
