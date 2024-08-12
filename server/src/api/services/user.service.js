const { User } = require('../models');
const { generateJwt, comparePasswords, sendEmail } = require('../helpers');
const { Error } = require('../helpers');
const jwt = require('jsonwebtoken');

async function verifyUser(token) {
  const decodedToken = jwt.decode(token);
  if (!decodedToken || !decodedToken.id) {
    throw Error.invalidRequest('Invalid token');
  }
  const user = await User.findById(decodedToken.id);
  if (!user) {
    throw Error.userNotFound('User not found');
  }
  if (!user.unverifiedEmail) {
    throw Error.invalidRequest('Email already verified');
  }
  user.unverifiedEmail = '';
  await user.save();
}

async function requestVerification(unverifiedEmail) {
  const user = await User.findOne({
    $or: [{ unverifiedEmail }, { email: unverifiedEmail }],
  });
  if (!user) {
    throw Error.userNotFound('User not found');
  }
  if (user.accountVerified) {
    throw Error.invalidRequest('User already verified');
  }
  const token = generateJwt({ id: user._id }, { expiresIn: '24h' });
  const verificationLink = `${process.env.DOMAIN}/api/users/verify?token=${token}`;
  sendEmail(unverifiedEmail, 'Verify your email', verificationLink);
}

async function getAllUsers(id) {
  const user = await User.findById(id);
  if (!user.roles.includes('admin')) {
    throw Error.invalidCredentials('User is not an admin');
  }
  const users = await User.find();
  return users;
}

async function getUserByUsername(username) {
  const user = await User.findOne({ username });
  if (!user) {
    throw Error.userNotFound(`User with username '${username}' not found`);
  }
  return user;
}

async function registerUser(username, unverifiedEmail, password) {
  try {
    const user = new User({ username, unverifiedEmail, password });
    await user.save();
    const token = generateJwt({ id: user._id }, { expiresIn: '24h' });
    const verificationLink = `${process.env.DOMAIN}/api/users/verify?token=${token}`;
    sendEmail(unverifiedEmail, 'Verify your email', verificationLink);
  } catch (error) {
    if (error.code === 11000) {
      if (error.keyPattern.email || error.keyPattern.unverifiedEmail) {
        throw Error.mongoConflictError('Email already exists');
      } else if (error.keyPattern.username) {
        throw Error.mongoConflictError('Username already exists');
      }
    }
    throw error;
  }
}

async function updateUser(id, password, newUsername, newEmail, newPassword) {
  try {
    const user = await User.findById(id);

    if (!user || !(await comparePasswords(password, user.password))) {
      throw Error.invalidCredentials();
    }

    // Prepare the new data for the user
    const newData = {
      username: newUsername || user.username,
      email: newEmail || user.email,
      password: newPassword || user.password,
    };

    // Check if any of the specified fields have changed and throw an error if not
    const fieldsToCheck = ['username', 'email', 'password'];
    const hasChanged = fieldsToCheck.some((field) => newData[field] !== undefined && newData[field] !== user[field]);

    if (!hasChanged) {
      throw Error.invalidRequest('No changes detected');
    }

    // Update the user with the new data
    Object.assign(user, newData);
    const updatedUser = await user.save();

    const token = generateJwt({ id: updatedUser._id });
    return { user: updatedUser, token: token };
  } catch (error) {
    // If there's a conflict with the new email, throw a specific error
    if (error.code === 11000) {
      throw Error.mongoConflictError('Email already exists');
    }
    throw error;
  }
}

async function deleteUser(id, password) {
  const user = await User.findById(id);
  if (!user) {
    throw Error.userNotFound('User not found');
  }
  if (!(await comparePasswords(password, user.password))) {
    throw Error.invalidCredentials('Invalid password');
  }
  await User.deleteOne({ _id: id });
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
