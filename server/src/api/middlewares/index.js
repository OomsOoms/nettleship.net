const logger = require('./logger');
const errorHandler = require('./errorHandler');
const validate = require('./validate');
const sessionAuth = require('./sessionAuth');

module.exports = {
  logger,
  errorHandler,
  validate,
  sessionAuth,
};

/**
 * If this was Typescript it could be done like this:
 * export * from './errorHandler';
 * export * from './logger';
 * export * from './verofyJwt';
 */
