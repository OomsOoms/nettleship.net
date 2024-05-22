const router = require('express-promise-router')();
const { sessionController } = require('../controllers');
const { sessionValidator } = require('../validations');
const { validateRequest } = require('../middlewares');

router
  .route('/')
  .post(
    sessionValidator.loginUser,
    validateRequest,
    sessionController.loginUser
  );

module.exports = router;
