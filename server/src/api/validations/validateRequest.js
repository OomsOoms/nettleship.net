const { validationResult } = require('express-validator');

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = process.env.NODE_ENV === 'production' ? 'Invalid request parameters' : errors.array();

    res.status(400).json({ errors: error });
  } else {
    next();
  }
};

module.exports = validateRequest;
