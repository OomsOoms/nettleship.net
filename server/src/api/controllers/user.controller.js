const { userService } = require('../services');

/**
 * @desc Register a new user
 * @method POST
 */
async function registerUser(req, res) {
  const { username, email, password } = req.body;
  const { user, token } = await userService.registerUser(
    username,
    email,
    password
  );
  res.status(201).json({
    token: token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
    },
  });
}

/**
 * @desc Get current user (From id in token)
 * @method GET
 */
async function getCurrentUser(req, res) {
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
  const { id } = req.user;
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
  const { id } = req.user;
  const { password } = req.body;
  await userService.deleteUser(id, password);
  res.status(204).end();
}

async function loginUser(req, res) {
  const { email, password } = req.body;
  const { user, token } = await userService.loginUser(email, password);
  res.status(200).json({
    token: token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
    },
  });
}

module.exports = {
  registerUser,
  getUserById: getCurrentUser,
  updateUser,
  deleteUser,
  loginUser,
};
