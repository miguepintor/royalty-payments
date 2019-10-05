const request = require('supertest');
const store = require('../../src/modules/store');
const { init: appInitilizator } = require('../../src/app');

// Mocking the whole logger module
jest.mock('../../src/modules/logger', () => ({ child: jest.fn() }));
const logger = require('../../src/modules/logger');

const loggerMock = {
  info: jest.fn(),
  error: jest.fn(),
};
logger.child.mockImplementation(() => loggerMock);

const inMemoryStore = store.inMemory();
const redisMock = inMemoryStore.getClient();
const app = appInitilizator(inMemoryStore);

beforeEach(async () => {
  await redisMock.flushall();
  loggerMock.error.mockClear();
  loggerMock.info.mockClear();
});

describe('Integration Tests: app with redis', () => {
  describe('royaltymanager/reset', () => {
    it('Should reset all counters to 0 and the response status must be 202', async () => {
      const response = await request(app).post().send({});
      expect(response.status).toEqual(202);
      expect(response.body).toEqual({});
      expect(redisMock.keys('*')).toEqual([]);
      expect(loggerMock.info).toHaveBeenCalled();
    });
    it('When there is a an error it should return a 500, "Internal server error" and log it', async () => {
      const appWithNoStore = appInitilizator();
      const response = await request(appWithNoStore).post().send({});
      expect(response.status).toEqual(500);
      expect(response.body).toEqual('Internal server error');
      expect(loggerMock.error).toHaveBeenCalled();
    });
  });
});
