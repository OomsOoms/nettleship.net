const { body, check } = require('express-validator');

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

const loginUser = [
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
    .trim()
    .escape()
    .isString()
    .bail(),
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
