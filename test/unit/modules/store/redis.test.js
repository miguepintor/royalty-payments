const Redis = require('ioredis-mock');
const {
  increaseRoyaltiesCounter,
  getRoyaltiesCounter,
  getAllRoyaltiesCounters,
  resetAllCounters,
  errorHandler,
} = require('../../../../src/modules/store/redis');

const redisMock = new Redis();
const loggerMock = {
  info: jest.fn(),
  error: jest.fn(),
};

beforeEach(async () => {
  await redisMock.flushall();
  loggerMock.error.mockClear();
  loggerMock.info.mockClear();
});

describe('Redis store', () => {
  describe('increaseRoyaltiesCounter()', () => {
    it('when the studio id doesnt exist it should initialize the counter to 1', async () => {
      const sampleStudioId = 'aaaaa';
      await increaseRoyaltiesCounter(redisMock)(sampleStudioId);
      expect(await redisMock.get(sampleStudioId)).toEqual('1');
    });
    it('when the studio id exists it should increment the counter in 1', async () => {
      const sampleStudioId = 'aaaaa';
      await redisMock.set(sampleStudioId, 23);
      await increaseRoyaltiesCounter(redisMock)(sampleStudioId);
      expect(await redisMock.get(sampleStudioId)).toEqual('24');
    });
  });
  describe('getRoyaltiesCounter()', () => {
    it('when the studio id doesnt exist it should return 0', async () => {
      expect(await getRoyaltiesCounter(redisMock)('aaaaa')).toEqual(0);
    });
    it('when the studio id exists it should return its counter', async () => {
      const sampleStudioId = 'aaaaa';
      await redisMock.set(sampleStudioId, 23);
      expect(await getRoyaltiesCounter(redisMock)(sampleStudioId)).toEqual(23);
    });
  });
  describe('getAllRoyaltiesCounters()', () => {
    it('when there are no studios ids it should return an empty object', async () => {
      expect(await getAllRoyaltiesCounters(redisMock)()).toEqual({});
    });
    it('when there are studios ids stored it should return a map with keys equals to studios ids and values equals to counters', async () => {
      await redisMock.set('aaaa', 23);
      await redisMock.set('bbbb', 667);
      expect(await getAllRoyaltiesCounters(redisMock)()).toEqual({
        aaaa: 23,
        bbbb: 667,
      });
    });
  });
  describe('resetAllCounters()', () => {
    it('should remove all counters stored', async () => {
      await redisMock.set('aaaa', 23);
      await redisMock.set('bbbb', 667);
      await resetAllCounters(redisMock)();
      expect(await redisMock.keys('*')).toEqual([]);
    });
  });
  describe('errorHandler()', () => {
    it('when the function passed as argument throws an error should log it and rethrow it', async () => {
      const sampleError = new Error('This is a sample error');
      const sampleFunc = () => { throw sampleError; };
      await expect(errorHandler(sampleFunc)(loggerMock)).rejects.toThrow(sampleError);
      expect(loggerMock.info).toHaveBeenCalledTimes(0);
      expect(loggerMock.error).toHaveBeenCalledTimes(1);
      expect(loggerMock.error).toHaveBeenCalledWith({ err: sampleError }, '[Redis Store] Exception during the execution of a method');
    });
    it('when the function passed as argument returns a value it should return the same value', async () => {
      const sampleFunc = async (value) => value;
      expect(await errorHandler(sampleFunc)(loggerMock, 5)).toEqual(5);
      expect(loggerMock.error).toHaveBeenCalledTimes(0);
      expect(loggerMock.info).toHaveBeenCalledTimes(1);
      expect(loggerMock.info).toHaveBeenCalledWith('[Redis Store] Operation executed successfully');
    });
  });
});
