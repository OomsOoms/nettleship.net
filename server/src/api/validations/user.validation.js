const { body } = require('express-validator');

const registerUser = [
  body('username')
    .trim()
    .escape()
    .not()
    .isEmpty()
    .withMessage('Username is required')
    .bail()
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters long')
    .bail(),
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .bail()
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
    .isLength({ min: 8 })
    .withMessage('Password must be at least  8 characters long')
    .bail()
    .trim()
    .escape()
    .isString()
    .bail(),
];

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

// Only require the user to be authenticated which is done in other middlewear in the router
const getCurrentUser = [];

const updateUser = [
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .bail()
    .trim()
    .escape()
    .isString()
    .bail(),
  body('newUsername')
    .optional()
    .bail()
    .trim()
    .escape()
    .not()
    .isEmpty()
    .withMessage('Username is required')
    .bail()
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters long')
    .bail(),
  body('newEmail')
    .optional()
    .bail()
    .notEmpty()
    .withMessage('Email is required')
    .bail()
    .trim()
    .escape()
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email format')
    .bail(),
  body('newPassword')
    .optional()
    .bail()
    .notEmpty()
    .withMessage('Password is required')
    .bail()
    .isLength({ min: 8 })
    .withMessage('Password must be at least  8 characters long')
    .bail()
    .trim()
    .escape()
    .isString()
    .bail(),
];

const deleteUser = [
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .bail()
    .trim()
    .escape()
    .isString()
    .bail(),
];

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
  updateUser,
  deleteUser,
};
