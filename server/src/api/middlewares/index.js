const errorHandler = require('./errorHandler');
const validateRequest = require('./validateRequest');
const verifyCaptcha = require('./verifyCaptcha');
const rateLimiter = require('./rateLimiter');

module.exports = {
  errorHandler,
  validateRequest,
  ...require('./sessionAuth'),
  verifyCaptcha,
  rateLimiter,
};

/**
 * If this was Typescript it could be done like this:
 * export * from './errorHandler';
 * export * from './logger';
 * export * from './verofyJwt';
 */
