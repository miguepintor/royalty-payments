const express = require('express');
const uuidv4 = require('uuid/v4');
const bodyParser = require('body-parser');
const logger = require('./modules/logger');
const royaltyManagerRoutes = require('./routes/royalty_manager');

const init = (store) => {
  const app = express();
  app.disable('x-powered-by');
  app.use(bodyParser.json());

  // Injects the logger and the store in the context
  app.use((req, res, next) => {
    req.logger = logger.child({ requestIdentifier: uuidv4() });
    req.store = store;
    next();
  });

  app.use('/royaltymanager', royaltyManagerRoutes);

  app.use((err, req, res, next) => {
    res.status(500).send('Internal server error');
    next();
  });

  return app;
};

module.exports = init;
