const router = require('express-promise-router')();
const { sessionController } = require('../controllers');
const { sessionValidatonRules } = require('../validations');
const { validateRequest } = require('../middlewares');

router.route('/').post(sessionValidatonRules.loginUser, validateRequest, sessionController.loginUser);

module.exports = router;
