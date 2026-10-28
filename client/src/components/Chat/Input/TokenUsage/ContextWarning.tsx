import { memo } from 'react';
import { Info, X } from 'lucide-react';
import { Button, Spinner } from '@librechat/client';
import type { ContextWarningLevel } from './warningLevel';
import { useLocalize } from '~/hooks';
import { cn } from '~/utils';

interface ContextWarningProps {
  level: Exclude<ContextWarningLevel, 'none'>;
  percent: number;
  onNewChat: () => void;
  /** Absent where the endpoint cannot compact. */
  onCompact?: () => void;
  isCompacting: boolean;
  onHandoff: () => void;
  canHandoff: boolean;
  isHandoffRunning: boolean;
  /** Receives the Details control, which anchors the breakdown when the gauge is hidden. */
  onDetails: (anchor: HTMLElement) => void;
  onDismiss: () => void;
}

/**
 * A slim strip above the composer once the conversation fills its context,
 * with the three ways out. Presentational: the indicator owns the state.
 */
function ContextWarning({
  level,
  percent,
  onNewChat,
  onCompact,
  isCompacting,
  onHandoff,
  canHandoff,
  isHandoffRunning,
  onDetails,
  onDismiss,
}: ContextWarningProps) {
  const localize = useLocalize();
  const message = localize(
    level === 'urgent' ? 'com_ui_context_warning_urgent' : 'com_ui_context_warning_notice',
    { 0: String(Math.round(percent)) },
  );
  let progress: string | null = null;
  if (isCompacting) {
    progress = localize('com_ui_context_compacting');
  } else if (isHandoffRunning) {
    progress = localize('com_ui_context_warning_handoff_running');
  }

  return (
    <div
      data-testid="context-warning"
      className={cn(
        'mx-2 mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl px-3 py-2 text-sm text-text-primary',
        level === 'urgent' ? 'bg-status-error-subtle' : 'bg-status-warning-subtle',
      )}
    >
      <div role="status" className="flex min-w-0 flex-1 basis-64 items-start gap-2">
        <Info
          aria-hidden="true"
          className={cn(
            'mt-0.5 size-4 shrink-0',
            level === 'urgent' ? 'text-status-error' : 'text-status-warning',
          )}
        />
        <span>{message}</span>
      </div>
      {progress != null ? (
        <div className="flex items-center gap-2 text-text-secondary">
          <Spinner className="size-4" />
          <span>{progress}</span>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={onNewChat}>
            {localize('com_ui_context_warning_new_chat')}
          </Button>
          {onCompact != null && (
            <Button type="button" variant="outline" size="sm" onClick={onCompact}>
              {localize('com_ui_context_compact')}
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onHandoff}
            disabled={!canHandoff}
          >
            {localize('com_ui_context_warning_handoff')}
          </Button>
          <button
            type="button"
            onClick={(event) => onDetails(event.currentTarget)}
            className="text-text-secondary underline-offset-2 hover:underline"
          >
            {localize('com_ui_context_warning_details')}
          </button>
        </div>
      )}
      <button
        type="button"
        onClick={onDismiss}
        aria-label={localize('com_ui_context_warning_dismiss')}
        className="rounded-md p-1 text-text-secondary hover:bg-surface-hover"
      >
        <X aria-hidden="true" className="size-4" />
      </button>
    </div>
  );
}

export default memo(ContextWarning);
