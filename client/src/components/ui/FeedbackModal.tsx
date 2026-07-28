import { useState, useCallback } from 'react';
import { OGDialog, DialogTemplate, useToastContext } from '@librechat/client';
import { IMPROVEMENT_AREAS, IMPROVEMENT_PRIORITIES } from 'librechat-data-provider';
import type { TImprovementArea, TImprovementPriority } from 'librechat-data-provider';
import { useSubmitImprovementReportMutation } from '~/data-provider';
import { useLocalize } from '~/hooks';

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
  const [priority, setPriority] = useState<TImprovementPriority>('Media');
  const [area, setArea] = useState<TImprovementArea>('Chat');

  const resetForm = useCallback(() => {
    setDescription('');
    setPriority('Media');
    setArea('Chat');
  }, []);

  const { mutate: submitReport, isLoading } = useSubmitImprovementReportMutation({
    onSuccess: (data) => {
      showToast({
        message: data.emailSent
          ? localize('com_ui_feedback_sent')
          : localize('com_ui_feedback_saved_not_sent'),
        status: data.emailSent ? 'success' : 'warning',
      });
      resetForm();
      onOpenChange(false);
    },
    onError: () => {
      showToast({ message: localize('com_ui_feedback_error'), status: 'error' });
    },
  });

  const handleSubmit = useCallback(() => {
    const trimmed = description.trim();
    if (!trimmed) {
      showToast({ message: localize('com_ui_field_required'), status: 'warning' });
      return;
    }
    submitReport({ description: trimmed, priority, area });
  }, [description, priority, area, submitReport, showToast, localize]);

  const selectClasses =
    'w-full rounded-lg border border-border-medium bg-surface-primary px-3 py-2 text-sm text-text-primary focus:border-green-500 focus:outline-none';

  return (
    <OGDialog open={open} onOpenChange={onOpenChange}>
      <DialogTemplate
        title={localize('com_nav_feedback')}
        className="w-11/12 max-w-lg sm:w-3/4 md:w-1/2"
        showCloseButton={true}
        showCancelButton={false}
        main={
          <section className="flex flex-col gap-4 p-4">
            <div>
              <label
                htmlFor="improvement-description"
                className="mb-1 block text-sm font-medium text-text-primary"
              >
                {localize('com_ui_feedback_description')}
              </label>
              <textarea
                id="improvement-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={localize('com_ui_feedback_placeholder_improvement')}
                rows={4}
                className="w-full resize-none rounded-lg border border-border-medium bg-surface-primary px-3 py-2 text-sm text-text-primary placeholder-text-secondary focus:border-green-500 focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="improvement-priority"
                  className="mb-1 block text-sm font-medium text-text-primary"
                >
                  {localize('com_ui_feedback_priority')}
                </label>
                <select
                  id="improvement-priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TImprovementPriority)}
                  className={selectClasses}
                >
                  {IMPROVEMENT_PRIORITIES.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="improvement-area"
                  className="mb-1 block text-sm font-medium text-text-primary"
                >
                  {localize('com_ui_feedback_area')}
                </label>
                <select
                  id="improvement-area"
                  value={area}
                  onChange={(e) => setArea(e.target.value as TImprovementArea)}
                  className={selectClasses}
                >
                  {IMPROVEMENT_AREAS.map((opt) => (
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
            disabled={isLoading}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-border-heavy bg-surface-secondary px-4 py-2 text-sm text-text-primary hover:bg-green-500 hover:text-white focus:bg-green-500 focus:text-white disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-green-600 dark:focus:bg-green-600"
          >
            {localize('com_ui_feedback_submit')}
          </button>
        }
      />
    </OGDialog>
  );
}
