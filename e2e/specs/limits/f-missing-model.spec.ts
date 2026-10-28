import { expect, test } from '@playwright/test';
import { cleanupAgent } from '../mock/agents.helpers';
import type { AgentDetail } from '../mock/agents.helpers';
import { withMongo } from '../mock/db';
import {
  MOCK_ENDPOINTS,
  NEW_CHAT_PATH,
  getAccessToken,
  messagesView,
  replyPrompt,
  replyText,
  requestJson,
  selectModelSpec,
  sendMessage,
  sendMessageAndWaitForCompletion,
  uniqueName,
} from '../mock/helpers';
import { expectNotBroken, resetFakes, trackPageErrors } from './helpers';

const REMOVED_MODEL = 'mock-model-removed';

test.describe.configure({ timeout: 90_000 });

let agentId: string | undefined;

test.afterEach(async ({ page }) => {
  await resetFakes();
  await cleanupAgent(page, agentId).catch(() => undefined);
  agentId = undefined;
});

test('F6 ⚠ tutti gli host · agente su modello rimosso → errore leggibile, nessun crash', async ({
  page,
}) => {
  const errors = trackPageErrors(page);
  await page.goto(NEW_CHAT_PATH);
  await selectModelSpec(page, 'Mock Provider A');
  const token = await getAccessToken(page);
  const name = uniqueName('E2E Removed Model Agent');
  const agent = await requestJson<AgentDetail>(page, {
    path: '/api/agents',
    token,
    method: 'POST',
    body: { name, provider: MOCK_ENDPOINTS[0].label, model: MOCK_ENDPOINTS[0].model },
  });
  agentId = agent.id;
  /** Same state as a model dropped from librechat.yaml after the agent was created. */
  await withMongo((db) =>
    db.collection('agents').updateOne({ id: agent.id }, { $set: { model: REMOVED_MODEL } }),
  );

  await page.goto(`${NEW_CHAT_PATH}?agent_id=${encodeURIComponent(agent.id)}`);
  await expect(page.getByTestId('text-input')).toBeVisible();
  await sendMessage(page, replyPrompt('f6-agent'));
  /** The product answers with a readable "model not available" turn, not a stack trace. */
  await expect(messagesView(page).getByText(/is not available for Mock Provider A/)).toBeVisible({
    timeout: 30_000,
  });
  await expect(messagesView(page).getByText(REMOVED_MODEL, { exact: false })).toBeVisible();
  await expectNotBroken(page, errors);

  const conversationId = new URL(page.url()).pathname.split('/').pop() as string;
  expect(conversationId).not.toBe('new');
  await page.goto(NEW_CHAT_PATH);
  const sidebarEntry = page.getByTestId('convo-item').first();
  await expect(sidebarEntry).toBeVisible({ timeout: 15_000 });
  await sidebarEntry.click();
  await expect(page).toHaveURL(new RegExp(`/c/${conversationId}`));
  await expect(messagesView(page).getByText(replyPrompt('f6-agent'))).toBeVisible();
  await expectNotBroken(page, errors);
});

test('F6 · conversazione esistente il cui modello è stato rimosso → si può continuare scegliendo un altro modello', async ({
  page,
}) => {
  const errors = trackPageErrors(page);
  await page.goto(NEW_CHAT_PATH);
  await selectModelSpec(page, 'Mock Provider A');
  await sendMessageAndWaitForCompletion(page, replyPrompt('f6-before'));
  await expect(messagesView(page).getByText(replyText('f6-before'))).toBeVisible();
  const conversationId = new URL(page.url()).pathname.split('/').pop() as string;
  expect(conversationId).not.toBe('new');

  await withMongo((db) =>
    db
      .collection('conversations')
      .updateOne({ conversationId }, { $set: { model: REMOVED_MODEL } }),
  );
  await page.reload();
  await expect(page.getByTestId('text-input')).toBeVisible();
  await expect(messagesView(page).getByText(replyText('f6-before'))).toBeVisible();

  await selectModelSpec(page, 'Mock Provider B');
  await sendMessageAndWaitForCompletion(page, replyPrompt('f6-convo'));
  await expect(messagesView(page).getByText(replyText('f6-convo'))).toBeVisible();
  await expectNotBroken(page, errors);
});
