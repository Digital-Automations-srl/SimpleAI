import path from 'path';
import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import {
  NEW_CHAT_PATH,
  messagesView,
  replyText,
  selectModelSpec,
  sendMessage,
} from '../mock/helpers';
import { expectNotBroken, resetFakes, trackPageErrors } from './helpers';

/**
 * Known failure (A4, saas-8): the provider rejects the PDF with a 400, but the rejected
 * document stays in the conversation history and is re-sent on every following turn, so
 * the chat never answers again. The second-turn test is marked fixme until fixed; the
 * first-turn test (readable error) is enforced.
 */

const PROVIDER_ERROR = /The model provider could not complete this request/;
const REJECTED_PDF = path.join(__dirname, 'fixtures', 'e2e-rejected.pdf');

test.afterEach(async () => {
  await resetFakes();
});

/** "Upload to Provider" is the upload mode that delivers the file to the model itself. */
async function attachRejectedPdf(page: Page) {
  await page.getByRole('button', { name: 'Attach File Options' }).click();
  const chooserPromise = page.waitForEvent('filechooser');
  await page.getByText('Upload to Provider').click();
  const uploaded = page.waitForResponse(
    (r) => r.url().includes('/api/files') && r.request().method() === 'POST' && r.status() === 200,
    { timeout: 30_000 },
  );
  await (await chooserPromise).setFiles(REJECTED_PDF);
  await uploaded;
  await expect(page.getByRole('button', { name: 'e2e-rejected.pdf' })).toBeVisible();
}

async function sendWithRejectedPdf(page: Page) {
  await page.goto(NEW_CHAT_PATH);
  await selectModelSpec(page, 'Mock Provider A');
  await attachRejectedPdf(page);
  await sendMessage(page, 'E2E_REPLY:a4-first');
  await expect(messagesView(page).getByText(PROVIDER_ERROR)).toBeVisible({ timeout: 30_000 });
}

test('A4 ⚠ saas-8 · documento rifiutato dal provider → errore leggibile al primo turno', async ({
  page,
}) => {
  const errors = trackPageErrors(page);
  await sendWithRejectedPdf(page);
  await expect(messagesView(page).getByText(replyText('a4-first'))).toHaveCount(0);
  await expectNotBroken(page, errors);
});

test('A4 ⚠ saas-8 · dopo un documento rifiutato la chat risponde al messaggio successivo', async ({
  page,
}) => {
  test.fixme(
    true,
    'A4: fallimento noto — il documento rifiutato resta nella storia e viene rimandato a ogni turno: anche il messaggio successivo (senza allegati) riceve lo stesso errore 400 del provider',
  );
  const errors = trackPageErrors(page);
  await sendWithRejectedPdf(page);
  await sendMessage(page, 'E2E_REPLY:a4-second');
  await expect(messagesView(page).getByText(replyText('a4-second'))).toBeVisible({
    timeout: 30_000,
  });
  await expectNotBroken(page, errors);
});
