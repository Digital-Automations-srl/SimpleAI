import type { TModelFallbackMeta } from 'librechat-data-provider';
import type { EndpointTokenConfig } from '~/types/tokens';
import { getModelFallbackGate } from './build';

/** What the response message records when fallback models answered for the agent's model. */
export function getModelFallbackMeta(agent: unknown): TModelFallbackMeta | undefined {
  const gate = getModelFallbackGate(agent);
  const to = gate?.getServed() ?? [];
  if (to.length === 0) {
    return undefined;
  }
  return { from: gate?.from ?? String((agent as { model?: unknown }).model), to };
}

/**
 * Rates for usage a fallback produced, so a fallback on another endpoint is billed at its own
 * prices: the producing agent is the connected one with the usage's id, otherwise the primary.
 * Undefined when the usage is not a fallback's.
 */
export function resolveFallbackTokenConfig({
  usage,
  primary,
  agents,
}: {
  usage?: { agentId?: string | null; model?: unknown } | null;
  primary: unknown;
  agents?: Map<string, unknown>;
}): { endpointTokenConfig?: EndpointTokenConfig } | undefined {
  const agentId = usage?.agentId;
  const agent = agentId != null && agents?.has(agentId) ? agents.get(agentId) : primary;
  return getModelFallbackGate(agent)?.getTokenConfig(usage?.model);
}

/**
 * An aborted turn whose model failed and whose fallbacks produced nothing reached no provider
 * that bills: the estimated usage recorded on abort would charge tokens nobody consumed.
 */
export function isUnbilledFallbackAbort(agent: unknown): boolean {
  return getModelFallbackGate(agent)?.failedWithoutOutput() === true;
}
