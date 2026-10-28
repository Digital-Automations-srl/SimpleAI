/**
 * Limits suite (design: docs/superpowers/specs/2026-10-28-suite-e2e-limiti-design.md).
 * Run with `npm run e2e:limits` (sets E2E_LIMITS=true; without it the overlay is off).
 *
 * Requires `workers: 1` (global fakes, routerdecisions clearing, sidebar ordering): the limits
 * config sets it explicitly; do not run these specs in parallel.
 *
 * Known failures, kept as test.fixme until the product is fixed (case ID, spec, behavior):
 * - A4 (saas-8) · a-documents.spec.ts · after a provider-rejected PDF the document stays in the
 *   history and is re-sent every turn: the next message gets the same 400.
 * - H1 · h-drafts.spec.ts · the attachment is lost when switching chat and coming back
 *   (filesDraft_<id> removed by useAutoSave setFiles(new Map())); the text draft survives.
 */
import fs from 'fs';
import path from 'path';
import { expect } from '@playwright/test';
import type { Page } from '@playwright/test';

const EN_STRINGS: Record<string, string> = JSON.parse(
  fs.readFileSync(
    path.resolve(__dirname, '../../../client/src/locales/en/translation.json'),
    'utf8',
  ),
);

/**
 * Regex for a UI string looked up by locale key, so a wording change in the translation file
 * does not break the suite (spec §2). `{{…}}` placeholders match any text.
 */
export function localeText(key: string): RegExp {
  const text = EN_STRINGS[key];
  if (text === undefined) {
    throw new Error(`locale key not found: ${key}`);
  }
  /** Trailing period dropped: the upstream message may continue with " (status N)". */
  const pattern = text
    .replace(/\.$/, '')
    .split(/\{\{[^}]*\}\}/)
    .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('.+?');
  return new RegExp(pattern);
}

const FAKE_PORTS = {
  label: process.env.E2E_LABEL_PORT || '8889',
  action: process.env.E2E_ACTION_PORT || '8792',
  jev: process.env.E2E_JEV_PORT || '8793',
} as const;

type FakeServer = keyof typeof FAKE_PORTS;

async function postFake(server: FakeServer, path: string, body?: Record<string, unknown>) {
  const response = await fetch(`http://127.0.0.1:${FAKE_PORTS[server]}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body ?? {}),
  });
  if (!response.ok) {
    throw new Error(`fake ${server} ${path} -> ${response.status}`);
  }
}

export async function setFakeBehavior(server: FakeServer, behavior: Record<string, unknown>) {
  await postFake(server, '/__e2e/behavior', behavior);
}

export async function resetFakes() {
  await Promise.all(
    (Object.keys(FAKE_PORTS) as FakeServer[]).map((s) => postFake(s, '/__e2e/reset')),
  );
}

export function trackPageErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  return errors;
}

export async function expectNotBroken(page: Page, pageErrors: string[]) {
  await expect(page.getByText(/something went wrong/i)).toHaveCount(0);
  await expect(page.getByText(/unhandled error/i)).toHaveCount(0);
  expect(pageErrors).toEqual([]);
}
