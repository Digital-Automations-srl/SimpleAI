import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import { cleanupAgent, openAgentBuilder } from '../mock/agents.helpers';
import type { AgentDetail } from '../mock/agents.helpers';
import { withMongo } from '../mock/db';
import {
  MOCK_ENDPOINTS,
  getAccessToken,
  messagesView,
  replyPrompt,
  replyText,
  requestJson,
  selectModelSpec,
  sendMessage,
  sendMessageAndWaitForCompletion,
  uniqueName,
  NEW_CHAT_PATH,
} from '../mock/helpers';
import { expectNotBroken, resetFakes, setFakeBehavior, trackPageErrors } from './helpers';

const ACTION_PORT = process.env.E2E_ACTION_PORT || '8792';
const ACTION_DOMAIN = `http://127.0.0.1:${ACTION_PORT}`;
const API_KEY = 'e2e-secret';
/** The Action editor stores the domain as protocol + hostname, port dropped. */
const ACTION_HOST_DOMAIN = 'http://127.0.0.1';

/** Actions have no HTTP timeout of their own (axios default: none), so "slow" only means long. */
const SLOW_MS = 15_000;

function buildSchema(withExtra: boolean) {
  const op = (id: string, path: string) =>
    `  ${path}:\n    get:\n      operationId: ${id}\n      summary: ${id}\n      responses:\n        '200':\n          description: ok\n`;
  return [
    'openapi: 3.0.0',
    'info:',
    `  title: E2E Action ${withExtra ? 'v2' : 'v1'}`,
    '  version: 1.0.0',
    'servers:',
    `  - url: ${ACTION_DOMAIN}`,
    'paths:',
    op('e2eOk', '/ok'),
    op('e2eError', '/error'),
    op('e2eSlow', '/slow'),
    op('e2eHuge', '/huge'),
    withExtra ? op('e2eExtra', '/extra') : '',
  ]
    .join('\n')
    .replace(/\n{2,}/g, '\n');
}

const fn = (name: string) => ({
  type: 'function',
  function: {
    name,
    description: name,
    parameters: { type: 'object', properties: {} },
  },
});
const FUNCTIONS_V1 = ['e2eOk', 'e2eError', 'e2eSlow', 'e2eHuge'].map(fn);

test.describe.configure({ timeout: 60_000 });

let agentId: string | undefined;

test.afterEach(async ({ page }) => {
  await resetFakes();
  await cleanupAgent(page, agentId).catch(() => undefined);
  agentId = undefined;
});

async function createAgentWithAction(page: Page) {
  await page.goto(NEW_CHAT_PATH);
  await selectModelSpec(page, 'Mock Provider A');
  const token = await getAccessToken(page);
  const name = uniqueName('E2E Limits Action Agent');
  const agent = await requestJson<AgentDetail>(page, {
    path: '/api/agents',
    token,
    method: 'POST',
    body: {
      name,
      provider: MOCK_ENDPOINTS[0].label,
      model: MOCK_ENDPOINTS[0].model,
    },
  });
  agentId = agent.id;
  await requestJson(page, {
    path: `/api/agents/actions/${encodeURIComponent(agent.id)}`,
    token,
    method: 'POST',
    body: {
      functions: FUNCTIONS_V1,
      metadata: {
        domain: ACTION_HOST_DOMAIN,
        raw_spec: buildSchema(false),
        api_key: API_KEY,
        auth: { type: 'service_http', authorization_type: 'bearer' },
      },
    },
  });
  return { agent, name, token };
}

test("F2 ⚠ 28/10 · sostituire lo schema di un'Action conserva autenticazione e chiave", async ({
  page,
}) => {
  const errors = trackPageErrors(page);
  const { agent, name, token } = await createAgentWithAction(page);

  const form = await openAgentBuilder(page);
  await form.getByRole('combobox', { name: 'Agent', exact: true }).click();
  await page.getByRole('option', { name, exact: true }).click();
  await expect(form.getByLabel('Agent name')).toHaveValue(name);

  await form.getByRole('button', { name: 'Add tools' }).click();
  const library = page.getByRole('dialog', { name: 'Tool Library' });
  const actionsFilter = library.getByRole('button', { name: /^Actions/ });
  await expect(actionsFilter).toContainText('1');
  await actionsFilter.click();
  await library.getByText(ACTION_HOST_DOMAIN).click();

  const schema = page.getByRole('textbox', { name: 'Schema' });
  await expect(schema).toHaveValue(/e2eHuge/);
  await schema.fill(buildSchema(true));
  /** Validation is debounced: the Available Actions list shows the new operation once the
   *  editor has parsed the schema, and saving earlier is a silent no-op. */
  await expect(page.getByText('e2eExtra', { exact: true })).toBeVisible();
  const update = page.getByRole('button', { name: 'Update', exact: true });
  await expect(update).toBeEnabled();
  await update.click();

  await expect
    .poll(
      () =>
        withMongo((db) =>
          db.collection('actions').findOne({ agent_id: agent.id }, { projection: { metadata: 1 } }),
        ).then((doc) => doc?.metadata?.raw_spec ?? ''),
      { timeout: 15_000 },
    )
    .toContain('e2eExtra');

  const stored = await withMongo((db) =>
    db.collection('actions').findOne({ agent_id: agent.id }, { projection: { metadata: 1 } }),
  );
  expect(stored?.metadata?.auth?.type).toBe('service_http');
  expect(stored?.metadata?.api_key, 'la chiave cifrata non deve sparire').toBeTruthy();

  const refreshed = await requestJson<AgentDetail & { tools?: string[] }>(page, {
    path: `/api/agents/${encodeURIComponent(agent.id)}`,
    token,
  });
  expect((refreshed.tools ?? []).some((t) => t.startsWith('e2eExtra_action_'))).toBe(true);
  await expectNotBroken(page, errors);
});

async function actionHits(path: string): Promise<number> {
  const response = await fetch(`${ACTION_DOMAIN}/__e2e/hits`);
  const hits = (await response.json()) as Record<string, number>;
  return hits[path] ?? 0;
}

async function chatWithAgent(page: Page, id: string) {
  await page.goto(`${NEW_CHAT_PATH}?agent_id=${encodeURIComponent(id)}`);
  await expect(page.getByTestId('text-input')).toBeVisible();
}

async function expectChatContinues(
  page: Page,
  operationId: string,
  label: string,
  errors: string[],
  toolEcho: RegExp,
) {
  await expect(messagesView(page).getByText(`E2E action done ${operationId}`)).toBeVisible({
    timeout: 60_000,
  });
  /** The fake model echoes what the tool returned: the agent saw the outcome, not just "done". */
  /** (500: the error reached the model; slow: the late ok result; huge: the 2 MB body arrives truncated.) */
  await expect(messagesView(page).getByText(toolEcho)).toBeVisible();
  /** The model closes with "done" after any tool outcome, so prove the endpoint was reached. */
  const path = { e2eError: '/error', e2eSlow: '/slow', e2eHuge: '/huge' }[operationId];
  expect(await actionHits(path!), `l'endpoint ${path} deve essere stato chiamato`).toBeGreaterThan(
    0,
  );
  await sendMessageAndWaitForCompletion(page, replyPrompt(label));
  await expect(messagesView(page).getByText(replyText(label))).toBeVisible();
  await expectNotBroken(page, errors);
}

test('F4 ○ 500 · Action che risponde 500 → la chat risponde e continua', async ({ page }) => {
  const errors = trackPageErrors(page);
  const { agent } = await createAgentWithAction(page);
  await chatWithAgent(page, agent.id);
  await sendMessage(page, 'E2E_ACTION_CALL:e2eError');
  await expectChatContinues(
    page,
    'e2eError',
    'f4-error',
    errors,
    /tool-result len=\d+\] .*status 500/,
  );
});

test('F4 ○ timeout · Action in timeout → la chat risponde e continua', async ({ page }) => {
  test.setTimeout(120_000);
  const errors = trackPageErrors(page);
  const { agent } = await createAgentWithAction(page);
  await setFakeBehavior('action', { slowMs: SLOW_MS });
  await chatWithAgent(page, agent.id);
  await sendMessage(page, 'E2E_ACTION_CALL:e2eSlow');
  await expectChatContinues(
    page,
    'e2eSlow',
    'f4-slow',
    errors,
    /tool-result len=\d+\] .*E2E action slow ok/,
  );
});

test('F4 ○ payload · Action con payload enorme → la chat risponde e continua', async ({ page }) => {
  const errors = trackPageErrors(page);
  const { agent } = await createAgentWithAction(page);
  await chatWithAgent(page, agent.id);
  await sendMessage(page, 'E2E_ACTION_CALL:e2eHuge');
  await expectChatContinues(
    page,
    'e2eHuge',
    'f4-huge',
    errors,
    /tool-result len=\d{1,6}\] \{"result":"xxx/,
  );
});
