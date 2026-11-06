import React, { memo, useCallback, useMemo } from 'react';
import { Sparkles } from 'lucide-react';
import { CheckboxButton } from '@librechat/client';
import { isAgentsEndpoint, isAssistantsEndpoint } from 'librechat-data-provider';
import type { TConversation, TModelSpec } from 'librechat-data-provider';
import type { ConvoGenerator } from '~/common';
import { useGetEndpointsQuery, useGetStartupConfig } from '~/data-provider';
import useSelectMention from '~/hooks/Input/useSelectMention';
import { badgeAccents } from './accents';
import { useLocalize } from '~/hooks';

export const LAST_MANUAL_SPEC_KEY = 'simpleai_last_manual_spec';

function readLastManualSpec(): string | null {
  try {
    return localStorage.getItem(LAST_MANUAL_SPEC_KEY);
  } catch {
    return null;
  }
}

function rememberManualSpec(specName: string): void {
  try {
    localStorage.setItem(LAST_MANUAL_SPEC_KEY, specName);
  } catch {
    // storage unavailable: switching off falls back to the default spec
  }
}

/** A chat on a plain model: agents and assistants keep their own model, tools and badges. */
export function isModelChatEndpoint(endpoint?: string | null): endpoint is string {
  return !!endpoint && !isAgentsEndpoint(endpoint) && !isAssistantsEndpoint(endpoint);
}

/** The spec to return to when Auto is switched off: the user's last pick, else the default. */
export function getManualSpec(
  specs: TModelSpec[],
  lastSpecName: string | null,
): TModelSpec | undefined {
  const manual = specs.filter((spec) => spec.autoRouter !== true);
  return (
    manual.find((spec) => spec.name === lastSpecName) ??
    manual.find((spec) => spec.softDefault === true) ??
    manual.find((spec) => spec.default === true) ??
    manual[0]
  );
}

function AutoModelToggle({
  conversation,
  newConversation,
}: {
  conversation: TConversation | null;
  newConversation: ConvoGenerator;
}) {
  const localize = useLocalize();
  const { data: startupConfig } = useGetStartupConfig();
  const { data: endpointsConfig = {} } = useGetEndpointsQuery();
  const modelSpecs = useMemo(() => startupConfig?.modelSpecs?.list ?? [], [startupConfig]);
  const autoSpec = useMemo(() => modelSpecs.find((spec) => spec.autoRouter === true), [modelSpecs]);
  const getConversation = useCallback(() => conversation, [conversation]);
  const { onSelectSpec } = useSelectMention({
    modelSpecs,
    getConversation,
    endpointsConfig,
    newConversation,
    returnHandlers: true,
  });

  const handleChange = useCallback(
    ({ value }: { value: boolean | string }) => {
      if (autoSpec == null) {
        return;
      }
      if (value === true) {
        if (conversation?.spec && conversation.spec !== autoSpec.name) {
          rememberManualSpec(conversation.spec);
        }
        onSelectSpec?.(autoSpec);
        return;
      }
      onSelectSpec?.(getManualSpec(modelSpecs, readLastManualSpec()));
    },
    [autoSpec, conversation?.spec, modelSpecs, onSelectSpec],
  );

  if (
    autoSpec == null ||
    !isModelChatEndpoint(conversation?.endpointType ?? conversation?.endpoint)
  ) {
    return null;
  }

  return (
    <CheckboxButton
      checked={conversation?.spec === autoSpec.name}
      setValue={handleChange}
      label={localize('com_ui_auto_model')}
      isCheckedClassName={badgeAccents.purple}
      icon={<Sparkles className="icon-md" aria-hidden="true" />}
    />
  );
}

export default memo(AutoModelToggle);
