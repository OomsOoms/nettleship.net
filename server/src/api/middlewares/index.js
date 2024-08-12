const logger = require('./logger');
const errorHandler = require('./errorHandler');
const validateRequest = require('./validateRequest');
const sessionAuth = require('./sessionAuth');
const verifyCaptcha = require('./verifyCaptcha');
const rateLimiter = require('./rateLimiter');

module.exports = {
  logger,
  errorHandler,
  validateRequest,
  sessionAuth,
  verifyCaptcha,
  rateLimiter,
};

/**
 * If this was Typescript it could be done like this:
 * export * from './errorHandler';
 * export * from './logger';
 * export * from './verofyJwt';
 */
