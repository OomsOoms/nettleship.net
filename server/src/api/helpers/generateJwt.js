const jwt = require('jsonwebtoken');
const secretKey = process.env.SECRET_KEY;

module.exports = function (payload, options = {}) {
  // Default options
  const defaultOptions = {
    expiresIn: '7d',
    algorithm: 'HS256',
  };

  // Merge default options with provided options
  const mergedOptions = { ...defaultOptions, ...options };

  return jwt.sign(payload, secretKey, mergedOptions);
};
