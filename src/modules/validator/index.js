const joi = require('joi');
const viewingSchema = require('./viewingSchema');

module.exports.viewing = (query) => joi.validate(query, viewingSchema);
