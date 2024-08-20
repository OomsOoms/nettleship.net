const { userService } = require('../services');
/**
 * Errors are caught in the error handler middleware so only the success response is sent
 */

/**
 * @desc Verify user
 * @method GET
 */
async function verifyUser(req, res) {
  const token = req.query.token;
  await userService.verifyUser(token);
  res.status(200).json({ message: 'Email verified' });
}

/**
 * @desc Request verification
 * @method POST
 */
async function requestVerification(req, res) {
  const { email } = req.body;
  await userService.requestVerification(email);
  res.status(200).json({ message: 'Verification email sent' });
}

/**
 * @desc Get all users
 * @method GET
 */
async function getAllUsers(req, res) {
  // Get the id from the verified session
  const id = req.session.userId;
  const users = await userService.getAllUsers(id);
  res.status(200).json(users);
}

/**
 * @desc Get current user (From id in token)
 * @method GET
 */
async function getUserByUsername(req, res) {
  // Get the id from the verified token
  const id = req.session.userId;
  const username = req.params.username;
  const user = await userService.getUserByUsername(id, username);
  res.status(200).json(user);
}
/**
 * @desc Register a new user
 * @method POST
 */
async function registerUser(req, res) {
  // get the username, email, and password from the request body
  const { username, email, password } = req.body;
  await userService.registerUser(username, email, password);
  res.status(201).json({ message: 'User registered successfully, check your email' });
}

/**
 * @desc Update user
 * @method PUT
 */
async function updateUser(req, res) {
  // get the id from the verified session
  const id = req.session.userId;
  const file = req.file;
  const username = req.params.username;
  const { currentPassword, ...updatedFields } = req.body;
  const changes = await userService.updateUser(id, username, currentPassword, updatedFields, file);
  if (changes.changes.password) req.session.destroy();

  res.status(200).json(changes);
}

/**
 * @desc Delete user
 * @method DELETE
 */
async function deleteUser(req, res) {
  // get the id from the verified session
  const id = req.session.userId;
  // get the password from the request body
  const { password } = req.body;
  await userService.deleteUser(id, password);
  req.session.destroy();
  res.status(204).json({ message: 'User deleted successfully' });
}

module.exports = {
  verifyUser,
  requestVerification,
  getAllUsers,
  getUserByUsername,
  registerUser,
  updateUser,
  deleteUser,
};
