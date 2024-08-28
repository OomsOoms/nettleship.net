const router = require('express-promise-router')();
const { userController: uc } = require('../controllers');
const { userValidatonRules: uvr } = require('../validations');
const { validateRequest, sessionAuth, verifyCaptcha } = require('../middlewares');

const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage, limits: { fileSize: 1024 * 1024 * 5 } });

// /api/users
router
  .patch('/verify', uc.verifyUser)
  .post('/verify', uvr.requestVerification, validateRequest, uc.requestVerification)
  .get('/', sessionAuth, uc.getAllUsers)
  .get('/:username', uc.getUserByUsername)
  .post('/', uvr.registerUser, verifyCaptcha, validateRequest, uc.registerUser)
  .patch('/:username', uvr.updateUser, validateRequest, upload.single('avatar'), uc.updateUser)
  .delete('/:username', uvr.deleteUser, validateRequest, uc.deleteUser);

module.exports = router;
