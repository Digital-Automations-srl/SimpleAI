import { useCallback, useEffect, useRef } from 'react';
import { atom, useAtom } from 'jotai';

export type ContextWarningLevel = 'none' | 'notice' | 'urgent';

export const CONTEXT_WARNING_NOTICE = 45;
export const CONTEXT_WARNING_URGENT = 80;

export function getContextWarningLevel(percent: number, maxTokens?: number): ContextWarningLevel {
  if (maxTokens == null || maxTokens <= 0) {
    return 'none';
  }
  if (percent >= CONTEXT_WARNING_URGENT) {
    return 'urgent';
  }
  return percent >= CONTEXT_WARNING_NOTICE ? 'notice' : 'none';
}

interface ContextWarningEntry {
  /** The level at which the user dismissed the warning. */
  dismissed?: ContextWarningLevel;
  /**
   * Set when a compaction finishes, cleared when the next turn starts: the
   * reading only reflects the compacted context once that turn measures it.
   */
  suppressed?: boolean;
}

/** Per-conversation warning state; a conversation back to the defaults leaves no entry. */
export const contextWarningStateAtom = atom<Record<string, ContextWarningEntry>>({});

function patchEntry(
  state: Record<string, ContextWarningEntry>,
  key: string,
  patch: ContextWarningEntry,
): Record<string, ContextWarningEntry> {
  const entry = { ...state[key], ...patch };
  const { [key]: _previous, ...rest } = state;
  const isDefault = (entry.dismissed ?? 'none') === 'none' && entry.suppressed !== true;
  if (isDefault) {
    return key in state ? rest : state;
  }
  return { ...rest, [key]: entry };
}

/**
 * Warning state of the shown conversation. The suppression lands on the
 * conversation that was compacted, which is no longer the shown one when the
 * user switched chats while it ran.
 */
export function useContextWarningState({
  warningKey,
  isCompacting,
  isSubmitting,
}: {
  warningKey: string;
  isCompacting: boolean;
  isSubmitting: boolean;
}) {
  const [state, setState] = useAtom(contextWarningStateAtom);
  const patch = useCallback(
    (key: string, value: ContextWarningEntry) =>
      setState((current) => patchEntry(current, key, value)),
    [setState],
  );

  const compactingKeyRef = useRef<string | null>(isCompacting ? warningKey : null);
  const wasSubmittingRef = useRef(isSubmitting);
  useEffect(() => {
    if (isCompacting && compactingKeyRef.current == null) {
      compactingKeyRef.current = warningKey;
    } else if (!isCompacting && compactingKeyRef.current != null) {
      patch(compactingKeyRef.current, { suppressed: true });
      compactingKeyRef.current = null;
    } else if (!wasSubmittingRef.current && isSubmitting && !isCompacting) {
      patch(warningKey, { suppressed: false });
    }
    wasSubmittingRef.current = isSubmitting;
  }, [isCompacting, isSubmitting, warningKey, patch]);

  const entry = state[warningKey];
  const dismiss = useCallback(
    (level: ContextWarningLevel) => patch(warningKey, { dismissed: level }),
    [patch, warningKey],
  );
  return {
    dismissed: entry?.dismissed ?? 'none',
    suppressed: entry?.suppressed === true,
    dismiss,
  };
}

export function isContextWarningVisible({
  level,
  dismissed,
  suppressed,
}: {
  level: ContextWarningLevel;
  dismissed: ContextWarningLevel;
  suppressed: boolean;
}): boolean {
  if (level === 'none' || suppressed) {
    return false;
  }
  return dismissed === 'none' || (dismissed === 'notice' && level === 'urgent');
}
