import { useMemo } from 'react';
import type { TModelFallbackMeta } from 'librechat-data-provider';
import { useGetStartupConfig } from '~/data-provider';
import { useLocalize } from '~/hooks';

function FallbackNote({ meta }: { meta: TModelFallbackMeta }) {
  const localize = useLocalize();
  const { data: startupConfig } = useGetStartupConfig();

  const labels = useMemo(
    () =>
      new Map(
        (startupConfig?.modelSpecs?.list ?? []).map((spec) => [spec.preset.model, spec.label]),
      ),
    [startupConfig?.modelSpecs?.list],
  );

  const labelOf = (model: string) => labels.get(model) ?? model;
  return (
    <p className="mt-1 text-xs text-text-secondary">
      {localize('com_ui_model_fallback_note', {
        0: meta.to.map(labelOf).join(', '),
        1: labelOf(meta.from),
      })}
    </p>
  );
}

/**
 * SimpleAI: under a response answered by fallback models, names them and the unavailable one.
 * Responses without a fallback render nothing and read no configuration.
 */
export default function ModelFallbackNote({ meta }: { meta?: TModelFallbackMeta }) {
  if (meta == null || meta.to.length === 0) {
    return null;
  }
  return <FallbackNote meta={meta} />;
}
