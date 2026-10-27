import { renderHook, act } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import type { AgentBuilderMessage } from 'librechat-data-provider';
import type { AgentForm } from '~/common';
import {
  applyAgentDraft,
  getAgentPreview,
  getBuilderCurrent,
  trimBuilderHistory,
  BUILDER_HISTORY_LIMIT,
} from '../draft';

describe('trimBuilderHistory', () => {
  it('keeps the most recent turns and opens the window on a user turn', () => {
    const messages: AgentBuilderMessage[] = Array.from(
      { length: BUILDER_HISTORY_LIMIT + 1 },
      (_, index) => ({ role: index % 2 === 0 ? 'user' : 'assistant', text: `m${index}` }),
    );
    const trimmed = trimBuilderHistory(messages);
    expect(trimmed[0]).toEqual({ role: 'user', text: 'm2' });
    expect(trimmed[trimmed.length - 1]).toEqual(messages[messages.length - 1]);
  });

  it('leaves a short history untouched', () => {
    const messages: AgentBuilderMessage[] = [{ role: 'user', text: 'ciao' }];
    expect(trimBuilderHistory(messages)).toEqual(messages);
  });
});

describe('getBuilderCurrent', () => {
  it('reads the provider option value and the enabled builder tools', () => {
    const current = getBuilderCurrent({
      name: 'Agente',
      description: null,
      instructions: 'Sei un agente',
      category: 'hr',
      provider: { label: 'Anthropic', value: 'anthropic' },
      model: 'claude-sonnet-5',
      web_search: true,
      execute_code: false,
      file_search: true,
    } as AgentForm);

    expect(current).toEqual({
      name: 'Agente',
      description: null,
      instructions: 'Sei un agente',
      category: 'hr',
      provider: 'anthropic',
      model: 'claude-sonnet-5',
      tools: ['web_search'],
    });
  });
});

describe('getAgentPreview', () => {
  it('turns the form into a chat with the same model, instructions and tools only', () => {
    const preview = getAgentPreview({
      name: 'Agente HR',
      instructions: 'Rispondi sulle ferie',
      provider: { label: 'Anthropic', value: 'anthropic' },
      model: 'claude-sonnet-5',
      model_parameters: { temperature: 0.3 },
      web_search: true,
      execute_code: false,
      file_search: true,
    } as AgentForm);

    expect(preview).toEqual({
      preset: {
        temperature: 0.3,
        endpoint: 'anthropic',
        model: 'claude-sonnet-5',
        promptPrefix: 'Rispondi sulle ferie',
        modelLabel: 'Agente HR',
      },
      ephemeralAgent: {
        mcp: [],
        web_search: true,
        execute_code: false,
        file_search: false,
        memory: false,
        skills: false,
        artifacts: '',
      },
    });
  });

  it('has nothing to try until a model is chosen', () => {
    expect(
      getAgentPreview({ name: 'Agente', provider: 'anthropic', model: null } as AgentForm),
    ).toBeNull();
  });
});

describe('applyAgentDraft', () => {
  function renderForm() {
    return renderHook(() => {
      const form = useForm<AgentForm>({
        defaultValues: {
          name: 'Vecchio',
          description: 'Vecchia descrizione',
          category: 'general',
          provider: 'openAI',
          model: 'gpt-old',
          web_search: true,
          execute_code: false,
        },
      });
      /** react-hook-form only tracks the form state a component reads. */
      void form.formState.dirtyFields;
      return form;
    });
  }

  it('writes every drafted field as a user edit', () => {
    const { result } = renderForm();
    act(() =>
      applyAgentDraft(
        {
          name: 'Assistente HR',
          instructions: 'Sei un assistente HR.',
          category: 'hr',
          provider: 'anthropic',
          model: 'claude-haiku-5-5',
          tools: ['execute_code'],
        },
        result.current.setValue,
      ),
    );

    const values = result.current.getValues();
    expect(values).toMatchObject({
      name: 'Assistente HR',
      description: 'Vecchia descrizione',
      instructions: 'Sei un assistente HR.',
      category: 'hr',
      model: 'claude-haiku-5-5',
      web_search: false,
      execute_code: true,
    });
    expect(values.provider).toMatchObject({ value: 'anthropic' });
    expect(result.current.formState.dirtyFields.name).toBe(true);
  });

  it('keeps the model when the draft names no available model', () => {
    const { result } = renderForm();
    act(() => applyAgentDraft({ name: 'Nuovo', tools: [] }, result.current.setValue));

    expect(result.current.getValues()).toMatchObject({
      name: 'Nuovo',
      provider: 'openAI',
      model: 'gpt-old',
      web_search: false,
    });
  });
});
