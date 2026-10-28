import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import { withMongo } from '../mock/db';
import {
  NEW_CHAT_PATH,
  messagesView,
  replyPrompt,
  replyText,
  sendMessageAndWaitForCompletion,
  uniqueName,
} from '../mock/helpers';
import { expectNotBroken, resetFakes, setFakeBehavior, trackPageErrors } from './helpers';

const JEV_PORT = process.env.E2E_JEV_PORT || '8793';

test.describe.configure({ timeout: 60_000 });

test.beforeEach(async () => {
  await withMongo((db) => db.collection('routerdecisions').deleteMany({}));
});

test.afterEach(async () => {
  await resetFakes();
});

async function jevRequestCount(): Promise<number> {
  const response = await fetch(`http://127.0.0.1:${JEV_PORT}/__e2e/requests`);
  return ((await response.json()) as { count: number }).count;
}

async function selectAutomatico(page: Page) {
  await page.goto(NEW_CHAT_PATH, { timeout: 10_000 });
  const dismiss = page.getByRole('button', { name: 'Got it' });
  if (await dismiss.isVisible({ timeout: 2000 }).catch(() => false)) {
    await dismiss.click();
  }
  const autoToggle = page.getByRole('checkbox', { name: 'Auto' });
  if (!(await autoToggle.isChecked())) {
    await autoToggle.click();
  }
  await expect(autoToggle).toBeChecked();
  await expect(page.getByTestId('model-selector-button')).toContainText('E2E Automatico');
}

/** A new conversation has no stored id when the decision is written, so the collection is
 *  cleared before each test and the decision is polled (it is inserted on response close). */
async function waitForDecision() {
  let decision: Record<string, unknown> | null = null;
  await expect
    .poll(async () => {
      decision = await withMongo((db) =>
        db.collection('routerdecisions').findOne({}, { sort: { _id: -1 } }),
      );
      return decision !== null;
    })
    .toBe(true);
  return decision as unknown as Record<string, unknown>;
}

for (const mode of ['error', 'slow'] as const) {
  test(`G1 ◆ · router ${mode === 'error' ? 'in 500' : 'oltre il timeout'} → risponde il fallback${mode === 'error' ? ', nessun errore visibile' : ' entro ~timeout'}`, async ({
    page,
  }) => {
    const errors = trackPageErrors(page);
    await selectAutomatico(page);
    await setFakeBehavior('jev', { mode });

    const label = uniqueName(`g1-${mode}`);
    const started = Date.now();
    await sendMessageAndWaitForCompletion(page, replyPrompt(label));
    await expect(messagesView(page).getByText(replyText(label))).toBeVisible({ timeout: 10_000 });
    expect(Date.now() - started).toBeLessThan(10_000);

    expect(await jevRequestCount()).toBeGreaterThanOrEqual(1);
    const decision = await waitForDecision();
    expect(decision.spec).toBe('e2e-mock-provider-b');
    expect(decision.fallbackReason).toBe('request_failed');
    if (mode === 'slow') {
      expect(decision.latencyMs as number).toBeGreaterThanOrEqual(900);
    } else {
      expect(decision.latencyMs as number).toBeLessThan(800);
    }
    await expectNotBroken(page, errors);
  });
}

test('G1 · router ok → la richiesta passa dal router', async ({ page }) => {
  const errors = trackPageErrors(page);
  await selectAutomatico(page);
  await setFakeBehavior('jev', { mode: 'ok' });

  const label = uniqueName('g1-ok');
  await sendMessageAndWaitForCompletion(page, replyPrompt(label));
  await expect(messagesView(page).getByText(replyText(label))).toBeVisible({ timeout: 10_000 });

  expect(await jevRequestCount()).toBeGreaterThanOrEqual(1);
  const decision = await waitForDecision();
  expect(decision.spec).toBe('e2e-mock-provider-a');
  expect(decision.fallbackReason).toBeUndefined();
  await expectNotBroken(page, errors);
});
