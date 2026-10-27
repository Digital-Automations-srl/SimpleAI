import { renderHook, act } from '@testing-library/react';
import { useAgentBuilderState } from '../useAgentBuilderState';

function renderState(agentId?: string) {
  return renderHook(({ id }: { id?: string }) => useAgentBuilderState(id), {
    initialProps: { id: agentId },
  });
}

describe('useAgentBuilderState', () => {
  it('opens a new agent on "Crea" and an existing one on "Configura"', () => {
    expect(renderState().result.current.tab).toBe('create');
    expect(renderState('agent_1').result.current.tab).toBe('configure');
  });

  it('keeps the conversation when the drafted agent is saved', () => {
    const { result, rerender } = renderState();
    act(() => result.current.setMessages([{ role: 'user', text: 'Un traduttore' }]));

    rerender({ id: 'agent_new' });

    expect(result.current.tab).toBe('create');
    expect(result.current.messages).toHaveLength(1);
  });

  it('starts over when another agent is opened', () => {
    const { result, rerender } = renderState('agent_1');
    act(() => {
      result.current.setTab('create');
      result.current.setMessages([{ role: 'user', text: 'Più formale' }]);
    });

    rerender({ id: 'agent_2' });

    expect(result.current.tab).toBe('configure');
    expect(result.current.messages).toEqual([]);
  });

  it('keeps the chosen tab when a new agent is started', () => {
    const { result, rerender } = renderState('agent_1');
    rerender({ id: undefined });

    expect(result.current.tab).toBe('configure');
    expect(result.current.messages).toEqual([]);
  });
});
