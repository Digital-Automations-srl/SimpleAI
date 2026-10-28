import { expect, test } from '@playwright/test';
import {
  NEW_CHAT_PATH,
  messagesView,
  replyPrompt,
  replyText,
  selectModelSpec,
  sendMessageAndWaitForCompletion,
} from '../mock/helpers';
import { expectNotBroken, resetFakes, trackPageErrors } from './helpers';

test.beforeEach(async () => {
  await resetFakes();
});

test('harness · overlay attivo e chat funzionante', async ({ page }) => {
  const errors = trackPageErrors(page);
  await page.goto(NEW_CHAT_PATH);
  await selectModelSpec(page, 'E2E Limits Small Context');
  await sendMessageAndWaitForCompletion(page, replyPrompt('harness'));
  await expect(messagesView(page).getByText(replyText('harness'))).toBeVisible();
  await expectNotBroken(page, errors);
});
