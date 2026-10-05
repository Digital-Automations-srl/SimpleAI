import { renderHook, act } from '@testing-library/react';
import { EModelEndpoint } from 'librechat-data-provider';
import type { TConversation, TEndpointsConfig, TModelSpec } from 'librechat-data-provider';

jest.mock('recoil', () => ({
  ...jest.requireActual('recoil'),
  useRecoilValue: jest.fn(() => false),
}));

jest.mock('react-router-dom', () => ({
  useSearchParams: jest.fn(() => [new URLSearchParams()]),
}));

jest.mock('~/hooks', () => ({
  useDefaultConvo: jest.fn(() => jest.fn()),
}));

import useSelectMention from '../useSelectMention';

const endpointsConfig = {
  [EModelEndpoint.anthropic]: { type: EModelEndpoint.anthropic },
  [EModelEndpoint.openAI]: { type: EModelEndpoint.openAI },
} as unknown as TEndpointsConfig;

const spec = {
  name: 'gpt',
  label: 'GPT',
  preset: { endpoint: EModelEndpoint.openAI, model: 'gpt-5' },
} as TModelSpec;

const renderSelectMention = (conversation: Partial<TConversation>) => {
  const newConversation = jest.fn();
  const { result } = renderHook(() =>
    useSelectMention({
      modelSpecs: [spec],
      endpointsConfig,
      newConversation,
      returnHandlers: true,
      getConversation: () =>
        ({ endpoint: EModelEndpoint.anthropic, ...conversation }) as TConversation,
    }),
  );
  return { result, newConversation };
};

describe('useSelectMention', () => {
  it.each(['new', ''])(
    'keeps the composer attachments when switching spec in an unsent chat (%j)',
    (conversationId) => {
      const { result, newConversation } = renderSelectMention({ conversationId });

      act(() => result.current.onSelectSpec?.(spec));

      expect(newConversation).toHaveBeenCalledWith(
        expect.objectContaining({ keepComposerState: true }),
      );
    },
  );

  it('keeps the composer attachments when switching endpoint in an unsent chat', () => {
    const { result, newConversation } = renderSelectMention({ conversationId: 'new' });

    act(() => result.current.onSelectEndpoint?.(EModelEndpoint.openAI, { model: 'gpt-5' }));

    expect(newConversation).toHaveBeenCalledWith(
      expect.objectContaining({ keepComposerState: true }),
    );
  });

  it('opens a fresh composer when a sent conversation switches to a new chat', () => {
    const { result, newConversation } = renderSelectMention({ conversationId: 'convo-1' });

    act(() => result.current.onSelectEndpoint?.(EModelEndpoint.openAI, { model: 'gpt-5' }));

    expect(newConversation).toHaveBeenCalledWith(
      expect.objectContaining({ keepComposerState: false }),
    );
  });
});
