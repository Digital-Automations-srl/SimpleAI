import { applyProjectInstructions } from './instructions';

const projects = new Map([
  ['user-1:aida', { instructions: 'Sei il Project Manager del progetto Packaging.' }],
  ['user-1:empty', { instructions: '  ' }],
]);

const getChatProject = async (user: string, projectId: string) =>
  projects.get(`${user}:${projectId}`) ?? null;

describe('applyProjectInstructions', () => {
  it("adds the project's instructions after the agent's own", async () => {
    const agent = { additional_instructions: 'Rispondi in italiano.' };

    await applyProjectInstructions({
      agent,
      userId: 'user-1',
      chatProjectId: 'aida',
      getChatProject,
    });

    expect(agent.additional_instructions).toBe(
      'Rispondi in italiano.\n\nSei il Project Manager del progetto Packaging.',
    );
  });

  it('sets them when the agent has none', async () => {
    const agent: { additional_instructions?: string } = {};
    await applyProjectInstructions({
      agent,
      userId: 'user-1',
      chatProjectId: 'aida',
      getChatProject,
    });
    expect(agent.additional_instructions).toBe('Sei il Project Manager del progetto Packaging.');
  });

  it("leaves the agent untouched for someone else's project, a blank one or no project", async () => {
    const cases = [
      { userId: 'user-2', chatProjectId: 'aida' },
      { userId: 'user-1', chatProjectId: 'empty' },
      { userId: 'user-1', chatProjectId: null },
    ];
    for (const params of cases) {
      const agent = { additional_instructions: 'Rispondi in italiano.' };
      await applyProjectInstructions({ agent, ...params, getChatProject });
      expect(agent.additional_instructions).toBe('Rispondi in italiano.');
    }
  });

  it('never fails the turn when the project cannot be read', async () => {
    const agent = { additional_instructions: 'Rispondi in italiano.' };
    const failing = async () => {
      throw new Error('db down');
    };
    await applyProjectInstructions({
      agent,
      userId: 'user-1',
      chatProjectId: 'aida',
      getChatProject: failing,
    });
    expect(agent.additional_instructions).toBe('Rispondi in italiano.');
  });
});
