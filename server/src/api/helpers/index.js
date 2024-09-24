const Error = require('./customError');
const sendEmail = require('./sendEmail');

module.exports = {
  ...require('./s3'),
  Error,
  sendEmail,
};

/**
 * If this was Typescript it could be done like this:
 * export * from './passwordHasher';
 * export * from './generateJwt';
 * export * from './errors';
 */
