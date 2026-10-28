import { getDefaultStore } from 'jotai';
import { ContentTypes } from 'librechat-data-provider';
import { renderHook, act } from '@testing-library/react';
import type { TMessage } from 'librechat-data-provider';
import useHandoff, { handoffConversationAtom } from '../useHandoff';

const mockAsk = jest.fn();
const mockContinueInNewChat = jest.fn();
let mockContext: {
  index: number;
  isSubmitting: boolean;
  conversation: { conversationId: string } | null;
};
let mockLatestMessage: TMessage | null;

jest.mock('~/Providers', () => ({
  useChatContext: () => ({ ...mockContext, ask: mockAsk }),
}));
jest.mock('~/hooks/Messages/useLatestMessage', () => ({
  useLatestMessage: () => mockLatestMessage,
}));
jest.mock('~/hooks/Chat/useContinueInNewChat', () => ({
  __esModule: true,
  default: () => mockContinueInNewChat,
}));
jest.mock('~/hooks', () => ({
  useLocalize: () => (key: string) => key,
}));

const response = (overrides: Partial<TMessage> = {}): TMessage =>
  ({
    messageId: 'a2',
    parentMessageId: 'u2',
    conversationId: 'convo-1',
    isCreatedByUser: false,
    text: '',
    content: [{ type: ContentTypes.TEXT, text: 'Obiettivo: finire il report.' }],
    ...overrides,
  }) as TMessage;

/** Starts a handoff, then lets the turn stream and settle on `settled`. */
function runHandoff(settled: TMessage | null, conversationAtSettle = 'convo-1') {
  const hook = renderHook(() => useHandoff());
  act(() => hook.result.current.start());
  mockContext.isSubmitting = true;
  hook.rerender();
  expect(hook.result.current.isRunning).toBe(true);
  mockLatestMessage = settled;
  mockContext.conversation = { conversationId: conversationAtSettle };
  mockContext.isSubmitting = false;
  hook.rerender();
  return hook;
}

describe('useHandoff', () => {
  beforeEach(() => {
    mockAsk.mockClear();
    mockContinueInNewChat.mockClear();
    mockContext = { index: 0, isSubmitting: false, conversation: { conversationId: 'convo-1' } };
    mockLatestMessage = response({ messageId: 'a1', parentMessageId: 'u1' });
    getDefaultStore().set(handoffConversationAtom, null);
  });

  it('asks the model for the handoff prompt as an ordinary message', () => {
    const { result } = renderHook(() => useHandoff());
    act(() => result.current.start());
    expect(mockAsk).toHaveBeenCalledWith({ text: 'com_ui_context_warning_handoff_prompt' });
  });

  it('opens the new chat with the finished answer', () => {
    const hook = runHandoff(response());
    expect(mockContinueInNewChat).toHaveBeenCalledWith('Obiettivo: finire il report.');
    expect(hook.result.current.isRunning).toBe(false);
  });

  it('opens nothing when the user moved to another chat', () => {
    runHandoff(response(), 'convo-2');
    expect(mockContinueInNewChat).not.toHaveBeenCalled();
    expect(getDefaultStore().get(handoffConversationAtom)).toBeNull();
  });

  it('opens nothing when the answer failed or was stopped', () => {
    runHandoff(response({ error: true }));
    runHandoff(response({ unfinished: true }));
    expect(mockContinueInNewChat).not.toHaveBeenCalled();
  });

  it('opens nothing when a stop before the first token restores the previous answer', () => {
    runHandoff(response({ messageId: 'a1', parentMessageId: 'u1' }));
    expect(mockContinueInNewChat).not.toHaveBeenCalled();
  });

  it('opens nothing when the answer broke off with an error after some text', () => {
    runHandoff(
      response({
        content: [
          { type: ContentTypes.TEXT, text: 'Obiettivo: fin' },
          { type: ContentTypes.ERROR, error: 'stream failed' },
        ] as TMessage['content'],
      }),
    );
    expect(mockContinueInNewChat).not.toHaveBeenCalled();
  });

  it('cannot start in an unsaved chat or while a turn runs', () => {
    mockContext.isSubmitting = true;
    expect(renderHook(() => useHandoff()).result.current.canStart).toBe(false);
    mockContext = { index: 0, isSubmitting: false, conversation: { conversationId: 'new' } };
    expect(renderHook(() => useHandoff()).result.current.canStart).toBe(false);
  });
});
