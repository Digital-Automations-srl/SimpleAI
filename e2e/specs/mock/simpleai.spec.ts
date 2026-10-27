import { expect, test } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';
import {
  MOCK_ENDPOINTS,
  NEW_CHAT_PATH,
  messagesView,
  replyPrompt,
  replyText,
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
});

test.describe('SimpleAI model fallback', () => {
  const FALLBACK_NOTE = 'Answered by fallback-model: primary-model was temporarily unavailable.';

  test('a response answered by a fallback model shows the note after reload', async ({ page }) => {
    await openNewChat(page);
    const label = uniqueName('fallback');
    await sendMessageAndWaitForCompletion(page, replyPrompt(label));
    await expect(messagesView(page).getByText(replyText(label))).toBeVisible();
    await expect(messagesView(page).getByText(FALLBACK_NOTE)).toHaveCount(0);

    /** The fake model cannot hit a provider limit; the stored metadata is what the UI reads. */
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
                modelFallback: { from: 'primary-model', to: ['fallback-model'] },
              },
            },
      );
      await route.fulfill({ response, json: withFallback });
    });
    await page.reload();

    await expect(messagesView(page).getByText(replyText(label))).toBeVisible();
    await expect(messagesView(page).getByText(FALLBACK_NOTE)).toBeVisible();
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
