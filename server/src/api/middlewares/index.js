const verifyJwt = require('./verifyJwt');
const logger = require('./logger');
const errorHandler = require('./errorHandler');
const validateRequest = require('./validateRequest');
const sessionAuth = require('./sessionAuth');

module.exports = {
  logger,
  verifyJwt,
  errorHandler,
  validateRequest,
  sessionAuth,
};

/**
 * If this was Typescript it could be done like this:
 * export * from './errorHandler';
 * export * from './logger';
 * export * from './verofyJwt';
 */
