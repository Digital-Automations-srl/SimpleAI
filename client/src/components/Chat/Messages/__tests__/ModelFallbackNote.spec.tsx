import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import type { TStartupConfig } from 'librechat-data-provider';
import ModelFallbackNote from '../ModelFallbackNote';

/** Translations are replaced by the key and its values, so the test sees what the note names. */
const mockStartupConfig: { current?: Partial<TStartupConfig> } = {};

jest.mock('~/hooks', () => ({
  useLocalize: () => (key: string, values?: Record<string, string>) =>
    [key, values?.[0], values?.[1]].join('|'),
}));

jest.mock('~/data-provider', () => ({
  useGetStartupConfig: () => ({ data: mockStartupConfig.current }),
}));

describe('ModelFallbackNote', () => {
  beforeEach(() => {
    mockStartupConfig.current = {
      modelSpecs: {
        list: [
          {
            name: 'luna',
            label: 'GPT-6 Luna',
            preset: { endpoint: 'azureOpenAI', model: 'gpt-6-luna' },
          },
          {
            name: 'sonnet-5',
            label: 'Sonnet 5',
            preset: { endpoint: 'anthropic', model: 'claude-sonnet-5' },
          },
        ],
      },
    } as Partial<TStartupConfig>;
  });

  it('names the fallback and the unavailable model by their labels', () => {
    render(<ModelFallbackNote meta={{ from: 'gpt-6-luna', to: ['claude-sonnet-5'] }} />);
    expect(screen.getByText('com_ui_model_fallback_note|Sonnet 5|GPT-6 Luna')).toBeInTheDocument();
  });

  it('falls back to the model id for a model without a spec', () => {
    render(<ModelFallbackNote meta={{ from: 'gpt-6-luna', to: ['claude-sonnet-5', 'llama-4'] }} />);
    expect(
      screen.getByText('com_ui_model_fallback_note|Sonnet 5, llama-4|GPT-6 Luna'),
    ).toBeInTheDocument();
  });

  it('renders nothing without a fallback', () => {
    const { container } = render(<ModelFallbackNote meta={undefined} />);
    expect(container).toBeEmptyDOMElement();
  });
});
