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
  describe('/royaltymanager/*', () => {
    it('Should log all operations', async () => {
      const sampleBody = { a: 'property' };
      await request(app).put('/royaltymanager/whatever').send(sampleBody);
      expect(loggerMock.info).toHaveBeenCalledTimes(1);
      expect(loggerMock.info).toHaveBeenCalledWith({ query: {}, body: sampleBody }, '[Royalty Manager] PUT request recived to /whatever');
    });
  });
  describe('/royaltymanager/reset', () => {
    it('Should reset all counters to 0 and the response status must be 202 with empty body', async () => {
      await redisMock.set('aaaa', 23);
      const response = await request(app).post('/royaltymanager/reset').send({});
      expect(response.status).toEqual(202);
      expect(response.body).toEqual({});
      expect(await redisMock.keys('*')).toEqual([]);
    });
    it('When there is an error it should return a 500, "Internal server error" and log it', async () => {
      const appWithNoStore = appInitilizator();
      const response = await request(appWithNoStore).post('/royaltymanager/reset').send({});
      expect(response.status).toEqual(500);
      expect(response.text).toEqual('Internal server error');
      expect(loggerMock.error).toHaveBeenCalledTimes(1);
    });
  });
  describe('/royaltymanager/viewing', () => {
    it('When there is a validation error in the query it should return a 400 and the reason', async () => {
      const response = await request(app).post('/royaltymanager/viewing').send({});
      expect(response.status).toEqual(400);
      expect(response.text).toEqual('child "episode" fails because ["episode" is required]');
    });
    it('Should increase in 1 the studio royalty counter specified by the episode and the response status must be 202 with empty body', async () => {
      const query = {
        episode: '6a1db5d6610a4c048d3df9a6268c68dc',
        customer: 'GUID',
      };
      const response = await request(app).post('/royaltymanager/viewing').send(query);
      expect(response.status).toEqual(202);
      expect(response.body).toEqual({});
      expect(await redisMock.get('665115721c6f44e49be3bd3e26606026')).toEqual('1');
    });
    it('When there is a an error it should return a 500, "Internal server error" and log it', async () => {
      const query = {
        episode: '6a1db5d6610a4c048d3df9a6268c68dc',
        customer: 'GUID',
      };
      const appWithNoStore = appInitilizator();
      const response = await request(appWithNoStore).post('/royaltymanager/viewing').send(query);
      expect(response.status).toEqual(500);
      expect(response.text).toEqual('Internal server error');
      expect(loggerMock.error).toHaveBeenCalledTimes(1);
    });
  });
  describe('/royaltymanager/payments', () => {
    it('Should return a list with all the studios payments and viewings, the response status must be 200', async () => {
      await redisMock.set('665115721c6f44e49be3bd3e26606026', 234);
      await redisMock.set('8d713a092ebf4844840cb90d0c4a2030', 42);
      await redisMock.set('49924ec6ec6c4efca4aa8b0779c89406', 3);

      const response = await request(app).get('/royaltymanager/payments');
      expect(response.status).toEqual(200);
      expect(response.body).toEqual([
        {
          rightsownerId: '665115721c6f44e49be3bd3e26606026',
          rightsowner: 'HBO',
          royalty: 0,
          viewings: 234,
        },
        {
          rightsownerId: '8d713a092ebf4844840cb90d0c4a2030',
          rightsowner: 'Sky UK',
          royalty: 0,
          viewings: 42,
        },
        {
          rightsownerId: '75aee18236484501b209aa36f95c7e0f',
          rightsowner: 'Showtime',
          royalty: 0,
          viewings: 0,
        },
        {
          rightsownerId: '49924ec6ec6c4efca4aa8b0779c89406',
          rightsowner: 'Fox',
          royalty: 0,
          viewings: 3,
        },
      ]);
    });
    it('Should return a list with all the studios payments equals to 0 when all viewings are 0, the response status must be 200', async () => {
      const response = await request(app).get('/royaltymanager/payments');
      expect(response.status).toEqual(200);
      expect(response.body).toEqual([
        {
          rightsownerId: '665115721c6f44e49be3bd3e26606026',
          rightsowner: 'HBO',
          royalty: 0,
          viewings: 0,
        },
        {
          rightsownerId: '8d713a092ebf4844840cb90d0c4a2030',
          rightsowner: 'Sky UK',
          royalty: 0,
          viewings: 0,
        },
        {
          rightsownerId: '75aee18236484501b209aa36f95c7e0f',
          rightsowner: 'Showtime',
          royalty: 0,
          viewings: 0,
        },
        {
          rightsownerId: '49924ec6ec6c4efca4aa8b0779c89406',
          rightsowner: 'Fox',
          royalty: 0,
          viewings: 0,
        },
      ]);
    });
    it('When there is a an error it should return a 500, "Internal server error" and log it', async () => {
      const appWithNoStore = appInitilizator();
      const response = await request(appWithNoStore).get('/royaltymanager/payments');
      expect(response.status).toEqual(500);
      expect(response.text).toEqual('Internal server error');
      expect(loggerMock.error).toHaveBeenCalledTimes(1);
    });
  });
  describe('/royaltymanager/payments/:studioId', () => {
    it('When the studio is not found it should return a 404 and empty body', async () => {
      const response = await request(app).get('/royaltymanager/payments/x');
      expect(response.status).toEqual(404);
      expect(response.body).toEqual({});
    });
    it('Should return an object with the viewings and payments for the given studio, the response status must be 200', async () => {
      await redisMock.set('665115721c6f44e49be3bd3e26606026', 234);

      const response = await request(app).get('/royaltymanager/payments/665115721c6f44e49be3bd3e26606026');
      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        rightsowner: 'HBO',
        royalty: 0,
        viewings: 234,
      });
    });
    it('Should return an object with payments equals to 0 when viewings are 0 for the given studio, the response status must be 200', async () => {
      const response = await request(app).get('/royaltymanager/payments/8d713a092ebf4844840cb90d0c4a2030');
      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        rightsownerId: '8d713a092ebf4844840cb90d0c4a2030',
        rightsowner: 'Sky UK',
        royalty: 0,
        viewings: 0,
      });
    });
    it('When there is a an error it should return a 500, "Internal server error" and log it', async () => {
      const appWithNoStore = appInitilizator();
      const response = await request(appWithNoStore).get('/royaltymanager/payments/8d713a092ebf4844840cb90d0c4a2030');
      expect(response.status).toEqual(500);
      expect(response.text).toEqual('Internal server error');
      expect(loggerMock.error).toHaveBeenCalledTimes(1);
    });
  });
});
