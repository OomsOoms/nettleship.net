const { sessionService } = require('../services');

/**
 * @desc Login a user
 * @method POST
 */
async function loginUser(req, res) {
  // get the email and password from the request body
  const { loginIdentifier, password } = req.body;
  const { user } = await sessionService.loginUser(loginIdentifier, password);
  req.session.userId = user._id;
  res.status(200).json({ user });
}

module.exports = {
  loginUser,
};
