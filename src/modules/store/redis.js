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

const errorHandler = (func, logger) => async (...args) => {
  try {
    const returnedValue = await func(...args);
    logger.info('[Redis Store] Operation executed successfully');
    return returnedValue;
  } catch (err) {
    logger.error({ err }, '[Redis Store] Exception during the execution of a method');
    throw err;
  }
};

const init = (client, logger) => ({
  increaseRoyaltiesCounter: errorHandler(increaseRoyaltiesCounter(client), logger),
  getRoyaltiesCounter: errorHandler(getRoyaltiesCounter(client), logger),
  getAllRoyaltiesCounters: errorHandler(getAllRoyaltiesCounters(client), logger),
  resetAllCounters: errorHandler(resetAllCounters(client), logger),
});

module.exports.initRedis = (logger) => init(new Redis(), logger);
module.exports.initInMemory = (logger) => init(new RedisInMemory(), logger);

module.exports.increaseRoyaltiesCounter = increaseRoyaltiesCounter;
module.exports.getRoyaltiesCounter = getRoyaltiesCounter;
module.exports.getAllRoyaltiesCounters = getAllRoyaltiesCounters;
module.exports.resetAllCounters = resetAllCounters;
module.exports.errorHandler = errorHandler;
