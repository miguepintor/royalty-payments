const express = require('express');
const validator = require('../../modules/validator');
const { episodesMap } = require('../../modules/resources_loader');

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

router.post('/viewing', async ({ body, store, logger }, res, next) => {
  try {
    const { error } = validator.viewing(body);
    if (error) res.status(400).send(error.message);
    else {
      await store.royalties.increaseRoyaltiesCounter(logger, episodesMap[body.episode].rightsowner);
      res.status(202).end();
    }
  } catch (err) {
    logger.error({ err }, '[Royalty Manager] Exception during the execution');
    next(err);
  }
});

module.exports = router;
