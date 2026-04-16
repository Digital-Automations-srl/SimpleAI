import { useCallback } from 'react';
import { OGDialog, DialogTemplate } from '@librechat/client';
import { useLocalize } from '~/hooks';

interface ChangelogEntry {
  version: string;
  date: string;
  title: string;
  changes: string[];
}

interface ChangelogData {
  version: string;
  entries: ChangelogEntry[];
}

const STORAGE_KEY = 'simpleai_changelog_seen';

export function getSeenVersion(): string | null {
  return localStorage.getItem(STORAGE_KEY);
}

export function markVersionSeen(version: string): void {
  localStorage.setItem(STORAGE_KEY, version);
}

export default function ChangelogModal({
  open,
  onOpenChange,
  data,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: ChangelogData;
}) {
  const localize = useLocalize();

  const handleDismiss = useCallback(() => {
    markVersionSeen(data.version);
    onOpenChange(false);
  }, [data.version, onOpenChange]);

  return (
    <OGDialog open={open} onOpenChange={onOpenChange}>
      <DialogTemplate
        title={localize('com_nav_whats_new') ?? "Novita'"}
        className="w-11/12 max-w-2xl sm:w-3/4 md:w-1/2"
        showCloseButton={true}
        showCancelButton={false}
        main={
          <section
            tabIndex={0}
            className="max-h-[60vh] overflow-y-auto p-4"
            aria-label={localize('com_nav_whats_new') ?? "Novita'"}
          >
            {data.entries.map((entry) => (
              <div key={entry.version} className="mb-6 last:mb-0">
                <div className="mb-2 flex items-baseline gap-2">
                  <h3 className="text-lg font-semibold text-text-primary">
                    v{entry.version}
                  </h3>
                  <span className="text-xs text-text-secondary">{entry.date}</span>
                </div>
                <p className="mb-2 text-sm font-medium text-text-primary">{entry.title}</p>
                <ul className="list-inside list-disc space-y-1">
                  {entry.changes.map((change, i) => (
                    <li key={i} className="text-sm text-text-secondary">
                      {change}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
        }
        buttons={
          <button
            onClick={handleDismiss}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-border-heavy bg-surface-secondary px-4 py-2 text-sm text-text-primary hover:bg-green-500 hover:text-white focus:bg-green-500 focus:text-white dark:hover:bg-green-600 dark:focus:bg-green-600"
          >
            {localize('com_ui_confirm_action') ?? 'Ho capito'}
          </button>
        }
      />
    </OGDialog>
  );
}
