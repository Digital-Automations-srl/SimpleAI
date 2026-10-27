import React, { useCallback, useEffect, useRef, useState } from 'react';
import { SendHorizontal } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import { Button, Spinner, TextareaAutosize } from '@librechat/client';
import type { AgentBuilderMessage } from 'librechat-data-provider';
import type { AgentForm } from '~/common';
import { applyAgentDraft, getBuilderCurrent, trimBuilderHistory } from './draft';
import { useGenerateAgentDraftMutation } from '~/data-provider';
import { useLocalize } from '~/hooks';
import { cn } from '~/utils';

interface AgentCreateProps {
  messages: AgentBuilderMessage[];
  setMessages: React.Dispatch<React.SetStateAction<AgentBuilderMessage[]>>;
  onConfigure: () => void;
}

export default function AgentCreate({ messages, setMessages, onConfigure }: AgentCreateProps) {
  const localize = useLocalize();
  const { getValues, setValue } = useFormContext<AgentForm>();
  const [text, setText] = useState('');
  const [failed, setFailed] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const draftMutation = useGenerateAgentDraftMutation();
  const isGenerating = draftMutation.isLoading;

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages, isGenerating]);

  const send = useCallback(() => {
    const request = text.trim();
    if (!request || isGenerating) {
      return;
    }
    const history: AgentBuilderMessage[] = [...messages, { role: 'user', text: request }];
    setMessages(history);
    setText('');
    setFailed(false);
    draftMutation.mutate(
      { messages: trimBuilderHistory(history), current: getBuilderCurrent(getValues()) },
      {
        onSuccess: ({ reply, draft }) => {
          applyAgentDraft(draft, setValue);
          setMessages((previous) => [...previous, { role: 'assistant', text: reply }]);
        },
        onError: () => setFailed(true),
      },
    );
  }, [draftMutation, getValues, isGenerating, messages, setMessages, setValue, text]);

  const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      send();
    }
  };

  return (
    <div className="flex flex-col gap-3 pt-1">
      <div
        ref={listRef}
        className="flex max-h-[55vh] flex-col gap-2 overflow-y-auto overflow-x-hidden"
        /** The spinner's rotation overflows by a pixel: without a reserved gutter the scrollbar
         *  flickers and the text rewraps on every turn. */
        style={{ scrollbarGutter: 'stable' }}
        role="log"
        aria-live="polite"
        aria-label={localize('com_agents_create_conversation')}
      >
        <p className="rounded-lg bg-surface-secondary p-3 text-sm text-text-primary">
          {localize(
            messages.length > 0 ? 'com_agents_create_refine_intro' : 'com_agents_create_intro',
          )}
        </p>
        {messages.map((message, index) => (
          <p
            key={`${message.role}-${index}`}
            data-testid={`agent-create-${message.role}`}
            className={cn(
              'max-w-[90%] whitespace-pre-wrap rounded-lg px-3 py-2 text-sm',
              message.role === 'user'
                ? 'self-end bg-surface-tertiary text-text-primary'
                : 'self-start border border-border-light text-text-primary',
            )}
          >
            {message.text}
          </p>
        ))}
        {isGenerating && (
          <div className="flex items-center gap-2 py-1 text-sm text-text-secondary">
            <Spinner className="h-4 w-4 shrink-0" />
            {localize('com_agents_create_generating')}
          </div>
        )}
        {failed && (
          <p className="text-sm text-text-destructive" role="alert">
            {localize('com_agents_create_failed')}
          </p>
        )}
      </div>
      <div className="flex items-end gap-2 rounded-lg border border-border-light bg-surface-secondary p-2">
        <TextareaAutosize
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={onKeyDown}
          minRows={2}
          maxRows={8}
          placeholder={localize('com_agents_create_placeholder')}
          aria-label={localize('com_agents_create_placeholder')}
          className="w-full resize-none bg-transparent text-sm text-text-primary placeholder:text-text-secondary focus:outline-none"
        />
        <Button
          type="button"
          size="icon"
          variant="submit"
          onClick={send}
          disabled={isGenerating || !text.trim()}
          aria-label={localize('com_agents_create_send')}
        >
          <SendHorizontal className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
      {messages.some((message) => message.role === 'assistant') && (
        <Button type="button" variant="outline" onClick={onConfigure}>
          {localize('com_agents_create_review')}
        </Button>
      )}
    </div>
  );
}
