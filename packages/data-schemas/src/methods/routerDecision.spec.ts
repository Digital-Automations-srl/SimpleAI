import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import type { IRouterDecision } from '~/types';
import { createRouterDecisionMethods } from './routerDecision';
import { createModels } from '~/models';

let mongoServer: MongoMemoryServer;
let methods: ReturnType<typeof createRouterDecisionMethods>;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
  createModels(mongoose);
  methods = createRouterDecisionMethods(mongoose);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('createRouterDecision', () => {
  it('stores the decision with its probabilities for the report script', async () => {
    const user = new mongoose.Types.ObjectId();

    await methods.createRouterDecision({
      user,
      conversationId: 'convo-1',
      routerSpec: 'auto',
      spec: 'opus',
      endpoint: 'anthropic',
      model: 'claude-opus-4-8',
      tools: ['web_search'],
      confidence: 0.82,
      probabilities: { opus: 0.82, sonnet: 0.15, haiku: 0.03 },
      toolProbabilities: { web_search: 0.91 },
      jevModel: 'jev-1.13.0',
      inputTokens: 412,
      latencyMs: 230,
    });

    const RouterDecision = mongoose.models.RouterDecision as mongoose.Model<IRouterDecision>;
    const stored = await RouterDecision.findOne({ conversationId: 'convo-1' }).lean();
    expect(stored).toMatchObject({
      spec: 'opus',
      tools: ['web_search'],
      probabilities: { opus: 0.82, sonnet: 0.15, haiku: 0.03 },
    });
    expect(stored?.user.toString()).toBe(user.toString());
    expect(stored?.createdAt).toBeInstanceOf(Date);
  });
});

describe('getLastRouterSpec', () => {
  it("returns the spec of the conversation's latest decision for that user only", async () => {
    const user = new mongoose.Types.ObjectId();
    const other = new mongoose.Types.ObjectId();
    const base = { routerSpec: 'auto', tools: [] };

    await methods.createRouterDecision({ ...base, user, conversationId: 'convo-2', spec: 'haiku' });
    await methods.createRouterDecision({ ...base, user, conversationId: 'convo-2', spec: 'opus' });
    await methods.createRouterDecision({
      ...base,
      user: other,
      conversationId: 'convo-2',
      spec: 'sonnet',
    });
    await methods.createRouterDecision({
      ...base,
      user,
      conversationId: 'convo-3',
      spec: 'sonnet',
    });

    expect(await methods.getLastRouterSpec({ user, conversationId: 'convo-2' })).toBe('opus');
    expect(await methods.getLastRouterSpec({ user, conversationId: 'convo-none' })).toBeUndefined();
  });
});
