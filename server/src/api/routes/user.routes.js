const router = require('express-promise-router')();
const { userController } = require('../controllers');
const { userValidator } = require('../validations');
const { verifyJwt, validateRequest } = require('../middlewares');

router
  .route('/')
  .post(
    userValidator.registerUser,
    validateRequest,
    userController.registerUser
  );
//.get(userController.getAllUsers);

router
  .route('/login')
  .post(userValidator.loginUser, validateRequest, userController.loginUser);

router.use(verifyJwt);
router
  .route('/me')
  .get(
    userValidator.getCurrentUser,
    validateRequest,
    userController.getUserById
  )
  .put(userValidator.updateUser, validateRequest, userController.updateUser)
  .delete(userValidator.deleteUser, validateRequest, userController.deleteUser);

module.exports = router;
