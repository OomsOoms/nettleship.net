const { sessionService } = require('../services');

/**
 * @desc Login a user
 * @method POST
 */
async function loginUser(req, res) {
  // get the email and password from the request body
  const { username, email, password } = req.body;
  const { user, token } = await sessionService.loginUser(
    username,
    email,
    password
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

module.exports = {
  loginUser,
};
