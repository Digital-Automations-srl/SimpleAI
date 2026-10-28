import { defineConfig } from '@playwright/test';
import path from 'path';
import mockConfig from './playwright.config.mock';

if (process.env.E2E_LIMITS !== 'true') {
  throw new Error('The limits suite needs E2E_LIMITS=true: run it via `npm run e2e:limits`.');
}

const rootPath = path.resolve(__dirname, '..');
const ACTION_PORT = process.env.E2E_ACTION_PORT || '8792';
const JEV_PORT = process.env.E2E_JEV_PORT || '8793';

const mockServers = mockConfig.webServer as Array<Record<string, unknown>>;
/** The LibreChat server is last and must start after the fixtures. */
const fixtures = mockServers.slice(0, -1);
const appServer = mockServers[mockServers.length - 1];

/** Limits suite: the mock harness plus the limits overlay (E2E_LIMITS=true) and two extra fakes. */
export default defineConfig({
  ...mockConfig,
  /** Global fakes, routerdecisions clearing and sidebar ordering: specs cannot run in parallel. */
  fullyParallel: false,
  workers: 1,
  testDir: 'specs/limits/',
  webServer: [
    ...fixtures,
    {
      command: `node ${path.resolve(rootPath, 'e2e/setup/fake-action-server.js')}`,
      cwd: rootPath,
      env: { ...process.env, E2E_ACTION_PORT: ACTION_PORT },
      url: `http://127.0.0.1:${ACTION_PORT}/`,
      stdout: 'pipe',
      timeout: 60_000,
      reuseExistingServer: false,
    },
    {
      command: `node ${path.resolve(rootPath, 'e2e/setup/fake-jev-server.js')}`,
      cwd: rootPath,
      env: { ...process.env, E2E_JEV_PORT: JEV_PORT },
      url: `http://127.0.0.1:${JEV_PORT}/`,
      stdout: 'pipe',
      timeout: 60_000,
      reuseExistingServer: false,
    },
    {
      ...appServer,
      env: { ...(appServer.env as Record<string, string>), TYPESAFE_API_KEY: 'e2e-jev-key' },
    },
  ],
} as Parameters<typeof defineConfig>[0]);
