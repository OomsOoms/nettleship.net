const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const validations = require('../validations/userValidations');
const handleValidationErrors = require('../middlewares/handleValidationErrors');

// Import your game controller
const userController = require('../controllers/userController');

router.route('/')
    .post(validations.registerUserValidations, handleValidationErrors, userController.registerUser);
    //.get(userController.getAllUsers);

router.route('/login')
    .post(validations.loginUserValidations, handleValidationErrors, userController.loginUser);

router.route('/me')
    .get(auth, validations.getUserByIdValidations, handleValidationErrors, userController.getUserById)
    .put(auth, validations.updateUserValidations, handleValidationErrors, userController.updateUser)
    .delete(auth, validations.updateUserValidations, handleValidationErrors, userController.deleteUser);

module.exports = router;
