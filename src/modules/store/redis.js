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

const init = (client) => ({
  increaseRoyaltiesCounter: increaseRoyaltiesCounter(client),
  getRoyaltiesCounter: getRoyaltiesCounter(client),
  getAllRoyaltiesCounters: getAllRoyaltiesCounters(client),
  resetAllCounters: resetAllCounters(client),
});

module.exports.init = init;
module.exports.initRedis = () => init(new Redis());
module.exports.initInMemory = () => init(new RedisInMemory());
