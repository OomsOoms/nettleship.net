const { User } = require('../models');
const { generateJwt } = require('../helpers');
const { comparePasswords } = require('../helpers');
const { Error } = require('../helpers');

// should send a verification email if the user is not active
async function loginUser(username, email, password) {
  const user = await User.findOne({ $or: [{ username }, { email }] });
  if (!user || !(await comparePasswords(password, user.password))) {
    throw Error.invalidCredentials();
  }

  if (!user.active) {
    throw Error.accountNotActive();
  }
  const token = generateJwt({ id: user._id });
  return { user: user, token: token };
}

module.exports = {
  loginUser,
};
