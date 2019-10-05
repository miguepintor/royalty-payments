const base = require('joi');
const { episodesMap } = require('../resources_loader');

const joi = base.extend((j) => ({
  name: 'episode',
  base: j.string(),
  language: {
    existsInSystem: 'does not exist in the system',
  },
  rules: [{
    name: 'existsInSystem',
    validate(params, value, state, options) {
      if (!episodesMap[value]) return this.createError('episode.existsInSystem', { value }, state, options);
      return value;
    },
  }],
}));

module.exports = joi.object().keys({
  episode: joi.episode().required().existsInSystem(),
  customer: joi.string().required(),
});
