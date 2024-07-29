const router = require('express-promise-router')();
const { userController: uc } = require('../controllers');
const { userValidatonRules: uvr } = require('../validations');
const { validate, sessionAuth } = require('../middlewares');

// /api/users
router
  .get('/verify', uc.verifyUser)
  .post('/verify', uvr.requestVerification, validate, uc.requestVerification)
  .get('/', sessionAuth, uc.getAllUsers)
  .get('/:username', uc.getUserByUsername)
  .post('/', uvr.registerUser, validate, uc.registerUser)
  .put('/:username', uvr.updateUser, validate, uc.updateUser)
  .delete('/:username', uvr.deleteUser, validate, uc.deleteUser);

module.exports = router;
