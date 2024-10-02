const { body, check } = require('express-validator');
const jwt = require('jsonwebtoken');
const sharp = require('sharp');

const { verifyCaptcha } = require('../middlewares');
const validateRequest = require('./validateRequest');

const verifyUser = [
  check('token').notEmpty().trim().escape().withMessage('Token is required'),
  async (req, res, next) => {
    if (!req.headers.authorization) return res.status(400).json({ message: 'Token is required' });

    const token = req.headers.authorization.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      req.user = decoded;
      next();
    } catch {
      res.status(401).json({ message: 'Invalid token' });
    }
  },
];

const requestVerification = [
  body('email').isEmail().normalizeEmail().trim().escape().withMessage('Invalid Email'),
  validateRequest,
];

const getAllUsers = [
  async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    if (!req.user.profile.roles.includes('admin')) {
      return res.status(403).json({ message: 'User is not an admin' });
    }
    next();
  },
];

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
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,128}$/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  validateRequest,
  verifyCaptcha,
];

const updateUser = [
  async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    next();
  },
  async (req, res, next) => {
    if (req.file) {
      const imageTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!imageTypes.includes(req.file.mimetype))
        return res.status(400).json({ message: 'Image must be a jpeg, png, or gif' });

      const { width, height } = await sharp(req.file.buffer).metadata();
      if (width !== height || width > 500 || width < 100)
        return res.status(400).json({
          message:
            width !== height
              ? 'Image must be square'
              : width > 500
                ? 'Image must be 500x500 pixels or less'
                : 'Image must be 100x100 pixels or more',
        });
    }
    next();
  },
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
    .custom((value, { req }) => {
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
  (req, res, next) => {
    const allowedFields = ['username', 'email', 'password', 'currentPassword', 'profile.displayName', 'profile.bio'];
    const receivedFields = Object.keys(req.body);
    const invalidFields = receivedFields.filter((field) => !allowedFields.includes(field));
    if (invalidFields.length > 0) {
      return res.status(400).json({ message: `Invalid fields: ${invalidFields.join(', ')}` });
    }
    next();
  },
];

const deleteUser = [
  async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    next();
  },
  body('password').notEmpty().trim().escape().withMessage('Password is required'),
  validateRequest,
];

module.exports = {
  verifyUser,
  registerUser,
  getAllUsers,
  updateUser,
  deleteUser,
  requestVerification,
};
