import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import {
  NEW_CHAT_PATH,
  messagesView,
  replyPrompt,
  replyText,
  selectModelSpec,
  sendMessage,
  sendMessageAndWaitForCompletion,
} from '../mock/helpers';
import { expectNotBroken, resetFakes, setFakeBehavior, trackPageErrors } from './helpers';

const FALLBACK_REPLY = 'E2E fallback reply';
/** Same note the UI-only fallback test in mock/simpleai.spec.ts looks for. */
const FALLBACK_NOTE = /was temporarily unavailable/;
/** The readable error banner; the provider status may follow in parentheses. */
const PROVIDER_ERROR = /The model provider could not complete this request/;

test.afterEach(async () => {
  await resetFakes();
});

async function openProviderA(page: Page) {
  await page.goto(NEW_CHAT_PATH);
  await selectModelSpec(page, 'Mock Provider A');
}

test('D1 ⚠ saas-3,7 · 429 prima del primo token → risposta dal ripiego con nota', async ({
  page,
}) => {
  const errors = trackPageErrors(page);
  await openProviderA(page);
  await sendMessage(page, 'E2E_STATUS_ERROR:429:d1');
  await expect(messagesView(page).getByText(FALLBACK_REPLY)).toBeVisible({ timeout: 30_000 });
  await expect(messagesView(page).getByText(FALLBACK_NOTE)).toBeVisible();
  await expectNotBroken(page, errors);
});

test('D1 · 529 overloaded → stesso esito', async ({ page }) => {
  const errors = trackPageErrors(page);
  await openProviderA(page);
  await sendMessage(page, 'E2E_STATUS_ERROR:529:d1-overloaded');
  await expect(messagesView(page).getByText(FALLBACK_REPLY)).toBeVisible({ timeout: 30_000 });
  await expect(messagesView(page).getByText(FALLBACK_NOTE)).toBeVisible();
  await expectNotBroken(page, errors);
});

test('D1 · un errore senza status non ripiega', async ({ page }) => {
  const errors = trackPageErrors(page);
  await openProviderA(page);
  await sendMessage(page, 'E2E_FORCED_ERROR:d1-plain');
  await expect(messagesView(page).getByText(PROVIDER_ERROR)).toBeVisible({ timeout: 30_000 });
  await expect(messagesView(page).getByText(FALLBACK_REPLY)).toHaveCount(0);
  await expectNotBroken(page, errors);
});

test('D2 ⚠ più host · tutta la catena in errore → errore leggibile e la chat continua', async ({
  page,
}) => {
  /** The client of the failing fallback retries with backoff (~80s) before the error surfaces. */
  test.setTimeout(180_000);
  const errors = trackPageErrors(page);
  await openProviderA(page);
  await setFakeBehavior('label', { chatMode: 'error' });
  await sendMessage(page, 'E2E_STATUS_ERROR:429:d2');
  await expect(messagesView(page).getByText(PROVIDER_ERROR)).toBeVisible({ timeout: 120_000 });
  await expect(messagesView(page).getByText(FALLBACK_REPLY)).toHaveCount(0);

  await resetFakes();
  await sendMessageAndWaitForCompletion(page, replyPrompt('d2-after'));
  await expect(messagesView(page).getByText(replyText('d2-after'))).toBeVisible();
  await expectNotBroken(page, errors);
});
