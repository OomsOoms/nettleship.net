const router = require('express-promise-router')();

const { authController: ac } = require('../controllers');
//const { authValidatonRules: avr } = require('../validations');

// /api/auth
router
  .get('/google', ac.googleLogin)
  .get('/google/callback', ac.googleCallback)
  .get('/logout', ac.logout)
  .post('/login', ac.localLogin);

module.exports = router;
