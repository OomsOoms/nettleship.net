const router = require('express-promise-router')();

const { authController: ac } = require('../controllers');
const { authValidationRules: av } = require('../validations');

// /api/auth
router
  // status
  .get('/status', ac.getStatus)

  // auth
  .post('/login', ac.localLogin)
  .get('/google', ac.googleLogin)
  .get('/google/callback', ac.googleCallback)

  // logout
  .delete('/logout', ac.logout)
  .delete('/google', av.unlinkGoogle, ac.unlinkGoogle)

  // reset password
  .post('/reset-password', av.requestResetPassword, ac.requestResetPassword)
  .put('/reset-password', av.resetPassword, ac.resetPassword);

module.exports = router;
