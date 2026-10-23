import type { JevState, RouterStateMessage } from './jev';

interface HistoryContentPart {
  type?: string;
  text?: string | { value?: string };
}

export interface RouterHistoryMessage {
  messageId: string;
  parentMessageId?: string | null;
  isCreatedByUser?: boolean;
  text?: string | null;
  content?: HistoryContentPart[] | null;
}

export interface BuildRouterStateParams {
  history: RouterHistoryMessage[];
  parentMessageId?: string | null;
  text: string;
  historyMessages: number;
  maxMessageChars: number;
}

function partText(part: HistoryContentPart): string {
  if (part.type !== 'text') {
    return '';
  }
  return typeof part.text === 'string' ? part.text : (part.text?.value ?? '');
}

/** Visible text only: tool calls and their outputs stay out of the classifier's view. */
export function extractMessageText(message: RouterHistoryMessage): string {
  if (typeof message.text === 'string' && message.text.trim() !== '') {
    return message.text;
  }
  return (message.content ?? []).map(partText).filter(Boolean).join('\n');
}

function truncate(text: string, maxChars: number): string {
  return text.length > maxChars ? `${text.slice(0, maxChars)}…` : text;
}

/** Walks the parent chain back from the turn's parent, so sibling branches never leak in. */
function collectBranch(
  history: RouterHistoryMessage[],
  parentMessageId: string | null | undefined,
  limit: number,
): RouterHistoryMessage[] {
  const byId = new Map(history.map((message) => [message.messageId, message]));
  const branch: RouterHistoryMessage[] = [];
  let current = parentMessageId != null ? byId.get(parentMessageId) : undefined;
  while (current != null && branch.length < limit) {
    branch.push(current);
    current = current.parentMessageId != null ? byId.get(current.parentMessageId) : undefined;
  }
  return branch.reverse();
}

/**
 * The classifier reads the new message plus the turns before it, `historyMessages` in all,
 * each cut to `maxMessageChars`: a follow-up like "3" is only classifiable in context.
 */
export function buildRouterState({
  history,
  parentMessageId,
  text,
  historyMessages,
  maxMessageChars,
}: BuildRouterStateParams): JevState {
  const previous: RouterStateMessage[] = collectBranch(
    history,
    parentMessageId,
    historyMessages - 1,
  )
    .map(
      (message): RouterStateMessage => ({
        role: message.isCreatedByUser === true ? 'user' : 'assistant',
        text: truncate(extractMessageText(message), maxMessageChars),
      }),
    )
    .filter((message) => message.text !== '');

  return {
    conversation: [...previous, { role: 'user', text: truncate(text, maxMessageChars) }],
  };
}
