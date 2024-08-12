const rateLimit = require('express-rate-limit');

// need to add limiters for different routes that require different limits, it might also be helpful to disable when node env is development

// general limiter for all routes
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests from this IP, please try again after 15 minutes',
});

module.exports = {
  generalLimiter,
};
