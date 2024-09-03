const router = require('express-promise-router')();
const { userController: uc } = require('../controllers');
const { userValidatonRules: uvr } = require('../validations');

const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage, limits: { fileSize: 1024 * 1024 * 5 } });

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
