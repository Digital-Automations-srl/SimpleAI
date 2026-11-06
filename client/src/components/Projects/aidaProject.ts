import type { TranslationKeys } from '~/hooks';

type Localize = (key: TranslationKeys, values?: Record<string, string>) => string;

/**
 * SimpleAI: the opening context of an AIDA project. The model learns its role and where in
 * AIDA the rest of the project's context lives; empty when no AIDA folder was given.
 */
export function buildAidaProjectInstructions(
  localize: Localize,
  { name, role, folder }: { name: string; role: string; folder: string },
): string {
  const trimmedFolder = folder.trim();
  if (!trimmedFolder) {
    return '';
  }
  const trimmedRole = role.trim();
  const values = { 0: name.trim(), 1: trimmedFolder, 2: trimmedRole };
  return trimmedRole
    ? localize('com_ui_aida_project_instructions_role', values)
    : localize('com_ui_aida_project_instructions', values);
}
