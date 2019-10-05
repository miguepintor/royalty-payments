const redis = require('./redis');

module.exports.redis = redis.initRedis;
module.exports.inMemory = redis.initInMemory;
