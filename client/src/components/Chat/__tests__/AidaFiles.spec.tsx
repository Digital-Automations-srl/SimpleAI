import React from 'react';
import { ThemeProvider } from '@librechat/client';
import { RetentionMode } from 'librechat-data-provider';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import type { TStartupConfig } from 'librechat-data-provider';
import { AidaFilesButton, buildAidaFilesUrl } from '../AidaFiles';

let mockStartupConfig: Partial<TStartupConfig> | undefined;

jest.mock('~/data-provider', () => ({
  useGetStartupConfig: () => ({ data: mockStartupConfig }),
}));

jest.mock('~/hooks', () => ({
  useLocalize: () => (key: string) => (key === 'com_ui_aida_files' ? 'AIDA files' : key),
}));

jest.mock('@librechat/client', () => ({
  ...jest.requireActual('@librechat/client'),
  TooltipAnchor: ({ render: renderProp }: { render: React.ReactNode }) => <>{renderProp}</>,
}));

const AIDA_URL = 'https://aida-da.digitalautomations.it';

const defaultInterface: NonNullable<TStartupConfig['interface']> = {
  codeHighlightThrottleMs: 300,
  agentSelectorLimit: 10,
  retentionMode: RetentionMode.TEMPORARY,
};

const withAida = (url = AIDA_URL): Partial<TStartupConfig> => ({
  interface: { ...defaultInterface, aida: { url } },
});

const renderButton = (theme: 'light' | 'dark') =>
  render(
    <ThemeProvider initialTheme={theme}>
      <AidaFilesButton />
    </ThemeProvider>,
  );

describe('buildAidaFilesUrl', () => {
  it('points at the embeddable file manager with the SimpleAI skin and the theme', () => {
    expect(buildAidaFilesUrl(AIDA_URL, 'dark')).toBe(
      'https://aida-da.digitalautomations.it/embed/esplora?skin=simpleai&theme=dark',
    );
  });

  it('ignores a trailing slash or a path on the configured URL', () => {
    expect(buildAidaFilesUrl(`${AIDA_URL}/`, 'light')).toBe(
      'https://aida-da.digitalautomations.it/embed/esplora?skin=simpleai&theme=light',
    );
    expect(buildAidaFilesUrl(`${AIDA_URL}/mcp`, 'light')).toBe(
      'https://aida-da.digitalautomations.it/embed/esplora?skin=simpleai&theme=light',
    );
  });
});

describe('AidaFilesButton', () => {
  beforeEach(() => {
    mockStartupConfig = undefined;
  });

  it('stays hidden on an instance without AIDA', () => {
    mockStartupConfig = { interface: defaultInterface };
    renderButton('light');
    expect(screen.queryByRole('button', { name: 'AIDA files' })).not.toBeInTheDocument();
  });

  it('opens the file manager in an unsandboxed iframe following the theme', () => {
    mockStartupConfig = withAida();
    renderButton('dark');

    expect(screen.queryByTitle('AIDA files')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'AIDA files' }));

    const iframe = screen.getByTitle('AIDA files');
    expect(iframe).toHaveAttribute(
      'src',
      'https://aida-da.digitalautomations.it/embed/esplora?skin=simpleai&theme=dark',
    );
    expect(iframe).not.toHaveAttribute('sandbox');
  });

  it('reloads the iframe with the new theme when the user switches it', () => {
    mockStartupConfig = withAida();
    const { rerender } = renderButton('dark');
    fireEvent.click(screen.getByRole('button', { name: 'AIDA files' }));

    rerender(
      <ThemeProvider initialTheme="light">
        <AidaFilesButton />
      </ThemeProvider>,
    );

    expect(screen.getByTitle('AIDA files')).toHaveAttribute(
      'src',
      'https://aida-da.digitalautomations.it/embed/esplora?skin=simpleai&theme=light',
    );
  });
});
