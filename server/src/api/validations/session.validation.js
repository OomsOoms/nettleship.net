const { body } = require('express-validator');

// I just need it so that if one of the two is provided, the other is not required but this seems to work well enough
const loginUser = [
  body('loginIdentifier')
    .notEmpty()
    .withMessage('Username or email is required')
    .bail()
    .trim()
    .escape()
    .isString()
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
