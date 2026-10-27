/**
 * SimpleAI: `POST /api/agents/builder/draft` as mounted in the agents v1 router — the real
 * `generateCheckAccess` gate and the real builder handler. The role lookup is a spy standing in
 * for the roles collection; the controllers the route does not reach are stubbed.
 */
const express = require('express');
const request = require('supertest');
const { PermissionTypes, Permissions, SystemRoles } = require('librechat-data-provider');

const mockAppConfig = { current: {} };
const mockRoles = new Map();

jest.mock('~/server/middleware', () => ({
  configMiddleware: (req, _res, next) => {
    req.config = mockAppConfig.current;
    next();
  },
  canAccessAgentResource: () => (_req, _res, next) => next(),
}));

jest.mock(
  '~/server/controllers/agents/v1',
  () => new Proxy({}, { get: () => (_req, res) => res.status(418).end() }),
);
jest.mock('~/server/routes/agents/actions', () => require('express').Router());
jest.mock('~/server/routes/agents/tools', () => require('express').Router());

jest.mock('~/models', () => ({
  getRoleByName: jest.fn(async (name) => mockRoles.get(name) ?? null),
  getUserKey: jest.fn(),
  getUserKeyValues: jest.fn(),
  getActiveCategories: jest.fn(async () => []),
}));

const { getActiveCategories } = require('~/models');
const { v1 } = require('../v1');

function roleWith(agents) {
  return { name: SystemRoles.USER, permissions: { [PermissionTypes.AGENTS]: agents } };
}

function createApp(role = SystemRoles.USER) {
  const app = express();
  app.use(express.json());
  app.use((req, _res, next) => {
    req.user = { id: 'user-1', role };
    next();
  });
  app.use('/api/agents', v1);
  return app;
}

const body = { messages: [{ role: 'user', text: 'Un traduttore' }] };

describe('POST /api/agents/builder/draft', () => {
  beforeEach(() => {
    mockRoles.clear();
    mockAppConfig.current = {};
    getActiveCategories.mockClear();
  });

  it('forbids users who cannot create agents', async () => {
    mockRoles.set(
      SystemRoles.USER,
      roleWith({ [Permissions.USE]: true, [Permissions.CREATE]: false }),
    );

    const response = await request(createApp()).post('/api/agents/builder/draft').send(body);

    expect(response.status).toBe(403);
    expect(response.body).toEqual({ message: 'Forbidden: Insufficient permissions' });
    expect(getActiveCategories).not.toHaveBeenCalled();
  });

  it('reaches the builder handler for users who can create agents', async () => {
    mockRoles.set(
      SystemRoles.USER,
      roleWith({ [Permissions.USE]: true, [Permissions.CREATE]: true }),
    );

    const response = await request(createApp()).post('/api/agents/builder/draft').send(body);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'The agent builder is not configured' });
  });

  it('validates the request before calling the model', async () => {
    mockRoles.set(
      SystemRoles.USER,
      roleWith({ [Permissions.USE]: true, [Permissions.CREATE]: true }),
    );
    mockAppConfig.current = {
      config: { agentBuilder: { spec: 'builder' } },
      modelSpecs: { list: [{ name: 'builder', preset: { endpoint: 'openAI', model: 'gpt-x' } }] },
    };

    const response = await request(createApp())
      .post('/api/agents/builder/draft')
      .send({ messages: [{ role: 'assistant', text: 'Ciao' }] });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'Invalid agent builder request' });
    expect(getActiveCategories).not.toHaveBeenCalled();
  });
});
