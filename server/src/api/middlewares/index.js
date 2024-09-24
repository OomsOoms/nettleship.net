const errorHandler = require('./errorHandler');
const verifyCaptcha = require('./verifyCaptcha');
const rateLimiter = require('./rateLimiter');

module.exports = {
  errorHandler,
  verifyCaptcha,
  rateLimiter,
};

/**
 * If this was Typescript it could be done like this:
 * export * from './errorHandler';
 * export * from './logger';
 * export * from './verofyJwt';
 */
