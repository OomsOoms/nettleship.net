const router = require('express-promise-router')();
const multer = require('multer');

const { userController: uc } = require('../controllers');
const { userValidatonRules: uvr } = require('../validations');

const upload = multer({ storage: multer.memoryStorage() });

// /api/users
router
  .patch('/verify', uvr.verifyUser, uc.verifyUser)
  .post('/verify', uvr.requestVerification, uc.requestVerification)
  .get('/', uvr.getAllUsers, uc.getAllUsers)
  .get('/:username', uc.getUserByUsername)
  .post('/', uvr.registerUser, uc.registerUser)
  .patch('/:username', upload.single('avatar'), uvr.updateUser, uc.updateUser)
  .delete('/:username', uvr.deleteUser, uc.deleteUser);

module.exports = router;
