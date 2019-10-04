const redis = require('./redis');

module.exports.redis = redis.init;
module.exports.inMemory = redis.initInMemory;
