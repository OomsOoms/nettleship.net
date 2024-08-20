const { body } = require('express-validator');

const requestVerification = [
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .bail()
    .trim()
    .escape()
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email')
    .bail(),
];

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
    .bail()
    .isLength({ max: 20 })
    .withMessage('Username must be at most 20 characters long')
    .matches(/^[a-z0-9_.-]+$/)
    .withMessage('Username can only contain lowercase letters, numbers, underscores, hyphens, and full stops')
    .bail(),
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .bail()
    .trim()
    .escape()
    .isLength({ min: 6 })
    .withMessage('Email must be at least 6 characters long')
    .bail()
    .isLength({ max: 71 })
    .withMessage('Email must be at most 71 characters long')
    .bail()
    .isEmail() // this also checks the length so the values I picked were based off of this, just so i can get better error messages
    .normalizeEmail()
    .withMessage('Invalid email')
    .bail(),
  body('password')
    .trim()
    .escape()
    .isString()
    .bail()
    .notEmpty()
    .withMessage('Password is required')
    .bail()
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .bail()
    .isLength({ max: 128 })
    .withMessage('Password must be at most 128 characters long')
    .bail(),
];

const updateUser = []; // TODO: Add validation rules for updating user, may also redo other validation rules

const deleteUser = [
  body('password').notEmpty().withMessage('Password is required').bail().trim().escape().isString().bail(),
];

module.exports = {
  registerUser,
  updateUser,
  deleteUser,
  requestVerification,
};
