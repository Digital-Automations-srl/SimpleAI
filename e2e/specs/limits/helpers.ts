import { expect } from '@playwright/test';
import type { Page } from '@playwright/test';

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
