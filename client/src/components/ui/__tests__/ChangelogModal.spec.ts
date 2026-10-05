import { getSeenVersion, markVersionSeen, shouldShowChangelog } from '../ChangelogModal';

describe('shouldShowChangelog', () => {
  beforeEach(() => localStorage.clear());

  it('records the current version silently on a first visit', () => {
    expect(shouldShowChangelog('2.1.0')).toBe(false);
    expect(getSeenVersion()).toBe('2.1.0');
  });

  it('shows a version newer than the one already seen', () => {
    markVersionSeen('2.0.1');
    expect(shouldShowChangelog('2.1.0')).toBe(true);
    expect(getSeenVersion()).toBe('2.0.1');
  });

  it('stays hidden once the current version was seen', () => {
    markVersionSeen('2.1.0');
    expect(shouldShowChangelog('2.1.0')).toBe(false);
  });
});
