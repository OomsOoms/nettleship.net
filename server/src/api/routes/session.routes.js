const router = require('express-promise-router')();
const { sessionController } = require('../controllers');
const { sessionValidatonRules } = require('../validations');
const { validate } = require('../middlewares');

router
  .route('/')
  .post(sessionValidatonRules.loginUser, validate, sessionController.loginUser);

module.exports = router;
