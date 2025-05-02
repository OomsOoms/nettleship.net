const { body, param } = require('express-validator');

const validateRequest = require('./validateRequest');
const { verifyCaptcha } = require('../middlewares');

const createUser = [
  body('username')
    .trim()
    .escape()
    .isLength({ min: 3, max: 20 })
    .withMessage('Username must be between 3 and 20 characters long')
    .matches(/^[a-z0-9_.-]+$/)
    .withMessage('Username can only contain lowercase letters, numbers, underscores, hyphens, and full stops'),
  body('email').trim().escape().isEmail().normalizeEmail().withMessage('Invalid Email'),
  body('password')
    .trim()
    .escape()
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .isLength({ max: 128 })
    .withMessage('Password must be less than 128 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,128}$/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  validateRequest,
  verifyCaptcha,
];

const getUserByUsername = [
  param('username')
    .trim()
    .escape()
    .isLength({ min: 3, max: 20 })
    .withMessage('Username must be between 3 and 20 characters long')
    .matches(/^[a-z0-9_.-]+$/)
    .withMessage('Username can only contain lowercase letters, numbers, underscores, hyphens, and full stops'),
  validateRequest,
];

const updateUser = [
  // user must be authenticated
  async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Unauthorised' });
    }
    next();
  },
  // check if the fields provided are valid
  async (req, res, next) => {
    const allowedFields = [
      'currentPassword',
      'password',
      'local.pendingEmail',
      'profile.displayName',
      'profile.bio',
      'profile.avatarUrl',
      'username',
    ];
    const fields = Object.keys(req.body);
    const isValidField = fields.every((field) => allowedFields.includes(field));
    if (!isValidField) {
      return res.status(400).json({ message: 'Invalid fields provided' });
    }
    next();
  },
  // check the username
  param('username')
    .trim()
    .escape()
    .isLength({ min: 3, max: 20 })
    .withMessage('Username must be between 3 and 20 characters long')
    .matches(/^[a-z0-9_.-]+$/)
    .withMessage('Username can only contain lowercase letters, numbers, underscores, hyphens, and full stops'),
  // validate the allowed fields
  body('password')
    .optional()
    .trim()
    .escape()
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
  body('local.pendingEmail').optional().trim().escape().isEmail().normalizeEmail().withMessage('Invalid Email'),
  body('profile.displayName')
    .optional()
    .trim()
    .escape()
    .isLength({ max: 50 })
    .withMessage('Display name must be less than 50 characters long'),
  body('profile.bio')
    .optional()
    .trim()
    .escape()
    .isLength({ max: 160 })
    .withMessage('Bio must be less than 160 characters long'),
  body('profile.avatarUrl').optional().trim().escape().isURL().withMessage('Invalid URL'),
  validateRequest,
];

const deleteUser = [
  async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Unauthorised' });
    }
    next();
  },
  param('username')
    .trim()
    .escape()
    .isLength({ min: 3, max: 20 })
    .withMessage('Username must be between 3 and 20 characters long')
    .matches(/^[a-z0-9_.-]+$/)
    .withMessage('Username can only contain lowercase letters, numbers, underscores, hyphens, and full stops'),
  // only check if it exists as its used for authentication so validation rules arent needed
  body('password').notEmpty().trim().escape().withMessage('Password is required'),
  validateRequest,
];

const requestVerification = [body('email').isEmail().normalizeEmail().withMessage('Invalid Email'), validateRequest];

// check bearer token
const verifyEmail = [];

module.exports = {
  createUser,
  getUserByUsername,
  updateUser,
  deleteUser,
  requestVerification,
  verifyEmail,
};
