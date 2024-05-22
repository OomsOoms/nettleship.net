const { body } = require('express-validator');

// I just need it so that if one of the two is provided, the other is not required but this seems to work well enough
const loginUser = [
  body('username')
    .if((value, { req }) => !req.body.email) // If email is not provided, username is required
    .trim()
    .escape()
    .bail(),
  body('email')
    .if((value, { req }) => !req.body.username) // If username is not provided, email is required
    .trim()
    .escape()
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email format')
    .bail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .bail()
    .trim()
    .escape()
    .isString()
    .bail(),
  body().custom((value, { req }) => {
    if (req.body.username && req.body.email) {
      throw new Error('Both username and email cannot be provided');
    }
    return true;
  }),
];

module.exports = {
  loginUser,
};
