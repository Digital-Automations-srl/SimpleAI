import { buildAidaProjectInstructions } from '../aidaProject';

const templates: Record<string, string> = {
  com_ui_aida_project_instructions: 'Project {{0}}, read AIDA folder {{1}}.',
  com_ui_aida_project_instructions_role: 'Role {{2}} in project {{0}}, read AIDA folder {{1}}.',
};

const localize = (key: string, values?: Record<string, string>) =>
  (templates[key] ?? key).replace(/\{\{(\d)\}\}/g, (_, index: string) => values?.[index] ?? '');

describe('buildAidaProjectInstructions', () => {
  it('tells the model its role and where in AIDA the project context lives', () => {
    const text = buildAidaProjectInstructions(localize, {
      name: ' Packaging ',
      role: ' Project Manager ',
      folder: ' Clienti/Packaging ',
    });
    expect(text).toBe(
      'Role Project Manager in project Packaging, read AIDA folder Clienti/Packaging.',
    );
  });

  it('leaves the role out when none was given', () => {
    const text = buildAidaProjectInstructions(localize, {
      name: 'Packaging',
      role: '',
      folder: 'Clienti/Packaging',
    });
    expect(text).toBe('Project Packaging, read AIDA folder Clienti/Packaging.');
  });

  it('adds nothing to a project without an AIDA folder', () => {
    expect(
      buildAidaProjectInstructions(localize, { name: 'Packaging', role: 'PM', folder: '  ' }),
    ).toBe('');
  });
});
