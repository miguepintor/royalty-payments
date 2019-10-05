const joi = require('joi');
const viewingsSchema = require('./viewingsSchema');

module.exports.viewings = (query) => joi.validate(query, viewingsSchema);
