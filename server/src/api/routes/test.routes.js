const router  = require('express-promise-router')();

const { testController: tc } = require('../controllers');
const { testValidationRules: tvr } = require('../validations');

router
    .post('/hello-world', tvr.test, tc.helloWorld);

module.exports = router;