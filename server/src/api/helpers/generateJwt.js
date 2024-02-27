const jwt = require('jsonwebtoken');
const secretKey = process.env.SECRET_KEY;

function generateToken(payload, options = {}) {
  // Default options
  const defaultOptions = {
    expiresIn: '1h',
    algorithm: 'HS256',
  };

  // Merge default options with provided options
  const mergedOptions = { ...defaultOptions, ...options };

  return jwt.sign(payload, secretKey, mergedOptions);
}

module.exports = generateToken;
