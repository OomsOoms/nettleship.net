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
  // Get the id from the verified token
  const { id } = req.user;
  const users = await userService.getAllUsers(id);
  res.status(200).json(users);
}

/**
 * @desc Get current user (From id in token)
 * @method GET
 */
async function getUserByUsername(req, res) {
  // get the id from the verified token
  const username = req.params.username;
  const user = await userService.getUserByUsername(username);
  res.status(200).json({
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
    },
  });
}
/**
 * @desc Register a new user
 * @method POST
 */
async function registerUser(req, res) {
  // get the username, email, and password from the request body
  const { username, email, password } = req.body;
  await userService.registerUser(username, email, password);
  res
    .status(201)
    .json({ message: 'User registered successfully, check your email' });
}

/**
 * @desc Update user
 * @method PUT
 */
async function updateUser(req, res) {
  // get the id from the verified token
  const { id } = req.user;
  // get the password, newUsername, newEmail, and newPassword from the request body
  const { password, newUsername, newEmail, newPassword } = req.body;
  const { user, token } = await userService.updateUser(
    id,
    password,
    newUsername,
    newEmail,
    newPassword
  );
  res.status(200).json({
    token: token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
    },
  });
}

/**
 * @desc Delete user
 * @method DELETE
 */
async function deleteUser(req, res) {
  // get the id from the verified token
  const { id } = req.user;
  // get the password from the request body
  const { password } = req.body;
  await userService.deleteUser(id, password);
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
