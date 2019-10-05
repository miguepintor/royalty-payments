const express = require('express');

const router = express.Router();

// logs any incoming request
router.use(({
  logger, query, body, method, path,
}, res, next) => {
  logger.info({ query, body }, `[Royalty Manager] ${method} request recived to ${path}`);
  next();
});

router.post('/reset', async ({ store, logger }, res, next) => {
  try {
    await store.royalties.resetAllCounters(logger);
    res.status(202).end();
  } catch (err) {
    logger.error({ err }, '[Royalty Manager] Exception during the execution');
    next(err);
  }
});

module.exports = router;
