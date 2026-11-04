import { useContext, useState } from 'react';
import { FolderOpen } from 'lucide-react';
import {
  OGDialog,
  OGDialogTitle,
  ThemeContext,
  TooltipAnchor,
  OGDialogHeader,
  OGDialogContent,
} from '@librechat/client';
import { useGetStartupConfig } from '~/data-provider';
import { useLocalize } from '~/hooks';

/** AIDA's embeddable file manager, skinned like SimpleAI and following its theme. */
export function buildAidaFilesUrl(baseUrl: string, mode: 'light' | 'dark'): string {
  const url = new URL('/embed/esplora', baseUrl);
  url.searchParams.set('skin', 'simpleai');
  url.searchParams.set('theme', mode);
  return url.toString();
}

/**
 * Header button shown only where `interface.aida.url` is configured. The iframe has no
 * sandbox on purpose: AIDA's login opens in a popup and the page uploads and downloads files.
 * A theme change swaps the `src`, which reloads the page with the new value.
 */
export function AidaFilesButton() {
  const localize = useLocalize();
  const { resolvedMode } = useContext(ThemeContext);
  const { data: startupConfig } = useGetStartupConfig();
  const [open, setOpen] = useState(false);

  const baseUrl = startupConfig?.interface?.aida?.url;
  if (baseUrl == null) {
    return null;
  }

  const label = localize('com_ui_aida_files');

  return (
    <OGDialog open={open} onOpenChange={setOpen}>
      <TooltipAnchor
        description={label}
        render={
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label={label}
            data-testid="aida-files-button"
            className="inline-flex size-9 flex-shrink-0 items-center justify-center rounded-xl border border-border-light bg-presentation text-text-primary shadow-sm transition-all ease-in-out hover:bg-surface-active-alt"
          >
            <FolderOpen className="icon-md" aria-hidden="true" />
          </button>
        }
      />
      <OGDialogContent className="flex h-[90vh] w-11/12 max-w-6xl flex-col gap-0 overflow-hidden p-0">
        <OGDialogHeader className="shrink-0 border-b border-border-light px-5 py-4 pr-14">
          <OGDialogTitle className="text-left text-base">{label}</OGDialogTitle>
        </OGDialogHeader>
        <iframe
          title={label}
          src={buildAidaFilesUrl(baseUrl, resolvedMode)}
          className="min-h-0 w-full flex-1 border-0"
          data-testid="aida-files-iframe"
        />
      </OGDialogContent>
    </OGDialog>
  );
}
