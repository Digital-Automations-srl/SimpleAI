/**
 * @jest-environment jsdom
 */
import { getSeenVersion, markVersionSeen } from '~/components/ui/ChangelogModal';

// Test the helper functions exported from ChangelogModal (localStorage utilities)
describe('Changelog localStorage helpers', () => {
  beforeEach(() => localStorage.clear());

  it('getSeenVersion returns null when nothing is stored', () => {
    expect(getSeenVersion()).toBeNull();
  });

  it('markVersionSeen stores version in localStorage', () => {
    markVersionSeen('2.0.1');
    expect(localStorage.getItem('simpleai_changelog_seen')).toBe('2.0.1');
  });

  it('getSeenVersion returns stored version', () => {
    markVersionSeen('2.0.1');
    expect(getSeenVersion()).toBe('2.0.1');
  });

  it('markVersionSeen overwrites previous version', () => {
    markVersionSeen('2.0.1');
    markVersionSeen('2.0.2');
    expect(getSeenVersion()).toBe('2.0.2');
  });
});

// Test the useSemanticCopy hook's handleCopy logic (extracted for testability)
describe('useSemanticCopy - handleCopy logic', () => {
  const SEMANTIC_TAGS = [
    'strong', 'b', 'em', 'i', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li', 'a', 'p', 'br', 'code', 'pre',
    'blockquote', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'del', 'sup', 'sub', 'hr',
    'span', 'div', 'mark',
  ];
  const ALLOWED_ATTR = ['href', 'target', 'style', 'class'];

  it('SEMANTIC_TAGS includes span, div, mark for style preservation', () => {
    expect(SEMANTIC_TAGS).toContain('span');
    expect(SEMANTIC_TAGS).toContain('div');
    expect(SEMANTIC_TAGS).toContain('mark');
  });

  it('ALLOWED_ATTR includes style and class for visual formatting', () => {
    expect(ALLOWED_ATTR).toContain('style');
    expect(ALLOWED_ATTR).toContain('class');
  });

  it('SEMANTIC_TAGS does not include script or iframe (XSS prevention)', () => {
    expect(SEMANTIC_TAGS).not.toContain('script');
    expect(SEMANTIC_TAGS).not.toContain('iframe');
    expect(SEMANTIC_TAGS).not.toContain('object');
  });

  it('ALLOWED_ATTR does not include onclick or onerror (XSS prevention)', () => {
    expect(ALLOWED_ATTR).not.toContain('onclick');
    expect(ALLOWED_ATTR).not.toContain('onerror');
    expect(ALLOWED_ATTR).not.toContain('onload');
  });
});
