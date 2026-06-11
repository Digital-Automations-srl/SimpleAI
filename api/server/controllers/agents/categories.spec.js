// Mock ALL dependencies of v1.js to avoid loading the real module chain
jest.mock('@librechat/data-schemas', () => ({
  logger: { error: jest.fn(), warn: jest.fn(), info: jest.fn(), debug: jest.fn() },
}));

jest.mock('@librechat/api', () => ({
  agentCreateSchema: { parse: jest.fn() },
  agentUpdateSchema: { parse: jest.fn() },
  refreshListAvatars: jest.fn(),
  collectEdgeAgentIds: jest.fn(),
  mergeAgentOcrConversion: jest.fn(),
  MAX_AVATAR_REFRESH_AGENTS: 100,
  convertOcrToContextInPlace: jest.fn(),
}));

jest.mock('~/models/Agent', () => ({
  getAgent: jest.fn(),
  createAgent: jest.fn(),
  updateAgent: jest.fn(),
  deleteAgent: jest.fn(),
  getListAgents: jest.fn(),
  duplicateAgent: jest.fn(),
  revertAgentVersion: jest.fn(),
}));

jest.mock('~/models/Action', () => ({
  updateAction: jest.fn(),
  getActions: jest.fn().mockResolvedValue([]),
}));

jest.mock('~/models', () => ({
  getCategoriesWithCounts: jest.fn(),
  createCategory: jest.fn(),
  updateCategory: jest.fn(),
  deleteCategory: jest.fn(),
  findCategoryByValue: jest.fn(),
  deleteFileByFilter: jest.fn(),
}));

jest.mock('~/server/services/PermissionService', () => ({
  findAccessibleResources: jest.fn(),
  findPubliclyAccessibleResources: jest.fn(),
  getResourcePermissionsMap: jest.fn().mockResolvedValue(new Map()),
  hasPublicPermission: jest.fn(),
  grantPermission: jest.fn(),
}));

jest.mock('~/server/services/Files/strategies', () => ({
  getStrategyFunctions: jest.fn(),
}));

jest.mock('~/server/services/Files/images/avatar', () => ({
  resizeAvatar: jest.fn(),
}));

jest.mock('~/server/services/Files/S3/crud', () => ({
  refreshS3Url: jest.fn(),
}));

jest.mock('~/server/services/Files/process', () => ({
  filterFile: jest.fn(),
}));

jest.mock('~/server/utils/getFileStrategy', () => ({
  getFileStrategy: jest.fn(),
}));

jest.mock('~/server/services/Config', () => ({
  getCachedTools: jest.fn().mockResolvedValue({}),
}));

jest.mock('~/config', () => ({
  getMCPServersRegistry: jest.fn().mockReturnValue({ getServerRegistry: jest.fn().mockReturnValue({}) }),
}));

jest.mock('~/cache', () => ({
  getLogStores: jest.fn().mockReturnValue({ get: jest.fn(), set: jest.fn() }),
}));

const {
  createCategory,
  updateCategory,
  deleteCategory,
  findCategoryByValue,
} = require('~/models');

const v1 = require('./v1');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Category CRUD Handlers', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('createCategory', () => {
    it('returns 400 when value is missing', async () => {
      const req = { body: { label: 'Test' } };
      const res = mockRes();
      await v1.createCategory(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'value and label are required' });
    });

    it('returns 400 when label is missing', async () => {
      const req = { body: { value: 'test' } };
      const res = mockRes();
      await v1.createCategory(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('returns 409 when category already exists', async () => {
      findCategoryByValue.mockResolvedValue({ value: 'test', label: 'Test' });
      const req = { body: { value: 'test', label: 'Test' } };
      const res = mockRes();
      await v1.createCategory(req, res);
      expect(res.status).toHaveBeenCalledWith(409);
    });

    it('creates category with custom=true and returns 201', async () => {
      findCategoryByValue.mockResolvedValue(null);
      const created = { value: 'marketing', label: 'Marketing', custom: true, isActive: true };
      createCategory.mockResolvedValue(created);

      const req = { body: { value: 'marketing', label: 'Marketing', description: 'Marketing team' } };
      const res = mockRes();
      await v1.createCategory(req, res);

      expect(createCategory).toHaveBeenCalledWith(
        expect.objectContaining({ value: 'marketing', label: 'Marketing', custom: true }),
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(created);
    });

    it('returns 500 on unexpected error', async () => {
      findCategoryByValue.mockRejectedValue(new Error('DB error'));
      const req = { body: { value: 'test', label: 'Test' } };
      const res = mockRes();
      await v1.createCategory(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('updateCategory', () => {
    it('updates category and returns 200', async () => {
      const updated = { value: 'marketing', label: 'Marketing Updated' };
      updateCategory.mockResolvedValue(updated);

      const req = { params: { value: 'marketing' }, body: { label: 'Marketing Updated' } };
      const res = mockRes();
      await v1.updateCategory(req, res);

      expect(updateCategory).toHaveBeenCalledWith('marketing', { label: 'Marketing Updated' });
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('returns 404 when category not found', async () => {
      updateCategory.mockResolvedValue(null);
      const req = { params: { value: 'nonexistent' }, body: { label: 'X' } };
      const res = mockRes();
      await v1.updateCategory(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('returns 500 on unexpected error', async () => {
      updateCategory.mockRejectedValue(new Error('DB error'));
      const req = { params: { value: 'test' }, body: {} };
      const res = mockRes();
      await v1.updateCategory(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('deleteCategory', () => {
    it('deletes custom category and returns 200', async () => {
      findCategoryByValue.mockResolvedValue({ value: 'marketing', custom: true });
      deleteCategory.mockResolvedValue(true);

      const req = { params: { value: 'marketing' } };
      const res = mockRes();
      await v1.deleteCategory(req, res);

      expect(deleteCategory).toHaveBeenCalledWith('marketing');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Category deleted' });
    });

    it('returns 404 when category not found', async () => {
      findCategoryByValue.mockResolvedValue(null);
      const req = { params: { value: 'nonexistent' } };
      const res = mockRes();
      await v1.deleteCategory(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('returns 403 when trying to delete system category', async () => {
      findCategoryByValue.mockResolvedValue({ value: 'general', custom: false });
      const req = { params: { value: 'general' } };
      const res = mockRes();
      await v1.deleteCategory(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(deleteCategory).not.toHaveBeenCalled();
    });

    it('returns 500 when deleteCategory returns false', async () => {
      findCategoryByValue.mockResolvedValue({ value: 'marketing', custom: true });
      deleteCategory.mockResolvedValue(false);

      const req = { params: { value: 'marketing' } };
      const res = mockRes();
      await v1.deleteCategory(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
