import { useEffect, useCallback } from 'react';
import { atom, useAtom, useSetAtom } from 'jotai';
import { Constants } from 'librechat-data-provider';
import type { TConversation, TModelSpec, TPreset } from 'librechat-data-provider';
import { getModelSpecPreset, getComposerDraftId, mayClearComposerDrafts, setDraft } from '~/utils';
import { useChatContext, useChatFormContext } from '~/Providers';
import { useGetStartupConfig } from '~/data-provider';
import useNewChat from '~/hooks/Chat/useNewChat';

/** Text the next new-chat composer of a pane opens with, replacing its saved draft. */
export const composerPrefillAtom = atom<{ index: number; text: string } | null>(null);

/**
 * Preset that reopens a conversation's model: its spec when it still exists,
 * otherwise its endpoint, model and agent. Always a preset, so the tenant's
 * `modelSpecs.prioritize` default does not replace the user's choice.
 */
export function buildContinuationPreset(
  conversation: TConversation,
  modelSpecs?: TModelSpec[],
): Partial<TPreset> {
  const spec = conversation.spec
    ? modelSpecs?.find((candidate) => candidate.name === conversation.spec)
    : undefined;
  if (spec != null) {
    return getModelSpecPreset(spec) as Partial<TPreset>;
  }
  const { endpoint, endpointType, model, agent_id } = conversation;
  return Object.fromEntries(
    Object.entries({ endpoint, endpointType, model, agent_id }).filter(
      ([, value]) => value != null && value !== '',
    ),
  ) as Partial<TPreset>;
}

/**
 * Puts the queued text into the pane's new-chat composer. Mounted after
 * `useAutoSave` so it runs after the draft restore, and it writes the draft
 * too, so a later restore brings back this text instead of the old draft —
 * unless another live tab owns the shared new-chat draft.
 */
export function useApplyComposerPrefill({
  index,
  conversationId,
  isSubmitting = false,
}: {
  index: number;
  conversationId: string;
  isSubmitting?: boolean;
}) {
  const methods = useChatFormContext();
  const [prefill, setPrefill] = useAtom(composerPrefillAtom);
  const isNewConversation = conversationId === '' || conversationId === Constants.NEW_CONVO;

  useEffect(() => {
    if (prefill == null || prefill.index !== index || !isNewConversation) {
      return;
    }
    methods.setValue('text', prefill.text, { shouldDirty: true });
    const draftId = getComposerDraftId(index, conversationId, isSubmitting);
    if (mayClearComposerDrafts(draftId)) {
      setDraft({ id: draftId, value: prefill.text });
    }
    setPrefill(null);
  }, [prefill, index, isNewConversation, conversationId, isSubmitting, methods, setPrefill]);
}

/** Opens a new chat on the current conversation's model, optionally with composer text. */
export default function useContinueInNewChat() {
  const { index, conversation } = useChatContext();
  const { startNewChat } = useNewChat({ index });
  const { data: startupConfig } = useGetStartupConfig();
  const setPrefill = useSetAtom(composerPrefillAtom);

  return useCallback(
    (text?: string) => {
      if (conversation == null) {
        return;
      }
      if (text != null && text !== '') {
        setPrefill({ index, text });
      }
      startNewChat({
        preset: buildContinuationPreset(conversation, startupConfig?.modelSpecs?.list),
      });
    },
    [conversation, index, setPrefill, startNewChat, startupConfig?.modelSpecs?.list],
  );
}
