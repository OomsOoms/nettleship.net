const { userService } = require('../services');
/**
 * Errors are caught in the error handler middleware so only the success response is sent
 */

/**
 * @desc Verify user
 * @method PATCH
 */
async function verifyUser(req, res) {
  await userService.verifyUser(req.user.id);
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
  const users = await userService.getAllUsers();
  res.status(200).json(users);
}

/**
 * @desc Get current user (From id in token)
 * @method GET
 */
async function getUserByUsername(req, res) {
  // Get the id from the verified token (full user object is only on routes that require authentication)
  const id = req.user ? req.user.id : null;
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
  const user = await userService.registerUser(username, email, password);
  // Same code is seen in login controller
  req.login(user, (err) => {
    req.session.ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    req.session.userAgent = req.headers['user-agent'];
    res.status(201).json({ message: 'User registered and logged in successfully, check your email' });
    // res.redirect('/dashboard');
  });
}

/**
 * @desc Update user
 * @method PUT
 */
async function updateUser(req, res) {
  // get the reqyesting user verified from the session
  const requestingUser = req.user;
  // get the username of the user to update
  const username = req.params.username;
  const file = req.file;
  const { currentPassword, ...updatedFields } = req.body;
  const changes = await userService.updateUser(requestingUser, username, currentPassword, updatedFields, file);
  if (changes.destroySessions) req.session.destroy();
  res.status(200).json(changes);
}

/**
 * @desc Delete user, if the user is an admin, they can delete any user unless it's themselves which then they need to provide their password
 * @method DELETE
 */
async function deleteUser(req, res) {
  // get the reqyesting user verified from the session
  const requestingUser = req.user;
  // get the username of the user to delete
  const username = req.params.username;
  // get the password from the request body
  const { password } = req.body;
  // delete the user
  const result = await userService.deleteUser(requestingUser, username, password);
  if (result.destroySessions) req.session.destroy();
  res.status(204).end();
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
