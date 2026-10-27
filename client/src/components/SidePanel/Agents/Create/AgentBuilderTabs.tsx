import type { AgentBuilderState, BuilderTab } from './useAgentBuilderState';
import { useAgentPanelContext } from '~/Providers/AgentPanelContext';
import AgentPreviewButton from './AgentPreviewButton';
import AgentConfig from '../AgentConfig';
import AgentCreate from './AgentCreate';
import { useLocalize } from '~/hooks';
import { cn } from '~/utils';

/**
 * SimpleAI: "Crea" lets the user describe the agent while a model fills the form; "Configura"
 * is the full form. Without `agentBuilder` in the config only the form is shown.
 */
export default function AgentBuilderTabs({
  tab,
  setTab,
  messages,
  setMessages,
}: AgentBuilderState) {
  const localize = useLocalize();
  const { startupConfig } = useAgentPanelContext();

  if (startupConfig?.agentBuilder !== true) {
    return <AgentConfig />;
  }

  const tabs: Array<{ value: BuilderTab; label: string }> = [
    { value: 'create', label: localize('com_agents_tab_create') },
    { value: 'configure', label: localize('com_agents_tab_configure') },
  ];

  return (
    <div className="pt-1">
      <div
        role="tablist"
        aria-label={localize('com_agents_builder_mode')}
        className="mb-2 grid grid-cols-2 gap-1 rounded-lg bg-surface-secondary p-1"
      >
        {tabs.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={tab === value}
            onClick={() => setTab(value)}
            className={cn(
              'rounded-md py-1.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring-primary',
              tab === value
                ? 'bg-surface-primary text-text-primary shadow-sm'
                : 'text-text-secondary hover:text-text-primary',
            )}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="mb-3">
        <AgentPreviewButton />
      </div>
      <div role="tabpanel">
        {tab === 'create' ? (
          <AgentCreate
            messages={messages}
            setMessages={setMessages}
            onConfigure={() => setTab('configure')}
          />
        ) : (
          <AgentConfig />
        )}
      </div>
    </div>
  );
}
