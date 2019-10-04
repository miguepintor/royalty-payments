const has = require('lodash.has');

const arrayToIdMap = (array) => array.reduce((acc, element) => {
  if (has(element, 'id')) acc[element.id] = element;
  return acc;
}, {});

module.exports.arrayToIdMap = arrayToIdMap;
