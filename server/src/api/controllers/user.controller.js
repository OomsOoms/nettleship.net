const { userService } = require('../services');
//const { decodeJwt } = require('../helpers');
const jwt = require('jsonwebtoken');
/**
 * Errors are caught in the error handler middleware so only the success response is sent
 */

/**
 * @desc Register a new user
 * @method POST
 */
async function registerUser(req, res) {
  // get the username, email, and password from the request body
  const { username, email, password } = req.body;
  const user = await userService.registerUser(username, email, password);
  res.status(201).json(user);
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

async function verifyUser(req, res) {
  // Get the id from the verified param token
  // for some reason when I use the decodeJwt helper function it doesn't work but only when I use the session middlewear before the routes are defined, but not after idfk
  const token = req.query.token;
  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.user = decoded;
  } catch (err) {
    // make this throw errors instead of sending responses
    if (err instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: 'Token has expired' });
    } else {
      return res.status(401).json({ error: 'Invalid token' });
    }
  }
  const { id } = req.user;
  await userService.verifyUser(id);
  res.status(200).json({ message: 'Email verified' });
}

async function requestVerification(req, res) {
  const { email } = req.body;
  await userService.requestVerification(email);
  res.status(200).json({ message: 'Verification email sent' });
}

/**
 * @desc Get current user (From id in token)
 * @method GET
 */
async function getCurrentUser(req, res) {
  // get the id from the verified token
  const { id } = req.user;
  const user = await userService.getCurrentUser(id);
  res.status(200).json({
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
    },
  });
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
  registerUser,
  getAllUsers,
  verifyUser,
  requestVerification,
  getCurrentUser,
  updateUser,
  deleteUser,
};
