const { User } = require('../models');
const { generateJwt } = require('../helpers');
const { comparePasswords } = require('../helpers');
const { Error } = require('../helpers');

async function loginUser(username, email, password) {
  const user = await User.findOne({ $or: [{ username }, { email }] });
  if (!user || !(await comparePasswords(password, user.password))) {
    throw Error.invalidCredentials();
  }

  const token = generateJwt({ id: user._id });
  return { user: user, token: token };
}

module.exports = {
  loginUser,
};
