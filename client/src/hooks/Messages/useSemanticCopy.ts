import { useEffect } from 'react';
import DOMPurify from 'dompurify';

const SEMANTIC_TAGS = [
  'strong', 'b', 'em', 'i', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li', 'a', 'p', 'br', 'code', 'pre',
  'blockquote', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
  'del', 'sup', 'sub', 'hr',
  'span', 'div', 'mark',
];

function isWithinMessage(node: Node): boolean {
  const el = node instanceof HTMLElement ? node : node.parentElement;
  return el?.closest('.message-render') != null;
}

function handleCopy(e: ClipboardEvent): void {
  try {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      return;
    }

    const range = selection.getRangeAt(0);
    if (!isWithinMessage(range.commonAncestorContainer)) {
      return;
    }

    const fragment = range.cloneContents();
    const div = document.createElement('div');
    div.appendChild(fragment);

    const rawHtml = div.innerHTML;
    const cleanHtml = DOMPurify.sanitize(rawHtml, {
      ALLOWED_TAGS: SEMANTIC_TAGS,
      ALLOWED_ATTR: ['href', 'target', 'style', 'class'],
    });
    const plainText = selection.toString();

    e.preventDefault();
    e.clipboardData?.setData('text/html', cleanHtml);
    e.clipboardData?.setData('text/plain', plainText);
  } catch {
    // Fallback: lascia il comportamento di copia default del browser
  }
}

export default function useSemanticCopy(): void {
  useEffect(() => {
    document.addEventListener('copy', handleCopy);
    return () => document.removeEventListener('copy', handleCopy);
  }, []);
}
