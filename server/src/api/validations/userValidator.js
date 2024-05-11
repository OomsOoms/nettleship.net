const { body } = require('express-validator');

const registerUser = [
  body('username').notEmpty().withMessage('Username is required'),
  body('email').isEmail().withMessage('Invalid email format'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least  5 characters long'),
];

const loginUser = [
  body('email').isEmail().withMessage('Invalid email format'),
  body('password').notEmpty().withMessage('Password is required'),
];

const getCurrentUser = [
];

const updateUser = [
  body('password').notEmpty().withMessage('Password is required'),
  body('newUsername').optional().notEmpty().withMessage('New username cannot be empty'),
  body('newEmail').optional().isEmail().withMessage('Invalid new email format'),
  body('newPassword').optional().isLength({ min: 8 }).withMessage('New password must be at least 8 characters long'),
];

const deleteUser = [
  body('password').notEmpty().withMessage('Password is required'),
];
  

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
  updateUser,
  deleteUser,
};
