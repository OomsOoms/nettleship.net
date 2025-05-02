const router  = require('express-promise-router')();
const multer = require('multer');

const { userController: uc } = require('../controllers');
const { userValidatonRules: uvr } = require('../validations');

const upload = multer({ storage: multer.memoryStorage() }); // there is no validation at all here oopsies

router
    .post('/', uvr.createUser, uc.createUser)
    .get('/:username', uvr.getUserByUsername, uc.getUserByUsername)
    .patch('/:username', upload.single('avatar'), uvr.updateUser, uc.updateUser)
    .delete('/:username', uvr.deleteUser, uc.deleteUser)
    .post('/request-verification', uvr.requestVerification, uc.requestVerification)
    .post('/verify-email', uc.verifyEmail);

module.exports = router;