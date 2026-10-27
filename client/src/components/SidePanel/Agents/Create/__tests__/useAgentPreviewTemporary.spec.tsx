import React from 'react';
import { act, renderHook } from '@testing-library/react';
import { RecoilRoot, useRecoilValue, useSetRecoilState } from 'recoil';
import { EModelEndpoint } from 'librechat-data-provider';
import type { TConversation } from 'librechat-data-provider';
import useAgentPreviewTemporary from '../useAgentPreviewTemporary';
import { agentPreviewState } from '~/store/agents';
import store from '~/store';

const preview: Partial<TConversation> = {
  conversationId: 'new',
  endpoint: EModelEndpoint.anthropic,
  model: 'claude-sonnet-5',
  promptPrefix: 'Sei un agente HR',
  modelLabel: 'Agente HR',
};
const nextChat: Partial<TConversation> = {
  conversationId: 'new',
  endpoint: EModelEndpoint.anthropic,
  model: 'x',
};

type Props = { conversationId: string; conversation: Partial<TConversation> };

function renderPreview(initial: Props) {
  return renderHook(
    ({ conversationId, conversation }: Props) => {
      useAgentPreviewTemporary(conversationId, conversation);
      return {
        isTemporary: useRecoilValue(store.isTemporary),
        preview: useRecoilValue(agentPreviewState),
        setPreview: useSetRecoilState(agentPreviewState),
        setIsTemporary: useSetRecoilState(store.isTemporary),
      };
    },
    {
      initialProps: initial,
      wrapper: ({ children }: { children: React.ReactNode }) => <RecoilRoot>{children}</RecoilRoot>,
    },
  );
}

describe('useAgentPreviewTemporary', () => {
  beforeEach(() => localStorage.clear());

  it('gives back the default when a new chat replaces an unsent preview', () => {
    const { result, rerender } = renderPreview({ conversationId: 'new', conversation: preview });
    act(() => {
      result.current.setPreview({ key: null, from: null });
      result.current.setIsTemporary(true);
    });
    expect(result.current.isTemporary).toBe(true);
    expect(result.current.preview?.key).not.toBeNull();

    rerender({ conversationId: 'new', conversation: nextChat });
    expect(result.current.isTemporary).toBe(false);
    expect(result.current.preview).toBeNull();
  });

  it('turns the flag back on after the route resets it while leaving a conversation', () => {
    const { result, rerender } = renderPreview({
      conversationId: 'convo-1',
      conversation: preview,
    });
    act(() => {
      result.current.setPreview({ key: null, from: 'convo-1' });
      result.current.setIsTemporary(true);
    });
    act(() => result.current.setIsTemporary(false));
    expect(result.current.isTemporary).toBe(false);

    rerender({ conversationId: 'new', conversation: preview });
    expect(result.current.isTemporary).toBe(true);
  });

  it('lets go once the preview chat is saved under its own id', () => {
    const { result, rerender } = renderPreview({ conversationId: 'new', conversation: preview });
    act(() => {
      result.current.setPreview({ key: null, from: null });
      result.current.setIsTemporary(true);
    });

    rerender({
      conversationId: 'convo-2',
      conversation: { ...preview, conversationId: 'convo-2' },
    });
    expect(result.current.preview).toBeNull();
    expect(result.current.isTemporary).toBe(true);
  });

  it('does nothing without a preview', () => {
    const { result, rerender } = renderPreview({ conversationId: 'new', conversation: preview });
    rerender({ conversationId: 'new', conversation: nextChat });
    expect(result.current.isTemporary).toBe(false);
    expect(result.current.preview).toBeNull();
  });
});
