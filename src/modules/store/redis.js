const RedisInMemory = require('ioredis-mock');
const Redis = require('ioredis');

const increaseViewings = (client) => (studioId) => client.incr(studioId);
const getViewings = (client) => async (studioId) => parseInt(
  await client.get(studioId) || 0, 10,
);
const getAllStudiosViewings = (client) => async () => {
  const keys = await client.keys('*');
  const multiCommandResponse = await client.multi(keys.map((key) => (['get', key]))).exec();
  // after using a multi operation values are in the format:
  // [[null, 'value1'], [null, 'value 2'], ...]
  // the following line remove the nulls.
  const values = multiCommandResponse.map((element) => element[1]);
  return keys.reduce((acc, key, index) => ({ ...acc, [key]: parseInt(values[index], 10) }), {});
};
const resetAllViewings = (client) => () => client.flushall();

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

const init = (client, logger) => {
  client.on('error', (error) => {
    logger.error(error, '[Redis Store] Error');
  });
  return {
    studios: {
      increaseViewings: errorHandler(increaseViewings(client)),
      getViewings: errorHandler(getViewings(client)),
      getAllStudiosViewings: errorHandler(getAllStudiosViewings(client)),
      resetAllViewings: errorHandler(resetAllViewings(client)),
    },
    getClient: () => client,
  };
};

const port = process.env.REDIS_PORT || 6379;
const host = process.env.REDIS_HOST || '127.0.0.1';

module.exports.initRedis = (logger) => init(new Redis({ port, host }), logger);
module.exports.initInMemory = (logger) => init(new RedisInMemory(), logger);

module.exports.increaseViewings = increaseViewings;
module.exports.getViewings = getViewings;
module.exports.getAllStudiosViewings = getAllStudiosViewings;
module.exports.resetAllViewings = resetAllViewings;
module.exports.errorHandler = errorHandler;
