import { useState, useCallback } from 'react';
import { Settings, Trash2, Pencil, Plus } from 'lucide-react';
import { OGDialog, DialogTemplate, Button, useToastContext } from '@librechat/client';
import { useGetAgentCategoriesQuery } from '~/data-provider';
import {
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} from '~/data-provider/Agents/mutations';
import { useLocalize } from '~/hooks';
import type { TranslationKeys } from '~/hooks';

interface CategoryForm {
  value: string;
  label: string;
  description: string;
}

const emptyForm: CategoryForm = { value: '', label: '', description: '' };

export default function CategoryManager() {
  const localize = useLocalize();
  const { showToast } = useToastContext();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CategoryForm>(emptyForm);
  const [editingValue, setEditingValue] = useState<string | null>(null);

  const categoriesQuery = useGetAgentCategoriesQuery();
  const categories = (categoriesQuery.data || []).filter(
    (c) => c.value !== 'promoted' && c.value !== 'all',
  );

  const getDisplayName = useCallback(
    (label: string, value: string) => {
      if (label && label.startsWith('com_')) {
        return localize(label as TranslationKeys) || value;
      }
      return label || value.charAt(0).toUpperCase() + value.slice(1);
    },
    [localize],
  );

  const createMutation = useCreateCategoryMutation({
    onSuccess: () => {
      showToast({ status: 'success', message: localize('com_agents_category_created') ?? 'Category created' });
      setForm(emptyForm);
    },
    onError: () => showToast({ status: 'error', message: 'Error creating category' }),
  });

  const updateMutation = useUpdateCategoryMutation({
    onSuccess: () => {
      showToast({ status: 'success', message: localize('com_agents_category_updated') ?? 'Category updated' });
      setForm(emptyForm);
      setEditingValue(null);
    },
    onError: () => showToast({ status: 'error', message: 'Error updating category' }),
  });

  const deleteMutation = useDeleteCategoryMutation({
    onSuccess: () => {
      showToast({ status: 'success', message: localize('com_agents_category_deleted') ?? 'Category deleted' });
    },
    onError: () => showToast({ status: 'error', message: 'Error deleting category' }),
  });

  const handleSubmit = useCallback(() => {
    if (!form.label.trim()) {
      return;
    }

    if (editingValue) {
      updateMutation.mutate({
        value: editingValue,
        data: { label: form.label, description: form.description },
      });
    } else {
      const value = form.value.trim() || form.label.trim().toLowerCase().replace(/\s+/g, '_');
      createMutation.mutate({ value, label: form.label, description: form.description });
    }
  }, [form, editingValue, createMutation, updateMutation]);

  const handleEdit = useCallback((cat: { value: string; label: string; description?: string }) => {
    setForm({ value: cat.value, label: cat.label, description: cat.description || '' });
    setEditingValue(cat.value);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setForm(emptyForm);
    setEditingValue(null);
  }, []);

  const handleDelete = useCallback(
    (value: string) => {
      if (window.confirm(localize('com_agents_category_delete_confirm') ?? 'Delete this category?')) {
        deleteMutation.mutate(value);
      }
    },
    [deleteMutation, localize],
  );

  const inputClasses =
    'w-full rounded-lg border border-border-medium bg-surface-primary px-3 py-2 text-sm text-text-primary focus:border-green-500 focus:outline-none';

  return (
    <>
      <Button
        variant="outline"
        className="relative h-12 rounded-xl border-border-medium font-medium"
        aria-label={localize('com_agents_manage_categories') ?? 'Manage categories'}
        onClick={() => setOpen(true)}
      >
        <Settings className="cursor-pointer" aria-hidden="true" />
      </Button>
      <OGDialog open={open} onOpenChange={setOpen}>
        <DialogTemplate
          title={localize('com_agents_manage_categories') ?? 'Manage categories'}
          className="w-11/12 max-w-2xl sm:w-3/4"
          showCloseButton={true}
          showCancelButton={false}
          main={
            <section className="max-h-[60vh] overflow-y-auto p-4">
              {/* Category list */}
              <div className="mb-4 space-y-2">
                {categories.map((cat) => {
                  const isCustom = (cat as Record<string, unknown>).custom === true;
                  return (
                    <div
                      key={cat.value}
                      className="flex items-center justify-between rounded-lg border border-border-light px-3 py-2"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-text-primary">{getDisplayName(cat.label, cat.value)}</span>
                        <span className="rounded bg-surface-tertiary px-1.5 py-0.5 text-xs text-text-secondary">
                          {cat.count ?? 0}
                        </span>
                        {!isCustom && (
                          <span className="rounded bg-blue-100 px-1.5 py-0.5 text-xs text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                            {localize('com_agents_category_system') ?? 'System'}
                          </span>
                        )}
                      </div>
                      {isCustom && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleEdit(cat)}
                            className="rounded p-1 text-text-secondary hover:bg-surface-active hover:text-text-primary"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(cat.value)}
                            className="rounded p-1 text-text-secondary hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Create/Edit form */}
              <div className="rounded-lg border border-border-medium p-3">
                <h4 className="mb-2 text-sm font-medium text-text-primary">
                  {editingValue
                    ? localize('com_agents_category_updated') ?? 'Edit category'
                    : localize('com_agents_new_category') ?? 'New category'}
                </h4>
                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    placeholder={localize('com_agents_category_label') ?? 'Label'}
                    value={form.label}
                    onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                    className={inputClasses}
                  />
                  {!editingValue && (
                    <input
                      type="text"
                      placeholder={localize('com_agents_category_value') ?? 'Value (optional, auto-generated)'}
                      value={form.value}
                      onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
                      className={inputClasses}
                    />
                  )}
                  <input
                    type="text"
                    placeholder={localize('com_agents_category_description') ?? 'Description (optional)'}
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    className={inputClasses}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSubmit}
                      disabled={!form.label.trim()}
                      className="inline-flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-sm text-white hover:bg-green-700 disabled:opacity-50"
                    >
                      <Plus className="h-4 w-4" />
                      {editingValue ? (localize('com_ui_save') ?? 'Save') : (localize('com_ui_add') ?? 'Add')}
                    </button>
                    {editingValue && (
                      <button
                        onClick={handleCancelEdit}
                        className="rounded-lg border border-border-medium px-3 py-1.5 text-sm text-text-primary hover:bg-surface-active"
                      >
                        {localize('com_ui_cancel') ?? 'Cancel'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </section>
          }
        />
      </OGDialog>
    </>
  );
}
