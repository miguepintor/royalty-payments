const RedisInMemory = require('ioredis-mock');
const Redis = require('ioredis');

const increaseRoyaltiesCounter = (client) => (studioId) => client.incr(studioId);
const getRoyaltiesCounter = (client) => async (studioId) => parseInt(
  await client.get(studioId) || 0, 10,
);
const getAllRoyaltiesCounters = (client) => async () => {
  const keys = await client.keys('*');
  const multiCommandResponse = await client.multi(keys.map((key) => (['get', key]))).exec();
  // after using a multi operation values are in the format:
  // [[null, 'value1'], [null, 'value 2'], ...]
  // the following line remove the nulls.
  const values = multiCommandResponse.map((element) => element[1]);
  return keys.reduce((acc, key, index) => ({ ...acc, [key]: parseInt(values[index], 10) }), {});
};
const resetAllCounters = (client) => () => client.flushall();

const errorHandler = (func) => async (logger, ...args) => {
  try {
    const returnedValue = await func(...args);
    logger.info('[Redis Store] Operation executed successfully');
    return returnedValue;
  } catch (err) {
    logger.error({ err }, '[Redis Store] Exception during the execution of a method');
    throw err;
  }
};

const init = (client) => ({
  royalties: {
    increaseRoyaltiesCounter: errorHandler(increaseRoyaltiesCounter(client)),
    getRoyaltiesCounter: errorHandler(getRoyaltiesCounter(client)),
    getAllRoyaltiesCounters: errorHandler(getAllRoyaltiesCounters(client)),
    resetAllCounters: errorHandler(resetAllCounters(client)),
  },
  getClient: () => client,
});

const port = process.env.REDIS_PORT || 6379;
const host = process.env.REDIS_HOST || '127.0.0.1';

module.exports.initRedis = () => init(new Redis({ port, host }));
module.exports.initInMemory = () => init(new RedisInMemory());

module.exports.increaseRoyaltiesCounter = increaseRoyaltiesCounter;
module.exports.getRoyaltiesCounter = getRoyaltiesCounter;
module.exports.getAllRoyaltiesCounters = getAllRoyaltiesCounters;
module.exports.resetAllCounters = resetAllCounters;
module.exports.errorHandler = errorHandler;
