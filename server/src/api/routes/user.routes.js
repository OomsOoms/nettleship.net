const router = require('express-promise-router')();
const { userController: uc } = require('../controllers');
const { userValidatonRules: uvr } = require('../validations');
const { validateRequest, sessionAuth, verifyCaptcha } = require('../middlewares');

// /api/users
router
  .get('/verify', uc.verifyUser)
  .post('/verify', uvr.requestVerification, validateRequest, uc.requestVerification)
  .get('/', sessionAuth, uc.getAllUsers)
  .get('/:username', uc.getUserByUsername)
  .post('/', uvr.registerUser, validateRequest, verifyCaptcha, uc.registerUser)
  .put('/:username', uvr.updateUser, validateRequest, uc.updateUser)
  .delete('/:username', uvr.deleteUser, validateRequest, uc.deleteUser);

module.exports = router;
