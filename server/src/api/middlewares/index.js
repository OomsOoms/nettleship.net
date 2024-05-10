const verifyJwt = require('./verifyJwt');
const logger = require('./logger');

module.exports = {
  ...require('./errorHandlers'),
  logger,
  verifyJwt,
};

/**
 * If this was Typescript it could be done like this:
 * export * from './errorHandler';
 * export * from './logger';
 * export * from './verofyJwt';
 */
