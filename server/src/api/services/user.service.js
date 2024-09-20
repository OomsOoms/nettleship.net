const mongoose = require('mongoose');

const { User } = require('../models');
const { generateJwt, comparePasswords, sendEmail, uploadFile, deleteFile } = require('../helpers');
const { Error } = require('../helpers');

/**
 * Verifies a user's email
 * @param {string} id - The user id from the token
 * @throws {Error} - If the token is invalid or the user is not found
 */
async function verifyUser(id) {
  const user = await User.findById(id);
  // The newEmail is only set when the user has an email that needs to be verified
  if (!user || !user.newEmail) throw Error.userNotFound('User not found or email already verified');

  if (user.email) {
    sendEmail(user.email, 'Email changed', 'emailChanged', { username: user.username, email: user.newEmail });
  }

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

  const token = generateJwt({ id: user.id }, { expiresIn: '24h' });
  sendEmail(email, 'Verify your email', 'verifyEmail', { username: user.username, token });
}

/**
 * Gets all users if the requesting user is an admin, which is checked in the middleware
 * @returns {Promise<User[]>} - A list of all users
 */
async function getAllUsers() {
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
    const token = generateJwt({ id: user.id }, { expiresIn: '24h' });
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
 * Updates a user's information based on the fields provided, admins can update any user without a password
 * @param {string} id - The requesting user id from the session
 * @param {string} username - The username of the user to get
 * @param {string} currentPassword - The current password of the user
 * @param {Object} updatedFields - The fields to update
 * @param {Object} file - The file to upload
 * @returns {Promise<Object>} - The changes made to the user
 */
async function updateUser(requestingUser, username, currentPassword, updatedFields, file) {
  // Find the user to update
  const user = await User.findOne({ username });
  if (!user) throw Error.userNotFound(`User with username '${username}' not found`);

  // Check if the requesting user is an admin or the same user
  const isAdmin = requestingUser.profile.roles.includes('admin');
  const isSameUser = requestingUser.id === user.id;

  // Check if the user is authorized to delete the user
  if (!isSameUser && !isAdmin) throw Error.invalidCredentials('Not authorized to delete this user');

  // Admins can update any user with the admin password, but not themselves with the admin password
  if (isAdmin && !isSameUser && currentPassword !== process.env.ADMIN_PASSWORD)
    throw Error.invalidCredentials('Invalid admin password');

  const changes = { user: user.username };

  if (file) {
    const oldFile = user.profile.profilePicture;
    if (oldFile !== 'default-avatar.jpg') await deleteFile(oldFile);
    const result = await uploadFile(file, oldFile);
    user.set('profile.profilePicture', result.key);
    changes.profilePicture = { message: 'Profile picture updated' };
  }

  for (const [path, value] of Object.entries(updatedFields)) {
    // Skip if the value is the same as the current value or if the value is empty
    if (user.get(path) === value || !value) continue;

    switch (path) {
      case 'password':
        // Users can update themselves with their password
        if (isSameUser && !(await comparePasswords(currentPassword, user.password)))
          throw Error.invalidCredentials('Invalid password');
        user.set(path, value);
        changes.password = { message: 'Password changed, signed out of all sessions' };
        await mongoose.connection.db.collection('sessions').deleteMany({ 'session.userId': user.id });
        break;
      case 'email':
        // newEmail instead of email, this is the request is email instead of newEmail
        user.set('newEmail', value);
        changes.email = { message: 'Email change requested, verify email', value };
        break;
      default:
        user.set(path, value);
        changes[path] = { message: 'Field updated', value };
    }
  }
  try {
    await user.save();
    if (changes.email) {
      const token = generateJwt({ id: user.id }, { expiresIn: '24h' });
      sendEmail(changes.email.value, 'Verify your email', 'verifyEmail', { username: user.username, token });
    }
  } catch (error) {
    if (error.code === 11000) {
      const conflicField = error.keyPattern.email || error.keyPattern.newEmail ? 'Email' : 'Username';
      throw Error.mongoConflictError(`${conflicField} already exists`);
    }
    throw error;
  }

  return { changes, destroySessions: isSameUser && changes.password !== undefined };
}

/**
 * Deletes a user and all their sessions, admins can delete any user without a password or themselves with a password
 * @param {string} requestingUser - The requesting user from the session
 * @param {string} username - The username of the user to delete
 * @param {string} password - The password of the user to delete
 * @throws {Error} - If the user is not found or the password is invalid
 */
async function deleteUser(requestingUser, username, password) {
  // Find the user to delete
  const user = await User.findOne({ username });
  if (!user) throw Error.userNotFound(`User with username '${username}' not found`);

  // Check if the requesting user is an admin or the same user
  const isAdmin = requestingUser.profile.roles.includes('admin');
  const isSameUser = requestingUser.id === user.id;

  // Check if the user is authorized to delete the user
  if (!isSameUser && !isAdmin) throw Error.invalidCredentials('Not authorized to delete this user');

  // Admins can delete any user with the admin password, but not themselves with the admin password
  if (isAdmin && !isSameUser && password !== process.env.ADMIN_PASSWORD)
    throw Error.invalidCredentials('Invalid admin password');

  // Users can delete themselves with their password
  if (isSameUser && !(await comparePasswords(password, user.password)))
    throw Error.invalidCredentials('Invalid password');

  await mongoose.connection.db.collection('sessions').deleteMany({ 'session.userId': user.id });
  const oldFile = user.profile.profilePicture;
  if (oldFile !== '/uploads/avatars/default-avatar.jpg') await deleteFile(oldFile);
  await User.deleteOne({ id: user.id });

  return { message: `User ${user.username} deleted`, destroySessions: isSameUser };
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
