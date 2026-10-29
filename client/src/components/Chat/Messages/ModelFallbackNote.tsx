import { useMemo } from 'react';
import type { TModelFallbackMeta } from 'librechat-data-provider';
import { useGetStartupConfig } from '~/data-provider';
import { useLocalize } from '~/hooks';

function FallbackNote({ meta }: { meta: TModelFallbackMeta }) {
  const localize = useLocalize();
  const { data: startupConfig } = useGetStartupConfig();

  /** The note names specs; notes saved before that named models, labelled by the model's spec. */
  const labels = useMemo(() => {
    const specs = startupConfig?.modelSpecs?.list ?? [];
    return {
      byName: new Map(specs.map((spec) => [spec.name, spec.label])),
      byModel: new Map(specs.map((spec) => [spec.preset.model, spec.label])),
    };
  }, [startupConfig?.modelSpecs?.list]);

  const labelOf = (name: string) => labels.byName.get(name) ?? labels.byModel.get(name) ?? name;
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
