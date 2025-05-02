const { body } = require('express-validator');

const validateRequest = require('./validateRequest');
const { verifyCaptcha } = require('../middlewares');

const unlinkGoogle = [
    async (req, res, next) => {
        if (!req.isAuthenticated()) {
            return res.status(401).json({ message: 'You are not logged in' });
        }
        next();
    },
];

const requestResetPassword = [
    body('email').trim().escape().isEmail().normalizeEmail().withMessage('Invalid Email'),
    validateRequest,
    verifyCaptcha,
];

const resetPassword = [
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
];

module.exports = {
    unlinkGoogle,
    requestResetPassword,
    resetPassword,
};