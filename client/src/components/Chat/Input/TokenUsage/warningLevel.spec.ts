import { getDefaultStore } from 'jotai';
import { renderHook, act } from '@testing-library/react';
import type { ContextWarningLevel } from './warningLevel';
import {
  contextWarningStateAtom,
  getContextWarningLevel,
  isContextWarningVisible,
  useContextWarningState,
} from './warningLevel';

const visible = (level: ContextWarningLevel, dismissed: ContextWarningLevel, suppressed = false) =>
  isContextWarningVisible({ level, dismissed, suppressed });

describe('getContextWarningLevel', () => {
  it('stays quiet below 45%', () => {
    expect(getContextWarningLevel(44.9, 1000)).toBe('none');
  });

  it('notices from 45% and turns urgent from 80%', () => {
    expect(getContextWarningLevel(45, 1000)).toBe('notice');
    expect(getContextWarningLevel(79.9, 1000)).toBe('notice');
    expect(getContextWarningLevel(80, 1000)).toBe('urgent');
  });

  it('stays quiet when the context size is unknown', () => {
    expect(getContextWarningLevel(90, undefined)).toBe('none');
    expect(getContextWarningLevel(90, 0)).toBe('none');
  });
});

describe('isContextWarningVisible', () => {
  it('shows an undismissed warning', () => {
    expect(visible('notice', 'none')).toBe(true);
    expect(visible('none', 'none')).toBe(false);
  });

  it('keeps a dismissed warning hidden until it turns urgent', () => {
    expect(visible('notice', 'notice')).toBe(false);
    expect(visible('urgent', 'notice')).toBe(true);
    expect(visible('urgent', 'urgent')).toBe(false);
  });

  it('hides after a compaction until the next turn', () => {
    expect(visible('urgent', 'none', true)).toBe(false);
    expect(visible('urgent', 'none', false)).toBe(true);
  });
});

describe('useContextWarningState', () => {
  const render = (props: { warningKey: string; isCompacting: boolean; isSubmitting: boolean }) =>
    renderHook((current) => useContextWarningState(current), { initialProps: props });

  beforeEach(() => getDefaultStore().set(contextWarningStateAtom, {}));

  it('suppresses the chat that was compacted, even after switching away', () => {
    const hook = render({ warningKey: 'A', isCompacting: true, isSubmitting: true });
    hook.rerender({ warningKey: 'B', isCompacting: false, isSubmitting: false });
    expect(hook.result.current.suppressed).toBe(false);
    expect(getDefaultStore().get(contextWarningStateAtom)).toEqual({ A: { suppressed: true } });
  });

  it('lifts the suppression when the next turn starts', () => {
    const hook = render({ warningKey: 'A', isCompacting: true, isSubmitting: true });
    hook.rerender({ warningKey: 'A', isCompacting: false, isSubmitting: false });
    expect(hook.result.current.suppressed).toBe(true);
    hook.rerender({ warningKey: 'A', isCompacting: false, isSubmitting: true });
    expect(hook.result.current.suppressed).toBe(false);
  });

  it('keeps nothing for chats that were only visited', () => {
    const hook = render({ warningKey: 'A', isCompacting: false, isSubmitting: false });
    hook.rerender({ warningKey: 'B', isCompacting: false, isSubmitting: true });
    hook.rerender({ warningKey: 'C', isCompacting: false, isSubmitting: false });
    expect(getDefaultStore().get(contextWarningStateAtom)).toEqual({});
  });

  it('remembers a dismissal per chat', () => {
    const hook = render({ warningKey: 'A', isCompacting: false, isSubmitting: false });
    act(() => hook.result.current.dismiss('notice'));
    expect(hook.result.current.dismissed).toBe('notice');
    hook.rerender({ warningKey: 'B', isCompacting: false, isSubmitting: false });
    expect(hook.result.current.dismissed).toBe('none');
  });
});
