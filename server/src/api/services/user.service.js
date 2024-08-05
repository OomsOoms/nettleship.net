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
  if (user.active) {
    throw Error.invalidRequest('User already verified');
  }

  const userId = decodedToken.id;
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $set: { active: true } },
    { new: true } // new option returns the updated document
  );

  return updatedUser;
}

async function requestVerification(email) {
  const user = await User.findOne({ email });
  if (!user) {
    throw Error.userNotFound('User not found');
  }
  if (user.active) {
    throw Error.invalidRequest('User already verified');
  }
  const token = generateJwt({ id: user._id });
  const verificationLink = `${process.env.DOMAIN}/api/users/verify?token=${token}`;
  sendEmail(email, 'Verify your email', verificationLink);
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

async function registerUser(username, email, password) {
  const existingUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existingUser) {
    if (existingUser.email === email) {
      throw Error.mongoConflictError('Email already exists');
    }
    if (existingUser.username === username) {
      throw Error.mongoConflictError('Username already exists');
    }
  }
  // Few details are needed to create a user, this is to reduce friction in the registration process
  const user = new User({ username, email, password });
  await user.save();
  const token = generateJwt({ id: user._id }, { expiresIn: '10m' });
  const verificationLink = `${process.env.DOMAIN}/api/users/verify?token=${token}`;
  sendEmail(email, 'Verify your email', verificationLink);
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
    const hasChanged = fieldsToCheck.some(
      (field) => newData[field] !== undefined && newData[field] !== user[field]
    );

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
