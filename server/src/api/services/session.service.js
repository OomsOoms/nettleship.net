const { User } = require('../models');
const { comparePasswords } = require('../helpers');
const { Error } = require('../helpers');

// should send a verification email if the user is not active
async function loginUser(loginIdentifier, password) {
  const user = await User.findOne({
    $or: [{ username: loginIdentifier }, { email: loginIdentifier }],
  });
  if (!user || !(await comparePasswords(password, user.password))) {
    throw Error.invalidCredentials();
  }

  if (!user.active) {
    throw Error.accountNotActive();
  }
  return { user: user };
}

module.exports = {
  loginUser,
};
