const has = require('lodash.has');
const { episodes } = require('../../../resources/episodes');
const { studios } = require('../../../resources/studios');

const arrayToIdMap = (array) => array.reduce((acc, element) => {
  if (has(element, 'id')) acc[element.id] = element;
  return acc;
}, {});

module.exports.arrayToIdMap = arrayToIdMap;
module.exports.episodesMap = arrayToIdMap(episodes);
module.exports.studiosMap = arrayToIdMap(studios);
