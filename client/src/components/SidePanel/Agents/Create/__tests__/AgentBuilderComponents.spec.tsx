import React, { useState } from 'react';
import { RecoilRoot, useRecoilValue } from 'recoil';
import { dataService } from 'librechat-data-provider';
import { FormProvider, useForm } from 'react-hook-form';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import type {
  TStartupConfig,
  AgentBuilderMessage,
  AgentBuilderResponse,
} from 'librechat-data-provider';
import type { AgentForm } from '~/common';
import AgentPreviewButton from '../AgentPreviewButton';
import AgentBuilderTabs from '../AgentBuilderTabs';
import AgentCreate from '../AgentCreate';
import store from '~/store';

/**
 * SimpleAI agent builder components with the real form, query client and Recoil store. Only the
 * pieces outside the builder are replaced: translations (keys are rendered as they are), the
 * full configuration form, the agent panel context and the conversation switch.
 */
const mockNewConversation = jest.fn();
const mockStartupConfig: { current: Partial<TStartupConfig> } = { current: {} };

jest.mock('librechat-data-provider', () => {
  const actual =
    jest.requireActual<typeof import('librechat-data-provider')>('librechat-data-provider');
  return { ...actual, dataService: { ...actual.dataService } };
});

jest.mock('~/hooks', () => ({
  useLocalize: () => (key: string) => key,
  useNewConvo: () => ({ newConversation: mockNewConversation }),
}));

jest.mock('~/Providers/AgentPanelContext', () => ({
  useAgentPanelContext: () => ({ startupConfig: mockStartupConfig.current }),
}));

jest.mock('../../AgentConfig', () => ({
  __esModule: true,
  default: () => <div data-testid="agent-config" />,
}));

const baseValues = {
  name: 'Vecchio',
  description: '',
  instructions: '',
  category: 'general',
  provider: 'anthropic',
  model: 'claude-sonnet-5',
  web_search: false,
  execute_code: false,
} as Partial<AgentForm>;

function TemporaryFlag() {
  const isTemporary = useRecoilValue(store.isTemporary);
  return <output data-testid="is-temporary">{String(isTemporary)}</output>;
}

function Harness({
  values = baseValues,
  children,
}: {
  values?: Partial<AgentForm>;
  children: (
    messages: AgentBuilderMessage[],
    setMessages: React.Dispatch<React.SetStateAction<AgentBuilderMessage[]>>,
  ) => React.ReactNode;
}) {
  const methods = useForm<AgentForm>({ defaultValues: values as AgentForm });
  const [messages, setMessages] = useState<AgentBuilderMessage[]>([]);
  const [queryClient] = useState(() => new QueryClient());
  return (
    <RecoilRoot>
      <QueryClientProvider client={queryClient}>
        <FormProvider {...methods}>
          {children(messages, setMessages)}
          <output data-testid="form-name">{methods.watch('name')}</output>
          <TemporaryFlag />
        </FormProvider>
      </QueryClientProvider>
    </RecoilRoot>
  );
}

function renderCreate(onConfigure = jest.fn()) {
  render(
    <Harness>
      {(messages, setMessages) => (
        <AgentCreate messages={messages} setMessages={setMessages} onConfigure={onConfigure} />
      )}
    </Harness>,
  );
  return screen.getByRole('textbox', { name: 'com_agents_create_placeholder' });
}

const response: AgentBuilderResponse = {
  reply: 'Ho creato il traduttore',
  draft: { name: 'Traduttore', tools: [] },
};

beforeAll(() => {
  /** jsdom has no layout: the conversation log scrolls to its end after every turn. */
  Element.prototype.scrollTo = jest.fn();
});

afterEach(() => {
  jest.restoreAllMocks();
  mockNewConversation.mockReset();
  mockStartupConfig.current = {};
});

describe('AgentCreate', () => {
  it('sends on Enter, not on Shift+Enter, and only once while drafting', async () => {
    let resolveDraft: (value: AgentBuilderResponse) => void = () => undefined;
    const generate = jest
      .spyOn(dataService, 'generateAgentDraft')
      .mockImplementation(() => new Promise((resolve) => (resolveDraft = resolve)));
    const textbox = renderCreate();

    fireEvent.change(textbox, { target: { value: 'Un traduttore' } });
    fireEvent.keyDown(textbox, { key: 'Enter', shiftKey: true });
    expect(generate).not.toHaveBeenCalled();

    fireEvent.keyDown(textbox, { key: 'Enter' });
    await waitFor(() => expect(generate).toHaveBeenCalledTimes(1));
    expect(generate).toHaveBeenCalledWith({
      messages: [{ role: 'user', text: 'Un traduttore' }],
      current: expect.objectContaining({ name: 'Vecchio', provider: 'anthropic', tools: [] }),
    });
    expect(screen.getByText('com_agents_create_generating')).toBeInTheDocument();

    fireEvent.change(textbox, { target: { value: 'Più formale' } });
    fireEvent.keyDown(textbox, { key: 'Enter' });
    expect(screen.getByRole('button', { name: 'com_agents_create_send' })).toBeDisabled();
    expect(generate).toHaveBeenCalledTimes(1);

    await act(async () => resolveDraft(response));
    expect(await screen.findByText('Ho creato il traduttore')).toBeInTheDocument();
    expect(screen.getByTestId('form-name')).toHaveTextContent('Traduttore');
  });

  it('keeps the conversation and the form when the draft fails', async () => {
    jest.spyOn(dataService, 'generateAgentDraft').mockRejectedValue(new Error('502'));
    const textbox = renderCreate();

    fireEvent.change(textbox, { target: { value: 'Un traduttore' } });
    fireEvent.click(screen.getByRole('button', { name: 'com_agents_create_send' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('com_agents_create_failed');
    expect(screen.getByTestId('agent-create-user')).toHaveTextContent('Un traduttore');
    expect(screen.queryByTestId('agent-create-assistant')).not.toBeInTheDocument();
    expect(screen.getByTestId('form-name')).toHaveTextContent('Vecchio');
    expect(
      screen.queryByRole('button', { name: 'com_agents_create_review' }),
    ).not.toBeInTheDocument();
  });
});

describe('AgentPreviewButton', () => {
  function renderPreview(values: Partial<AgentForm>) {
    render(<Harness values={values}>{() => <AgentPreviewButton />}</Harness>);
    return screen.getByRole('button', { name: 'com_agents_preview' });
  }

  it.each([
    ['no model', { ...baseValues, model: null }],
    ['no provider', { ...baseValues, provider: undefined }],
  ])('is disabled with %s', (_label, values) => {
    const button = renderPreview(values as Partial<AgentForm>);
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(mockNewConversation).not.toHaveBeenCalled();
    expect(screen.getByTestId('is-temporary')).toHaveTextContent('false');
  });

  it('opens the draft in a temporary chat once a model is chosen', () => {
    const button = renderPreview({ ...baseValues, instructions: 'Sei un traduttore.' });
    expect(button).toBeEnabled();

    fireEvent.click(button);

    expect(screen.getByTestId('is-temporary')).toHaveTextContent('true');
    expect(mockNewConversation).toHaveBeenCalledWith({
      preset: expect.objectContaining({
        endpoint: 'anthropic',
        model: 'claude-sonnet-5',
        promptPrefix: 'Sei un traduttore.',
        modelLabel: 'Vecchio',
      }),
    });
  });
});

describe('AgentBuilderTabs', () => {
  function renderTabs() {
    render(
      <Harness>
        {(messages, setMessages) => (
          <AgentBuilderTabs
            tab="create"
            setTab={jest.fn()}
            messages={messages}
            setMessages={setMessages}
          />
        )}
      </Harness>,
    );
  }

  it('shows only the configuration form without agentBuilder', () => {
    renderTabs();
    expect(screen.getByTestId('agent-config')).toBeInTheDocument();
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'com_agents_preview' })).not.toBeInTheDocument();
  });

  it('offers Create, Configure and the preview with agentBuilder', () => {
    mockStartupConfig.current = { agentBuilder: true };
    renderTabs();
    expect(screen.getAllByRole('tab').map((tab) => tab.textContent)).toEqual([
      'com_agents_tab_create',
      'com_agents_tab_configure',
    ]);
    expect(screen.getByRole('tab', { name: 'com_agents_tab_create' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByRole('button', { name: 'com_agents_preview' })).toBeInTheDocument();
    expect(screen.queryByTestId('agent-config')).not.toBeInTheDocument();
  });
});
