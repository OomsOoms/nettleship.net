const verifyJwt = require('./verifyJwt');
const logger = require('./logger');
const errorHandler = require('./errorHandler');
const validateRequest = require('./validateRequest');

module.exports = {
  logger,
  verifyJwt,
  errorHandler,
  validateRequest,
};

/**
 * If this was Typescript it could be done like this:
 * export * from './errorHandler';
 * export * from './logger';
 * export * from './verofyJwt';
 */
