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

const TURNS = 6;
/** ~1200 characters of filler after the marker (the fake reads only the first word). */
const FILLER = 'lorem ipsum dolor sit amet consectetur '.repeat(32);

test.afterEach(async () => {
  await resetFakes();
});

test('E1a ⚠ 6 host · oltre il contesto con sintesi attiva ogni risposta è non vuota', async ({
  page,
}) => {
  test.setTimeout(240_000);
  const errors = trackPageErrors(page);
  await page.goto(NEW_CHAT_PATH);
  await selectModelSpec(page, 'E2E Limits Small Context');

  for (let n = 1; n <= TURNS; n++) {
    await sendMessageAndWaitForCompletion(page, `${replyPrompt(`e1-${n}`)} ${FILLER}`);
    await expect(messagesView(page).getByText(replyText(`e1-${n}`))).toBeVisible({
      timeout: 30_000,
    });
  }

  for (let n = 1; n <= TURNS; n++) {
    await expect(messagesView(page).getByText(replyText(`e1-${n}`))).toHaveCount(1);
  }
  /** Proof the limit was really exceeded: the context was summarized, so the test is not vacuous. */
  await expect(
    messagesView(page)
      .getByText(/Conversation summarized|Summarized/)
      .first(),
  ).toBeVisible();
  await expectNotBroken(page, errors);
});
