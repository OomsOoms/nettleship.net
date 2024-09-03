const { body, check } = require('express-validator');
const jwt = require('jsonwebtoken');

const { validateRequest, verifyCaptcha, sessionAuth } = require('../middlewares');

const verifyUser = [
  check('token').notEmpty().trim().escape().withMessage('Token is required'),
  async (req, res, next) => {
    const token = req.headers.authorization.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      req.user = decoded;
      next();
    } catch {
      res.status(400).json({ message: 'Invalid Token' });
    }
  },
];

const requestVerification = [
  body('email').isEmail().normalizeEmail().trim().escape().withMessage('Invalid Email'),
  validateRequest,
];

const getAllUsers = [sessionAuth];

const registerUser = [
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
    .matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  validateRequest,
  verifyCaptcha,
];

const updateUser = [
  body('username')
    .optional()
    .trim()
    .escape()
    .isLength({ min: 3, max: 20 })
    .withMessage('Username must be between 3 and 20 characters long')
    .matches(/^[a-z0-9_.-]+$/)
    .withMessage('Username can only contain lowercase letters, numbers, underscores, hyphens, and full stops'),
  body('email').optional().trim().escape().isEmail().normalizeEmail().withMessage('Invalid Email'),
  body('password')
    .optional()
    .trim()
    .escape()
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .isLength({ max: 128 })
    .withMessage('Password must be less than 128 characters long')
    .matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('currentPassword')
    .custom(async (value, { req }) => {
      const password = req.body.password;
      if (password && !value) {
        throw new Error('Current password is required');
      }
      return true;
    })
    .trim()
    .escape()
    .withMessage('Current password is required'),
  validateRequest,
];

const deleteUser = [body('password').notEmpty().trim().escape().withMessage('Password is required'), validateRequest];

module.exports = {
  verifyUser,
  registerUser,
  getAllUsers,
  updateUser,
  deleteUser,
  requestVerification,
};
