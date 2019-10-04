const Redis = require('ioredis-mock');
const redisStore = require('../../../../src/modules/store/redis');

const redisMock = new Redis();

const {
  increaseRoyaltiesCounter,
  getRoyaltiesCounter,
  getAllRoyaltiesCounters,
  resetAllCounters,
} = redisStore.init(redisMock);

beforeEach(async () => {
  await redisMock.flushall();
});

describe('Redis store', () => {
  describe('increaseRoyaltiesCounter()', () => {
    it('when the studio id doesnt exist it should initialize the counter to 1', async () => {
      const sampleStudioId = 'aaaaa';
      increaseRoyaltiesCounter(sampleStudioId);
      expect(await redisMock.get(sampleStudioId)).toEqual('1');
    });
    it('when the studio id exists it should increment the counter in 1', async () => {
      const sampleStudioId = 'aaaaa';
      await redisMock.set(sampleStudioId, 23);
      increaseRoyaltiesCounter(sampleStudioId);
      expect(await redisMock.get(sampleStudioId)).toEqual('24');
    });
  });
  describe('getRoyaltiesCounter()', () => {
    it('when the studio id doesnt exist it should return 0', async () => {
      expect(await getRoyaltiesCounter('aaaaa')).toEqual(0);
    });
    it('when the studio id exists it should return its counter', async () => {
      const sampleStudioId = 'aaaaa';
      await redisMock.set(sampleStudioId, 23);
      expect(await getRoyaltiesCounter(sampleStudioId)).toEqual(23);
    });
  });
  describe('getAllRoyaltiesCounters()', () => {
    it('when there are no studios ids it should return an empty object', async () => {
      expect(await getAllRoyaltiesCounters()).toEqual({});
    });
    it('when there are studios ids stored it should return a map with keys equals to studios ids and values equals to counters', async () => {
      await redisMock.set('aaaa', 23);
      await redisMock.set('bbbb', 667);
      expect(await getAllRoyaltiesCounters()).toEqual({
        aaaa: 23,
        bbbb: 667,
      });
    });
  });
  describe('resetAllCounters()', () => {
    it('should remove all counters stored', async () => {
      await redisMock.set('aaaa', 23);
      await redisMock.set('bbbb', 667);
      await resetAllCounters();
      expect(await redisMock.keys('*')).toEqual([]);
    });
  });
});
