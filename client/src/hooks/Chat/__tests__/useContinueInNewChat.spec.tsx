import { getDefaultStore } from 'jotai';
import { Constants, EModelEndpoint } from 'librechat-data-provider';
import { renderHook, act } from '@testing-library/react';
import type { TConversation, TModelSpec } from 'librechat-data-provider';
import useContinueInNewChat, {
  composerPrefillAtom,
  buildContinuationPreset,
  useApplyComposerPrefill,
} from '../useContinueInNewChat';

const mockStartNewChat = jest.fn();
let mockConversation: Partial<TConversation> | null;
let mockModelSpecs: TModelSpec[] | undefined;

const mockSetValue = jest.fn();
const mockSetDraft = jest.fn();
let mockMayClearDraft = true;

jest.mock('~/Providers', () => ({
  useChatContext: () => ({ index: 0, conversation: mockConversation }),
  useChatFormContext: () => ({ setValue: mockSetValue }),
}));
jest.mock('~/utils', () => ({
  ...jest.requireActual('~/utils'),
  setDraft: (...args: unknown[]) => mockSetDraft(...args),
  mayClearComposerDrafts: () => mockMayClearDraft,
  getComposerDraftId: (index: number) => `draft-new-${index}`,
}));
jest.mock('~/hooks/Chat/useNewChat', () => ({
  __esModule: true,
  default: () => ({ startNewChat: mockStartNewChat }),
}));
jest.mock('~/data-provider', () => ({
  useGetStartupConfig: () => ({ data: { modelSpecs: { list: mockModelSpecs } } }),
}));

const autoSpec = {
  name: 'auto',
  label: 'Automatico',
  autoRouter: true,
  preset: { endpoint: 'anthropic', model: 'claude-x' },
} as unknown as TModelSpec;

describe('buildContinuationPreset', () => {
  it('keeps the automatic spec of an Automatico conversation', () => {
    const preset = buildContinuationPreset(
      { spec: 'auto', endpoint: 'anthropic' } as TConversation,
      [autoSpec],
    );
    expect(preset.spec).toBe('auto');
    expect(preset.endpoint).toBe('anthropic');
  });

  it('keeps the agent of an agent conversation', () => {
    expect(
      buildContinuationPreset({ endpoint: 'agents', agent_id: 'agent_x' } as TConversation, []),
    ).toEqual({ endpoint: 'agents', agent_id: 'agent_x' });
  });

  it('keeps endpoint and model of a plain conversation', () => {
    expect(
      buildContinuationPreset({ endpoint: 'openAI', model: 'gpt-x' } as TConversation, undefined),
    ).toEqual({ endpoint: 'openAI', model: 'gpt-x' });
  });

  it('falls back to endpoint and model when the spec no longer exists', () => {
    expect(
      buildContinuationPreset(
        { spec: 'gone', endpoint: 'openAI', model: 'gpt-x' } as TConversation,
        [autoSpec],
      ),
    ).toEqual({ endpoint: 'openAI', model: 'gpt-x' });
  });
});

describe('useApplyComposerPrefill', () => {
  beforeEach(() => {
    mockSetValue.mockClear();
    mockSetDraft.mockClear();
    mockMayClearDraft = true;
    getDefaultStore().set(composerPrefillAtom, { index: 0, text: 'handoff text' });
  });

  it('waits while the pane still shows the old conversation', () => {
    renderHook(() => useApplyComposerPrefill({ index: 0, conversationId: 'convo-1' }));
    expect(mockSetValue).not.toHaveBeenCalled();
    expect(getDefaultStore().get(composerPrefillAtom)).not.toBeNull();
  });

  it('fills the new chat composer and its draft, then forgets the text', () => {
    renderHook(() =>
      useApplyComposerPrefill({ index: 0, conversationId: Constants.NEW_CONVO as string }),
    );
    expect(mockSetValue).toHaveBeenCalledWith('text', 'handoff text', { shouldDirty: true });
    expect(mockSetDraft).toHaveBeenCalledWith({ id: 'draft-new-0', value: 'handoff text' });
    expect(getDefaultStore().get(composerPrefillAtom)).toBeNull();
  });

  it('fills the composer but keeps the draft another live tab owns', () => {
    mockMayClearDraft = false;
    renderHook(() =>
      useApplyComposerPrefill({ index: 0, conversationId: Constants.NEW_CONVO as string }),
    );
    expect(mockSetValue).toHaveBeenCalledWith('text', 'handoff text', { shouldDirty: true });
    expect(mockSetDraft).not.toHaveBeenCalled();
  });

  it('leaves another pane alone', () => {
    renderHook(() =>
      useApplyComposerPrefill({ index: 1, conversationId: Constants.NEW_CONVO as string }),
    );
    expect(mockSetValue).not.toHaveBeenCalled();
  });
});

describe('useContinueInNewChat', () => {
  beforeEach(() => {
    mockStartNewChat.mockClear();
    mockConversation = {
      conversationId: 'convo-1',
      endpoint: EModelEndpoint.openAI,
      model: 'gpt-x',
    };
    mockModelSpecs = [autoSpec];
    getDefaultStore().set(composerPrefillAtom, null);
  });

  it('opens the new chat with a preset, which wins over the default spec', () => {
    const { result } = renderHook(() => useContinueInNewChat());
    act(() => result.current());
    expect(mockStartNewChat).toHaveBeenCalledWith({
      preset: { endpoint: 'openAI', model: 'gpt-x' },
    });
    expect(getDefaultStore().get(composerPrefillAtom)).toBeNull();
  });

  it('queues the text for the new composer before opening it', () => {
    const { result } = renderHook(() => useContinueInNewChat());
    act(() => result.current('handoff text'));
    expect(getDefaultStore().get(composerPrefillAtom)).toEqual({ index: 0, text: 'handoff text' });
  });
});
