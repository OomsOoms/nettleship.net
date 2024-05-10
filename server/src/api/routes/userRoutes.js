const router = require('express-promise-router')();
const { userController } = require('../controllers');
const { userValidations } = require('../validations');
const { verifyJwt } = require('../middlewares');
const { handleValidationErrors } = require('../middlewares');

/**
 * @swagger
 * tags:
 *  name: Users
 */
router.route('/')
    .post(userValidations.registerUserValidations, handleValidationErrors, userController.registerUser);
    //.get(userController.getAllUsers);

router.route('/login')
    .post(userValidations.loginUserValidations, handleValidationErrors, userController.loginUser);

router.route('/me')
    .get(verifyJwt, userValidations.getUserByIdValidations, handleValidationErrors, userController.getUserById)
    .put(verifyJwt, userValidations.updateUserValidations, handleValidationErrors, userController.updateUser)
    .delete(verifyJwt, userValidations.updateUserValidations, handleValidationErrors, userController.deleteUser);

module.exports = router;
