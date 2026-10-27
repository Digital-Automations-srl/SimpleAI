import { useCallback } from 'react';
import { Play } from 'lucide-react';
import { Button } from '@librechat/client';
import { Constants } from 'librechat-data-provider';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { useFormContext, useWatch } from 'react-hook-form';
import type { AgentForm } from '~/common';
import { agentPreviewState, useUpdateEphemeralAgent } from '~/store/agents';
import { useLocalize, useNewConvo } from '~/hooks';
import { getAgentPreview } from './draft';
import store from '~/store';

/**
 * Opens the unsaved agent in a temporary chat, so it can be tried before it is created.
 * `useAgentPreviewTemporary` (mounted on the chat route) keeps it temporary until the user leaves.
 */
export default function AgentPreviewButton() {
  const localize = useLocalize();
  const { control, getValues } = useFormContext<AgentForm>();
  const provider = useWatch({ control, name: 'provider' });
  const model = useWatch({ control, name: 'model' });
  const { newConversation } = useNewConvo();
  const updateEphemeralAgent = useUpdateEphemeralAgent();
  const setIsTemporary = useSetRecoilState(store.isTemporary);
  const setPreview = useSetRecoilState(agentPreviewState);
  const conversationId = useRecoilValue(store.conversationByIndex(0))?.conversationId;

  const startPreview = useCallback(() => {
    const preview = getAgentPreview(getValues());
    if (preview == null) {
      return;
    }
    const from =
      conversationId != null && conversationId !== Constants.NEW_CONVO ? conversationId : null;
    setPreview({ key: null, from });
    setIsTemporary(true);
    newConversation({ preset: preview.preset });
    updateEphemeralAgent(Constants.NEW_CONVO, preview.ephemeralAgent);
  }, [
    conversationId,
    getValues,
    newConversation,
    setIsTemporary,
    setPreview,
    updateEphemeralAgent,
  ]);

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full gap-2"
      onClick={startPreview}
      disabled={!provider || !model}
      title={localize('com_agents_preview_hint')}
    >
      <Play className="h-4 w-4" aria-hidden="true" />
      {localize('com_agents_preview')}
    </Button>
  );
}
