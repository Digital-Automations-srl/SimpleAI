import { useEffect } from 'react';
import { Constants } from 'librechat-data-provider';
import { useRecoilState, useRecoilValue } from 'recoil';
import type { TConversation } from 'librechat-data-provider';
import { agentPreviewState } from '~/store/agents';
import store from '~/store';

/** What tells the preview chat apart from the next new chat the user opens. */
export function getPreviewChatKey(conversation: Partial<TConversation> | null | undefined): string {
  return [
    conversation?.endpoint,
    conversation?.model,
    conversation?.promptPrefix,
    conversation?.modelLabel,
  ].join('\u0000');
}

/**
 * SimpleAI: keeps the agent preview temporary and gives the user's default back afterwards.
 * Leaving for another conversation is already handled by the route; what remains is the route
 * resetting the flag while the preview opens, and a new chat replacing an unsent preview, where
 * the conversation id never changes.
 */
export default function useAgentPreviewTemporary(
  conversationId: string | undefined,
  conversation: Partial<TConversation> | null | undefined,
) {
  const [preview, setPreview] = useRecoilState(agentPreviewState);
  const [isTemporary, setIsTemporary] = useRecoilState(store.isTemporary);
  const defaultTemporaryChat = useRecoilValue(store.defaultTemporaryChat);

  useEffect(() => {
    if (preview == null || conversationId === preview.from) {
      return;
    }
    if (conversationId !== Constants.NEW_CONVO) {
      setPreview(null);
      return;
    }
    const key = getPreviewChatKey(conversation);
    if (preview.key == null) {
      setPreview({ key, from: null });
    } else if (key !== preview.key) {
      setPreview(null);
      setIsTemporary(defaultTemporaryChat);
      return;
    }
    if (!isTemporary) {
      setIsTemporary(true);
    }
  }, [
    preview,
    setPreview,
    isTemporary,
    conversation,
    conversationId,
    setIsTemporary,
    defaultTemporaryChat,
  ]);
}
