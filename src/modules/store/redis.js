const RedisInMemory = require('ioredis-mock');
const Redis = require('ioredis');

const increaseRoyaltiesCounter = (client) => (studioId) => {};
const getRoyaltiesCounter = (client) => (studioId) => {};
const getAllRoyaltiesCounters = (client) => () => {};
const resetAllCounters = (client) => () => {};

const init = (client) => ({
  increaseRoyaltiesCounter: increaseRoyaltiesCounter(client),
  getRoyaltiesCounter: getRoyaltiesCounter(client),
  getAllRoyaltiesCounters: getAllRoyaltiesCounters(client),
  resetAllCounters: resetAllCounters(client),
});

module.exports.init = init;
module.exports.initRedis = () => init(new Redis());
module.exports.initInMemory = () => init(new RedisInMemory());
