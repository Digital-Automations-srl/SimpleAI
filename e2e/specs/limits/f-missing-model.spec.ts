import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
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
const STALE_MODEL_ERROR = /is not available for Mock Provider A/;

/**
 * NOT covered here: the production Azure path. The `Model named "gpt-5" not found in
 * configuration` error comes from `mapModelToAzureConfig` (packages/data-provider/src/azure.ts)
 * and only fires for Azure endpoints; the mock harness has custom endpoints only. A model
 * removed from a custom endpoint goes through the generic `illegal_model_request` check
 * (api/server/services/Endpoints/agents/initialize.js), which is the closest faithful setup:
 * same trigger (model absent from config but still referenced), different message. How the
 * Azure message renders in chat is therefore unverified.
 */
const conversationIdOf = (page: Page) =>
  new URL(page.url()).pathname.split('/').filter(Boolean).pop() as string;

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
  await expect(messagesView(page).getByText(STALE_MODEL_ERROR)).toBeVisible({
    timeout: 30_000,
  });
  await expect(messagesView(page).getByText(REMOVED_MODEL, { exact: false })).toBeVisible();
  await expectNotBroken(page, errors);

  const conversationId = conversationIdOf(page);
  expect(conversationId).not.toBe('new');
  await page.goto(NEW_CHAT_PATH);
  const title = uniqueName('E2E F6 convo');
  await withMongo((db) =>
    db.collection('conversations').updateOne({ conversationId }, { $set: { title } }),
  );
  await page.reload();
  const sidebarEntry = page.getByTestId('convo-item').filter({ hasText: title });
  await expect(sidebarEntry).toBeVisible({ timeout: 15_000 });
  await sidebarEntry.click();
  await expect(page).toHaveURL(new RegExp(`/c/${conversationId}`));
  await expect(messagesView(page).getByText(replyPrompt('f6-agent'))).toBeVisible();
  await expectNotBroken(page, errors);
});

/**
 * A stale `model` on the conversation document alone is not enough: the client re-resolves
 * the endpoint model and the request succeeds silently (seen in a probe), so that setup would
 * not exercise the failure. The stale model that is really live is the agent's, so the
 * conversation is opened on an agent whose model was removed, proven broken first, and
 * only then continued with another model.
 */
test('F6 · conversazione esistente il cui modello è stato rimosso → si può continuare scegliendo un altro modello', async ({
  page,
}) => {
  const errors = trackPageErrors(page);
  await page.goto(NEW_CHAT_PATH);
  await selectModelSpec(page, 'Mock Provider A');
  const token = await getAccessToken(page);
  const agent = await requestJson<AgentDetail>(page, {
    path: '/api/agents',
    token,
    method: 'POST',
    body: {
      name: uniqueName('E2E Removed Model Agent'),
      provider: MOCK_ENDPOINTS[0].label,
      model: MOCK_ENDPOINTS[0].model,
    },
  });
  agentId = agent.id;
  await page.goto(`${NEW_CHAT_PATH}?agent_id=${encodeURIComponent(agent.id)}`);
  await expect(page.getByTestId('text-input')).toBeVisible();
  await sendMessageAndWaitForCompletion(page, replyPrompt('f6-before'));
  await expect(messagesView(page).getByText(replyText('f6-before'))).toBeVisible();
  const conversationId = conversationIdOf(page);
  expect(conversationId).not.toBe('new');

  /** The model is dropped from the config after the conversation already exists. */
  await withMongo((db) =>
    db.collection('agents').updateOne({ id: agent.id }, { $set: { model: REMOVED_MODEL } }),
  );
  await page.reload();
  await expect(page.getByTestId('text-input')).toBeVisible();
  await expect(messagesView(page).getByText(replyText('f6-before'))).toBeVisible();
  await expectNotBroken(page, errors);

  /** The stale model is live: continuing as-is hits the removed model and says so. */
  await sendMessage(page, replyPrompt('f6-stale'));
  await expect(messagesView(page).getByText(STALE_MODEL_ERROR)).toBeVisible({ timeout: 30_000 });
  await expectNotBroken(page, errors);

  await selectModelSpec(page, 'Mock Provider B');
  await sendMessageAndWaitForCompletion(page, replyPrompt('f6-convo'));
  await expect(messagesView(page).getByText(replyText('f6-convo'))).toBeVisible();
  await expect(messagesView(page).getByText(replyText('f6-before'))).toBeVisible();
  await expectNotBroken(page, errors);
});
