const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const { User } = require('../models');
const { generateJwt, comparePasswords, sendEmail, uploadFile, deleteFile } = require('../helpers');
const { Error } = require('../helpers');
const { logger } = require('../../config/logger');

// the user id will always correspond a user that exists since its just been authenticated

/**
 * Verifies a user's email
 * @param {string} token - The JWT token to verify the user's email
 * @throws {Error} - If the token is invalid or the user is not found
 */
async function verifyUser(token) {
  const decodedToken = jwt.decode(token);
  if (!decodedToken || !decodedToken.id) throw Error.invalidRequest('Invalid token');

  const user = await User.findById(decodedToken.id);
  // The newEmail is only set when the user has an email that needs to be verified
  if (!user || !user.newEmail) throw Error.userNotFound('User not found or email already verified');

  user.email = user.newEmail;
  user.newEmail = null;
  await user.save();
}

/**
 * Lets the user request a new email if the newEmail field is not empty
 * @param {string} email - The new email to verify
 * @throws {Error} - If the user is not found or the email is already verified
 */
async function requestVerification(email) {
  const user = await User.findOne({ newEmail: email });
  if (!user || !user.newEmail) throw Error.userNotFound('User not found or email already verified');

  const token = generateJwt({ id: user._id }, { expiresIn: '24h' });
  sendEmail(email, 'Verify your email', 'verifyEmail', { username: user.username, token });
}

/**
 * Gets all users if the requesting user is an admin
 * @param {string} id - The requesting user id from the session
 * @returns {Promise<User[]>} - A list of all users
 * @throws {Error} - If the user is not an admin
 */
async function getAllUsers(id) {
  const user = await User.findById(id);
  if (!user.profile.roles.includes('admin')) throw Error.invalidCredentials('User is not an admin');

  const users = await User.find();
  return users;
}

/**
 * Gets a user by their username and returns different fields based on the requesting user
 * @param {string} id - The requesting user id from the session
 * @param {string} username - The username of the user to get
 * @returns {Promise<User>} - The user with the given username
 * @throws {Error} - If the user is not found or the requesting user is not authorized
 */
async function getUserByUsername(id, username) {
  const user = await User.findOne({ username });
  if (!user) throw Error.userNotFound(`User with username '${username}' not found`);

  return id === user.id ? user : { username: user.username, profile: user.profile };
}

/**
 * Registers a new user
 * @param {string} username - The username of the new user
 * @param {string} email - The email of the new user
 * @param {string} password - The password of the new user
 * @throws {Error} - If the email or username already exists or there is an error saving the user
 */
async function registerUser(username, email, password) {
  try {
    // When a user is created, the email field is initially set to the value of the newEmail field.
    // This is because the newEmail field is the email that needs to be verified, but the email field cannot be empty.
    const user = new User({ username, newEmail: email, password });
    await user.save();
    const token = generateJwt({ id: user._id }, { expiresIn: '24h' });
    sendEmail(email, 'Verify your email', 'verifyEmail', { username, token });
  } catch (error) {
    if (error.code === 11000) {
      const conflicField = error.keyPattern.email || error.keyPattern.newEmail ? 'Email' : 'Username';
      throw Error.mongoConflictError(`${conflicField} already exists`);
    }
    throw error;
  }
}

/**
 * Updates a user's information based on the fields provided
 * @param {string} id - The requesting user id from the session
 * @param {string} username - The username of the user to get
 * @param {string} currentPassword - The current password of the user
 * @param {Object} updatedFields - The fields to update
 * @param {Object} file - The file to upload
 * @returns {Promise<Object>} - The changes made to the user
 */
async function updateUser(id, username, currentPassword, updatedFields, file) {
  const user = await User.findOne({ username });
  if (!user) throw Error.userNotFound(`User '${username}' not found`);
  if (id !== user.id) throw Error.invalidCredentials('Not authorized to update this user');

  const allowedFields = ['username', 'newEmail', 'password', 'profile.displayName', 'profile.bio', 'settings.language'];
  const changes = {};

  if (file) {
    const oldFile = user.profile.profilePicture.split('/').pop();
    if (oldFile !== 'default-avatar.jpg') await deleteFile(`uploads/avatars/${oldFile}`);
    const result = await uploadFile(file, `uploads/avatars/${user.id}-${Date.now()}.jpg`);
    user.profile.profilePicture = `${process.env.CDN_DOMAIN}/${result.key}`;
    changes.profilePicture = { message: 'Profile picture updated' };
  }

  for (const [path, value] of Object.entries(updatedFields)) {
    if (allowedFields.includes(path)) {
      if (path === 'password') {
        if (!(await comparePasswords(currentPassword, user.password)))
          throw Error.invalidCredentials('Invalid password');
        user.password = value;
        changes.password = { message: 'Password changed, signed out of all sessions' };
        await mongoose.connection.db.collection('sessions').deleteMany({ 'session.userId': id });
      } else if (user[path] !== value) {
        user[path] = value;
        changes[path] = { message: 'Field updated', value };
      }
    }
  }

  try {
    await user.save();
    if (changes.newEmail) {
      const token = generateJwt({ id: user._id }, { expiresIn: '24h' });
      sendEmail(changes.newEmail.value, 'Verify your email', 'verifyEmail', { username, token });
      changes.newEmail.message = 'Email change requested, verify email';
    }
  } catch (error) {
    if (error.code === 11000) {
      const conflicField = error.keyPattern.email || error.keyPattern.newEmail ? 'Email' : 'Username';
      throw Error.mongoConflictError(`${conflicField} already exists`);
    }
    throw error;
  }

  return { changes };
}

/**
 * Deletes a user and all their sessions
 * @param {string} id - The requesting user id from the session
 * @param {string} password - The password of the user to delete
 * @throws {Error} - If the user is not found or the password is invalid
 */
async function deleteUser(id, password) {
  const user = await User.findById(id);
  if (!user) throw Error.userNotFound('User not found');
  if (!(await comparePasswords(password, user.password))) throw Error.invalidCredentials('Invalid password');

  await mongoose.connection.db.collection('sessions').deleteMany({ 'session.userId': id });
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
