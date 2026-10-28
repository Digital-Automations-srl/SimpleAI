import React from 'react';
import { RecoilRoot } from 'recoil';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AgentPanelProvider } from '../AgentPanelContext';
import store from '~/store';

const mockUseGetActionsQuery = jest.fn();

jest.mock('~/data-provider', () => ({
  useGetActionsQuery: (...args: unknown[]) => mockUseGetActionsQuery(...args),
  useAvailableToolsQuery: () => ({ data: undefined }),
  useGetStartupConfig: () => ({ data: undefined }),
  useMCPToolsQuery: () => ({ data: undefined, isFetching: false }),
}));

jest.mock('~/hooks', () => ({
  useMCPServerManager: () => ({
    availableMCPServers: [],
    isLoading: false,
    availableMCPServersMap: {},
    connectionStatus: {},
  }),
  useGetAgentsConfig: () => ({ agentsConfig: undefined, endpointsConfig: undefined }),
  activateCatalog: jest.fn(),
  useCatalogReady: () => false,
  useLocalize: () => (key: string) => key,
}));

jest.mock('~/hooks/MCP/useMCPRefresh', () => ({ useMCPRefresh: jest.fn() }));

function renderProvider({
  sidebarExpanded,
  observeToolAuthorization,
}: {
  sidebarExpanded: boolean;
  observeToolAuthorization: boolean;
}) {
  return render(
    <RecoilRoot initializeState={({ set }) => set(store.sidebarExpanded, sidebarExpanded)}>
      <MemoryRouter initialEntries={['/c/new']}>
        <AgentPanelProvider observeToolAuthorization={observeToolAuthorization}>
          <div />
        </AgentPanelProvider>
      </MemoryRouter>
    </RecoilRoot>,
  );
}

function lastActionsQueryEnabled(): boolean | undefined {
  const calls = mockUseGetActionsQuery.mock.calls;
  return calls[calls.length - 1]?.[1]?.enabled;
}

describe('AgentPanelProvider actions query', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseGetActionsQuery.mockReturnValue({ data: undefined });
  });

  it('loads the actions of the edited agent when the chat is not an agent chat', () => {
    renderProvider({ sidebarExpanded: true, observeToolAuthorization: false });
    expect(lastActionsQueryEnabled()).toBe(true);
  });

  it('loads the actions in an agent chat', () => {
    renderProvider({ sidebarExpanded: true, observeToolAuthorization: true });
    expect(lastActionsQueryEnabled()).toBe(true);
  });

  it('waits while the panel is hidden', () => {
    renderProvider({ sidebarExpanded: false, observeToolAuthorization: true });
    expect(lastActionsQueryEnabled()).toBe(false);
  });
});
