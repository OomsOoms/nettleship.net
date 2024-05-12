const Error = require('./error');
const generateJwt = require('./generateJwt');

module.exports = {
  ...require('./passwordUtils'),
  generateJwt,
  Error,
};

/**
 * If this was Typescript it could be done like this:
 * export * from './passwordHasher';
 * export * from './generateJwt';
 * export * from './errors';
 */
