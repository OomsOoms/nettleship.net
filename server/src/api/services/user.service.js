const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const { User } = require('../models');
const { generateJwt, comparePasswords, sendEmail, uploadFile, deleteFile } = require('../helpers');
const { Error } = require('../helpers');
const { logger } = require('../../config/logger');

// the user id will always correspond a user that exists since its just been authenticated

async function verifyUser(token) {
  const decodedToken = jwt.decode(token);
  if (!decodedToken || !decodedToken.id) throw Error.invalidRequest('Invalid token');

  const user = await User.findById(decodedToken.id);
  if (!user || !user.newEmail) throw Error.userNotFound('User not found or email already verified');

  user.email = user.newEmail;
  user.newEmail = '';
  await user.save();
}

async function requestVerification(email) {
  const user = await User.findOne({ newEmail: email });
  if (!user || !user.newEmail) throw Error.userNotFound('User not found or email already verified');

  const token = generateJwt({ id: user._id }, { expiresIn: '24h' });
  sendEmail(email, 'Verify your email', 'verifyEmail', { username: user.username, token });
}

async function getAllUsers(id) {
  const user = await User.findById(id);
  if (!user.profile.roles.includes('admin')) throw Error.invalidCredentials('User is not an admin');

  const users = await User.find();
  return users;
}

async function getUserByUsername(id, username) {
  const user = await User.findOne({ username });
  if (!user) throw Error.userNotFound(`User with username '${username}' not found`);

  return id === user.id ? user : { username: user.username, profile: user.profile };
}

async function registerUser(username, newEmail, password) {
  try {
    const user = new User({ username, newEmail, password });
    await user.save();
    const token = generateJwt({ id: user._id }, { expiresIn: '24h' });
    sendEmail(newEmail, 'Verify your email', 'verifyEmail', { username, token });
  } catch (error) {
    if (error.code === 11000) {
      if (error.keyPattern.email || error.keyPattern.newEmail) throw Error.mongoConflictError('Email already exists');
      else if (error.keyPattern.username) throw Error.mongoConflictError('Username already exists');
    }
    throw error;
  }
}

async function updateUser(id, username, currentPassword, updatedFields, file) {
  // find the user that wants to be updated
  const user = await User.findOne({ username });
  if (!user) throw Error.userNotFound(`User '${username}' not found`);

  // check if the requesting user is the same as the target user
  if (id !== user.id) throw Error.invalidCredentials('Not authorized to update this user');

  const allowedFields = ['username', 'newEmail', 'password'];
  const allowedEmbeddedFields = ['profile.displayName', 'profile.bio', 'settings.language'];
  const changes = {};
  logger.debug(`Updating user: ${username}`);
  if (file) {
    // Delete the old profile picture if it exists
    const oldFile = user.profile.profilePicture.split('/').pop();
    if (oldFile !== 'default-avatar.jpg') {
      try {
        await deleteFile(`uploads/avatars/${oldFile}`);
        logger.debug(`Deleted old profile picture: ${oldFile}`);
      } catch (error) {
        logger.error(`Error deleting old profile picture: ${error.message}`);
      }
    }

    // Upload the file to S3
    const fileName = `uploads/avatars/${user.id}-${Date.now()}.jpg`;
    const result = await uploadFile(file, fileName);
    logger.debug(`Uploaded profile picture to S3: ${result.key}`);

    // Update the user's profile picture
    const profilePictureUrl = `${process.env.CDN_DOMAIN}/${result.key}`;
    user.profile.profilePicture = profilePictureUrl;
    changes.profilePicture = { message: 'Profile picture updated' };
  }

  try {
    for (const [key, value] of Object.entries(updatedFields)) {
      if (!allowedFields.includes(key) && !allowedEmbeddedFields.includes(key)) {
        throw Error.invalidRequest(`Invalid field: ${key}`);
      }

      // handle password change
      if (key === 'password') {
        if (!currentPassword) {
          throw Error.invalidRequest('Current password is required if changing password');
        }
        if (!(await comparePasswords(currentPassword, user.password))) {
          throw Error.invalidCredentials('Invalid current password');
        }
        user.password = value;
        changes.password = { message: 'Password changed, signed out of all sessions' };
        await mongoose.connection.db.collection('sessions').deleteMany({ 'session.userId': id });

        continue;
      }

      // handle embedded fields
      if (allowedEmbeddedFields.includes(key)) {
        const [embeddedField, subField] = key.split('.');
        if (user[embeddedField][subField] !== value) {
          changes[key] = { message: `${subField} changed to ${value}` };
          user[embeddedField][subField] = value;
        }
      } else if (user[key] !== value) {
        // handle top-level fields
        changes[key] = { message: `${key} changed to ${value}` };
        user[key] = value;
      }
    }

    await user.save();
    // Handle email change after user is saved to avoid duplicate key error
    if (changes.newEmail) {
      const token = generateJwt({ id: user._id }, { expiresIn: '24h' });
      sendEmail(changes.newEmail, 'Verify your email', 'verifyEmail', { username, token });
      changes.newEmail.message = 'Email change requested, verify email';
    }
  } catch (error) {
    if (error.code === 11000) {
      if (error.keyPattern.email || error.keyPattern.newEmail) {
        throw Error.mongoConflictError('Email already exists');
      } else if (error.keyPattern.username) {
        throw Error.mongoConflictError('Username already exists');
      }
    }
    throw error;
  }
  return { changes };
}

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
