const Error = require('./error');
const generateJwt = require('./generateJwt');
const sendEmail = require('./sendEmail');
const decodeJwt = require('./decodeJwt');

module.exports = {
  ...require('./passwordUtils'),
  generateJwt,
  Error,
  sendEmail,
  decodeJwt,
};

/**
 * If this was Typescript it could be done like this:
 * export * from './passwordHasher';
 * export * from './generateJwt';
 * export * from './errors';
 */
