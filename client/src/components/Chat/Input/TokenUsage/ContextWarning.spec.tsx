import { render, screen, fireEvent } from '@testing-library/react';
import ContextWarning from './ContextWarning';

jest.mock('~/hooks', () => ({
  useLocalize: () => (key: string, values?: Record<string, string>) =>
    values ? `${key}:${Object.values(values).join(',')}` : key,
}));

const handlers = () => ({
  onNewChat: jest.fn(),
  onCompact: jest.fn(),
  onHandoff: jest.fn(),
  onDetails: jest.fn(),
  onDismiss: jest.fn(),
});

const renderWarning = (overrides: Partial<Parameters<typeof ContextWarning>[0]> = {}) => {
  const props = {
    level: 'notice' as const,
    percent: 52.4,
    isCompacting: false,
    canHandoff: true,
    isHandoffRunning: false,
    ...handlers(),
    ...overrides,
  };
  render(<ContextWarning {...props} />);
  return props;
};

describe('ContextWarning', () => {
  it('announces the notice with the rounded percentage', () => {
    renderWarning();
    expect(screen.getByRole('status')).toHaveTextContent('com_ui_context_warning_notice:52');
  });

  it('uses the urgent copy above the urgent threshold', () => {
    renderWarning({ level: 'urgent', percent: 91 });
    expect(screen.getByRole('status')).toHaveTextContent('com_ui_context_warning_urgent:91');
  });

  it('runs each action from its button', () => {
    const props = renderWarning();
    fireEvent.click(screen.getByRole('button', { name: 'com_ui_context_warning_new_chat' }));
    fireEvent.click(screen.getByRole('button', { name: 'com_ui_context_compact' }));
    fireEvent.click(screen.getByRole('button', { name: 'com_ui_context_warning_handoff' }));
    fireEvent.click(screen.getByRole('button', { name: 'com_ui_context_warning_details' }));
    fireEvent.click(screen.getByRole('button', { name: 'com_ui_context_warning_dismiss' }));
    expect(props.onNewChat).toHaveBeenCalledTimes(1);
    expect(props.onCompact).toHaveBeenCalledTimes(1);
    expect(props.onHandoff).toHaveBeenCalledTimes(1);
    expect(props.onDetails).toHaveBeenCalledTimes(1);
    expect(props.onDismiss).toHaveBeenCalledTimes(1);
  });

  it('offers no compaction where the endpoint cannot compact', () => {
    renderWarning({ onCompact: undefined });
    expect(screen.queryByRole('button', { name: 'com_ui_context_compact' })).toBeNull();
  });

  it('replaces the actions with progress while compacting', () => {
    renderWarning({ isCompacting: true });
    expect(screen.getByText('com_ui_context_compacting')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'com_ui_context_warning_new_chat' })).toBeNull();
  });

  it('replaces the actions with progress while the handoff is written', () => {
    renderWarning({ isHandoffRunning: true });
    expect(screen.getByText('com_ui_context_warning_handoff_running')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'com_ui_context_warning_handoff' })).toBeNull();
  });

  it('disables the handoff when it cannot start', () => {
    renderWarning({ canHandoff: false });
    expect(screen.getByRole('button', { name: 'com_ui_context_warning_handoff' })).toBeDisabled();
  });
});
