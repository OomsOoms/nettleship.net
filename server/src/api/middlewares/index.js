const verifyJwt = require('./verifyJwt');

module.exports = {
    ...require('./errorHandler'),
    ...require('./logger'),
    verifyJwt,
};

/**
 * If this was Typescript it could be done like this:
 * export * from './errorHandler';
 * export * from './logger';
 * export * from './verofyJwt';
 */