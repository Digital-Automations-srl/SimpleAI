import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  NEW_CHAT_PATH,
  messagesView,
  replyPrompt,
  MOCK_ENDPOINTS,
  replyText,
  selectMockEndpoint,
  sendMessageAndWaitForCompletion,
  uploadViaUnifiedButton,
} from '../mock/helpers';
import { expectNotBroken, resetFakes, trackPageErrors } from './helpers';

const NOTE_NAME = 'e2e-note.txt';
const NOTE_CONTENT = readFileSync(join(__dirname, 'fixtures', NOTE_NAME), 'utf8');

const composer = (page: Page) => page.getByRole('textbox', { name: 'Message input' });
const newChatButton = (page: Page) =>
  page.getByTestId('new-chat-button').or(page.getByTestId('header-new-chat-button')).first();

test.afterEach(async () => {
  await resetFakes();
});

/** Creates a conversation (one answered turn) and returns its URL. */
async function createConversation(page: Page, label: string): Promise<string> {
  await page.goto(NEW_CHAT_PATH);
  /** Same endpoint as the mock attachment tests: the unified attach button exists there. */
  await selectMockEndpoint(page, MOCK_ENDPOINTS[1]);
  await sendMessageAndWaitForCompletion(page, replyPrompt(label));
  await expect(messagesView(page).getByText(replyText(label))).toBeVisible();
  await expect(page).toHaveURL(/\/c\/(?!new)[^/]+$/);
  return page.url();
}

/** Types the draft, attaches the note, waits for the upload and for the draft to be stored. */
async function fillDraft(page: Page, draft: string) {
  await composer(page).fill(draft);
  const upload = await uploadViaUnifiedButton(page, {
    name: NOTE_NAME,
    mimeType: 'text/plain',
    content: NOTE_CONTENT,
  });
  expect(upload.ok()).toBeTruthy();
  await expect(page.getByText(NOTE_NAME)).toBeVisible();
  /** Text draft saves after a 25 ms debounce, the files draft on the next effect: wait for both
   * to appear in localStorage rather than sleeping. */
  await expect
    .poll(() =>
      page.evaluate((text) => {
        const keys = Object.keys(localStorage);
        /** textDraft_<id> holds the text base64-encoded; filesDraft_<id> holds the file ids. */
        const textSaved = keys.some(
          (k) => k.startsWith('textDraft_') && localStorage.getItem(k) === btoa(text),
        );
        const filesSaved = keys.some(
          (k) =>
            k.startsWith('filesDraft_') && /^\["|"fileIds":\["/.test(localStorage.getItem(k) ?? ''),
        );
        return textSaved && filesSaved;
      }, draft),
    )
    .toBe(true);
}

test('H1 ◆ useNewChat · la bozza resta dopo reload', async ({ page }) => {
  const errors = trackPageErrors(page);
  const draft = `bozza H1 ${Date.now()}`;
  await createConversation(page, 'h1-reload');
  await fillDraft(page, draft);

  await page.reload();

  await expect(composer(page)).toHaveValue(draft);
  await expect(page.getByText(NOTE_NAME)).toBeVisible();
  await expectNotBroken(page, errors);
});

test('H1 · la bozza resta cambiando chat e tornando', async ({ page }) => {
  const errors = trackPageErrors(page);
  const draft = `bozza H1 ${Date.now()}`;
  const first = await createConversation(page, 'h1-switch-a');
  const second = await createConversation(page, 'h1-switch-b');
  expect(second).not.toBe(first);
  await page.goto(first);
  await fillDraft(page, draft);

  /** Switch through the sidebar (SPA navigation, no reload) and come back. "New chat" is not the
   * way: it deliberately empties the composer (see the next test). Titles are all "New Chat" and
   * the list is newest-first: B is the first item, A the second. */
  await page.getByTestId('convo-item').nth(0).click();
  await expect(page).toHaveURL(second);
  await expect(messagesView(page).getByText(replyText('h1-switch-b'))).toBeVisible();
  await expect(composer(page)).toHaveValue('');

  await page.getByTestId('convo-item').nth(1).click();
  await expect(page).toHaveURL(first);

  await expect(composer(page)).toHaveValue(draft);
  /** Observed (not a contract of the brief, which expects the text): leaving a conversation through
   * the sidebar drops its attachment draft (filesDraft_<id> removed, chip not restored) while the
   * text draft survives. Upstream clears attachments on switch (useAutoSave) and no upstream test
   * promises they come back, so it is deliberately not asserted here. */
  await expectNotBroken(page, errors);
});

test('H1 · "Nuova chat" svuota gli allegati e non lascia la bozza della chat precedente', async ({
  page,
}) => {
  const errors = trackPageErrors(page);
  const draft = `bozza H1 ${Date.now()}`;
  await createConversation(page, 'h1-newchat');
  await fillDraft(page, draft);

  await newChatButton(page).click();

  await expect(page).toHaveURL(/\/c\/new/);
  await expect(composer(page)).toHaveValue('');
  await expect(page.getByText(NOTE_NAME)).toHaveCount(0);
  await expectNotBroken(page, errors);
});
