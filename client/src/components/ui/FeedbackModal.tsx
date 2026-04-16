import { useState, useCallback } from 'react';
import { OGDialog, DialogTemplate, useToastContext } from '@librechat/client';
import { useLocalize } from '~/hooks';

const PRIORITY_OPTIONS = ['Bassa', 'Media', 'Alta'] as const;
const AREA_OPTIONS = ['Chat', 'Agenti', 'Condivisione', 'Impostazioni', 'Altro'] as const;
const FEEDBACK_EMAIL = 'support@digitalautomations.it';

export default function FeedbackModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const localize = useLocalize();
  const { showToast } = useToastContext();
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<(typeof PRIORITY_OPTIONS)[number]>('Media');
  const [area, setArea] = useState<(typeof AREA_OPTIONS)[number]>('Chat');

  const handleSubmit = useCallback(() => {
    if (!description.trim()) {
      showToast({ message: localize('com_ui_field_required') ?? 'Descrizione obbligatoria', status: 'warning' });
      return;
    }

    const subject = encodeURIComponent(`[Simple AI] Segnalazione - ${area} - Priorita' ${priority}`);
    const body = encodeURIComponent(
      `Descrizione:\n${description}\n\nPriorita': ${priority}\nArea funzionale: ${area}`,
    );
    window.open(`mailto:${FEEDBACK_EMAIL}?subject=${subject}&body=${body}`, '_self');

    showToast({ message: localize('com_ui_feedback_sent') ?? 'Segnalazione inviata', status: 'success' });
    setDescription('');
    setPriority('Media');
    setArea('Chat');
    onOpenChange(false);
  }, [description, priority, area, onOpenChange, showToast, localize]);

  const selectClasses =
    'w-full rounded-lg border border-border-medium bg-surface-primary px-3 py-2 text-sm text-text-primary focus:border-green-500 focus:outline-none';

  return (
    <OGDialog open={open} onOpenChange={onOpenChange}>
      <DialogTemplate
        title={localize('com_nav_feedback') ?? 'Segnala un miglioramento'}
        className="w-11/12 max-w-lg sm:w-3/4 md:w-1/2"
        showCloseButton={true}
        showCancelButton={false}
        main={
          <section className="flex flex-col gap-4 p-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-text-primary">
                {localize('com_ui_feedback_description') ?? 'Descrizione'}
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descrivi la modifica o il miglioramento..."
                rows={4}
                className="w-full resize-none rounded-lg border border-border-medium bg-surface-primary px-3 py-2 text-sm text-text-primary placeholder-text-secondary focus:border-green-500 focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-text-primary">
                  {localize('com_ui_feedback_priority') ?? "Priorita'"}
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as (typeof PRIORITY_OPTIONS)[number])}
                  className={selectClasses}
                >
                  {PRIORITY_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-text-primary">
                  {localize('com_ui_feedback_area') ?? 'Area funzionale'}
                </label>
                <select
                  value={area}
                  onChange={(e) => setArea(e.target.value as (typeof AREA_OPTIONS)[number])}
                  className={selectClasses}
                >
                  {AREA_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>
        }
        buttons={
          <button
            onClick={handleSubmit}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-border-heavy bg-surface-secondary px-4 py-2 text-sm text-text-primary hover:bg-green-500 hover:text-white focus:bg-green-500 focus:text-white dark:hover:bg-green-600 dark:focus:bg-green-600"
          >
            {localize('com_ui_feedback_submit') ?? 'Invia segnalazione'}
          </button>
        }
      />
    </OGDialog>
  );
}
