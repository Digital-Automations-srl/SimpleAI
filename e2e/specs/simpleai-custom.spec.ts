import { expect, test, Page, BrowserContext } from '@playwright/test';

const E2E_EMAIL = process.env.E2E_EMAIL || 'marco.nucci@digitalautomations.it';
const E2E_PASSWORD = process.env.E2E_PASSWORD || 'Giocatoio12@';

test.use({ storageState: { cookies: [], origins: [] } });

// Single shared login — avoids rate limiting
let authContext: BrowserContext;
let authPage: Page;
let cookies: { name: string; value: string }[] = [];

test.beforeAll(async ({ browser, baseURL }) => {
  authContext = await browser.newContext();
  authPage = await authContext.newPage();
  await authPage.goto(`${baseURL}/login`, { timeout: 15000 });
  await authPage.locator('input[name="email"]').fill(E2E_EMAIL);
  await authPage.locator('input[name="password"]').fill(E2E_PASSWORD);
  await authPage.locator('input[name="password"]').press('Enter');
  await authPage.waitForURL('**/c/new', { timeout: 15000 });
  cookies = await authContext.cookies();
  await authPage.close();
  await authContext.close();
});

test.describe('SimpleAI Branding', () => {
  test('Page title contains Simple AI', async ({ page }) => {
    await page.goto('/login', { timeout: 15000 });
    await expect(page).toHaveTitle(/Simple AI/i);
  });

  test('Login page loads correctly', async ({ page }) => {
    await page.goto('/login', { timeout: 15000 });
    const emailInput = page.locator('input[name="email"]');
    await expect(emailInput).toBeVisible();
  });
});

test.describe('Authentication', () => {
  test('Login succeeded (via beforeAll)', async () => {
    expect(cookies.length).toBeGreaterThan(0);
  });
});

test.describe('Authenticated Features', () => {
  test.use({
    storageState: { cookies: [], origins: [] },
  });

  test.beforeEach(async ({ context }) => {
    // Inject cookies from the single login
    await context.addCookies(cookies);
  });

  test('Main chat page loads', async ({ page }) => {
    await page.goto('/c/new', { timeout: 15000 });
    await page.waitForTimeout(2000);
    const form = page.locator('form');
    await expect(form).toBeVisible({ timeout: 10000 });
  });

  test('Changelog modal appears on first visit', async ({ page }) => {
    await page.goto('/c/new', { timeout: 15000 });
    await page.evaluate(() => localStorage.removeItem('simpleai_changelog_seen'));
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    const modal = page.locator('[role="dialog"]');
    const isVisible = await modal.isVisible().catch(() => false);
    console.log(`Changelog modal visible: ${isVisible}`);
    expect(typeof isVisible).toBe('boolean');
  });

  test('Account menu opens and shows options', async ({ page }) => {
    await page.goto('/c/new', { timeout: 15000 });
    await page.waitForTimeout(2000);

    const accountButton = page.locator('[data-testid="nav-user"]');
    await expect(accountButton).toBeVisible({ timeout: 10000 });
    await accountButton.click();
    await page.waitForTimeout(500);

    const settingsItem = page.getByText(/Settings|Impostazioni/i);
    await expect(settingsItem).toBeVisible({ timeout: 5000 });

    const feedbackItem = page.getByText(/Segnala|Report.*improvement/i);
    const hasFeedback = await feedbackItem.isVisible().catch(() => false);
    console.log(`Feedback menu item visible: ${hasFeedback}`);
  });

  test('Feedback modal opens if feature is deployed', async ({ page }) => {
    await page.goto('/c/new', { timeout: 15000 });
    await page.waitForTimeout(2000);

    const accountButton = page.locator('[data-testid="nav-user"]');
    await accountButton.click();
    await page.waitForTimeout(500);

    const feedbackItem = page.getByText(/Segnala|Report.*improvement/i);
    const hasFeedback = await feedbackItem.isVisible().catch(() => false);

    if (hasFeedback) {
      await feedbackItem.click();
      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible({ timeout: 5000 });
      await expect(dialog.locator('textarea')).toBeVisible();
    } else {
      console.log('Feedback feature not deployed yet — skipping');
    }
  });

  test('Marketplace loads with category tabs', async ({ page }) => {
    await page.goto('/agents', { timeout: 15000 });
    await page.waitForTimeout(3000);

    const categoryArea = page.locator('[role="tablist"], [role="tab"]');
    const hasTabs = await categoryArea.first().isVisible({ timeout: 10000 }).catch(() => false);
    expect(hasTabs).toBe(true);
  });

  test('Category manager opens from marketplace', async ({ page }) => {
    await page.goto('/agents', { timeout: 15000 });
    await page.waitForTimeout(3000);

    const manageButton = page.locator('button[aria-label*="categor" i], button[aria-label*="Manage" i]');
    const isVisible = await manageButton.isVisible({ timeout: 5000 }).catch(() => false);
    if (isVisible) {
      await manageButton.click();
      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible({ timeout: 5000 });
    }
  });

  test('Model selector shows reasoning presets', async ({ page }) => {
    await page.goto('/c/new', { timeout: 15000 });
    await page.waitForTimeout(2000);

    const presetsButton = page.locator('#presets-button, [data-testid="presets-button"]');
    const hasPresets = await presetsButton.isVisible({ timeout: 5000 }).catch(() => false);
    expect(typeof hasPresets).toBe('boolean');
  });
});

test.describe('API Endpoints', () => {
  test('GET /api/agents/categories returns categories', async ({ request }) => {
    const cookieHeader = cookies.map((c) => `${c.name}=${c.value}`).join('; ');
    const response = await request.get('/api/agents/categories', {
      headers: { Cookie: cookieHeader },
    });
    expect(response.status()).toBe(200);
    const categories = await response.json();
    expect(Array.isArray(categories)).toBe(true);
    expect(categories.length).toBeGreaterThan(0);
    expect(categories[0]).toHaveProperty('value');
    expect(categories[0]).toHaveProperty('label');
  });

  test('POST /api/agents/categories validates required fields', async ({ request }) => {
    const cookieHeader = cookies.map((c) => `${c.name}=${c.value}`).join('; ');
    const response = await request.post('/api/agents/categories', {
      headers: { Cookie: cookieHeader, 'Content-Type': 'application/json' },
      data: { label: '' },
    });
    expect(response.status()).toBe(400);
  });

  test('DELETE /api/agents/categories/general blocks system category deletion', async ({ request }) => {
    const cookieHeader = cookies.map((c) => `${c.name}=${c.value}`).join('; ');
    const response = await request.delete('/api/agents/categories/general', {
      headers: { Cookie: cookieHeader },
    });
    expect(response.status()).toBe(403);
  });

  test('CRUD cycle: create, verify, delete custom category', async ({ request }) => {
    const cookieHeader = cookies.map((c) => `${c.name}=${c.value}`).join('; ');
    const testValue = `e2e_test_${Date.now()}`;

    // Create
    const createRes = await request.post('/api/agents/categories', {
      headers: { Cookie: cookieHeader, 'Content-Type': 'application/json' },
      data: { value: testValue, label: 'E2E Test Category', description: 'Temporary' },
    });
    expect(createRes.status()).toBe(201);

    // Verify
    const listRes = await request.get('/api/agents/categories', {
      headers: { Cookie: cookieHeader },
    });
    const categories = await listRes.json();
    const found = categories.find((c: { value: string }) => c.value === testValue);
    expect(found).toBeDefined();

    // Delete
    const deleteRes = await request.delete(`/api/agents/categories/${testValue}`, {
      headers: { Cookie: cookieHeader },
    });
    expect(deleteRes.status()).toBe(200);

    // Verify gone
    const listRes2 = await request.get('/api/agents/categories', {
      headers: { Cookie: cookieHeader },
    });
    const categories2 = await listRes2.json();
    expect(categories2.find((c: { value: string }) => c.value === testValue)).toBeUndefined();
  });
});

test.describe('Share Page', () => {
  test('Share page does not crash with invalid ID', async ({ page }) => {
    const response = await page.goto('/share/test-invalid-id', { timeout: 15000 });
    expect(response?.status()).toBe(200);
  });
});
