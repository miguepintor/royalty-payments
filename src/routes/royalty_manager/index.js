const express = require('express');
const Decimal = require('decimal.js');

const validator = require('../../modules/validator');
const { episodesMap, studiosMap } = require('../../modules/resources_loader');

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
    await store.studios.resetAllViewings(logger);
    res.status(202).end();
  } catch (err) {
    logger.error({ err }, '[Royalty Manager] Exception during the reset execution');
    next(err);
  }
});

router.post('/viewing', async ({ body, store, logger }, res, next) => {
  try {
    const { error } = validator.viewing(body);
    if (error) res.status(400).send(error.message);
    else {
      await store.studios.increaseViewings(logger, episodesMap[body.episode].rightsowner);
      res.status(202).end();
    }
  } catch (err) {
    logger.error({ err }, '[Royalty Manager] Exception during the viewing execution');
    next(err);
  }
});

router.get('/payments', async ({ store, logger }, res, next) => {
  try {
    const studiosViewings = await store.studios.getAllStudiosViewings(logger);
    const response = Object.keys(studiosMap).map((studioId) => ({
      rightsownerId: studioId,
      rightsowner: studiosMap[studioId].name,
      royalty: Decimal.mul(
        new Decimal(studiosViewings[studioId] || 0),
        new Decimal(studiosMap[studioId].payment),
      ).toNumber(),
      viewings: studiosViewings[studioId] || 0,
    }));
    res.status(200).send(response);
  } catch (err) {
    logger.error({ err }, '[Royalty Manager] Exception during the payments execution');
    next(err);
  }
});

router.get('/payments/:studioId', async ({ params: { studioId }, store, logger }, res, next) => {
  try {
    if (!studiosMap[studioId]) res.status(404).end();
    else {
      const viewings = await store.studios.getViewings(logger, studioId);
      res.status(200).send({
        rightsowner: studiosMap[studioId].name,
        royalty: Decimal.mul(
          new Decimal(viewings),
          new Decimal(studiosMap[studioId].payment),
        ).toNumber(),
        viewings,
      });
    }
  } catch (err) {
    logger.error({ err }, '[Royalty Manager] Exception during the payments execution');
    next(err);
  }
});

module.exports = router;
