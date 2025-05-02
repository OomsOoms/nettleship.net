const { body } = require('express-validator');

const validateRequest = require('./validateRequest');

const test = [
    body('test').exists(),
    validateRequest,
];

module.exports = {
    test,
};