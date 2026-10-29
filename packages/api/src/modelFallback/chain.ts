import { logger } from '@librechat/data-schemas';

/** The spec fields the fallback reads, loose enough for the deep-partial specs of the app config. */
export interface FallbackSpec {
  name?: string;
  label?: string;
  preset?: { endpoint?: string | null; model?: string | null } & Record<string, unknown>;
  router?: unknown;
}

/** `modelFallback` as it reaches the app config, where every field may be missing. */
export interface ModelFallbackConfigInput {
  tiers?: (string | undefined)[][];
}

export interface FallbackPrimary {
  endpoint: string;
  model: string;
  /** The spec the user picked, which tells apart specs sharing endpoint and model. */
  spec?: string;
}

const warnedNames = new Set<string>();

/** Once per name and process: the chain is resolved on every request. */
function warnUnknownName(name: string | undefined): void {
  const key = String(name);
  if (warnedNames.has(key)) {
    return;
  }
  warnedNames.add(key);
  logger.warn(`[modelFallback] modelFallback.tiers: "${key}" is not a usable model spec, ignored`);
}

function isConcreteSpec(spec: FallbackSpec | undefined): spec is FallbackSpec {
  return spec != null && spec.router == null && !!spec.preset?.endpoint && !!spec.preset?.model;
}

function servesPrimary(spec: FallbackSpec, primary: FallbackPrimary): boolean {
  return spec.preset?.endpoint === primary.endpoint && spec.preset?.model === primary.model;
}

/** The spec the user picked when it serves the primary model. */
export function findPrimarySpec(
  specs: FallbackSpec[],
  primary: FallbackPrimary,
): FallbackSpec | undefined {
  if (primary.spec == null) {
    return undefined;
  }
  return specs.find((spec) => spec.name === primary.spec && servesPrimary(spec, primary));
}

/** Other providers first: a rate limit or an outage usually hits every deployment of a provider. */
function otherProvidersFirst(tier: FallbackSpec[], endpoint: string): FallbackSpec[] {
  return [
    ...tier.filter((spec) => spec.preset?.endpoint !== endpoint),
    ...tier.filter((spec) => spec.preset?.endpoint === endpoint),
  ];
}

/** The tier of the picked spec; otherwise the highest tier serving the model, never a lower one. */
function findPrimaryTier(tiers: FallbackSpec[][], primary: FallbackPrimary): number {
  const pickedTier = tiers.findIndex((tier) =>
    tier.some((spec) => spec.name === primary.spec && servesPrimary(spec, primary)),
  );
  if (pickedTier !== -1) {
    return pickedTier;
  }
  return tiers.reduce(
    (highest, tier, index) => (tier.some((spec) => servesPrimary(spec, primary)) ? index : highest),
    -1,
  );
}

/**
 * Specs the primary model falls back to, in order of attempt: the rest of its tier, then each
 * higher tier. Never a lower tier; nothing when the primary belongs to no tier.
 */
export function resolveFallbackChain(
  config: ModelFallbackConfigInput | undefined,
  specs: FallbackSpec[],
  primary: FallbackPrimary,
): FallbackSpec[] {
  const specsByName = new Map(specs.map((spec) => [spec.name, spec]));
  const tiers = (config?.tiers ?? []).map((tier) =>
    tier.flatMap((name) => {
      const spec = specsByName.get(name);
      if (isConcreteSpec(spec)) {
        return [spec];
      }
      warnUnknownName(name);
      return [];
    }),
  );
  const primaryTier = findPrimaryTier(tiers, primary);
  if (primaryTier === -1) {
    return [];
  }
  return tiers.slice(primaryTier).flatMap((tier) =>
    otherProvidersFirst(
      tier.filter((spec) => !servesPrimary(spec, primary)),
      primary.endpoint,
    ),
  );
}
