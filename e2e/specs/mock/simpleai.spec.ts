import { expect, test } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';
import {
  MOCK_ENDPOINTS,
  NEW_CHAT_PATH,
  getAccessToken,
  messagesView,
  replyPrompt,
  replyText,
  requestJson,
  selectMockEndpoint,
  sendMessage,
  sendMessageAndWaitForCompletion,
  uniqueName,
  uploadViaUnifiedButton,
} from './helpers';
import type { AgentDetail } from './agents.helpers';
import { cleanupAgent, openAgentBuilder } from './agents.helpers';

/**
 * SimpleAI fork features and fork-only fixes. Upstream specs cover the shared UI; this file
 * covers what exists only in SimpleAI, so it must grow with every fork change to the UI.
 */

const CHANGELOG_SEEN_KEY = 'simpleai_changelog_seen';

const isFilesUpload = (url: string, method: string) =>
  method === 'POST' && /\/api\/files(?:\?|$)/.test(new URL(url).pathname);

async function dismissChangelogIfShown(page: Page) {
  const dismiss = page.getByRole('button', { name: 'Got it' });
  if (await dismiss.isVisible({ timeout: 2000 }).catch(() => false)) {
    await dismiss.click();
  }
}

/** A one-page PDF whose text layer holds `text`, readable by the built-in document parser. */
function textPdf(text: string): string {
  const content = `BT /F1 12 Tf 72 720 Td (${text}) Tj ET`;
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
    `<< /Length ${Buffer.byteLength(content)} >>\nstream\n${content}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ];
  let pdf = '%PDF-1.4\n';
  const offsets = objects.map((object, index) => {
    const offset = Buffer.byteLength(pdf);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
    return offset;
  });
  const xrefOffset = Buffer.byteLength(pdf);
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  pdf += offsets.map((offset) => `${String(offset).padStart(10, '0')} 00000 n \n`).join('');
  return `${pdf}trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
}

async function openNewChat(page: Page) {
  await page.goto(NEW_CHAT_PATH, { timeout: 10000 });
  await dismissChangelogIfShown(page);
}

/** Drafts an agent in the "Create" tab through the fake model's builder marker. */
async function draftAgent(form: Locator, label: string) {
  await form
    .getByRole('textbox', { name: 'Describe the agent you want to create…' })
    .fill(`E2E_AGENT_BUILDER:${label}`);
  await form.getByRole('button', { name: 'Send to the agent builder' }).click();
  await expect(form.getByText(`E2E agent builder reply: ${label}`)).toBeVisible();
}

test.describe('SimpleAI branding', () => {
  test('the app shell is served with the Simple AI title', async ({ request }) => {
    const response = await request.get(NEW_CHAT_PATH);
    expect(response.ok()).toBeTruthy();
    expect(await response.text()).toContain('<title>Simple AI</title>');
  });

  test('the landing footer links to Digital Automations', async ({ page }) => {
    await openNewChat(page);
    const footerLink = page.getByRole('link', { name: /Simple AI/ });
    await expect(footerLink).toBeVisible();
    await expect(footerLink).toHaveAttribute('href', 'https://www.digitalautomations.it');
  });
});

test.describe('SimpleAI changelog', () => {
  test('a first visit records the current version without opening the dialog', async ({ page }) => {
    await page.goto(NEW_CHAT_PATH, { timeout: 10000 });
    await page.evaluate((key) => localStorage.removeItem(key), CHANGELOG_SEEN_KEY);
    await page.reload();

    await expect(page.getByRole('textbox', { name: 'Message input' })).toBeVisible();
    await expect
      .poll(() => page.evaluate((key) => localStorage.getItem(key), CHANGELOG_SEEN_KEY))
      .toMatch(/^\d+\.\d+\.\d+$/);
    await expect(page.getByRole('dialog', { name: "What's New" })).toHaveCount(0);
  });

  test('a newer version opens the dialog once and stays dismissed after reload', async ({
    page,
  }) => {
    await page.goto(NEW_CHAT_PATH, { timeout: 10000 });
    await page.evaluate((key) => localStorage.setItem(key, '0.0.0'), CHANGELOG_SEEN_KEY);
    await page.reload();

    const dialog = page.getByRole('dialog', { name: "What's New" });
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText(/v\d+\.\d+\.\d+/);
    await dialog.getByRole('button', { name: 'Got it' }).click();
    await expect(dialog).toBeHidden();

    await page.reload();
    await expect(page.getByRole('textbox', { name: 'Message input' })).toBeVisible();
    await expect(page.getByRole('dialog', { name: "What's New" })).toHaveCount(0);
  });
});

test.describe('SimpleAI improvement reports', () => {
  test('a report is submitted from the account menu', async ({ page }) => {
    await openNewChat(page);
    await page.getByTestId('nav-user').click();
    await page.getByRole('menuitem', { name: 'Report an improvement' }).click();

    const dialog = page.getByRole('dialog', { name: 'Report an improvement' });
    await expect(dialog).toBeVisible();

    await dialog.getByRole('button', { name: 'Submit report' }).click();
    await expect(page.getByText('This field is required', { exact: true })).toBeVisible();

    const description = `E2E report ${uniqueName('feedback')}`;
    await dialog.getByLabel('Description').fill(description);
    const submitted = page.waitForResponse(
      (r) =>
        r.request().method() === 'POST' && new URL(r.url()).pathname === '/api/improvement-reports',
    );
    await dialog.getByRole('button', { name: 'Submit report' }).click();

    const response = await submitted;
    expect(response.status()).toBe(201);
    expect(response.request().postDataJSON()).toMatchObject({ description });
    await expect(dialog).toBeHidden();
  });
});

test.describe('SimpleAI agent categories', () => {
  test('a custom category is created and deleted from the marketplace', async ({ page }) => {
    await page.goto('/agents', { timeout: 10000 });
    await dismissChangelogIfShown(page);
    await page.getByRole('button', { name: 'Manage categories' }).click();

    const dialog = page.getByRole('dialog', { name: 'Manage categories' });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText('System').first()).toBeVisible();

    const label = `E2E ${uniqueName('category')}`;
    await dialog.getByPlaceholder('Label').fill(label);
    await dialog.getByRole('button', { name: 'Add' }).click();
    await expect(page.getByText('Category created', { exact: true })).toBeVisible();
    await expect(dialog.getByText(label, { exact: true })).toBeVisible();

    page.once('dialog', (confirm) => confirm.accept());
    await dialog.getByRole('button', { name: `Delete ${label}` }).click();
    await expect(page.getByText('Category deleted', { exact: true })).toBeVisible();
    await expect(dialog.getByText(label, { exact: true })).toHaveCount(0);
  });
});

test.describe('SimpleAI composer attachments', () => {
  /** T335: a chat continued from a shared link keeps the file names but not the files. */
  test('a chat continued from a shared link warns that its attachments are not read', async ({
    page,
  }) => {
    await openNewChat(page);
    await selectMockEndpoint(page, MOCK_ENDPOINTS[1]);
    const name = `${uniqueName('shared')}.txt`;
    const upload = await uploadViaUnifiedButton(page, {
      name,
      mimeType: 'text/plain',
      content: 'attachment owned by whoever shared the chat',
    });
    expect(upload.ok()).toBeTruthy();
    const label = uniqueName('shared-files');
    await sendMessageAndWaitForCompletion(page, replyPrompt(label));
    await expect(page.getByRole('note')).toHaveCount(0);

    await expect(page).toHaveURL(/\/c\/(?!new)[0-9a-fA-F-]{36}$/);
    const conversationId = new URL(page.url()).pathname.split('/').pop() ?? '';
    const token = await getAccessToken(page);
    const share = await requestJson<{ shareId: string }>(page, {
      path: `/api/share/${conversationId}`,
      token,
      method: 'POST',
      body: {},
    });
    const fork = await requestJson<{ conversation: { conversationId: string } }>(page, {
      path: `/api/share/${encodeURIComponent(share.shareId)}/fork`,
      token,
      method: 'POST',
      body: {},
    });

    await page.goto(`/c/${fork.conversation.conversationId}`);
    await expect(messagesView(page).getByText(name)).toBeVisible();
    await expect(messagesView(page).getByRole('note')).toHaveText(
      'These attachments come from a shared chat: the model can no longer read them. Upload them again if you need them.',
    );
  });

  test('switching model in an unsent chat keeps the attached files (#16636)', async ({ page }) => {
    await openNewChat(page);
    await selectMockEndpoint(page, MOCK_ENDPOINTS[1]);

    const name = `${uniqueName('keep')}.txt`;
    const response = await uploadViaUnifiedButton(page, {
      name,
      mimeType: 'text/plain',
      content: 'attachment that must survive a model switch',
    });
    expect(response.ok()).toBeTruthy();
    await expect(page.getByText(name)).toBeVisible();

    await selectMockEndpoint(page, MOCK_ENDPOINTS[0]);

    await expect(page.getByText(name)).toBeVisible();
  });

  test('one unsupported file in a multi-file upload skips only that file (#16659)', async ({
    page,
  }) => {
    await openNewChat(page);
    await selectMockEndpoint(page, MOCK_ENDPOINTS[1]);

    const uploads: string[] = [];
    page.on('request', (request) => {
      if (isFilesUpload(request.url(), request.method())) {
        uploads.push(request.url());
      }
    });

    const notes = `${uniqueName('notes')}.txt`;
    const data = `${uniqueName('data')}.csv`;
    const [fileChooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      page.locator('#attach-file-button').click(),
    ]);
    await fileChooser.setFiles([
      { name: notes, mimeType: 'text/plain', buffer: Buffer.from('notes') },
      { name: data, mimeType: 'text/csv', buffer: Buffer.from('a,b\n1,2') },
      { name: 'setup.exe', mimeType: 'application/x-msdownload', buffer: Buffer.from('MZ') },
    ]);

    await expect(
      page.getByText('Skipped file(s) of an unsupported type: setup.exe', { exact: true }),
    ).toBeVisible();
    await expect(page.getByText(notes)).toBeVisible();
    await expect(page.getByText(data)).toBeVisible();
    await expect.poll(() => uploads.length).toBe(2);
  });

  test('a PDF sent to the provider still reaches a later turn on an endpoint that reads text (T293)', async ({
    page,
  }) => {
    test.setTimeout(120000);
    await openNewChat(page);
    await selectMockEndpoint(page, { label: 'Mock Provider C', model: 'mock-model-c' });

    const marker = uniqueName('pdftext').replace(/[^A-Za-z0-9]/g, '');
    const name = `${uniqueName('report')}.pdf`;
    const response = await uploadViaUnifiedButton(page, {
      name,
      mimeType: 'application/pdf',
      content: textPdf(marker),
    });
    expect(response.ok()).toBeTruthy();
    expect((await response.json()).llmDeliveryPath).toBe('provider');

    const label = uniqueName('pdf-first');
    await sendMessageAndWaitForCompletion(page, replyPrompt(label));
    await expect(messagesView(page).getByText(replyText(label))).toBeVisible();

    await selectMockEndpoint(page, { label: 'Mock Provider D', model: 'mock-model-d' });
    await sendMessageAndWaitForCompletion(page, `E2E_ASSERT_HISTORY:${marker}`);
    await expect(
      messagesView(page).getByText(`E2E history assertion present: ${marker}`),
    ).toBeVisible();
  });
});

test.describe('SimpleAI automatic model', () => {
  test('the Auto toggle routes the chat, locks the selector and stays on', async ({ page }) => {
    await openNewChat(page);
    const selector = page.getByTestId('model-selector-button');
    const autoToggle = page.getByRole('checkbox', { name: 'Auto' });

    await selector.click();
    await expect(page.getByRole('option', { name: /E2E Automatico/ })).toHaveCount(0);
    await page.keyboard.press('Escape');

    await autoToggle.click();
    await expect(autoToggle).toBeChecked();
    await expect(selector).toBeDisabled();
    await expect(selector).toContainText('E2E Automatico');

    const label = uniqueName('auto');
    await sendMessageAndWaitForCompletion(page, replyPrompt(label));
    await expect(messagesView(page).getByText(replyText(label))).toBeVisible();
    await expect(messagesView(page).getByText('Mock Provider B').first()).toBeVisible();

    /** Follow-up turns must leave untouched tools unset, or the router can never switch them on. */
    const followUp = await sendMessageAndWaitForCompletion(page, replyPrompt(`${label}-2`));
    const { ephemeralAgent } = followUp.request().postDataJSON();
    expect(ephemeralAgent?.execute_code).toBeUndefined();
    expect(ephemeralAgent?.web_search).toBeUndefined();

    await page.reload();
    await expect(autoToggle).toBeChecked();
    await expect(selector).toContainText('E2E Automatico');

    await autoToggle.click();
    await expect(autoToggle).not.toBeChecked();
    await expect(selector).toBeEnabled();
    await expect(selector).not.toContainText('E2E Automatico');
  });

  /** T292: switching Auto on swaps the conversation onto the router spec and drops the agent. */
  test('the Auto toggle is not offered while chatting with an agent', async ({ page }) => {
    await openNewChat(page);
    await selectMockEndpoint(page, MOCK_ENDPOINTS[0]);
    const autoToggle = page.getByRole('checkbox', { name: 'Auto' });
    await expect(autoToggle).toBeVisible();

    const token = await getAccessToken(page);
    const agentName = uniqueName('E2E Auto Agent');
    const agent = await requestJson<AgentDetail>(page, {
      path: '/api/agents',
      token,
      method: 'POST',
      body: {
        name: agentName,
        provider: MOCK_ENDPOINTS[0].label,
        model: MOCK_ENDPOINTS[0].model,
      },
    });
    try {
      const form = await openAgentBuilder(page);
      await form.getByRole('combobox', { name: 'Agent', exact: true }).click();
      await page.getByRole('option', { name: agentName, exact: true }).click();
      await expect(form.getByLabel('Agent name')).toHaveValue(agentName);
      await form.getByRole('button', { name: 'Select Agent' }).click();
      await expect(page.getByTestId('model-selector-button')).toContainText(agentName);
      await expect(autoToggle).toHaveCount(0);

      await selectMockEndpoint(page, MOCK_ENDPOINTS[0]);
      await expect(autoToggle).toBeVisible();
    } finally {
      await cleanupAgent(page, agent.id);
    }
  });
});

test.describe('SimpleAI model fallback', () => {
  const FALLBACK_NOTE = 'Answered by fallback-model: primary-model was temporarily unavailable.';

  /** The fake model cannot hit a provider limit; the stored metadata is what the UI reads. */
  async function reportFallback(page: Page, modelFallback: { from: string; to: string[] }) {
    await page.route(/\/api\/messages\/[^/?]+$/, async (route) => {
      if (route.request().method() !== 'GET') {
        return route.continue();
      }
      const response = await route.fetch();
      const messages = (await response.json()) as Array<Record<string, unknown>>;
      const withFallback = messages.map((message) =>
        message.isCreatedByUser === true
          ? message
          : {
              ...message,
              metadata: {
                ...(message.metadata as object | undefined),
                modelFallback,
              },
            },
      );
      await route.fulfill({ response, json: withFallback });
    });
    await page.reload();
  }

  async function answer(page: Page) {
    await openNewChat(page);
    const label = uniqueName('fallback');
    await sendMessageAndWaitForCompletion(page, replyPrompt(label));
    await expect(messagesView(page).getByText(replyText(label))).toBeVisible();
    return label;
  }

  test('a response answered by a fallback model shows the note after reload', async ({ page }) => {
    const label = await answer(page);
    await expect(messagesView(page).getByText(FALLBACK_NOTE)).toHaveCount(0);

    await reportFallback(page, { from: 'primary-model', to: ['fallback-model'] });

    await expect(messagesView(page).getByText(replyText(label))).toBeVisible();
    await expect(messagesView(page).getByText(FALLBACK_NOTE)).toBeVisible();
  });

  test('the note names specs sharing a model by their own labels', async ({ page }) => {
    await answer(page);

    /** Both specs serve mock-model-a. */
    await reportFallback(page, { from: 'e2e-mock-provider-a', to: ['e2e-icon-spec'] });

    await expect(
      messagesView(page).getByText(
        'Answered by E2E Icon Spec: Mock Provider A was temporarily unavailable.',
      ),
    ).toBeVisible();
  });
});

test.describe('SimpleAI context warning', () => {
  const CONTEXT_BUDGET = 1000;
  const warning = (page: Page) => page.getByTestId('context-warning');
  const composer = (page: Page) => page.getByRole('textbox', { name: 'Message input' });

  /** The fake model never fills a real window; the persisted snapshot is what the warning reads. */
  async function reportContextUsage(page: Page, percent: number) {
    await page.route(/\/api\/messages\/[^/?]+$/, async (route) => {
      if (route.request().method() !== 'GET') {
        return route.continue();
      }
      const response = await route.fetch();
      const messages = (await response.json()) as Array<Record<string, unknown>>;
      const withUsage = messages.map((message) =>
        message.isCreatedByUser === true
          ? message
          : {
              ...message,
              metadata: {
                ...(message.metadata as object | undefined),
                contextUsage: {
                  runId: `e2e-context-${String(message.messageId)}`,
                  contextBudget: CONTEXT_BUDGET,
                  breakdown: {
                    maxContextTokens: CONTEXT_BUDGET,
                    instructionTokens: 0,
                    systemMessageTokens: 0,
                    dynamicInstructionTokens: 0,
                    toolSchemaTokens: 0,
                    summaryTokens: 0,
                    toolCount: 0,
                    messageCount: 2,
                    messageTokens: (CONTEXT_BUDGET * percent) / 100,
                    availableForMessages: CONTEXT_BUDGET,
                  },
                },
              },
            },
      );
      await route.fulfill({ response, json: withUsage });
    });
  }

  /** A saved conversation reopened with its context filled to `percent`. */
  async function openFilledChat(
    page: Page,
    percent: number,
    choose?: (page: Page) => Promise<void>,
  ) {
    await openNewChat(page);
    await choose?.(page);
    const label = uniqueName('context');
    await sendMessageAndWaitForCompletion(page, replyPrompt(label));
    await expect(messagesView(page).getByText(replyText(label))).toBeVisible();
    await reportContextUsage(page, percent);
    await page.reload();
    await expect(messagesView(page).getByText(replyText(label))).toBeVisible();
    return { conversationUrl: page.url(), label };
  }

  test('stays away below 45% and appears above it', async ({ page }) => {
    await openFilledChat(page, 40);
    await expect(page.getByTestId('token-usage')).toBeVisible();
    await expect(warning(page)).toHaveCount(0);

    await reportContextUsage(page, 52);
    await page.reload();
    await expect(warning(page)).toContainText('This chat is getting long (52%)');

    await reportContextUsage(page, 90);
    await page.reload();
    await expect(warning(page)).toContainText('This chat is almost full (90%)');
  });

  test('a dismissed warning stays hidden for the chat', async ({ page }) => {
    await openFilledChat(page, 52);
    await warning(page).getByRole('button', { name: 'Dismiss' }).click();
    await expect(warning(page)).toHaveCount(0);

    await sendMessageAndWaitForCompletion(page, replyPrompt(uniqueName('after-dismiss')));
    await expect(warning(page)).toHaveCount(0);
  });

  test('"New chat" opens a fresh chat on the same model and keeps the old one', async ({
    page,
  }) => {
    const selector = page.getByTestId('model-selector-button');
    const [chatModel, laterModel] = MOCK_ENDPOINTS;
    const { conversationUrl } = await openFilledChat(page, 60, (current) =>
      selectMockEndpoint(current, chatModel),
    );
    /** The user moves on to another model elsewhere: a plain new chat would now open on that. */
    await openNewChat(page);
    await selectMockEndpoint(page, laterModel);
    await page.goto(conversationUrl);
    await expect(warning(page)).toBeVisible();

    await warning(page).getByRole('button', { name: 'New chat' }).click();
    await expect(page).toHaveURL(/\/c\/new/);
    await expect(selector).toHaveText(new RegExp(`${chatModel.label}|${chatModel.model}`));
    await expect(warning(page)).toHaveCount(0);

    await page.goto(conversationUrl);
    await expect(messagesView(page).getByText(/./).first()).toBeVisible();
  });

  test('"Compact" summarizes the chat and hides the warning', async ({ page }) => {
    await openFilledChat(page, 60);
    await warning(page).getByRole('button', { name: 'Compact context' }).click();
    await expect(messagesView(page).getByText('You compacted the context')).toBeVisible({
      timeout: 60_000,
    });
    await expect(warning(page)).toHaveCount(0);
  });

  test('"Handoff prompt" opens a new chat with the answer ready to send', async ({ page }) => {
    await openNewChat(page);
    await composer(page).fill('an unsent draft of the new chat');
    const { conversationUrl } = await openFilledChat(page, 60);

    await warning(page).getByRole('button', { name: 'Handoff prompt' }).click();
    await expect(page).toHaveURL(/\/c\/new/, { timeout: 60_000 });
    const handoff = await composer(page).inputValue();
    expect(handoff.trim()).not.toBe('');
    expect(handoff).not.toContain('an unsent draft of the new chat');

    await page.goto(conversationUrl);
    await expect(
      messagesView(page).getByText('Write a prompt that lets me continue this work', {
        exact: false,
      }),
    ).toBeVisible();
  });

  test('with the gauge turned off the warning is the only signal', async ({ page }) => {
    await page.route(/\/api\/config$/, async (route) => {
      const response = await route.fetch();
      const config = (await response.json()) as { interface?: Record<string, unknown> };
      await route.fulfill({
        response,
        json: { ...config, interface: { ...config.interface, contextGauge: false } },
      });
    });
    await openFilledChat(page, 60);
    await expect(warning(page)).toBeVisible();
    await expect(page.getByTestId('token-usage')).toHaveCount(0);

    await warning(page).getByRole('button', { name: 'Details' }).click();
    await expect(page.getByText('Context window', { exact: true })).toBeVisible();

    /** Compacting from the details hides the warning, and with it the button they hang from. */
    const details = page.getByRole('dialog', { name: 'Context usage' });
    await details.getByRole('button', { name: 'Compact context' }).click();
    await expect(messagesView(page).getByText('You compacted the context')).toBeVisible({
      timeout: 60_000,
    });
    await expect(warning(page)).toHaveCount(0);
    await expect(details).toHaveCount(0);
  });
});

test.describe('SimpleAI agent builder', () => {
  test('the Create tab drafts the agent from a description and saves it', async ({ page }) => {
    const form = await openAgentBuilder(page);
    await dismissChangelogIfShown(page);
    await form.getByRole('tab', { name: 'Create' }).click();

    const label = uniqueName('builder');
    await form
      .getByRole('textbox', { name: 'Describe the agent you want to create…' })
      .fill(`E2E_AGENT_BUILDER:${label}`);
    const [draftResponse] = await Promise.all([
      page.waitForResponse((r) => new URL(r.url()).pathname === '/api/agents/builder/draft'),
      form.getByRole('button', { name: 'Send to the agent builder' }).click(),
    ]);
    expect(draftResponse.status()).toBe(200);
    await expect(form.getByText(`E2E agent builder reply: ${label}`)).toBeVisible();

    await form.getByRole('button', { name: 'Review the configuration' }).click();
    await expect(form.getByRole('tab', { name: 'Configure' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await expect(form.getByLabel('Agent name')).toHaveValue(`E2E Builder ${label}`);
    await expect(form.locator('#provider')).toContainText('mock-model-b');

    const [createResponse] = await Promise.all([
      page.waitForResponse(
        (r) =>
          r.request().method() === 'POST' &&
          new URL(r.url()).pathname === '/api/agents' &&
          r.status() === 201,
      ),
      form.getByRole('button', { name: 'Create', exact: true }).click(),
    ]);
    const agent = (await createResponse.json()) as AgentDetail;
    try {
      expect(agent).toMatchObject({
        name: `E2E Builder ${label}`,
        description: `Drafted by the agent builder for ${label}`,
        instructions: `You are the E2E builder agent for ${label}.`,
        provider: 'Mock Provider B',
        model: 'mock-model-b',
      });
      expect(agent.tools).toContain('web_search');
    } finally {
      await cleanupAgent(page, agent.id);
    }
  });

  test('"Try the agent" chats with the unsaved draft in a temporary chat', async ({ page }) => {
    const form = await openAgentBuilder(page);
    await dismissChangelogIfShown(page);
    await form.getByRole('tab', { name: 'Create' }).click();

    const label = uniqueName('preview');
    await form
      .getByRole('textbox', { name: 'Describe the agent you want to create…' })
      .fill(`E2E_AGENT_BUILDER:${label}`);
    await form.getByRole('button', { name: 'Send to the agent builder' }).click();
    await expect(form.getByText(`E2E agent builder reply: ${label}`)).toBeVisible();

    await form.getByRole('button', { name: 'Try the agent' }).click();
    const response = await sendMessage(page, replyPrompt(label));
    expect(response.ok()).toBeTruthy();
    expect(response.request().postDataJSON()).toMatchObject({
      endpoint: 'Mock Provider B',
      model: 'mock-model-b',
      promptPrefix: `You are the E2E builder agent for ${label}.`,
      isTemporary: true,
      ephemeralAgent: { web_search: true, execute_code: false, mcp: [] },
    });
    await expect(messagesView(page).getByText(replyText(label))).toBeVisible({ timeout: 30000 });
  });

  test('"Try the agent" from an existing conversation is still a temporary chat', async ({
    page,
  }) => {
    await openNewChat(page);
    await selectMockEndpoint(page, MOCK_ENDPOINTS[0]);
    const label = uniqueName('preview-existing');
    await sendMessageAndWaitForCompletion(page, replyPrompt(`${label}-first`));
    await expect(page).toHaveURL(/\/c\/[0-9a-fA-F-]{36}$/);

    /** Opens the builder in place: `openAgentBuilder` would navigate back to a new chat. */
    const agentBuilderButton = page.getByRole('button', { name: 'Agent Builder', exact: true });
    if ((await agentBuilderButton.getAttribute('aria-pressed')) !== 'true') {
      await agentBuilderButton.click();
    }
    const form = page.getByRole('form', { name: 'Agent configuration form' });
    await draftAgent(form, label);

    await form.getByRole('button', { name: 'Try the agent' }).click();
    const response = await sendMessage(page, replyPrompt(label));
    expect(response.request().postDataJSON()).toMatchObject({
      endpoint: 'Mock Provider B',
      promptPrefix: `You are the E2E builder agent for ${label}.`,
      isTemporary: true,
      ephemeralAgent: { web_search: true, execute_code: false, mcp: [] },
    });
    await expect(messagesView(page).getByText(replyText(label))).toBeVisible({ timeout: 30000 });
  });

  /** Leaving the preview gives back the user's default: the next chat is saved as usual. */
  test('after an unsent preview, "New chat" is not temporary', async ({ page }) => {
    const form = await openAgentBuilder(page);
    await dismissChangelogIfShown(page);
    const label = uniqueName('preview-unsent');
    await form.getByRole('tab', { name: 'Create' }).click();
    await draftAgent(form, label);

    await form.getByRole('button', { name: 'Try the agent' }).click();
    await page.getByTestId('new-chat-button').click();
    const response = await sendMessage(page, replyPrompt(label));
    expect(response.request().postDataJSON().isTemporary).toBe(false);
  });

  test('after a sent preview, "New chat" is not temporary', async ({ page }) => {
    const form = await openAgentBuilder(page);
    await dismissChangelogIfShown(page);
    const label = uniqueName('preview-sent');
    await form.getByRole('tab', { name: 'Create' }).click();
    await draftAgent(form, label);

    await form.getByRole('button', { name: 'Try the agent' }).click();
    await sendMessageAndWaitForCompletion(page, replyPrompt(`${label}-preview`));
    await page.getByTestId('new-chat-button').click();
    const response = await sendMessage(page, replyPrompt(label));
    expect(response.request().postDataJSON().isTemporary).toBe(false);
  });

  test("an agent's actions are listed when editing it from a model chat", async ({ page }) => {
    await openNewChat(page);
    await selectMockEndpoint(page, MOCK_ENDPOINTS[0]);
    const token = await getAccessToken(page);
    const agentName = uniqueName('E2E Action Agent');
    const agent = await requestJson<AgentDetail>(page, {
      path: '/api/agents',
      token,
      method: 'POST',
      body: {
        name: agentName,
        provider: MOCK_ENDPOINTS[0].label,
        model: MOCK_ENDPOINTS[0].model,
      },
    });
    try {
      await requestJson(page, {
        path: `/api/agents/actions/${encodeURIComponent(agent.id)}`,
        token,
        method: 'POST',
        body: {
          functions: [
            {
              type: 'function',
              function: {
                name: 'e2e_lookup',
                description: 'Return a deterministic lookup result.',
                parameters: { type: 'object', properties: {} },
              },
            },
          ],
          metadata: { domain: 'https://example.com' },
        },
      });

      const form = await openAgentBuilder(page);
      await form.getByRole('combobox', { name: 'Agent', exact: true }).click();
      await page.getByRole('option', { name: agentName, exact: true }).click();
      await expect(form.getByLabel('Agent name')).toHaveValue(agentName);

      await form.getByRole('button', { name: 'Add tools' }).click();
      const library = page.getByRole('dialog', { name: 'Tool Library' });
      const actionsFilter = library.getByRole('button', { name: /^Actions/ });
      await expect(actionsFilter).toContainText('1');
      await actionsFilter.click();
      await expect(library.getByText('https://example.com')).toBeVisible();
    } finally {
      await cleanupAgent(page, agent.id);
    }
  });
});

test.describe('SimpleAI AIDA files', () => {
  const AIDA_URL = 'https://aida.e2e.test';

  async function enableAida(page: Page) {
    await page.route(/\/api\/config$/, async (route) => {
      const response = await route.fetch();
      const config = (await response.json()) as { interface?: Record<string, unknown> };
      await route.fulfill({
        response,
        json: { ...config, interface: { ...config.interface, aida: { url: AIDA_URL } } },
      });
    });
    await page.route(`${AIDA_URL}/**`, (route) =>
      route.fulfill({ contentType: 'text/html', body: '<p>AIDA file manager</p>' }),
    );
  }

  test('the button is absent on an instance without AIDA', async ({ page }) => {
    await openNewChat(page);
    await expect(page.getByRole('button', { name: 'AIDA files' })).toHaveCount(0);
  });

  test('opens the AIDA file manager in an unsandboxed iframe that follows the theme', async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await enableAida(page);
    await openNewChat(page);

    await page.getByRole('button', { name: 'AIDA files' }).click();
    const dialog = page.getByRole('dialog', { name: 'AIDA files' });
    const iframe = dialog.locator('iframe[title="AIDA files"]');
    await expect(iframe).toHaveAttribute(
      'src',
      `${AIDA_URL}/embed/esplora?skin=simpleai&theme=dark`,
    );
    await expect(iframe).not.toHaveAttribute('sandbox');
    await expect(
      dialog.frameLocator('iframe[title="AIDA files"]').getByText('AIDA file manager'),
    ).toBeVisible();

    await page.emulateMedia({ colorScheme: 'light' });
    await expect(iframe).toHaveAttribute(
      'src',
      `${AIDA_URL}/embed/esplora?skin=simpleai&theme=light`,
    );
  });

  /** T265: a new AIDA project starts every chat knowing the role and the AIDA folder. */
  test('a new AIDA project carries the role and folder as project instructions', async ({
    page,
  }) => {
    await enableAida(page);
    await page.goto('/projects', { timeout: 10000 });
    await page.getByRole('button', { name: 'New project' }).first().click();

    const name = uniqueName('E2E AIDA Project');
    const dialog = page.getByRole('dialog');
    await dialog.getByRole('textbox', { name: 'Project name' }).fill(name);
    await dialog.getByRole('textbox', { name: 'Your role' }).fill('Project Manager');
    await dialog.getByRole('textbox', { name: 'AIDA folder' }).fill('Clienti/Packaging');
    const [created] = await Promise.all([
      page.waitForResponse(
        (res) =>
          res.request().method() === 'POST' && new URL(res.url()).pathname === '/api/projects',
      ),
      dialog.getByRole('button', { name: 'Create project' }).click(),
    ]);
    const expected =
      `Your role in the project "${name}" is Project Manager. Before answering, use AIDA to read ` +
      `the documents and instructions in the folder "Clienti/Packaging": they hold the rest of ` +
      `the project's context.`;
    expect(((await created.json()) as { instructions?: string }).instructions).toBe(expected);

    await expect(page.getByRole('heading', { name })).toBeVisible();
    await page.getByRole('button', { name: 'Edit project' }).first().click();
    await expect(page.getByRole('dialog').getByLabel(/Project instructions/)).toHaveValue(expected);
  });

  test('a project on an instance without AIDA has no AIDA fields', async ({ page }) => {
    await page.goto('/projects', { timeout: 10000 });
    await page.getByRole('button', { name: 'New project' }).first().click();
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByRole('textbox', { name: 'Project name' })).toBeVisible();
    await expect(dialog.getByRole('textbox', { name: 'AIDA folder' })).toHaveCount(0);
  });
});

test.describe('SimpleAI share page', () => {
  test('an unknown share id renders without crashing', async ({ page }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));

    await page.goto('/share/does-not-exist', { timeout: 10000 });

    await expect(page.getByText(/something went wrong/i)).toHaveCount(0);
    expect(pageErrors, `Unexpected runtime errors: ${pageErrors.join(', ')}`).toHaveLength(0);
  });
});
