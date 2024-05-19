const router = require('express-promise-router')();
const { userController } = require('../controllers');
const { userValidator } = require('../validations');
const { verifyJwt, validateRequest } = require('../middlewares');

/**
 * @swagger
 * /api/users:
 *   post:
 *     description: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *           example:
 *             username: john_doe
 *             email: john.doe@example.com
 *             password: password123
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     username:
 *                       type: string
 *                     email:
 *                       type: string
 *       409:
 *         description: Email already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       type:
 *                         type: string
 *                       value:
 *                         type: string
 *                       msg:
 *                         type: string
 *                       path:
 *                         type: string
 *                       location:
 *                         type: string
 */
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
