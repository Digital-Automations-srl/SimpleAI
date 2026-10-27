import { useEffect, useRef, useState } from 'react';
import type { AgentBuilderMessage } from 'librechat-data-provider';

export type BuilderTab = 'create' | 'configure';

export interface AgentBuilderState {
  tab: BuilderTab;
  setTab: (tab: BuilderTab) => void;
  messages: AgentBuilderMessage[];
  setMessages: React.Dispatch<React.SetStateAction<AgentBuilderMessage[]>>;
}

/**
 * Held by the agent panel, above the builder/model panel switch, so opening the model panel
 * keeps the tab and the conversation. Saving the agent drafted in "Crea" keeps the conversation;
 * opening an existing agent moves to "Configura", starting a new one keeps the chosen tab.
 */
export function useAgentBuilderState(agentId?: string | null): AgentBuilderState {
  const [tab, setTab] = useState<BuilderTab>(agentId ? 'configure' : 'create');
  const [messages, setMessages] = useState<AgentBuilderMessage[]>([]);
  const previousAgentId = useRef(agentId);
  const hasConversation = useRef(false);
  hasConversation.current = messages.length > 0;

  useEffect(() => {
    const previous = previousAgentId.current;
    previousAgentId.current = agentId;
    const savedDraftedAgent = !previous && !!agentId && hasConversation.current;
    if (previous === agentId || savedDraftedAgent) {
      return;
    }
    setMessages([]);
    if (agentId) {
      setTab('configure');
    }
  }, [agentId]);

  return { tab, setTab, messages, setMessages };
}
