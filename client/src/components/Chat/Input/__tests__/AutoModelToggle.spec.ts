import type { TModelSpec } from 'librechat-data-provider';
import { getManualSpec } from '../AutoModelToggle';

const spec = (name: string, extra: Partial<TModelSpec> = {}): TModelSpec => ({
  name,
  label: name,
  preset: { endpoint: 'anthropic', model: name },
  ...extra,
});

const specs: TModelSpec[] = [
  spec('auto', { autoRouter: true, default: true }),
  spec('opus'),
  spec('sonnet', { softDefault: true }),
];

describe('getManualSpec', () => {
  it('returns to the spec the user had before switching Auto on', () => {
    expect(getManualSpec(specs, 'opus')?.name).toBe('opus');
  });

  it('falls back to the soft default when nothing was remembered', () => {
    expect(getManualSpec(specs, null)?.name).toBe('sonnet');
  });

  it('never returns the automatic spec itself', () => {
    expect(getManualSpec(specs, 'auto')?.name).toBe('sonnet');
    expect(getManualSpec([specs[0], spec('haiku')], null)?.name).toBe('haiku');
  });
});
