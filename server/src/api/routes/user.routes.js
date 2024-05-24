const router = require('express-promise-router')();
const { userController } = require('../controllers');
const { userValidator } = require('../validations');
const { verifyJwt, validateRequest } = require('../middlewares');

router
  .route('/')
  .get(verifyJwt, userController.getAllUsers)
  .post(
    userValidator.registerUser,
    validateRequest,
    userController.registerUser
  );

// Probably make its own jwt function since its a token param
router
  .route('/verify')
  .get(verifyJwt, userController.verifyUser)
  .post(userController.requestVerification);

router.use(verifyJwt);
router
  .route('/me')
  .get(
    userValidator.getCurrentUser,
    validateRequest,
    userController.getCurrentUser
  )
  .put(userValidator.updateUser, validateRequest, userController.updateUser)
  .delete(userValidator.deleteUser, validateRequest, userController.deleteUser);

module.exports = router;
