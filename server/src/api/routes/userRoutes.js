const express = require('express');
const router = express.Router();
const verifyJwt = require("../middlewares/verifyJwt");
const validations = require('../validations/userValidations');
const handleValidationErrors = require('../middlewares/handleValidationErrors');

const userController = require('../controllers/userController');

router.route('/')
    .post(validations.registerUserValidations, handleValidationErrors, userController.registerUser);
    //.get(userController.getAllUsers);

router.route('/login')
    .post(validations.loginUserValidations, handleValidationErrors, userController.loginUser);

router.route('/me')
    .get(verifyJwt, validations.getUserByIdValidations, handleValidationErrors, userController.getUserById)
    .put(verifyJwt, validations.updateUserValidations, handleValidationErrors, userController.updateUser)
    .delete(verifyJwt, validations.updateUserValidations, handleValidationErrors, userController.deleteUser);

module.exports = router;
