const bunyan = require('bunyan');

const options = (level) => ({
  name: 'pricing-api',
  streams: [{
    level,
    stream: process.stdout,
    type: 'raw',
  }],
  serializers: {
    err: bunyan.stdSerializers.err,
    res: bunyan.stdSerializers.res,
    req: bunyan.stdSerializers.req,
  },
});

const logger = bunyan.createLogger(options(process.env.LOG_LEVEL || bunyan.INFO));

module.exports = logger;
