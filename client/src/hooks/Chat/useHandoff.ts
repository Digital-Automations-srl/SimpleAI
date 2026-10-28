import { useCallback, useEffect, useRef } from 'react';
import { atom, useAtom } from 'jotai';
import { Constants, ContentTypes, parseTextParts } from 'librechat-data-provider';
import type { TMessage } from 'librechat-data-provider';
import { useLatestMessage } from '~/hooks/Messages/useLatestMessage';
import useContinueInNewChat from '~/hooks/Chat/useContinueInNewChat';
import { useChatContext } from '~/Providers';
import { useLocalize } from '~/hooks';

/** The handoff this client asked for: its conversation and the leaf it was asked from. */
export const handoffConversationAtom = atom<{
  conversationId: string;
  fromMessageId: string | null;
} | null>(null);

const answerText = (message: TMessage): string =>
  message.content != null && message.content.length > 0
    ? parseTextParts(message.content, true)
    : (message.text ?? '');

/**
 * Message flags alone do not tell a finished answer: a stop before the first
 * token restores the previous answer as the leaf, and an error after some text
 * keeps the partial content with an error part instead of `error: true`.
 */
const isUsableAnswer = (
  message: TMessage | null,
  fromMessageId: string | null,
): message is TMessage =>
  message != null &&
  message.messageId !== fromMessageId &&
  message.isCreatedByUser !== true &&
  message.error !== true &&
  message.unfinished !== true &&
  !(message.content ?? []).some((part) => part?.type === ContentTypes.ERROR);

/**
 * Asks the model, as an ordinary visible turn, for a prompt that carries the
 * work into a fresh chat, then opens that chat with the answer in the
 * composer. Lives in an always-mounted component: the warning that starts it
 * can unmount while the answer streams.
 */
export default function useHandoff() {
  const localize = useLocalize();
  const { ask, index, conversation, isSubmitting } = useChatContext();
  const latestMessage = useLatestMessage(index);
  const continueInNewChat = useContinueInNewChat();
  const [handoffConversation, setHandoffConversation] = useAtom(handoffConversationAtom);

  const conversationId = conversation?.conversationId;
  const hasConversation =
    conversationId != null &&
    conversationId !== Constants.NEW_CONVO &&
    conversationId !== Constants.PENDING_CONVO;
  const isRunning =
    handoffConversation != null && handoffConversation.conversationId === conversationId;
  const canStart = hasConversation && !isSubmitting;

  const wasSubmitting = useRef(isSubmitting);
  useEffect(() => {
    const settled = wasSubmitting.current && !isSubmitting;
    wasSubmitting.current = isSubmitting;
    if (!settled || handoffConversation == null) {
      return;
    }
    setHandoffConversation(null);
    if (
      handoffConversation.conversationId !== conversationId ||
      !isUsableAnswer(latestMessage, handoffConversation.fromMessageId)
    ) {
      return;
    }
    const text = answerText(latestMessage).trim();
    if (text !== '') {
      continueInNewChat(text);
    }
  }, [
    isSubmitting,
    handoffConversation,
    conversationId,
    latestMessage,
    continueInNewChat,
    setHandoffConversation,
  ]);

  const start = useCallback(() => {
    if (!canStart || conversationId == null) {
      return;
    }
    setHandoffConversation({ conversationId, fromMessageId: latestMessage?.messageId ?? null });
    const accepted = ask({ text: localize('com_ui_context_warning_handoff_prompt') });
    if (accepted === false) {
      setHandoffConversation(null);
    }
  }, [ask, canStart, conversationId, latestMessage, localize, setHandoffConversation]);

  return { start, canStart, isRunning };
}
