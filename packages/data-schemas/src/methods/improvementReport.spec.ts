import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createModels } from '~/models';
import type { IImprovementReport } from '~/types';
import { createImprovementReportMethods, type ImprovementReportMethods } from './improvementReport';

jest.mock('~/config/winston', () => ({
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
}));

let mongoServer: InstanceType<typeof MongoMemoryServer>;
let ImprovementReport: mongoose.Model<IImprovementReport>;
let methods: ImprovementReportMethods;
let modelsToCleanup: string[] = [];

const userId = new mongoose.Types.ObjectId();

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  const models = createModels(mongoose);
  modelsToCleanup = Object.keys(models);
  Object.assign(mongoose.models, models);

  ImprovementReport = mongoose.models.ImprovementReport as mongoose.Model<IImprovementReport>;
  methods = createImprovementReportMethods(mongoose);

  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();

  for (const modelName of modelsToCleanup) {
    if (mongoose.models[modelName]) {
      delete mongoose.models[modelName];
    }
  }
});

afterEach(async () => {
  await ImprovementReport.deleteMany({});
});

describe('createImprovementReport', () => {
  it('persists a report with emailSent false and a timestamp', async () => {
    const created = await methods.createImprovementReport({
      user: userId,
      email: 'marco@digitalautomations.it',
      description: 'Il selettore modelli è lento',
      priority: 'Alta',
      area: 'Chat',
      appVersion: 'v0.8.7-simpleai.1',
    });

    const stored = await ImprovementReport.findById(created._id).lean();
    expect(stored).not.toBeNull();
    expect(stored?.description).toBe('Il selettore modelli è lento');
    expect(stored?.priority).toBe('Alta');
    expect(stored?.area).toBe('Chat');
    expect(stored?.emailSent).toBe(false);
    expect(stored?.createdAt).toBeInstanceOf(Date);
  });

  it('defaults priority and area when omitted', async () => {
    const created = await methods.createImprovementReport({
      user: userId,
      description: 'Senza priorità né area',
    } as Parameters<typeof methods.createImprovementReport>[0]);

    const stored = await ImprovementReport.findById(created._id).lean();
    expect(stored?.priority).toBe('Media');
    expect(stored?.area).toBe('Chat');
  });

  it('rejects a priority outside the schema enum', async () => {
    await expect(
      methods.createImprovementReport({
        user: userId,
        description: 'Testo',
        priority: 'Urgentissima' as 'Alta',
        area: 'Chat',
      }),
    ).rejects.toThrow();
  });

  it('rejects a report without a description', async () => {
    await expect(
      methods.createImprovementReport({
        user: userId,
        priority: 'Media',
        area: 'Chat',
      } as Parameters<typeof methods.createImprovementReport>[0]),
    ).rejects.toThrow();
  });

  it('rejects a description over the schema limit', async () => {
    await expect(
      methods.createImprovementReport({
        user: userId,
        description: 'a'.repeat(5001),
        priority: 'Media',
        area: 'Chat',
      }),
    ).rejects.toThrow();
  });
});

describe('markImprovementReportEmailSent', () => {
  it('flips emailSent to true', async () => {
    const created = await methods.createImprovementReport({
      user: userId,
      description: 'Testo',
      priority: 'Media',
      area: 'Chat',
    });

    await methods.markImprovementReportEmailSent(created._id as mongoose.Types.ObjectId);

    const stored = await ImprovementReport.findById(created._id).lean();
    expect(stored?.emailSent).toBe(true);
  });

  it('does not throw for an unknown id', async () => {
    await expect(
      methods.markImprovementReportEmailSent(new mongoose.Types.ObjectId()),
    ).resolves.toBeUndefined();
  });
});
