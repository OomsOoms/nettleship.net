const router = require('express-promise-router')();
const { userController } = require('../controllers');
const { userValidations } = require('../validations');
const { verifyJwt } = require('../middlewares');
const { validateRequest } = require('../middlewares');

/**
 * @swagger
 * tags:
 *  name: Users
 */
router.route('/')
    .post(userValidations.registerUserValidations, validateRequest , userController.registerUser);
    //.get(userController.getAllUsers);

router.route('/login')
    .post(userValidations.loginUserValidations, validateRequest , userController.loginUser);

router.route('/me')
    .get(verifyJwt, userValidations.getUserByIdValidations, validateRequest , userController.getUserById)
    .put(verifyJwt, userValidations.updateUserValidations, validateRequest , userController.updateUser)
    .delete(verifyJwt, userValidations.updateUserValidations, validateRequest , userController.deleteUser);

module.exports = router;
